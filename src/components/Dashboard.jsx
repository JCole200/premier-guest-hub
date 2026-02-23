import React, { useState } from 'react';
import { format, addDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth, isSameDay, isSameMonth, addWeeks, subWeeks, addMonths, subMonths, parseISO, setMonth, setYear, getMonth, getYear } from 'date-fns';
import { Check, X, Clock, Video, Radio as RadioIcon, BookOpen, SearchX, ChevronLeft, ChevronRight, Pencil, CalendarDays, User, MapPin, Sparkles } from 'lucide-react';
import { useAppContext } from '../AppContext';

export default function Dashboard({ activeTab }) {
    const { guests, searchQuery, updateGuestStatus, updateGuest } = useAppContext();
    const [crossPolModal, setCrossPolModal] = useState({ isOpen: false, guestId: null });
    const [crossPolData, setCrossPolData] = useState({ crossPollination: null, notes: '' });
    const [viewMode, setViewMode] = useState('week');
    const [currentDate, setCurrentDate] = useState(new Date());
    const [editModal, setEditModal] = useState({ isOpen: false, guest: null });
    const [editData, setEditData] = useState({});
    const [selectedGuest, setSelectedGuest] = useState(null);

    // Filtering guests safely matching multiple strings
    const filteredGuests = guests.filter(g => {
        if (!searchQuery) return true;
        const lowerQuery = searchQuery.toLowerCase();
        return g.name.toLowerCase().includes(lowerQuery) ||
            g.team.toLowerCase().includes(lowerQuery) ||
            g.status.toLowerCase().includes(lowerQuery);
    });

    const getDepartmentBadge = (dept) => {
        switch (dept) {
            case 'Radio': return <span className="badge badge-radio">Radio</span>;
            case 'Digital': return <span className="badge badge-digital">Digital</span>;
            case 'Magazine': return <span className="badge badge-magazine">Magazine</span>;
            default: return null;
        }
    };

    const getDepartmentIcon = (dept) => {
        switch (dept) {
            case 'Radio': return <RadioIcon size={16} />;
            case 'Digital': return <Video size={16} />;
            case 'Magazine': return <BookOpen size={16} />;
            default: return null;
        }
    };

    const pendingGuests = filteredGuests.filter(g => g.status === 'Pending');
    const confirmedGuests = filteredGuests.filter(g => g.status === 'Confirmed');

    const handleConfirmClick = (id) => {
        setCrossPolModal({ isOpen: true, guestId: id });
    };

    const handleConfirmFinal = (e) => {
        e.preventDefault();
        updateGuestStatus(crossPolModal.guestId, 'Confirmed', crossPolData);
        setCrossPolModal({ isOpen: false, guestId: null });
        setCrossPolData({ crossPollination: null, notes: '' });
    };

    const openEditModal = (guest) => {
        setEditData({ ...guest });
        setEditModal({ isOpen: true, guest });
    };

    const handleEditSave = (e) => {
        e.preventDefault();
        updateGuest(editData);
        setEditModal({ isOpen: false, guest: null });
    };

    const getCalendarDays = () => {
        if (viewMode === 'week') {
            const startDate = startOfWeek(currentDate, { weekStartsOn: 1 });
            return Array.from({ length: 7 }).map((_, i) => addDays(startDate, i));
        } else {
            const monthStart = startOfMonth(currentDate);
            const monthEnd = endOfMonth(monthStart);
            const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
            const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

            const days = [];
            let day = startDate;
            while (day <= endDate) {
                days.push(day);
                day = addDays(day, 1);
            }
            return days;
        }
    };

    const calendarDays = getCalendarDays();

    const nextPeriod = () => {
        if (viewMode === 'week') setCurrentDate(addWeeks(currentDate, 1));
        else setCurrentDate(addMonths(currentDate, 1));
    };

    const prevPeriod = () => {
        if (viewMode === 'week') setCurrentDate(subWeeks(currentDate, 1));
        else setCurrentDate(subMonths(currentDate, 1));
    };

    const goToToday = () => setCurrentDate(new Date());

    if (activeTab === 'calendar') {
        return (
            <div className="animate-fade-in">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                    <h3 style={{ color: 'var(--color-primary-dark)', fontSize: '1.2rem', fontWeight: '600' }}>Master Schedule (Confirmed Guests)</h3>

                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                        <div style={{ display: 'flex', background: 'white', border: '1px solid #e5e7eb', borderRadius: '8px', overflow: 'hidden' }}>
                            <button
                                className={`btn ${viewMode === 'week' ? 'active' : ''}`}
                                style={{ borderRadius: 0, border: 'none', background: viewMode === 'week' ? 'var(--color-bg-light)' : 'transparent', borderRight: '1px solid #e5e7eb' }}
                                onClick={() => setViewMode('week')}
                            >
                                Week
                            </button>
                            <button
                                className={`btn ${viewMode === 'month' ? 'active' : ''}`}
                                style={{ borderRadius: 0, border: 'none', background: viewMode === 'month' ? 'var(--color-bg-light)' : 'transparent' }}
                                onClick={() => setViewMode('month')}
                            >
                                Month
                            </button>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <button onClick={prevPeriod} className="btn-outline" style={{ padding: '0.4rem', border: 'none' }}><ChevronLeft size={20} /></button>
                            <button onClick={goToToday} className="btn-outline" style={{ border: '1px solid #e5e7eb' }}>Today</button>
                            <button onClick={nextPeriod} className="btn-outline" style={{ padding: '0.4rem', border: 'none' }}><ChevronRight size={20} /></button>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            {viewMode === 'month' ? (
                                <>
                                    <select
                                        className="input-field"
                                        style={{ padding: '0.4rem', width: 'auto' }}
                                        value={getMonth(currentDate)}
                                        onChange={(e) => setCurrentDate(setMonth(currentDate, parseInt(e.target.value)))}
                                    >
                                        {Array.from({ length: 12 }).map((_, i) => (
                                            <option key={i} value={i}>{format(new Date(2024, i, 1), 'MMMM')}</option>
                                        ))}
                                    </select>
                                    <select
                                        className="input-field"
                                        style={{ padding: '0.4rem', width: 'auto' }}
                                        value={getYear(currentDate)}
                                        onChange={(e) => setCurrentDate(setYear(currentDate, parseInt(e.target.value)))}
                                    >
                                        {Array.from({ length: 7 }).map((_, i) => {
                                            const year = 2024 + i; // 2024 to 2030
                                            return <option key={year} value={year}>{year}</option>;
                                        })}
                                    </select>
                                </>
                            ) : (
                                <h4 style={{ width: '180px', textAlign: 'right', fontWeight: '600', color: 'var(--color-text-main)' }}>
                                    {`${format(startOfWeek(currentDate, { weekStartsOn: 1 }), 'MMM d')} - ${format(endOfWeek(currentDate, { weekStartsOn: 1 }), 'MMM d, yyyy')}`}
                                </h4>
                            )}
                        </div>
                    </div>
                </div>

                {filteredGuests.length === 0 && (
                    <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                        <SearchX size={48} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
                        <p>No confirmed guests match your search.</p>
                    </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '1px', marginBottom: '0', backgroundColor: 'var(--color-bg-light)', padding: '1rem 0', borderTopLeftRadius: 'var(--border-radius)', borderTopRightRadius: 'var(--border-radius)' }}>
                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => (
                        <div key={d} style={{ textAlign: 'center', fontWeight: '600', color: 'var(--color-text-muted)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                            {d}
                        </div>
                    ))}
                </div>

                <div className="calendar" style={{ borderTopLeftRadius: 0, borderTopRightRadius: 0 }}>
                    {calendarDays.map((date, i) => {
                        const dayGuests = confirmedGuests.filter(g => {
                            const eventD = g.eventDate ? parseISO(g.eventDate) : (g.timestamp ? parseISO(g.timestamp) : new Date());
                            return isSameDay(eventD, date);
                        });
                        const isCurrentMonth = isSameMonth(date, currentDate);

                        return (
                            <div key={i} className={`calendar-day card`} style={{
                                padding: '0.5rem',
                                border: 'none',
                                borderRadius: 0,
                                opacity: isCurrentMonth ? 1 : 0.4,
                                backgroundColor: isCurrentMonth ? 'white' : '#f9fafb'
                            }}>
                                <div className="calendar-day-header" style={{ fontWeight: isSameDay(date, new Date()) ? 'bold' : 'normal', color: isSameDay(date, new Date()) ? 'var(--color-primary)' : 'var(--color-text-muted)' }}>
                                    {format(date, viewMode === 'month' && date.getDate() === 1 ? 'MMM d' : 'd')}
                                </div>
                                <div style={{ minHeight: viewMode === 'month' ? '60px' : '120px', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                                    {dayGuests.map(g => (
                                        <div
                                            key={g.id}
                                            className="calendar-event"
                                            style={{
                                                backgroundColor: g.team === 'Radio' ? 'var(--color-dept-radio-bg)' :
                                                    g.team === 'Digital' ? 'var(--color-dept-digital-bg)' :
                                                        'var(--color-dept-magazine-bg)',
                                                color: g.team === 'Radio' ? '#1d4ed8' :
                                                    g.team === 'Digital' ? '#c2410c' : '#15803d',
                                                borderLeft: `3px solid ${g.team === 'Radio' ? '#3b82f6' : g.team === 'Digital' ? '#f97316' : '#22c55e'}`,
                                                cursor: 'pointer',
                                            }}
                                            title={`${g.slot} - Request by ${g.createdBy}`}
                                            onClick={() => setSelectedGuest(g)}
                                        >
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                                <strong style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{g.name}</strong>
                                                {viewMode === 'week' && getDepartmentIcon(g.team)}
                                            </div>
                                            {viewMode === 'week' && <span style={{ fontSize: '0.65rem', opacity: 0.8, display: 'block', marginTop: '2px' }}>{g.slot}</span>}

                                            {viewMode === 'week' && g.crossPollination && (
                                                <div style={{ marginTop: '0.25rem', fontSize: '0.65rem', backgroundColor: 'rgba(255,255,255,0.7)', padding: '2px 4px', borderRadius: '2px' }}>
                                                    💡 {g.notes}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Guest Detail Modal */}
                {selectedGuest && (
                    <div className="modal-overlay" onClick={() => setSelectedGuest(null)}>
                        <div
                            className="modal-content animate-fade-in"
                            onClick={(e) => e.stopPropagation()}
                            style={{
                                borderTop: `5px solid ${selectedGuest.team === 'Radio' ? '#3b82f6' :
                                    selectedGuest.team === 'Digital' ? '#f97316' : '#22c55e'
                                    }`,
                                maxWidth: '520px',
                            }}
                        >
                            {/* Header */}
                            <div className="modal-header">
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <div style={{
                                        width: '44px', height: '44px', borderRadius: '50%',
                                        background: selectedGuest.team === 'Radio' ? 'var(--color-dept-radio-bg)' :
                                            selectedGuest.team === 'Digital' ? 'var(--color-dept-digital-bg)' : 'var(--color-dept-magazine-bg)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        color: selectedGuest.team === 'Radio' ? '#1d4ed8' :
                                            selectedGuest.team === 'Digital' ? '#c2410c' : '#15803d',
                                    }}>
                                        {getDepartmentIcon(selectedGuest.team)}
                                    </div>
                                    <div>
                                        <h3 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '0.1rem' }}>{selectedGuest.name}</h3>
                                        {getDepartmentBadge(selectedGuest.team)}
                                    </div>
                                </div>
                                <button onClick={() => setSelectedGuest(null)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--color-text-muted)' }}>
                                    <X size={22} />
                                </button>
                            </div>

                            {/* Detail Rows */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginTop: '1.5rem' }}>

                                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                                    <div style={{ minWidth: '32px', height: '32px', borderRadius: '8px', background: 'var(--color-bg-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <MapPin size={15} style={{ color: 'var(--color-primary)' }} />
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Slot</div>
                                        <div style={{ fontWeight: '500', marginTop: '2px' }}>{selectedGuest.slot}</div>
                                    </div>
                                </div>

                                {selectedGuest.room && (
                                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                                        <div style={{ minWidth: '32px', height: '32px', borderRadius: '8px', background: 'var(--color-bg-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem' }}>🚪</div>
                                        <div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Room Required</div>
                                            <div style={{ fontWeight: '500', marginTop: '2px' }}>{selectedGuest.room}</div>
                                        </div>
                                    </div>
                                )}

                                {selectedGuest.eventDate && (
                                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                                        <div style={{ minWidth: '32px', height: '32px', borderRadius: '8px', background: 'var(--color-bg-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <CalendarDays size={15} style={{ color: 'var(--color-primary)' }} />
                                        </div>
                                        <div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Date</div>
                                            <div style={{ fontWeight: '500', marginTop: '2px' }}>
                                                {format(parseISO(selectedGuest.eventDate), 'EEEE, d MMMM yyyy')}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                                    <div style={{ minWidth: '32px', height: '32px', borderRadius: '8px', background: 'var(--color-bg-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <User size={15} style={{ color: 'var(--color-primary)' }} />
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Submitted By</div>
                                        <div style={{ fontWeight: '500', marginTop: '2px' }}>{selectedGuest.createdBy}</div>
                                        {selectedGuest.timestamp && (
                                            <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                                                {format(parseISO(selectedGuest.timestamp), 'd MMM yyyy, HH:mm')}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {selectedGuest.crossPollination && (
                                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                                        <div style={{ minWidth: '32px', height: '32px', borderRadius: '8px', background: '#fef9c3', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <Sparkles size={15} style={{ color: '#a16207' }} />
                                        </div>
                                        <div>
                                            <div style={{ fontSize: '0.75rem', color: '#a16207', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Cross-Pollination Available</div>
                                            <div style={{ fontWeight: '500', marginTop: '2px', fontSize: '0.9rem' }}>
                                                {selectedGuest.notes || 'Additional availability confirmed — contact booker for details.'}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {selectedGuest.crossPollination === false && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.6rem 0.75rem', borderRadius: '8px', background: 'var(--color-bg-light)', color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
                                        <X size={14} /> No additional availability for other departments.
                                    </div>
                                )}
                            </div>

                            {/* Status chip */}
                            <div style={{ marginTop: '1.75rem', paddingTop: '1.25rem', borderTop: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span className="badge badge-confirmed">✓ Confirmed</span>
                                <button
                                    className="btn btn-outline"
                                    style={{ fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                                    onClick={() => { openEditModal(selectedGuest); setSelectedGuest(null); }}
                                >
                                    <Pencil size={14} /> Edit
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="animate-fade-in">
            {/* Request Feed */}
            <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ color: 'var(--color-primary-dark)', fontSize: '1.2rem', fontWeight: '600' }}>Active Pending Requests ({pendingGuests.length})</h3>
            </div>

            {pendingGuests.length === 0 && (
                <div className="card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                    <Clock size={48} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
                    <p>No pending guest requests right now. You're all caught up!</p>
                </div>
            )}

            <div className="dashboard-grid">
                {pendingGuests.map(guest => (
                    <div key={guest.id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', borderTop: '4px solid var(--color-status-pending)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div>
                                <h4 style={{ fontSize: '1.1rem', fontWeight: '600', color: 'var(--color-text-main)' }}>{guest.name}</h4>
                                <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>Chased by <strong>{guest.createdBy}</strong></p>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
                                {getDepartmentBadge(guest.team)}
                                {guest.eventDate && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.78rem', color: 'var(--color-text-muted)', backgroundColor: 'var(--color-bg-light)', padding: '0.25rem 0.6rem', borderRadius: '99px' }}>
                                        <CalendarDays size={13} />
                                        {format(parseISO(guest.eventDate), 'EEE d MMM yyyy')}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div style={{ backgroundColor: 'var(--color-bg-light)', padding: '0.75rem', borderRadius: '8px', fontSize: '0.9rem' }}>
                            <strong>Slot requested:</strong><br />
                            {guest.slot}
                        </div>

                        {guest.room && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                                <span style={{ fontSize: '1rem' }}>🚪</span>
                                <strong>Room:</strong> {guest.room}
                            </div>
                        )}

                        <div style={{ marginTop: 'auto', display: 'flex', gap: '0.5rem', paddingTop: '1rem' }}>
                            <button
                                className="btn btn-outline"
                                style={{ padding: '0.5rem 0.75rem' }}
                                onClick={() => openEditModal(guest)}
                                title="Edit request"
                            >
                                <Pencil size={15} />
                            </button>
                            <button
                                className="btn btn-success"
                                style={{ flex: 1, padding: '0.5rem' }}
                                onClick={() => handleConfirmClick(guest.id)}
                            >
                                <Check size={16} /> Confirm Booking
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Confirmation Modal logic */}
            {crossPolModal.isOpen && (
                <div className="modal-overlay">
                    <div className="modal-content animate-fade-in" style={{ borderTop: '4px solid var(--color-status-confirmed)' }}>
                        <div className="modal-header">
                            <h3>Confirm Booking</h3>
                            <button onClick={() => setCrossPolModal({ isOpen: false, guestId: null })} className="btn-outline" style={{ border: 'none', padding: '0.25rem' }}><X size={20} /></button>
                        </div>
                        <p style={{ marginBottom: '1.5rem', fontSize: '0.95rem', color: 'var(--color-text-muted)' }}>
                            Does this guest have additional availability for other departments (Cross-Pollination)?
                        </p>

                        <form onSubmit={handleConfirmFinal}>
                            <div className="form-group" style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
                                <label className="toggle-switch">
                                    <input
                                        type="radio"
                                        name="modal_crosspol"
                                        checked={crossPolData.crossPollination === true}
                                        onChange={() => setCrossPolData({ ...crossPolData, crossPollination: true })}
                                    />
                                    Yes
                                </label>
                                <label className="toggle-switch">
                                    <input
                                        type="radio"
                                        name="modal_crosspol"
                                        checked={crossPolData.crossPollination === false}
                                        onChange={() => setCrossPolData({ ...crossPolData, crossPollination: false })}
                                    />
                                    No
                                </label>
                            </div>

                            {crossPolData.crossPollination === true && (
                                <div className="form-group animate-fade-in">
                                    <label className="label">Notes on Availability (Specific times)</label>
                                    <textarea
                                        className="input-field"
                                        rows="3"
                                        placeholder="e.g. Can do a quick 10 min podcast intro..."
                                        value={crossPolData.notes}
                                        onChange={(e) => setCrossPolData({ ...crossPolData, notes: e.target.value })}
                                        autoFocus
                                    ></textarea>
                                </div>
                            )}

                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
                                <button type="button" onClick={() => setCrossPolModal({ isOpen: false, guestId: null })} className="btn btn-outline">Cancel</button>
                                <button type="submit" className="btn btn-primary" disabled={crossPolData.crossPollination === null}>
                                    Confirm & Route to Calendar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Guest Modal */}
            {editModal.isOpen && (
                <div className="modal-overlay">
                    <div className="modal-content animate-fade-in" style={{ borderTop: '4px solid var(--color-primary)', maxWidth: '560px' }}>
                        <div className="modal-header">
                            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Pencil size={18} /> Edit Request
                            </h3>
                            <button onClick={() => setEditModal({ isOpen: false, guest: null })} className="btn-outline" style={{ border: 'none', padding: '0.25rem' }}><X size={20} /></button>
                        </div>

                        <form onSubmit={handleEditSave}>
                            <div className="form-group">
                                <label className="label">Guest Name</label>
                                <input
                                    type="text"
                                    className="input-field"
                                    value={editData.name || ''}
                                    onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                                    required
                                />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div className="form-group">
                                    <label className="label">Requesting Team</label>
                                    <select
                                        className="input-field"
                                        value={editData.team || 'Radio'}
                                        onChange={(e) => setEditData({ ...editData, team: e.target.value })}
                                    >
                                        <option value="Radio">Radio</option>
                                        <option value="Digital">Digital</option>
                                        <option value="Magazine">Magazine</option>
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label className="label">Status</label>
                                    <select
                                        className="input-field"
                                        value={editData.status || 'Pending'}
                                        onChange={(e) => setEditData({ ...editData, status: e.target.value })}
                                    >
                                        <option value="Pending">Pending</option>
                                        <option value="Confirmed">Confirmed</option>
                                    </select>
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="label">Room Required</label>
                                <select
                                    className="input-field"
                                    value={editData.room || 'Video Studio'}
                                    onChange={(e) => setEditData({ ...editData, room: e.target.value })}
                                >
                                    <option value="Video Studio">Video Studio</option>
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
                                    value={editData.eventDate ? editData.eventDate.split('T')[0] : ''}
                                    onChange={(e) => setEditData({ ...editData, eventDate: new Date(e.target.value + 'T12:00:00').toISOString() })}
                                />
                            </div>

                            <div className="form-group">
                                <label className="label">Proposed Slot</label>
                                <input
                                    type="text"
                                    className="input-field"
                                    placeholder='e.g. "15 min slot on Inspirational Breakfast"'
                                    value={editData.slot || ''}
                                    onChange={(e) => setEditData({ ...editData, slot: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label className="label">Additional Availability Notes</label>
                                <textarea
                                    className="input-field"
                                    rows="2"
                                    placeholder="Any cross-pollination notes..."
                                    value={editData.notes || ''}
                                    onChange={(e) => setEditData({ ...editData, notes: e.target.value })}
                                />
                            </div>

                            <div style={{ padding: '0.75rem', borderRadius: '8px', background: 'var(--color-bg-light)', fontSize: '0.82rem', color: 'var(--color-text-muted)', marginBottom: '1rem' }}>
                                Originally submitted by <strong>{editData.createdBy}</strong>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                                <button type="button" onClick={() => setEditModal({ isOpen: false, guest: null })} className="btn btn-outline">Cancel</button>
                                <button type="submit" className="btn btn-primary">Save Changes</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Confirmed list sneak peek */}
            {searchQuery && (
                <div style={{ marginTop: '3rem' }}>
                    <h3 style={{ color: 'var(--color-primary-dark)', fontSize: '1.2rem', fontWeight: '600', marginBottom: '1rem' }}>Search Results in Master Calendar ({confirmedGuests.length})</h3>
                    <div className="dashboard-grid" style={{ opacity: 0.8 }}>
                        {confirmedGuests.map(g => (
                            <div key={g.id} className="card" style={{ borderTop: `4px solid ${g.team === 'Radio' ? 'var(--color-dept-radio)' : g.team === 'Digital' ? 'var(--color-dept-digital)' : 'var(--color-dept-magazine)'}` }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <strong>{g.name}</strong>
                                    {getDepartmentBadge(g.team)}
                                </div>
                                <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginTop: '0.5rem' }}>
                                    Confirmed: {g.slot}
                                </div>
                                {g.crossPollination && (
                                    <div style={{ marginTop: '0.5rem', fontSize: '0.8rem', backgroundColor: 'var(--color-bg-light)', padding: '0.5rem', borderRadius: '4px' }}>
                                        <strong>Avail:</strong> {g.notes}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
