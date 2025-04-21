const asyncHandler = require("express-async-handler");
const Promotion = require("../models/promotion.model");
const formatResponse = require("../middlewares/responseFormat");

const createPromotion = asyncHandler(async (req, res) => {
  try {
    const {
      promotion_code,
      name,
      description,
      discount_type,
      minimum_purchase_amount,
      usage_limit,
      maximum_discount,
      discount_value,
      start_date,
      end_date,
    } = req.body;

    const promotionCount = await Promotion.countDocuments();

    const promotion = await Promotion.create({
      promotion_code,
      name,
      description,
      discount_type,
      discount_value,
      maximum_discount,
      minimum_purchase_amount,
      usage_limit,
      start_date,
      end_date,
    });

    if (promotion) {
      res.status(201).json(
        formatResponse(
          true,
          {
            _id: promotion._id,
            promotion_code: promotion.promotion_code,
            name: promotion.name,
            discount_type: promotion.discount_type,
            discount_value: promotion.discount_value,
          },
          "Promotion created successfully"
        )
      );
    } else {
      res.status(400).json(formatResponse(false, null, "Tạo voucher thất bại"));
      // throw new Error('Khong the tao voucher');
    }
  } catch (error) {
    res.status(400).json(formatResponse(false, null, "Tạo voucher thất bại"));
  }
});

const getPromotions = asyncHandler(async (req, res) => {
  const promotions = await Promotion.find({
    end_date: { $gte: new Date() },
    status: "active",
  });

  if (promotions) {
    res.json(
      formatResponse(true, promotions, "Promotions retrieved successfully")
    );
  } else {
    res.status(404);
    throw new Error("No promotions found");
  }
});
const getPromotionsById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const promotions = await Promotion.findById(id);

  if (promotions) {
    res.json(
      formatResponse(true, promotions, "Promotions retrieved successfully")
    );
  } else {
    res.status(404);
    throw new Error("No promotions found");
  }
});

const updatePromotion = asyncHandler(async (req, res) => {
  const promotion = await Promotion.findById(req.params.id);

  if (promotion) {
    promotion.name = req.body.name || promotion.name;
    promotion.description = req.body.description || promotion.description;
    promotion.discount_value =
      req.body.discount_value || promotion.discount_value;
    promotion.end_date = req.body.end_date || promotion.end_date;
    promotion.status = req.body.status || promotion.status;
    promotion.minimum_purchase_amount = req.body.minimum_purchase_amount || promotion.minimum_purchase_amount;
    promotion.maximum_discount = req.body.maximum_discount || promotion.maximum_discount;
    promotion.usage_limit = req.body.usage_limit || promotion.usage_limit;

    const updatedPromotion = await promotion.save();

    res.json(
      formatResponse(
        true,
        {
          _id: updatedPromotion._id,
          name: updatedPromotion.name,
          status: updatedPromotion.status,
        },
        "Promotion updated successfully"
      )
    );
  } else {
    res.status(404);
    throw new Error("Promotion not found");
  }
});

const deletePromotion = asyncHandler(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
          res.status(400);
          throw new Error('ID voucher không hợp lệ');
      }
  
      const promotion = await Promotion.findById(req.params.id);
  
      if (promotion) {
          await promotion.deleteOne();
          res.json(formatResponse(true, null, 'Promotion deleted successfully'));
      } else {
          res.status(404);
          throw new Error('Không tìm thấy voucher');
      }
});

module.exports = {
  PromotionController: {
    createPromotion,
    getPromotions,
    updatePromotion,
    getPromotionsById,
    deletePromotion,
  },
};
