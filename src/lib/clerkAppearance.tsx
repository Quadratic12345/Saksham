export const clerkAppearance = {
  variables: {
    colorPrimary: 'var(--accent)',
    colorText: 'var(--ink)',
    colorTextSecondary: 'var(--ink-muted)',
    colorBackground: 'var(--surface)',
    colorInputBackground: 'var(--bg)',
    colorInputText: 'var(--ink)',
    colorDanger: '#d64545',
    borderRadius: '10px',
    fontFamily: "'Manrope', system-ui, sans-serif",
  },
  elements: {
    card: {
      boxShadow: 'var(--shadow)',
      border: '1px solid var(--border)',
    },
    formButtonPrimary: {
      backgroundColor: 'var(--accent)',
      color: 'var(--accent-ink)',
      fontSize: '0.95rem',
      '&:hover': {
        filter: 'brightness(1.05)',
      },
    },
    footerActionLink: {
      color: 'var(--accent)',
    },
  },
};