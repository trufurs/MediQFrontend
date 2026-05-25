import axios from "axios";

const API_URL = `${process.env.NEXT_PUBLIC_BACKEND}/request/`;

export const fetchRequests = async (token: string) => {
  if (!token) throw new Error("Authentication token is missing.");
  const response = await axios.get(API_URL, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const addRequest = async (token: string, newRequest: any) => {
  if (!token) throw new Error("Authentication token is missing.");
  const data = {
    owner: newRequest.owner,
    name: newRequest.name,
    licenseNumber: newRequest.licenseNumber,
    contact: newRequest.contact,
    address: {
      latitude: newRequest.address.latitude,
      longitude: newRequest.address.longitude,
      street: newRequest.address.street,
      city: newRequest.address.city,
      state: newRequest.address.state,
      postalCode: newRequest.address.postalCode,
      country: newRequest.address.country,
    }
  }
  console.log("New Request:", data);
  const response = await axios.post(API_URL, data, {
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
  const data = {
    status: status,
    };
  await axios.put(
    `${API_URL}${requestId}`,
    data,
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

export const deleteRequest = async (token: string, requestId: string) => {
  if (!token) throw new Error("Authentication token is missing.");
  const response = await axios.delete(`${API_URL}${requestId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};