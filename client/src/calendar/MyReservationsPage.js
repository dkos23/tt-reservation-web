import { Empty, Space } from 'antd';
import React, { useCallback, useContext, useMemo, useState } from 'react';

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

    const { user: { userId } } = useContext(authContext);

    const time = useTime('hour');
    const [selectedReservation, setSelectedReservation] = useState();

    const autoFetch = useMemo(() => ({
        reqParams: {
            query: {
                'user-id': userId,
                start: time.startOf('hour').toISOString(),
            }
        }
    }), [time, userId]);

    const [reservations, setReservations] = useState([]);
    const [state,] = useApi(getReservationsApi, setReservations, autoFetch); 

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

    if (state.error)
        return (
            <div className={styles.wrapper}>
                <ErrorResult />
            </div>
        );
    
    // length check prevents flickering when refetch
    if (state.loading && !sortedReservations?.length)
        return (
            <div className={styles.wrapper}>
                <Ball visible spin large centered />
            </div>
        );

    return (
        <div className={styles.wrapper}>
            {!sortedReservations?.length &&
                <div className={styles.content}>
                    <Empty
                        className={styles.empty}
                        description="Keine Reservierungen"
                    />
                </div>
            }

            {sortedReservations?.length > 0 &&
                <>
                    <h1>Nächste Reservierung</h1>
                    <div className={styles.content}>
                        <ReservationDetailsCard
                            reservation={sortedReservations[0]}
                            onEditClick={handleEditClick}
                        />
                    </div>
                </>
            }

            {sortedReservations?.length > 1 &&
                <>
                    <h1>Weitere Reservierungen</h1>

                    <div className={styles.content}>
                        <Space className={styles.cardList} direction="vertical">
                            {sortedReservations.map((reservation, i) => {
                                if (i === 0)
                                    return null;
                                return (
                                    <ReservationDetailsCard
                                        key={reservation.id}
                                        reservation={reservation}
                                        onEditClick={handleEditClick}
                                    />
                                );
                            })}
                        </Space>
                    </div>
                </>
            }

            {selectedReservation &&
                <ReservationModal
                    reservation={selectedReservation}
                    onFinish={handleReservationEditFinish}
                    setReservations={setReservations}
                />
            }
        </div>
    );
}