import { Router } from 'express';
import { getDashboardSummary } from '../controllers/dashboard.controller';
import { authenticateToken, requireRole } from '../middleware/auth';

const router = Router();

router.get(
  '/summary',
  authenticateToken,
  requireRole(['ADMIN', 'COORDINATOR']),
  getDashboardSummary
);

export default router;
