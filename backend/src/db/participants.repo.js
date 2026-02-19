import { supabase } from "./index.js";
import {v4 as uuidv4} from 'uuid';

/**
 * Create a new participant in a session
 * @param {Object} params
 * @param {String} params.sessionId
 * @param {String} params.nickname
 * @param {String|null} params.userId
 * @param {String} params.avatarColor
 * @returns Participant Object
**/
export async function createParticipant({sessionId, nickname,userId = null,avatarColor = '#3B82F6'}){
    const {data, error} = await supabase
    .from('participants')
    .insert([{
      id: uuidv4(),
      session_id: sessionId,
      user_id: userId,
      nickname,
      avatar_color: avatarColor,
      joined_at: new Date().toISOString(),
      is_active: true,
      total_score: 0,
      total_correct: 0,
      total_answered: 0
    }])
    .select()
    .single();

    if (error) throw new Error(error.message);
    return data;
}

/**
 * Get participant by nickname in a session
 * @param {String} sessionId
 * @param {String} nickname
 * @returns Participant Object or null
**/

export async function getParticipantByNickName(sessionId,nickname){
    const {data,error} = await supabase
    .from('participants')
    .select('*')
    .eq('session_id',sessionId)
    .eq('nickname',nickname)
    .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
}


/**
 * Update participant's answer for a question
 * @param {String} participantId
 * @param {String} questionId
 * @param {String} selectedOptionId
 * @returns Updated participant answer object
 */

export async function updateParticipantAnswer(
  participantId,
  questionId,
  selectedOptionId
) {
  return await supabase
    .from("participant_answers")
    .update({
      selected_option_id: selectedOptionId,
      answered_at: new Date()
    })
    .eq("participant_id", participantId)
    .eq("question_id", questionId)
    .select();
}


/**
 * Insert participant's answer for a question
 * @param {String} participantId
 * @param {String} sessionId
 * @param {String} questionId
 * @param {String} selectedOptionId
 * @returns Inserted participant answer object
 */

export async function insertParticipantAnswer(
  participantId,
  sessionId,
  questionId,
  selectedOptionId
) {
  return await supabase
    .from("participant_answers")
    .insert({
      participant_id: participantId,
      session_id: sessionId,
      question_id: questionId,
      selected_option_id: selectedOptionId,
      answered_at: new Date()
    })
    .select();
}