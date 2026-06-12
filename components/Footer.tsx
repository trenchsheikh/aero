'use client';

import Link from 'next/link';
import Image from 'next/image';

export function Footer() {
  return (
    <footer
      style={{
        background: '#000000',
        color: '#ffffff',
        borderTop: '1px solid rgba(255,255,255,0.07)',
        padding: '4rem 1.5rem 2.5rem',
      }}
    >
      <div style={{ maxWidth: '960px', margin: '0 auto' }}>

        {/* Main row */}
        <div className="flex flex-col md:flex-row gap-12 md:gap-20">

          {/* Left: logo + newsletter */}
          <div style={{ flex: 1, maxWidth: '340px' }}>
            <div style={{ marginBottom: '1.5rem' }}>
              <Image src="/aero-logo.png" alt="Aero" width={80} height={28} style={{ objectFit: 'contain' }} />
            </div>

            <h3 style={{ fontWeight: 600, fontSize: '1.0625rem', marginBottom: '0.375rem' }}>
              Join our newsletter.
            </h3>
            <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.875rem', marginBottom: '1.25rem', lineHeight: 1.5 }}>
              Join our newsletter to be updated.
            </p>

            <form
              onSubmit={e => e.preventDefault()}
              style={{ display: 'flex', gap: '0.5rem' }}
            >
              <input
                type="email"
                placeholder="user@useaero.io"
                style={{
                  flex: 1,
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '12px',
                  padding: '0.625rem 1rem',
                  color: '#ffffff',
                  fontSize: '0.875rem',
                  outline: 'none',
                  minWidth: 0,
                }}
              />
              <button
                type="submit"
                style={{
                  background: '#ffffff',
                  color: '#000000',
                  fontWeight: 500,
                  fontSize: '0.875rem',
                  padding: '0.625rem 1.25rem',
                  borderRadius: '12px',
                  border: 'none',
                  cursor: 'pointer',
                  flexShrink: 0,
                }}
              >
                Submit
              </button>
            </form>
          </div>

          {/* Right: link columns */}
          <div style={{ display: 'flex', gap: '3rem', flexShrink: 0 }}>
            <div>
              <p
                style={{
                  color: 'rgba(255,255,255,0.3)',
                  fontSize: '0.6875rem',
                  fontWeight: 500,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  marginBottom: '1rem',
                }}
              >
                Explore
              </p>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <li>
                  <Link href="#overview" style={{ color: '#ffffff', fontSize: '0.875rem', textDecoration: 'none', opacity: 0.85 }}>
                    Overview
                  </Link>
                </li>
                <li>
                  <Link href="#" style={{ color: '#ffffff', fontSize: '0.875rem', textDecoration: 'none', opacity: 0.85 }}>
                    About
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <p
                style={{
                  color: 'rgba(255,255,255,0.3)',
                  fontSize: '0.6875rem',
                  fontWeight: 500,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  marginBottom: '1rem',
                }}
              >
                What We Do
              </p>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <li>
                  <Link href="#" style={{ color: '#ffffff', fontSize: '0.875rem', textDecoration: 'none', opacity: 0.85 }}>
                    Products
                  </Link>
                </li>
                <li>
                  <Link href="#" style={{ color: '#ffffff', fontSize: '0.875rem', textDecoration: 'none', opacity: 0.85 }}>
                    Features
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Full-width AERO wordmark */}
        <div style={{ marginTop: '3.5rem' }}>
          <span
            style={{
              fontFamily: 'var(--font-inter)',
              fontWeight: 800,
              fontSize: 'clamp(5rem, 19.5vw, 19.5vw)',
              letterSpacing: '-0.04em',
              lineHeight: 1.1,
              color: '#ffffff',
              display: 'block',
              textAlign: 'center',
              whiteSpace: 'nowrap',
              userSelect: 'none',
              padding: '0 0.1em',
            }}
          >
            AERO
          </span>
        </div>

        {/* Bottom bar */}
        <div
          className="flex flex-col sm:flex-row justify-between items-center gap-3"
          style={{
            marginTop: '1.5rem',
            paddingTop: '2rem',
            borderTop: '1px solid rgba(255,255,255,0.07)',
            color: 'rgba(255,255,255,0.2)',
            fontSize: '0.75rem',
          }}
        >
          <p>© 2025 Aero. All rights reserved.</p>
          <div style={{ display: 'flex', gap: '1.25rem' }}>
            {['Terms', 'Privacy', 'Contact'].map(label => (
              <Link
                key={label}
                href="#"
                style={{ color: 'rgba(255,255,255,0.2)', textDecoration: 'none' }}
              >
                {label}
              </Link>
            ))}
            <a
              href="https://x.com/useaero"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center' }}
              aria-label="Aero on X"
            >
              <svg viewBox="0 0 24 24" style={{ width: '14px', height: '14px', fill: 'currentColor' }}>
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.741l7.73-8.835L1.254 2.25H8.08l4.265 5.638 5.899-5.638Zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
