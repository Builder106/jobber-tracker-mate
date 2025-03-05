/**
 * Utility functions for consistent error handling across the application
 */

import { toast } from "sonner";

/**
 * Log an error to the console in development environment only
 * @param message Error message
 * @param error The error object
 */
export const logError = (message: string, error: unknown): void => {
  if (import.meta.env.DEV) {
    console.error(`${message}:`, error);
  }
};

/**
 * Handle API errors consistently across the application
 * @param error The error object
 * @param userMessage A user-friendly message to display
 * @param silent If true, don't show a toast notification
 */
export const handleApiError = (
  error: unknown, 
  userMessage = "Something went wrong. Please try again.", 
  silent = false
): void => {
  logError("API Error", error);
  
  if (!silent) {
    toast.error(userMessage, {
      description: error instanceof Error ? error.message : "An unexpected error occurred",
    });
  }
};

/**
 * Format API error messages for display
 * @param error The error object
 * @returns A formatted error message
 */
export const formatErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }
  
  if (typeof error === 'string') {
    return error;
  }
  
  return "An unexpected error occurred";
};
