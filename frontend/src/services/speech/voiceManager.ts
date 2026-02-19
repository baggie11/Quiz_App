export type VoicePreference = {
  lang?: string;          // "hi-IN", "en-IN", "ta-IN"
  nameContains?: string[]; // ["heera", "ravi"]
};

export class VoiceManager {
  private voices: SpeechSynthesisVoice[] = [];

  constructor() {
    this.loadVoices();
    speechSynthesis.onvoiceschanged = () => this.loadVoices();
  }

  private loadVoices() {
    this.voices = speechSynthesis.getVoices();
  }

  // Match by language + name priority
  getVoice(pref: VoicePreference): SpeechSynthesisVoice | null {
    if (!this.voices.length) return null;

    let candidates = this.voices;

    if (pref.lang) {
      candidates = candidates.filter(v =>
        v.lang.toLowerCase() === pref.lang!.toLowerCase()
      );
    }

    if (pref.nameContains) {
      candidates = candidates.filter(v =>
        pref.nameContains!.some(key =>
          v.name.toLowerCase().includes(key.toLowerCase())
        )
      );
    }

    return candidates[0] || null;
  }

  // fallback to the closest match
  getBestVoice(pref: VoicePreference): SpeechSynthesisVoice {
    return (
      this.getVoice(pref) ||
      this.voices.find(v => v.lang.startsWith(pref.lang?.split("-")[0] || "")) ||
      this.voices[0]
    );
  }
}
