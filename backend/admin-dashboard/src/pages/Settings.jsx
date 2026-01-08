import React, { useEffect, useState } from 'react';
import api from '../api';
import { Settings, Save, Clock, Hash, ShieldAlert } from 'lucide-react';

const SettingsPage = () => {
    const [settings, setSettings] = useState({
        game_duration: '60',
        rounds_count: '3',
        strict_mode: 'false'
    });
    const [loading, setLoading] = useState(false);

    const fetchSettings = async () => {
        try {
            const response = await api.get('/admin/settings');
            setSettings(response.data);
        } catch (error) {
            console.error('Failed to fetch settings', error);
        }
    };

    const handleChange = (e) => {
        setSettings({ ...settings, [e.target.name]: e.target.value });
    };

    const saveSettings = async () => {
        setLoading(true);
        try {
            await api.post('/admin/settings', settings);
            // In a real app use toast
            alert('Settings saved successfully!');
        } catch (error) {
            alert('Failed to save settings');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSettings();
    }, []);

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
                    <div className="p-2 bg-gray-200 rounded-lg text-gray-600">
                        <Settings size={24} />
                    </div>
                    Global Game Settings
                </h1>
                <p className="text-gray-500 mt-2 ml-14">Configure default parameters for game sessions.</p>
            </div>

            <div className="card">
                <div className="space-y-6">
                    {/* Game Duration */}
                    <div className="flex flex-col sm:flex-row gap-4 sm:gap-8 pb-6 border-b border-gray-100">
                        <div className="sm:w-1/3">
                            <h3 className="font-bold text-gray-800 flex items-center gap-2">
                                <Clock size={18} className="text-purple-500" /> Game Duration
                            </h3>
                            <p className="text-sm text-gray-500 mt-1">
                                Time limit for each round in seconds.
                            </p>
                        </div>
                        <div className="sm:w-2/3">
                            <input
                                type="number"
                                name="game_duration"
                                className="input max-w-xs font-mono font-bold text-lg"
                                value={settings.game_duration}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    {/* Rounds Count */}
                    <div className="flex flex-col sm:flex-row gap-4 sm:gap-8 pb-6 border-b border-gray-100">
                        <div className="sm:w-1/3">
                            <h3 className="font-bold text-gray-800 flex items-center gap-2">
                                <Hash size={18} className="text-blue-500" /> Total Rounds
                            </h3>
                            <p className="text-sm text-gray-500 mt-1">
                                How many rounds are played per match.
                            </p>
                        </div>
                        <div className="sm:w-2/3">
                            <input
                                type="number"
                                name="rounds_count"
                                className="input max-w-xs font-mono font-bold text-lg"
                                value={settings.rounds_count}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    {/* Strict Mode */}
                    <div className="flex flex-col sm:flex-row gap-4 sm:gap-8">
                        <div className="sm:w-1/3">
                            <h3 className="font-bold text-gray-800 flex items-center gap-2">
                                <ShieldAlert size={18} className="text-red-500" /> Strict Mode
                            </h3>
                            <p className="text-sm text-gray-500 mt-1">
                                If enabled, only words existing in the dictionary are accepted.
                            </p>
                        </div>
                        <div className="sm:w-2/3">
                            <select
                                name="strict_mode"
                                className={`input max-w-xs font-bold ${settings.strict_mode === 'true' ? 'text-red-600 bg-red-50 border-red-200' : 'text-green-600 bg-green-50 border-green-200'}`}
                                value={settings.strict_mode}
                                onChange={handleChange}
                            >
                                <option value="true">Strict (Dictionary Only)</option>
                                <option value="false">Relaxed (Allow Unknowns)</option>
                            </select>
                        </div>
                    </div>

                    <div className="pt-6 mt-6 border-t border-gray-100 flex justify-end">
                        <button
                            onClick={saveSettings}
                            disabled={loading}
                            className="btn btn-primary px-8"
                        >
                            <Save size={18} /> {loading ? 'Saving...' : 'Save Configuration'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SettingsPage;
