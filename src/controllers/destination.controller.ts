import { Request, Response } from "express";
import { Destination } from "../models/Destination.model";
import { ApiError } from "../utils/ApiError";
import { asyncHandler } from "../utils/asyncHandler";

// @desc    Get all destinations (public, with search/filter/pagination)
// @route   GET /api/destinations
export const getDestinations = asyncHandler(
  async (req: Request, res: Response) => {
    const {
      search,
      category,
      minPrice,
      maxPrice,
      sort,
      page = "1",
      limit = "12",
    } = req.query;

    const filter: Record<string, any> = {};

    // Text search on title, location, tags
    if (search && typeof search === "string" && search.trim()) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { location: { $regex: search, $options: "i" } },
        { tags: { $regex: search, $options: "i" } },
      ];
    }

    // Category filter
    if (category && typeof category === "string" && category.trim()) {
      filter.category = category;
    }

    // Price range filter
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    // Sort
    let sortOption: Record<string, 1 | -1> = { createdAt: -1 };
    if (sort === "price_asc") sortOption = { price: 1 };
    else if (sort === "price_desc") sortOption = { price: -1 };
    else if (sort === "rating_desc") sortOption = { rating: -1 };

    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.min(50, Math.max(1, Number(limit)));
    const skip = (pageNum - 1) * limitNum;

    const [destinations, count] = await Promise.all([
      Destination.find(filter).sort(sortOption).skip(skip).limit(limitNum),
      Destination.countDocuments(filter),
    ]);

    res.json({
      destinations,
      page: pageNum,
      pages: Math.ceil(count / limitNum),
      count,
    });
  }
);

/// @desc    Create a new destination
// @route   POST /api/destinations
export const createDestination = asyncHandler(
  async (req: Request, res: Response) => {
    const {
      title,
      short_desc,
      full_desc,
      price,
      location,
      category,
      image_url,
      tags,
    } = req.body;

    if (
      !title ||
      !short_desc ||
      !full_desc ||
      !price ||
      !location ||
      !category
    ) {
      throw new ApiError(400, "Please provide all required fields");
    }

    const destination = await Destination.create({
      title,
      short_desc,
      full_desc,
      price: Number(price),
      location,
      category,
      images: [
        image_url ||
          "https://images.unsplash.com/photo-1573843981267-be1999ff37cd?q=80&w=1000&auto=format&fit=crop",
      ],
      tags: tags ? tags.split(",").map((tag: string) => tag.trim()) : [],
      createdBy: req.user._id,
    });

    res.status(201).json(destination);
  },
);

// @desc    Get logged in user's destinations
// @route   GET /api/destinations/my-listings
export const getMyDestinations = asyncHandler(
  async (req: Request, res: Response) => {
    const destinations = await Destination.find({
      createdBy: req.user._id,
    }).sort({ createdAt: -1 });
    res.json(destinations);
  },
);

// @desc    Get single destination with related items
// @route   GET /api/destinations/:id
export const getDestinationById = asyncHandler(
  async (req: Request, res: Response) => {
    const destination = await Destination.findById(req.params.id);

    if (!destination) {
      throw new ApiError(404, "Destination not found");
    }

    // Find related destinations (same category, exclude current)
    const related = await Destination.find({
      category: destination.category,
      _id: { $ne: destination._id },
    })
      .limit(4)
      .sort({ createdAt: -1 });

    res.json({ destination, related });
  }
);

// @desc    Delete a destination
// @route   DELETE /api/destinations/:id
export const deleteDestination = asyncHandler(
  async (req: Request, res: Response) => {
    const destination = await Destination.findById(req.params.id);

    if (!destination) {
      throw new ApiError(404, "Destination not found");
    }

    // Check ownership
    if (destination.createdBy.toString() !== req.user._id.toString()) {
      throw new ApiError(403, "Not authorized to delete this destination");
    }

    await destination.deleteOne();
    res.json({ message: "Destination removed" });
  },
);
