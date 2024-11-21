const multer = require("multer");
const { create, updateOrCreate, getSingle, getAll, deleteEvent } = require("../controller");
const path = require('path');

// multer upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./src/uploads/");
  },
  filename: (req, file, cb) => {
    const originalName = file.originalname;
    cb(null, originalName);
  },
});

// check file type
function checkFileType(file, cb) {
  // Allowed ext
  const filetypes = /jpeg|jpg|png|gif/;
  // Check ext
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  // Check mime
  const mimetype = filetypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    const error = new Error("Image not support at this version");
    error.status = 400;
    return cb(error, false);
  }
}

const upload = multer({
  storage: storage,
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  },
});

const uploadFields = upload.fields([
  { name: "images", maxCount: 10 }
]);

const EventRoutes = (router) => {
  router.route("/api/v3/app/events").post([uploadFields], create).get(getAll);

  router.route("/api/v3/app/event/:id").put([uploadFields], updateOrCreate).get(getSingle).delete(deleteEvent);
};

module.exports = EventRoutes;
