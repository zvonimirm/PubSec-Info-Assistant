import styles from './LegalAssistantEntry.module.css';
import legalAssistantIcon from '../../assets/LegalAssistant.png';

interface LegalAssistantEntryProps{
    onLegalAssistantEntryClicked: (upit: string) => void;
}
export const LegalAssistantEntry = ({onLegalAssistantEntryClicked} : LegalAssistantEntryProps) => {
    return (
            <>
                <div className={styles.wrap}> 
                    <img src={legalAssistantIcon} alt="Description of image" className={styles.image} />
                    <h1> Napredni pomoćnik - TEST DEPLOY</h1>
                    <div className={styles.legalAssistantEntry} 
                        onClick={()=>onLegalAssistantEntryClicked('TEST')}>
                        <p className={styles.exampleText}>
                            Generiranje sažetka dokumenata<br/>
                            Generiranje prijedloga odluke
                        </p>
                    </div>
                </div>
             </>
    )};


export default LegalAssistantEntry;

