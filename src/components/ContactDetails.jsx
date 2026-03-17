import React, { useState, useMemo } from 'react';
import { Search, Download, Users, ArrowUpAZ, ArrowDownZA, Clock } from 'lucide-react';
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
        const headers = ['Name', 'Email', 'Phone', 'Team', 'Event Date', 'Status'];
        const rows = filteredAndSortedGuests.map(g => [
            `"${g.name || ''}"`,
            `"${g.email || ''}"`,
            `"${g.phone || ''}"`,
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
                            <th>Email Address</th>
                            <th>Phone Number</th>
                            <th>Event Date</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredAndSortedGuests.length === 0 ? (
                            <tr>
                                <td colSpan={5} style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-muted)' }}>
                                    <Users size={40} style={{ margin: '0 auto 1rem', opacity: 0.2 }} />
                                    No contacts found matching your criteria.
                                </td>
                            </tr>
                        ) : (
                            filteredAndSortedGuests.map(guest => (
                                <tr key={guest.id}>
                                    <td style={{ fontWeight: '600' }}>{guest.name}</td>
                                    <td>
                                        {guest.email ? (
                                            <a href={`mailto:${guest.email}`} style={{ color: 'var(--color-primary)', textDecoration: 'none' }}>
                                                {guest.email}
                                            </a>
                                        ) : (
                                            <span style={{ color: 'var(--color-text-muted)' }}>-</span>
                                        )}
                                    </td>
                                    <td>{guest.phone || <span style={{ color: 'var(--color-text-muted)' }}>-</span>}</td>
                                    <td>
                                        {guest.isTBC ? (
                                            <span style={{ color: '#f59e0b', fontWeight: '600' }}>Date TBC</span>
                                        ) : guest.eventDate ? (
                                            format(parseISO(guest.eventDate), 'do MMM yyyy, HH:mm')
                                        ) : (
                                            <span style={{ color: 'var(--color-text-muted)' }}>Unknown</span>
                                        )}
                                    </td>
                                    <td>
                                        <span className={`status-badge status-${guest.status.toLowerCase()}`}>
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
