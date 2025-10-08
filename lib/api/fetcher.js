import axios from "axios";

const BASEURL = process.env.NEXT_PUBLIC_BASEURL;

// Create axios instance
// Do NOT set a default Content-Type here. For FormData requests, axios must set
// `multipart/form-data; boundary=...` automatically, and a global header breaks that.
export const axiosInstance = axios.create({
  baseURL: BASEURL,
  withCredentials: true,
});

// Centralized 401 handling with refresh queue to avoid flashes of auth errors
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else resolve();
  });
  failedQueue = [];
};

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config || {};
    const status = error.response?.status;
    const url = originalRequest.url || "";
    const message = (error.response?.data?.message || "").toString();
    const dataString = (() => {
      const d = error.response?.data;
      if (!d) return "";
      if (typeof d === "string") return d;
      try { return JSON.stringify(d); } catch { return ""; }
    })();

    const isRefreshUrl = (u) => {
      try {
        const full = new URL(u, BASEURL || "http://local");
        return full.pathname.startsWith("/refresh/");
      } catch {
        return (u || "").includes("/refresh/");
      }
    };

    const looksLikeExpiredToken =
      status === 401 || /(jwt|token)\s*expired/i.test(message) || /(jwt|token)\s*expired/i.test(dataString);

    // If unauthorized and not already retried and not the refresh endpoint itself
    if (looksLikeExpiredToken && !originalRequest._retry && !isRefreshUrl(url)) {
      if (isRefreshing) {
        // Queue the request until refresh completes
        return new Promise((resolve, reject) => {
          // Guard against unbounded queue growth
          if (failedQueue.length > 100) {
            return reject(new Error("Too many pending requests during auth refresh."));
          }
          failedQueue.push({ resolve, reject });
        })
          .then(() => axiosInstance(originalRequest))
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        await axiosInstance.post("/refresh/refresh-token");
        processQueue(null);
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError);
        // If refresh fails, force redirect to login silently
        if (typeof window !== "undefined") {
          window.location.href = "/auth/login";
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

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
