'use client';

import { useEffect, useRef } from 'react';

export function ScrollSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const leftRef   = useRef<HTMLDivElement>(null);
  const rightRef  = useRef<HTMLDivElement>(null);
  const textRef   = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    function update() {
      const rect     = section!.getBoundingClientRect();
      const total    = section!.offsetHeight - window.innerHeight;
      const progress = Math.max(0, Math.min(1, -rect.top / total));

      // Hands slide in from off-screen and stop just as the trailing edge
      // enters the viewport (END_OFFSET % of panel width still off-screen)
      const END_OFFSET = 58;
      const offset = END_OFFSET + (1 - progress) * (100 - END_OFFSET);

      if (leftRef.current)  leftRef.current.style.transform  = `translateX(-${offset}%)`;
      if (rightRef.current) rightRef.current.style.transform = `translateX(${offset}%)`;

      // Text fades in from progress 0.4 → 0.75
      if (textRef.current) {
        const textProgress = Math.max(0, Math.min(1, (progress - 0.35) / 0.4));
        textRef.current.style.opacity   = String(textProgress);
        textRef.current.style.transform = `translateY(${(1 - textProgress) * 18}px)`;
      }
    }

    window.addEventListener('scroll', update, { passive: true });
    update();
    return () => window.removeEventListener('scroll', update);
  }, []);

  return (
    <section
      ref={sectionRef}
      style={{ height: '260vh', background: '#000', position: 'relative' }}
    >
      {/* Sticky viewport frame */}
      <div style={{ position: 'sticky', top: 0, height: '100vh', overflow: 'hidden' }}>

        {/* Centred text */}
        <div
          ref={textRef}
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10,
            pointerEvents: 'none',
            opacity: 0,
            transition: 'none',
          }}
        >
          <p
            style={{
              fontFamily: 'var(--font-inter)',
              fontWeight: 600,
              fontSize: 'clamp(1.25rem, 3.2vw, 2rem)',
              color: '#ffffff',
              textAlign: 'center',
              maxWidth: '24rem',
              padding: '0 1.5rem',
              lineHeight: 1.3,
              letterSpacing: '-0.02em',
              textShadow: '0 0 60px rgba(0,0,0,1)',
            }}
          >
            Pay or get paid by anyone, within a touch.
          </p>
        </div>

        {/* Right-pointing hand — enters from the left */}
        <div
          ref={leftRef}
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            width: '50%',
            height: '100%',
            transform: 'translateX(-100%)',
            willChange: 'transform',
          }}
        >
          <img
            src="/handpointingright.png"
            alt=""
            aria-hidden
            draggable={false}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              objectPosition: 'right center',
              userSelect: 'none',
            }}
          />
        </div>

        {/* Left-pointing hand — enters from the right */}
        <div
          ref={rightRef}
          style={{
            position: 'absolute',
            right: 0,
            top: 0,
            width: '50%',
            height: '100%',
            transform: 'translateX(100%)',
            willChange: 'transform',
          }}
        >
          <img
            src="/handpointingleft.png"
            alt=""
            aria-hidden
            draggable={false}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              objectPosition: 'left center',
              userSelect: 'none',
            }}
          />
        </div>

      </div>
    </section>
  );
}
