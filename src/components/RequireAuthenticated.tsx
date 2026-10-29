import React from "react";
import { Navigate } from "react-router-dom";

/** Pages shared by tenant users and platform admins; the backend still enforces role/ownership. */
export const RequireAuthenticated: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const token = localStorage.getItem("token");
  return token ? <>{children}</> : <Navigate to="/login" replace />;
};

export default RequireAuthenticated;
