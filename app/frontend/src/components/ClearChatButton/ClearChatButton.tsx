// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { Text } from "@fluentui/react";
import { Broom24Regular } from "@fluentui/react-icons";

import { useTranslation } from "react-i18next";
import styles from "./ClearChatButton.module.css";

interface Props {
    className?: string;
    onClick: () => void;
    disabled?: boolean;
}

export const ClearChatButton = ({ className, disabled, onClick }: Props) => {
    const { t } = useTranslation();
    
    return (
        <div className={`${styles.container} ${className ?? ""} ${disabled && styles.disabled}`} onClick={onClick}>
            <Broom24Regular />
            <Text>{t("ClearChatButton.OcistiRazgovor")}</Text>
        </div>
    );
};
