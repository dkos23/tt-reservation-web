import React, { Suspense, lazy } from 'react';
import { Navigate, Route, Routes } from "react-router-dom";

import { Ball } from '../Ball';
import { ProtectedRoute } from './ProtectedRoute';

const CalendarPage = lazy(() => import('../calendar/CalendarPage').then(m => ({ default: m.CalendarPage })));
const GeneralSettingsPage = lazy(() => import('../admin/GeneralSettingsPage').then(m => ({ default: m.GeneralSettingsPage })));
const InfoPage = lazy(() => import('../other/InfoPage').then(m => ({ default: m.InfoPage })));
const LegalPrivacyPage = lazy(() => import('../other/LegalPrivacyPage').then(m => ({ default: m.LegalPrivacyPage })));
const LoginPage = lazy(() => import('../user/LoginPage').then(m => ({ default: m.LoginPage })));
const LogoutPage = lazy(() => import('../user/LogoutPage').then(m => ({ default: m.LogoutPage })));
const VerifyMailPage = lazy(() => import('../user/VerifyMailPage').then(m => ({ default: m.VerifyMailPage })));
const MyAccountPage = lazy(() => import('../user/MyAccountPage').then(m => ({ default: m.MyAccountPage })));
const MyReservationsPage = lazy(() => import('../calendar/MyReservationsPage').then(m => ({ default: m.MyReservationsPage })));
const RegisterPage = lazy(() => import('../user/RegisterPage').then(m => ({ default: m.RegisterPage })));
const StatsPage = lazy(() => import('../admin/StatsPage').then(m => ({ default: m.StatsPage })));
const EditTemplatesPage = lazy(() => import('../admin/EditTemplatesPage').then(m => ({ default: m.EditTemplatesPage })));
const UserManagementPage = lazy(() => import('../admin/UserManagementPage').then(m => ({ default: m.UserManagementPage })));

export function RouterSwitch() {
    return (
        <Suspense fallback={<Ball visible large centered spin />}>
            <Routes>
                <Route path="/" element={<CalendarPage />} />
                <Route path="/info" element={<InfoPage />} />
                <Route path="/legalnotice-privacy" element={<LegalPrivacyPage />} />
                <Route path="/logout" element={<LogoutPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />

                <Route path="/admin/general" element={
                    <ProtectedRoute admin>
                        <GeneralSettingsPage />
                    </ProtectedRoute>
                } />
                <Route path="/admin/stats" element={
                    <ProtectedRoute admin>
                        <StatsPage />
                    </ProtectedRoute>
                } />
                <Route path="/admin/users" element={
                    <ProtectedRoute admin>
                        <UserManagementPage />
                    </ProtectedRoute>
                } />
                <Route path="/admin/templates" element={
                    <ProtectedRoute admin>
                        <EditTemplatesPage />
                    </ProtectedRoute>
                } />

                <Route path="/my-reservations" element={<ProtectedRoute><MyReservationsPage /></ProtectedRoute>} />

                <Route path="/profile" element={
                    <ProtectedRoute>
                        <MyAccountPage />
                    </ProtectedRoute>
                } />
                
                <Route path="/verify-mail/:verifyToken" element={<VerifyMailPage />} />
                {/* <Route path="/verify-mail/:verifyToken" element={
                    <ProtectedRoute>
                        <VerifyMailPage />
                    </ProtectedRoute>
                } /> */}

                <Route path="*" element={<Navigate to="/" />} />
            </Routes>
        </Suspense>
    );
}
