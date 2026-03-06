import api from "./api";

export const getAllStaff = () => api.get("/users").then(r => r.data);
export const getStaffById = (id) => api.get(`/users/${id}`).then(r => r.data);
export const createStaff = (data) => api.post("/users", data).then(r => r.data);
export const updateStaff = (id, data) => api.put(`/users/${id}`, data).then(r => r.data);
export const toggleStaffStatus = (id) => api.patch(`/users/${id}/toggle-status`).then(r => r.data);
export const resetStaffPassword = (id, newPassword) =>
  api.patch(`/users/${id}/reset-password`, { new_password: newPassword }).then(r => r.data);