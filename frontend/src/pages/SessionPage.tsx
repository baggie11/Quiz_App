// // components/QuizPlayPage.tsx
// import { useState, useEffect, useRef, useCallback } from 'react';
// import { useParams, useNavigate } from 'react-router-dom';
// import {
//   CheckCircle,
//   Clock,
//   Volume2,
//   Check,
//   AlertCircle,
//   Loader2,
//   ChevronRight,
//   Star,
//   ListChecks,
//   MessageSquare,
//   AlertTriangle,
//   RefreshCw,
//   Info
// } from 'lucide-react';
// import type { QType, Question } from '../types';

// /* ---------------------- API TYPES ---------------------- */

// interface ApiQuestionOption {
//   id: string;
//   is_correct: boolean;
//   option_text: string;
// }

// interface ApiQuestion {
//   id: string;
//   question_text: string;
//   order_index: number;
//   question_options?: ApiQuestionOption[];
//   rating_max?: number;
//   model_answer?: string;
//   multi_answers?: number[];
//   meta?: { required?: boolean; time_limit?: number; [k: string]: any };
// }

// interface ApiResponse {
//   status: string;
//   data: ApiQuestion[];
// }

// /* ---------------------- COMPONENT ---------------------- */

// const QuizPlayPage = () => {
//   const { sessionId, participantId } = useParams();
//   const navigate = useNavigate();

//   const [questions, setQuestions] = useState<Question[]>([]);
//   const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
//   const [selectedOptions, setSelectedOptions] = useState<number[]>([]);
//   const [ratingValue, setRatingValue] = useState(0);
//   const [openText, setOpenText] = useState('');
//   const [timeLeft, setTimeLeft] = useState<number | null>(null);
//   const [isAnswered, setIsAnswered] = useState(false);
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [isLoading, setIsLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [isInitialLoad, setIsInitialLoad] = useState(true);

//   /* ---------------------- TTS (BACKEND) ---------------------- */

//   const audioRef = useRef<HTMLAudioElement | null>(null);
//   const abortRef = useRef<AbortController | null>(null);
//   const hasSpokenRef = useRef(false);

//   const speak = useCallback(async (text: string) => {
//     try {
//       // Abort any ongoing TTS request
//       if (abortRef.current) {
//         abortRef.current.abort();
//       }
      
//       // Stop any currently playing audio
//       if (audioRef.current) {
//         audioRef.current.pause();
//         audioRef.current.currentTime = 0;
//       }

//       abortRef.current = new AbortController();

//       const res = await fetch('http://localhost:5000/tts', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ text }),
//         signal: abortRef.current.signal,
//       });

//       if (!res.ok) {
//         throw new Error(`TTS server responded with status: ${res.status}`);
//       }

//       const blob = await res.blob();
//       const url = URL.createObjectURL(blob);

//       const audio = new Audio(url);
//       audioRef.current = audio;
      
//       // Play the audio
//       await audio.play();
//       hasSpokenRef.current = true;
      
//       // Clean up the object URL after playback
//       audio.onended = () => {
//         URL.revokeObjectURL(url);
//       };
      
//     } catch (e) {
//       if ((e as any).name === 'AbortError') {
//         console.log('TTS request was aborted');
//       } else {
//         console.error('TTS error:', e);
//         // Fallback to browser speech synthesis if TTS server fails
//         if ('speechSynthesis' in window) {
//           const utterance = new SpeechSynthesisUtterance(text);
//           window.speechSynthesis.speak(utterance);
//           console.log('Using browser speech synthesis as fallback');
//         }
//       }
//     }
//   }, []);

//   const buildSpeech = (q: Question) => {
//     let speech = `Question. ${q.text}. `;

//     if (q.type === 'quiz' || q.type === 'multi') {
//       speech += 'Options are. ';
//       q.options?.forEach((o, i) => {
//         speech += `Option ${String.fromCharCode(65 + i)}. ${o}. `;
//       });
//     } else if (q.type === 'rating') {
//       speech += `Please rate from one to ${q.ratingMax || 5}.`;
//     } else {
//       speech += 'Please type your answer.';
//     }

//     return speech;
//   };

//   /* ---------------------- DATA FETCH ---------------------- */

//   useEffect(() => {
//     const fetchQuestions = async () => {
//       try {
//         const res = await fetch(`http://localhost:3000/api/sessions/${sessionId}/questions`);
//         if (!res.ok) {
//           throw new Error(`Failed to fetch questions: ${res.status}`);
//         }
        
//         const json: ApiResponse = await res.json();

//         const converted = json.data.map(q => ({
//           id: q.id,
//           text: q.question_text,
//           type: 'quiz' as QType,
//           options: q.question_options?.map(o => o.option_text),
//           correctAnswer: q.question_options?.findIndex(o => o.is_correct),
//           ratingMax: q.rating_max,
//           meta: q.meta
//         }));

//         setQuestions(converted);
//         setError(null);
//       } catch (e) {
//         console.error('Error fetching questions:', e);
//         setError('Failed to load questions. Please try again.');
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     fetchQuestions();
//   }, [sessionId]);

//   /* ---------------------- AUTO READ ON LOAD AND QUESTION CHANGE ---------------------- */

//   useEffect(() => {
//     // Don't read if still loading or no questions
//     if (isLoading || !questions.length) return;

//     const q = questions[currentQuestionIndex];
//     if (!q) return;

//     // Reset state for new question
//     setSelectedOptions([]);
//     setRatingValue(0);
//     setOpenText('');
//     setIsAnswered(false);
//     setTimeLeft(q.meta?.time_limit ?? null);

//     // Read the question aloud
//     const speechText = buildSpeech(q);
//     console.log('Reading question:', speechText);
//     speak(speechText);

//     // Mark initial load as complete after first read
//     if (isInitialLoad) {
//       setIsInitialLoad(false);
//     }

//   }, [currentQuestionIndex, questions, speak, isLoading, isInitialLoad]);

//   /* ---------------------- TIMER ---------------------- */

//   useEffect(() => {
//     if (timeLeft === null || timeLeft <= 0 || isAnswered) return;

//     const timer = setInterval(() => {
//       setTimeLeft(prev => {
//         if (prev === null || prev <= 1) {
//           clearInterval(timer);
//           if (!isAnswered) {
//             handleSubmit();
//           }
//           return 0;
//         }
//         return prev - 1;
//       });
//     }, 1000);

//     return () => clearInterval(timer);
//   }, [timeLeft, isAnswered]);

//   /* ---------------------- KEYBOARD SHORTCUTS ---------------------- */

//   useEffect(() => {
//     const handleKeyDown = (e: KeyboardEvent) => {
//       const q = questions[currentQuestionIndex];
//       if (!q) return;

//       // Re-read question on Q key press
//       if (e.key.toLowerCase() === 'q') {
//         e.preventDefault();
//         const speechText = buildSpeech(q);
//         speak(speechText);
//       }

//       // Submit on Ctrl+Enter
//       if (e.ctrlKey && e.key === 'Enter') {
//         e.preventDefault();
//         handleSubmit();
//       }
//     };

//     window.addEventListener('keydown', handleKeyDown);
//     return () => window.removeEventListener('keydown', handleKeyDown);
//   }, [questions, currentQuestionIndex, speak]);

//   /* ---------------------- SUBMIT HANDLER ---------------------- */

//   const handleSubmit = async () => {
//     if (isAnswered || isSubmitting) return;
    
//     const q = questions[currentQuestionIndex];
//     if (!q) return;

//     // Validate required questions
//     if (q.meta?.required) {
//       const hasAnswer = 
//         (q.type === 'quiz' && selectedOptions.length > 0) ||
//         (q.type === 'multi' && selectedOptions.length > 0) ||
//         (q.type === 'rating' && ratingValue > 0) ||
//         (q.type === 'open' && openText.trim().length > 0);
      
//       if (!hasAnswer) {
//         alert('This question is required. Please provide an answer.');
//         return;
//       }
//     }

//     setIsSubmitting(true);

//     try {
//       // Here you would typically send the answer to your backend
//       // For now, we'll just simulate an API call
//       await new Promise(resolve => setTimeout(resolve, 600));
      
//       setIsAnswered(true);
      
//       // Move to next question or completion page after a delay
//       setTimeout(() => {
//         if (currentQuestionIndex < questions.length - 1) {
//           setCurrentQuestionIndex(prev => prev + 1);
//         } else {
//           navigate(`/quiz-complete/${sessionId}/${participantId}`);
//         }
//       }, 1500);
      
//     } catch (error) {
//       console.error('Error submitting answer:', error);
//       alert('Failed to submit answer. Please try again.');
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   /* ---------------------- RENDER QUESTION BASED ON TYPE ---------------------- */

//   const renderQuestionContent = () => {
//     const q = questions[currentQuestionIndex];
    
//     switch (q.type) {
//       case 'quiz':
//       case 'multi':
//         return (
//           <div className="space-y-3">
//             {q.options?.map((option, index) => (
//               <button
//                 key={index}
//                 onClick={() => {
//                   if (q.type === 'multi') {
//                     setSelectedOptions(prev => 
//                       prev.includes(index) 
//                         ? prev.filter(i => i !== index)
//                         : [...prev, index]
//                     );
//                   } else {
//                     setSelectedOptions([index]);
//                   }
//                 }}
//                 disabled={isAnswered}
//                 className={`w-full p-4 text-left rounded-lg border-2 transition-all duration-200 ${
//                   selectedOptions.includes(index)
//                     ? 'border-indigo-500 bg-indigo-50'
//                     : 'border-gray-200 hover:border-indigo-300'
//                 } ${isAnswered ? 'opacity-80 cursor-not-allowed' : 'cursor-pointer'}`}
//               >
//                 <div className="flex items-center">
//                   <div className={`flex items-center justify-center w-8 h-8 rounded-full mr-3 ${
//                     selectedOptions.includes(index) 
//                       ? 'bg-indigo-600 text-white' 
//                       : 'bg-gray-100 text-gray-600'
//                   }`}>
//                     {String.fromCharCode(65 + index)}
//                   </div>
//                   <span className="text-lg">{option}</span>
//                   {selectedOptions.includes(index) && (
//                     <Check className="ml-auto text-indigo-600" size={20} />
//                   )}
//                 </div>
//               </button>
//             ))}
//           </div>
//         );

//       case 'rating':
//         return (
//           <div className="py-6">
//             <div className="flex justify-center space-x-2 mb-4">
//               {Array.from({ length: q.ratingMax || 5 }).map((_, index) => (
//                 <button
//                   key={index}
//                   onClick={() => setRatingValue(index + 1)}
//                   disabled={isAnswered}
//                   className={`p-3 rounded-lg transition-transform hover:scale-110 ${
//                     ratingValue >= index + 1 ? 'text-yellow-500' : 'text-gray-300'
//                   } ${isAnswered ? 'cursor-not-allowed' : ''}`}
//                 >
//                   <Star size={40} fill={ratingValue >= index + 1 ? 'currentColor' : 'none'} />
//                 </button>
//               ))}
//             </div>
//             <div className="text-center text-gray-600">
//               {ratingValue > 0 ? `Selected: ${ratingValue} star${ratingValue > 1 ? 's' : ''}` : 'Click a star to rate'}
//             </div>
//           </div>
//         );

//       case 'open':
//         return (
//           <div className="py-4">
//             <textarea
//               value={openText}
//               onChange={(e) => setOpenText(e.target.value)}
//               disabled={isAnswered}
//               placeholder="Type your answer here..."
//               className="w-full h-48 p-4 border-2 border-gray-300 rounded-lg resize-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none disabled:opacity-70 disabled:cursor-not-allowed"
//             />
//           </div>
//         );

//       default:
//         return <div>Unknown question type</div>;
//     }
//   };

//   /* ---------------------- LOADING STATE ---------------------- */

//   if (isLoading) {
//     return (
//       <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
//         <Loader2 className="animate-spin text-indigo-600 mb-4" size={48} />
//         <p className="text-gray-600 text-lg">Loading questions...</p>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6">
//         <AlertCircle className="text-red-500 mb-4" size={48} />
//         <h2 className="text-2xl font-bold text-gray-800 mb-2">Error</h2>
//         <p className="text-gray-600 text-center mb-6">{error}</p>
//         <button
//           onClick={() => window.location.reload()}
//           className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
//         >
//           <RefreshCw className="inline mr-2" size={20} />
//           Try Again
//         </button>
//       </div>
//     );
//   }

//   if (!questions.length) {
//     return (
//       <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
//         <Info className="text-gray-400 mb-4" size={48} />
//         <h2 className="text-2xl font-bold text-gray-800 mb-2">No Questions</h2>
//         <p className="text-gray-600">This quiz doesn't have any questions yet.</p>
//       </div>
//     );
//   }

//   const currentQuestion = questions[currentQuestionIndex];
//   const totalQuestions = questions.length;
//   const progress = ((currentQuestionIndex + 1) / totalQuestions) * 100;

//   return (
//     <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white p-4 md:p-8">
//       <div className="max-w-2xl mx-auto">
//         {/* Header */}
//         <div className="mb-8">
//           <div className="flex items-center justify-between mb-4">
//             <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
//               Question {currentQuestionIndex + 1} of {totalQuestions}
//             </h1>
//             <div className="flex items-center space-x-3">
//               {timeLeft !== null && (
//                 <div className="flex items-center px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full">
//                   <Clock size={18} className="mr-2" />
//                   <span className="font-bold">{timeLeft}s</span>
//                 </div>
//               )}
//               <button
//                 onClick={() => {
//                   const speechText = buildSpeech(currentQuestion);
//                   speak(speechText);
//                 }}
//                 className="flex items-center justify-center w-12 h-12 rounded-full bg-indigo-100 text-indigo-600 hover:bg-indigo-200 transition-colors"
//                 title="Re-read question (Press Q)"
//               >
//                 <Volume2 size={24} />
//               </button>
//             </div>
//           </div>

//           {/* Progress bar */}
//           <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
//             <div 
//               className="bg-indigo-600 h-2.5 rounded-full transition-all duration-300"
//               style={{ width: `${progress}%` }}
//             />
//           </div>
//           <div className="flex justify-between text-sm text-gray-600">
//             <span>Progress</span>
//             <span>{Math.round(progress)}%</span>
//           </div>
//         </div>

//         {/* Question card */}
//         <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 mb-6 border border-gray-100">
//           {/* Question text */}
//           <div className="mb-8">
//             <div className="flex items-start">
//               <div className="flex-shrink-0 mr-4">
//                 <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
//                   <MessageSquare className="text-indigo-600" size={20} />
//                 </div>
//               </div>
//               <div>
//                 <h2 className="text-xl md:text-2xl font-semibold text-gray-900 leading-relaxed">
//                   {currentQuestion.text}
//                 </h2>
//                 {currentQuestion.meta?.required && (
//                   <div className="inline-flex items-center mt-2 px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm">
//                     <AlertTriangle size={14} className="mr-1" />
//                     Required
//                   </div>
//                 )}
//               </div>
//             </div>
//           </div>

//           {/* Question content */}
//           {renderQuestionContent()}

//           {/* Submit button */}
//           <div className="mt-10">
//             <button
//               onClick={handleSubmit}
//               disabled={isAnswered || isSubmitting}
//               className={`w-full py-4 px-6 rounded-xl text-lg font-semibold transition-all duration-200 ${
//                 isAnswered || isSubmitting
//                   ? 'bg-green-600 text-white cursor-not-allowed'
//                   : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg hover:shadow-xl'
//               }`}
//             >
//               {isSubmitting ? (
//                 <>
//                   <Loader2 className="inline mr-2 animate-spin" size={20} />
//                   Submitting...
//                 </>
//               ) : isAnswered ? (
//                 <>
//                   <CheckCircle className="inline mr-2" size={20} />
//                   Submitted ✓
//                 </>
//               ) : (
//                 <>
//                   Submit Answer
//                   <ChevronRight className="inline ml-2" size={20} />
//                 </>
//               )}
//             </button>
//           </div>

//           {/* Instructions */}
//           <div className="mt-6 pt-6 border-t border-gray-100">
//             <div className="flex flex-wrap gap-3 text-sm text-gray-500">
//               <div className="flex items-center">
//                 <div className="bg-gray-100 px-2 py-1 rounded mr-2 font-mono">Q</div>
//                 <span>Re-read question</span>
//               </div>
//               <div className="flex items-center">
//                 <div className="bg-gray-100 px-2 py-1 rounded mr-2 font-mono">Ctrl+Enter</div>
//                 <span>Submit answer</span>
//               </div>
//               {currentQuestion.type === 'multi' && (
//                 <div className="flex items-center">
//                   <ListChecks size={16} className="mr-2" />
//                   <span>Multiple answers allowed</span>
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>

//         {/* Navigation */}
//         <div className="flex justify-between">
//           <button
//             onClick={() => {
//               if (currentQuestionIndex > 0) {
//                 setCurrentQuestionIndex(prev => prev - 1);
//               }
//             }}
//             disabled={currentQuestionIndex === 0}
//             className={`px-6 py-3 rounded-lg font-medium ${
//               currentQuestionIndex === 0
//                 ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
//                 : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
//             }`}
//           >
//             Previous
//           </button>
          
//           <div className="text-center text-gray-600">
//             Question {currentQuestionIndex + 1} of {totalQuestions}
//           </div>

//           <button
//             onClick={() => {
//               if (currentQuestionIndex < questions.length - 1) {
//                 setCurrentQuestionIndex(prev => prev + 1);
//               }
//             }}
//             disabled={currentQuestionIndex === questions.length - 1}
//             className={`px-6 py-3 rounded-lg font-medium ${
//               currentQuestionIndex === questions.length - 1
//                 ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
//                 : 'bg-indigo-600 text-white hover:bg-indigo-700'
//             }`}
//           >
//             Next
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default QuizPlayPage;