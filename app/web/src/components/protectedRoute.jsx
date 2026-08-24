import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const ProtectedRoute = ({ children, redirectTo = '/login', allowedRoles = [] }) => {
    const { isAuthed, user } = useAuth();

    if (!isAuthed) return <Navigate to={redirectTo} replace />;

    if (allowedRoles.length && user && !allowedRoles.includes(user.role)) {
        return <Navigate to={user.role === 'employee' ? '/employee' : '/admin'} replace />;
    }

    return children;
};

export default ProtectedRoute;

export { ProtectedRoute };
