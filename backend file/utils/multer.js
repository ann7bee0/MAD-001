const multer = require('multer');
const path = require('path');

// Storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/media/');
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const filename = `${Date.now()}-${file.fieldname}${ext}`;
    cb(null, filename);
  }
});

// Allowed file types: image, video, pdf
const fileFilter = (req, file, cb) => {
  const allowed = ['.jpg', '.jpeg', '.png', '.mp4', '.mov', '.pdf'];
  const ext = path.extname(file.originalname).toLowerCase();

  if (allowed.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Only images, videos, and PDFs are allowed'), false);
  }
};

const upload = multer({ storage, fileFilter });

module.exports = upload;
