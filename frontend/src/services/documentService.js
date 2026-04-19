import api from "./api";

export const uploadDocument = async ({ title, file }) => {
  const formData = new FormData();
  formData.append("title", title);
  formData.append("file", file);

  const { data } = await api.post("/documents", formData, {
    headers: {
      "Content-Type": "multipart/form-data"
    }
  });

  return data;
};

export const fetchDocuments = async () => {
  const { data } = await api.get("/documents");
  return data;
};

export const fetchDocumentById = async (documentId) => {
  const { data } = await api.get(`/documents/${documentId}`);
  return data;
};
