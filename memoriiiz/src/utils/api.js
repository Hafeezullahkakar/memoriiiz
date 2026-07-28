import axios from "axios";

// Shared axios instance + refresh-token flow.
// - Request interceptor: attaches Bearer access token when present.
// - Response interceptor: on 401, tries to refresh once, then retries the
//   original request. If refresh fails, dispatches a logout so the UI resets.
//
// Import { api } for calls needing auth. Public endpoints can still use
// vanilla axios (or api — it just won't add a header if no token).

const API_BASE = process.env.REACT_APP_URI || "https://memoriiiz.vercel.app/api";

// Where should refresh POST? Login/register/refresh/logout are under /user,
// not /api — derive it from the same origin.
const USER_BASE = API_BASE.replace(/\/api\/?$/, "/user");

const LS_ACCESS = "access_token";
const LS_REFRESH = "refresh_token";
const LS_USER = "user";

export const tokenStore = {
  getAccess: () => localStorage.getItem(LS_ACCESS),
  getRefresh: () => localStorage.getItem(LS_REFRESH),
  getUser: () => {
    try {
      const s = localStorage.getItem(LS_USER);
      return s ? JSON.parse(s) : null;
    } catch {
      return null;
    }
  },
  set: ({ accessToken, refreshToken, user }) => {
    if (accessToken !== undefined) {
      if (accessToken) localStorage.setItem(LS_ACCESS, accessToken);
      else localStorage.removeItem(LS_ACCESS);
    }
    if (refreshToken !== undefined) {
      if (refreshToken) localStorage.setItem(LS_REFRESH, refreshToken);
      else localStorage.removeItem(LS_REFRESH);
    }
    if (user !== undefined) {
      if (user) localStorage.setItem(LS_USER, JSON.stringify(user));
      else localStorage.removeItem(LS_USER);
    }
  },
  clear: () => {
    localStorage.removeItem(LS_ACCESS);
    localStorage.removeItem(LS_REFRESH);
    localStorage.removeItem(LS_USER);
  },
};

export const api = axios.create({ baseURL: API_BASE });

// A tiny event bus so the redux slice can react without importing the store here
// (avoids a circular import).
const listeners = new Set();
export const onAuthEvent = (fn) => {
  listeners.add(fn);
  return () => listeners.delete(fn);
};
const emit = (event, payload) => listeners.forEach((fn) => fn(event, payload));

// ─── request interceptor ────────────────────────────────────────────────
api.interceptors.request.use((config) => {
  const token = tokenStore.getAccess();
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ─── response interceptor: refresh-on-401 ───────────────────────────────
let refreshInFlight = null;

const refreshAccessToken = async () => {
  if (refreshInFlight) return refreshInFlight; // coalesce concurrent 401s
  refreshInFlight = (async () => {
    const rt = tokenStore.getRefresh();
    if (!rt) throw new Error("No refresh token");
    const res = await axios.post(`${USER_BASE}/refresh`, { refreshToken: rt });
    const { accessToken, user } = res.data || {};
    if (!accessToken) throw new Error("No access token returned from refresh");
    tokenStore.set({ accessToken, user });
    emit("refreshed", { accessToken, user });
    return accessToken;
  })().finally(() => {
    refreshInFlight = null;
  });
  return refreshInFlight;
};

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    const status = error.response?.status;

    // Only try to refresh on 401 from a request that has an original config
    // AND hasn't already been retried AND isn't itself the refresh call.
    const isRefreshCall = original?.url?.includes("/refresh");
    if (
      status === 401 &&
      original &&
      !original._retriedAfterRefresh &&
      !isRefreshCall &&
      tokenStore.getRefresh()
    ) {
      original._retriedAfterRefresh = true;
      try {
        const newToken = await refreshAccessToken();
        original.headers = original.headers || {};
        original.headers.Authorization = `Bearer ${newToken}`;
        return api(original);
      } catch (refreshErr) {
        tokenStore.clear();
        emit("logout", { reason: "refresh_failed" });
        return Promise.reject(refreshErr);
      }
    }
    return Promise.reject(error);
  }
);

// Public helpers for auth pages that shouldn't add stale Bearer headers.
export const authApi = {
  login: (body) => axios.post(`${USER_BASE}/login`, body).then((r) => r.data),
  register: (body) => axios.post(`${USER_BASE}/register`, body).then((r) => r.data),
  logout: (refreshToken) => axios.post(`${USER_BASE}/logout`, { refreshToken }).catch(() => {}),
  me: () => api.get(`${USER_BASE}/me`).then((r) => r.data),
};

export { API_BASE, USER_BASE };
export default api;
