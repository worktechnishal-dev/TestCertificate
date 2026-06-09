import { createContext, useContext, useEffect, useMemo, useState } from "react";
import api from "../services/api";

const AuthContext = createContext(null);
const STORAGE_KEY = "mtc-auth";

const readStoredSession = () => {
  const stored = localStorage.getItem(STORAGE_KEY) || sessionStorage.getItem(STORAGE_KEY);
  if (!stored) {
    return null;
  }

  try {
    const session = JSON.parse(stored);
    if (!session.expiresAt || session.expiresAt < Date.now()) {
      localStorage.removeItem(STORAGE_KEY);
      sessionStorage.removeItem(STORAGE_KEY);
      return null;
    }

    return session;
  } catch {
    return null;
  }
};

const persistSession = (session, remember) => {
  const payload = JSON.stringify(session);
  sessionStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(STORAGE_KEY);

  if (remember) {
    localStorage.setItem(STORAGE_KEY, payload);
  } else {
    sessionStorage.setItem(STORAGE_KEY, payload);
  }
};

export const AuthProvider = ({ children }) => {
  const [session, setSession] = useState(readStoredSession);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session?.token) {
      api.defaults.headers.common.Authorization = `Bearer ${session.token}`;
    } else {
      delete api.defaults.headers.common.Authorization;
    }
  }, [session]);

  useEffect(() => {
    const loadProfile = async () => {
      if (!session?.token) {
        setLoading(false);
        return;
      }

      try {
        const { data } = await api.get("/auth/me");
        setSession((currentSession) => ({ ...currentSession, user: data.user }));
      } catch {
        localStorage.removeItem(STORAGE_KEY);
        sessionStorage.removeItem(STORAGE_KEY);
        setSession(null);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  const authenticate = async (path, values) => {
    const { data } = await api.post(path, values);
    const nextSession = {
      token: data.token,
      expiresAt: data.expiresAt,
      user: data.user
    };

    persistSession(nextSession, values.remember);
    setSession(nextSession);
    return data.user;
  };

  const logout = () => {
    localStorage.removeItem(STORAGE_KEY);
    sessionStorage.removeItem(STORAGE_KEY);
    setSession(null);
  };

  const value = useMemo(
    () => ({
      loading,
      login: (values) => authenticate("/auth/login", values),
      logout,
      register: (values) => authenticate("/auth/register", values),
      token: session?.token,
      user: session?.user
    }),
    [loading, session]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
