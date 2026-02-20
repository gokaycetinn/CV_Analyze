import { createContext, useContext, useState, useCallback } from 'react';
import { analyzeCV } from '../services/cvParser';
import { analyzeJob } from '../services/jobParser';
import { matchSkills } from '../services/matchingEngine';
import { calculateATSScore, calculateJobMatchScore } from '../services/scoreCalculator';
import { generateRecommendations } from '../services/recommendationEngine';

const AnalysisContext = createContext(null);

export function AnalysisProvider({ children }) {
    const [cvText, setCvText] = useState('');
    const [jobText, setJobText] = useState('');
    const [cvFileName, setCvFileName] = useState('');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [results, setResults] = useState(null);
    const [error, setError] = useState(null);
    const [analysisMode, setAnalysisMode] = useState('full'); // 'ats-only' or 'full'

    const runAnalysis = useCallback(async () => {
        if (!cvText.trim()) {
            setError('Lütfen CV metnini girin.');
            return false;
        }

        if (analysisMode === 'full' && !jobText.trim()) {
            setError('Lütfen iş ilanı metnini girin veya "Sadece ATS Analizi" modunu seçin.');
            return false;
        }

        setIsAnalyzing(true);
        setError(null);

        try {
            await new Promise(resolve => setTimeout(resolve, 600));

            // 1. CV analizi (always)
            const cvAnalysis = analyzeCV(cvText);

            // 2. ATS skor (always)
            const atsScore = calculateATSScore(cvAnalysis);

            let jobAnalysis = null;
            let matchResults = null;
            let jobMatchScore = null;
            let recommendations = [];

            if (analysisMode === 'full') {
                // 3. İlan analizi
                jobAnalysis = analyzeJob(jobText);

                // 4. Eşleştirme
                matchResults = matchSkills(cvAnalysis, jobAnalysis);

                // 5. İlan eşleşme skoru
                jobMatchScore = calculateJobMatchScore(matchResults);

            }

            // 6. Öneriler (both ats-only and full)
            recommendations = generateRecommendations(
                cvAnalysis,
                jobAnalysis,
                matchResults,
                atsScore,
                jobMatchScore
            );

            setResults({
                analysisMode,
                cvAnalysis,
                jobAnalysis,
                matchResults,
                atsScore,
                jobMatchScore,
                recommendations,
                timestamp: new Date().toISOString()
            });

            setIsAnalyzing(false);
            return true;
        } catch (err) {
            console.error('Analysis error:', err);
            setError(`Analiz sırasında bir hata oluştu: ${err.message}`);
            setIsAnalyzing(false);
            return false;
        }
    }, [cvText, jobText, analysisMode]);

    const resetAnalysis = useCallback(() => {
        setResults(null);
        setError(null);
        setCvText('');
        setJobText('');
        setCvFileName('');
        setAnalysisMode('full');
    }, []);

    return (
        <AnalysisContext.Provider value={{
            cvText, setCvText,
            jobText, setJobText,
            cvFileName, setCvFileName,
            isAnalyzing,
            results,
            error,
            analysisMode, setAnalysisMode,
            runAnalysis,
            resetAnalysis
        }}>
            {children}
        </AnalysisContext.Provider>
    );
}

export function useAnalysis() {
    const context = useContext(AnalysisContext);
    if (!context) {
        throw new Error('useAnalysis must be used within AnalysisProvider');
    }
    return context;
}
