const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const productSchema = new mongoose.Schema({
    productname: {
        type: String,
        required: [true, 'Product name is required'],
        trim: true,
    },

});

module.exports = mongoose.model('Product', productSchema);