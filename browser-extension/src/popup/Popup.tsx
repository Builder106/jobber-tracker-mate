import React, { useEffect, useState } from 'react';
import { JobDetails, AuthStatus } from '../types';

const Popup: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<chrome.tabs.Tab | null>(null);
  const [jobDetails, setJobDetails] = useState<JobDetails | null>(null);
  const [authStatus, setAuthStatus] = useState<AuthStatus>({ isAuthenticated: false });
  const [isJobPage, setIsJobPage] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    // Get the current tab
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        setCurrentTab(tabs[0]);
        checkIfJobPage(tabs[0].url || '');
      }
    });

    // Check authentication status
    checkAuthStatus();
  }, []);

  useEffect(() => {
    // If we're on a job page, get job details from storage
    if (isJobPage && currentTab?.id) {
      chrome.storage.local.get(`jobDetails_${currentTab.id}`, (result) => {
        const details = result[`jobDetails_${currentTab.id}`];
        if (details) {
          setJobDetails(details);
        }
      });
    }
  }, [isJobPage, currentTab]);

  const checkIfJobPage = (url: string) => {
    const supportedDomains = [
      'linkedin.com/jobs',
      'indeed.com/viewjob',
      'glassdoor.com/job-listing',
      'monster.com/job-detail',
      'ziprecruiter.com/jobs'
    ];
    
    setIsJobPage(supportedDomains.some(domain => url.includes(domain)));
  };

  const checkAuthStatus = async () => {
    try {
      const { token } = await chrome.storage.local.get('token');
      
      if (!token) {
        setAuthStatus({ isAuthenticated: false });
        return;
      }
      
      // Get API URL from settings or use default
      const { apiUrl = 'http://localhost:8080' } = await chrome.storage.local.get('apiUrl');
      
      // Verify token with API
      const response = await fetch(`${apiUrl}/api/auth/verify`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const user = await response.json();
        setAuthStatus({ 
          isAuthenticated: true,
          user,
          token
        });
      } else {
        setAuthStatus({ isAuthenticated: false });
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
      setAuthStatus({ isAuthenticated: false });
    }
  };

  const handleSaveJob = async () => {
    if (!jobDetails) {
      setStatusMessage({
        text: 'No job details available to save.',
        type: 'error'
      });
      return;
    }

    if (!authStatus.isAuthenticated || !authStatus.token) {
      setStatusMessage({
        text: 'You need to be logged in to save jobs.',
        type: 'error'
      });
      return;
    }

    setIsSaving(true);
    setStatusMessage(null);

    try {
      // Send message to background script to save the job
      chrome.runtime.sendMessage(
        {
          type: 'SAVE_JOB',
          jobDetails,
          token: authStatus.token
        },
        (response) => {
          setIsSaving(false);
          
          if (response && response.success) {
            setStatusMessage({
              text: 'Job saved successfully!',
              type: 'success'
            });
            
            // Clear stored job details for this tab
            if (currentTab?.id) {
              chrome.storage.local.remove(`jobDetails_${currentTab.id}`);
            }
          } else {
            setStatusMessage({
              text: response?.error || 'Error saving job. Please try again.',
              type: 'error'
            });
          }
        }
      );
    } catch (error) {
      setIsSaving(false);
      setStatusMessage({
        text: 'Error saving job. Please try again.',
        type: 'error'
      });
    }
  };

  const handleLogin = () => {
    // Open login page in new tab
    chrome.tabs.create({ url: 'http://localhost:8080/auth' });
  };

  const handleOpenSettings = () => {
    // Open settings page
    chrome.runtime.openOptionsPage();
  };

  return (
    <div className="container">
      <div className="header">
        <img src="assets/icon48.png" alt="Jobber Tracker Mate Logo" className="logo" />
        <h1>Jobber Tracker Mate</h1>
      </div>
      
      {!isJobPage && (
        <div className="content-section">
          <p>Navigate to a job posting on LinkedIn, Indeed, Glassdoor, Monster, or ZipRecruiter to save it to your Jobber Tracker Mate account.</p>
        </div>
      )}
      
      {isJobPage && jobDetails && authStatus.isAuthenticated && (
        <div className="content-section">
          <div className="job-info">
            <h2>{jobDetails.title || 'Unknown Position'}</h2>
            <p>{jobDetails.company || 'Unknown Company'}</p>
            <p>{jobDetails.location || 'Unknown Location'}</p>
          </div>
          
          <button 
            className="primary-button" 
            onClick={handleSaveJob}
            disabled={isSaving}
          >
            {isSaving ? (
              <>
                <span className="spinner"></span>
                Saving...
              </>
            ) : 'Save to Jobber Tracker Mate'}
          </button>
          
          {statusMessage && (
            <div className={`status-message ${statusMessage.type}`}>
              {statusMessage.text}
            </div>
          )}
        </div>
      )}
      
      {(!authStatus.isAuthenticated) && (
        <div className="content-section">
          <p>Please sign in to your Jobber Tracker Mate account to save jobs.</p>
          <button className="secondary-button" onClick={handleLogin}>
            Sign In
          </button>
        </div>
      )}
      
      <div className="footer">
        <button className="text-button" onClick={handleOpenSettings}>
          Settings
        </button>
      </div>
    </div>
  );
};

export default Popup;
