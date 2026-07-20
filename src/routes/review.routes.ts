import { Router } from 'express';
import { createReview, getDestinationReviews, deleteReview } from '../controllers/review.controller';
import { protect } from '../middleware/auth.middleware';

const router = Router();

router.post('/', protect, createReview);
router.get('/destination/:destinationId', getDestinationReviews);
router.delete('/:id', protect, deleteReview);

export default router;
