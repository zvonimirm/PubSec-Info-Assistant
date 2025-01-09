// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { useState } from 'react';
import { Pivot,
    PivotItem } from "@fluentui/react";
import { ITag } from '@fluentui/react/lib/Pickers';
import { FilePicker } from "../../components/filepicker/file-picker";
import { FileStatus } from "../../components/FileStatus/FileStatus";
import { TagPickerInline } from "../../components/TagPicker/TagPicker"
import { FolderPicker } from '../../components/FolderPicker/FolderPicker';
import { SparkleFilled, DocumentPdfFilled, DocumentDataFilled, GlobePersonFilled, MailFilled, StoreMicrosoftFilled } from "@fluentui/react-icons";
import styles from "./Content.module.css";

export interface IButtonExampleProps {
    disabled?: boolean;
    checked?: boolean;
  }

const Content = () => {
    const [selectedKey, setSelectedKey] = useState<string | undefined>(undefined);
    const [selectedTags, setSelectedTags] = useState<string[] | undefined>(undefined);
    const [selectedApproach, setSelectedApproach] = useState<number | undefined>(undefined);

    const onSelectedKeyChanged = (selectedFolder: string[]) => {
        setSelectedKey(selectedFolder[0]);
    };

    const onSelectedTagsChanged = (selectedTags: ITag[]) => {
        setSelectedTags(selectedTags.map((tag) => tag.name));
    }

    const onSelectedApproach = (approach: number) => {
        setSelectedApproach(approach);
        alert(approach)
    }

    const handleLinkClick = (item?: PivotItem) => {
        setSelectedKey(undefined);
    };    

    return (
        <div className={styles.contentArea} >
            <Pivot aria-label="Upload Files Section" className={styles.topPivot} onLinkClick={handleLinkClick}>
                <PivotItem headerText="Učitaj datoteke" aria-label="Upload Files Tab">
                    <div className={styles.App} >
                        <div style={{ marginBottom: '20px', marginTop: '20px' }}>
                            <SparkleFilled fontSize={"60px"} primaryFill={"rgba(115, 118, 225, 1)"} aria-hidden="true" aria-label="Supported File Types" />
                            <h1 className={styles.EmptyStateTitle}>Podržani tipovi datoteka</h1>
                            <span className={styles.EmptyObjectives}>
                                Informacijski pomoćnik trenutno podržava sljedeće tipove datoteka:
                            </span>
                            <span className={styles.EmptyObjectivesList}>
                                <span className={styles.EmptyObjectivesListItem}>
                                    <DocumentDataFilled fontSize={"40px"} primaryFill={"rgba(115, 118, 225, 1)"} aria-hidden="true" aria-label="Data" />
                                    <span className={styles.EmptyObjectivesListItemText}><b>Podaci</b><br />
                                        xml, json, csv, tsv, txt
                                    </span>
                                </span>
                                <span className={styles.EmptyObjectivesListItem}>
                                    <StoreMicrosoftFilled fontSize={"40px"} primaryFill={"rgba(115, 118, 225, 1)"} aria-hidden="true" aria-label="Microsoft 365" />
                                    <span className={styles.EmptyObjectivesListItemText}><b>Alati za produktivnost</b><br />
                                        pptx, docx & xlsx
                                    </span>
                                </span>
                                <span className={styles.EmptyObjectivesListItem}>
                                    <DocumentPdfFilled fontSize={"40px"} primaryFill={"rgba(115, 118, 225, 1)"} aria-hidden="true" aria-label="PDF" />
                                    <span className={styles.EmptyObjectivesListItemText}><b>PDF</b><br />
                                    Za maksimalan broj stranica provjerite <a href="https://learn.microsoft.com/en-us/azure/ai-services/document-intelligence/concept-layout?view=doc-intel-4.0.0#input-requirements">
                                    dokumentaciju</a> 
                                    </span>
                                </span>
                                <span className={styles.EmptyObjectivesListItem}>
                                    <GlobePersonFilled fontSize={"40px"} primaryFill={"rgba(115, 118, 225, 1)"} aria-hidden="true" aria-label="Web" />
                                    <span className={styles.EmptyObjectivesListItemText}><b>Web</b><br />
                                        htm & html
                                    </span>
                                </span>
                                <span className={styles.EmptyObjectivesListItem}>
                                    <MailFilled fontSize={"40px"} primaryFill={"rgba(115, 118, 225, 1)"} aria-hidden="true" aria-label="Email" />
                                    <span className={styles.EmptyObjectivesListItemText}><b>E-pošta</b><br />
                                        eml & msg
                                    </span>
                                </span>
                            </span>
                        </div>
                        <div className={styles.EmptyObjectivesListItem}>
                            <FolderPicker allowFolderCreation={true} onSelectedKeyChange={onSelectedKeyChanged}/>
                            <TagPickerInline allowNewTags={true} onSelectedTagsChange={onSelectedTagsChanged}/>
                            <FilePicker folderPath={selectedKey || ""} tags={selectedTags || []} isBtnUploadFilesVisible={true} onFilesChange={  () => {}}/>
                        </div>
                    </div>
                </PivotItem>
                <PivotItem headerText="Status učitavanja" aria-label="Upload Status Tab">
                    <FileStatus className=""/>
                </PivotItem>
            </Pivot>
        </div>
    );
};
    
export default Content;