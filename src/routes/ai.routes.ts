import { Router } from "express";
import { chatWithAgent, chatStream, getRecommendations } from "../controllers/ai.controller";

const router = Router();

router.post("/chat", chatWithAgent);
router.post("/chat/stream", chatStream);
router.post("/recommendations", getRecommendations);

export default router;
