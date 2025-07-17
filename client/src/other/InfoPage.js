import React, { useContext } from 'react';

import { appContext } from '../AppContext';
import { ErrorResult } from '../ErrorResult';
import styles from './InfoPage.module.css';

export function InfoPage() {
    const { templates } = useContext(appContext);
    const infoPage = templates?.infoPage;

    if (!infoPage || !infoPage.body) {
        return <ErrorResult />;
    }

    return (
        <div className={styles.wrapper}>
            <div dangerouslySetInnerHTML={{ __html: infoPage.body }} />
        </div>
    );
}