import React from 'react';
import { useTTS } from '../../hooks/useTTS';
import { 
  Loader2, 
  Volume2, 
  AlertCircle 
} from 'lucide-react';

export const SpeechStatusIndicator: React.FC = () => {
  const { isActive, isLoading, isPlaying, error } = useTTS();

  // Hide when idle
  if (!isActive) return null;

  return (
    <div className="fixed top-4 right-4 z-50 bg-white/95 backdrop-blur-sm rounded-xl shadow-xl border border-gray-200/50 p-4 max-w-sm animate-in slide-in-from-top-2 duration-200">
      <div className="flex items-center gap-3">
        {/* Status Icon */}
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin text-yellow-600" />
        ) : isPlaying ? (
          <Volume2 className="w-4 h-4 text-green-600 animate-pulse" />
        ) : (
          <AlertCircle className="w-4 h-4 text-red-600" />
        )}
        
        {/* Status Text */}
        <div>
          <span className="font-semibold text-sm tracking-tight leading-tight">
            {isLoading && 'Loading speech...'}
            {isPlaying && '🔊 Speaking...'}
            {error && 'Speech error'}
          </span>
          {error && (
            <p className="text-xs text-red-600 mt-1 font-medium leading-tight">
              {error}
            </p>
          )}
        </div>
      </div>
      
      {/* Progress bar for loading */}
      {isLoading && (
        <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2 overflow-hidden">
          <div className="bg-gradient-to-r from-yellow-400 to-yellow-600 h-1.5 rounded-full animate-pulse" />
        </div>
      )}
    </div>
  );
};