import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, ArrowUpRight, Check, Loader2, Lock, Music, UserCheck } from 'lucide-react';
import { IMAGES, WEDDING_DETAILS } from '../data/weddingData.js';
import {
  addSongSuggestion,
  parseStoredSongs,
  validateSongSuggestion,
} from '../utils/weddingLogic.js';
import { submitSongToDrive } from '../services/driveSheets.js';
import { EnchantedCharacter } from './EnchantedCharacter.jsx';

function loadSavedSongs(storageKey, maxSongs) {
  if (typeof window === 'undefined') return [];
  try {
    return parseStoredSongs(window.localStorage.getItem(storageKey), maxSongs);
  } catch {
    return [];
  }
}

export function SongSuggestionCard({ savedRsvp = null, onGoToRsvp }) {
  const { rsvp, characters } = WEDDING_DETAILS;
  const maxSongs = rsvp.maxSongsPerGuest || 5;
  const confirmedGuestName = savedRsvp?.guestName || '';
  const isUnlocked = Boolean(confirmedGuestName);

  const [songInput, setSongInput] = useState('');
  const [botTrap, setBotTrap] = useState('');
  const [suggestedSongs, setSuggestedSongs] = useState(() =>
    loadSavedSongs(rsvp.songsStorageKey, maxSongs)
  );
  const [feedback, setFeedback] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const limitReached = suggestedSongs.length >= maxSongs;

  const persistSongs = (nextSongs) => {
    try {
      window.localStorage.setItem(rsvp.songsStorageKey, JSON.stringify(nextSongs));
    } catch {
      // Ignorar cuota de almacenamiento
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (submitting || !isUnlocked) return;

    if (limitReached) {
      setError(`Ya alcanzaste el máximo de ${maxSongs} canciones sugeridas.`);
      setFeedback('');
      return;
    }

    const check = validateSongSuggestion(songInput);
    if (!check.valid) {
      setError(check.error);
      setFeedback('');
      return;
    }

    const preview = addSongSuggestion(suggestedSongs, check.trimmed, maxSongs);
    if (preview.duplicate) {
      setError('Ya sugeriste esa misma canción anteriormente.');
      setFeedback('');
      return;
    }
    if (preview.limitReached || !preview.added) {
      setError(`Ya alcanzaste el máximo de ${maxSongs} canciones sugeridas.`);
      setFeedback('');
      return;
    }

    setError('');
    setFeedback('');
    setSubmitting(true);

    const response = await submitSongToDrive({
      song: check.trimmed,
      guestName: confirmedGuestName,
      website: botTrap,
    });
    setSubmitting(false);

    if (!response.ok) {
      setError(response.error || 'No pudimos guardar la canción. Intenta nuevamente.');
      return;
    }

    setSuggestedSongs(preview.songs);
    setFeedback(`¡Anotamos "${preview.added}" a nombre de ${confirmedGuestName}!`);
    setSongInput('');
    persistSongs(preview.songs);
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 26, scale: 0.98 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, amount: 'some' }}
      transition={{ duration: 0.55, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -3 }}
      aria-label="Sugerencia Musical"
      className="enchanted-card w-full bg-surface-container border border-outline rounded-2xl p-5 sm:p-6 shadow-sm flex flex-col gap-4"
    >
      <div className="flex items-center justify-between gap-3">
        <div className="text-left">
          <h3 className="font-headline text-[16px] sm:text-[17px] leading-5.5 tracking-[1px] font-semibold text-ink">
            ¿Qué canción no puede faltar?
          </h3>
          <p className="font-body text-[13px] leading-4.75 text-ink-muted mt-0.5">
            Ayúdanos a armar la playlist del gran baile
          </p>
        </div>
        <EnchantedCharacter
          src={IMAGES.chip}
          alt={characters.chip.alt}
          quote={characters.chip.quote}
          idleAnimation="float"
          bubbleAlign="right"
          imgClassName="w-13 h-15 sm:w-14 sm:h-16 object-contain"
        />
      </div>

      {!isUnlocked ? (
        <div className="rounded-xl bg-ivory-50 border border-outline-variant p-4 flex flex-col items-center text-center gap-3">
          <div className="w-10 h-10 rounded-full bg-ivory-200/80 border border-outline flex items-center justify-center text-gold-dark">
            <Lock className="w-4.5 h-4.5" aria-hidden="true" />
          </div>
          <div className="flex flex-col gap-1">
            <p className="font-headline text-[13px] leading-4.75 tracking-[0.6px] font-semibold text-ink">
              Primero confirma tus datos
            </p>
            <p className="font-body text-[12px] leading-4.75 text-ink-muted">
              Para recomendar música debes registrar tu nombre y apellido en{' '}
              <strong className="font-semibold text-ink">Confirmación de Asistencia</strong> (no se
              admiten sugerencias anónimas).
            </p>
          </div>
          <motion.button
            type="button"
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.97 }}
            onClick={onGoToRsvp}
            className="btn-gold w-full min-h-11 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-label text-[11px] leading-4 tracking-[1px] font-semibold uppercase cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-dark focus-visible:ring-offset-2 focus-visible:ring-offset-ivory-50"
          >
            <span>Ir a confirmar mis datos</span>
            <ArrowUpRight className="w-4 h-4 shrink-0" aria-hidden="true" />
          </motion.button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-3">
          {/* Campo honeypot invisible anti-bots */}
          <input
            type="text"
            name="website"
            tabIndex={-1}
            autoComplete="off"
            aria-hidden="true"
            value={botTrap}
            onChange={(e) => setBotTrap(e.target.value)}
            className="hidden"
          />

          <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-ivory-50 border border-outline-variant px-3 py-2">
            <span className="inline-flex items-center gap-1.5 font-body text-[12px] leading-4 text-ink min-w-0">
              <UserCheck className="w-3.5 h-3.5 text-success shrink-0" aria-hidden="true" />
              <span className="truncate">
                Sugiriendo como <strong className="font-semibold">{confirmedGuestName}</strong>
              </span>
            </span>
            <span className="font-label text-[11px] leading-4 tracking-[0.5px] font-semibold text-gold-dark tabular-nums shrink-0">
              {suggestedSongs.length} / {maxSongs}
            </span>
          </div>

          <div className="flex flex-col gap-1.5">
            <input
              type="text"
              maxLength={100}
              autoCapitalize="sentences"
              enterKeyHint="done"
              disabled={submitting || limitReached}
              aria-label="Nombre del tema y artista"
              aria-invalid={Boolean(error)}
              value={songInput}
              onChange={(e) => {
                setSongInput(e.target.value);
                if (error) setError('');
              }}
              placeholder={
                limitReached
                  ? `Llegaste al límite de ${maxSongs} canciones`
                  : 'Nombre del tema y artista'
              }
              className="w-full min-h-11 rounded-xl bg-ivory-50 border border-outline-variant px-4 py-2.5 font-body text-[16px] lg:text-[14px] leading-5 text-ink placeholder:text-ink-muted focus:border-gold-dark focus:ring-2 focus:ring-gold/35 outline-none transition-shadow disabled:opacity-60"
            />
            {error && (
              <span
                role="alert"
                className="inline-flex items-center gap-1.5 font-body text-[12px] text-error font-medium text-left"
              >
                <AlertCircle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                <span>{error}</span>
              </span>
            )}
          </div>

          <motion.button
            type="submit"
            disabled={submitting || limitReached}
            whileHover={submitting || limitReached ? undefined : { y: -1 }}
            whileTap={submitting || limitReached ? undefined : { scale: 0.97 }}
            className="btn-gold w-full min-h-11.5 inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl uppercase cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-dark focus-visible:ring-offset-2 focus-visible:ring-offset-surface-container"
          >
            {submitting ? (
              <Loader2 className="w-4 h-4 shrink-0 animate-spin" aria-hidden="true" />
            ) : (
              <Music className="w-4 h-4 shrink-0" aria-hidden="true" />
            )}
            <span className="font-label text-[12px] leading-4 tracking-[1.2px] font-semibold whitespace-nowrap">
              {submitting
                ? 'Enviando canción...'
                : limitReached
                  ? 'Límite alcanzado'
                  : 'Sugerir Canción'}
            </span>
          </motion.button>

          <AnimatePresence>
            {feedback && (
              <motion.p
                key={feedback}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                role="status"
                className="font-body text-[13px] leading-4.5 text-success font-medium text-center"
              >
                {feedback}
              </motion.p>
            )}
          </AnimatePresence>
        </form>
      )}

      {isUnlocked && suggestedSongs.length > 0 && (
        <div className="pt-3 border-t border-outline-variant text-left flex flex-col gap-2">
          <p className="font-label text-[11px] tracking-[0.8px] uppercase font-semibold text-ink-muted">
            Canciones enviadas por ti
          </p>
          <ul className="flex flex-col gap-1.5">
            <AnimatePresence initial={false}>
              {suggestedSongs.map((song) => (
                <motion.li
                  key={song}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 8 }}
                  transition={{ duration: 0.22 }}
                  className="font-body text-[13px] text-ink flex items-center justify-between gap-2"
                >
                  <span className="flex items-center gap-2 min-w-0">
                    <Check className="w-3.5 h-3.5 text-success shrink-0" aria-hidden="true" />
                    <span className="truncate">{song}</span>
                  </span>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        </div>
      )}
    </motion.section>
  );
}
