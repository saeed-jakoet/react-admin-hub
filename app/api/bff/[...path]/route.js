// BFF proxy: centralizes auth cookies (httpOnly) and auto-refresh on the server
// Proxies requests from the browser to the Hono API, attaching cookies and retrying on 401

import { cookies as nextCookies } from "next/headers";

const API_BASE = process.env.NEXT_PUBLIC_BASEURL; // Hono API origin

async function buildCookieHeaderFromNext() {
  const c = await nextCookies();
  const access = c.get("accessToken")?.value;
  const refresh = c.get("refreshToken")?.value;
  const csrf = c.get("csrfToken")?.value;
  const parts = [];
  if (access) parts.push(`accessToken=${access}`);
  if (refresh) parts.push(`refreshToken=${encodeURIComponent(refresh)}`);
  if (csrf) parts.push(`csrfToken=${csrf}`);
  return parts.join("; ");
}

async function setNextAuthCookies({ accessToken, refreshToken, csrfToken }) {
  const c = await nextCookies();
  if (accessToken) {
    c.set("accessToken", accessToken, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60,
      path: "/",
    });
  }
  if (refreshToken) {
    c.set("refreshToken", refreshToken, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });
  }
  if (csrfToken) {
    // Non-httpOnly so frontend can read and send x-csrf-token
    c.set("csrfToken", csrfToken, {
      httpOnly: false,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });
  }
}

async function tryServerRefresh() {
  // Call Hono refresh endpoint using the refreshToken from Next cookies
  const cookieHeader = await buildCookieHeaderFromNext();
  const res = await fetch(`${API_BASE}/refresh/refresh-token`, {
    method: "POST",
    headers: {
      Cookie: cookieHeader,
    },
    // Do not forward credentials from the browser; this is server-to-server
    cache: "no-store",
  });
  if (!res.ok) return { ok: false };
  const data = await res.json().catch(() => ({}));
  const accessToken = data?.data?.accessToken || data?.accessToken;
  const refreshToken = data?.data?.refreshToken || data?.refreshToken;
  if (!accessToken || !refreshToken) return { ok: false };
  await setNextAuthCookies({ accessToken, refreshToken });
  return { ok: true };
}

function normalizePathParam(param) {
  if (Array.isArray(param)) return param.join("/");
  return param || "";
}

async function proxy(method, req, ctx) {
  if (!API_BASE) {
    return new Response(
      JSON.stringify({ message: "API base URL not configured" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  // params is a Dynamic API in Next 15 and must be awaited
  const resolved = (ctx && ctx.params) ? await ctx.params : {};
  const path = normalizePathParam(resolved?.path);

  // Build target URL
  const url = new URL(`${API_BASE}/${path}`);
  const search = req.nextUrl?.search || "";
  if (search) {
    url.search = search;
  }

  // Build headers for upstream
  const incomingHeaders = new Headers(req.headers);
  // Remove hop-by-hop headers / host
  incomingHeaders.delete("host");
  incomingHeaders.delete("connection");
  incomingHeaders.delete("content-length");
  // Remove Accept-Encoding to prevent compressed responses that we can't easily forward
  incomingHeaders.delete("accept-encoding");
  
  // Add ngrok bypass header (for ngrok free tier during development)
  // Safe to keep in production - ignored by non-ngrok backends
  if (API_BASE?.includes("ngrok")) {
    incomingHeaders.set("ngrok-skip-browser-warning", "true");
  }
  
  // Ensure CSRF header is present for mutating requests
  const lowerMethod = method.toLowerCase();
  const isMutating = ["post", "put", "patch", "delete"].includes(lowerMethod);
  
  // Get CSRF token from server-side cookies
  const serverCookies = await nextCookies();
  const csrfToken = serverCookies.get("csrfToken")?.value;
  
  if (isMutating && !incomingHeaders.get("x-csrf-token") && csrfToken) {
    incomingHeaders.set("x-csrf-token", csrfToken);
  }
  
  // Use server-side Next.js cookies for all requests to Hono
  // This is crucial because cookies are now stored server-side, not in browser
  const serverCookieHeader = await buildCookieHeaderFromNext();
  if (serverCookieHeader) {
    incomingHeaders.set("Cookie", serverCookieHeader);
  }

  // Body handling
  let body = undefined;
  if (lowerMethod !== "get" && lowerMethod !== "head") {
    // Clone the stream into ArrayBuffer to forward
    body = await req.arrayBuffer();
  }

  // Special handling for auth/signin: we need to establish cookies on Next
  const isSignIn = path === "auth/signin" && lowerMethod === "post";
  if (isSignIn) {
    // Forward the credentials to Hono
    const signinRes = await fetch(url.toString(), {
      method,
      headers: incomingHeaders,
      body,
      cache: "no-store",
    });

    const resBody = await signinRes.text();
    const contentType = signinRes.headers.get("content-type") || "application/json";

    if (!signinRes.ok) {
      return new Response(resBody, { status: signinRes.status, headers: { "Content-Type": contentType } });
    }

    // Parse cookies from Hono and set them on the Next.js domain
    // This is crucial for cross-origin (localhost -> Render/Fly.io) to work
    const cookieStore = await nextCookies();
    const isProduction = process.env.NODE_ENV === "production";
    
    // Try multiple methods to get Set-Cookie headers (different Node/runtime versions handle this differently)
    let setCookieHeaders = [];
    
    // Method 1: getSetCookie() - standard way in newer Node versions
    if (typeof signinRes.headers.getSetCookie === 'function') {
      setCookieHeaders = signinRes.headers.getSetCookie();
    }
    
    // Method 2: Fallback - iterate through all headers
    if (setCookieHeaders.length === 0) {
      signinRes.headers.forEach((value, key) => {
        if (key.toLowerCase() === 'set-cookie') {
          setCookieHeaders.push(value);
        }
      });
    }
    
    // Method 3: Try raw header access
    if (setCookieHeaders.length === 0) {
      const rawSetCookie = signinRes.headers.get('set-cookie');
      if (rawSetCookie) {
        // Split on comma, but be careful with cookie date formats
        setCookieHeaders = rawSetCookie.split(/,(?=\s*[^;]+=[^;]+)/);
      }
    }
    
    for (const cookieHeader of setCookieHeaders) {
      const cookieParts = cookieHeader.split(";")[0];
      const eqIndex = cookieParts.indexOf("=");
      if (eqIndex === -1) continue;
      
      const cookieName = cookieParts.substring(0, eqIndex).trim();
      const cookieValue = cookieParts.substring(eqIndex + 1);
      
      if (cookieName === "accessToken" && cookieValue) {
        cookieStore.set("accessToken", cookieValue, {
          httpOnly: true,
          sameSite: "lax",
          secure: isProduction,
          maxAge: 60 * 60,
          path: "/",
        });
      } else if (cookieName === "refreshToken" && cookieValue) {
        cookieStore.set("refreshToken", cookieValue, {
          httpOnly: true,
          sameSite: "lax",
          secure: isProduction,
          maxAge: 60 * 60 * 24 * 7,
          path: "/",
        });
      } else if (cookieName === "csrfToken" && cookieValue) {
        cookieStore.set("csrfToken", cookieValue, {
          httpOnly: false,
          sameSite: "lax",
          secure: isProduction,
          maxAge: 60 * 60 * 24 * 7,
          path: "/",
        });
      }
    }

    // Return response without forwarding Hono's Set-Cookie headers
    // The cookies are now set on the Next.js domain via cookieStore
    return new Response(resBody, { status: signinRes.status, headers: { "Content-Type": contentType } });
  }

  // Special handling for logout: clear cookies on Next.js domain
  const isLogout = path === "auth/logout" && lowerMethod === "post";
  if (isLogout) {
    const loRes = await fetch(url.toString(), {
      method,
      headers: incomingHeaders,
      body,
      cache: "no-store",
    });
    const resBody = await loRes.text();
    const contentType = loRes.headers.get("content-type") || "application/json";
    
    // Clear cookies on the Next.js domain
    const cookieStore = await nextCookies();
    const isProduction = process.env.NODE_ENV === "production";
    
    cookieStore.set("accessToken", "", {
      httpOnly: true,
      sameSite: "lax",
      secure: isProduction,
      maxAge: 0,
      path: "/",
    });
    cookieStore.set("refreshToken", "", {
      httpOnly: true,
      sameSite: "lax",
      secure: isProduction,
      maxAge: 0,
      path: "/",
    });
    cookieStore.set("csrfToken", "", {
      httpOnly: false,
      sameSite: "lax",
      secure: isProduction,
      maxAge: 0,
      path: "/",
    });
    
    return new Response(resBody, { status: loRes.status, headers: { "Content-Type": contentType } });
  }

  // Special handling for csrf/refresh: forward Set-Cookie to update CSRF token
  const isCsrfRefresh = path === "csrf/refresh" && lowerMethod === "get";
  if (isCsrfRefresh) {
    const csrfRes = await fetch(url.toString(), {
      method,
      headers: incomingHeaders,
      cache: "no-store",
    });
    const resBody = await csrfRes.text();
    const contentType = csrfRes.headers.get("content-type") || "application/json";
    const outHeaders = new Headers();
    outHeaders.set("Content-Type", contentType);
    csrfRes.headers.forEach((value, key) => {
      if (key.toLowerCase() === "set-cookie") {
        outHeaders.append("set-cookie", value);
      }
    });
    return new Response(resBody, { status: csrfRes.status, headers: outHeaders });
  }

  // Normal proxy flow with server-side refresh on 401
  // Add a timeout to avoid hanging the UI if the backend stalls
  const controller = new AbortController();
  const timeoutMs = 15_000; // 15s per request
  const to = setTimeout(() => controller.abort("upstream-timeout"), timeoutMs);
  let upstreamRes;
  try {
    upstreamRes = await fetch(url.toString(), {
      method,
      headers: incomingHeaders,
      body,
      cache: "no-store",
      signal: controller.signal,
    });
  } catch (err) {
    clearTimeout(to);
    // Return a friendly timeout error
    const status = err?.name === "AbortError" ? 504 : 502;
    return new Response(
      JSON.stringify({ message: "Upstream request failed", error: String(err) }),
      { status, headers: { "Content-Type": "application/json" } }
    );
  } finally {
    clearTimeout(to);
  }

  // If unauthorized or likely token-related 400, attempt refresh and retry once
  if (upstreamRes.status === 401 || upstreamRes.status === 400) {
    let shouldRefresh = upstreamRes.status === 401;
    if (!shouldRefresh && upstreamRes.status === 400) {
      try {
        const ct = upstreamRes.headers.get("content-type") || "";
        if (ct.includes("application/json")) {
          const bodyJson = await upstreamRes.clone().json();
          const msg = (bodyJson?.message || "").toString().toLowerCase();
          if (/(jwt|token|not authenticated|empty)/.test(msg)) {
            shouldRefresh = true;
          }
        }
      } catch {}
    }

    if (shouldRefresh) {
      const refreshed = await tryServerRefresh();
      if (refreshed.ok) {
        // Update Cookie header with new tokens and retry once
        const retryHeaders = new Headers(incomingHeaders);
        const updatedCookie = await buildCookieHeaderFromNext();
        if (updatedCookie) retryHeaders.set("Cookie", updatedCookie);
        const controller2 = new AbortController();
        const to2 = setTimeout(() => controller2.abort("upstream-timeout"), timeoutMs);
        try {
          upstreamRes = await fetch(url.toString(), {
            method,
            headers: retryHeaders,
            body,
            cache: "no-store",
            signal: controller2.signal,
          });
        } catch (err) {
          clearTimeout(to2);
          const status = err?.name === "AbortError" ? 504 : 502;
          return new Response(
            JSON.stringify({ message: "Upstream retry failed", error: String(err) }),
            { status, headers: { "Content-Type": "application/json" } }
          );
        } finally {
          clearTimeout(to2);
        }
      }
    }
  }

  // Read and return the response with proper headers
  const responseText = await upstreamRes.text();
  const contentType = upstreamRes.headers.get("content-type") || "application/json";
  
  return new Response(responseText, { 
    status: upstreamRes.status, 
    headers: { "Content-Type": contentType } 
  });
}

export async function GET(req, ctx) {
  return proxy("GET", req, ctx);
}
export async function POST(req, ctx) {
  return proxy("POST", req, ctx);
}
export async function PUT(req, ctx) {
  return proxy("PUT", req, ctx);
}
export async function PATCH(req, ctx) {
  return proxy("PATCH", req, ctx);
}
export async function DELETE(req, ctx) {
  return proxy("DELETE", req, ctx);
}
