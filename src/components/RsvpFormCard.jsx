import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertCircle,
  CheckCircle2,
  Info,
  Loader2,
  Minus,
  Plus,
  RefreshCw,
  Send,
  Users,
} from 'lucide-react';
import { WEDDING_DETAILS } from '../data/weddingData.js';
import {
  hasRsvpChanged,
  normalizeCompanions,
  validateRsvpForm,
} from '../utils/weddingLogic.js';
import { submitRsvpToDrive } from '../services/driveSheets.js';
import { fireRoyalConfetti } from '../utils/confetti.js';

export function RsvpFormCard({ savedRsvp = null, onRsvpSaved }) {
  const { rsvp, coupleNames } = WEDDING_DETAILS;

  const [guestName, setGuestName] = useState(() => savedRsvp?.guestName || '');
  const [attending, setAttending] = useState(() =>
    savedRsvp ? Boolean(savedRsvp.attending) : true
  );
  const [companionsInput, setCompanionsInput] = useState(() =>
    String(savedRsvp?.companions ?? 0)
  );
  const [dietNotes, setDietNotes] = useState(() => savedRsvp?.dietNotes || '');
  const [message, setMessage] = useState(() => savedRsvp?.message || '');
  const [botTrap, setBotTrap] = useState('');
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [unchangedNotice, setUnchangedNotice] = useState('');

  const currentCompanions = normalizeCompanions(companionsInput, rsvp.maxGuests);

  const clearNotices = () => {
    if (submitError) setSubmitError('');
    if (unchangedNotice) setUnchangedNotice('');
  };

  const stepCompanions = (delta) => {
    const next = Math.max(0, Math.min(rsvp.maxGuests, currentCompanions + delta));
    setCompanionsInput(String(next));
    if (errors.companions) setErrors((prev) => ({ ...prev, companions: undefined }));
    clearNotices();
  };

  const handleSelectAttendance = (nextAttending) => {
    setAttending(nextAttending);
    if (!nextAttending) {
      setErrors((prev) => ({ ...prev, companions: undefined, dietNotes: undefined }));
    }
    clearNotices();
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (submitting) return;

    const validation = validateRsvpForm(
      { guestName, attending, companions: companionsInput, dietNotes, message },
      rsvp.maxGuests
    );

    if (!validation.valid) {
      setErrors(validation.errors);
      setUnchangedNotice('');
      return;
    }

    const candidate = {
      guestName: validation.trimmedName,
      attending,
      companions: attending ? validation.companions : 0,
      dietNotes: attending ? dietNotes.trim() : '',
      message: message.trim(),
    };

    if (savedRsvp && !hasRsvpChanged(savedRsvp, candidate)) {
      setErrors({});
      setSubmitError('');
      setUnchangedNotice(
        'Tu confirmación ya está guardada con estos mismos datos. Si deseas cambiar algo, edita un campo y vuelve a guardar.'
      );
      return;
    }

    setErrors({});
    setSubmitError('');
    setUnchangedNotice('');
    setCompanionsInput(String(validation.companions));
    setSubmitting(true);

    const result = await submitRsvpToDrive({
      ...candidate,
      previousGuestName: savedRsvp?.guestName || '',
      website: botTrap,
    });
    setSubmitting(false);

    if (!result.ok) {
      setSubmitError(result.error || 'No pudimos guardar tu confirmación. Intenta nuevamente.');
      return;
    }

    const savedRecord = {
      ...candidate,
      submittedAt: new Date().toISOString(),
      action: result.action === 'updated' ? 'updated' : 'created',
      syncMode: result.mode,
    };

    if (typeof onRsvpSaved === 'function') {
      onRsvpSaved(savedRecord);
    }

    if (savedRecord.attending) {
      fireRoyalConfetti({ origin: { y: 0.72 } });
    }
  };

  const isUpdateMode = Boolean(savedRsvp);

  return (
    <motion.section
      initial={{ opacity: 0, y: 26, scale: 0.98 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, amount: 'some' }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      aria-label="Confirmación de Asistencia"
      className="enchanted-card w-full bg-surface-container border border-outline rounded-2xl p-5 sm:p-6 shadow-sm flex flex-col gap-5"
    >
      <div className="text-center flex flex-col gap-1.5">
        <h3 className="font-headline text-[16px] sm:text-[17px] leading-5.5 tracking-[1px] font-semibold text-ink">
          Confirmación de Asistencia
        </h3>
        <p className="font-body text-[13px] leading-5 text-ink-muted">
          Tu presencia es nuestro mejor regalo. Por favor, confirma antes del{' '}
          <strong className="text-ink font-semibold">{rsvp.deadline}</strong>. Si ya confirmaste y
          necesitas hacer un cambio, actualizaremos tu registro automáticamente sin duplicarte.
        </p>
      </div>

      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
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

        <label htmlFor="rsvp-guest-name" className="flex flex-col gap-1.5">
          <span className="font-label text-[11px] leading-3.5 tracking-[0.8px] font-semibold text-ink">
            Nombre y Apellido completo
          </span>
          <input
            id="rsvp-guest-name"
            type="text"
            required
            maxLength={80}
            autoComplete="name"
            autoCapitalize="words"
            enterKeyHint="next"
            disabled={submitting}
            value={guestName}
            onChange={(e) => {
              setGuestName(e.target.value);
              if (errors.guestName) setErrors((prev) => ({ ...prev, guestName: undefined }));
              clearNotices();
            }}
            placeholder="Ej. Camila Rojas"
            aria-invalid={Boolean(errors.guestName)}
            className="w-full min-h-11 rounded-xl bg-ivory-50 border border-outline-variant px-4 py-2.5 font-body text-[16px] lg:text-[14px] leading-5 text-ink placeholder:text-ink-muted focus:border-gold-dark focus:ring-2 focus:ring-gold/35 outline-none transition-shadow disabled:opacity-60"
          />
          {errors.guestName && (
            <span role="alert" className="font-body text-[12px] text-error font-medium">
              {errors.guestName}
            </span>
          )}
        </label>

        <div className="flex flex-col gap-1.5">
          <span className="font-label text-[11px] leading-3.5 tracking-[0.8px] font-semibold text-ink">
            ¿Asistirás?
          </span>
          <div
            className="grid grid-cols-2 gap-1.5 sm:gap-2 p-1 rounded-xl bg-ivory-100 border border-outline-variant"
            role="radiogroup"
            aria-label="¿Asistirás?"
          >
            <button
              type="button"
              role="radio"
              aria-checked={attending}
              disabled={submitting}
              onClick={() => handleSelectAttendance(true)}
              className={`relative min-h-11 py-2 px-2 sm:px-3 rounded-lg font-label text-[11px] sm:text-[12px] leading-4 tracking-[0.3px] sm:tracking-[0.4px] transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-dark ${attending ? 'text-ink font-semibold' : 'text-ink-muted hover:text-ink'
                }`}
            >
              {attending && (
                <motion.span
                  layoutId="rsvpToggleHighlight"
                  transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                  className="absolute inset-0 rounded-lg bg-ivory-50 border border-gold-dark shadow-xs"
                />
              )}
              <span className="relative z-10 text-center">¡Sí, asistiré!</span>
            </button>
            <button
              type="button"
              role="radio"
              aria-checked={!attending}
              disabled={submitting}
              onClick={() => handleSelectAttendance(false)}
              className={`relative min-h-11 py-2 px-2 sm:px-3 rounded-lg font-label text-[11px] sm:text-[12px] leading-4 tracking-[0.3px] sm:tracking-[0.4px] transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-dark ${!attending ? 'text-ink font-semibold' : 'text-ink-muted hover:text-ink'
                }`}
            >
              {!attending && (
                <motion.span
                  layoutId="rsvpToggleHighlight"
                  transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                  className="absolute inset-0 rounded-lg bg-ivory-50 border border-gold-dark shadow-xs"
                />
              )}
              <span className="relative z-10 text-center">No podré asistir</span>
            </button>
          </div>
        </div>

        {attending && (
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
            <div className="sm:col-span-5 flex flex-col gap-1.5">
              <label
                htmlFor="rsvp-companions"
                className="inline-flex items-center gap-1 font-label text-[11px] leading-3.5 tracking-[0.8px] font-semibold text-ink"
              >
                <Users className="w-3.5 h-3.5 text-primary shrink-0" aria-hidden="true" />
                Acompañantes
              </label>
              <div className="flex items-center rounded-xl bg-ivory-50 border border-outline-variant overflow-hidden min-h-11 focus-within:border-gold-dark focus-within:ring-2 focus-within:ring-gold/35">
                <button
                  type="button"
                  onClick={() => stepCompanions(-1)}
                  disabled={submitting || currentCompanions <= 0}
                  aria-label="Restar acompañante"
                  className="w-11 h-11 shrink-0 flex items-center justify-center text-ink hover:bg-ivory-200/70 disabled:opacity-35 disabled:cursor-not-allowed cursor-pointer transition-colors"
                >
                  <Minus className="w-4 h-4" aria-hidden="true" />
                </button>
                <input
                  id="rsvp-companions"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  enterKeyHint="next"
                  disabled={submitting}
                  value={companionsInput}
                  onChange={(e) => {
                    const digits = e.target.value.replace(/\D/g, '').slice(0, 2);
                    setCompanionsInput(digits);
                    if (errors.companions) setErrors((prev) => ({ ...prev, companions: undefined }));
                    clearNotices();
                  }}
                  onBlur={() => setCompanionsInput(String(currentCompanions))}
                  aria-invalid={Boolean(errors.companions)}
                  className="w-full min-w-0 bg-transparent py-2 text-center font-body text-[16px] lg:text-[14px] leading-5 font-semibold text-ink tabular-nums outline-none"
                />
                <button
                  type="button"
                  onClick={() => stepCompanions(1)}
                  disabled={submitting || currentCompanions >= rsvp.maxGuests}
                  aria-label="Sumar acompañante"
                  className="w-11 h-11 shrink-0 flex items-center justify-center text-ink hover:bg-ivory-200/70 disabled:opacity-35 disabled:cursor-not-allowed cursor-pointer transition-colors"
                >
                  <Plus className="w-4 h-4" aria-hidden="true" />
                </button>
              </div>
              {errors.companions && (
                <span role="alert" className="font-body text-[12px] text-error font-medium">
                  {errors.companions}
                </span>
              )}
            </div>

            <label className="sm:col-span-7 flex flex-col gap-1.5">
              <span className="font-label text-[11px] leading-3.5 tracking-[0.8px] font-semibold text-ink">
                Restricciones alimentarias
              </span>
              <input
                type="text"
                maxLength={160}
                autoCapitalize="sentences"
                enterKeyHint="next"
                disabled={submitting}
                value={dietNotes}
                onChange={(e) => {
                  setDietNotes(e.target.value);
                  clearNotices();
                }}
                placeholder="Celíaco, Vegetariano, Alergias"
                className="w-full min-h-11 rounded-xl bg-ivory-50 border border-outline-variant px-4 py-2.5 font-body text-[16px] lg:text-[14px] leading-5 text-ink placeholder:text-ink-muted focus:border-gold-dark focus:ring-2 focus:ring-gold/35 outline-none transition-shadow disabled:opacity-60"
              />
            </label>
          </div>
        )}

        <label className="flex flex-col gap-1.5">
          <span className="font-label text-[11px] leading-3.5 tracking-[0.8px] font-semibold text-ink">
            Saludo o mensaje para los novios (opcional)
          </span>
          <input
            type="text"
            maxLength={260}
            autoCapitalize="sentences"
            enterKeyHint="send"
            disabled={submitting}
            value={message}
            onChange={(e) => {
              setMessage(e.target.value);
              clearNotices();
            }}
            placeholder={`Un deseo especial para ${coupleNames}...`}
            className="w-full min-h-11 rounded-xl bg-ivory-50 border border-outline-variant px-4 py-2.5 font-body text-[16px] lg:text-[14px] leading-5 text-ink placeholder:text-ink-muted focus:border-gold-dark focus:ring-2 focus:ring-gold/35 outline-none transition-shadow disabled:opacity-60"
          />
        </label>

        <motion.button
          type="submit"
          disabled={submitting}
          whileHover={submitting ? undefined : { y: -1 }}
          whileTap={submitting ? undefined : { scale: 0.97 }}
          className="btn-gold w-full min-h-12 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl uppercase cursor-pointer disabled:opacity-70 disabled:cursor-wait focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-dark focus-visible:ring-offset-2 focus-visible:ring-offset-surface-container"
        >
          {submitting ? (
            <Loader2 className="w-4 h-4 shrink-0 animate-spin" aria-hidden="true" />
          ) : isUpdateMode ? (
            <RefreshCw className="w-4 h-4 shrink-0" aria-hidden="true" />
          ) : (
            <Send className="w-4 h-4 shrink-0" aria-hidden="true" />
          )}
          <span className="font-label text-[12px] leading-4 tracking-[1.2px] font-semibold whitespace-nowrap">
            {submitting
              ? 'Guardando respuesta...'
              : isUpdateMode
                ? 'Actualizar Confirmación'
                : 'Confirmar Asistencia'}
          </span>
        </motion.button>

        <AnimatePresence>
          {submitError && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              role="alert"
              className="rounded-xl bg-crimson/5 border border-crimson/40 p-3 flex items-center justify-center gap-2 text-center"
            >
              <AlertCircle className="w-4 h-4 text-error shrink-0" aria-hidden="true" />
              <p className="font-body text-[12px] leading-4.5 text-error font-medium">
                {submitError}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {unchangedNotice && !submitError && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              role="status"
              className="rounded-xl bg-ivory-50 border border-outline p-3 flex items-center justify-center gap-2 text-center"
            >
              <Info className="w-4 h-4 text-gold-dark shrink-0" aria-hidden="true" />
              <p className="font-body text-[12px] leading-4.5 text-ink-muted font-medium">
                {unchangedNotice}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {savedRsvp && !submitError && (
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.25 }}
              role="status"
              className="rounded-xl bg-ivory-50 border border-success/45 p-3.5 flex flex-col items-center gap-1.5 text-center"
            >
              <div className="inline-flex items-center gap-1.5 text-success">
                <CheckCircle2 className="w-4 h-4 shrink-0" aria-hidden="true" />
                <span className="font-label text-[11px] tracking-[0.8px] uppercase font-semibold">
                  {savedRsvp.action === 'updated'
                    ? 'Confirmación actualizada'
                    : 'Confirmación registrada'}
                </span>
              </div>
              <p className="font-body text-[13px] leading-5 text-ink font-medium">
                {savedRsvp.action === 'updated'
                  ? `¡Listo, ${savedRsvp.guestName}! Actualizamos tu registro sin duplicarte (`
                  : `¡Gracias, ${savedRsvp.guestName}! Tu respuesta quedó guardada en nuestra lista (`}
                {savedRsvp.attending
                  ? savedRsvp.companions > 0
                    ? `Asistirá + ${savedRsvp.companions} acomp.`
                    : 'Asistirá'
                  : 'No asistirá'}
                ).
              </p>
              <p className="font-body text-[12px] leading-4.5 text-ink-muted">
                Ya tienes habilitada la sección de música con tu nombre.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </form>
    </motion.section>
  );
}
