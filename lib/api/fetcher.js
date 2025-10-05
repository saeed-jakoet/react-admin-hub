import axios from "axios";

const BASEURL = process.env.NEXT_PUBLIC_BASEURL;

// Create axios instance
const axiosInstance = axios.create({
  baseURL: BASEURL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * Base fetcher utility for API calls with automatic token refresh
 */
export async function fetcher(endpoint, options = {}) {
  if (!BASEURL) {
    throw new Error(
      "API base URL is not configured. Please set NEXT_PUBLIC_BASEURL in your environment variables."
    );
  }

  const config = {
    url: endpoint,
    method: options.method || "GET",
    headers: {
      ...options.headers,
    },
    ...options,
  };

  // Handle request body
  if (options.body) {
    config.data = options.body;
  }

  try {
    const response = await axiosInstance(config);
    return response.data;
  } catch (error) {
    // If 401, try to refresh token
    if (error.response?.status === 401 && !options._retry) {
      try {
        await axiosInstance.post("/refresh/refresh-token");

        // Retry original request with refreshed token
        return fetcher(endpoint, { ...options, _retry: true });
      } catch (refreshError) {
        if (typeof window !== "undefined") {
          window.location.href = "/auth/login";
        }
        throw new Error("Session expired. Please login again.");
      }
    }

    // Handle axios error response
    const message =
      error.response?.data?.message || error.message || "API request failed";
    throw new Error(message);
  }
}

/**
 * GET request
 */
export async function get(endpoint, options = {}) {
  return fetcher(endpoint, {
    method: "GET",
    ...options,
  });
}

/**
 * POST request
 */
export async function post(endpoint, body, options = {}) {
  return fetcher(endpoint, {
    method: "POST",
    body: body,
    ...options,
  });
}

/**
 * PUT request
 */
export async function put(endpoint, body, options = {}) {
  return fetcher(endpoint, {
    method: "PUT",
    body: body,
    ...options,
  });
}

/**
 * DELETE request
 */
export async function del(endpoint, options = {}) {
  return fetcher(endpoint, {
    method: "DELETE",
    ...options,
  });
}
