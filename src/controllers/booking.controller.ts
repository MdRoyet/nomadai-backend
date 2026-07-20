import { Request, Response } from 'express';
import { Booking } from '../models/Booking.model';
import { Destination } from '../models/Destination.model';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiError } from '../utils/ApiError';

export const createBooking = asyncHandler(async (req: Request, res: Response) => {
  const { destinationId, checkIn, checkOut, guests, specialRequests, paymentMethod } = req.body;

  if (!destinationId || !checkIn || !checkOut) {
    throw new ApiError(400, 'Destination, check-in and check-out dates are required');
  }

  const destination = await Destination.findById(destinationId);
  if (!destination) throw new ApiError(404, 'Destination not found');

  const nights = Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24));
  if (nights <= 0) throw new ApiError(400, 'Check-out must be after check-in');

  const totalPrice = destination.price * nights * (guests || 1);

  const booking = await Booking.create({
    user: req.user._id,
    destination: destinationId,
    checkIn,
    checkOut,
    guests: guests || 1,
    totalPrice,
    paymentMethod: paymentMethod || 'card',
    specialRequests,
    status: 'confirmed',
  });

  const populated = await booking.populate('destination', 'title location images price');

  res.status(201).json(populated);
});

export const getMyBookings = asyncHandler(async (req: Request, res: Response) => {
  const bookings = await Booking.find({ user: req.user._id })
    .populate('destination', 'title location images price category rating')
    .sort({ createdAt: -1 });
  res.json(bookings);
});

export const getBookingById = asyncHandler(async (req: Request, res: Response) => {
  const booking = await Booking.findById(req.params.id)
    .populate('destination', 'title location images price category rating')
    .populate('user', 'name email');
  if (!booking) throw new ApiError(404, 'Booking not found');
  res.json(booking);
});

export const cancelBooking = asyncHandler(async (req: Request, res: Response) => {
  const booking = await Booking.findById(req.params.id);
  if (!booking) throw new ApiError(404, 'Booking not found');
  if (booking.user.toString() !== req.user._id.toString()) throw new ApiError(403, 'Not authorized');
  if (booking.status === 'cancelled') throw new ApiError(400, 'Already cancelled');

  booking.status = 'cancelled';
  await booking.save();
  res.json(booking);
});

export const getAllBookings = asyncHandler(async (req: Request, res: Response) => {
  const bookings = await Booking.find()
    .populate('destination', 'title location price')
    .populate('user', 'name email')
    .sort({ createdAt: -1 });
  res.json(bookings);
});
