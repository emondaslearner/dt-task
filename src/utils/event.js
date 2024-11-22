const { uploadPhotoToCloudinary } = require("@src/third-party/cloudinary");
const error = require("./error");

const validateEvent = (data) => {
  const {
    type,
    uid,
    name,
    tagline,
    schedule,
    description,
    moderator,
    category,
    sub_category,
    rigor_rank,
    attendees,
  } = data;

  if (!type)
    throw error.badRequest("Type is required");
  if (!uid) throw error.badRequest("User ID (uid) is required");
  if (!name || typeof name !== "string" || name.trim().length === 0)
    throw error.badRequest("Event name is required.");
  if (!tagline || typeof tagline !== "string" || tagline.trim().length === 0)
    throw error.badRequest("Tagline is required.");
  if (!schedule || isNaN(new Date(schedule)))
    throw error.badRequest("Schedule must be a valid date and time.");
  if (
    !description ||
    typeof description !== "string" ||
    description.trim().length === 0
  )
    throw error.badRequest("Description is required.");
  if (
    !moderator ||
    typeof moderator !== "string" ||
    moderator.trim().length === 0
  )
    throw error.badRequest("Moderator is required.");
  if (!category || typeof category !== "string" || category.trim().length === 0)
    throw error.badRequest("Category is required.");
  if (
    !sub_category ||
    typeof sub_category !== "string" ||
    sub_category.trim().length === 0
  )
    throw error.badRequest("Sub-category is required.");
  if (!rigor_rank || typeof rigor_rank !== "number")
    throw error.badRequest("Rigor rank is required and must be a number.");
  if (!Array.isArray(attendees))
    throw error.badRequest("Attendees must be an array of user IDs.");
};

const checkFileAndUpload = async (files) => {
  const images = [];
  if (files?.length) {
    for (let i = 0; i < files.length; i++) {
      const singleFileData = files[i];
      console.log("singleFileData", singleFileData);

      const pictureData = await uploadPhotoToCloudinary({
        imagePath: `${__dirname}../../../src/uploads/${singleFileData.originalname}`,
        folderName: `dt-task`,
        unique_filename: true,
        use_filename: false,
        overwrite: false,
      });

      images.push(pictureData.secure_url);
    }
  }

  return images;
};

module.exports = {
  validateEvent,
  checkFileAndUpload,
};
