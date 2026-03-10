import api from "./axios";

export const getStocks = () => api.get("/stocks");
export const getStockById = (id) => api.get(`/stocks/${id}`);
export const createStock = (data) => api.post("/stocks", data);
export const updateStock = (id, data) => api.put(`/stocks/${id}`, data);
export const deleteStock = (id) => api.delete(`/stocks/${id}`);