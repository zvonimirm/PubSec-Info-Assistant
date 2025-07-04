import React, { useState, useCallback } from 'react';
import { Conversation } from '@elevenlabs/client';
import styles from './ElevenLabsMain.module.css';

// TypeScript tipovi
interface ConversationMode {
  mode: 'speaking' | 'listening';
}

type ConnectionStatus = 'Connected' | 'Disconnected';
type AgentStatus = 'speaking' | 'listening';

const ElevenLabsMain: React.FC = () => {
  // State hook-ovi
  const [conversation, setConversation] = useState<any>(null);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('Disconnected');
  const [agentStatus, setAgentStatus] = useState<AgentStatus>('listening');
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
          setConnectionStatus('Connected');
          setIsConnected(true);
        },
        onDisconnect: () => {
          setConnectionStatus('Disconnected');
          setIsConnected(false);
        },
        onError: (error: any) => {
          console.error('Error:', error);
        },
        onModeChange: (mode: ConversationMode) => {
          setAgentStatus(mode.mode === 'speaking' ? 'speaking' : 'listening');
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
    <div className={styles.container}>
      <h1 className={styles.title}>ElevenLabs Conversational AI</h1>
      
      <div className={styles.buttonContainer}>
        <button
          onClick={startConversation}
          disabled={isConnected}
          className={`${styles.button} ${styles.startButton}`}
        >
          Start Conversation
        </button>
        
        <button
          onClick={stopConversation}
          disabled={!isConnected}
          className={`${styles.button} ${styles.stopButton}`}
        >
          Stop Conversation
        </button>
      </div>
      
      <div className={styles.statusContainer}>
        <div className={styles.statusItem}>
          <span className={styles.statusLabel}>Status:</span>
          <span className={`${styles.statusValue} ${connectionStatus === 'Connected' ? styles.connected : styles.disconnected}`}>
            {connectionStatus}
          </span>
        </div>
        <div className={styles.statusItem}>
          <span className={styles.statusLabel}>Agent is:</span>
          <span className={`${styles.statusValue} ${agentStatus === 'speaking' ? styles.speaking : styles.listening}`}>
            {agentStatus}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ElevenLabsMain;