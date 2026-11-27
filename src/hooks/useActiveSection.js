import { useCallback, useEffect, useRef, useState } from 'react';
import { resolveActiveSectionId } from '../utils/weddingLogic.js';

const NAV_LOCK_MS = 650;

/**
 * Scroll-spy determinista para secciones hermanas contiguas.
 * Garantiza una única fuente de verdad sincronizada entre el Navbar y el riel lateral.
 */
export function useActiveSection(sectionIds) {
  const [activeSection, setActiveSection] = useState(sectionIds[0] || 'portada');
  const lockUntilRef = useRef(0);
  const rafRef = useRef(null);

  const computeActive = useCallback(() => {
    if (typeof window === 'undefined' || sectionIds.length === 0) return;
    if (Date.now() < lockUntilRef.current) return;

    const sectionPositions = sectionIds
      .map((id) => {
        const el = document.getElementById(id);
        return el ? { id, top: el.getBoundingClientRect().top } : null;
      })
      .filter(Boolean);

    if (sectionPositions.length === 0) return;

    const nextActive = resolveActiveSectionId(sectionPositions, {
      scrollY: window.scrollY,
      viewportHeight: window.innerHeight,
      docHeight: document.documentElement.scrollHeight,
    });
    setActiveSection(nextActive);
  }, [sectionIds]);

  const selectSection = useCallback((id) => {
    setActiveSection(id);
    lockUntilRef.current = Date.now() + NAV_LOCK_MS;
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;

    const scheduleCheck = () => {
      if (rafRef.current !== null) return;
      rafRef.current = window.requestAnimationFrame(() => {
        rafRef.current = null;
        computeActive();
      });
    };

    scheduleCheck();
    window.addEventListener('scroll', scheduleCheck, { passive: true });
    window.addEventListener('resize', scheduleCheck, { passive: true });

    return () => {
      window.removeEventListener('scroll', scheduleCheck);
      window.removeEventListener('resize', scheduleCheck);
      if (rafRef.current !== null) {
        window.cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [computeActive]);

  return { activeSection, selectSection };
}
