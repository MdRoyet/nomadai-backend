import { Router } from "express";
import {
  getMyDestinations,
  createDestination,
  deleteDestination,
} from "../controllers/destination.controller";
import { protect } from "../middleware/auth.middleware";

const router = Router();

// Public routes
router.route("/").get(getMyDestinations);
router.route("/:id").get(getMyDestinations);

// Protected routes (require login)
router.route("/").post(protect, createDestination);
router.route("/my-listings").get(protect, getMyDestinations);
router.route("/:id").delete(protect, deleteDestination);

export default router;
