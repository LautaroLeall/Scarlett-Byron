import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Reproduce el MP3 real (`public/audio/cancion.mp3`) directamente dentro del gesto del usuario
 * para máxima compatibilidad en iOS Safari, Android y PC.
 * Pausa automáticamente si el usuario bloquea el celular o cambia de app y reanuda al volver.
 */
export function useAudioPlayer(audioSrc) {
  const audioRef = useRef(null);
  const isPlayingRef = useRef(false);
  const resumeOnVisibleRef = useRef(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const updatePlaying = useCallback((next) => {
    isPlayingRef.current = next;
    setIsPlaying(next);
  }, []);

  const ensureAudioElement = useCallback(() => {
    if (!audioSrc || typeof Audio === 'undefined') {
      return null;
    }
    if (!audioRef.current) {
      const audio = new Audio(audioSrc);
      audio.loop = true;
      audio.preload = 'metadata';
      audio.volume = 0.72;
      audio.playsInline = true;
      audio.addEventListener('ended', () => {
        if (!audio.loop) updatePlaying(false);
      });
      audioRef.current = audio;
    }
    return audioRef.current;
  }, [audioSrc, updatePlaying]);

  const play = useCallback(() => {
    resumeOnVisibleRef.current = false;

    const audio = ensureAudioElement();
    if (!audio) return;

    const playPromise = audio.play();
    if (playPromise && typeof playPromise.then === 'function') {
      playPromise
        .then(() => updatePlaying(true))
        .catch(() => updatePlaying(false));
    } else {
      updatePlaying(true);
    }
  }, [ensureAudioElement, updatePlaying]);

  const pause = useCallback(() => {
    resumeOnVisibleRef.current = false;
    if (audioRef.current) {
      audioRef.current.pause();
    }
    updatePlaying(false);
  }, [updatePlaying]);

  useEffect(() => {
    ensureAudioElement();

    const handleVisibility = () => {
      if (document.hidden) {
        if (isPlayingRef.current) {
          resumeOnVisibleRef.current = true;
          if (audioRef.current) audioRef.current.pause();
          updatePlaying(false);
        }
      } else if (resumeOnVisibleRef.current) {
        resumeOnVisibleRef.current = false;
        play();
      }
    };

    const handlePageHide = () => {
      if (audioRef.current) audioRef.current.pause();
      updatePlaying(false);
    };

    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('pagehide', handlePageHide);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('pagehide', handlePageHide);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.removeAttribute('src');
        audioRef.current.load();
        audioRef.current = null;
      }
    };
  }, [audioSrc, ensureAudioElement, play, updatePlaying]);

  const togglePlay = useCallback(() => {
    if (isPlayingRef.current) {
      pause();
    } else {
      play();
    }
  }, [pause, play]);

  return {
    isPlaying,
    play,
    pause,
    togglePlay,
  };
}
