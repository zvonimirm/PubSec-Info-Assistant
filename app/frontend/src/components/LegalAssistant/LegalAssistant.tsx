import { FilePicker } from "../../components/filepicker/file-picker";

import { nanoid } from "nanoid";
import { useCallback, useEffect, useMemo, useState } from "react"; 

import styles from './LegalAssistant.module.css';


interface Props {
    onEvent: (event: string, files: any)  => void;
  }



const LegalAssistant = ({onEvent}: Props) => {
    const [selectedKey, setSelectedKey] = useState<string | undefined>(undefined);
    const [selectedTags, setSelectedTags] = useState<string[] | undefined>(undefined);
    const [isClickable, setIsClickable] = useState(false);
    const [files, setFiles] = useState<any>([]);

    const handleFilesChange = (files: any) => {
        setFiles(files);
        setIsClickable(true);
    }
    
    const handleSummaryClick = () => {
        onEvent("Summary", files);
    };

    const handleBlobStorage = () => {
        onEvent("BlobStorage", files);
    };

    const handleDecisionProposal = () => {
        onEvent("Decision", files);
    };
    
    return (
        <>
            <div className={styles.mainDiv}>
                {/* <h2>Hello from Legal Assistant</h2> */}
                <div className={styles.dropZoneStyle}>
                    <div className={styles.EmptyObjectivesListItem}>
                            <FilePicker folderPath={selectedKey || ""} tags={selectedTags || []} isBtnUploadFilesVisible={false} onFilesChange={handleFilesChange}/>
                        </div>
                </div>      
                <div className={styles.actionsStyles}>
                     <span className={`${!isClickable ? styles.btnDisabled : styles.btnStyle}`} onClick={handleSummaryClick}>
                        <p className={styles.exampleText}>
                            Generiranje sažetka dokumenata
                        </p>
                    </span>
                    {/* <span className={`${!isClickable ? styles.btnDisabled : styles.btnStyle}`} onClick={handleBlobStorage}>
                        <p className={styles.exampleText}>
                            Dodavanje dokumenata <br/>u blob storage
                        </p>
                    </span> */}
                    <span className={`${!isClickable ? styles.btnDisabled : styles.btnStyle}`} onClick={handleDecisionProposal}>
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