-- ================================================================
-- Supabase Database Schema for Niitan CRM Production Tracker
-- Target Project: https://vvscpbgwgmnawwkymeqg.supabase.co
-- ================================================================

-- 1. Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Create Jobs Table (โครงการผลิตสินค้า)
CREATE TABLE IF NOT EXISTS public.jobs (
  id TEXT PRIMARY KEY,
  project_name TEXT NOT NULL,
  product_type TEXT,
  specifications JSONB DEFAULT '{}'::jsonb,
  start_date DATE,
  due_date DATE,
  on_sale_date DATE,
  responsibles JSONB DEFAULT '[]'::jsonb,
  current_stage TEXT NOT NULL DEFAULT 'start',
  stages JSONB DEFAULT '{}'::jsonb,
  audit_logs JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create Notifications Table (การแจ้งเตือนระบบ)
CREATE TABLE IF NOT EXISTS public.notifications (
  id TEXT PRIMARY KEY,
  job_id TEXT REFERENCES public.jobs(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  read BOOLEAN DEFAULT FALSE,
  type TEXT DEFAULT 'info'
);

-- 4. Create App Settings Table (การตั้งค่า เช่น LINE Notify)
CREATE TABLE IF NOT EXISTS public.app_settings (
  key TEXT PRIMARY KEY,
  value JSONB DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Trigger for updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_jobs_updated_at ON public.jobs;
CREATE TRIGGER update_jobs_updated_at
BEFORE UPDATE ON public.jobs
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- 6. Enable Row Level Security (RLS)
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

-- 7. Create Public RLS Policies (ให้สิทธิ์อ่าน-เขียนผ่าน Anon Key)
DROP POLICY IF EXISTS "Allow public access to jobs" ON public.jobs;
CREATE POLICY "Allow public access to jobs" ON public.jobs FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public access to notifications" ON public.notifications;
CREATE POLICY "Allow public access to notifications" ON public.notifications FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public access to app_settings" ON public.app_settings;
CREATE POLICY "Allow public access to app_settings" ON public.app_settings FOR ALL USING (true) WITH CHECK (true);

-- 8. Table setup complete. Ready for real production jobs.

