const asyncHandler = require('express-async-handler');
const Customer = require('../models/customer.model');
const Product = require('../models/product.model');
const Store = require('../models/store.model');
const CustomerItems = require('../models/customerItems.model');
const Notification = require('../models/notification.model');
const formatResponse = require('../middlewares/responseFormat');
const { createOTP, verifyOTP } = require('../services/otpService');
const { sendOTPEmail } = require('../services/emailService');
const { generateToken } = require('../services/jwtService');
const { uploadImage } = require('../services/uploadService');
const upload = require('../middlewares/uploadMiddleware');

const sendRegistrationOTP = asyncHandler(async (req, res) => {
    const { email } = req.body;

    // Check if email already exists
    const customerExists = await Customer.findOne({ email });
    if (customerExists) {
        res.status(400);
        throw new Error('Email đã tồn tại');
    }

    // Generate and save OTP
    const otp = await createOTP(email, 'email');

    // Send OTP via email
    const emailSent = await sendOTPEmail(email, otp);
    if (!emailSent) {
        res.status(500);
        throw new Error('Không thể gửi OTP');
    }

    res.json(formatResponse(true, null, 'OTP đã được gửi thành công'));
});

const registerCustomer = asyncHandler(async (req, res) => {
    const { username, email, password, fullName, phone, birthDate, role, gender, otp, store_name, business_field, tax_code, store_description, contact_email, contact_phone, address } = req.body;

    // Verify OTP
    const isOTPValid = await verifyOTP(email, otp, 'email');
    if (!isOTPValid) {
        res.status(400);
        throw new Error('OTP không hợp lệ hoặc hết hạn');
    }

    const customerExists = await Customer.findOne({ email });
    if (customerExists) {
        res.status(400);
        throw new Error('Email đã tồn tại');
    }

    const customerCount = await Customer.countDocuments();
    const customer_code = `CUST-${(customerCount + 1).toString().padStart(3, '0')}`;

    // Create customer
    const customer = await Customer.create({
        username,
        customer_code,
        email,
        password,
        fullName,
        phone,
        address,
        birthDate,
        gender,
        role
    });

    if (!customer) {
        res.status(400);
        throw new Error('Invalid customer data');
    }

    let store = null;
    // If role is seller, create store
    if (role === 'seller') {
        if (!store_name || !business_field) {
            res.status(400);
            throw new Error('Store information is required for seller registration');
        }
        let storeLogoUrl = null;
        if (req.files && req.files.store_logo) {
            storeLogoUrl = await uploadImage(req.files.store_logo[0]);
        }
        const storeCount = await Store.countDocuments();
        const store_code = `STORE-${(storeCount + 1).toString().padStart(3, '0')}`;

        store = await Store.create({
            store_code,
            address,
            owner_id: customer._id,
            store_name,
            store_description,
            business_field,
            contact_email,
            contact_phone,
            tax_code,
            status: 'active'
        });

        if (!store) {
            // If store creation fails, delete the customer
            await Customer.findByIdAndDelete(customer._id);
            res.status(400);
            throw new Error('Failed to create store');
        }
    }

    // Prepare response data
    const responseData = {
        _id: customer._id,
        customer_code: customer.customer_code,
        full_name: customer.full_name,
        email: customer.email,
        role: customer.role
    };

    // Add store information if seller
    if (store) {
        responseData.store = {
            _id: store._id,
            store_code: store.store_code,
            store_name: store.store_name,
            business_field: store.business_field
        };
    }

    res.status(201).json(formatResponse(true, responseData, 'Registration successful'));
});

const loginCustomer = asyncHandler(async (req, res) => {
    const { username, password } = req.body;
    const customer = await Customer.findOne({ email: username });
    if (!customer) {
        res.status(400);
        throw new Error('Invalid email or password');
    }

    const isMatch = await customer.comparePassword(password);
    if (!isMatch) {
        console.log('Invalid or password');
        res.status(400);
        throw new Error('Invalid email or password');
    }

    // Generate JWT token
    const token = generateToken(customer);

    res.json(formatResponse(true, {
        _id: customer._id,
        full_name: customer.full_name,
        email: customer.email,
        role: customer.role,
        token
    }, 'Login successful'));
});

const registerStore = asyncHandler(async (req, res) => {
    const { store_name, business_field, tax_code } = req.body;
    const owner_id = req.user.id;

    const customer = await Customer.findById(owner_id);
    if (customer.role !== 'seller') {
        res.status(403);
        throw new Error('Only sellers can register stores');
    }

    const storeCount = await Store.countDocuments();
    const store_code = `STORE-${(storeCount + 1).toString().padStart(3, '0')}`;

    const store = await Store.create({
        store_code,
        owner_id,
        store_name,
        business_field,
        tax_code
    });

    if (store) {
        res.status(201).json(formatResponse(true, {
            _id: store._id,
            store_code: store.store_code,
            store_name: store.store_name,
            business_field: store.business_field
        }, 'Store registered successfully'));
    } else {
        res.status(400);
        throw new Error('Invalid store data');
    }
});

const getCustomerProfile = asyncHandler(async (req, res) => {
    const customer = await Customer.findById(req.params.id).select('-password');

    if (customer) {
        res.json(formatResponse(true, customer, 'Profile retrieved successfully'));
    } else {
        res.status(404);
        throw new Error('Customer not found');
    }
});

const updateCustomerProfile = asyncHandler(async (req, res) => {
    const customer = await Customer.findById(req.params.id);
    let avatarUrl = customer.avatar;
    if (req.files && req.files.avatar) {
        avatarUrl = await uploadImage(req.files.avatar[0]);
    }
    if (customer) {
        customer.fullName = req.body.fullName || customer.fullName;
        // customer.email = req.body.email || customer.email;
        customer.phone = req.body.phone || customer.phone;
        customer.address = req.body.address || customer.address;
        customer.birthDate = req.body.birthDate || customer.birthDate;
        customer.gender = req.body.gender || customer.gender;
        customer.avatar = avatarUrl;
        const updatedCustomer = await customer.save();

        res.json(formatResponse(true, {
            _id: updatedCustomer._id,
            fullName: updatedCustomer.fullName,
            email: updatedCustomer.email,
            phone: updatedCustomer.phone,
            address: updatedCustomer.address,
            birthDate: updatedCustomer.birthDate,
            gender: updatedCustomer.gender,
            avatar: updatedCustomer.avatar
        }, 'Profile updated successfully'));
    } else {
        res.status(404);
        throw new Error('Customer not found');
    }
});

const getShopInfo = asyncHandler(async (req, res) => {
    const user = req.user;
    const shop = await Store.findOne({ owner_id: user._id });
    if (!shop) {
        res.status(404);
        throw new Error('Shop not found');
    }
    const product = await Product.find({ store_id: shop._id });
    const response = {
        shopInfo: shop,
        productInfo: product
    }
    res.json(formatResponse(true, response, 'Shop info retrieved successfully'));
});

const updateShopInfo = asyncHandler(async (req, res) => {
    const user = req.user;
    const {
        store_name,
        store_description,
        business_field,
        contact_email,
        contact_phone,
        tax_code,
        address
    } = req.body;

    const shop = await Store.findOne({ owner_id: user._id });
    if (!shop) {
        res.status(404);
        throw new Error('Shop not found');
    }

    let logoUrl = shop.store_logo;
    if (req.files && req.files.store_logo) {
        logoUrl = await uploadImage(req.files.store_logo[0]);
    }

    let bannerUrl = shop.store_banner;
    if (req.files && req.files.store_banner) {
        bannerUrl = await uploadImage(req.files.store_banner[0]);
    }

    // Update shop information
    shop.store_name = store_name || shop.store_name;
    shop.store_description = store_description || shop.store_description;
    shop.business_field = business_field || shop.business_field;
    shop.contact_email = contact_email || shop.contact_email;
    shop.contact_phone = contact_phone || shop.contact_phone;
    shop.tax_code = tax_code || shop.tax_code;
    shop.address = address || shop.address;
    shop.store_logo = logoUrl;
    shop.store_banner = bannerUrl;

    const updatedShop = await shop.save();

    if (!updatedShop) {
        res.status(400);
        throw new Error('Failed to update shop information');
    }

    res.json(formatResponse(true, {
        _id: updatedShop._id,
        store_code: updatedShop.store_code,
        store_name: updatedShop.store_name,
        store_description: updatedShop.store_description,
        business_field: updatedShop.business_field,
        contact_email: updatedShop.contact_email,
        contact_phone: updatedShop.contact_phone,
        tax_code: updatedShop.tax_code,
        address: updatedShop.address,
        logo: updatedShop.logo,
        status: updatedShop.status
    }, 'Shop information updated successfully'));
});

const getAccountInfo = asyncHandler(async (req, res) => {
    const user = req.user;

    const [customer, notifications, wishlist, cart] = await Promise.all([
        Customer.findById(user._id).select('-password'),
        Notification.find({ user_id: user._id }),
        CustomerItems.countDocuments({ customer_id: user._id, type: 'wishlist' }),
        CustomerItems.countDocuments({ customer_id: user._id, type: 'cart' })
    ]);

    if (!customer) {
        res.status(404);
        throw new Error('Customer not found');
    }

    res.json(formatResponse(true, {
        customer,
        notifications,
        wishlistCount: wishlist,
        cartCount: cart
    }, 'Account info retrieved successfully'));
});

module.exports = {
    CustomerController: {
        sendRegistrationOTP,
        registerCustomer,
        loginCustomer,
        registerStore,
        getCustomerProfile,
        updateCustomerProfile,
        getShopInfo,
        updateShopInfo,
        getAccountInfo
    }
}; 