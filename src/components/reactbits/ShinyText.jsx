import './ShinyText.css';

export default function ShinyText({ text, disabled = false, speed = 3, className = '' }) {
    return (
        <span
            className={`shiny-text ${disabled ? 'disabled' : ''} ${className}`}
            style={{ '--shiny-speed': `${speed}s` }}
        >
            {text}
        </span>
    );
}
