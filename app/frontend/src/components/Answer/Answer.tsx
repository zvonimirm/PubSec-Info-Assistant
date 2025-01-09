// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { useMemo } from "react";
import { Document, Packer, Paragraph, TextRun, HeadingLevel, ImageRun } from "docx";
import { saveAs } from "file-saver";

// Add this declaration to extend the Window interface
declare global {
    interface Window {
        showSaveFilePicker: (options: any) => Promise<any>;
    }
}
import { Stack, IconButton } from "@fluentui/react";
import { ShieldCheckmark20Regular } from '@fluentui/react-icons';

import styles from "./Answer.module.css";

import { Approaches, ChatResponse, getCitationFilePath, ChatMode } from "../../api";
import { parseAnswerToHtml } from "./AnswerParser";
import { AnswerIcon } from "./AnswerIcon";
import { RAIPanel } from "../RAIPanel";
import CharacterStreamer from "../CharacterStreamer/CharacterStreamer";
import ReactMarkdown from "react-markdown";
import rehypeSanitize from "rehype-sanitize";
import rehypeRaw from "rehype-raw";

interface Props {
    answer: ChatResponse;
    isSelected?: boolean;
    onCitationClicked: (filePath: string, sourcePath: string, pageNumber: string) => void;
    onThoughtProcessClicked: () => void;
    onWebSearchClicked: () => void;
    onRagSearchClicked: () => void;
    onWebCompareClicked: () => void;
    onRagCompareClicked: () => void;
    onSupportingContentClicked: () => void;
    onFollowupQuestionClicked?: (question: string) => void;
    showFollowupQuestions?: boolean;
    onAdjustClick?: () => void;
    onRegenerateClick?: () => void;
    chatMode: ChatMode;
    answerStream: ReadableStream | undefined;
    setAnswer?: (data: ChatResponse) => void;
    setError?: (data: string) => void;
}

export const Answer = ({
    answer,
    isSelected,
    onCitationClicked,
    onThoughtProcessClicked,
    onWebSearchClicked,
    onRagSearchClicked,
    onWebCompareClicked,
    onRagCompareClicked,
    onSupportingContentClicked,
    onFollowupQuestionClicked,
    showFollowupQuestions,
    onAdjustClick,
    onRegenerateClick,
    chatMode,
    answerStream,
    setAnswer,
    setError
}: Props) => {
    const parsedAnswer = useMemo(() => parseAnswerToHtml(answer.answer, answer.approach, answer.work_citation_lookup, answer.web_citation_lookup, answer.thought_chain, onCitationClicked), [answer]);

    const getParagraphsFromHtml = (html: string) => {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, "text/html");
        const paragraphs = Array.from(doc.body.getElementsByTagName("p")).map(p => new Paragraph(p.textContent || ""));
        return paragraphs;
    }

    const getFirstNCitattiLines = (answerHtml: string, keyword: string = "CITATI"): string[] => {
        // Razdvajamo tekst na linije
        const lines = answerHtml.split("\n");

        // Tražimo liniju u kojoj prvi put pojavi ključna riječ "CITATI"
        const index = lines.findIndex(line => line.toLowerCase().includes(keyword.toLowerCase()));

        // Ako ključna riječ nije pronađena, vratit ćemo sve linije
        if (index === -1) {
            return lines;
        }

        // Vraćamo prvih n linija, uključujući liniju u kojoj je pronađena ključna riječ
        return lines.slice(0, index);
    };


    const onDownloadClick = async (answerHtml: string) => {


        // Split the text into lines
        const lines = getFirstNCitattiLines(answerHtml, "CITATI SLIČNIH SLUČAJEVA");

        // Function to process each line and generate paragraphs
        const paragraphs = lines.map((line, index) => {
            
            // Check if the line is a bold paragraph
            if (line.startsWith("**") && line.endsWith("**")) {
                return new Paragraph({
                    children: [
                        new TextRun({
                            text: line.slice(2, -2), // Remove the '**' symbols around the text
                            bold: true,
                            size: 24, // Set font size (24 half-points = 12 points)
                            
                        }),
                    ],
                    spacing: {
                        after: 300, // 400 TWIPs = 20 points (space after this paragraph)
                    },
                    alignment: "center", // Set alignment (e.g., "center", "left", "right", "justify")
                });
            }
            else{
                return new Paragraph({
                    children: [
                        new TextRun({
                            text: line.trim(),
                            size: 24, // Set font size (24 half-points = 12 points)
                            font: "Arial",
                        }),
                    ],
                    alignment: "both",
                });
            }

        });

        const imageArrayBuffer = 'data:image/jpeg;base64,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'

        paragraphs.unshift(new Paragraph({
            children: [
                new ImageRun({
                    data: imageArrayBuffer, // Base64 encoded image string
                    type: 'png',
                    transformation: {
                        width: 240,  // Set width in pixels
                        height: 130, // Set height in pixels
                    },
                }),
            ],
            spacing: {
                after: 400, // 400 TWIPs = 20 points (space after this paragraph)
            },

        }));

        // Convert Blob to ArrayBuffer for ImageRun

        const doc = new Document({
            sections: [
                {
                    properties: {},
                    children: paragraphs,
                },
            ],
        });



        // Generate the document and download it
        Packer.toBlob(doc).then((blob) => {
            saveAs(blob, "Prijedlog odluke.docx");
            console.log("Prijedlog odluke uspješno preuzet");
        });


    };
   

    return (
        <Stack className={`${(answer.approach == Approaches.ReadRetrieveRead || answer.approach == Approaches.DocumentSummary) ? styles.answerContainerWork :
            answer.approach == Approaches.ChatWebRetrieveRead ? styles.answerContainerWeb :
                answer.approach == Approaches.CompareWorkWithWeb || answer.approach == Approaches.CompareWebWithWork ? styles.answerContainerCompare :
                    answer.approach == Approaches.GPTDirect ? styles.answerContainerUngrounded :
                        styles.answerContainer} ${isSelected && styles.selected}`} verticalAlign="space-between">

            {/* Proces razmišljanja */}
            <Stack.Item>
                <Stack horizontal horizontalAlign="space-between">
                    <AnswerIcon approach={answer.approach} />
                    <div>
                        {answer.approach != Approaches.GPTDirect &&
                            <IconButton
                                style={{ color: "black" }}
                                iconProps={{ iconName: "Lightbulb" }}
                                title="Pokaži proces razmišljanja"
                                ariaLabel="Pokaži proces razmišljanja"
                                onClick={() => onThoughtProcessClicked()}
                                disabled={!answer.thoughts}
                            />
                        }
                        {(answer.approach == Approaches.ReadRetrieveRead || answer.approach == Approaches.DocumentSummary) &&
                            <IconButton
                                style={{ color: "black" }}
                                iconProps={{ iconName: "ClipboardList" }}
                                title="Pokaži prateći sadržaj"
                                ariaLabel="Pokaži prateći sadržaj"
                                onClick={() => onSupportingContentClicked()}
                                disabled={!answer.data_points || !answer.data_points.length}
                            />
                        }
                    </div>
                </Stack>
            </Stack.Item>

            {/* Vaši poslovni i privatni podaci su zaštićeni */}
            <Stack.Item grow>
                {(answer.approach != Approaches.GPTDirect) &&
                    <div className={styles.protectedBanner}>
                        <ShieldCheckmark20Regular></ShieldCheckmark20Regular>Vaši poslovni i privatni podaci su zaštićeni
                    </div>
                }
                {answer.answer && <div className={answer.approach == Approaches.GPTDirect ? styles.answerTextUngrounded : styles.answerText}><ReactMarkdown children={parsedAnswer.answerHtml} rehypePlugins={[rehypeRaw, rehypeSanitize]}></ReactMarkdown></div>}
                {!answer.answer && <CharacterStreamer
                    classNames={answer.approach == Approaches.GPTDirect ? styles.answerTextUngrounded : styles.answerText}
                    approach={answer.approach}
                    readableStream={answerStream}
                    setAnswer={setAnswer}
                    onStreamingComplete={() => { }}
                    typingSpeed={10}
                    setError={setError}
                />}
            </Stack.Item>

            {/* Citati */}
            {((parsedAnswer.approach == Approaches.ChatWebRetrieveRead) && !!parsedAnswer.web_citations.length) && (
                <Stack.Item>
                    <Stack horizontal wrap tokens={{ childrenGap: 5 }}>
                        <span className={styles.citationLearnMore}>Citati:</span>
                        {parsedAnswer.web_citations.map((x, i) => {
                            const path = getCitationFilePath(x);
                            return (
                                <a key={i} className={styles.citationWeb}
                                    title={x} href={x} target="_blank" rel="noopener noreferrer">
                                    {`${++i}. ${x}`}
                                </a>
                            );
                        })}
                    </Stack>
                </Stack.Item>

            )}



            {(parsedAnswer.approach == Approaches.DocumentSummary && !!parsedAnswer.work_citations.length) && (
                <Stack.Item>
                    <Stack horizontal wrap tokens={{ childrenGap: 5 }}>
                        <div className={styles.downloadFile} onClick={() => onDownloadClick(parsedAnswer.answerHtml)}> Preuzmite prijedlog odluke </div>
                    </Stack>
                </Stack.Item>
            )}

            {((parsedAnswer.approach == Approaches.ReadRetrieveRead || parsedAnswer.approach == Approaches.DocumentSummary) && !!parsedAnswer.work_citations.length) && (
                <Stack.Item>
                    <Stack horizontal wrap tokens={{ childrenGap: 5 }}>
                        <span className={styles.citationLearnMore}>Citati:</span>
                        {parsedAnswer.work_citations.map((x, i) => {
                            const path = getCitationFilePath(x);
                            return (
                                <a key={i} className={styles.citationWork}
                                    title={x} onClick={() => onCitationClicked(path, (parsedAnswer.work_sourceFiles as any)[x], (parsedAnswer.pageNumbers as any)[x])}>
                                    {`${++i}. ${x}`}
                                </a>
                            );
                        })}
                    </Stack>
                </Stack.Item>

            )}
            {parsedAnswer.approach == Approaches.CompareWebWithWork && (
                <div>
                    <Stack.Item>
                        <Stack horizontal wrap tokens={{ childrenGap: 5 }}>
                            <span className={styles.citationLearnMore}>Web citati:</span>
                            {parsedAnswer.web_citations.map((x, i) => {
                                const path = getCitationFilePath(x);
                                return (
                                    <a key={i} className={styles.citationWeb}
                                        title={x} href={x} target="_blank" rel="noopener noreferrer">
                                        {`${++i}. ${x}`}
                                    </a>
                                );
                            })}
                        </Stack>
                    </Stack.Item>
                    <div style={{ width: "100%", margin: "10px 0" }}></div>
                    <Stack.Item>
                        <Stack horizontal wrap tokens={{ childrenGap: 5 }}>
                            <span className={styles.citationLearnMore}>Citati iz dokumenata:</span>
                            {parsedAnswer.work_citations.map((x, i) => {
                                const path = getCitationFilePath(x);
                                return (
                                    <a key={i} className={styles.citationWork}
                                        title={x} onClick={() => onCitationClicked(path, (parsedAnswer.work_sourceFiles as any)[x], (parsedAnswer.pageNumbers as any)[x])}>
                                        {`${++i}. ${x}`}
                                    </a>
                                );
                            })}
                        </Stack>
                    </Stack.Item>
                </div>
            )}
            {parsedAnswer.approach == Approaches.CompareWorkWithWeb && (
                <div>
                    <Stack.Item>
                        <Stack horizontal wrap tokens={{ childrenGap: 5 }}>
                            <span className={styles.citationLearnMore}>Citati iz dokumenata:</span>
                            {parsedAnswer.work_citations.map((x, i) => {
                                const path = getCitationFilePath(x);
                                return (
                                    <a key={i} className={styles.citationWork}
                                        title={x} onClick={() => onCitationClicked(path, (parsedAnswer.work_sourceFiles as any)[x], (parsedAnswer.pageNumbers as any)[x])}>
                                        {`${++i}. ${x}`}
                                    </a>
                                );
                            })}
                        </Stack>
                    </Stack.Item>
                    <Stack.Item>
                        <Stack horizontal wrap tokens={{ childrenGap: 5 }}>
                            <span className={styles.citationLearnMore}>Web citati:</span>
                            {parsedAnswer.web_citations.map((x, i) => {
                                const path = getCitationFilePath(x);
                                return (
                                    <a key={i} className={styles.citationWeb}
                                        title={x} href={x} target="_blank" rel="noopener noreferrer">
                                        {`${++i}. ${x}`}
                                    </a>
                                );
                            })}
                        </Stack>
                    </Stack.Item>
                </div>
            )}

            {!!parsedAnswer.followupQuestions.length && showFollowupQuestions && onFollowupQuestionClicked && (
                <Stack.Item>
                    <Stack horizontal wrap className={`${!!parsedAnswer.work_citations.length ? styles.followupQuestionsList : !!parsedAnswer.web_citations.length ? styles.followupQuestionsList : ""}`} tokens={{ childrenGap: 6 }}>
                        <span className={styles.followupQuestionLearnMore}>Naknadna pitanja:</span>
                        {parsedAnswer.followupQuestions.map((x, i) => {
                            return (
                                <a key={i} className={styles.followupQuestion} title={x} onClick={() => onFollowupQuestionClicked(x)}>
                                    {`${x}`}
                                </a>
                            );
                        })}
                    </Stack>
                </Stack.Item>
            )}
            <Stack.Item>
                <div className={styles.raiwarning}>AI-generirani sadržaj može biti netočan</div>
            </Stack.Item>
            {answer.answer && <Stack.Item align="center">
                <RAIPanel approach={answer.approach} chatMode={chatMode} onAdjustClick={onAdjustClick} onRegenerateClick={onRegenerateClick} onWebSearchClicked={onWebSearchClicked} onWebCompareClicked={onWebCompareClicked} onRagCompareClicked={onRagCompareClicked} onRagSearchClicked={onRagSearchClicked} />
            </Stack.Item>}
        </Stack>
    );
};
