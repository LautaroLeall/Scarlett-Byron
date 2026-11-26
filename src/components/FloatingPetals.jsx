const PETALS = [
  { id: 1, left: '6%', size: 15, duration: '15s', delay: '0s', opacity: 0.42 },
  { id: 2, left: '21%', size: 12, duration: '18s', delay: '3.2s', opacity: 0.34 },
  { id: 3, left: '42%', size: 16, duration: '16.5s', delay: '6.5s', opacity: 0.38 },
  { id: 4, left: '66%', size: 13, duration: '19s', delay: '1.8s', opacity: 0.32 },
  { id: 5, left: '84%', size: 15, duration: '14.5s', delay: '5s', opacity: 0.4 },
  { id: 6, left: '93%', size: 11, duration: '17.5s', delay: '8.5s', opacity: 0.3 },
];

export function FloatingPetals() {
  return (
    <div
      className="fixed inset-0 z-0 pointer-events-none overflow-hidden select-none"
      aria-hidden="true"
    >
      {PETALS.map((petal) => (
        <svg
          key={petal.id}
          width={petal.size}
          height={petal.size}
          viewBox="0 0 24 24"
          fill="none"
          className="petal-drift absolute -top-6"
          style={{
            left: petal.left,
            animationDuration: petal.duration,
            animationDelay: petal.delay,
            opacity: petal.opacity,
          }}
        >
          <path
            d="M12 2C8 5 4 10 5 15.5C6 20 10.5 22 14.5 21C19 19.8 20.5 14.5 18.5 9.5C17 5.8 14.5 3.2 12 2Z"
            fill="#9E1B24"
          />
          <path
            d="M12 4C10.5 8 10 13 12.5 18.5"
            stroke="#721017"
            strokeWidth="0.9"
            strokeLinecap="round"
            opacity="0.55"
          />
        </svg>
      ))}
    </div>
  );
}
