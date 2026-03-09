import { v2 as cloudinary } from 'cloudinary';

/**
 * Uploads an image buffer to Cloudinary and returns the secure URL.
 * @param {Buffer} buffer - The file buffer from multer.
 * @param {string} folder - The Cloudinary folder name.
 * @returns {Promise<string>} The secure URL of the uploaded image.
 */
export const uploadToCloudinary = (buffer, folder = 'chat-app') => {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            {
                folder,
                resource_type: 'image',
                allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
            },
            (error, result) => {
                if (result) resolve(result.secure_url);
                else reject(error);
            }
        );
        stream.end(buffer);
    });
};

/**
 * Uploads a file (PDF, doc, etc.) to Cloudinary and returns file info.
 * @param {Buffer} buffer - The file buffer from multer.
 * @param {string} originalName - The original filename.
 * @param {string} folder - The Cloudinary folder name.
 * @returns {Promise<{url: string, name: string, size: number}>}
 */
export const uploadFileToCloudinary = (buffer, originalName, folder = 'chat-app/files') => {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            {
                folder,
                resource_type: 'raw',
                public_id: originalName.replace(/\.[^/.]+$/, ''), // strip extension for public_id
            },
            (error, result) => {
                if (result) {
                    resolve({
                        url: result.secure_url,
                        name: originalName,
                        size: result.bytes,
                    });
                } else reject(error);
            }
        );
        stream.end(buffer);
    });
};

export default uploadToCloudinary;
