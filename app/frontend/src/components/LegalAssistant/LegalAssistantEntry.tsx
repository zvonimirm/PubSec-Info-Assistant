import styles from './LegalAssistantEntry.module.css';
import legalAssistantIcon from '../../assets/icon-legal-ai.webp';

interface LegalAssistantEntryProps{
    onLegalAssistantEntryClicked: (upit: string) => void;
}
export const LegalAssistantEntry = ({onLegalAssistantEntryClicked} : LegalAssistantEntryProps) => {
    return (
            <>
                <div className={styles.wrap}> 
                    <h1> Napredni pomoćnik</h1>
                    <img src={legalAssistantIcon} alt="Description of image" className={styles.image} onClick={()=>onLegalAssistantEntryClicked('TEST')} />
                    {/* <div className={styles.legalAssistantEntry} 
                        onClick={()=>onLegalAssistantEntryClicked('TEST')}>
                        <p className={styles.exampleText}>
                            Generiranje sažetka dokumenata<br/>
                            Generiranje prijedloga odluke
                        </p>
                    </div> */}
                </div>
             </>
    )};


export default LegalAssistantEntry;

