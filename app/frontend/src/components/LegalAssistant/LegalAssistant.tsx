import {DropZone} from '../filepicker/drop-zone';
import { nanoid } from "nanoid";
import React, {useState, createContext} from "react";
import styles from './LegalAssistant.module.css';


interface Props {
    folderPath: string;
    tags: string[];
  }

interface Props {
    folderPath: string;
    tags: string[];
    onEvent: (message: string) => void;
}

const LegalAssistant = ({folderPath, tags, onEvent}: Props) => {
    const [files, setFiles] = useState<any>([]);
        
    const handleOnChange = () => {}
    const handleSummaryClick = () => {
        onEvent("Button clicked from legal assistant");
    };
    return (
        <>
            <div className={styles.mainDiv}>
                {/* <h2>Hello from Legal Assistant</h2> */}
                <div className={styles.dropZoneStyle}>
                    <DropZone onChange={handleOnChange} accept={files}/>
                </div>      
                <div className={styles.actionsStyles}>
                     <span className={styles.btnStyle} onClick={handleSummaryClick}>
                        <p className={styles.exampleText}>
                            Generiranje sažetka dokumenata
                        </p>
                    </span>
                    <span className={styles.btnStyle}>
                        <p className={styles.exampleText}>
                            Dodavanje dokumenata <br/>u blob storage
                        </p>
                    </span>
                    <span className={styles.btnStyle}>
                        <p className={styles.exampleText}>
                            Generiranje prijedloga odluke
                        </p>
                    </span>
                </div> 
            </div>

        </>
    );
};

export {LegalAssistant};