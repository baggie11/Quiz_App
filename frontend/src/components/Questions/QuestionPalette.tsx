import React from 'react';
import { ChevronUp, ChevronDown, PlusCircle, ListChecks, List, Star, MessageSquare } from 'lucide-react';
import { type QType } from '../../types';

const PALETTE_ITEMS = [
  { id: "quiz", label: "Single Choice", type: "quiz" as QType, icon: <ListChecks size={16} /> },
  { id: "multi", label: "MCQ", type: "multi" as QType, icon: <List size={16} /> },
  { id: "rating", label: "Rating", type: "rating" as QType, icon: <Star size={16} /> },
  { id: "open", label: "Open Text", type: "open" as QType, icon: <MessageSquare size={16} /> },
] as const;

interface QuestionPaletteProps {
  isOpen: boolean;
  onToggle: () => void;
  onDragStart: (e: React.DragEvent, type: QType) => void;
  onAddQuestion: (type: QType) => void;
}

export const QuestionPalette: React.FC<QuestionPaletteProps> = ({
  isOpen,
  onToggle,
  onDragStart,
  onAddQuestion
}) => {
  return (
    <div className="sticky top-24">
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">Question Types</h3>
          <button 
            onClick={onToggle} 
            className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors"
          >
            {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>
        </div>
        
        {isOpen && (
          <div className="space-y-2">
            {PALETTE_ITEMS.map((item) => (
              <div
                key={item.id}
                draggable
                onDragStart={(e) => onDragStart(e, item.type)}
                className="group flex cursor-grab items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 transition hover:border-slate-300 hover:bg-white"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-slate-700 ring-1 ring-slate-200 transition group-hover:text-slate-900">
                  {item.icon}
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-slate-800">{item.label}</div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        <button
          onClick={() => onAddQuestion("quiz")}
          className="w-full rounded-xl border border-slate-900 bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800 flex items-center justify-center gap-2"
        >
          <PlusCircle size={16} /> Add Question
        </button>
      </div>
    </div>
  );
};