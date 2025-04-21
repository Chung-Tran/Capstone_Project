const express = require('express');
const router = express.Router();
// const FlashSaleRegistration = require('../models/flashSaleRegistration');

// // Đăng ký flash sale
// router.post('/:flashSaleId/register', async (req, res) => {
//   try {
//     const { flashSaleId } = req.params;
//     const { product_id, quantity, discount } = req.body;

//     const registration = new FlashSaleRegistration({
//       flash_sale_id: flashSaleId,
//       product_id,
//       quantity,
//       discount,
//     });

//     await registration.save();
//     res.status(201).json({ isSuccess: true, data: registration });
//   } catch (error) {
//     res.status(500).json({ isSuccess: false, message: error.message });
//   }
// });

module.exports = router;