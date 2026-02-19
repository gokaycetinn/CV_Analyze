import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, ChevronLeft, ChevronRight, Shield, Target, Lightbulb, Zap, BarChart3, FileCheck } from 'lucide-react';
import SplitText from '../components/reactbits/SplitText';
import BlurText from '../components/reactbits/BlurText';
import CountUp from '../components/reactbits/CountUp';
import AnimatedContent from '../components/reactbits/AnimatedContent';
import ShinyText from '../components/reactbits/ShinyText';
import previewOne from '../../img/1.avif';
import './HomePage.css';

const PANELS = [
    { id: 'hero' },
    { id: 'how' },
    { id: 'stats' },
    { id: 'cta' }
];

export default function HomePage() {
    const navigate = useNavigate();
    const scrollRef = useRef(null);
    const [activePanel, setActivePanel] = useState(0);

    const scrollToPanel = useCallback((index) => {
        const el = scrollRef.current;
        if (!el) return;
        const clamped = Math.max(0, Math.min(index, PANELS.length - 1));
        el.scrollTo({ left: clamped * el.offsetWidth, behavior: 'smooth' });
        setActivePanel(clamped);
    }, []);

    useEffect(() => {
        const el = scrollRef.current;
        if (!el) return;
        const onScroll = () => {
            const idx = Math.round(el.scrollLeft / el.offsetWidth);
            setActivePanel(idx);
        };
        el.addEventListener('scroll', onScroll, { passive: true });
        return () => el.removeEventListener('scroll', onScroll);
    }, []);

    useEffect(() => {
        const onKey = (e) => {
            if (e.key === 'ArrowRight') scrollToPanel(activePanel + 1);
            if (e.key === 'ArrowLeft') scrollToPanel(activePanel - 1);
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [activePanel, scrollToPanel]);

    return (
        <div className="home-page" style={{ '--page-bg-image': `url(${previewOne})` }}>
            {/* Horizontal Scroll Container */}
            <div className="panels-container" ref={scrollRef}>

                {/* ═══ PANEL 1: Hero ═══ */}
                <section className="panel panel-hero">
                    <div className="panel-bg-mesh" />
                    <div className="panel-content hero-content">
                        <div className="hero-badge">
                            <Zap size={14} />
                            <span>Türkiye'nin İlk ATS Analiz Platformu</span>
                        </div>

                        <SplitText
                            text="CV'nizi ATS Sistemlerine Hazırlayın"
                            tag="h1"
                            className="hero-title"
                            delay={30}
                            duration={0.5}
                            splitType="words"
                            from={{ opacity: 0, y: 50 }}
                            to={{ opacity: 1, y: 0 }}
                            textAlign="center"
                        />

                        <BlurText
                            text="Yapay zeka destekli analiz ile CV'nizin ATS uyumluluğunu ölçün, eksiklerinizi tespit edin ve iş başvurularınızda öne çıkın."
                            className="hero-subtitle"
                            delay={40}
                            animateBy="words"
                            direction="bottom"
                        />

                        <div className="hero-actions">
                            <button className="btn btn-primary btn-lg hero-cta" onClick={() => navigate('/analyze')}>
                                <ShinyText text="Hemen Analiz Et" speed={4} />
                                <ArrowRight size={20} />
                            </button>
                            <button className="btn btn-secondary btn-lg" onClick={() => scrollToPanel(1)}>
                                Nasıl Çalışır?
                            </button>
                        </div>

                        <div className="hero-scroll-hint" onClick={() => scrollToPanel(1)}>
                            <span>Kaydır</span>
                            <ChevronRight size={16} />
                        </div>
                    </div>
                </section>

                {/* ═══ PANEL 2: How It Works ═══ */}
                <section className="panel panel-how">
                    <div className="panel-content">
                        <AnimatedContent distance={60} duration={0.5}>
                            <h2 className="panel-title">Nasıl <span className="gradient-text">Çalışır?</span></h2>
                        </AnimatedContent>

                        <div className="how-steps">
                            <AnimatedContent distance={80} delay={0.1} duration={0.5}>
                                <div className="how-step">
                                    <div className="step-number">01</div>
                                    <div className="step-icon step-icon-1"><FileCheck size={28} /></div>
                                    <h3>CV'nizi Yükleyin</h3>
                                    <p>PDF, DOCX veya metin olarak CV'nizi yükleyin. Sistem otomatik olarak içeriği analiz eder.</p>
                                </div>
                            </AnimatedContent>

                            <AnimatedContent distance={80} delay={0.2} duration={0.5}>
                                <div className="how-step">
                                    <div className="step-number">02</div>
                                    <div className="step-icon step-icon-2"><BarChart3 size={28} /></div>
                                    <h3>Analiz Edin</h3>
                                    <p>ATS uyumluluğunu ölçün veya iş ilanı ile eşleştirme yapın. Detaylı raporunuzu alın.</p>
                                </div>
                            </AnimatedContent>

                            <AnimatedContent distance={80} delay={0.3} duration={0.5}>
                                <div className="how-step">
                                    <div className="step-number">03</div>
                                    <div className="step-icon step-icon-3"><Lightbulb size={28} /></div>
                                    <h3>İyileştirin</h3>
                                    <p>Kişiselleştirilmiş öneriler ile CV'nizi güçlendirin ve başvurularınızı güçlendirin.</p>
                                </div>
                            </AnimatedContent>
                        </div>
                    </div>
                </section>

                {/* ═══ PANEL 3: Stats ═══ */}
                <section className="panel panel-stats">
                    <div className="panel-content">
                        <AnimatedContent distance={60} duration={0.5}>
                            <h2 className="panel-title">Neden <span className="gradient-text-warm">TR-ATS?</span></h2>
                        </AnimatedContent>

                        <div className="stats-grid">
                            <AnimatedContent distance={60} delay={0.1} duration={0.5}>
                                <div className="stat-item">
                                    <div className="stat-value">
                                        %<CountUp to={95} duration={2} className="stat-number" />
                                    </div>
                                    <div className="stat-label">ATS Uyumluluk Doğruluğu</div>
                                    <p className="stat-desc">Türkçe CV'ler için optimize edilmiş analiz motoru</p>
                                </div>
                            </AnimatedContent>

                            <AnimatedContent distance={60} delay={0.2} duration={0.5}>
                                <div className="stat-item">
                                    <div className="stat-value">
                                        <CountUp to={50} duration={2} className="stat-number" />+
                                    </div>
                                    <div className="stat-label">Analiz Kriteri</div>
                                    <p className="stat-desc">Format, içerik, anahtar kelime ve yapısal kontroller</p>
                                </div>
                            </AnimatedContent>

                            <AnimatedContent distance={60} delay={0.3} duration={0.5}>
                                <div className="stat-item">
                                    <div className="stat-value">
                                        <CountUp to={200} duration={2} className="stat-number" />+
                                    </div>
                                    <div className="stat-label">Beceri Veritabanı</div>
                                    <p className="stat-desc">Türkçe-İngilizce eşanlamlı beceri eşleştirme</p>
                                </div>
                            </AnimatedContent>
                        </div>

                        <div className="features-row">
                            <div className="feature-chip"><Shield size={16} /> ATS Uyumluluk Kontrolü</div>
                            <div className="feature-chip"><Target size={16} /> İlan Eşleştirme</div>
                            <div className="feature-chip"><Lightbulb size={16} /> Akıllı Öneriler</div>
                        </div>
                    </div>
                </section>

                {/* ═══ PANEL 4: CTA ═══ */}
                <section className="panel panel-cta">
                    <div className="panel-content panel-cta-content">
                        <AnimatedContent distance={60} duration={0.5}>
                            <h2 className="cta-title">
                                CV'nizi <span className="gradient-text">Analiz Etmeye</span> Hazır mısınız?
                            </h2>
                        </AnimatedContent>

                        <AnimatedContent distance={40} delay={0.2} duration={0.5}>
                            <p className="cta-subtitle">
                                Sadece CV'nizi yükleyin, ATS uyumluluğunuzu saniyeler içinde öğrenin.
                            </p>
                        </AnimatedContent>

                        <AnimatedContent distance={30} delay={0.3} duration={0.5}>
                            <div className="cta-actions">
                                <button className="btn btn-primary btn-lg cta-btn" onClick={() => navigate('/analyze')}>
                                    <Zap size={20} />
                                    <ShinyText text="Analizi Başlat" speed={3} />
                                    <ArrowRight size={20} />
                                </button>
                            </div>
                        </AnimatedContent>
                    </div>
                </section>
            </div>

            {/* Navigation Controls */}
            <div className="panel-nav">
                <button
                    className="panel-nav-arrow"
                    onClick={() => scrollToPanel(activePanel - 1)}
                    disabled={activePanel === 0}
                >
                    <ChevronLeft size={20} />
                </button>

                <div className="panel-dots">
                    {PANELS.map((p, i) => (
                        <button
                            key={p.id}
                            className={`panel-dot ${activePanel === i ? 'active' : ''}`}
                            onClick={() => scrollToPanel(i)}
                        />
                    ))}
                </div>

                <button
                    className="panel-nav-arrow"
                    onClick={() => scrollToPanel(activePanel + 1)}
                    disabled={activePanel === PANELS.length - 1}
                >
                    <ChevronRight size={20} />
                </button>
            </div>
        </div>
    );
}
