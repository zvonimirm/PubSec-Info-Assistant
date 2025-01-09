// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { useMemo } from "react";
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from "docx";
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
       // Check if the line is a heading
       if (line.startsWith("#")) {
         return new Paragraph({
           text: line.slice(1).trim(), // Remove the '#' symbol for heading text
           heading: HeadingLevel.HEADING_1,
         });
       }
       
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
           alignment: "center", // Set alignment (e.g., "center", "left", "right", "justify")
         });
       }
 
       // Handle normal paragraph
       return new Paragraph(line.trim());
     });

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
        saveAs(blob, "Prijedlog odluke-TEST.docx");
        console.log("Prijedlog odluke uspješno preuzet");
      });
    

    };
    return (
        <Stack className={`${(answer.approach == Approaches.ReadRetrieveRead || answer.approach == Approaches.DocumentSummary) ? styles.answerContainerWork : 
                            answer.approach == Approaches.ChatWebRetrieveRead ? styles.answerContainerWeb :
                            answer.approach == Approaches.CompareWorkWithWeb || answer.approach == Approaches.CompareWebWithWork ? styles.answerContainerCompare :
                            answer.approach == Approaches.GPTDirect ? styles.answerContainerUngrounded :
                            styles.answerContainer} ${isSelected && styles.selected}`} verticalAlign="space-between">
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
                        {(answer.approach == Approaches.ReadRetrieveRead || answer.approach == Approaches.DocumentSummary)  &&
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

            <Stack.Item grow>
                {(answer.approach != Approaches.GPTDirect) &&
                    <div className={styles.protectedBanner}>
                        <ShieldCheckmark20Regular></ShieldCheckmark20Regular>Vaši poslovni i privatni podaci su zaštićeni
                    </div>
                }
                { answer.answer && <div className={answer.approach == Approaches.GPTDirect ? styles.answerTextUngrounded : styles.answerText}><ReactMarkdown children={parsedAnswer.answerHtml} rehypePlugins={[rehypeRaw, rehypeSanitize]}></ReactMarkdown></div> }
                {!answer.answer && <CharacterStreamer 
                    classNames={answer.approach == Approaches.GPTDirect ? styles.answerTextUngrounded : styles.answerText} 
                    approach={answer.approach} 
                    readableStream={answerStream} 
                    setAnswer={setAnswer} 
                    onStreamingComplete={() => {}} 
                    typingSpeed={10} 
                    setError={setError}
                    /> }
            </Stack.Item>

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
            {((parsedAnswer.approach == Approaches.ReadRetrieveRead || parsedAnswer.approach == Approaches.DocumentSummary) && !!parsedAnswer.work_citations.length) && (
                <Stack.Item>
                    <Stack horizontal wrap tokens={{ childrenGap: 5 }}>
                        <div className={styles.downloadFile} onClick={() => onDownloadClick(parsedAnswer.answerHtml)}> Preuzmite prijedlog odluke </div>
                    </Stack>
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
