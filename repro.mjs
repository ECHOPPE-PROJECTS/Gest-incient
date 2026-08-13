import axios from "axios";

const API_BASE = "https://backend-t8k0.onrender.com";
const API_PREFIX = "/api";

const store = {};

globalThis.localStorage = {
  getItem: (k) => (k in store ? store[k] : null),
  setItem: (k, v) => { store[k] = String(v); },
  clear: () => { for (const k in store) delete store[k]; },
};

const api = axios.create({
  baseURL: `${API_BASE}${API_PREFIX}`,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      const refresh = localStorage.getItem("refresh_token");
      if (refresh) {
        try {
          const { data } = await axios.post(`${API_BASE}${API_PREFIX}/auth/refresh/`, { refresh });
          localStorage.setItem("access_token", data.access);
          original.headers.Authorization = `Bearer ${data.access}`;
          return api(original);
        } catch (e) {
          console.error("REFRESH FAILED", e.response?.status, e.response?.data);
          return Promise.reject(e);
        }
      }
    }
    return Promise.reject(error);
  }
);

const { data: loginData } = await api.post("/auth/login/", {
  email: "admin@echoppe.tg",
  password: "admin123",
});
localStorage.setItem("access_token", loginData.access);
localStorage.setItem("refresh_token", loginData.refresh);

const cats = await api.get("/categories/");
const catsArr = cats.data.results || cats.data;
console.log("categories:", Array.isArray(catsArr) ? catsArr.length : "NOT ARRAY", Array.isArray(catsArr) ? catsArr.map((c) => c.name).join(", ") : cats.data);

const pris = await api.get("/priorities/");
const prisArr = pris.data.results || pris.data;
console.log("priorities:", Array.isArray(prisArr) ? prisArr.length : "NOT ARRAY", Array.isArray(prisArr) ? prisArr.map((p) => p.name).join(", ") : pris.data);
