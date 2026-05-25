import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND;

// Helper function to get headers with the authorization token
const getHeaders = () => {
  const token = localStorage.getItem("auth_token");
  if (!token) throw new Error("Authentication token is missing.");
  return {
    Authorization: `Bearer ${token}`,
  };
};

// Search for medicines
export const searchMedicines = async (query: string, source: string = "mediq") => {
  if (!query || query.trim().length < 3) {
    return [];
  }

  const response = await axios.get(`${API_BASE_URL}/search`, {
    params: { query, source },
    headers: getHeaders(),
  });
  return response.data;
};

// Add a new order
export const addOrder = async (orderPayload: {
  seller: string;
  medicines: {
    medicine_id: string;
    quantity: number;
    expiry: string;
    price: number;
    type: string;
  }[];
  totalItems: number;
  orderDate: string;
  remarks: string;
}) => {
  const response = await axios.post(`${API_BASE_URL}/order`, orderPayload, {
    headers: getHeaders(),
  });
  return response.data;
};

// Fetch inventory
export const fetchInventory = async () => {
  const response = await axios.get(`${API_BASE_URL}/inventory/`, {
    headers: getHeaders(),
  });
  const data = response.data;
  const updatedData = data.map((item: { expiryDate: string }) => {
    const expiryDate = new Date(item.expiryDate);
    const today = new Date();
    const remainingDays = Math.ceil(
      (expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );
    return { ...item, remainingDays };
  });
  return updatedData;
};

// Add inventory
export const addInventory = async (inventoryPayload: {
  medicine: string;
  quantity: number;
  expiryDate: string;
}) => {
  const response = await axios.post(`${API_BASE_URL}/inventory/`, inventoryPayload, {
    headers: getHeaders(),
  });
  return response.data;
};

// Update inventory
export const updateInventory = async (id: string, updatePayload: { quantity: number; expiryDate: string }) => {
  const response = await axios.put(`${API_BASE_URL}/inventory/${id}`, updatePayload, {
    headers: getHeaders(),
  });
  return response.data;
};

export const deleteInventory = async (id: string) => {
  const response = await axios.delete(`${API_BASE_URL}/inventory/${id}`, {
    headers: getHeaders(),
  });
  return response.data;
};

// Add a customer B2C order
export const createCustomerOrder = async (orderPayload: {
  store: string;
  medicines: {
    medicine_id: string;
    quantity: number;
    expiry: string;
    price: number;
  }[];
  totalItems: number;
  remarks: string;
}) => {
  const response = await axios.post(`${API_BASE_URL}/order/customer`, orderPayload, {
    headers: getHeaders(),
  });
  return response.data;
};

// Fetch customer B2C orders (either for customer or store owner)
export const fetchCustomerOrders = async () => {
  const response = await axios.get(`${API_BASE_URL}/order/customer`, {
    headers: getHeaders(),
  });
  return response.data;
};

