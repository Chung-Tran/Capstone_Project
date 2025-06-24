const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    product_code: {
        type: String,
        required: true,
    },
    store_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Store',
        required: true
    },
    category_id: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category'
    }],
    name: {
        type: String,
        required: true
    },
    description: String,
    price: {
        type: Number,
        required: true
    },
    specifications: String,
    price: {
        type: Number,
        required: true
    },
    original_price: Number,
    stock: {
        type: Number,
        default: 0
    },
    quantitySold: {
        type: Number,
        default: 0
    }, //SL Đã bán
    discount_percentage: Number,
    weight: Number,
    dimensions: {
        length: Number,
        width: Number,
        height: Number
    },
    tags: [String],
    main_image: String,
    additional_images: [String],
    status: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'active'
    },
    isTraceVerified: {
        type: Boolean,
        default: false,
    },
    traceHistories: [{
        cid: String,
        blockNumber: String
    }],
    colors: {
        type: [String],
        required: true
    },
    is_featured: {
        type: Boolean,
        default: false
    },
    slug: {
        type: String,
        unique: true,
    },
}, {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});
function removeVietnameseTones(str) {
    return str.normalize('NFD') // Tách ký tự và dấu
        .replace(/[\u0300-\u036f]/g, '') // Xóa dấu
        .replace(/đ/g, 'd') // Chuyển đ -> d
        .replace(/Đ/g, 'D'); // Chuyển Đ -> D
}

function generateSlug(name) {
    return removeVietnameseTones(name)
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, '') // Loại bỏ ký tự đặc biệt
        .replace(/\s+/g, '-') // Thay khoảng trắng bằng dấu gạch ngang
        .replace(/-+/g, '-'); // Gộp nhiều dấu gạch ngang thành một
}

// Pre-save hook to generate slug
productSchema.pre('save', async function (next) {
    if (this.isModified('name') || !this.slug) {
        let slug = generateSlug(this.name);
        let count = 0;
        let uniqueSlug = slug;

        // Check for existing slugs and append number if necessary
        while (await mongoose.models.Product.findOne({ slug: uniqueSlug })) {
            count++;
            uniqueSlug = `${slug}-${count}`;
        }
        this.slug = uniqueSlug;
    }
    next();
});
module.exports = mongoose.model('Product', productSchema);