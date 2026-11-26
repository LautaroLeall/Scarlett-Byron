import { useEffect, useState } from 'react';
import { motion, useScroll, useSpring } from 'framer-motion';
import { WEDDING_DETAILS } from '../data/weddingData.js';

const NAV_ITEMS = [
  { id: 'portada', label: 'Portada' },
  { id: 'ceremonia', label: 'Ceremonia' },
  { id: 'historia', label: 'Historia' },
  { id: 'confirmar', label: 'Confirmar' },
];

export function InvitationHeader({ onShowEnvelope }) {
  const [activeSection, setActiveSection] = useState('portada');
  const { scrollYProgress } = useScroll();
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 180,
    damping: 28,
    restDelta: 0.001,
  });

  useEffect(() => {
    const sections = NAV_ITEMS.map((item) => document.getElementById(item.id)).filter(Boolean);
    if (sections.length === 0) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]?.target.id) {
          setActiveSection(visible[0].target.id);
        }
      },
      { rootMargin: '-25% 0px -55% 0px', threshold: [0.1, 0.35, 0.6] }
    );

    sections.forEach((sec) => observer.observe(sec));
    return () => observer.disconnect();
  }, []);

  return (
    <header className="sticky top-0 z-30 min-h-14 sm:min-h-16 pt-[env(safe-area-inset-top)] w-full bg-ivory-50/95 backdrop-blur-md border-b border-outline-variant/80">
      <div className="max-w-5xl mx-auto h-14 sm:h-16 px-3.5 sm:px-6 lg:px-8 flex items-center justify-between gap-2.5 sm:gap-5 lg:gap-8">
        <a
          href="#portada"
          className="font-headline text-[14px] sm:text-base lg:text-lg font-semibold tracking-wider text-ink whitespace-nowrap shrink-0 hover:text-gold-dark transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-dark rounded px-1"
        >
          {WEDDING_DETAILS.coupleNames}
        </a>

        <nav
          aria-label="Secciones de la invitación"
          className="hidden md:flex items-center gap-4 lg:gap-7 text-[11px] lg:text-[12px] font-label font-semibold tracking-[1px] lg:tracking-[1.1px] uppercase text-ink-muted"
        >
          {NAV_ITEMS.map((item) => {
            const isActive = activeSection === item.id;
            return (
              <a
                key={item.id}
                href={`#${item.id}`}
                onClick={() => setActiveSection(item.id)}
                className={`relative py-2 transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-dark rounded px-1 ${isActive ? 'text-ink' : 'hover:text-ink'
                  }`}
              >
                {item.label}
                {isActive && (
                  <motion.span
                    layoutId="navActiveUnderline"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    className="absolute left-0 right-0 -bottom-0.5 h-0.5 bg-linear-to-r from-gold-light via-crimson to-gold-light rounded-full"
                  />
                )}
              </a>
            );
          })}
        </nav>

        <div className="flex items-center shrink-0">
          <motion.button
            type="button"
            onClick={onShowEnvelope}
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.96 }}
            className="btn-ivory min-h-10 px-3 sm:px-4 py-1.5 rounded-xl font-label text-[11px] tracking-[0.8px] sm:tracking-[1px] font-semibold uppercase whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-dark"
          >
            Ver Sobre
          </motion.button>
        </div>
      </div>

      {/* Barra dorada de progreso de lectura */}
      <motion.div
        aria-hidden="true"
        style={{ scaleX: smoothProgress, transformOrigin: '0% 50%' }}
        className="h-[2.5px] w-full bg-linear-to-r from-gold-light via-gold-dark to-crimson"
      />
    </header>
  );
}
