// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { BuildingMultiple24Filled, Globe24Filled, Link20Filled, Sparkle24Filled } from "@fluentui/react-icons";
import FinleyIcon from "../../assets/Finley.jpg";
import { Approaches } from "../../api";
import { useTranslation } from "react-i18next";

import styles from "./Answer.module.css";

interface AnswerIconProps {
    approach: Approaches;
}

export const AnswerIcon: React.FC<AnswerIconProps> = ({ approach }) => {
    const { t } = useTranslation();

    if (approach == Approaches.ChatWebRetrieveRead) {
        return <div className={styles.answerLogoWeb}><Globe24Filled primaryFill={"rgba(24, 141, 69, 1)"} aria-hidden="true" aria-label="Web Answer logo" /> Web</div>;
        }
    else if (approach == Approaches.Introduction || approach == Approaches.IntroductionSales) {
            /*Ovaj dio kontrolira stranu Asistanta. Boja definira boju ikonice.*/
            return <div className={styles.answerIntroduction}><img src={FinleyIcon} alt="Description of image" className={styles.finlyIcon}/></div>;
        }
    else if (approach == Approaches.ReadRetrieveRead || approach == Approaches.DocumentSummary || approach == Approaches.DecisionProposal) {
        return <div className={styles.answerLogoWork}><BuildingMultiple24Filled primaryFill={"rgba(0, 102, 204,1)"} aria-hidden="true" aria-label="Work Answer logo" /> {t("AnswerIcon.Work")}</div>;
        }
    else if (approach == Approaches.CompareWebWithWork) {
        return <div className={styles.answerLogoCompare}><Globe24Filled primaryFill={"rgba(206, 123, 46, 1)"} aria-hidden="true" aria-label="Web Compared to Work Answer Logo" />
        <Link20Filled primaryFill={"rgba(206, 123, 46, 1)"} /><BuildingMultiple24Filled primaryFill={"rgba(206, 123, 46, 1)"} aria-hidden="true" /> Web compared to Work</div>;
        }
    else if (approach == Approaches.CompareWorkWithWeb) {
        return <div className={styles.answerLogoCompare}><BuildingMultiple24Filled primaryFill={"rgba(206, 123, 46, 1)"} aria-hidden="true" aria-label="Work Compared to Web Answer logo" /><Link20Filled primaryFill={"rgba(206, 123, 46, 1)"} /><Globe24Filled primaryFill={"rgba(206, 123, 46, 1)"} aria-hidden="true" /> Work compared to Web</div>;
        }
    else {
        return <div className={styles.answerLogoUngrounded}><Sparkle24Filled primaryFill={"rgb(8, 8, 8)"}/><div className={styles.answerLogoUngroundedText}>Information Assistant</div></div>;
    }
};
