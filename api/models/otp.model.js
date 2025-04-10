const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true
    },
    otp: {
        type: String,
        required: true
    },
    typeOtp: {
        type: String,
        required: true,
        enum: ['email', 'password_reset', 'phone_verification'] // Add more types as needed
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 300 // Document will be automatically deleted after 5 minutes
    }
});

module.exports = mongoose.model('OTP', otpSchema); 