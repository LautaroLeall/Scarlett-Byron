import { motion } from 'framer-motion';
import { Play, Pause } from 'lucide-react';
import { WEDDING_DETAILS } from '../data/weddingData.js';

export function MusicPlayerCard({ isPlaying, onToggleMusic }) {
  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ duration: 0.22 }}
      aria-label="Reproductor de música"
      className={`royal-glass w-full max-w-md rounded-2xl p-5 flex flex-col items-center gap-3 ${isPlaying ? 'is-playing' : ''
        }`}
    >
      <span className="font-label text-[11px] leading-4 tracking-[1.2px] font-semibold text-royal-200 uppercase text-center">
        Presiona para reproducir nuestra canción
      </span>

      <div className="w-full flex items-center justify-center gap-5 py-1">
        <div className="flex items-center gap-1.5 h-8" aria-hidden="true">
          <span className="wave-bar w-1 h-4 bg-gold-light rounded-full" />
          <span className="wave-bar w-1 h-7 bg-champagne rounded-full" />
          <span className="wave-bar w-1 h-5 bg-gold rounded-full" />
          <span className="wave-bar w-1 h-8 bg-gold-light rounded-full" />
          <span className="wave-bar w-1 h-4 bg-gold rounded-full" />
          <span className="wave-bar w-1 h-6 bg-champagne rounded-full" />
        </div>

        <motion.button
          type="button"
          onClick={onToggleMusic}
          aria-label={isPlaying ? 'Pausar música' : 'Reproducir música'}
          whileHover={{ scale: 1.07 }}
          whileTap={{ scale: 0.92 }}
          transition={{ type: 'spring', stiffness: 360, damping: 18 }}
          className="relative inline-flex items-center justify-center w-14 h-14 rounded-full bg-linear-to-b from-crimson to-crimson-dark text-on-secondary border-2 border-gold-light shadow-[0_0_20px_rgba(158,27,36,0.5)] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-light focus-visible:ring-offset-2 focus-visible:ring-offset-royal-950"
        >
          {isPlaying && (
            <span
              aria-hidden="true"
              className="seal-halo absolute -inset-1.5 rounded-full border border-gold-light/70 pointer-events-none"
            />
          )}
          {isPlaying ? (
            <Pause className="w-6 h-6 fill-current" aria-hidden="true" />
          ) : (
            <Play className="w-6 h-6 fill-current translate-x-0.5" aria-hidden="true" />
          )}
        </motion.button>

        <div className="flex items-center gap-1.5 h-8" aria-hidden="true">
          <span className="wave-bar w-1 h-6 bg-champagne rounded-full" />
          <span className="wave-bar w-1 h-4 bg-gold rounded-full" />
          <span className="wave-bar w-1 h-8 bg-gold-light rounded-full" />
          <span className="wave-bar w-1 h-5 bg-gold rounded-full" />
          <span className="wave-bar w-1 h-7 bg-champagne rounded-full" />
          <span className="wave-bar w-1 h-4 bg-gold-light rounded-full" />
        </div>
      </div>

      <p className="font-body text-[13px] leading-5 font-medium text-champagne">
        {WEDDING_DETAILS.audio.title}
      </p>
    </motion.div>
  );
}
