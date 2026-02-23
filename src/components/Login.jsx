import React, { useState } from 'react';
import { Lock, User, AlertCircle, X } from 'lucide-react';
import { useAppContext } from '../AppContext';

export default function Login({ onLoginSuccess, onClose }) {
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useAppContext();

    const handleSubmit = (e) => {
        e.preventDefault();
        const success = login(password);
        if (success) {
            onLoginSuccess();
        } else {
            setError('Invalid admin password. Please try again.');
        }
    };

    return (
        <div className="modal-overlay" style={{ zIndex: 1000 }}>
            <div className="modal-content animate-fade-in" style={{ maxWidth: '400px', padding: '2.5rem' }}>
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <div style={{
                        width: '64px', height: '64px', borderRadius: '50%', background: 'var(--color-bg-light)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem',
                        color: 'var(--color-primary)'
                    }}>
                        <Lock size={32} />
                    </div>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--color-primary-dark)' }}>Admin Portal</h2>
                    <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginTop: '0.5rem' }}>
                        Enter your credentials to access admin tools.
                    </p>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    <div className="form-group">
                        <label className="label">Admin Password</label>
                        <div style={{ position: 'relative' }}>
                            <Lock size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
                            <input
                                type="password"
                                className="input-field"
                                placeholder="Enter admin password"
                                style={{ paddingLeft: '2.5rem' }}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                autoFocus
                                required
                            />
                        </div>
                    </div>

                    {error && (
                        <div style={{
                            display: 'flex', alignItems: 'center', gap: '0.5rem',
                            color: '#dc2626', background: '#fef2f2', padding: '0.75rem',
                            borderRadius: '8px', fontSize: '0.85rem', border: '1px solid #fecaca'
                        }}>
                            <AlertCircle size={16} />
                            {error}
                        </div>
                    )}

                    <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.8rem', marginTop: '0.5rem' }}>
                        Unlock Admin Access
                    </button>

                    <button
                        type="button"
                        onClick={onClose}
                        className="btn btn-outline"
                        style={{ width: '100%', padding: '0.8rem' }}
                    >
                        Cancel
                    </button>
                </form>

                <div style={{ marginTop: '2rem', textAlign: 'center', fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                    Tip: Password for demo is <strong>admin123</strong>
                </div>
            </div>
        </div>
    );
}
