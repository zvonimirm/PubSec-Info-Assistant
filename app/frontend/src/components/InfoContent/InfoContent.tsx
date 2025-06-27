// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import React, { useEffect, useState } from "react";
import { Text } from "@fluentui/react";
import { Label } from '@fluentui/react/lib/Label';
import { Separator } from '@fluentui/react/lib/Separator';
import { getInfoData, GetInfoResponse  } from "../../api";
import appVersionInfo from '../../../version.json';
import { t } from "i18next";

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
            <Separator>{t("InfoContent.Verzija")}</Separator>
            <Text>{appVersionInfo?.version}</Text>
            <Separator>{t("InfoContent.AzureOpenAI")}</Separator>
            <Label>{t("InfoContent.Instanca")}</Label><Text>{infoData?.AZURE_OPENAI_SERVICE}</Text>
            <Label>{t("InfoContent.NazivGPTImplementacije")}</Label><Text>{infoData?.AZURE_OPENAI_CHATGPT_DEPLOYMENT}</Text>
            <Label>{t("InfoContent.NazivGPTModela")}</Label><Text>{infoData?.AZURE_OPENAI_MODEL_NAME}</Text>
            <Label>{t("InfoContent.VerzijaGPTModela")}</Label><Text>{infoData?.AZURE_OPENAI_MODEL_VERSION}</Text>
            {infoData?.USE_AZURE_OPENAI_EMBEDDINGS ? (
            <div>
            <Label>Embeddings Deployment Name</Label><Text>{infoData?.EMBEDDINGS_DEPLOYMENT}</Text>
            <Label>Embeddings Model Name</Label><Text>{infoData?.EMBEDDINGS_MODEL_NAME}</Text>
            <Label>Embeddings Model Version</Label><Text>{infoData?.EMBEDDINGS_MODEL_VERSION}</Text>
            </div>
            ) : (
            <div>
            <Separator>{t("InfoContent.UgradeniModeli")}</Separator>
            <Label>{t("InfoContent.UgradeniModeli")}</Label><Text>{infoData?.EMBEDDINGS_DEPLOYMENT}</Text>
            </div>
            )}
            <Separator>{t("InfoContent.AzureAIPretraga")}</Separator>
            <Label>{t("InfoContent.NazivUsluge")}</Label><Text>{infoData?.AZURE_SEARCH_SERVICE}</Text>
            <Label>{t("InfoContent.NazivIndeksa")}</Label><Text>{infoData?.AZURE_SEARCH_INDEX}</Text>
            <Separator>{t("InfoContent.Konfiguracija")}</Separator>
            <Label>{t("InfoContent.JezikSustava")}</Label><Text>{infoData?.TARGET_LANGUAGE}</Text>
        </div>
    );
};