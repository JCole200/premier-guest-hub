import React, { useState } from 'react';
import { Search, Calendar, PlusCircle, LayoutDashboard, Shield, LogOut, LogIn, Settings, Users } from 'lucide-react';
import { useAppContext } from './AppContext';
import Dashboard from './components/Dashboard';
import GuestFormModal from './components/GuestFormModal';
import Login from './components/Login';
import AdminPortal from './components/AdminPortal';
import ContactDetails from './components/ContactDetails';
import { Pencil, X } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { EXPERTISE_OPTIONS } from './constants';

function App() {
  const {
    searchQuery, setSearchQuery,
    currentUser, setCurrentUser,
    isAdmin, isLoggedIn, logout,
    updateGuest,
    activeTab, setActiveTab
  } = useAppContext();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAdminAuthModalOpen, setIsAdminAuthModalOpen] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [adminAuthError, setAdminAuthError] = useState('');
  const [isMasterAdminAuthenticated, setIsMasterAdminAuthenticated] = useState(() => {
    return sessionStorage.getItem('isMasterAdminAuthenticated') === 'true';
  });
  const [editModal, setEditModal] = useState({ isOpen: false, guest: null });
  const [editData, setEditData] = useState({});

  const handleAdminAccess = () => {
    if (isMasterAdminAuthenticated) {
      setActiveTab('admin');
    } else {
      setIsAdminAuthModalOpen(true);
    }
  };

  const handleAdminAuthSubmit = (e) => {
    e.preventDefault();
    if (adminPassword === 'PremierMasterAdmin2026!') {
      setIsMasterAdminAuthenticated(true);
      sessionStorage.setItem('isMasterAdminAuthenticated', 'true');
      setIsAdminAuthModalOpen(false);
      setActiveTab('admin');
      setAdminPassword('');
      setAdminAuthError('');
    } else {
      setAdminAuthError('Invalid Master Admin Password.');
    }
  };

  const handleEditGuest = (guest) => {
    setEditData({ 
      ...guest,
      interviewBrief: guest.interviewBrief || guest.slot || ''
    });
    setEditModal({ isOpen: true, guest });
  };

  const handleEditSave = (e) => {
    e.preventDefault();
    if (editData.status === 'Confirmed' && editData.isTBC) {
      alert('Confirmed bookings must have a specific date. Please uncheck TBC.');
      return;
    }
    updateGuest(editData);
    setEditModal({ isOpen: false, guest: null });
  };

  const handleLogout = () => {
    logout();
    sessionStorage.removeItem('isMasterAdminAuthenticated');
    setIsMasterAdminAuthenticated(false);
    setActiveTab('dashboard');
  };

  if (!isLoggedIn) {
    return <Login />;
  }

  return (
    <div className="app-container">
      {/* Sidebar Navigation */}
      <aside className="sidebar">
        <div style={{ marginBottom: '2.5rem' }}>
          <img
            src="/premier-logo.png"
            alt="Premier"
            style={{ width: '150px', height: 'auto', display: 'block' }}
          />
          <p style={{ fontSize: '1rem', color: '#000000', marginTop: '0.4rem', fontWeight: '700', letterSpacing: '0.5px', textTransform: 'uppercase' }}>Guest Hub</p>
        </div>

        <nav style={{ flex: 1 }}>
          <button
            className={`nav-link w-full text-left ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
            style={{ width: '100%', background: activeTab === 'dashboard' ? '' : 'transparent', border: 'none', cursor: 'pointer' }}
          >
            <LayoutDashboard size={20} />
            Dashboard
          </button>
          <button
            className={`nav-link w-full text-left ${activeTab === 'calendar' ? 'active' : ''}`}
            onClick={() => setActiveTab('calendar')}
            style={{ width: '100%', background: activeTab === 'calendar' ? '' : 'transparent', border: 'none', cursor: 'pointer' }}
          >
            <Calendar size={20} />
            Master Calendar
          </button>

          <button
            className={`nav-link w-full text-left ${activeTab === 'contacts' ? 'active' : ''}`}
            onClick={() => setActiveTab('contacts')}
            style={{ width: '100%', background: activeTab === 'contacts' ? '' : 'transparent', border: 'none', cursor: 'pointer' }}
          >
            <Users size={20} />
            Contact Details
          </button>

          <button
            className={`nav-link w-full text-left ${activeTab === 'admin' ? 'active' : ''}`}
            onClick={handleAdminAccess}
            style={{ width: '100%', background: activeTab === 'admin' ? '' : 'transparent', border: 'none', cursor: 'pointer', marginTop: '1rem', color: 'var(--color-primary)' }}
          >
            <Shield size={20} />
            Admin Management
          </button>
        </nav>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', borderTop: '1px solid #e5e7eb', paddingTop: '1.5rem' }}>
          <button onClick={() => setIsModalOpen(true)} className="btn btn-primary" style={{ width: '100%', marginBottom: '1rem' }}>
            <PlusCircle size={18} />
            New Request
          </button>

          <div className="user-info" style={{ marginBottom: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', background: 'var(--color-bg-light)', borderRadius: '12px' }}>
              <div className="avatar" style={{ width: '32px', height: '32px', minWidth: '32px', fontSize: '0.8rem', background: 'var(--color-primary)', color: 'white' }}>
                {currentUser ? currentUser[0].toUpperCase() : 'U'}
              </div>
              <div style={{ overflow: 'hidden' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: '700', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{currentUser || 'Staff Member'}</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>{isAdmin ? 'Administrator' : 'Authorized User'}</div>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="btn-outline"
              style={{ width: '100%', marginTop: '0.5rem', border: 'none', fontSize: '0.85rem', color: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
            >
              <LogOut size={16} />
              Sign Out
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="main-content">
        <header className="top-bar">
          <div>
            <h2 style={{ fontSize: '1.8rem', fontWeight: '600', color: 'var(--color-primary-dark)' }}>
              {activeTab === 'dashboard' ? 'Overview' : activeTab === 'calendar' ? 'Master Calendar' : activeTab === 'contacts' ? 'Contact Details' : 'Admin Portal'}
            </h2>
            <p style={{ color: 'var(--color-text-muted)' }}>
              {activeTab === 'admin'
                ? 'System-wide guest booking management and overrides.'
                : activeTab === 'contacts'
                ? 'Guest contact directory and details.'
                : 'Manage and coordinate guest appearances across Premier Media.'}
            </p>
          </div>

          <div className="search-container">
            <Search className="search-icon" size={20} />
            <input
              type="text"
              placeholder="Search guests by name, team, or status..."
              className="input-field"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </header>

        {activeTab === 'admin' && isMasterAdminAuthenticated ? (
          <AdminPortal onEditGuest={handleEditGuest} />
        ) : activeTab === 'contacts' ? (
          <ContactDetails />
        ) : (
          <Dashboard activeTab={activeTab} />
        )}
      </main>

      {/* Intake Form Modal */}
      {isModalOpen && <GuestFormModal onClose={() => setIsModalOpen(false)} />}

      {/* Admin Secondary Password Modal */}
      {isAdminAuthModalOpen && (
        <div className="modal-overlay" style={{ zIndex: 2000 }}>
          <div className="modal-content animate-fade-in" style={{ maxWidth: '400px' }}>
            <div className="modal-header">
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Shield size={20} /> Admin Verification
              </h3>
              <button onClick={() => setIsAdminAuthModalOpen(false)} className="btn-outline" style={{ border: 'none' }}><X size={20} /></button>
            </div>
            <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', marginBottom: '1.5rem' }}>
              Please enter the Master Admin Password to continue.
            </p>
            <form onSubmit={handleAdminAuthSubmit}>
              <div className="form-group">
                <input
                  type="password"
                  className="input-field"
                  placeholder="Master Admin Password"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  autoFocus
                  required
                />
              </div>
              {adminAuthError && (
                <p style={{ color: '#dc2626', fontSize: '0.85rem', marginBottom: '1rem' }}>{adminAuthError}</p>
              )}
              <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Verify & Access Admin</button>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal (Admin Portal) */}
      {editModal.isOpen && (
        <div className="modal-overlay" style={{ zIndex: 1100 }}>
          <div className="modal-content animate-fade-in" style={{ borderTop: '4px solid var(--color-primary)', maxWidth: '560px' }}>
            <div className="modal-header">
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Pencil size={18} /> Admin: Edit Guest Record
              </h3>
              <button onClick={() => setEditModal({ isOpen: false, guest: null })} className="btn-outline" style={{ border: 'none', padding: '0.25rem' }}><X size={20} /></button>
            </div>

            <form onSubmit={handleEditSave}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
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
                <div className="form-group">
                  <label className="label">Title</label>
                  <input
                    type="text"
                    className="input-field"
                    value={editData.title || ''}
                    onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="label">Organisation</label>
                <input
                  type="text"
                  className="input-field"
                  value={editData.organisation || ''}
                  onChange={(e) => setEditData({ ...editData, organisation: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="label">Expertise</label>
                <select
                  className="input-field"
                  value={editData.expertise || EXPERTISE_OPTIONS[0]}
                  onChange={(e) => setEditData({ ...editData, expertise: e.target.value })}
                >
                  {EXPERTISE_OPTIONS.map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="label">Room</label>
                <select
                  className="input-field"
                  value={editData.room || 'Production 1'}
                  onChange={(e) => setEditData({ ...editData, room: e.target.value })}
                >
                  <option value="Production 1">Production 1</option>
                  <option value="Production 2">Production 2</option>
                  <option value="Production 3">Production 3</option>
                  <option value="Zoom">Zoom</option>
                  <option value="None">None</option>
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="label">Email Address</label>
                  <input
                    type="email"
                    className="input-field"
                    value={editData.email || ''}
                    onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="label">Phone Number</label>
                  <input
                    type="tel"
                    className="input-field"
                    value={editData.phone || ''}
                    onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="label">Social Media Handle</label>
                  <input
                    type="text"
                    className="input-field"
                    value={editData.socialHandle || ''}
                    onChange={(e) => setEditData({ ...editData, socialHandle: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="label">Website Details</label>
                  <input
                    type="url"
                    className="input-field"
                    value={editData.website || ''}
                    onChange={(e) => setEditData({ ...editData, website: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="label">Requesting Team</label>
                  <select
                    className="input-field"
                    value={editData.team || 'Premier Christian Radio'}
                    onChange={(e) => setEditData({ ...editData, team: e.target.value })}
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
                  <label className="label">Status</label>
                  <select
                    className="input-field"
                    value={editData.status || 'Pending'}
                    onChange={(e) => setEditData({ ...editData, status: e.target.value, isTBC: e.target.value === 'Confirmed' ? false : editData.isTBC })}
                  >
                    <option value="Pending">Pending</option>
                    <option value="Confirmed">Confirmed</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <label className="label" style={{ marginBottom: 0 }}>Event Date</label>
                      {editData.status === 'Pending' && (
                        <label style={{ fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', color: 'var(--color-text-muted)' }}>
                          <input
                            type="checkbox"
                            checked={!!editData.isTBC}
                            onChange={(e) => setEditData({ ...editData, isTBC: e.target.checked })}
                          />
                          Date TBC
                        </label>
                      )}
                    </div>
                    <input
                      type="date"
                      className="input-field"
                      value={editData.isTBC ? '' : (() => {
                          if (!editData.eventDate) return '';
                          try {
                              const d = new Date(editData.eventDate);
                              if (isNaN(d.getTime())) return '';
                              const yyyy = d.getFullYear();
                              const mm = String(d.getMonth() + 1).padStart(2, '0');
                              const dd = String(d.getDate()).padStart(2, '0');
                              return `${yyyy}-${mm}-${dd}`;
                          } catch(e) { return ''; }
                      })()}
                      onChange={(e) => {
                          let d = new Date(editData.eventDate || Date.now());
                          if (isNaN(d.getTime())) d = new Date();
                          const [yyyy, mm, dd] = e.target.value.split('-');
                          if (yyyy && mm && dd) {
                              d.setFullYear(parseInt(yyyy, 10));
                              d.setMonth(parseInt(mm, 10) - 1);
                              d.setDate(parseInt(dd, 10));
                              setEditData({ ...editData, eventDate: d.toISOString(), isTBC: false });
                          }
                      }}
                      disabled={!!editData.isTBC}
                      required={!editData.isTBC}
                      style={{ opacity: editData.isTBC ? 0.5 : 1 }}
                    />
                  </div>
                  <div className="form-group">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <label className="label" style={{ marginBottom: 0 }}>Event Time</label>
                    </div>
                    <input
                      type="time"
                      className="input-field"
                      value={editData.isTBC ? '' : (() => {
                          if (!editData.eventDate) return '12:00';
                          try {
                              const d = new Date(editData.eventDate);
                              if (isNaN(d.getTime())) return '12:00';
                              return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
                          } catch(e) { return '12:00'; }
                      })()}
                      onChange={(e) => {
                          let d = new Date(editData.eventDate || Date.now());
                          if (isNaN(d.getTime())) d = new Date();
                          const [hours, minutes] = e.target.value.split(':');
                          if (hours && minutes) {
                              d.setHours(parseInt(hours, 10));
                              d.setMinutes(parseInt(minutes, 10));
                              setEditData({ ...editData, eventDate: d.toISOString() });
                          }
                      }}
                      disabled={!!editData.isTBC}
                      required={!editData.isTBC}
                      style={{ opacity: editData.isTBC ? 0.5 : 1 }}
                    />
                  </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem', marginBottom: '1rem' }}>
                  <div className="form-group">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <label className="label" style={{ marginBottom: 0 }}>Broadcast, Publication Date</label>
                    </div>
                    <input
                      type="date"
                      className="input-field"
                      value={(() => {
                          if (!editData.broadcastDate) return '';
                          try {
                              const d = new Date(editData.broadcastDate);
                              if (isNaN(d.getTime())) return '';
                              const yyyy = d.getFullYear();
                              const mm = String(d.getMonth() + 1).padStart(2, '0');
                              const dd = String(d.getDate()).padStart(2, '0');
                              return `${yyyy}-${mm}-${dd}`;
                          } catch(e) { return ''; }
                      })()}
                      onChange={(e) => {
                          let d = new Date(editData.broadcastDate || Date.now());
                          if (isNaN(d.getTime())) d = new Date();
                          const [yyyy, mm, dd] = e.target.value.split('-');
                          if (yyyy && mm && dd) {
                              d.setFullYear(parseInt(yyyy, 10));
                              d.setMonth(parseInt(mm, 10) - 1);
                              d.setDate(parseInt(dd, 10));
                              setEditData({ ...editData, broadcastDate: d.toISOString() });
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
                          if (!editData.broadcastDate) return '12:00';
                          try {
                              const d = new Date(editData.broadcastDate);
                              if (isNaN(d.getTime())) return '12:00';
                              return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
                          } catch(e) { return '12:00'; }
                      })()}
                      onChange={(e) => {
                          let d = new Date(editData.broadcastDate || Date.now());
                          if (isNaN(d.getTime())) d = new Date();
                          const [hours, minutes] = e.target.value.split(':');
                          if (hours && minutes) {
                              d.setHours(parseInt(hours, 10));
                              d.setMinutes(parseInt(minutes, 10));
                              setEditData({ ...editData, broadcastDate: d.toISOString() });
                          }
                      }}
                      required
                    />
                  </div>
              </div>

              <div className="form-group">
                <label className="label">Interview brief</label>
                <input
                  type="text"
                  className="input-field"
                  value={editData.interviewBrief || editData.slot || ''}
                  onChange={(e) => setEditData({ ...editData, interviewBrief: e.target.value })}
                  required
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
                <button type="button" onClick={() => setEditModal({ isOpen: false, guest: null })} className="btn btn-outline">Cancel</button>
                <button type="submit" className="btn btn-primary">Update Guest</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
