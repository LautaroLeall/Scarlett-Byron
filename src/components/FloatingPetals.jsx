const PETALS = [
  { id: 1, left: '5%', size: 16, duration: '14s', delay: '0s', opacity: 0.65 },
  { id: 2, left: '16%', size: 13, duration: '18s', delay: '3.2s', opacity: 0.5 },
  { id: 3, left: '30%', size: 15, duration: '16s', delay: '6.4s', opacity: 0.58 },
  { id: 4, left: '47%', size: 12, duration: '19s', delay: '2.1s', opacity: 0.48 },
  { id: 5, left: '63%', size: 16, duration: '15.5s', delay: '5.2s', opacity: 0.62 },
  { id: 6, left: '78%', size: 14, duration: '17.5s', delay: '1.1s', opacity: 0.54 },
  { id: 7, left: '91%', size: 12, duration: '16.8s', delay: '7.8s', opacity: 0.52 },
];

const SPARKLES = [
  { id: 1, left: '10%', top: '14%', size: 4, duration: '3.4s', delay: '0.2s' },
  { id: 2, left: '24%', top: '32%', size: 3, duration: '4.1s', delay: '1.4s' },
  { id: 3, left: '76%', top: '18%', size: 5, duration: '3.8s', delay: '0.7s' },
  { id: 4, left: '89%', top: '42%', size: 4, duration: '4.5s', delay: '2.1s' },
  { id: 5, left: '14%', top: '68%', size: 3, duration: '3.6s', delay: '1.9s' },
  { id: 6, left: '84%', top: '76%', size: 4, duration: '4.2s', delay: '0.5s' },
];

export function FloatingPetals({ showSparkles = true }) {
  return (
    <div
      className="fixed inset-0 z-20 pointer-events-none overflow-hidden select-none"
      aria-hidden="true"
    >
      {PETALS.map((petal) => (
        <svg
          key={petal.id}
          width={petal.size}
          height={petal.size}
          viewBox="0 0 24 24"
          fill="none"
          className="petal-drift absolute -top-6 drop-shadow-[0_2px_4px_rgba(68,8,14,0.35)]"
          style={{
            left: petal.left,
            animationDuration: petal.duration,
            animationDelay: petal.delay,
            opacity: petal.opacity,
          }}
        >
          <path
            d="M12 2C7.8 5.2 3.8 10 4.8 15.6C5.8 20.2 10.6 22.2 14.8 21C19.2 19.7 20.6 14.4 18.6 9.4C17.1 5.6 14.5 3.1 12 2Z"
            fill="#B41F2B"
          />
          <path
            d="M12 4.2C10.4 8 10 13 12.6 18.4"
            stroke="#6E0F16"
            strokeWidth="0.95"
            strokeLinecap="round"
            opacity="0.65"
          />
        </svg>
      ))}

      {showSparkles &&
        SPARKLES.map((dot) => (
          <span
            key={dot.id}
            className="star-twinkle absolute rounded-full bg-champagne shadow-[0_0_10px_2px_rgba(240,216,152,0.75)]"
            style={{
              left: dot.left,
              top: dot.top,
              width: `${dot.size}px`,
              height: `${dot.size}px`,
              animationDuration: dot.duration,
              animationDelay: dot.delay,
            }}
          />
        ))}
    </div>
  );
}
