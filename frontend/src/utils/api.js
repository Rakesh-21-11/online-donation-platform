// Centralized API configuration and fetch utility for the frontend
export const RENDER_API_URL = "https://online-donation-platform-x9rc.onrender.com";

const isLocalhost =
  typeof window !== "undefined" &&
  (window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1");

let envUrl = import.meta.env.VITE_API_URL || "";
if (envUrl.includes("localhost") || envUrl.includes("127.0.0.1")) {
  if (!isLocalhost) {
    envUrl = RENDER_API_URL;
  }
}

export const API_URL =
  envUrl && envUrl.startsWith("http")
    ? envUrl
    : isLocalhost
    ? "http://localhost:5000"
    : RENDER_API_URL;

// Helper to delay execution for retry backoff
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const fetchApi = async (endpoint, options = {}, retries = 2) => {
  const path = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  const baseUrl = !isLocalhost ? RENDER_API_URL : API_URL;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const targetUrl = `${baseUrl}${path}`;
      const res = await fetch(targetUrl, options);
      if (res.ok) {
        return res;
      }
      // If endpoint returned non-200 and it's a GET request, wait and retry
      if (attempt < retries && (!options.method || options.method === "GET")) {
        await sleep(1500);
        continue;
      }
      return res;
    } catch (err) {
      console.warn(`Fetch attempt ${attempt + 1} failed for ${path}:`, err);
      if (baseUrl !== RENDER_API_URL) {
        try {
          const fallbackRes = await fetch(`${RENDER_API_URL}${path}`, options);
          if (fallbackRes.ok) return fallbackRes;
        } catch (fallbackErr) {
          console.warn("Fallback fetch failed:", fallbackErr);
        }
      }
      if (attempt < retries) {
        await sleep(2000);
      }
    }
  }

  // Final fallback attempt
  return fetch(`${RENDER_API_URL}${path}`, options);
};
