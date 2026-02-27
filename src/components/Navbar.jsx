import { NavLink, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import logo from '../../img/logo.png';
import './Navbar.css';

export default function Navbar() {
    const [mobileOpen, setMobileOpen] = useState(false);
    const navigate = useNavigate();

    return (
        <nav className="navbar">
            <div className="navbar-inner">
                <NavLink to="/" className="navbar-brand">
                    <img src={logo} alt="TR-ATS" className="brand-logo" />
                    <span className="brand-name">TR-ATS</span>
                </NavLink>

                <div className={`navbar-links ${mobileOpen ? 'open' : ''}`}>
                    <NavLink
                        to="/"
                        end
                        className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
                        onClick={() => setMobileOpen(false)}
                    >
                        Ana Sayfa
                    </NavLink>
                    <NavLink
                        to="/analyze"
                        className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
                        onClick={() => setMobileOpen(false)}
                    >
                        Analiz Et
                    </NavLink>
                </div>

                <button
                    className="btn btn-primary btn-sm navbar-cta"
                    onClick={() => { navigate('/analyze'); setMobileOpen(false); }}
                >
                    Hemen Başla
                </button>

                <button className="mobile-toggle" onClick={() => setMobileOpen(!mobileOpen)}>
                    {mobileOpen ? <X size={22} /> : <Menu size={22} />}
                </button>
            </div>
        </nav>
    );
}
