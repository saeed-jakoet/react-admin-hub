const BASEURL = process.env.NEXT_PUBLIC_BASEURL;

/**
 * Base fetcher utility for API calls with automatic token refresh
 */
export async function fetcher(endpoint, options = {}) {
  if (!BASEURL) {
    throw new Error(
      "API base URL is not configured. Please set NEXT_PUBLIC_BASEURL in your environment variables."
    );
  }

  const url = `${BASEURL}${endpoint}`;

  const config = {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    credentials: "include",
    ...options,
  };

  try {
    const response = await fetch(url, config);

    // If 401, try to refresh token
    if (response.status === 401 && !options._retry) {
      try {
        const refreshResponse = await fetch(
          `${BASEURL}/refresh/refresh-token`,
          {
            method: "POST",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (refreshResponse.ok) {
          // Retry original request with refreshed token
          return fetcher(endpoint, { ...options, _retry: true });
        } else {
          // Refresh failed, redirect to login
          if (typeof window !== "undefined") {
            window.location.href = "/auth/login";
          }
          throw new Error("Session expired. Please login again.");
        }
      } catch (refreshError) {
        if (typeof window !== "undefined") {
          window.location.href = "/auth/login";
        }
        throw new Error("Session expired. Please login again.");
      }
    }

    // Check if response is JSON before parsing
    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      const text = await response.text();
      throw new Error(
        `Expected JSON response but got ${contentType}. Response: ${text.substring(
          0,
          100
        )}`
      );
    }

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "API request failed");
    }

    return data;
  } catch (error) {
    throw error;
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
    body: JSON.stringify(body),
    ...options,
  });
}

/**
 * PUT request
 */
export async function put(endpoint, body, options = {}) {
  return fetcher(endpoint, {
    method: "PUT",
    body: JSON.stringify(body),
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
