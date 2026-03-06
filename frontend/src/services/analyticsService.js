import api from "./api";

export const getDashboard = () => api.get("/analytics/dashboard").then(r => r.data);
export const getRevenue = (period) => api.get(`/analytics/revenue?period=${period}`).then(r => r.data);
export const getTopProducts = (limit = 5) => api.get(`/analytics/top-products?limit=${limit}`).then(r => r.data);
export const getTopStaff = (limit = 5) => api.get(`/analytics/top-staff?limit=${limit}`).then(r => r.data);
export const getProfit = (period) => api.get(`/analytics/profit?period=${period}`).then(r => r.data);