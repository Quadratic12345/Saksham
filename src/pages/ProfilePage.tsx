import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth, useUser } from '@clerk/clerk-react';
import { useTheme } from '../hooks/useTheme';
import { ThemeToggle } from '../components/ThemeToggle';
import ProfileMenu from '../components/ProfileMenu';
import { deleteDocument, listDocuments } from '../lib/api';
import type { ApiDocument } from '../lib/api';
import '../pages/Dashboard.css';
import './ProfilePage.css';

function FileIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M6 2h9l5 5v13a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M14 2v6h6" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
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

function statusLabel(status: ApiDocument['status']): string {
  switch (status) {
    case 'parsing':
      return 'Parsing…';
    case 'ready':
      return 'Ready';
    case 'error':
      return 'Failed';
  }
}

function docTypeLabel(docType: ApiDocument['doc_type']): string {
  return docType === 'image' ? 'Handwritten/scanned' : 'Typed';
}

function formatJoinDate(date: Date | null | undefined): string {
  if (!date) return '—';
  return date.toLocaleDateString(undefined, { year: 'numeric', month: 'long' });
}

function ProfilePage() {
  const { theme, toggleTheme } = useTheme();
  const { user } = useUser();
  const { getToken } = useAuth();

  const [documents, setDocuments] = useState<ApiDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const token = await getToken();
        if (!token) return;
        const docs = await listDocuments(token);
        setDocuments(docs);
      } catch (err) {
        setLoadError(err instanceof Error ? err.message : 'Could not load your notes.');
      } finally {
        setIsLoading(false);
      }
    })();
  }, [getToken]);

  const handleDelete = async (id: string) => {
    setDocuments((prev) => prev.filter((d) => d.id !== id));
    try {
      const token = await getToken();
      if (token) await deleteDocument(id, token);
    } catch {
      // If deletion fails server-side, it's already gone from this list.
    }
  };

  const displayName = user?.fullName || 'Your account';
  const email = user?.primaryEmailAddress?.emailAddress ?? '—';
  const joinDate = formatJoinDate(user?.createdAt);

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

      <main className="profile-page-main">
        <h1 className="profile-page-title">Profile</h1>

        <section className="profile-panel">
          <h2 className="dash-panel-title">Account</h2>
          <div className="profile-account-row">
            {user?.imageUrl && (
              <img src={user.imageUrl} alt="" className="profile-account-avatar" />
            )}
            <div>
              <div className="profile-account-name">{displayName}</div>
              <div className="profile-account-email">{email}</div>
              <div className="profile-account-meta">Member since {joinDate}</div>
            </div>
          </div>
        </section>

        <section className="profile-panel">
          <h2 className="dash-panel-title">Your saved notes</h2>

          {loadError && (
            <p className="dash-empty-hint">Couldn't load your notes: {loadError}</p>
          )}

          {isLoading ? (
            <p className="dash-empty-hint">Loading your notes…</p>
          ) : documents.length === 0 ? (
            <p className="dash-empty-hint">
              You haven't uploaded any notes yet.{' '}
              <Link to="/dashboard">Go to the dashboard</Link> to add some.
            </p>
          ) : (
            <ul className="file-list">
              {documents.map((doc) => (
                <li key={doc.id} className="file-item">
                  <FileIcon />
                  <div className="file-item-info">
                    <span className="file-item-name">{doc.filename}</span>
                    <span className="file-item-meta">
                      {docTypeLabel(doc.doc_type)} ·{' '}
                      <span className={`status-badge status-${doc.status}`}>
                        {statusLabel(doc.status)}
                      </span>
                    </span>
                  </div>
                  <button
                    type="button"
                    className="file-item-remove"
                    aria-label={`Remove ${doc.filename}`}
                    onClick={() => handleDelete(doc.id)}
                  >
                    <CloseIcon />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        <Link to="/dashboard" className="btn btn-ghost">
          Back to dashboard
        </Link>
      </main>
    </div>
  );
}

export default ProfilePage;
