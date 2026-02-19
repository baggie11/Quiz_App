import express from 'express';
import { createQuestionController, listQuestionsController } from '../controller/questions.controller.js';


const router = express.Router({ mergeParams: true });

router.post('/', createQuestionController);

// GET /sessions/:sessionId/questions → List questions
router.get('/', listQuestionsController);

export default router;
