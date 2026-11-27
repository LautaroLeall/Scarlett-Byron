import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertCircle,
  CalendarClock,
  CheckCircle2,
  Info,
  Loader2,
  MailCheck,
  RefreshCw,
  Send,
} from 'lucide-react';
import { WEDDING_DETAILS } from '../data/weddingData.js';
import {
  hasRsvpChanged,
  normalizeCompanions,
  validateRsvpForm,
} from '../utils/weddingLogic.js';
import { submitRsvpToDrive } from '../services/driveSheets.js';
import { fireRoyalConfetti } from '../utils/confetti.js';
import { RsvpCompanionsSection } from './RsvpCompanionsSection.jsx';

function resizeCompanionList(list, count) {
  return Array.from({ length: count }, (_, idx) => list[idx] || '');
}

export function RsvpFormCard({ savedRsvp = null, onRsvpSaved }) {
  const { rsvp, coupleNames } = WEDDING_DETAILS;

  const [guestName, setGuestName] = useState(() => savedRsvp?.guestName || '');
  const [attending, setAttending] = useState(() =>
    savedRsvp ? Boolean(savedRsvp.attending) : true
  );
  const [companionsInput, setCompanionsInput] = useState(() =>
    String(savedRsvp?.companions ?? 0)
  );
  const [companionNames, setCompanionNames] = useState(() =>
    Array.isArray(savedRsvp?.companionNames) ? savedRsvp.companionNames : []
  );
  const [message, setMessage] = useState(() => savedRsvp?.message || '');
  const [botTrap, setBotTrap] = useState('');
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [unchangedNotice, setUnchangedNotice] = useState('');

  const currentCompanions = normalizeCompanions(companionsInput, rsvp.maxGuests);
  const visibleCompanionNames = resizeCompanionList(companionNames, currentCompanions);

  const clearNotices = () => {
    if (submitError) setSubmitError('');
    if (unchangedNotice) setUnchangedNotice('');
  };

  const syncCompanionCount = (nextCount) => {
    setCompanionNames((prev) =>
      nextCount > prev.length ? resizeCompanionList(prev, nextCount) : prev
    );
    setErrors((prev) => ({
      ...prev,
      companions: undefined,
      companionNames: Array.isArray(prev.companionNames)
        ? prev.companionNames.slice(0, nextCount)
        : undefined,
    }));
  };

  const stepCompanions = (delta) => {
    const next = Math.max(0, Math.min(rsvp.maxGuests, currentCompanions + delta));
    setCompanionsInput(String(next));
    syncCompanionCount(next);
    clearNotices();
  };

  const handleCompanionNameChange = (index, value) => {
    setCompanionNames((prev) => {
      const next = resizeCompanionList(prev, Math.max(prev.length, currentCompanions));
      next[index] = value;
      return next;
    });
    if (errors.companionNames?.[index]) {
      setErrors((prev) => {
        if (!Array.isArray(prev.companionNames)) return prev;
        const nextErrs = [...prev.companionNames];
        nextErrs[index] = undefined;
        return {
          ...prev,
          companionNames: nextErrs.some(Boolean) ? nextErrs : undefined,
        };
      });
    }
    clearNotices();
  };

  const handleSelectAttendance = (nextAttending) => {
    setAttending(nextAttending);
    if (!nextAttending) {
      setErrors((prev) => ({
        ...prev,
        companions: undefined,
        companionNames: undefined,
      }));
    }
    clearNotices();
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (submitting) return;

    const validation = validateRsvpForm(
      {
        guestName,
        attending,
        companions: companionsInput,
        companionNames: visibleCompanionNames,
        message,
      },
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
      companionNames: attending ? validation.companionNames : [],
      message: message.trim(),
    };

    if (savedRsvp && !hasRsvpChanged(savedRsvp, candidate)) {
      setErrors({});
      setSubmitError('');
      setUnchangedNotice(
        'Tu confirmación ya está guardada con estos mismos datos. Si deseas modificar algo, edita un campo y vuelve a guardar.'
      );
      return;
    }

    setErrors({});
    setSubmitError('');
    setUnchangedNotice('');
    setCompanionsInput(String(validation.companions));
    setCompanionNames(candidate.companionNames);
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
      className="enchanted-card relative overflow-hidden w-full h-full bg-surface-container border border-outline rounded-2xl p-6 sm:p-7 flex flex-col gap-5"
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-linear-to-r from-royal-900 via-gold to-crimson"
      />
      <div className="text-center flex flex-col items-center gap-2 pt-1">
        <div className="w-13 h-13 rounded-full border border-gold shrink-0 shadow-xs bg-royal-900 flex items-center justify-center">
          <MailCheck className="w-6 h-6 text-champagne" aria-hidden="true" />
        </div>
        <div className="flex flex-col items-center gap-0.5">
          <span className="font-label text-[10px] leading-3.5 tracking-[2px] font-semibold uppercase text-gold-dark">
            Tu respuesta
          </span>
          <h3 className="font-headline text-[17px] sm:text-[18px] leading-5.5 tracking-[1.1px] font-semibold text-royal-900">
            Confirmación de Asistencia
          </h3>
        </div>
        <span className="mt-0.5 inline-flex items-center gap-1.5 rounded-full bg-ivory-100 border border-outline/75 px-3.5 py-1 font-label text-[11px] leading-4 tracking-[0.6px] font-semibold text-royal-900">
          <CalendarClock className="w-3.5 h-3.5 text-crimson shrink-0" aria-hidden="true" />
          Confirmar hasta el {rsvp.deadline}
        </span>
        <p className="font-body text-[13px] leading-5 text-ink-muted text-pretty max-w-md">
          Tu presencia es nuestro mejor regalo. Por favor, confirma tu asistencia hasta el{' '}
          <strong className="text-ink font-semibold">{rsvp.deadline}</strong>.
        </p>
      </div>

      <form onSubmit={handleSubmit} noValidate className="flex-1 flex flex-col justify-between gap-5">
        <div className="flex flex-col gap-4">
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
            <RsvpCompanionsSection
              companionsInput={companionsInput}
              currentCompanions={currentCompanions}
              maxGuests={rsvp.maxGuests}
              companionNames={visibleCompanionNames}
              companionsError={errors.companions}
              companionNameErrors={errors.companionNames}
              submitting={submitting}
              onStepCompanions={stepCompanions}
              onCompanionsInputChange={(rawValue) => {
                const digits = rawValue.replace(/\D/g, '').slice(0, 2);
                setCompanionsInput(digits);
                syncCompanionCount(normalizeCompanions(digits, rsvp.maxGuests));
                clearNotices();
              }}
              onCompanionsInputBlur={() => setCompanionsInput(String(currentCompanions))}
              onCompanionNameChange={handleCompanionNameChange}
            />
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
        </div>

        <div className="flex flex-col gap-3">
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
                    ? `¡Listo, ${savedRsvp.guestName}! Actualizamos tu confirmación (`
                    : `¡Gracias, ${savedRsvp.guestName}! Tu respuesta quedó guardada en nuestra lista (`}
                  {savedRsvp.attending
                    ? savedRsvp.companions > 0
                      ? `Asistirá + ${savedRsvp.companions} acomp.`
                      : 'Asistirá'
                    : 'No asistirá'}
                  ).
                </p>
                {savedRsvp.attending && savedRsvp.companionNames?.length > 0 && (
                  <p className="font-body text-[12px] leading-4.5 text-ink-muted">
                    <strong className="font-semibold text-ink">Acompañantes:</strong>{' '}
                    {savedRsvp.companionNames.join(', ')}
                  </p>
                )}
                <p className="font-body text-[12px] leading-4.5 text-ink-muted">
                  Ya tienes habilitada la sección de música con tu nombre.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </form>
    </motion.section>
  );
}
