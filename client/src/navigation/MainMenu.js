import { BulbOutlined, CalendarOutlined, CarryOutOutlined, SettingOutlined, UserOutlined } from '@ant-design/icons';
import { Button, Menu } from 'antd';
import React, { useCallback, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

import { StatusText } from '../admin/StatusText';
import { authContext } from '../AuthContext';
import classNames from 'classnames/bind';
import styles from './MainMenu.module.css';

const cn = classNames.bind(styles);

export function MainMenu({ horizontal = false, onClick }) {
    const { autoLoginState, user } = useContext(authContext);
    const { pathname } = useLocation();
    const navigate = useNavigate();

    const handleClick = useCallback(({ key }) => {
        if (onClick) onClick(key);
        if (pathname !== key) navigate(key);
    }, [navigate, pathname, onClick]);

    const menuItems = [
        {
            key: "/",
            icon: <CalendarOutlined />,
            label: "Reservierungskalender"
        },
        ...(user
            ? [{
                key: "/my-reservations",
                icon: <CarryOutOutlined />,
                label: "Meine Reservierungen"
            }]
            : []),
        {
            key: "/info",
            icon: <BulbOutlined />,
            label: "Hinweise"
        },
        ...(user?.admin
            ? [{
                key: "admin",
                icon: <SettingOutlined />,
                label: "Verwaltung",
                children: [
                    { key: "/admin/general", label: "Allgemein" },
                    { key: "/admin/stats", label: "Statistiken" },
                    { key: "/admin/users", label: "Nutzerverwaltung" },
                    { key: "/admin/templates", label: "Textvorlagen" }
                ]
            }]
            : []),
        ...(user
            ? [{
                key: "/profile",
                icon: <UserOutlined />,
                label: "Mein Benutzerkonto"
            }]
            : [])
    ];

    return (
        <>
            <Menu
                className={cn({ menu: true, horizontal })}
                mode={horizontal ? 'horizontal' : 'inline'}
                theme='light'
                selectedKeys={[pathname]}
                onClick={handleClick}
                items={menuItems} // ✅ NEW items prop
            />

            {autoLoginState.loading && (
                <StatusText 
                    className={cn({ menuButton: true, horizontal })}
                    loading
                    text="Anmeldung..."
                />
            )}

            {user ? (
                <Button
                    className={cn({ menuButton: true, horizontal })}
                    onClick={() => handleClick({ key: '/logout' })}
                >
                    Abmelden
                </Button>
            ) : (
                <>
                    <Button
                        className={cn({ menuButton: true, horizontal })}
                        onClick={() => handleClick({ key: '/login' })}
                    >
                        Anmelden
                    </Button>

                    <Button
                        className={cn({ menuButton: true, horizontal })}
                        type="primary"
                        onClick={() => handleClick({ key: '/register' })}
                    >
                        Kostenlos Registrieren
                    </Button>
                </>
            )}
        </>
    );
}
