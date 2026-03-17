import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from './supabaseClient';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [guests, setGuests] = useState([]);

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

  useEffect(() => {
    const fetchGuests = async () => {
      const { data, error } = await supabase
        .from('guests')
        .select('*')
        .order('timestamp', { ascending: false });
        
      if (error) {
        console.error('Error fetching guests:', error);
      } else if (data) {
        setGuests(data);
      }
    };

    fetchGuests();

    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'guests' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setGuests(prev => {
              if (prev.some(g => g.id === payload.new.id)) return prev;
              return [payload.new, ...prev].sort((a,b) => new Date(b.timestamp) - new Date(a.timestamp));
            });
          } else if (payload.eventType === 'UPDATE') {
            setGuests(prev => prev.map(g => g.id === payload.new.id ? payload.new : g));
          } else if (payload.eventType === 'DELETE') {
            setGuests(prev => prev.filter(g => g.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const addGuest = async (guest) => {
    const bookerName = guest.submittedBy || 'Staff Member';
    const newGuest = {
      ...guest,
      timestamp: new Date().toISOString(),
      createdBy: bookerName
    };
    delete newGuest.submittedBy;
    
    const { data, error } = await supabase.from('guests').insert([newGuest]).select();
    if (error) {
      console.error('Error adding guest:', error);
    } else if (data) {
      setGuests(prev => {
        if (prev.some(g => g.id === data[0].id)) return prev;
        return [data[0], ...prev];
      });
    }
  };

  const updateGuestStatus = async (id, status, extraData = {}) => {
    const { data, error } = await supabase
      .from('guests')
      .update({ status, ...extraData })
      .eq('id', id)
      .select();
      
    if (error) {
      console.error('Error updating status:', error);
    } else if (data) {
      setGuests(prev => prev.map(g => g.id === id ? data[0] : g));
    }
  };

  const updateGuest = async (updatedGuest) => {
    const { data, error } = await supabase
      .from('guests')
      .update(updatedGuest)
      .eq('id', updatedGuest.id)
      .select();
      
    if (error) {
      console.error('Error updating guest:', error);
    } else if (data) {
      setGuests(prev => prev.map(g => g.id === updatedGuest.id ? data[0] : g));
    }
  };

  const deleteGuest = async (id) => {
    const { error } = await supabase
      .from('guests')
      .delete()
      .eq('id', id);
      
    if (error) {
      console.error('Error deleting guest:', error);
    } else {
      setGuests(prev => prev.filter(g => g.id !== id));
    }
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
