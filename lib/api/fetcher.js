const BASEURL = process.env.NEXT_PUBLIC_BASEURL;

/**
 * Base fetcher utility for API calls
 */
export async function fetcher(endpoint, options = {}) {
  if (!BASEURL) {
    throw new Error('API base URL is not configured. Please set NEXT_PUBLIC_BASEURL in your environment variables.');
  }

  const url = `${BASEURL}${endpoint}`;

  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    credentials: 'include',
    ...options,
  };

  try {
    const response = await fetch(url, config);

    // Check if response is JSON before parsing
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text();
      throw new Error(`Expected JSON response but got ${contentType}. Response: ${text.substring(0, 100)}`);
    }

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'API request failed');
    }

    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

/**
 * GET request
 */
export async function get(endpoint, options = {}) {
  return fetcher(endpoint, {
    method: 'GET',
    ...options,
  });
}

/**
 * POST request
 */
export async function post(endpoint, body, options = {}) {
  return fetcher(endpoint, {
    method: 'POST',
    body: JSON.stringify(body),
    ...options,
  });
}

/**
 * PUT request
 */
export async function put(endpoint, body, options = {}) {
  return fetcher(endpoint, {
    method: 'PUT',
    body: JSON.stringify(body),
    ...options,
  });
}

/**
 * DELETE request
 */
export async function del(endpoint, options = {}) {
  return fetcher(endpoint, {
    method: 'DELETE',
    ...options,
  });
}
