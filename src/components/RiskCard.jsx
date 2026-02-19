import { AlertTriangle, AlertCircle, Info } from 'lucide-react';
import './RiskCard.css';

export default function RiskCard({ level, title, description, reason, fix }) {
    const config = {
        high: { icon: <AlertTriangle size={20} />, className: 'risk-high', label: 'Yüksek Risk' },
        medium: { icon: <AlertCircle size={20} />, className: 'risk-medium', label: 'Orta Risk' },
        low: { icon: <Info size={20} />, className: 'risk-low', label: 'Düşük Risk' }
    }[level] || { icon: <Info size={20} />, className: 'risk-low', label: 'Bilgi' };

    return (
        <div className={`risk-block ${config.className}`}>
            <div className="risk-header">
                <div className="risk-icon">{config.icon}</div>
                <div className="risk-title-group">
                    <span className="risk-level-label">{config.label}</span>
                    <h4 className="risk-title">{title}</h4>
                </div>
            </div>

            <p className="risk-description">{description}</p>

            {reason && (
                <div className="risk-reason">
                    <strong>Neden ATS'ye takılır?</strong>
                    <p>{reason}</p>
                </div>
            )}

            {fix && (
                <div className="risk-fix">
                    <strong>Nasıl düzeltilir?</strong>
                    <p>{fix}</p>
                </div>
            )}
        </div>
    );
}
