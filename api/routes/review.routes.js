const express = require('express');
const router = express.Router();
const { ReviewController } = require('../controllers/review.controller');
const authMiddleware = require('../middlewares/authMiddleware');
const { AI_Service } = require('../services/AI-Service');


const upload = require('../middlewares/uploadMiddleware');


router.post('/', authMiddleware, upload.any('images'), ReviewController.createReview);
router.get('/product/:product_id', ReviewController.getProductReviews);
router.put('/:id', authMiddleware, ReviewController.updateReview);
router.delete('/:id', authMiddleware, ReviewController.deleteReview);
router.post('/:reviewId/reply', authMiddleware, ReviewController.replyToReview);

//Lấy danh sách sản phẩm và đánh giá sản phẩm theo shop(Admin)
router.get('/store/:store_id/products', authMiddleware, ReviewController.getProductListWithReviewStats);
router.post('/by-ids', authMiddleware, ReviewController.getReviewsByIds);
router.get('/review-analyze', AI_Service.analyzeWeeklyComments);
router.get('/predict-categories', AI_Service.predictCategories);

module.exports = router;