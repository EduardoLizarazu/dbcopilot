"use server";
import axios from "axios";
import dotenv from "dotenv";
import Cookies from "js-cookie";

dotenv.config();

const URL = process.env.API_URL;
const COOKIE_NAME: string = process.env.COOKIE_NAME || "default_cookie_name";

interface SignupData {
  username: string;
  email: string;
  password: string;
}

interface SignupResponse {
  token: string;
}

export const signup = async (data: SignupData): Promise<SignupResponse> => {
  try {
    const response = await axios.post<SignupResponse>(
      `${URL}/api/signup`,
      data
    );
    const token = response.data.token;
    Cookies.set(COOKIE_NAME, token, { expires: 7 }); // Save the token in a cookie for 7 days
    return response.data;
  } catch (error) {
    console.error("Error during signup:", error);
    throw error;
  }
};
