const asyncHandler = require('express-async-handler');
const mongoose = require('mongoose');
const Category = require('../models/category.model');
const formatResponse = require('../middlewares/responseFormat');

const createCategory = asyncHandler(async (req, res) => {
    const { name, description, parent_category_id, level } = req.body;

    if (!name || !level) {
        res.status(400);
        throw new Error('Tên danh mục và cấp độ là bắt buộc');
    }

    if (parent_category_id && !mongoose.isValidObjectId(parent_category_id)) {
        res.status(400);
        throw new Error('ID danh mục cha không hợp lệ');
    }

    if (parent_category_id) {
        const parent = await Category.findById(parent_category_id);
        if (!parent || parent.status !== 'active') {
            res.status(404);
            throw new Error('Danh mục cha không tồn tại hoặc không hoạt động');
        }
    }

    const category = await Category.create({
        name,
        description,
        parent_category_id: parent_category_id || null,
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
        throw new Error('Dữ liệu danh mục không hợp lệ');
    }
});

const getCategories = asyncHandler(async (req, res) => {
    const categories = await Category.find({ status: 'active' })
        .select('_id name parent_category_id level')
        .lean();

    // Xây dựng cây danh mục
    const buildCategoryTree = (categories, parentId = null) => {
        return categories
            .filter(cat => (cat.parent_category_id ? cat.parent_category_id.toString() : null) === parentId)
            .map(cat => ({
                _id: cat._id,
                name: cat.name,
                level: cat.level,
                children: buildCategoryTree(categories, cat._id.toString())
            }));
    };

    const categoryTree = buildCategoryTree(categories);
    res.status(200).json(formatResponse(true, categoryTree, 'Categories retrieved successfully'));
});

const updateCategory = asyncHandler(async (req, res) => {
    const category = await Category.findById(req.params.id);

    if (!category) {
        res.status(404);
        throw new Error('Không tìm thấy danh mục');
    }

    category.name = req.body.name || category.name;
    category.description = req.body.description || category.description;
    category.level = req.body.level || category.level;
    category.parent_category_id = req.body.parent_category_id || category.parent_category_id;
    if (req.file) {
        category.image = req.file.path;
    }

    const updatedCategory = await category.save();

    res.json(formatResponse(true, {
        _id: updatedCategory._id,
        name: updatedCategory.name,
        level: updatedCategory.level
    }, 'Category updated successfully'));
});

const deleteCategory = asyncHandler(async (req, res) => {
    const category = await Category.findById(req.params.id);

    if (!category) {
        res.status(404);
        throw new Error('Không tìm thấy danh mục');
    }

    category.status = 'inactive';
    await category.save();
    res.json(formatResponse(true, null, 'Category deleted successfully'));
});

module.exports = {
    CategoryController: {
        createCategory,
        getCategories,
        updateCategory,
        deleteCategory
    }
};