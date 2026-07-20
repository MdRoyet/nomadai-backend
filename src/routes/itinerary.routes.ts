import { Router } from 'express';
import { createItinerary, getMyItineraries, getItineraryById, updateItinerary, deleteItinerary } from '../controllers/itinerary.controller';
import { protect } from '../middleware/auth.middleware';

const router = Router();

router.post('/', protect, createItinerary);
router.get('/my', protect, getMyItineraries);
router.get('/:id', protect, getItineraryById);
router.put('/:id', protect, updateItinerary);
router.delete('/:id', protect, deleteItinerary);

export default router;
