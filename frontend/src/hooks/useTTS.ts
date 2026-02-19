// src/hooks/useTTS.ts
import { useState, useRef, useCallback } from 'react';

interface TTSOptions {
  text: string;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (error: string) => void;
}

interface UseTTSReturn {
  /** Speak text using Coqui TTS server only */
  speak: (options: string | TTSOptions) => void;
  /** Stop current speech immediately */
  stop: () => void;
  /** True if audio is loading or playing */
  isActive: boolean;
  /** True if currently fetching/loading audio */
  isLoading: boolean;
  /** True if audio is actively playing */
  isPlaying: boolean;
  /** Last error (e.g., server down, empty audio, playback fail) */
  error: string | null;
}

/**
 * Project-wide TTS hook using ONLY Coqui TTS server
 * No browser fallback — consistent high-quality voice across all devices
 */
export const useTTS = (): UseTTSReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const objectUrlRef = useRef<string | null>(null);
  const pendingOnEndRef = useRef<(() => void) | null>(null);
  const pendingOnStartRef = useRef<(() => void) | null>(null);
  const pendingOnErrorRef = useRef<((error: string) => void) | null>(null);

  const cleanup = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
      audioRef.current.onplay = null;
      audioRef.current.onended = null;
      audioRef.current.onerror = null;
      audioRef.current = null;
    }
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
  }, []);

  const stop = useCallback(() => {
    cleanup();
    setIsLoading(false);
    setIsPlaying(false);
    setError(null);
    pendingOnEndRef.current = null;
    pendingOnStartRef.current = null;
    pendingOnErrorRef.current = null;
  }, [cleanup]);

  const speak = useCallback((options: string | TTSOptions) => {
    // Always stop any ongoing speech first
    stop();

    const opts = typeof options === 'string' ? { text: options } : options;
    const { text, onStart, onEnd, onError } = opts;

    if (!text?.trim()) {
      onEnd?.();
      return;
    }

    pendingOnEndRef.current = onEnd || null;
    pendingOnStartRef.current = onStart || null;
    pendingOnErrorRef.current = onError || null;

    setIsLoading(true);
    setError(null);

    fetch('http://127.0.0.1:5000/tts', {
      method: 'POST',
      body: (() => {
        const form = new FormData();
        form.append('text', text.trim());
        return form;
      })(),
    })
      .then(async (response) => {
        if (!response.ok) {
          const errText = await response.text();
          throw new Error(`Server error ${response.status}: ${errText}`);
        }
        const blob = await response.blob();
        if (blob.size === 0) {
          throw new Error('Empty audio received from Coqui server');
        }
        return blob;
      })
      .then((blob) => {
        const url = URL.createObjectURL(blob);
        objectUrlRef.current = url;

        const audio = new Audio(url);
        audioRef.current = audio;

        audio.onplay = () => {
          setIsPlaying(true);
          setIsLoading(false);
          pendingOnStartRef.current?.();
        };

        audio.onended = () => {
          cleanup();
          setIsPlaying(false);
          pendingOnEndRef.current?.();
        };

        audio.onerror = () => {
          cleanup();
          setIsPlaying(false);
          setError('Audio playback failed');
          pendingOnErrorRef.current?.('Playback failed');
          pendingOnEndRef.current?.();
        };

        // Start playing
        audio.play().catch((playError) => {
          cleanup();
          setIsPlaying(false);
          setError('Failed to start playback');
          console.error('Audio play() error:', playError);
          pendingOnErrorRef.current?.('Playback blocked or failed');
          pendingOnEndRef.current?.();
        });
      })
      .catch((err: any) => {
        cleanup();
        setIsLoading(false);
        setIsPlaying(false);
        const msg = err.message || 'Failed to connect to TTS server';
        setError(msg);
        console.error('Coqui TTS error:', err);
        pendingOnErrorRef.current?.(msg);
        pendingOnEndRef.current?.();
      });
  }, [stop, cleanup]);

  return {
    speak,
    stop,
    isActive: isLoading || isPlaying,
    isLoading,
    isPlaying,
    error,
  };
};