
import { Router } from 'express';
import {
  register,
  login,
  refresh,
  logout,
  getMe,
} from '../controllers/auth.controller';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Faculty Registration
router.post('/register', register);

// Authentication
router.post('/login', login);
router.post('/refresh', refresh);
router.post('/logout', logout);

// Current User
router.get('/me', authenticateToken, getMe);

export default router;
