// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { Example } from "./Example";

import styles from "./Example.module.css";

export type ExampleModel = {
    text: string;
    value: string;
};

const EXAMPLES: ExampleModel[] = [
    { text: "Molio bih primjere revizija odluka županijskih sudova", value: "Molio bih primjere revizija odluka županijskih sudova" },
    { text: "Kako se određuje drugi nadležni sud u Hrvatskoj?", value: "Kako se određuje drugi nadležni sud u Hrvatskoj?" },
    { text: "Kako se odluke Europskog suda primjenjuju u Hrvatskoj?", value: "Kako se odluke Europskog suda primjenjuju u Hrvatskoj?" }
    
    
];

interface Props {
    onExampleClicked: (value: string) => void;
}

export const ExampleList = ({ onExampleClicked }: Props) => {
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
