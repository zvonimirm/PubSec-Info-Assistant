// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import React from "react";
import ReactDOM from "react-dom/client";
import { HashRouter, Routes, Route } from "react-router-dom";
import { initializeIcons } from "@fluentui/react";

import "./index.css";

import { Layout } from "./pages/layout/Layout";
import NoPage from "./pages/NoPage";
import Chat from "./pages/chat/Chat";
import IntroductionEntry from "./pages/introduction/IntroductionEntry";
import IntroductionGeneral from "./pages/introduction_general/introduction_general";
import IntroductionChat from "./pages/introduction/IntroductionChat";
import { HeaderProvider } from "./components/HeaderProvider";
import Content from "./pages/content/Content";
import Tutor from "./pages/tutor/Tutor";
import { Tda } from "./pages/tda/Tda";
import { useEffect, useState } from "react";
import { ToastContainer } from 'react-toastify';
import './locales/i18n';
import { useTranslation } from "react-i18next";

initializeIcons();


export default function App() {
   


    const { i18n } = useTranslation();
    const [language, setLanguage] = useState("hr");

    useEffect(() => {
        console.log(localStorage.getItem("lang"));
        console.log("INDEX Language changed to:", language);
        i18n.changeLanguage(language);
        localStorage.setItem("lang", language);
      }, [language]);
 

    const [toggle, setToggle] = React.useState('Work');
    return (
        <HeaderProvider>
            <HashRouter>
                <Routes>
                    <Route path="/" element={<Layout />}>
                        {/* <Route index element={<Chat />} /> */}
                        <Route index element={<IntroductionGeneral />} />
                        <Route path="/IntroductionChat" element={<IntroductionChat />} />
                        <Route path="/IntroductionEntry" element={<IntroductionEntry />} />
                        <Route path="/Chat" element={<Chat />} />
                        <Route path="content" element={<Content />} />
                        <Route path="*" element={<NoPage />} />
                        <Route path="tutor" element={<Tutor />} />
                        <Route path="tda" element={<Tda folderPath={""} tags={[]} />} />
                </Route>
                </Routes>
            </HashRouter>   
        </HeaderProvider>

    );
}

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
    <React.StrictMode>
        <App />
        <ToastContainer 
            position="top-center"
            autoClose={3000} 
            hideProgressBar={true}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover/>
    </React.StrictMode>
);