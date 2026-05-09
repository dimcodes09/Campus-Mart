import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

export const getVerifications = () => api.get("/admin/verifications");
export const approveVerification = (id) => api.patch(`/admin/verify/${id}`);
export const rejectVerification = (id) => api.patch(`/admin/reject/${id}`);
export const submitStudentVerification = (studentIdImage) =>
  api.post("/auth/verify-student", { studentIdImage });

export default api;
