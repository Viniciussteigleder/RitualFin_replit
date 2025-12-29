import { QueryClient, QueryFunction } from "@tanstack/react-query";

/**
 * Get the base API URL from environment variable or default to same-origin
 * For development: API is on same server (relative URLs)
 * For production split deployment: API is on separate backend server
 * Robust handling of trailing slashes and /api suffix
 */
function getApiBaseUrl(): string {
  const envUrl = import.meta.env.VITE_API_URL;
  if (!envUrl) {
    return ""; // Development: use relative URLs
  }
  // Production: remove trailing slash for consistent URL building
  return envUrl.replace(/\/+$/, "");
}

/**
 * Construct full API URL from relative path
 * Handles both absolute URLs and relative paths correctly
 */
function getApiUrl(path: string): string {
  const base = getApiBaseUrl();
  // If path already starts with http:// or https://, return as-is
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }
  // Ensure path starts with /
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return base + normalizedPath;
}

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  const res = await fetch(getApiUrl(url), {
    method,
    headers: data ? { "Content-Type": "application/json" } : {},
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const res = await fetch(getApiUrl(queryKey.join("/") as string), {
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
