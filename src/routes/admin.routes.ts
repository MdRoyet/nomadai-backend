import { Router } from 'express';
import { getAdminStats } from '../controllers/admin.controller';
import { protect } from '../middleware/auth.middleware';

const router = Router();

router.get('/stats', protect, getAdminStats);

export default router;
