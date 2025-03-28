const asyncHandler = require('express-async-handler');
const Promotion = require('../models/promotion.model');
const formatResponse = require('../middlewares/responseFormat');

const createPromotion = asyncHandler(async (req, res) => {
    const { name, description, discount_type, discount_value, start_date, end_date } = req.body;

    const promotionCount = await Promotion.countDocuments();
    const promotion_code = `PROMO-${(promotionCount + 1).toString().padStart(3, '0')}`;

    const promotion = await Promotion.create({
        promotion_code,
        name,
        description,
        discount_type,
        discount_value,
        start_date,
        end_date
    });

    if (promotion) {
        res.status(201).json(formatResponse(true, {
            _id: promotion._id,
            promotion_code: promotion.promotion_code,
            name: promotion.name,
            discount_type: promotion.discount_type,
            discount_value: promotion.discount_value
        }, 'Promotion created successfully'));
    } else {
        res.status(400);
        throw new Error('Invalid promotion data');
    }
});

const getPromotions = asyncHandler(async (req, res) => {
    const promotions = await Promotion.find({
        end_date: { $gte: new Date() },
        status: 'active'
    });

    if (promotions) {
        res.json(formatResponse(true, promotions, 'Promotions retrieved successfully'));
    } else {
        res.status(404);
        throw new Error('No promotions found');
    }
});

const updatePromotion = asyncHandler(async (req, res) => {
    const promotion = await Promotion.findById(req.params.id);

    if (promotion) {
        promotion.name = req.body.name || promotion.name;
        promotion.description = req.body.description || promotion.description;
        promotion.discount_value = req.body.discount_value || promotion.discount_value;
        promotion.end_date = req.body.end_date || promotion.end_date;
        promotion.status = req.body.status || promotion.status;

        const updatedPromotion = await promotion.save();

        res.json(formatResponse(true, {
            _id: updatedPromotion._id,
            name: updatedPromotion.name,
            status: updatedPromotion.status
        }, 'Promotion updated successfully'));
    } else {
        res.status(404);
        throw new Error('Promotion not found');
    }
});

const deletePromotion = asyncHandler(async (req, res) => {
    const promotion = await Promotion.findById(req.params.id);

    if (promotion) {
        promotion.status = 'inactive';
        await promotion.save();
        res.json(formatResponse(true, null, 'Promotion deleted successfully'));
    } else {
        res.status(404);
        throw new Error('Promotion not found');
    }
});

module.exports = {
    PromotionController: {
        createPromotion,
        getPromotions,
        updatePromotion,
        deletePromotion
    }
}; 