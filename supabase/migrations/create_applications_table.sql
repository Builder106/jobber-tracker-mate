-- Create applications table
CREATE TABLE IF NOT EXISTS public.applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  company TEXT NOT NULL,
  position TEXT NOT NULL,
  location TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('applied', 'interview', 'offer', 'rejected')),
  date TIMESTAMP WITH TIME ZONE NOT NULL,
  link TEXT,
  notes TEXT,
  logo TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create RLS policies for applications table
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own applications
CREATE POLICY "Users can view their own applications" 
  ON public.applications 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own applications
CREATE POLICY "Users can insert their own applications" 
  ON public.applications 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own applications
CREATE POLICY "Users can update their own applications" 
  ON public.applications 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Policy: Users can delete their own applications
CREATE POLICY "Users can delete their own applications" 
  ON public.applications 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Add indexes for better performance
CREATE INDEX idx_applications_user_id ON public.applications(user_id);
CREATE INDEX idx_applications_status ON public.applications(status);
CREATE INDEX idx_applications_created_at ON public.applications(created_at);
