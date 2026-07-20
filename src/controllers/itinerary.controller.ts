import { Request, Response } from 'express';
import { Itinerary } from '../models/Itinerary.model';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiError } from '../utils/ApiError';

export const createItinerary = asyncHandler(async (req: Request, res: Response) => {
  const { destinationId, title, startDate, endDate, days, budget, travelers } = req.body;

  if (!destinationId || !title || !startDate || !endDate) {
    throw new ApiError(400, 'Destination, title, start and end dates are required');
  }

  const itinerary = await Itinerary.create({
    user: req.user._id,
    destination: destinationId,
    title,
    startDate,
    endDate,
    days: days || [],
    budget,
    travelers: travelers || 1,
  });

  const populated = await itinerary.populate('destination', 'title location images');
  res.status(201).json(populated);
});

export const getMyItineraries = asyncHandler(async (req: Request, res: Response) => {
  const itineraries = await Itinerary.find({ user: req.user._id })
    .populate('destination', 'title location images')
    .sort({ createdAt: -1 });
  res.json(itineraries);
});

export const getItineraryById = asyncHandler(async (req: Request, res: Response) => {
  const itinerary = await Itinerary.findById(req.params.id)
    .populate('destination', 'title location images price category');
  if (!itinerary) throw new ApiError(404, 'Itinerary not found');
  res.json(itinerary);
});

export const updateItinerary = asyncHandler(async (req: Request, res: Response) => {
  const itinerary = await Itinerary.findById(req.params.id);
  if (!itinerary) throw new ApiError(404, 'Itinerary not found');
  if (itinerary.user.toString() !== req.user._id.toString()) throw new ApiError(403, 'Not authorized');

  Object.assign(itinerary, req.body);
  await itinerary.save();

  const populated = await itinerary.populate('destination', 'title location images');
  res.json(populated);
});

export const deleteItinerary = asyncHandler(async (req: Request, res: Response) => {
  const itinerary = await Itinerary.findById(req.params.id);
  if (!itinerary) throw new ApiError(404, 'Itinerary not found');
  if (itinerary.user.toString() !== req.user._id.toString()) throw new ApiError(403, 'Not authorized');

  await itinerary.deleteOne();
  res.json({ message: 'Itinerary deleted' });
});
