const cloudinary = require('../config/cloudinary');
const fs = require('fs');

const uploadImage = async (files) => {

    const uploadSingle = async (file) => {
        try {
            const result = await cloudinary.uploader.upload(file.path, {
                folder: 'mall',
                use_filename: true,
            });
            // fs.unlinkSync(file.path); // Xóa file local sau khi upload
            return result.secure_url;
        } catch (error) {
            console.error('Error uploading to cloudinary:', error);
            throw new Error('Failed to upload image');
        }
    };

    // Nếu là mảng => map từng file
    if (Array.isArray(files)) {
        return await Promise.all(files.map(uploadSingle));
    } else {
        return await uploadSingle(files);
    }
};

module.exports = {
    uploadImage
};
