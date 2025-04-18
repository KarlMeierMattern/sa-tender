import mongoose from "mongoose";

const tenderSchema = new mongoose.Schema(
  {
    category: String,
    description: String,
    advertised: Date,
    closingDate: Date,
    tenderNumber: String,
    department: String,
    tenderType: String,
    province: String,
    placeServicesRequired: String,
    datePublished: Date,
  },
  { timestamps: true }
);

// Add indexes for frequently queried fields
tenderSchema.index({ datePublished: -1 });
tenderSchema.index({ department: 1 });
tenderSchema.index({ category: 1 });
tenderSchema.index({ province: 1 });
tenderSchema.index({ advertised: -1 });
tenderSchema.index({ closingDate: -1 });

// Compound indexes for common query patterns
tenderSchema.index({
  category: 1,
  department: 1,
  province: 1,
});

tenderSchema.index({
  advertised: -1,
  closingDate: -1,
});

tenderSchema.index({
  department: 1,
  advertised: -1,
});

// Ensures that if the model is already registered (mongoose.models.Tender), it is reused instead of being recompiled.
export const TenderModel =
  mongoose.models.Tender || mongoose.model("Tender", tenderSchema);
