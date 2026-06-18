const multer = require("multer");

/* -----------------------------
   STORAGE CONFIG
----------------------------- */
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },

  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

/* -----------------------------
   FILE FILTER
----------------------------- */
const fileFilter = (req, file, cb) => {
  cb(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
});

/* -----------------------------
   PROFILE PHOTO
----------------------------- */
const uploadSingleProfilePhoto =
  upload.single("profilePhoto");

/* -----------------------------
   LEAVE ATTACHMENTS
----------------------------- */
const uploadLeaveAttachments =
  upload.array("attachments", 5);

/* -----------------------------
   PROJECT DOCUMENTS
----------------------------- */
const uploadProjectDocuments =
  upload.array("documents", 10);

module.exports = {
  uploadSingleProfilePhoto,
  uploadLeaveAttachments,
  uploadProjectDocuments,
};