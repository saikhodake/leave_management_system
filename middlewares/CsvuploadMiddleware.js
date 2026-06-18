const multer = require("multer");

/* -----------------------------
   STORAGE
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
   CSV VALIDATION
----------------------------- */
const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === "text/csv" ||
    file.originalname.endsWith(".csv")
  ) {
    cb(null, true);
  } else {
    cb(new Error("Only CSV files allowed"), false);
  }
};

const csvUpload = multer({
  storage,
  fileFilter,
});

module.exports = csvUpload;