const express = require('express');
const router = express.Router();
const { ProductController } = require('../controllers/product.controller');
const authMiddleware = require('../middlewares/authMiddleware');
const loggingMiddleware = require('../middlewares/loggingMiddleware');
const upload = require('../middlewares/uploadMiddleware');

const multiUpload = upload.fields([
    { name: 'main_image', maxCount: 1 },
    { name: 'additional_images', maxCount: 10 },
    { name: 'new_additional_images', maxCount: 10 } // dùng cho edit mode
]);

router.post('/', authMiddleware, multiUpload, ProductController.createProduct);


router.get('/store', authMiddleware, ProductController.getProductByStoreId);
router.get('/featured', ProductController.getProductFeatured); //Sản phẩm nổi bật
router.get('/flash-sale', ProductController.getProductByStoreId);//Sản phẩm flash sale
router.get('/new', ProductController.getProductNew); //Sản phẩm mới
router.get('/:id', ProductController.getProductById);
router.get('/', ProductController.getProducts);


router.put('/:id', authMiddleware, multiUpload, ProductController.updateProduct);


router.delete('/:id', authMiddleware, ProductController.deleteProduct);

module.exports = router;