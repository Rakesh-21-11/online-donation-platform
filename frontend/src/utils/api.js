// Centralized API configuration and fetch utility for the frontend
export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
export const RENDER_API_URL = "https://online-donation-platform-x9rc.onrender.com";

export const fetchApi = async (endpoint, options = {}) => {
  const path = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  try {
    const localUrl = `${API_URL}${path}`;
    const res = await fetch(localUrl, options);
    if (res.ok) {
      return res;
    }
    // Fallback to render URL if local backend returns non-ok status
    const renderUrl = `${RENDER_API_URL}${path}`;
    return await fetch(renderUrl, options);
  } catch (error) {
    // Fallback to render URL if local backend server is unreachable
    const renderUrl = `${RENDER_API_URL}${path}`;
    return await fetch(renderUrl, options);
  }
};
