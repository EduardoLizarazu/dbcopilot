"use server";
import axios from "axios";
import dotenv from "dotenv";
import { cookies } from "next/headers";

dotenv.config();

const URL = process.env.BASE_URL;
const COOKIE_NAME: string = process.env.COOKIE_NAME || "default_cookie_name";

interface LoginResponse {
  access_token: string;
}

export async function login(email: string, password: string) {
  try {
    const username = email;
    const response = await axios.post<LoginResponse>(`${URL}/auth/login`, {
      username,
      password,
    });

    console.log("login.action", response.data.access_token);

    const cookieStore = await cookies();

    if (response.status === 201) {
      const access_token = response.data.access_token;
      cookieStore.set(COOKIE_NAME, access_token, {
        httpOnly: true,
        sameSite: "lax",
        expires: 1,
        path: "/",
      });
    } else {
      throw new Error("Authentication failed");
    }

    if (!cookieStore.has(COOKIE_NAME)) throw new Error("Cookie not found");
  } catch (error) {
    console.error("Login error:", error);
    throw new Error("Login failed");
  }
}

export async function getAccessTokenServer(): Promise<string | null> {
  try {
    // Get the cookies instance for the current request
    const cookieStore = await cookies();

    // Retrieve the cookie by its name
    const accessTokenCookie = cookieStore.get(COOKIE_NAME);

    if (accessTokenCookie) {
      console.log(
        `Server: Retrieved cookie '${COOKIE_NAME}': ${accessTokenCookie.value.substring(0, 10)}...`
      );
      return accessTokenCookie.value;
    } else {
      console.log(`Server: Cookie '${COOKIE_NAME}' not found.`);
      return null;
    }
  } catch (error) {
    console.error("Server: Error retrieving cookie:", error);
    return null;
  }
}
