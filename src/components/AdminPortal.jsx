import React, { useState } from 'react';
import { format, parseISO } from 'date-fns';
import { Trash2, Pencil, Search, Filter, Download, MoreHorizontal, CheckCircle, Clock } from 'lucide-react';
import { useAppContext } from '../AppContext';

export default function AdminPortal({ onEditGuest }) {
    const { guests, deleteGuest, updateGuestStatus } = useAppContext();
    const [filter, setFilter] = useState('All');
    const [searchTerm, setSearchTerm] = useState('');

    const filteredGuests = guests.filter(g => {
        const matchesSearch = g.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            g.team.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = filter === 'All' || g.status === filter;
        return matchesSearch && matchesFilter;
    });

    const handleDelete = (id, name) => {
        if (window.confirm(`Are you sure you want to delete the booking for ${name}?`)) {
            deleteGuest(id);
        }
    };

    const getTeamColor = (team) => {
        switch (team) {
            case 'Radio': return '#3b82f6';
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
                    <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--color-primary-dark)' }}>System-wide Management</h3>
                    <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>Administrative control over all guest records and schedules.</p>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Download size={16} /> Export CSV
                    </button>
                </div>
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
                                            <div style={{ fontWeight: '700', color: 'var(--color-text-main)' }}>{guest.name}</div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.25rem' }}>
                                                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: getTeamColor(guest.team) }}></div>
                                                <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{guest.team}</span>
                                            </div>
                                        </td>
                                        <td style={{ padding: '1rem 1.25rem' }}>
                                            <div style={{ fontSize: '0.85rem', fontWeight: '500' }}>{guest.slot}</div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>
                                                {guest.isTBC ? 'Date TBC' : format(parseISO(guest.eventDate), 'EEE d MMM yyyy')}
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
        </div>
    );
}
