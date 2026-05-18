import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import api from '../services/api';

const Dashboard = () => {
    const { user } = useAuth();
    const { t } = useLanguage();
    
    const [application, setApplication] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitLoading, setSubmitLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [formData, setFormData] = useState({
        job: '',
        school: '',
        department: '',
        salary: ''
    });

    useEffect(() => {
        const fetchApplication = async () => {
            try {
                const response = await api.get('/candidate/application');
                if (response.data.application) {
                    setApplication(response.data.application);
                }
            } catch (err) {
                console.error("Error fetching application:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchApplication();
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setSubmitLoading(true);

        try {
            // Include first_name and last_name from the user context
            const payload = {
                first_name: user?.user?.first_name || user?.first_name || '',
                last_name: user?.user?.last_name || user?.last_name || '',
                ...formData
            };
            await api.post('/apply', payload);
            
            // Re-fetch application
            const response = await api.get('/candidate/application');
            if (response.data.application) {
                setApplication(response.data.application);
                setSuccess(t('dashboard.apply_success'));
                setError(''); // Clear error on success
            }
        } catch (err) {
            setSuccess(''); // Clear success on error
            setError(err.response?.data?.error || t('dashboard.apply_error'));
        } finally {
            setSubmitLoading(false);
        }
    };

    if (loading) {
        return <div className="p-20 text-center text-2xl font-bold text-slate-500 animate-pulse">{t('dashboard.loading') || 'Loading...'}</div>;
    }

    return (
        <div className="p-8 md:p-14 max-w-[90rem] mx-auto w-full min-h-screen bg-gradient-to-br from-indigo-950 via-purple-900 to-slate-900">
            <header className="mb-12 bg-indigo-900/40 backdrop-blur-xl p-8 rounded-3xl shadow-[0_15px_40px_-15px_rgba(0,0,0,0.5)] border border-indigo-400/30">
                <h1 className="text-4xl md:text-5xl font-extrabold text-white drop-shadow-sm">{t('dashboard.title')}</h1>
                <p className="text-xl text-slate-300 mt-3 font-medium">
                    {t('dashboard.subtitle').replace('{name}', `${user?.user?.first_name || user?.first_name} ${user?.user?.last_name || user?.last_name}`)}
                </p>
            </header>

            <div className="bg-indigo-900/40 backdrop-blur-xl rounded-[2.5rem] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)] border-t border-l border-indigo-400/30 overflow-hidden p-10">
                {application ? (
                    <div>
                        <h3 className="text-2xl font-bold text-white drop-shadow-sm mb-6">{t('dashboard.status_title')}</h3>
                        <div className={`border-l-8 p-6 rounded-2xl mb-8 ${
                            application.status === 'rejected' ? 'bg-rose-500/20 border-rose-500 text-rose-300' :
                            application.status === 'next_stage' ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300' :
                            application.status === 'reviewing' ? 'bg-purple-500/20 border-purple-500 text-purple-300' :
                            'bg-blue-500/20 border-blue-500 text-blue-300'
                        }`}>
                            <p className="text-xl font-bold">
                                {t(`dashboard.status_msg_${application.status || 'submitted'}`)}
                            </p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="bg-indigo-950/40 p-6 rounded-2xl border border-indigo-500/30">
                                <p className="text-sm font-bold text-slate-400 mb-1">{t('dashboard.position')}</p>
                                <p className="text-xl font-black text-white">{application.job}</p>
                            </div>
                            <div className="bg-indigo-950/40 p-6 rounded-2xl border border-indigo-500/30">
                                <p className="text-sm font-bold text-slate-400 mb-1">{t('dashboard.school')}</p>
                                <p className="text-xl font-black text-white">{application.school}</p>
                            </div>
                            <div className="bg-indigo-950/40 p-6 rounded-2xl border border-indigo-500/30">
                                <p className="text-sm font-bold text-slate-400 mb-1">{t('dashboard.department')}</p>
                                <p className="text-xl font-black text-white">{application.department}</p>
                            </div>
                            <div className="bg-indigo-950/40 p-6 rounded-2xl border border-indigo-500/30 relative overflow-hidden group">
                                <p className="text-sm font-bold text-slate-400 mb-1">{t('dashboard.salary_encrypted')}</p>
                                <p className="text-xl font-black text-white blur-[10px] group-hover:blur-none transition-all duration-300">
                                    $ {application.salary}
                                </p>
                                <span className="absolute top-4 right-4 bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-bold px-2 py-1 rounded">AES 128</span>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div>
                        <h3 className="text-2xl font-bold text-white drop-shadow-sm mb-6">{t('dashboard.new_application')}</h3>
                        <div className="mb-8 p-6 bg-blue-500/20 border-l-8 border-blue-400 rounded-2xl shadow-sm">
                            <p className="text-lg text-blue-200 font-bold">{t('dashboard.security_notice')}</p>
                        </div>

                        {error && (
                            <div className="bg-red-500/20 border-l-8 border-red-500 p-5 mb-6 rounded-xl">
                                <p className="text-lg font-medium text-red-300">{error}</p>
                            </div>
                        )}
                        {success && (
                            <div className="bg-emerald-500/20 border-l-8 border-emerald-500 p-5 mb-6 rounded-xl">
                                <p className="text-lg font-medium text-emerald-300">{success}</p>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-lg font-bold text-slate-200 mb-2">{t('dashboard.form_position')}</label>
                                    <input required type="text" name="job" value={formData.job} onChange={handleChange} className="w-full px-5 py-4 rounded-2xl border-2 border-indigo-500/30 focus:ring-4 focus:ring-purple-500/50 focus:border-purple-500 outline-none font-medium bg-indigo-950/40 focus:bg-indigo-900/40 text-white placeholder-slate-400 transition-all" placeholder="Frontend Developer" />
                                </div>
                                <div>
                                    <label className="block text-lg font-bold text-slate-200 mb-2">{t('dashboard.form_salary')}</label>
                                    <input required type="text" name="salary" value={formData.salary} onChange={handleChange} className="w-full px-5 py-4 rounded-2xl border-2 border-indigo-500/30 focus:ring-4 focus:ring-purple-500/50 focus:border-purple-500 outline-none font-medium bg-indigo-950/40 focus:bg-indigo-900/40 text-white placeholder-slate-400 transition-all" placeholder="50000" />
                                </div>
                                <div>
                                    <label className="block text-lg font-bold text-slate-200 mb-2">{t('dashboard.form_school')}</label>
                                    <input required type="text" name="school" value={formData.school} onChange={handleChange} className="w-full px-5 py-4 rounded-2xl border-2 border-indigo-500/30 focus:ring-4 focus:ring-purple-500/50 focus:border-purple-500 outline-none font-medium bg-indigo-950/40 focus:bg-indigo-900/40 text-white placeholder-slate-400 transition-all" placeholder="MIT" />
                                </div>
                                <div>
                                    <label className="block text-lg font-bold text-slate-200 mb-2">{t('dashboard.form_department')}</label>
                                    <input required type="text" name="department" value={formData.department} onChange={handleChange} className="w-full px-5 py-4 rounded-2xl border-2 border-indigo-500/30 focus:ring-4 focus:ring-purple-500/50 focus:border-purple-500 outline-none font-medium bg-indigo-950/40 focus:bg-indigo-900/40 text-white placeholder-slate-400 transition-all" placeholder="Computer Science" />
                                </div>
                            </div>
                            <button type="submit" disabled={submitLoading} className="mt-8 w-full bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-bold text-xl py-5 rounded-2xl hover:-translate-y-1 shadow-[0_10px_20px_rgba(168,85,247,0.4)] hover:shadow-[0_15px_30px_rgba(168,85,247,0.6)] transition-all disabled:opacity-50 disabled:hover:-translate-y-0 disabled:hover:shadow-none">
                                {submitLoading ? t('dashboard.submit_loading') : t('dashboard.submit_button')}
                            </button>
                        </form>
                    </div>
                )}
            </div>

        </div>
    );
};

export default Dashboard;
