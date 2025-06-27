// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { Example } from "./Example";

import styles from "./Example.module.css";

export type ExampleModel = {
    text: string;
    value: string;
};

const EXAMPLES_InterniAkti: ExampleModel[] = [
    { text: "Koje su ključne obaveze banke u zaštiti osobnih podataka klijenata prema GDPR-u?", value: "Koje su ključne obaveze banke u zaštiti osobnih podataka klijenata prema GDPR-u" },
    { text: "Koji su postupci zaposlenika defirani u slučaju primjećivanja pranja novca (AML)?", value: "Koji su postupci zaposlenika defirani u slučaju primjećivanja pranja novca (AML)?" },
    { text: "Koji su glavni interni i regulatorni zahtjevi koje banka mora ispuniti prilikom odobravanja donacija?", value: "Koji su glavni interni i regulatorni zahtjevi koje banka mora ispuniti prilikom odobravanja donacija?" }
];

const EXAMPLES_OdlukeOdbora: ExampleModel[] = [
    { text: "Odluka odbora 1?", value: "Koje su ključne obaveze banke u zaštiti osobnih podataka klijenata prema GDPR-u" },
    { text: "Odluka odbora 2?", value: "Koji su postupci zaposlenika defirani u slučaju primjećivanja pranja novca (AML)?" },
    { text: "Odluka odbora 3?", value: "Koji su glavni interni i regulatorni zahtjevi koje banka mora ispuniti prilikom odobravanja donacija?" }
];

const EXAMPLES: ExampleModel[] = [
    { text: "Koje su ključne obaveze banke u zaštiti osobnih podataka klijenata prema GDPR-u?", value: "Koje su ključne obaveze banke u zaštiti osobnih podataka klijenata prema GDPR-u" },
    { text: "Koji su postupci zaposlenika defirani u slučaju primjećivanja pranja novca (AML)?", value: "Koji su postupci zaposlenika defirani u slučaju primjećivanja pranja novca (AML)?" },
    { text: "Koji su glavni interni i regulatorni zahtjevi koje banka mora ispuniti prilikom odobravanja donacija?", value: "Koji su glavni interni i regulatorni zahtjevi koje banka mora ispuniti prilikom odobravanja donacija?" }
];

const GetExamples = (topic: string) => {
    if (topic === "Interni akti") {
        return EXAMPLES_InterniAkti;
    }
    else if (topic === "Odluke odbora") {
        return EXAMPLES_OdlukeOdbora;
    }
    else {
        return EXAMPLES;
    }
}
interface Props {
    onExampleClicked: (value: string) => void;
    topic: string;
}

const InterniAktiExampleList = ({ onExampleClicked, topic }: Props) => {
    return (
        <ul className={styles.examplesNavList}>
            {GetExamples(topic).map((x, i) => (
            <li key={i}>
                <Example text={x.text} value={x.value} onClick={onExampleClicked} />
            </li>
            ))}
        </ul>
    );
};

export {InterniAktiExampleList};
