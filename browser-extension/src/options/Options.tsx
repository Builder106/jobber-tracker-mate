import React, { useEffect, useState } from 'react';
import '../shared/theme.css';

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
};

const Options: React.FC = () => {
  const [settings, setSettings] = useState<SettingsState>(defaultSettings);
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load settings from storage
    chrome.storage.local.get(['apiUrl', 'enabledSites', 'notifications', 'theme'], (result) => {
      setSettings({
        apiUrl: result.apiUrl || defaultSettings.apiUrl,
        enabledSites: result.enabledSites || defaultSettings.enabledSites,
        notifications: result.notifications || defaultSettings.notifications,
        theme: result.theme || defaultSettings.theme,
      });
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
    } else {
      // Handle text inputs
      setSettings((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
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

  return (
    <div className="container">
      <div className="header">
        <img src={chrome.runtime.getURL('icons/icon48.png')} alt="CareerChronos Logo" className="logo" />
        <h1>CareerChronos Settings</h1>
        <select
          name="theme"
          value={settings.theme}
          onChange={handleInputChange}
          className="theme-selector"
        >
          <option value="light">☀️ Light</option>
          <option value="dark">🌙 Dark</option>
        </select>
      </div>

      <div className="section">
        <h2>🔗 API Configuration</h2>
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
              Test Connection
            </button>
          </div>
          <p className="help-text">The URL of your CareerChronos API server</p>
        </div>
      </div>

      <div className="section">
        <h2>🔔 Notifications</h2>
        <div className="form-group">
          <div className="checkbox-group">
            <input
              type="checkbox"
              id="notification-enabled"
              name="notification-enabled"
              checked={settings.notifications.enabled}
              onChange={handleInputChange}
            />
            <label htmlFor="notification-enabled">
              Enable Notifications
              {settings.notifications.enabled && <span className="badge badge-success">Active</span>}
            </label>
          </div>

          <div className="checkbox-group" style={{ marginLeft: '1.5rem', opacity: settings.notifications.enabled ? 1 : 0.5 }}>
            <input
              type="checkbox"
              id="notification-sound"
              name="notification-sound"
              checked={settings.notifications.sound}
              onChange={handleInputChange}
              disabled={!settings.notifications.enabled}
            />
            <label htmlFor="notification-sound">Play Sound</label>
          </div>

          <div className="checkbox-group" style={{ marginLeft: '1.5rem', opacity: settings.notifications.enabled ? 1 : 0.5 }}>
            <input
              type="checkbox"
              id="notification-newJobs"
              name="notification-newJobs"
              checked={settings.notifications.newJobs}
              onChange={handleInputChange}
              disabled={!settings.notifications.enabled}
            />
            <label htmlFor="notification-newJobs">New Job Matches</label>
          </div>

          <div className="checkbox-group" style={{ marginLeft: '1.5rem', opacity: settings.notifications.enabled ? 1 : 0.5 }}>
            <input
              type="checkbox"
              id="notification-applicationUpdates"
              name="notification-applicationUpdates"
              checked={settings.notifications.applicationUpdates}
              onChange={handleInputChange}
              disabled={!settings.notifications.enabled}
            />
            <label htmlFor="notification-applicationUpdates">Application Updates</label>
          </div>
        </div>
      </div>

      <div className="section">
        <h2>🌐 Supported Job Sites</h2>
        <p className="help-text">Enable or disable job detection for specific sites</p>
        
        <div className="form-group">
          <div className="checkbox-group">
            <input
              type="checkbox"
              id="site-linkedin"
              name="site-linkedin"
              checked={settings.enabledSites.linkedin}
              onChange={handleInputChange}
            />
            <label htmlFor="site-linkedin">
              LinkedIn
              {settings.enabledSites.linkedin && <span className="badge badge-success">Active</span>}
            </label>
          </div>
          
          <div className="checkbox-group">
            <input
              type="checkbox"
              id="site-indeed"
              name="site-indeed"
              checked={settings.enabledSites.indeed}
              onChange={handleInputChange}
            />
            <label htmlFor="site-indeed">
              Indeed
              {settings.enabledSites.indeed && <span className="badge badge-success">Active</span>}
            </label>
          </div>
          
          <div className="checkbox-group">
            <input
              type="checkbox"
              id="site-glassdoor"
              name="site-glassdoor"
              checked={settings.enabledSites.glassdoor}
              onChange={handleInputChange}
            />
            <label htmlFor="site-glassdoor">
              Glassdoor
              {settings.enabledSites.glassdoor && <span className="badge badge-success">Active</span>}
            </label>
          </div>
          
          <div className="checkbox-group">
            <input
              type="checkbox"
              id="site-monster"
              name="site-monster"
              checked={settings.enabledSites.monster}
              onChange={handleInputChange}
            />
            <label htmlFor="site-monster">
              Monster
              {settings.enabledSites.monster && <span className="badge badge-success">Active</span>}
            </label>
          </div>
          
          <div className="checkbox-group">
            <input
              type="checkbox"
              id="site-ziprecruiter"
              name="site-ziprecruiter"
              checked={settings.enabledSites.ziprecruiter}
              onChange={handleInputChange}
            />
            <label htmlFor="site-ziprecruiter">
              ZipRecruiter
              {settings.enabledSites.ziprecruiter && <span className="badge badge-success">Active</span>}
            </label>
          </div>
        </div>
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
