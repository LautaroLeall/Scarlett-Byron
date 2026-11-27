import { motion, AnimatePresence } from 'framer-motion';
import { Minus, Plus, Users } from 'lucide-react';

export function RsvpCompanionsSection({
  companionsInput,
  currentCompanions,
  maxGuests,
  companionNames,
  companionsError,
  companionNameErrors,
  submitting,
  onStepCompanions,
  onCompanionsInputChange,
  onCompanionsInputBlur,
  onCompanionNameChange,
}) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="rsvp-companions"
          className="inline-flex items-center gap-1.5 font-label text-[11px] leading-3.5 tracking-[0.8px] font-semibold text-ink"
        >
          <Users className="w-3.5 h-3.5 text-primary shrink-0" aria-hidden="true" />
          <span>Cantidad de acompañantes</span>
          <span className="font-body text-[11px] font-normal text-ink-muted">
            (máx. {maxGuests})
          </span>
        </label>
        <div className="w-full sm:max-w-52 flex items-center rounded-xl bg-ivory-50 border border-outline-variant overflow-hidden min-h-11 focus-within:border-gold-dark focus-within:ring-2 focus-within:ring-gold/35">
          <button
            type="button"
            onClick={() => onStepCompanions(-1)}
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
            pattern={`[0-${maxGuests}]`}
            maxLength={maxGuests < 10 ? 1 : 2}
            enterKeyHint="next"
            disabled={submitting}
            value={companionsInput}
            onChange={(e) => onCompanionsInputChange(e.target.value)}
            onBlur={onCompanionsInputBlur}
            aria-invalid={Boolean(companionsError)}
            aria-valuemin={0}
            aria-valuemax={maxGuests}
            aria-valuenow={currentCompanions}
            className="w-full min-w-0 bg-transparent py-2 text-center font-body text-[16px] lg:text-[14px] leading-5 font-semibold text-ink tabular-nums outline-none"
          />
          <button
            type="button"
            onClick={() => onStepCompanions(1)}
            disabled={submitting || currentCompanions >= maxGuests}
            aria-label="Sumar acompañante"
            className="w-11 h-11 shrink-0 flex items-center justify-center text-ink hover:bg-ivory-200/70 disabled:opacity-35 disabled:cursor-not-allowed cursor-pointer transition-colors"
          >
            <Plus className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>
        <p className="font-body text-[12px] leading-4.5 text-ink-muted">
          {currentCompanions >= maxGuests
            ? `Has alcanzado el máximo de ${maxGuests} acompañantes. Escribe el nombre y apellido completo de cada uno.`
            : currentCompanions > 0
              ? `Puedes sumar hasta ${maxGuests} acompañantes. Escribe el nombre y apellido completo de cada uno.`
              : `Puedes sumar hasta ${maxGuests} acompañantes e ingresar su nombre y apellido completo.`}
        </p>
      </div>

      {companionsError && (
        <span role="alert" className="font-body text-[12px] text-error font-medium">
          {companionsError}
        </span>
      )}

      <AnimatePresence initial={false}>
        {currentCompanions > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="rounded-xl bg-ivory-100/80 border border-outline-variant p-3.5 flex flex-col gap-3">
              <p className="font-label text-[11px] leading-4 tracking-[0.7px] font-semibold uppercase text-royal-900">
                Nombre completo de{' '}
                {currentCompanions === 1
                  ? 'tu acompañante'
                  : `tus ${currentCompanions} acompañantes`}{' '}
                <span className="text-crimson font-semibold">(obligatorio)</span>
              </p>

              <div className="flex flex-col gap-2.5">
                {companionNames.map((compValue, index) => {
                  const fieldError = companionNameErrors?.[index];
                  return (
                    <label
                      key={`companion-${index}`}
                      htmlFor={`rsvp-companion-${index}`}
                      className="flex flex-col gap-1"
                    >
                      <span className="font-label text-[11px] leading-3.5 tracking-[0.6px] font-semibold text-ink">
                        Acompañante {index + 1} — Nombre y apellido completo{' '}
                        <span aria-hidden="true" className="text-crimson">
                          *
                        </span>
                      </span>
                      <input
                        id={`rsvp-companion-${index}`}
                        type="text"
                        required
                        maxLength={80}
                        autoCapitalize="words"
                        enterKeyHint="next"
                        disabled={submitting}
                        value={compValue}
                        onChange={(e) => onCompanionNameChange(index, e.target.value)}
                        placeholder={`Ej. ${index % 2 === 0 ? 'Martín González' : 'Valentina Muñoz'}`}
                        aria-invalid={Boolean(fieldError)}
                        className="w-full min-h-11 rounded-xl bg-ivory-50 border border-outline-variant px-3.5 py-2 font-body text-[16px] lg:text-[14px] leading-5 text-ink placeholder:text-ink-muted focus:border-gold-dark focus:ring-2 focus:ring-gold/35 outline-none transition-shadow disabled:opacity-60"
                      />
                      {fieldError && (
                        <span role="alert" className="font-body text-[12px] text-error font-medium">
                          {fieldError}
                        </span>
                      )}
                    </label>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
