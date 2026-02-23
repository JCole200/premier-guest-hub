import React, { useState } from 'react';
import { Search, Calendar, PlusCircle, LayoutDashboard, Shield, LogOut, LogIn, Settings } from 'lucide-react';
import { useAppContext } from './AppContext';
import Dashboard from './components/Dashboard';
import GuestFormModal from './components/GuestFormModal';
import Login from './components/Login';
import AdminPortal from './components/AdminPortal';
import { Pencil, X } from 'lucide-react';
import { format, parseISO } from 'date-fns';

function App() {
  const {
    searchQuery, setSearchQuery,
    currentUser, setCurrentUser,
    isAdmin, isLoggedIn, logout,
    updateGuest
  } = useAppContext();

  const [activeTab, setActiveTab] = useState('dashboard');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [editModal, setEditModal] = useState({ isOpen: false, guest: null });
  const [editData, setEditData] = useState({});

  const handleEditGuest = (guest) => {
    setEditData({ ...guest });
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
    setActiveTab('dashboard');
  };

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

          {isLoggedIn && (
            <button
              className={`nav-link w-full text-left ${activeTab === 'admin' ? 'active' : ''}`}
              onClick={() => setActiveTab('admin')}
              style={{ width: '100%', background: activeTab === 'admin' ? '' : 'transparent', border: 'none', cursor: 'pointer', marginTop: '1rem', color: 'var(--color-primary)' }}
            >
              <Shield size={20} />
              Admin Management
            </button>
          )}
        </nav>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', borderTop: '1px solid #e5e7eb', paddingTop: '1.5rem' }}>
          <button onClick={() => setIsModalOpen(true)} className="btn btn-primary" style={{ width: '100%', marginBottom: '1rem' }}>
            <PlusCircle size={18} />
            New Request
          </button>

          {!isLoggedIn ? (
            <button
              onClick={() => setIsLoginOpen(true)}
              className="btn btn-outline"
              style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
            >
              <LogIn size={18} />
              Admin Login
            </button>
          ) : (
            <div className="user-info" style={{ marginBottom: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', background: 'var(--color-bg-light)', borderRadius: '12px' }}>
                <div className="avatar" style={{ width: '32px', height: '32px', minWidth: '32px', fontSize: '0.8rem' }}>
                  AU
                </div>
                <div style={{ overflow: 'hidden' }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: '700', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{currentUser}</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>Administrator</div>
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
          )}

          {!isLoggedIn && (
            <div className="user-selector">
              <div className="avatar">
                {currentUser.split(' ').map(n => n[0]).join('')}
              </div>
              <select
                value={currentUser}
                onChange={(e) => setCurrentUser(e.target.value)}
                className="input-field"
                style={{ padding: '0.4rem', fontSize: '0.85rem' }}
              >
                <option value="Sarah Connor">Sarah Connor (Radio)</option>
                <option value="Mike Tyson">Mike Tyson (Digital)</option>
                <option value="Alice Wonderland">Alice Wonderland (Mag)</option>
              </select>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="main-content">
        <header className="top-bar">
          <div>
            <h2 style={{ fontSize: '1.8rem', fontWeight: '600', color: 'var(--color-primary-dark)' }}>
              {activeTab === 'dashboard' ? 'Overview' : activeTab === 'calendar' ? 'Master Calendar' : 'Admin Portal'}
            </h2>
            <p style={{ color: 'var(--color-text-muted)' }}>
              {activeTab === 'admin'
                ? 'System-wide guest booking management and overrides.'
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

        {activeTab === 'admin' ? (
          <AdminPortal onEditGuest={handleEditGuest} />
        ) : (
          <Dashboard activeTab={activeTab} />
        )}
      </main>

      {/* Intake Form Modal */}
      {isModalOpen && <GuestFormModal onClose={() => setIsModalOpen(false)} />}

      {/* Login Modal */}
      {isLoginOpen && (
        <Login
          onLoginSuccess={() => {
            setIsLoginOpen(false);
            setActiveTab('admin');
          }}
          onClose={() => setIsLoginOpen(false)}
        />
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
                  value={editData.isTBC ? '' : (editData.eventDate ? editData.eventDate.split('T')[0] : '')}
                  onChange={(e) => setEditData({ ...editData, eventDate: new Date(e.target.value + 'T12:00:00').toISOString(), isTBC: false })}
                  disabled={!!editData.isTBC}
                  required={!editData.isTBC}
                  style={{ opacity: editData.isTBC ? 0.5 : 1 }}
                />
              </div>

              <div className="form-group">
                <label className="label">Proposed Slot</label>
                <input
                  type="text"
                  className="input-field"
                  value={editData.slot || ''}
                  onChange={(e) => setEditData({ ...editData, slot: e.target.value })}
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
