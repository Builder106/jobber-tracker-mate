/**
 * Background script for the Jobber Tracker Mate browser extension
 * This script runs in the background and handles communication between
 * the content scripts, popup, and the main application
 */

import { JobDetails } from './types';

// Listen for installation
chrome.runtime.onInstalled.addListener(() => {
  console.log('Jobber Tracker Mate extension installed');
  
  // Set default settings
  chrome.storage.local.set({
    apiUrl: 'http://localhost:8080',
    autoDetectJobs: true
  });
});

// Listen for messages from content scripts or popup
chrome.runtime.onMessage.addListener((message: any, sender, sendResponse) => {
  if (message.type === 'JOB_DETECTED') {
    // Show the extension icon as active when a job is detected
    chrome.action.setBadgeText({ 
      text: '!',
      tabId: sender.tab?.id
    });
    chrome.action.setBadgeBackgroundColor({ 
      color: '#3b82f6',
      tabId: sender.tab?.id
    });
    
    // Store the job details for this tab
    if (sender.tab?.id) {
      chrome.storage.local.set({ 
        [`jobDetails_${sender.tab.id}`]: message.jobDetails 
      });
    }
    
    sendResponse({ success: true });
  } else if (message.type === 'AUTH_STATUS_CHANGE') {
    // Handle authentication status changes
    if (message.isAuthenticated) {
      console.log('User authenticated:', message.user);
      chrome.storage.local.set({ 
        token: message.token,
        user: message.user
      });
    } else {
      console.log('User logged out');
      chrome.storage.local.remove(['token', 'user']);
    }
    
    sendResponse({ success: true });
  } else if (message.type === 'SAVE_JOB') {
    // Handle saving a job to the main application
    saveJobToApp(message.jobDetails, message.token)
      .then(result => {
        sendResponse({ success: true, result });
      })
      .catch(error => {
        console.error('Error saving job:', error);
        sendResponse({ success: false, error: error.message });
      });
    
    return true; // Keep the message channel open for async response
  }
  
  return true; // Keep the message channel open for async response
});

// Listen for tab updates to detect when user navigates to a job page
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url) {
    // Check if this is a supported job site
    const supportedJobSites = [
      'linkedin.com/jobs',
      'indeed.com/viewjob',
      'glassdoor.com/job-listing',
      'monster.com/job-detail',
      'ziprecruiter.com/jobs'
    ];
    
    const isJobSite = supportedJobSites.some(site => tab.url?.includes(site));
    
    if (isJobSite) {
      // Execute content script to detect job details
      chrome.scripting.executeScript({
        target: { tabId },
        files: ['content.js']
      }).catch(err => console.error('Error injecting content script:', err));
    } else {
      // Clear badge when navigating away from job sites
      chrome.action.setBadgeText({ 
        text: '',
        tabId
      });
      
      // Clean up stored job details for this tab
      chrome.storage.local.remove(`jobDetails_${tabId}`);
    }
  }
});

/**
 * Save a job to the main application
 * @param jobDetails The job details to save
 * @param token The authentication token
 * @returns Promise that resolves when the job is saved
 */
async function saveJobToApp(jobDetails: JobDetails, token: string): Promise<any> {
  // Get API URL from settings or use default
  const { apiUrl = 'http://localhost:8080' } = await chrome.storage.local.get('apiUrl');
  
  if (!token) {
    throw new Error('Authentication required');
  }
  
  // Prepare job data
  const jobData = {
    company: jobDetails.company,
    position: jobDetails.title,
    location: jobDetails.location,
    status: 'applied',
    date: new Date().toISOString(),
    link: jobDetails.url,
    notes: jobDetails.description || ''
  };
  
  // Send job data to API
  const response = await fetch(`${apiUrl}/api/applications`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(jobData)
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.message || `API error: ${response.status}`);
  }
  
  return response.json();
}
