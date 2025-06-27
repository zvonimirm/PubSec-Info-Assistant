// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { useEffect, useState } from "react";
import { IPivotItemProps, IRefObject, ITooltipHost, Pivot, PivotItem, Text, TooltipHost} from "@fluentui/react";
import { Label } from '@fluentui/react/lib/Label';
import { Separator } from '@fluentui/react/lib/Separator';
import DOMPurify from "dompurify";
import ReactMarkdown from 'react-markdown';

import styles from "./AnalysisPanel.module.css";

import { SupportingContent } from "../SupportingContent";
import { ChatResponse, ActiveCitation, getCitationObj, fetchCitationFile, fetchTranslatedFile, FetchCitationFileResponse } from "../../api";
import { AnalysisPanelTabs } from "./AnalysisPanelTabs";
import React from "react";
import { useTranslation } from "react-i18next";

interface Props {
    className: string;
    activeTab: AnalysisPanelTabs;
    onActiveTabChanged: (tab: AnalysisPanelTabs) => void;
    activeCitation: string | undefined;
    sourceFile: string | undefined;
    pageNumber: string | undefined;
    citationHeight: string;
    answer: ChatResponse;
    izvorniDokument?: any;
}

const pivotItemDisabledStyle: React.CSSProperties = {
    color: 'grey'

};

export const AnalysisPanel = ({ answer, activeTab, activeCitation, sourceFile, pageNumber, citationHeight, className, onActiveTabChanged, izvorniDokument }: Props) => {

    const [innerPivotTab, setInnerPivotTab] = useState<string>('indexedFile');
    const [activeCitationObj, setActiveCitationObj] = useState<ActiveCitation>();
    const [markdownContent, setMarkdownContent] = useState('');
    const [plainTextContent, setPlainTextContent] = useState('');
    const [sourceFileBlob, setSourceFileBlob] = useState<Blob>();
    const [translatedFileBlob, setTranslatedFileBlob] = useState<Blob>();
    const [sourceFileUrl, setSourceFileUrl] = useState<string>('');
    const [translatedFileUrl, setTranslatedFileUrl] = useState<string>('');
    const [isFetchingSourceFileBlob, setIsFetchingSourceFileBlob] = useState(false);
    const [isFetchingTranslatedFileBlob, setIsFetchingTranslatedFileBlob] = useState(false);
    const isDisabledThoughtProcessTab: boolean = !answer.thoughts;
    const isDisabledSupportingContentTab: boolean = !answer.data_points?.length;
    const isDisabledCitationTab: boolean = !activeCitation;
    // the first split on ? separates the file from the sas token, then the second split on . separates the file extension
    const sourceFileExt: any = sourceFile?.split(".").pop();
    const sanitizedThoughts = DOMPurify.sanitize(answer.thoughts!);

    const tooltipRef2 = React.useRef<ITooltipHost>(null);
    const tooltipRef3 = React.useRef<ITooltipHost>(null);
    const [htmlContent, setHtmlContent] = useState(izvorniDokument);
    const [originalFileUrl, setOriginalFileUrl] = useState("");

    const onRenderItemLink = (content: string | JSX.Element | JSX.Element[] | undefined, tooltipRef: IRefObject<ITooltipHost> | undefined, shouldRender: boolean) => (properties: IPivotItemProps | undefined,
        nullableDefaultRenderer?: (props: IPivotItemProps) => JSX.Element | null) => {
            if (!properties || !nullableDefaultRenderer) {
                return null; // or handle the undefined case appropriately
            }
            return shouldRender ? (
                <TooltipHost content={content} componentRef={tooltipRef}>
                    {nullableDefaultRenderer(properties)}
                </TooltipHost>
            ) : (
                nullableDefaultRenderer(properties)
            );
    };
    const isOriginalDocumentVisible = () => {
        console.log(izvorniDokument);
        if (izvorniDokument) {
            return true; }
            else {
                return false;
        }
    };
    let sourceFileBlobPromise: Promise<void> | null = null;
    async function fetchCitationSourceFile(): Promise<void> {
        if (sourceFile) {
            // console.log("fetching source file -" + sourceFile);
            const results = await fetchCitationFile(sourceFile);
            setSourceFileBlob(results.file_blob);
            setSourceFileUrl(URL.createObjectURL(results.file_blob));
        }
    }

    let translatedFileBlobPromise: Promise<void> | null = null;
    async function fetchTranslatedSourceFile(): Promise<void> {
        if (sourceFile) {
            // console.log("fetching translated file -" + sourceFile);
            const results = await fetchTranslatedFile("upload/VSRH/090216ba80ef589f.pdf");
            setTranslatedFileBlob(results.file_blob);
            setTranslatedFileUrl(URL.createObjectURL(results.file_blob)); 
        }
    }
    
    
    
    function getCitationURL() {
        return originalFileUrl; 
    }
    
    function getTranslatedDocument() {
        return translatedFileUrl; 
    }
   useEffect(() => {
    const fetchSourceFileBlob = async () => {
        console.log("fetching source file blob");

        if (sourceFileBlob === undefined) {
            if (!isFetchingSourceFileBlob) {
                setIsFetchingSourceFileBlob(true);
                sourceFileBlobPromise = fetchCitationSourceFile().finally(() => {
                    setIsFetchingSourceFileBlob(false);
                });
            }
            await sourceFileBlobPromise;
        }
        setOriginalFileUrl(sourceFileUrl); // ✅ Update state in useEffect, not in a render function
    };

    fetchSourceFileBlob();
}, [sourceFileBlob, sourceFileUrl, isFetchingSourceFileBlob]);


    useEffect(() => {
    const fetchTranslatedFileBlob = async () => {
        console.log("fetching translated file blob");
        if (sourceFileBlob === undefined) {
            if (!isFetchingSourceFileBlob) {
                setIsFetchingSourceFileBlob(true);
                translatedFileBlobPromise = fetchTranslatedSourceFile().finally(() => {
                    setIsFetchingTranslatedFileBlob(false);
                });
            }
            await translatedFileBlobPromise;
        }
        setTranslatedFileUrl(translatedFileUrl); // ✅ Update state in useEffect, not in a render function
    };

    fetchTranslatedFileBlob();
}, [translatedFileBlob, translatedFileUrl, isFetchingTranslatedFileBlob]);





    async function fetchActiveCitationObj() {
        try {
            const citationObj = await getCitationObj(activeCitation as string);
            setActiveCitationObj(citationObj);
            console.log(citationObj);
        } catch (error) {
            // Handle the error here
            console.log(error);
        }
    }


    useEffect(() => {
        if (!sourceFile) {
            return;
        }
        const fetchMarkdownContent = async () => {
            try {
                const response = await fetch(getCitationURL());
                const content = await response.text();
                setMarkdownContent(content);
            } catch (error) {
                console.error('Error fetching Markdown content:', error);
            }
        };

        fetchMarkdownContent();
    }, [sourceFileBlob, sourceFileExt]);

    useEffect(() => {
        const fetchPlainTextContent = async () => {
            try {
                const response = await fetch(getCitationURL());
                const content = await response.text();
                setPlainTextContent(content);
            } catch (error) {
                console.error('Error fetching plain text content:', error);
            }
        };

        if (["json", "txt", "xml"].includes(sourceFileExt)) {
            fetchPlainTextContent();
        }
    }, [sourceFileBlob, sourceFileExt]);

    useEffect(() => {
        if (activeCitation) {
            setInnerPivotTab('indexedFile');
        }
        fetchActiveCitationObj();
        const fetchSourceFileBlob = async () => {

                if (!isFetchingSourceFileBlob) {
                    setIsFetchingSourceFileBlob(true);
                    sourceFileBlobPromise = fetchCitationSourceFile().finally(() => {
                        setIsFetchingSourceFileBlob(false);
                    });
                }
                await sourceFileBlobPromise;

        };
        const fetchTranslatedFileBlob = async () => {

            if (!isFetchingTranslatedFileBlob) {
                setIsFetchingSourceFileBlob(true);
                translatedFileBlobPromise = fetchTranslatedSourceFile().finally(() => {
                    setIsFetchingTranslatedFileBlob(false);
                });
            }
            await fetchTranslatedFileBlob;

    };
        fetchSourceFileBlob();
        fetchTranslatedFileBlob();

    }, [activeCitation]);


    const { t } = useTranslation();


    return (
        <Pivot
            className={className}
            selectedKey={activeTab}
            onLinkClick={pivotItem => pivotItem && onActiveTabChanged(pivotItem.props.itemKey! as AnalysisPanelTabs)}
        >
            <PivotItem
                itemKey={AnalysisPanelTabs.ThoughtProcessTab}
                headerText={t("AnalysisPanel.ProcesRazmisljanja")}
                headerButtonProps={isDisabledThoughtProcessTab ? { disabled: true, style: pivotItemDisabledStyle } : undefined}

            >
                <div className={styles.thoughtProcess} dangerouslySetInnerHTML={{ __html: sanitizedThoughts }}></div>
            </PivotItem>

            <PivotItem
                itemKey={AnalysisPanelTabs.SupportingContentTab}
                headerText={t("AnalysisPanel.PrateciSadrzaj")}

                headerButtonProps={{
                    disabled: isDisabledSupportingContentTab,
                    style: isDisabledSupportingContentTab ?  pivotItemDisabledStyle : undefined,
                }}
                onRenderItemLink = {onRenderItemLink("Supporting content is unavailable.", tooltipRef2, isDisabledSupportingContentTab)}
            >
                <SupportingContent supportingContent={answer.data_points} />
            </PivotItem>


            <PivotItem
                itemKey={AnalysisPanelTabs.CitationTab}

                headerText={t("AnalysisPanel.Citati")}
                headerButtonProps={{
                    disabled: isDisabledCitationTab,
                    style: isDisabledCitationTab ?  pivotItemDisabledStyle : undefined,
                }}
                onRenderItemLink = {onRenderItemLink(t("AnalysisPanel.CitatNijeOdabran"), tooltipRef3, isDisabledCitationTab)}
            >

                <Pivot className={className} selectedKey={innerPivotTab} onLinkClick={(item) => {
                    if (item) {
                        setInnerPivotTab(item.props.itemKey!);
                    } else {
                        // Handle the case where item is undefined
                        console.warn('Item is undefined');
                    }
                }}>
                    <PivotItem itemKey="indexedFile" headerText={t("AnalysisPanel.OdjeljakDokumenta")}>
                        {activeCitationObj === undefined ? (
                            <Text>{t("AnalysisPanel.Ucitavanje")}</Text>
                        ) :
                        (
                            <div>
                                <Separator>{t("AnalysisPanel.Metapodaci")}</Separator>
                                <Label>{t("AnalysisPanel.ImeDokumenta")}</Label><Text>{activeCitationObj.file_name}</Text>
                                <Label>{t("AnalysisPanel.AdresaDokumenta")}</Label><Text>{activeCitationObj.file_uri}</Text>
                                <Label>{t("AnalysisPanel.Naslov")}</Label><Text>{activeCitationObj.title}</Text>
                                <Label>{t("AnalysisPanel.Odjeljak")}</Label><Text>{activeCitationObj.section}</Text>
                                <Label>{t("AnalysisPanel.BrojStranica")}</Label><Text>{activeCitationObj.pages?.join(",")}</Text>
                                <Label>{t("AnalysisPanel.BrojTokena")}</Label><Text>{activeCitationObj.token_count}</Text>
                                <Separator>{t("AnalysisPanel.Sadrzaj")}</Separator>
                                <Label>{t("AnalysisPanel.Sadrzaj")}</Label><Text>{activeCitationObj.content}</Text>
                            </div>
                        )}
                    </PivotItem>
                    <PivotItem itemKey="rawFile" headerText={t("AnalysisPanel.Dokument")}>
                        {getCitationURL() === '' ? (
                            <Text>{t("AnalysisPanel.Ucitavanje")}</Text>
                        ) : ["docx", "xlsx", "pptx"].includes(sourceFileExt) ? (
                            // Treat other Office formats like "xlsx" for the Office Online Viewer
                            <iframe title="Source File" src={'https://view.officeapps.live.com/op/view.aspx?src=' + encodeURIComponent(getCitationURL()) + "&action=embedview&wdStartOn=" + pageNumber} width="100%" height={citationHeight} />
                        ) : sourceFileExt === "pdf" ? (
                            // Use object tag for PDFs because iframe does not support page numbers
                            <object data={getCitationURL() + "#page=" + pageNumber} type="application/pdf" width="100%" height={citationHeight} />
                        ) : sourceFileExt === "md" ? (
                            // Render Markdown content using react-markdown
                            <ReactMarkdown>{markdownContent}</ReactMarkdown>
                        ) : ["json", "txt", "xml"].includes(sourceFileExt) ? (
                            // Render plain text content
                            <pre>{plainTextContent}</pre>
                        ) : (
                            // Default to iframe for other file types
                            <iframe title="Source File" src={getCitationURL()} width="100%" height={citationHeight} />
                        )}
                    </PivotItem>
                   {isOriginalDocumentVisible() && <PivotItem itemKey="izvorniDokument" headerText={t("AnalysisPanel.IzvorniDokument")}>
                        <iframe title={t("AnalysisPanel.IzvorniDokument")} srcDoc={htmlContent} style={{ backgroundColor: 'white' }} width="100%" height={citationHeight} />
                    </PivotItem>}
                    {/* <PivotItem itemKey="prijevodDokumenta" headerText={t("AnalysisPanel.PrijevodDokumenta")}>
                        <object data={getTranslatedDocument()} style={{ border: "none" }} width="100%" height={citationHeight} />
                    </PivotItem> */}
                    {/* http://localhost:5000/translate-pdf */}
                </Pivot>
            </PivotItem>

        </Pivot>
    );
};
