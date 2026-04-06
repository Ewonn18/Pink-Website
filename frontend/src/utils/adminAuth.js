const ADMIN_PASSCODE_STORAGE_KEY = "pink-admin-passcode";
const ADMIN_MODE_STORAGE_KEY = "pink-admin-mode";

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

export function getAdminModeStored() {
  try {
    return localStorage.getItem(ADMIN_MODE_STORAGE_KEY) === "true";
  } catch {
    return false;
  }
}

export function setAdminModeStored(enabled) {
  try {
    if (enabled) {
      localStorage.setItem(ADMIN_MODE_STORAGE_KEY, "true");
    } else {
      localStorage.removeItem(ADMIN_MODE_STORAGE_KEY);
    }
  } catch {
    // ignore
  }
}

/**
 * Valid initial admin UI state: flag set and passcode present.
 * Repairs inconsistent storage (e.g. flag without passcode).
 */
export function getInitialAdminMode() {
  try {
    const mode = getAdminModeStored();
    const pass = getAdminPasscode();

    if (mode && !pass) {
      setAdminModeStored(false);
      return false;
    }

    return mode && Boolean(pass);
  } catch {
    return false;
  }
}

export function exitAdminMode() {
  setAdminModeStored(false);
  clearAdminPasscode();
}
