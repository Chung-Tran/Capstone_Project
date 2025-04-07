const express = require('express');
const router = express.Router();
const { ReviewController } = require('../controllers/review.controller');
const authMiddleware = require('../middlewares/authMiddleware');

router.post('/', authMiddleware, ReviewController.createReview);
router.get('/product/:product_id', ReviewController.getProductReviews);
router.put('/:id', authMiddleware, ReviewController.updateReview);
router.delete('/:id', authMiddleware, ReviewController.deleteReview);

module.exports = router; 