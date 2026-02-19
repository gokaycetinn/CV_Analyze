import { ChevronRight } from 'lucide-react';
import './RecommendationCard.css';

export default function RecommendationCard({ icon, title, description, items, action, priority, type }) {
    const priorityClass = {
        high: 'rec-high',
        medium: 'rec-medium',
        low: 'rec-low'
    }[priority] || 'rec-medium';

    const priorityLabel = {
        high: 'Yüksek Öncelik',
        medium: 'Orta Öncelik',
        low: 'Düşük Öncelik'
    }[priority] || 'Öneri';

    return (
        <div className={`recommendation-block ${priorityClass}`}>
            <div className="rec-header">
                <span className="rec-icon">{icon}</span>
                <div className="rec-title-group">
                    <span className="rec-priority">{priorityLabel}</span>
                    <h4>{title}</h4>
                </div>
            </div>

            <p className="rec-description">{description}</p>

            {items && items.length > 0 && (
                <ul className="rec-items">
                    {items.map((item, i) => (
                        <li key={i}>
                            <ChevronRight size={14} />
                            <span>{item}</span>
                        </li>
                    ))}
                </ul>
            )}

            {action && (
                <div className="rec-action">
                    <span>💡</span>
                    <span>{action}</span>
                </div>
            )}
        </div>
    );
}
