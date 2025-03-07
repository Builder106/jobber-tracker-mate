import React, { useEffect, useState } from 'react';
import '../shared/theme.css';
import './options.css';

interface SettingsState {
  apiUrl: string;
  enabledSites: {
    linkedin: boolean;
    indeed: boolean;
    glassdoor: boolean;
    monster: boolean;
    ziprecruiter: boolean;
  };
  notifications: {
    enabled: boolean;
    sound: boolean;
    newJobs: boolean;
    applicationUpdates: boolean;
  };
  theme: 'light' | 'dark';
  advanced: {
    dataRetentionDays: number;
    syncFrequency: 'realtime' | 'hourly' | 'daily';
    debugMode: boolean;
  };
}

interface UserProfile {
  name: string;
  email: string;
  photoUrl?: string;
  isLoggedIn: boolean;
}

const defaultSettings: SettingsState = {
  apiUrl: 'http://localhost:8080',
  enabledSites: {
    linkedin: true,
    indeed: true,
    glassdoor: true,
    monster: true,
    ziprecruiter: true,
  },
  notifications: {
    enabled: true,
    sound: true,
    newJobs: true,
    applicationUpdates: true,
  },
  theme: 'light',
  advanced: {
    dataRetentionDays: 30,
    syncFrequency: 'realtime',
    debugMode: false,
  },
};

const Options: React.FC = () => {
  const [settings, setSettings] = useState<SettingsState>(defaultSettings);
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile>({ name: '', email: '', isLoggedIn: false });
  const [activeTab, setActiveTab] = useState<'general' | 'sites' | 'notifications' | 'account' | 'advanced'>('general');

  useEffect(() => {
    // Load settings from storage
    chrome.storage.local.get(['apiUrl', 'enabledSites', 'notifications', 'theme', 'advanced', 'userProfile'], (result) => {
      setSettings({
        apiUrl: result.apiUrl || defaultSettings.apiUrl,
        enabledSites: result.enabledSites || defaultSettings.enabledSites,
        notifications: result.notifications || defaultSettings.notifications,
        theme: result.theme || defaultSettings.theme,
        advanced: result.advanced || defaultSettings.advanced,
      });
      
      if (result.userProfile) {
        setUserProfile(result.userProfile);
      }
      
      setIsLoading(false);
      
      // Apply theme
      document.body.setAttribute('data-theme', result.theme || defaultSettings.theme);
    });
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    if (type === 'checkbox') {
      if (name.startsWith('notification-')) {
        const notificationKey = name.replace('notification-', '') as keyof typeof settings.notifications;
        setSettings((prev) => ({
          ...prev,
          notifications: {
            ...prev.notifications,
            [notificationKey]: checked,
          },
        }));
      } else if (name.startsWith('advanced-')) {
        const advancedKey = name.replace('advanced-', '') as keyof typeof settings.advanced;
        setSettings((prev) => ({
          ...prev,
          advanced: {
            ...prev.advanced,
            [advancedKey]: checked,
          },
        }));
      } else {
        // Handle site checkboxes
        const siteName = name.replace('site-', '') as keyof typeof settings.enabledSites;
        setSettings((prev) => ({
          ...prev,
          enabledSites: {
            ...prev.enabledSites,
            [siteName]: checked,
          },
        }));
      }
    } else if (name === 'theme') {
      const newTheme = value as 'light' | 'dark';
      setSettings((prev) => ({
        ...prev,
        theme: newTheme,
      }));
      document.body.setAttribute('data-theme', newTheme);
    } else if (name.startsWith('advanced-')) {
      const advancedKey = name.replace('advanced-', '') as keyof typeof settings.advanced;
      setSettings((prev) => ({
        ...prev,
        advanced: {
          ...prev.advanced,
          [advancedKey]: value,
        },
      }));
    } else {
      // Handle text inputs
      setSettings((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleToggleTheme = () => {
    const newTheme = settings.theme === 'light' ? 'dark' : 'light';
    setSettings(prev => ({
      ...prev,
      theme: newTheme
    }));
    document.body.setAttribute('data-theme', newTheme);
  };

  const handleSave = () => {
    // Validate API URL
    try {
      new URL(settings.apiUrl);
    } catch (e) {
      setStatusMessage({
        text: 'Please enter a valid API URL',
        type: 'error',
      });
      return;
    }

    // Save settings to storage
    chrome.storage.local.set(settings, () => {
      setStatusMessage({
        text: 'Settings saved successfully!',
        type: 'success',
      });
      
      // Clear status message after 3 seconds
      setTimeout(() => {
        setStatusMessage(null);
      }, 3000);
    });
  };

  const handleReset = () => {
    setSettings(defaultSettings);
    setStatusMessage({
      text: 'Settings reset to defaults. Click Save to apply changes.',
      type: 'success',
    });
  };

  const testApiConnection = async () => {
    setStatusMessage({
      text: 'Testing connection...',
      type: 'info',
    });
    
    try {
      const response = await fetch(`${settings.apiUrl}/health`);
      if (response.ok) {
        setStatusMessage({
          text: 'Connection successful!',
          type: 'success',
        });
      } else {
        throw new Error(`HTTP ${response.status}`);  
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setStatusMessage({
        text: `Connection failed: ${errorMessage}`,
        type: 'error',
      });
    }
    
    setTimeout(() => setStatusMessage(null), 3000);
  };
  
  const handleLogin = () => {
    // Simulated login for demo purposes
    setUserProfile({
      name: 'Demo User',
      email: 'demo@example.com',
      photoUrl: chrome.runtime.getURL('icons/profile-placeholder.png'),
      isLoggedIn: true
    });
    
    chrome.storage.local.set({ userProfile: {
      name: 'Demo User',
      email: 'demo@example.com',
      photoUrl: chrome.runtime.getURL('icons/profile-placeholder.png'),
      isLoggedIn: true
    }});
    
    setStatusMessage({
      text: 'Successfully signed in!',
      type: 'success',
    });
    
    setTimeout(() => setStatusMessage(null), 3000);
  };
  
  const handleLogout = () => {
    setUserProfile({ name: '', email: '', isLoggedIn: false });
    chrome.storage.local.set({ userProfile: { name: '', email: '', isLoggedIn: false } });
    
    setStatusMessage({
      text: 'Successfully signed out',
      type: 'success',
    });
    
    setTimeout(() => setStatusMessage(null), 3000);
  };
  
  const exportData = () => {
    chrome.storage.local.get(null, (result) => {
      // Convert data to JSON string
      const jsonData = JSON.stringify(result, null, 2);
      
      // Create a blob with the data
      const blob = new Blob([jsonData], {type: 'application/json'});
      
      // Create a temporary link element
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'careerchronos-settings-export.json';
      
      // Simulate click to trigger download
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      setStatusMessage({
        text: 'Settings exported successfully!',
        type: 'success',
      });
      
      setTimeout(() => setStatusMessage(null), 3000);
    });
  };
  
  const clearData = () => {
    if (window.confirm('Are you sure you want to clear all stored data? This action cannot be undone.')) {
      chrome.storage.local.clear(() => {
        setSettings(defaultSettings);
        setUserProfile({ name: '', email: '', isLoggedIn: false });
        
        setStatusMessage({
          text: 'All data has been cleared successfully',
          type: 'success',
        });
        
        setTimeout(() => setStatusMessage(null), 3000);
      });
    }
  };

  if (isLoading) {
    return (
      <div className="container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading your settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="header">
        <div className="header-left">
          <img src={chrome.runtime.getURL('icons/icon48.png')} alt="CareerChronos Logo" className="logo" />
          <h1>CareerChronos Settings</h1>
        </div>
        <div className="theme-toggle">
          <label className="switch">
            <input 
              type="checkbox" 
              checked={settings.theme === 'dark'}
              onChange={handleToggleTheme}
            />
            <span className="slider round"></span>
            <span className="toggle-icon">{settings.theme === 'light' ? '☀️' : '🌙'}</span>
          </label>
        </div>
      </div>

      <div className="tabs">
        <button 
          className={`tab ${activeTab === 'general' ? 'active' : ''}`} 
          onClick={() => setActiveTab('general')}
        >
          ⚙️ General
        </button>
        <button 
          className={`tab ${activeTab === 'sites' ? 'active' : ''}`} 
          onClick={() => setActiveTab('sites')}
        >
          🌐 Job Sites
        </button>
        <button 
          className={`tab ${activeTab === 'notifications' ? 'active' : ''}`} 
          onClick={() => setActiveTab('notifications')}
        >
          🔔 Notifications
        </button>
        <button 
          className={`tab ${activeTab === 'account' ? 'active' : ''}`} 
          onClick={() => setActiveTab('account')}
        >
          👤 Account
        </button>
        <button 
          className={`tab ${activeTab === 'advanced' ? 'active' : ''}`} 
          onClick={() => setActiveTab('advanced')}
        >
          🔧 Advanced
        </button>
      </div>

      <div className="tab-content">
        {activeTab === 'general' && (
          <div className="section">
            <h2>⚙️ General Settings</h2>
            
            <div className="form-group">
              <label htmlFor="apiUrl">API URL</label>
              <div className="input-group">
                <input
                  type="url"
                  id="apiUrl"
                  name="apiUrl"
                  value={settings.apiUrl}
                  onChange={handleInputChange}
                  placeholder="https://your-careerchronos-api.com"
                />
                <button
                  type="button"
                  onClick={testApiConnection}
                  className="test-connection-btn"
                >
                  Test
                </button>
              </div>
              <p className="help-text">The URL of your CareerChronos API server</p>
            </div>
          </div>
        )}

        {activeTab === 'sites' && (
          <div className="section">
            <h2>🌐 Supported Job Sites</h2>
            <p className="help-text">Enable or disable job detection for specific sites</p>
            
            <div className="site-grid">
              <div className={`site-card ${settings.enabledSites.linkedin ? 'enabled' : ''}`}>
                <div className="site-logo linkedin-logo"></div>
                <div className="site-info">
                  <h3>LinkedIn</h3>
                  <label className="switch">
                    <input
                      type="checkbox"
                      id="site-linkedin"
                      name="site-linkedin"
                      checked={settings.enabledSites.linkedin}
                      onChange={handleInputChange}
                    />
                    <span className="slider round"></span>
                  </label>
                </div>
              </div>
              
              <div className={`site-card ${settings.enabledSites.indeed ? 'enabled' : ''}`}>
                <div className="site-logo indeed-logo"></div>
                <div className="site-info">
                  <h3>Indeed</h3>
                  <label className="switch">
                    <input
                      type="checkbox"
                      id="site-indeed"
                      name="site-indeed"
                      checked={settings.enabledSites.indeed}
                      onChange={handleInputChange}
                    />
                    <span className="slider round"></span>
                  </label>
                </div>
              </div>
              
              <div className={`site-card ${settings.enabledSites.glassdoor ? 'enabled' : ''}`}>
                <div className="site-logo glassdoor-logo"></div>
                <div className="site-info">
                  <h3>Glassdoor</h3>
                  <label className="switch">
                    <input
                      type="checkbox"
                      id="site-glassdoor"
                      name="site-glassdoor"
                      checked={settings.enabledSites.glassdoor}
                      onChange={handleInputChange}
                    />
                    <span className="slider round"></span>
                  </label>
                </div>
              </div>
              
              <div className={`site-card ${settings.enabledSites.monster ? 'enabled' : ''}`}>
                <div className="site-logo monster-logo"></div>
                <div className="site-info">
                  <h3>Monster</h3>
                  <label className="switch">
                    <input
                      type="checkbox"
                      id="site-monster"
                      name="site-monster"
                      checked={settings.enabledSites.monster}
                      onChange={handleInputChange}
                    />
                    <span className="slider round"></span>
                  </label>
                </div>
              </div>
              
              <div className={`site-card ${settings.enabledSites.ziprecruiter ? 'enabled' : ''}`}>
                <div className="site-logo ziprecruiter-logo"></div>
                <div className="site-info">
                  <h3>ZipRecruiter</h3>
                  <label className="switch">
                    <input
                      type="checkbox"
                      id="site-ziprecruiter"
                      name="site-ziprecruiter"
                      checked={settings.enabledSites.ziprecruiter}
                      onChange={handleInputChange}
                    />
                    <span className="slider round"></span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'notifications' && (
          <div className="section">
            <h2>🔔 Notifications</h2>
            
            <div className="notification-settings">
              <div className="form-group">
                <div className="notification-main">
                  <div className="notification-title">
                    <h3>Enable Notifications</h3>
                    <p className="help-text">Receive alerts for important updates</p>
                  </div>
                  <label className="switch">
                    <input
                      type="checkbox"
                      id="notification-enabled"
                      name="notification-enabled"
                      checked={settings.notifications.enabled}
                      onChange={handleInputChange}
                    />
                    <span className="slider round"></span>
                  </label>
                </div>

                <div className={`notification-options ${settings.notifications.enabled ? '' : 'disabled'}`}>
                  <div className="notification-option">
                    <div>
                      <h4>Play Sound</h4>
                      <p className="help-text">Play a sound when notifications appear</p>
                    </div>
                    <label className="switch">
                      <input
                        type="checkbox"
                        id="notification-sound"
                        name="notification-sound"
                        checked={settings.notifications.sound}
                        onChange={handleInputChange}
                        disabled={!settings.notifications.enabled}
                      />
                      <span className="slider round"></span>
                    </label>
                  </div>

                  <div className="notification-option">
                    <div>
                      <h4>New Job Matches</h4>
                      <p className="help-text">Get notified about new job listings</p>
                    </div>
                    <label className="switch">
                      <input
                        type="checkbox"
                        id="notification-newJobs"
                        name="notification-newJobs"
                        checked={settings.notifications.newJobs}
                        onChange={handleInputChange}
                        disabled={!settings.notifications.enabled}
                      />
                      <span className="slider round"></span>
                    </label>
                  </div>

                  <div className="notification-option">
                    <div>
                      <h4>Application Updates</h4>
                      <p className="help-text">Get notified about changes to your applications</p>
                    </div>
                    <label className="switch">
                      <input
                        type="checkbox"
                        id="notification-applicationUpdates"
                        name="notification-applicationUpdates"
                        checked={settings.notifications.applicationUpdates}
                        onChange={handleInputChange}
                        disabled={!settings.notifications.enabled}
                      />
                      <span className="slider round"></span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'account' && (
          <div className="section">
            <h2>👤 Account Management</h2>
            
            {userProfile.isLoggedIn ? (
              <div className="user-profile">
                <div className="profile-header">
                  <div className="profile-avatar">
                    {userProfile.photoUrl ? 
                      <img src={userProfile.photoUrl} alt="Profile" /> : 
                      <div className="avatar-placeholder">{userProfile.name.charAt(0)}</div>
                    }
                  </div>
                  <div className="profile-info">
                    <h3>{userProfile.name}</h3>
                    <p>{userProfile.email}</p>
                    <span className="badge badge-success">Connected</span>
                  </div>
                </div>
                
                <div className="account-actions">
                  <button className="secondary-button" onClick={handleLogout}>
                    Sign Out
                  </button>
                  <button className="link-button">
                    Manage Account
                  </button>
                </div>
              </div>
            ) : (
              <div className="login-prompt">
                <div className="login-message">
                  <h3>Sign in to sync your data</h3>
                  <p>Connect your account to sync job applications across devices</p>
                </div>
                
                <button className="primary-button" onClick={handleLogin}>
                  Sign In
                </button>
              </div>
            )}
          </div>
        )}
        
        {activeTab === 'advanced' && (
          <div className="section">
            <h2>🔧 Advanced Settings</h2>
            
            <div className="form-group">
              <label htmlFor="advanced-syncFrequency">Sync Frequency</label>
              <select
                id="advanced-syncFrequency"
                name="advanced-syncFrequency"
                value={settings.advanced.syncFrequency}
                onChange={handleInputChange}
                className="select-input"
              >
                <option value="realtime">Real-time</option>
                <option value="hourly">Hourly</option>
                <option value="daily">Daily</option>
              </select>
              <p className="help-text">How often to synchronize data with the server</p>
            </div>
            
            <div className="form-group">
              <label htmlFor="advanced-dataRetentionDays">Data Retention (Days)</label>
              <input
                type="number"
                id="advanced-dataRetentionDays"
                name="advanced-dataRetentionDays"
                value={settings.advanced.dataRetentionDays}
                onChange={handleInputChange}
                min="1"
                max="365"
              />
              <p className="help-text">Number of days to keep job data in local storage</p>
            </div>
            
            <div className="form-group">
              <div className="checkbox-group">
                <input
                  type="checkbox"
                  id="advanced-debugMode"
                  name="advanced-debugMode"
                  checked={settings.advanced.debugMode}
                  onChange={handleInputChange}
                />
                <label htmlFor="advanced-debugMode">Enable Debug Mode</label>
              </div>
              <p className="help-text">Show additional logs and debugging information</p>
            </div>
            
            <div className="data-management">
              <h3>Data Management</h3>
              
              <div className="data-actions">
                <button className="secondary-button" onClick={exportData}>
                  <span className="icon">📤</span> Export Settings
                </button>
                <button className="danger-button" onClick={clearData}>
                  <span className="icon">🗑️</span> Clear All Data
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {statusMessage && (
        <div className={`status-message ${statusMessage.type}`}>
          {statusMessage.type === 'success' ? '✅ ' : statusMessage.type === 'info' ? 'ℹ️ ' : '❌ '}
          {statusMessage.text}
        </div>
      )}

      <div className="button-group">
        <button className="secondary-button" onClick={handleReset}>
          ↺ Reset to Defaults
        </button>
        <button className="primary-button" onClick={handleSave}>
          💾 Save Settings
        </button>
      </div>

      <div className="footer">
        <p>CareerChronos Browser Extension</p>
        <p className="version">Version 1.0.0</p>
        <p><a href="https://github.com/your-username/career-chronos" target="_blank" rel="noopener noreferrer">View on GitHub</a></p>
      </div>
    </div>
  );
};

export default Options;
