import React, { createContext, useState, useContext, useEffect, useRef } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';

const GameContext = createContext(null);

export const GameProvider = ({ children }) => {
    const { token, API_URL, user } = useAuth();

    const [isPlaying, setIsPlaying] = useState(false);
    const [isValidating, setIsValidating] = useState(false);
    const [currentLetter, setCurrentLetter] = useState('');
    const [timeLeft, setTimeLeft] = useState(60);
    const [answers, setAnswers] = useState({});
    const [results, setResults] = useState(null);

    const timerRef = useRef(null);

    const categories = ["ولد", "بنت", "حيوان", "جماد", "نبات", "بلد", "شخصية مشهورة"];
    const validLetters = ['أ', 'ب', 'ت', 'ث', 'ج', 'ح', 'خ', 'د', 'ذ', 'ر', 'ز', 'س', 'ش', 'ص', 'ض', 'ط', 'ظ', 'ع', 'غ', 'ف', 'ق', 'ك', 'ل', 'م', 'ن', 'هـ', 'و', 'ي'];
    const answersRef = useRef(answers);
    const currentLetterRef = useRef(currentLetter);

    // Keep refs updated
    useEffect(() => {
        answersRef.current = answers;
        currentLetterRef.current = currentLetter;
    }, [answers, currentLetter]);

    // Check for timer expiry
    useEffect(() => {
        if (timeLeft === 0 && isPlaying) {
            finishGame();
        }
    }, [timeLeft, isPlaying]);

    const startGame = () => {
        const letter = validLetters[Math.floor(Math.random() * validLetters.length)];
        setCurrentLetter(letter);
        currentLetterRef.current = letter; // Update ref immediately

        setTimeLeft(60);
        setIsPlaying(true);
        setResults(null);

        const initialAnswers = categories.reduce((acc, cat) => ({ ...acc, [cat]: '' }), {});
        setAnswers(initialAnswers);
        answersRef.current = initialAnswers; // Update ref immediately

        if (timerRef.current) clearInterval(timerRef.current);
        timerRef.current = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    };

    const finishGame = async () => {
        setIsPlaying(false);
        if (timerRef.current) clearInterval(timerRef.current);
        await validateAnswers();
    };

    const updateAnswer = (category, value) => {
        setAnswers((prev) => ({ ...prev, [category]: value }));
    };

    // Helper to normalize Arabic
    const normalizeArabic = (text) => {
        if (!text) return "";
        return text
            .replace(/[إأآ]/g, 'ا') // Normalize Alef
            .replace(/ة/g, 'ه')     // Normalize Ta Marbuta
            .replace(/ى/g, 'ي');    // Normalize Ya
    };

    const validateAnswers = async () => {
        setIsValidating(true);
        const finalResults = {};
        let totalScore = 0;

        // Use refs to get latest state during async/timer callbacks
        const currentAnswers = answersRef.current;
        const letterToCheck = currentLetterRef.current;
        const normalizedLetter = normalizeArabic(letterToCheck);

        for (const category of categories) {
            const word = currentAnswers[category]?.trim() || '';
            const normalizedWord = normalizeArabic(word);

            // Frontend check with normalization
            if (!word || !normalizedWord.startsWith(normalizedLetter)) {
                finalResults[category] = { word, isCorrect: false, score: 0 };
                continue;
            }

            try {
                const response = await axios.post(`${API_URL}/dictionary/validate`,
                    { word, category, letter: letterToCheck },
                    { headers: { Authorization: `Bearer ${token}` } }
                );

                const isCorrect = response.data.isValid;
                const score = isCorrect ? 10 : 0;
                finalResults[category] = { word, isCorrect, score };
                totalScore += score;
            } catch (error) {
                finalResults[category] = { word, isCorrect: false, score: 0 };
            }
        }

        setResults({ details: finalResults, totalScore });
        setIsValidating(false);

        // Log to history
        if (token) {
            try {
                await axios.post(`${API_URL}/matches/log`, {
                    details: {
                        players: [{ name: user?.username || 'Guest', score: totalScore }],
                        config: { letter: letterToCheck },
                        scores: { solo: totalScore }
                    }
                }, { headers: { Authorization: `Bearer ${token}` } });
            } catch (e) {
                console.error('Failed to log match', e);
            }
        }
    };

    const resetGame = () => {
        setIsPlaying(false);
        setResults(null);
        if (timerRef.current) clearInterval(timerRef.current);
    };

    return (
        <GameContext.Provider value={{
            categories,
            isPlaying,
            isValidating,
            currentLetter,
            timeLeft,
            answers,
            results,
            startGame,
            updateAnswer,
            finishGame,
            resetGame
        }}>
            {children}
        </GameContext.Provider>
    );
};

export const useGame = () => useContext(GameContext);
