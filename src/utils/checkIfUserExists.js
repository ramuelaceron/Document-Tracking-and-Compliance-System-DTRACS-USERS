import api from "../api/axios";

// ✅ Check if user already exists (either school or office)
export const checkIfUserExists = async (email) => {
  try {
    const response = await api.get(`/account/check-email?email=${email}`);
    return response.data.exists; // backend should return { exists: true/false }
  } catch (error) {
    console.error("❌ Error checking email existence:", error);
    return false; // fallback: assume doesn't exist if error
  }
};
