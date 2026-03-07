import api from "./api";

export const getAllReturns = () => api.get("/returns").then(r => r.data);
export const getReturnsBySale = (saleId) => api.get(`/returns/sale/${saleId}`).then(r => r.data);
export const createReturn = (data) => api.post("/returns", data).then(r => r.data);