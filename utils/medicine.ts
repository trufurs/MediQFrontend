import axios from "axios";
const API_URL = `${process.env.NEXT_PUBLIC_BACKEND}/medicine/`;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const addMedicine = async (token: string, medicine: Record<string, any>) => {
  try {
    const response = await axios.post(
      `${API_URL}`, 
      medicine,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    return response.data; // Return the added medicine data
  } catch (error) {
    console.log("Error adding medicine:", error);
    throw error; // Rethrow the error to handle it in the calling function
  }
};