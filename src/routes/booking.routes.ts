import { Router } from 'express';
import { createBooking, getMyBookings, getBookingById, cancelBooking, getAllBookings } from '../controllers/booking.controller';
import { protect } from '../middleware/auth.middleware';

const router = Router();

router.post('/', protect, createBooking);
router.get('/my', protect, getMyBookings);
router.get('/all', protect, getAllBookings);
router.get('/:id', protect, getBookingById);
router.patch('/:id/cancel', protect, cancelBooking);

export default router;
