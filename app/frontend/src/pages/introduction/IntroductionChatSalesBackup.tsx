import { useEffect, useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import styles from './IntroductionEntrySales.module.css';
import { OdlukeOdboraExampleList } from "../../components/Example/OdlukeOdboraExampleList";
import { chatApi, Approaches, ChatResponse, ChatRequest, ChatTurn, ChatMode, getFeatureFlags, GetFeatureFlagsResponse } from "../../api";
import { AnalysisPanel, AnalysisPanelTabs } from "../../components/AnalysisPanel";
import { QuestionInput } from "../../components/QuestionInput";
import { Answer, AnswerError, AnswerLoading } from "../../components/Answer";
import { UserChatMessage } from "../../components/UserChatMessage";
import { IntroductionInitQuestionSales } from "../../components/Introduction/IntroductionInitQuestionSales";
import { useTranslation } from "react-i18next";

// Ovo je backup stranica. Funkcionalnost je da se se prema odredenim odgovorima (isKredit i isPaket, redirecta na adekvatnog voice agenta)
// i na pravi Approaches.

const IntroductionChaSales = () => {
    
   
    
    const [defaultApproach, setDefaultApproach] = useState<number>(Approaches.IntroductionSales);
    const [activeApproach, setActiveApproach] = useState<number>(Approaches.IntroductionSales);
    const [salesTypeApproach, setSalesTypeApproach] = useState<number>(Approaches.IntroductionSales);
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
    type salesType = 'Kredit' | 'Paket';
    type communicationType = 'Chat' | 'Talk';

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
            console.log("makeApirequest: " + approach);
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
    const navigate = useNavigate();
    
    const [hasRun, setHasRun] = useState<boolean>(false);
    const location = useLocation();

    const removeAnswerAtIndex = (index: number) => {
        const newItems = answers.filter((item, idx) => idx !== index);
        setAnswers(newItems);
    }

    const salesDecision = (response: string) => {
        console.log("response: " + response);
        let currentSalesType = 'Kredit';
        if(answerContains(response, "isKredit")){
            console.log("Answer conatins: isKredit");
            setSalesTypeApproach(getCurrentApproach(response))
            currentSalesType = getSalesType(response);
        }
        
        let commType = ""
        console.log("IsTalk: " + answerContains(response, "isTalk") + " salesTypeApproach:" + salesTypeApproach)
        if(answerContains(response, "isTalk") && salesTypeApproach != Approaches.IntroductionSales){
            const communicationType = getCommunicationType(response);
            commType = communicationType;

            console.log("Communication type: " + communicationType);

            if(communicationType === 'Talk')
            {
                console.log("REDIRECT TO ELEVEN LABS - " + currentSalesType);
                setTimeout(() => {
                    console.log("Izvršava se nakon 2 sekunde");
                    navigate("/ElevenLabsMain" , {state: {salesType: currentSalesType}});
                }, 5000); // 2 sekunde
            }
            else{
               setDefaultApproach(salesTypeApproach);
                // console.log(salesTypeApproach);
            }
        }

        console.log("Trenutni approach je: " + activeApproach)
    }

    const updateAnswerAtIndex = (index: number, response: ChatResponse) => {
        setAnswers(currentAnswers => {
            const updatedAnswers = [...currentAnswers];
            updatedAnswers[index] = [updatedAnswers[index][0], response];
            salesDecision(response.answer);
            return updatedAnswers;
        });
    }

    const [initQuestionVisible, setInitQuestionVisible] = useState<boolean>(true);
   
    useEffect(() => {
        console.log("initQuestionVisible updated:", initQuestionVisible);
    }, [initQuestionVisible]);

    const getCommunicationType = (answer: string): communicationType => {
      if (!answer) return 'Chat';

        const talkMatch = answer.match(/isTalk\s*:\s*(\d+)/);
        const chatMatch = answer.match(/isChat\s*:\s*(\d+)/);

        const talkValue = talkMatch ? parseInt(talkMatch[1], 10) : 0;
        const chatValue = chatMatch ? parseInt(chatMatch[1], 10) : 0;

        // Ako oba nisu prisutna, ili nisu brojevi, default
        if (talkValue === 0 && chatValue === 0) {
            return 'Chat';
        }
        console.log("talk value: " + talkValue + " chat value: " + chatValue);
    return talkValue > chatValue
        ? 'Talk'
        : 'Chat';
    }
    
    const getSalesType = (answer: string | undefined): salesType => {
        if (!answer) return 'Kredit';

        const kreditMatch = answer.match(/isKredit\s*:\s*(\d+)/);
        const paketMatch = answer.match(/isPaket\s*:\s*(\d+)/);

        const isKredit = kreditMatch ? parseInt(kreditMatch[1], 10) : 0;
        const isPaket = paketMatch ? parseInt(paketMatch[1], 10) : 0;
        console.log("kredit value: " + isKredit + " paket value: " + isPaket);

        // Ako oba nisu prisutna, ili nisu brojevi, default
        if (isKredit === 0 && isPaket === 0) {
            return 'Kredit'
        }

        return isKredit > isPaket
        ? 'Kredit'
        : 'Paket';
    }
    function getCurrentApproach(answer: string | undefined): Approaches {
        if (!answer) return Approaches.IntroductionSales;

        const kreditMatch = answer.match(/isKredit\s*:\s*(\d+)/);
        const paketMatch = answer.match(/isPaket\s*:\s*(\d+)/);

        const isKredit = kreditMatch ? parseInt(kreditMatch[1], 10) : 0;
        const isPaket = paketMatch ? parseInt(paketMatch[1], 10) : 0;
        console.log("kredit value: " + isKredit + " paket value: " + isPaket);

        // Ako oba nisu prisutna, ili nisu brojevi, default
        if (isKredit === 0 && isPaket === 0) {
            return Approaches.IntroductionSales;
        }

    return isKredit > isPaket
        ? Approaches.SalesKrediti
        : Approaches.SalesPaketi;
    }
    
    function answerContains(answer: string, keyword: string): boolean {
        if (!answer || answer.length === 0) {
             return false;
            }
        return answer.toLowerCase().includes(keyword.toLowerCase());
    }
   
    const onQuestionSend = (question: string) => {
      
        makeApiRequest(question, defaultApproach, {}, {}, {});
        setInitQuestionVisible(false);
        console.log("After setting state:", initQuestionVisible);
    };

    const { t } = useTranslation();


    return (
        <div className={styles.container}>
             {initQuestionVisible && (
                <div className={styles.initQuestionWrapper}>
                   
                </div>
            )}
           
           <div className={`${styles.chatInputWrapperSales} ${initQuestionVisible ? styles.chatInputMiddle : styles.chatInputDown}`}>
                <QuestionInput
                    clearOnSend
                    placeholder={t('Question.Input.UpisitePitanjeSales')}
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

export default IntroductionChaSales;   