document.addEventListener('DOMContentLoaded', async () => {
  const notJobPageSection = document.getElementById('not-job-page');
  const jobDetectedSection = document.getElementById('job-detected');
  const authSection = document.getElementById('auth-section');
  const jobTitleElement = document.getElementById('job-title');
  const companyNameElement = document.getElementById('company-name');
  const jobLocationElement = document.getElementById('job-location');
  const saveJobButton = document.getElementById('save-job');
  const loginButton = document.getElementById('login-button');
  const settingsButton = document.getElementById('settings-button');
  const statusMessage = document.getElementById('status-message');

  // Get the current tab
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  
  // Check if user is authenticated
  const authStatus = await checkAuthStatus();
  
  // Check if we're on a supported job page
  const isJobPage = isSupportedJobPage(tab.url);
  
  if (!authStatus.isAuthenticated) {
    // Show auth section if user is not authenticated
    notJobPageSection.classList.add('hidden');
    jobDetectedSection.classList.add('hidden');
    authSection.classList.remove('hidden');
  } else if (!isJobPage) {
    // Show not job page section if we're not on a supported job page
    notJobPageSection.classList.remove('hidden');
    jobDetectedSection.classList.add('hidden');
    authSection.classList.add('hidden');
  } else {
    // We're on a job page and authenticated, extract job details
    notJobPageSection.classList.add('hidden');
    jobDetectedSection.classList.remove('hidden');
    authSection.classList.add('hidden');
    
    // Execute content script to extract job details
    try {
      const results = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        function: extractJobDetails,
      });
      
      const jobDetails = results[0].result;
      
      if (jobDetails) {
        // Update popup with job details
        jobTitleElement.textContent = jobDetails.title || 'Unknown Position';
        companyNameElement.textContent = jobDetails.company || 'Unknown Company';
        jobLocationElement.textContent = jobDetails.location || 'Unknown Location';
        
        // Store job details in extension storage
        chrome.storage.local.set({ currentJobDetails: jobDetails });
      } else {
        // Failed to extract job details
        showErrorMessage('Could not extract job details from this page.');
      }
    } catch (error) {
      console.error('Error extracting job details:', error);
      showErrorMessage('Error extracting job details.');
    }
  }
  
  // Event Listeners
  saveJobButton.addEventListener('click', async () => {
    try {
      // Get stored job details
      const { currentJobDetails } = await chrome.storage.local.get('currentJobDetails');
      
      if (!currentJobDetails) {
        showErrorMessage('No job details available to save.');
        return;
      }
      
      // Get API URL from settings or use default
      const { apiUrl = 'http://localhost:8080' } = await chrome.storage.local.get('apiUrl');
      
      // Get auth token
      const { token } = await chrome.storage.local.get('token');
      
      if (!token) {
        showErrorMessage('You need to be logged in to save jobs.');
        authSection.classList.remove('hidden');
        return;
      }
      
      // Prepare job data
      const jobData = {
        company: currentJobDetails.company,
        position: currentJobDetails.title,
        location: currentJobDetails.location,
        status: 'applied',
        date: new Date().toISOString(),
        link: tab.url,
        notes: currentJobDetails.description || ''
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
        throw new Error(`API error: ${response.status}`);
      }
      
      // Show success message
      statusMessage.textContent = 'Job saved successfully!';
      statusMessage.className = 'status-message success';
      
      // Clear stored job details
      chrome.storage.local.remove('currentJobDetails');
      
      // Disable save button to prevent duplicate submissions
      saveJobButton.disabled = true;
      saveJobButton.textContent = 'Saved!';
      
    } catch (error) {
      console.error('Error saving job:', error);
      showErrorMessage('Error saving job. Please try again.');
    }
  });
  
  loginButton.addEventListener('click', () => {
    // Open login page in new tab
    chrome.tabs.create({ url: 'http://localhost:8080/auth' });
  });
  
  settingsButton.addEventListener('click', () => {
    // Open settings page
    chrome.runtime.openOptionsPage();
  });
  
  // Helper functions
  function showErrorMessage(message) {
    statusMessage.textContent = message;
    statusMessage.className = 'status-message error';
  }
  
  function isSupportedJobPage(url) {
    const supportedDomains = [
      'linkedin.com/jobs',
      'indeed.com/viewjob',
      'glassdoor.com/job-listing',
      'monster.com/job-detail',
      'ziprecruiter.com/jobs'
    ];
    
    return supportedDomains.some(domain => url.includes(domain));
  }
  
  async function checkAuthStatus() {
    try {
      const { token } = await chrome.storage.local.get('token');
      
      if (!token) {
        return { isAuthenticated: false };
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
      
      return { 
        isAuthenticated: response.ok,
        user: response.ok ? await response.json() : null
      };
    } catch (error) {
      console.error('Error checking auth status:', error);
      return { isAuthenticated: false };
    }
  }
});

// This function will be injected into the page to extract job details
function extractJobDetails() {
  // Get current URL to determine which job site we're on
  const url = window.location.href;
  
  let jobDetails = {
    title: '',
    company: '',
    location: '',
    description: '',
    source: ''
  };
  
  // Extract based on the job site
  if (url.includes('linkedin.com/jobs')) {
    // LinkedIn
    jobDetails.source = 'LinkedIn';
    jobDetails.title = document.querySelector('.job-details-jobs-unified-top-card__job-title')?.textContent.trim() || '';
    jobDetails.company = document.querySelector('.job-details-jobs-unified-top-card__company-name')?.textContent.trim() || '';
    jobDetails.location = document.querySelector('.job-details-jobs-unified-top-card__bullet')?.textContent.trim() || '';
    jobDetails.description = document.querySelector('.jobs-description__content')?.textContent.trim() || '';
    
  } else if (url.includes('indeed.com/viewjob')) {
    // Indeed
    jobDetails.source = 'Indeed';
    jobDetails.title = document.querySelector('[data-testid="jobsearch-JobInfoHeader-title"]')?.textContent.trim() || '';
    jobDetails.company = document.querySelector('[data-testid="inlineCompanyName"]')?.textContent.trim() || '';
    jobDetails.location = document.querySelector('[data-testid="jobsearch-JobInfoHeader-companyLocation"]')?.textContent.trim() || '';
    jobDetails.description = document.querySelector('#jobDescriptionText')?.textContent.trim() || '';
    
  } else if (url.includes('glassdoor.com/job-listing')) {
    // Glassdoor
    jobDetails.source = 'Glassdoor';
    jobDetails.title = document.querySelector('.job-title')?.textContent.trim() || '';
    jobDetails.company = document.querySelector('.employer-name')?.textContent.trim() || '';
    jobDetails.location = document.querySelector('.location')?.textContent.trim() || '';
    jobDetails.description = document.querySelector('.jobDescriptionContent')?.textContent.trim() || '';
    
  } else if (url.includes('monster.com/job-detail')) {
    // Monster
    jobDetails.source = 'Monster';
    jobDetails.title = document.querySelector('.job-title')?.textContent.trim() || '';
    jobDetails.company = document.querySelector('.company')?.textContent.trim() || '';
    jobDetails.location = document.querySelector('.location')?.textContent.trim() || '';
    jobDetails.description = document.querySelector('.job-description')?.textContent.trim() || '';
    
  } else if (url.includes('ziprecruiter.com/jobs')) {
    // ZipRecruiter
    jobDetails.source = 'ZipRecruiter';
    jobDetails.title = document.querySelector('.job_title')?.textContent.trim() || '';
    jobDetails.company = document.querySelector('.hiring_company_text')?.textContent.trim() || '';
    jobDetails.location = document.querySelector('.location')?.textContent.trim() || '';
    jobDetails.description = document.querySelector('.jobDescriptionSection')?.textContent.trim() || '';
  }
  
  return jobDetails;
}
