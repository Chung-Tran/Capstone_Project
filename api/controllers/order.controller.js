const asyncHandler = require("express-async-handler");
const mongoose = require("mongoose");
const Order = require("../models/order.model");
const OrderItem = require("../models/orderItem.model");
const CustomerItems = require("../models/customerItems.model");
const Store = require("../models/store.model");
const formatResponse = require("../middlewares/responseFormat");

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
  const user = req.user;

  // Tìm cửa hàng của user
  const store = await Store.findOne({ owner_id: user._id });
  if (!store) {
    res.status(404);
    throw new Error("Store not found for this user");
  }

  // Lấy tất cả đơn hàng có liên kết với khách hàng
  const orders = await Order.find({})
    .populate("customer_id", "fullName email")
    .lean();
    console.log(orders)

  const ordersWithItems = await Promise.all(
    orders.map(async (order) => {
      // Lấy toàn bộ sản phẩm trong đơn hàng
      const orderItems = await OrderItem.find({ order_id: order._id })
        .populate("product_id")
        .lean();

      // Lọc ra các sản phẩm thuộc cửa hàng hiện tại
      const storeItems = orderItems.filter(
        (item) =>
          item.product_id &&
          item.product_id.store_id?.toString() === store._id.toString()
      );

      if (storeItems.length === 0) {
        return null; // Không có sản phẩm thuộc cửa hàng -> bỏ qua đơn hàng
      }

      return {
        id: order.order_code,
        customer: order.customer_id.fullName,
        date: order.created_at.toISOString().split("T")[0],
        total: order.total_amount,
        status: order.status,
        items: storeItems, // Trả về danh sách sản phẩm thuộc store
      };
    })
  );

  // Lọc ra những đơn hàng không null
  const filteredOrders = ordersWithItems.filter((order) => order !== null);

  if (filteredOrders.length > 0) {
    res.json(formatResponse(true, filteredOrders, "Orders retrieved successfully"));
  } else {
    res.status(404);
    throw new Error("No orders found for this store");
  }
});


const getOrderById = asyncHandler(async (req, res) => {
  const orderId = req.params.orderId; // Lấy orderId từ URL (thay vì req.params.OrderItem)
  const user = req.user;
  const store = await Store.findOne({ owner_id: user._id });
  // Kiểm tra orderId có phải ObjectId hợp lệ
  if (!mongoose.Types.ObjectId.isValid(orderId)) {
    // Nếu không phải ObjectId, tìm đơn hàng theo order_code
    const order = await Order.findOne({ order_code: orderId })
      .populate("customer_id", "fullName email")
      .lean();

    if (!order) {
      res.status(404);
      throw new Error("Order not found");
    }

    // Tìm OrderItem theo order_id
    const orderItems = await OrderItem.find({ order_id: order._id })
      .populate("product_id")
      .lean();
    console.log(orderItems);
    const temp = orderItems.filter(
      (x) => x.product_id.store_id.toString() === store._id.toString()
    );
    console.log(temp);
    const orderDetail = {
      ...order,
      items: temp,
    };

    res.json(formatResponse(true, orderDetail, "Order retrieved successfully"));
  } else {
    // Nếu là ObjectId hợp lệ, tìm đơn hàng theo _id
    const order = await Order.findById(orderId)
      .populate("customer_id", "fullName email")
      .lean();

    if (!order) {
      // Nếu không tìm thấy Order, thử tìm OrderItem theo order_id
      const orderItems = await OrderItem.find({ order_id: orderId })
        .populate("product_id")
        .populate({
          path: "order_id",
          populate: {
            path: "customer_id",
            select: "fullName email",
          },
        })
        .lean();

      if (!orderItems || orderItems.length === 0) {
        res.status(404);
        throw new Error("Order not found");
      }

      // Lấy thông tin đơn hàng từ OrderItem
      const orderData = orderItems[0].order_id;

      const orderDetail = {
        ...orderData,
        items: orderItems,
      };

      res.json(
        formatResponse(true, orderDetail, "Order retrieved successfully")
      );
    } else {
      // Tìm OrderItem theo order_id
      const orderItems = await OrderItem.find({ order_id: order._id }).populate(
        "product_id"
      );
      // .lean();

      const orderDetail = {
        ...order,
        items: orderItems,
      };

      res.json(
        formatResponse(true, orderDetail, "Order retrieved successfully")
      );
    }
  }
});

const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const order = await Order.findById(req.params.id).populate("store_id");
  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }

  const store = await Store.findOne({
    _id: order.store_id,
    owner_id: req.user.id,
  });
  if (!store && req.user.role !== "admin") {
    res.status(403);
    throw new Error("Not authorized to update this order");
  }

  order.status = status;
  const updatedOrder = await order.save();

  res.json(
    formatResponse(
      true,
      {
        _id: updatedOrder._id,
        status: updatedOrder.status,
      },
      "Order status updated successfully"
    )
  );
});

const getCustomerOrders = asyncHandler(async (req, res) => {
  const customerId = req.user._id;
  const { page = 1, limit = 10, status } = req.query;

  // Xây dựng query để lọc theo customer_id
  const query = { customer_id: customerId };
  if (status) query.status = status;

  // Tính skip cho phân trang
  const skip = (page - 1) * limit;

  // Lấy danh sách đơn hàng
  const orders = await Order.find(query)
    .populate("customer_id", "fullName email")
    .skip(skip)
    .limit(Number(limit))
    .lean();

  // Nếu không có đơn hàng, trả mảng rỗng
  if (!orders || orders.length === 0) {
    return res.json(formatResponse(true, { orders: [], total: 0, page, limit }, "No orders found for this customer"));
  }

  // Lấy chi tiết sản phẩm và cửa hàng cho từng đơn hàng
  const ordersWithDetails = await Promise.all(
    orders.map(async (order) => {
      const orderItems = await OrderItem.find({ order_id: order._id })
        .populate({
          path: "product_id",
          select: "name price image store_id",
          populate: { path: "store_id", select: "name address" },
        })
        .lean();

      const items = orderItems.map((item) => ({
        product_name: item.product_id?.name || "Unknown",
        price: item.product_id?.price || 0,
        quantity: item.quantity,
        image: item.product_id?.image || null, // Fallback nếu không có image
        shop: {
          name: item.product_id?.store_id?.name || "Unknown",
          address: item.product_id?.store_id?.address || "Unknown",
        },
      }));

      return {
        order_code: order.order_code,
        date: order.created_at.toISOString().split("T")[0],
        status: order.status,
        total_amount: order.total_amount,
        items,
      };
    })
  );

  // Đếm tổng số đơn hàng để hỗ trợ phân trang
  const total = await Order.countDocuments(query);

  res.json(
    formatResponse(
      true,
      { orders: ordersWithDetails, total, page, limit },
      "Customer orders retrieved successfully"
    )
  );
});


module.exports = {
  OrderController: {
    createOrder,
    getOrders,
    getOrderById,
    updateOrderStatus,
    getCustomerOrders
  },
};