const express = require('express');
const router = express.Router();
const { ProductController } = require('../controllers/product.controller');
const { protect } = require('../middlewares/auth');

router.post('/', protect, ProductController.createProduct);
router.get('/', ProductController.getProducts);
router.get('/:id', ProductController.getProductById);
router.put('/:id', protect, ProductController.updateProduct);
router.delete('/:id', protect, ProductController.deleteProduct);

module.exports = router;