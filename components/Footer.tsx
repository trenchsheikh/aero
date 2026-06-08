'use client';

export function Footer() {
  return (
    <footer className="relative z-10 border-t border-brand/10 mt-20">
      <div className="max-w-5xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-ink-subtle text-sm font-light">
          Aero&nbsp;&#174;&nbsp;2025 &nbsp; All rights reserved
        </p>

        <div className="flex items-center gap-5">
          <a href="#" className="text-ink-subtle hover:text-brand text-sm font-light transition-colors">
            Terms
          </a>
          <a href="#" className="text-ink-subtle hover:text-brand text-sm font-light transition-colors">
            Privacy
          </a>
          <a href="#" className="text-ink-subtle hover:text-brand text-sm font-light transition-colors">
            Contact
          </a>
          <a
            href="https://x.com/useaero"
            target="_blank"
            rel="noopener noreferrer"
            className="text-ink-subtle hover:text-brand transition-colors"
            aria-label="Aero on X"
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current" aria-hidden="true">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.741l7.73-8.835L1.254 2.25H8.08l4.265 5.638 5.899-5.638Zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
          </a>
        </div>
      </div>
    </footer>
  );
}
