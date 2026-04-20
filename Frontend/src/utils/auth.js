const SESSION_KEY = "auth_session";
const TOKEN_KEY = "auth_token";

export function saveSession(user) {
  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify({ user }));
  } catch {}
}

export function getSessionUser() {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function hasUser() {
  return !!getSessionUser()?.user;
}

export function clearSession() {
  try {
    localStorage.removeItem(SESSION_KEY);
  } catch {}
}

export function saveToken(token) {
  try {
    localStorage.setItem(TOKEN_KEY, token);
  } catch {}
}

export function getToken() {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function clearToken() {
  try {
    localStorage.removeItem(TOKEN_KEY);
  } catch {}
}

export function getDashboardPathByRole(role) {
  if (!role) return "/login";
  switch (role.toString().toLowerCase().trim()) {
    case "admin":
      return "/home/admin-dashboard";
    case "chef":
    case "cheff":
      return "/chef";
    case "waiter":
    case "cashier":
    case "staff":
      return "/waiter";
    default:
      return "/login";
  }
}

export function canAccessPath(role, path) {
  if (!role) return false;
  const r = role.toString().toLowerCase().trim();
  const base = "/" + (path.split("/")[1] ?? "");

  switch (base) {
    case "/home":
      return ["admin"].includes(r);
    case "/chef":
      return ["admin", "chef", "cheff", "staff"].includes(r);
    case "/waiter":
      return ["admin", "waiter", "cashier", "staff"].includes(r);
    default:
      return ["admin"].includes(r);
  }
}

