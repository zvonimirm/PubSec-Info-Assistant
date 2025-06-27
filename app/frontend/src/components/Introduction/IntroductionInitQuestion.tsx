import styles from './IntroductionInitQuestion.module.css';
import finleyIcon from '../../assets/Finley.jpg';
import { useTranslation } from "react-i18next";
import { ArrowRightRegular} from "@fluentui/react-icons";

const IntroductionInitQuestion = () => {
    const { t } = useTranslation();
    return (
        <div className={styles.tableStyle}>
            <div className={styles.columnStyleImageContainer}>
                <img src={finleyIcon} alt="Description of image" className={styles.image} />
            </div>
            <div className={styles.columnStyleContainer}>
                <div className={styles.columnStyleFinley}>{t('finley-introduction')}</div>
                <div className={styles.columnStyle}>{t('finley-init-question1')}</div>
                <div className={styles.rowStyle}>
                    <ArrowRightRegular className={styles.arrowStyle}/>
                    <div className={styles.columnStyle}>{t('finley-init-question2')}</div>
                </div>
                <div className={styles.rowStyle}>
                    <ArrowRightRegular className={styles.arrowStyle}/>
                    <div className={styles.columnStyle}>{t('finley-init-question3')}</div>
                </div>
                <div className={styles.rowStyle}>
                    <ArrowRightRegular className={styles.arrowStyle}/>
                    <div className={styles.columnStyle}>{t('finley-init-question4')}</div>
                </div>
               
                <div className={styles.columnStyle}>{t('finley-init-question5')}</div>
            </div>
        </div>
    );          
}   

export {IntroductionInitQuestion};