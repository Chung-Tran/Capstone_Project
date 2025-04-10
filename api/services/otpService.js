const OTP = require('../models/otp.model');

const generateOTP = () => {
    // Generate 6 digit OTP
    return Math.floor(100000 + Math.random() * 900000).toString();
};

const createOTP = async (email, typeOtp = 'email') => {
    // Delete any existing OTP for this email and type
    await OTP.deleteMany({ email, typeOtp });

    // Generate new OTP
    const otp = generateOTP();

    // Save OTP to database
    await OTP.create({
        email,
        otp,
        typeOtp
    });

    return otp;
};

const verifyOTP = async (email, otp, typeOtp = 'email') => {
    const record = await OTP.findOne({
        email,
        otp,
        typeOtp
    });

    if (!record) {
        return false;
    }

    // Delete the OTP record after verification
    await OTP.deleteOne({ _id: record._id });

    return true;
};

module.exports = {
    createOTP,
    verifyOTP
}; 