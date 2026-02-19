// Replace your current QuestionBuilderPage with this version
import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
} from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, AlertCircle, ChevronLeft } from 'lucide-react';
import { API } from '../api/config';

import type {
  Question,
  QType,
  QuestionBuilderProps,
  SaveState,
} from '../types';

import { QuestionHeader } from '../components/Questions/QuestionHeader';
import { QuestionPalette } from '../components/Questions/QuestionPalette';
import { QuestionEditor } from '../components/Questions/QuestionEditor';
import { QuestionPreview } from '../components/Questions/QuestionPreview';
import { useParams } from "react-router-dom";

// Helpers
const uid = (prefix = "q"): string =>
  `${prefix}_${Date.now().toString(36)}_${Math.floor(Math.random() * 1000)}`;

const defaultOption = (n = 1): string => `Option ${n}`;

export const QuestionBuilderPage: React.FC<QuestionBuilderProps> = ({
  sessionId: propSessionId,
  onPreview,
  initialQuestions = [],
}) => {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState<Question[]>(initialQuestions);
  const [paletteOpen, setPaletteOpen] = useState(true);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [filter, setFilter] = useState<"all" | QType | "drafts">("all");
  const [currentQuestionId, setCurrentQuestionId] = useState<string | null>(
    initialQuestions[0]?.id || null
  );
  const [loading, setLoading] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [saveState, setSaveState] = useState<SaveState>({
    isSaving: false,
    lastSaved: null,
    hasUnsavedChanges: false,
    autoSaveEnabled: false,
    saveError: null,
  });

  const { sessionId: paramSessionId } = useParams<{ sessionId?: string }>();
  const sessionId = paramSessionId || propSessionId;

  const handleBackClick = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  // Load existing questions from the database
  const loadExistingQuestions = useCallback(async () => {
    if (!sessionId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setLoadError(null);

    try {
      const token = localStorage.getItem("token");
      
      const response = await fetch(
        `${API.node}/api/sessions/${sessionId}/questions`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(errText || "Failed to load questions");
      }

      const result = await response.json();
      console.log("Loaded questions from server:", result);

      const questionsData = result.data || [];
      
      if (!Array.isArray(questionsData)) {
        console.warn("Expected questions data to be an array, got:", questionsData);
        setQuestions([]);
        setLoading(false);
        return;
      }

      const loadedQuestions: Question[] = questionsData.map((item: any, index: number) => {
        const typeMap: Record<string, QType> = {
          MCQ: "quiz",
          "multiple_choice": "quiz",
          MSQ: "multi",
          "multiple_select": "multi",
          RATING: "rating",
          "rating": "rating",
          OPEN_ENDED: "open",
          "open_ended": "open",
        };

        const questionType = typeMap[item.question_type] || "quiz";
        
        let options: string[] | undefined;
        let correctAnswer: number | undefined;
        let multiAnswers: number[] | undefined;
        let ratingMax: number | undefined;

        if (item.question_options && Array.isArray(item.question_options)) {
          options = item.question_options.map((opt: any) => 
            opt.option_text || opt.text || opt.option_text || ""
          );
          
          if (questionType === "quiz") {
            const correctIndex = item.question_options.findIndex((opt: any) => opt.is_correct);
            if (correctIndex !== -1) {
              correctAnswer = correctIndex;
            }
          } else if (questionType === "multi") {
            multiAnswers = item.question_options
              .map((opt: any, idx: number) => (opt.is_correct ? idx : -1))
              .filter((idx: number) => idx !== -1);
          }
        } else {
          if (questionType === "quiz" || questionType === "multi") {
            options = ["Option 1", "Option 2"];
            if (questionType === "quiz") {
              correctAnswer = 0;
            } else {
              multiAnswers = [0];
            }
          }
        }

        if (questionType === "rating") {
          ratingMax = item.rating_max || item.max_rating || 5;
        }

        return {
          id: item.id || item.question_id || uid(),
          text: item.question_text || item.text || `Untitled Question ${index + 1}`,
          type: questionType,
          options,
          correctAnswer,
          multiAnswers,
          ratingMax,
          meta: {
            draft: false,
            imageUrl: item.image_url || item.imageUrl || undefined,
            explanation: item.explanation || undefined,
            updatedAt: item.updated_at || item.updatedAt || undefined,
            createdAt: item.created_at || item.createdAt || undefined,
          },
        };
      });

      console.log("Transformed questions:", loadedQuestions);
      setQuestions(loadedQuestions);
      
      if (loadedQuestions.length > 0) {
        setCurrentQuestionId(loadedQuestions[0].id);
      } else {
        setCurrentQuestionId(null);
      }
      
      if (loadedQuestions.length > 0) {
        const timestamps = loadedQuestions
          .map(q => q.meta?.updatedAt)
          .filter(Boolean)
          .sort();
        
        const lastSaved = timestamps.length > 0 
          ? timestamps[timestamps.length - 1] 
          : null;
        
        setSaveState(prev => ({
          ...prev,
          lastSaved,
          hasUnsavedChanges: false,
        }));
      }

    } catch (error: any) {
      console.error("Failed to load questions:", error);
      setLoadError(error.message || "Failed to load questions from server");
      setQuestions([]);
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

  useEffect(() => {
    loadExistingQuestions();
  }, [loadExistingQuestions]);

  const saveSingleQuestion = useCallback(
    async (question: Question): Promise<boolean> => {
      setSaveState(prev => ({ ...prev, isSaving: true, saveError: null }));

      try {
        const token = localStorage.getItem("token");
        const typeMap: Record<QType, string> = {
          quiz: "multiple_choice",
          multi: "multiple_select",
          rating: "rating",
          open: "open_ended",
        };

        const payload = {
          question_id: question.id,
          question_text: question.text?.trim() || "Untitled Question",
          question_type: typeMap[question.type],
          order_index: questions.findIndex(q => q.id === question.id),
          image_url: question.meta?.imageUrl ?? null,
          explanation: question.meta?.explanation ?? null,
          options:
            question.type === "quiz" || question.type === "multi"
              ? (question.options || []).map((opt, idx) => ({
                  option_text: opt?.trim() || `Option ${idx + 1}`,
                  is_correct:
                    question.type === "quiz"
                      ? question.correctAnswer === idx
                      : (question.multiAnswers ?? []).includes(idx),
                }))
              : [],
        };

        console.log("Saving question with payload:", payload);

        const response = await fetch(
           `${API.node}/api/sessions/${sessionId}/questions`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(payload),
          }
        );

        if (!response.ok) {
          const errText = await response.text();
          throw new Error(errText || "Failed to save question");
        }

        setQuestions(prev =>
          prev.map(q =>
            q.id === question.id
              ? { 
                  ...q, 
                  meta: { 
                    ...q.meta, 
                    draft: false,
                    updatedAt: new Date().toISOString() 
                  } 
                }
              : q
          )
        );

        setSaveState(prev => ({
          ...prev,
          isSaving: false,
          hasUnsavedChanges: questions.some(q => q.id !== question.id && q.meta?.draft),
          lastSaved: new Date().toISOString(),
          saveError: null,
        }));

        return true;
      } catch (error: any) {
        console.error("Failed to save question:", error);
        setSaveState(prev => ({
          ...prev,
          isSaving: false,
          saveError: error.message || "Save failed",
        }));
        return false;
      }
    },
    [sessionId, questions]
  );

  const updateQuestion = useCallback(
    (id: string, patch: Partial<Question>) => {
      setQuestions(prev => {
        const updated = prev.map(q => 
          q.id === id 
            ? { 
                ...q, 
                ...patch, 
                meta: { 
                  ...q.meta, 
                  draft: true,
                  updatedAt: new Date().toISOString() 
                } 
              }
            : q
        );
        
        setSaveState(prevState => ({
          ...prevState,
          hasUnsavedChanges: true,
        }));
        
        return updated;
      });
    },
    []
  );

  const addOption = useCallback((questionId: string) => {
    setQuestions(prev => {
      const updated = prev.map(q => {
        if (q.id !== questionId) return q;
        const opts = [...(q.options || [])];
        opts.push(defaultOption(opts.length + 1));
        return { 
          ...q, 
          options: opts, 
          meta: { 
            ...q.meta, 
            draft: true,
            updatedAt: new Date().toISOString() 
          } 
        };
      });
      
      setSaveState(prevState => ({
        ...prevState,
        hasUnsavedChanges: true,
      }));
      
      return updated;
    });
  }, []);

  const updateOption = useCallback(
    (questionId: string, idx: number, value: string) => {
      setQuestions(prev => {
        const updated = prev.map(q => {
          if (q.id !== questionId) return q;
          const opts = [...(q.options || [])];
          opts[idx] = value;
          return { 
            ...q, 
            options: opts, 
            meta: { 
              ...q.meta, 
              draft: true,
              updatedAt: new Date().toISOString() 
            } 
          };
        });
        
        setSaveState(prevState => ({
          ...prevState,
          hasUnsavedChanges: true,
        }));
        
        return updated;
      });
    },
    []
  );

  const removeOption = useCallback(
    (questionId: string, idx: number) => {
      setQuestions(prev => {
        const updated = prev.map(q => {
          if (q.id !== questionId) return q;
          const opts = (q.options || []).filter((_, i) => i !== idx);
          let correctAnswer = q.correctAnswer;
          if (correctAnswer != null && correctAnswer >= idx) {
            correctAnswer = correctAnswer > idx ? correctAnswer - 1 : null;
          }
          const multiAnswers = (q.multiAnswers || [])
            .filter(i => i !== idx)
            .map(i => (i > idx ? i - 1 : i));
          return { 
            ...q, 
            options: opts, 
            correctAnswer, 
            multiAnswers, 
            meta: { 
              ...q.meta, 
              draft: true,
              updatedAt: new Date().toISOString() 
            } 
          };
        });
        
        setSaveState(prevState => ({
          ...prevState,
          hasUnsavedChanges: true,
        }));
        
        return updated;
      });
    },
    []
  );

  const addQuestion = useCallback(
    async (type: QType = "quiz") => {
      if (loading) {
        console.warn("Still loading existing questions, please wait");
        return;
      }

      const tempId = uid();
      const newQuestion: Question = {
        id: tempId,
        text: "",
        type,
        options: type === "quiz" || type === "multi"
          ? [defaultOption(1), defaultOption(2)]
          : undefined,
        ratingMax: type === "rating" ? 5 : undefined,
        correctAnswer: type === "quiz" ? 0 : undefined,
        multiAnswers: type === "multi" ? [0] : undefined,
        meta: { 
          draft: true,
          createdAt: new Date().toISOString() 
        },
      };

      setQuestions(prev => [...prev, newQuestion]);
      setCurrentQuestionId(tempId);
      setSaveState(prev => ({ ...prev, hasUnsavedChanges: true }));

      try {
        const token = localStorage.getItem("token");
        const typeMap: Record<QType, string> = {
          quiz: "multiple_choice",
          multi: "multiple_select",
          rating: "rating",
          open: "open_ended",
        };

        const payload = {
          question_text: "Untitled Question",
          question_type: typeMap[type],
          order_index: questions.length,
          image_url: null,
          explanation: null,
          options: type === "quiz" || type === "multi"
            ? newQuestion.options?.map((opt, i) => ({
                option_text: opt,
                is_correct: i === 0,
              }))
            : undefined,
        };

        const response = await fetch(
          `${API.node}/api/sessions/${sessionId}/questions`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ questions: [payload] }),
          }
        );

        if (response.ok) {
          const data = await response.json();
          const realId = data.questions?.[0]?.question_id || data.question_id || data.data?.[0]?.id;
          if (realId) {
            setQuestions(prev =>
              prev.map(q => 
                q.id === tempId 
                  ? { 
                      ...q, 
                      id: realId,
                      meta: { ...q.meta, draft: false }
                    } 
                  : q
              )
            );
            setCurrentQuestionId(realId);
          }
        }
      } catch (err) {
        console.error("Failed to create question:", err);
      }
    },
    [sessionId, questions.length, loading]
  );

  const handleNextQuestion = useCallback(async () => {
    if (loading) return;

    if (!currentQuestionId) {
      await addQuestion("quiz");
      return;
    }

    const currentQuestion = questions.find(q => q.id === currentQuestionId);
    if (!currentQuestion) {
      await addQuestion("quiz");
      return;
    }

    if (currentQuestion.meta?.draft) {
      const saved = await saveSingleQuestion(currentQuestion);
      if (!saved) {
        return;
      }
    }

    await addQuestion("quiz");
  }, [currentQuestionId, questions, addQuestion, saveSingleQuestion, loading]);

  const onDropChangeType = useCallback(
    (e: React.DragEvent, questionId: string) => {
      e.preventDefault();
      const type = e.dataTransfer.getData("application/qtype") as QType;
      if (!type) return;

      const updates: Partial<Question> = { type };
      if (type === "quiz") {
        updates.options = [defaultOption(1), defaultOption(2)];
        updates.correctAnswer = 0;
        updates.multiAnswers = undefined;
        updates.ratingMax = undefined;
      } else if (type === "multi") {
        updates.options = [defaultOption(1), defaultOption(2)];
        updates.correctAnswer = undefined;
        updates.multiAnswers = [0];
        updates.ratingMax = undefined;
      } else if (type === "rating") {
        updates.options = undefined;
        updates.correctAnswer = undefined;
        updates.multiAnswers = undefined;
        updates.ratingMax = 5;
      } else if (type === "open") {
        updates.options = undefined;
        updates.correctAnswer = undefined;
        updates.multiAnswers = undefined;
        updates.ratingMax = undefined;
      }

      updateQuestion(questionId, updates);
    },
    [updateQuestion]
  );

  const onDragOver = (e: React.DragEvent) => e.preventDefault();

  const handlePreview = useCallback(() => {
    onPreview?.(questions);
    setPreviewOpen(true);
  }, [questions, onPreview]);

  const filteredQuestions = useMemo(
    () =>
      questions.filter((q) =>
        filter === "all"
          ? true
          : filter === "drafts"
          ? !!q.meta?.draft
          : q.type === filter
      ),
    [questions, filter]
  );

  const unsavedCount = useMemo(
    () => questions.filter(q => q.meta?.draft).length,
    [questions]
  );

  useEffect(() => {
    if (questions.length > 0 && !currentQuestionId && !loading) {
      setCurrentQuestionId(questions[0].id);
    }
  }, [questions, currentQuestionId, loading]);

  // Loading state
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-slate-900"></div>
          <p className="mt-4 text-sm text-slate-500">Loading questions...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (loadError) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="max-w-md rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-rose-100">
            <AlertCircle className="h-6 w-6 text-rose-600" />
          </div>
          <h3 className="mb-1 text-base font-semibold text-slate-900">Failed to load questions</h3>
          <p className="mb-4 text-sm text-slate-500">{loadError}</p>
          <div className="flex gap-2">
            <button
              onClick={loadExistingQuestions}
              className="flex-1 rounded-xl border border-slate-900 bg-slate-900 px-4 py-2 text-xs font-medium text-white transition hover:bg-slate-800"
            >
              Retry
            </button>
            <button
              onClick={handleBackClick}
              className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-medium text-slate-600 transition hover:bg-slate-50"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Sticky Header */}
      <div className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-6 py-3">
          <div className="flex items-center gap-3">
            {/* Back Button */}
            <button
              onClick={handleBackClick}
              className="flex items-center gap-1 rounded-lg px-2 py-1.5 text-sm text-slate-600 transition hover:bg-slate-100"
            >
              <ChevronLeft size={16} />
              <span>Back</span>
            </button>
            
            {/* Header Content */}
            <div className="flex-1">
              <QuestionHeader
                onPreview={handlePreview}
                saving={saveState.isSaving}
                questionsCount={questions.length}
                unsavedCount={unsavedCount}
                lastSaved={saveState.lastSaved}
                autoSaveEnabled={saveState.autoSaveEnabled}
                hasUnsavedChanges={saveState.hasUnsavedChanges}
                saveError={saveState.saveError}
                sessionId={sessionId}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="mx-auto max-w-7xl px-6 pt-4">
        <div className="rounded-xl border border-slate-200 bg-white p-1 shadow-sm">
          <div className="flex flex-wrap gap-1">
            {(["all", "quiz", "multi", "rating", "open", "drafts"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                  filter === f
                    ? "bg-slate-900 text-white"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                {f === "all" ? "All" : 
                 f === "quiz" ? "Single Choice" :
                 f === "multi" ? "MCQ" :
                 f === "rating" ? "Rating" :
                 f === "open" ? "Open Text" :
                 "Drafts"}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-6 py-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[280px_1fr]">
          {/* Sidebar */}
          <aside className="sticky top-28 self-start">
            <QuestionPalette
              isOpen={paletteOpen}
              onToggle={() => setPaletteOpen(!paletteOpen)}
              onDragStart={(e, t) => e.dataTransfer.setData("application/qtype", t)}
              onAddQuestion={addQuestion}
            />
          </aside>

          {/* Main Content */}
          <main className="space-y-4">
            {filteredQuestions.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100">
                  <AlertCircle size={24} className="text-slate-400" />
                </div>
                <h3 className="mb-1 text-sm font-semibold text-slate-900">No questions found</h3>
                <p className="mb-4 text-xs text-slate-500">Add a question from the palette to get started</p>
                <button
                  onClick={() => addQuestion("quiz")}
                  className="rounded-xl border border-slate-900 bg-slate-900 px-4 py-2 text-xs font-medium text-white transition hover:bg-slate-800"
                >
                  Add First Question
                </button>
              </div>
            ) : (
              filteredQuestions.map((q, idx) => (
                <div 
                  key={q.id} 
                  data-question-id={q.id}
                  onClick={() => setCurrentQuestionId(q.id)}
                  className={`rounded-2xl transition-all ${
                    currentQuestionId === q.id 
                      ? 'shadow-md ring-2 ring-slate-900/10' 
                      : 'hover:shadow-sm'
                  }`}
                >
                  <QuestionEditor
                    question={q}
                    index={idx}
                    onUpdate={updateQuestion}
                    onAddOption={addOption}
                    onUpdateOption={updateOption}
                    onRemoveOption={removeOption}
                    onDragOver={onDragOver}
                    onDropChangeType={onDropChangeType}
                    onNextQuestion={handleNextQuestion}
                    isSaving={saveState.isSaving && currentQuestionId === q.id}
                    isDraft={!!q.meta?.draft}
                  />
                </div>
              ))
            )}

            {filter === "all" && questions.length > 0 && (
              <button
                onClick={() => addQuestion("quiz")}
                className="w-full rounded-2xl border-2 border-dashed border-slate-200 py-4 text-sm font-medium text-slate-500 transition hover:border-slate-300 hover:bg-slate-50"
              >
                + Add Another Question
              </button>
            )}
          </main>
        </div>
      </div>

      {/* Preview Modal */}
      <QuestionPreview
        isOpen={previewOpen}
        questions={questions}
        onClose={() => setPreviewOpen(false)}
      />
    </div>
  );
};

export default QuestionBuilderPage;