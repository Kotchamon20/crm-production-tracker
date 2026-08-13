import { useState, useEffect } from 'react';
import { Database, CheckCircle2, AlertCircle, Copy, Check, ExternalLink, RefreshCw, Key, ShieldCheck, FileCode2 } from 'lucide-react';
import { SUPABASE_URL, getStoredAnonKey, setStoredAnonKey, resetSupabaseClient, fetchJobsFromSupabase } from '../lib/supabase';

export default function SupabaseSettingsModal({ isOpen, onClose, onRefreshData }) {
  const [anonKey, setAnonKey] = useState(getStoredAnonKey());
  const [copiedSql, setCopiedSql] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState(null); // null | 'testing' | 'success' | 'error'
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    setAnonKey(getStoredAnonKey());
  }, [isOpen]);

  const handleSaveKey = async (e) => {
    e.preventDefault();
    setStoredAnonKey(anonKey);
    resetSupabaseClient();
    testConnection();
  };

  const testConnection = async () => {
    setConnectionStatus('testing');
    setErrorMessage('');
    try {
      if (!getStoredAnonKey()) {
        setConnectionStatus('error');
        setErrorMessage('กรุณาระบุ Supabase Anon Public Key ก่อนทดสอบการเชื่อมต่อ');
        return;
      }
      await fetchJobsFromSupabase();
      setConnectionStatus('success');
      if (onRefreshData) onRefreshData();
    } catch (err) {
      console.error('Connection test error:', err);
      setConnectionStatus('error');
      setErrorMessage(err.message || 'ไม่สามารถเชื่อมต่อ Supabase Database ได้ กรุณาตรวจสอบ Key หรือสร้างตารางผ่าน SQL Editor');
    }
  };

  const fullSqlScript = `-- ================================================================
-- Supabase Database Schema for Niitan CRM Production Tracker
-- Target Project: ${SUPABASE_URL}
-- ================================================================

-- 1. Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Create Jobs Table
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

-- 3. Create Notifications Table
CREATE TABLE IF NOT EXISTS public.notifications (
  id TEXT PRIMARY KEY,
  job_id TEXT REFERENCES public.jobs(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  read BOOLEAN DEFAULT FALSE,
  type TEXT DEFAULT 'info'
);

-- 4. Create App Settings Table
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

-- 7. Create RLS Policies
DROP POLICY IF EXISTS "Allow public access to jobs" ON public.jobs;
CREATE POLICY "Allow public access to jobs" ON public.jobs FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public access to notifications" ON public.notifications;
CREATE POLICY "Allow public access to notifications" ON public.notifications FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public access to app_settings" ON public.app_settings;
CREATE POLICY "Allow public access to app_settings" ON public.app_settings FOR ALL USING (true) WITH CHECK (true);

-- 8. Seed Initial Data
INSERT INTO public.jobs (
  id, project_name, product_type, specifications, start_date, due_date, on_sale_date, responsibles, current_stage, stages, audit_logs
) VALUES (
  'JOB-2026-001',
  'แก้วกาแฟพรีเมียม ลาย Summer Collection 2026',
  'glass',
  '{"size": "16 oz (480 ml)", "color": "ใสสกรีน 4 สี", "quantity": 5000, "material_grade": "Premium Glass Grade A (Borosilicate)", "pattern_design": "Summer Tropical Botanical v2"}'::jsonb,
  '2026-08-01', '2026-08-22', '2026-09-01',
  '[{"id": "r1", "name": "เกรียงไกร การผลิต", "departmentId": "production", "departmentName": "ฝ่ายผลิต & วางขาย (Production)"}, {"id": "r2", "name": "วิภาดา ดีไซน์", "departmentId": "designer", "departmentName": "ฝ่ายออกแบบ (Design)"}]'::jsonb,
  'production',
  '{"start": {"status": "completed"}, "design": {"status": "completed"}, "production": {"status": "in_progress"}}'::jsonb,
  '[{"id": "l1", "action": "สร้างโครงการผลิต JOB-2026-001", "user": "เกรียงไกร", "timestamp": "2026-08-01T10:30:00Z"}]'::jsonb
) ON CONFLICT (id) DO NOTHING;
`;

  const handleCopySql = () => {
    navigator.clipboard.writeText(fullSqlScript);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-800 text-white p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-md">
              <Database className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-extrabold tracking-tight">ตั้งค่าการเชื่อมต่อ Supabase Database</h2>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-400/30 text-blue-100 border border-blue-300/30">
                  Cloud DB
                </span>
              </div>
              <p className="text-xs text-blue-100 mt-0.5">จัดการฐานข้อมูลและสคริปต์ SQL สำหรับ Niitan Tracker</p>
            </div>
          </div>

          <button 
            onClick={onClose} 
            className="p-2 text-blue-100 hover:text-white hover:bg-white/10 rounded-xl transition-colors text-lg"
          >
            ✕
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          
          {/* Supabase URL Info Box */}
          <div className="bg-slate-50 rounded-2xl border border-slate-200 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Supabase Project URL</span>
              <span className="font-mono text-sm font-bold text-slate-800 break-all">{SUPABASE_URL}</span>
            </div>
            <a 
              href={`${SUPABASE_URL}`} 
              target="_blank" 
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-xl text-xs font-bold transition-all shrink-0"
            >
              เปิด Supabase Dashboard
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* Connection Status Banner */}
          {connectionStatus === 'success' && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl p-4 flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <div>
                <h4 className="text-xs font-bold">เชื่อมต่อ Supabase Database สำเร็จ!</h4>
                <p className="text-xs text-emerald-700">ระบบสามารถรับ-ส่งข้อมูลกับ Supabase Cloud ได้เรียบร้อยแล้ว</p>
              </div>
            </div>
          )}

          {connectionStatus === 'error' && (
            <div className="bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold">พบข้อผิดพลาดในการเชื่อมต่อ</h4>
                <p className="text-xs text-rose-700 mt-0.5">{errorMessage}</p>
              </div>
            </div>
          )}

          {/* API Key Form */}
          <form onSubmit={handleSaveKey} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Key className="w-4 h-4 text-blue-600" />
                  Supabase Anon Public Key (API Key)
                </span>
                <a
                  href={`${SUPABASE_URL}/project/_/settings/api`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs font-medium text-blue-600 hover:underline flex items-center gap-1"
                >
                  หา Key ได้จากที่ไหน?
                  <ExternalLink className="w-3 h-3" />
                </a>
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={anonKey}
                  onChange={(e) => setAnonKey(e.target.value)}
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                  className="w-full pl-4 pr-24 py-3 rounded-2xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm font-mono transition-all"
                />
                <button
                  type="button"
                  onClick={testConnection}
                  disabled={connectionStatus === 'testing'}
                  className="absolute right-2 top-2 bottom-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all flex items-center gap-1"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${connectionStatus === 'testing' ? 'animate-spin' : ''}`} />
                  ทดสอบ
                </button>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                คีย์ public anon key จะถูกบันทึกปลอดภัยไว้ใช้เชื่อมต่อ database ภายในแอป
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="submit"
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-xs font-bold transition-all shadow-md flex items-center gap-1.5"
              >
                <ShieldCheck className="w-4 h-4" />
                บันทึกการตั้งค่า Key & เชื่อมต่อ DB
              </button>
            </div>
          </form>

          {/* SQL Script Step-by-Step Instructions */}
          <div className="border-t border-slate-200 pt-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileCode2 className="w-5 h-5 text-indigo-600" />
                <h3 className="text-sm font-extrabold text-slate-900">ขั้นตอนสร้าง Database บน Supabase (SQL Script)</h3>
              </div>
              <button
                onClick={handleCopySql}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all"
              >
                {copiedSql ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-600" />
                    คัดลอก SQL เรียบร้อย!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    คัดลอกคำสั่ง SQL ทั้งหมด
                  </>
                )}
              </button>
            </div>

            <div className="bg-slate-900 text-slate-100 rounded-2xl p-4 text-xs font-mono overflow-x-auto max-h-60 border border-slate-800">
              <pre>{fullSqlScript}</pre>
            </div>

            <div className="bg-indigo-50/80 border border-indigo-100 rounded-2xl p-4 space-y-2">
              <h4 className="text-xs font-bold text-indigo-900 flex items-center gap-1.5">
                📌 วิธีรันคำสั่ง SQL สร้าง Database ใน Supabase:
              </h4>
              <ol className="text-xs text-indigo-800 space-y-1 pl-5 list-decimal font-medium">
                <li>
                  กดคัดลอก SQL สคริปต์ด้านบน หรือคัดลอกไฟล์ <code className="bg-indigo-100 px-1 py-0.5 rounded font-mono">schema.sql</code> ในโปรเจกต์
                </li>
                <li>
                  ไปที่ Supabase Dashboard ( project: <code className="bg-indigo-100 px-1 py-0.5 rounded font-mono font-bold">vvscpbgwgmnawwkymeqg</code> )
                </li>
                <li>
                  เลือกเมนู <strong>SQL Editor</strong> ทางซ้ายมือ แล้วกด <strong>New Query</strong>
                </li>
                <li>
                  วางคำสั่ง SQL ที่คัดลอกมา แล้วกดปุ่ม <strong>Run (Ctrl+Enter)</strong>
                </li>
                <li>
                  ตาราง <code className="bg-indigo-100 px-1 py-0.5 rounded font-mono font-bold">jobs</code>, <code className="bg-indigo-100 px-1 py-0.5 rounded font-mono font-bold">notifications</code> และข้อมูลตัวอย่างจะถูกสร้างโดยอัตโนมัติ!
                </li>
              </ol>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}
