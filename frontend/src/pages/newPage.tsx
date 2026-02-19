// import { useEffect, useRef, useState } from "react";
// import {
//   PipecatClient,
//   type PipecatClientOptions,
//   RTVIEvent,
// } from "@pipecat-ai/client-js";
// import { WebSocketTransport } from "@pipecat-ai/websocket-transport";

// export default function PipecatVoicePage() {
//   const pcClientRef = useRef<PipecatClient | null>(null);
//   const botAudioRef = useRef<HTMLAudioElement | null>(null);
//   const debugLogRef = useRef<HTMLDivElement | null>(null);

//   const [status, setStatus] = useState("Disconnected");
//   const [connected, setConnected] = useState(false);

//   // 🔹 NEW: ASR text state
//   const [recognizedText, setRecognizedText] = useState("");

//   // 🔹 NEW: Hardcoded session code
//   const SESSION_CODE = "demo-session-12345";

//   /** ---------- logging ---------- */
//   const log = (message: string) => {
//     console.log(message);
//     if (!debugLogRef.current) return;

//     const entry = document.createElement("div");
//     entry.textContent = `${new Date().toISOString()} - ${message}`;

//     if (message.startsWith("User: ")) entry.style.color = "#2196F3";
//     if (message.startsWith("Bot: ")) entry.style.color = "#4CAF50";

//     debugLogRef.current.appendChild(entry);
//     debugLogRef.current.scrollTop = debugLogRef.current.scrollHeight;
//   };

//   /** ---------- audio setup ---------- */
//   const setupAudioTrack = (track: MediaStreamTrack) => {
//     if (!botAudioRef.current) return;

//     const current = botAudioRef.current.srcObject as MediaStream | null;
//     if (current?.getAudioTracks?.()[0]?.id === track.id) return;

//     botAudioRef.current.srcObject = new MediaStream([track]);
//   };

//   const setupMediaTracks = () => {
//     const pcClient = pcClientRef.current;
//     if (!pcClient) return;

//     const tracks = pcClient.tracks();
//     if (tracks.bot?.audio) {
//       setupAudioTrack(tracks.bot.audio);
//     }
//   };

//   const setupTrackListeners = () => {
//     const pcClient = pcClientRef.current;
//     if (!pcClient) return;

//     pcClient.on(RTVIEvent.TrackStarted, (track, participant) => {
//       if (!participant?.local && track.kind === "audio") {
//         setupAudioTrack(track);
//       }
//     });

//     pcClient.on(RTVIEvent.TrackStopped, () => {});
//   };

//   /** ---------- connect ---------- */
//   const connect = async () => {
//     try {
//       const config: PipecatClientOptions = {
//         transport: new WebSocketTransport(),
//         enableMic: true,
//         enableCam: false,
//         callbacks: {
//           onConnected: () => {
//             setStatus("Connected");
//             setConnected(true);
//           },
//           onDisconnected: () => {
//             setStatus("Disconnected");
//             setConnected(false);
//           },
//           onBotReady: () => {
//             setupMediaTracks();
//           },

//           // 🔹 UPDATED: ASR → input box
//           onUserTranscript: (data) => {
//             if (!data?.text) return;

//             // show partial + final
//             setRecognizedText(data.text);

//             if (data.final) {
//               log(`User: ${data.text}`);
//             }
//           },

//           onBotTranscript: (data) => log(`Bot: ${data.text}`),
//           onMessageError: (e) => console.error("Message error:", e),
//           onError: (e) => console.error("Error:", e),
//         },
//       };

//       const pcClient = new PipecatClient(config);
//       pcClientRef.current = pcClient;

//       // @ts-ignore
//       window.pcClient = pcClient;

//       setupTrackListeners();

//       await pcClient.initDevices();
//       await pcClient.startBotAndConnect({
//         endpoint: "http://localhost:7860/connect",
//         // 🔹 Pass the hardcoded session code
//         metadata: { session_code: SESSION_CODE }
//       });
//     } catch (err: any) {
//       log(`Error connecting: ${err.message}`);
//       setStatus("Error");
//       await pcClientRef.current?.disconnect();
//     }
//   };

//   /** ---------- disconnect ---------- */
//   const disconnect = async () => {
//     const pcClient = pcClientRef.current;
//     if (!pcClient) return;

//     await pcClient.disconnect();
//     pcClientRef.current = null;

//     const audio = botAudioRef.current;
//     if (audio?.srcObject instanceof MediaStream) {
//       audio.srcObject.getAudioTracks().forEach((track) => track.stop());
//       audio.srcObject = null;
//     }
//   };

//   /** ---------- handle click anywhere ---------- */
//   const handlePageClick = () => {
//     if (!connected) {
//       connect();
//     }
//   };

//   /** ---------- lifecycle ---------- */
//   useEffect(() => {
//     const audio = document.createElement("audio");
//     audio.autoplay = true;
//     document.body.appendChild(audio);
//     botAudioRef.current = audio;

//     return () => {
//       audio.remove();
//     };
//   }, []);

//   /** ---------- UI ---------- */
//   return (
//     <div style={{ position: "relative", minHeight: "100vh" }}>
//       {/* 🔹 Overlay for click-to-connect when disconnected */}
//       {!connected && (
//         <div 
//           onClick={handlePageClick}
//           style={{
//             position: "fixed",
//             top: 0,
//             left: 0,
//             right: 0,
//             bottom: 0,
//             backgroundColor: "rgba(0, 0, 0, 0.5)",
//             display: "flex",
//             justifyContent: "center",
//             alignItems: "center",
//             zIndex: 1000,
//             cursor: "pointer",
//           }}
//         >
//           <div style={{
//             backgroundColor: "white",
//             padding: "40px",
//             borderRadius: "10px",
//             textAlign: "center",
//             maxWidth: "400px",
//           }}>
//             <h2>Click Anywhere to Connect</h2>
//             <p>Session Code: <strong>{SESSION_CODE}</strong></p>
//             <p style={{ marginTop: "20px", fontSize: "14px", color: "#666" }}>
//               Click anywhere on this overlay to start the voice session
//             </p>
//           </div>
//         </div>
//       )}

//       <div style={{ padding: 24, maxWidth: 900 }}>
//         <h2>Pipecat ASR Demo</h2>

//         <p>
//           Status: <b>{status}</b>
//         </p>

//         <button onClick={connect} disabled={connected}>
//           Connect
//         </button>

//         <button
//           onClick={disconnect}
//           disabled={!connected}
//           style={{ marginLeft: 12 }}
//         >
//           Disconnect
//         </button>

//         {/* 🔹 ASR OUTPUT INPUT */}
//         <div style={{ marginTop: 20 }}>
//           <label htmlFor="asr-input">
//             <b>Recognized Speech</b>
//           </label>
//           <input
//             id="asr-input"
//             type="text"
//             value={recognizedText}
//             onChange={(e) => setRecognizedText(e.target.value)}
//             style={{
//               width: "100%",
//               padding: 10,
//               fontSize: 16,
//               marginTop: 6,
//             }}
//             aria-live="polite"
//           />
//         </div>

//         <div
//           ref={debugLogRef}
//           style={{
//             marginTop: 20,
//             height: 300,
//             overflowY: "auto",
//             border: "1px solid #ccc",
//             padding: 10,
//             fontFamily: "monospace",
//             fontSize: 12,
//           }}
//         />
//       </div>
//     </div>
//   );
// }