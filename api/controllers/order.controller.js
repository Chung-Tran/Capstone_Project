const asyncHandler = require('express-async-handler');
const Order = require('../models/order.model');
const OrderItem = require('../models/orderItem.model');
const CustomerItems = require('../models/customerItems.model');
const formatResponse = require('../middlewares/responseFormat');

const createOrder = asyncHandler(async (req, res) => {
    const { items, address, payment_method, total, receiverName, receiverPhone } = req.body;
    const customer_id = req.user.id;

    const orderCount = await Order.countDocuments();
    const order_code = `ORDER-${(orderCount + 1).toString().padStart(3, '0')}`;

    let subtotal = 0;
    for (const item of items) {
        subtotal += item.quantity * item.product_id.price;

    }
    if (subtotal != total) { //Total từ frontend không khớp với tổng tiền hàng 
        throw new Error('Đã xảy ra lỗi trong quá trình thanh toán');
    }
    const shipping_fee = 10;
    const tax_amount = subtotal * 0.1;
    const total_amount = subtotal;

    const order = await Order.create({
        order_code,
        customer_id,
        address,
        payment_method,
        subtotal,
        shipping_fee,
        tax_amount,
        total_amount,
        shipping_method: 'standard',
        payment_status: 'pending',
        receiverName,
        receiverPhone,
        notes: "fake notes"
    });

    if (order) {
        const orderItems = await Promise.all(
            items.map(item => OrderItem.create({
                order_id: order._id,
                product_id: item.product_id._id,
                quantity: item.quantity,
                // unit_price: item.unit_price,
                total_price: item.quantity * item.product_id.price,
                status: 'active',
                unit_price: item.product_id.price,
            }))
        );
        //delete from cart
        await CustomerItems.deleteMany({
            customer_id,
            type: 'cart'
        });

        res.status(201).json(formatResponse(true, {
            _id: order._id,
            order_code: order.order_code,
            total_amount: order.total_amount,
            items: orderItems
        }, 'Order created successfully'));
    } else {
        res.status(400);
        throw new Error('Invalid order data');
    }
});

const getOrders = asyncHandler(async (req, res) => {
    const customer_id = req.user.id;
    const orders = await Order.find({ customer_id })
        .populate('customer_id', 'full_name email');

    if (orders) {
        res.json(formatResponse(true, orders, 'Orders retrieved successfully'));
    } else {
        res.status(404);
        throw new Error('No orders found');
    }
});

const getOrderById = asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id)
        .populate('customer_id', 'full_name email')
        .populate({
            path: 'items',
            populate: {
                path: 'product_id',
                select: 'name price'
            }
        });

    if (order) {
        res.json(formatResponse(true, order, 'Order retrieved successfully'));
    } else {
        res.status(404);
        throw new Error('Order not found');
    }
});

const updateOrderStatus = asyncHandler(async (req, res) => {
    const { status } = req.body;
    const order = await Order.findById(req.params.id);

    if (order) {
        order.status = status;
        const updatedOrder = await order.save();

        res.json(formatResponse(true, {
            _id: updatedOrder._id,
            status: updatedOrder.status
        }, 'Order status updated successfully'));
    } else {
        res.status(404);
        throw new Error('Order not found');
    }
});

module.exports = {
    OrderController: {
        createOrder,
        getOrders,
        getOrderById,
        updateOrderStatus
    }
}; 