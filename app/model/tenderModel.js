import mongoose from "mongoose";

const tenderSchema = new mongoose.Schema({
  category: String,
  description: String,
  advertised: Date,
  closing: String,
  datePublished: Date,
  closingDate: Date,
  tenderNumber: String,
  department: String,
  tenderType: String,
  province: String,
  placeServicesRequired: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Update the updatedAt timestamp before saving
tenderSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});

// Ensures that if the model is already registered (mongoose.models.Tender), it is reused instead of being recompiled.
export const TenderModel =
  mongoose.models.Tender || mongoose.model("Tender", tenderSchema);
