const ADMIN_PASSCODE_STORAGE_KEY = "pink-admin-passcode";

export function getAdminPasscode() {
  try {
    return localStorage.getItem(ADMIN_PASSCODE_STORAGE_KEY) || "";
  } catch {
    return "";
  }
}

export function setAdminPasscode(value) {
  try {
    localStorage.setItem(ADMIN_PASSCODE_STORAGE_KEY, value || "");
  } catch {
    // ignore
  }
}

export function clearAdminPasscode() {
  try {
    localStorage.removeItem(ADMIN_PASSCODE_STORAGE_KEY);
  } catch {
    // ignore
  }
}

export function getAdminHeaders(extraHeaders = {}) {
  const passcode = getAdminPasscode();

  return {
    ...(passcode ? { "x-admin-passcode": passcode } : {}),
    ...extraHeaders,
  };
}
