import { useEffect, useCallback } from 'react';

interface SoundManagerProps {
  enabled: boolean;
}

export const SoundManager = ({ enabled }: SoundManagerProps) => {
  const playSound = useCallback((frequency: number, duration: number, type: 'sine' | 'square' | 'sawtooth' | 'triangle' = 'sine', volume: number = 0.1) => {
    if (!enabled) return;
    
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.type = type;
      oscillator.frequency.value = frequency;
      
      gainNode.gain.setValueAtTime(volume, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration / 1000);
      
      oscillator.start();
      oscillator.stop(audioContext.currentTime + duration / 1000);
    } catch (error) {
      console.warn('Audio not supported:', error);
    }
  }, [enabled]);

  // Sound effect functions
  const playCollectSound = useCallback(() => {
    playSound(800, 200, 'sine', 0.1);
    setTimeout(() => playSound(1000, 150, 'sine', 0.08), 100);
  }, [playSound]);

  const playPowerUpSound = useCallback(() => {
    playSound(400, 100, 'square', 0.15);
    setTimeout(() => playSound(600, 100, 'square', 0.12), 120);
    setTimeout(() => playSound(800, 100, 'square', 0.1), 240);
  }, [playSound]);

  const playExplosionSound = useCallback(() => {
    playSound(150, 300, 'sawtooth', 0.2);
    setTimeout(() => playSound(100, 200, 'square', 0.15), 100);
  }, [playSound]);

  const playBoostSound = useCallback(() => {
    playSound(300, 400, 'sawtooth', 0.15);
    setTimeout(() => playSound(450, 300, 'sine', 0.1), 100);
  }, [playSound]);

  const playLevelCompleteSound = useCallback(() => {
    const notes = [523, 659, 784, 1047]; // C, E, G, C (major chord)
    notes.forEach((note, index) => {
      setTimeout(() => playSound(note, 300, 'sine', 0.1), index * 150);
    });
  }, [playSound]);

  // Expose sound functions globally for easy access
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).gameSounds = {
        collect: playCollectSound,
        powerup: playPowerUpSound,
        explosion: playExplosionSound,
        boost: playBoostSound,
        levelComplete: playLevelCompleteSound
      };
    }
  }, [playCollectSound, playPowerUpSound, playExplosionSound, playBoostSound, playLevelCompleteSound]);

  return null; // This component doesn't render anything
};