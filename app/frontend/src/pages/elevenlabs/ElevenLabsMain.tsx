import React, { useState, useCallback } from 'react';
import { Conversation } from '@elevenlabs/client';
import styles from './ElevenLabsMain.module.css';
import { useTranslation } from "react-i18next";

// TypeScript tipovi
interface ConversationMode {
  mode: 'speaking' | 'listening';
}

type ConnectionStatus = 'Spojen' | 'Odspojen';
type AgentStatus = 'Priča' | 'Sluša';

const ElevenLabsMain: React.FC = () => {
  // State hook-ovi
  const { t } = useTranslation();
  const [conversation, setConversation] = useState<any>(null);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('Odspojen');
  const [agentStatus, setAgentStatus] = useState<AgentStatus>('Sluša');
  const [isConnected, setIsConnected] = useState<boolean>(false);

  // Funkcija za pokretanje razgovora
  const startConversation = useCallback(async () => {
    try {
      // Zahtjev za dozvolu mikrofona
      await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Pokretanje razgovora
      const newConversation = await Conversation.startSession({
        agentId: 'agent_01jyrft17jfvv8njm4h1etxjq8', // Zamijeni s tvojim agent ID-om
        onConnect: () => {
          setConnectionStatus('Spojen');
          console.log(isConnected);
          setIsConnected(true);
        },
        onDisconnect: () => {
          setConnectionStatus('Odspojen');
          console.log(isConnected);
          setIsConnected(false);
        },
        onError: (error: any) => {
          console.error('Error:', error);
        },
        onModeChange: (mode: ConversationMode) => {
          setAgentStatus(mode.mode === 'speaking' ? 'Priča' : 'Sluša');
        },
      });
      
      setConversation(newConversation);
    } catch (error) {
      console.error('Failed to start conversation:', error);
    }
  }, []);

  // Funkcija za zaustavljanje razgovora
  const stopConversation = useCallback(async () => {
    if (conversation) {
      await conversation.endSession();
      setConversation(null);
    }
  }, [conversation]);

  return (
    <div className={styles.wrapper}>
    <div className={styles.container}>
      <h1 className={styles.title}> {t("ElevenLabsMain.Title")}</h1>
      
      <div className={styles.buttonContainer}>
            <button className={`${styles.button} ${styles.startButton}`} disabled={isConnected} onClick={startConversation}>
              <p className={styles.exampleText}>
                  {t("ElevenLabsMain.Start")}
              </p>
          </button>
          {/* <span className={`${!isClickable ? styles.btnDisabled : styles.btnStyle}`} onClick={handleBlobStorage}>
              <p className={styles.exampleText}>
                  Dodavanje dokumenata <br/>u blob storage
              </p>
          </span> */}
          <button className={`${styles.button} ${styles.stopButton}`} disabled={!isConnected} onClick={stopConversation}>
              <p className={styles.exampleText}>
                  {t("ElevenLabsMain.Stop")}
              </p>
          </button>
      </div> 

      
      <div className={styles.statusContainer}>
        <div className={styles.statusItem}>
          <span className={styles.statusLabel}>Status:</span>
          <span className={`${styles.statusValue} ${connectionStatus === 'Spojen' ? styles.connected : styles.disconnected}`}>
            {connectionStatus}
          </span>
        </div>
        <div className={styles.statusItem}>
          <span className={styles.statusLabel}>Agent:</span>
          <span className={`${styles.statusValue} ${agentStatus === 'Priča' ? styles.speaking : styles.listening}`}>
            {agentStatus}
          </span>
        </div>
      </div>
    </div>
    </div>
  );
};

export default ElevenLabsMain;