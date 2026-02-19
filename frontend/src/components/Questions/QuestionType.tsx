import React from 'react';
import { ListChecks, List, Star, MessageSquare } from 'lucide-react';
import { type QType } from '../../types';

interface QuestionTypeIconProps {
  type: QType;
  size?: number;
  className?: string;
}

export const QuestionTypeIcon: React.FC<QuestionTypeIconProps> = ({ 
  type, 
  size = 20,
  className = "text-indigo-600"
}) => {
  const icons = {
    quiz: <ListChecks size={size} />,
    multi: <List size={size} />,
    rating: <Star size={size} />,
    open: <MessageSquare size={size} />
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      {icons[type]}
    </div>
  );
};