import React, { useEffect, useState } from 'react';
import api from '../api';

const SettingsPage = () => {
    const [settings, setSettings] = useState({
        game_duration: '60',
        rounds_count: '3',
        strict_mode: 'false'
    });

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
        try {
            await api.post('/admin/settings', settings);
            alert('Settings saved!');
        } catch (error) {
            alert('Failed to save settings');
        }
    };

    useEffect(() => {
        fetchSettings();
    }, []);

    return (
        <div>
            <div className="page-header">
                <h1>Global Settings</h1>
            </div>
            <div className="card" style={{ maxWidth: '600px' }}>
                <div style={{ marginBottom: '1rem' }}>
                    <label>Default Game Duration (seconds)</label>
                    <input
                        type="number"
                        name="game_duration"
                        value={settings.game_duration}
                        onChange={handleChange}
                    />
                </div>
                <div style={{ marginBottom: '1rem' }}>
                    <label>Default Rounds Count</label>
                    <input
                        type="number"
                        name="rounds_count"
                        value={settings.rounds_count}
                        onChange={handleChange}
                    />
                </div>
                <div style={{ marginBottom: '1rem' }}>
                    <label>Strict Dictionary Mode</label>
                    <select
                        name="strict_mode"
                        value={settings.strict_mode}
                        onChange={handleChange}
                    >
                        <option value="true">Enabled</option>
                        <option value="false">Disabled</option>
                    </select>
                    <small style={{ display: 'block', marginTop: '0.5rem', color: '#6b7280' }}>
                        If enabled, only words in the dictionary will be accepted as correct answers.
                    </small>
                </div>
                <button onClick={saveSettings} className="btn btn-primary">Save Changes</button>
            </div>
        </div>
    );
};

export default SettingsPage;
