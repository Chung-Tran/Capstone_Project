const asyncHandler = require('express-async-handler');
const Customer = require('../models/customer.model');
const Store = require('../models/store.model');
const formatResponse = require('../middlewares/responseFormat');

const registerCustomer = asyncHandler(async (req, res) => {
    const { email, password, full_name, role } = req.body;

    const customerExists = await Customer.findOne({ email });
    if (customerExists) {
        res.status(400);
        throw new Error('Customer already exists');
    }

    const customerCount = await Customer.countDocuments();
    const customer_code = `CUST-${(customerCount + 1).toString().padStart(3, '0')}`;

    const customer = await Customer.create({
        customer_code,
        email,
        password,
        full_name,
        role
    });

    if (customer) {
        res.status(201).json(formatResponse(true, {
            _id: customer._id,
            customer_code: customer.customer_code,
            full_name: customer.full_name,
            email: customer.email,
            role: customer.role
        }, 'Customer registered successfully'));
    } else {
        res.status(400);
        throw new Error('Invalid customer data');
    }
});

const loginCustomer = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    const customer = await Customer.findOne({ email });
    if (!customer) {
        res.status(400);
        throw new Error('Invalid email or password');
    }

    const isMatch = await customer.matchPassword(password);
    if (!isMatch) {
        res.status(400);
        throw new Error('Invalid email or password');
    }

    res.json(formatResponse(true, {
        _id: customer._id,
        full_name: customer.full_name,
        email: customer.email,
        role: customer.role
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

    if (customer) {
        customer.full_name = req.body.full_name || customer.full_name;
        customer.email = req.body.email || customer.email;
        customer.phone = req.body.phone || customer.phone;
        customer.address = req.body.address || customer.address;

        if (req.body.password) {
            customer.password = req.body.password;
        }

        const updatedCustomer = await customer.save();

        res.json(formatResponse(true, {
            _id: updatedCustomer._id,
            full_name: updatedCustomer.full_name,
            email: updatedCustomer.email,
            phone: updatedCustomer.phone,
            address: updatedCustomer.address
        }, 'Profile updated successfully'));
    } else {
        res.status(404);
        throw new Error('Customer not found');
    }
});

module.exports = {
    CustomerController: {
        registerCustomer,
        loginCustomer,
        registerStore,
        getCustomerProfile,
        updateCustomerProfile
    }
}; 