import express from 'express';
import { register, login, getProfile } from '../controllers/auth.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { validate, registerValidation, loginValidation } from '../middleware/validation.middleware.js';

const router = express.Router();

// Public routes
router.post('/register', validate(registerValidation), register);
router.post('/login', validate(loginValidation), login);

// Protected routes
router.get('/profile', protect, getProfile);

export default router;
