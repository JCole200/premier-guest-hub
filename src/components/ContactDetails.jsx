import React, { useState, useMemo } from 'react';
import { Search, Download, Users, Phone, Mail, Clock, CalendarIcon } from 'lucide-react';
import { useAppContext } from '../AppContext';
import { format, parseISO } from 'date-fns';

export default function ContactDetails() {
    const { guests } = useAppContext();
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('latest'); // latest, nameAsc, nameDesc

    const filteredAndSortedGuests = useMemo(() => {
        let result = guests;

        // Apply search
        if (searchTerm) {
            const lowerQuery = searchTerm.toLowerCase();
            result = result.filter(g => 
                (g.name && g.name.toLowerCase().includes(lowerQuery)) ||
                (g.email && g.email.toLowerCase().includes(lowerQuery)) ||
                (g.phone && g.phone.toLowerCase().includes(lowerQuery))
            );
        }

        // Apply sort
        result = [...result].sort((a, b) => {
            if (sortBy === 'nameAsc') {
                return (a.name || '').localeCompare(b.name || '');
            } else if (sortBy === 'nameDesc') {
                return (b.name || '').localeCompare(a.name || '');
            } else {
                // Latest Event Date
                const dateA = a.eventDate ? new Date(a.eventDate).getTime() : 0;
                const dateB = b.eventDate ? new Date(b.eventDate).getTime() : 0;
                return dateB - dateA;
            }
        });

        return result;
    }, [guests, searchTerm, sortBy]);

    const handleExportCSV = () => {
        const headers = ['Name', 'Title', 'Organisation', 'Expertise', 'Email', 'Phone', 'Social Handle', 'Website', 'Team', 'Event Date', 'Status'];
        const rows = filteredAndSortedGuests.map(g => [
            `"${g.name || ''}"`,
            `"${g.title || ''}"`,
            `"${g.organisation || ''}"`,
            `"${g.expertise || ''}"`,
            `"${g.email || ''}"`,
            `"${g.phone || ''}"`,
            `"${g.socialHandle || ''}"`,
            `"${g.website || ''}"`,
            `"${g.team || ''}"`,
            `"${g.eventDate ? format(parseISO(g.eventDate), 'yyyy-MM-dd HH:mm') : 'TBC'}"`,
            `"${g.status || ''}"`
        ]);

        const csvContent = [
            headers.join(','),
            ...rows.map(r => r.join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `contact_details_${format(new Date(), 'yyyy-MM-dd')}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        document.body.removeChild(link);
    };

    const getInitials = (name) => {
        if (!name) return '?';
        const parts = name.trim().split(' ');
        if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
        return name.substring(0, 2).toUpperCase();
    };

    return (
        <div className="animate-fade-in" style={{ paddingBottom: '3rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div style={{ display: 'flex', gap: '1rem', flex: 1, minWidth: '300px' }}>
                    <div className="search-container" style={{ flex: 1 }}>
                        <Search className="search-icon" size={20} />
                        <input
                            type="text"
                            placeholder="Search by name, email, or phone..."
                            className="input-field"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    
                    <select 
                        className="input-field" 
                        style={{ width: 'auto' }}
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                    >
                        <option value="latest">Sort: Latest Event</option>
                        <option value="nameAsc">Sort: Name (A-Z)</option>
                        <option value="nameDesc">Sort: Name (Z-A)</option>
                    </select>
                </div>

                <button onClick={handleExportCSV} className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Download size={18} /> Export CSV
                </button>
            </div>

            <div className="table-container">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Guest Name</th>
                            <th>Organisation & Expertise</th>
                            <th>Contact Info</th>
                            <th>Social / Web</th>
                            <th>Event Date</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredAndSortedGuests.length === 0 ? (
                            <tr>
                                <td colSpan={6} style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-muted)' }}>
                                    <Users size={40} style={{ margin: '0 auto 1rem', opacity: 0.2 }} />
                                    No contacts found matching your criteria.
                                </td>
                            </tr>
                        ) : (
                            filteredAndSortedGuests.map(guest => (
                                <tr key={guest.id}>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                            <div className="contact-avatar">
                                                {getInitials(guest.name)}
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: '600', color: 'var(--color-primary-dark)' }}>
                                                    {guest.title ? `${guest.title} ` : ''}{guest.name}
                                                </div>
                                                <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>{guest.team}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <div style={{ fontWeight: '500', fontSize: '0.9rem' }}>{guest.organisation || '-'}</div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.2rem' }}>
                                            {guest.expertise || 'No expertise listed'}
                                        </div>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                                            {guest.email && (
                                                <a href={`mailto:${guest.email}`} style={{ color: 'var(--color-primary)', textDecoration: 'none', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                                    <Mail size={12} /> {guest.email}
                                                </a>
                                            )}
                                            {guest.phone && (
                                                <div style={{ fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--color-text-main)' }}>
                                                    <Phone size={12} /> {guest.phone}
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', gap: '0.75rem' }}>
                                            {guest.socialHandle ? (
                                                <div title={guest.socialHandle} style={{ color: 'var(--color-primary)', display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.85rem' }}>
                                                    <Users size={14} /> {guest.socialHandle}
                                                </div>
                                            ) : '-'}
                                            {guest.website && (
                                                <a href={guest.website} target="_blank" rel="noopener noreferrer" title={guest.website} style={{ color: 'var(--color-secondary)' }}>
                                                    <Search size={14} />
                                                </a>
                                            )}
                                        </div>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
                                            <CalendarIcon size={14} style={{ opacity: 0.6 }} />
                                            {guest.isTBC ? (
                                                <span style={{ color: '#f59e0b', fontWeight: '600' }}>Date TBC</span>
                                            ) : guest.eventDate ? (
                                                format(parseISO(guest.eventDate), 'do MMM yyyy')
                                            ) : (
                                                'Unknown'
                                            )}
                                        </div>
                                    </td>
                                    <td>
                                        <span className={`badge badge-${guest.status.toLowerCase()}`}>
                                            {guest.status}
                                        </span>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
