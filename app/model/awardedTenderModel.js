import mongoose from "mongoose";

const awardedTenderSchema = new mongoose.Schema({
  category: String,
  description: String,
  advertised: Date,
  awarded: Date,
  tenderNumber: String,
  department: String,
  tenderType: String,
  province: String,
  datePublished: Date,
  closingDate: Date,
  placeServicesRequired: String,
  specialConditions: String,
  successfulBidderName: String,
  successfulBidderAmount: Number,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Update the updatedAt timestamp before saving
awardedTenderSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});

// Add indexes for frequently queried fields
awardedTenderSchema.index({ awarded: -1 }); // For sorting by award date
awardedTenderSchema.index({ category: 1 }); // For category filters
awardedTenderSchema.index({ department: 1 }); // For department filters
awardedTenderSchema.index({ province: 1 }); // For province filters
awardedTenderSchema.index({ tenderNumber: 1 }, { unique: true }); // For unique tender numbers

// Compound indexes for common query patterns
awardedTenderSchema.index({
  category: 1,
  department: 1,
  province: 1,
});

awardedTenderSchema.index({
  awarded: -1,
  category: 1,
});

export const AwardedTenderModel =
  mongoose.models.AwardedTender ||
  mongoose.model("AwardedTender", awardedTenderSchema);
