// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import React, { useEffect, useState } from "react";
import { Text } from "@fluentui/react";
import { Label } from '@fluentui/react/lib/Label';
import { Separator } from '@fluentui/react/lib/Separator';
import { getInfoData, GetInfoResponse  } from "../../api";
import appVersionInfo from '../../../version.json';

interface Props {
    className?: string;
}

export const InfoContent = ({ className }: Props) => {
    const [infoData, setInfoData] = useState<GetInfoResponse | null>(null);

    async function fetchInfoData() {
        console.log("InfoContent 1");
        try {
            const fetchedInfoData = await getInfoData();
            setInfoData(fetchedInfoData);
        } catch (error) {
            // Handle the error here
            console.log(error);
        }
    }

    useEffect(() => {
        fetchInfoData();
    }, []);

    return (
        <div>
            <Separator>Verzija</Separator>
            <Text>{appVersionInfo?.version}</Text>
            <Separator>Azure OpenAI</Separator>
            <Label>Instanca</Label><Text>{infoData?.AZURE_OPENAI_SERVICE}</Text>
            <Label>Naziv GPT implementacije</Label><Text>{infoData?.AZURE_OPENAI_CHATGPT_DEPLOYMENT}</Text>
            <Label>Naziv GPT modela</Label><Text>{infoData?.AZURE_OPENAI_MODEL_NAME}</Text>
            <Label>Verzija GPT modela</Label><Text>{infoData?.AZURE_OPENAI_MODEL_VERSION}</Text>
            {infoData?.USE_AZURE_OPENAI_EMBEDDINGS ? (
            <div>
            <Label>Embeddings Deployment Name</Label><Text>{infoData?.EMBEDDINGS_DEPLOYMENT}</Text>
            <Label>Embeddings Model Name</Label><Text>{infoData?.EMBEDDINGS_MODEL_NAME}</Text>
            <Label>Embeddings Model Version</Label><Text>{infoData?.EMBEDDINGS_MODEL_VERSION}</Text>
            </div>
            ) : (
            <div>
            <Separator>Ugrađeni modeli</Separator>
            <Label>Ugrađeni modeli</Label><Text>{infoData?.EMBEDDINGS_DEPLOYMENT}</Text>
            </div>
            )}
            <Separator>Azure AI pretraga</Separator>
            <Label>Naziv usluge</Label><Text>{infoData?.AZURE_SEARCH_SERVICE}</Text>
            <Label>Naziv indkesa</Label><Text>{infoData?.AZURE_SEARCH_INDEX}</Text>
            <Separator>Konfiguracija</Separator>
            <Label>Jezik sustava</Label><Text>{infoData?.TARGET_LANGUAGE}</Text>
        </div>
    );
};