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

export const AwardedTenderModel =
  mongoose.models.AwardedTender ||
  mongoose.model("AwardedTender", awardedTenderSchema);
