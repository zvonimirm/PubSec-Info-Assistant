import React, {useEffect} from "react";
import { useNavigate } from "react-router-dom";
import styles from './introduction_general.module.css';
import { useTranslation } from "react-i18next";
import aseeLogo from '../../assets/ASEE logo bijeli.svg';
import LanguageSwitcher from "../../components/LanguageSwitcher/LanguageSwitcher";
import i18n from "../../locales/i18n";

const IntroductionGeneral = () => {
    const navigate = useNavigate();
    const { t } = useTranslation();
   
    const onRelevantAuthoritiesClick = () => {
        navigate("/Chat", { state: { isFirstRedirect: true, korisnikInfo: "", source: "LA" } });
    };
    const onInternalActsClick = () => {
        navigate("/Chat", { state: { isFirstRedirect: true, korisnikInfo: "", source: "IA" } });
    };
    const onConstructionClick = () => {
        navigate("/Chat", { state: { isFirstRedirect: true, korisnikInfo: "", source: "GRAD" } });
    };

    const handleLanguageChange = (newLanguage: string) => {
        console.log("Language changed to:", newLanguage);

        i18n.changeLanguage(newLanguage);
        localStorage.setItem("lang", newLanguage);
    };
    return (
    <div className={styles.backgroundContainer}>
        <div className={styles.mainContainer}>
            <div className={styles.holderContainer}></div>
            <div className={styles.topicContainer}>
              <div className={styles.btnContainer} onClick={() => onInternalActsClick()}>{t("Answer.InternalActs")}</div>
              <div className={styles.btnContainer} onClick={() => onRelevantAuthoritiesClick()}>{t("Answer.RelevantAuthorities")}</div>
              <div className={styles.btnContainer} onClick={() => onConstructionClick()}>{t("Answer.Construction")}</div>
            </div>
            <div className={styles.rightContainer}>
                <div className={styles.languageContainer}> 
                    <LanguageSwitcher onLanguageChange={handleLanguageChange}/>    
                </div>
                <div className={styles.logoContainer}> 
                    <img src={aseeLogo} alt="ASEE" className={styles.aseeLogo}></img>
                </div>
            </div>
        </div>
    </div>
    );
};

export default IntroductionGeneral;