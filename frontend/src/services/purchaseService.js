import api from "./api";

export const getAllPurchases = () => api.get("/purchases").then(r => r.data);
export const getPurchaseById = (id) => api.get(`/purchases/${id}`).then(r => r.data);
export const createPurchase = (data) => api.post("/purchases", data).then(r => r.data);