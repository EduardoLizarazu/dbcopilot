"use server";
import axios from "axios";
import dotenv from "dotenv";
import Cookies from "js-cookie";

dotenv.config();

const URL = process.env.BASE_URL;
const COOKIE_NAME: string = process.env.COOKIE_NAME || "default_cookie_name";

interface LoginResponse {
  access_token: string;
}

export async function login(email: string, password: string): Promise<string> {
  try {
    const username = email;
    const response = await axios.post<LoginResponse>(`${URL}/auth/login`, {
      username,
      password,
    });

    console.log("login.action", response.data.access_token);

    if (response.status === 201) {
      const access_token = response.data.access_token;
      Cookies.set(COOKIE_NAME, access_token, { expires: 1, path: "/" }); // Save the access_token in a cookie
      return access_token;
    } else {
      throw new Error("Authentication failed");
    }
  } catch (error) {
    console.error("Login error:", error);
    throw new Error("Login failed");
  }
}
