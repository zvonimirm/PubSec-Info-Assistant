import styles from './IntroductionInitQuestionSales.module.css';
import finleyIcon from '../../assets/Finley.jpg';
import { useTranslation } from "react-i18next";
import { ArrowRightRegular} from "@fluentui/react-icons";

const IntroductionInitQuestionSales = () => {
    const { t } = useTranslation();
    return (
        <div className={styles.tableStyle}>
            <div className={styles.columnStyleImageContainer}>
                <img src={finleyIcon} alt="Description of image" className={styles.image} />
            </div>
            <div className={styles.columnStyleContainer}>
                <div className={styles.columnStyleFinley}>{t('finley-introduction-sales')}</div>
                <div className={styles.columnStyle}>{t('finley-introduction-sales2')}</div>
                <div style={{height: '20px'}}></div>
               
               
                <div className={styles.columnStyle}>{t('finley-introduction-sales3')}</div>
            </div>
        </div>
    );          
}   

export {IntroductionInitQuestionSales};