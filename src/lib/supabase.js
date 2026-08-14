import { createClient } from '@supabase/supabase-js';

// Default Supabase project URL & Anon Key
export const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://vvscpbgwgmnawwkymeqg.supabase.co';
export const DEFAULT_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ2c2NwYmd3Z21uYXd3a3ltZXFnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY2MDc4NTgsImV4cCI6MjEwMjE4Mzg1OH0.CNQhHl0VqmkgaxgKANbLIhBSNWc3PVQY4t4h-GA0P00';

// Get Anon Key from Env, LocalStorage, or Default Fallback
export const getStoredAnonKey = () => {
  const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  if (envKey && envKey.trim()) return envKey.trim();
  const storedKey = localStorage.getItem('niitan_supabase_anon_key');
  if (storedKey && storedKey.trim()) return storedKey.trim();
  return DEFAULT_ANON_KEY;
};

export const setStoredAnonKey = (key) => {
  if (key) {
    localStorage.setItem('niitan_supabase_anon_key', key.trim());
  } else {
    localStorage.removeItem('niitan_supabase_anon_key');
  }
};

let supabaseInstance = null;

export const getSupabaseClient = () => {
  const anonKey = getStoredAnonKey();
  if (!anonKey) return null;
  
  if (!supabaseInstance) {
    supabaseInstance = createClient(SUPABASE_URL, anonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false
      }
    });
  }
  return supabaseInstance;
};

export const resetSupabaseClient = () => {
  supabaseInstance = null;
};

export const isSupabaseConfigured = () => {
  return Boolean(getStoredAnonKey());
};

// ----------------------------------------------------
// Supabase Database Data Services
// ----------------------------------------------------

/**
 * Normalize fetched job: clear start_date/due_date from 'pending' stages
 * so the UI always shows blank dates for stages that haven't started yet.
 */
const normalizePendingStages = (job) => {
  if (!job || !job.stages) return job;
  const cleanedStages = {};
  for (const [stageId, stageData] of Object.entries(job.stages)) {
    if (stageData?.status === 'pending') {
      cleanedStages[stageId] = { ...stageData, start_date: '', due_date: '' };
    } else {
      cleanedStages[stageId] = stageData;
    }
  }
  return { ...job, stages: cleanedStages };
};

/**
 * Fetch all production jobs from Supabase
 */
export const fetchJobsFromSupabase = async () => {
  const client = getSupabaseClient();
  if (!client) throw new Error('Supabase Anon Key is not configured');

  const { data, error } = await client
    .from('jobs')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Supabase fetchJobs error:', error);
    throw error;
  }
  // Normalize: clear dates from pending stages before returning
  return (data || []).map(normalizePendingStages);
};

/**
 * Save or update a single job in Supabase
 */
export const saveJobToSupabase = async (job) => {
  const client = getSupabaseClient();
  if (!client) throw new Error('Supabase Anon Key is not configured');

  const payload = {
    id: job.id,
    project_name: job.project_name,
    product_type: job.product_type,
    specifications: job.specifications || {},
    start_date: job.start_date || null,
    due_date: job.due_date || null,
    on_sale_date: job.on_sale_date || null,
    responsibles: job.responsibles || [],
    current_stage: job.current_stage || 'start',
    stages: job.stages || {},
    audit_logs: job.audit_logs || [],
    updated_at: new Date().toISOString()
  };

  const { data, error } = await client
    .from('jobs')
    .upsert(payload, { onConflict: 'id' })
    .select();

  if (error) {
    console.error('Supabase saveJob error:', error);
    throw error;
  }
  return (data && data.length > 0) ? data[0] : payload;
};

/**
 * Delete a job from Supabase by ID
 */
export const deleteJobFromSupabase = async (jobId) => {
  const client = getSupabaseClient();
  if (!client) throw new Error('Supabase Anon Key is not configured');

  const { error } = await client
    .from('jobs')
    .delete()
    .eq('id', jobId);

  if (error) {
    console.error('Supabase deleteJob error:', error);
    throw error;
  }
  return true;
};

/**
 * One-time cleanup: delete seed/mock data from Supabase DB
 * Removes JOB-2026-001, JOB-2026-002 and their notifications.
 * Also clears the notified_reminders cache that may reference them.
 */
const MOCK_JOB_IDS = ['JOB-2026-001', 'JOB-2026-002'];

export const purgeMockDataFromSupabase = async () => {
  // Only run once per device
  if (localStorage.getItem('niitan_mock_purged') === 'true') return;

  const client = getSupabaseClient();
  if (!client) return;

  try {
    // Delete mock jobs from DB
    await client
      .from('jobs')
      .delete()
      .in('id', MOCK_JOB_IDS);

    // Delete mock notifications from DB
    await client
      .from('notifications')
      .delete()
      .in('job_id', MOCK_JOB_IDS);

    // Clear notified_reminders cache in DB (may contain mock job keys)
    await client
      .from('app_settings')
      .delete()
      .eq('key', 'notified_reminders');

    // Clear local notified_reminders cache
    localStorage.removeItem('niitan_notified_reminders');

    // Mark as done
    localStorage.setItem('niitan_mock_purged', 'true');
    console.log('✅ Mock/seed data purged from Supabase DB successfully.');
  } catch (e) {
    console.warn('Could not purge mock data from Supabase:', e);
  }
};

/**
 * Fetch notifications from Supabase
 */
export const fetchNotificationsFromSupabase = async () => {
  const client = getSupabaseClient();
  if (!client) throw new Error('Supabase Anon Key is not configured');

  const { data, error } = await client
    .from('notifications')
    .select('*')
    .order('timestamp', { ascending: false });

  if (error) {
    console.error('Supabase fetchNotifications error:', error);
    throw error;
  }
  return data;
};

/**
 * Insert new notification
 */
export const saveNotificationToSupabase = async (notification) => {
  const client = getSupabaseClient();
  if (!client) throw new Error('Supabase Anon Key is not configured');

  const payload = {
    id: notification.id,
    job_id: notification.job_id || null,
    title: notification.title,
    message: notification.message || '',
    timestamp: notification.timestamp || new Date().toISOString(),
    read: notification.read || false,
    type: notification.type || 'info'
  };

  const { data, error } = await client
    .from('notifications')
    .upsert(payload, { onConflict: 'id' })
    .select()
    .single();

  if (error) {
    console.error('Supabase saveNotification error:', error);
    throw error;
  }
  return data;
};

/**
 * Mark notification as read
 */
export const markNotificationReadInSupabase = async (id) => {
  const client = getSupabaseClient();
  if (!client) return;

  const { error } = await client
    .from('notifications')
    .update({ read: true })
    .eq('id', id);

  if (error) console.error('Supabase markNotificationRead error:', error);
};

/**
 * Mark all notifications as read
 */
export const markAllNotificationsReadInSupabase = async () => {
  const client = getSupabaseClient();
  if (!client) return;

  const { error } = await client
    .from('notifications')
    .update({ read: true })
    .eq('read', false);

  if (error) console.error('Supabase markAllNotificationsRead error:', error);
};

/**
 * App Settings (e.g., LINE Notify settings)
 */
export const fetchAppSettingFromSupabase = async (key) => {
  const client = getSupabaseClient();
  if (!client) return null;

  const { data, error } = await client
    .from('app_settings')
    .select('value')
    .eq('key', key)
    .maybeSingle();

  if (error) {
    console.error(`Supabase fetchAppSetting [${key}] error:`, error);
    return null;
  }
  return data ? data.value : null;
};

export const saveAppSettingToSupabase = async (key, value) => {
  const client = getSupabaseClient();
  if (!client) return null;

  const { data, error } = await client
    .from('app_settings')
    .upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: 'key' })
    .select()
    .single();

  if (error) {
    console.error(`Supabase saveAppSetting [${key}] error:`, error);
  }
  return data;
};
