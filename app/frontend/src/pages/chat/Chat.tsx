// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { useRef, useState, useEffect, useCallback } from "react";
import { Checkbox, Panel, DefaultButton, TextField, SpinButton, Separator, Toggle, Label } from "@fluentui/react";
import Switch from 'react-switch';
import { GlobeFilled, BuildingMultipleFilled, AddFilled, ChatSparkleFilled } from "@fluentui/react-icons";
import { ITag } from '@fluentui/react/lib/Pickers';

import styles from "./Chat.module.css";
import rlbgstyles from "../../components/ResponseLengthButtonGroup/ResponseLengthButtonGroup.module.css";
import rtbgstyles from "../../components/ResponseTempButtonGroup/ResponseTempButtonGroup.module.css";

import { chatApi, Approaches, ChatResponse, ChatRequest, ChatTurn, ChatMode, getFeatureFlags, GetFeatureFlagsResponse } from "../../api";
import { Answer, AnswerError, AnswerLoading } from "../../components/Answer";
import { QuestionInput } from "../../components/QuestionInput";
import { ExampleList } from "../../components/Example";
import { UserChatMessage } from "../../components/UserChatMessage";
import { AnalysisPanel, AnalysisPanelTabs } from "../../components/AnalysisPanel";
import { SettingsButton } from "../../components/SettingsButton";
import { InfoButton } from "../../components/InfoButton";
import { ClearChatButton } from "../../components/ClearChatButton";
import { ResponseLengthButtonGroup } from "../../components/ResponseLengthButtonGroup";
import { ResponseTempButtonGroup } from "../../components/ResponseTempButtonGroup";
import { ChatModeButtonGroup } from "../../components/ChatModeButtonGroup";
import { InfoContent } from "../../components/InfoContent/InfoContent";
import { FolderPicker } from "../../components/FolderPicker";
import { TagPickerInline } from "../../components/TagPicker";
import React from "react";
import { LegalAssistantEntry } from "../../components/LegalAssistant/LegalAssistantEntry";
import {LegalAssistant} from "../../components/LegalAssistant/LegalAssistant";
import mammoth from 'mammoth';



const Chat = () => {
    const [isConfigPanelOpen, setIsConfigPanelOpen] = useState(false);
    const [isInfoPanelOpen, setIsInfoPanelOpen] = useState(false);
    const [retrieveCount, setRetrieveCount] = useState<number>(10);
    const [useSuggestFollowupQuestions, setUseSuggestFollowupQuestions] = useState<boolean>(true);
    const [userPersona, setUserPersona] = useState<string>("analyst");
    const [systemPersona, setSystemPersona] = useState<string>("an Assistant");
    // Setting responseLength to 2048 by default, this will effect the default display of the ResponseLengthButtonGroup below.
    // It must match a valid value of one of the buttons in the ResponseLengthButtonGroup.tsx file. 
    // If you update the default value here, you must also update the default value in the onResponseLengthChange method.
    const [responseLength, setResponseLength] = useState<number>(2048);

    // Setting responseTemp to 0.6 by default, this will effect the default display of the ResponseTempButtonGroup below.
    // It must match a valid value of one of the buttons in the ResponseTempButtonGroup.tsx file.
    // If you update the default value here, you must also update the default value in the onResponseTempChange method.
    const [responseTemp, setResponseTemp] = useState<number>(0.6);

    const [activeChatMode, setChatMode] = useState<ChatMode>(ChatMode.WorkOnly);
    const [defaultApproach, setDefaultApproach] = useState<number>(Approaches.ReadRetrieveRead);
    const [activeApproach, setActiveApproach] = useState<number>(Approaches.ReadRetrieveRead);
    const [featureFlags, setFeatureFlags] = useState<GetFeatureFlagsResponse | undefined>(undefined);

    const lastQuestionRef = useRef<string>("");
    const lastQuestionWorkCitationRef = useRef<{ [key: string]: { citation: string; source_path: string; page_number: string } }>({});
    const lastQuestionWebCitiationRef = useRef<{ [key: string]: { citation: string; source_path: string; page_number: string } }>({});
    const lastQuestionThoughtChainRef = useRef<{ [key: string]: string }>({});
    const chatMessageStreamEnd = useRef<HTMLDivElement | null>(null);

    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<unknown>();

    const [activeCitation, setActiveCitation] = useState<string>();
    const [activeCitationSourceFile, setActiveCitationSourceFile] = useState<string>();
    const [activeCitationSourceFilePageNumber, setActiveCitationSourceFilePageNumber] = useState<string>();
    const [activeAnalysisPanelTab, setActiveAnalysisPanelTab] = useState<AnalysisPanelTabs | undefined>(undefined);
    const [selectedFolders, setSelectedFolders] = useState<string[]>([]);
    const [selectedTags, setSelectedTags] = useState<ITag[]>([]);

    const [selectedAnswer, setSelectedAnswer] = useState<number>(0);
    const [answers, setAnswers] = useState<[user: string, response: ChatResponse][]>([]);
    const [answerStream, setAnswerStream] = useState<ReadableStream | undefined>(undefined);
    const [abortController, setAbortController] = useState<AbortController | undefined>(undefined);

    const [isLAEntryPointVisible, setAssistentEntryPointVisible] = useState(true);
    const [fileText, setFileText] = useState<string[]>([]);

    async function fetchFeatureFlags() {
        try {
            const fetchedFeatureFlags = await getFeatureFlags();
            setFeatureFlags(fetchedFeatureFlags);
        } catch (error) {
            // Handle the error here
            console.log(error);
        }
    }

    const handleLegalAssistantEntryClick = () => {
        setAssistentEntryPointVisible(false);
    }


    const makeApiRequest = async (question: string, approach: Approaches, 
                                work_citation_lookup: { [key: string]: { citation: string; source_path: string; page_number: string } },
                                web_citation_lookup: { [key: string]: { citation: string; source_path: string; page_number: string } },
                                thought_chain: { [key: string]: string}) => {
        lastQuestionRef.current = question;
        lastQuestionWorkCitationRef.current = work_citation_lookup;
        lastQuestionWebCitiationRef.current = web_citation_lookup;
        lastQuestionThoughtChainRef.current = thought_chain;
        setActiveApproach(approach);

        error && setError(undefined);
        setIsLoading(true);
        setActiveCitation(undefined);
        setActiveAnalysisPanelTab(undefined);

        try {
            const history: ChatTurn[] = answers.map(a => ({ user: a[0], bot: a[1].answer }));
            const request: ChatRequest = {
                history: [...history, { user: question, bot: undefined }],
                approach: approach,
                overrides: {
                    promptTemplate: undefined,
                    excludeCategory: undefined,
                    top: retrieveCount,
                    semanticRanker: true,
                    semanticCaptions: false,
                    suggestFollowupQuestions: useSuggestFollowupQuestions,
                    userPersona: userPersona,
                    systemPersona: systemPersona,
                    aiPersona: "",
                    responseLength: responseLength,
                    responseTemp: responseTemp,
                    selectedFolders: selectedFolders.includes("selectAll") ? "All" : selectedFolders.length == 0 ? "All" : selectedFolders.join(","),
                    selectedTags: selectedTags.map(tag => tag.name).join(",")
                },
                citation_lookup: approach == Approaches.CompareWebWithWork ? web_citation_lookup : approach == Approaches.CompareWorkWithWeb ? work_citation_lookup : {},
                thought_chain: thought_chain
            };

            const temp: ChatResponse = {
                answer: "",
                thoughts: "",
                data_points: [],
                approach: approach,
                thought_chain: {
                    "work_response": "",
                    "web_response": ""
                },
                work_citation_lookup: {},
                web_citation_lookup: {}
            };

            setAnswers([...answers, [question, temp]]);
            const controller = new AbortController();
            setAbortController(controller);
            const signal = controller.signal;
            const result = await chatApi(request, signal);
            if (!result.body) {
                throw Error("No response body");
            }

            setAnswerStream(result.body);
        } catch (e) {
            setError(e);
        } finally {
            setIsLoading(false);
        }
    };

    const clearChat = () => {
        lastQuestionRef.current = "";
        lastQuestionWorkCitationRef.current = {};
        lastQuestionWebCitiationRef.current = {};
        lastQuestionThoughtChainRef.current = {};
        error && setError(undefined);
        setActiveCitation(undefined);
        setActiveAnalysisPanelTab(undefined);
        setAnswers([]);
    };

    const onResponseLengthChange = (_ev: any) => {
        for (let node of _ev.target.parentNode.childNodes) {
            if (node.value == _ev.target.value) {
                switch (node.value) {
                    case "1024":
                        node.className = `${rlbgstyles.buttonleftactive}`;
                        break;
                    case "2048":
                        node.className = `${rlbgstyles.buttonmiddleactive}`;
                        break;
                    case "3072":
                        node.className = `${rlbgstyles.buttonrightactive}`;
                        break;
                    default:
                        //do nothing
                        break;
                }
            }
            else {
                switch (node.value) {
                    case "1024":
                        node.className = `${rlbgstyles.buttonleft}`;
                        break;
                    case "2048":
                        node.className = `${rlbgstyles.buttonmiddle}`;
                        break;
                    case "3072":
                        node.className = `${rlbgstyles.buttonright}`;
                        break;
                    default:
                        //do nothing
                        break;
                }
            }
        }
        // the or value here needs to match the default value assigned to responseLength above.
        setResponseLength(_ev.target.value as number || 2048)
    };

    const onResponseTempChange = (_ev: any) => {
        for (let node of _ev.target.parentNode.childNodes) {
            if (node.value == _ev.target.value) {
                switch (node.value) {
                    case "1.0":
                        node.className = `${rtbgstyles.buttonleftactive}`;
                        break;
                    case "0.6":
                        node.className = `${rtbgstyles.buttonmiddleactive}`;
                        break;
                    case "0":
                        node.className = `${rtbgstyles.buttonrightactive}`;
                        break;
                    default:
                        //do nothing
                        break;
                }
            }
            else {
                switch (node.value) {
                    case "1.0":
                        node.className = `${rtbgstyles.buttonleft}`;
                        break;
                    case "0.6":
                        node.className = `${rtbgstyles.buttonmiddle}`;
                        break;
                    case "0":
                        node.className = `${rtbgstyles.buttonright}`;
                        break;
                    default:
                        //do nothing
                        break;
                }
            }
        }
        // the or value here needs to match the default value assigned to responseLength above.
        setResponseTemp(_ev.target.value as number || 0.6)
    };

    const onChatModeChange = (_ev: any) => {
        abortController?.abort();
        const chatMode = _ev.target.value as ChatMode || ChatMode.WorkOnly;
        setChatMode(chatMode);
        if (chatMode == ChatMode.WorkOnly)
                setDefaultApproach(Approaches.ReadRetrieveRead);
                setActiveApproach(Approaches.ReadRetrieveRead);
        if (chatMode == ChatMode.WorkPlusWeb)
            if (defaultApproach == Approaches.GPTDirect) 
                setDefaultApproach(Approaches.ReadRetrieveRead)
                setActiveApproach(Approaches.ReadRetrieveRead);
        if (chatMode == ChatMode.Ungrounded)
            setDefaultApproach(Approaches.GPTDirect)
            setActiveApproach(Approaches.GPTDirect);
        clearChat();
    }

    const handleToggle = () => {
        defaultApproach == Approaches.ReadRetrieveRead ? setDefaultApproach(Approaches.ChatWebRetrieveRead) : setDefaultApproach(Approaches.ReadRetrieveRead);
    }

    useEffect(() => {fetchFeatureFlags()}, []);
    useEffect(() => chatMessageStreamEnd.current?.scrollIntoView({ behavior: "smooth" }), [isLoading]);

    const onRetrieveCountChange = (_ev?: React.SyntheticEvent<HTMLElement, Event>, newValue?: string) => {
        setRetrieveCount(parseInt(newValue || "5"));
    };

    const onUserPersonaChange = (_ev?: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, newValue?: string) => {
        setUserPersona(newValue || "");
    }

    const onSystemPersonaChange = (_ev?: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, newValue?: string) => {
        setSystemPersona(newValue || "");
    }

    const onUseSuggestFollowupQuestionsChange = (_ev?: React.FormEvent<HTMLElement | HTMLInputElement>, checked?: boolean) => {
        setUseSuggestFollowupQuestions(!!checked);
    };

    const onExampleClicked = (example: string) => {
        makeApiRequest(example, defaultApproach, {}, {}, {});
    };

    const onShowCitation = (citation: string, citationSourceFile: string, citationSourceFilePageNumber: string, index: number) => {
        if (activeCitation === citation && activeAnalysisPanelTab === AnalysisPanelTabs.CitationTab && selectedAnswer === index) {
            setActiveAnalysisPanelTab(undefined);
        } else {
            setActiveCitation(citation);
            setActiveCitationSourceFile(citationSourceFile);
            setActiveCitationSourceFilePageNumber(citationSourceFilePageNumber);
            setActiveAnalysisPanelTab(AnalysisPanelTabs.CitationTab);
        }

        setSelectedAnswer(index);
    };

    const onToggleTab = (tab: AnalysisPanelTabs, index: number) => {
        if (activeAnalysisPanelTab === tab && selectedAnswer === index) {
            setActiveAnalysisPanelTab(undefined);
        } else {
            setActiveAnalysisPanelTab(tab);
        }

        setSelectedAnswer(index);
    };

    const onSelectedKeyChanged = (selectedFolders: string[]) => {
        setSelectedFolders(selectedFolders)
    };

    const onSelectedTagsChange = (selectedTags: ITag[]) => {
        setSelectedTags(selectedTags)
    }

    useEffect(() => {
        // Hide Scrollbar for this page
        document.body.classList.add('chat-overflow-hidden-body');
        // Do not apply to other pages
        return () => {
            document.body.classList.remove('chat-overflow-hidden-body');
        };
    }, []);

    const updateAnswerAtIndex = (index: number, response: ChatResponse) => {
        setAnswers(currentAnswers => {
            const updatedAnswers = [...currentAnswers];
            updatedAnswers[index] = [updatedAnswers[index][0], response];
            return updatedAnswers;
        });
    }

    const removeAnswerAtIndex = (index: number) => {
        const newItems = answers.filter((item, idx) => idx !== index);
        setAnswers(newItems);
    }

    const handleSummaryClick = async (text: string, files: any) => {
        console.log("Handling case one with text:", files);
        readTextFromFile(files);
    };

    const handleBlobStorage = (text: string, files: any) => {
        console.log("Handling case two with text:", text);
        handleUpload(files);
    };

    const handleDecisionProposal = (text: string, files: any) => {
        console.log("Handling case three with text:", text);
        // Add your logic for case three here
    };
    const handleUpload = async (files: any)  => {  

        console.log("Handling case two with text:"); 
        try {  
          const data = new FormData();  
          console.log("files", files);  
        // //   setUploadStarted(true);  
        //   let uploadedFilesCount = 0;
      
        //   const uploadPromises = files.map(async (indexedFile:any, index:any) => {  
        //     const file = indexedFile.file as File;  
        //     // const filePath = folderPath === "" ? file.name : `${folderPath}/${file.name}`;  
            const filePath = files[0].name;  
      
        //     // Append file and other data to FormData  
            data.append("file", files[0]);  
            data.append("file_path", filePath);  
            
        //     if (tags.length > 0) {
        //       data.append("tags", tags.map(encodeURIComponent).join(",")); 
        //     }
      
            try {  
              const response = await fetch("/file", {  
                method: "POST",  
                body: data,  
              });  
      
              if (!response.ok) {  
                throw new Error(`Failed to upload file: ${filePath}`);  
              }  
      
              const result = await response.json();  
              console.log(result);  
      
        //       // Write status to log  
        //       const logEntry: StatusLogEntry = {  
        //         path: "upload/" + filePath,  
        //         status: "File uploaded from browser to backend API",  
        //         status_classification: StatusLogClassification.Info,  
        //         state: StatusLogState.Uploaded,  
        //       };  
        //       await logStatus(logEntry);
              
            } catch (error) {  
              console.log("Unable to upload file " + filePath + " : Error: " + error);  
            }  
        //     // Increment the counter for successfully uploaded files
        //     uploadedFilesCount++;
        //     setProgress((uploadedFilesCount / files.length) * 100);
          
        //   });
      
        //   await Promise.all(uploadPromises);  
        //   setUploadStarted(false);  
        } catch (error) {  
          console.log(error);  
        }  
        //   , [files, folderPath, tags]);
    };

    const readTextFromFile = async (files: any) => {
        console.log("Reading file - start");
        const reader = new FileReader();
        console.log("Reading file - middle");
        reader.readAsText(files[0]);
        console.log("Reading file", reader.result);
    };

    const handleLegalAssistantAction = (text: string, files: any) => {
        clearChat();
        setAssistentEntryPointVisible(true);

        if (text.includes("Summary")) {
            handleSummaryClick(text, files);
        } else if (text.includes("BlobStorage")) {
            handleBlobStorage(text, files);
        } else if (text.includes("Decision")) {
            handleDecisionProposal(text, files);
        }
        
        makeApiRequest(`${getDummyText()}. Mogu li dobiti sažetak ovog dokumenta?`, Approaches.GPTDirect, {}, {}, {});  
    };
    const getDummyText   = () => {return `Broj: Revd 999/9999-9
        U  I M E  R E P U B L I K E  H R V A T S K E
        R J E Š E N J E
        Vrhovni sud Republike Hrvatske u vijeću sastavljenom od sudaca Joška Radića, predsjednika vijeća Zrinke Gligo članice vijeća i sutkinje izvjestiteljice, mr. sc. Katarine Pavić člana vijeća, u pravnoj stvari tužiteljice X. X. iz G., OIB: ..., koju zastupa punomoćnica Y.Y., odvjetnica u O., protiv tuženika T.T. iz Bosne i Hercegovine, I., OIB: ..., kojeg zastupaju punomoćnici, odvjetnici iz Odvjetničkog društva U. P. j.t.d., O., radi smetanja posjeda, odlučujući o prijedlogu tužiteljice za dopuštenje revizije protiv rješenja Županijskog suda u Puli-Pola poslovni broj Gž-888/8888-2 od 30. lipnja 8888., Koji je potvrđeno rješenje Općinskog suda u Makarskoj poslovni broj Psp-32/7777 od 1. ožujka 7777., u sjednici održanoj 25. siječnja 2024.,
        r i j e š i o  j e:
        Prijedlog tužiteljice za dopuštenje revizije se odbija.
        Obrazloženje
        1. Tužiteljica je podnijela prijedlog za dopuštenje revizije protiv rješenja Županijskog
        suda u Puli-Pola poslovni broj Gž-888/8888-2 od 30. lipnja 8888., kojim je potvrđeno
        rješenje Općinskog suda u Makarskoj poslovni broj Psp-32/7777 od 1. ožujka 2023. u
        kojem je naznačila tri pitanja koja smatra važnim za odluku u sporu i za osiguranje
        jedinstvene primjene prava i ravnopravnosti svih u njegovoj primjeni, a koja glase:
        "1. Kod tužbi za smetanje posjeda, je li teret dokazivanja dana saznanja za čin smetanja posjeda i za počinitelja na tužitelju i računa li se od saznanja kumulativno za čin smetanja i za počinitelja?
        2. Veže li se datum subjektivnog saznanja za čin smetanja posjeda i za počinitelja za činjenicu sklapanja npr. ugovora o kupoprodaji temeljem kojeg je počinitelj uveden u posjed ili za faktični čin smetanja konkretnog počinitelja?
        3. Ako je kod prvog smetanja posjeda dotadašnji posjednik posegao za samopomoći, pa se smetanje opet dogodilo nakon čega je ustao sa tužbom računa li se datum saznanja za čin smetanja i za počinitelja od tog posljednjeg smetanja?"
        2. Odgovor na prijedlog nije podnesen.
        3. Postupajući u skladu s odredbama čl. 385.a i čl. 387. Zakona o parničnom postupku ("Narodne novine", broj 53/91, 91/92, 112/99, 88/01, 117/03, 88/05, 2/07, 84/08, 96/08, 123/08, 57/11, 148/11, 25/13, 28/13, 89/14, 70/19 i 80/22 – dalje: ZPP), revizijski sud je ocijenio da se pitanja naznačena u prijedlogu za dopuštenje revizije ne mogu smatrati važnim pravnim pitanjem za osiguranje jedinstvene primjene prava i ravnopravnosti svih u njegovoj primjeni ili za razvoj prava kroz sudsku praksu. Naime, iz sadržaja prvog dijela pitanja pod 1. proizlazi da tužiteljica u biti prigovara činjeničnom utvrđenju glede dana saznanja za čin smetanja posjeda i za počinitelja, pa kako u revizijskom stupnju postupka to ne može biti predmet razmatranja, nije riječ o pitanju koje ima u vidu odredba čl. 385.a ZPP, dok odgovor na drugi dio pitanja proizlazi iz odredbe čl. 21. st. 3. Zakona o vlasništvu i drugim stvarnim pravima ("Narodne novine", broj 91/96, 66/98, 137/99, 22/00, 73/00, 114/01, 79/06, 141/06, 146/08, 38/09, 153/09, 143/12, 152/14, 81/15 i 94/17), a koja odredba je jasna i nije ju potrebno posebno tumačiti.
        3.1. Odgovor na drugo pitanje naznačeno u prijedlogu za dopuštenje revizije ovisi o utvrđenim činjenicama i okolnostima svakog konkretnog slučaja, slijedom čega pitanje nema element univerzalnosti, a da bi bila riječ o pitanju iz čl. 385.a ZPP.
        3.2. Trećim pitanjem tužiteljica pokušava dovesti u sumnju pravilnost pobijane odluke, vlastitim tvrdnjama bez realne podloge u sadržaju spisa, slijedom čega, niti to pitanje ne opravdava intervenciju ovog suda u smislu odredbe čl. 385.a ZPP i dopuštenje revizije.
        5. Slijedom navedenog, kako u ovoj pravnoj stvari nisu ispunjene pretpostavke za postupanje revizijskog suda sukladno čl. 385.a st. 1. ZPP i dopuštenje revizije, na temelju odredbe čl. 389.b st. 1. i 2. ZPP, riješeno je kao u izreci.
        Zagreb, 25. siječnja 2024.
        Zrinka Gligo
    `}

    return (
        <div className={styles.container}>
            <div className={styles.subHeader}>
                <ChatModeButtonGroup className="" defaultValue={activeChatMode} onClick={onChatModeChange} featureFlags={featureFlags} /> 
                <div className={styles.commandsContainer}>
                    <ClearChatButton className={styles.commandButton} onClick={clearChat} disabled={!lastQuestionRef.current || isLoading} />
                    <SettingsButton className={styles.commandButton} onClick={() => setIsConfigPanelOpen(!isConfigPanelOpen)} />
                    <InfoButton className={styles.commandButton} onClick={() => setIsInfoPanelOpen(!isInfoPanelOpen)} />
                </div>
            </div>
            <div className={styles.chatRoot}>
            
            {isLAEntryPointVisible && <div className={styles.chatContainer}>
                    {!lastQuestionRef.current ? (
                        <div>
                        <div className={styles.chatEmptyState}>
                            {activeChatMode == ChatMode.WorkOnly ? 
                                <div>
                                    <div className={styles.chatEmptyStateHeader}> 
                                        <BuildingMultipleFilled fontSize={"100px"} primaryFill={"rgba(27, 74, 239, 1)"} aria-hidden="true" aria-label="Chat with your Work Data logo" />
                                        </div>
                                    <h1 className={styles.chatEmptyStateTitle}>Pitajte informacije o odlukama VSRH</h1>
                                </div>
                            : activeChatMode == ChatMode.WorkPlusWeb ?
                                <div>
                                    <div className={styles.chatEmptyStateHeader}> 
                                        <BuildingMultipleFilled fontSize={"80px"} primaryFill={"rgba(27, 74, 239, 1)"} aria-hidden="true" aria-label="Chat with your Work and Web Data logo" /><AddFilled fontSize={"50px"} primaryFill={"rgba(0, 0, 0, 0.7)"} aria-hidden="true" aria-label=""/><GlobeFilled fontSize={"80px"} primaryFill={"rgba(24, 141, 69, 1)"} aria-hidden="true" aria-label="" />
                                    </div>
                                    <h1 className={styles.chatEmptyStateTitle}>Chat with your work and web data</h1>
                                </div>
                            : //else Ungrounded
                                <div>
                                    <div className={styles.chatEmptyStateHeader}> 
                                        <ChatSparkleFilled fontSize={"80px"} primaryFill={"rgba(0, 0, 0, 0.35)"} aria-hidden="true" aria-label="Chat logo" />
                                    </div>
                                    <h1 className={styles.chatEmptyStateTitle}>Chat directly with a LLM</h1>
                                </div>
                            }
                            <span className={styles.chatEmptyObjectives}>
                                <i>Legal AI koristi umjetnu inteligenciju.   </i>
                            </span>
                            {activeChatMode != ChatMode.Ungrounded &&
                                <div>
                                    <h2 className={styles.chatEmptyStateSubtitle}>Postavite pitanje ili probajte primjere</h2>
                                    <ExampleList onExampleClicked={onExampleClicked} />
                                </div>
                            }
                        </div>
                        <div>
                           <LegalAssistantEntry onLegalAssistantEntryClicked={handleLegalAssistantEntryClick}/>
                        </div>
                        </div>

                    ) : (
                        <div className={styles.chatMessageStream}>
                            {answers.map((answer, index) => (
                                <div key={index}>
                                    <UserChatMessage
                                        message={answer[0]}
                                        approach={answer[1].approach}
                                    />
                                    <div className={styles.chatMessageGpt}>
                                        <Answer
                                            key={index}
                                            answer={answer[1]}
                                            answerStream={answerStream}
                                            setError={(error) => {setError(error); removeAnswerAtIndex(index); }}
                                            setAnswer={(response) => updateAnswerAtIndex(index, response)}
                                            isSelected={selectedAnswer === index && activeAnalysisPanelTab !== undefined}
                                            onCitationClicked={(c, s, p) => onShowCitation(c, s, p, index)}
                                            onThoughtProcessClicked={() => onToggleTab(AnalysisPanelTabs.ThoughtProcessTab, index)}
                                            onSupportingContentClicked={() => onToggleTab(AnalysisPanelTabs.SupportingContentTab, index)}
                                            onFollowupQuestionClicked={q => makeApiRequest(q, answer[1].approach, answer[1].work_citation_lookup, answer[1].web_citation_lookup, answer[1].thought_chain)}
                                            showFollowupQuestions={useSuggestFollowupQuestions && answers.length - 1 === index}
                                            onAdjustClick={() => setIsConfigPanelOpen(!isConfigPanelOpen)}
                                            onRegenerateClick={() => makeApiRequest(answers[index][0], answer[1].approach, answer[1].work_citation_lookup, answer[1].web_citation_lookup, answer[1].thought_chain)}
                                            onWebSearchClicked={() => makeApiRequest(answers[index][0], Approaches.ChatWebRetrieveRead, answer[1].work_citation_lookup, answer[1].web_citation_lookup, answer[1].thought_chain)}
                                            onWebCompareClicked={() => makeApiRequest(answers[index][0], Approaches.CompareWorkWithWeb, answer[1].work_citation_lookup, answer[1].web_citation_lookup, answer[1].thought_chain)}
                                            onRagCompareClicked={() => makeApiRequest(answers[index][0], Approaches.CompareWebWithWork, answer[1].work_citation_lookup, answer[1].web_citation_lookup, answer[1].thought_chain)}
                                            onRagSearchClicked={() => makeApiRequest(answers[index][0], Approaches.ReadRetrieveRead, answer[1].work_citation_lookup, answer[1].web_citation_lookup, answer[1].thought_chain)}
                                            chatMode={activeChatMode}
                                        />
                                    </div>
                                </div>
                            ))}
                            {error ? (
                                <>
                                    <UserChatMessage message={lastQuestionRef.current} approach={activeApproach}/>
                                    <div className={styles.chatMessageGptMinWidth}>
                                        <AnswerError error={error.toString()} onRetry={() => makeApiRequest(lastQuestionRef.current, activeApproach, lastQuestionWorkCitationRef.current, lastQuestionWebCitiationRef.current, lastQuestionThoughtChainRef.current)} />
                                    </div>
                                </>
                            ) : null}
                            <div ref={chatMessageStreamEnd} />
                        </div>
                    )}
                    
                    <div className={styles.chatInput}>
                        {activeChatMode == ChatMode.WorkPlusWeb && (
                            <div className={styles.chatInputWarningMessage}> 
                                {defaultApproach == Approaches.ReadRetrieveRead && 
                                    <div>Questions will be answered by default from Work <BuildingMultipleFilled fontSize={"20px"} primaryFill={"rgba(27, 74, 239, 1)"} aria-hidden="true" aria-label="Work Data" /></div>}
                                {defaultApproach == Approaches.ChatWebRetrieveRead && 
                                    <div>Questions will be answered by default from Web <GlobeFilled fontSize={"20px"} primaryFill={"rgba(24, 141, 69, 1)"} aria-hidden="true" aria-label="Web Data" /></div>
                                }
                            </div> 
                        )}
                        <QuestionInput
                            clearOnSend
                            placeholder="Upišite pitanje"
                            disabled={isLoading}
                            onSend={question => makeApiRequest(question, defaultApproach, {}, {}, {})}
                            onAdjustClick={() => setIsConfigPanelOpen(!isConfigPanelOpen)}
                            onInfoClick={() => setIsInfoPanelOpen(!isInfoPanelOpen)}
                            showClearChat={true}
                            onClearClick={clearChat}
                            onRegenerateClick={() => makeApiRequest(lastQuestionRef.current, defaultApproach, {}, {}, {})}
                        />
                    </div>
                </div>
            }
            {
                !isLAEntryPointVisible &&
                    <LegalAssistant onEvent = {handleLegalAssistantAction} />
            }
                {answers.length > 0 && activeAnalysisPanelTab && (
                    <AnalysisPanel
                        className={styles.chatAnalysisPanel}
                        activeCitation={activeCitation}
                        sourceFile={activeCitationSourceFile}
                        pageNumber={activeCitationSourceFilePageNumber}
                        onActiveTabChanged={x => onToggleTab(x, selectedAnswer)}
                        citationHeight="760px"
                        answer={answers[selectedAnswer][1]}
                        activeTab={activeAnalysisPanelTab}
                    />
                )}

                <Panel
                    headerText="Configure answer generation"
                    isOpen={isConfigPanelOpen}
                    isBlocking={false}
                    onDismiss={() => setIsConfigPanelOpen(false)}
                    closeButtonAriaLabel="Close"
                    onRenderFooterContent={() => <DefaultButton onClick={() => setIsConfigPanelOpen(false)}>Close</DefaultButton>}
                    isFooterAtBottom={true}
                >
                    {activeChatMode == ChatMode.WorkPlusWeb &&
                        <div>
                            <Label>Use this datasource to answer Questions by default:</Label>
                            <div className={styles.defaultApproachSwitch}>
                                <div className={styles.defaultApproachWebOption} onClick={handleToggle}>Web</div>
                                <Switch onChange={handleToggle} checked={defaultApproach == Approaches.ReadRetrieveRead} uncheckedIcon={true} checkedIcon={true} onColor="#1B4AEF" offColor="#188d45"/>
                                <div className={styles.defaultApproachWorkOption} onClick={handleToggle}>Dokumenti</div>
                            </div>
                        </div>
                    }
                    {activeChatMode != ChatMode.Ungrounded &&
                        <SpinButton
                            className={styles.chatSettingsSeparator}
                            label="Retrieve this many documents from search:"
                            min={1}
                            max={50}
                            defaultValue={retrieveCount.toString()}
                            onChange={onRetrieveCountChange}
                        />
                    }
                    {activeChatMode != ChatMode.Ungrounded &&
                        <Checkbox
                            className={styles.chatSettingsSeparator}
                            checked={useSuggestFollowupQuestions}
                            label="Suggest follow-up questions"
                            onChange={onUseSuggestFollowupQuestionsChange}
                        />
                    }
                    <TextField className={styles.chatSettingsSeparator} defaultValue={userPersona} label="User Persona" onChange={onUserPersonaChange} />
                    <TextField className={styles.chatSettingsSeparator} defaultValue={systemPersona} label="System Persona" onChange={onSystemPersonaChange} />
                    <ResponseLengthButtonGroup className={styles.chatSettingsSeparator} onClick={onResponseLengthChange} defaultValue={responseLength} />
                    <ResponseTempButtonGroup className={styles.chatSettingsSeparator} onClick={onResponseTempChange} defaultValue={responseTemp} />
                    {activeChatMode != ChatMode.Ungrounded &&
                        <div>
                            <Separator className={styles.chatSettingsSeparator}>Filter Search Results by</Separator>
                            <FolderPicker allowFolderCreation={false} onSelectedKeyChange={onSelectedKeyChanged} preSelectedKeys={selectedFolders} />
                            <TagPickerInline allowNewTags={false} onSelectedTagsChange={onSelectedTagsChange} preSelectedTags={selectedTags} />
                        </div>
                    }
                </Panel>

                <Panel
                    headerText="Information"
                    isOpen={isInfoPanelOpen}
                    isBlocking={false}
                    onDismiss={() => setIsInfoPanelOpen(false)}
                    closeButtonAriaLabel="Close"
                    onRenderFooterContent={() => <DefaultButton onClick={() => setIsInfoPanelOpen(false)}>Close</DefaultButton>}
                    isFooterAtBottom={true}                >
                    <div className={styles.resultspanel}>
                        <InfoContent />
                    </div>
                </Panel>
            </div>
        </div>
    );
};

export default Chat;
