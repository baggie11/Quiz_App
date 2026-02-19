// controllers/session.controller.js
import { joinSessionService, saveParticipantAnswer
 } from "../services/participants.service.js";


/**
 * Participant joins a session using session code and roll number
 * @param {Object} req
 * @param {Object} res
 * @returns {Object} JSON response
 */

export async function joinSessionController(req, res) {
  try {
    const { roll_number, session_code } = req.body;

    if (!roll_number || !session_code) {
      return res.status(400).json({
        success: false,
        message: "Roll number and session code are required"
      });
    }

    const result = await joinSessionService({
      sessionCode: session_code,
      rollNumber: roll_number
    });

    return res.status(201).json({
      success: true,
      data: result,
      message: "Joined session successfully"
    });

  } catch (err) {
    return res.status(400).json({
      success: false,
      message: err.message
    });
  }
}

/**
 * Save or update participant's answer for a question
 * @param {Object} req
 * @param {Object} res
 * @returns {Object} JSON response
 */

export async function submitParticipantAnswer(req, res) {
  try {
    const {
      participantId,
      sessionId,
      questionId,
      selectedOptionId
    } = req.body;

    if (!participantId || !sessionId || !questionId || !selectedOptionId) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields"
      });
    }

    const result = await saveParticipantAnswer({
      participantId,
      sessionId,
      questionId,
      selectedOptionId
    });

    return res.status(200).json({
      success: true,
      ...result
    });
  } catch (err) {
    console.error("Submit answer error:", err);
    return res.status(500).json({
      success: false,
      message: "Could not save answer"
    });
  }
}