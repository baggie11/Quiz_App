import { getSessionByJoinCode, getSessionById, createSession, getSessionsByTeacherId, getAllSessions} from "../db/sessions.repo.js";
import { createParticipant, getParticipantByNickName } from "../db/participants.repo.js";
import { logActivity, getLatestQuestionStart } from "../db/session_activity.repo.js";
import { getQuestionById } from "../db/questions.repo.js";

/**
 * Check if the session exists by its join code
**/

export async function checkSessionExists(joinCode){
  const session = await getSessionByJoinCode(joinCode);
  return !!session;
}

/** GET ALL SESSIONS **/
export async function getSessions(){
  const sessions = await getAllSessions();

  // place for business rules if needed
  // example: validation, filtering, formatting

  return sessions;
}
/**
 * Participant joins a session using join code
 */
export async function joinSession({ joinCode, userId = null }) {
  // Find session
  const session = await getSessionByJoinCode(joinCode);
  if (!session) throw new Error("Session not found");

  // Ensure session can be joined
  const lateJoinAllowed = session?.settings?.allow_late_join ?? false;
  if (session.status !== "active" && !lateJoinAllowed) {
    throw new Error("Session is not active or late joining is not allowed");
  }

  // Check nickname uniqueness
  const existing = await getParticipantByNickName(session.id, nickname);
  if (existing) throw new Error("Roll number already exists in this session");

  // Create participant
  const participant = await createParticipant({
    sessionId: session.id,
    nickname,
    userId,
  });

  // Log activity
  await logActivity({
    sessionId: session.id,
    participantId: participant.id,
    activityType: "join",
  });

  return { participant, session };
}

/**
 * Get the current session status + the latest active question
 */
export async function getSessionStatus(sessionId) {
  const session = await getSessionById(sessionId);
  if (!session) throw new Error("Session not found");

  const status = session.status;

  // Get the last question_start event
  const lastQuestionStart = await getLatestQuestionStart(sessionId);

  let currentQuestion = null;

  if (
    lastQuestionStart &&
    lastQuestionStart.metadata &&
    lastQuestionStart.metadata.questionId
  ) {
    const qid = lastQuestionStart.metadata.questionId;
    const question = await getQuestionById(qid);

    if (question) {
      currentQuestion = {
        id: question.id,
        text: question.question_text,
        question_type: question.question_type,
        options: question.options,
        time_limit: question.time_limit,
        order_index: question.order_index,
        image_url: question.image_url,
      };
    }
  }

  return {
    status,
    sessionId: session.id,
    title: session.title,
    started_at: session.started_at,
    currentQuestion,
  };
}

export async function addSession(teacherId, sessionData){
  if (!sessionData.title || !sessionData.title.trim()){
    throw new Error("Session title is required");
  } 

  if (!sessionData.duration || sessionData.duration <=0 ){
    throw new Error('Duration (minutes) must be greater than 0');
  }

  return await createSession(teacherId, sessionData);
}

export async function fetchSession(sessionId) {
  const session = await getSessionById(sessionId);
  if (!session) throw new Error('Session not found');
  return session;
}

/**
 * Get all sessions created by a teacher
 * @param {string} teacherId
 * @returns {Promise<Array>}
 */
export async function listTeacherSessions(teacherId){
  if (!teacherId){
    throw new Error("Teacher ID is required");
  }
  const sessions = await getSessionsByTeacherId(teacherId);
  console.log("In sessions service:" , sessions);
  return sessions;
}