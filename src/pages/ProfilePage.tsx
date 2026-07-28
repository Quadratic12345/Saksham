import { Link } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import { useTheme } from '../hooks/useTheme';
import { ThemeToggle } from '../components/ThemeToggle';
import ProfileMenu from '../components/ProfileMenu';
import './ProfilePage.css';

// PLACEHOLDER PAGE — this just confirms the "View profile" link goes
// somewhere real. Once there's a backend, replace the content below
// with actual account/preferences/usage info pulled from it.
function ProfilePage() {
  const { theme, toggleTheme } = useTheme();
  const { user } = useUser();

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
        <p className="dash-empty-hint">
          Signed in as {user?.primaryEmailAddress?.emailAddress ?? 'your account'}.
        </p>
        <p className="dash-empty-hint">
          This page is a placeholder — account details, saved notes, and
          preferences will live here once the backend is built.
        </p>
        <Link to="/dashboard" className="btn btn-ghost">
          Back to dashboard
        </Link>
      </main>
    </div>
  );
}

export default ProfilePage;