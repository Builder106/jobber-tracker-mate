import React, { useEffect, useState } from 'react';
import { JobDetails, AuthStatus } from '../types';
import '../shared/theme.css';

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
        <img src={chrome.runtime.getURL('icons/icon48.png')} alt="CareerChronos Logo" className="logo" />
        <h1>CareerChronos</h1>
      </div>
      
      {!isJobPage && (
        <div className="content-section">
          <div className="empty-state">
            <div className="empty-state-icon">🔍</div>
            <h3>No Job Detected</h3>
            <p className="empty-state-text">Navigate to a job posting on one of our supported platforms to save it to your account.</p>
            <div className="badge-container">
              <span className="badge badge-primary">LinkedIn</span>
              <span className="badge badge-primary">Indeed</span>
              <span className="badge badge-primary">Glassdoor</span>
              <span className="badge badge-primary">Monster</span>
              <span className="badge badge-primary">ZipRecruiter</span>
            </div>
          </div>
        </div>
      )}
      
      {isJobPage && jobDetails && authStatus.isAuthenticated && (
        <div className="content-section">
          <div className="job-card">
            <div className="job-header">
              <h2>{jobDetails.title || 'Unknown Position'}</h2>
              <div className="job-source-badge">
                {currentTab?.url?.includes('linkedin.com') && <span className="badge badge-linkedin">LinkedIn</span>}
                {currentTab?.url?.includes('indeed.com') && <span className="badge badge-indeed">Indeed</span>}
                {currentTab?.url?.includes('glassdoor.com') && <span className="badge badge-glassdoor">Glassdoor</span>}
                {currentTab?.url?.includes('monster.com') && <span className="badge badge-monster">Monster</span>}
                {currentTab?.url?.includes('ziprecruiter.com') && <span className="badge badge-ziprecruiter">ZipRecruiter</span>}
              </div>
            </div>
            
            <div className="job-details">
              <div className="job-detail-item">
                <span className="job-detail-icon">🏢</span>
                <div className="job-detail-content">
                  <span className="job-detail-label">Company</span>
                  <span className="job-detail-value">{jobDetails.company || 'Unknown Company'}</span>
                </div>
              </div>
              
              <div className="job-detail-item">
                <span className="job-detail-icon">📍</span>
                <div className="job-detail-content">
                  <span className="job-detail-label">Location</span>
                  <span className="job-detail-value">{jobDetails.location || 'Unknown Location'}</span>
                </div>
              </div>
              
              {jobDetails.salary && (
                <div className="job-detail-item">
                  <span className="job-detail-icon">💰</span>
                  <div className="job-detail-content">
                    <span className="job-detail-label">Salary</span>
                    <span className="job-detail-value">{jobDetails.salary}</span>
                  </div>
                </div>
              )}
              
              {jobDetails.jobType && (
                <div className="job-detail-item">
                  <span className="job-detail-icon">⏱️</span>
                  <div className="job-detail-content">
                    <span className="job-detail-label">Job Type</span>
                    <span className="job-detail-value">{jobDetails.jobType}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <button 
            className="primary-button save-job-button" 
            onClick={handleSaveJob}
            disabled={isSaving}
          >
            {isSaving ? (
              <>
                <span className="spinner"></span>
                Saving Job...
              </>
            ) : '💾 Save to CareerChronos'}
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
          <div className="empty-state">
            <div className="empty-state-icon">🔐</div>
            <h3>Authentication Required</h3>
            <p className="empty-state-text">Please sign in to your CareerChronos account to save jobs.</p>
            <button className="primary-button" onClick={handleLogin}>
              Sign In to Your Account
            </button>
          </div>
        </div>
      )}
      
      <div className="footer">
        <div>
          {authStatus.isAuthenticated && authStatus.user && (
            <div className="user-info">
              <span className="badge badge-success">✓ Signed in</span>
              {authStatus.user.email && <span>{authStatus.user.email}</span>}
            </div>
          )}
        </div>
        <button className="text-button" onClick={handleOpenSettings}>
          ⚙️ Settings
        </button>
      </div>
    </div>
  );
};

export default Popup;
