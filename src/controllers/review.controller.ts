import { Request, Response } from 'express';
import { Review } from '../models/Review.model';
import { Destination } from '../models/Destination.model';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiError } from '../utils/ApiError';

export const createReview = asyncHandler(async (req: Request, res: Response) => {
  const { destinationId, rating, title, comment, visitDate, travelType } = req.body;

  if (!destinationId || !rating || !title || !comment) {
    throw new ApiError(400, 'All fields are required');
  }

  const destination = await Destination.findById(destinationId);
  if (!destination) throw new ApiError(404, 'Destination not found');

  const existing = await Review.findOne({ user: req.user._id, destination: destinationId });
  if (existing) throw new ApiError(400, 'You already reviewed this destination');

  const review = await Review.create({
    user: req.user._id,
    destination: destinationId,
    rating,
    title,
    comment,
    visitDate,
    travelType,
  });

  // Update destination average rating
  const allReviews = await Review.find({ destination: destinationId });
  const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
  destination.rating = Math.round(avgRating * 10) / 10;
  await destination.save();

  const populated = await review.populate('user', 'name avatar');
  res.status(201).json(populated);
});

export const getDestinationReviews = asyncHandler(async (req: Request, res: Response) => {
  const reviews = await Review.find({ destination: req.params.destinationId })
    .populate('user', 'name avatar')
    .sort({ createdAt: -1 });
  res.json(reviews);
});

export const deleteReview = asyncHandler(async (req: Request, res: Response) => {
  const review = await Review.findById(req.params.id);
  if (!review) throw new ApiError(404, 'Review not found');
  if (review.user.toString() !== req.user._id.toString()) throw new ApiError(403, 'Not authorized');

  await review.deleteOne();

  // Recalculate average
  const allReviews = await Review.find({ destination: review.destination });
  const destination = await Destination.findById(review.destination);
  if (destination) {
    destination.rating = allReviews.length > 0
      ? Math.round((allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length) * 10) / 10
      : 4.5;
    await destination.save();
  }

  res.json({ message: 'Review deleted' });
});
