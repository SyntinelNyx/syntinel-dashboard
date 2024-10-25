import Cookies from "js-cookie";

export async function apiFetch(path: string, options: RequestInit = {}) {
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  };

  const csrfToken = Cookies.get("csrf_token");
  if (csrfToken) {
    headers["X-CSRF-Token"] = csrfToken;
  }

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_ENDPOINT}${path}`,
    {
      headers,
      ...options,
      credentials: "include",
    },
  );

  if (!response.ok) {
    const responseData = await response.json();
    throw new Error(responseData.error);
  }

  return response;
}
