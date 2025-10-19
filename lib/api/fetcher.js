import axios from "axios";

// Point client to Next.js BFF proxy. It will forward to the Hono API server-side
const BASEURL = "/api/bff";

// CSRF expiration handler - to be set by the app
let csrfExpirationHandler = null;

export function setCsrfExpirationHandler(handler) {
  csrfExpirationHandler = handler;
}

// Create axios instance
// Do NOT set a default Content-Type here. For FormData requests, axios must set
// `multipart/form-data; boundary=...` automatically, and a global header breaks that.
export const axiosInstance = axios.create({
  baseURL: BASEURL,
  withCredentials: true,
});

// Attach CSRF token header for state-changing requests
axiosInstance.interceptors.request.use((config) => {
  try {
    const method = (config.method || "get").toLowerCase();
    if (["post", "put", "patch", "delete"].includes(method)) {
      const csrfCookie = document.cookie
        .split("; ")
        .find((row) => row.startsWith("csrfToken="));
      if (csrfCookie) {
        const token = csrfCookie.split("=")[1];
        if (token) {
          config.headers = config.headers || {};
          config.headers["x-csrf-token"] = token;
        }
      }
    }
  } catch {}
  return config;
});

// Let the BFF handle 401->refresh->retry. Handle CSRF errors specially.
axiosInstance.interceptors.response.use(
  (r) => r,
  (e) => {
    // Check if it's a CSRF token error (403 with invalid CSRF message)
    if (
      e?.response?.status === 403 &&
      e?.response?.data?.message?.toLowerCase().includes("csrf")
    ) {
      // Trigger the CSRF expiration handler if set
      if (csrfExpirationHandler) {
        csrfExpirationHandler();
      }
    }
    return Promise.reject(e);
  }
);

/**
 * Base fetcher utility for API calls with automatic token refresh
 */
export async function fetcher(endpoint, options = {}) {
  // BASEURL is our local BFF route; no env needed client-side

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

    // If sending FormData, do NOT set Content-Type. Axios will set the correct
    // multipart/form-data with boundary automatically.
    if (options.body instanceof FormData) {
      if (config.headers) {
        delete config.headers["Content-Type"];
      }
    } else {
      // For JSON payloads, explicitly set Content-Type if not already provided
      config.headers = {
        "Content-Type": "application/json",
        ...(config.headers || {}),
      };
    }
  }

  try {
    const response = await axiosInstance(config);
    return response.data;
  } catch (error) {
    // Let interceptor handle 401 refresh; only surface a clean message otherwise
    const message =
      error?.response?.data?.message || error?.message || "API request failed";
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
