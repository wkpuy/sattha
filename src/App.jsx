import React, { useState } from 'react';
import { Home as HomeIcon, Compass, Sparkles, Settings as SettingsIcon, User, Menu, Moon } from 'lucide-react';
import './index.css';
import Home from './pages/Home';
import Settings from './pages/Settings';
import Prayer from './pages/Prayer';
import Journey from './pages/Journey';
import Dream from './pages/Dream';

function App() {
  const [activeTab, setActiveTab] = useState('home');

  const getNavBtnStyle = (tabId) => ({
    ...navBtnStyle,
    color: activeTab === tabId ? 'var(--gold-primary)' : 'var(--text-secondary)',
    background: activeTab === tabId ? 'rgba(212, 175, 55, 0.15)' : 'transparent',
    padding: '8px 6px',
    borderRadius: '20px',
  });

  return (
    <div className="app-container" style={{ display: 'flex', flexDirection: 'column', height: '100dvh' }}>
      {/* Header */}
      <header className="glass-panel" style={{ 
        padding: 'max(15px, env(safe-area-inset-top)) 20px 15px 20px', 
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        borderRadius: '0', borderTop: 'none', borderLeft: 'none', borderRight: 'none',
        zIndex: 1000, background: 'rgba(255, 255, 255, 0.75)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '24px', color: 'var(--gold-primary)' }}>ส</span>
          <h1 style={{ fontSize: '20px', fontWeight: '500' }}>Sattha</h1>
        </div>
        <div style={{ display: 'flex', gap: '15px' }}>
          <button style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: 'var(--text-primary)' }}><User size={24} /></button>
          <button style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: 'var(--text-primary)' }}><Menu size={24} /></button>
        </div>
      </header>

      {/* Main Content Area */}
      {/* Main Content Area */}
      <main style={{ flex: 1, overflowY: 'auto' }}>
        <div style={{ maxWidth: '480px', margin: '0 auto', minHeight: '100%', position: 'relative', padding: '0 20px 140px 20px' }}>
          {activeTab === 'home' && <Home />}
          {activeTab === 'journey' && <Journey />}
          {activeTab === 'dream' && <Dream />}
          {activeTab === 'rituals' && <Prayer />}
          {activeTab === 'settings' && <Settings />}
        </div>
      </main>

      <nav className="glass-panel" style={{ 
        position: 'fixed', bottom: '0', left: '0', right: '0', 
        display: 'flex', justifyContent: 'space-around', 
        padding: '15px 5px', paddingBottom: 'max(25px, env(safe-area-inset-bottom))',
        borderBottomLeftRadius: '0', borderBottomRightRadius: '0',
        maxWidth: '480px', margin: '0 auto', zIndex: 1000
      }}>
        <button onClick={() => setActiveTab('home')} style={getNavBtnStyle('home')}>
          <HomeIcon size={24} />
          <span style={{ fontSize: '11px', marginTop: '4px', fontWeight: activeTab === 'home' ? 'bold' : 'normal' }}>Home</span>
        </button>
        <button onClick={() => setActiveTab('journey')} style={getNavBtnStyle('journey')}>
          <Compass size={24} />
          <span style={{ fontSize: '11px', marginTop: '4px', fontWeight: activeTab === 'journey' ? 'bold' : 'normal' }}>Journey</span>
        </button>
        <button onClick={() => setActiveTab('dream')} style={getNavBtnStyle('dream')}>
          <Moon size={24} />
          <span style={{ fontSize: '11px', marginTop: '4px', fontWeight: activeTab === 'dream' ? 'bold' : 'normal' }}>Dream</span>
        </button>
        <button onClick={() => setActiveTab('rituals')} style={getNavBtnStyle('rituals')}>
          <Sparkles size={24} />
          <span style={{ fontSize: '11px', marginTop: '4px', fontWeight: activeTab === 'rituals' ? 'bold' : 'normal' }}>Rituals</span>
        </button>
        <button onClick={() => setActiveTab('settings')} style={getNavBtnStyle('settings')}>
          <SettingsIcon size={24} />
          <span style={{ fontSize: '11px', marginTop: '4px', fontWeight: activeTab === 'settings' ? 'bold' : 'normal' }}>Settings</span>
        </button>
      </nav>
    </div>
  );
}

const navBtnStyle = {
  background: 'none', border: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer', transition: 'color 0.3s'
};

export default App;
