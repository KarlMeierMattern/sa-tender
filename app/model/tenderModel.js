import mongoose from "mongoose";

const tenderSchema = new mongoose.Schema(
  {
    category: {
      type: String,
    },
    description: {
      type: String,
    },
    advertised: {
      type: Date,
    },
    closing: {
      type: String,
    },
    tendernumber: {
      type: String,
    },
    department: {
      type: String,
    },
    tendertype: {
      type: String,
    },
    province: {
      type: String,
    },
    placeServicesRequired: {
      type: String,
    },
  },
  { timestamps: true }
);

// Ensures that if the model is already registered (mongoose.models.Tender), it is reused instead of being recompiled.
export const TenderModel =
  mongoose.models.Tender || mongoose.model("Tender", tenderSchema);
