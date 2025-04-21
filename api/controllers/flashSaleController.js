const FlashSaleRegistration = require('../models/flashSaleRegistration');

const flashSaleController = {
  registerFlashSale: async (req, res) => {
    try {
      const { flashSaleId } = req.params;
      const { product_id, quantity, discount } = req.body;

      const registration = new FlashSaleRegistration({
        flash_sale_id: flashSaleId,
        product_id,
        quantity,
        discount,
      });

      await registration.save();
      res.status(201).json({ isSuccess: true, data: registration });
    } catch (error) {
      res.status(500).json({ isSuccess: false, message: error.message });
    }
  },
  getRegistrations: async (req, res) => {
    try {
      const { flashSaleId } = req.params;
      const registrations = await FlashSaleRegistration.find({ flash_sale_id: flashSaleId });
      res.json({ isSuccess: true, data: registrations });
    } catch (error) {
      res.status(500).json({ isSuccess: false, message: error.message });
    }
  },
  deleteRegistration: async (req, res) => {
    try {
      const { registrationId } = req.params;
      await FlashSaleRegistration.findByIdAndDelete(registrationId);
      res.json({ isSuccess: true, message: 'Xóa đăng ký thành công' });
    } catch (error) {
      res.status(500).json({ isSuccess: false, message: error.message });
    }
  },
};

module.exports = flashSaleController;