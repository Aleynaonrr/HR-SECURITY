import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import api from '../services/api';

const Register = () => {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    
    const { t } = useLanguage();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (formData.password !== formData.confirmPassword) {
            setError(t('register.password_mismatch'));
            return;
        }

        setLoading(true);

        try {
            const payload = {
                first_name: formData.firstName,
                last_name: formData.lastName,
                email: formData.email,
                password: formData.password
            };
            await api.post('/register', payload);
            
            setSuccess(t('register.success'));
            setLoading(false);
            setTimeout(() => navigate('/login'), 2000);
            
        } catch (err) {
            // Backend might return error under 'error' or 'message' key
            const errorMessage = err.response?.data?.error || err.response?.data?.message || t('login.error_generic');
            setError(errorMessage);
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[calc(100vh-80px)] flex items-center justify-center bg-transparent py-20 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl w-full space-y-10 bg-white/10 backdrop-blur-xl p-14 rounded-[2.5rem] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)] border-t border-l border-white/20">
                <div>
                    <h2 className="mt-2 text-center text-4xl font-extrabold text-white drop-shadow-sm">
                        {t('register.title')}
                    </h2>
                    <p className="mt-4 text-center text-lg text-slate-300 font-medium">
                        {t('register.already_have_account')}{' '}
                        <Link to="/login" className="font-bold text-cyan-400 hover:text-cyan-300 transition-all">
                            {t('register.login_link')}
                        </Link>
                    </p>
                </div>

                {error && (
                    <div className="bg-red-50 border-l-8 border-red-500 p-5 mb-4 rounded-xl shadow-md">
                        <p className="text-lg font-medium text-red-700">{error}</p>
                    </div>
                )}
                
                {success && (
                    <div className="bg-green-50 border-l-8 border-green-500 p-5 mb-4 rounded-xl shadow-md">
                        <p className="text-lg font-medium text-green-700">{success}</p>
                    </div>
                )}

                <form className="mt-10 space-y-8" onSubmit={handleSubmit}>
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-lg font-bold text-white mb-2 drop-shadow-sm" htmlFor="firstName">{t('register.firstname')}</label>
                                <input
                                    id="firstName"
                                    name="firstName"
                                    type="text"
                                    required
                                    className="appearance-none rounded-2xl relative block w-full px-5 py-4 border-2 border-white/10 bg-white/5 placeholder-slate-400 text-white focus:outline-none focus:ring-4 focus:ring-purple-500/50 focus:border-purple-500 text-lg transition-all shadow-inner font-medium"
                                    placeholder={t('register.firstname')}
                                    value={formData.firstName}
                                    onChange={handleChange}
                                />
                            </div>
                            <div>
                                <label className="block text-lg font-bold text-white mb-2 drop-shadow-sm" htmlFor="lastName">{t('register.lastname')}</label>
                                <input
                                    id="lastName"
                                    name="lastName"
                                    type="text"
                                    required
                                    className="appearance-none rounded-2xl relative block w-full px-5 py-4 border-2 border-white/10 bg-white/5 placeholder-slate-400 text-white focus:outline-none focus:ring-4 focus:ring-purple-500/50 focus:border-purple-500 text-lg transition-all shadow-inner font-medium"
                                    placeholder={t('register.lastname')}
                                    value={formData.lastName}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-lg font-bold text-white mb-2 drop-shadow-sm" htmlFor="email">{t('register.email')}</label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                required
                                className="appearance-none rounded-2xl relative block w-full px-5 py-4 border-2 border-white/10 bg-white/5 placeholder-slate-400 text-white focus:outline-none focus:ring-4 focus:ring-purple-500/50 focus:border-purple-500 text-lg transition-all shadow-inner font-medium"
                                placeholder="example@email.com"
                                value={formData.email}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-lg font-bold text-white mb-2 drop-shadow-sm" htmlFor="password">{t('register.password')}</label>
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    required
                                    className="appearance-none rounded-2xl relative block w-full px-5 py-4 border-2 border-white/10 bg-white/5 placeholder-slate-400 text-white focus:outline-none focus:ring-4 focus:ring-purple-500/50 focus:border-purple-500 text-lg transition-all shadow-inner font-medium"
                                    placeholder="••••••••"
                                    value={formData.password}
                                    onChange={handleChange}
                                />
                            </div>
                            <div>
                                <label className="block text-lg font-bold text-white mb-2 drop-shadow-sm" htmlFor="confirmPassword">{t('register.confirm_password')}</label>
                                <input
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    type="password"
                                    required
                                    className="appearance-none rounded-2xl relative block w-full px-5 py-4 border-2 border-white/10 bg-white/5 placeholder-slate-400 text-white focus:outline-none focus:ring-4 focus:ring-purple-500/50 focus:border-purple-500 text-lg transition-all shadow-inner font-medium"
                                    placeholder="••••••••"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="pt-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className={`group relative w-full flex justify-center py-4 px-6 border border-transparent text-xl font-bold rounded-2xl text-white ${loading ? 'bg-slate-600 cursor-not-allowed' : 'bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 shadow-[0_10px_20px_rgba(168,85,247,0.4)] hover:shadow-[0_15px_30px_rgba(168,85,247,0.6)] hover:-translate-y-1'} focus:outline-none focus:ring-4 focus:ring-offset-2 focus:ring-purple-500 transition-all duration-300 transform`}
                        >
                            {loading ? t('register.button_loading') : t('register.button')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Register;
