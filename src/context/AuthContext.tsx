import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { login as loginApi, register as registerApi, refreshAccessToken } from "../api/auth";
import { getProfile, updateProfile, type UpdateProfilePayload } from "../api/user";
import { attachAuthInterceptors } from "../api/client";
import type { AuthResponse, UserProfile } from "../types";
import { logInfo, logWarn } from "../utils/logger";
import { API_BASE_URL } from "../config";

interface AuthContextValue {
  user: UserProfile | null;
  accessToken: string | null;
  initializing: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (payload: {
    email: string;
    password: string;
    name: string;
    country?: string;
    language?: string;
  }) => Promise<void>;
  logout: () => void;
  refresh: () => Promise<string | null>;
  updateUser: (payload: UpdateProfilePayload) => Promise<UserProfile>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);
const TOKEN_KEY = "newsapp_access_token";

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [initializing, setInitializing] = useState(true);
  const tokenRef = useRef<string | null>(null);

  const persistToken = (token: string | null) => {
    tokenRef.current = token;
    setAccessToken(token);
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_KEY);
    }
  };

  const persistSession = (auth: AuthResponse) => {
    persistToken(auth.tokens.accessToken);
    setUser(auth.user);
  };

  const logout = useCallback(() => {
    persistToken(null);
    setUser(null);
    try {
      fetch(`${API_BASE_URL}/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch {
    }
  }, []);

  const refresh = useCallback(async (): Promise<string | null> => {
    try {
      const token = await refreshAccessToken();
      if (!token) {
        logout();
        return null;
      }
      persistToken(token);
      const profile = await getProfile();
      setUser(profile);
      return token;
    } catch {
      logWarn("Refresh failed, logging out");
      logout();
      return null;
    }
  }, [logout]);

  const bootstrap = useCallback(async () => {
    const stored = localStorage.getItem(TOKEN_KEY);
    if (stored) {
      persistToken(stored);
      try {
        const profile = await getProfile();
        setUser(profile);
        setInitializing(false);
        return;
      } catch {
        logWarn("Stored token invalid, attempting refresh");
      }
    }
    await refresh();
    setInitializing(false);
  }, [refresh]);

  const login = useCallback(
    async (email: string, password: string) => {
      const response = await loginApi({ email, password });
      persistSession(response);
      logInfo("User logged in", { email });
    },
    []
  );

  const register = useCallback(
    async (payload: { email: string; password: string; name: string; country?: string; language?: string }) => {
      const response = await registerApi(payload);
      persistSession(response);
      logInfo("User registered", { email: payload.email });
    },
    []
  );

  const updateUser = useCallback(async (payload: UpdateProfilePayload): Promise<UserProfile> => {
    const profile = await updateProfile(payload);
    setUser(profile);
    logInfo("User profile updated", { fields: Object.keys(payload) });
    return profile;
  }, []);

  useEffect(() => {
    attachAuthInterceptors(
      {
        getToken: () => tokenRef.current,
        refresh,
        logout,
      },
      undefined
    );
    bootstrap();
  }, [bootstrap, logout, refresh]);

  const value = useMemo(
    () => ({
      user,
      accessToken,
      initializing,
      login,
      register,
      logout,
      refresh,
      updateUser,
    }),
    [user, accessToken, initializing, login, register, logout, refresh, updateUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
};
