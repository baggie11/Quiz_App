import express from 'express';
import { userSignUp,userLogin, verifyEmailController } from '../controller/auth.controller.js';

const router = express.Router();

//routes
router.post('/user/signup', userSignUp);
router.post('/user/login',userLogin);
router.post('/user/verify-email',verifyEmailController)

export default router;