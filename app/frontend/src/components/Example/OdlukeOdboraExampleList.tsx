// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { Example } from "./Example";

import styles from "./Example.module.css";

export type ExampleModel = {
    text: string;
    value: string;
};

const EXAMPLES: ExampleModel[] = [
    { text: "Odluka odbora 1", value: "Odluka odbora 1?" },
    { text: "Odluka odbora 2?", value: "Odluka odbora 2?" },
    { text: "Odluka odbora 3?", value: "Odluka odbora 3?" }
    
    
];

interface Props {
    onExampleClicked: (value: string) => void;
}

const OdlukeOdboraExampleList = ({ onExampleClicked }: Props) => {
    return (
        <ul className={styles.examplesNavList}>
            {EXAMPLES.map((x, i) => (
                <li key={i}>
                    <Example text={x.text} value={x.value} onClick={onExampleClicked} />
                </li>
            ))}
        </ul>
    );
};

export {OdlukeOdboraExampleList};
