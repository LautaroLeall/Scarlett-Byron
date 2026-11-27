import { useState } from 'react';
import { Sparkles } from 'lucide-react';

export function ResilientImage({
  src,
  alt,
  className = '',
  style,
  draggable,
  fallbackLabel,
  loading = 'lazy',
}) {
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return (
      <div
        role="img"
        aria-label={alt}
        className={`flex flex-col items-center justify-center bg-linear-to-br from-ivory-50 via-ivory-100 to-ivory-200 border border-outline-variant text-primary p-3 text-center ${className}`}
      >
        <Sparkles className="w-6 h-6 text-gold-dark mb-1" aria-hidden="true" />
        <span className="font-headline text-[11px] text-ink-muted leading-tight">
          {fallbackLabel || alt}
        </span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      loading={loading}
      decoding="async"
      draggable={draggable}
      style={style}
      onError={() => setHasError(true)}
      className={className}
    />
  );
}
