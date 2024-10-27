import Cookies from "js-cookie";
import { env } from "next-runtime-env";

export async function apiFetch(path: string, options: RequestInit = {}) {
  const NEXT_PUBLIC_API_ENDPOINT = env("NEXT_PUBLIC_API_ENDPOINT");

  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  };

  const csrfToken = Cookies.get("csrf_token");
  if (csrfToken) {
    headers["X-CSRF-Token"] = csrfToken;
  }

  const response = await fetch(`${NEXT_PUBLIC_API_ENDPOINT}${path}`, {
    headers,
    ...options,
    credentials: "include",
  });

  if (!response.ok) {
    const responseData = await response.json();
    throw new Error(responseData.error);
  }

  return response;
}
