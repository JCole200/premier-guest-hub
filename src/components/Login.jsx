import React, { useState } from 'react';
import { Lock, Mail, AlertCircle } from 'lucide-react';
import { useAppContext } from '../AppContext';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAppContext();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        
        try {
            const success = await login(email, password);
            if (!success) {
                setError('Invalid email or password. Please try again.');
            }
        } catch (err) {
            setError('An error occurred during login. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'var(--color-primary-dark)',
            backgroundImage: 'radial-gradient(circle at 20% 30%, var(--color-primary-light) 0%, transparent 70%), radial-gradient(circle at 80% 70%, var(--color-primary) 0%, transparent 70%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '1rem'
        }}>
            <div className="card animate-fade-in" style={{ 
                maxWidth: '440px', 
                width: '100%', 
                padding: '3rem',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                border: 'none'
            }}>
                <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                    <img 
                        src="/premier-logo.png" 
                        alt="Premier" 
                        style={{ width: '140px', marginBottom: '1rem' }} 
                    />
                    <h1 style={{ fontSize: '1.75rem', fontWeight: '800', color: 'var(--color-primary-dark)', letterSpacing: '-0.5px' }}>Guest Hub</h1>
                    <p style={{ color: 'var(--color-text-muted)', marginTop: '0.75rem' }}>
                        Authorized Access Only
                    </p>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div className="form-group">
                        <label className="label">Email Address</label>
                        <div style={{ position: 'relative' }}>
                            <Mail size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
                            <input
                                type="email"
                                className="input-field"
                                placeholder="name@premier.org.uk"
                                style={{ paddingLeft: '2.75rem' }}
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                autoFocus
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="label">Password</label>
                        <div style={{ position: 'relative' }}>
                            <Lock size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
                            <input
                                type="password"
                                className="input-field"
                                placeholder="••••••••"
                                style={{ paddingLeft: '2.75rem' }}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    {error && (
                        <div style={{
                            display: 'flex', alignItems: 'center', gap: '0.75rem',
                            color: '#dc2626', background: '#fef2f2', padding: '1rem',
                            borderRadius: '12px', fontSize: '0.85rem', border: '1px solid #fecaca'
                        }}>
                            <AlertCircle size={20} />
                            {error}
                        </div>
                    )}

                    <button 
                        type="submit" 
                        className="btn btn-primary" 
                        style={{ width: '100%', padding: '1rem', fontSize: '1rem', fontWeight: '600' }}
                        disabled={isLoading}
                    >
                        {isLoading ? 'Authenticating...' : 'Sign In'}
                    </button>
                </form>

                <div style={{ marginTop: '2.5rem', textAlign: 'center', fontSize: '0.8rem', color: 'var(--color-text-muted)', borderTop: '1px solid #eee', paddingTop: '1.5rem' }}>
                    Access restricted to authorized Premier staff only.<br/>
                    Contact Judah Cole if you need assistance.
                </div>
            </div>
        </div>
    );
}
