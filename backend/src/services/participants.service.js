// services/session.service.js
import { getSessionByJoinCode } from "../db/sessions.repo.js";
import {
  createParticipant,
  getParticipantByNickName,
  updateParticipantAnswer,
  insertParticipantAnswer,
  insertQuizParticipantAnswer
} from "../db/participants.repo.js";


/**
 * Participant joins a session using session code and roll number
 * @param {Object} params
 * @param {String} params.sessionCode
 * @param {String} params.rollNumber
 * @returns {Object} participant details
 */
export async function joinSessionService({
  sessionCode,
  rollNumber
}) {
  // 1. Validate session
  const session = await getSessionByJoinCode(sessionCode);
  if (!session) {
    throw new Error("Invalid session code");
  }

  // if (session.status !== "active") {
  //   throw new Error("Session is not active");
  // }

  // 2. Normalize roll number (voice-safe)
  const nickname = rollNumber.trim().toUpperCase();

  // 3. Prevent duplicate roll numbers in same session
  const existingParticipant = await getParticipantByNickName(
    session.id,
    nickname
  );

  if (existingParticipant) {
    throw new Error("This roll number has already joined the session");
  }

  // 4. Create participant
  const participant = await createParticipant({
    sessionId: session.id,
    nickname
  });

  return {
    participantId: participant.id,
    sessionId: session.id,
    rollNumber: participant.nickname
  };
}

/**
 * Save or update participant's answer for a question
 * @param {Object} params
 * @param {String} params.participantId
 * @param {String} params.sessionId
 * @param {String} params.questionId
 * @param {String} params.selectedOptionId
 * @returns {Object} result with status and answer object
 */

export async function saveParticipantAnswer({
  participantId,
  sessionId,
  questionId,
  selectedOptionId
}) {
  // Try UPDATE first
  const { data: updated, error: updateError } =
    await updateParticipantAnswer(
      participantId,
      questionId,
      selectedOptionId
    );

  if (updateError) throw updateError;

  if (updated && updated.length > 0) {
    return {
      status: "updated",
      answer: updated[0]
    };
  }

  // Otherwise INSERT
  const { data: inserted, error: insertError } =
    await insertParticipantAnswer(
      participantId,
      sessionId,
      questionId,
      selectedOptionId
    );

  if (insertError) throw insertError;

  return {
    status: "inserted",
    answer: inserted[0]
  };
}

export async function saveParticipantAnswers(payload) {
  const { session_id, participant_id, responses } = payload;

  if (!session_id || !participant_id || !responses) {
    throw new Error("session_id, participant_id and responses are required");
  }

  // you can add more logic here later (validation, scoring, etc.)

  return await insertQuizParticipantAnswer({
    session_id,
    participant_id,
    responses
  });
}