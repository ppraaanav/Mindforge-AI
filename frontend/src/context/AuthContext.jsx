import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { loginUser, registerUser } from "../services/authService";

const AuthContext = createContext(null);

const USER_STORAGE_KEY = "mindforge_user";
const TOKEN_STORAGE_KEY = "mindforge_token";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState("");
  const [isBootstrapping, setIsBootstrapping] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem(TOKEN_STORAGE_KEY);
    const savedUser = localStorage.getItem(USER_STORAGE_KEY);

    if (savedToken && savedUser) {
      try {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      } catch (error) {
        localStorage.removeItem(TOKEN_STORAGE_KEY);
        localStorage.removeItem(USER_STORAGE_KEY);
      }
    }

    setIsBootstrapping(false);
  }, []);

  const persistAuth = (authPayload) => {
    setToken(authPayload.token);
    setUser(authPayload.user);
    localStorage.setItem(TOKEN_STORAGE_KEY, authPayload.token);
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(authPayload.user));
  };

  const login = async (credentials) => {
    const data = await loginUser(credentials);
    persistAuth(data);
    return data;
  };

  const register = async (payload) => {
    const data = await registerUser(payload);
    persistAuth(data);
    return data;
  };

  const logout = () => {
    setToken("");
    setUser(null);
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    localStorage.removeItem(USER_STORAGE_KEY);
  };

  const value = useMemo(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(token),
      isBootstrapping,
      login,
      register,
      logout
    }),
    [user, token, isBootstrapping]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
};
