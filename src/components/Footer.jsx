import { NavLink } from 'react-router-dom';
import logo from '../../img/logo.png';
import './Footer.css';

export default function Footer() {
    return (
        <footer className="footer">
            <div className="footer-inner">
                <div className="footer-brand">
                    <img src={logo} alt="TR-ATS" className="footer-logo" />
                    <span className="footer-name">TR-ATS</span>
                </div>
                <div className="footer-links">
                    <NavLink to="/">Ana Sayfa</NavLink>
                    <NavLink to="/analyze">Analiz</NavLink>
                </div>
                <p className="footer-copy">© 2026 TR-ATS Platformu</p>
            </div>
        </footer>
    );
}
