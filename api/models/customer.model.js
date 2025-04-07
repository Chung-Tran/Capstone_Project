const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const customerSchema = new mongoose.Schema({
    customer_code: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    fullname: String,
    phone: String,
    address: String,
    role: {
        type: String,
        enum: ['seller', 'customer'],
        default: 'customer'
    },
    avatar: String,
    birth_date: Date,
    gender: {
        type: String,
        enum: ['male', 'female', 'other']
    },
    status: {
        type: String,
        enum: ['active', 'inactive', 'banned'],
        default: 'active'
    },
    is_verified: {
        type: Boolean,
        default: false
    },
    last_login: Date
}, {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

customerSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

customerSchema.methods.comparePassword = async function (password) {
    return await bcrypt.compare(password, this.password);
};

module.exports = mongoose.model('Customer', customerSchema); 