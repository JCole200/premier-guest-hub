import React, { createContext, useContext, useState, useEffect } from 'react';

const AppContext = createContext();

const initialGuests = [
  { id: 1, name: 'John Peterson', team: 'Radio', slot: '15 min slot on Inspirational Breakfast', status: 'Pending', crossPollination: null, notes: '', createdBy: 'Sarah Connor', timestamp: new Date().toISOString(), eventDate: new Date().toISOString() },
  { id: 2, name: 'Jane Smith', team: 'Digital', slot: 'Social Media IG Live 10min', status: 'Confirmed', crossPollination: true, notes: 'Available till 2pm for Quick Fire questions', createdBy: 'Mike Tyson', timestamp: new Date(Date.now() - 86400000).toISOString(), eventDate: new Date(Date.now() + 86400000).toISOString() },
  { id: 3, name: 'Pastor David', team: 'Magazine', slot: 'Full Interview Feature', status: 'Confirmed', crossPollination: false, notes: '', createdBy: 'Alice Wonderland', timestamp: new Date(Date.now() - 172800000).toISOString(), eventDate: new Date(Date.now() + 172800000 * 2).toISOString() },
];

export const AppProvider = ({ children }) => {
  const [guests, setGuests] = useState(() => {
    const saved = localStorage.getItem('premierGuests');
    return saved ? JSON.parse(saved) : initialGuests;
  });

  const [isAdmin, setIsAdmin] = useState(() => {
    return localStorage.getItem('isAdmin') === 'true';
  });
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return localStorage.getItem('isLoggedIn') === 'true';
  });
  const [currentUser, setCurrentUser] = useState(() => {
    return localStorage.getItem('isLoggedIn') === 'true' ? 'Admin User' : '';
  });
  const [searchQuery, setSearchQuery] = useState('');

  const login = (password) => {
    // Basic password for demo - in reality this would be more secure
    if (password === 'admin123') {
      setIsAdmin(true);
      setIsLoggedIn(true);
      setCurrentUser('Admin User');
      localStorage.setItem('isAdmin', 'true');
      localStorage.setItem('isLoggedIn', 'true');
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsAdmin(false);
    setIsLoggedIn(false);
    setCurrentUser('');
    localStorage.removeItem('isAdmin');
    localStorage.removeItem('isLoggedIn');
  };

  // Simulate real-time sync via localStorage polling (syncs across tabs)
  useEffect(() => {
    const handleStorage = () => {
      const saved = localStorage.getItem('premierGuests');
      if (saved) setGuests(JSON.parse(saved));
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  useEffect(() => {
    localStorage.setItem('premierGuests', JSON.stringify(guests));
  }, [guests]);

  const addGuest = (guest) => {
    const bookerName = guest.submittedBy || 'Staff Member';
    const newGuest = {
      ...guest,
      id: Date.now(),
      timestamp: new Date().toISOString(),
      createdBy: bookerName
    };
    delete newGuest.submittedBy;
    setGuests(prev => [newGuest, ...prev]);
  };

  const updateGuestStatus = (id, status, extraData = {}) => {
    setGuests(prev => prev.map(g => g.id === id ? { ...g, status, ...extraData } : g));
  };

  const updateGuest = (updatedGuest) => {
    setGuests(prev => prev.map(g => g.id === updatedGuest.id ? { ...g, ...updatedGuest } : g));
  };

  const deleteGuest = (id) => {
    setGuests(prev => prev.filter(g => g.id !== id));
  };

  return (
    <AppContext.Provider value={{
      guests, addGuest, updateGuestStatus, updateGuest, deleteGuest,
      currentUser, setCurrentUser, isAdmin, isLoggedIn, login, logout,
      searchQuery, setSearchQuery
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);
