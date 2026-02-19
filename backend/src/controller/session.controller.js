import { joinSession, getSessionStatus } from "../services/session.service.js";
import { addSession, fetchSession } from '../services/session.service.js';
import { listTeacherSessions, checkSessionExists, getSessions } from "../services/session.service.js";
import { getQuestionsBySession } from "../db/questions.repo.js";

/**
 * Get /
 **/

export async function getSessionsController(req,res){
  try {
    const sessions = await getSessions();

    return res.status(200).json({
      success: true,
      data: sessions
    });
  } catch (error) {
    console.error("Controller Error:", error.message);

    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
}

/**
 * POST /session/join
 **/

export async function checkSessionExistsController(req, res) {
  try {
    const { joinCode } = req.params;
    console.log("joinCode:", joinCode);

    if (!joinCode) {
      return res.status(400).json({
        status: "fail",
        message: "joinCode is required",
      });
    }

    // check if session exists
    const exists = await checkSessionExists(joinCode);

    // if session does not exist, no need to fetch questions
    if (!exists) {
      return res.status(200).json({
        status: "ok",
        data: {
          exists: false,
          questions: [],
        },
      });
    }

    // fetch questions if session exists
    const questions = await getQuestionsBySession(joinCode);

    return res.status(200).json({
      status: "ok",
      data: {
        exists: true,
        questions: questions, // or just `questions`
      },
    });

  } catch (err) {
    return res.status(500).json({
      status: "error",
      message: err.message,
    });
  }
}

/**
 * POST /join
 * Body: { joinCode, nickname, userId (optional) }
 * Returns: session and participant info
 */
export async function joinSessionController(req, res) {
  try {
    const { joinCode, nickname, userId } = req.body;

    if (!joinCode || !nickname) {
      return res.status(400).json({
        status: "fail",
        message: "joinCode and nickname are required",
      });
    }

    const result = await joinSession({ joinCode, nickname, userId });

    return res.status(200).json({
      status: "ok",
      data: result,
    });

  } catch (err) {
    return res.status(400).json({
      status: "fail",
      message: err.message,
    });
  }
}

/** GET /session/:sessionId/status
 * Returns session status
 * @param {Object} req
 * @param {Object} res
 * @returns {Object} response
 */
export async function sessionStatusController(req, res) {
  try {
    const { sessionId } = req.params;

    if (!sessionId) {
      return res.status(400).json({
        status: "fail",
        message: "Missing sessionId parameter",
      });
    }

    const result = await getSessionStatus(sessionId);

    return res.status(200).json({
      status: "ok",
      data: result,
    });

  } catch (err) {
    if (err.message === "Session not found") {
      return res.status(404).json({
        status: "fail",
        message: "Session not found",
      });
    }

    return res.status(500).json({
      status: "error",
      message: err.message,
    });
  }
}

/** Create a new session
 * @param {Object} req
 * @param {Object} res
 * @returns {Object} response
 */
export async function createSessionController(req,res){
  try{
    const teacherId = req.user.id;
    const sessionData = req.body;

    const session = await addSession(teacherId, sessionData);

    return res.status(201).json({
      status : 'ok',
      data : session,
    });
  }catch(err){
    return res.status(400).json({
      success : false,
      message : err.message,
    });
  }
}

/** Get session details
 * @param {Object} req
 * @param {Object} res
 * @returns {Object} response
 */
export async function getSessionController(req, res) {
  try {
    const { sessionId } = req.params;
    const session = await fetchSession(sessionId);
    return res.status(200).json({ status: 'ok', data: session });
  } catch (err) {
    if (err.message === 'Session not found') return res.status(404).json({ status: 'fail', message: err.message });
    return res.status(500).json({ status: 'error', message: err.message });
  }
}


/**
 * GET /
 */
export async function getSessionsByTeacher(req,res){
  try{
    const teacherId = req.user.id;

    const sessions = await listTeacherSessions(teacherId);
    
    return res.status(200).json({
      success : true,
      sessions,
    });
  }catch(err){
    return res.status(500).json({
      success : false,
      message : err.message,
    });
  }
}