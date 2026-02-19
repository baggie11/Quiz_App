import { VoiceManager} from "./voiceManager";
import type { VoicePreference } from "./voiceManager";
const voiceManager = new VoiceManager();

export type SpeakOptions = {
  rate?: number;     // speed
  pitch?: number;
  volume?: number;
  voicePref?: VoicePreference;
};

export const speak = (text: string, options: SpeakOptions = {}) => {
  if (!("speechSynthesis" in window)) return;

  const {
    rate = 1,
    pitch = 1,
    volume = 1,
    voicePref = { lang: "en-IN" }  // default = Indian English
  } = options;

  const u = new SpeechSynthesisUtterance(text);
  u.voice = voiceManager.getBestVoice(voicePref);
  u.rate = rate;
  u.pitch = pitch;
  u.volume = volume;

  speechSynthesis.cancel();
  speechSynthesis.speak(u);
};

export const stopSpeaking = () => speechSynthesis.cancel();
