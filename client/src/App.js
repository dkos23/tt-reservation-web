import { Layout, Modal } from "antd";
import React, { Suspense, lazy, useContext, useEffect, useRef } from "react";
// import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import { Route, Routes } from 'react-router-dom'; 

import { Ball } from "./Ball";
import { CookieNotice } from "./CookieNotice";
import { ErrorResult } from "./ErrorResult";
import { Footer } from "./Footer";
import { NavBar } from "./navigation/NavBar";
import { RouterSwitch } from "./navigation/RouterSwitch";
import { appContext } from "./AppContext";
import styles from "./App.module.css";

// const KioskPage = lazy(() =>
//   import("./kiosk/KioskPage").then((m) => ({ default: m.KioskPage }))
// );
// const DemoControls = lazy(() =>
//   import("./demo/DemoControls").then((m) => ({ default: m.DemoControls }))
// );

function App() {
  const { config, state } = useContext(appContext);
  const lastAnnouncementRef = useRef(null);

//   const basename = process.env.PUBLIC_URL;
  // const demoMode = process.env.REACT_APP_DEMO;

  // console.log("demoMode:" + demoMode);
  

  useEffect(() => {
    if (
      config?.announcement &&
      config.announcement !== lastAnnouncementRef.current
    ) {
      lastAnnouncementRef.current = config.announcement;
      Modal.info({
        className: styles.announcement,
        title: "Ankündigung",
        centered: true,
        content: config.announcement,
        zIndex: 1200,
      });
    }
  }, [config]);

  console.log("state:" + JSON.stringify(state, null, 2));

  if (state.error) return <ErrorResult />;

  if (!config) return <Ball visible preloader spin />;

  return (
      <Layout>
        <Suspense fallback={<Ball visible preloader spin />}>
          <Routes>
            {/* <Route
              path="/kiosk"
              element={
                <Layout.Content className={styles.content}>
                  <KioskPage />
                </Layout.Content>
              }
            /> */}

            <Route
              path="*"
              element={
                <>
                  <NavBar />
                  <Layout.Content className={styles.content}>
                    <RouterSwitch />
                  </Layout.Content>
                  <Layout.Footer className={styles.footer}>
                    <Footer />
                  </Layout.Footer>
                  <CookieNotice />
                </>
              }
            />
          </Routes>

          {/* {demoMode && <DemoControls />} */}
        </Suspense>
      </Layout>
  );
}

export default App;
