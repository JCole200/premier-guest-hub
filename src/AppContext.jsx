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
  const [activeTab, setActiveTab] = useState('dashboard');
  const [highlightedGuestId, setHighlightedGuestId] = useState(null);
  const [authorizedUsers, setAuthorizedUsers] = useState([]);

  const login = async (email, password) => {
    const lowerEmail = email.toLowerCase();

    // Fallback for initial admins if Supabase table is not yet created/migrated
    const initialAdmins = [
      'judah.cole@premier.org.uk',
      'charmaine.noble-mclean@premier.org.uk'
    ];

    if (initialAdmins.includes(lowerEmail) && password === 'Premier2026!') {
      setIsAdmin(true);
      setIsLoggedIn(true);
      setCurrentUser(lowerEmail);
      localStorage.setItem('currentUserEmail', lowerEmail);
      localStorage.setItem('isAdmin', 'true');
      localStorage.setItem('isLoggedIn', 'true');
      return true;
    }

    // Regular Supabase check
    const { data, error } = await supabase
      .from('authorized_users')
      .select('*')
      .eq('email', lowerEmail)
      .eq('password', password)
      .single();

    if (error || !data) {
      console.error('Login failed:', error);
      return false;
    }

    setIsAdmin(data.is_admin);
    setIsLoggedIn(true);
    setCurrentUser(data.email);
    localStorage.setItem('currentUserEmail', data.email);
    localStorage.setItem('isAdmin', data.is_admin ? 'true' : 'false');
    localStorage.setItem('isLoggedIn', 'true');
    return true;
  };

  const logout = () => {
    setIsAdmin(false);
    setIsLoggedIn(false);
    setCurrentUser('');
    localStorage.removeItem('isAdmin');
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('currentUserEmail');
  };

  const mapGuestToFrontend = (guest) => {
    if (!guest) return null;
    return {
      ...guest,
      eventDate: guest.event_date || guest.eventDate,
      broadcastDate: guest.broadcast_date || guest.broadcastDate,
      isTBC: guest.is_tbc !== undefined ? guest.is_tbc : guest.isTBC,
      createdBy: guest.created_by || guest.createdBy,
      crossPollination: guest.cross_pollination !== undefined ? guest.cross_pollination : guest.crossPollination,
      socialHandle: guest.social_handle || guest.socialHandle,
    };
  };

  const mapGuestToDB = (guest) => {
    if (!guest) return null;
    const mapped = {
      ...guest,
      event_date: guest.eventDate,
      broadcast_date: guest.broadcastDate,
      is_tbc: guest.isTBC,
      created_by: guest.createdBy,
      cross_pollination: guest.crossPollination,
      social_handle: guest.socialHandle,
      // Ensure interviewBrief is mapped to slot
      slot: guest.interviewBrief || guest.slot || '',
    };
    
    // Clean up frontend-only or camelCase fields that have snake_case equivalents
    delete mapped.eventDate;
    delete mapped.broadcastDate;
    delete mapped.isTBC;
    delete mapped.createdBy;
    delete mapped.crossPollination;
    delete mapped.socialHandle;
    delete mapped.submittedBy;
    delete mapped.interviewBrief;
    
    return mapped;
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
        setGuests(data.map(mapGuestToFrontend));
      }
    };

    const fetchAuthorizedUsers = async () => {
      const { data, error } = await supabase
        .from('authorized_users')
        .select('*')
        .order('created_at', { ascending: true });
        
      if (error) {
        console.error('Error fetching authorized users:', error);
      } else if (data) {
        setAuthorizedUsers(data);
      }
    };

    fetchGuests();
    fetchAuthorizedUsers();

    const guestsChannel = supabase
      .channel('guests-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'guests' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const mappedNew = mapGuestToFrontend(payload.new);
            setGuests(prev => {
              if (prev.some(g => g.id === mappedNew.id)) return prev;
              return [mappedNew, ...prev].sort((a,b) => new Date(b.timestamp) - new Date(a.timestamp));
            });
          } else if (payload.eventType === 'UPDATE') {
            const mappedNew = mapGuestToFrontend(payload.new);
            setGuests(prev => prev.map(g => g.id === mappedNew.id ? mappedNew : g));
          } else if (payload.eventType === 'DELETE') {
            setGuests(prev => prev.filter(g => g.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    const usersChannel = supabase
      .channel('users-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'authorized_users' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setAuthorizedUsers(prev => [...prev, payload.new]);
          } else if (payload.eventType === 'DELETE') {
            setAuthorizedUsers(prev => prev.filter(u => u.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(guestsChannel);
      supabase.removeChannel(usersChannel);
    };
  }, []);

  const addAuthorizedUser = async (email, password, isAdmin = false) => {
    const { data, error } = await supabase
      .from('authorized_users')
      .insert([{ email: email.toLowerCase(), password, is_admin: isAdmin }])
      .select();
    
    if (error) {
      console.error('Error adding user:', error);
      throw error;
    }
  };

  const deleteAuthorizedUser = async (id) => {
    const { error } = await supabase
      .from('authorized_users')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  };

  const addGuest = async (guest) => {
    const bookerName = currentUser || 'Staff Member';
    
    const dbGuest = mapGuestToDB({
      ...guest,
      timestamp: new Date().toISOString(),
      createdBy: guest.submittedBy || bookerName
    });
    
    const { data, error } = await supabase.from('guests').insert([dbGuest]).select();
    if (error) {
      console.error('Error adding guest:', error);
    } else if (data) {
      const mappedResult = mapGuestToFrontend(data[0]);
      setGuests(prev => {
        if (prev.some(g => g.id === mappedResult.id)) return prev;
        return [mappedResult, ...prev];
      });
    }
  };

  const updateGuestStatus = async (id, status, extraData = {}) => {
    // Map extraData keys if they contain camelCase
    const mappedExtra = {};
    if (extraData.eventDate) mappedExtra.event_date = extraData.eventDate;
    if (extraData.crossPollination !== undefined) mappedExtra.cross_pollination = extraData.crossPollination;
    if (extraData.notes) mappedExtra.notes = extraData.notes;

    const { data, error } = await supabase
      .from('guests')
      .update({ status, ...mappedExtra })
      .eq('id', id)
      .select();
      
    if (error) {
      console.error('Error updating status:', error);
    } else if (data) {
      const mappedResult = mapGuestToFrontend(data[0]);
      setGuests(prev => prev.map(g => g.id === id ? mappedResult : g));
    }
  };

  const updateGuest = async (updatedGuest) => {
    const dbGuest = mapGuestToDB(updatedGuest);

    const { data, error } = await supabase
      .from('guests')
      .update(dbGuest)
      .eq('id', updatedGuest.id)
      .select();
      
    if (error) {
      console.error('Error updating guest:', error);
    } else if (data) {
      const mappedResult = mapGuestToFrontend(data[0]);
      setGuests(prev => prev.map(g => g.id === updatedGuest.id ? mappedResult : g));
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
      searchQuery, setSearchQuery,
      activeTab, setActiveTab,
      highlightedGuestId, setHighlightedGuestId,
      authorizedUsers, addAuthorizedUser, deleteAuthorizedUser
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);
