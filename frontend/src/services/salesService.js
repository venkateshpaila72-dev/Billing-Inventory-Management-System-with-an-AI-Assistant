import api from "./api";

export const getAllSales = () => api.get("/sales").then(r => r.data);
export const getSaleById = (id) => api.get(`/sales/${id}`).then(r => r.data);
export const getMySales = () => api.get("/sales/my").then(r => r.data);
export const createSale = (data) => api.post("/sales", data).then(r => r.data);