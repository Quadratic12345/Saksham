import { useCallback, useRef, useState } from 'react';
import type { ChangeEvent, DragEvent, FormEvent } from 'react';
import { useTheme } from '../hooks/useTheme';
import { ThemeToggle } from '../components/ThemeToggle';
import ProfileMenu from '../components/ProfileMenu';
import './Dashboard.css';

type FileStatus = 'uploading' | 'parsing' | 'ready' | 'error';

interface UploadedFile {
  id: string;
  name: string;
  sizeLabel: string;
  status: FileStatus;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function UploadIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 15V4M12 4l-4 4M12 4l4 4"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M4 15v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function FileIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M6 2h9l5 5v13a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path d="M14 2v6h6" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M5 5l14 14M19 5L5 19"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function SendIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M4 12l16-7-6 16-2.5-6.5L4 12Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function statusLabel(status: FileStatus): string {
  switch (status) {
    case 'uploading':
      return 'Uploading…';
    case 'parsing':
      return 'Parsing…';
    case 'ready':
      return 'Ready';
    case 'error':
      return 'Failed';
  }
}

function Dashboard() {
  const { theme, toggleTheme } = useTheme();
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [activeFileId, setActiveFileId] = useState<string | null>(null);
  const [messagesByFile, setMessagesByFile] = useState<Record<string, ChatMessage[]>>({});
  const [isThinking, setIsThinking] = useState(false);
  const [draftMessage, setDraftMessage] = useState('');
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const activeFile = files.find((f) => f.id === activeFileId) ?? null;
  const activeMessages = activeFileId ? messagesByFile[activeFileId] ?? [] : [];

  const ingestFiles = useCallback((fileList: FileList) => {
    const pdfFiles = Array.from(fileList).filter((f) => f.type === 'application/pdf');
    if (pdfFiles.length === 0) return;

    pdfFiles.forEach((file) => {
      const id = `${file.name}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      const entry: UploadedFile = {
        id,
        name: file.name,
        sizeLabel: formatSize(file.size),
        status: 'uploading',
      };

      setFiles((prev) => [...prev, entry]);
      setActiveFileId((prev) => prev ?? id);

      // ------------------------------------------------------------------
      // BACKEND TODO: this whole block simulates upload + parsing so the
      // UI is fully wired. Replace with a real call once the backend
      // exists, e.g.:
      //
      //   const formData = new FormData();
      //   formData.append('file', file);
      //   const res = await fetch('/api/documents', { method: 'POST', body: formData });
      //   // backend extracts PDF text, chunks it, generates embeddings,
      //   // and stores them in a vector index keyed by the returned doc id.
      //
      // Update status to 'ready' once the backend confirms parsing/
      // embedding is complete, or 'error' if it fails.
      // ------------------------------------------------------------------
      setTimeout(() => {
        setFiles((prev) =>
          prev.map((f) => (f.id === id ? { ...f, status: 'parsing' } : f))
        );
      }, 700);

      setTimeout(() => {
        setFiles((prev) =>
          prev.map((f) => (f.id === id ? { ...f, status: 'ready' } : f))
        );
      }, 2200);
    });
  }, []);

  const handleFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) ingestFiles(e.target.files);
    e.target.value = '';
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDraggingOver(false);
    if (e.dataTransfer.files) ingestFiles(e.dataTransfer.files);
  };

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
    setMessagesByFile((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
    setActiveFileId((prev) => (prev === id ? null : prev));
  };

  const handleSendMessage = (e: FormEvent) => {
    e.preventDefault();
    const text = draftMessage.trim();
    if (!text || !activeFile || activeFile.status !== 'ready') return;

    const userMessage: ChatMessage = {
      id: `${Date.now()}-user`,
      role: 'user',
      text,
    };

    setMessagesByFile((prev) => ({
      ...prev,
      [activeFile.id]: [...(prev[activeFile.id] ?? []), userMessage],
    }));
    setDraftMessage('');
    setIsThinking(true);

    // ------------------------------------------------------------------
    // BACKEND TODO: replace this simulated reply with a real RAG call, e.g.:
    //
    //   const res = await fetch('/api/chat', {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify({ documentId: activeFile.id, question: text }),
    //   });
    //   const { answer } = await res.json();
    //
    // On the backend: embed the question, run a similarity search against
    // the stored chunks for this document, then send the top matches plus
    // the question to an LLM and stream the answer back.
    // ------------------------------------------------------------------
    setTimeout(() => {
      const assistantMessage: ChatMessage = {
        id: `${Date.now()}-assistant`,
        role: 'assistant',
        text: `This is a placeholder answer — once the backend is connected, I'll search "${activeFile.name}" and answer based on what's actually in it.`,
      };
      setMessagesByFile((prev) => ({
        ...prev,
        [activeFile.id]: [...(prev[activeFile.id] ?? []), assistantMessage],
      }));
      setIsThinking(false);
    }, 1100);
  };

  return (
    <div className="dash-page">
      <header className="topbar">
        <div className="wordmark">
          Saksham<span className="wordmark-dot">.</span>
        </div>
        <div className="dash-topbar-actions">
          <ThemeToggle theme={theme} onToggle={toggleTheme} />
          <ProfileMenu />
        </div>
      </header>

      <main className="dash-main">
        <section className="dash-panel dash-upload-panel">
          <h2 className="dash-panel-title">Your notes</h2>

          <div
            className={`dropzone ${isDraggingOver ? 'dropzone-active' : ''}`}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDraggingOver(true);
            }}
            onDragLeave={() => setIsDraggingOver(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            role="button"
            tabIndex={0}
          >
            <UploadIcon />
            <p>
              Drop a PDF here, or <span className="dropzone-link">browse</span>
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept="application/pdf"
              multiple
              onChange={handleFileInputChange}
              hidden
            />
          </div>

          {files.length === 0 ? (
            <p className="dash-empty-hint">
              Upload a PDF of your notes to start asking questions about them.
            </p>
          ) : (
            <ul className="file-list">
              {files.map((file) => (
                <li
                  key={file.id}
                  className={`file-item ${file.id === activeFileId ? 'file-item-active' : ''}`}
                  onClick={() => setActiveFileId(file.id)}
                >
                  <FileIcon />
                  <div className="file-item-info">
                    <span className="file-item-name">{file.name}</span>
                    <span className="file-item-meta">
                      {file.sizeLabel} · <span className={`status-badge status-${file.status}`}>{statusLabel(file.status)}</span>
                    </span>
                  </div>
                  <button
                    type="button"
                    className="file-item-remove"
                    aria-label={`Remove ${file.name}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFile(file.id);
                    }}
                  >
                    <CloseIcon />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="dash-panel dash-chat-panel">
          <h2 className="dash-panel-title">
            {activeFile ? `Ask about "${activeFile.name}"` : 'Ask a question'}
          </h2>

          <div className="chat-scroll">
            {!activeFile && (
              <p className="dash-empty-hint">
                Select or upload a PDF to start asking questions about it.
              </p>
            )}

            {activeFile && activeFile.status !== 'ready' && (
              <p className="dash-empty-hint">
                {statusLabel(activeFile.status)} — this'll just take a moment.
              </p>
            )}

            {activeFile &&
              activeFile.status === 'ready' &&
              activeMessages.length === 0 && (
                <p className="dash-empty-hint">
                  Ready. Ask anything about this document below.
                </p>
              )}

            {activeMessages.map((message) => (
              <div key={message.id} className={`chat-bubble chat-bubble-${message.role}`}>
                {message.text}
              </div>
            ))}

            {isThinking && (
              <div className="chat-bubble chat-bubble-assistant chat-bubble-thinking">
                Thinking…
              </div>
            )}
          </div>

          <form className="chat-input-row" onSubmit={handleSendMessage}>
            <input
              type="text"
              value={draftMessage}
              onChange={(e) => setDraftMessage(e.target.value)}
              placeholder={
                activeFile?.status === 'ready'
                  ? 'Ask a question about this document…'
                  : 'Upload and wait for a document to finish parsing…'
              }
              disabled={!activeFile || activeFile.status !== 'ready'}
            />
            <button
              type="submit"
              className="btn btn-primary chat-send-btn"
              disabled={!activeFile || activeFile.status !== 'ready' || !draftMessage.trim()}
              aria-label="Send question"
            >
              <SendIcon />
            </button>
          </form>
        </section>
      </main>
    </div>
  );
}

export default Dashboard;