import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import ProtectedRoute from './components/ProtectedRoutes';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';

// Pages
import Login from './pages/Login';
import HRLogin from './pages/HRLogin';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import AdminPanel from './pages/AdminPanel';

// Application Layout Component (Sidebar and Content area for logged-in users)
const AppLayout = ({ children }) => {
    return (
        <div className="flex flex-col min-h-screen bg-slate-50">
            <Navbar />
            <div className="flex flex-1">
                <Sidebar />
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-50">
                    {children}
                </main>
            </div>
        </div>
    );
};

// Layout with only Header (for Login/Register)
const AuthLayout = ({ children }) => {
    return (
        <div className="flex flex-col min-h-screen bg-slate-50">
            <Navbar />
            <main className="flex-1 flex flex-col justify-center">
                {children}
            </main>
        </div>
    );
};

function App() {
    return (
        <AuthProvider>
            <LanguageProvider>
                <Router>
                    <Routes>
                    {/* Public Routes */}
                    <Route path="/login" element={
                        <AuthLayout>
                            <Login />
                        </AuthLayout>
                    } />
                    <Route path="/hr-login" element={
                        <AuthLayout>
                            <HRLogin />
                        </AuthLayout>
                    } />
                    <Route path="/register" element={
                        <AuthLayout>
                            <Register />
                        </AuthLayout>
                    } />

                    {/* Protected Routes (Authenticated users only) */}
                    <Route path="/dashboard" element={
                        <ProtectedRoute>
                            <AppLayout>
                                <Dashboard />
                            </AppLayout>
                        </ProtectedRoute>
                    } />

                    {/* Admin Only Route */}
                    <Route path="/admin" element={
                        <ProtectedRoute roleRequired="HR">
                            <AppLayout>
                                <AdminPanel />
                            </AppLayout>
                        </ProtectedRoute>
                    } />

                    {/* Default Route (Redirects to dashboard if session exists, else to login) */}
                    <Route path="/" element={<Navigate to="/login" replace />} />
                    
                    {/* For pages not found */}
                    <Route path="*" element={<Navigate to="/dashboard" replace />} />
                </Routes>
                </Router>
            </LanguageProvider>
        </AuthProvider>
    );
}

export default App;