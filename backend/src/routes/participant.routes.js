import express from 'express';
import { joinSessionController, submitParticipantAnswer, createParticipantAnswers } from '../controller/participants.controller.js';

const router = express.Router({ mergeParams: true });

router.post("/join-session", joinSessionController);
router.post("/submit", submitParticipantAnswer);
router.post("/create-answers", createParticipantAnswers);
export default router;