import { Link, useNavigate } from 'react-router-dom';
import React, { useCallback, useContext } from 'react';

import { RegisterForm } from './RegisterForm';
import { authContext } from '../AuthContext';
import { postRegisterApi } from '../api';
import styles from './RegisterPage.module.css';
import { useApi } from '../useApi';

export function RegisterPage() {

    const { setUser } = useContext(authContext);
    const [state, register] = useApi(postRegisterApi, setUser);
    const navigate = useNavigate();

    const handleFinishUser = useCallback(({ name, mail, password }) => {
        register(null, {
            name,
            mail,
            password,
        }, () => { 
            navigate('/verify-mail/send');
        });
    }, [register, navigate]);

    return (
        <div className={styles.wrapper}>

            <h1>
                Registrieren
                <div className={styles.loginItem}>
                    <span>Bereits registriert? </span>
                    <Link to="/login">Anmelden</Link>
                </div>
            </h1>

            <RegisterForm
                apiState={state}
                onFinish={handleFinishUser}
            />
        </div>
    );
}