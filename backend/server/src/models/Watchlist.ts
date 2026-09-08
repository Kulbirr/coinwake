import { Schema, Types, model, type HydratedDocument, type Model } from "mongoose";

export interface WatchlistItemDoc {
  userId: Types.ObjectId;
  coinId: string;
  createdAt: Date;
  updatedAt: Date;
}

const watchlistSchema = new Schema<WatchlistItemDoc>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    coinId: { type: String, required: true, trim: true },
  },
  { timestamps: true },
);

// One row per coin per user — makes "toggle" an idempotent upsert/delete.
watchlistSchema.index({ userId: 1, coinId: 1 }, { unique: true });

export type WatchlistItemDocument = HydratedDocument<WatchlistItemDoc>;

export const WatchlistModel: Model<WatchlistItemDoc> = model<WatchlistItemDoc>(
  "WatchlistItem",
  watchlistSchema,
);
