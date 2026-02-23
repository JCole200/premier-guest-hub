import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useAppContext } from '../AppContext';

export default function GuestFormModal({ onClose }) {
    const { addGuest } = useAppContext();
    const [formData, setFormData] = useState({
        name: '',
        team: 'Radio',
        room: 'Radio Studio 1',
        slot: '',
        status: 'Pending',
        crossPollination: null,
        notes: '',
        eventDate: new Date().toISOString().split('T')[0],
    });

    const [showCrossPol, setShowCrossPol] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (formData.status === 'Confirmed' && formData.crossPollination === null) {
            setShowCrossPol(true);
            return; // Wait for cross pollination answer
        }
        addGuest(formData);
        onClose();
    };

    const submitFinal = (e) => {
        e.preventDefault();
        addGuest(formData);
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
                        <label className="label">Requesting Team</label>
                        <select
                            className="input-field"
                            value={formData.team}
                            onChange={(e) => setFormData({ ...formData, team: e.target.value })}
                        >
                            <option value="Radio">Radio</option>
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
                            <option value="Radio Studio 1">Radio Studio 1</option>
                            <option value="Radio Studio 2">Radio Studio 2</option>
                            <option value="Radio Studio 3">Radio Studio 3</option>
                            <option value="Podcast Studio">Podcast Studio</option>
                            <option value="PCR Radio Room">PCR Radio Room</option>
                            <option value="Praise Radio Room">Praise Radio Room</option>
                            <option value="Gospel Room">Gospel Room</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label className="label">Event Date</label>
                        <input
                            type="date"
                            className="input-field"
                            value={formData.eventDate.split('T')[0]}
                            onChange={(e) => setFormData({ ...formData, eventDate: new Date(e.target.value).toISOString() })}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="label">Proposed Slot</label>
                        <input
                            type="text"
                            className="input-field"
                            placeholder='e.g. "15 min slot on Inspirational Breakfast"'
                            value={formData.slot}
                            onChange={(e) => setFormData({ ...formData, slot: e.target.value })}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="label">Status</label>
                        <select
                            className="input-field"
                            value={formData.status}
                            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
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
