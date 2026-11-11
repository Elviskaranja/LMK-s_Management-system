const API_BASE_URL = "/api";
const AUTH_TOKEN_KEY = "law-firm-auth-token";

export function getAuthToken() {
  return localStorage.getItem(AUTH_TOKEN_KEY);
}

export function setAuthToken(token) {
  localStorage.setItem(AUTH_TOKEN_KEY, token);
}

export function clearAuthToken() {
  localStorage.removeItem(AUTH_TOKEN_KEY);
}

async function request(path, options = {}) {
  const token = getAuthToken();
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...options.headers
    },
    body: options.body ? JSON.stringify(options.body) : undefined
  });
  const text = await response.text();
  let data = null;

  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      if (response.ok) {
        throw new Error("The server returned an invalid JSON response.");
      }
      data = text;
    }
  }

  if (!response.ok) {
    const message = typeof data === "object" && data !== null
      ? data.message || data.error
      : data;
    const error = new Error(message || `Request failed with status ${response.status}.`);
    error.status = response.status;
    throw error;
  }

  return data;
}

export const api = {
  get: (path) => request(path),
  post: (path, body) => request(path, { method: "POST", body }),
  put: (path, body) => request(path, { method: "PUT", body }),
  delete: (path) => request(path, { method: "DELETE" })
};

export function asArray(value) {
  if (!Array.isArray(value)) {
    throw new Error("The server response was expected to be a list.");
  }
  return value;
}

export function displayDate(value) {
  if (!value) return "";
  const date = String(value);
  if (/^\d{4}-\d{2}-\d{2}$/.test(date)) return date;

  const parsed = new Date(date);
  return Number.isNaN(parsed.getTime()) ? "" : parsed.toISOString().slice(0, 10);
}

export function idOfCase(row) {
  return row?.legalCase?.caseId ?? row?.case?.caseId ?? row?.caseId ?? "";
}
