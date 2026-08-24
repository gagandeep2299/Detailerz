import React from 'react';
import { Route, Routes, BrowserRouter as Router } from 'react-router-dom';
import ScrollToTop from './components/ScrollToTop';
import { ProtectedRoute } from './components/protectedRoute';
import HomePage from './pages/HomePage';
import ServicesPage from './pages/ServicePage';
import GalleryPage from './pages/GalleryPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import MarketingPage from './pages/MarketingPage';
import AdminLoginPage from './pages/AdminLoginPage';
import AdminPage from './pages/AdminPage';
import AdminGalleryPage from './pages/AdminGalleryPage';
import AdminEmployeesPage from './pages/AdminEmployeesPage';
import CustomerPage from './pages/CustomerPage';
import EmployeeLoginPage from './pages/EmployeeLoginPage';
import EmployeePage from './pages/EmployeePage';

function App() {
    return (
        <Router>
            <ScrollToTop />
            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/services" element={<ServicesPage />} />
                <Route path="/gallery" element={<GalleryPage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/contact" element={<ContactPage />} />
                <Route path="/marketing" element={<MarketingPage />} />
                <Route path="/video" element={<MarketingPage />} />

                <Route path="/admin/login" element={<AdminLoginPage />} />
                <Route
                    path="/admin"
                    element={
                        <ProtectedRoute allowedRoles={['admin']} redirectTo="/admin/login">
                            <AdminPage />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/admin/gallery"
                    element={
                        <ProtectedRoute allowedRoles={['admin']} redirectTo="/admin/login">
                            <AdminGalleryPage />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/admin/customers"
                    element={
                        <ProtectedRoute allowedRoles={['admin']} redirectTo="/admin/login">
                            <CustomerPage />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/admin/customers/:customerId"
                    element={
                        <ProtectedRoute allowedRoles={['admin']} redirectTo="/admin/login">
                            <CustomerPage />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/admin/employees"
                    element={
                        <ProtectedRoute allowedRoles={['admin']} redirectTo="/admin/login">
                            <AdminEmployeesPage />
                        </ProtectedRoute>
                    }
                />

                <Route path="/employee/login" element={<EmployeeLoginPage />} />
                <Route
                    path="/employee"
                    element={
                        <ProtectedRoute allowedRoles={['employee']} redirectTo="/employee/login">
                            <EmployeePage />
                        </ProtectedRoute>
                    }
                />
            </Routes>
        </Router>
    );
}

export default App;
