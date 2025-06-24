const asyncHandler = require('express-async-handler');
const Order = require('../models/order.model');
const OrderItem = require('../models/orderItem.model');
const CustomerItems = require('../models/customerItems.model');
const Store = require('../models/store.model');
const Product = require('../models/product.model');
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
      items.map(async (item) => {
        // Tạo OrderItem
        await OrderItem.create({
          order_id: order._id,
          product_id: item.product_id._id,
          quantity: item.quantity,
          unit_price: item.product_id.price,
          total_price: item.quantity * item.product_id.price,
          status: 'active',
        });

        // Tăng quantitySold
        await Product.findByIdAndUpdate(
          item.product_id._id,
          { $inc: { quantitySold: item.quantity } }
        );
      })
    );

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

const getCustomerOrders = asyncHandler(async (req, res) => {
  const customer_id = req.user.id;
  const orders = await Order.find({ customer_id })
    .populate('customer_id', 'full_name email').sort({ _id: -1 })

  if (orders) {
    res.json(formatResponse(true, orders, 'Orders retrieved successfully'));
  } else {
    res.status(404);
    throw new Error('No orders found');
  }
});

const getCustomerOrderDetail = asyncHandler(async (req, res) => {
  const { orderId } = req.params;

  // const orders = await Order.findById(orderId)
  const orderItems = await OrderItem.find({ order_id: orderId })
    .populate({
      path: 'product_id',
      select: 'name main_image store_id',
      populate: {
        path: 'store_id',
        select: 'store_name address store_logo', // hoặc các field bạn cần từ store
      },
    });

  if (orderItems) {
    res.json(formatResponse(true, orderItems, 'Orders retrieved successfully'));
  } else {
    res.status(404);
    throw new Error('No orders found');
  }
});


const getStoreOrders = asyncHandler(async (req, res) => {
  try {
    const customer_id = req.user.id;
    const store = await Store.findOne({ owner_id: customer_id });

    if (!store) {
      return res
        .status(400)
        .json(formatResponse(false, null, 'Không tìm thấy cửa hàng'));
    }

    const store_id = store._id;

    // Lấy tất cả OrderItem có product nằm trong store này
    const orderItems = await OrderItem.find()
      .populate({
        path: 'product_id',
        select: 'name main_image store_id',
        populate: {
          path: 'store_id',
          select: '_id'
        }
      })
      .populate({
        path: 'order_id',
        select: 'order_code created_at total_amount status receiverName receiverPhone address',
      }).sort({ _id: -1 });

    // Lọc item có product nằm trong store
    const filteredItems = orderItems.filter(
      (item) => item.product_id?.store_id?._id?.toString() === store_id.toString()
    );

    // Gom nhóm theo order_id
    const ordersMap = {};
    filteredItems.forEach((item) => {
      const order = item.order_id;
      const orderId = order._id.toString();

      if (!ordersMap[orderId]) {
        ordersMap[orderId] = {
          order_id: order._id,
          order_code: order.order_code,
          created_at: order.created_at,
          total_amount: order.total_amount,
          status: order.status,
          receiverName: order.receiverName,
          receiverPhone: order.receiverPhone,
          address: order.address,
          products: [],
        };
      }

      // Chỉ push nếu chưa có
      if (ordersMap[orderId].products.length < 3) {
        ordersMap[orderId].products.push({
          name: item.product_id.name,
          image: item.product_id.main_image,
          quantity: item.quantity,
        });
      }
    });

    const groupedOrders = Object.values(ordersMap);
    res.json(formatResponse(true, groupedOrders, 'Lấy đơn hàng cửa hàng thành công'));
  } catch (err) {
    console.error(err);
    res.status(500).json(formatResponse(false, null, 'Đã xảy ra lỗi khi lấy đơn hàng'));
  }
});

const getStoreOrderDetail = asyncHandler(async (req, res) => {
  try {
    const { orderId } = req.params;
    const customer_id = req.user.id;

    // Tìm store của user hiện tại
    const store = await Store.findOne({ owner_id: customer_id });
    if (!store) {
      return res
        .status(400)
        .json(formatResponse(false, null, 'Không tìm thấy cửa hàng'));
    }

    // Lấy thông tin order
    const order = await Order.findById(orderId)
      .select('order_code created_at total_amount status receiverName receiverPhone receiverEmail address payment_method');

    if (!order) {
      return res
        .status(404)
        .json(formatResponse(false, null, 'Không tìm thấy đơn hàng'));
    }

    // Lấy các order items của đơn hàng này và chỉ lấy sản phẩm thuộc store
    const orderItems = await OrderItem.find({ order_id: orderId })
      .populate({
        path: 'product_id',
        select: 'name main_image price store_id description',
        populate: {
          path: 'store_id',
          select: 'store_name address store_logo'
        }
      });

    // Lọc chỉ lấy sản phẩm thuộc store của user
    const storeOrderItems = orderItems.filter(
      item => item.product_id?.store_id?._id?.toString() === store._id.toString()
    );

    if (storeOrderItems.length === 0) {
      return res
        .status(404)
        .json(formatResponse(false, null, 'Không tìm thấy sản phẩm nào thuộc cửa hàng trong đơn hàng này'));
    }

    // Tính tổng tiền của store trong đơn hàng
    const storeTotalAmount = storeOrderItems.reduce((total, item) => {
      return total + item.total_price;
    }, 0);

    // Chuẩn bị dữ liệu trả về
    const orderDetail = {
      order: {
        _id: order._id,
        order_code: order.order_code,
        created_at: order.created_at,
        total_amount: order.total_amount,
        store_total_amount: storeTotalAmount, // Tổng tiền của store
        status: order.status,
        receiverName: order.receiverName,
        receiverPhone: order.receiverPhone,
        receiverEmail: order.receiverEmail,
        address: order.address,
        payment_method: order.payment_method
      },
      items: storeOrderItems.map(item => ({
        _id: item._id,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total_price: item.total_price,
        product_id: {
          _id: item.product_id._id,
          name: item.product_id.name,
          main_image: item.product_id.main_image,
          price: item.product_id.price,
          description: item.product_id.description
        }
      })),
      store_info: {
        store_name: store.store_name,
        store_logo: store.store_logo,
        address: store.address
      }
    };

    res.json(formatResponse(true, orderDetail, 'Lấy chi tiết đơn hàng thành công'));

  } catch (err) {
    console.error('Error in getStoreOrderDetail:', err);
    res.status(500).json(formatResponse(false, null, 'Đã xảy ra lỗi khi lấy chi tiết đơn hàng'));
  }
});

const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  const orderitems = await OrderItem.find({ order_id: order._id }).populate('product_id')
  // .populate('customer_id', 'full_name email')
  // .populate({
  //     path: 'items',
  //     populate: {
  //         path: 'product_id',
  //         select: 'name price'
  //     }
  // });

  if (orderitems) {
    res.json(formatResponse(true, orderitems, 'Order retrieved successfully'));
  } else {
    res.status(404);
    throw new Error('Order not found');
  }
});

const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status, reject_reason } = req.body;
  const order = await Order.findById(req.params.id);

  if (order) {
    order.status = status;
    if (!!reject_reason) {
      order.reject_reason = reject_reason
    }
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
    getCustomerOrders,
    getOrderById,
    updateOrderStatus,
    getCustomerOrderDetail,
    getStoreOrders,
    getStoreOrderDetail
  }
}; 