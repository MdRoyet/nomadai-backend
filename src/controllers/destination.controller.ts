import { Request, Response } from 'express';
import { Destination } from '../models/Destination.model';
import { ApiError } from '../utils/ApiError';
import { asyncHandler } from '../utils/asyncHandler';

// @desc    Get all destinations (with search, filter, sort, pagination)
// @route   GET /api/destinations
export const getDestinations = asyncHandler(async (req: Request, res: Response) => {
  const pageSize = 8;
  const page = Number(req.query.page) || 1;
  
  const keyword = req.query.search
    ? { title: { $regex: req.query.search, $options: 'i' } }
    : {};

  const categoryFilter = req.query.category ? { category: req.query.category } : {};
  
  const priceFilter = req.query.minPrice || req.query.maxPrice
    ? { price: { $gte: Number(req.query.minPrice) || 0, $lte: Number(req.query.maxPrice) || 10000 } }
    : {};

  const sortOption = req.query.sort === 'price_asc' ? { price: 1 }
    : req.query.sort === 'price_desc' ? { price: -1 }
    : req.query.sort === 'rating_desc' ? { rating: -1 }
    : { createdAt: -1 }; // newest

  const count = await Destination.countDocuments({ ...keyword, ...categoryFilter, ...priceFilter });
  
  const destinations = await Destination.find({ ...keyword, ...categoryFilter, ...priceFilter })
    .sort(sortOption)
    .limit(pageSize)
    .skip(pageSize * (page - 1));

  res.json({ destinations, page, pages: Math.ceil(count / pageSize), count });
});

// @desc    Get destination by ID
// @route   GET /api/destinations/:id
export const getDestinationById = asyncHandler(async (req: Request, res: Response) => {
  const destination = await Destination.findById(req.params.id);
  if (destination) {
    const related = await Destination.find({ category: destination.category, _id: { $ne: destination._id } }).limit(4);
    res.json({ destination, related });
  } else {
    throw new ApiError(404, 'Destination not found');
  }
});