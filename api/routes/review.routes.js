const express = require('express');
const router = express.Router();
const { ReviewController } = require('../controllers/review.controller');
const authMiddleware = require('../middlewares/authMiddleware');
const upload = require('multer')();

router.post('/', authMiddleware, upload.any('images'), ReviewController.createReview);
router.get('/product/:product_id', ReviewController.getProductReviews);
router.put('/:id', authMiddleware, ReviewController.updateReview);
router.delete('/:id', authMiddleware, ReviewController.deleteReview);
router.post('/:reviewId/reply', authMiddleware, ReviewController.replyToReview);

module.exports = router;