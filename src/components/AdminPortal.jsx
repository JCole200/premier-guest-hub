import React, { useState } from 'react';
import { format, parseISO } from 'date-fns';
import { Trash2, Pencil, Search, Download, CheckCircle, Clock, PlusCircle, Calendar as CalendarIcon, MapPin, AlignLeft, X } from 'lucide-react';
import { useAppContext } from '../AppContext';

export default function AdminPortal({ onEditGuest }) {
    const { guests, addGuest, deleteGuest, updateGuestStatus, authorizedUsers, addAuthorizedUser, deleteAuthorizedUser } = useAppContext();
    const [activeSection, setActiveSection] = useState('Bookings'); // 'Bookings' or 'Users'
    const [filter, setFilter] = useState('All');
    const [searchTerm, setSearchTerm] = useState('');

    const [newUser, setNewUser] = useState({ email: '', password: '', is_admin: false });
    const [userError, setUserError] = useState('');

    const handleAddUser = async (e) => {
        e.preventDefault();
        setUserError('');
        try {
            await addAuthorizedUser(newUser.email, newUser.password, newUser.is_admin);
            setNewUser({ email: '', password: '', is_admin: false });
        } catch (err) {
            setUserError('Failed to add user. Email may already be authorized.');
        }
    };

    const handleDeleteUser = async (user) => {
        if (window.confirm(`Are you sure you want to remove access for ${user.email}?`)) {
            try {
                await deleteAuthorizedUser(user.id);
            } catch (err) {
                alert('Failed to delete user.');
            }
        }
    };

    const [isCustomEventOpen, setIsCustomEventOpen] = useState(false);
    const [customEventData, setCustomEventData] = useState({
        name: '',
        team: 'Internal / Admin',
        room: '',
        slot: 'Custom Event',
        notes: '',
        eventDate: new Date().toISOString()
    });

    const filteredGuests = guests.filter(g => {
        const matchesSearch = g.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            g.team.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = filter === 'All' || g.status === filter;
        return matchesSearch && matchesFilter;
    });

    const handleDelete = (id, name) => {
        if (window.confirm(`Are you sure you want to delete ${name}?`)) {
            deleteGuest(id);
        }
    };

    const handleCustomSubmit = (e) => {
        e.preventDefault();
        const newGuest = {
            ...customEventData,
            status: 'Confirmed',
            isTBC: false,
            crossPollination: null
        };
        addGuest(newGuest);
        setIsCustomEventOpen(false);
        setCustomEventData({
            name: '',
            team: 'Internal / Admin',
            room: '',
            slot: 'Custom Event',
            notes: '',
            eventDate: new Date().toISOString()
        });
    };

    const getTeamColor = (team) => {
        switch (team) {
            case 'Radio':
            case 'Premier Christian Radio':
            case 'Premier Praise':
            case 'Premier Gospel': return '#3b82f6';
            case 'Digital': return '#f97316';
            case 'Magazine': return '#22c55e';
            case 'Unbelievable': return '#7c3aed';
            default: return '#6b7280';
        }
    };

    return (
        <div className="animate-fade-in" style={{ padding: '1rem 0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--color-primary-dark)' }}>Admin Systems Control</h3>
                    <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>Manage guest bookings and system access authorization.</p>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <div style={{ display: 'flex', background: '#f3f4f6', padding: '0.25rem', borderRadius: '8px' }}>
                        <button 
                            onClick={() => setActiveSection('Bookings')}
                            style={{ 
                                padding: '0.5rem 1rem', borderRadius: '6px', fontSize: '0.85rem', fontWeight: '600',
                                border: 'none', cursor: 'pointer', transition: 'all 0.2s',
                                background: activeSection === 'Bookings' ? 'white' : 'transparent',
                                color: activeSection === 'Bookings' ? 'var(--color-primary)' : 'var(--color-text-muted)',
                                boxShadow: activeSection === 'Bookings' ? '0 2px 4px rgba(0,0,0,0.05)' : 'none'
                            }}
                        >
                            Bookings
                        </button>
                        <button 
                            onClick={() => setActiveSection('Users')}
                            style={{ 
                                padding: '0.5rem 1rem', borderRadius: '6px', fontSize: '0.85rem', fontWeight: '600',
                                border: 'none', cursor: 'pointer', transition: 'all 0.2s',
                                background: activeSection === 'Users' ? 'white' : 'transparent',
                                color: activeSection === 'Users' ? 'var(--color-primary)' : 'var(--color-text-muted)',
                                boxShadow: activeSection === 'Users' ? '0 2px 4px rgba(0,0,0,0.05)' : 'none'
                            }}
                        >
                            Authorized Users
                        </button>
                    </div>
                </div>
            </div>

            {activeSection === 'Bookings' ? (
                <>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginBottom: '1.5rem' }}>
                        <button onClick={() => setIsCustomEventOpen(true)} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <PlusCircle size={16} /> New Custom Event
                        </button>
                        <button className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Download size={16} /> Export CSV
                        </button>
                    </div>

                    <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
                        <div style={{ padding: '1.25rem', borderBottom: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
                            <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
                                <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
                                <input
                                    type="text"
                                    className="input-field"
                                    placeholder="Filter by name or team..."
                                    style={{ paddingLeft: '2.5rem' }}
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>

                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                {['All', 'Pending', 'Confirmed'].map(status => (
                                    <button
                                        key={status}
                                        onClick={() => setFilter(status)}
                                        style={{
                                            padding: '0.5rem 1rem',
                                            borderRadius: '6px',
                                            fontSize: '0.85rem',
                                            fontWeight: '600',
                                            border: '1px solid',
                                            borderColor: filter === status ? 'var(--color-primary)' : '#e5e7eb',
                                            background: filter === status ? 'var(--color-bg-light)' : 'white',
                                            color: filter === status ? 'var(--color-primary)' : 'var(--color-text-muted)',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s'
                                        }}
                                    >
                                        {status}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                <thead>
                                    <tr style={{ background: '#f9fafb', borderBottom: '1px solid #f3f4f6' }}>
                                        <th style={{ padding: '1rem 1.25rem', fontSize: '0.75rem', fontWeight: '700', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Guest & Team</th>
                                        <th style={{ padding: '1rem 1.25rem', fontSize: '0.75rem', fontWeight: '700', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Event Details</th>
                                        <th style={{ padding: '1rem 1.25rem', fontSize: '0.75rem', fontWeight: '700', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Status</th>
                                        <th style={{ padding: '1rem 1.25rem', fontSize: '0.75rem', fontWeight: '700', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Booked By</th>
                                        <th style={{ padding: '1rem 1.25rem', fontSize: '0.75rem', fontWeight: '700', color: 'var(--color-text-muted)', textTransform: 'uppercase', textAlign: 'right' }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredGuests.length === 0 ? (
                                        <tr>
                                            <td colSpan="5" style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                                                No bookings found matching your criteria.
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredGuests.map(guest => (
                                            <tr key={guest.id} style={{ borderBottom: '1px solid #f3f4f6', transition: 'background 0.2s' }}>
                                                <td style={{ padding: '1rem 1.25rem' }}>
                                                    <div style={{ fontWeight: '700', color: 'var(--color-text-main)' }}>
                                                        {guest.title ? `${guest.title} ` : ''}{guest.name}
                                                    </div>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.25rem' }}>
                                                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: getTeamColor(guest.team) }}></div>
                                                        <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{guest.team}</span>
                                                    </div>
                                                </td>
                                                <td style={{ padding: '1rem 1.25rem' }}>
                                                    <div style={{ fontSize: '0.85rem', fontWeight: '500' }}>{guest.interviewBrief || guest.slot}</div>
                                                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>
                                                        {guest.organisation ? `${guest.organisation} • ` : ''}
                                                        {guest.isTBC ? 'Date TBC' : format(parseISO(guest.eventDate), 'EEE d MMM yyyy, HH:mm')}
                                                    </div>
                                                </td>
                                                <td style={{ padding: '1rem 1.25rem' }}>
                                                    <span className={`badge ${guest.status === 'Confirmed' ? 'badge-confirmed' : 'badge-pending'}`} style={{ fontSize: '0.72rem' }}>
                                                        {guest.status === 'Confirmed' ? <CheckCircle size={10} style={{ marginRight: '4px' }} /> : <Clock size={10} style={{ marginRight: '4px' }} />}
                                                        {guest.status}
                                                    </span>
                                                </td>
                                                <td style={{ padding: '1rem 1.25rem' }}>
                                                    <div style={{ fontSize: '0.85rem' }}>{guest.createdBy}</div>
                                                    <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>{format(parseISO(guest.timestamp), 'd MMM, HH:mm')}</div>
                                                </td>
                                                <td style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>
                                                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                                                        <button
                                                            className="btn-outline"
                                                            style={{ padding: '0.4rem', border: 'none' }}
                                                            title="Edit"
                                                            onClick={() => onEditGuest(guest)}
                                                        >
                                                            <Pencil size={16} />
                                                        </button>
                                                        <button
                                                            className="btn-outline"
                                                            style={{ padding: '0.4rem', border: 'none', color: '#dc2626' }}
                                                            title="Delete"
                                                            onClick={() => handleDelete(guest.id, guest.name)}
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '2rem' }}>
                    <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
                        <div style={{ padding: '1.25rem', borderBottom: '1px solid #f3f4f6' }}>
                            <h4 style={{ fontWeight: '700', color: 'var(--color-primary-dark)' }}>Authorized Personnel</h4>
                        </div>
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                <thead>
                                    <tr style={{ background: '#f9fafb', borderBottom: '1px solid #f3f4f6' }}>
                                        <th style={{ padding: '1rem 1.25rem', fontSize: '0.75rem', fontWeight: '700', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Email Address</th>
                                        <th style={{ padding: '1rem 1.25rem', fontSize: '0.75rem', fontWeight: '700', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Role</th>
                                        <th style={{ padding: '1rem 1.25rem', fontSize: '0.75rem', fontWeight: '700', color: 'var(--color-text-muted)', textTransform: 'uppercase', textAlign: 'right' }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {authorizedUsers.map(user => (
                                        <tr key={user.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                                            <td style={{ padding: '1rem 1.25rem', fontSize: '0.9rem' }}>{user.email}</td>
                                            <td style={{ padding: '1rem 1.25rem' }}>
                                                <span className={`badge ${user.is_admin ? 'badge-unbelievable' : 'badge-radio'}`} style={{ fontSize: '0.65rem' }}>
                                                    {user.is_admin ? 'Admin' : 'Editor'}
                                                </span>
                                            </td>
                                            <td style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>
                                                <button 
                                                    onClick={() => handleDeleteUser(user)}
                                                    className="btn-outline" 
                                                    style={{ border: 'none', color: '#dc2626', padding: '0.4rem' }}
                                                    title="Remove Access"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="card" style={{ height: 'fit-content' }}>
                        <h4 style={{ fontWeight: '700', color: 'var(--color-primary-dark)', marginBottom: '1.5rem' }}>Authorize New User</h4>
                        <form onSubmit={handleAddUser} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                            <div className="form-group">
                                <label className="label">Work Email</label>
                                <input 
                                    type="email" 
                                    className="input-field" 
                                    placeholder="name@premier.org.uk"
                                    value={newUser.email}
                                    onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                                    required 
                                />
                            </div>
                            <div className="form-group">
                                <label className="label">Temporary Password</label>
                                <input 
                                    type="text" 
                                    className="input-field" 
                                    placeholder="Enter initial password"
                                    value={newUser.password}
                                    onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                                    required 
                                />
                            </div>
                            <div className="form-group">
                                <label className="label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                    <input 
                                        type="checkbox" 
                                        checked={newUser.is_admin}
                                        onChange={(e) => setNewUser({...newUser, is_admin: e.target.checked})}
                                    />
                                    Grant Admin Privileges
                                </label>
                            </div>
                            {userError && <p style={{ color: '#dc2626', fontSize: '0.8rem' }}>{userError}</p>}
                            <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Authorize Email</button>
                        </form>
                    </div>
                </div>
            )}

            {isCustomEventOpen && (
                <div className="modal-overlay" style={{ zIndex: 1100 }}>
                    <div className="modal-content animate-fade-in" style={{ borderTop: '4px solid #6b7280', maxWidth: '560px' }}>
                        <div className="modal-header">
                            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <CalendarIcon size={18} /> Add Custom Calendar Event
                            </h3>
                            <button onClick={() => setIsCustomEventOpen(false)} className="btn-outline" style={{ border: 'none', padding: '0.25rem' }}><X size={20} /></button>
                        </div>
                        <p style={{ marginBottom: '1.5rem', fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>
                            Instantly add internal meetings, holidays, or placeholders to the master calendar.
                        </p>

                        <form onSubmit={handleCustomSubmit}>
                            <div className="form-group">
                                <label className="label">Event Name</label>
                                <input
                                    type="text"
                                    className="input-field"
                                    placeholder="e.g. Staff Meeting, Bank Holiday..."
                                    value={customEventData.name}
                                    onChange={(e) => setCustomEventData({ ...customEventData, name: e.target.value })}
                                    required
                                />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div className="form-group">
                                    <label className="label">Event Date</label>
                                    <input
                                        type="date"
                                        className="input-field"
                                        value={(() => {
                                            if (!customEventData.eventDate) return '';
                                            try {
                                                const d = new Date(customEventData.eventDate);
                                                if (isNaN(d.getTime())) return '';
                                                const yyyy = d.getFullYear();
                                                const mm = String(d.getMonth() + 1).padStart(2, '0');
                                                const dd = String(d.getDate()).padStart(2, '0');
                                                return `${yyyy}-${mm}-${dd}`;
                                            } catch(e) { return ''; }
                                        })()}
                                        onChange={(e) => {
                                            let d = new Date(customEventData.eventDate || Date.now());
                                            if (isNaN(d.getTime())) d = new Date();
                                            const [yyyy, mm, dd] = e.target.value.split('-');
                                            if (yyyy && mm && dd) {
                                                d.setFullYear(parseInt(yyyy, 10));
                                                d.setMonth(parseInt(mm, 10) - 1);
                                                d.setDate(parseInt(dd, 10));
                                                setCustomEventData({ ...customEventData, eventDate: d.toISOString() });
                                            }
                                        }}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="label">Event Time</label>
                                    <input
                                        type="time"
                                        className="input-field"
                                        value={(() => {
                                            if (!customEventData.eventDate) return '12:00';
                                            try {
                                                const d = new Date(customEventData.eventDate);
                                                if (isNaN(d.getTime())) return '12:00';
                                                return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
                                            } catch(e) { return '12:00'; }
                                        })()}
                                        onChange={(e) => {
                                            let d = new Date(customEventData.eventDate || Date.now());
                                            if (isNaN(d.getTime())) d = new Date();
                                            const [hours, minutes] = e.target.value.split(':');
                                            if (hours && minutes) {
                                                d.setHours(parseInt(hours, 10));
                                                d.setMinutes(parseInt(minutes, 10));
                                                setCustomEventData({ ...customEventData, eventDate: d.toISOString() });
                                            }
                                        }}
                                        required
                                    />
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div className="form-group">
                                    <label className="label">Interview brief / Brief Description</label>
                                    <input
                                        type="text"
                                        className="input-field"
                                        placeholder="e.g. All-hands wrap up"
                                        value={customEventData.slot}
                                        onChange={(e) => setCustomEventData({ ...customEventData, slot: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="label">Location / Room (Optional)</label>
                                    <input
                                        type="text"
                                        className="input-field"
                                        placeholder="e.g. Boardroom"
                                        value={customEventData.room}
                                        onChange={(e) => setCustomEventData({ ...customEventData, room: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="label">Additional Notes</label>
                                <textarea
                                    className="input-field"
                                    rows="2"
                                    placeholder="Any other details..."
                                    value={customEventData.notes}
                                    onChange={(e) => setCustomEventData({ ...customEventData, notes: e.target.value })}
                                />
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
                                <button type="button" onClick={() => setIsCustomEventOpen(false)} className="btn btn-outline">Cancel</button>
                                <button type="submit" className="btn btn-primary">Add Event</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
