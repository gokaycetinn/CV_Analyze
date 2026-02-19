import { useRef, useEffect, useState } from 'react';

export default function AnimatedContent({
    children,
    distance = 100,
    direction = 'vertical',
    reverse = false,
    config = { threshold: 0.1 },
    initialOpacity = 0,
    animateOpacity = true,
    scale = 1,
    duration = 0.6,
    delay = 0,
    className = ''
}) {
    const [inView, setInView] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        if (!ref.current) return;
        const observer = new IntersectionObserver(
            ([entry]) => { if (entry.isIntersecting) { setInView(true); observer.disconnect(); } },
            { threshold: config.threshold }
        );
        observer.observe(ref.current);
        return () => observer.disconnect();
    }, [config.threshold]);

    const getTransform = () => {
        if (!inView) {
            const sign = reverse ? -1 : 1;
            if (direction === 'horizontal') return `translateX(${sign * distance}px) scale(${scale})`;
            return `translateY(${sign * distance}px) scale(${scale})`;
        }
        return 'translateY(0) translateX(0) scale(1)';
    };

    return (
        <div
            ref={ref}
            className={className}
            style={{
                opacity: inView ? 1 : (animateOpacity ? initialOpacity : 1),
                transform: getTransform(),
                transition: `opacity ${duration}s ease ${delay}s, transform ${duration}s ease ${delay}s`,
                willChange: 'opacity, transform'
            }}
        >
            {children}
        </div>
    );
}
