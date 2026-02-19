// hooks/useQuestionSaveManager.ts
import { useState, useCallback, useEffect, useRef } from 'react';
import type { Question, QuestionSaveState, QuestionUpdateRequest } from '../types';

interface UseQuestionSaveManagerProps {
  sessionId: string;
  autoSaveDelay?: number;
  onQuestionSave?: (question: Question, source: string) => Promise<boolean>;
  onSaveComplete?: (questionId: string, savedAt: string) => void;
  onSaveError?: (questionId: string, error: string) => void;
}

export const useQuestionSaveManager = ({
  sessionId,
  autoSaveDelay = 2000,
  onQuestionSave,
  onSaveComplete,
  onSaveError,
}: UseQuestionSaveManagerProps) => {
  const [questionStates, setQuestionStates] = useState<Record<string, QuestionSaveState>>({});
  const [activeQuestionId, setActiveQuestionId] = useState<string | null>(null);
  const [pendingSaves, setPendingSaves] = useState<Set<string>>(new Set());
  
  const saveTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});
  const questionRefs = useRef<Record<string, Question>>({});

  // Initialize or update question state
  const updateQuestionState = useCallback((questionId: string, updates: Partial<QuestionSaveState>) => {
    setQuestionStates(prev => ({
      ...prev,
      [questionId]: {
        ...(prev[questionId] || {
          id: questionId,
          isSaving: false,
          lastSaved: null,
          hasUnsavedChanges: false,
          error: null,
          version: 0,
          lastModified: new Date().toISOString(),
        }),
        ...updates,
      },
    }));
  }, []);

  // Store question reference
  const storeQuestionRef = useCallback((questionId: string, question: Question) => {
    questionRefs.current[questionId] = question;
  }, []);

  // Mark question as modified and schedule auto-save
  const markQuestionModified = useCallback((questionId: string, question: Question) => {
    // Store reference
    storeQuestionRef(questionId, {
      ...question,
      meta: {
        ...question.meta,
        lastModified: new Date().toISOString(),
      },
    });

    // Mark as unsaved
    updateQuestionState(questionId, {
      hasUnsavedChanges: true,
      lastModified: new Date().toISOString(),
    });

    // Clear existing timer
    if (saveTimers.current[questionId]) {
      clearTimeout(saveTimers.current[questionId]);
    }

    // Schedule auto-save after delay
    saveTimers.current[questionId] = setTimeout(() => {
      if (questionRefs.current[questionId]) {
        saveQuestion(questionId, 'auto-save');
      }
    }, autoSaveDelay);
  }, [autoSaveDelay]);

  // Save single question
  const saveQuestion = useCallback(async (questionId: string, source: 'auto-save' | 'manual-save' | 'question-completion' = 'auto-save') => {
    const question = questionRefs.current[questionId];
    if (!question || questionStates[questionId]?.isSaving) {
      return false;
    }

    // Update state to saving
    updateQuestionState(questionId, {
      isSaving: true,
      error: null,
    });

    try {
      // Call the save function
      const success = onQuestionSave ? await onQuestionSave(question, source) : await defaultSaveQuestion(question, source);
      
      if (success) {
        updateQuestionState(questionId, {
          isSaving: false,
          hasUnsavedChanges: false,
          lastSaved: new Date().toISOString(),
          version: (questionStates[questionId]?.version || 0) + 1,
        });
        
        // Update question ref with saved timestamp
        storeQuestionRef(questionId, {
          ...question,
          meta: {
            ...question.meta,
            lastSaved: new Date().toISOString(),
          },
        });
        
        onSaveComplete?.(questionId, new Date().toISOString());
        return true;
      } else {
        throw new Error('Save failed');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Save failed';
      updateQuestionState(questionId, {
        isSaving: false,
        error: errorMessage,
      });
      onSaveError?.(questionId, errorMessage);
      return false;
    }
  }, [questionStates, onQuestionSave, onSaveComplete, onSaveError]);

  // Save question when user completes it (moves to next)
  const saveQuestionOnComplete = useCallback(async (questionId: string) => {
    // Clear any pending auto-save timer
    if (saveTimers.current[questionId]) {
      clearTimeout(saveTimers.current[questionId]);
      delete saveTimers.current[questionId];
    }

    // Force save immediately
    return saveQuestion(questionId, 'question-completion');
  }, [saveQuestion]);

  // Save all pending questions (manual save all)
  const saveAllQuestions = useCallback(async () => {
    const questionIds = Object.keys(questionRefs.current);
    const unsavedIds = questionIds.filter(id => 
      questionStates[id]?.hasUnsavedChanges && !questionStates[id]?.isSaving
    );

    if (unsavedIds.length === 0) return true;

    const results = await Promise.all(
      unsavedIds.map(id => saveQuestion(id, 'manual-save'))
    );

    return results.every(result => result);
  }, [questionStates, saveQuestion]);

  // Get questions that need saving
  const getQuestionsNeedingSave = useCallback(() => {
    return Object.keys(questionStates).filter(id => 
      questionStates[id]?.hasUnsavedChanges && !questionStates[id]?.isSaving
    );
  }, [questionStates]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      Object.values(saveTimers.current).forEach(timer => clearTimeout(timer));
    };
  }, []);

  // Default save implementation (PUT request)
  const defaultSaveQuestion = useCallback(async (question: Question, source: string) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`http://localhost:3000/api/questions/${question.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        question,
        sessionId,
        timestamp: new Date().toISOString(),
        source,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to save question: ${response.statusText}`);
    }

    return true;
  }, [sessionId]);

  return {
    // State
    questionStates,
    activeQuestionId,
    pendingSaves: Array.from(pendingSaves),
    
    // Actions
    markQuestionModified,
    saveQuestion,
    saveQuestionOnComplete,
    saveAllQuestions,
    setActiveQuestionId,
    getQuestionsNeedingSave,
    updateQuestionState,
    storeQuestionRef,
    
    // Getters
    getQuestionState: (questionId: string) => questionStates[questionId],
    hasUnsavedChanges: Object.values(questionStates).some(state => state.hasUnsavedChanges),
    isSavingAny: Object.values(questionStates).some(state => state.isSaving),
  };
};