import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import IntrodctionImage from '../../assets/MeetFinley_v2.jpg';
import styles from './IntroductionEntry.module.css';
import i18n from "../../locales/i18n";


const IntroductionEntry = () => {
    const navigate = useNavigate();
    
    const handleImageClick = (language: string) => {

        console.log("KLIK");
        console.log(i18n.language);
        console.log(i18n.options);


        i18n.changeLanguage(language);
        localStorage.setItem("lang", language);

        navigate("/IntroductionChat", { state: { isFirstRedirect: true, language: {language}} });
    };
    return (
        <div className={styles.introductionMainStyle}>
            <img src = {IntrodctionImage}
            className={styles.image}>
            </img>
            <div className={styles.buttonContainer} >
            <button className={styles.button} onClick={() => handleImageClick("en")}>
                    LET'S GO!
            </button>
           
            <button className={styles.button} onClick={() => handleImageClick("hr")}>
                    KRENIMO!
            </button>
            </div>
        </div>
    );
}

export default IntroductionEntry;    