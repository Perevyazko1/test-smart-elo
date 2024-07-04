import {useState, useRef} from 'react';

interface UseSpeechRecognitionOptions {
    lang?: string;
    continuous?: boolean;
    interimResults?: boolean;
}

export const useSpeechRecognition = (options: UseSpeechRecognitionOptions = {}) => {
    const {lang = 'ru-RU', continuous = false, interimResults = false} = options;
    const [isListening, setIsListening] = useState<boolean>(false);
    const [transcript, setTranscript] = useState<string>('');
    const recognitionRef = useRef<SpeechRecognition | null>(null);

    const startListening = () => {
        if (!('webkitSpeechRecognition' in window)) {
            alert('Ваш браузер не поддерживает голосовой ввод.');
            return;
        }

        const SpeechRecognition = (window as any).webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        recognitionRef.current = recognition;

        recognition.continuous = continuous;
        recognition.interimResults = interimResults;
        recognition.lang = lang;

        recognition.onstart = () => {
            setIsListening(true);
        };

        recognition.onresult = (event: SpeechRecognitionEvent) => {
            const transcript = event.results[0][0].transcript;
            setTranscript(transcript);
            setIsListening(false);
        };

        recognition.onerror = () => {
            setIsListening(false);
        };

        recognition.onend = () => {
            setIsListening(false);
        };

        recognition.start();
    };

    const stopListening = () => {
        if (recognitionRef.current) {
            recognitionRef.current.stop();
        }
    };

    return {
        isListening,
        transcript,
        startListening,
        stopListening,
    };
};
