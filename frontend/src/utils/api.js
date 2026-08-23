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

export const API_URL = envUrl && envUrl.startsWith("http")
  ? envUrl
  : isLocalhost
  ? "http://localhost:5000"
  : RENDER_API_URL;

export const fetchApi = async (endpoint, options = {}) => {
  const path = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;

  // On non-localhost devices (mobile/web), target production Render URL directly
  if (!isLocalhost) {
    try {
      const prodUrl = `${API_URL}${path}`;
      const res = await fetch(prodUrl, options);
      if (res.ok) return res;
    } catch (err) {
      console.warn(`Production API call to ${API_URL}${path} failed:`, err);
    }
    const renderUrl = `${RENDER_API_URL}${path}`;
    return fetch(renderUrl, options);
  }

  // On localhost developer environment
  try {
    const localUrl = `${API_URL}${path}`;
    const res = await fetch(localUrl, options);
    if (res.ok) return res;
  } catch (err) {
    console.warn(`Local API call to ${API_URL}${path} failed:`, err);
  }

  const renderUrl = `${RENDER_API_URL}${path}`;
  return fetch(renderUrl, options);
};
