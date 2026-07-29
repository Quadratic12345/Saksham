// Uses Tailwind utility classes bound directly to our existing CSS
// variables (bg-[var(--surface)], etc.) — since those variables already
// swap correctly with our light/dark toggle, this guarantees Clerk's
// modal always matches the app's real design in both themes, rather than
// approximating it via Clerk's own `variables` config.
export const clerkAppearance = {
  elements: {
    card: 'bg-[var(--surface)] border border-[var(--border)] shadow-[var(--shadow)] rounded-[var(--radius-md)]',
    headerTitle: 'text-[var(--ink)] font-semibold',
    headerSubtitle: 'text-[var(--ink-muted)]',

    socialButtonsBlockButton:
      'bg-[var(--surface)] border border-[var(--border)] text-[var(--ink)] hover:bg-[var(--surface-hover)]',
    socialButtonsBlockButtonText: 'text-[var(--ink)]',

    dividerLine: 'bg-[var(--border)]',
    dividerText: 'text-[var(--ink-muted)]',

    formFieldLabel: 'text-[var(--ink)]',
    formFieldInput:
      'bg-[var(--bg)] border border-[var(--border)] text-[var(--ink)] focus:border-[var(--accent)]',
    formFieldHintText: 'text-[var(--ink-muted)]',
    formFieldErrorText: 'text-red-500',

    formButtonPrimary:
      'bg-[var(--accent)] text-[var(--accent-ink)] hover:brightness-105 text-[0.95rem] shadow-none',

    footerActionText: 'text-[var(--ink-muted)]',
    footerActionLink: 'text-[var(--accent)] hover:underline',

    identityPreviewText: 'text-[var(--ink)]',
    identityPreviewEditButton: 'text-[var(--accent)]',

    otpCodeFieldInput: 'bg-[var(--bg)] border-[var(--border)] text-[var(--ink)]',

    userButtonPopoverCard: 'bg-[var(--surface)] border border-[var(--border)] shadow-[var(--shadow)]',
    userButtonPopoverActionButtonText: 'text-[var(--ink)]',
    userButtonPopoverFooter: 'hidden',
  },
};
