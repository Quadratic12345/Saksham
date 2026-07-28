// Purely decorative, full-page illustration sitting behind the dashboard's
// panels. Since the panels have opaque backgrounds and sit above this in
// the stacking order, only the page's margins and the gap between panels
// end up showing it — most of it stays hidden behind the actual UI.
function DashboardBackground() {
  return (
    <svg
      className="dash-background"
      viewBox="0 0 1200 800"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      {/* open notebook */}
      <g opacity="0.5">
        <path d="M180 200 L580 170 L580 620 L180 660 Z" fill="none" stroke="var(--border)" strokeWidth="2.5" />
        <path d="M580 170 L980 200 L980 660 L580 620 Z" fill="none" stroke="var(--border)" strokeWidth="2.5" />
        <path d="M580 170 L580 620" stroke="var(--border)" strokeWidth="2.5" />

        <g stroke="var(--border)" strokeWidth="2" strokeLinecap="round">
          <path d="M220 250 L520 232" />
          <path d="M220 290 L520 274" />
          <path d="M220 330 L500 315" />
          <path d="M220 370 L520 356" />
          <path d="M220 410 L460 398" />
        </g>

        <g stroke="var(--border)" strokeWidth="2" strokeLinecap="round">
          <path d="M640 258 L940 240" />
          <path d="M640 298 L940 282" />
          <path d="M640 338 L920 323" />
          <path d="M640 378 L940 364" />
          <path d="M640 418 L880 406" />
        </g>
      </g>

      <path
        d="M235 328 C 320 318, 400 312, 495 316"
        stroke="var(--accent)"
        strokeWidth="16"
        strokeLinecap="round"
        fill="none"
        opacity="0.35"
      />

      <g opacity="0.5">
        <path d="M300 640 L860 520" stroke="var(--ink-muted)" strokeWidth="6" strokeLinecap="round" />
        <path d="M860 520 L890 513" stroke="var(--accent)" strokeWidth="6" strokeLinecap="round" />
      </g>
    </svg>
  );
}

export default DashboardBackground;
