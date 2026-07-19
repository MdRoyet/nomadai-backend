import { Router } from "express";
import {
  getDestinations,
  getDestinationById,
} from "../controllers/destination.controller";

const router = Router();

router.route("/").get(getDestinations);
router.route("/:id").get(getDestinationById);

export default router;
