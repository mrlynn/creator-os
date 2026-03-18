'use client';

import { useState, useCallback, useRef } from 'react';
import { IconButton, Tooltip } from '@mui/material';
import MicIcon from '@mui/icons-material/Mic';
import MicOffIcon from '@mui/icons-material/MicOff';

interface VoiceInputButtonProps {
  onResult: (text: string) => void;
  disabled?: boolean;
}

declare global {
  interface Window {
    SpeechRecognition?: new () => SpeechRecognition;
    webkitSpeechRecognition?: new () => SpeechRecognition;
  }
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  onresult: (event: SpeechRecognitionEvent) => void;
  onerror: (event: SpeechRecognitionErrorEvent) => void;
  onend: () => void;
}

interface SpeechRecognitionEvent {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionErrorEvent {
  error: string;
}

export function VoiceInputButton({ onResult, disabled }: VoiceInputButtonProps) {
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [supported] = useState(() => {
    if (typeof window === 'undefined') return false;
    return !!(window.SpeechRecognition || window.webkitSpeechRecognition);
  });

  const stopListening = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // Ignore
      }
      recognitionRef.current = null;
    }
    setListening(false);
  }, []);

  const startListening = useCallback(() => {
    const SpeechRecognitionClass =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognitionClass) return;

    const recognition = new SpeechRecognitionClass() as SpeechRecognition;
    recognitionRef.current = recognition;
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    let fullTranscript = '';

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          fullTranscript += result[0].transcript;
        }
      }
    };

    recognition.onend = () => {
      recognitionRef.current = null;
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      setListening(false);
      if (fullTranscript.trim()) {
        onResult(fullTranscript.trim());
      }
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      recognitionRef.current = null;
      setListening(false);
      if (event.error !== 'aborted') {
        console.warn('Speech recognition error:', event.error);
      }
    };

    setListening(true);
    recognition.start();

    timeoutRef.current = setTimeout(() => {
      timeoutRef.current = null;
      try {
        recognition.stop();
      } catch {
        // Ignore
      }
    }, 30000);
  }, [onResult]);

  const handleClick = useCallback(() => {
    if (listening) {
      stopListening();
    } else {
      startListening();
    }
  }, [listening, startListening, stopListening]);

  if (!supported) {
    return (
      <Tooltip title="Not supported in this browser">
        <span>
          <IconButton disabled aria-label="Voice input not supported" size="small">
            <MicOffIcon />
          </IconButton>
        </span>
      </Tooltip>
    );
  }

  return (
    <Tooltip title={listening ? 'Stop listening' : 'Voice input'}>
      <IconButton
        onClick={handleClick}
        disabled={disabled}
        aria-label={listening ? 'Stop listening' : 'Start voice input'}
        size="small"
        color={listening ? 'error' : 'default'}
        sx={
          listening
            ? {
                animation: 'pulse 1.5s ease-in-out infinite',
                '@keyframes pulse': {
                  '0%, 100%': { opacity: 1 },
                  '50%': { opacity: 0.6 },
                },
              }
            : undefined
        }
      >
        <MicIcon />
      </IconButton>
    </Tooltip>
  );
}
