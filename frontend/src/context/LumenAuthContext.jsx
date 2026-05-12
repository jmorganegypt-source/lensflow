import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import lumenApi, { lumenErr } from "../lib/lumenApi";

const Ctx = createContext(null);

export function LumenAuthProvider({ children }) {
  const [user, setUser] = useState(null);

  const refresh = useCallback(async () => {
    try { const { data } = await lumenApi.get("/auth/me"); setUser(data.user); }
    catch { setUser(false); }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const login = async (email, password) => {
    try {
      const { data } = await lumenApi.post("/auth/login", { email, password });
      if (data.access_token) localStorage.setItem("lumen_access_token", data.access_token);
      setUser(data.user);
      return { ok: true };
    } catch (e) {
      return { ok: false, error: lumenErr(e.response?.data?.detail) || e.message };
    }
  };

  const register = async (email, password, name) => {
    try {
      const { data } = await lumenApi.post("/auth/register", { email, password, name });
      if (data.access_token) localStorage.setItem("lumen_access_token", data.access_token);
      setUser(data.user);
      return { ok: true };
    } catch (e) {
      return { ok: false, error: lumenErr(e.response?.data?.detail) || e.message };
    }
  };

  const logout = async () => {
    try { await lumenApi.post("/auth/logout"); } catch {}
    localStorage.removeItem("lumen_access_token");
    setUser(false);
  };

  return <Ctx.Provider value={{ user, login, register, logout, refresh }}>{children}</Ctx.Provider>;
}

export const useLumenAuth = () => useContext(Ctx);
