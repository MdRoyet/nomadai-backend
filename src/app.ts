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
import bookingRoutes from "./routes/booking.routes";
import reviewRoutes from "./routes/review.routes";
import favoriteRoutes from "./routes/favorite.routes";
import itineraryRoutes from "./routes/itinerary.routes";
import currencyRoutes from "./routes/currency.routes";

const app: Application = express();

app.use(
  cors({
    origin: (origin, callback) => {
      const allowedOrigins = [
        env.CLIENT_URL,
        "https://nomadai-frontend.vercel.app",
        "http://localhost:3000",
      ];
      if (!origin || allowedOrigins.some(o => origin.includes(o.replace("https://", "").replace("http://", "")))) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
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
app.use("/api/bookings", bookingRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/favorites", favoriteRoutes);
app.use("/api/itineraries", itineraryRoutes);
app.use("/api", currencyRoutes);

// Error handler MUST be after all routes
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

export default app;
