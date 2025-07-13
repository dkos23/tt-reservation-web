import { Button, Space, notification } from 'antd';
import React, { useContext, useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

import { ExperimentOutlined } from '@ant-design/icons';
import { authContext } from '../AuthContext';
import { postLoginApi } from '../api';
import { useApi } from '../useApi';

export const demoControl = {};

export function DemoControls() {

    const { user, setUser } = useContext(authContext);
    const [open, setOpen] = useState(true);
    const [, login] = useApi(postLoginApi, setUser);

    const navigate = useNavigate();
    // demoControl.history = history;
    demoControl.navigate = navigate;

    const location = useLocation();

    useEffect(() => {
        if (!open) {
            notification.close('demo');
            return;
        }

        notification.info({
            key: 'demo',
            message: 'Demo Modus',
            duration: 0,
            placement: 'bottomRight',
            icon: <ExperimentOutlined />,
            onClose: () => setOpen(false),
            description: (
                <>
                    <p>Dies ist eine Demo, gefüllt mit Beispieldaten.</p>
                    <Space direction="vertical">
                        {location.pathname === '/kiosk' ?
                            (
                                <Button size="middle" onClick={() => navigate('/')}>
                                    Kiosk Modus verlassen
                                </Button>
                            ) : (
                                <>
                                    <Button size="middle" onClick={() => navigate('/kiosk')}>
                                        Kiosk Modus
                                    </Button>
                                    {user?.userId !== 2 &&
                                        <Button size="middle" onClick={() => login(null, {
                                            type: 'plain',
                                            mail: 'otto@example.com',
                                            password: 'demo',
                                        })}>
                                            Als Admin (Otto) anmelden
                                        </Button>
                                    }
                                    {user?.userId !== 9 &&
                                        <Button size="middle" onClick={() => login(null, {
                                            type: 'plain',
                                            mail: 'max@example.com',
                                            password: 'demo',
                                        })}>
                                            Als Nutzer (Max) anmelden
                                        </Button>
                                    }
                                </>
                            )
                        }
                        <Button size="middle" type="primary" onClick={() => setOpen(false)}>
                            Ausblenden
                        </Button>
                    </Space>
                </>
            ),
        });
    }, [open, navigate, location, user, login]);

    if (!open)
        return (
            <Button 
                style={{ position: 'fixed', bottom: 5, right: 5 }}
                type="primary" 
                onClick={() => setOpen(true)}
            >
                Demosteuerung einblenden
            </Button>
        );

    return null;
}