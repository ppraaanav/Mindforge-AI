const express = require("express");
const multer = require("multer");
const {
  uploadDocument,
  getDocuments,
  getDocumentById
} = require("../controllers/documentController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

const storage = multer.memoryStorage();
const allowedMimeTypes = ["application/pdf", "text/plain", "text/markdown"];

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024
  },
  fileFilter: (req, file, cb) => {
    const isTxtByExt = /\.(txt|md)$/i.test(file.originalname || "");
    if (allowedMimeTypes.includes(file.mimetype) || isTxtByExt) {
      cb(null, true);
      return;
    }
    cb(new Error("Only PDF and text files are allowed"));
  }
});

router.post("/", protect, upload.single("file"), uploadDocument);
router.get("/", protect, getDocuments);
router.get("/:id", protect, getDocumentById);

module.exports = router;
