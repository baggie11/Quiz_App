import { forwardRef, useEffect, useRef, type WheelEvent } from 'react';
import { type Question } from '../../types';
import { X, Eye, CheckCircle, Star, Type, MessageSquare, ClipboardList } from 'lucide-react';

interface QuestionPreviewProps {
  isOpen: boolean;
  questions: Question[];
  onClose: () => void;
}

export const QuestionPreview = forwardRef<HTMLDivElement, QuestionPreviewProps>(({
  isOpen,
  questions,
  onClose
}, ref) => {
  const scrollAreaRef = useRef<HTMLDivElement | null>(null);
  const handleOverlayWheel = (e: WheelEvent<HTMLDivElement>) => {
    const scroller = scrollAreaRef.current;
    if (!scroller) return;

    scroller.scrollTop += e.deltaY;
    e.preventDefault();
    e.stopPropagation();
  };

  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    const previousHtmlOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
      document.documentElement.style.overflow = previousHtmlOverflow;
    };
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && ref && 'current' in ref && ref.current) {
      setTimeout(() => {
        ref.current?.focus();
      }, 50);
    }
  }, [isOpen, ref]);

  if (!isOpen) return null;

  const getQuestionTypeIcon = (type: string) => {
    switch (type) {
      case 'quiz': return <ClipboardList size={14} />;
      case 'multi': return <CheckCircle size={14} />;
      case 'rating': return <Star size={14} />;
      case 'open': return <MessageSquare size={14} />;
      default: return <Type size={14} />;
    }
  };

  const getQuestionTypeLabel = (type: string) => {
    switch (type) {
      case 'quiz': return 'Single Choice';
      case 'multi': return 'MCQ';
      case 'rating': return 'Rating Scale';
      case 'open': return 'Open Ended';
      default: return type;
    }
  };

  const renderQuestionPreview = (q: Question, index: number) => {
    const totalQuestions = questions.length;
    return (
      <div key={q.id} className="mb-8 last:mb-0">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <div className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium ${
                q.type === 'quiz' ? 'bg-slate-100 text-slate-700' :
                q.type === 'multi' ? 'bg-slate-100 text-slate-700' :
                q.type === 'rating' ? 'bg-slate-100 text-slate-700' :
                'bg-slate-100 text-slate-700'
              }`}>
                {getQuestionTypeIcon(q.type)}
                {getQuestionTypeLabel(q.type)}
              </div>
              <div className="text-xs text-slate-400">
                Q{index + 1}/{totalQuestions}
              </div>
            </div>
            
            <h3 className="text-base font-semibold text-slate-900">
              {q.text || (
                <span className="text-slate-400 italic">Click to edit question text...</span>
              )}
            </h3>
          </div>
          
          {q.meta?.required && (
            <span className="rounded-lg bg-rose-50 px-2 py-1 text-xs font-medium text-rose-600">
              Required
            </span>
          )}
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          {q.type === 'quiz' || q.type === 'multi' ? (
            <div className="space-y-2">
              {q.options?.map((option, idx) => {
                const isCorrect = q.type === 'quiz' 
                  ? q.correctAnswer === idx 
                  : (q.multiAnswers || []).includes(idx);
                
                return (
                  <div 
                    key={idx} 
                    className={`rounded-lg border p-3 transition-colors ${
                      isCorrect 
                        ? 'border-emerald-200 bg-emerald-50' 
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        <div className={`flex h-4 w-4 items-center justify-center rounded-full border ${
                          isCorrect
                            ? 'border-emerald-500 bg-emerald-500'
                            : 'border-slate-300'
                        }`}>
                          {isCorrect && (
                            <div className="h-1.5 w-1.5 rounded-full bg-white" />
                          )}
                        </div>
                        <span className={`text-sm ${
                          isCorrect
                            ? "font-medium text-emerald-700"
                            : "text-slate-700"
                        }`}>
                          {option}
                        </span>
                      </div>
                      
                      {isCorrect && (
                        <div className="flex items-center gap-1 text-xs font-medium text-emerald-600">
                          <CheckCircle size={12} />
                          <span>Correct</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
              
              {q.options && q.options.length === 0 && (
                <div className="py-4 text-center text-sm text-slate-400">
                  No options added
                </div>
              )}
            </div>
          ) : q.type === 'rating' ? (
            <div className="py-2">
              <div className="mb-3 flex items-center justify-between text-xs text-slate-500">
                <span>Poor</span>
                <span>Excellent</span>
              </div>
              <div className="flex justify-center gap-1">
                {Array.from({ length: q.ratingMax || 5 }).map((_, index) => (
                  <div key={index} className="group relative">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg border-2 border-slate-200 text-sm transition-all group-hover:border-slate-300 group-hover:bg-slate-50">
                      {index + 1}
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 text-center text-xs text-slate-400">
                Select a rating from 1 to {q.ratingMax || 5}
              </div>
            </div>
          ) : q.type === 'open' ? (
            <div className="space-y-4">
              <div className="relative">
                <textarea 
                  className="w-full resize-none rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/20"
                  rows={4}
                  placeholder="Type your answer here..."
                  disabled
                />
                <div className="absolute bottom-2 right-3 text-xs text-slate-400">
                  0/500
                </div>
              </div>
              
              {q.correctAnswer && (
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-6 w-6 items-center justify-center rounded-md bg-slate-200">
                      <MessageSquare size={12} className="text-slate-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="mb-1 text-xs font-medium text-slate-700">Model Answer</h4>
                      <p className="text-xs text-slate-600">
                        {q.correctAnswer}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : null}
        </div>

        {(q.type === 'quiz' || q.type === 'multi') && (
          <div className="mt-2 flex items-center justify-between text-xs text-slate-400">
            <div>
              {q.type === 'quiz' ? 'Single choice' : 'Multiple choice'}
            </div>
            <div>
              {q.options?.length || 0} option{q.options?.length !== 1 ? 's' : ''}
            </div>
          </div>
        )}
      </div>
    );
  };

  const totalQuestions = questions.length;
  const questionTypes = {
    quiz: questions.filter(q => q.type === 'quiz').length,
    multi: questions.filter(q => q.type === 'multi').length,
    rating: questions.filter(q => q.type === 'rating').length,
    open: questions.filter(q => q.type === 'open').length,
  };

  return (
    <div 
      ref={ref}
      tabIndex={-1}
      className="fixed inset-0 z-50 overflow-hidden bg-black/50 focus:outline-none"
      onWheelCapture={handleOverlayWheel}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="flex max-h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
          
          {/* Header */}
          <div className="border-b border-slate-200 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100">
                  <Eye size={16} className="text-slate-600" />
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-slate-900">Question Preview</h2>
                  <div className="mt-0.5 flex items-center gap-2">
                    <p className="text-xs text-slate-500">
                      {totalQuestions} question{totalQuestions !== 1 ? 's' : ''}
                    </p>
                    {totalQuestions > 0 && (
                      <>
                        <span className="text-slate-300">•</span>
                        <div className="flex items-center gap-1">
                          {questionTypes.quiz > 0 && (
                            <span className="rounded bg-slate-100 px-1.5 py-0.5 text-xs text-slate-600">
                              {questionTypes.quiz} SC
                            </span>
                          )}
                          {questionTypes.multi > 0 && (
                            <span className="rounded bg-slate-100 px-1.5 py-0.5 text-xs text-slate-600">
                              {questionTypes.multi} MCQ
                            </span>
                          )}
                          {questionTypes.rating > 0 && (
                            <span className="rounded bg-slate-100 px-1.5 py-0.5 text-xs text-slate-600">
                              {questionTypes.rating} RT
                            </span>
                          )}
                          {questionTypes.open > 0 && (
                            <span className="rounded bg-slate-100 px-1.5 py-0.5 text-xs text-slate-600">
                              {questionTypes.open} TXT
                            </span>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
              
              <button
                onClick={onClose}
                className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                aria-label="Close preview"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Scrollable Content */}
          <div
            ref={scrollAreaRef}
            className="flex-1 overflow-y-auto p-5"
          >
            {questions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100">
                  <Eye size={24} className="text-slate-400" />
                </div>
                <h3 className="mb-1 text-sm font-medium text-slate-900">Nothing to preview yet</h3>
                <p className="text-center text-xs text-slate-500">
                  Add some questions to your session to see how they'll appear to respondents.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {questions.map((q, i) => renderQuestionPreview(q, i))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-slate-200 bg-slate-50 p-4">
            <div className="flex items-center justify-between">
              <p className="text-xs text-slate-500">
                Preview mode • Responses won't be saved
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={onClose}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-50"
                >
                  Close
                </button>
                <button
                  onClick={onClose}
                  className="rounded-lg border border-slate-900 bg-slate-900 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-slate-800"
                >
                  Continue Editing
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

QuestionPreview.displayName = 'QuestionPreview';