import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { postLoginApi } from './api';

import { useApi } from './useApi';

const TOKEN_NAME = 'usertoken';

export const authContext = React.createContext();

export function AuthContextProvider({ children }) {

    const [user, _setUser] = useState(null);
    const rememberLoginRef = useRef(false);

    const setUser = useCallback(getResult => {
        _setUser(data => {
            const newData = getResult(data);

            // Normalize keys if needed
            if (newData?.user_id) {
                newData.userId = newData.user_id;
                delete newData.user_id;
            }

            // console.log("🔐 AuthContext setUser (normalized):", newData);

            if (newData?.token) {
                if (rememberLoginRef.current)
                    localStorage.setItem(TOKEN_NAME, newData.token);
                else
                    sessionStorage.setItem(TOKEN_NAME, newData.token);
            }
            return newData;
        });
    }, []);

    const [autoLoginState, postLogin] = useApi(postLoginApi, setUser);
    // const [, postLogout] = useApi(postLogoutApi);

    useEffect(() => {
        const token = sessionStorage.getItem(TOKEN_NAME) || localStorage.getItem(TOKEN_NAME);
        if (token && !user)
            postLogin(null, {
                type: 'token',
                token,
            });
    }, [postLogin, user]);

    useEffect(() => {
        if (autoLoginState.error) {
            sessionStorage.removeItem(TOKEN_NAME);
            localStorage.removeItem(TOKEN_NAME);
        }
    }, [autoLoginState]);

    const setRememberLogin = useCallback(rememberLogin => {
        rememberLoginRef.current = rememberLogin;
    }, []);

    const logout = useCallback(() => {
        // postLogout(null, {
        //     userId: user?.userId,
        // });
        _setUser(null);
        sessionStorage.removeItem(TOKEN_NAME);
        localStorage.removeItem(TOKEN_NAME);
    }, []);

    const value = useMemo(() => ({
        autoLoginState,
        logout,
        setRememberLogin,
        setUser,
        user,
    }), [
        autoLoginState,
        logout,
        setRememberLogin,
        setUser,
        user,
    ]);

    return (
        <authContext.Provider value={value}>
            {children}
        </authContext.Provider>
    );
}