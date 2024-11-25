import styles from './LegalAssistantEntry.module.css';
import legalAssistantIcon from '../../assets/LegalAssistant.png';

function LegalAssistantEntry(){
    return (
            <>
                <div className={styles.wrap}> 
                    <img src={legalAssistantIcon} alt="Description of image" className={styles.image} />
                    <h1> Napredni pomoćnik</h1>
                    <div className={styles.legalAssistantEntry} >
                        <p className={styles.exampleText}>
                            Generiranje sažetka dokumenata
                            <br/>
                            Generiranje prijedloga odluke
                        </p>
                    </div>
                </div>
             </>
    )};


export default LegalAssistantEntry;

