const uploadService = {
    // Upload lên Cloudinary
    uploadToCloudinary: async (file) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', 'unsigned_preset'); // Cần config trong Cloudinary

        const response = await fetch(
            `https://api.cloudinary.com/v1_1/dttiea5rj/image/upload`, // Thay your_cloud_name
            {
                method: 'POST',
                body: formData,
            }
        );

        const data = await response.json();
        if (data.error) {
            throw new Error(data.error.message);
        }

        return data.secure_url;
    },

};
export default uploadService
