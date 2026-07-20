import mongoose, { Document, Schema } from "mongoose";

export interface IItineraryDay {
  day: number;
  title: string;
  activities: string[];
  location?: string;
  notes?: string;
}

export interface IItinerary extends Document {
  user: mongoose.Types.ObjectId;
  destination: mongoose.Types.ObjectId;
  title: string;
  startDate: Date;
  endDate: Date;
  days: IItineraryDay[];
  budget?: number;
  currency?: string;
  travelers: number;
  createdAt: Date;
}

const itineraryDaySchema = new Schema<IItineraryDay>({
  day: { type: Number, required: true },
  title: { type: String, required: true },
  activities: [{ type: String }],
  location: { type: String },
  notes: { type: String },
});

const itinerarySchema = new Schema<IItinerary>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    destination: { type: Schema.Types.ObjectId, ref: "Destination", required: true },
    title: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    days: [itineraryDaySchema],
    budget: { type: Number },
    currency: { type: String, default: "USD" },
    travelers: { type: Number, default: 1 },
  },
  { timestamps: true }
);

export const Itinerary = mongoose.model<IItinerary>("Itinerary", itinerarySchema);
