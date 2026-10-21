import React from "react";
import { Navigate } from "react-router-dom";

/** User-only pages; backend tetap menerapkan ownership checks per akun. */
export const RequireUser: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const role = localStorage.getItem("role") || "USER";
  return role === "USER" ? <>{children}</> : <Navigate to="/dashboard" replace />;
};
