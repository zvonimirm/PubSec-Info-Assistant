// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { Text } from "@fluentui/react";
import { Globe24Regular } from "@fluentui/react-icons";
import styles from "./LegalDisclaimerButton.module.css";
import { t } from "i18next";

interface Props {
    className?: string;
    onClick: () => void;
}

export const LegalDisclaimerButton = ({ className, onClick }: Props) => {
    return (
        <div className={`${styles.container} ${className ?? ""}`} onClick={onClick}>
            <Globe24Regular />
            <Text>{t("Legal Disclaimer")}</Text>
        </div>
    );
};
