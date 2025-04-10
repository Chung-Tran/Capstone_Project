const express = require('express');
const router = express.Router();
const { CategoryController } = require('../controllers/category.controller');
const authMiddleware = require('../middlewares/authMiddleware');

router.post('/', authMiddleware, CategoryController.createCategory);
router.get('/', CategoryController.getCategories);
router.put('/:id', authMiddleware, CategoryController.updateCategory);
router.delete('/:id', authMiddleware, CategoryController.deleteCategory);

module.exports = router; 