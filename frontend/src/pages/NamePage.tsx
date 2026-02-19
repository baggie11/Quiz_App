// import React, { useState, useRef, useEffect, type ChangeEvent, type JSX, KeyboardEvent } from 'react';
// import { 
//   Mic, 
//   Headphones, 
//   CheckCircle,
//   Globe,
//   Shield,
//   Accessibility,
//   Users,
//   Brain,
//   User,
//   Volume2,
//   ThumbsUp,
//   ThumbsDown,
//   AlertCircle,
//   VolumeX,
//   Hash,
//   Wifi,
//   WifiOff,
//   ChevronRight,
//   ChevronLeft,
//   Home,
//   Info
// } from 'lucide-react';

// // Define types for Speech Recognition API
// interface SpeechRecognitionEvent extends Event {
//   results: SpeechRecognitionResultList;
//   error?: string;
// }

// interface SpeechRecognitionResultList {
//   [index: number]: SpeechRecognitionResult;
//   length: number;
// }

// interface SpeechRecognitionResult {
//   [index: number]: SpeechRecognitionAlternative;
//   length: number;
// }

// interface SpeechRecognitionAlternative {
//   transcript: string;
//   confidence: number;
// }

// interface SpeechRecognition extends EventTarget {
//   continuous: boolean;
//   interimResults: boolean;
//   lang: string;
//   maxAlternatives: number;
//   onstart: (() => void) | null;
//   onresult: ((event: SpeechRecognitionEvent) => void) | null;
//   onerror: ((event: SpeechRecognitionEvent) => void) | null;
//   onend: (() => void) | null;
//   start(): void;
//   stop(): void;
// }

// declare global {
//   interface Window {
//     SpeechRecognition: new () => SpeechRecognition;
//     webkitSpeechRecognition: new () => SpeechRecognition;
//     webkitAudioContext: typeof AudioContext;
//   }
// }

// // === ASR Functions ===
// const sendAudioToASR = async (audioBlob: Blob): Promise<string> => {
//   console.log('Sending audio to custom ASR:', {
//     size: audioBlob.size,
//     type: audioBlob.type
//   });

//   const formData = new FormData();
//   formData.append('audio', audioBlob, 'speech.webm');

//   try {
//     const controller = new AbortController();
//     const timeoutId = setTimeout(() => controller.abort(), 15000);
    
//     const response = await fetch('http://127.0.0.1:5000/asr', {
//       method: 'POST',
//       body: formData,
//       signal: controller.signal,
//       headers: {
//         'Accept': 'application/json',
//       }
//     });
    
//     clearTimeout(timeoutId);
    
//     console.log('Custom ASR Response status:', response.status);
    
//     if (!response.ok) {
//       let errorText = '';
//       try {
//         errorText = await response.text();
//         console.error('Custom ASR error response:', errorText);
//       } catch (e) {
//         errorText = 'Could not read error response';
//       }
//       throw new Error(`Custom ASR error: ${response.status} - ${errorText}`);
//     }
    
//     const result = await response.json();
//     console.log('Custom ASR result:', result);
    
//     const transcript = (result.text || '').trim();
    
//     console.log('Raw transcript from custom ASR:', transcript);
//     console.log('Transcript length:', transcript.length);
    
//     return transcript;
    
//   } catch (err: any) {
//     console.error('Custom ASR fetch failed:', err);
//     return '';
//   }
// };

// // Helper function to record audio using MediaRecorder
// const recordAudio = async (duration: number = 5000): Promise<Blob> => {
//   return new Promise(async (resolve, reject) => {
//     try {
//       console.log('Requesting microphone access...');
//       const stream = await navigator.mediaDevices.getUserMedia({ 
//         audio: {
//           echoCancellation: true,
//           noiseSuppression: true,
//           sampleRate: 16000,
//           channelCount: 1
//         }
//       });

//       console.log('Microphone access granted, starting recording...');
      
//       const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus') 
//         ? 'audio/webm;codecs=opus'
//         : MediaRecorder.isTypeSupported('audio/webm')
//         ? 'audio/webm'
//         : MediaRecorder.isTypeSupported('audio/mp4')
//         ? 'audio/mp4'
//         : 'audio/ogg';

//       console.log('Using mimeType:', mimeType);
      
//       const mediaRecorder = new MediaRecorder(stream, { mimeType });
//       const chunks: Blob[] = [];

//       mediaRecorder.ondataavailable = (e) => {
//         if (e.data.size > 0) {
//           chunks.push(e.data);
//           console.log('Data chunk received:', e.data.size, 'bytes');
//         }
//       };

//       mediaRecorder.onstop = () => {
//         console.log('Recording stopped, creating blob...');
//         const audioBlob = new Blob(chunks, { type: mimeType });
//         console.log('Audio blob created:', audioBlob.size, 'bytes');
        
//         stream.getTracks().forEach(track => {
//           track.stop();
//           console.log('Stopped track:', track.kind);
//         });
        
//         resolve(audioBlob);
//       };

//       mediaRecorder.onerror = (e) => {
//         console.error('MediaRecorder error:', e);
//         stream.getTracks().forEach(track => track.stop());
//         reject(new Error('MediaRecorder error'));
//       };

//       mediaRecorder.start(100);
//       console.log('MediaRecorder started, recording for', duration, 'ms');
      
//       setTimeout(() => {
//         if (mediaRecorder.state === 'recording') {
//           console.log('Stopping recording after timeout');
//           mediaRecorder.stop();
//         }
//       }, duration);

//     } catch (error) {
//       console.error('Error in recordAudio:', error);
//       reject(error);
//     }
//   });
// };

// // === TTS Functions ===
// const speakWithCoqui = async (text: string, callback?: () => void): Promise<void> => {
//   try {
//     console.log('Coqui TTS: Requesting speech for:', text);
    
//     const formData = new FormData();
//     formData.append('text', text);
    
//     const response = await fetch('http://127.0.0.1:5000/tts', {
//       method: 'POST',
//       body: formData,
//     });
    
//     if (!response.ok) {
//       throw new Error(`Server error: ${response.status}`);
//     }
    
//     const audioBlob = await response.blob();
    
//     if (audioBlob.size === 0) {
//       throw new Error('Received empty audio file');
//     }
    
//     const audioUrl = URL.createObjectURL(audioBlob);
//     const audio = new Audio(audioUrl);
    
//     audio.onplay = () => {
//       console.log('Coqui TTS: Audio playback started');
//     };
    
//     audio.onended = () => {
//       console.log('Coqui TTS: Audio playback finished');
//       URL.revokeObjectURL(audioUrl);
//       if (callback) {
//         callback();
//       }
//     };
    
//     audio.onerror = (event) => {
//       console.error('Coqui TTS: Audio playback error:', event);
//       URL.revokeObjectURL(audioUrl);
//       fallbackSpeak(text, callback);
//     };
    
//     console.log('Coqui TTS: Playing audio...');
//     await audio.play();
    
//   } catch (error) {
//     console.error('Coqui TTS Error:', error);
//     fallbackSpeak(text, callback);
//   }
// };

// // Fallback to browser speech synthesis
// const fallbackSpeak = (text: string, callback?: () => void): void => {
//   if ('speechSynthesis' in window) {
//     speechSynthesis.cancel();
    
//     setTimeout(() => {
//       const utterance = new SpeechSynthesisUtterance(text);
//       utterance.rate = 0.9;
//       utterance.pitch = 1;
//       utterance.lang = 'en-US';
      
//       if (callback) {
//         utterance.onend = callback;
//       }
      
//       speechSynthesis.speak(utterance);
//     }, 150);
//   } else if (callback) {
//     callback();
//   }
// };

// // Speak function that tries Coqui first, then falls back
// const speak = (text: string, callback?: () => void): void => {
//   speakWithCoqui(text, callback);
// };

// // Navbar Component with keyboard navigation
// const Navbar: React.FC = () => {
//   return (
//     <nav className="bg-white border-b border-gray-200 shadow-sm">
//       <div className="max-w-7xl mx-auto px-6 py-4">
//         <div className="flex items-center justify-between">
//           <div className="flex items-center space-x-3">
//             <div 
//               className="w-10 h-10 bg-gradient-to-br from-[#9333ea] to-[#a855f7] rounded-xl flex items-center justify-center shadow-md focus:outline-none focus:ring-2 focus:ring-[#9333ea] focus:ring-offset-2"
//               tabIndex={0}
//               role="button"
//               aria-label="RollNumberVision Logo"
//             >
//               <Brain className="text-white" size={24} />
//             </div>
//             <span className="text-2xl font-bold text-gray-900">RollNumberVision</span>
//           </div>
//           <div className="flex items-center space-x-6">
//             <button 
//               className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:text-[#9333ea] transition-colors focus:outline-none focus:ring-2 focus:ring-[#9333ea] focus:ring-offset-2 rounded-lg"
//               tabIndex={0}
//               aria-label="Accessibility settings"
//             >
//               <Accessibility size={20} />
//               <span className="text-sm font-medium">Accessibility</span>
//             </button>
//           </div>
//         </div>
//       </div>
//     </nav>
//   );
// };

// // Footer Component
// const Footer: React.FC = () => {
//   return (
//     <footer className="bg-gray-50 border-t border-gray-200 mt-16">
//       <div className="max-w-6xl mx-auto px-6 py-12">
//         <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
//           <div>
//             <div className="flex items-center space-x-2 mb-4">
//               <Brain className="text-[#9333ea]" size={24} />
//               <span className="font-bold text-gray-900">RollNumberVision</span>
//             </div>
//             <p className="text-sm text-gray-600">Making student identification accessible for everyone.</p>
//           </div>
          
//           <div>
//             <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
//               <Globe size={16} className="mr-2 text-[#9333ea]" />
//               Features
//             </h3>
//             <ul className="space-y-2 text-sm text-gray-600">
//               <li>Voice Input</li>
//               <li>Text-to-Speech</li>
//               <li>Number Recognition</li>
//             </ul>
//           </div>
          
//           <div>
//             <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
//               <Shield size={16} className="mr-2 text-[#9333ea]" />
//               Privacy
//             </h3>
//             <ul className="space-y-2 text-sm text-gray-600">
//               <li>Secure Data Handling</li>
//               <li>Local Processing</li>
//               <li>No Data Storage</li>
//             </ul>
//           </div>
          
//           <div>
//             <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
//               <Users size={16} className="mr-2 text-[#9333ea]" />
//               Support
//             </h3>
//             <ul className="space-y-2 text-sm text-gray-600">
//               <li>Help Guide</li>
//               <li>Contact Support</li>
//               <li>FAQs</li>
//             </ul>
//           </div>
//         </div>
        
//         <div className="pt-8 border-t border-gray-200 flex flex-col md:flex-row justify-between items-center">
//           <p className="text-sm text-gray-600">© 2024 RollNumberVision. All rights reserved.</p>
//           <div className="flex space-x-6 mt-4 md:mt-0">
//             <a 
//               href="#" 
//               className="text-sm text-gray-600 hover:text-[#9333ea] focus:outline-none focus:underline"
//               tabIndex={0}
//             >
//               Privacy Policy
//             </a>
//             <a 
//               href="#" 
//               className="text-sm text-gray-600 hover:text-[#9333ea] focus:outline-none focus:underline"
//               tabIndex={0}
//             >
//               Terms of Service
//             </a>
//           </div>
//         </div>
//       </div>
//     </footer>
//   );
// };

// // Keyboard Navigation Component
// const KeyboardNavigation: React.FC<{
//   onPrevious: () => void;
//   onNext: () => void;
//   onHome: () => void;
//   onHelp: () => void;
// }> = ({ onPrevious, onNext, onHome, onHelp }) => {
//   return (
//     <div className="fixed bottom-6 right-6 z-50 flex flex-col space-y-3">
//       <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-3">
//         <div className="text-xs font-medium text-gray-700 mb-2">Keyboard Navigation</div>
//         <div className="flex space-x-2">
//           <button
//             onClick={onPrevious}
//             className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9333ea] focus:ring-offset-2 transition-colors"
//             title="Previous (Tab)"
//             aria-label="Previous element"
//             tabIndex={0}
//           >
//             <ChevronLeft size={16} className="text-gray-700" />
//           </button>
//           <button
//             onClick={onNext}
//             className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9333ea] focus:ring-offset-2 transition-colors"
//             title="Next (Tab)"
//             aria-label="Next element"
//             tabIndex={0}
//           >
//             <ChevronRight size={16} className="text-gray-700" />
//           </button>
//           <button
//             onClick={onHome}
//             className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9333ea] focus:ring-offset-2 transition-colors"
//             title="Home (Esc)"
//             aria-label="Go to home"
//             tabIndex={0}
//           >
//             <Home size={16} className="text-gray-700" />
//           </button>
//           <button
//             onClick={onHelp}
//             className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9333ea] focus:ring-offset-2 transition-colors"
//             title="Help (F1)"
//             aria-label="Show help"
//             tabIndex={0}
//           >
//             <Info size={16} className="text-gray-700" />
//           </button>
//         </div>
//       </div>
//       <div className="text-xs text-gray-500 bg-white/80 backdrop-blur-sm rounded-lg p-2 border border-gray-200">
//         <div>Tab/Shift+Tab: Navigate</div>
//         <div>Enter/Space: Activate</div>
//         <div>Esc: Reset focus</div>
//       </div>
//     </div>
//   );
// };

// // Main Component
// const RollNumberVision: React.FC = () => {
//   // State declarations
//   const [rollNumber, setRollNumber] = useState<string>('');
//   const [isListening, setIsListening] = useState<boolean>(false);
//   const [speechError, setSpeechError] = useState<string>('');
//   const [recognizedText, setRecognizedText] = useState<string>('');
//   const [audioLevel, setAudioLevel] = useState<number>(0);
//   const [currentStep, setCurrentStep] = useState<'welcome' | 'listenNumber' | 'joining'>('welcome');
//   const [browserSupported, setBrowserSupported] = useState<boolean>(true);
//   const [micPermission, setMicPermission] = useState<'prompt' | 'granted' | 'denied'>('prompt');
//   const [hasStartedVoiceFlow, setHasStartedVoiceFlow] = useState<boolean>(false);
//   const [isTTSActive, setIsTTSActive] = useState<boolean>(false);
//   const [hasPlayedIntro, setHasPlayedIntro] = useState<boolean>(false);
//   const [isLoadingAudio, setIsLoadingAudio] = useState<boolean>(false);
//   const [useCustomASR, setUseCustomASR] = useState<boolean>(false);
//   const [asrStatus, setAsrStatus] = useState<'idle' | 'recording' | 'processing' | 'error'>('idle');
//   const [focusedElement, setFocusedElement] = useState<string>('input'); // Track focused element
//   const [showKeyboardHelp, setShowKeyboardHelp] = useState<boolean>(false);
//   const [sessionCode, setSessionCode] = useState<string>('');

//   // Refs for tab navigation
//   const inputRef = useRef<HTMLInputElement>(null);
//   const speakButtonRef = useRef<HTMLButtonElement>(null);
//   const hearButtonRef = useRef<HTMLButtonElement>(null);
//   const instructionsButtonRef = useRef<HTMLButtonElement>(null);
//   const joinButtonRef = useRef<HTMLButtonElement>(null);
//   const recognitionRef = useRef<SpeechRecognition | null>(null);
//   const audioContextRef = useRef<AudioContext | null>(null);
//   const analyserRef = useRef<AnalyserNode | null>(null);
//   const animationFrameRef = useRef<number | null>(null);
//   const rollNumberRef = useRef<string>('');
//   const isSpeakingRef = useRef<boolean>(false);
//   const mainContentRef = useRef<HTMLDivElement>(null);
//   const mediaRecorderRef = useRef<MediaRecorder | null>(null);
//   const streamRef = useRef<MediaStream | null>(null);

//   // Array of focusable elements for keyboard navigation
//   const focusableElements = [
//     { id: 'input', ref: inputRef, label: 'Roll number input field' },
//     { id: 'speak', ref: speakButtonRef, label: 'Speak button for voice input' },
//     { id: 'hear', ref: hearButtonRef, label: 'Hear button to read roll number' },
//     { id: 'instructions', ref: instructionsButtonRef, label: 'Instructions button' },
//     { id: 'join', ref: joinButtonRef, label: 'Join session button' },
//   ];

//   const setRollNumberWithRef = (number: string): void => {
//     setRollNumber(number);
//     rollNumberRef.current = number;
//   };

//   // Check ASR backend status on component mount
//   useEffect(() => {
//     const checkASRBackend = async () => {
//       try {
//         const response = await fetch('http://127.0.0.1:5000/health', {
//           method: 'GET',
//           headers: { 'Accept': 'application/json' }
//         });
        
//         if (response.ok) {
//           const data = await response.json();
//           console.log('ASR backend status:', data);
//           setUseCustomASR(data.asr_loaded === true);
//         }
//       } catch (error) {
//         console.log('ASR backend not available, using browser speech recognition');
//         setUseCustomASR(false);
//       }
//     };

//     checkASRBackend();
//   }, []);

//   // Auto-start TTS when component mounts
//   useEffect(() => {
//     const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
//     if (!SpeechRecognition) {
//       setBrowserSupported(false);
//       setSpeechError('Speech recognition is not supported in your browser. Please use Chrome, Edge, or Safari on desktop.');
//       return;
//     }

//     const isSecure = window.location.protocol === 'https:' || window.location.hostname === 'localhost';
//     if (!isSecure && SpeechRecognition) {
//       setSpeechError('Speech recognition requires HTTPS. This feature may not work on HTTP.');
//     }

//     const startTimer = setTimeout(() => {
//       playWelcomeMessage();
//     }, 1500);

//     // Focus the input field on initial load
//     setTimeout(() => {
//       if (inputRef.current) {
//         inputRef.current.focus();
//         setFocusedElement('input');
//       }
//     }, 2000);

//     // Add keyboard event listeners
//     const handleKeyDown = (e: KeyboardEvent) => {
//       switch(e.key) {
//         case 'Tab':
//           e.preventDefault();
//           navigateToNextElement(e.shiftKey ? -1 : 1);
//           break;
//         case 'Escape':
//           e.preventDefault();
//           handleHomeNavigation();
//           break;
//         case 'F1':
//           e.preventDefault();
//           handleHelpNavigation();
//           break;
//         case 'Enter':
//         case ' ':
//           // Handle activation of currently focused element
//           handleActivateFocusedElement();
//           break;
//         case 'ArrowRight':
//           e.preventDefault();
//           navigateToNextElement(1);
//           break;
//         case 'ArrowLeft':
//           e.preventDefault();
//           navigateToNextElement(-1);
//           break;
//       }
//     };

//     // Extract session code from URL parameters on component mount
// useEffect(() => {
//   const params = new URLSearchParams(window.location.search);
//   const codeFromUrl = params.get('session') || params.get('code') || params.get('session_code');
  
//   if (codeFromUrl) {
//     const cleanedCode = codeFromUrl.trim().toUpperCase();
//     setSessionCode(cleanedCode);
//     console.log('Session code from URL:', cleanedCode);

//     // Optional: Announce it via TTS for accessibility
//     speak(`Joining session ${cleanedCode}. Please say or type your roll number.`, () => {
//       setTimeout(() => {
//         if (inputRef.current) {
//           inputRef.current.focus();
//         }
//       }, 1000);
//     });
//   } else {
//     console.log('No session code found in URL');
//     // Optional: warn user if no code
//     speak("No session code detected. Please check the link and try again.", () => {});
//   }
// }, []); // Runs only once on mount

//     // Add event listener to window
//     window.addEventListener('keydown', handleKeyDown as any);

//     const mainContent = mainContentRef.current;
//     const handleMainContentClick = (e: Event) => {
//       const target = e.target as HTMLElement;
//       if (target.tagName !== 'INPUT' && 
//           target.tagName !== 'BUTTON' &&
//           !target.closest('button') &&
//           !target.closest('input')) {
//         handleTapToStartTTS();
//       }
//     };
    
//     if (mainContent) {
//       mainContent.addEventListener('click', handleMainContentClick);
      
//       return () => {
//         clearTimeout(startTimer);
//         cleanup();
//         mainContent.removeEventListener('click', handleMainContentClick);
//         window.removeEventListener('keydown', handleKeyDown as any);
//       };
//     }

//     return () => {
//       clearTimeout(startTimer);
//       cleanup();
//       window.removeEventListener('keydown', handleKeyDown as any);
//     };
//   }, []);

//   // Keyboard navigation functions
//   const navigateToNextElement = (direction: number) => {
//     const currentIndex = focusableElements.findIndex(el => el.id === focusedElement);
//     let nextIndex = currentIndex + direction;
    
//     if (nextIndex < 0) nextIndex = focusableElements.length - 1;
//     if (nextIndex >= focusableElements.length) nextIndex = 0;
    
//     const nextElement = focusableElements[nextIndex];
//     if (nextElement.ref.current) {
//       nextElement.ref.current.focus();
//       setFocusedElement(nextElement.id);
      
//       // Announce the focused element for screen readers
//       speak(`Focused on ${nextElement.label}`, () => {});
//     }
//   };

//   const handleActivateFocusedElement = () => {
//     switch(focusedElement) {
//       case 'input':
//         // Input field is already focused, no action needed
//         break;
//       case 'speak':
//         handleVoiceInputNumber();
//         break;
//       case 'hear':
//         handleReadNumber();
//         break;
//       case 'instructions':
//         handleTapToStartTTS();
//         break;
//       case 'join':
//         handleJoinSession();
//         break;
//     }
//   };

//   const handleHomeNavigation = () => {
//     if (inputRef.current) {
//       inputRef.current.focus();
//       setFocusedElement('input');
//       speak("Focused on roll number input field", () => {});
//     }
//   };

//   const handleHelpNavigation = () => {
//     setShowKeyboardHelp(!showKeyboardHelp);
//     speak(showKeyboardHelp ? "Hiding keyboard help" : "Showing keyboard help. Use Tab to navigate between elements, Enter to activate, and Escape to return to the input field.", () => {});
//   };

//   const handlePreviousNavigation = () => {
//     navigateToNextElement(-1);
//   };

//   const handleNextNavigation = () => {
//     navigateToNextElement(1);
//   };

//   const playWelcomeMessage = (): void => {
//     if (hasPlayedIntro) return;
    
//     setIsLoadingAudio(true);
//     setIsTTSActive(true);
//     setCurrentStep('welcome');
    
//     console.log('Playing welcome message with Coqui TTS...');
    
//     speak("Welcome to Roll Number Vision. Please speak your roll number clearly when you hear the beep. You can also use the Tab key to navigate between elements.", () => {
//       console.log('Welcome message finished');
//       setIsTTSActive(false);
//       setIsLoadingAudio(false);
//       setHasPlayedIntro(true);
      
//       setTimeout(() => {
//         handleStartVoiceFlow();
//       }, 1500);
//     });
//   };

//   const cleanup = (): void => {
//     if (recognitionRef.current) {
//       try {
//         recognitionRef.current.stop();
//       } catch (e) {
//         console.error('Error stopping recognition:', e);
//       }
//     }
    
//     if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
//       mediaRecorderRef.current.stop();
//     }
    
//     if (streamRef.current) {
//       streamRef.current.getTracks().forEach(track => track.stop());
//       streamRef.current = null;
//     }
    
//     if (animationFrameRef.current) {
//       cancelAnimationFrame(animationFrameRef.current);
//     }
    
//     if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
//       audioContextRef.current.close();
//     }
    
//     speechSynthesis.cancel();
//   };

//   const startAudioMonitoring = async (stream?: MediaStream): Promise<void> => {
//     try {
//       let audioStream = stream;
//       if (!audioStream) {
//         console.log('Requesting microphone for monitoring...');
//         audioStream = await navigator.mediaDevices.getUserMedia({ 
//           audio: {
//             echoCancellation: true,
//             noiseSuppression: true,
//             sampleRate: 16000
//           }
//         });
//         streamRef.current = audioStream;
//       }
      
//       setMicPermission('granted');
      
//       const AudioContextClass = window.AudioContext || window.webkitAudioContext;
//       audioContextRef.current = new AudioContextClass();
//       analyserRef.current = audioContextRef.current.createAnalyser();
//       const source = audioContextRef.current.createMediaStreamSource(audioStream);
//       source.connect(analyserRef.current);
//       analyserRef.current.fftSize = 256;

//       const updateLevel = (): void => {
//         if (!analyserRef.current) return;
        
//         const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
//         analyserRef.current.getByteFrequencyData(dataArray);
//         const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
//         setAudioLevel(Math.min(average / 128, 1));
//         animationFrameRef.current = requestAnimationFrame(updateLevel);
//       };
//       updateLevel();
//     } catch (error) {
//       console.error('Error accessing microphone:', error);
//       setMicPermission('denied');
//       setSpeechError('Microphone access denied. Please allow microphone access in your browser settings.');
//     }
//   };

//   // === CUSTOM ASR FUNCTION ===
//   const startCustomASR = async (): Promise<void> => {
//     setSpeechError('');
//     setRecognizedText('');
    
//     setIsListening(true);
//     setAsrStatus('recording');
    
//     try {
//       console.log('Starting custom ASR for roll number...');
      
//       await startAudioMonitoring();
      
//       speak("Listening...", async () => {
//         try {
//           console.log('Starting audio recording...');
//           const audioBlob = await recordAudio(5000);
//           console.log('Audio recorded:', audioBlob.size, 'bytes');
          
//           setAsrStatus('processing');
          
//           const transcript = await sendAudioToASR(audioBlob);
          
//           console.log('Custom ASR transcript:', transcript);
          
//           processTranscript(transcript, 'custom');
          
//         } catch (error: any) {
//           console.error('Custom ASR recording error:', error);
//           setAsrStatus('error');
          
//           setUseCustomASR(false);
//           retryWithMessage('Speech recognition failed. Please try again.');
//         }
//       });
      
//     } catch (error: any) {
//       console.error('Custom ASR setup error:', error);
//       setIsListening(false);
//       setAsrStatus('error');
//       setSpeechError('Failed to start speech recognition.');
      
//       setUseCustomASR(false);
//       setTimeout(() => startSpeechRecognition(), 1000);
//     }
//   };

//   // === BROWSER SPEECH RECOGNITION FUNCTION ===
//   const startSpeechRecognition = (): void => {
//     setSpeechError('');
//     setRecognizedText('');

//     const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
//     if (!SpeechRecognition) {
//       setSpeechError('Speech recognition is not supported in your browser. Please use Chrome, Edge, or Safari.');
//       return;
//     }

//     if (recognitionRef.current) {
//       try {
//         recognitionRef.current.stop();
//       } catch (e) {
//         console.error('Error stopping recognition:', e);
//       }
//     }

//     if (isSpeakingRef.current || isLoadingAudio) {
//       setTimeout(() => startSpeechRecognition(), 500);
//       return;
//     }

//     recognitionRef.current = new SpeechRecognition();
//     recognitionRef.current.continuous = false;
//     recognitionRef.current.interimResults = false;
//     recognitionRef.current.lang = 'en-US';
//     recognitionRef.current.maxAlternatives = 1;

//     recognitionRef.current.onstart = () => {
//       console.log('Speech recognition started');
//       setIsListening(true);
//       startAudioMonitoring();
//     };

//     recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
//       const transcript = event.results[0][0].transcript.trim();
//       console.log('Browser recognition transcript:', transcript);
//       processTranscript(transcript, 'browser');
//     };

//     recognitionRef.current.onerror = (event: SpeechRecognitionEvent) => {
//       console.error('Speech recognition error:', event.error);
//       setIsListening(false);
      
//       let errorMessage = '';
//       let shouldRetry = false;
      
//       switch(event.error) {
//         case 'no-speech':
//           errorMessage = 'No speech detected. Please try again.';
//           shouldRetry = true;
//           break;
//         case 'audio-capture':
//           errorMessage = 'No microphone found. Please check your microphone connection.';
//           setMicPermission('denied');
//           break;
//         case 'not-allowed':
//           errorMessage = 'Microphone access denied. Please allow microphone access in your browser settings.';
//           setMicPermission('denied');
//           break;
//         case 'network':
//           errorMessage = 'Network error. Please check your internet connection.';
//           break;
//         case 'aborted':
//           return;
//         default:
//           errorMessage = 'Error recognizing speech. Please try again.';
//           shouldRetry = true;
//       }
      
//       setSpeechError(errorMessage);
      
//       if (shouldRetry) {
//         retryWithMessage(errorMessage);
//       }
//     };

//     recognitionRef.current.onend = () => {
//       console.log('Speech recognition ended');
//       setIsListening(false);
//       if (animationFrameRef.current) {
//         cancelAnimationFrame(animationFrameRef.current);
//       }
//     };

//     try {
//       recognitionRef.current.start();
//       console.log('Attempting to start browser recognition');
//     } catch (error) {
//       console.error('Error starting speech recognition:', error);
//       setSpeechError('Failed to start speech recognition. Please try again.');
//       setIsListening(false);
//     }
//   };

//   // Process transcript function - NO VALIDATION
//   const processTranscript = (transcript: string, source: 'browser' | 'custom'): void => {
//     console.log(`Processing transcript from ${source}:`, transcript);
    
//     setRecognizedText(transcript);
//     setAsrStatus('idle');
    
//     // Just use the transcript as-is, no validation or cleaning
//     setRollNumberWithRef(transcript);
    
//     console.log('Roll number set to:', transcript);
    
//     // Announce the recognized number
//     isSpeakingRef.current = true;
//     setIsTTSActive(true);
//     setIsLoadingAudio(true);
    
//     speak(`Roll number recognized: ${transcript}.`, () => {
//       console.log('Roll number announcement finished');
//       isSpeakingRef.current = false;
//       setIsTTSActive(false);
//       setIsLoadingAudio(false);
      
//       // Auto-focus the join button after speech recognition
//       setTimeout(() => {
//         if (joinButtonRef.current) {
//           joinButtonRef.current.focus();
//           setFocusedElement('join');
//         }
//       }, 500);
//     });
//   };

//   const retryWithMessage = (msg: string) => {
//     isSpeakingRef.current = true;
//     setIsTTSActive(true);
//     setIsLoadingAudio(true);
    
//     speak(msg, () => {
//       isSpeakingRef.current = false;
//       setIsTTSActive(false);
//       setIsLoadingAudio(false);
      
//       setCurrentStep('listenNumber');
//       setRollNumberWithRef('');
//       setRecognizedText('');
      
//       setTimeout(() => {
//         if (useCustomASR) {
//           startCustomASR();
//         } else {
//           startSpeechRecognition();
//         }
//       }, 2000);
//     });
//   };

//   const stopSpeechRecognition = (): void => {
//     if (recognitionRef.current) {
//       try {
//         recognitionRef.current.stop();
//         setIsListening(false);
//         setAsrStatus('idle');
//       } catch (error) {
//         console.error('Error stopping speech recognition:', error);
//       }
//     }
    
//     if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
//       mediaRecorderRef.current.stop();
//     }
    
//     if (streamRef.current) {
//       streamRef.current.getTracks().forEach(track => track.stop());
//       streamRef.current = null;
//     }
    
//     speechSynthesis.cancel();
//     isSpeakingRef.current = false;
//     setIsTTSActive(false);
//     setIsLoadingAudio(false);
//   };

//   const handleRollNumberChange = (e: ChangeEvent<HTMLInputElement>): void => {
//     const value = e.target.value;
//     setRollNumberWithRef(value);
//     setSpeechError('');
//   };

//   const handleTapToStartTTS = (): void => {
//     if (isSpeakingRef.current || isLoadingAudio) {
//       speechSynthesis.cancel();
//       setIsTTSActive(false);
//       isSpeakingRef.current = false;
//       setIsLoadingAudio(false);
//       return;
//     }

//     setIsTTSActive(true);
//     setIsLoadingAudio(true);
    
//     if (!hasPlayedIntro) {
//       isSpeakingRef.current = true;
//       speak("Welcome to Roll Number Vision. Please speak your roll number clearly when you hear the beep. You can also use the Tab key to navigate between elements.", () => {
//         isSpeakingRef.current = false;
//         setIsTTSActive(false);
//         setIsLoadingAudio(false);
//         setHasPlayedIntro(true);
//       });
//     } else {
//       let message = '';
      
//       if (rollNumber) {
//         message = `Current roll number is ${rollNumber}. Click speak to start voice input or type to edit.`;
//       } else {
//         message = 'Ready for your roll number. Speak or type it now.';
//       }
      
//       isSpeakingRef.current = true;
//       speak(message, () => {
//         isSpeakingRef.current = false;
//         setIsTTSActive(false);
//         setIsLoadingAudio(false);
//       });
//     }
//   };

//   const handleStartVoiceFlow = (): void => {
//     if (!browserSupported) {
//       alert('Speech recognition is not supported in your browser. Please use Chrome, Edge, or Safari.');
//       return;
//     }

//     setHasStartedVoiceFlow(true);
//     setCurrentStep('listenNumber');
    
//     setTimeout(() => {
//       if (useCustomASR) {
//         startCustomASR();
//       } else {
//         startSpeechRecognition();
//       }
//     }, 800);
//   };

//   const handleVoiceInputNumber = (): void => {
//     if (isListening) {
//       stopSpeechRecognition();
//     } else {
//       if (currentStep === 'listenNumber') {
//         if (useCustomASR) {
//           startCustomASR();
//         } else {
//           startSpeechRecognition();
//         }
//       } else {
//         handleStartVoiceFlow();
//       }
//     }
//   };

//   const handleReadNumber = (): void => {
//     if (rollNumber) {
//       setIsTTSActive(true);
//       setIsLoadingAudio(true);
      
//       speak(`Your roll number is ${rollNumber}.`, () => {
//         setIsTTSActive(false);
//         setIsLoadingAudio(false);
//       });
//     }
//   };

//   const handleJoinSession = async (): Promise<void> => {
//   const numberToJoin = (rollNumberRef.current || rollNumber).trim();

//   if (!numberToJoin) {
//     speak("Please enter or speak your roll number before joining.");
//     return;
//   }

//   if (!sessionCode) {
//     speak("Session code not found. Please use a valid session link.");
//     return;
//   }

//   try {
//     setCurrentStep('joining');
//     setIsLoadingAudio(true);

//     speak(`Joining session ${sessionCode} with roll number ${numberToJoin}.`, async () => {
//       try {
//         const response = await fetch('http://127.0.0.1:5000/join-session', {
//           method: 'POST',
//           headers: {
//             'Content-Type': 'application/json',
//             'Accept': 'application/json',
//           },
//           body: JSON.stringify({
//             roll_number: numberToJoin,
//             session_code: sessionCode,
//           }),
//         });

//         if (!response.ok) {
//           const errorData = await response.json().catch(() => ({}));
//           throw new Error(errorData.message || `Server error: ${response.status}`);
//         }

//         const result = await response.json();
//         console.log('Participant joined successfully:', result);

//         speak(`Successfully joined session ${sessionCode}. Welcome, ${numberToJoin}!`);

//         alert(`Joined Session ${sessionCode}!\nRoll Number: ${numberToJoin}`);

//         // Reset form for next participant
//         setRollNumberWithRef('');
//         setRecognizedText('');
//         setCurrentStep('listenNumber');

//         setTimeout(() => {
//           if (inputRef.current) {
//             inputRef.current.focus();
//             setFocusedElement('input');
//           }
//         }, 1000);

//       } catch (error: any) {
//         console.error('Failed to join session:', error);
//         speak(`Failed to join session ${sessionCode}. ${error.message || 'Please try again.'}`);

//         setCurrentStep('listenNumber');

//         setTimeout(() => {
//           if (joinButtonRef.current) {
//             joinButtonRef.current.focus();
//           }
//         }, 500);
//       } finally {
//         setIsLoadingAudio(false);
//       }
//     });

//   } catch (error) {
//     console.error('Unexpected error:', error);
//     setIsLoadingAudio(false);
//     setCurrentStep('listenNumber');
//     speak("An error occurred. Please try again.");
//   }
// };

//   const getStepMessage = (): string => {
//     switch(currentStep) {
//       case 'welcome':
//         return isLoadingAudio ? '🎵 Welcome message playing...' : '🎵 Welcome message ready';
//       case 'listenNumber':
//         if (asrStatus === 'processing') return '🔄 Processing audio...';
//         if (asrStatus === 'recording') return '🎤 Recording audio...';
//         return isListening ? '🎤 Listening for roll number...' : '🎤 Ready to listen for roll number';
//       case 'joining':
//         return '🚀 Joining session...';
//       default:
//         return 'Ready';
//     }
//   };

//   const getStepIcon = (): JSX.Element => {
//     switch(currentStep) {
//       case 'welcome':
//         return <Volume2 size={16} className={isLoadingAudio ? "text-purple-500 animate-pulse" : "text-purple-500"} />;
//       case 'listenNumber':
//         if (asrStatus === 'processing') return <Wifi size={16} className="text-blue-500 animate-pulse" />;
//         return <Mic size={16} className={isListening ? "text-red-500 animate-pulse" : "text-red-500"} />;
//       case 'joining':
//         return <Users size={16} className="text-emerald-500 animate-pulse" />;
//       default:
//         return <Brain size={16} />;
//     }
//   };

//   const handleMainClick = (e: React.MouseEvent<HTMLDivElement>): void => {
//     const target = e.target as HTMLElement;
//     if (target.tagName !== 'INPUT' && 
//         target.tagName !== 'BUTTON' &&
//         !target.closest('button') &&
//         !target.closest('input')) {
//       handleTapToStartTTS();
//     }
//   };

//   return (
//     <div className="min-h-screen transition-all duration-300 bg-white">
//       <Navbar />
      
//       <main 
//         ref={mainContentRef}
//         className="max-w-6xl mx-auto px-6 py-8 cursor-pointer"
//         onClick={handleMainClick}
//       >
//         {!browserSupported && (
//           <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start space-x-3">
//             <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
//             <div>
//               <h3 className="font-semibold text-red-900 mb-1">Browser Not Supported</h3>
//               <p className="text-sm text-red-700">Speech recognition is not available in your browser. Please use Chrome, Edge, or Safari on desktop.</p>
//             </div>
//           </div>
//         )}

//         {micPermission === 'denied' && (
//           <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start space-x-3">
//             <AlertCircle className="text-amber-600 flex-shrink-0 mt-0.5" size={20} />
//             <div>
//               <h3 className="font-semibold text-amber-900 mb-1">Microphone Access Required</h3>
//               <p className="text-sm text-amber-700">Please allow microphone access in your browser settings to use voice input.</p>
//             </div>
//           </div>
//         )}

//         {/* TTS Status Indicator */}
//         {(isTTSActive || isLoadingAudio) && (
//           <div className="mb-4 p-3 bg-purple-50 border border-purple-200 rounded-xl flex items-center justify-center">
//             <div className="flex items-center space-x-2">
//               {isLoadingAudio ? (
//                 <>
//                   <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600"></div>
//                   <span className="text-sm font-medium text-purple-700">
//                     🔄 Loading audio from Coqui TTS...
//                   </span>
//                 </>
//               ) : (
//                 <>
//                   <Volume2 className="text-purple-600 animate-pulse" size={20} />
//                   <span className="text-sm font-medium text-purple-700">
//                     🔊 Coqui TTS is active...
//                   </span>
//                 </>
//               )}
//             </div>
//           </div>
//         )}

//         {/* ASR Status Indicator */}
//         {useCustomASR && (
//           <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-between">
//             <div className="flex items-center space-x-2">
//               <Wifi size={20} className="text-blue-600" />
//               <span className="text-sm font-medium text-blue-700">
//                 Using custom ASR backend
//               </span>
//             </div>
//             <div className="flex items-center space-x-2">
//               <div className={`w-2 h-2 rounded-full ${
//                 asrStatus === 'idle' ? 'bg-gray-400' :
//                 asrStatus === 'recording' ? 'bg-red-500 animate-pulse' :
//                 asrStatus === 'processing' ? 'bg-blue-500 animate-pulse' :
//                 'bg-red-500'
//               }`}></div>
//               <span className="text-xs text-gray-600">
//                 {asrStatus === 'idle' ? 'Ready' :
//                  asrStatus === 'recording' ? 'Recording...' :
//                  asrStatus === 'processing' ? 'Processing...' :
//                  'Error'}
//               </span>
//             </div>
//           </div>
//         )}

//         {/* Keyboard Help Overlay */}
//         {showKeyboardHelp && (
//           <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
//             <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
//               <div className="flex justify-between items-center mb-4">
//                 <h3 className="text-xl font-bold text-gray-900">Keyboard Navigation Help</h3>
//                 <button
//                   onClick={() => setShowKeyboardHelp(false)}
//                   className="p-2 hover:bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9333ea]"
//                   aria-label="Close help"
//                 >
//                   <AlertCircle size={20} className="text-gray-600" />
//                 </button>
//               </div>
//               <div className="space-y-3 text-gray-700">
//                 <div className="flex items-center space-x-3">
//                   <div className="bg-gray-100 px-3 py-1 rounded-lg font-mono">Tab</div>
//                   <span>Move to next element</span>
//                 </div>
//                 <div className="flex items-center space-x-3">
//                   <div className="bg-gray-100 px-3 py-1 rounded-lg font-mono">Shift + Tab</div>
//                   <span>Move to previous element</span>
//                 </div>
//                 <div className="flex items-center space-x-3">
//                   <div className="bg-gray-100 px-3 py-1 rounded-lg font-mono">Enter / Space</div>
//                   <span>Activate selected element</span>
//                 </div>
//                 <div className="flex items-center space-x-3">
//                   <div className="bg-gray-100 px-3 py-1 rounded-lg font-mono">Escape</div>
//                   <span>Return to input field</span>
//                 </div>
//                 <div className="flex items-center space-x-3">
//                   <div className="bg-gray-100 px-3 py-1 rounded-lg font-mono">F1</div>
//                   <span>Show/hide this help</span>
//                 </div>
//                 <div className="flex items-center space-x-3">
//                   <div className="bg-gray-100 px-3 py-1 rounded-lg font-mono">Arrow Keys</div>
//                   <span>Navigate between elements</span>
//                 </div>
//               </div>
//               <div className="mt-6 pt-4 border-t border-gray-200">
//                 <p className="text-sm text-gray-600">
//                   Currently focused: <span className="font-semibold text-[#9333ea]">
//                     {focusableElements.find(el => el.id === focusedElement)?.label}
//                   </span>
//                 </p>
//               </div>
//             </div>
//           </div>
//         )}

//         <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
//           <div className="p-8">
//             <div className="text-center mb-8">
//               <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl mb-4">
//                 <User className="text-[#9333ea]" size={32} />
//               </div>
//               <h2 className="text-3xl font-bold text-gray-900 mb-3">
//                 Enter Your Roll Number
//               </h2>
//               <p className="text-gray-600 max-w-2xl mx-auto">
//                 {hasStartedVoiceFlow ? 
//                   "Speak your roll number now" : 
//                   "Welcome! Listening will start after the greeting..."}
//               </p>
//               <div className="mt-4 flex items-center justify-center space-x-2 text-sm text-gray-500">
//                 <VolumeX size={16} />
//                 <span>Tap anywhere to hear instructions</span>
//                 {useCustomASR && (
//                   <span className="flex items-center ml-4">
//                     <Wifi size={12} className="mr-1 text-blue-500" />
//                     <span className="text-blue-600">Custom ASR Active</span>
//                   </span>
//                 )}
//               </div>
//             </div>

//             {/* Step Progress */}
//             <div className="max-w-xl mx-auto mb-6">
//               <div className="flex items-center justify-between mb-4 px-4">
//                 <div className={`flex flex-col items-center ${currentStep === 'welcome' ? 'text-[#9333ea]' : 'text-gray-400'}`}>
//                   <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep === 'welcome' ? 'bg-purple-100' : 'bg-gray-100'}`}>
//                     1
//                   </div>
//                   <span className="text-xs mt-1">Welcome</span>
//                 </div>
//                 <div className="flex-1 h-0.5 bg-gray-200 mx-2"></div>
//                 <div className={`flex flex-col items-center ${currentStep === 'listenNumber' ? 'text-[#9333ea]' : 'text-gray-400'}`}>
//                   <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep === 'listenNumber' ? 'bg-purple-100' : 'bg-gray-100'}`}>
//                     2
//                   </div>
//                   <span className="text-xs mt-1">Enter Number</span>
//                 </div>
//                 <div className="flex-1 h-0.5 bg-gray-200 mx-2"></div>
//                 <div className={`flex flex-col items-center ${currentStep === 'joining' ? 'text-[#9333ea]' : 'text-gray-400'}`}>
//                   <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep === 'joining' ? 'bg-purple-100' : 'bg-gray-100'}`}>
//                     3
//                   </div>
//                   <span className="text-xs mt-1">Join</span>
//                 </div>
//               </div>
//             </div>

//             {/* Status Indicator */}
//             <div className="max-w-xl mx-auto mb-6">
//               <div className="flex items-center justify-center space-x-3 p-4 rounded-xl bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-100">
//                 <div className="flex items-center space-x-2">
//                   {getStepIcon()}
//                   <span className="text-sm font-medium text-gray-700">
//                     {getStepMessage()}
//                   </span>
//                 </div>
//                 {isListening && (
//                   <div className="flex space-x-1 ml-2">
//                     {[...Array(4)].map((_, i) => (
//                       <div
//                         key={i}
//                         className="w-1 bg-[#9333ea] rounded-full transition-all duration-100"
//                         style={{
//                           height: `${8 + audioLevel * 16 * (1 + Math.sin(Date.now() / 200 + i))}px`
//                         }}
//                       ></div>
//                     ))}
//                   </div>
//                 )}
//               </div>
              
//               {recognizedText && !isListening && (
//                 <div className="mt-3 p-3 bg-purple-50 rounded-lg border border-purple-100">
//                   <p className="text-sm text-purple-700 flex items-center">
//                     <Mic size={12} className="mr-2" />
//                     <span className="font-medium">Recognized:</span> 
//                     <span className="ml-2">{recognizedText}</span>
//                     {useCustomASR && (
//                       <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
//                         Custom ASR
//                       </span>
//                     )}
//                   </p>
//                 </div>
//               )}
//             </div>

//             {/* Input Section */}
//             <div className="max-w-xl mx-auto mb-8 space-y-6">
//               <div>
//                 <div className="flex justify-between items-center mb-2">
//                   <label htmlFor="rollNumber" className="block text-sm font-medium text-gray-900">
//                     Roll Number / Student ID
//                   </label>
//                   <div className="flex items-center space-x-2">
//                     <span className="text-xs text-gray-500">
//                       {isListening ? 'Listening...' : hasStartedVoiceFlow ? 'Ready' : isLoadingAudio ? 'Loading TTS...' : 'Initializing...'}
//                     </span>
//                     <div className={`w-2 h-2 rounded-full ${
//                       isListening ? 'bg-red-500 animate-pulse' : 
//                       hasStartedVoiceFlow ? 'bg-green-500' : 
//                       isLoadingAudio ? 'bg-purple-500 animate-pulse' : 'bg-purple-500'
//                     }`}></div>
//                   </div>
//                 </div>
                
//                 <div className="relative">
//                   <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
//                     <Hash size={20} className="text-gray-400" />
//                   </div>
//                   <input
//                     ref={inputRef}
//                     type="text"
//                     id="rollNumber"
//                     value={rollNumber}
//                     onChange={handleRollNumberChange}
//                     onFocus={() => setFocusedElement('input')}
//                     placeholder="Type roll number or use voice"
//                     className="w-full pl-12 pr-4 py-3 text-base bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#9333ea] focus:border-transparent transition-all text-gray-900 placeholder-gray-500"
//                     aria-label="Roll number input field. Press Tab to navigate to other controls."
//                     tabIndex={0}
//                   />
//                   {rollNumber && (
//                     <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
//                       <CheckCircle className="text-emerald-600" size={20} />
//                     </div>
//                   )}
//                 </div>
                
//                 <div className="mt-2 mb-3">
//                   <p className="text-xs text-gray-500">
//                     Any text accepted - no validation
//                   </p>
//                 </div>
                
//                 <div className="flex justify-between mt-3">
//                   <div className="flex space-x-2">
//                     <button
//                       ref={speakButtonRef}
//                       onClick={handleVoiceInputNumber}
//                       onFocus={() => setFocusedElement('speak')}
//                       disabled={!browserSupported || isLoadingAudio}
//                       className={`px-4 py-2 text-sm rounded-lg transition-all flex items-center space-x-2 focus:outline-none focus:ring-2 focus:ring-[#9333ea] focus:ring-offset-2 ${
//                         !browserSupported || isLoadingAudio ? 'bg-gray-100 text-gray-400 cursor-not-allowed' :
//                         isListening 
//                           ? 'bg-red-50 border border-red-200 text-red-600 hover:bg-red-100' 
//                           : 'bg-purple-50 border border-purple-200 text-[#9333ea] hover:bg-purple-100'
//                       }`}
//                       aria-label={isListening ? "Stop listening. Press Enter to stop." : "Start voice input. Press Enter to speak."}
//                       aria-pressed={isListening}
//                       tabIndex={0}
//                     >
//                       <Mic size={14} />
//                       <span className="font-medium">
//                         {isListening ? 'Stop' : 'Speak'}
//                       </span>
//                     </button>
//                     <button
//                       ref={hearButtonRef}
//                       onClick={handleReadNumber}
//                       onFocus={() => setFocusedElement('hear')}
//                       disabled={!rollNumber || isLoadingAudio}
//                       className={`px-3 py-2 text-sm rounded-lg transition-all flex items-center space-x-1 focus:outline-none focus:ring-2 focus:ring-[#9333ea] focus:ring-offset-2 ${
//                         !rollNumber || isLoadingAudio ? 'bg-gray-50 text-gray-400 cursor-not-allowed' :
//                         'bg-purple-50 border border-purple-200 text-[#9333ea] hover:bg-purple-100'
//                       }`}
//                       aria-label="Read roll number aloud. Press Enter to hear."
//                       tabIndex={0}
//                     >
//                       <Headphones size={14} />
//                       <span>Hear</span>
//                     </button>
//                     <button
//                       ref={instructionsButtonRef}
//                       onClick={handleTapToStartTTS}
//                       onFocus={() => setFocusedElement('instructions')}
//                       disabled={isLoadingAudio}
//                       className={`px-3 py-2 text-sm rounded-lg transition-all flex items-center space-x-1 focus:outline-none focus:ring-2 focus:ring-[#9333ea] focus:ring-offset-2 ${
//                         isLoadingAudio ? 'bg-gray-100 text-gray-400 cursor-not-allowed' :
//                         isTTSActive 
//                           ? 'bg-amber-50 border border-amber-200 text-amber-600 hover:bg-amber-100' 
//                           : 'bg-purple-50 border border-purple-200 text-[#9333ea] hover:bg-purple-100'
//                       }`}
//                       aria-label="Hear instructions. Press Enter for audio guidance."
//                       tabIndex={0}
//                     >
//                       <VolumeX size={14} />
//                       <span>Instructions</span>
//                     </button>
//                   </div>
//                 </div>
//               </div>

//               {speechError && (
//                 <div className="p-3 bg-red-50 rounded-lg border border-red-100">
//                   <p className="text-sm text-red-700">
//                     <span className="font-medium">Error:</span> {speechError}
//                   </p>
//                 </div>
//               )}
//             </div>

//             {/* Action Buttons */}
//             <div className="max-w-xl mx-auto space-y-4">
//               <button
//                 ref={joinButtonRef}
//                 onClick={handleJoinSession}
//                 onFocus={() => setFocusedElement('join')}
//                 disabled={isLoadingAudio}
//                 className={`w-full py-4 rounded-xl font-semibold text-base transition-all focus:outline-none focus:ring-2 focus:ring-[#9333ea] focus:ring-offset-2 ${
//                   !isLoadingAudio && currentStep !== 'joining'
//                     ? 'bg-gradient-to-r from-[#9333ea] to-[#a855f7] hover:from-[#7c3aed] hover:to-[#9333ea] text-white shadow-sm hover:shadow transform hover:-translate-y-0.5' 
//                     : currentStep === 'joining'
//                     ? 'bg-emerald-500 text-white cursor-wait'
//                     : 'bg-purple-100 text-purple-400'
//                 }`}
//                 aria-label={currentStep === 'joining' ? "Joining session..." : "Join session. Press Enter to join."}
//                 tabIndex={0}
//               >
//                 {currentStep === 'joining' ? (
//                   <span className="flex items-center justify-center">
//                     <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
//                       <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
//                       <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
//                     </svg>
//                     Joining Session...
//                   </span>
//                 ) : (
//                   'Join Session'
//                 )}
//               </button>
              
//               <div className="pt-4 border-t border-gray-100">
//                 <p className="text-xs text-gray-500 text-center">
//                   {isLoadingAudio && currentStep === 'welcome' ? (
//                     <span className="text-purple-600 font-medium">
//                       🔊 Playing welcome message with Coqui TTS...
//                     </span>
//                   ) : isListening ? (
//                     <span className="text-red-600 font-medium">
//                       🎤 Speak your roll number now...
//                     </span>
//                   ) : currentStep === 'joining' ? (
//                     <span className="text-emerald-600 font-medium">
//                       🚀 Joining session...
//                     </span>
//                   ) : currentStep === 'listenNumber' ? (
//                     hasStartedVoiceFlow ? (
//                       <span className="font-medium">🎤 Ready to listen for your roll number • Tap anywhere for instructions</span>
//                     ) : (
//                       <span className="font-medium">🎤 Welcome message playing • Tap anywhere for instructions</span>
//                     )
//                   ) : (
//                     <span className="font-medium">Tap anywhere on the page to hear instructions</span>
//                   )}
//                 </p>
//                 {useCustomASR && (
//                   <p className="text-xs text-blue-600 text-center mt-1">
//                     <Wifi size={10} className="inline mr-1" />
//                     Using custom ASR backend for improved accuracy
//                   </p>
//                 )}
//                 <p className="text-xs text-gray-500 text-center mt-2">
//                   Press <span className="font-mono bg-gray-100 px-1 rounded">Tab</span> to navigate • <span className="font-mono bg-gray-100 px-1 rounded">Enter</span> to activate • <span className="font-mono bg-gray-100 px-1 rounded">F1</span> for help
//                 </p>
//               </div>
//             </div>
//           </div>
//         </div>
//       </main>

//       {/* Keyboard Navigation Controls */}
//       <KeyboardNavigation
//         onPrevious={handlePreviousNavigation}
//         onNext={handleNextNavigation}
//         onHome={handleHomeNavigation}
//         onHelp={handleHelpNavigation}
//       />

//       <Footer />
//     </div>
//   );
// };

// export default RollNumberVision;

import React, { useState, useRef, useEffect, type ChangeEvent} from 'react';
import { 
  CheckCircle,
  Globe,
  Shield,
  Accessibility,
  Users,
  Brain,
  User,
  Hash
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { API } from '../api/config';

// Navbar Component
const Navbar: React.FC = () => {
  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div 
              className="w-10 h-10 bg-gradient-to-br from-[#9333ea] to-[#a855f7] rounded-xl flex items-center justify-center shadow-md"
              role="button"
              aria-label="RollNumberVision Logo"
            >
              <Brain className="text-white" size={24} />
            </div>
            <span className="text-2xl font-bold text-gray-900">RollNumberVision</span>
          </div>
          <div className="flex items-center space-x-6">
            <button 
              className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:text-[#9333ea] transition-colors rounded-lg"
              aria-label="Accessibility settings"
            >
              <Accessibility size={20} />
              <span className="text-sm font-medium">Accessibility</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

// Footer Component
const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-50 border-t border-gray-200 mt-16">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <Brain className="text-[#9333ea]" size={24} />
              <span className="font-bold text-gray-900">RollNumberVision</span>
            </div>
            <p className="text-sm text-gray-600">Making student identification accessible for everyone.</p>
          </div>
          
          <div>
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
              <Globe size={16} className="mr-2 text-[#9333ea]" />
              Features
            </h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>Number Recognition</li>
              <li>Easy Input</li>
              <li>Session Management</li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
              <Shield size={16} className="mr-2 text-[#9333ea]" />
              Privacy
            </h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>Secure Data Handling</li>
              <li>Local Processing</li>
              <li>No Data Storage</li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
              <Users size={16} className="mr-2 text-[#9333ea]" />
              Support
            </h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>Help Guide</li>
              <li>Contact Support</li>
              <li>FAQs</li>
            </ul>
          </div>
        </div>
        
        <div className="pt-8 border-t border-gray-200 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-gray-600">© 2024 RollNumberVision. All rights reserved.</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a 
              href="#" 
              className="text-sm text-gray-600 hover:text-[#9333ea]"
            >
              Privacy Policy
            </a>
            <a 
              href="#" 
              className="text-sm text-gray-600 hover:text-[#9333ea]"
            >
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

// Main Component
const RollNumberVision: React.FC = () => {
  // State declarations
  const [rollNumber, setRollNumber] = useState<string>('');
  const [sessionCode, setSessionCode] = useState<string>('');
  const [currentStep, setCurrentStep] = useState<'input' | 'joining'>('input');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const inputRef = useRef<HTMLInputElement>(null);

  const navigate = useNavigate();

  // Extract session code from URL parameters on component mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const codeFromUrl = params.get('session') || params.get('code') || params.get('session_code');
    
    if (codeFromUrl) {
      const cleanedCode = codeFromUrl.trim().toUpperCase();
      setSessionCode(cleanedCode);
      console.log('Session code from URL:', cleanedCode);
    } else {
      console.log('No session code found in URL');
    }

    // Focus the input field on initial load
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, 1000);
  }, []);

  const handleRollNumberChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const value = e.target.value;
    setRollNumber(value);
  };

  const handleJoinSession = async (): Promise<void> => {
  const numberToJoin = rollNumber.trim();

  if (!numberToJoin) {
    alert("Please enter your roll number before joining.");
    return;
  }

  if (!sessionCode) {
    alert("Session code not found. Please use a valid session link.");
    return;
  }

  try {
    setCurrentStep('joining');
    setIsLoading(true);

    const response = await fetch(`${API.node}/api/participants/join-session`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        roll_number: numberToJoin,
        session_code: sessionCode,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Server error: ${response.status}`);
    }

    const result = await response.json();
    console.log('Participant joined successfully:', result);

    // ✅ IMPORTANT: Store participant ID and session ID for the quiz page
    const participantId = result.participantId || result.id;
    const sessionId = result.sessionId || sessionCode;

    // Store in localStorage for persistence
    localStorage.setItem('quizParticipantId', participantId);
    localStorage.setItem('quizSessionId', sessionId);

    // ✅ Navigate to the quiz play page
    navigate(`/session/${sessionId}`, {
      state: {
        participantId: participantId,
        sessionCode: sessionCode,
        rollNumber: numberToJoin
      }
    });

  } catch (error: any) {
    console.error('Failed to join session:', error);
    alert(`Failed to join session ${sessionCode}. ${error.message || 'Please try again.'}`);
    setCurrentStep('input');
  } finally {
    setIsLoading(false);
  }
};
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === 'Enter') {
      handleJoinSession();
    }
  };

  return (
    <div className="min-h-screen transition-all duration-300 bg-white">
      <Navbar />
      
      <main className="max-w-6xl mx-auto px-6 py-8">
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-8">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl mb-4">
                <User className="text-[#9333ea]" size={32} />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-3">
                Enter Your Roll Number
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Enter your roll number to join the session
              </p>
              {sessionCode && (
                <div className="mt-4 inline-flex items-center px-4 py-2 bg-purple-100 text-purple-800 rounded-lg">
                  <span className="font-medium">Session:</span>
                  <span className="ml-2 font-bold">{sessionCode}</span>
                </div>
              )}
            </div>

            {/* Step Progress */}
            <div className="max-w-xl mx-auto mb-6">
              <div className="flex items-center justify-between mb-4 px-4">
                <div className={`flex flex-col items-center ${currentStep === 'input' ? 'text-[#9333ea]' : 'text-gray-400'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep === 'input' ? 'bg-purple-100' : 'bg-gray-100'}`}>
                    1
                  </div>
                  <span className="text-xs mt-1">Enter Number</span>
                </div>
                <div className="flex-1 h-0.5 bg-gray-200 mx-2"></div>
                <div className={`flex flex-col items-center ${currentStep === 'joining' ? 'text-[#9333ea]' : 'text-gray-400'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep === 'joining' ? 'bg-purple-100' : 'bg-gray-100'}`}>
                    2
                  </div>
                  <span className="text-xs mt-1">Join</span>
                </div>
              </div>
            </div>

            {/* Input Section */}
            <div className="max-w-xl mx-auto mb-8 space-y-6">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label htmlFor="rollNumber" className="block text-sm font-medium text-gray-900">
                    Roll Number / Student ID
                  </label>
                </div>
                
                <div className="relative">
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                    <Hash size={20} className="text-gray-400" />
                  </div>
                  <input
                    ref={inputRef}
                    type="text"
                    id="rollNumber"
                    value={rollNumber}
                    onChange={handleRollNumberChange}
                    onKeyPress={handleKeyPress}
                    placeholder="Type your roll number"
                    className="w-full pl-12 pr-4 py-3 text-base bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#9333ea] focus:border-transparent transition-all text-gray-900 placeholder-gray-500"
                    aria-label="Roll number input field"
                  />
                  {rollNumber && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <CheckCircle className="text-emerald-600" size={20} />
                    </div>
                  )}
                </div>
                
                <div className="mt-2 mb-3">
                  <p className="text-xs text-gray-500">
                    Enter your roll number or student ID
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="max-w-xl mx-auto space-y-4">
              <button
                onClick={handleJoinSession}
                disabled={isLoading || !rollNumber.trim()}
                className={`w-full py-4 rounded-xl font-semibold text-base transition-all ${
                  !isLoading && rollNumber.trim()
                    ? 'bg-gradient-to-r from-[#9333ea] to-[#a855f7] hover:from-[#7c3aed] hover:to-[#9333ea] text-white shadow-sm hover:shadow transform hover:-translate-y-0.5' 
                    : 'bg-purple-100 text-purple-400 cursor-not-allowed'
                }`}
                aria-label={isLoading ? "Joining session..." : "Join session"}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Joining Session...
                  </span>
                ) : (
                  'Join Session'
                )}
              </button>
              
              <div className="pt-4 border-t border-gray-100">
                <p className="text-xs text-gray-500 text-center">
                  Press <span className="font-mono bg-gray-100 px-1 rounded">Enter</span> to submit
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default RollNumberVision;