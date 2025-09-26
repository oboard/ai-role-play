'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, Loader2 } from 'lucide-react';
import { asrService } from '@/lib/asrService';

interface VoiceInputProps {
  onTextRecognized: (text: string) => void;
  className?: string;
}

export default function VoiceInput({ onTextRecognized, className = "" }: VoiceInputProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    asrService.setOnResult((text) => {
      setIsProcessing(false);
      onTextRecognized(text);
    });

    return () => {
      asrService.setOnResult(() => {});
    };  
  }, [onTextRecognized]);

  const handleStartRecording = () => {
    asrService.startRecording();
    setIsRecording(true);
  };

  const handleStopRecording = () => {
    asrService.stopRecording();
    setIsRecording(false);
    setIsProcessing(true);
  };

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <Button
        onClick={isRecording ? handleStopRecording : handleStartRecording}
        disabled={isProcessing}
        variant={isRecording ? "destructive" : "outline"}
        size="sm"
      >
        {isProcessing ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : isRecording ? (
          <MicOff className="h-4 w-4" />
        ) : (
          <Mic className="h-4 w-4" />
        )}
      </Button>
      <span className="text-sm text-gray-500">
        {isProcessing ? '识别中...' : isRecording ? '录音中...' : '点击录音'}
      </span>
    </div>
  );
} 