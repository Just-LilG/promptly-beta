"use client";

import { useCallback, useEffect, useRef, useState } from "react";

// The Web Speech Recognition API has no standard TS lib type and is exposed
// under a vendor-prefixed name in some browsers — declared narrowly here
// rather than pulling in a whole @types package for a handful of members.
type SpeechRecognitionResultLike = { transcript: string };
type SpeechRecognitionEventLike = {
  results: ArrayLike<ArrayLike<SpeechRecognitionResultLike>>;
  resultIndex: number;
};
type SpeechRecognitionLike = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  onresult: ((e: SpeechRecognitionEventLike) => void) | null;
  onerror: ((e: { error: string }) => void) | null;
  onend: (() => void) | null;
};

function getRecognitionCtor(): (new () => SpeechRecognitionLike) | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as {
    SpeechRecognition?: new () => SpeechRecognitionLike;
    webkitSpeechRecognition?: new () => SpeechRecognitionLike;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

export function isVoiceInputSupported(): boolean {
  return getRecognitionCtor() !== null;
}

export type VoiceInputState = "idle" | "listening" | "error";

// Streams live transcript text back via onTranscript as the user speaks,
// so the caller can feed it straight into a controlled input's value.
export function useVoiceInput(onTranscript: (text: string, isFinal: boolean) => void) {
  const [state, setState] = useState<VoiceInputState>("idle");
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const onTranscriptRef = useRef(onTranscript);

  // Keep the ref pointed at the latest callback identity without making it a
  // dependency of the effects below — assigning during render itself isn't
  // safe (React may re-run a render without committing it), so this syncs
  // after each commit instead.
  useEffect(() => {
    onTranscriptRef.current = onTranscript;
  });

  useEffect(() => {
    return () => {
      recognitionRef.current?.stop();
    };
  }, []);

  const start = useCallback(() => {
    const Ctor = getRecognitionCtor();
    if (!Ctor) {
      setState("error");
      return;
    }

    const recognition = new Ctor();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onresult = (e) => {
      let finalText = "";
      let interimText = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const result = e.results[i];
        const alt = result[0];
        // A result is "final" once the API has committed to a transcript for
        // that segment — `isFinal` lives on the result object itself, which
        // the narrow type above omits for brevity, so it's read dynamically.
        const isFinal = Boolean((result as unknown as { isFinal?: boolean }).isFinal);
        if (isFinal) finalText += alt.transcript;
        else interimText += alt.transcript;
      }
      if (finalText) onTranscriptRef.current(finalText, true);
      else if (interimText) onTranscriptRef.current(interimText, false);
    };

    recognition.onerror = () => setState("error");
    recognition.onend = () => setState((s) => (s === "listening" ? "idle" : s));

    recognitionRef.current = recognition;
    setState("listening");
    recognition.start();
  }, []);

  const stop = useCallback(() => {
    recognitionRef.current?.stop();
    setState("idle");
  }, []);

  return { state, start, stop, supported: isVoiceInputSupported() };
}
