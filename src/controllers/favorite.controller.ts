import { Request, Response } from 'express';
import { Favorite } from '../models/Favorite.model';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiError } from '../utils/ApiError';

export const toggleFavorite = asyncHandler(async (req: Request, res: Response) => {
  const { destinationId } = req.body;
  if (!destinationId) throw new ApiError(400, 'Destination ID required');

  const existing = await Favorite.findOne({ user: req.user._id, destination: destinationId });

  if (existing) {
    await existing.deleteOne();
    res.json({ favorited: false });
  } else {
    await Favorite.create({ user: req.user._id, destination: destinationId });
    res.json({ favorited: true });
  }
});

export const getMyFavorites = asyncHandler(async (req: Request, res: Response) => {
  const favorites = await Favorite.find({ user: req.user._id })
    .populate('destination', 'title short_desc price location category rating images tags')
    .sort({ createdAt: -1 });
  res.json(favorites.map(f => f.destination));
});

export const checkFavorite = asyncHandler(async (req: Request, res: Response) => {
  const existing = await Favorite.findOne({ user: req.user._id, destination: req.params.destinationId });
  res.json({ favorited: !!existing });
});
