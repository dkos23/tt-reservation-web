import { Button, Result, Space } from 'antd';
import React, { useCallback, useContext, useEffect, useState } from 'react';
import { postSendVerifyMailApi, postVerifyMailApi } from '../api';
import { useNavigate, useParams } from 'react-router-dom';

import { Ball } from '../Ball';
import { ErrorResult } from '../ErrorResult';
import { authContext } from '../AuthContext';
import styles from './VerifyMailPage.module.css';
import { useApi } from '../useApi';

export function VerifyMailPage() {

    const { user, setUser } = useContext(authContext);
    const navigate = useNavigate();
    const { verifyToken } = useParams();

    const send = verifyToken === 'send';
    const [sendState, sendMail] = useApi(postSendVerifyMailApi);
    const [verifyState, verifyMail] = useApi(postVerifyMailApi, setUser);
    const [resendClicked, setResendClicked] = useState(false);

    const handleCalendarClick = useCallback(() => {
        navigate('/');
    }, [navigate]);

    const handleChangeMailClick = useCallback(() => {
        navigate('/profile');
    }, [navigate]);

    const handleResendMail = useCallback(() => {
        setResendClicked(true);
        sendMail(null, { mail: user.mail });
    }, [sendMail, user.mail]);

    useEffect(() => {
        if (send)
            sendMail(null, { mail: user.mail });
    }, [send, sendMail, user.mail]);

    useEffect(() => {
        if (!send)
            verifyMail(null, { token: verifyToken });
    }, [send, verifyMail, verifyToken]);

    if (send)
        return (
            <div className={styles.wrapper}>
                <Result
                    status="info"
                    title="Bitte bestätigen Sie Ihre E-Mail Adresse"
                    extra={
                        <div>
                            <div>
                                Es wurde soeben eine Mail mit einem Bestätigungslink an <strong>{user?.mail}</strong> versandt.
                            </div>
                            <br />
                            <div>
                                Klicken Sie auf den Bestätigungslink, um ihre E-Mail Adresse zu verifizieren.
                            </div>
                            <div className={styles.buttons}>
                                <Button 
                                    type="link" 
                                    onClick={handleResendMail}
                                    disabled={sendState.loading || resendClicked}
                                >
                                    Bestätigungslink erneut senden
                                </Button>
                                <Button type="link" onClick={handleChangeMailClick}>
                                    E-Mail Adresse ändern
                                </Button>
                            </div>
                        </div>
                    }
                />
            </div>
        );

    if (verifyState.error)
        return <ErrorResult />

    if (verifyState.loading)
        return <Ball visible large spin />;
    
    return (
        <div className={styles.wrapper}>
            <Result
                status="success"
                title="E-Mail erfolgreich bestätigt."
                extra={
                    <Space direction="vertical" size="large">
                        <Button type="primary" onClick={handleCalendarClick}>
                            Zum Kalender
                        </Button>
                    </Space>
                }
            />
        </div>
    );
}