const express = require('express');
const router = express.Router();
const { CategoryController } = require('../controllers/category.controller');
const { protect, adminOnly } = require('../middlewares/auth');

router.post('/', protect, adminOnly, CategoryController.createCategory);
router.get('/', CategoryController.getCategories);
router.put('/:id', protect, adminOnly, CategoryController.updateCategory);
router.delete('/:id', protect, adminOnly, CategoryController.deleteCategory);

module.exports = router; 