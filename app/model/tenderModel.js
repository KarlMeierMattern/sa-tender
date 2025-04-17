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

// Add indexes for frequently queried fields
tenderSchema.index({ datePublished: -1 }); // For sorting by publication date
tenderSchema.index({ category: 1 }); // For category filters
tenderSchema.index({ department: 1 }); // For department filters
tenderSchema.index({ province: 1 }); // For province filters
tenderSchema.index({ tenderNumber: 1 }, { unique: true }); // For unique tender numbers
tenderSchema.index({ tenderType: 1 }); // For tender type filters

// Compound indexes for common query patterns
tenderSchema.index({
  category: 1,
  department: 1,
  province: 1,
});

tenderSchema.index({
  datePublished: -1,
  category: 1,
});

// Ensures that if the model is already registered (mongoose.models.Tender), it is reused instead of being recompiled.
export const TenderModel =
  mongoose.models.Tender || mongoose.model("Tender", tenderSchema);
