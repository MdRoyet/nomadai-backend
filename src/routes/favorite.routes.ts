import { Router } from 'express';
import { toggleFavorite, getMyFavorites, checkFavorite } from '../controllers/favorite.controller';
import { protect } from '../middleware/auth.middleware';

const router = Router();

router.post('/toggle', protect, toggleFavorite);
router.get('/my', protect, getMyFavorites);
router.get('/check/:destinationId', protect, checkFavorite);

export default router;
