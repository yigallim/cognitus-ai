import api from "@/lib/api";

export const uploadFile = async (file: File) => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await api.post("/files/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

export const fetchFiles = async () => {
  const response = await api.get("/files");
  return response.data;
};

export const deleteFile = async (fileId: string) => {
  const response = await api.delete(`/files/${fileId}`);
  return response.data;
};

export const downloadFile = async (fileId: string) => {
  const response = await api.get(`/files/${fileId}/download`, {
    responseType: "blob",
  });
  return response.data;
};
