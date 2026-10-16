import { useAuth } from "../auth/hooks/useAuth.js";
import React, { useState } from "react";
import { Navigate, Link, useNavigate } from "react-router";

const Protected = ({ children }) => {

    const { user, loading } = useAuth();

    const navigate = useNavigate();

    if (loading) {
        return (
            <main>
                <h1>Loading...</h1>
            </main>
        );
    }

    if (!user) {
        return <Navigate to="/login" replace={true} />;
    }

    return children;
};

export default Protected;