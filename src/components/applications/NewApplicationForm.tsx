import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { CalendarIcon, LinkIcon, MapPinIcon } from "lucide-react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Application } from "./ApplicationCard";
import { supabase } from "@/lib/supabase";
import { useSession } from "@supabase/auth-helpers-react";
import { fetchLocationSuggestions, LocationSuggestion } from "@/utils/locationSearch";

const formSchema = z.object({
  company: z.string().min(1, { message: "Company name is required" }),
  position: z.string().min(1, { message: "Position is required" }),
  location: z.string().min(1, { message: "Location is required" }),
  status: z.enum(["applied", "interview", "offer", "rejected"]),
  date: z.date(),
  link: z.string().url({ message: "Please enter a valid URL" }).optional().or(z.literal('')),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface NewApplicationFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApplicationAdded?: (application: Omit<Application, "id">) => void;
  onApplicationUpdated?: (application: Application) => void;
  existingApplication?: Application | null;
}

export function NewApplicationForm({
  open,
  onOpenChange,
  onApplicationAdded,
  onApplicationUpdated,
  existingApplication,
}: NewApplicationFormProps) {
  const session = useSession();
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      company: "",
      position: "",
      location: "",
      status: "applied",
      date: new Date(),
      link: "",
      notes: "",
    },
  });
  
  // State for cancel confirmation dialog
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);

  const [locationQuery, setLocationQuery] = React.useState(form.getValues("location") || "");
  const [locationSuggestions, setLocationSuggestions] = useState<LocationSuggestion[]>([]);
  const [isLoadingLocations, setIsLoadingLocations] = useState(false);

  useEffect(() => {
    const fetchLocations = async () => {
      if (locationQuery.length >= 2) {
        setIsLoadingLocations(true);
        try {
          const suggestions = await fetchLocationSuggestions(locationQuery);
          setLocationSuggestions(suggestions);
        } catch (error) {
          console.error("Error fetching location suggestions:", error);
          setLocationSuggestions([]);
        } finally {
          setIsLoadingLocations(false);
        }
      } else {
        setLocationSuggestions([]);
      }
    };

    // Debounce the API call to avoid making too many requests
    const timeoutId = setTimeout(fetchLocations, 300);
    return () => clearTimeout(timeoutId);
  }, [locationQuery]);

  // Load existing application or draft when form opens
  useEffect(() => {
    if (open) {
      if (existingApplication) {
        // We're in edit mode - load the existing application
        const formData = {
          ...existingApplication,
          // Convert the date string to a Date object
          date: new Date(existingApplication.date),
        };
        form.reset(formData);
        setLocationQuery(existingApplication.location);
      } else {
        // We're in create mode - try to load draft
        try {
          const savedDraft = localStorage.getItem('applicationDraft');
          if (savedDraft) {
            const draft = JSON.parse(savedDraft);
            // Convert the date string back to a Date object
            if (draft.date) {
              draft.date = new Date(draft.date);
            }
            form.reset(draft);
            if (draft.location) {
              setLocationQuery(draft.location);
            }
          }
        } catch (error) {
          console.error('Error loading draft:', error);
        }
      }
    }
  }, [open, form, existingApplication]);

  // Save form data to localStorage when it changes (only in create mode)
  useEffect(() => {
    // Don't save drafts when editing an existing application
    if (existingApplication) return;
    
    const subscription = form.watch((value) => {
      if (open && Object.values(value).some(val => val)) {
        try {
          // Convert date to ISO string for storage
          const dataToSave = {...value};
          if (dataToSave.date) {
            dataToSave.date = dataToSave.date.toISOString();
          }
          localStorage.setItem('applicationDraft', JSON.stringify(dataToSave));
        } catch (error) {
          console.error('Error saving draft:', error);
        }
      }
    });
    return () => subscription.unsubscribe();
  }, [form, open, existingApplication]);

  async function onSubmit(data: FormValues) {
    if (existingApplication) {
      // We're updating an existing application
      const updatedApplication: Application = {
        ...existingApplication,
        company: data.company,
        position: data.position,
        location: data.location,
        status: data.status,
        date: format(data.date, 'MMMM d, yyyy'),
        link: data.link || undefined,
        notes: data.notes || undefined,
        updated_at: new Date().toISOString(),
      };
      
      // Notify parent component
      if (onApplicationUpdated) {
        onApplicationUpdated(updatedApplication);
      }
    } else {
      // We're creating a new application
      const newApplication: Omit<Application, "id"> = {
        company: data.company,
        position: data.position,
        location: data.location,
        status: data.status,
        date: format(data.date, 'MMMM d, yyyy'),
        link: data.link || undefined,
        notes: data.notes || undefined,
        user_id: session?.user?.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      
      // Clear the draft from localStorage
      localStorage.removeItem('applicationDraft');
      
      // Notify parent component
      if (onApplicationAdded) {
        onApplicationAdded(newApplication);
      }
    }
    
    // Reset form and close dialog
    form.reset();
    onOpenChange(false);
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{existingApplication ? 'Edit Job Application' : 'Add New Job Application'}</DialogTitle>
            <DialogDescription>
              {existingApplication 
                ? 'Update the details of your job application.' 
                : 'Please fill out the details below to add a new job application record.'}
            </DialogDescription>
          </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="company"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Company</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter company name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="position"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Position</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter job title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <MapPinIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search or enter a location"
                        value={locationQuery}
                        className="pl-10"
                        onChange={(e) => {
                          setLocationQuery(e.target.value);
                          field.onChange(e.target.value);
                        }}
                      />
                      {isLoadingLocations && (
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                          <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full" />
                        </div>
                      )}
                    </div>
                  </FormControl>
                  {locationQuery && locationSuggestions.length > 0 && (
                    <div className="mt-1 border rounded shadow-sm max-h-60 overflow-auto z-50">
                      {locationSuggestions.map(loc => (
                        <div
                          key={loc.placeId || loc.description}
                          className="px-3 py-2 hover:bg-gray-100 cursor-pointer flex items-start"
                          onClick={() => {
                            field.onChange(loc.description);
                            setLocationQuery(loc.description);
                            setLocationSuggestions([]);
                          }}
                        >
                          <MapPinIcon className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0 text-muted-foreground" />
                          <span>{loc.description}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select application status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="applied">Applied</SelectItem>
                      <SelectItem value="interview">Interview</SelectItem>
                      <SelectItem value="offer">Offer</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Application Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="link"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Job Link (Optional)</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <LinkIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input 
                        placeholder="https://example.com/job" 
                        className="pl-10" 
                        {...field} 
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes (Optional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Add any notes about this application" 
                      className="min-h-[100px]" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => {
                  // Ask for confirmation if form has been filled out
                  if (Object.values(form.getValues()).some(val => val && val !== "")) {
                    setCancelDialogOpen(true);
                  } else {
                    onOpenChange(false);
                  }
                }}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting 
                  ? (existingApplication ? "Updating..." : "Adding...") 
                  : (existingApplication ? "Update Application" : "Add Application")}
              </Button>
            </DialogFooter>
          </form>
        </Form>
        </DialogContent>
      </Dialog>

      {/* Cancel Confirmation Dialog */}
      <AlertDialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to cancel?</AlertDialogTitle>
            <AlertDialogDescription>
              Your progress will be saved as a draft and can be resumed later.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>No, continue editing</AlertDialogCancel>
            <AlertDialogAction onClick={() => {
              setCancelDialogOpen(false);
              onOpenChange(false);
            }}>
              Yes, cancel
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
