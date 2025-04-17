const express = require('express');
const router = express.Router();
const { ProductController } = require('../controllers/product.controller');
const authMiddleware = require('../middlewares/authMiddleware');
const loggingMiddleware = require('../middlewares/loggingMiddleware');

router.post('/', authMiddleware, ProductController.createProduct);
router.get('/store', authMiddleware, ProductController.getProductByStoreId);
router.post('/getbyid/:id', loggingMiddleware, ProductController.getProductById);
router.get('/', ProductController.getProducts);
router.put('/:id', authMiddleware, ProductController.updateProduct);
router.delete('/:id', authMiddleware, ProductController.deleteProduct);

module.exports = router;