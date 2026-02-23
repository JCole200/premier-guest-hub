import React, { useState } from 'react';
import { Search, Calendar, PlusCircle, LayoutDashboard } from 'lucide-react';
import { useAppContext } from './AppContext';
import Dashboard from './components/Dashboard';
import GuestFormModal from './components/GuestFormModal';

function App() {
  const { searchQuery, setSearchQuery, currentUser, setCurrentUser } = useAppContext();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isModalOpen, setIsModalOpen] = useState(false);

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
        </nav>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', borderTop: '1px solid #e5e7eb', paddingTop: '1.5rem' }}>
          <button onClick={() => setIsModalOpen(true)} className="btn btn-primary" style={{ width: '100%', marginBottom: '1rem' }}>
            <PlusCircle size={18} />
            New Request
          </button>

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
              <option value="Admin User">Admin User</option>
            </select>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="main-content">
        <header className="top-bar">
          <div>
            <h2 style={{ fontSize: '1.8rem', fontWeight: '600', color: 'var(--color-primary-dark)' }}>
              {activeTab === 'dashboard' ? 'Overview' : 'Master Calendar'}
            </h2>
            <p style={{ color: 'var(--color-text-muted)' }}>Manage and coordinate guest appearances across Premier Media.</p>
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

        <Dashboard activeTab={activeTab} />
      </main>

      {/* Intake Form Modal */}
      {isModalOpen && <GuestFormModal onClose={() => setIsModalOpen(false)} />}
    </div>
  );
}

export default App;
