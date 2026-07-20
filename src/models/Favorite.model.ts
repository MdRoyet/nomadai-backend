import mongoose, { Document, Schema } from "mongoose";

export interface IFavorite extends Document {
  user: mongoose.Types.ObjectId;
  destination: mongoose.Types.ObjectId;
  createdAt: Date;
}

const favoriteSchema = new Schema<IFavorite>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    destination: { type: Schema.Types.ObjectId, ref: "Destination", required: true },
  },
  { timestamps: true }
);

favoriteSchema.index({ user: 1, destination: 1 }, { unique: true });

export const Favorite = mongoose.model<IFavorite>("Favorite", favoriteSchema);
