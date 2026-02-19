import { Volume2 } from 'lucide-react';
import { useTTS } from '../../hooks/useTTS';

interface TTSButtonProps {
  text: string;
  label?: string;
  className?: string;
}

export const TTSButton: React.FC<TTSButtonProps> = ({ 
  text, 
  label = "Read aloud", 
  className = "" 
}) => {
  const { speak, isLoading, isPlaying } = useTTS();

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    speak(text);
  };

  return (
    <button
      onClick={handleClick}
      disabled={isLoading}
      className={`
        inline-flex items-center gap-2 px-4 py-2 rounded-lg 
        bg-blue-600 hover:bg-blue-700 text-white font-medium
        disabled:opacity-70 disabled:cursor-not-allowed
        transition-all ${className}
      `}
      aria-label={label}
    >
      <Volume2 size={18} />
      <span>{isLoading || isPlaying ? 'Speaking...' : label}</span>
    </button>
  );
};