import axios from "axios";
import { server } from "../components/server";

interface UserResponse {
  success: boolean;
  user: {
    role: string;
  };
}

export const getUserRole = async (): Promise<string | null> => {
  try {
    const token = localStorage.getItem("creditseaid");
    if (!token) {
      console.error("No token found in localStorage");
      return null;
    }

    const { data } = await axios.get<UserResponse>(`${server}/user/userdetails`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    return data?.user?.role || null;
  } catch (error) {
    console.error("Error fetching user role:", error);
    return null;
  }
};
