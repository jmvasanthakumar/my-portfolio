/**
 * Inline SVG glyphs for the social links. Icons are design assets, not
 * content, so they never go through `src/data` or the service layer — and
 * they're inline rather than files in `/public` so they inherit
 * `currentColor` and pick up hover/focus states like the rest of the UI.
 *
 * Each is drawn from primitives on a 24×24 grid and sized by the caller's
 * `className`.
 */

interface IconProps {
  className?: string;
}

export function LinkedInIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
      focusable="false"
      className={className}
    >
      <circle cx="5.1" cy="4.4" r="1.9" />
      <rect x="3.4" y="8" width="3.4" height="11.6" rx="0.6" />
      <path d="M9.6 19.6V8h3.2v1.5c.83-1.14 2.06-1.76 3.5-1.76 3 0 4.7 1.95 4.7 5.35v6.51h-3.3v-6.1c0-1.8-.72-2.83-2.24-2.83-1.45 0-2.46 1.02-2.46 2.83v6.1z" />
    </svg>
  );
}

export function GitHubIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
      focusable="false"
      className={className}
    >
      <path d="M12 .3a12 12 0 0 0-3.8 23.4c.6.1.8-.3.8-.6v-2c-3.3.7-4-1.6-4-1.6-.6-1.4-1.4-1.8-1.4-1.8-1.1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1.1 1.8 2.8 1.3 3.5 1 .1-.8.4-1.3.8-1.6-2.7-.3-5.5-1.3-5.5-5.9 0-1.3.5-2.4 1.2-3.2-.1-.3-.5-1.5.1-3.2 0 0 1-.3 3.3 1.2a11.5 11.5 0 0 1 6 0C17.2 5 18.2 5.3 18.2 5.3c.6 1.7.2 2.9.1 3.2.8.8 1.2 1.9 1.2 3.2 0 4.6-2.8 5.6-5.5 5.9.4.4.8 1.1.8 2.2v3.3c0 .3.2.7.8.6A12 12 0 0 0 12 .3z" />
    </svg>
  );
}

export function InstagramIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      aria-hidden
      focusable="false"
      className={className}
    >
      <rect x="3" y="3" width="18" height="18" rx="5.2" />
      <circle cx="12" cy="12" r="4.1" />
      <circle cx="17.2" cy="6.8" r="1.15" fill="currentColor" stroke="none" />
    </svg>
  );
}
