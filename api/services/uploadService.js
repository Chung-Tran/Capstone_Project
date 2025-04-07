const cloudinary = require('../config/cloudinary');

const uploadImage = async (file) => {
    try {
        const result = await cloudinary.uploader.upload(file.path, {
            folder: 'mall',
            use_filename: true
        });
        return result.secure_url;
    } catch (error) {
        console.error('Error uploading to cloudinary:', error);
        throw new Error('Failed to upload image');
    }
};

module.exports = {
    uploadImage
}; 