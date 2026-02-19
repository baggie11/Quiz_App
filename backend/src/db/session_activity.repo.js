import {supabase} from './index.js';
import {v4 as uuidv4} from 'uuid';

/** Log an activity in session_activity table
 * @param {Object} params
 * @param {string} params.sessionId
 * @param {string|null} params.participantId
 * @param {string} params.activityType
 * @param {Object} params.metadata
 * @returns {Promise<Object>} logged activity
 */
export async function logActivity({sessionId, participantId = null, activityType, metadata = {}}){
    const {data, error} = await supabase
    .from('session_activity')
    .insert([{
        id : uuidv4(),
        session_id : sessionId,
        participant_id : participantId,
        activity_type : activityType,
        metadata,
        created_at : new Date().toISOString()
    }])
    .select()
    .single();

    if (error) throw new Error(error.message);
    return data;
}

/** Get the latest question_start activity for a session
 * @param {string} sessionId
 * @returns {Promise<Object>} latest question_start activity
 */
export async function getLatestQuestionStart(sessionId){
    //we look for the most recent activity_type = 'question_start'
    const {data, error} = await supabase
    .from('session_activity')
    .select('*')
    .eq('session_id',sessionId)
    .eq('activity_type','question_start')
    .order('created_at',{ascending :false})
    .limit(1)
    .maybeSingle();

    if (error) throw new Error(error.message);
    return data;
}