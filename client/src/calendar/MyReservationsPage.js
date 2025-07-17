import { Empty, Space } from 'antd';
import React, { useCallback, useContext, useMemo, useState, useEffect } from 'react';

import { Ball } from '../Ball';
import { ErrorResult } from '../ErrorResult';
import { ReservationDetailsCard } from './ReservationDetailsCard';
import { ReservationModal } from './ReservationModal';
import { authContext } from '../AuthContext';
import { getReservationsApi } from '../api';
import styles from './MyReservationsPage.module.css';
import { useApi } from '../useApi';
import { useTime } from './useTime';

export function MyReservationsPage() {
    const { user, autoLoginState } = useContext(authContext);
    const userId = user?.userId;

    const time = useTime('hour');
    const [selectedReservation, setSelectedReservation] = useState();

    //LOG:
    // useEffect(() => {
    //     console.log("✅ userId =", userId);
    //     console.log("⏳ autoLoginState.loading =", autoLoginState.loading);
    // }, [userId, autoLoginState.loading]);

    const autoFetch = useMemo(() => {
        // if (!userId) return false;
        if (!userId || autoLoginState.loading) return false;
        return {
            reqParams: {
                query: {
                    'user-id': userId,
                    start: time.startOf('hour').toISOString(),
                }
            }
        };
    }, [time, userId, autoLoginState.loading]);

    const [reservations, setReservations] = useState([]);
    const [state] = useApi(getReservationsApi, setReservations, autoFetch);

    //LOG:
    // useEffect(() => {
    //     console.log("📥 Reservations loaded:", reservations);
    // }, [reservations]);

    const sortedReservations = useMemo(() => {
        const s = [...reservations];
        s.sort((a, b) => a.from - b.from);
        return s;
    }, [reservations]);

    const handleEditClick = useCallback(reservation => {
        setSelectedReservation(reservation);
    }, []);

    const handleReservationEditFinish = useCallback(() => {
        setSelectedReservation(null);
    }, []);

    if (!userId) {
        return (
            <div className={styles.wrapper}>
                <Ball visible spin large centered />
            </div>
        );
    }

    if (state.error) {
        return (
            <div className={styles.wrapper}>
                <ErrorResult />
            </div>
        );
    }

    if (state.loading && !sortedReservations?.length) {
        return (
            <div className={styles.wrapper}>
                <Ball visible spin large centered />
            </div>
        );
    }

    return (
        <div className={styles.wrapper}>
            {!sortedReservations?.length && (
                <div className={styles.content}>
                    <Empty
                        className={styles.empty}
                        description="Keine Reservierungen"
                    />
                </div>
            )}

            {sortedReservations?.length > 0 && (
                <>
                    <h1>Nächste Reservierung</h1>
                    <div className={styles.content}>
                        <ReservationDetailsCard
                            reservation={sortedReservations[0]}
                            onEditClick={handleEditClick}
                        />
                    </div>
                </>
            )}

            {sortedReservations?.length > 1 && (
                <>
                    <h1>Weitere Reservierungen</h1>
                    <div className={styles.content}>
                        <Space className={styles.cardList} direction="vertical">
                            {sortedReservations.slice(1).map(reservation => (
                                <ReservationDetailsCard
                                    key={reservation.id}
                                    reservation={reservation}
                                    onEditClick={handleEditClick}
                                />
                            ))}
                        </Space>
                    </div>
                </>
            )}

            {selectedReservation && (
                <ReservationModal
                    reservation={selectedReservation}
                    onFinish={handleReservationEditFinish}
                    setReservations={setReservations}
                />
            )}
        </div>
    );
}
