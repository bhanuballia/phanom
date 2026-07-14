const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
require('dotenv').config();

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Create a multer storage engine for Cloudinary
 * @param {string} folderName - The folder in Cloudinary to store files
 * @param {Array<string>} [allowedFormats] - List of allowed file formats
 * @returns {CloudinaryStorage} - The multer storage engine
 */
const createStorage = (folderName, allowedFormats = ['jpg', 'jpeg', 'png', 'webp']) => {
    return new CloudinaryStorage({
        cloudinary: cloudinary,
        params: {
            folder: folderName,
            allowed_formats: allowedFormats,
            resource_type: 'auto', // Support PDF and other non-image files
        },
    });
};

module.exports = { cloudinary, createStorage };
