import styles from './LegalAssistantEntry.module.css';
import legalAssistantIcon from '../../assets/Finley.jpg';
import { useTranslation } from "react-i18next";
import { BrightnessHigh16Filled } from '@fluentui/react-icons';

interface LegalAssistantEntryProps{
    onLegalAssistantEntryClicked: (upit: string) => void;
}
export const LegalAssistantEntry = ({onLegalAssistantEntryClicked} : LegalAssistantEntryProps) => {
    const { t } = useTranslation();

    return (
            <>
                <div className={styles.wrap}> 
                    {/* <h1> {t("LegalAssistantEntry.LegalAssistant")}</h1> */}
                    <button className={styles.button} onClick={()=>onLegalAssistantEntryClicked('TEST')}>{t("LegalAssistantEntry.LegalAssistant")}</button>
                    {/* <img src={legalAssistantIcon} alt="Description of image" className={styles.image} onClick={()=>onLegalAssistantEntryClicked('TEST')} /> */}
                </div>
             </>
    )};


export default LegalAssistantEntry;

