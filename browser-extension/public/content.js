// This script runs in the context of the job board websites

// Function to extract job details from the current page
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

// Function to inject a save button into the job page
function injectSaveButton() {
  // Check if button already exists
  if (document.getElementById('jobber-tracker-save-btn')) {
    return;
  }
  
  // Create floating button
  const saveButton = document.createElement('button');
  saveButton.id = 'jobber-tracker-save-btn';
  saveButton.textContent = 'Save to Jobber Tracker';
  saveButton.style.position = 'fixed';
  saveButton.style.bottom = '20px';
  saveButton.style.right = '20px';
  saveButton.style.zIndex = '9999';
  saveButton.style.backgroundColor = '#3b82f6';
  saveButton.style.color = 'white';
  saveButton.style.border = 'none';
  saveButton.style.borderRadius = '4px';
  saveButton.style.padding = '10px 16px';
  saveButton.style.fontWeight = '500';
  saveButton.style.cursor = 'pointer';
  saveButton.style.boxShadow = '0 2px 5px rgba(0, 0, 0, 0.2)';
  saveButton.style.display = 'flex';
  saveButton.style.alignItems = 'center';
  saveButton.style.gap = '8px';
  
  // Add icon
  const icon = document.createElement('span');
  icon.innerHTML = '📋';
  saveButton.prepend(icon);
  
  // Add hover effect
  saveButton.addEventListener('mouseover', () => {
    saveButton.style.backgroundColor = '#2563eb';
  });
  saveButton.addEventListener('mouseout', () => {
    saveButton.style.backgroundColor = '#3b82f6';
  });
  
  // Add click event
  saveButton.addEventListener('click', async () => {
    const jobDetails = extractJobDetails();
    
    // Show saving feedback
    saveButton.textContent = 'Saving...';
    saveButton.disabled = true;
    
    // Send message to background script
    chrome.runtime.sendMessage(
      { 
        type: 'JOB_DETECTED', 
        jobDetails 
      },
      (response) => {
        if (response && response.success) {
          // Open the extension popup
          chrome.runtime.sendMessage({ type: 'OPEN_POPUP' });
          
          // Reset button after a delay
          setTimeout(() => {
            saveButton.innerHTML = '✓ Saved to Jobber Tracker';
            saveButton.prepend(icon);
            
            // Reset after 3 seconds
            setTimeout(() => {
              saveButton.innerHTML = 'Save to Jobber Tracker';
              saveButton.disabled = false;
              saveButton.prepend(icon);
            }, 3000);
          }, 1000);
        } else {
          // Show error
          saveButton.innerHTML = '❌ Error saving job';
          saveButton.prepend(icon);
          
          // Reset after 3 seconds
          setTimeout(() => {
            saveButton.innerHTML = 'Save to Jobber Tracker';
            saveButton.disabled = false;
            saveButton.prepend(icon);
          }, 3000);
        }
      }
    );
  });
  
  // Add button to page
  document.body.appendChild(saveButton);
}

// Main execution
(function() {
  // Check if we're on a supported job site
  const url = window.location.href;
  const supportedJobSites = [
    'linkedin.com/jobs',
    'indeed.com/viewjob',
    'glassdoor.com/job-listing',
    'monster.com/job-detail',
    'ziprecruiter.com/jobs'
  ];
  
  const isJobSite = supportedJobSites.some(site => url.includes(site));
  
  if (isJobSite) {
    // Extract job details
    const jobDetails = extractJobDetails();
    
    // Only proceed if we could extract meaningful job details
    if (jobDetails.title && jobDetails.company) {
      // Notify background script that we found a job
      chrome.runtime.sendMessage(
        { 
          type: 'JOB_DETECTED', 
          jobDetails 
        }
      );
      
      // Inject save button
      injectSaveButton();
    }
  }
})();
