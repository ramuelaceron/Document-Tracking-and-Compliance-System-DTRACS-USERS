// src/utils/setApiUrl.js
export function setApiUrl(newUrl) {
  localStorage.setItem("API_BASE_URL", newUrl);
  window.location.reload(); // reload so axios picks up new URL
}
