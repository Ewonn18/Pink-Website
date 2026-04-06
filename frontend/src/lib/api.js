import { API_BASE } from "../data/siteContent";
import { getAdminHeaders } from "../utils/adminAuth";

function normalizeSlashes(value) {
  return String(value || "").replace(/([^:]\/)\/+/g, "$1");
}

export function buildUrl(path) {
  if (!path) return API_BASE || "";

  const value = String(path).trim();

  if (!value) return API_BASE || "";

  if (value.startsWith("http://") || value.startsWith("https://")) {
    return value;
  }

  if (value.startsWith("//")) {
    return `https:${value}`;
  }

  if (!API_BASE) {
    return value;
  }

  if (value.startsWith("/")) {
    return normalizeSlashes(`${API_BASE}${value}`);
  }

  return normalizeSlashes(`${API_BASE}/${value}`);
}

export function resolveMediaUrl(value) {
  return buildUrl(value);
}

async function parseJsonSafely(response) {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

export async function verifyAdminPasscode(passcode) {
  const trimmed = String(passcode || "").trim();
  if (!trimmed) return false;

  try {
    const response = await fetch(buildUrl("/api/admin/verify"), {
      headers: {
        "x-admin-passcode": trimmed,
      },
    });

    const result = await parseJsonSafely(response);
    return response.ok && result?.success === true;
  } catch {
    return false;
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
