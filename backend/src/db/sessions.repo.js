import {supabase} from './index.js';
import {generateUniqueJoinCode} from '../utils/joinCode.js'; 


/**
 * Get all the sessions from the table
**/
export async function getAllSessions(){
  const { data, error } = await supabase
    .from("sessions")
    .select("join_code");

  if (error) {
    console.error("Supabase Repo Error:", error.message);
    throw new Error(error.message);
  }

  return data;
}

/**
 * Get session by join code
 * @param {string} joinCode
 * @returns {Promise<Object>} session object
 */

export async function getSessionByJoinCode(joinCode){
    const {data,error} = await supabase
    .from('sessions')
    .select('*')
    .eq('join_code',joinCode)
    .maybeSingle();

    if (error) throw new Error(error.message);
    return data;
}

/** Get session by ID
 * @param {string} sessionId
 * @returns {Promise<Object>} session object
 */

export async function getSessionById(sessionId){
    const {data, error} = await supabase
    .from('sessions')
    .select("*")
    .eq('id',sessionId)
    .maybeSingle();

    if (error) throw new Error(error.message);
    return data;
}

/** Create a new session
 * @param {string} teacherId
 * @param {Object} sessionData
 * @returns {Promise<Object>} created session
 */
export async function createSession(teacherId,sessionData){
  const {
    title,
    start_date = null,
    end_date = null,
    duration,
    is_draft = true,
  } = sessionData;

  const join_code = await generateUniqueJoinCode();

  const {data,error} = await supabase
  .from('sessions')
  .insert([{
    teacher_id : teacherId,
    title,
    start_date,
    end_date,
    duration_minutes : duration,
    is_draft,
    join_code,
  }])
  .select(`
    id,
      teacher_id,
      title,
      join_code,
      start_date,
      end_date,
      duration_minutes,
      is_draft,
      created_at
    `)
    .single();

    if (error) throw new Error(error.message);
    return data;
}

/**
 * Get all sessions created by a teacher
 * @param {string} teacherId
 * @returns {Promise<Array>} list of sessions
 */

export async function getSessionsByTeacherId(teacherId){
  const {data , error} = await supabase
  .from('sessions')
  .select('*')
  .eq('teacher_id',teacherId);

  if (error) throw new Error(error.message);
  return data;
}



