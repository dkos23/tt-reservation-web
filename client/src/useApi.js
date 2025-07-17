import { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';

import { authContext } from './AuthContext';

const defaultSetFunc = ({ res }) => res;

// WARNING: function reference to 'call' changes when 
// user.token or user.userId changes
export function useApi(
    {
        url,
        method = 'GET',
        // res must return new state
        // signature: ({ cur, params, req, res }) => updatedData
        setFunc = defaultSetFunc,
        prepareBody = null,
    },
    // setData is called in any case after fetch was successful
    // even if call was cancelled 
    setData,
    // autoFetch can be boolean or object like { reqParams, reqData }
    // will trigger refetch when instance changes
    autoFetch = false,
) {
    const { user, logout } = useContext(authContext) || {};
    const userToken = user?.token;
    const [success, setSuccess] = useState(false);
    const [status, setStatus] = useState(null);
    const [loading, setLoading] = useState(!!autoFetch);
    const [error, setError] = useState(null);
    const lastCallRef = useRef(null);

    // reqParams like { query: { example: 1 }, path: { id: 4 }}
    const call = useCallback((reqParams, reqData, successCallback) => {
        const safeReqData = reqData && typeof reqData === 'object'
            ? { ...reqData, password: reqData.password ? '******' : undefined }
            : reqData;
        console.log("useApi call() triggered with:", { reqParams, safeReqData });
    
        if (lastCallRef.current)
            lastCallRef.current.cancel();
    
        let cancelled = false;
    
        const doFetch = async () => {
            // console.log("API call starting for:", url);
            setSuccess(false);
            setStatus(null);
            setLoading(true);
            let is401 = false;
    
            try {
                let parameterizedUrl = Object.keys(reqParams?.path || {})
                    .reduce((acc, param) => acc.replace(`:${param}`, reqParams.path[param]), url);
                const queryString = Object.keys(reqParams?.query || {})
                    .map((key) => `${encodeURIComponent(key)}=${encodeURIComponent(reqParams.query[key])}`)
                    .join('&');
                if (queryString)
                    parameterizedUrl += `?${queryString}`;
                
                const headers = {};
                if (userToken)
                    headers['Authorization'] = `Bearer ${userToken}`;
                if (reqData)
                    headers['Content-Type'] = 'application/json';
    
                if (cancelled) return;

                // const response = await fetch(parameterizedUrl, {
                //     method,
                //     headers,
                //     body: reqData ? JSON.stringify(reqData) : undefined,
                // });

                // if (reqData) {
                //     console.log("🚀 POST payload being sent:", JSON.stringify(reqData, null, 2));
                //     console.log('🚀 Sending fetch to', parameterizedUrl, 'with body:', reqData);
                // }

                // const response = await fetch(parameterizedUrl, {
                //     method,
                //     headers: {
                //         "Authorization": userToken ? `Bearer ${userToken}` : undefined,
                //         "Content-Type": reqData ? "application/json" : undefined,
                //     },
                //     body: reqData ? JSON.stringify(reqData) : undefined,
                // });
                const finalBody = typeof prepareBody === 'function'
                    ? prepareBody(reqData)
                    : reqData;

                // console.log('📦 Final POST body after prepareBody:', finalBody);

                const response = await fetch(parameterizedUrl, {
                    method,
                    headers: {
                        "Authorization": userToken ? `Bearer ${userToken}` : undefined,
                        "Content-Type": finalBody ? "application/json" : undefined,
                        // "Cache-Control": "no-cache"
                    },
                    body: finalBody ? JSON.stringify(finalBody) : undefined,
                });
    
                // console.log("Response status:", response.status);

                if (response.status === 304) {
                    console.log("Received 304, skipping setFunc");
                }

                if (!cancelled) setStatus(response.status);
    
                // const resData = await response.json();
                let resData;
                try {
                    resData = await response.json();
                } catch {
                    console.error("useApi - resData await error!");
                    resData = {};
                }
                // console.log("API Response Data:", resData);
    
                if (response.ok) {
                    console.log("API call success, calling setData...");
                    if (setData) {
                        // console.log("🛠 Calling setData function with resData:", resData);
                        setData(cur => setFunc({
                            cur,
                            params: reqParams,
                            req: reqData,
                            res: resData,
                        }));
                    } else {
                        console.warn("🚨 setData is undefined! setBaseData will NOT be called.");
                    }
                    if (!cancelled) {
                        setSuccess(true);
                        if (successCallback) successCallback();
                    }
                } else {
                    if (!cancelled) setError(resData);
                    is401 = response.status === 401;
                }
            } catch (err) {
                console.error("API call error:", err);
                if (!cancelled) setError(err);
            } finally {
                if (!cancelled) setLoading(false);
                if (is401) logout?.();
            }
        };
    
        const task = doFetch();
        task.cancel = () => cancelled = true;
        lastCallRef.current = task;
        return task.cancel;
    }, [logout, method, setData, setFunc, url, userToken]);
    
    // const call = useCallback((reqParams, reqData, successCallback) => {
    //     if (lastCallRef.current)
    //         lastCallRef.current.cancel();

    //     let cancelled = false;

    //     const doFetch = async () => {
    //         setSuccess(false);
    //         setStatus(null);
    //         setLoading(true);
    //         let is401 = false;
    //         try {
    //             let parameterizedUrl = Object.keys(reqParams?.path || {})
    //                 .reduce((acc, param) => acc.replace(`:${param}`, reqParams.path[param]), url);
    //             const queryString = Object.keys(reqParams?.query || {})
    //                 .map((key) => `${encodeURIComponent(key)}=${encodeURIComponent(reqParams.query[key])}`)
    //                 .join('&');
    //             if (queryString)
    //                 parameterizedUrl += `?${queryString}`;
                
    //             const headers = {};
    //             if (userToken)
    //                 headers['Authorization'] = `Bearer ${userToken}`;
    //             if (reqData)
    //                 headers['Content-Type'] = 'application/json';
                
    //             if (cancelled) 
    //                 return;

    //             const response = await fetch(parameterizedUrl, {
    //                 method,
    //                 headers,
    //                 body: reqData ? JSON.stringify(reqData) : undefined,
    //             });

    //             if (!cancelled)
    //                 setStatus(response.status);

    //             const resData = await response.json();

    //             if (response.ok) {
    //                 if (setData)
    //                     setData(cur => setFunc({
    //                         cur, 
    //                         params: reqParams,
    //                         req: reqData, 
    //                         res: resData,
    //                     }));
    //                 if (!cancelled) {
    //                     setSuccess(true);
    //                     if (successCallback)
    //                         successCallback();
    //                 }
    //             } else {
    //                 if (!cancelled)
    //                     setError(resData);
    //                 is401 = response.status === 401;
    //             }
    //         } catch (err) {
    //             if (!cancelled)
    //                 setError(err);
    //         } finally {
    //             if (!cancelled)
    //                 setLoading(false);
    //             if (is401)
    //                 logout?.();
    //         }
    //     };

    //     const task = doFetch();
    //     task.cancel = () => cancelled = true;
    //     lastCallRef.current = task;
    //     return task.cancel;
    // }, [
    //     logout, // changes when user.userId changes
    //     method,
    //     setData,
    //     setFunc,
    //     url,
    //     userToken,
    // ]);

    useEffect(() => {
        if (autoFetch)
            call(autoFetch?.reqParams, autoFetch?.reqData);
    }, [autoFetch, call])

    useEffect(() => {
        return () => lastCallRef.current?.cancel?.();
    }, []);

    return useMemo(() => ([
        {
            success,
            loading,
            error,
            status,
        },
        call, // see hint at top of file
    ]), [
        success,
        loading,
        error,
        status,
        call,
    ]);
}