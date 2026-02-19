import { useRef, useEffect, useState } from 'react';

export default function SplitText({
    text = '',
    className = '',
    delay = 50,
    duration = 0.6,
    ease = 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
    splitType = 'chars',
    from = { opacity: 0, y: 40 },
    to = { opacity: 1, y: 0 },
    threshold = 0.1,
    tag: Tag = 'p',
    textAlign = 'center',
    onAnimationComplete
}) {
    const ref = useRef(null);
    const [inView, setInView] = useState(false);

    useEffect(() => {
        if (!ref.current) return;
        const observer = new IntersectionObserver(
            ([entry]) => { if (entry.isIntersecting) { setInView(true); observer.disconnect(); } },
            { threshold }
        );
        observer.observe(ref.current);
        return () => observer.disconnect();
    }, [threshold]);

    const words = text.split(' ');
    let charIndex = 0;

    return (
        <Tag
            ref={ref}
            className={`split-text-parent ${className}`}
            style={{ textAlign, overflow: 'hidden', display: 'inline-block' }}
        >
            {splitType === 'chars' ? (
                words.map((word, wi) => (
                    <span key={wi} style={{ display: 'inline-block', whiteSpace: 'pre' }}>
                        {word.split('').map((char, ci) => {
                            const idx = charIndex++;
                            return (
                                <span
                                    key={ci}
                                    style={{
                                        display: 'inline-block',
                                        opacity: inView ? (to.opacity ?? 1) : (from.opacity ?? 0),
                                        transform: inView
                                            ? `translateY(${to.y ?? 0}px) rotateX(${to.rotateX ?? 0}deg)`
                                            : `translateY(${from.y ?? 40}px) rotateX(${from.rotateX ?? 0}deg)`,
                                        transition: `opacity ${duration}s ${ease} ${idx * delay}ms, transform ${duration}s ${ease} ${idx * delay}ms`,
                                        willChange: 'opacity, transform'
                                    }}
                                    onTransitionEnd={
                                        idx === text.replace(/\s/g, '').length - 1 ? onAnimationComplete : undefined
                                    }
                                >
                                    {char}
                                </span>
                            );
                        })}
                        {wi < words.length - 1 && <span style={{ display: 'inline-block' }}>&nbsp;</span>}
                    </span>
                ))
            ) : (
                words.map((word, wi) => (
                    <span
                        key={wi}
                        style={{
                            display: 'inline-block',
                            opacity: inView ? (to.opacity ?? 1) : (from.opacity ?? 0),
                            transform: inView
                                ? `translateY(${to.y ?? 0}px)`
                                : `translateY(${from.y ?? 40}px)`,
                            transition: `opacity ${duration}s ${ease} ${wi * delay}ms, transform ${duration}s ${ease} ${wi * delay}ms`,
                            willChange: 'opacity, transform',
                            marginRight: '0.3em'
                        }}
                        onTransitionEnd={wi === words.length - 1 ? onAnimationComplete : undefined}
                    >
                        {word}
                    </span>
                ))
            )}
        </Tag>
    );
}
