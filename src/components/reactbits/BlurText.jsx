import { useRef, useEffect, useState } from 'react';

export default function BlurText({
    text = '',
    delay = 50,
    className = '',
    animateBy = 'words',
    direction = 'top',
    onAnimationComplete,
    threshold = 0.1
}) {
    const elements = animateBy === 'words' ? text.split(' ') : text.split('');
    const [inView, setInView] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        if (!ref.current) return;
        const observer = new IntersectionObserver(
            ([entry]) => { if (entry.isIntersecting) { setInView(true); observer.disconnect(); } },
            { threshold }
        );
        observer.observe(ref.current);
        return () => observer.disconnect();
    }, [threshold]);

    const getTransform = () => {
        switch (direction) {
            case 'top': return 'translateY(-20px)';
            case 'bottom': return 'translateY(20px)';
            case 'left': return 'translateX(-20px)';
            case 'right': return 'translateX(20px)';
            default: return 'translateY(-20px)';
        }
    };

    return (
        <p ref={ref} className={`blur-text-container ${className}`} style={{ display: 'flex', flexWrap: 'wrap', gap: animateBy === 'words' ? '0.35em' : '0', justifyContent: 'inherit' }}>
            {elements.map((el, i) => (
                <span
                    key={i}
                    style={{
                        display: 'inline-block',
                        opacity: inView ? 1 : 0,
                        filter: inView ? 'blur(0px)' : 'blur(12px)',
                        transform: inView ? 'none' : getTransform(),
                        transition: `opacity 0.5s ease ${i * delay}ms, filter 0.5s ease ${i * delay}ms, transform 0.5s ease ${i * delay}ms`,
                        willChange: 'opacity, filter, transform'
                    }}
                    onTransitionEnd={i === elements.length - 1 ? onAnimationComplete : undefined}
                >
                    {el}{animateBy === 'words' ? '' : (el === ' ' ? '\u00A0' : '')}
                </span>
            ))}
        </p>
    );
}
