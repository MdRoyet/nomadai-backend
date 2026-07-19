import mongoose, { Document, Schema } from "mongoose";

export interface IDestination extends Document {
  title: string;
  short_desc: string;
  full_desc: string;
  price: number;
  location: string;
  category: string;
  rating: number;
  images: string[];
  tags: string[];
  createdBy: mongoose.Types.ObjectId;
}

const destinationSchema = new Schema<IDestination>(
  {
    title: { type: String, required: true },
    short_desc: { type: String, required: true },
    full_desc: { type: String, required: true },
    price: { type: Number, required: true, default: 0 },
    location: { type: String, required: true },
    category: {
      type: String,
      required: true,
      enum: ["Beach", "Mountain", "Urban", "Desert"],
    },
    rating: { type: Number, required: true, default: 4.5 },
    images: [{ type: String }],
    tags: [{ type: String }],
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true },
);

export const Destination = mongoose.model<IDestination>(
  "Destination",
  destinationSchema,
);
