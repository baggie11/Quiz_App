import { supabase } from './index.js';
import { getSessionByJoinCode } from './sessions.repo.js';

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/**
 * Get a question by its ID
 * @param {string} questionId
 * @returns {Promise<Object>} question object
 */
export async function getQuestionById(questionId) {
  const { data, error } = await supabase
    .from('questions')
    .select('id, question_text, question_type, options, time_limit, image_url, explanation, order_index')
    .eq('id', questionId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data;
}

/** List all questions for a session
 * @param {string} sessionId
 * @returns {Promise<Array<Object>>} list of questions
 */


export async function getQuestionsBySession(joinCode) {
  let sessionId;

  // 1️⃣ Check if joinCode is already a UUID (session_id)
  if (UUID_REGEX.test(joinCode)) {
    sessionId = joinCode;
  } else {
    // Otherwise resolve session using join code
    const session = await getSessionByJoinCode(joinCode);

    if (!session) {
      throw new Error("Invalid or expired join code");
    }

    sessionId = session.id;
  }

  // 2️⃣ Fetch questions + options
  const { data, error } = await supabase
    .from("questions")
    .select(`
      id,
      question_text,
      order_index,
      question_options (
        id,
        option_text,
        is_correct
      )
    `)
    .eq("session_id", sessionId)
    .order("order_index", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return data;
}



/**
 * Save a question - insertion
 * @param {Object} questionData
 * @returns {Promise<Object>} inserted question object
 */

export async function insertQuestion(question) {
  const { data, error } = await supabase
    .from('questions')
    .insert([question])
    .select()
    .single();

  

  if (error) throw new Error(error.message);
  return data;
}

export async function insertQuestionOptions(options) {
  const { data, error } = await supabase
    .from('question_options')
    .insert(options)
    .select();
  
  

  if (error) throw new Error(error.message);
}