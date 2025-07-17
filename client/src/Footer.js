import React, { useContext } from 'react';

import { Link } from 'react-router-dom';
import { appContext } from './AppContext';
import dayjs from 'dayjs';

export function Footer({
    noLinks,
}) {
    const { config: { orgName } } = useContext(appContext);

    const version = process.env.REACT_APP_VERSION;

    return (
        <>
            {!noLinks &&
                <p>
                    <Link to="/legalnotice-privacy">Impressum / Datenschutz</Link>
                </p>
            }
            <p>
                {`©${dayjs().format('YYYY')} ${orgName} - v${version} - entwickelt von `}
                {/* {noLinks 
                    ? <span>Alexander&nbsp;D</span>
                    : <a target="_blank" rel="noopener noreferrer" href="https://github.com/dkos23/tt-reservation-web">Dalibor&nbsp;Kos</a>
                } */}
                <span>Dalibor Kos</span>
            </p>
        </>
    );
}