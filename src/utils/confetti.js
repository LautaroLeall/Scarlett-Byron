const ROYAL_COLORS = ['#C5A059', '#E3C685', '#9E1B24', '#FDFBF7', '#96712C'];

export function fireRoyalConfetti(options = {}) {
  if (typeof window === 'undefined') return;
  if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;

  void import('canvas-confetti')
    .then(({ default: confetti }) => {
      confetti({
        particleCount: 45,
        spread: 68,
        origin: { y: 0.65 },
        colors: ROYAL_COLORS,
        scalar: 0.9,
        ticks: 160,
        ...options,
      });
    })
    .catch(() => {
      // Ignorar si falla la carga diferida del efecto visual
    });
}
