// src/config.js
const savedApiUrl = localStorage.getItem("API_BASE_URL");

// Default fallback
const defaultApiUrl = "https://natural-seattle-morning-elected.trycloudflare.com";

const config = {
  API_BASE_URL: (savedApiUrl || defaultApiUrl).trim(),
};

export default config;