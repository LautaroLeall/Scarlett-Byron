import { useRef, useState } from 'react';
import { motion, AnimatePresence, MotionConfig, useScroll, useTransform } from 'framer-motion';
import { IMAGES, NAV_SECTIONS, WEDDING_DETAILS } from './data/weddingData.js';
import { parseStoredRsvp } from './utils/weddingLogic.js';
import { useAudioPlayer } from './hooks/useAudioPlayer.js';
import { useActiveSection } from './hooks/useActiveSection.js';
import { ErrorBoundary } from './components/ErrorBoundary.jsx';
import { EnvelopeGate } from './components/EnvelopeGate.jsx';
import { InvitationHeader } from './components/InvitationHeader.jsx';
import { RoyalScrollRail } from './components/RoyalScrollRail.jsx';
import { HeroSection } from './components/HeroSection.jsx';
import { EventLocationsSection } from './components/EventLocationsSection.jsx';
import { StoryGallery } from './components/StoryGallery.jsx';
import { DressCodeCard } from './components/DressCodeCard.jsx';
import { RsvpFormCard } from './components/RsvpFormCard.jsx';
import { GiftsCard } from './components/GiftsCard.jsx';
import { SongSuggestionCard } from './components/SongSuggestionCard.jsx';
import { ClosingFooter } from './components/ClosingFooter.jsx';
import { FloatingAudioButton } from './components/FloatingAudioButton.jsx';
import { FloatingPetals } from './components/FloatingPetals.jsx';
import { BaroqueDivider, CornerRoses, GoldButterfly } from './components/RoyalOrnaments.jsx';

function getInitialViewMode() {
  if (typeof window !== 'undefined') {
    const params = new URLSearchParams(window.location.search);
    if (params.get('autostart') === '1') {
      return 'invitation';
    }
  }
  return 'envelope';
}

function loadInitialRsvp() {
  if (typeof window === 'undefined') return null;
  try {
    return parseStoredRsvp(
      window.localStorage.getItem(WEDDING_DETAILS.rsvp.storageKey),
      WEDDING_DETAILS.rsvp.maxGuests
    );
  } catch {
    return null;
  }
}

function scrollToTopNow() {
  if (typeof window === 'undefined') return;
  window.scrollTo(0, 0);
}

function ScrollParallaxOrnaments({ targetRef, children }) {
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ['start end', 'end start'],
  });
  const driftY = useTransform(scrollYProgress, [0, 1], [-22, 26]);
  const gentleRotate = useTransform(scrollYProgress, [0, 1], [-4, 5]);

  return (
    <motion.div
      aria-hidden="true"
      style={{ y: driftY, rotate: gentleRotate }}
      className="pointer-events-none absolute inset-0"
    >
      {children}
    </motion.div>
  );
}

const SECTION_IDS = NAV_SECTIONS.map((section) => section.id);

export default function App() {
  const [viewMode, setViewMode] = useState(getInitialViewMode);
  const [envelopeOpened, setEnvelopeOpened] = useState(false);
  const [savedRsvp, setSavedRsvp] = useState(loadInitialRsvp);
  const { isPlaying, play, pause, togglePlay } = useAudioPlayer(WEDDING_DETAILS.audio.src);
  const { activeSection, selectSection } = useActiveSection(SECTION_IDS);
  const ceremonyRef = useRef(null);
  const storyRef = useRef(null);
  const confirmRef = useRef(null);

  const handleRsvpSaved = (record) => {
    setSavedRsvp(record);
    try {
      window.localStorage.setItem(WEDDING_DETAILS.rsvp.storageKey, JSON.stringify(record));
    } catch {
      // Ignorar cuota de almacenamiento
    }
  };

  const handleFocusRsvpForm = () => {
    selectSection('confirmar');
    if (typeof document === 'undefined') return;
    const input = document.getElementById('rsvp-guest-name');
    const section = document.getElementById('confirmar');
    if (section) {
      section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    if (input) {
      window.setTimeout(() => {
        input.focus({ preventScroll: true });
      }, 320);
    }
  };

  const handleOpenEnvelope = () => {
    setEnvelopeOpened(true);
    play();
  };

  const handleCloseEnvelope = () => {
    setEnvelopeOpened(false);
  };

  const handleEnterInvitation = () => {
    if (!isPlaying) play();
    selectSection('portada');
    setViewMode('invitation');
    scrollToTopNow();
  };

  const handleEnterSilent = () => {
    pause();
    setEnvelopeOpened(false);
    selectSection('portada');
    setViewMode('invitation');
    scrollToTopNow();
  };

  const handleShowEnvelope = () => {
    setEnvelopeOpened(false);
    setViewMode('envelope');
    scrollToTopNow();
  };

  return (
    <ErrorBoundary>
      <MotionConfig reducedMotion="user">
        <AnimatePresence mode="wait">
          {viewMode === 'envelope' ? (
            <EnvelopeGate
              key="envelope-gate"
              isOpened={envelopeOpened}
              isPlaying={isPlaying}
              onOpenEnvelope={handleOpenEnvelope}
              onCloseEnvelope={handleCloseEnvelope}
              onEnterInvitation={handleEnterInvitation}
              onEnterSilent={handleEnterSilent}
            />
          ) : (
            <motion.div
              key="invitation-main"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
              className="relative min-h-dvh w-full text-on-surface flex flex-col"
            >
              <FloatingPetals />
              <InvitationHeader
                activeSection={activeSection}
                onSelectSection={selectSection}
                onShowEnvelope={handleShowEnvelope}
              />

              <main className="parchment-sheet relative z-10 w-full max-w-5xl mx-auto flex-1 border-x border-gold/45 overflow-x-clip pb-[max(5.5rem,calc(4.5rem+env(safe-area-inset-bottom)))] shadow-[0_0_64px_rgba(4,10,24,0.65)]">
                <HeroSection isPlaying={isPlaying} onToggleMusic={togglePlay} />

                {/* Capítulo 2: Ceremonia y Recepción (entrada y cierre independientes) */}
                <section
                  ref={ceremonyRef}
                  id="ceremonia"
                  aria-label="Ceremonia y Recepción"
                  className="relative w-full overflow-hidden flex flex-col gap-7 sm:gap-9 px-4 sm:px-8 lg:px-12 py-12 sm:py-16 scroll-mt-16"
                >
                  <ScrollParallaxOrnaments targetRef={ceremonyRef}>
                    <CornerRoses position="tl" className="w-24 sm:w-32 opacity-30" />
                    <img
                      src={IMAGES.goldRoses}
                      alt=""
                      aria-hidden="true"
                      loading="lazy"
                      decoding="async"
                      className="pointer-events-none select-none hidden md:block absolute top-10 -right-8 w-28 opacity-20 rotate-12 object-contain"
                    />
                  </ScrollParallaxOrnaments>

                  <div className="relative z-10 w-full">
                    <EventLocationsSection />
                  </div>
                </section>

                {/* Capítulo 3: Nuestra Historia y Dress Code (sección hermana independiente) */}
                <section
                  ref={storyRef}
                  id="historia"
                  aria-label="Historia y Código de Vestimenta"
                  className="relative w-full overflow-hidden flex flex-col gap-7 sm:gap-9 px-4 sm:px-8 lg:px-12 py-12 sm:py-16 border-t border-gold/45 scroll-mt-16"
                >
                  <ScrollParallaxOrnaments targetRef={storyRef}>
                    <CornerRoses position="bl" className="w-24 sm:w-32 opacity-26" />
                    <GoldButterfly
                      flip
                      className="hidden sm:block absolute top-9 right-8 w-10 opacity-60"
                    />
                  </ScrollParallaxOrnaments>

                  <motion.header
                    initial={{ opacity: 0, y: 18 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 'some' }}
                    transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                    className="relative z-10 flex flex-col items-center text-center gap-2.5"
                  >
                    <span className="font-label text-[11px] leading-4 tracking-[1.8px] font-semibold uppercase text-crimson">
                      Recuerdos y Etiqueta
                    </span>
                    <h2 className="font-headline text-[22px] sm:text-[26px] leading-7.5 tracking-[1.4px] font-semibold text-royal-900 uppercase">
                      Historia y Vestimenta
                    </h2>
                    <BaroqueDivider />
                  </motion.header>

                  <div className="relative z-10 grid grid-cols-1 md:grid-cols-12 gap-5 sm:gap-6 items-stretch">
                    <StoryGallery />
                    <DressCodeCard />
                  </div>
                </section>

                {/* Capítulo 4: Confirmación, Regalos, Música y Cierre */}
                <section
                  ref={confirmRef}
                  id="confirmar"
                  aria-label="Confirmación, Regalos y Cierre"
                  className="relative w-full overflow-hidden flex flex-col gap-7 sm:gap-9 px-4 sm:px-8 lg:px-12 pt-12 sm:pt-16 pb-8 border-t border-gold/45 scroll-mt-16"
                >
                  <ScrollParallaxOrnaments targetRef={confirmRef}>
                    <CornerRoses position="tr" className="w-24 sm:w-32 opacity-28" />
                    <GoldButterfly className="hidden sm:block absolute top-8 left-8 w-10 opacity-65" />
                  </ScrollParallaxOrnaments>

                  <motion.header
                    initial={{ opacity: 0, y: 18 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 'some' }}
                    transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                    className="relative z-10 flex flex-col items-center text-center gap-2.5"
                  >
                    <span className="font-label text-[11px] leading-4 tracking-[1.8px] font-semibold uppercase text-crimson">
                      Tu lugar en nuestro cuento
                    </span>
                    <h2 className="font-headline text-[22px] sm:text-[26px] leading-7.5 tracking-[1.4px] font-semibold text-royal-900 uppercase">
                      Confirmación y Detalles
                    </h2>
                    <BaroqueDivider />
                  </motion.header>

                  <div className="relative z-10 flex flex-col gap-6 sm:gap-7">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-7 items-stretch">
                      <RsvpFormCard savedRsvp={savedRsvp} onRsvpSaved={handleRsvpSaved} />
                      <GiftsCard />
                    </div>

                    <SongSuggestionCard
                      savedRsvp={savedRsvp}
                      onGoToRsvp={handleFocusRsvpForm}
                    />
                  </div>

                  <div className="relative z-10 pt-4">
                    <ClosingFooter onShowEnvelope={handleShowEnvelope} />
                  </div>
                </section>
              </main>

              <RoyalScrollRail
                activeSection={activeSection}
                onSelectSection={selectSection}
              />
              <FloatingAudioButton isPlaying={isPlaying} onToggleMusic={togglePlay} />
            </motion.div>
          )}
        </AnimatePresence>
      </MotionConfig>
    </ErrorBoundary>
  );
}
