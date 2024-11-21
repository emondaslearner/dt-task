const cloudinary = require("cloudinary");

cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

const uploadPhotoToCloudinary = async ({
  imagePath,
  folderName,
  unique_filename,
  use_filename,
  overwrite,
}) => {
  try {
    const options = {
      folder: folderName,
      unique_filename,
      use_filename,
      overwrite,
    };

    const uploadResponse = await cloudinary.v2.uploader.upload(
      imagePath,
      options
    );
    return uploadResponse;
  } catch (error) {
    console.log('cloudinary error', error)
    throw error;
  }
};

module.exports = { uploadPhotoToCloudinary };
