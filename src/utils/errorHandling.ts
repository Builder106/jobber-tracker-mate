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
 * Check if the error is related to a missing database table
 * @param error The error object
 * @returns boolean indicating if it's a missing table error
 */
const isMissingTableError = (error: any): boolean => {
  return (
    error?.code === "PGRST116" || 
    (error?.message?.includes("relation") && error?.message?.includes("does not exist")) ||
    error?.status === 404 ||
    (error?.error?.includes && error?.error?.includes("does not exist"))
  );
};

/**
 * Extract the table name from an error message
 * @param error The error object
 * @returns The table name or undefined
 */
const extractTableName = (error: any): string | undefined => {
  // Try to extract from PostgreSQL error messages like "relation "public.applications" does not exist"
  const pgMatch = error?.message?.match(/relation "(?:public\.)?([^"]+)"/i);
  if (pgMatch) return pgMatch[1];
  
  // Try to extract from URL paths like "/rest/v1/applications"
  const urlMatch = error?.url?.match(/\/rest\/v1\/([^\?]+)/i);
  if (urlMatch) return urlMatch[1];
  
  return undefined;
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
    // Check for specific error types and provide more helpful messages
    if (isMissingTableError(error)) {
      const tableName = extractTableName(error) || "required tables";
      toast.error("Database setup required", {
        description: `The '${tableName}' table doesn't exist in the database. Please run the migrations or contact the administrator.`,
      });
      console.info("Migration needed: To fix this error, apply the SQL migrations in the supabase/migrations directory.");
      return;
    }
    
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
