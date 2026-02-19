// import type {
//   DbQuestionType,
//   FormattedQuestionPayload,
//   QType,
//   Question,
//   QuestionOptionPayload,
//   RatingConfig,
// } from "../types";

// export const QUESTION_TYPE_MAP = {
//   MCQ: "mcq",
//   "Single Choice": "singlechoice",
//   "Open Text": "open",
//   Rating: "rating",
// } as const satisfies Record<string, DbQuestionType>;

// export const QTYPE_TO_DB_TYPE: Record<QType, DbQuestionType> = {
//   quiz: QUESTION_TYPE_MAP["Single Choice"],
//   multi: QUESTION_TYPE_MAP.MCQ,
//   open: QUESTION_TYPE_MAP["Open Text"],
//   rating: QUESTION_TYPE_MAP.Rating,
// };

// export const DB_TYPE_TO_QTYPE: Record<DbQuestionType, QType> = {
//   mcq: "multi",
//   singlechoice: "quiz",
//   open: "open",
//   rating: "rating",
// };

// type ValidationResult =
//   | { valid: true }
//   | { valid: false; message: string };

// const normalizeOptionPayload = (
//   question: Question,
//   dbType: DbQuestionType
// ): QuestionOptionPayload[] => {
//   const raw = (question.options ?? []).map((opt) => (opt ?? "").trim());
//   const options = raw.filter(Boolean);

//   return options.map((option_text, idx) => {
//     const is_correct =
//       dbType === "singlechoice"
//         ? question.correctAnswer === idx
//         : (question.multiAnswers ?? []).includes(idx);

//     return { option_text, is_correct };
//   });
// };

// export const validateQuestionForSave = (question: Question): ValidationResult => {
//   const dbType = QTYPE_TO_DB_TYPE[question.type];
//   const text = (question.text ?? "").trim();
//   if (!text) {
//     return { valid: false, message: "Question text is required." };
//   }

//   if (dbType === "mcq" || dbType === "singlechoice") {
//     const optionCount = (question.options ?? []).filter((opt) => (opt ?? "").trim()).length;
//     if (optionCount < 2) {
//       return { valid: false, message: "At least 2 options are required for choice questions." };
//     }
//   }

//   if (dbType === "singlechoice") {
//     if (question.correctAnswer == null) {
//       return { valid: false, message: "Single Choice question needs one correct answer." };
//     }
//   }

//   return { valid: true };
// };

// export const formatQuestionPayload = (question: Question): FormattedQuestionPayload => {
//   const question_type = QTYPE_TO_DB_TYPE[question.type];
//   let options: FormattedQuestionPayload["options"] = null;

//   if (question_type === "mcq" || question_type === "singlechoice") {
//     options = normalizeOptionPayload(question, question_type);
//   } else if (question_type === "rating") {
//     const min = Math.max(1, Math.min(10, question.ratingMin ?? 1));
//     const requestedMax = Math.max(2, Math.min(10, question.ratingMax ?? 5));
//     const ratingOptions: RatingConfig = {
//       min,
//       max: Math.max(requestedMax, min + 1),
//     };
//     const labels = (question.ratingLabels ?? []).map((label) => label.trim()).filter(Boolean);
//     if (labels.length) {
//       ratingOptions.labels = labels;
//     }
//     options = ratingOptions;
//   } else {
//     options = null;
//   }

//   return {
//     question_text: (question.text ?? "").trim() || "Untitled Question",
//     question_type,
//     options,
//   };
// };