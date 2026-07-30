import { useCallback, useEffect, useRef, useState } from 'react';
import type { ChangeEvent, DragEvent, FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';
import { useTheme } from '../hooks/useTheme';
import { ThemeToggle } from '../components/ThemeToggle';
import ProfileMenu from '../components/ProfileMenu';
import { ApiError, askQuestion, deleteDocument, fetchDocumentFileUrl, listDocuments, uploadDocument } from '../lib/api';
import type { ApiDocument } from '../lib/api';
import './Dashboard.css';

type FileStatus = 'uploading' | 'parsing' | 'ready' | 'error';

interface UploadedFile {
  id: string;
  name: string;
  sizeLabel: string;
  status: FileStatus;
  errorMessage?: string;
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
      <path d="M12 15V4M12 4l-4 4M12 4l4 4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M4 15v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function FileIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M6 2h9l5 5v13a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M14 2v6h6" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  );
}

function EyeIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M5 5l14 14M19 5L5 19" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function SendIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 12l16-7-6 16-2.5-6.5L4 12Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
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

function toUploadedFile(doc: ApiDocument, sizeLabel = '—'): UploadedFile {
  return {
    id: doc.id,
    name: doc.filename,
    sizeLabel,
    status: doc.status,
  };
}

function Dashboard() {
  const { theme, toggleTheme } = useTheme();
  const { getToken } = useAuth();
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [activeFileId, setActiveFileId] = useState<string | null>(null);
  const [messagesByFile, setMessagesByFile] = useState<Record<string, ChatMessage[]>>({});
  const [isThinking, setIsThinking] = useState(false);
  const [draftMessage, setDraftMessage] = useState('');
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [isLoadingFiles, setIsLoadingFiles] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const activeFile = files.find((f) => f.id === activeFileId) ?? null;
  const activeMessages = activeFileId ? messagesByFile[activeFileId] ?? [] : [];

  useEffect(() => {
    (async () => {
      try {
        const token = await getToken();
        if (!token) return;
        const docs = await listDocuments(token);
        setFiles(docs.map((d) => toUploadedFile(d)));
      } catch (err) {
        setLoadError(err instanceof Error ? err.message : 'Could not load your documents.');
      } finally {
        setIsLoadingFiles(false);
      }
    })();
  }, [getToken]);

  const ingestFiles = useCallback(
    (fileList: FileList) => {
      const pdfFiles = Array.from(fileList).filter((f) => f.type === 'application/pdf');

      pdfFiles.forEach(async (file) => {
        const tempId = `uploading-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
        const placeholder: UploadedFile = {
          id: tempId,
          name: file.name,
          sizeLabel: formatSize(file.size),
          status: 'uploading',
        };

        setFiles((prev) => [...prev, placeholder]);
        setActiveFileId((prev) => prev ?? tempId);

        try {
          const token = await getToken();
          if (!token) throw new Error('Not signed in.');

          const doc = await uploadDocument(file, token);

          setFiles((prev) =>
            prev.map((f) =>
              f.id === tempId ? { ...toUploadedFile(doc, placeholder.sizeLabel) } : f
            )
          );
          setActiveFileId((prev) => (prev === tempId ? doc.id : prev));
        } catch (err) {
          const message = err instanceof Error ? err.message : 'Upload failed.';
          setFiles((prev) =>
            prev.map((f) => (f.id === tempId ? { ...f, status: 'error', errorMessage: message } : f))
          );
        }
      });
    },
    [getToken]
  );

  const handleFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) ingestFiles(e.target.files);
    e.target.value = '';
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDraggingOver(false);
    if (e.dataTransfer.files) ingestFiles(e.dataTransfer.files);
  };

  const removeFile = async (id: string) => {
    const wasActive = activeFileId === id;

    setFiles((prev) => prev.filter((f) => f.id !== id));
    setMessagesByFile((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
    if (wasActive) setActiveFileId(null);

    try {
      const token = await getToken();
      if (token) await deleteDocument(id, token);
    } catch {
      // Deletion failing server-side isn't critical to surface here.
    }
  };

  const handleViewFile = async (id: string) => {
    try {
      const token = await getToken();
      if (!token) return;
      const url = await fetchDocumentFileUrl(id, token);
      window.open(url, '_blank');
      setTimeout(() => URL.revokeObjectURL(url), 10000);
    } catch (err) {
      console.error('Could not open PDF:', err);
    }
  };

  const handleSendMessage = async (e: FormEvent) => {
    e.preventDefault();
    const text = draftMessage.trim();
    if (!text || !activeFile || activeFile.status !== 'ready') return;

    const userMessage: ChatMessage = { id: `${Date.now()}-user`, role: 'user', text };

    setMessagesByFile((prev) => ({
      ...prev,
      [activeFile.id]: [...(prev[activeFile.id] ?? []), userMessage],
    }));
    setDraftMessage('');
    setIsThinking(true);

    try {
      const token = await getToken();
      if (!token) throw new Error('Not signed in.');

      const answer = await askQuestion(activeFile.id, text, token);

      const assistantMessage: ChatMessage = { id: `${Date.now()}-assistant`, role: 'assistant', text: answer };
      setMessagesByFile((prev) => ({
        ...prev,
        [activeFile.id]: [...(prev[activeFile.id] ?? []), assistantMessage],
      }));
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : 'Something went wrong reaching the server — is the backend running?';
      const errorMessage: ChatMessage = { id: `${Date.now()}-error`, role: 'assistant', text: message };
      setMessagesByFile((prev) => ({
        ...prev,
        [activeFile.id]: [...(prev[activeFile.id] ?? []), errorMessage],
      }));
    } finally {
      setIsThinking(false);
    }
  };

  return (
    <div className="dash-page">
      <header className="topbar">
        <Link to="/" className="wordmark">
          Saksham<span className="wordmark-dot">.</span>
        </Link>
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
            <input ref={fileInputRef} type="file" accept="application/pdf" multiple onChange={handleFileInputChange} hidden />
          </div>

          {loadError && <p className="dash-empty-hint">Couldn't load your documents: {loadError}</p>}

          {isLoadingFiles ? (
            <p className="dash-empty-hint">Loading your documents…</p>
          ) : files.length === 0 ? (
            <p className="dash-empty-hint">Upload a PDF of your notes to start asking questions about them.</p>
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
                  {file.status === 'ready' && (
                    <button
                      type="button"
                      className="file-item-view"
                      aria-label={`View ${file.name}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewFile(file.id);
                      }}
                    >
                      <EyeIcon />
                    </button>
                  )}
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
              <p className="dash-empty-hint">Select or upload a PDF to start asking questions about it.</p>
            )}

            {activeFile && activeFile.status === 'error' && (
              <p className="dash-empty-hint">
                Something went wrong with this file{activeFile.errorMessage ? `: ${activeFile.errorMessage}` : '.'}
              </p>
            )}

            {activeFile && (activeFile.status === 'uploading' || activeFile.status === 'parsing') && (
              <p className="dash-empty-hint">{statusLabel(activeFile.status)} — this'll just take a moment.</p>
            )}

            {activeFile && activeFile.status === 'ready' && activeMessages.length === 0 && (
              <p className="dash-empty-hint">Ready. Ask anything about this document below.</p>
            )}

            {activeMessages.map((message) => (
              <div key={message.id} className={`chat-bubble chat-bubble-${message.role}`}>
                {message.text}
              </div>
            ))}

            {isThinking && (
              <div className="chat-bubble chat-bubble-assistant chat-bubble-thinking">Thinking…</div>
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
