import { API_BASE } from "../data/siteContent";
import { getAdminHeaders } from "../utils/adminAuth";

function buildUrl(path) {
  if (!path) return API_BASE;
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  return `${API_BASE}${path}`;
}

export function resolveMediaUrl(path) {
  if (!path || typeof path !== "string") return "";

  const trimmed = path.trim();

  if (!trimmed) return "";

  if (
    trimmed.startsWith("http://") ||
    trimmed.startsWith("https://") ||
    trimmed.startsWith("data:")
  ) {
    return trimmed;
  }

  if (trimmed.startsWith("/")) {
    return `${API_BASE}${trimmed}`;
  }

  return `${API_BASE}/${trimmed}`;
}

async function parseJsonSafely(response) {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

export async function apiRequest(path, options = {}) {
  const { method = "GET", headers = {}, body, useAdmin = false } = options;

  const finalHeaders = useAdmin ? getAdminHeaders(headers) : headers;

  const response = await fetch(buildUrl(path), {
    method,
    headers: finalHeaders,
    body,
  });

  const result = await parseJsonSafely(response);

  if (!response.ok || !result?.success) {
    throw new Error(result?.message || "Request failed.");
  }

  return result;
}

export async function apiGet(path) {
  return apiRequest(path);
}

export async function apiGetAdmin(path) {
  return apiRequest(path, {
    useAdmin: true,
  });
}

export async function apiPostJson(path, data, useAdmin = false) {
  return apiRequest(path, {
    method: "POST",
    useAdmin,
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
}

export async function apiPutJson(path, data, useAdmin = false) {
  return apiRequest(path, {
    method: "PUT",
    useAdmin,
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
}

export async function apiDelete(path, useAdmin = false) {
  return apiRequest(path, {
    method: "DELETE",
    useAdmin,
  });
}

export async function apiPostForm(path, formData, useAdmin = false) {
  return apiRequest(path, {
    method: "POST",
    useAdmin,
    body: formData,
  });
}

export async function apiPutForm(path, formData, useAdmin = false) {
  return apiRequest(path, {
    method: "PUT",
    useAdmin,
    body: formData,
  });
}

export { buildUrl };
