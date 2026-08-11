/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "./hooks/useTheme";
import { DashboardLayout } from "./components/DashboardLayout";
import { LandingPage } from "./pages/LandingPage";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { ForgotPasswordPage } from "./pages/ForgotPasswordPage";
import { ResetPasswordPage } from "./pages/ResetPasswordPage";
import { DashboardHome } from "./pages/DashboardHome";
import { KnowledgeBase } from "./pages/KnowledgeBase";
import { CustomPersonality } from "./pages/CustomPersonality";
import { ChatbotPlayground } from "./pages/ChatbotPlayground";
import { IntegrationSettings } from "./pages/IntegrationSettings";
import { AnalyticsDashboard } from "./pages/AnalyticsDashboard";
import { ProfilePage } from "./pages/ProfilePage";
import { NotificationsPage } from "./pages/NotificationsPage";
import { PaymentPage } from "./pages/PaymentPage";
import { AdminPaymentPage } from "./pages/AdminPaymentPage";

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />

          {/* Dashboard Routes */}
          <Route path="/dashboard" element={
            <DashboardLayout>
              <DashboardHome />
            </DashboardLayout>
          } />
          <Route path="/dashboard/knowledge" element={
            <DashboardLayout>
              <KnowledgeBase />
            </DashboardLayout>
          } />
          <Route path="/dashboard/personality" element={
            <DashboardLayout>
              <CustomPersonality />
            </DashboardLayout>
          } />
          <Route path="/dashboard/playground" element={
            <DashboardLayout>
              <ChatbotPlayground />
            </DashboardLayout>
          } />
          <Route path="/dashboard/integration" element={
            <DashboardLayout>
              <IntegrationSettings />
            </DashboardLayout>
          } />
          <Route path="/dashboard/analytics" element={
            <DashboardLayout>
              <AnalyticsDashboard />
            </DashboardLayout>
          } />
          <Route path="/dashboard/profile" element={
            <DashboardLayout>
              <ProfilePage />
            </DashboardLayout>
          } />
          <Route path="/dashboard/notifications" element={
            <DashboardLayout>
              <NotificationsPage />
            </DashboardLayout>
          } />
          <Route path="/dashboard/payment" element={
            <DashboardLayout>
              <PaymentPage />
            </DashboardLayout>
          } />
          <Route path="/dashboard/admin/payment" element={
            <DashboardLayout>
              <AdminPaymentPage />
            </DashboardLayout>
          } />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

