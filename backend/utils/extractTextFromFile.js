const path = require("path");
const pdfParse = require("pdf-parse");

const cleanText = (text) =>
  text
    .replace(/\r\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]{2,}/g, " ")
    .trim();

const extractTextFromFile = async (file) => {
  if (!file) {
    throw new Error("File is required");
  }

  const ext = path.extname(file.originalname || "").toLowerCase();
  const mimeType = file.mimetype || "";

  if (mimeType === "application/pdf" || ext === ".pdf") {
    const parsed = await pdfParse(file.buffer);
    const text = cleanText(parsed.text || "");
    if (!text) {
      throw new Error("Could not extract text from the uploaded PDF");
    }
    return { text, fileType: "pdf" };
  }

  const isText = mimeType.startsWith("text/") || ext === ".txt" || ext === ".md";
  if (isText) {
    const text = cleanText(file.buffer.toString("utf-8"));
    if (!text) {
      throw new Error("The uploaded text file is empty");
    }
    return { text, fileType: "text" };
  }

  throw new Error("Unsupported file type. Upload PDF or text files only.");
};

module.exports = {
  extractTextFromFile
};
