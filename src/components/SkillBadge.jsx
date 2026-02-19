import './SkillBadge.css';

export default function SkillBadge({ name, type = 'matched', matchType, category }) {
    const typeClass = {
        matched: 'badge-matched',
        missing: 'badge-missing',
        synonym: 'badge-synonym',
        extra: 'badge-extra',
        nice: 'badge-nice'
    }[type] || 'badge-matched';

    const typeIcon = {
        matched: '✓',
        missing: '✕',
        synonym: '≈',
        extra: '◦',
        nice: '★'
    }[type] || '•';

    return (
        <span className={`skill-badge ${typeClass}`} title={matchType ? `Eşleşme: ${matchType}` : ''}>
            <span className="skill-badge-icon">{typeIcon}</span>
            <span className="skill-badge-name">{name}</span>
            {category && <span className="skill-badge-category">{category}</span>}
        </span>
    );
}
