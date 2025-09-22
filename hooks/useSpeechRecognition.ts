"use client";

import { useState, useEffect, useRef } from 'react';

export function useSpeechRecognition() {
  const [transcript, setTranscript] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const recognition = useRef<any>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.webkitSpeechRecognition || (window as any).SpeechRecognition;
      
      if (SpeechRecognition) {
        setIsSupported(true);
        recognition.current = new SpeechRecognition();
        
        recognition.current.continuous = false;
        recognition.current.interimResults = true;
        recognition.current.lang = 'zh-CN';

        recognition.current.onresult = (event: any) => {
          let finalTranscript = '';
          for (let i = event.resultIndex; i < event.results.length; i++) {
            const result = event.results[i];
            if (result.isFinal) {
              finalTranscript += result[0].transcript;
            }
          }
          
          if (finalTranscript) {
            setTranscript(finalTranscript);
          }
        };

        recognition.current.onstart = () => {
          setIsListening(true);
        };

        recognition.current.onend = () => {
          setIsListening(false);
        };

        recognition.current.onerror = (event: any) => {
          console.error('语音识别错误:', event.error);
          setIsListening(false);
        };
      }
    }

    return () => {
      if (recognition.current) {
        recognition.current.stop();
      }
    };
  }, []);

  const startListening = () => {
    if (recognition.current && !isListening) {
      setTranscript('');
      recognition.current.start();
    }
  };

  const stopListening = () => {
    if (recognition.current && isListening) {
      recognition.current.stop();
    }
  };

  return {
    transcript,
    isListening,
    isSupported,
    startListening,
    stopListening,
  };
}