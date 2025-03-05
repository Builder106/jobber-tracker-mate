import * as z from "zod";

/**
 * Schema for job application form validation
 */
export const applicationFormSchema = z.object({
  company: z.string().min(1, { message: "Company name is required" }),
  position: z.string().min(1, { message: "Position is required" }),
  location: z.string().min(1, { message: "Location is required" }),
  status: z.enum(["applied", "interview", "offer", "rejected"]),
  date: z.date(),
  link: z.string().url({ message: "Please enter a valid URL" }).optional().or(z.literal('')),
  notes: z.string().optional(),
});

export type ApplicationFormValues = z.infer<typeof applicationFormSchema>;

/**
 * Schema for user profile form validation
 */
export const profileFormSchema = z.object({
  fullName: z.string().min(1, { message: "Full name is required" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  phone: z.string().optional(),
  location: z.string().optional(),
  bio: z.string().optional(),
  github: z.string().url({ message: "Please enter a valid URL" }).optional().or(z.literal('')),
  linkedin: z.string().url({ message: "Please enter a valid URL" }).optional().or(z.literal('')),
  portfolio: z.string().url({ message: "Please enter a valid URL" }).optional().or(z.literal('')),
});

export type ProfileFormValues = z.infer<typeof profileFormSchema>;

/**
 * Schema for user settings form validation
 */
export const userSettingsSchema = z.object({
  theme: z.enum(["light", "dark", "system"]),
  emailNotifications: z.boolean(),
  calendarIntegration: z.boolean(),
  defaultView: z.enum(["list", "kanban", "calendar"]),
});

export type UserSettingsValues = z.infer<typeof userSettingsSchema>;
