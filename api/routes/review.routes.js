const express = require('express');
const router = express.Router();
const { ReviewController } = require('../controllers/review.controller');
const { protect } = require('../middlewares/auth');

router.post('/', protect, ReviewController.createReview);
router.get('/product/:product_id', ReviewController.getProductReviews);
router.put('/:id', protect, ReviewController.updateReview);
router.delete('/:id', protect, ReviewController.deleteReview);

module.exports = router; 