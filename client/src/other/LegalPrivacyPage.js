import React, { useContext } from 'react';

import { appContext } from '../AppContext';
import { ErrorResult } from '../ErrorResult';
import styles from './LegalPrivacyPage.module.css';

export function LegalPrivacyPage() {
    const { templates: { legalPrivacy } } = useContext(appContext);

    if (!legalPrivacy || !legalPrivacy.body) {
            return <ErrorResult />;
        }

    return (
        <div className={styles.wrapper}>
            <div dangerouslySetInnerHTML={{ __html: legalPrivacy.body }} />
        </div>
    );
}