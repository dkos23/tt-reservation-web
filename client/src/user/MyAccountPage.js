import { Alert, Button, Divider, Typography } from 'antd';
import { Link, useNavigate } from 'react-router-dom';
import React, { useCallback, useContext } from 'react';

import { RegisterForm } from './RegisterForm';
import { authContext } from '../AuthContext';
import { patchUserApi } from '../api';
import styles from './MyAccountPage.module.css';
import { useApi } from '../useApi';

export function MyAccountPage() {

    const { user, setUser } = useContext(authContext);
    const [putState, patchUser] = useApi(patchUserApi, setUser);
    const navigate = useNavigate();

    const handleFinishUser = useCallback(({ name, mail, password }) => {
        const update = { userId: user.userId };
        if (name !== user.name)
            update.name = name;
        if (mail !== user.mail)
            update.mail = mail;
        if (password)
            update.password = password;

        patchUser({ path: { userId: user.userId } }, update, () => {
            if (mail !== user.mail)
                navigate('/verify-mail/send');
        });
    }, [patchUser, user, navigate]);

    return (
        <div className={styles.wrapper}>
            <h1>Benutzerkonto</h1>

            {!user.verified &&
                <Alert
                    className={styles.alert}
                    type="warning"
                    showIcon
                    message={
                        <div>
                            E-Mail Adresse nicht verifziert! <Link to="/verify-mail/send">Erneut senden</Link>
                        </div>
                    }
                />
            }

            <RegisterForm
                apiState={putState}
                onFinish={handleFinishUser}
                user={user}
            />

            <Divider />

            <h1>Datenschutz</h1>
            <div className={styles.buttonWrapper}>
                <Button disabled>
                    Datenauskunft anfordern
                </Button>
                <div>Sie erhalten eine Mail mit einer Übersicht über alle Ihre gespeicherten Daten.</div>
            </div>
            <div className={styles.buttonWrapper}>
                <Button disabled>
                    Alle Daten löschen
                </Button>
                <Typography.Text type="danger">Diese Aktion kann nicht rückgängig gemacht werden.</Typography.Text>
                <div>Es werden alle Ihre Daten (Reservierungen und Benutzerkonto) endgültig gelöscht.</div>
            </div>

        </div>
    );
}