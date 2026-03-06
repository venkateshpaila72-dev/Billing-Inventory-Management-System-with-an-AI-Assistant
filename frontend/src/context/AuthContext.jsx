import { createContext, useContext, useState, useEffect } from "react";
import { getToken, getUser, saveToken, saveUser, clearAuth } from "../utils/tokenHelper";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(getUser());
  const [token, setToken] = useState(getToken());
  const [loading, setLoading] = useState(false);

  const login = (userData, accessToken) => {
    saveToken(accessToken);
    saveUser(userData);
    setToken(accessToken);
    setUser(userData);
  };

  const logout = () => {
    clearAuth();
    setToken(null);
    setUser(null);
  };

  const isAdmin = () => user?.role === "admin";
  const isStaff = () => user?.role === "staff";
  const isAuthenticated = () => !!token && !!user;

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isAdmin, isStaff, isAuthenticated, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};