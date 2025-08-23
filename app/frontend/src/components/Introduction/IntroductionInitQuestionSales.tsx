import styles from './IntroductionInitQuestionSales.module.css';
import finleyIcon from '../../assets/Finley.jpg';
import { useTranslation } from "react-i18next";
import { ArrowRightRegular} from "@fluentui/react-icons";

const IntroductionInitQuestionSales = ({ name, salesType }: { name: string; salesType: string }) => {
    const { t } = useTranslation();
     const capitalizeName = (str: string) => {
        if (!str) return '';
        console.log("ime iz komponente: " + str)
        return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    };
    return (
        <div className={styles.tableStyle}>
            <div className={styles.columnStyleImageContainer}>
                <img src={finleyIcon} alt="Description of image" className={styles.image} />
            </div>
            <div className={styles.columnStyleContainer}>
                <div className={styles.columnStyleFinley}>{t('finley-introduction-sales').replace('###', capitalizeName(name))}</div>
                {salesType && salesType.toLowerCase() === 'kredit' && (
                    <div className={styles.columnStyle}>{t('finley-introduction-sales2')}</div>
                )}
                {salesType && salesType.toLowerCase() === 'paket' && (
                    <div className={styles.columnStyle}>{t('finley-introduction-sales2b')}</div>
                )}
               
                <div style={{height: '20px'}}></div>
               
                <div className={styles.columnStyle}>{t('finley-introduction-sales3')}</div>
                <div className={styles.columnStyle}>{t('finley-introduction-sales4')}</div>
                <div style={{height: '50px'}}></div>
            </div>
        </div>
    );          
}   

export {IntroductionInitQuestionSales};