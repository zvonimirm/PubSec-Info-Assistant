// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { Outlet, NavLink, Link } from "react-router-dom";
import openai from "../../assets/asee-logo.svg";
import legalAssistant from "../../assets/icon-legal-ai.webp";
import { WarningBanner } from "../../components/WarningBanner/WarningBanner";
import styles from "./Layout.module.css";
import { Title } from "../../components/Title/Title";
import { getFeatureFlags, GetFeatureFlagsResponse } from "../../api";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useHeader } from "../../components/HeaderProvider";


export const Layout = () => {
    const { showHeader } = useHeader();
    const [featureFlags, setFeatureFlags] = useState<GetFeatureFlagsResponse | null>(null);
    
    async function fetchFeatureFlags() {
        try {
            const fetchedFeatureFlags = await getFeatureFlags();
            setFeatureFlags(fetchedFeatureFlags);
        } catch (error) {
            // Handle the error here
            console.log(error);
        }
    }
    
    const { t } = useTranslation();
    useEffect(() => {
        fetchFeatureFlags();
    }, []);

    return (
        
        <div className={styles.layout}>
            <>
            {showHeader && <header className={styles.header} role={"banner"}>
                <WarningBanner />
                <div className={styles.headerContainer}>
                    <div className={styles.headerTitleContainer}>
                        <img src={openai} alt="Azure OpenAI" className={styles.headerLogo} />
                        <h3 className={styles.headerTitle}>Finley</h3>
                    </div>
                    <nav>
                        <ul className={styles.headerNavList}>
                            <li>
                                <NavLink to="/" className={({ isActive }) => (isActive ? styles.headerNavPageLinkActive : styles.headerNavPageLink)}>
                                    {t('Layout.Razgovor')}
                                </NavLink>
                            </li>
                            <li className={styles.headerNavLeftMargin}>
                                <NavLink to="/content" className={({ isActive }) => (isActive ? styles.headerNavPageLinkActive : styles.headerNavPageLink)}>
                                    {t("Layout.Sadrzaj")}
                                </NavLink>
                            </li>
                            {featureFlags?.ENABLE_MATH_ASSISTANT &&
                                <li className={styles.headerNavLeftMargin}>
                                    <NavLink to="/tutor" className={({ isActive }) => (isActive ? styles.headerNavPageLinkActive : styles.headerNavPageLink)}>
                                    Math Assistant
                                    <br />  
                                    <p className={styles.centered}>(preview)</p>
                                    </NavLink>
                                </li>
                            }
                            {featureFlags?.ENABLE_TABULAR_DATA_ASSISTANT &&
                                <li className={styles.headerNavLeftMargin}>
                                    <NavLink to="/tda" className={({ isActive }) => (isActive ? styles.headerNavPageLinkActive : styles.headerNavPageLink)}>
                                    Tabular Data Assistant
                                    <br />  
                                    <p className={styles.centered}>(preview)</p>
                                    </NavLink>
                                    
                                      
                                </li>
                            }
                    </ul>
                    </nav>
                </div>
            </header>}

            <Outlet />

            <footer>
                <WarningBanner />
            </footer>
        </>
        </div>
    );
};
