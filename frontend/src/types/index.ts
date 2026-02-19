export type UserType = {
  name: string;
  email: string;
  role?: string;
};

export type Session = {
  id: string;
  title: string;
  start_date: string | null;
  end_date: string | null;
  draft: boolean;
  created_at: string;
  updated_at: string;
};

export type MenuItem = {
  id: string;
  icon: React.ComponentType<any>;
  label: string;
};

export type SessionStatus = {
  text: string;
  color: string;
  icon: string;
};


export type QType = "quiz" | "multi" | "rating" | "open";

export interface Question {
  id: string;
  text: string;
  type: QType;
  options?: string[];
  ratingMax?: number;
  correctAnswer?: number| null;
  modelAnswer?: string;
  multiAnswers?: number[];
  meta?: { required?: boolean; draft?: boolean; [k: string]: any };
}

export interface QuestionBuilderProps {
  sessionId: string;
  onSave?: (questions: Question[]) => void;
  onPreview?: (questions: Question[]) => void;
}

export interface QuestionEditorProps {
  question: Question;
  index: number;
  onUpdate: (id: string, patch: Partial<Question>) => void;
  onAddOption: (questionId: string) => void;
  onUpdateOption: (questionId: string, idx: number, value: string) => void;
  onRemoveOption: (questionId: string, idx: number) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDropChangeType: (e: React.DragEvent, questionId: string) => void;
}

export interface QuestionPaletteProps {
  isOpen: boolean;
  onToggle: () => void;
  onDragStart: (e: React.DragEvent, type: QType) => void;
  onAddQuestion: (type: QType) => void;
}

export interface QuestionPreviewProps {
  isOpen: boolean;
  questions: Question[];
  onClose: () => void;
}

export interface QuestionHeaderProps {
  onPreview: () => void;
  onSaveAll: () => void;
  saving: boolean;
}

 
// types.ts (add these interfaces)
export interface SaveState {
  isSaving: boolean;
  lastSaved: string | null;
  hasUnsavedChanges: boolean;
  autoSaveEnabled: boolean;
  saveError: string | null;
}

export interface QuizState {
  title: string;
  description: string;
  questions: Question[];
  sessionId: string;
  version: number;
  createdAt: string;
  updatedAt: string;
}

export interface QuestionBuilderProps {
  sessionId: string;
  onSave?: (questions: Question[]) => void;
  onPreview?: (questions: Question[]) => void;
  initialQuestions?: Question[]; // Add this for loading existing questions
  autoSaveInterval?: number; // Add this for configurable auto-save
}

// export interface QuestionOption {
//   id: string;     // 👈 UUID from DB
//   text: string;
// }