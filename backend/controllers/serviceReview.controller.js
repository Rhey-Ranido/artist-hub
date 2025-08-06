import ServiceReview from "../models/ServiceReview.js";
import Service from "../models/Service.js";
import { validateServiceReview } from "../utils/validateReview.js";

// @desc Get all reviews for a specific service
// @route GET /api/service-reviews/:serviceId
export const getAllServiceReviews = async (req, res) => {
  try {
    const reviews = await ServiceReview.find({
      serviceId: req.params.serviceId,
    })
      .populate("userId", "name")
      .sort({ createdAt: -1 });

    res.status(200).json(reviews);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch service reviews",
      error: error.message,
    });
  }
};

// @desc Create a review for a service
// @route POST /api/service-reviews/:serviceId
export const createServiceReview = async (req, res) => {
  const { rating, comment } = req.body;
  const serviceId = req.params.serviceId;
  const userId = req.user._id;
  
  try {
    // Validate input data
    const { error } = validateServiceReview({ rating, comment });
    if (error) {
      return res.status(400).json({ 
        message: "Validation error", 
        error: error.details[0].message 
      });
    }

    const service = await Service.findById(serviceId);
    if (!service) {
      return res.status(404).json({ message: "Service not found" });
    }

    const existingReview = await ServiceReview.findOne({ serviceId, userId });
    if (existingReview) {
      return res
        .status(400)
        .json({ message: "You have already reviewed this service" });
    }

    const newReview = await ServiceReview.create({
      serviceId,
      userId,
      rating,
      comment,
    });

    // Update service rating statistics using the static method
    await Service.updateRatingStats(serviceId);

    // Populate user information for response
    await newReview.populate("userId", "name");

    res.status(201).json(newReview);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to create review", error: error.message });
  }
};

// @desc Update a service review
// @route PUT /api/service-reviews/:reviewId
export const updateServiceReview = async (req, res) => {
  const { rating, comment } = req.body;
  const reviewId = req.params.reviewId;

  try {
    // Validate input data
    const { error } = validateServiceReview({ rating, comment });
    if (error) {
      return res.status(400).json({ 
        message: "Validation error", 
        error: error.details[0].message 
      });
    }

    const review = await ServiceReview.findById(reviewId);
    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    if (review.userId.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "Unauthorized to update this review" });
    }

    review.rating = rating ?? review.rating;
    review.comment = comment ?? review.comment;

    await review.save();

    // Update service rating statistics using the static method
    await Service.updateRatingStats(review.serviceId);

    await review.populate("userId", "name");

    res.status(200).json(review);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to update review", error: error.message });
  }
};

// @desc Delete a service review
// @route DELETE /api/service-reviews/:reviewId
export const deleteServiceReview = async (req, res) => {
  const reviewId = req.params.reviewId;

  try {
    const review = await ServiceReview.findById(reviewId);
    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    if (review.userId.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "Unauthorized to delete this review" });
    }

    const serviceId = review.serviceId;
    await review.deleteOne();

    // Update service rating statistics using the static method
    await Service.updateRatingStats(serviceId);

    res.status(200).json({ message: "Review deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to delete review", error: error.message });
  }
};
