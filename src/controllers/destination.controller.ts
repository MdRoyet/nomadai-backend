import { Request, Response } from "express";
import { Destination } from "../models/Destination.model";
import { ApiError } from "../utils/ApiError";
import { asyncHandler } from "../utils/asyncHandler";

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
