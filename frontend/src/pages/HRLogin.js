import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import api from '../services/api';

const HRLogin = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [secretCode, setSecretCode] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    
    const { login } = useAuth();
    const { t } = useLanguage();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await api.post('/hr/login', { 
                email, 
                password, 
                secret_code: secretCode 
            });
            
            login(response.data);
            navigate('/admin');
            
        } catch (err) {
            const errorMessage = err.response?.data?.error || err.response?.data?.message || t('login.error_generic');
            setError(errorMessage);
            setPassword(''); // Clear password
            setSecretCode(''); // Clear secret code
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[calc(100vh-80px)] flex items-center justify-center bg-gradient-to-br from-indigo-950 via-purple-900 to-slate-900 py-20 px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl w-full space-y-10 bg-white/10 backdrop-blur-xl p-14 rounded-[2.5rem] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)] border-t border-l border-white/20">
                <div>
                    <h2 className="mt-2 text-center text-4xl font-extrabold text-white">
                        {t('hr_login.title')}
                    </h2>
                    <p className="mt-4 text-center text-lg text-slate-300 font-medium">
                        <Link to="/login" className="font-bold text-cyan-400 hover:text-cyan-300 transition-all">
                            {t('hr_login.candidate_login_link')}
                        </Link>
                    </p>
                </div>
                
                {error && (
                    <div className="bg-red-50 border-l-4 border-red-500 p-5 mb-4 rounded">
                        <p className="text-lg font-medium text-red-700">{error}</p>
                    </div>
                )}

                <form className="mt-10 space-y-8" onSubmit={handleSubmit}>
                    <div className="space-y-6">
                        <div>
                            <label className="block text-lg font-bold text-white mb-2" htmlFor="email">{t('login.email')}</label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                required
                                className="appearance-none rounded-2xl relative block w-full px-5 py-4 border-2 border-white/10 bg-white/5 placeholder-slate-400 text-white focus:outline-none focus:ring-4 focus:ring-purple-500/50 focus:border-purple-500 text-lg transition-all shadow-inner font-medium"
                                placeholder="hr@hr-soft.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-lg font-bold text-white mb-2" htmlFor="password">{t('login.password')}</label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                required
                                className="appearance-none rounded-2xl relative block w-full px-5 py-4 border-2 border-white/10 bg-white/5 placeholder-slate-400 text-white focus:outline-none focus:ring-4 focus:ring-purple-500/50 focus:border-purple-500 text-lg transition-all shadow-inner font-medium"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-lg font-bold text-white mb-2" htmlFor="secretCode">{t('hr_login.secret_code')}</label>
                            <input
                                id="secretCode"
                                name="secretCode"
                                type="password"
                                required
                                className="appearance-none rounded-2xl relative block w-full px-5 py-4 border-2 border-white/10 bg-white/5 placeholder-slate-400 text-white focus:outline-none focus:ring-4 focus:ring-cyan-500/50 focus:border-cyan-500 text-lg transition-all shadow-inner font-medium"
                                placeholder="Secret Authorization Code"
                                value={secretCode}
                                onChange={(e) => setSecretCode(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="pt-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className={`group relative w-full flex justify-center py-4 px-6 border border-transparent text-xl font-bold rounded-2xl text-white ${loading ? 'bg-slate-600 cursor-not-allowed' : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 shadow-[0_10px_20px_rgba(79,70,229,0.4)] hover:shadow-[0_15px_30px_rgba(79,70,229,0.6)] hover:-translate-y-1'} focus:outline-none focus:ring-4 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-300 transform`}
                        >
                            {loading ? t('login.button_loading') : t('login.button')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default HRLogin;
