
import React, { useEffect } from "react";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { CalendarIcon, LinkIcon } from "lucide-react";
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
  onApplicationAdded?: (application: Application) => void;
}

export function NewApplicationForm({
  open,
  onOpenChange,
  onApplicationAdded,
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

  // Load draft from localStorage when form opens
  useEffect(() => {
    if (open) {
      try {
        const savedDraft = localStorage.getItem('applicationDraft');
        if (savedDraft) {
          const draft = JSON.parse(savedDraft);
          // Convert the date string back to a Date object
          if (draft.date) {
            draft.date = new Date(draft.date);
          }
          form.reset(draft);
        }
      } catch (error) {
        console.error('Error loading draft:', error);
      }
    }
  }, [open, form]);

  // Save form data to localStorage when it changes
  useEffect(() => {
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
  }, [form, open]);

  async function onSubmit(data: FormValues) {
    // Create a new application object
    const newApplication: Application = {
      id: Date.now().toString(), // This will be replaced by Supabase
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
    
    // Show success message
    toast.success("Application added successfully!", {
      description: `${data.position} at ${data.company}`,
    });
    
    // Reset form and close dialog
    form.reset();
    onOpenChange(false);
    
    // Clear the draft from localStorage
    localStorage.removeItem('applicationDraft');
    
    // Notify parent component
    if (onApplicationAdded) {
      onApplicationAdded(newApplication);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add New Application</DialogTitle>
          <DialogDescription>
            Track a new job application you've submitted.
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
                    <Input placeholder="City, State" {...field} />
                  </FormControl>
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
                    if (window.confirm("Are you sure you want to cancel? Your draft will be saved.")) {
                      onOpenChange(false);
                    }
                  } else {
                    onOpenChange(false);
                  }
                }}
              >
                Cancel
              </Button>
              <Button type="submit">Add Application</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
