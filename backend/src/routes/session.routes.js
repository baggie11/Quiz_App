import express from 'express';
import { joinSessionController, createSessionController, getSessionController, checkSessionExistsController} from '../controller/session.controller.js';
import { sessionStatusController, getSessionsByTeacher } from '../controller/session.controller.js';
import questionRoutes from './questions.routes.js';
import {authMiddleware} from '../middleware/authmiddleware.js';
import { getSessionsController } from '../controller/session.controller.js';

// Mount under sessions
// e.g., POST /api/sessions/:sessionId/questions


const router = express.Router();

router.post('/join',joinSessionController);
router.get('/:sessionId/status',sessionStatusController);
router.post('/:sessionId/questions', questionRoutes);
router.get('/getSessions',getSessionsController)
// Create a new session (teacher only)
router.post('/', authMiddleware, createSessionController);
router.get('/',authMiddleware,getSessionsByTeacher);
router.get('/:joinCode/check-exists', checkSessionExistsController);

// Get session by ID
router.get('/:sessionId', getSessionController);

export default router;