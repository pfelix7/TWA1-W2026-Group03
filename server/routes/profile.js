const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Review = require("../models/Review");
const Listing = require("../models/Listing");
const authMiddleware = require("../middleware/auth");

// GET /api/profile - Get the authenticated user's profile and reviews
router.get("/", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Fetch all reviews by this user
    const reviews = await Review.find({ user: req.user.userId })
      .sort({ createdAt: -1 })
      .lean();

    // Fetch listing info for each review based on listingId
    const reviewsWithListings = await Promise.all(
      reviews.map(async (review) => {
        let listing = null;
        if (review.listingId) {
          listing = await Listing.findById(review.listingId, "name _id");
        }
        return {
          id: review._id,
          rating: review.rating,
          comment: review.comment,
          reviewDate: review.reviewDate,
          photoUrl: review.photoUrl,
          listing: listing
            ? {
                id: listing._id,
                name: listing.name,
              }
            : null,
        };
      }),
    );

    res.status(200).json({
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        fullName: user.fullName,
      },
      reviews: reviewsWithListings,
    });
  } catch (error) {
    console.error("Error fetching profile:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// PUT /api/profile - Update the authenticated user's profile
router.put("/", authMiddleware, async (req, res) => {
  try {
    const { firstName, lastName } = req.body;

    // Validate input
    if (!firstName || !lastName) {
      return res
        .status(400)
        .json({ error: "First name and last name are required" });
    }

    const user = await User.findByIdAndUpdate(
      req.user.userId,
      {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
      },
      { new: true, runValidators: true },
    );

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json({
      message: "Profile updated successfully",
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        fullName: user.fullName,
      },
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
