const asyncHandler = require('express-async-handler');
const Order = require('../models/order.model');
const Transaction = require('../models/transaction.model');
const OrderItem = require('../models/orderItem.model');
const CustomerItems = require('../models/customerItems.model');
const Product = require('../models/product.model');
const formatResponse = require('../middlewares/responseFormat');
const axios = require('axios');
const crypto = require('crypto');
const momoConfig = require('../config/momo.config');
const mongoose = require('mongoose')

// ---FLOW PAYMENT---
// 1. Khách hàng chọn sản phẩm và thanh toán
// 2. Gửi yêu cầu thanh toán đến MoMo
// 3. MoMo trả về link thanh toán
// 4. Chuyển hướng khách hàng đến link thanh toán
// 5. Khách hàng thanh toán thành công
// 6. MoMo gửi callback đến server
// 7. Server xử lý callback, neu thanh toán thành công thì tao đơn hàng
// 8. Server gửi kết quả về cho khách hàng
// 9. Khách hàng nhận được thông báo thanh toán thành công, tao đơn hàng
///

const createPayment = asyncHandler(async (req, res) => {
    let {
        accessKey,
        secretKey,
        orderInfo,
        partnerCode,
        redirectUrl,
        ipnUrl,
        requestType,
        extraData,
        orderGroupId,
        autoCapture,
        lang,
    } = momoConfig;

    var { amount, orderId } = req.body;
    var requestId = orderId + new Date().getTime();

    //before sign HMAC SHA256 with format
    //accessKey=$accessKey&amount=$amount&extraData=$extraData&ipnUrl=$ipnUrl&orderId=$orderId&orderInfo=$orderInfo&partnerCode=$partnerCode&redirectUrl=$redirectUrl&requestId=$requestId&requestType=$requestType
    var rawSignature =
        'accessKey=' +
        accessKey +
        '&amount=' +
        amount +
        '&extraData=' +
        extraData +
        '&ipnUrl=' +
        ipnUrl +
        '&orderId=' +
        orderId +
        '&orderInfo=' +
        orderInfo +
        '&partnerCode=' +
        partnerCode +
        '&redirectUrl=' +
        redirectUrl +
        '&requestId=' +
        requestId +
        '&requestType=' +
        requestType;

    //signature
    var signature = crypto
        .createHmac('sha256', secretKey)
        .update(rawSignature)
        .digest('hex');

    //json object send to MoMo endpoint
    const requestBody = JSON.stringify({
        partnerCode: partnerCode,
        partnerName: 'Test',
        storeId: 'MomoTestStore',
        requestId: requestId,
        amount: amount,
        orderId: orderId,
        orderInfo: orderInfo,
        redirectUrl: redirectUrl,
        ipnUrl: ipnUrl,
        lang: lang,
        requestType: requestType,
        autoCapture: autoCapture,
        extraData: extraData,
        orderGroupId: orderGroupId,
        signature: signature,
    });

    // options for axios
    const options = {
        method: 'POST',
        url: 'https://test-payment.momo.vn/v2/gateway/api/create',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(requestBody),
        },
        data: requestBody,
    };

    // Send the request and handle the response
    let result;
    try {
        result = await axios(options);
        return res.status(200).json(formatResponse(true, result.data, 'Create payment url successfully'));
    } catch (error) {
        return res.status(500).json(formatResponse(false, null, 'Create payment url failed', error));
    }
});
const callback = asyncHandler(async (req, res) => {
    /**
      resultCode = 0: giao dịch thành công.
      resultCode = 9000: giao dịch được cấp quyền (authorization) thành công .
      resultCode <> 0: giao dịch thất bại.
     */
    const { resultCode, orderId, amount, message, transId, orderType } = req.body;
    if (resultCode == 0) {
        const order = await Order.findById(new mongoose.Types.ObjectId(orderId));
        if (!order) {
            return res.status(404).json(formatResponse(false, null, 'Order not found'));
        }

        const transaction = await Transaction.create({
            order_id: orderId,
            transaction_code: transId,
            amount: amount,
            payment_method: orderType,
            status: resultCode == 0 ? 'success' : 'failed',
        });
        order.payment_status = 'success';
        order.payment_method = 'momo';
        order.payment_transaction_id = transaction._id;
        //delete from cart
        await CustomerItems.deleteMany({
            customer_id: order.customer_id,
            type: 'cart'
        });
        const products = await OrderItem.find({ orderId: order._id });
        if (products && products.length > 0) {
            await Promise.all(
                products.map(item =>
                    Product.findByIdAndUpdate(
                        item.product_id,
                        {
                            $inc: {
                                quantitySold: item.quantity || 1,
                                stock: -(item.quantity || 1) // giảm tồn kho
                            }
                        },
                        { new: true }
                    )
                )
            );
        }

        await order.save();

    } else {
        console.error('Transaction failed', message, 'resultCode', resultCode, 'OrderId', orderId);
        const transaction = await Transaction.create({
            order_id: orderId,
            transaction_code: transId,
            amount: amount,
            payment_method: orderType,
            status: 'failed',
        });
        Order.findByIdAndUpdate(orderId, {
            payment_status: 'failed',
            payment_method: 'momo',
            payment_transaction_id: transaction._id,
        });

        return res.status(204).json(req.body);
    }
});

const checkTransactionStatus = asyncHandler(async (req, res) => {
    const orderId = new mongoose.Types.ObjectId(req.params.orderId);
    const order = await Order.findById(orderId);
    if (!order) {
        return res.status(200).json(formatResponse(true, {
            status: 'draft',
        }, 'Order not found'));
    }
    const transaction = await Transaction.findById(order.payment_transaction_id);
    if (!transaction) {
        return res.status(200).json(formatResponse(true, {
            status: 'draft',
        }, 'Transaction not found'));
    }
    return res.status(200).json(formatResponse(true, {
        orderId: order._id,
        transactionId: transaction._id,
        status: transaction.status,
        amount: transaction.amount,
        payment_method: transaction.payment_method,
    }, 'Transaction success'));
});

module.exports = {
    PaymentController: {
        createPayment,
        callback,
        checkTransactionStatus,
    }
}; 