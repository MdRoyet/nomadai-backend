import { Router } from "express";
import multer from "multer";
import { analyzeFile } from "../controllers/dataAnalyzer.controller";

const router = Router();

// Multer config: 10MB limit, memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = [
      "text/csv",
      "application/json",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-excel",
    ];
    if (
      allowed.includes(file.mimetype) ||
      file.originalname.endsWith(".csv") ||
      file.originalname.endsWith(".json") ||
      file.originalname.endsWith(".xlsx") ||
      file.originalname.endsWith(".xls")
    ) {
      cb(null, true);
    } else {
      cb(new Error("Only CSV, JSON, and Excel files are allowed"));
    }
  },
});

router.post("/analyze", upload.single("file"), analyzeFile);

export default router;
