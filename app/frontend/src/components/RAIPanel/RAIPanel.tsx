// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { Options16Filled, ArrowSync16Filled, Briefcase16Filled, Globe16Filled, BuildingMultipleFilled } from "@fluentui/react-icons";

import styles from "./RAIPanel.module.css";
import { Icon } from "@fluentui/react";
import { Approaches, ChatMode } from "../../api";
import { useTranslation } from "react-i18next";

interface Props {
    approach?: Approaches;
    chatMode?: ChatMode;
    onAdjustClick?: () => void;
    onRegenerateClick?: () => void;
    onWebSearchClicked?: () => void;
    onRagSearchClicked?: () => void;
    onWebCompareClicked?: () => void;
    onRagCompareClicked?: () => void;
}

export const RAIPanel = ({approach, chatMode, onAdjustClick, onRegenerateClick, onWebSearchClicked, onRagSearchClicked, onWebCompareClicked, onRagCompareClicked }: Props) => {
    const { t } = useTranslation();
    
    return (
        <div className={styles.adjustInputContainer}>
            <div className={styles.adjustInput} onClick={onAdjustClick}>
                <Options16Filled primaryFill="rgba(133, 133, 133, 1)" />
                <span className={styles.adjustInputText}>{t('Prilagodi')}</span>
            </div>
            <div className={styles.adjustInput} onClick={onRegenerateClick}>
                <ArrowSync16Filled primaryFill="rgba(133, 133, 133, 1)" />
                <span className={styles.adjustInputText}>{t('RAIPanel.PonovoOdgovori')}</span>
            </div>
            {(approach == Approaches.ChatWebRetrieveRead && chatMode == ChatMode.WorkPlusWeb) &&
                    <>
                        <div className={styles.adjustInput} onClick={onRagSearchClicked}>
                            <BuildingMultipleFilled primaryFill="rgba(133, 133, 133, 1)" />
                            <span className={styles.adjustInputText}>Pretraži dokumente</span>
                        </div>
                        <div className={styles.adjustInput} onClick={onRagCompareClicked}>
                            <BuildingMultipleFilled primaryFill="rgba(133, 133, 133, 1)" />
                            <span className={styles.adjustInputText}>Compare with Work</span>
                        </div>
                    </>
            }
            {(approach == Approaches.ReadRetrieveRead && chatMode == ChatMode.WorkPlusWeb) &&
                    <>
                        <div className={styles.adjustInput} onClick={onWebSearchClicked}>
                            <Globe16Filled primaryFill="rgba(133, 133, 133, 1)" />
                            <span className={styles.adjustInputText}>Search Web</span>
                        </div>
                        <div className={styles.adjustInput} onClick={onWebCompareClicked}>
                            <Globe16Filled primaryFill="rgba(133, 133, 133, 1)" />
                            <span className={styles.adjustInputText}>Compare with Web</span>
                        </div>
                    </>
            }
        </div>
    );
};