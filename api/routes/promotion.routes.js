const express = require('express');
const router = express.Router();
const { PromotionController } = require('../controllers/promotion.controller');
const { protect, adminOnly } = require('../middlewares/auth');

router.post('/', protect, adminOnly, PromotionController.createPromotion);
router.get('/', PromotionController.getPromotions);
router.put('/:id', protect, adminOnly, PromotionController.updatePromotion);
router.delete('/:id', protect, adminOnly, PromotionController.deletePromotion);

module.exports = router; 