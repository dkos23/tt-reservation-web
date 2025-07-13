import { Button, Result } from 'antd';
import React, { useCallback, useContext, useEffect } from 'react';

import { authContext } from '../AuthContext';
import styles from './LogoutPage.module.css';
import { useNavigate } from 'react-router-dom';

export function LogoutPage() {

    const { logout } = useContext(authContext);
    const navigate = useNavigate();
    
    useEffect(() => logout(), [logout]);

    const handleLoginClick = useCallback(() => {
        navigate('/login');
    }, [navigate]);

    const handleCalendarClick = useCallback(() => {
        navigate('/');
    }, [navigate]);

    return (
        <div className={styles.wrapper}>
            <Result
                status="success"
                title="Erfolgreich abgemeldet"
                extra={
                    <div className={styles.buttons}>
                        <Button type="primary" onClick={handleCalendarClick}>
                            Zurück zum Kalender
                        </Button>
                        <Button onClick={handleLoginClick}>
                            Erneut Anmelden
                        </Button>
                    </div>
                }
            />
        </div>
    );
}