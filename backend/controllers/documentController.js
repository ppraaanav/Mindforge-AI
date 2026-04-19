const Document = require("../models/Document");
const asyncHandler = require("../utils/asyncHandler");
const { extractTextFromFile } = require("../utils/extractTextFromFile");

const uploadDocument = asyncHandler(async (req, res) => {
  if (!req.file) {
    res.status(400);
    throw new Error("Please upload a PDF or text file");
  }

  const { text, fileType } = await extractTextFromFile(req.file);

  if (text.length < 40) {
    res.status(400);
    throw new Error("The uploaded document has too little text to process");
  }

  const title = (req.body.title || req.file.originalname || "Untitled Document").trim();

  const document = await Document.create({
    user: req.user._id,
    title,
    originalName: req.file.originalname,
    fileType,
    mimeType: req.file.mimetype,
    fileSize: req.file.size,
    text,
    summaryPreview: text.slice(0, 220)
  });

  res.status(201).json({
    document: {
      id: document._id,
      title: document.title,
      originalName: document.originalName,
      fileType: document.fileType,
      fileSize: document.fileSize,
      summaryPreview: document.summaryPreview,
      createdAt: document.createdAt
    }
  });
});

const getDocuments = asyncHandler(async (req, res) => {
  const documents = await Document.find({ user: req.user._id })
    .select("title originalName fileType fileSize summaryPreview createdAt updatedAt")
    .sort({ createdAt: -1 });

  res.status(200).json({ documents });
});

const getDocumentById = asyncHandler(async (req, res) => {
  const document = await Document.findOne({ _id: req.params.id, user: req.user._id }).select(
    "title originalName fileType fileSize summaryPreview createdAt"
  );

  if (!document) {
    res.status(404);
    throw new Error("Document not found");
  }

  res.status(200).json({ document });
});

module.exports = {
  uploadDocument,
  getDocuments,
  getDocumentById
};
