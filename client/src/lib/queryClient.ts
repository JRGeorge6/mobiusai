import { QueryClient, QueryFunction } from "@tanstack/react-query";
import { getCsrfToken } from "./csrf";
import { isUnauthorizedError } from "./authUtils";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    let error: Error;
    try {
      const errorBody = await res.json();
      error = new Error(errorBody.message || "Something went wrong");
    } catch (e) {
      error = new Error("Something went wrong");
    }
    // You may want to augment the error object with status code
    // (error as any).status = res.status;
    throw error;
  }
  return res;
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };

  const csrfToken = getCsrfToken();
  if (csrfToken && !['GET', 'HEAD', 'OPTIONS'].includes(method.toUpperCase())) {
    headers['X-CSRF-Token'] = csrfToken;
  }

  const res = await fetch(url, {
    method,
    headers,
    body: data ? JSON.stringify(data) : undefined,
  });

  return throwIfResNotOk(res);
}

type UnauthorizedBehavior = "returnNull" | "throw";

export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const res = await apiRequest("GET", queryKey[0] as string);
    if (!res.ok) {
      if (res.status === 401) {
        if (unauthorizedBehavior === "throw") {
          throw new Error("Unauthorized");
        }
        return null;
      }
      throw new Error("Request failed");
    }
    return res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      staleTime: 1000 * 60, // 1 minute
      retry: (failureCount, error) => {
        if (isUnauthorizedError(error as Error)) {
          return false;
        }
        return failureCount < 3;
      },
    },
  },
}); 