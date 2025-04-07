const express = require('express');
const router = express.Router();
const { PromotionController } = require('../controllers/promotion.controller');
const authMiddleware = require('../middlewares/authMiddleware');

router.post('/', authMiddleware, PromotionController.createPromotion);
router.get('/', PromotionController.getPromotions);
router.put('/:id', authMiddleware, PromotionController.updatePromotion);
router.delete('/:id', authMiddleware, PromotionController.deletePromotion);

module.exports = router; 