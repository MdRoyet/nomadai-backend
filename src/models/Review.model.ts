import mongoose, { Document, Schema } from "mongoose";

export interface IReview extends Document {
  user: mongoose.Types.ObjectId;
  destination: mongoose.Types.ObjectId;
  rating: number;
  title: string;
  comment: string;
  visitDate?: Date;
  travelType?: string;
  createdAt: Date;
}

const reviewSchema = new Schema<IReview>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    destination: { type: Schema.Types.ObjectId, ref: "Destination", required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    title: { type: String, required: true },
    comment: { type: String, required: true },
    visitDate: { type: Date },
    travelType: { type: String },
  },
  { timestamps: true }
);

reviewSchema.index({ destination: 1, user: 1 }, { unique: true });

export const Review = mongoose.model<IReview>("Review", reviewSchema);
