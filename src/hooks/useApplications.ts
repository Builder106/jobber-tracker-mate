import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Application } from "@/components/applications/ApplicationCard";
import { useSession } from "@supabase/auth-helpers-react";
import { handleApiError } from "@/utils/errorHandling";
import { toast } from "sonner";

/**
 * Hook for managing job applications with React Query
 */
export const useApplications = () => {
  const session = useSession();
  const queryClient = useQueryClient();
  const userId = session?.user?.id;

  // Fetch all applications for the current user
  const { data: applications = [], isLoading, error, refetch } = useQuery({
    queryKey: ["applications", userId],
    queryFn: async () => {
      if (!userId) return [];
      
      const { data, error } = await supabase
        .from("applications")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) {
        handleApiError(error, "Failed to load your applications");
        throw error;
      }

      return data as Application[];
    },
    enabled: !!userId,
  });

  // Add a new application
  const addApplication = useMutation({
    mutationFn: async (newApplication: Omit<Application, "id">) => {
      // Check if we have a valid user ID
      if (!userId) {
        const error = new Error("You must be logged in to add an application");
        handleApiError(error, "Authentication required");
        throw error;
      }

      // Ensure user_id is explicitly set to the current user's ID
      const applicationData = {
        ...newApplication,
        user_id: userId,
      };

      console.log("Adding application with data:", applicationData);

      const { data, error } = await supabase
        .from("applications")
        .insert([applicationData])
        .select()
        .single();

      if (error) {
        console.error("Supabase error details:", error);
        handleApiError(error, "Failed to add application");
        throw error;
      }

      return data as Application;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["applications", userId] });
      toast.success("Application added successfully!", {
        description: `${data.position} at ${data.company}`,
      });
    },
  });

  // Update an existing application
  const updateApplication = useMutation({
    mutationFn: async (application: Application) => {
      const { data, error } = await supabase
        .from("applications")
        .update({
          ...application,
          updated_at: new Date().toISOString(),
        })
        .eq("id", application.id)
        .eq("user_id", userId) // Security check
        .select()
        .single();

      if (error) {
        handleApiError(error, "Failed to update application");
        throw error;
      }

      return data as Application;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["applications", userId] });
      toast.success("Application updated successfully!", {
        description: `${data.position} at ${data.company}`,
      });
    },
  });

  // Delete an application
  const deleteApplication = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("applications")
        .delete()
        .eq("id", id)
        .eq("user_id", userId); // Security check

      if (error) {
        handleApiError(error, "Failed to delete application");
        throw error;
      }

      return id;
    },
    onSuccess: (id) => {
      queryClient.invalidateQueries({ queryKey: ["applications", userId] });
      toast.success("Application deleted successfully");
    },
  });

  // Update just the status of an application
  const updateApplicationStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: Application["status"] }) => {
      const { data, error } = await supabase
        .from("applications")
        .update({
          status,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .eq("user_id", userId) // Security check
        .select()
        .single();

      if (error) {
        handleApiError(error, "Failed to update application status");
        throw error;
      }

      return data as Application;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["applications", userId] });
      toast.success(`Status updated to ${data.status}`, {
        description: `${data.position} at ${data.company}`,
      });
    },
  });

  return {
    applications,
    isLoading,
    error,
    refetch,
    addApplication,
    updateApplication,
    deleteApplication,
    updateApplicationStatus,
  };
};
