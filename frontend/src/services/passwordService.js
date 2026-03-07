import api from "./api";

export const changePassword = (data) => api.post("/password/change", data).then(r => r.data);

export const forgotPasswordRequest = (data) =>
  api.post("/password/forgot-request", data).then(r => r.data);

export const getResetRequests = () =>
  api.get("/password/reset-requests").then(r => r.data);

export const adminResetPassword = (data) =>
  api.post("/password/reset-by-admin", data).then(r => r.data);