import { motion, useScroll, useSpring, useTransform } from 'framer-motion';
import { NAV_SECTIONS, WEDDING_DETAILS } from '../data/weddingData.js';

export function InvitationHeader({
  activeSection = 'portada',
  onSelectSection,
  onShowEnvelope,
}) {
  const { scrollYProgress } = useScroll();
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 180,
    damping: 28,
    restDelta: 0.001,
  });
  const sparkLeft = useTransform(smoothProgress, [0, 1], ['0%', '100%']);
  const sparkOpacity = useTransform(scrollYProgress, [0, 0.02, 0.99, 1], [0, 1, 1, 0.85]);

  return (
    <header className="sticky top-0 z-30 min-h-14 sm:min-h-16 pt-[env(safe-area-inset-top)] w-full bg-royal-950/92 backdrop-blur-md border-b border-gold/40 shadow-[0_8px_24px_rgba(5,11,28,0.42)]">
      <div className="max-w-5xl mx-auto h-14 sm:h-16 px-3.5 sm:px-6 lg:px-8 flex items-center justify-between gap-2.5 sm:gap-5 lg:gap-8">
        <a
          href="#portada"
          onClick={() => onSelectSection?.('portada')}
          className="font-headline text-[14px] sm:text-base lg:text-lg font-semibold tracking-wider text-champagne whitespace-nowrap shrink-0 hover:text-ivory-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-light rounded px-1"
        >
          {WEDDING_DETAILS.coupleNames}
        </a>

        <nav
          aria-label="Secciones de la invitación"
          className="hidden md:flex items-center gap-4 lg:gap-7 text-[11px] lg:text-[12px] font-label font-semibold tracking-[1px] lg:tracking-[1.1px] uppercase text-royal-200"
        >
          {NAV_SECTIONS.map((item) => {
            const isActive = activeSection === item.id;
            return (
              <a
                key={item.id}
                href={`#${item.id}`}
                onClick={() => onSelectSection?.(item.id)}
                aria-current={isActive ? 'location' : undefined}
                className={`relative py-2 transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-light rounded px-1 ${isActive ? 'text-champagne' : 'hover:text-ivory-50'
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
            className="btn-gold min-h-10 px-3 sm:px-4 py-1.5 rounded-xl font-label text-[11px] tracking-[0.8px] sm:tracking-[1px] font-semibold uppercase whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-light"
          >
            Ver Sobre
          </motion.button>
        </div>
      </div>

      {/* Barra dorada y carmesí animada de progreso de scroll con destello viajero */}
      <div
        aria-hidden="true"
        className="relative h-1 w-full bg-royal-900/85 overflow-x-clip"
      >
        <motion.div
          style={{ scaleX: smoothProgress, transformOrigin: '0% 50%' }}
          className="scroll-shimmer-bar h-full w-full shadow-[0_0_10px_rgba(232,204,136,0.65)]"
        />
        <motion.span
          style={{ left: sparkLeft, opacity: sparkOpacity }}
          className="pointer-events-none absolute top-1/2 -translate-x-1/2 -translate-y-1/2 w-2.5 h-2.5 rotate-45 rounded-xs bg-champagne border border-crimson/70 shadow-[0_0_12px_3px_rgba(248,232,190,0.9)]"
        />
      </div>
    </header>
  );
}
