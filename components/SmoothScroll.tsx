'use client';

import { useEffect } from 'react';

export function SmoothScroll() {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    // Touch devices already have native momentum — leave them alone
    if ('ontouchstart' in window || navigator.maxTouchPoints > 0) return;

    const html = document.documentElement;

    // Must disable CSS smooth-scroll, otherwise setting scrollTop triggers another
    // smooth animation that fights our RAF loop and causes stutter
    html.style.scrollBehavior = 'auto';

    let target = window.scrollY;
    let current = window.scrollY;
    let raf: number | null = null;
    let lastWheelTime = 0;

    function tick() {
      // If the real scroll position diverged from what we set (keyboard, scrollIntoView, etc.)
      // — sync and bail; we'll resume from wherever we end up
      if (Math.abs(window.scrollY - current) > 3) {
        current = window.scrollY;
        target  = window.scrollY;
        raf = null;
        return;
      }

      current += (target - current) * 0.18;
      html.scrollTop = current;

      if (Math.abs(target - current) > 0.3) {
        raf = requestAnimationFrame(tick);
      } else {
        html.scrollTop = target;
        current = target;
        raf = null;
      }
    }

    function onWheel(e: WheelEvent) {
      // Don't intercept scrolls inside an overflow child (modal, dropdown, etc.)
      let el = e.target as HTMLElement | null;
      while (el && el !== html) {
        const ov = getComputedStyle(el).overflowY;
        if ((ov === 'auto' || ov === 'scroll') && el.scrollHeight > el.clientHeight) return;
        el = el.parentElement;
      }

      e.preventDefault();

      // If the wheel was idle for a while, re-sync from the real scroll position
      // (keyboard or a link may have moved us in the meantime)
      if (Date.now() - lastWheelTime > 400) {
        current = window.scrollY;
        target  = window.scrollY;
      }
      lastWheelTime = Date.now();

      // Normalise across deltaMode values
      let delta = e.deltaY;
      if (e.deltaMode === 1) delta *= 40;               // line units → px
      else if (e.deltaMode === 2) delta *= window.innerHeight; // page units → px

      const max = html.scrollHeight - window.innerHeight;
      target = Math.max(0, Math.min(max, target + delta));

      if (!raf) raf = requestAnimationFrame(tick);
    }

    window.addEventListener('wheel', onWheel, { passive: false });

    return () => {
      html.style.scrollBehavior = '';
      window.removeEventListener('wheel', onWheel);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return null;
}
