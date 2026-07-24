import type { Theme } from '../hooks/useTheme';

function SunIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="4.5" stroke="currentColor" strokeWidth="1.6" />
      <g stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
        <path d="M12 2.5v2.2" />
        <path d="M12 19.3v2.2" />
        <path d="M21.5 12h-2.2" />
        <path d="M4.7 12H2.5" />
        <path d="M18.7 5.3l-1.55 1.55" />
        <path d="M6.85 17.15L5.3 18.7" />
        <path d="M18.7 18.7l-1.55-1.55" />
        <path d="M6.85 6.85L5.3 5.3" />
      </g>
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M20.2 14.6A8.6 8.6 0 1 1 9.4 3.8a7 7 0 0 0 10.8 10.8Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

type ThemeToggleProps = {
  theme: Theme;
  onToggle: () => void;
};

export function ThemeToggle({ theme, onToggle }: ThemeToggleProps) {
  return (
    <button
      type="button"
      className="theme-toggle"
      onClick={onToggle}
      aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
    >
      <span className={`toggle-icon ${theme === 'light' ? 'active' : ''}`}>
        <SunIcon />
      </span>
      <span className={`toggle-icon ${theme === 'dark' ? 'active' : ''}`}>
        <MoonIcon />
      </span>
    </button>
  );
}