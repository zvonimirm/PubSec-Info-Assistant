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

export const LegalDisclaimer = ({ className }: Props) => {

    return (
        <div>
            <Label>{t("LegalDisclaimer.Disclaimer")}</Label>
            <Separator>{t("LegalDisclaimer.VSRH")}</Separator>
            {/* <Text>{appVersionInfo?.version}</Text> */}
            <div>
                <Text>{t("LegalDisclaimer.VSRHOpis")}</Text>
            </div>
            <div>
                <a href="https://www.vsrh.hr/" target="_blank" rel="noreferrer">https://www.vsrh.hr/</a>
            </div>
            <Separator>{t("LegalDisclaimer.InterniAkti")}</Separator>
            
            <div>
            <a href="https://www.otpbanka.si/downloadfile.ashx?fileid=264844" target="_blank" rel="noreferrer">https://www.otpbanka.si/AML Policy</a><br/>
            <a href="https://www.zaba.hr/home/med/dok/883/883-statut-zagrebacke-banke-04-2023.pdf" target="_blank" rel="noreferrer">https://www.zaba.hr/Statut</a><br/>
            <a href="https://www.hpb.hr/UserDocsImages/Javno%20objavljene%20informacije/Antikorupcijska%20politika_web.pdf?vel=269991" target="_blank" rel="noreferrer">https://www.hpb.hr/Antikorupcijska politika</a><br/>
            <a href="https://www.zaba.hr/home/med/dok/2128/kodeks-profesionalnog-postupanja-2022.pdf" target="_blank" rel="noreferrer">https://www.zaba.hr/Profesionalno postupanje</a><br/>
            <a href="https://www.zaba.hr/home/med/dok/866/globalna-politika-sprjecavanje-mita-i-korupcije-2022.pdf" target="_blank" rel="noreferrer">https://www.zaba.hr/Mito i korupcija</a><br/>
            <a href="https://corporate.aci-marinas.com/wp-content/uploads/2021/12/Eticki-kodeks.pdf" target="_blank" rel="noreferrer">https://corporate.aci-marinas.com/Kodeks</a><br/>
            <a href="https://www.otpbanka.hr/sites/default/files/doc/Politika_o_zastiti_podataka__0.pdf" target="_blank" rel="noreferrer">https://www.otpbanka.hr/Zastita podataka</a><br/>
            <a href="https://www.otpbanka.hr/sites/default/files/doc/Eti%C4%8Dki%20kodeks%202024_.pdf" target="_blank" rel="noreferrer">https://www.otpbanka.hr/Etički kodeks 2024</a><br/>
            <a href="https://www.otpbanka.hr/sites/default/files/dokumenti/opci-uvjeti/Anti_Corruption_Policy.pdf" target="_blank" rel="noreferrer">https://www.otpbanka.hr/Anti_Corruption_Policy</a><br/>

            </div>

            {/*<Label>{t("InfoContent.Instanca")}</Label><Text>{infoData?.AZURE_OPENAI_SERVICE}</Text>
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
            <Label>{t("InfoContent.JezikSustava")}</Label><Text>{infoData?.TARGET_LANGUAGE}</Text> */}
        </div>
    );
};