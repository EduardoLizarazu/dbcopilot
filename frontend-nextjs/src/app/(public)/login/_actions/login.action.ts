"use server";
import axios from "axios";
import dotenv from "dotenv";
import Cookies from "js-cookie";

dotenv.config();

const URL = process.env.API_URL;
const COOKIE_NAME: string = process.env.COOKIE_NAME || "default_cookie_name";

interface LoginResponse {
  token: string;
}

export async function login(email: string, password: string): Promise<string> {
  try {
    const response = await axios.post<LoginResponse>(`${URL}/api/auth/login`, {
      email,
      password,
    });

    if (response.status === 200) {
      const token = response.data.token;
      Cookies.set(COOKIE_NAME, token, { expires: 1, path: "/" }); // Save the token in a cookie
      return token;
    } else {
      throw new Error("Authentication failed");
    }
  } catch (error) {
    console.error("Login error:", error);
    throw new Error("Login failed");
  }
}
