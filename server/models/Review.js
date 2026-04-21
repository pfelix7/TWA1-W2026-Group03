const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    source: {
      type: String,
      enum: ["app", "dataset"],
      default: "app",
    },
    externalReviewId: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
    },
    listing: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Listing",
      index: true,
      default: null,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      index: true,
      default: null,
    },
    listingId: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    reviewerId: {
      type: String,
      trim: true,
      index: true,
      default: null,
    },
    reviewerName: {
      type: String,
      trim: true,
      default: null,
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      validate: {
        validator(value) {
          if (this.source === "app") {
            return Number.isInteger(value) && value >= 1 && value <= 5;
          }

          return value === null || value === undefined || (Number.isInteger(value) && value >= 1 && value <= 5);
        },
        message: "Rating must be an integer from 1 to 5 for app reviews.",
      },
      default: null,
    },
    comment: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000,
    },
    photoUrl: {
      type: String,
      trim: true,
      default: null,
    },
    reviewDate: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

reviewSchema.index(
  { listing: 1, user: 1 },
  {
    unique: true,
    partialFilterExpression: {
      source: "app",
      listing: { $exists: true, $type: "objectId" },
      user: { $exists: true, $type: "objectId" },
    },
  }
);

module.exports = mongoose.model("Review", reviewSchema);
