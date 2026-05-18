import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Link, useNavigate } from 'react-router-dom';

const Navbar = () => {
    const { user, logout } = useAuth();
    const { language, changeLanguage, t } = useLanguage();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        window.location.href = '/login';
    };

    const toggleLanguage = () => {
        changeLanguage(language === 'en' ? 'tr' : 'en');
    };

    return (
        <nav className="bg-slate-900/60 backdrop-blur-xl border-b border-white/10 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.5)] sticky top-0 z-50 px-8 py-5 flex justify-between items-center transition-all duration-300">
            <div className="flex items-center gap-4 group cursor-pointer">
                <div className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white p-2 rounded-2xl shadow-[0_8px_15px_rgba(79,70,229,0.3)] group-hover:scale-105 transition-transform">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8">
                        {/* Left vertical of H */}
                        <line x1="6" y1="4" x2="6" y2="20" />
                        {/* Horizontal of H */}
                        <line x1="6" y1="12" x2="12" y2="12" />
                        {/* Right vertical of H / Stem of R */}
                        <line x1="12" y1="4" x2="12" y2="20" />
                        {/* Loop of R (Head/Chest of stickman) */}
                        <path d="M 12 4 A 4 4 0 0 1 12 12" />
                        {/* Leg of R (Right leg of stickman) */}
                        <line x1="12" y1="12" x2="18" y2="20" />
                    </svg>
                </div>
                <span className="font-extrabold text-2xl text-white tracking-tight drop-shadow-sm">
                    HR
                </span>
            </div>
            
            <div className="flex items-center gap-6">
                <button 
                    onClick={toggleLanguage}
                    className="font-bold text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 px-3 py-2 rounded-xl transition-all shadow-sm border border-white/10"
                >
                    {language === 'en' ? 'TR' : 'EN'}
                </button>

                {user && (user.token || sessionStorage.getItem('token')) ? (
                    <div className="flex items-center gap-6">
                        <div className="text-lg bg-white/5 px-5 py-2 rounded-2xl shadow-inner border border-white/10 flex items-center">
                            <span className="text-slate-400 font-medium mr-2">{t('navbar.welcome')}</span>
                            <span className="font-bold text-white">{user?.user?.first_name || user?.first_name}</span>
                            {user.role === 'HR' && (
                                <span className="ml-3 bg-gradient-to-r from-purple-500 to-indigo-500 text-white text-sm font-bold px-3 py-1 rounded-lg shadow-md">
                                    HR
                                </span>
                            )}
                        </div>
                        <button 
                            onClick={handleLogout}
                            className="text-lg font-bold text-white bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 px-6 py-3 rounded-xl shadow-[0_8px_15px_rgba(225,29,72,0.3)] hover:shadow-[0_12px_20px_rgba(225,29,72,0.4)] transform hover:-translate-y-1 transition-all duration-300"
                        >
                            {t('navbar.logout')}
                        </button>
                    </div>
                ) : (
                    <div className="flex gap-4">
                        <Link to="/login" className="text-lg font-bold text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 px-6 py-3 rounded-xl transition-all shadow-sm">
                            {t('navbar.login')}
                        </Link>
                        <Link to="/register" className="text-lg font-bold bg-gradient-to-r from-cyan-500 to-purple-600 text-white hover:from-cyan-400 hover:to-purple-500 px-6 py-3 rounded-xl shadow-[0_8px_15px_rgba(168,85,247,0.4)] hover:shadow-[0_12px_20px_rgba(168,85,247,0.6)] transform hover:-translate-y-1 transition-all duration-300">
                            {t('navbar.register')}
                        </Link>
                    </div>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
