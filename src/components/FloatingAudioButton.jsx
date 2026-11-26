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
      className="fixed bottom-[max(1rem,env(safe-area-inset-bottom))] right-[max(1rem,env(safe-area-inset-right))] z-40 w-12 h-12 rounded-full bg-surface-container border border-outline text-ink shadow-md flex items-center justify-center hover:bg-ivory-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-dark focus-visible:ring-offset-2 focus-visible:ring-offset-ivory-100"
    >
      {isPlaying ? (
        <Volume2 className="w-5 h-5 text-crimson" aria-hidden="true" />
      ) : (
        <VolumeX className="w-5 h-5 text-ink-muted" aria-hidden="true" />
      )}
    </motion.button>
  );
}
