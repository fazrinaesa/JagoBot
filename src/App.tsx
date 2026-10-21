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
import { DashboardWithAnalytics } from "./pages/DashboardWithAnalytics";
import { ApiManagement } from "./pages/ApiManagement";
import { KnowledgeBase } from "./pages/KnowledgeBase";
import { CustomPersonality } from "./pages/CustomPersonality";
import { ChatbotPlayground } from "./pages/ChatbotPlayground";
import { IntegrationSettings } from "./pages/IntegrationSettings";
import { ProfilePage } from "./pages/ProfilePage";
import { NotificationsPage } from "./pages/NotificationsPage";
import { PaymentPage } from "./pages/PaymentPage";
import { AdminPaymentPage } from "./pages/AdminPaymentPage";
import { AiConfigPage } from "./pages/AiConfigPage";
import { ApiUsagePage } from "./pages/ApiUsagePage";
import { QuestionsPage } from "./pages/QuestionsPage";
import { UsersPage } from "./pages/UsersPage";
import { AdminOverviewPage } from "./pages/AdminOverviewPage";
import { RequireSuperAdmin } from "./components/RequireSuperAdmin";
import { RequireUser } from "./components/RequireUser";

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
              {localStorage.getItem("role") === "SUPER_ADMIN" ? (
                <RequireSuperAdmin><AdminOverviewPage /></RequireSuperAdmin>
              ) : <DashboardWithAnalytics />}
            </DashboardLayout>
          } />
          <Route path="/dashboard/knowledge" element={
            <DashboardLayout>
              <RequireUser><KnowledgeBase /></RequireUser>
            </DashboardLayout>
          } />
          <Route path="/dashboard/personality" element={
            <DashboardLayout>
              <RequireUser><CustomPersonality /></RequireUser>
            </DashboardLayout>
          } />
          <Route path="/dashboard/playground" element={
            <DashboardLayout>
              <RequireUser><ChatbotPlayground /></RequireUser>
            </DashboardLayout>
          } />
          <Route path="/dashboard/api" element={<Navigate to="/dashboard/integration" replace />} />
          <Route path="/dashboard/integration" element={
            <DashboardLayout>
              <RequireUser><IntegrationSettings /></RequireUser>
            </DashboardLayout>
          } />
          <Route path="/dashboard/analytics" element={<Navigate to="/dashboard" replace />} />
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
              <RequireUser><PaymentPage /></RequireUser>
            </DashboardLayout>
          } />
          <Route path="/dashboard/admin/payment" element={
            <DashboardLayout>
              <RequireSuperAdmin>
                <AdminPaymentPage />
              </RequireSuperAdmin>
            </DashboardLayout>
          } />
          <Route path="/dashboard/admin/ai-config" element={
            <DashboardLayout>
              <RequireSuperAdmin>
                <AiConfigPage />
              </RequireSuperAdmin>
            </DashboardLayout>
          } />
          <Route path="/dashboard/admin/api-usage" element={
            <DashboardLayout>
              <RequireSuperAdmin>
                <ApiUsagePage />
              </RequireSuperAdmin>
            </DashboardLayout>
          } />
          <Route path="/dashboard/admin/questions" element={
            <DashboardLayout>
              <RequireSuperAdmin>
                <QuestionsPage />
              </RequireSuperAdmin>
            </DashboardLayout>
          } />
          <Route path="/dashboard/admin/users" element={
            <DashboardLayout>
              <RequireSuperAdmin>
                <UsersPage />
              </RequireSuperAdmin>
            </DashboardLayout>
          } />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

