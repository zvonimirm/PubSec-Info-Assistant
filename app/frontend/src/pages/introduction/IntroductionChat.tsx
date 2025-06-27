import { useEffect, useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import styles from './IntroductionEntry.module.css';
import { OdlukeOdboraExampleList } from "../../components/Example/OdlukeOdboraExampleList";
import { chatApi, Approaches, ChatResponse, ChatRequest, ChatTurn, ChatMode, getFeatureFlags, GetFeatureFlagsResponse } from "../../api";
import { AnalysisPanel, AnalysisPanelTabs } from "../../components/AnalysisPanel";
import { QuestionInput } from "../../components/QuestionInput";
import { Answer, AnswerError, AnswerLoading } from "../../components/Answer";
import { UserChatMessage } from "../../components/UserChatMessage";
import { IntroductionInitQuestion } from "../../components/Introduction/IntroductionInitQuestion";
import { useTranslation } from "react-i18next";


const IntroductionChat = () => {
    
   
    
    const [defaultApproach, setDefaultApproach] = useState<number>(Approaches.Introduction);
    const [activeApproach, setActiveApproach] = useState<number>(Approaches.Introduction);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [activeCitation, setActiveCitation] = useState<string>();
    const [activeAnalysisPanelTab, setActiveAnalysisPanelTab] = useState<AnalysisPanelTabs | undefined>(undefined);
    const [error, setError] = useState<unknown>();
    const [answers, setAnswers] = useState<[user: string, response: ChatResponse][]>([]);
    const [answerStream, setAnswerStream] = useState<ReadableStream | undefined>(undefined);
    
    const [userPersona, setUserPersona] = useState<string>("analyst");
    const [systemPersona, setSystemPersona] = useState<string>("an Assistant");
    const [responseLength, setResponseLength] = useState<number>(2048);
    const [responseTemp, setResponseTemp] = useState<number>(0.6);
    const [abortController, setAbortController] = useState<AbortController | undefined>(undefined);

    const lastQuestionRef = useRef<string>("");
    const lastQuestionWorkCitationRef = useRef<{ [key: string]: { citation: string; source_path: string; page_number: string } }>({});
    const lastQuestionWebCitiationRef = useRef<{ [key: string]: { citation: string; source_path: string; page_number: string } }>({});
    const lastQuestionThoughtChainRef = useRef<{ [key: string]: string }>({});
    const chatMessageStreamEnd = useRef<HTMLDivElement | null>(null);
    const [selectedAnswer, setSelectedAnswer] = useState<number>(0);

    const makeApiRequest = async (question: string, approach: Approaches, 
                                    work_citation_lookup: { [key: string]: { citation: string; source_path: string; page_number: string } },
                                    web_citation_lookup: { [key: string]: { citation: string; source_path: string; page_number: string } },
                                    thought_chain: { [key: string]: string },
                                    display_question?: string) => {
            lastQuestionRef.current = question;
            lastQuestionWorkCitationRef.current = work_citation_lookup;
            lastQuestionWebCitiationRef.current = web_citation_lookup;
            lastQuestionThoughtChainRef.current = thought_chain;
            setActiveApproach(approach);
            setDefaultApproach(approach);
    
            error && setError(undefined);
            setIsLoading(true);
            setActiveCitation(undefined);
            setActiveAnalysisPanelTab(undefined);
    
            try {
                const display_question_text = display_question || question;
                const history: ChatTurn[] = answers.map(a => ({ user: a[0], bot: a[1].answer }));
                const request: ChatRequest = {
                    history: [...history, { user: question, bot: undefined }],
                    approach: approach,
                    overrides: {
                        promptTemplate: undefined,
                        excludeCategory: undefined,
                        top: 5,
                        semanticRanker: true,
                        semanticCaptions: false,
                        suggestFollowupQuestions: false,
                        userPersona: userPersona,
                        systemPersona: systemPersona,
                        aiPersona: "",
                        responseLength: responseLength,
                        responseTemp: responseTemp,
                        selectedFolders: "All",
                        selectedTags: "",     
                        language: localStorage.getItem("lang") || "en"},
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
    
                setAnswers([...answers, [display_question_text, temp]]);
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
    
    const [hasRun, setHasRun] = useState<boolean>(false);
    const location = useLocation();

    const removeAnswerAtIndex = (index: number) => {
        const newItems = answers.filter((item, idx) => idx !== index);
        setAnswers(newItems);
    }

    const updateAnswerAtIndex = (index: number, response: ChatResponse) => {
        setAnswers(currentAnswers => {
            const updatedAnswers = [...currentAnswers];
            updatedAnswers[index] = [updatedAnswers[index][0], response];
            return updatedAnswers;
        });
    }

    const [initQuestionVisible, setInitQuestionVisible] = useState<boolean>(true);
   
    useEffect(() => {
        console.log("initQuestionVisible updated:", initQuestionVisible);
    }, [initQuestionVisible]);


    const onQuestionSend = (question: string) => {
        console.log("Before setting state:", initQuestionVisible);
        makeApiRequest(question, defaultApproach, {}, {}, {});
        setInitQuestionVisible(false);
        console.log("After setting state:", initQuestionVisible);
    };

    const { t } = useTranslation();

    return (
        <div className={styles.container}>
             {initQuestionVisible && (
                <div className={styles.initQuestionWrapper}>
                    <IntroductionInitQuestion />
                </div>
            )}
           
           <div className={`${styles.chatInputWrapper} ${initQuestionVisible ? styles.chatInputMiddle : styles.chatInputDown}`}>
                <QuestionInput
                    clearOnSend
                    placeholder={t('Question.Input.UpisitePitanje')}
                    disabled={isLoading}
                    onSend={onQuestionSend}
                    onAdjustClick={() => {}}
                    onInfoClick={() => {}}
                    showClearChat={true}
                    onClearClick={() => {}}
                    onRegenerateClick={() => makeApiRequest(lastQuestionRef.current, defaultApproach, {}, {}, {})}
                />
            </div>


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
                                            onCitationClicked={() => {}}
                                            onThoughtProcessClicked={() => {}}
                                            onSupportingContentClicked={() => {}}
                                            onFollowupQuestionClicked={q => makeApiRequest(q, answer[1].approach, answer[1].work_citation_lookup, answer[1].web_citation_lookup, answer[1].thought_chain)}
                                            onDecisionProposalClicked={() => {}}
                                            showFollowupQuestions={false}
                                            onAdjustClick={() => {}}
                                            onRegenerateClick={() => makeApiRequest(answers[index][0], answer[1].approach, answer[1].work_citation_lookup, answer[1].web_citation_lookup, answer[1].thought_chain)}
                                            onWebSearchClicked={() => makeApiRequest(answers[index][0], Approaches.ChatWebRetrieveRead, answer[1].work_citation_lookup, answer[1].web_citation_lookup, answer[1].thought_chain)}
                                            onWebCompareClicked={() => makeApiRequest(answers[index][0], Approaches.CompareWorkWithWeb, answer[1].work_citation_lookup, answer[1].web_citation_lookup, answer[1].thought_chain)}
                                            onRagCompareClicked={() => makeApiRequest(answers[index][0], Approaches.CompareWebWithWork, answer[1].work_citation_lookup, answer[1].web_citation_lookup, answer[1].thought_chain)}
                                            onRagSearchClicked={() => makeApiRequest(answers[index][0], Approaches.ReadRetrieveRead, answer[1].work_citation_lookup, answer[1].web_citation_lookup, answer[1].thought_chain)}
                                            chatMode={ChatMode.WorkPlusWeb}
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
        </div>
    );
}

export default IntroductionChat;   