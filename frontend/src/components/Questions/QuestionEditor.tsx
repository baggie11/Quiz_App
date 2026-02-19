import React, { useState } from 'react';
import type { Question } from '../../types';
import { 
  Plus, Trash2, CheckCircle, Circle, Check,
  Type, MessageSquare, ClipboardList, Star, ArrowRight,
  ChevronDown, ChevronRight
} from 'lucide-react';

interface QuestionEditorProps {
  question: Question;
  index: number;
  onUpdate: (id: string, patch: Partial<Question>) => void;
  onAddOption: (questionId: string) => void;
  onUpdateOption: (questionId: string, idx: number, value: string) => void;
  onRemoveOption: (questionId: string, idx: number) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDropChangeType: (e: React.DragEvent, questionId: string) => void;
  onNextQuestion?: () => void;
  isSaving?: boolean;
  isDraft?: boolean;
}

export const QuestionEditor: React.FC<QuestionEditorProps> = ({
  question,
  index,
  onUpdate,
  onAddOption,
  onUpdateOption,
  onRemoveOption,
  onDragOver,
  onDropChangeType,
  onNextQuestion,
  isSaving = false,
  isDraft = false,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);

  const getQuestionTypeIcon = (type: string) => {
    switch (type) {
      case 'quiz': return <ClipboardList size={16} />;
      case 'multi': return <CheckCircle size={16} />;
      case 'rating': return <Star size={16} />;
      case 'open': return <MessageSquare size={16} />;
      default: return <Type size={16} />;
    }
  };

  const getQuestionTypeLabel = (type: string) => {
    switch (type) {
      case 'quiz': return 'Single Choice';
      case 'multi': return 'Multiple Choice';
      case 'rating': return 'Rating Scale';
      case 'open': return 'Open Ended';
      default: return type;
    }
  };

  const toggleCorrect = (optionIndex: number) => {
    if (question.type === 'quiz') {
      onUpdate(question.id, {
        correctAnswer: question.correctAnswer === optionIndex ? null : optionIndex
      });
    } else if (question.type === 'multi') {
      const current = question.multiAnswers ?? [];
      const updated = current.includes(optionIndex)
        ? current.filter(i => i !== optionIndex)
        : [...current, optionIndex];
      onUpdate(question.id, { multiAnswers: updated });
    }
  };

  const isCorrect = (idx: number): boolean => {
    if (question.type === 'quiz') return question.correctAnswer === idx;
    if (question.type === 'multi') return (question.multiAnswers ?? []).includes(idx);
    return false;
  };

  const options = question.options ?? [];

  return (
    <div
      className="rounded-2xl border border-slate-200 bg-white shadow-sm transition-all hover:shadow-md"
      onDragOver={onDragOver}
      onDrop={(e) => onDropChangeType(e, question.id)}
    >
      {/* Header */}
      <div
        className="flex cursor-pointer items-center justify-between p-5 transition hover:bg-slate-50"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-xs font-semibold text-slate-700">
            {index + 1}
          </div>

          <div className="flex-1">
            <div className="mb-1 flex items-center gap-2">
              <div className="flex items-center gap-1 rounded-lg bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700">
                {getQuestionTypeIcon(question.type)}
                {getQuestionTypeLabel(question.type)}
              </div>

              {question.meta?.required && (
                <span className="rounded bg-rose-50 px-2 py-1 text-[10px] font-medium text-rose-600">
                  Required
                </span>
              )}

              {/* Draft / Saving Indicator */}
              {isDraft && (
                <span className="flex items-center gap-1 rounded bg-amber-50 px-2 py-1 text-[10px] font-medium text-amber-600">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-500"></span>
                  Draft
                </span>
              )}

              {isSaving && !isDraft && (
                <span className="flex items-center gap-1 rounded bg-blue-50 px-2 py-1 text-[10px] font-medium text-blue-600">
                  <span className="h-3 w-3 animate-spin rounded-full border-2 border-blue-600 border-t-transparent"></span>
                  Saving...
                </span>
              )}
            </div>

            <h3 className="text-sm font-medium text-slate-900">
              {question.text?.trim() || (
                <span className="italic text-slate-400">Untitled question...</span>
              )}
            </h3>
          </div>
        </div>

        <div className="text-slate-400">
          {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
        </div>
      </div>

      {/* Body */}
      {isExpanded && (
        <div className="border-t border-slate-100 p-5">
          {/* Question Text */}
          <div className="mb-5">
            <label className="mb-1.5 block text-xs font-medium text-slate-700">
              Question Text <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={3}
              value={question.text || ''}
              onChange={(e) => onUpdate(question.id, { text: e.target.value })}
              placeholder="Enter your question here..."
              className={`w-full resize-none rounded-lg border px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/20 ${
                !question.text?.trim() 
                  ? 'border-amber-200 bg-amber-50' 
                  : 'border-slate-200'
              }`}
            />
          </div>

          {/* Multiple Choice Options */}
          {(question.type === 'quiz' || question.type === 'multi') && (
            <div className="mb-5 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-slate-700">
                  Answer Options
                </label>
                <button
                  onClick={() => onAddOption(question.id)}
                  disabled={options.length >= 10}
                  className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs font-medium text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
                >
                  <Plus size={14} />
                  Add Option
                </button>
              </div>

              <div className="space-y-2">
                {options.map((option, idx) => (
                  <div key={idx} className="flex items-center gap-2 group">
                    <button
                      onClick={() => toggleCorrect(idx)}
                      className={`flex h-7 w-7 items-center justify-center rounded-lg transition ${
                        isCorrect(idx)
                          ? question.type === 'quiz' 
                            ? 'bg-emerald-500 text-white' 
                            : 'bg-emerald-500 text-white'
                          : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                      }`}
                    >
                      {question.type === 'quiz' ? (
                        isCorrect(idx) ? (
                          <div className="h-2 w-2 rounded-full bg-white" />
                        ) : (
                          <Circle size={14} />
                        )
                      ) : (
                        isCorrect(idx) ? (
                          <Check size={14} />
                        ) : (
                          <div className="h-3.5 w-3.5 rounded border border-slate-400" />
                        )
                      )}
                    </button>

                    <input
                      type="text"
                      value={option}
                      onChange={(e) => onUpdateOption(question.id, idx, e.target.value)}
                      placeholder={`Option ${idx + 1}`}
                      className={`flex-1 rounded-lg border px-3 py-1.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/20 ${
                        !option?.trim() 
                          ? 'border-amber-200 bg-amber-50' 
                          : 'border-slate-200'
                      }`}
                    />

                    {options.length > 2 && (
                      <button
                        onClick={() => onRemoveOption(question.id, idx)}
                        className="rounded p-1 text-slate-400 opacity-0 transition hover:bg-rose-50 hover:text-rose-600 group-hover:opacity-100"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {options.length >= 10 && (
                <p className="text-xs text-amber-600">Maximum 10 options allowed.</p>
              )}
            </div>
          )}

          {/* Rating Scale */}
          {question.type === 'rating' && (
            <div className="mb-5 space-y-4">
              <label className="text-xs font-medium text-slate-700">Rating Scale</label>
              <div className="flex items-center justify-center gap-4">
                <span className="text-xs text-slate-500">1</span>
                <input
                  type="number"
                  min="2"
                  max="10"
                  value={question.ratingMax || 5}
                  onChange={(e) => onUpdate(question.id, { ratingMax: Math.max(2, Math.min(10, parseInt(e.target.value) || 5)) })}
                  className="w-16 rounded-lg border border-slate-200 px-2 py-1 text-center text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/20"
                />
                <span className="text-xs text-slate-500">(Max)</span>
              </div>

              <div className="flex justify-center gap-2">
                {Array.from({ length: question.ratingMax || 5 }, (_, i) => (
                  <div
                    key={i}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-xs font-medium text-slate-700"
                  >
                    {i + 1}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Open Ended */}
          {question.type === 'open' && (
            <div className="mb-5">
              <label className="mb-1.5 block text-xs font-medium text-slate-700">
                Model Answer <span className="text-slate-400">(Optional)</span>
              </label>
              <textarea
                rows={4}
                value={question.modelAnswer || ''}
                onChange={(e) => onUpdate(question.id, { modelAnswer: e.target.value })}
                placeholder="Optional expected answer for reference..."
                className="w-full resize-none rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/20"
              />
            </div>
          )}

          {/* Next Question Button */}
          <div className="mt-6 flex justify-end">
            <button
              onClick={onNextQuestion}
              disabled={isSaving}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-medium transition ${
                isSaving
                  ? 'border border-slate-200 bg-slate-50 text-slate-400'
                  : 'border border-slate-900 bg-slate-900 text-white hover:bg-slate-800'
              }`}
            >
              {isSaving ? (
                <>
                  <span className="h-3 w-3 animate-spin rounded-full border-2 border-slate-400 border-t-transparent"></span>
                  Saving...
                </>
              ) : (
                <>
                  Next Question
                  <ArrowRight size={14} />
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuestionEditor;