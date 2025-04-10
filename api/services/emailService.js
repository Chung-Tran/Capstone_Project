require('dotenv').config();
const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

// Create transporter
const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    }
});

// Read email template
const getEmailTemplate = (templateName) => {
    const templatePath = path.join(__dirname, '..', 'templates', `${templateName}.html`);
    return fs.readFileSync(templatePath, 'utf8');
};

// Send OTP email
const sendOTPEmail = async (email, otp) => {
    const template = getEmailTemplate('otpEmail');
    const htmlContent = template.replace('{{otp}}', otp);

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Capstone Mall - OTP Verification',
        html: htmlContent
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent:', info.response);
        return true;
    } catch (error) {
        console.error('Error sending email:', error);
        return false;
    }
};

module.exports = {
    sendOTPEmail
}; 