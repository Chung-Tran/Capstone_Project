const express = require('express');
const router = express.Router();
const { CustomerItemsController } = require('../controllers/customerItems.controller');
const authMiddleware = require('../middlewares/authMiddleware');

// Wishlist routes
router.post('/wishlist', authMiddleware, CustomerItemsController.addToWishlist);
router.delete('/wishlist/:product_id', authMiddleware, CustomerItemsController.removeFromWishlist);
router.get('/wishlist', authMiddleware, CustomerItemsController.getWishlist);

// Cart routes
router.post('/cart', authMiddleware, CustomerItemsController.addToCart);
router.put('/cart/:product_id', authMiddleware, CustomerItemsController.updateCartQuantity);
router.delete('/cart/:product_id', authMiddleware, CustomerItemsController.removeFromCart);
router.get('/cart', authMiddleware, CustomerItemsController.getCart);
router.delete('/cart', authMiddleware, CustomerItemsController.clearCart);

module.exports = router;
