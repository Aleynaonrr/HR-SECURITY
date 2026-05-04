import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import api from '../services/api';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    
    const { login } = useAuth();
    const { t } = useLanguage();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await api.post('/login', { email, password });
            
            login(response.data);
            
            if (response.data.role === 'HR') {
                navigate('/admin');
            } else {
                navigate('/dashboard');
            }
            
            setLoading(false);
            
        } catch (err) {
            // Backend might return error with 'error' or 'message' key
            const errorMessage = err.response?.data?.error || err.response?.data?.message || t('login.error_generic');
            setError(errorMessage);
            setPassword(''); // Clear only the password field
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[calc(100vh-80px)] flex items-center justify-center bg-gray-50 py-20 px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl w-full space-y-10 bg-white p-14 rounded-3xl shadow-lg border border-gray-100">
                <div>
                    <h2 className="mt-2 text-center text-4xl font-extrabold text-gray-900">
                        {t('login.title')}
                    </h2>
                    <p className="mt-4 text-center text-lg text-gray-600 font-medium">
                        {t('login.or')}{' '}
                        <Link to="/register" className="font-bold text-blue-600 hover:text-blue-500 transition-all">
                            {t('login.register_link')}
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
                            <label className="block text-lg font-bold text-gray-700 mb-2" htmlFor="email">{t('login.email')}</label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                required
                                className="appearance-none rounded-xl relative block w-full px-5 py-4 border border-gray-300 placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg transition-all"
                                placeholder="example@hr.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-lg font-bold text-gray-700 mb-2" htmlFor="password">{t('login.password')}</label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                required
                                className="appearance-none rounded-xl relative block w-full px-5 py-4 border border-gray-300 placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg transition-all"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="pt-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className={`group relative w-full flex justify-center py-4 px-6 border border-transparent text-xl font-bold rounded-xl text-white ${loading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-300`}
                        >
                            {loading ? t('login.button_loading') : t('login.button')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Login;
