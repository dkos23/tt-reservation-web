import React, { useContext } from 'react';

import { appContext } from '../AppContext';
import styles from './LegalPrivacyPage.module.css';

export function LegalPrivacyPage() {
    const { templates: { legalPrivacy } } = useContext(appContext);

    return (
        <div className={styles.wrapper}>
            <div dangerouslySetInnerHTML={{ __html: legalPrivacy.body }} />
        </div>
    );
}