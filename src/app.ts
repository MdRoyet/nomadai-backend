import express, { Application, Request, Response, NextFunction } from "express";
import cors from "cors";
import authRoutes from "./routes/auth.routes";
import { env } from "./config/env";
import destinationRoutes from "./routes/destination.routes";
import aiRoutes from "./routes/ai.routes";
import dataAnalyzerRoutes from "./routes/dataAnalyzer.routes";
import adminRoutes from "./routes/admin.routes";
import translateRoutes from "./routes/translate.routes";
import matcherRoutes from "./routes/matcher.routes";

const app: Application = express();

app.use(
  cors({
    origin: env.CLIENT_URL,
    credentials: true,
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/auth", authRoutes);

app.get("/api/health", (req: Request, res: Response) => {
  res.status(200).json({ status: "ok", message: "Server is running" });
});

app.use("/api/destinations", destinationRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/data", dataAnalyzerRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api", translateRoutes);
app.use("/api", matcherRoutes);

// Error handler MUST be after all routes
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

export default app;
