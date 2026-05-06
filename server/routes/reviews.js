const express = require("express");
const router = express.Router();
const Review = require("../models/Review");
const Listing = require("../models/Listing");
const authMiddleware = require("../middleware/auth");
const upload = require("../middleware/upload");

// GET /api/reviews/user/:userId - Get all reviews by a user
router.get("/user/:userId", authMiddleware, async (req, res) => {
  try {
    const reviews = await Review.find({ user: req.params.userId })
      .populate("user", "_id firstName lastName")
      .sort({ createdAt: -1 });
    
    // Fetch listing info for each review based on listingId
    const reviewsWithListings = await Promise.all(
      reviews.map(async (review) => {
        const reviewObj = review.toObject();
        if (review.listingId) {
          const listing = await Listing.findById(review.listingId, "name _id");
          if (listing) {
            reviewObj.listing = listing;
          }
        }
        return reviewObj;
      })
    );
    
    res.json(reviewsWithListings);
  } catch (error) {
    console.error("Error fetching user reviews:", error);
    res.status(500).json({ error: "Failed to fetch reviews" });
  }
});

// GET /api/reviews/:listingId - Get all reviews for a listing
router.get("/:listingId", async (req, res) => {
  try {
    const reviews = await Review.find({ listingId: req.params.listingId })
      .populate("user", "_id firstName lastName")
      .sort({ createdAt: -1 });
    res.json(reviews);
  } catch (error) {
    console.error("Error fetching reviews:", error);
    res.status(500).json({ error: "Failed to fetch reviews" });
  }
});

// POST /api/reviews - Create a new review with optional image
router.post("/", authMiddleware, upload.single("photo"), async (req, res) => {
  try {
    const { listingId, rating, comment } = req.body;
    const userId = req.user.userId;

    // Server-side validation
    if (!listingId || !rating || !comment) {
      // Clean up uploaded file if validation fails
      if (req.file) {
        const fs = require("fs");
        fs.unlinkSync(req.file.path);
      }
      return res
        .status(400)
        .json({ error: "listingId, rating, and comment are required" });
    }

    if (rating < 1 || rating > 5 || !Number.isInteger(Number(rating))) {
      // Clean up uploaded file if validation fails
      if (req.file) {
        const fs = require("fs");
        fs.unlinkSync(req.file.path);
      }
      return res
        .status(400)
        .json({ error: "Rating must be an integer between 1 and 5" });
    }

    // Check if user already has a review for this listing
    const existingReview = await Review.findOne({ listingId, user: userId });
    if (existingReview) {
      // Clean up uploaded file if review already exists
      if (req.file) {
        const fs = require("fs");
        fs.unlinkSync(req.file.path);
      }
      return res
        .status(409)
        .json({ error: "You have already reviewed this listing" });
    }

    // Find the listing to get its MongoDB ID
    const listing = await Listing.findById(listingId);
    if (!listing) {
      // Clean up uploaded file if listing not found
      if (req.file) {
        const fs = require("fs");
        fs.unlinkSync(req.file.path);
      }
      return res.status(404).json({ error: "Listing not found" });
    }

    // Build photo URL if file was uploaded
    const photoUrl = req.file ? `/uploads/${req.file.filename}` : null;

    const newReview = new Review({
      listingId,
      user: userId,
      rating: Number(rating),
      comment,
      photoUrl,
      source: "app",
    });
    await newReview.save();
    await newReview.populate("user", "_id firstName lastName");
    res.status(201).json(newReview);
  } catch (error) {
    // Clean up uploaded file on error
    if (req.file) {
      const fs = require("fs");
      fs.unlinkSync(req.file.path);
    }
    console.error("Error creating review:", error);
    res.status(500).json({ error: "Failed to create review" });
  }
});

// PUT /api/reviews/:id - Update a review
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ error: "Review not found" });
    }
    if (review.user.toString() !== req.user.userId.toString()) {
      return res.status(403).json({ error: "Unauthorized" });
    }
    const { rating, comment } = req.body;
    if (rating) {
      if (rating < 1 || rating > 5 || !Number.isInteger(rating)) {
        return res
          .status(400)
          .json({ error: "Rating must be an integer between 1 and 5" });
      }
      review.rating = rating;
    }
    if (comment !== undefined && comment.trim() !== "") {
      review.comment = comment.trim();
    }
    await review.save();
    await review.populate("user", "_id firstName lastName");
    res.json(review);
  } catch (error) {
    console.error("Error updating review:", error);
    res.status(500).json({ error: "Failed to update review" });
  }
});

// DELETE /api/reviews/:id - Delete a review
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ error: "Review not found" });
    }
    if (review.user.toString() !== req.user.userId.toString()) {
      return res.status(403).json({ error: "Unauthorized" });
    }
    await review.deleteOne();
    res.json({ message: "Review deleted" });
  } catch (error) {
    console.error("Error deleting review:", error);
    res.status(500).json({ error: "Failed to delete review" });
  }
});

module.exports = router;
