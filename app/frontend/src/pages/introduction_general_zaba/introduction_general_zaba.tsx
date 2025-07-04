import React, {useEffect} from "react";
import { useNavigate } from "react-router-dom";
import styles from './introduction_general_zaba.module.css';
import { useTranslation } from "react-i18next";
import aseeLogo from '../../assets/ASEE logo bijeli.svg';
import LanguageSwitcher from "../../components/LanguageSwitcher/LanguageSwitcher";
import i18n from "../../locales/i18n";

const IntroductionGeneralSales = () => {
    const navigate = useNavigate();
    const { t } = useTranslation();
   
    const onChatClick = () => {
       console.log("Chat")
        navigate("/Chat", { state: { isFirstRedirect: true, korisnikInfo: "", source: "LA" } });
    };
    const onAudioClick = () => {
       console.log("Audio")
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
            <div className={styles.topicContainer} onClick={() => (onAudioClick())}>
              <div className={styles.btnContainer}>{t("IntroductionSales.Audio")}</div>
            </div>
            <div className={styles.topicContainer} onClick={() => onChatClick()}>
              <div className={styles.btnContainer}>{t("IntroductionSales.Chat")}</div>
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

export default IntroductionGeneralSales;