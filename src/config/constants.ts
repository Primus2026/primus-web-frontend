// Ensure no trailing slash for consistency
export const API_URL = (import.meta.env.VITE_API_URL || "http://localhost/api/v1/").replace(/\/?$/, '/');

