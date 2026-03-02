'use client';

import { Dispatch, SetStateAction, useCallback, useEffect, useRef, useState } from 'react';

type SpeechRecognitionEventLike = {
  results: ArrayLike<ArrayLike<{ transcript: string }>>;
};

type SpeechRecognitionErrorEventLike = {
  error: string;
};

type SpeechRecognitionInstanceLike = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEventLike) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
};

type SpeechRecognitionCtor = new () => SpeechRecognitionInstanceLike;

declare global {
  interface Window {
    webkitSpeechRecognition?: SpeechRecognitionCtor;
    SpeechRecognition?: SpeechRecognitionCtor;
  }
}

interface UseVoiceRecordingOptions {
  draft: string;
  setDraft: Dispatch<SetStateAction<string>>;
  setError: Dispatch<SetStateAction<string | null>>;
  language?: string;
}

export function useVoiceRecording({ draft, setDraft, setError, language = 'en-US' }: UseVoiceRecordingOptions) {
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef<SpeechRecognitionInstanceLike | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const recordingBaseDraftRef = useRef('');

  const stopMediaStream = useCallback(() => {
    mediaStreamRef.current?.getTracks().forEach((track) => track.stop());
    mediaStreamRef.current = null;
  }, []);

  const stopVoiceRecording = useCallback(() => {
    recognitionRef.current?.stop();
    if (!recognitionRef.current) {
      stopMediaStream();
      setIsRecording(false);
    }
  }, [stopMediaStream]);

  const startVoiceRecording = useCallback(async () => {
    if (typeof window === 'undefined' || isRecording) {
      return;
    }

    if (!navigator.mediaDevices?.getUserMedia) {
      setError('Voice input is not supported in this browser.');
      return;
    }

    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;

      const RecognitionCtor = window.SpeechRecognition ?? window.webkitSpeechRecognition;
      if (!RecognitionCtor) {
        stopMediaStream();
        setError('Speech recognition is not supported in this browser.');
        return;
      }

      recordingBaseDraftRef.current = draft.trim();
      const recognition = new RecognitionCtor();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = language;

      recognition.onresult = (event: SpeechRecognitionEventLike) => {
        let transcript = '';
        for (let index = 0; index < event.results.length; index += 1) {
          transcript += event.results[index]?.[0]?.transcript ?? '';
        }

        if (transcript.trim()) {
          const base = recordingBaseDraftRef.current;
          setDraft(base ? `${base} ${transcript.trim()}` : transcript.trim());
        }
      };

      recognition.onerror = (event: SpeechRecognitionErrorEventLike) => {
        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
          setError('Microphone access denied. Please allow permission and try again.');
          return;
        }
        if (event.error !== 'aborted') {
          setError('Voice recording failed. Please try again.');
        }
      };

      recognition.onend = () => {
        recognitionRef.current = null;
        stopMediaStream();
        setIsRecording(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
      setIsRecording(true);
    } catch (err) {
      stopMediaStream();
      setIsRecording(false);
      setError(err instanceof Error ? err.message : 'Unable to start voice recording.');
    }
  }, [draft, isRecording, language, setDraft, setError, stopMediaStream]);

  const toggleVoiceRecording = useCallback(() => {
    if (isRecording) {
      stopVoiceRecording();
      return;
    }
    void startVoiceRecording();
  }, [isRecording, startVoiceRecording, stopVoiceRecording]);

  useEffect(() => {
    return () => {
      recognitionRef.current?.abort();
      recognitionRef.current = null;
      stopMediaStream();
    };
  }, [stopMediaStream]);

  return {
    isRecording,
    toggleVoiceRecording,
  };
}
