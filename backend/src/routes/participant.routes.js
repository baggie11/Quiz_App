import express from 'express';
import { joinSessionController, submitParticipantAnswer } from '../controller/participants.controller.js';

const router = express.Router({ mergeParams: true });

router.post("/join-session", joinSessionController);
router.post("/submit", submitParticipantAnswer);

export default router;