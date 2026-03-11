import { Schema, model, models, type Model } from "mongoose";

interface CounterDocument {
  _id: string;
  seq: number;
}

const CounterSchema = new Schema<CounterDocument>(
  {
    _id: { type: String, required: true },
    seq: { type: Number, default: 0 },
  },
  { _id: false }
);

export const CounterModel: Model<CounterDocument> =
  models.Counter ?? model<CounterDocument>("Counter", CounterSchema);
