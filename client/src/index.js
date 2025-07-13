import 'antd/dist/antd.css';
import './index.css';
import 'dayjs/locale/de';
import 'fontsource-inter/latin-400.css';
import 'fontsource-inter/latin-600.css';

import * as serviceWorker from './serviceWorker';

import App from './App';
import { AppContextProvider } from './AppContext';
import { AuthContextProvider } from './AuthContext';
import { ConfigProvider } from 'antd';
import { BrowserRouter } from 'react-router-dom';
import React from 'react';
import ReactDOM from 'react-dom/client';
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import locale from 'antd/lib/locale/de_DE';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import weekOfYear from 'dayjs/plugin/weekOfYear';
import weekYear from 'dayjs/plugin/weekYear';

dayjs.extend(weekOfYear);
dayjs.extend(weekYear);
dayjs.extend(localizedFormat);
dayjs.extend(isBetween);
dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.locale('de');

function renderApp() {
    const root = ReactDOM.createRoot(document.getElementById("root"));

    root.render(
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <ConfigProvider locale={locale}>
                <AppContextProvider>
                    <AuthContextProvider>
                        <App />
                    </AuthContextProvider>
                </AppContextProvider>
            </ConfigProvider>
        </BrowserRouter>
    );
}

// ✅ Ensure Mock API is Enabled in Demo Mode
if (process.env.REACT_APP_DEMO) {
    console.log("🟢 Demo mode enabled. Initializing mock API...");
    import('./demo/mockApi').then(mockApi => {
        mockApi.patchFetch();
        console.log("✅ Mock API initialized!");
        renderApp();
    }).catch(error => {
        console.error("❌ Failed to load mock API:", error);
    });
} else {
    renderApp();
}

// If you want your app to work offline and load faster, you can change
// unregister() to register() below.
serviceWorker.unregister();
