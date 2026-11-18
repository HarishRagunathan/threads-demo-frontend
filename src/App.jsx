import { pages } from "./config/pages.js";
import { Toast } from "./components/ui/Toast.jsx";
import { AppFooter } from "./components/layout/AppFooter.jsx";
import { DemoBanner } from "./components/layout/DemoBanner.jsx";
import { Topbar } from "./components/layout/Topbar.jsx";
import { Sidebar } from "./components/layout/Sidebar.jsx";
import React, { useState, useRef, useEffect } from "react";
import { api } from "./lib/api.js";
import { Loading } from "./components/ui/Loading.jsx";
import { Login } from "./features/auth/LoginPage.jsx";
import { Ctx } from "./context/AppContext.jsx";

export function App() {
  const [user, setUser] = useState(null),
    [ready, setReady] = useState(false),
    [page, setPage] = useState("dashboard"),
    [mobile, setMobile] = useState(false),
    [toast, setToast] = useState("");
  const [settings, setSettings] = useState({});
  const timer = useRef();
  useEffect(() => {
    api("/auth/me")
      .then(setUser)
      .catch(() => {})
      .finally(() => setReady(true));
  }, []);
  useEffect(() => {
    if (user)
      api("/settings")
        .then(setSettings)
        .catch((e) => notify(e.message));
  }, [user]);
  const notify = (message) => {
    setToast(message);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setToast(""), 5000);
  };
  const go = (p) => {
    setPage(p);
    setMobile(false);
  };
  if (!ready) return <Loading />;
  if (!user)
    return (
      <Login
        onLogin={(u) => {
          setUser(u);
          setPage("dashboard");
        }}
      />
    );
  const Page = pages[page] || pages.dashboard;
  return (
    <Ctx.Provider value={{ user, settings, setSettings, notify, go, setUser }}>
      <div className="app">
        <Sidebar
          mobile={mobile}
          user={user}
          go={go}
          page={page}
          setUser={setUser}
        />
        <div className="main-shell">
          <Topbar
            setMobile={setMobile}
            mobile={mobile}
            page={page}
            user={user}
          />
          <main>
            <DemoBanner />
            <Page key={page} />
          </main>
          <AppFooter />
        </div>
        {toast && <Toast toast={toast} setToast={setToast} />}
      </div>
    </Ctx.Provider>
  );
}
