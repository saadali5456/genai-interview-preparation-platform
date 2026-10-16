import { createContext, useState, useEffect } from "react";
import { getMe } from "../services/auth.api.js";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {

    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {

        const getAndUser = async () => {

            try {

                const data = await getMe();

                setUser(data.user);

            } catch (error) {

                console.log("User not logged in");

                setUser(null);

            } finally {

                setLoading(false);

            }
        };

        getAndUser();

    }, []);

    return (
        <AuthContext.Provider
            value={{
                user,
                setUser,
                loading,
                setLoading
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};