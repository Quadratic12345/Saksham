function DashboardBackground() {
  return (
    <svg
      className="dash-background"
      viewBox="0 0 1200 800"
      preserveAspectRatio="xMidYMid meet"
      aria-hidden="true"
    >
      <g opacity="0.55">
        <rect x="30" y="30" width="150" height="110" rx="6" fill="none" stroke="var(--border)" strokeWidth="2.5" transform="rotate(-6 105 85)" />
        <rect x="45" y="45" width="150" height="110" rx="6" fill="none" stroke="var(--border)" strokeWidth="2.5" transform="rotate(3 120 100)" />
        <g stroke="var(--border)" strokeWidth="2" strokeLinecap="round" transform="rotate(3 120 100)">
          <path d="M65 80 L175 70" />
          <path d="M65 105 L175 96" />
          <path d="M65 130 L155 122" />
        </g>
      </g>

      <g opacity="0.5">
        <path d="M1080 0 L1080 130 L1110 105 L1140 130 L1140 0 Z" fill="none" stroke="var(--accent)" strokeWidth="3" />
      </g>

      <g opacity="0.5">
        <path d="M30 420 L150 380" stroke="var(--ink-muted)" strokeWidth="7" strokeLinecap="round" />
        <path d="M150 380 L172 373" stroke="var(--accent)" strokeWidth="7" strokeLinecap="round" />
      </g>

      <g opacity="0.4">
        <path d="M1040 460 C 1080 452, 1120 450, 1165 456" stroke="var(--accent)" strokeWidth="14" strokeLinecap="round" fill="none" />
      </g>

      <g opacity="0.5">
        <path d="M70 760 C 70 730, 115 730, 115 760 L 115 790" fill="none" stroke="var(--border)" strokeWidth="4" strokeLinecap="round" />
      </g>

      <g fill="var(--border)" opacity="0.5">
        <circle cx="1080" cy="770" r="5" />
        <circle cx="1110" cy="758" r="4" />
        <circle cx="1138" cy="748" r="3" />
      </g>

      <g stroke="var(--border)" strokeWidth="1.5" opacity="0.3">
        <path d="M300 40 L500 34" />
        <path d="M700 46 L900 40" />
      </g>
    </svg>
  );
}

export default DashboardBackground;
