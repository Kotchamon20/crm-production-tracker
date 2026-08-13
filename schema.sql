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

-- 8. Seed Initial Sample Data (ข้อมูลเริ่มต้น)
INSERT INTO public.jobs (
  id, project_name, product_type, specifications, start_date, due_date, on_sale_date, responsibles, current_stage, stages, audit_logs
) VALUES (
  'JOB-2026-001',
  'แก้วกาแฟพรีเมียม ลาย Summer Collection 2026',
  'glass',
  '{"size": "16 oz (480 ml)", "color": "ใสสกรีน 4 สี", "quantity": 5000, "material_grade": "Premium Glass Grade A (Borosilicate)", "pattern_design": "Summer Tropical Botanical v2"}'::jsonb,
  '2026-08-01',
  '2026-08-22',
  '2026-09-01',
  '[{"id": "r1", "name": "เกรียงไกร การผลิต", "departmentId": "production", "departmentName": "ฝ่ายผลิต & วางขาย (Production)"}, {"id": "r2", "name": "วิภาดา ดีไซน์", "departmentId": "designer", "departmentName": "ฝ่ายออกแบบ (Design)"}, {"id": "r3", "name": "สมหญิง ทำโปรโมท", "departmentId": "marketing", "departmentName": "ฝ่ายการตลาด (Marketing)"}, {"id": "r4", "name": "สมศักดิ์ ขนส่ง", "departmentId": "logistics", "departmentName": "ฝ่ายจัดส่ง & คลังสินค้า (Logistics)"}]'::jsonb,
  'production',
  '{
    "qc": {"notes": "", "due_date": "2026-08-18", "assignee": "เกรียงไกร การผลิต (ฝ่ายผลิต)", "status": "pending", "start_date": "2026-08-16", "attachments": [], "completed_at": null},
    "edit": {"notes": "ปรับตำแหน่งโลโก้ขยับขึ้น 5mm", "due_date": "2026-08-08", "assignee": "วิภาดา ดีไซน์ (ฝ่ายออกแบบ)", "status": "completed", "start_date": "2026-08-07", "attachments": [], "completed_at": "2026-08-07T16:00:00Z"},
    "design": {"notes": "ออกแบบม็อคอัพ 3D เรียบร้อย", "due_date": "2026-08-05", "assignee": "วิภาดา ดีไซน์ (ฝ่ายออกแบบ)", "status": "completed", "start_date": "2026-08-02", "attachments": [{"name": "3D Mockup Design v2", "type": "link", "url": "https://drive.google.com/file/sample-cafe-amazon-cup"}], "completed_at": "2026-08-04T15:00:00Z"},
    "complete": {"notes": "กำหนดวันวางขายหน้าร้าน 1 ก.ย. 2026", "due_date": "2026-08-22", "assignee": "สมศักดิ์ ขนส่ง (ฝ่ายจัดส่ง)", "status": "pending", "start_date": "2026-08-18", "attachments": [], "completed_at": null},
    "approved": {"notes": "สรุปผ่านแบบอนุมัติในทีมบริหาร", "due_date": "2026-08-07", "assignee": "วิภาดา ดีไซน์ (ฝ่ายออกแบบ)", "status": "completed", "start_date": "2026-08-05", "attachments": [{"name": "Internal_Approval_Form.pdf", "type": "file", "url": "https://example.com/approval-001.pdf"}], "completed_at": "2026-08-06T11:20:00Z"},
    "marketing": {"notes": "เตรียมทำสื่อโปรโมต Facebook/IG & Banner หน้าร้าน", "due_date": "2026-08-28", "assignee": "สมหญิง ทำโปรโมท (ฝ่ายการตลาด)", "status": "pending", "start_date": "2026-08-22", "attachments": [], "completed_at": null},
    "on_sale": {"notes": "ฝ่ายผลิตดูแลการกระจายและวางจำหน่ายหน้าร้าน", "due_date": "2026-09-01", "assignee": "เกรียงไกร การผลิต (ฝ่ายผลิต)", "status": "pending", "start_date": "2026-09-01", "attachments": [], "completed_at": null},
    "start": {"notes": "อนุมัติเปิดโครงการผลิตสินค้าประจำซีซั่น", "due_date": "2026-08-02", "assignee": "เกรียงไกร การผลิต (ฝ่ายผลิต)", "status": "completed", "start_date": "2026-08-01", "attachments": [], "completed_at": "2026-08-01T10:30:00Z"},
    "production": {"notes": "กำลังสกรีนแก้วชุดแรก 2,500 ใบ", "due_date": "2026-08-16", "assignee": "เกรียงไกร การผลิต (ฝ่ายผลิต)", "status": "in_progress", "start_date": "2026-08-09", "attachments": [{"name": "รูปถ่ายสายการผลิต_ลอต1.jpg", "type": "image", "url": "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&auto=format&fit=crop&q=60"}], "completed_at": null},
    "production_order": {"notes": "ออก PO เลขที่ PO-2026-881", "due_date": "2026-08-09", "assignee": "เกรียงไกร การผลิต (ฝ่ายผลิต)", "status": "completed", "start_date": "2026-08-08", "attachments": [], "completed_at": "2026-08-08T09:00:00Z"}
  }'::jsonb,
  '[{"id": "l1", "action": "สร้างโครงการผลิต JOB-2026-001 เข้าสู่ระบบ", "user": "เกรียงไกร การผลิต (ฝ่ายผลิต)", "timestamp": "2026-08-01T10:30:00Z"}, {"id": "l2", "action": "เริ่มกระบวนการผลิต (In Production)", "user": "เกรียงไกร การผลิต (ฝ่ายผลิต)", "timestamp": "2026-08-09T08:00:00Z"}]'::jsonb
), (
  'JOB-2026-002',
  'ถุงกระดาษคราฟท์ทรงสูง หูเกลียวสีกระดาษ',
  'paper',
  '{"size": "22 x 10 x 30 cm", "color": "พิมพ์ 2 สี (น้ำตาล/แดง)", "quantity": 10000, "material_grade": "Kraft Paper 150g GSM", "pattern_design": "Classic Original Pattern"}'::jsonb,
  '2026-08-03',
  '2026-08-12',
  '2026-08-25',
  '[{"id": "r1", "name": "เกรียงไกร การผลิต", "departmentId": "production", "departmentName": "ฝ่ายผลิต & วางขาย (Production)"}, {"id": "r2", "name": "วิภาดา ดีไซน์", "departmentId": "designer", "departmentName": "ฝ่ายออกแบบ (Design)"}, {"id": "r3", "name": "สมหญิง ทำโปรโมท", "departmentId": "marketing", "departmentName": "ฝ่ายการตลาด (Marketing)"}]'::jsonb,
  'design',
  '{
    "qc": {"notes": "", "due_date": "2026-08-12", "assignee": "เกรียงไกร การผลิต (ฝ่ายผลิต)", "status": "pending", "start_date": "2026-08-11", "attachments": [], "completed_at": null},
    "edit": {"notes": "", "due_date": "2026-08-09", "assignee": "วิภาดา ดีไซน์ (ฝ่ายออกแบบ)", "status": "pending", "start_date": "2026-08-08", "attachments": [], "completed_at": null},
    "design": {"notes": "รอปรับสเปกความละเอียดโลโก้", "due_date": "2026-08-07", "assignee": "วิภาดา ดีไซน์ (ฝ่ายออกแบบ)", "status": "delayed", "start_date": "2026-08-04", "attachments": [], "completed_at": null},
    "complete": {"notes": "", "due_date": "2026-08-12", "assignee": "เกรียงไกร การผลิต (ฝ่ายผลิต)", "status": "pending", "start_date": "2026-08-12", "attachments": [], "completed_at": null},
    "approved": {"notes": "", "due_date": "2026-08-08", "assignee": "วิภาดา ดีไซน์ (ฝ่ายออกแบบ)", "status": "pending", "start_date": "2026-08-07", "attachments": [], "completed_at": null},
    "marketing": {"notes": "", "due_date": "2026-08-20", "assignee": "สมหญิง ทำโปรโมท (ฝ่ายการตลาด)", "status": "pending", "start_date": "2026-08-12", "attachments": [], "completed_at": null},
    "on_sale": {"notes": "", "due_date": "2026-08-25", "assignee": "เกรียงไกร การผลิต (ฝ่ายผลิต)", "status": "pending", "start_date": "2026-08-25", "attachments": [], "completed_at": null},
    "start": {"notes": "", "due_date": "2026-08-04", "assignee": "เกรียงไกร การผลิต (ฝ่ายผลิต)", "status": "completed", "start_date": "2026-08-03", "attachments": [], "completed_at": "2026-08-03T14:00:00Z"},
    "production": {"notes": "", "due_date": "2026-08-11", "assignee": "เกรียงไกร การผลิต (ฝ่ายผลิต)", "status": "pending", "start_date": "2026-08-09", "attachments": [], "completed_at": null},
    "production_order": {"notes": "", "due_date": "2026-08-09", "assignee": "เกรียงไกร การผลิต (ฝ่ายผลิต)", "status": "pending", "start_date": "2026-08-09", "attachments": [], "completed_at": null}
  }'::jsonb,
  '[{"id": "l1", "action": "สร้างโครงการผลิต JOB-2026-002 เข้าสู่ระบบ", "user": "เกรียงไกร การผลิต (ฝ่ายผลิต)", "timestamp": "2026-08-03T14:00:00Z"}]'::jsonb
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.notifications (id, job_id, title, message, timestamp, read, type) VALUES
('n-1', 'JOB-2026-002', '⚠️ งานล่าช้ากว่ากำหนด (Delay)', 'JOB-2026-002 ขั้นตอน Design ล่าช้ากว่ากำหนด 2 วัน', '2026-08-08T09:00:00Z', false, 'warning'),
('n-2', 'JOB-2026-001', '✨ อัปเดตสถานะงานผลิต', 'JOB-2026-001 เข้าสู่ขั้นตอน Production (กำลังผลิต)', '2026-08-09T08:00:00Z', true, 'info')
ON CONFLICT (id) DO NOTHING;
