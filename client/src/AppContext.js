import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { UPDATE_INTERVALS_SEC } from './updateIntervals';
import dayjs from 'dayjs';
import deepEqual from 'deep-equal';
import { getBaseDataApi } from './api';
import { getTemplatesApi } from './api';
import { useApi } from './useApi';
import { useUpdateEffect } from './useUpdateEffect';

export const appContext = React.createContext();

export function AppContextProvider({ children }) {

    const [config, setConfig] = useState();
    const [courts, setCourts] = useState();
    const [templates, setTemplates] = useState();

    const [getTemplatesState, getTemplates] = useApi(getTemplatesApi, setTemplates, true);

    useEffect(() => {
        console.log('Fetching templates...');
        getTemplates();
    }, [getTemplates]);

    useEffect(() => {
        // console.log("📦 Received templates:", templates);
        console.log("📦 Received templates");
    }, [templates]);

    const setBaseData = useCallback(getResult => {
        const result = getResult();
    
        // console.log("✅ Base Data Response:", result);
    
        if (!result) {
            console.warn("🚨 No data received from API call!");
            return;
        }
    
        const { config, courts, templates } = result;
    
        if (!config) {
            console.warn("🚨 Config is missing in API response!");
            return;
        }
    
        setConfig(cur => deepEqual(cur, config) ? cur : config);
        setTemplates(cur => deepEqual(cur, templates) ? cur : templates);
        setCourts(cur => deepEqual(cur, courts) ? cur : courts);
    }, []);

    const [getBaseDataState, getBaseData] = useApi(getBaseDataApi, setBaseData, true);

    useEffect(() => {
        console.log("Fetching initial base data...");
        getBaseData();  // manually triggers API fetch
    }, [getBaseData]);

    console.log("useApi() initialized in AppContext.js, waiting for API call...");
    useUpdateEffect(getBaseData, UPDATE_INTERVALS_SEC.BASE_DATA);

    useEffect(() => {
        dayjs.tz.setDefault(config?.timeZone);
    }, [config?.timeZone])

    const value = useMemo(() => ({
        config,
        courts,
        templates,
        setConfig,
        setCourts,
        setTemplates,
        state: getBaseDataState,
        reload: getBaseData,
    }), [
        config,
        courts,
        templates,
        getBaseDataState,
        getBaseData,
    ]);

    if (!config || !config.visibleHours) {
        console.warn("⚠️ AppContext: Waiting for config before rendering children.");
        return null; // Don't render app until config is ready
    }

    return (
        <appContext.Provider value={value}>
            {children}
        </appContext.Provider>
    );
}