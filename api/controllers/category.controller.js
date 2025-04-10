const asyncHandler = require('express-async-handler');
const Category = require('../models/category.model');
const formatResponse = require('../middlewares/responseFormat');

const createCategory = asyncHandler(async (req, res) => {
    const { name, description, parent_category_id, level } = req.body;

    const category = await Category.create({
        name,
        description,
        parent_category_id,
        level,
        image: req.file ? req.file.path : null
    });

    if (category) {
        res.status(201).json(formatResponse(true, {
            _id: category._id,
            name: category.name,
            level: category.level
        }, 'Category created successfully'));
    } else {
        res.status(400);
        throw new Error('Invalid category data');
    }
});

const getCategories = asyncHandler(async (req, res) => {
    const categories = await Category.find({ status: 'active' })
        .populate('parent_category_id');

    if (categories) {
        res.json(formatResponse(true, categories, 'Categories retrieved successfully'));
    } else {
        res.status(404);
        throw new Error('No categories found');
    }
});

const updateCategory = asyncHandler(async (req, res) => {
    const category = await Category.findById(req.params.id);

    if (category) {
        category.name = req.body.name || category.name;
        category.description = req.body.description || category.description;
        if (req.file) {
            category.image = req.file.path;
        }

        const updatedCategory = await category.save();

        res.json(formatResponse(true, {
            _id: updatedCategory._id,
            name: updatedCategory.name
        }, 'Category updated successfully'));
    } else {
        res.status(404);
        throw new Error('Category not found');
    }
});

const deleteCategory = asyncHandler(async (req, res) => {
    const category = await Category.findById(req.params.id);

    if (category) {
        category.status = 'inactive';
        await category.save();
        res.json(formatResponse(true, null, 'Category deleted successfully'));
    } else {
        res.status(404);
        throw new Error('Category not found');
    }
});

module.exports = {
    CategoryController: {
        createCategory,
        getCategories,
        updateCategory,
        deleteCategory
    }
}; 