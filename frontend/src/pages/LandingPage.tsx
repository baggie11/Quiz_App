// import React, { useState, useEffect, useRef } from 'react';
// import { PipecatClient, type PipecatClientOptions, RTVIEvent } from '@pipecat-ai/client-js';
// import { WebSocketTransport } from '@pipecat-ai/websocket-transport';

// // Types
// interface QuestionOption {
//   option_text: string;
//   is_correct: boolean;
// }

// interface Question {
//   question_text: string;
//   question_options: QuestionOption[];
// }

// interface DebugEntry {
//   id: string;
//   timestamp: string;
//   message: string;
//   type: 'user' | 'bot' | 'success' | 'error' | 'info';
// }

// const QuizVoiceAgent: React.FC = () => {
//   // State Management
//   const [connectionStatus, setConnectionStatus] = useState<string>('Not connected');
//   const [isConnected, setIsConnected] = useState<boolean>(false);
//   const [isConnecting, setIsConnecting] = useState<boolean>(false);
//   const [questions, setQuestions] = useState<Question[]>([]);
//   const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
//   const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(-1);
//   const [debugLog, setDebugLog] = useState<DebugEntry[]>([
//     { id: '1', timestamp: new Date().toLocaleTimeString(), message: 'System initialized', type: 'info' }
//   ]);
//   const [focusedQuestionIndex, setFocusedQuestionIndex] = useState<number>(-1);

//   // Refs
//   const pcClient = useRef<PipecatClient | null>(null);
//   const botAudioRef = useRef<HTMLAudioElement>(null);
//   const questionsContainerRef = useRef<HTMLDivElement>(null);
//   const debugLogRef = useRef<HTMLDivElement>(null);

//   // 🔹 Hardcoded session code
//   const SESSION_CODE = "D9VW";

//   // Initialize audio element and auto-connect
//   useEffect(() => {
//     if (!botAudioRef.current) {
//       const audio = document.createElement('audio');
//       audio.autoplay = true;
//       document.body.appendChild(audio);
//       botAudioRef.current = audio;
//     }

//     // Auto-connect on page load
//     connect();
//   }, []);

//   // Scroll debug log to bottom when new entries are added
//   useEffect(() => {
//     if (debugLogRef.current) {
//       debugLogRef.current.scrollTop = debugLogRef.current.scrollHeight;
//     }
//   }, [debugLog]);

//   // Fetch questions from Node API
//   const fetchQuestionsFromAPI = async () => {
//     try {
//       addDebugLog('Fetching questions from API...', 'info');
      
//       const response = await fetch(`http://localhost:3000/api/sessions/${SESSION_CODE}/questions`);
      
//       if (response.ok) {
//         const data = await response.json();
//         if (data.status === 'ok' && data.data) {
//           setQuestions(data.data);
//           addDebugLog(`✅ Successfully fetched ${data.data.length} questions`, 'success');
//         } else {
//           addDebugLog('❌ Unexpected API response format', 'error');
//         }
//       } else {
//         addDebugLog(`❌ API returned status ${response.status}`, 'error');
//       }
//     } catch (error) {
//       addDebugLog(`❌ Error fetching questions: ${error}`, 'error');
//     }
//   };

//   // Add entry to debug log
//   const addDebugLog = (message: string, type: DebugEntry['type'] = 'info') => {
//     const newEntry: DebugEntry = {
//       id: Date.now().toString(),
//       timestamp: new Date().toLocaleTimeString(),
//       message,
//       type
//     };
//     setDebugLog(prev => [...prev, newEntry]);
//     console.log(`[${newEntry.timestamp}] ${message}`);
//   };

//   // Handle question click/selection
//   const handleQuestionClick = (index: number) => {
//     if (index >= 0 && index < questions.length) {
//       const question = questions[index];
//       setCurrentQuestion(question);
//       setCurrentQuestionIndex(index);
//       setFocusedQuestionIndex(index);
//       addDebugLog(`Selected question ${index + 1}: ${question.question_text}`, 'info');
//       speakQuestion(question);
//     }
//   };

//   // Speak question using Web Speech API
//   const speakQuestion = (question: Question) => {
//     if ('speechSynthesis' in window) {
//       const speech = new SpeechSynthesisUtterance();
      
//       let speechText = `Question: ${question.question_text}. Options: `;
//       question.question_options.forEach((option, index) => {
//         const prefix = String.fromCharCode(65 + index);
//         speechText += `${prefix}) ${option.option_text}. `;
//       });
      
//       speech.text = speechText;
//       speech.rate = 1;
//       speech.pitch = 1;
//       speech.volume = 1;
      
//       window.speechSynthesis.cancel();
//       window.speechSynthesis.speak(speech);
      
//       addDebugLog(`Speaking question: ${question.question_text}`, 'info');
//     } else {
//       addDebugLog('Speech synthesis not supported in this browser', 'warning');
//     }
//   };

//   // Handle keyboard navigation for questions
//   const handleKeyDown = (e: React.KeyboardEvent) => {
//     if (questions.length === 0) return;

//     switch(e.key) {
//       case 'ArrowDown':
//         e.preventDefault();
//         const nextIndex = Math.min(focusedQuestionIndex + 1, questions.length - 1);
//         setFocusedQuestionIndex(nextIndex);
//         break;
        
//       case 'ArrowUp':
//         e.preventDefault();
//         const prevIndex = Math.max(focusedQuestionIndex - 1, 0);
//         setFocusedQuestionIndex(prevIndex);
//         break;
        
//       case 'Enter':
//       case ' ':
//         if (focusedQuestionIndex >= 0) {
//           e.preventDefault();
//           handleQuestionClick(focusedQuestionIndex);
//         }
//         break;
//     }
//   };

//   // Get or create user ID
//   const getOrCreateUserId = (): string => {
//     let userId = localStorage.getItem('pipecat_user_id');
//     if (!userId) {
//       userId = 'user_' + Math.random().toString(36).substr(2, 9);
//       localStorage.setItem('pipecat_user_id', userId);
//     }
//     return userId;
//   };

//   // Connect to Pipecat bot
//   const connect = async () => {
//     if (isConnecting || isConnected) return;

//     try {
//       setIsConnecting(true);
//       addDebugLog('Initializing connection...', 'info');

//       // Fetch questions first
//       await fetchQuestionsFromAPI();

//       const PipecatConfig: PipecatClientOptions = {
//         transport: new WebSocketTransport(),
//         enableMic: true,
//         enableCam: false,
//         callbacks: {
//           onConnected: () => {
//             setConnectionStatus('Connected');
//             setIsConnected(true);
//             addDebugLog(`✅ Connected to session: ${SESSION_CODE}`, 'success');
//           },
//           onDisconnected: () => {
//             setConnectionStatus('Disconnected');
//             setIsConnected(false);
//             setCurrentQuestionIndex(-1);
//             addDebugLog('Client disconnected', 'info');
//           },
//           onBotReady: (data) => {
//             addDebugLog(`Bot ready: ${JSON.stringify(data)}`, 'info');
//           },
//           onUserTranscript: (data) => {
//             if (data.final) {
//               addDebugLog(`User: ${data.text}`, 'user');
//             }
//           },
//           onBotTranscript: (data) => {
//             addDebugLog(`Bot: ${data.text}`, 'bot');
            
//             // Detect if bot is asking a question
//             if (data.text.includes('?')) {
//               addDebugLog('Bot is asking a question', 'info');
//             }
//           },
//           onMessageError: (error) => addDebugLog(`Message error: ${error}`, 'error'),
//           onError: (error) => addDebugLog(`Error: ${error}`, 'error'),
//         },
//       };

//       pcClient.current = new PipecatClient(PipecatConfig);

//       // Setup track listeners
//       // @ts-ignore - Accessing private method
//       pcClient.current.on('trackStarted', (track: MediaStreamTrack, participant: any) => {
//         if (!participant?.local && track.kind === 'audio' && botAudioRef.current) {
//           if (botAudioRef.current.srcObject) {
//             const oldTrack = (botAudioRef.current.srcObject as MediaStream).getAudioTracks()[0];
//             if (oldTrack?.id === track.id) return;
//           }
//           botAudioRef.current.srcObject = new MediaStream([track]);
//           addDebugLog('Audio track set up', 'info');
//         }
//       });

//       addDebugLog('Initializing devices...', 'info');
//       await pcClient.current.initDevices();

//       addDebugLog(`Connecting to bot with session: ${SESSION_CODE}...`, 'info');

//       await pcClient.current.startBotAndConnect({
//         endpoint: 'http://localhost:7860/connect',
//         requestData: {
//           sessionCode: SESSION_CODE,
//           userId: getOrCreateUserId(),
//           timestamp: new Date().toISOString()
//         }
//       });

//       setIsConnecting(false);
//       addDebugLog('Connection established', 'success');

//     } catch (error) {
//       addDebugLog(`Error connecting: ${error}`, 'error');
//       setConnectionStatus('Error');
//       setIsConnecting(false);
//       setIsConnected(false);
      
//       if (pcClient.current) {
//         try {
//           await pcClient.current.disconnect();
//         } catch (disconnectError) {
//           addDebugLog(`Error during disconnect: ${disconnectError}`, 'error');
//         }
//       }
//     }
//   };
// //   const connect = async () => {
// //   if (isConnecting || isConnected) return;

// //   try {
// //     setIsConnecting(true);
// //     addDebugLog('Initializing connection...', 'info');

// //     // Fetch questions first
// //     await fetchQuestionsFromAPI();

// //     // Use WebSocket protocol, not HTTP
// //     const wsEndpoint = 'http://localhost:7860/connect'; // Changed from http:// to ws://

// //     const PipecatConfig: PipecatClientOptions = {
// //       transport: new WebSocketTransport(),
// //       enableMic: true,
// //       enableCam: false,
// //       callbacks: {
// //         onConnected: () => {
// //           setConnectionStatus('Connected');
// //           setIsConnected(true);
// //           addDebugLog(`✅ Connected to session: ${SESSION_CODE}`, 'success');
// //         },
// //         onDisconnected: () => {
// //           setConnectionStatus('Disconnected');
// //           setIsConnected(false);
// //           setCurrentQuestionIndex(-1);
// //           addDebugLog('Client disconnected', 'info');
// //         },
// //         onBotReady: (data) => {
// //           addDebugLog(`Bot ready: ${JSON.stringify(data)}`, 'info');
// //         },
// //         onUserTranscript: (data) => {
// //           if (data.final) {
// //             addDebugLog(`User: ${data.text}`, 'user');
// //           }
// //         },
// //         onBotTranscript: (data) => {
// //           addDebugLog(`Bot: ${data.text}`, 'bot');
          
// //           // Detect if bot is asking a question
// //           if (data.text.includes('?')) {
// //             addDebugLog('Bot is asking a question', 'info');
// //           }
// //         },
// //         onMessageError: (error) => {
// //           addDebugLog(`Message error: ${error}`, 'error');
// //         },
// //         onError: (error) => {
// //           addDebugLog(`Error: ${error}`, 'error');
// //         },
// //         // Add transport error handler
// //         onTransportError: (error) => {
// //           addDebugLog(`Transport error: ${error}`, 'error');
// //         }
// //       },
// //     };

// //     // Store client in a local variable first
// //     const client = new PipecatClient(PipecatConfig);
// //     pcClient.current = client;

// //     // Setup track listeners
// //     // @ts-ignore - Accessing private method
// //     client.on('trackStarted', (track: MediaStreamTrack, participant: any) => {
// //       if (!participant?.local && track.kind === 'audio' && botAudioRef.current) {
// //         if (botAudioRef.current.srcObject) {
// //           const oldTrack = (botAudioRef.current.srcObject as MediaStream).getAudioTracks()[0];
// //           if (oldTrack?.id === track.id) return;
// //         }
// //         botAudioRef.current.srcObject = new MediaStream([track]);
// //         addDebugLog('Audio track set up', 'info');
// //       }
// //     });

// //     addDebugLog('Initializing devices...', 'info');
// //     await client.initDevices();

// //     addDebugLog(`Connecting to bot with session: ${SESSION_CODE}...`, 'info');

// //     // Use the WebSocket endpoint
// //     await client.startBotAndConnect({
// //       endpoint: wsEndpoint, // Use WebSocket URL
// //       requestData: {
// //         sessionCode: SESSION_CODE,
// //         userId: getOrCreateUserId(),
// //         timestamp: new Date().toISOString()
// //       }
// //     });

// //     setIsConnecting(false);
// //     addDebugLog('Connection established', 'success');

// //   } catch (error) {
// //     addDebugLog(`Error connecting: ${error}`, 'error');
// //     setConnectionStatus('Error');
    
// //     // Safely disconnect
// //     if (pcClient.current) {
// //       const clientToDisconnect = pcClient.current;
// //       // Set to null before attempting disconnect to prevent race conditions
// //       pcClient.current = null;
      
// //       try {
// //         await clientToDisconnect.disconnect();
// //       } catch (disconnectError) {
// //         addDebugLog(`Error during disconnect: ${disconnectError}`, 'error');
// //       }
// //     }
    
// //     setIsConnecting(false);
// //     setIsConnected(false);
// //   }
// // };

//   // Disconnect from Pipecat bot
//   const disconnect = async () => {
//     if (pcClient.current) {
//       try {
//         await pcClient.current.disconnect();
//         pcClient.current = null;
//         setIsConnected(false);
//         setConnectionStatus('Disconnected');
//         addDebugLog('Disconnected from bot', 'info');
        
//         if (botAudioRef.current && botAudioRef.current.srcObject) {
//           (botAudioRef.current.srcObject as MediaStream).getTracks().forEach(track => track.stop());
//           botAudioRef.current.srcObject = null;
//         }
//       } catch (error) {
//         addDebugLog(`Error disconnecting: ${error}`, 'error');
//       }
//     }
//   };

//   // Handle refresh questions
//   const handleRefreshQuestions = () => {
//     fetchQuestionsFromAPI();
//   };

//   // Render question options
//   const renderQuestionOptions = (question: Question) => {
//     return question.question_options.map((option, index) => {
//       const prefix = String.fromCharCode(65 + index);
//       return (
//         <div 
//           key={index} 
//           className={`flex items-center gap-3 p-3 rounded border ${option.is_correct ? 'bg-green-50 border-green-200 border-l-4 border-l-green-500' : 'bg-gray-50 border-gray-200'}`}
//         >
//           <div className={`w-8 h-8 flex items-center justify-center rounded-full text-sm font-medium ${option.is_correct ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-700'}`}>
//             {prefix}
//           </div>
//           <div className={`flex-1 ${option.is_correct ? 'text-green-700 font-medium' : 'text-gray-700'}`}>
//             {option.option_text}
//           </div>
//           {option.is_correct && (
//             <span className="text-xs font-medium bg-green-100 text-green-800 px-2 py-1 rounded">
//               Correct
//             </span>
//           )}
//         </div>
//       );
//     });
//   };

//   // Render debug log entries
//   const renderDebugEntries = () => {
//     return debugLog.map((entry) => {
//       const textColor = {
//         user: 'text-blue-600',
//         bot: 'text-gray-800',
//         success: 'text-green-600 font-medium',
//         error: 'text-red-600 font-medium',
//         info: 'text-gray-600'
//       }[entry.type];

//       return (
//         <div key={entry.id} className={`py-2 border-b border-gray-100 ${textColor}`}>
//           <span className="text-xs text-gray-400 mr-2">[{entry.timestamp}]</span>
//           {entry.message}
//         </div>
//       );
//     });
//   };

//   return (
//     // Main container with professional background and layout
//     <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
//       <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        
//         {/* Left Column - Controls and Debug */}
//         <div className="lg:col-span-1 space-y-6">
          
//           {/* Control Panel Card */}
//           <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
//             <div className="px-6 py-4 border-b border-gray-100">
//               <h2 className="text-xl font-semibold text-gray-800">Quiz Voice Agent</h2>
//               <div className="text-sm text-gray-500 mt-1">
//                 Session: <span className="font-medium text-blue-600">{SESSION_CODE}</span>
//               </div>
//             </div>
            
//             <div className="p-6 space-y-6">
//               {/* Connection Buttons */}
//               <div className="flex gap-3">
//                 <button
//                   onClick={connect}
//                   disabled={isConnecting || isConnected}
//                   className={`flex-1 px-6 py-3 rounded-lg font-medium transition-all ${
//                     isConnecting || isConnected
//                       ? 'bg-blue-100 text-blue-400 cursor-not-allowed'
//                       : 'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800'
//                   }`}
//                 >
//                   {isConnecting ? (
//                     <span className="flex items-center justify-center gap-2">
//                       <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
//                         <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
//                         <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
//                       </svg>
//                       Connecting...
//                     </span>
//                   ) : 'Connect to Quiz'}
//                 </button>
                
//                 <button
//                   onClick={disconnect}
//                   disabled={!isConnected}
//                   className={`flex-1 px-6 py-3 rounded-lg font-medium transition-all ${
//                     !isConnected
//                       ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
//                       : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 active:bg-gray-100'
//                   }`}
//                 >
//                   Disconnect
//                 </button>
//               </div>

//               {/* Status Display */}
//               <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
//                 <div className="text-sm text-gray-500 mb-1">Connection Status</div>
//                 <div className={`text-lg font-medium ${
//                   connectionStatus === 'Connected' ? 'text-green-600' :
//                   connectionStatus === 'Error' ? 'text-red-600' :
//                   'text-gray-700'
//                 }`}>
//                   {connectionStatus}
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* Current Question Card */}
//           <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl shadow-lg border border-blue-100 overflow-hidden">
//             <div className="px-6 py-4 border-b border-blue-200">
//               <h3 className="text-lg font-semibold text-blue-800 flex items-center gap-2">
//                 <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
//                   <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
//                 </svg>
//                 Current Question
//               </h3>
//             </div>
            
//             <div className="p-6">
//               {currentQuestion ? (
//                 <div className="space-y-4">
//                   <div className="bg-white rounded-lg p-5 border border-blue-200 shadow-sm">
//                     <div className="text-sm font-medium text-blue-600 mb-1">
//                       Q{currentQuestionIndex + 1}
//                     </div>
//                     <div className="text-gray-800 font-medium mb-4">
//                       {currentQuestion.question_text}
//                     </div>
//                     <div className="space-y-3">
//                       {renderQuestionOptions(currentQuestion)}
//                     </div>
//                   </div>
                  
//                   <button
//                     onClick={() => speakQuestion(currentQuestion)}
//                     className="w-full py-2.5 bg-white border border-blue-300 text-blue-600 rounded-lg font-medium hover:bg-blue-50 transition-colors flex items-center justify-center gap-2"
//                   >
//                     <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
//                       <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414z" clipRule="evenodd" />
//                     </svg>
//                     Speak Question Again
//                   </button>
//                 </div>
//               ) : (
//                 <div className="text-center py-8">
//                   <div className="text-gray-400 mb-2">
//                     <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
//                     </svg>
//                   </div>
//                   <p className="text-gray-500">No active question yet...</p>
//                 </div>
//               )}
//             </div>
//           </div>

//           {/* Debug Log Card */}
//           <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
//             <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
//               <h4 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
//                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
//                 </svg>
//                 Activity Log
//               </h4>
//             </div>
            
//             <div 
//               ref={debugLogRef}
//               className="h-64 overflow-y-auto p-4 bg-gray-900 text-sm font-mono"
//             >
//               {renderDebugEntries()}
//             </div>
//           </div>
//         </div>

//         {/* Right Column - Questions List */}
//         <div className="lg:col-span-2">
//           <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden h-full">
//             <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
//               <div>
//                 <h2 className="text-xl font-semibold text-gray-800">Quiz Questions</h2>
//                 <p className="text-sm text-gray-500 mt-1">
//                   Session: <span className="font-medium">{SESSION_CODE}</span> • {questions.length} questions
//                 </p>
//               </div>
              
//               <button
//                 onClick={handleRefreshQuestions}
//                 className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors flex items-center gap-2 text-sm"
//               >
//                 <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
//                 </svg>
//                 Refresh Questions
//               </button>
//             </div>
            
//             <div 
//               ref={questionsContainerRef}
//               onKeyDown={handleKeyDown}
//               tabIndex={0}
//               className="p-6 overflow-y-auto h-[calc(100vh-250px)]"
//             >
//               {questions.length === 0 ? (
//                 <div className="text-center py-12">
//                   <div className="text-gray-300 mb-4">
//                     <svg className="w-24 h-24 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
//                     </svg>
//                   </div>
//                   <h3 className="text-lg font-medium text-gray-700 mb-2">No Questions Loaded</h3>
//                   <p className="text-gray-500 max-w-md mx-auto">
//                     The system will auto-connect and load questions when the page loads.
//                   </p>
//                 </div>
//               ) : (
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                   {questions.map((question, index) => (
//                     <div
//                       key={index}
//                       onClick={() => handleQuestionClick(index)}
//                       onFocus={() => setFocusedQuestionIndex(index)}
//                       tabIndex={0}
//                       role="button"
//                       aria-label={`Question ${index + 1}: ${question.question_text}`}
//                       className={`bg-white rounded-xl border-2 p-5 cursor-pointer transition-all hover:shadow-lg ${
//                         index === focusedQuestionIndex ? 'ring-2 ring-blue-500 ring-offset-2' : ''
//                       } ${
//                         index === currentQuestionIndex 
//                           ? 'border-blue-500 bg-blue-50' 
//                           : 'border-gray-200 hover:border-blue-300'
//                       }`}
//                     >
//                       <div className="flex items-start gap-3 mb-4">
//                         <div className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold ${
//                           index === currentQuestionIndex
//                             ? 'bg-blue-500 text-white'
//                             : 'bg-gray-100 text-gray-700'
//                         }`}>
//                           {index + 1}
//                         </div>
//                         <div>
//                           <h4 className="font-medium text-gray-800 line-clamp-2">
//                             {question.question_text}
//                           </h4>
//                           <div className="text-xs text-gray-500 mt-1">
//                             {question.question_options.length} options • {question.question_options.filter(o => o.is_correct).length} correct
//                           </div>
//                         </div>
//                       </div>
                      
//                       <div className="space-y-2">
//                         {question.question_options.slice(0, 2).map((option, optIndex) => {
//                           const prefix = String.fromCharCode(65 + optIndex);
//                           return (
//                             <div key={optIndex} className="flex items-center gap-2">
//                               <div className={`w-6 h-6 rounded flex items-center justify-center text-xs ${
//                                 option.is_correct 
//                                   ? 'bg-green-100 text-green-700' 
//                                   : 'bg-gray-100 text-gray-600'
//                               }`}>
//                                 {prefix}
//                               </div>
//                               <span className="text-sm text-gray-600 truncate">
//                                 {option.option_text}
//                               </span>
//                               {option.is_correct && (
//                                 <svg className="w-4 h-4 text-green-500 ml-auto" fill="currentColor" viewBox="0 0 20 20">
//                                   <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
//                                 </svg>
//                               )}
//                             </div>
//                           );
//                         })}
                        
//                         {question.question_options.length > 2 && (
//                           <div className="text-xs text-gray-500 pt-2">
//                             +{question.question_options.length - 2} more options...
//                           </div>
//                         )}
//                       </div>
                      
//                       <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
//                         <button
//                           onClick={(e) => {
//                             e.stopPropagation();
//                             handleQuestionClick(index);
//                           }}
//                           className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
//                         >
//                           <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
//                             <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
//                           </svg>
//                           Speak This Question
//                         </button>
                        
//                         <div className="text-xs text-gray-400">
//                           Press Enter or Space to select
//                         </div>
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default QuizVoiceAgent;

import React, { useState, useEffect, useRef } from 'react';
import { PipecatClient, type PipecatClientOptions} from '@pipecat-ai/client-js'; // , RTVIEvent 
import { WebSocketTransport } from '@pipecat-ai/websocket-transport';
import { 
  Mic, MicOff, MessageSquare, 
   XCircle, HelpCircle, RefreshCw,
  Eye, LogIn,
 
  Terminal
} from 'lucide-react';

// Types
interface QuestionOption {
  option_text: string;
  is_correct: boolean;
}

interface Question {
  question_text: string;
  question_options: QuestionOption[];
}

interface DebugEntry {
  id: string;
  timestamp: string;
  message: string;
  type: 'user' | 'bot' | 'success' | 'error' | 'info';
}

const QuizVoiceAgent: React.FC = () => {
  // State Management
  const [connectionStatus, setConnectionStatus] = useState<string>('Not connected');
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [debugLog, setDebugLog] = useState<DebugEntry[]>([
    { id: '1', timestamp: new Date().toLocaleTimeString(), message: 'System initialized', type: 'info' }
  ]);
  const [showDebug, setShowDebug] = useState<boolean>(false);

  // Refs
  const pcClient = useRef<PipecatClient | null>(null);
  const botAudioRef = useRef<HTMLAudioElement>(null);
  const debugLogRef = useRef<HTMLDivElement>(null);

  // Hardcoded session code
  const SESSION_CODE = "D9VW";

  // Initialize audio element and auto-connect
  useEffect(() => {
    if (!botAudioRef.current) {
      const audio = document.createElement('audio');
      audio.autoplay = true;
      document.body.appendChild(audio);
      botAudioRef.current = audio;
    }

    connect();
  }, []);

  // Scroll debug log to bottom when new entries are added
  useEffect(() => {
    if (debugLogRef.current) {
      debugLogRef.current.scrollTop = debugLogRef.current.scrollHeight;
    }
  }, [debugLog]);

  // Fetch questions from Node API (console only)
  const fetchQuestionsFromAPI = async () => {
    try {
      addDebugLog('Fetching questions from API...', 'info');
      
      const response = await fetch(`http://localhost:3000/api/sessions/${SESSION_CODE}/questions`);
      
      if (response.ok) {
        const data = await response.json();
        if (data.status === 'ok' && data.data) {
          setQuestions(data.data);
          
          // Console logging only - no frontend display
          console.log('\n📋 ========== QUIZ QUESTIONS LOADED ==========');
          console.log(`Session: ${SESSION_CODE}`);
          console.log(`Total Questions: ${data.data.length}`);
          console.log('==========================================\n');
          
          data.data.forEach((q: Question, idx: number) => {
            console.log(`📝 Question ${idx + 1}: ${q.question_text}`);
            console.log('Options:');
            q.question_options.forEach((opt, optIdx) => {
              const marker = opt.is_correct ? '✅' : '○';
              console.log(`   ${marker} ${String.fromCharCode(65 + optIdx)}) ${opt.option_text}`);
            });
            console.log('------------------------------------------\n');
          });
          
          console.log('✅ Questions fetched successfully (console only)');
          
          addDebugLog(`✅ Loaded ${data.data.length} questions`, 'success');
        } else {
          addDebugLog('❌ Unexpected API response format', 'error');
        }
      } else {
        addDebugLog(`❌ API returned status ${response.status}`, 'error');
      }
    } catch (error) {
      addDebugLog(`❌ Error fetching questions: ${error}`, 'error');
    }
  };

  // Add entry to debug log
  const addDebugLog = (message: string, type: DebugEntry['type'] = 'info') => {
    const newEntry: DebugEntry = {
      id: Date.now().toString(),
      timestamp: new Date().toLocaleTimeString(),
      message,
      type
    };
    setDebugLog(prev => [...prev, newEntry]);
    console.log(`[${newEntry.timestamp}] ${message}`);
  };

  // Get or create user ID
  const getOrCreateUserId = (): string => {
    let userId = localStorage.getItem('pipecat_user_id');
    if (!userId) {
      userId = 'user_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('pipecat_user_id', userId);
    }
    return userId;
  };

  // Toggle mute
  const toggleMute = () => {
    setIsMuted(!isMuted);
    addDebugLog(isMuted ? 'Microphone unmuted' : 'Microphone muted', 'info');
  };

  // Connect to Pipecat bot
  const connect = async () => {
    if (isConnecting || isConnected) return;

    try {
      setIsConnecting(true);
      addDebugLog('Initializing connection...', 'info');

      // Fetch questions first
      await fetchQuestionsFromAPI();

      const PipecatConfig: PipecatClientOptions = {
        transport: new WebSocketTransport(),
        enableMic: true,
        enableCam: false,
        callbacks: {
          onConnected: () => {
            setConnectionStatus('Connected');
            setIsConnected(true);
            addDebugLog(`✅ Connected to session: ${SESSION_CODE}`, 'success');
          },
          onDisconnected: () => {
            setConnectionStatus('Disconnected');
            setIsConnected(false);
            setIsSpeaking(false);
            addDebugLog('Client disconnected', 'info');
          },
          onBotReady: (data) => {
            addDebugLog(`Bot ready`, 'info');
          },
          onUserTranscript: (data) => {
            if (data.final) {
              addDebugLog(`You: ${data.text}`, 'user');
            }
          },
          onBotTranscript: (data) => {
            addDebugLog(`Bot: ${data.text}`, 'bot');
            setIsSpeaking(true);
            
            setTimeout(() => setIsSpeaking(false), 2000);
            
            if (data.text.includes('?')) {
              addDebugLog('Bot is asking a question', 'info');
            }
          },
          onMessageError: (error) => addDebugLog(`Message error: ${error}`, 'error'),
          onError: (error) => addDebugLog(`Error: ${error}`, 'error'),
        },
      };

      pcClient.current = new PipecatClient(PipecatConfig);

      // @ts-ignore - Accessing private method
      pcClient.current.on('trackStarted', (track: MediaStreamTrack, participant: any) => {
        if (!participant?.local && track.kind === 'audio' && botAudioRef.current) {
          if (botAudioRef.current.srcObject) {
            const oldTrack = (botAudioRef.current.srcObject as MediaStream).getAudioTracks()[0];
            if (oldTrack?.id === track.id) return;
          }
          botAudioRef.current.srcObject = new MediaStream([track]);
          addDebugLog('Audio track set up', 'info');
        }
      });

      addDebugLog('Initializing devices...', 'info');
      await pcClient.current.initDevices();

      addDebugLog(`Connecting to bot with session: ${SESSION_CODE}...`, 'info');

      await pcClient.current.startBotAndConnect({
        endpoint: 'http://localhost:7860/connect',
        requestData: {
          sessionCode: SESSION_CODE,
          userId: getOrCreateUserId(),
          timestamp: new Date().toISOString()
        }
      });

      setIsConnecting(false);
      addDebugLog('Connection established', 'success');

    } catch (error) {
      addDebugLog(`Error connecting: ${error}`, 'error');
      setConnectionStatus('Error');
      setIsConnecting(false);
      setIsConnected(false);
      
      if (pcClient.current) {
        try {
          await pcClient.current.disconnect();
        } catch (disconnectError) {
          addDebugLog(`Error during disconnect: ${disconnectError}`, 'error');
        }
      }
    }
  };

  // Disconnect from Pipecat bot
  const disconnect = async () => {
    if (pcClient.current) {
      try {
        await pcClient.current.disconnect();
        pcClient.current = null;
        setIsConnected(false);
        setIsSpeaking(false);
        setConnectionStatus('Disconnected');
        addDebugLog('Disconnected from bot', 'info');
        
        if (botAudioRef.current && botAudioRef.current.srcObject) {
          (botAudioRef.current.srcObject as MediaStream).getTracks().forEach(track => track.stop());
          botAudioRef.current.srcObject = null;
        }
      } catch (error) {
        addDebugLog(`Error disconnecting: ${error}`, 'error');
      }
    }
  };

  // Render debug log entries
  const renderDebugEntries = () => {
    return debugLog.map((entry) => {
      const textColor = {
        user: 'text-blue-600',
        bot: 'text-emerald-600',
        success: 'text-green-600 font-medium',
        error: 'text-rose-600 font-medium',
        info: 'text-slate-600'
      }[entry.type];

      const bgColor = {
        user: 'bg-blue-50',
        bot: 'bg-emerald-50',
        success: 'bg-green-50',
        error: 'bg-rose-50',
        info: 'bg-slate-50'
      }[entry.type];

      return (
        <div key={entry.id} className={`py-2 px-3 text-sm ${textColor} ${bgColor} rounded-lg mb-1.5`}>
          <span className="text-slate-400 text-xs mr-2">[{entry.timestamp}]</span>
          {entry.message}
        </div>
      );
    });
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header with QuizVision branding */}
      <div className="border-b border-slate-200 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-slate-100 p-2">
                <Eye size={20} className="text-slate-600" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-slate-900">QuizVision Voice Agent</h1>
                <p className="text-xs text-slate-500">Session • {SESSION_CODE}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium ${
                isConnected 
                  ? 'bg-emerald-50 text-emerald-700' 
                  : 'bg-slate-100 text-slate-600'
              }`}>
                <div className={`h-2 w-2 rounded-full ${isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`}></div>
                {isConnected ? 'Connected' : 'Disconnected'}
              </div>
            </div>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column - Voice Interface */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* Voice Control Card */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex flex-col items-center">
                {/* Animated Mic Circle */}
                <div className="relative mb-6">
                  <div className={`absolute inset-0 rounded-full transition-all duration-500 ${
                    isSpeaking 
                      ? 'animate-ping bg-emerald-200' 
                      : isConnected 
                        ? 'animate-pulse bg-blue-200' 
                        : ''
                  }`}></div>
                  <div className={`relative flex h-32 w-32 items-center justify-center rounded-full border-4 transition-all ${
                    isSpeaking
                      ? 'border-emerald-500 bg-emerald-50'
                      : isConnected
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-slate-200 bg-slate-100'
                  }`}>
                    {isMuted ? (
                      <MicOff size={48} className="text-rose-500" />
                    ) : (
                      <Mic size={48} className={isSpeaking ? 'text-emerald-600' : 'text-slate-600'} />
                    )}
                  </div>
                </div>

                {/* Status Text */}
                <div className="text-center mb-6">
                  <h3 className="text-lg font-semibold text-slate-900 mb-1">
                    {isSpeaking ? 'Speaking...' : isConnected ? 'Ready to Listen' : 'Not Connected'}
                  </h3>
                  <p className="text-sm text-slate-500">
                    {isConnected 
                      ? 'Ask questions verbally about the quiz' 
                      : 'Connect to start the voice session'}
                  </p>
                </div>

                {/* Connection Controls */}
                <div className="w-full space-y-3">
                  {!isConnected ? (
                    <button
                      onClick={connect}
                      disabled={isConnecting}
                      className={`w-full rounded-xl px-4 py-3 text-sm font-medium transition flex items-center justify-center gap-2 ${
                        isConnecting
                          ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                          : 'bg-slate-900 text-white hover:bg-slate-800 focus:ring-2 focus:ring-slate-900/20'
                      }`}
                    >
                      {isConnecting ? (
                        <>
                          <RefreshCw size={16} className="animate-spin" />
                          Connecting...
                        </>
                      ) : (
                        <>
                          <LogIn size={16} />
                          Connect to Voice Agent
                        </>
                      )}
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={toggleMute}
                        className={`w-full rounded-xl px-4 py-3 text-sm font-medium transition flex items-center justify-center gap-2 ${
                          isMuted
                            ? 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        {isMuted ? (
                          <>
                            <MicOff size={16} />
                            Unmute Microphone
                          </>
                        ) : (
                          <>
                            <Mic size={16} />
                            Mute Microphone
                          </>
                        )}
                      </button>
                      
                      <button
                        onClick={disconnect}
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-600 transition hover:bg-slate-50 flex items-center justify-center gap-2"
                      >
                        <XCircle size={16} />
                        Disconnect
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Session Info Card */}
           

            {/* How to Use Card */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
                <HelpCircle size={16} className="text-slate-600" />
                How to Use
              </h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-100 text-xs font-medium text-slate-600">1</div>
                  <span className="text-sm text-slate-600">Click "Connect" to start the voice session</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-100 text-xs font-medium text-slate-600">2</div>
                  <span className="text-sm text-slate-600">Ask questions about the quiz verbally</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-100 text-xs font-medium text-slate-600">3</div>
                  <span className="text-sm text-slate-600">View conversation in the activity log</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-100 text-xs font-medium text-slate-600">4</div>
                  <span className="text-sm text-slate-600">Check console for detailed question data</span>
                </li>
              </ul>
            </div>

            {/* Activity Log Toggle */}
            <button
              onClick={() => setShowDebug(!showDebug)}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-600 hover:bg-slate-50 transition flex items-center justify-center gap-2"
            >
              <Terminal size={16} />
              {showDebug ? 'Hide Activity Log' : 'Show Activity Log'}
            </button>
          </div>

          {/* Right Column - Activity Log */}
          <div className="lg:col-span-2">
            {showDebug ? (
              <div className="rounded-2xl border border-slate-200 bg-white shadow-sm h-[600px] flex flex-col">
                {/* Log Header */}
                <div className="flex items-center justify-between p-4 border-b border-slate-200">
                  <div className="flex items-center gap-2">
                    <MessageSquare size={18} className="text-slate-600" />
                    <h3 className="font-semibold text-slate-900">Activity Log</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded-full">
                      {debugLog.length} entries
                    </span>
                    <button
                      onClick={() => setDebugLog(prev => [...prev, { 
                        id: Date.now().toString(), 
                        timestamp: new Date().toLocaleTimeString(), 
                        message: 'Log refreshed', 
                        type: 'info' 
                      }])}
                      className="p-1.5 rounded-lg hover:bg-slate-100 transition"
                      title="Refresh log"
                    >
                      <RefreshCw size={14} className="text-slate-400" />
                    </button>
                  </div>
                </div>
                
                {/* Log Entries */}
                <div 
                  ref={debugLogRef}
                  className="flex-1 overflow-y-auto p-4 space-y-1.5 bg-slate-50/50"
                >
                  {renderDebugEntries()}
                  
                  {debugLog.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                      <MessageSquare size={32} className="text-slate-300 mb-2" />
                      <p className="text-sm text-slate-400">No activity yet</p>
                      <p className="text-xs text-slate-300">Connect to start the conversation</p>
                    </div>
                  )}
                </div>
                
                {/* Log Footer */}
                <div className="p-3 border-t border-slate-200 bg-slate-50/50 text-xs text-slate-400">
                  Questions are logged to browser console (F12)
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center h-[600px] flex items-center justify-center">
                <div>
                  <Terminal size={48} className="mx-auto mb-4 text-slate-300" />
                  <h3 className="text-lg font-medium text-slate-900 mb-2">Activity Log Hidden</h3>
                  <p className="text-sm text-slate-500 mb-4">Click the button below to show the conversation log</p>
                  <button
                    onClick={() => setShowDebug(true)}
                    className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 transition"
                  >
                    <MessageSquare size={16} />
                    Show Activity Log
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Console Hint */}
        <div className="mt-8 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2">
            <Terminal size={14} className="text-slate-500" />
            <p className="text-xs text-slate-600">
              📋 Questions are logged to the browser console (F12) • {questions.length} questions loaded
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default QuizVoiceAgent;