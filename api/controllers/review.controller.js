const asyncHandler = require("express-async-handler");
const Review = require("../models/review.model");
const Product = require("../models/product.model");
const Store = require("../models/store.model");
const formatResponse = require("../middlewares/responseFormat");
const { uploadImage } = require("../services/uploadService");
const mongoose = require("mongoose");

const createReview = asyncHandler(async (req, res) => {
  const { product_id, rating, title, content, review_type } = req.body;
  const customer_id = req.user._id;
  let imageUrl = null;
  if (req.files && req.files.images) {
    imageUrl = await uploadImage(req.files.images);
  }
  const review = await Review.create({
    review_type,
    product_id,
    customer_id,
    rating,
    content,
    images: imageUrl,
    title,
  });

  if (review) {
    res.status(201).json(
      formatResponse(
        true,
        {
          _id: review._id,
          rating: review.rating,
          title: review.title,
        },
        "Review created successfully"
      )
    );
  } else {
    res.status(400);
    throw new Error("Invalid review data");
  }
});

const getProductReviews = asyncHandler(async (req, res) => {
  const { product_id } = req.params;
  const limit = parseInt(req.query.limit) || 5;
  const skip = parseInt(req.query.skip) || 0;

  const productObjectId = mongoose.Types.ObjectId.isValid(product_id)
    ? new mongoose.Types.ObjectId(product_id)
    : product_id;

  const reviews = await Review.find({
    product_id,
    review_type: "product_review",
  })
    .skip(skip)
    .limit(limit)
    .populate("customer_id", "fullName avatar");

  const total = await Review.countDocuments({
    product_id,
    review_type: "product_review",
  });
  const count5Star = await Review.countDocuments({
    product_id,
    review_type: "product_review",
    rating: 5,
  });
  const count4Star = await Review.countDocuments({
    product_id,
    review_type: "product_review",
    rating: 4,
  });
  const count3Star = await Review.countDocuments({
    product_id,
    review_type: "product_review",
    rating: 3,
  });
  const count2Star = await Review.countDocuments({
    product_id,
    review_type: "product_review",
    rating: 2,
  });
  const count1Star = await Review.countDocuments({
    product_id,
    review_type: "product_review",
    rating: 1,
  });

  const response = {
    reviewList: reviews,
    total,
    count5Star,
    count4Star,
    count3Star,
    count2Star,
    count1Star,
  };
  res.json(formatResponse(true, response, "Reviews retrieved successfully"));
});

const updateReview = asyncHandler(async (req, res) => {
  const review = await Review.findOne({
    _id: req.params.id,
    customer_id: req.user._id,
  });

  if (review) {
    review.rating = req.body.rating || review.rati;
    ng;
    review.title = req.body.title || review.title;
    review.content = req.body.content || review.content;

    const updatedReview = await review.save();

    res.json(
      formatResponse(
        true,
        {
          _id: updatedReview._id,
          rating: updatedReview.rating,
          title: updatedReview.title,
        },
        "Review updated successfully"
      )
    );
  } else {
    res.status(404);
    throw new Error("Review not found");
  }
});

const deleteReview = asyncHandler(async (req, res) => {
  const review = await Review.findOne({
    _id: req.params.id,
    customer_id: req.user._id,
  });

  if (review) {
    review.status = "inactive";
    await review.save();
    res.json(formatResponse(true, null, "Review deleted successfully"));
  } else {
    res.status(404);
    throw new Error("Review not found");
  }
});

const replyToReview = asyncHandler(async (req, res) => {
  const reviewId = req.params.reviewId;
  const { content } = req.body;
  const userId = req.user._id;
  const userRole = req.user.role; // Assuming user object has a role field ('seller' or 'customer')

  // Validate input
  if (!content || typeof content !== "string") {
    res.status(400);
    throw new Error("Invalid Data Format: Content is required and must be a string");
  }

  // Find the review
  const review = await Review.findById(reviewId);
  if (!review) {
    res.status(404);
    throw new Error("Review not found");
  }

  // Authorization checks
  if (userRole === "seller") {
    // Verify if the seller is authorized to reply
    const product = await Product.findById(review.product_id);
    if (!product) {
      res.status(404);
      throw new Error("Product not found for this review");
    }

    const store = await Store.findById(product.store_id);
    if (!store) {
      res.status(404);
      throw new Error("Store not found for this product");
    }

    if (store.owner_id.toString() !== userId.toString()) {
      res.status(403);
      throw new Error("Unauthorized to reply to this review");
    }
  } else if (userRole === "customer") {
    // Verify if the customer is the one who created the review
    if (review.customer_id.toString() !== userId.toString()) {
      res.status(403);
      throw new Error("Unauthorized to reply to this review");
    }
  } else {
    res.status(403);
    throw new Error("Invalid user role");
  }

  // Create a new reply object
  const newReply = {
    content,
    user_id: userId,
    role: userRole,
    replied_at: new Date(),
    status: "active",
  };

  // Initialize replies array if it doesn't exist
  if (!review.replies) {
    review.replies = [];
  }

  // Add the new reply to the replies array
  review.replies.push(newReply);

  // Save the updated review
  try {
    await review.save();
  } catch (saveError) {
    console.error("Save error:", saveError);
    res.status(500);
    throw new Error("Error saving reply");
  }

  // Send response
  try {
    res.json(
      formatResponse(true, review.toObject(), "Reply submitted successfully")
    );
  } catch (jsonError) {
    console.error("JSON response error:", jsonError);
    res.status(500);
    throw new Error("Error sending response");
  }
});

// Suggested Review Schema Update (for reference, not part of the controller)
const reviewSchema = new mongoose.Schema({
  review_type: { type: String, required: true },
  product_id: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
  customer_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  content: { type: String, required: true },
  images: { type: [String], default: [] },
  title: { type: String, required: true },
  status: { type: String, default: "active" },
  replies: [
    {
      content: { type: String, required: true },
      user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
      role: { type: String, enum: ["seller", "customer"], required: true },
      replied_at: { type: Date, default: Date.now },
      status: { type: String, default: "active" },
    },
  ],
  created_at: { type: Date, default: Date.now },
});

const getProductListWithReviewStats = asyncHandler(async (req, res) => {
  const { store_id } = req.params;
  const limit = parseInt(req.query.limit) || 10;
  const skip = parseInt(req.query.skip) || 0;
  const search = req.query.search || "";

  const searchCondition = search
    ? {
        store_id,
        name: { $regex: search, $options: "i" },
      }
    : { store_id: new mongoose.Types.ObjectId(store_id) };
  console.log(searchCondition, store_id);

  const products = await Product.aggregate([
    { $match: searchCondition },
    { $skip: skip },
    { $limit: limit },
    {
      $lookup: {
        from: "reviews",
        localField: "_id",
        foreignField: "product_id",
        as: "reviews",
      },
    },
    {
      $addFields: {
        totalReviews: { $size: "$reviews" },
        avgRating: {
          $cond: [
            { $gt: [{ $size: "$reviews" }, 0] },
            { $avg: "$reviews.rating" },
            0,
          ],
        },
        hasNewReviews: {
          $gt: [
            {
              $size: {
                $filter: {
                  input: "$reviews",
                  as: "review",
                  cond: {
                    $gt: [
                      "$$review.created_at",
                      new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
                    ],
                  },
                },
              },
            },
            0,
          ],
        },
        unrepliedReviews: {
          $size: {
            $filter: {
              input: "$reviews",
              as: "review",
              cond: { $eq: ["$$review.reply", null] },
            },
          },
        },
      },
    },
    {
      $project: {
        _id: 1,
        name: 1,
        product_code: 1,
        main_image: 1,
        additional_images: 1,
        price: 1,
        status: 1,
        avgRating: { $round: ["$avgRating", 1] },
        totalReviews: 1,
        hasNewReviews: 1,
        unrepliedReviews: 1,
      },
    },
  ]);

  const total = await Product.countDocuments(searchCondition);

  res.json(
    formatResponse(
      true,
      { products, total },
      "Product list with review stats retrieved successfully"
    )
  );
});

module.exports = {
  ReviewController: {
    createReview,
    getProductReviews,
    updateReview,
    deleteReview,
    replyToReview,
    getProductListWithReviewStats,
  },
};
