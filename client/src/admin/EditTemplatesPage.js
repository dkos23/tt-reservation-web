import { MailTemplatesPane } from './MailTemplatesPane';
import React from 'react';
import { Tabs } from 'antd';
import { TemplateEditor } from './TemplateEditor';
import styles from './EditTemplatesPage.module.css';

export function EditTemplatesPage() {
    const items = [
        {
            label: 'Hinweis-Seite',
            key: '2',
            children: (
                <div className={styles.content}>
                    <TemplateEditor id="infoPage" />
                </div>
            ),
        },
        {
            label: 'Impressum / Datenschutz',
            key: 'i',
            children: (
                <div className={styles.content}>
                    <TemplateEditor
                        id="legalPrivacy"
                        extra={
                            <>
                                <h2>Rechtliche Informationen</h2>
                                <div>
                                    <div>Folgende Informationen sollten in die Datenschutzerklärung eingebracht werden.</div>
                                    <ul>
                                        <li>
                                            Das System verwendet eine zu Cookies ähnliche Technologie, 
                                            um Basisfunktionen wie die Nutzeranmeldung zu ermöglichen.
                                        </li>
                                        <li>Es werden keinerlei Daten mit Dritten ausgetauscht.</li>
                                        <li>Es werden keine Tracking Cookies gesetzt.</li>
                                        <li>
                                            Das System hat ein eingebautes Tracking-System, um Seitenaufrufe, etc. zu zählen. <br />
                                            Dazu werden Anfragen an den Server ausgewertet. Aus den Informationen der Anfrage wird für jeden Nutzer
                                            ein Fingerprint erstellt, um die Anzahl der Aufrufe in Abhängigkeit unterschiedlicher Nutzer zählen zu können. 
                                            Dabei werden keine personenbezogenen Daten gespeichert oder weitergegeben. 
                                            Der Fingerprint erneuert sich täglich, damit keine Nutzerprofile erstellt werden können. 
                                        </li>
                                    </ul>
                                </div>
                            </>
                        }
                    />
                </div>
            ),
        },
        {
            label: 'Reservierungsdialog',
            key: '1',
            children: (
                <div className={styles.content}>
                    <TemplateEditor
                        id="reservationTos"
                        extra={
                            <>
                                <div>Der Nutzer wird während einer Reservierung dazu aufgefordert, oben stehende Hinweise / Ordnung zu akzeptieren.</div>
                            </>
                        }
                    />
                </div>
            ),
        },
        {
            label: 'Registrierung',
            key: '7',
            children: (
                <div className={styles.content}>
                    <h1>Nutzungsbedingungen</h1>
                    <TemplateEditor
                        id="systemTos"
                        extra="Der Nutzer muss diese Nutzungsbedingungen akzeptieren, um sich Registrieren zu können."
                    />
                </div>
            ),
        },
        {
            label: 'E-Mail Vorlagen',
            key: '3',
            children: (
                <div className={styles.content}>
                    <MailTemplatesPane />
                </div>
            ),
        },
    ];

    return (
        <div className={styles.wrapper}>
            <Tabs className={styles.tabs} type="card" items={items} />
        </div>
    );
}
