import React, { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { authContext } from '../AuthContext';

export function ProtectedRoute({ admin, children }) {
    const { user } = useContext(authContext);

    // If the user is not logged in, redirect to login
    if (!user) {
        return <Navigate to="/login" replace />;
    }

    // If this is an admin route but the user is not an admin, redirect to home
    if (admin && !user.admin) {
        return <Navigate to="/" replace />;
    }

    // Return the children (or nested routes if no children are given)
    return children ? children : <Outlet />;
}
