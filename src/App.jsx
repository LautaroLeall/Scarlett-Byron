import { useState } from 'react';
import { motion, AnimatePresence, MotionConfig } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { WEDDING_DETAILS } from './data/weddingData.js';
import { parseStoredRsvp } from './utils/weddingLogic.js';
import { useAudioPlayer } from './hooks/useAudioPlayer.js';
import { ErrorBoundary } from './components/ErrorBoundary.jsx';
import { EnvelopeGate } from './components/EnvelopeGate.jsx';
import { InvitationHeader } from './components/InvitationHeader.jsx';
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

export default function App() {
  const [viewMode, setViewMode] = useState(getInitialViewMode);
  const [envelopeOpened, setEnvelopeOpened] = useState(false);
  const [savedRsvp, setSavedRsvp] = useState(loadInitialRsvp);
  const { isPlaying, play, pause, togglePlay } = useAudioPlayer(WEDDING_DETAILS.audio.src);

  const handleRsvpSaved = (record) => {
    setSavedRsvp(record);
    try {
      window.localStorage.setItem(WEDDING_DETAILS.rsvp.storageKey, JSON.stringify(record));
    } catch {
      // Ignorar cuota de almacenamiento
    }
  };

  const handleFocusRsvpForm = () => {
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
    setViewMode('invitation');
    scrollToTopNow();
  };

  const handleEnterSilent = () => {
    pause();
    setEnvelopeOpened(false);
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
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              className="relative min-h-dvh w-full bg-ivory-200/45 text-on-surface flex flex-col"
            >
              <FloatingPetals />
              <InvitationHeader onShowEnvelope={handleShowEnvelope} />

              <main className="relative z-10 w-full max-w-5xl mx-auto flex-1 bg-ivory-100/95 border-x border-outline-variant px-4 sm:px-8 lg:px-12 pb-[max(5.5rem,calc(5rem+env(safe-area-inset-bottom)))] shadow-[0_0_40px_rgba(44,36,30,0.06)]">
                <HeroSection isPlaying={isPlaying} onToggleMusic={togglePlay} />

                <section
                  id="ceremonia"
                  aria-label="Ceremonia, Historia y Dress Code"
                  className="w-full flex flex-col gap-7 sm:gap-9 py-10 sm:py-14 border-t border-outline-variant scroll-mt-16"
                >
                  <EventLocationsSection />

                  <div
                    id="historia"
                    className="grid grid-cols-1 md:grid-cols-12 gap-5 sm:gap-6 items-stretch scroll-mt-20"
                  >
                    <StoryGallery />
                    <DressCodeCard />
                  </div>
                </section>

                <section
                  id="confirmar"
                  aria-label="Confirmación, Regalos y Cierre"
                  className="w-full flex flex-col gap-7 sm:gap-9 pt-10 sm:pt-14 pb-12 border-t border-outline-variant scroll-mt-16"
                >
                  <motion.header
                    initial={{ opacity: 0, y: 18 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 'some' }}
                    transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                    className="flex flex-col items-center text-center gap-2.5"
                  >
                    <h2 className="font-headline text-[22px] sm:text-[26px] leading-7.5 tracking-[1.4px] font-semibold text-ink uppercase">
                      Confirmación y Detalles
                    </h2>
                    <div className="w-full max-w-md flex items-center justify-center gap-4" aria-hidden="true">
                      <span className="h-px flex-1 bg-linear-to-r from-transparent via-outline to-outline-variant" />
                      <Sparkles className="w-4 h-4 text-primary" />
                      <span className="h-px flex-1 bg-linear-to-l from-transparent via-outline to-outline-variant" />
                    </div>
                  </motion.header>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6 items-start">
                    <RsvpFormCard savedRsvp={savedRsvp} onRsvpSaved={handleRsvpSaved} />
                    <div className="flex flex-col gap-5 sm:gap-6">
                      <GiftsCard />
                      <SongSuggestionCard
                        savedRsvp={savedRsvp}
                        onGoToRsvp={handleFocusRsvpForm}
                      />
                    </div>
                  </div>

                  <ClosingFooter onShowEnvelope={handleShowEnvelope} />
                </section>
              </main>

              <FloatingAudioButton isPlaying={isPlaying} onToggleMusic={togglePlay} />
            </motion.div>
          )}
        </AnimatePresence>
      </MotionConfig>
    </ErrorBoundary>
  );
}
