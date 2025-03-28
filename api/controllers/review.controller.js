const asyncHandler = require('express-async-handler');
const Review = require('../models/review.model');
const formatResponse = require('../middlewares/responseFormat');

const createReview = asyncHandler(async (req, res) => {
    const { product_id, rating, title, content } = req.body;
    const customer_id = req.user.id;

    const review = await Review.create({
        product_id,
        customer_id,
        rating,
        title,
        content
    });

    if (review) {
        res.status(201).json(formatResponse(true, {
            _id: review._id,
            rating: review.rating,
            title: review.title
        }, 'Review created successfully'));
    } else {
        res.status(400);
        throw new Error('Invalid review data');
    }
});

const getProductReviews = asyncHandler(async (req, res) => {
    const { product_id } = req.params;
    const reviews = await Review.find({ product_id, status: 'active' })
        .populate('customer_id', 'full_name');

    if (reviews) {
        res.json(formatResponse(true, reviews, 'Reviews retrieved successfully'));
    } else {
        res.status(404);
        throw new Error('No reviews found');
    }
});

const updateReview = asyncHandler(async (req, res) => {
    const review = await Review.findOne({
        _id: req.params.id,
        customer_id: req.user.id
    });

    if (review) {
        review.rating = req.body.rating || review.rating;
        review.title = req.body.title || review.title;
        review.content = req.body.content || review.content;

        const updatedReview = await review.save();

        res.json(formatResponse(true, {
            _id: updatedReview._id,
            rating: updatedReview.rating,
            title: updatedReview.title
        }, 'Review updated successfully'));
    } else {
        res.status(404);
        throw new Error('Review not found');
    }
});

const deleteReview = asyncHandler(async (req, res) => {
    const review = await Review.findOne({
        _id: req.params.id,
        customer_id: req.user.id
    });

    if (review) {
        review.status = 'inactive';
        await review.save();
        res.json(formatResponse(true, null, 'Review deleted successfully'));
    } else {
        res.status(404);
        throw new Error('Review not found');
    }
});

module.exports = {
    ReviewController: {
        createReview,
        getProductReviews,
        updateReview,
        deleteReview
    }
}; 