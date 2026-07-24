import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useClerk, useUser } from '@clerk/clerk-react';
import './ProfileMenu.css';

function ChevronIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.6" />
      <path d="M4.5 20c1.4-3.6 4.4-5.5 7.5-5.5s6.1 1.9 7.5 5.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function LogoutIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M16 17l5-5-5-5M21 12H9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ProfileMenu() {
  const { user } = useUser();
  const { signOut } = useClerk();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const displayName = user?.fullName || user?.primaryEmailAddress?.emailAddress || 'Account';
  const avatarUrl = user?.imageUrl;

  const handleLogout = () => {
    setIsOpen(false);
    // Clerk handles the actual sign-out; redirectUrl brings the user
    // back to the landing page. No backend call needed for this part.
    signOut({ redirectUrl: '/' });
  };

  return (
    <div className="profile-menu" ref={menuRef}>
      <button
        type="button"
        className="profile-trigger"
        onClick={() => setIsOpen((v) => !v)}
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        {avatarUrl ? (
          <img src={avatarUrl} alt="" className="profile-avatar" />
        ) : (
          <span className="profile-avatar profile-avatar-fallback">
            <UserIcon />
          </span>
        )}
        <span className="profile-name">{displayName}</span>
        <ChevronIcon />
      </button>

      {isOpen && (
        <div className="profile-dropdown" role="menu">
          {/*
            PROFILE PAGE TODO: this links to /profile, which is currently
            just a placeholder route (see App.tsx). Once there's a backend
            with real user data (saved notes, preferences, usage stats),
            build out ProfilePage.tsx to show it here.
          */}
          <Link to="/profile" className="profile-dropdown-item" role="menuitem" onClick={() => setIsOpen(false)}>
            <UserIcon />
            View profile
          </Link>

          <button type="button" className="profile-dropdown-item" role="menuitem" onClick={handleLogout}>
            <LogoutIcon />
            Log out
          </button>
        </div>
      )}
    </div>
  );
}

export default ProfileMenu;