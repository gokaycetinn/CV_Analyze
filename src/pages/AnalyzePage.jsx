import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAnalysis } from '../context/AnalysisContext';
import FileUpload from '../components/FileUpload';
import AnimatedContent from '../components/reactbits/AnimatedContent';
import ShinyText from '../components/reactbits/ShinyText';
import previewTwo from '../../img/2.avif';
import './AnalyzePage.css';

export default function AnalyzePage() {
    const navigate = useNavigate();
    const {
        cvText, setCvText,
        jobText, setJobText,
        cvFileName, setCvFileName,
        isAnalyzing,
        error,
        analysisMode, setAnalysisMode,
        runAnalysis
    } = useAnalysis();

    const [cvInputMode, setCvInputMode] = useState('upload');
    const [progress, setProgress] = useState(0);

    const handleAnalyze = useCallback(async () => {
        setProgress(0);
        const interval = setInterval(() => {
            setProgress(prev => {
                if (prev >= 90) { clearInterval(interval); return 90; }
                return prev + Math.random() * 12;
            });
        }, 200);

        const success = await runAnalysis();
        clearInterval(interval);
        setProgress(100);

        if (success) {
            setTimeout(() => navigate('/results'), 400);
        }
    }, [runAnalysis, navigate]);

    const canAnalyze = analysisMode === 'ats-only'
        ? cvText.trim().length > 0
        : cvText.trim().length > 0 && jobText.trim().length > 0;

    const currentStep = !cvText ? 1 : (analysisMode === 'full' && !jobText ? 2 : 3);

    return (
        <div className="analyze-page" style={{ '--page-bg-image': `url(${previewTwo})` }}>
            {/* ── Loading Overlay ────────────────────── */}
            {isAnalyzing && (
                <div className="loading-overlay">
                    <div className="loading-panel">
                        <div className="loading-spinner-ring" />
                        <div className="loading-progress-container">
                            <div className="loading-progress-bar">
                                <div
                                    className="loading-progress-fill"
                                    style={{ width: `${Math.min(progress, 100)}%` }}
                                />
                            </div>
                            <span className="loading-pct">%{Math.round(Math.min(progress, 100))}</span>
                        </div>
                        <p className="loading-text">
                            {analysisMode === 'ats-only'
                                ? 'ATS uyumluluğu analiz ediliyor...'
                                : 'CV ve ilan eşleşmesi analiz ediliyor...'}
                        </p>
                        <div className="loading-steps">
                            <span className="loading-step done">CV Okuma</span>
                            <span className={`loading-step ${progress > 30 ? 'done' : 'active'}`}>ATS Kontrolü</span>
                            {analysisMode === 'full' && (
                                <span className={`loading-step ${progress > 70 ? 'done' : progress > 50 ? 'active' : ''}`}>Eşleştirme</span>
                            )}
                        </div>
                    </div>
                </div>
            )}

            <div className="analyze-container">
                {/* ── Header ────────────────────────────── */}
                <AnimatedContent distance={30} duration={0.4}>
                    <div className="analyze-header">
                        <div className="analyze-header-badge">
                            <span>Yapay Zeka Destekli Analiz</span>
                        </div>
                        <h1 className="analyze-title">
                            CV <span className="gradient-text">Analizi</span>
                        </h1>
                        <p className="analyze-subtitle">
                            CV dosyanızı yükleyin, analiz modunu seçin ve detaylı raporunuzu alın
                        </p>
                    </div>
                </AnimatedContent>

                {/* ── Stepper ───────────────────────────── */}
                <AnimatedContent distance={20} delay={0.05} duration={0.4}>
                    <div className="stepper">
                        <div className={`stepper-step ${currentStep >= 1 ? 'active' : ''} ${cvText ? 'done' : ''}`}>
                            <div className="stepper-dot">
                                {cvText ? '✓' : '1'}
                            </div>
                            <span>CV Yükle</span>
                        </div>
                        <div className="stepper-line" />
                        <div className={`stepper-step ${currentStep >= 2 ? 'active' : ''} ${analysisMode === 'ats-only' || jobText ? 'done' : ''}`}>
                            <div className="stepper-dot">
                                {(analysisMode === 'ats-only' || jobText) ? '✓' : '2'}
                            </div>
                            <span>Mod Seç</span>
                        </div>
                        <div className="stepper-line" />
                        <div className={`stepper-step ${currentStep >= 3 ? 'active' : ''}`}>
                            <div className="stepper-dot">3</div>
                            <span>Analiz</span>
                        </div>
                    </div>
                </AnimatedContent>

                {/* ── Mode Toggle ───────────────────────── */}
                <AnimatedContent distance={25} delay={0.1} duration={0.4}>
                    <div className="mode-section">
                        <div className="mode-toggle">
                            <button
                                className={`mode-option ${analysisMode === 'ats-only' ? 'active' : ''}`}
                                onClick={() => setAnalysisMode('ats-only')}
                            >
                                <div className="mode-option-text">
                                    <span className="mode-option-title">Sadece ATS Analizi</span>
                                    <span className="mode-option-desc">CV formatını ve ATS uyumluluğunu kontrol et</span>
                                </div>
                                {analysisMode === 'ats-only' && <span className="mode-check">Seçili</span>}
                            </button>
                            <button
                                className={`mode-option ${analysisMode === 'full' ? 'active' : ''}`}
                                onClick={() => setAnalysisMode('full')}
                            >
                                <div className="mode-option-text">
                                    <span className="mode-option-title">İlan Eşleşmesi</span>
                                    <span className="mode-option-desc">CV'yi iş ilanı ile karşılaştır ve eşleşme oranı al</span>
                                </div>
                                {analysisMode === 'full' && <span className="mode-check">Seçili</span>}
                            </button>
                        </div>
                    </div>
                </AnimatedContent>

                {/* ── Input Panels ──────────────────────── */}
                <div className={`input-grid ${analysisMode === 'ats-only' ? 'single-column' : ''}`}>
                    {/* CV Panel */}
                    <AnimatedContent distance={30} delay={0.15} duration={0.4}>
                        <div className="input-panel">
                            <div className="panel-header">
                                <div className="panel-header-text">
                                    <h3>CV Dosyası</h3>
                                    <p>{cvFileName || 'PDF, DOCX veya düz metin'}</p>
                                </div>
                                {cvText && (
                                    <div className="panel-status-badge">
                                        Yüklendi
                                    </div>
                                )}
                            </div>

                            <div className="input-tabs">
                                <button
                                    className={`input-tab ${cvInputMode === 'upload' ? 'active' : ''}`}
                                    onClick={() => setCvInputMode('upload')}
                                >
                                    Dosya Yükle
                                </button>
                                <button
                                    className={`input-tab ${cvInputMode === 'paste' ? 'active' : ''}`}
                                    onClick={() => setCvInputMode('paste')}
                                >
                                    Metin Yapıştır
                                </button>
                            </div>

                            <div className="input-area">
                                {cvInputMode === 'upload' ? (
                                    <FileUpload
                                        onTextExtracted={setCvText}
                                        onFileNameChange={setCvFileName}
                                    />
                                ) : (
                                    <textarea
                                        className="text-input textarea focus-ring"
                                        value={cvText}
                                        onChange={(e) => setCvText(e.target.value)}
                                        placeholder="CV metninizi buraya yapıştırın..."
                                        rows={10}
                                    />
                                )}
                            </div>

                            {cvText && (
                                <div className="char-counter">
                                    <div className="char-bar">
                                        <div className="char-bar-fill" style={{ width: `${Math.min(cvText.length / 50, 100)}%` }} />
                                    </div>
                                    <span>{cvText.length.toLocaleString()} karakter</span>
                                </div>
                            )}
                        </div>
                    </AnimatedContent>

                    {/* Job Panel — only in full mode */}
                    {analysisMode === 'full' && (
                        <AnimatedContent distance={30} delay={0.2} duration={0.4}>
                            <div className="input-panel">
                                <div className="panel-header">
                                    <div className="panel-header-text">
                                        <h3>İş İlanı</h3>
                                        <p>Karşılaştırılacak ilan metni</p>
                                    </div>
                                    {jobText && (
                                        <div className="panel-status-badge">
                                            Hazır
                                        </div>
                                    )}
                                </div>

                                <div className="input-area">
                                    <textarea
                                        className="text-input textarea focus-ring"
                                        value={jobText}
                                        onChange={(e) => setJobText(e.target.value)}
                                        placeholder="İş ilanı metnini buraya yapıştırın...&#10;&#10;Örn: Aranan nitelikler, görev tanımı, istenen beceriler..."
                                        rows={12}
                                    />
                                </div>

                                {jobText && (
                                    <div className="char-counter">
                                        <div className="char-bar">
                                            <div className="char-bar-fill char-bar-amber" style={{ width: `${Math.min(jobText.length / 50, 100)}%` }} />
                                        </div>
                                        <span>{jobText.length.toLocaleString()} karakter</span>
                                    </div>
                                )}
                            </div>
                        </AnimatedContent>
                    )}
                </div>

                {/* ── Error ─────────────────────────────── */}
                {error && (
                    <div className="analyze-error">
                        <span className="error-icon">!</span>
                        {error}
                    </div>
                )}

                {/* ── Analyze Button ───────────────────── */}
                <AnimatedContent distance={15} delay={0.25} duration={0.4}>
                    <div className="analyze-action">
                        <button
                            className={`analyze-btn ${canAnalyze ? 'ready' : ''}`}
                            onClick={handleAnalyze}
                            disabled={!canAnalyze || isAnalyzing}
                        >
                            <ShinyText
                                text={analysisMode === 'ats-only' ? 'ATS Analizi Başlat' : 'Tam Analizi Başlat'}
                                speed={4}
                                disabled={!canAnalyze}
                            />
                        </button>

                        {!canAnalyze && (
                            <p className="action-hint">
                                {!cvText
                                    ? 'Başlamak için CV dosyanızı yükleyin'
                                    : 'İş ilanı metnini yapıştırın veya "Sadece ATS Analizi" modunu seçin'}
                            </p>
                        )}

                        {canAnalyze && (
                            <div className="action-features">
                                <span>ATS Kontrol</span>
                                {analysisMode === 'full' && <span>Eşleştirme</span>}
                                <span>Öneriler</span>
                            </div>
                        )}
                    </div>
                </AnimatedContent>
            </div>
        </div>
    );
}
