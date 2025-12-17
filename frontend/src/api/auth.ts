import api from "@/lib/api";

export const login = async (credentials: any) => {
  const response = await api.post("/auth/login", credentials);
  return response.data;
};

export const logout = async () => {
  const response = await api.post("/auth/logout");
  return response.data;
};

export const getCurrentUser = async () => {
  const response = await api.get("/auth/me");
  return response.data;
};

export const refreshToken = async () => {
  const response = await api.post("/auth/refresh");
  return response.data;
};
