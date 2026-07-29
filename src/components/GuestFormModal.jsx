import React, { useState, useRef, useEffect } from 'react';
import { X, ChevronDown, Check } from 'lucide-react';
import { useAppContext } from '../AppContext';
import { EXPERTISE_OPTIONS } from '../constants';

// --- Reusable multi-select for Expertise ---
function ExpertiseMultiSelect({ selected, onChange }) {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const toggle = (option) => {
        if (selected.includes(option)) {
            onChange(selected.filter(s => s !== option));
        } else {
            onChange([...selected, option]);
        }
    };

    const displayText = selected.length === 0
        ? 'Select expertise areas...'
        : selected.length === 1
        ? selected[0]
        : `${selected[0]} +${selected.length - 1} more`;

    return (
        <div ref={ref} style={{ position: 'relative' }}>
            <button
                type="button"
                onClick={() => setOpen(o => !o)}
                className="input-field"
                style={{
                    width: '100%', textAlign: 'left', display: 'flex',
                    justifyContent: 'space-between', alignItems: 'center',
                    cursor: 'pointer', background: 'white'
                }}
            >
                <span style={{ color: selected.length === 0 ? 'var(--color-text-muted)' : 'var(--color-text-main)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {displayText}
                </span>
                <ChevronDown size={16} style={{ flexShrink: 0, marginLeft: '0.5rem', transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
            </button>

            {open && (
                <div style={{
                    position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0,
                    background: 'white', border: '1px solid #e5e7eb', borderRadius: '10px',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.12)', zIndex: 500,
                    maxHeight: '220px', overflowY: 'auto'
                }}>
                    {EXPERTISE_OPTIONS.map(option => {
                        const checked = selected.includes(option);
                        return (
                            <div
                                key={option}
                                onClick={() => toggle(option)}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: '0.75rem',
                                    padding: '0.6rem 1rem', cursor: 'pointer',
                                    background: checked ? 'var(--color-bg-light)' : 'white',
                                    transition: 'background 0.15s'
                                }}
                                onMouseEnter={e => { if (!checked) e.currentTarget.style.background = '#f9fafb'; }}
                                onMouseLeave={e => { e.currentTarget.style.background = checked ? 'var(--color-bg-light)' : 'white'; }}
                            >
                                <div style={{
                                    width: '18px', height: '18px', borderRadius: '4px', flexShrink: 0,
                                    border: checked ? '2px solid var(--color-primary)' : '2px solid #d1d5db',
                                    background: checked ? 'var(--color-primary)' : 'white',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    transition: 'all 0.15s'
                                }}>
                                    {checked && <Check size={11} color="white" strokeWidth={3} />}
                                </div>
                                <span style={{ fontSize: '0.875rem', color: 'var(--color-text-main)' }}>{option}</span>
                            </div>
                        );
                    })}
                </div>
            )}

            {selected.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem', marginTop: '0.5rem' }}>
                    {selected.map(s => (
                        <span key={s} style={{
                            display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
                            background: 'var(--color-bg-light)', border: '1px solid #e5e7eb',
                            borderRadius: '99px', padding: '0.2rem 0.6rem',
                            fontSize: '0.75rem', color: 'var(--color-primary-dark)', fontWeight: '500'
                        }}>
                            {s}
                            <button type="button" onClick={(e) => { e.stopPropagation(); toggle(s); }}
                                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', color: 'var(--color-text-muted)' }}>
                                <X size={11} />
                            </button>
                        </span>
                    ))}
                </div>
            )}
        </div>
    );
}

export default function GuestFormModal({ onClose }) {
    const { addGuest } = useAppContext();
    const [formData, setFormData] = useState({
        submittedBy: '',
        name: '',
        title: '',
        organisation: '',
        email: '',
        phone: '',
        socialHandle: '',
        website: '',
        expertise: [],
        team: 'Premier Christian Radio',
        room: 'Production 1',
        interviewBrief: '',
        status: 'Pending',
        isTBC: false,
        crossPollination: null,
        notes: '',
        eventDate: new Date().toISOString(),
        broadcastDate: new Date().toISOString(),
    });

    const [showCrossPol, setShowCrossPol] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (formData.status === 'Confirmed' && formData.isTBC) {
            alert('Confirmed guests must have a specific date. Please uncheck TBC and select a date.');
            return;
        }
        if (formData.status === 'Confirmed' && formData.crossPollination === null) {
            setShowCrossPol(true);
            return; // Wait for cross pollination answer
        }
        addGuest({ ...formData, expertise: Array.isArray(formData.expertise) ? formData.expertise.join(', ') : formData.expertise });
        onClose();
    };

    const handleStatusChange = (newStatus) => {
        if (newStatus === 'Confirmed') {
            setFormData({ ...formData, status: newStatus, isTBC: false });
        } else {
            setFormData({ ...formData, status: newStatus });
        }
    };

    const submitFinal = (e) => {
        e.preventDefault();
        addGuest({ ...formData, expertise: Array.isArray(formData.expertise) ? formData.expertise.join(', ') : formData.expertise });
        onClose();
    };

    if (showCrossPol) {
        return (
            <div className="modal-overlay">
                <div className="modal-content animate-fade-in" style={{ borderTop: '4px solid var(--color-status-confirmed)' }}>
                    <div className="modal-header">
                        <h3>Additional Availability</h3>
                        <button onClick={onClose} className="btn-outline" style={{ border: 'none', padding: '0.25rem' }}><X size={20} /></button>
                    </div>
                    <p style={{ marginBottom: '1.5rem', fontSize: '0.95rem', color: 'var(--color-text-muted)' }}>
                        Does <strong>{formData.name}</strong> have additional availability for other departments (Cross-Pollination)?
                    </p>

                    <form onSubmit={submitFinal}>
                        <div className="form-group" style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
                            <label className="toggle-switch">
                                <input
                                    type="radio"
                                    name="crosspol"
                                    checked={formData.crossPollination === true}
                                    onChange={() => setFormData({ ...formData, crossPollination: true })}
                                />
                                Yes
                            </label>
                            <label className="toggle-switch">
                                <input
                                    type="radio"
                                    name="crosspol"
                                    checked={formData.crossPollination === false}
                                    onChange={() => setFormData({ ...formData, crossPollination: false })}
                                />
                                No
                            </label>
                        </div>

                        {formData.crossPollination === true && (
                            <div className="form-group animate-fade-in">
                                <label className="label">Notes on Availability (Specific times)</label>
                                <textarea
                                    className="input-field"
                                    rows="3"
                                    placeholder="e.g. Free after 10am for a 20min digital snippet..."
                                    value={formData.notes}
                                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                    autoFocus
                                ></textarea>
                            </div>
                        )}

                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
                            <button type="button" onClick={() => setShowCrossPol(false)} className="btn btn-outline">Back</button>
                            <button type="submit" className="btn btn-primary" disabled={formData.crossPollination === null}>
                                Complete Booking
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <div className="modal-overlay">
            <div className="modal-content animate-fade-in">
                <div className="modal-header">
                    <h3>New Guest Request</h3>
                    <button onClick={onClose} className="btn-outline" style={{ border: 'none', padding: '0.25rem' }}><X size={20} /></button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="label">Your Name</label>
                        <input
                            type="text"
                            className="input-field"
                            placeholder="Your name or department"
                            value={formData.submittedBy}
                            onChange={(e) => setFormData({ ...formData, submittedBy: e.target.value })}
                            required
                        />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div className="form-group">
                            <label className="label">Guest Name</label>
                            <input
                                type="text"
                                className="input-field"
                                placeholder="e.g. Tim Keller"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label className="label">Title</label>
                            <input
                                type="text"
                                className="input-field"
                                placeholder="e.g. Rev, Dr, etc."
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="label">Organisation</label>
                        <input
                            type="text"
                            className="input-field"
                            placeholder="e.g. Redeemer Presbyterian Church"
                            value={formData.organisation}
                            onChange={(e) => setFormData({ ...formData, organisation: e.target.value })}
                        />
                    </div>

                    <div className="form-group">
                        <label className="label">Expertise <span style={{ fontWeight: 400, color: 'var(--color-text-muted)' }}>(select all that apply)</span></label>
                        <ExpertiseMultiSelect
                            selected={formData.expertise}
                            onChange={(val) => setFormData({ ...formData, expertise: val })}
                        />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div className="form-group">
                            <label className="label">Email Address</label>
                            <input
                                type="email"
                                className="input-field"
                                placeholder="guest@example.com"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label className="label">Phone Number</label>
                            <input
                                type="tel"
                                className="input-field"
                                placeholder="+44 7123 456789"
                                value={formData.phone}
                                onChange={(e) => {
                                    // Only allow digits, +, spaces, hyphens, parentheses
                                    const sanitised = e.target.value.replace(/[^0-9+\s\-().]/g, '');
                                    setFormData({ ...formData, phone: sanitised });
                                }}
                                pattern="[0-9+\s\-().]{7,20}"
                                title="Please enter a valid phone number (digits, +, spaces, hyphens only)"
                                required
                            />
                            {formData.phone && !/^[0-9+\s\-().]{7,20}$/.test(formData.phone) && (
                                <p style={{ color: '#dc2626', fontSize: '0.75rem', marginTop: '0.35rem' }}>
                                    Please enter a valid phone number (numbers only, min 7 digits)
                                </p>
                            )}
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div className="form-group">
                            <label className="label">Social Media Handle</label>
                            <input
                                type="text"
                                className="input-field"
                                placeholder="@username"
                                value={formData.socialHandle}
                                onChange={(e) => setFormData({ ...formData, socialHandle: e.target.value })}
                            />
                        </div>
                        <div className="form-group">
                            <label className="label">Website Details</label>
                            <input
                                type="url"
                                className="input-field"
                                placeholder="https://..."
                                value={formData.website}
                                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="form-group" style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #eee' }}>
                        <label className="label">Requesting Team</label>
                        <select
                            className="input-field"
                            value={formData.team}
                            onChange={(e) => setFormData({ ...formData, team: e.target.value })}
                        >
                            <option value="Premier Christian Radio">Premier Christian Radio</option>
                            <option value="Premier Praise">Premier Praise</option>
                            <option value="Premier Gospel">Premier Gospel</option>
                            <option value="Digital">Digital</option>
                            <option value="Magazine">Magazine</option>
                            <option value="Unbelievable">Unbelievable</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label className="label">Room Required</label>
                        <select
                            className="input-field"
                            value={formData.room}
                            onChange={(e) => setFormData({ ...formData, room: e.target.value })}
                        >
                            <option value="Production 1">Production 1</option>
                            <option value="Production 2">Production 2</option>
                            <option value="Production 3">Production 3</option>
                            <option value="Podcast Studio">Podcast Studio</option>
                            <option value="PCR Radio Room">PCR Radio Room</option>
                            <option value="Praise Radio Room">Praise Radio Room</option>
                            <option value="Gospel Room">Gospel Room</option>
                            <option value="Zoom">Zoom</option>
                            <option value="None">None</option>
                        </select>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div className="form-group">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                <label className="label" style={{ marginBottom: 0 }}>Event Date</label>
                                {formData.status === 'Pending' && (
                                    <label style={{ fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', color: 'var(--color-text-muted)' }}>
                                        <input
                                            type="checkbox"
                                            checked={formData.isTBC}
                                            onChange={(e) => setFormData({ ...formData, isTBC: e.target.checked })}
                                        />
                                        Date TBC
                                    </label>
                                )}
                            </div>
                            <input
                                type="date"
                                className="input-field"
                                value={formData.isTBC ? '' : (() => {
                                    if (!formData.eventDate) return '';
                                    try {
                                        const d = new Date(formData.eventDate);
                                        if (isNaN(d.getTime())) return '';
                                        const yyyy = d.getFullYear();
                                        const mm = String(d.getMonth() + 1).padStart(2, '0');
                                        const dd = String(d.getDate()).padStart(2, '0');
                                        return `${yyyy}-${mm}-${dd}`;
                                    } catch (e) { return ''; }
                                })()}
                                onChange={(e) => {
                                    let d = new Date(formData.eventDate || Date.now());
                                    if (isNaN(d.getTime())) d = new Date();
                                    const [yyyy, mm, dd] = e.target.value.split('-');
                                    if (yyyy && mm && dd) {
                                        d.setFullYear(parseInt(yyyy, 10));
                                        d.setMonth(parseInt(mm, 10) - 1);
                                        d.setDate(parseInt(dd, 10));
                                        setFormData({ ...formData, eventDate: d.toISOString(), isTBC: false });
                                    }
                                }}
                                disabled={formData.isTBC}
                                required={!formData.isTBC}
                                style={{ opacity: formData.isTBC ? 0.5 : 1 }}
                            />
                        </div>
                        <div className="form-group">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                <label className="label" style={{ marginBottom: 0 }}>Event Time</label>
                            </div>
                            <input
                                type="time"
                                className="input-field"
                                value={formData.isTBC ? '' : (() => {
                                    if (!formData.eventDate) return '12:00';
                                    try {
                                        const d = new Date(formData.eventDate);
                                        if (isNaN(d.getTime())) return '12:00';
                                        return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
                                    } catch (e) { return '12:00'; }
                                })()}
                                onChange={(e) => {
                                    let d = new Date(formData.eventDate || Date.now());
                                    if (isNaN(d.getTime())) d = new Date();
                                    const [hours, minutes] = e.target.value.split(':');
                                    if (hours && minutes) {
                                        d.setHours(parseInt(hours, 10));
                                        d.setMinutes(parseInt(minutes, 10));
                                        setFormData({ ...formData, eventDate: d.toISOString() });
                                    }
                                }}
                                disabled={formData.isTBC}
                                required={!formData.isTBC}
                                style={{ opacity: formData.isTBC ? 0.5 : 1 }}
                            />
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
                        <div className="form-group">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                <label className="label" style={{ marginBottom: 0 }}>Broadcast, Publication Date</label>
                            </div>
                            <input
                                type="date"
                                className="input-field"
                                value={(() => {
                                    if (!formData.broadcastDate) return '';
                                    try {
                                        const d = new Date(formData.broadcastDate);
                                        if (isNaN(d.getTime())) return '';
                                        const yyyy = d.getFullYear();
                                        const mm = String(d.getMonth() + 1).padStart(2, '0');
                                        const dd = String(d.getDate()).padStart(2, '0');
                                        return `${yyyy}-${mm}-${dd}`;
                                    } catch (e) { return ''; }
                                })()}
                                onChange={(e) => {
                                    let d = new Date(formData.broadcastDate || Date.now());
                                    if (isNaN(d.getTime())) d = new Date();
                                    const [yyyy, mm, dd] = e.target.value.split('-');
                                    if (yyyy && mm && dd) {
                                        d.setFullYear(parseInt(yyyy, 10));
                                        d.setMonth(parseInt(mm, 10) - 1);
                                        d.setDate(parseInt(dd, 10));
                                        setFormData({ ...formData, broadcastDate: d.toISOString() });
                                    }
                                }}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                <label className="label" style={{ marginBottom: 0 }}>Broadcast, Publication Time</label>
                            </div>
                            <input
                                type="time"
                                className="input-field"
                                value={(() => {
                                    if (!formData.broadcastDate) return '12:00';
                                    try {
                                        const d = new Date(formData.broadcastDate);
                                        if (isNaN(d.getTime())) return '12:00';
                                        return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
                                    } catch (e) { return '12:00'; }
                                })()}
                                onChange={(e) => {
                                    let d = new Date(formData.broadcastDate || Date.now());
                                    if (isNaN(d.getTime())) d = new Date();
                                    const [hours, minutes] = e.target.value.split(':');
                                    if (hours && minutes) {
                                        d.setHours(parseInt(hours, 10));
                                        d.setMinutes(parseInt(minutes, 10));
                                        setFormData({ ...formData, broadcastDate: d.toISOString() });
                                    }
                                }}
                                required
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="label">
                            Interview brief <span style={{ color: '#dc2626', fontWeight: '700' }}>*</span>
                        </label>
                        <input
                            type="text"
                            className="input-field"
                            placeholder='e.g. "15 min slot on Inspirational Breakfast"'
                            value={formData.interviewBrief}
                            onChange={(e) => setFormData({ ...formData, interviewBrief: e.target.value })}
                            required
                            minLength={3}
                        />
                    </div>

                    <div className="form-group">
                        <label className="label">Status</label>
                        <select
                            className="input-field"
                            value={formData.status}
                            onChange={(e) => handleStatusChange(e.target.value)}
                        >
                            <option value="Pending">Pending (Chasing)</option>
                            <option value="Confirmed">Confirmed</option>
                        </select>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
                        <button type="button" onClick={onClose} className="btn btn-outline">Cancel</button>
                        <button type="submit" className="btn btn-primary">
                            {formData.status === 'Confirmed' ? 'Continue' : 'Submit Request'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
