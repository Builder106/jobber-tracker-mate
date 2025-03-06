/**
 * Type definitions for the Jobber Tracker Mate browser extension
 */

// Job details extracted from job boards
export interface JobDetails {
  title: string;
  company: string;
  location: string;
  description: string;
  source: string;
  url?: string;
}

// User profile information
export interface UserProfile {
  id: string;
  email: string;
  name?: string;
  avatar_url?: string;
}

// Authentication status
export interface AuthStatus {
  isAuthenticated: boolean;
  user?: UserProfile;
  token?: string;
}

// Extension settings
export interface ExtensionSettings {
  apiUrl: string;
  autoDetectJobs: boolean;
}

// Message types for communication between components
export type MessageType = 
  | { type: 'JOB_DETECTED'; jobDetails: JobDetails }
  | { type: 'AUTH_STATUS_CHANGE'; isAuthenticated: boolean; user?: UserProfile; token?: string }
  | { type: 'SAVE_JOB'; jobDetails: JobDetails; token: string }
  | { type: 'OPEN_POPUP' };
