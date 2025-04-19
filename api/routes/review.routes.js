const express = require('express');
const router = express.Router();
const { ReviewController } = require('../controllers/review.controller');
const authMiddleware = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');

const multiUpload = upload.fields([
    { name: 'images', maxCount: 5 },
]);
router.post('/', authMiddleware, multiUpload, ReviewController.createReview);
router.get('/product/:product_id', ReviewController.getProductReviews);
router.put('/:id', authMiddleware, ReviewController.updateReview);
router.delete('/:id', authMiddleware, ReviewController.deleteReview);

module.exports = router; 