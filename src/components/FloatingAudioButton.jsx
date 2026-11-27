import { motion } from 'framer-motion';
import { Volume2, VolumeX } from 'lucide-react';

export function FloatingAudioButton({ isPlaying, onToggleMusic }) {
  return (
    <motion.button
      type="button"
      onClick={onToggleMusic}
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.92 }}
      aria-label={isPlaying ? 'Silenciar música' : 'Activar música'}
      className="fixed bottom-[max(1rem,env(safe-area-inset-bottom))] right-[max(1rem,env(safe-area-inset-right))] z-40 w-12 h-12 rounded-full bg-royal-900/95 border-2 border-gold-light text-champagne shadow-[0_8px_24px_rgba(5,11,28,0.55)] flex items-center justify-center hover:bg-royal-800 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-light focus-visible:ring-offset-2 focus-visible:ring-offset-royal-950"
    >
      {isPlaying && (
        <span
          aria-hidden="true"
          className="seal-halo absolute -inset-1 rounded-full border border-gold-light/60 pointer-events-none"
        />
      )}
      {isPlaying ? (
        <Volume2 className="w-5 h-5 text-champagne" aria-hidden="true" />
      ) : (
        <VolumeX className="w-5 h-5 text-royal-200" aria-hidden="true" />
      )}
    </motion.button>
  );
}
