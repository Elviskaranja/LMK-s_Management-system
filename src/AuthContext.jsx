import { useCallback, useEffect, useMemo, useState } from "react";
import { AuthContext } from "./auth-context.js";
import { api, clearAuthToken, getAuthToken, setAuthToken } from "./services/api";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(() => Boolean(getAuthToken()));
  const [error, setError] = useState("");
  const [restoreAttempt, setRestoreAttempt] = useState(0);

  useEffect(() => {
    let isCurrent = true;
    const token = getAuthToken();

    if (!token) return undefined;

    api.get("/auth/me")
      .then((currentUser) => {
        if (isCurrent) {
          setUser(currentUser);
          setError("");
        }
      })
      .catch((restoreError) => {
        if (!isCurrent) return;
        if (restoreError.status === 401) {
          clearAuthToken();
          setUser(null);
          setError("");
        } else {
          setError(`Could not restore your session: ${restoreError.message}`);
        }
      })
      .finally(() => {
        if (isCurrent) setIsLoading(false);
      });

    return () => {
      isCurrent = false;
    };
  }, [restoreAttempt]);

  const login = useCallback(async (credentials) => {
    const response = await api.post("/auth/login", credentials);
    setAuthToken(response.token);
    setUser(response.user);
    setError("");
  }, []);

  const logout = useCallback(() => {
    clearAuthToken();
    setUser(null);
    setError("");
  }, []);

  const hasRole = useCallback(
    (roleName) => user?.role === roleName,
    [user],
  );
  const retryRestore = useCallback(() => {
    setIsLoading(true);
    setError("");
    setRestoreAttempt((attempt) => attempt + 1);
  }, []);

  const value = useMemo(() => ({
    user,
    role: user?.role ?? null,
    isAdvocate: hasRole("Advocate"),
    isAuthenticated: Boolean(user),
    isLoading,
    error,
    hasRole,
    login,
    logout,
    retryRestore,
  }), [user, hasRole, isLoading, error, login, logout, retryRestore]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
