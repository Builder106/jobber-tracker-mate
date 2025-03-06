import React, { useEffect, useState } from 'react';

interface SettingsState {
  apiUrl: string;
  enabledSites: {
    linkedin: boolean;
    indeed: boolean;
    glassdoor: boolean;
    monster: boolean;
    ziprecruiter: boolean;
  };
  showNotifications: boolean;
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
  showNotifications: true,
};

const Options: React.FC = () => {
  const [settings, setSettings] = useState<SettingsState>(defaultSettings);
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load settings from storage
    chrome.storage.local.get(['apiUrl', 'enabledSites', 'showNotifications'], (result) => {
      setSettings({
        apiUrl: result.apiUrl || defaultSettings.apiUrl,
        enabledSites: result.enabledSites || defaultSettings.enabledSites,
        showNotifications: result.showNotifications !== undefined ? result.showNotifications : defaultSettings.showNotifications,
      });
      setIsLoading(false);
    });
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox') {
      if (name === 'showNotifications') {
        setSettings((prev) => ({
          ...prev,
          showNotifications: checked,
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
    return <div className="container">Loading settings...</div>;
  }

  return (
    <div className="container">
      <div className="header">
        <img src="../assets/icon48.png" alt="Jobber Tracker Mate Logo" className="logo" />
        <h1>Jobber Tracker Mate Settings</h1>
      </div>

      <div className="section">
        <h2>API Configuration</h2>
        <div className="form-group">
          <label htmlFor="apiUrl">API URL</label>
          <input
            type="url"
            id="apiUrl"
            name="apiUrl"
            value={settings.apiUrl}
            onChange={handleInputChange}
            placeholder="https://your-jobber-tracker-api.com"
          />
          <p className="help-text">The URL of your Jobber Tracker Mate API server</p>
        </div>
      </div>

      <div className="section">
        <h2>Supported Job Sites</h2>
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
            <label htmlFor="site-linkedin">LinkedIn</label>
          </div>
          
          <div className="checkbox-group">
            <input
              type="checkbox"
              id="site-indeed"
              name="site-indeed"
              checked={settings.enabledSites.indeed}
              onChange={handleInputChange}
            />
            <label htmlFor="site-indeed">Indeed</label>
          </div>
          
          <div className="checkbox-group">
            <input
              type="checkbox"
              id="site-glassdoor"
              name="site-glassdoor"
              checked={settings.enabledSites.glassdoor}
              onChange={handleInputChange}
            />
            <label htmlFor="site-glassdoor">Glassdoor</label>
          </div>
          
          <div className="checkbox-group">
            <input
              type="checkbox"
              id="site-monster"
              name="site-monster"
              checked={settings.enabledSites.monster}
              onChange={handleInputChange}
            />
            <label htmlFor="site-monster">Monster</label>
          </div>
          
          <div className="checkbox-group">
            <input
              type="checkbox"
              id="site-ziprecruiter"
              name="site-ziprecruiter"
              checked={settings.enabledSites.ziprecruiter}
              onChange={handleInputChange}
            />
            <label htmlFor="site-ziprecruiter">ZipRecruiter</label>
          </div>
        </div>
      </div>

      <div className="section">
        <h2>Notifications</h2>
        <div className="form-group">
          <div className="checkbox-group">
            <input
              type="checkbox"
              id="showNotifications"
              name="showNotifications"
              checked={settings.showNotifications}
              onChange={handleInputChange}
            />
            <label htmlFor="showNotifications">Show notifications when jobs are saved</label>
          </div>
        </div>
      </div>

      {statusMessage && (
        <div className={`status-message ${statusMessage.type}`}>
          {statusMessage.text}
        </div>
      )}

      <div className="button-group">
        <button className="secondary-button" onClick={handleReset}>
          Reset to Defaults
        </button>
        <button className="primary-button" onClick={handleSave}>
          Save Settings
        </button>
      </div>

      <div className="footer">
        <p>Jobber Tracker Mate Browser Extension</p>
        <p className="version">Version 1.0.0</p>
      </div>
    </div>
  );
};

export default Options;
