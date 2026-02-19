import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAnalysis } from '../context/AnalysisContext';
import CountUp from '../components/reactbits/CountUp';
import AnimatedContent from '../components/reactbits/AnimatedContent';
import {
    Shield, Target, TrendingUp, AlertTriangle, CheckCircle2,
    XCircle, ChevronRight, Download, RotateCcw, Eye,
    BarChart3, Lightbulb, ArrowRight, Minus
} from 'lucide-react';
import previewThree from '../../img/3.avif';
import './ResultsPage.css';

/* ── Helpers ──────────────────────────────────── */
const normalizeBreakdown = (breakdown = []) =>
    breakdown.map(item => ({
        label: item.category || item.label || '',
        points: item.score ?? item.points ?? 0,
        maxPoints: item.maxScore ?? item.maxPoints ?? 1,
        message: item.message || '',
    }));

const getScoreColor = (score) => {
    if (score >= 80) return 'var(--emerald)';
    if (score >= 60) return 'var(--cyan)';
    if (score >= 40) return 'var(--amber)';
    return 'var(--rose)';
};

const toPercent = (value, max) => (max > 0 ? Math.round((value / max) * 100) : 0);

/* ── SVG Circular Progress ───────────────────── */
function CircularScore({ score, size = 160, strokeWidth = 10, color, label, className = '' }) {
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (score / 100) * circumference;

    return (
        <div className={`circular-score ${className}`}>
            <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
                <circle
                    cx={size / 2} cy={size / 2} r={radius}
                    fill="none" stroke="var(--border-subtle)" strokeWidth={strokeWidth}
                />
                <circle
                    cx={size / 2} cy={size / 2} r={radius}
                    fill="none" stroke={color} strokeWidth={strokeWidth}
                    strokeDasharray={circumference} strokeDashoffset={offset}
                    strokeLinecap="round"
                    transform={`rotate(-90 ${size / 2} ${size / 2})`}
                    style={{ transition: 'stroke-dashoffset 1.5s ease-out' }}
                />
            </svg>
            <div className="circular-score-inner">
                <span className="circular-score-value" style={{ color }}>
                    <CountUp to={score} duration={1.5} />
                </span>
                <span className="circular-score-label">{label}</span>
            </div>
        </div>
    );
}

/* ── Horizontal Bar ──────────────────────────── */
function ProgressBar({ label, value, max, message }) {
    const pct = max > 0 ? (value / max) * 100 : 0;
    const color = getScoreColor(pct);

    return (
        <div className="progress-row">
            <div className="progress-row-header">
                <span className="progress-row-label">{label}</span>
                <span className="progress-row-value" style={{ color }}>{value}/{max}</span>
            </div>
            <div className="progress-bar-track">
                <div
                    className="progress-bar-fill"
                    style={{ width: `${pct}%`, background: color, transition: 'width 1s ease-out 0.3s' }}
                />
            </div>
            {message && <p className="progress-row-msg">{message}</p>}
        </div>
    );
}

function CompactBarChart({ title, data = [] }) {
    return (
        <div className="chart-block">
            <h4 className="chart-title">{title}</h4>
            <div className="bar-chart">
                {data.map((item, index) => (
                    <div key={`${item.label}-${index}`} className="bar-col">
                        <div className="bar-track">
                            <div
                                className="bar-fill"
                                style={{ height: `${Math.max(item.pct, 4)}%`, background: getScoreColor(item.pct) }}
                            />
                        </div>
                        <span className="bar-value">{item.pct}%</span>
                        <span className="bar-label">{item.label}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

function DonutChart({ title, matchedCount, missingCount }) {
    const total = matchedCount + missingCount;
    const matchedPct = total > 0 ? Math.round((matchedCount / total) * 100) : 0;
    const style = {
        background: `conic-gradient(var(--success) ${matchedPct}%, rgba(239,68,68,0.9) ${matchedPct}% 100%)`
    };

    return (
        <div className="chart-block">
            <h4 className="chart-title">{title}</h4>
            <div className="donut-wrap">
                <div className="donut" style={style}>
                    <div className="donut-inner">
                        <strong>{matchedPct}%</strong>
                        <span>Uyum</span>
                    </div>
                </div>
                <div className="donut-legend">
                    <span><i className="legend-dot legend-match" /> Eşleşen: {matchedCount}</span>
                    <span><i className="legend-dot legend-miss" /> Eksik: {missingCount}</span>
                </div>
            </div>
        </div>
    );
}

/* ── Main Component ──────────────────────────── */
const SECTIONS = [
    { id: 'overview', label: 'Overview', icon: Eye },
    { id: 'ats-details', label: 'ATS Details', icon: BarChart3 },
    { id: 'breakdown', label: 'Score Breakdown', icon: Target },
    { id: 'risks', label: 'Risks', icon: AlertTriangle },
    { id: 'recs', label: 'Recommendations', icon: Lightbulb },
];

export default function ResultsPage() {
    const navigate = useNavigate();
    const { results, cvFileName, resetAnalysis } = useAnalysis();
    const [activeSection, setActiveSection] = useState('overview');

    if (!results) {
        return (
            <div className="results-empty">
                <AnimatedContent distance={40} duration={0.4}>
                    <Shield size={48} className="icon-info" />
                    <h2>Henüz Analiz Yapılmadı</h2>
                    <p>CV'nizi analiz etmek için başlayın</p>
                    <button className="btn btn-primary btn-lg" onClick={() => navigate('/analyze')}>
                        Analiz Et <ArrowRight size={18} />
                    </button>
                </AnimatedContent>
            </div>
        );
    }

    const isFullMode = results.analysisMode === 'full';

    const atsScore = results.atsScore || {};
    const atsBreakdown = useMemo(() => normalizeBreakdown(atsScore.breakdown), [atsScore.breakdown]);
    const atsGrade = atsScore.grade || {};
    const risks = atsScore.risks || [];

    const matchResults = results.matchResults || {};
    const jobMatchScore = results.jobMatchScore || {};
    const matchBreakdown = useMemo(() => normalizeBreakdown(jobMatchScore.breakdown), [jobMatchScore.breakdown]);
    const matchGrade = jobMatchScore.grade || {};

    const matched = matchResults.matched || [];
    const missing = matchResults.missing || [];
    const niceToHaveMatched = matchResults.niceToHave?.matched || [];
    const niceToHaveMissing = matchResults.niceToHave?.missing || [];
    const recommendations = results.recommendations || [];
    const analysisDate = new Date(results.timestamp || Date.now()).toLocaleDateString('tr-TR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    const analysisModeLabel = isFullMode ? 'Tam Analiz' : 'Sadece ATS';
    const sectionCompleteness = atsBreakdown.length
        ? Math.round((atsBreakdown.filter(item => item.points > 0).length / atsBreakdown.length) * 100)
        : 0;
    const riskLevel = risks.some(risk => risk.level === 'high')
        ? 'Yüksek'
        : risks.some(risk => risk.level === 'medium')
            ? 'Orta'
            : 'Düşük';
    const riskBadgeClass = riskLevel === 'Yüksek' ? 'badge-danger' : riskLevel === 'Orta' ? 'badge-warning' : 'badge-success';
    const atsChartData = atsBreakdown.map(item => ({
        label: item.label,
        pct: toPercent(item.points, item.maxPoints)
    })).slice(0, 6);
    const matchChartData = matchBreakdown.map(item => ({
        label: item.label,
        pct: toPercent(item.points, item.maxPoints)
    })).slice(0, 6);
    const strongestAts = atsChartData.length
        ? atsChartData.reduce((best, current) => current.pct > best.pct ? current : best, atsChartData[0])
        : null;
    const weakestAts = atsChartData.length
        ? atsChartData.reduce((worst, current) => current.pct < worst.pct ? current : worst, atsChartData[0])
        : null;
    const skillCoverage = matched.length + missing.length > 0
        ? Math.round((matched.length / (matched.length + missing.length)) * 100)
        : 0;

    const handleNewAnalysis = () => {
        resetAnalysis();
        navigate('/analyze');
    };

    return (
        <div className="results-page" style={{ '--page-bg-image': `url(${previewThree})` }}>
            <div className="results-container">
                {/* Header */}
                <AnimatedContent distance={30} duration={0.4}>
                    <div className="results-topbar">
                        <div className="results-topbar-meta">
                            <h1 className="results-title">Analiz Sonuçları</h1>
                            <div className="results-meta-row">
                                <span className="badge badge-neutral">CV: {cvFileName || 'Yüklenen CV'}</span>
                                <span className="badge badge-neutral">Tarih: {analysisDate}</span>
                                <span className="badge badge-neutral">Mod: {analysisModeLabel}</span>
                            </div>
                        </div>
                        <div className="results-actions">
                            <button className="btn btn-secondary btn-sm" onClick={() => window.print()}>
                                <Download size={16} /> Dışa Aktar
                            </button>
                            <button className="btn btn-ghost btn-sm" onClick={handleNewAnalysis}>
                                <RotateCcw size={16} /> Yeni Analiz
                            </button>
                        </div>
                    </div>
                </AnimatedContent>

                <AnimatedContent distance={20} delay={0.08} duration={0.4}>
                    <div className="kpi-strip">
                        <div className="kpi-metric">
                            <span className="kpi-label">ATS Skoru</span>
                            <span className="kpi-value" style={{ color: getScoreColor(atsScore.score ?? 0) }}>{atsScore.score ?? 0}%</span>
                        </div>
                        <div className="kpi-divider" />
                        <div className="kpi-metric">
                            <span className="kpi-label">Risk Seviyesi</span>
                            <span className={`badge ${riskBadgeClass}`}>{riskLevel}</span>
                        </div>
                        <div className="kpi-divider" />
                        <div className="kpi-metric">
                            <span className="kpi-label">Bölüm Tamamlılık</span>
                            <span className="kpi-value">{sectionCompleteness}%</span>
                        </div>
                        <div className="kpi-divider" />
                        <div className="kpi-metric">
                            <span className="kpi-label">Öneri Sayısı</span>
                            <span className="kpi-value">{recommendations.length}</span>
                        </div>
                    </div>
                </AnimatedContent>

                <AnimatedContent distance={18} delay={0.1} duration={0.4}>
                    <div className="trust-strip">
                        <span><Shield size={14} /> Güvenli işleme</span>
                        <span><CheckCircle2 size={14} /> Geçici depolama</span>
                        <span><Eye size={14} /> Gizlilik odaklı analiz</span>
                    </div>
                </AnimatedContent>

                <div className="results-shell">
                    <aside className="results-sidebar">
                        <div className="results-side-nav">
                            {SECTIONS.map(section => (
                                <button
                                    key={section.id}
                                    className={`side-nav-btn ${activeSection === section.id ? 'active' : ''}`}
                                    onClick={() => setActiveSection(section.id)}
                                >
                                    <section.icon size={15} />
                                    <span>{section.label}</span>
                                </button>
                            ))}
                        </div>
                    </aside>

                    <div className="results-main">
                        {activeSection === 'overview' && (
                            <div className="section-block">
                                <h3 className="section-block-title">
                                    <Eye size={18} className="icon-info" /> Genel Bakış
                                </h3>
                                <div className="scores-hero">
                                    <div className="score-block score-block-ats">
                                        <CircularScore
                                            score={atsScore.score ?? 0}
                                            color={getScoreColor(atsScore.score ?? 0)}
                                            label="ATS Skoru"
                                            size={150}
                                            strokeWidth={10}
                                        />
                                        <div className="score-meta">
                                            <span className="score-grade" style={{ color: atsGrade.color || 'var(--cyan)' }}>
                                                {atsGrade.letter || '—'} {atsGrade.label || ''}
                                            </span>
                                            <span className="score-desc">ATS Uyumluluk</span>
                                        </div>
                                    </div>

                                    {isFullMode && (
                                        <>
                                            <div className="scores-divider" />
                                            <div className="score-block score-block-match">
                                                <CircularScore
                                                    score={jobMatchScore.score ?? 0}
                                                    color={getScoreColor(jobMatchScore.score ?? 0)}
                                                    label="Eşleşme"
                                                    size={150}
                                                    strokeWidth={10}
                                                />
                                                <div className="score-meta">
                                                    <span className="score-grade" style={{ color: matchGrade.color || 'var(--amber)' }}>
                                                        {matchGrade.letter || '—'} {matchGrade.label || ''}
                                                    </span>
                                                    <span className="score-desc">İlan Eşleşme</span>
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>

                                <div className="quick-stats">
                                    <div className="quick-stat">
                                        <span className="quick-stat-value" style={{ color: getScoreColor(atsScore.score ?? 0) }}>
                                            {atsScore.score ?? 0}%
                                        </span>
                                        <span className="quick-stat-label">ATS Uyumluluk</span>
                                    </div>
                                    {isFullMode && (
                                        <>
                                            <div className="quick-stat">
                                                <span className="quick-stat-value" style={{ color: getScoreColor(jobMatchScore.score ?? 0) }}>
                                                    {jobMatchScore.score ?? 0}%
                                                </span>
                                                <span className="quick-stat-label">İlan Eşleşme</span>
                                            </div>
                                            <div className="quick-stat">
                                                <span className="quick-stat-value icon-success">{matched.length}</span>
                                                <span className="quick-stat-label">Eşleşen Beceri</span>
                                            </div>
                                            <div className="quick-stat">
                                                <span className="quick-stat-value icon-danger">{missing.length}</span>
                                                <span className="quick-stat-label">Eksik Beceri</span>
                                            </div>
                                        </>
                                    )}
                                    <div className="quick-stat">
                                        <span className="quick-stat-value icon-warning">{risks.length}</span>
                                        <span className="quick-stat-label">Risk</span>
                                    </div>
                                </div>

                                <div className="insight-strip">
                                    <div className="insight-item">
                                        <span className="insight-key">En Güçlü Alan</span>
                                        <span className="insight-val">{strongestAts ? `${strongestAts.label} · ${strongestAts.pct}%` : '—'}</span>
                                    </div>
                                    <div className="insight-divider" />
                                    <div className="insight-item">
                                        <span className="insight-key">En Zayıf Alan</span>
                                        <span className="insight-val">{weakestAts ? `${weakestAts.label} · ${weakestAts.pct}%` : '—'}</span>
                                    </div>
                                    <div className="insight-divider" />
                                    <div className="insight-item">
                                        <span className="insight-key">Beceri Kapsama</span>
                                        <span className="insight-val">{skillCoverage}%</span>
                                    </div>
                                </div>

                                <div className="charts-grid">
                                    <CompactBarChart title="ATS Kategori Dağılımı" data={atsChartData} />
                                    {isFullMode
                                        ? <CompactBarChart title="Eşleşme Kategori Dağılımı" data={matchChartData} />
                                        : <DonutChart title="Beceri Uyum Görünümü" matchedCount={matched.length} missingCount={missing.length} />}
                                </div>

                                {isFullMode && (
                                    <div className="charts-grid charts-grid-single">
                                        <DonutChart title="Temel Beceri Uyum Oranı" matchedCount={matched.length} missingCount={missing.length} />
                                    </div>
                                )}
                            </div>
                        )}

                        {activeSection === 'ats-details' && (
                            <div className="section-block">
                                <h3 className="section-block-title">
                                    <BarChart3 size={18} className="icon-info" /> ATS Detayları
                                </h3>
                                <div className="detail-grid">
                                    {atsBreakdown.map((item, i) => {
                                        const pct = item.maxPoints > 0 ? (item.points / item.maxPoints) * 100 : 0;
                                        const color = getScoreColor(pct);
                                        return (
                                            <div key={i} className="detail-row">
                                                <div className="detail-row-header">
                                                    <span className="detail-row-label">{item.label}</span>
                                                    <span className="detail-row-score" style={{ color }}>{item.points}/{item.maxPoints}</span>
                                                </div>
                                                <div className="progress-bar-track">
                                                    <div className="progress-bar-fill" style={{ width: `${pct}%`, background: color, transition: 'width 1s ease-out 0.3s' }} />
                                                </div>
                                                {item.message && <p className="detail-row-msg">{item.message}</p>}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {activeSection === 'breakdown' && (
                            <div className="section-block">
                                <h3 className="section-block-title">
                                    <Target size={18} className="icon-warning" /> Score Breakdown
                                </h3>
                                <div className="progress-list">
                                    {atsBreakdown.map((item, i) => (
                                        <ProgressBar key={`ats-${i}`} label={`ATS · ${item.label}`} value={item.points} max={item.maxPoints} message={item.message} />
                                    ))}
                                    {isFullMode && matchBreakdown.map((item, i) => (
                                        <ProgressBar key={`match-${i}`} label={`Eşleşme · ${item.label}`} value={item.points} max={item.maxPoints} message={item.message} />
                                    ))}
                                </div>

                                {isFullMode && (
                                    <div className="skills-section">
                                        {matched.length > 0 && (
                                            <div className="section-subblock">
                                                <h4 className="section-subtitle-row"><CheckCircle2 size={16} className="icon-success" /> Eşleşen Beceriler ({matched.length})</h4>
                                                <div className="skills-tags">
                                                    {matched.map((skill, idx) => (
                                                        <span key={idx} className="tag tag-success"><CheckCircle2 size={12} /> {skill}</span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {missing.length > 0 && (
                                            <div className="section-subblock">
                                                <h4 className="section-subtitle-row"><XCircle size={16} className="icon-danger" /> Eksik Beceriler ({missing.length})</h4>
                                                <div className="skills-tags">
                                                    {missing.map((skill, idx) => (
                                                        <span key={idx} className="tag tag-danger"><XCircle size={12} /> {skill}</span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {niceToHaveMatched.length > 0 && (
                                            <div className="section-subblock">
                                                <h4 className="section-subtitle-row"><CheckCircle2 size={16} className="icon-info" /> Tercih Edilen (Var) ({niceToHaveMatched.length})</h4>
                                                <div className="skills-tags">
                                                    {niceToHaveMatched.map((skill, idx) => (
                                                        <span key={idx} className="tag tag-info"><CheckCircle2 size={12} /> {skill}</span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {niceToHaveMissing.length > 0 && (
                                            <div className="section-subblock">
                                                <h4 className="section-subtitle-row"><Minus size={16} className="icon-warning" /> Tercih Edilen (Eksik) ({niceToHaveMissing.length})</h4>
                                                <div className="skills-tags">
                                                    {niceToHaveMissing.map((skill, idx) => (
                                                        <span key={idx} className="tag tag-warning"><Minus size={12} /> {skill}</span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}

                        {activeSection === 'risks' && (
                            <div className="section-block">
                                <h3 className="section-block-title">
                                    <AlertTriangle size={18} className="icon-danger" /> Riskler
                                </h3>
                                {risks.length === 0 && (
                                    <p className="section-block-desc">Önemli bir risk tespit edilmedi.</p>
                                )}
                                <div className="risk-list">
                                    {risks.map((risk, i) => (
                                        <div key={i} className={`risk-item risk-${risk.level || 'medium'}`}>
                                            <div className="risk-header">
                                                <AlertTriangle size={14} />
                                                <span className="risk-title">{risk.title}</span>
                                                <span className="risk-badge">{risk.level === 'high' ? 'Yüksek' : risk.level === 'medium' ? 'Orta' : 'Düşük'}</span>
                                            </div>
                                            <p className="risk-desc">{risk.description}</p>
                                            <p className="risk-action"><Lightbulb size={13} /> {risk.fix || 'Aksiyon: ilgili bölümü ilan gereksinimlerine göre revize edin.'}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {activeSection === 'recs' && (
                            <div className="section-block">
                                <h3 className="section-block-title">
                                    <TrendingUp size={18} className="icon-info" /> Recommendations
                                </h3>
                                <p className="section-block-desc">CV kalitesini artırmak için önerilen aksiyonlar.</p>

                                {recommendations.length === 0 && (
                                    <p className="section-block-desc">Bu analiz modu için öneri verisi bulunmuyor.</p>
                                )}

                                <div className="rec-list">
                                    {recommendations.map((rec, i) => (
                                        <div key={i} className={`rec-item rec-${rec.priority || 'medium'}`}>
                                            <div className="rec-header">
                                                <span className={`rec-priority ${rec.priority}`}>
                                                    {rec.priority === 'high' ? 'Yüksek Öncelik' : rec.priority === 'medium' ? 'Orta Öncelik' : 'Düşük Öncelik'}
                                                </span>
                                                <h4 className="rec-title">{rec.title}</h4>
                                            </div>
                                            <p className="rec-desc">{rec.description}</p>
                                            {rec.items && rec.items.length > 0 && (
                                                <ul className="rec-items">
                                                    {rec.items.map((item, j) => (
                                                        <li key={j}><ChevronRight size={14} /> {item}</li>
                                                    ))}
                                                </ul>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
