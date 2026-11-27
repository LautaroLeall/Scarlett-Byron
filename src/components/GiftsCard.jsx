import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Copy, Check } from 'lucide-react';
import { IMAGES, WEDDING_DETAILS } from '../data/weddingData.js';
import { copyToClipboard } from '../utils/clipboard.js';
import { ResilientImage } from './ResilientImage.jsx';
import { ForeverHeartFlourish } from './WeddingCalendarCard.jsx';

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

  const bankRows = [
    gifts.holder ? { label: 'Titular', value: gifts.holder, tabular: false } : null,
    gifts.rut ? { label: 'RUT', value: gifts.rut, tabular: true } : null,
    accountValue ? { label: accountLabel, value: accountValue, tabular: true, strong: true } : null,
    gifts.alias ? { label: 'Alias', value: gifts.alias, tabular: false } : null,
  ].filter(Boolean);

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
      className="enchanted-card relative overflow-hidden w-full h-full bg-surface-container border border-outline rounded-2xl p-6 sm:p-7 flex flex-col justify-between gap-5"
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-linear-to-r from-gold via-royal-900 to-gold"
      />

      <div className="flex flex-col gap-4">
        {/* Encabezado con sello dorado */}
        <div className="flex flex-col items-center text-center gap-2 pt-1">
          <div className="w-13 h-13 rounded-full overflow-hidden border border-gold shrink-0 shadow-xs bg-royal-900 p-1">
            <ResilientImage
              src={IMAGES.waxSeal}
              alt="Sello de lacre dorado"
              fallbackLabel={monogram}
              className="w-full h-full object-contain"
            />
          </div>
          <div className="flex flex-col items-center gap-0.5">
            <span className="font-label text-[10px] leading-3.5 tracking-[2px] font-semibold uppercase text-gold-dark">
              Con todo nuestro cariño
            </span>
            <h3 className="font-headline text-[17px] sm:text-[18px] leading-5.5 tracking-[1.1px] font-semibold text-royal-900">
              {gifts.title}
            </h3>
          </div>
        </div>

        {/* Mensaje completo de los novios */}
        {(gifts.subtitle || gifts.description) && (
          <div className="flex flex-col gap-2.5 text-center px-0.5 sm:px-2">
            {gifts.subtitle && (
              <p className="font-body text-[13.5px] sm:text-[14px] leading-5.5 font-medium text-ink text-pretty">
                {gifts.subtitle}
              </p>
            )}
            {gifts.description && (
              <p className="font-body text-[12.5px] sm:text-[13px] leading-5.5 text-ink-muted text-pretty">
                {gifts.description}
              </p>
            )}
          </div>
        )}

        {/* Datos bancarios estructurados */}
        <div className="bg-ivory-50 border border-outline-variant rounded-xl px-4 py-3.5 flex flex-col gap-2.5">
          {(gifts.entity || gifts.accountType) && (
            <div className="flex flex-col items-center text-center pb-2.5 border-b border-outline-variant/80">
              {gifts.entity && (
                <p className="font-headline text-[13.5px] sm:text-[14px] leading-5 tracking-[0.8px] font-semibold text-royal-900">
                  {gifts.entity}
                </p>
              )}
              {gifts.accountType && (
                <span className="mt-0.5 inline-flex items-center rounded-full bg-ivory-200/75 border border-outline/45 px-2.5 py-0.5 font-label text-[10px] leading-3.5 tracking-[1px] font-semibold uppercase text-gold-dark">
                  {gifts.accountType}
                </span>
              )}
            </div>
          )}

          <dl className="flex flex-col divide-y divide-outline-variant/65">
            {bankRows.map((row) => (
              <div
                key={row.label}
                className="py-1.5 first:pt-0 last:pb-0 flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5 text-left"
              >
                <dt className="font-label text-[11px] leading-4 tracking-[0.8px] font-semibold uppercase text-ink-muted shrink-0">
                  {row.label}
                </dt>
                <dd
                  className={`font-body text-[13px] leading-5 text-ink break-all text-right ${row.tabular ? 'tabular-nums' : ''
                    } ${row.strong ? 'font-semibold text-royal-900 tracking-[0.4px]' : 'font-medium'}`}
                >
                  {row.value}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        {/* Botones de copiado rápido */}
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
      </div>

      {/* Cierre emotivo */}
      {gifts.end && (
        <div className="pt-2 border-t border-outline-variant/80 flex flex-col items-center text-center">
          <ForeverHeartFlourish tone="gold" className="w-36 -mb-1 opacity-90" />
          <p className="font-display text-[25px] sm:text-[27px] leading-8 text-royal-900 text-balance">
            {gifts.end}
          </p>
        </div>
      )}
    </motion.article>
  );
}
