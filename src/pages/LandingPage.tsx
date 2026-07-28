import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/clerk-react';
import { useTheme } from '../hooks/useTheme';
import { ThemeToggle } from '../components/ThemeToggle';
import { clerkAppearance } from '../lib/clerkAppearance';
import './LandingPage.css';

function StarIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2.5l2.9 6.6 7.1.7-5.4 4.8 1.6 7-6.2-3.7-6.2 3.7 1.6-7-5.4-4.8 7.1-.7z" />
    </svg>
  );
}

function HighlighterUnderline() {
  return (
    <svg className="highlighter" viewBox="0 0 220 26" preserveAspectRatio="none" aria-hidden="true">
      <path
        d="M4 16.5C40 9 90 6 130 9.5c34 3 58 9 84 8"
        stroke="var(--accent)"
        strokeWidth="11"
        strokeLinecap="round"
        fill="none"
        opacity="0.55"
      />
    </svg>
  );
}

function LandingPage() {
  const { theme, toggleTheme } = useTheme();
  const wordmarkRef = useRef<HTMLAnchorElement>(null);
  const [ruleLeft, setRuleLeft] = useState<number | null>(null);

  useEffect(() => {
    const GAP_AFTER_WORD = 28;
    function updateRulePosition() {
      if (wordmarkRef.current) {
        const rect = wordmarkRef.current.getBoundingClientRect();
        setRuleLeft(rect.right + GAP_AFTER_WORD);
      }
    }
    updateRulePosition();
    window.addEventListener('resize', updateRulePosition);
    return () => window.removeEventListener('resize', updateRulePosition);
  }, []);

  return (
    <div className="page">
      <div className="rule-field" aria-hidden="true" />
      <div
        className="margin-rule"
        aria-hidden="true"
        style={ruleLeft !== null ? { left: `${ruleLeft}px` } : undefined}
      />

      <header className="topbar">
        <Link to="/" className="wordmark" ref={wordmarkRef}>
          Saksham<span className="wordmark-dot">.</span>
        </Link>
        <ThemeToggle theme={theme} onToggle={toggleTheme} />
      </header>

      <main className="hero">
        <p className="tagline">
          Take notes today, actually{' '}
          <span className="tagline-highlight">
            remember
            <HighlighterUnderline />
          </span>{' '}
          them tomorrow.
        </p>

        <div className="cta-row">
          <SignedOut>
            <SignInButton
              mode="modal"
              forceRedirectUrl="/dashboard"
              signUpForceRedirectUrl="/dashboard"
              appearance={clerkAppearance}
            >
              <button type="button" className="btn btn-primary">
                Get started
              </button>
            </SignInButton>
          </SignedOut>

          <SignedIn>
            <div className="user-chip">
              <UserButton afterSignOutUrl="/" appearance={clerkAppearance} />
              <Link to="/dashboard" className="btn btn-primary">
                Go to dashboard
              </Link>
            </div>
          </SignedIn>
        </div>

        <a className="github-link" href="https://github.com/Quadratic12345/Saksham" target="_blank" rel="noreferrer">
          <StarIcon />
          Star on GitHub
        </a>
      </main>

      <footer className="footer">
        Made with <span className="heart">♥</span> by Sankalp.
      </footer>
    </div>
  );
}

export default LandingPage;