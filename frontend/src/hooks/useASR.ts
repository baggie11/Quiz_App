// src/hooks/useASR.ts
import { useState, useRef } from 'react';

export const useASR = () => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState('');
  const [audioLevel, setAudioLevel] = useState(0);
  const [permission, setPermission] = useState<'prompt' | 'granted' | 'denied'>('prompt');

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const startListening = async (onTranscript: (text: string) => void) => {
    setError('');
    setTranscript('');

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true, sampleRate: 16000 }
      });
      streamRef.current = stream;
      setPermission('granted');

      // Audio visualization
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      const audioCtx = new AudioContext();
      const analyser = audioCtx.createAnalyser();
      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);
      analyser.fftSize = 256;

      const updateLevel = () => {
        const data = new Uint8Array(analyser.frequencyBinCount);
        analyser.getByteFrequencyData(data);
        const avg = data.reduce((a, b) => a + b) / data.length;
        setAudioLevel(avg / 128);
        animationFrameRef.current = requestAnimationFrame(updateLevel);
      };
      updateLevel();

      const mimeType = ['audio/webm;codecs=opus', 'audio/webm', 'audio/wav']
        .find(type => MediaRecorder.isTypeSupported(type)) || 'audio/webm';

      const recorder = new MediaRecorder(stream, { mimeType });
      const chunks: Blob[] = [];

      recorder.ondataavailable = e => e.data.size > 0 && chunks.push(e.data);
      recorder.onstop = async () => {
        const blob = new Blob(chunks, { type: mimeType });
        await transcribeAudio(blob, onTranscript);
      };

      recorder.start(100);
      mediaRecorderRef.current = recorder;
      setIsListening(true);

      // Auto-stop after 8s
      setTimeout(() => recorder.state === 'recording' && recorder.stop(), 8000);
    } catch (err: any) {
      setPermission(err.name.includes('Permission') ? 'denied' : 'prompt');
      setError('Microphone access denied or unavailable.');
    }
  };

  const transcribeAudio = async (blob: Blob, onTranscript: (text: string) => void) => {
    const formData = new FormData();
    formData.append('audio', blob, 'speech.wav');

    try {
      const res = await fetch('http://127.0.0.1:5000/asr', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) throw new Error('ASR failed');
      const data = await res.json();
      const text = (data.text || '').trim().toLowerCase();
      if (text) {
        setTranscript(text);
        onTranscript(text);
      } else {
        setError('No speech detected.');
      }
    } catch (err) {
      setError('Speech recognition failed.');
    } finally {
      stopListening();
    }
  };

  const stopListening = () => {
    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
    }
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    setIsListening(false);
  };

  return {
    isListening,
    transcript,
    error,
    audioLevel,
    permission,
    startListening,
    stopListening,
  };
};