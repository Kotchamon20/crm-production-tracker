import { createClient } from '@supabase/supabase-js';

// Default Supabase project URL provided by user
export const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://vvscpbgwgmnawwkymeqg.supabase.co';

// Get Anon Key from Env or LocalStorage for dynamic user key input
export const getStoredAnonKey = () => {
  return import.meta.env.VITE_SUPABASE_ANON_KEY || localStorage.getItem('niitan_supabase_anon_key') || '';
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
  return data;
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
    .select()
    .single();

  if (error) {
    console.error('Supabase saveJob error:', error);
    throw error;
  }
  return data;
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
