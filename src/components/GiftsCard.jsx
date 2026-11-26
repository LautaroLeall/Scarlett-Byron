import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Copy, Check } from 'lucide-react';
import { IMAGES, WEDDING_DETAILS } from '../data/weddingData.js';
import { copyToClipboard } from '../utils/clipboard.js';
import { ResilientImage } from './ResilientImage.jsx';

export function GiftsCard() {
  const { gifts, monogram } = WEDDING_DETAILS;
  const [copiedField, setCopiedField] = useState(null);
  const timerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    };
  }, []);

  const handleCopy = async (value, field) => {
    const ok = await copyToClipboard(value);
    if (!ok) return;
    setCopiedField(field);
    if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => {
      setCopiedField((current) => (current === field ? null : current));
      timerRef.current = null;
    }, 2400);
  };

  const accountValue = gifts.accountNumber || gifts.cbu || '';
  const accountLabel = gifts.cbu ? 'CBU' : 'N° de Cuenta';

  const copyActions = [
    gifts.alias
      ? { id: 'alias', value: gifts.alias, label: 'Copiar Alias', copiedLabel: '¡Alias Copiado!' }
      : null,
    accountValue
      ? {
        id: 'account',
        value: accountValue,
        label: 'Copiar Cuenta',
        copiedLabel: '¡Cuenta Copiada!',
      }
      : null,
    gifts.rut
      ? { id: 'rut', value: gifts.rut, label: 'Copiar RUT', copiedLabel: '¡RUT Copiado!' }
      : null,
  ].filter(Boolean);

  return (
    <motion.article
      initial={{ opacity: 0, y: 26, scale: 0.98 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, amount: 'some' }}
      transition={{ duration: 0.55, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -3 }}
      className="enchanted-card w-full bg-surface-container border border-outline rounded-2xl p-5 sm:p-6 shadow-sm flex flex-col gap-4"
    >
      <div className="flex items-center gap-3.5">
        <div className="w-12 h-12 rounded-full overflow-hidden border border-gold shrink-0 shadow-xs bg-ivory-50 p-0.5">
          <ResilientImage
            src={IMAGES.waxSeal}
            alt="Sello de lacre dorado"
            fallbackLabel={monogram}
            className="w-full h-full object-contain"
          />
        </div>
        <div>
          <h3 className="font-headline text-[16px] sm:text-[17px] leading-5.5 tracking-[1px] font-semibold text-ink">
            {gifts.title}
          </h3>
          <p className="font-body text-[13px] leading-4.75 text-ink-muted mt-0.5">
            {gifts.subtitle}
          </p>
        </div>
      </div>

      <div className="bg-ivory-50 border border-outline-variant rounded-xl p-3.5 flex flex-col gap-1.5 text-center">
        {gifts.entity && (
          <p className="font-body text-[13px] leading-4.75 text-ink">
            <strong className="font-semibold">{gifts.entity}</strong>
            {gifts.accountType ? ` · ${gifts.accountType}` : ''}
          </p>
        )}
        {gifts.holder && (
          <p className="font-body text-[12px] leading-4.5 text-ink-muted">
            <strong className="font-semibold text-ink">Titular:</strong> {gifts.holder}
          </p>
        )}
        {gifts.rut && (
          <p className="font-body text-[12px] sm:text-[13px] leading-5 text-ink tabular-nums">
            <strong className="font-semibold">RUT:</strong> {gifts.rut}
          </p>
        )}
        {accountValue && (
          <p className="font-body text-[12px] sm:text-[13px] leading-5 text-ink tabular-nums flex flex-wrap items-center justify-center gap-x-1">
            <strong className="font-semibold">{accountLabel}:</strong>
            <span className="break-all">{accountValue}</span>
          </p>
        )}
        {gifts.alias && (
          <p className="font-body text-[13px] leading-5 text-ink break-all">
            <strong className="font-semibold">Alias:</strong> {gifts.alias}
          </p>
        )}
      </div>

      {copyActions.length > 0 && (
        <div
          className={`grid grid-cols-1 ${copyActions.length > 1 ? 'sm:grid-cols-2' : ''} gap-2.5`}
        >
          {copyActions.map((action, index) => {
            const isPrimary = index === 0;
            const isCopied = copiedField === action.id;
            return (
              <motion.button
                key={action.id}
                type="button"
                onClick={() => handleCopy(action.value, action.id)}
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.97 }}
                className={`${isPrimary ? 'btn-gold' : 'btn-ivory'
                  } min-h-11.5 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl uppercase cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-dark focus-visible:ring-offset-2 focus-visible:ring-offset-surface-container`}
              >
                <AnimatePresence mode="wait" initial={false}>
                  {isCopied ? (
                    <motion.span
                      key={`copied-${action.id}`}
                      initial={{ scale: 0.85, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.85, opacity: 0 }}
                      transition={{ duration: 0.16 }}
                      className="inline-flex items-center gap-1.5"
                    >
                      <Check className="w-4 h-4 shrink-0 text-success" aria-hidden="true" />
                      <span className="font-label text-[11px] leading-4 tracking-[1px] font-semibold whitespace-nowrap">
                        {action.copiedLabel}
                      </span>
                    </motion.span>
                  ) : (
                    <motion.span
                      key={`copy-${action.id}`}
                      initial={{ scale: 0.85, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.85, opacity: 0 }}
                      transition={{ duration: 0.16 }}
                      className="inline-flex items-center gap-1.5"
                    >
                      <Copy
                        className={`w-4 h-4 shrink-0 ${isPrimary ? '' : 'text-primary'}`}
                        aria-hidden="true"
                      />
                      <span className="font-label text-[11px] leading-4 tracking-[1px] font-semibold whitespace-nowrap">
                        {action.label}
                      </span>
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>
            );
          })}
        </div>
      )}
    </motion.article>
  );
}
