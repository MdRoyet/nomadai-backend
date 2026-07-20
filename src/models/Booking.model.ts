import mongoose, { Document, Schema } from "mongoose";

export interface IBooking extends Document {
  user: mongoose.Types.ObjectId;
  destination: mongoose.Types.ObjectId;
  checkIn: Date;
  checkOut: Date;
  guests: number;
  totalPrice: number;
  currency: string;
  status: "pending" | "confirmed" | "cancelled" | "completed";
  paymentMethod: string;
  specialRequests?: string;
  createdAt: Date;
}

const bookingSchema = new Schema<IBooking>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    destination: { type: Schema.Types.ObjectId, ref: "Destination", required: true },
    checkIn: { type: Date, required: true },
    checkOut: { type: Date, required: true },
    guests: { type: Number, required: true, default: 1 },
    totalPrice: { type: Number, required: true },
    currency: { type: String, default: "USD" },
    status: { type: String, enum: ["pending", "confirmed", "cancelled", "completed"], default: "pending" },
    paymentMethod: { type: String, default: "card" },
    specialRequests: { type: String },
  },
  { timestamps: true }
);

export const Booking = mongoose.model<IBooking>("Booking", bookingSchema);
