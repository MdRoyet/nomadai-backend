import { Router } from "express";
import {
  getDestinations,
  getDestinationById,
  getMyDestinations,
  createDestination,
  deleteDestination,
} from "../controllers/destination.controller";
import { protect } from "../middleware/auth.middleware";

const router = Router();

// Specific routes FIRST (before /:id)
router.route("/").get(getDestinations).post(protect, createDestination);
router.route("/my-listings").get(protect, getMyDestinations);

// Parameterized routes LAST
router.route("/:id").get(getDestinationById).delete(protect, deleteDestination);

export default router;
