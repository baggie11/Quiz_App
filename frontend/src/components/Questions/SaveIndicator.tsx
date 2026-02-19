// // components/Questions/QuestionSaveIndicator.tsx
// import React from 'react';
// import { CheckCircle, Clock, AlertCircle, Save } from 'lucide-react';
// import type { QuestionSaveState } from '../../types';

// interface QuestionSaveIndicatorProps {
//   questionId: string;
//   state: QuestionSaveState;
//   onSave: () => void;
// }

// export const QuestionSaveIndicator: React.FC<QuestionSaveIndicatorProps> = ({
//   questionId,
//   state,
//   onSave,
// }) => {
//   const formatTime = (timestamp: string | null) => {
//     if (!timestamp) return '';
//     const date = new Date(timestamp);
//     const now = new Date();
//     const diffMs = now.getTime() - date.getTime();
//     const diffMins = Math.floor(diffMs / 60000);
    
//     if (diffMins < 1) return 'just now';
//     if (diffMins < 60) return `${diffMins}m ago`;
//     return `${Math.floor(diffMins / 60)}h ago`;
//   };

//   if (state.isSaving) {
//     return (
//       <div className="fixed top-4 right-4 z-50 px-3 py-2 bg-blue-50 text-blue-700 rounded-lg border border-blue-200 text-sm font-medium flex items-center gap-2">
//         <Clock className="w-4 h-4 animate-pulse" />
//         <span>Saving question...</span>
//       </div>
//     );
//   }

//   if (state.error) {
//     return (
//       <div className="fixed top-4 right-4 z-50 px-3 py-2 bg-red-50 text-red-700 rounded-lg border border-red-200 text-sm font-medium flex items-center gap-2">
//         <AlertCircle className="w-4 h-4" />
//         <span>Save failed</span>
//         <button
//           onClick={onSave}
//           className="ml-2 px-2 py-1 bg-red-100 text-red-800 rounded text-xs hover:bg-red-200"
//         >
//           Retry
//         </button>
//       </div>
//     );
//   }

//   if (state.hasUnsavedChanges) {
//     return (
//       <div className="fixed top-4 right-4 z-50 px-3 py-2 bg-amber-50 text-amber-700 rounded-lg border border-amber-200 text-sm font-medium flex items-center gap-2">
//         <Clock className="w-4 h-4" />
//         <span>Unsaved changes</span>
//         <button
//           onClick={onSave}
//           className="ml-2 px-2 py-1 bg-amber-100 text-amber-800 rounded text-xs hover:bg-amber-200 flex items-center gap-1"
//         >
//           <Save className="w-3 h-3" />
//           Save
//         </button>
//       </div>
//     );
//   }

//   if (state.lastSaved) {
//     return (
//       <div className="fixed top-4 right-4 z-50 px-3 py-2 bg-green-50 text-green-700 rounded-lg border border-green-200 text-sm font-medium flex items-center gap-2">
//         <CheckCircle className="w-4 h-4" />
//         <span>Saved {formatTime(state.lastSaved)}</span>
//       </div>
//     );
//   }

//   return null;
// };