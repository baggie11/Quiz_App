import { insertQuestion,insertQuestionOptions, getQuestionsBySession} from '../db/questions.repo.js';

/**
 * create a question with options
**/
export async function createQuestion(payload) {
  const {
    session_id,
    question_text,
    question_type,
    order_index,
    image_url,
    explanation,
    options,
  } = payload;


  
  const question = await insertQuestion({
    session_id,
    question_text,
    question_type,
    order_index,
    image_url,
    explanation,
  });

  if (options?.length) {
    const optionsPayload = options.map((opt) => ({
      question_id: question.id,
      option_text: opt.option_text,
      is_correct: opt.is_correct ?? false,
    }));
  
    console.log("Options"+options);

    await insertQuestionOptions(optionsPayload);
  }

  return question;
}





/**
 * Get all questions in a session
 */
export async function listQuestions(sessionCode) {

  return await getQuestionsBySession(sessionCode);
}
