import express from 'express';
import { validateRequest } from '../middleware/validation.middleware';
import { loginSchema, registerSchema } from '../utils/validation.schemas';
import { login, register, refreshAccessTokenHandler, logoutHandler } from '../controller/auth.controller';
import { protect, validateBearerFormat } from '../middleware/auth.middleware';

const router = express.Router();

// Public routes
router.post('/auth/register', validateRequest(registerSchema), register);
router.post('/auth/login', validateRequest(loginSchema), login);
router.post('/auth/refresh', refreshAccessTokenHandler);

// Protected routes
router.post('/auth/logout', validateBearerFormat, protect, logoutHandler);

export default router;
