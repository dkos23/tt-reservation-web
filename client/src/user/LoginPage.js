import { Link, useNavigate, useLocation } from 'react-router-dom';
import React, { useContext, useEffect } from 'react';

import { Alert } from 'antd';
import { LoginForm } from './LoginForm';
import { authContext } from '../AuthContext';
import styles from './LoginPage.module.css';

export function LoginPage() {

    const { user } = useContext(authContext);
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        if (user) {
            const { from } = location.state || { from: { pathname: "/" } };
            navigate(from);
        }
    }, [navigate, location, user])

    return (
        <>
            <div className={styles.cta}>
                <Alert type="info" message={
                    <span>Sie haben noch keinen Account? <Link to="/register">Jetzt&nbsp;Registrieren!</Link></span>
                } />
            </div>
            <div className={styles.wrapper}>
                <h1>Anmelden</h1>

                <LoginForm />
            </div>
        </>
    );
}