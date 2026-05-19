import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import api from '../services/api';

const AdminPanel = () => {
    const [stats, setStats] = useState({ reviewedApplications: 0, unreviewedApplications: 0 });
    const [candidates, setCandidates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCandidate, setSelectedCandidate] = useState(null);
    const [secretNote, setSecretNote] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('');
    const [savingNote, setSavingNote] = useState(false);
    
    const { t } = useLanguage();

    useEffect(() => {
        const fetchAdminData = async () => {
            try {
                const statsResponse = await api.get('/hr/stats').catch(() => ({ data: { reviewedApplications: 0, unreviewedApplications: 0 } }));
                const candidatesResponse = await api.get('/hr/candidates').catch(() => ({ data: [] }));
                
                setStats(statsResponse.data);
                setCandidates(candidatesResponse.data);
            } catch (error) {
                console.error("Error loading data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchAdminData();
    }, []);

    const handleSaveNote = async (candidateId) => {
        setSavingNote(true);
        try {
            await api.post(`/hr/candidates/${candidateId}/note`, { note: secretNote, status: selectedStatus });
            setCandidates(prev => prev.map(c => 
                c.id === candidateId ? { ...c, secret_note: secretNote, status: selectedStatus } : c
            ));
            setSelectedCandidate(null);
            setSecretNote('');
            setSelectedStatus('');
            
            // Re-fetch stats to update pending reviews
            const statsResponse = await api.get('/hr/stats');
            setStats(statsResponse.data);
            
        } catch (error) {
            console.error("Error saving note:", error);
        } finally {
            setSavingNote(false);
        }
    };

    if (loading) {
        return <div className="p-20 text-center text-2xl font-bold text-slate-500 animate-pulse">{t('admin.loading') || 'Loading...'}</div>;
    }

    return (
        <div className="p-8 md:p-14 max-w-[90rem] mx-auto w-full min-h-screen bg-transparent">
            <header className="mb-12 bg-indigo-900/40 backdrop-blur-xl p-8 rounded-3xl shadow-[0_15px_40px_-15px_rgba(0,0,0,0.5)] border border-indigo-400/30 flex flex-col md:flex-row justify-between items-start md:items-center">
                <div>
                    <h1 className="text-4xl md:text-5xl font-extrabold text-white drop-shadow-sm">{t('admin.title')}</h1>
                    <p className="text-lg text-slate-300 mt-3 font-medium">
                        {t('admin.subtitle')}
                    </p>
                </div>
                <div className="mt-4 md:mt-0 bg-gradient-to-r from-cyan-500 to-emerald-500 text-white px-6 py-3 rounded-2xl shadow-[0_0_15px_rgba(16,185,129,0.5)] font-bold text-lg flex items-center gap-2">
                    <span className="w-3 h-3 bg-white rounded-full animate-pulse shadow-[0_0_10px_white]"></span>
                    {t('admin.system_status')}
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                <div className="bg-indigo-900/40 backdrop-blur-xl p-8 rounded-[2rem] shadow-[0_20px_40px_-10px_rgba(0,0,0,0.5)] border border-indigo-400/30 flex flex-col transform hover:-translate-y-2 transition-all duration-300">
                    <h3 className="text-lg font-bold text-slate-400 uppercase tracking-widest mb-4 drop-shadow-sm">{t('admin.unreviewed_applications')}</h3>
                    <p className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-br from-orange-300 to-red-400 mt-auto drop-shadow-sm">{stats.unreviewedApplications}</p>
                </div>
                <div className="bg-indigo-900/40 backdrop-blur-xl p-8 rounded-[2rem] shadow-[0_20px_40px_-10px_rgba(0,0,0,0.5)] border border-indigo-400/30 flex flex-col transform hover:-translate-y-2 transition-all duration-300">
                    <h3 className="text-lg font-bold text-slate-400 uppercase tracking-widest mb-4 drop-shadow-sm">{t('admin.reviewed_applications')}</h3>
                    <p className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-br from-cyan-300 to-emerald-400 mt-auto drop-shadow-sm">{stats.reviewedApplications}</p>
                </div>
            </div>

            <div className="bg-indigo-900/40 backdrop-blur-xl rounded-[2.5rem] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)] border border-indigo-400/30 overflow-hidden">
                <div className="px-10 py-8 border-b border-indigo-500/30 bg-indigo-950/40 flex justify-between items-center">
                    <h3 className="text-2xl font-bold text-white drop-shadow-sm">{t('admin.all_candidates')}</h3>
                    <div className="bg-purple-500/20 text-purple-200 px-4 py-2 rounded-lg font-bold text-sm border border-purple-500/30">
                        {t('admin.decryption_active')}
                    </div>
                </div>
                
                <div className="p-10">
                    {candidates.length > 0 ? (
                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                            {candidates.map((candidate) => (
                                <div key={candidate.id} className="bg-indigo-950/40 p-6 rounded-3xl shadow-inner border border-indigo-500/30 flex flex-col justify-between">
                                    <div>
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <h4 className="text-2xl font-extrabold text-white">{candidate.name}</h4>
                                                <p className="text-md font-bold text-cyan-200 bg-cyan-900/40 px-3 py-1 rounded-lg inline-block mt-2">{candidate.position}</p>
                                                <p className="text-sm font-bold text-purple-200 bg-purple-900/40 px-3 py-1 rounded-lg inline-block mt-2 ml-2">
                                                    {t(`admin.status_${candidate.status}`) || candidate.status}
                                                </p>
                                            </div>
                                            <span className="bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-bold px-3 py-1.5 rounded-lg shadow-md flex items-center gap-2">
                                                <span>AES-128</span>
                                            </span>
                                        </div>
                                        
                                        <div className="bg-indigo-950/40 p-4 rounded-2xl border border-emerald-500/30 mb-4 shadow-sm relative overflow-hidden group">
                                            <div className="absolute top-0 right-0 bg-emerald-500/20 text-emerald-300 text-xs font-bold px-2 py-1 rounded-bl-lg">{t('admin.decrypted_salary')}</div>
                                            <p className="text-sm font-bold text-slate-400 mb-1">{t('admin.salary_label')}</p>
                                            <p className="font-mono font-black text-emerald-300 text-xl">
                                                $ {candidate.decrypted_salary}
                                            </p>
                                        </div>

                                        <div className="mb-4">
                                            <p className="text-sm font-bold text-slate-400 mb-1">{t('admin.secret_note_label')}</p>
                                            <p className="text-indigo-200 font-medium bg-indigo-900/30 p-4 rounded-2xl border border-indigo-500/30 italic">
                                                {candidate.secret_note ? `"${candidate.secret_note}"` : t('admin.no_note')}
                                            </p>
                                        </div>
                                    </div>
                                    
                                    <div className="mt-4 pt-4 border-t border-indigo-500/30">
                                        {selectedCandidate === candidate.id ? (
                                            <div className="space-y-4">
                                                <div>
                                                    <label className="block text-sm font-bold text-slate-400 mb-2">{t('admin.status_label')}</label>
                                                    <select 
                                                        value={selectedStatus}
                                                        onChange={(e) => setSelectedStatus(e.target.value)}
                                                        className="w-full bg-indigo-950/40 border border-indigo-500/30 rounded-xl p-3 focus:outline-none focus:ring-4 focus:ring-purple-500/50 text-white font-medium appearance-none"
                                                    >
                                                        <option value="submitted">{t('admin.status_submitted')}</option>
                                                        <option value="reviewing">{t('admin.status_reviewing')}</option>
                                                        <option value="next_stage">{t('admin.status_next_stage')}</option>
                                                        <option value="rejected">{t('admin.status_rejected')}</option>
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-bold text-slate-400 mb-2">{t('admin.secret_note_label')}</label>
                                                    <textarea 
                                                        className="w-full bg-indigo-950/40 border border-indigo-500/30 rounded-xl p-3 focus:outline-none focus:ring-4 focus:ring-purple-500/50 text-white placeholder-slate-400 font-medium"
                                                        rows="3"
                                                        placeholder={t('admin.note_placeholder')}
                                                        value={secretNote}
                                                        onChange={(e) => setSecretNote(e.target.value)}
                                                    />
                                                </div>
                                                <div className="flex gap-2 pt-2">
                                                    <button 
                                                        onClick={() => handleSaveNote(candidate.id)}
                                                        disabled={savingNote}
                                                        className="bg-purple-600/80 text-white font-bold py-2 px-4 rounded-lg shadow-md hover:bg-purple-500 transition-colors flex-1"
                                                    >
                                                        {savingNote ? t('admin.saving_note') : t('admin.save_note')}
                                                    </button>
                                                    <button 
                                                        onClick={() => { setSelectedCandidate(null); setSecretNote(''); setSelectedStatus(''); }}
                                                        className="bg-indigo-900/40 text-slate-300 font-bold py-2 px-4 rounded-lg hover:bg-white/20 transition-colors"
                                                    >
                                                        {t('admin.cancel')}
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <button 
                                                onClick={() => { setSelectedCandidate(candidate.id); setSecretNote(candidate.secret_note || ''); setSelectedStatus(candidate.status || 'submitted'); }}
                                                className="w-full text-purple-300 font-bold py-3 border border-purple-500/30 rounded-xl hover:bg-purple-500/20 transition-colors flex justify-center items-center gap-2"
                                            >
                                                {t('admin.add_note_btn')}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-16">
                            <p className="text-xl text-slate-500 font-medium">{t('admin.no_activity')}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminPanel;
