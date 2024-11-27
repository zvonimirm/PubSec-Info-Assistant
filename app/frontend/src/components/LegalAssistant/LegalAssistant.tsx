import { FilePicker } from "../../components/filepicker/file-picker";

import { nanoid } from "nanoid";
import { useCallback, useEffect, useMemo, useState } from "react"; 

import styles from './LegalAssistant.module.css';


interface Props {
    onEvent: (event: string) => void;
  }



const LegalAssistant = ({onEvent}: Props) => {
    const [selectedKey, setSelectedKey] = useState<string | undefined>(undefined);
    const [selectedTags, setSelectedTags] = useState<string[] | undefined>(undefined);
    const [isClickable, setIsClickable] = useState(false);
    // const onSelectedKeyChanged = (selectedFolder: string[]) => {
    //     setSelectedKey(selectedFolder[0]);
    // };


    const handleFilesChange = () => {
        console.log("Files changed");
        setIsClickable(true);
    }
        
    // const handleOnFilesChange = useCallback((files: any) => {  
    //     let filesArray = Array.from(files);  
    //     filesArray = filesArray.map((file) => ({  
    //       id: nanoid(),  
    //       file,  
    //     }));  
    //     setFiles(filesArray as any);  
    //     setProgress(0);  
    //     setUploadStarted(false);  
    //   }, []);  
  
      

    const handleSummaryClick = () => {
        onEvent("Summary");
    };

    const handleBlobStorage = () => {
        onEvent("BlobStorage");
    };

    const handleDecisionProposal = () => {
        onEvent("Decision");
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
                    <span className={`${!isClickable ? styles.btnDisabled : styles.btnStyle}`} onClick={handleBlobStorage}>
                        <p className={styles.exampleText}>
                            Dodavanje dokumenata <br/>u blob storage
                        </p>
                    </span>
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