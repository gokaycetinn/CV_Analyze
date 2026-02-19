import { useEffect, useState, useRef } from 'react';
import './ScoreCard.css';

function getScoreColor(score, variant) {
    if (variant === 'match') {
        // Orange/gold gradient for match score
        if (score >= 75) return { main: '#06d6a0', track: 'rgba(6, 214, 160, 0.15)' };
        if (score >= 50) return { main: '#f59e0b', track: 'rgba(245, 158, 11, 0.15)' };
        return { main: '#ef476f', track: 'rgba(239, 71, 111, 0.15)' };
    }
    // Cyan/blue for ATS
    if (score >= 75) return { main: '#06d6a0', track: 'rgba(6, 214, 160, 0.15)' };
    if (score >= 50) return { main: '#00b4d8', track: 'rgba(0, 180, 216, 0.15)' };
    return { main: '#ef476f', track: 'rgba(239, 71, 111, 0.15)' };
}

function getAccentColor(variant) {
    return variant === 'match' ? 'var(--gold)' : 'var(--accent)';
}

export default function ScoreCard({ score, label, grade, breakdown = [], icon, delay = 0, variant = 'ats' }) {
    const [animatedScore, setAnimatedScore] = useState(0);
    const [isVisible, setIsVisible] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        const timer = setTimeout(() => setIsVisible(true), delay);
        return () => clearTimeout(timer);
    }, [delay]);

    useEffect(() => {
        if (!isVisible) return;
        let start = 0;
        const duration = 1200;
        const startTime = performance.now();

        const animate = (now) => {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            // easeOutExpo
            const eased = 1 - Math.pow(2, -10 * progress);
            setAnimatedScore(Math.round(eased * score));
            if (progress < 1) requestAnimationFrame(animate);
        };
        requestAnimationFrame(animate);
    }, [isVisible, score]);

    const colors = getScoreColor(score, variant);
    const radius = 55;
    const stroke = 7;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (animatedScore / 100) * circumference;

    return (
        <div
            ref={ref}
            className={`score-panel ${isVisible ? 'visible' : ''} variant-${variant}`}
            style={{ animationDelay: `${delay}ms` }}
        >
            <div className="score-visual">
                <svg className="score-ring" viewBox="0 0 130 130">
                    {/* Track */}
                    <circle
                        cx="65" cy="65" r={radius}
                        fill="none"
                        stroke={colors.track}
                        strokeWidth={stroke}
                    />
                    {/* Progress */}
                    <circle
                        cx="65" cy="65" r={radius}
                        fill="none"
                        stroke={colors.main}
                        strokeWidth={stroke}
                        strokeLinecap="round"
                        strokeDasharray={circumference}
                        strokeDashoffset={offset}
                        transform="rotate(-90 65 65)"
                        style={{
                            transition: 'stroke-dashoffset 1.2s ease-out',
                            filter: `drop-shadow(0 0 8px ${colors.main}40)`
                        }}
                    />
                </svg>
                <div className="score-center">
                    <span className="score-number" style={{ color: colors.main }}>
                        {animatedScore}
                    </span>
                    <span className="score-max">/100</span>
                </div>
            </div>

            <div className="score-info">
                <div className="score-label-row">
                    <span className="score-icon">{icon}</span>
                    <h3 className="score-label">{label}</h3>
                </div>
                <div className="score-grade" style={{ color: colors.main, borderColor: `${colors.main}30` }}>
                    {grade}
                </div>
            </div>

            {breakdown.length > 0 && (
                <div className="score-breakdown">
                    {breakdown.slice(0, 4).map((item, i) => (
                        <div key={i} className="breakdown-mini">
                            <div className="breakdown-mini-header">
                                <span className="breakdown-mini-label">{item.label}</span>
                                <span className="breakdown-mini-pts" style={{ color: colors.main }}>
                                    {item.points}/{item.maxPoints}
                                </span>
                            </div>
                            <div className="breakdown-mini-bar">
                                <div
                                    className="breakdown-mini-fill"
                                    style={{
                                        width: isVisible ? `${(item.points / item.maxPoints) * 100}%` : '0%',
                                        background: colors.main,
                                        transitionDelay: `${0.8 + i * 0.1}s`
                                    }}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
