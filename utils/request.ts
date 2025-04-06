import axios from "axios";

const API_URL = "http://localhost:3000/request/";

export const fetchRequests = async (token: string) => {
  if (!token) throw new Error("Authentication token is missing.");
  const response = await axios.get(API_URL, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const addRequest = async (token: string, newRequest: any) => {
  if (!token) throw new Error("Authentication token is missing.");
  const response = await axios.post(API_URL, newRequest, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const updateRequestStatus = async (
  token: string,
  requestId: string,
  status: string
) => {
  if (!token) throw new Error("Authentication token is missing.");
  await axios.patch(
    `${API_URL}${requestId}`,
    { status },
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
};

export const checkPendingRequests = async (token: string) => {
    if (!token) throw new Error("Authentication token is missing.");
    const response = await axios.get(`${API_URL}check`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
    }