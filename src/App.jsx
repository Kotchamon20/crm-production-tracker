import { useState, useEffect, useCallback } from 'react';
import { 
  LayoutDashboard, PlusCircle, BarChart3, Clock, Bell, Kanban, Calendar,
  Layers, Shield, Sparkles, CheckCircle2, AlertTriangle, FileSpreadsheet, MessageSquare, Database, RefreshCw
} from 'lucide-react';
import Dashboard from './components/Dashboard';
import JobForm from './components/JobForm';
import GanttView from './components/GanttView';
import ReportsExport from './components/ReportsExport';
import RoleBadge from './components/RoleBadge';
import NotificationPopover from './components/NotificationPopover';
import JobDetailModal from './components/JobDetailModal';
import LineNotifySettings from './components/LineNotifySettings';
import SupabaseSettingsModal from './components/SupabaseSettingsModal';
import { INITIAL_JOBS, INITIAL_NOTIFICATIONS } from './data/mockData';
import { 
  isSupabaseConfigured, 
  fetchJobsFromSupabase, 
  saveJobToSupabase, 
  deleteJobFromSupabase,
  purgeMockDataFromSupabase,
  fetchNotificationsFromSupabase, 
  saveNotificationToSupabase,
  markNotificationReadInSupabase,
  markAllNotificationsReadInSupabase
} from './lib/supabase';
import { notifyJobCreated, notifyJobStatusUpdated, checkAndSendDueReminders, sendTestLineNotification } from './lib/lineNotify';

function App() {
  // Load state from localStorage or initial mock data
  const [jobs, setJobs] = useState(() => {
    const saved = localStorage.getItem('niitan_crm_jobs');
    const list = saved ? JSON.parse(saved) : INITIAL_JOBS;
    return (list || []).filter(j => !j.is_mock && !String(j.id).startsWith('JOB-2026-00'));
  });

  const [notifications, setNotifications] = useState(() => {
    const saved = localStorage.getItem('niitan_crm_notifications');
    const list = saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
    return (list || []).filter(n => n.job_id !== 'JOB-2026-001' && n.job_id !== 'JOB-2026-002');
  });

  const [userRole, setUserRole] = useState(() => {
    return localStorage.getItem('niitan_crm_role') || 'admin';
  });

  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard' | 'gantt' | 'reports' | 'new'
  const [selectedJobId, setSelectedJobId] = useState(null);
  const [isLineModalOpen, setIsLineModalOpen] = useState(false);
  const [isSupabaseModalOpen, setIsSupabaseModalOpen] = useState(false);
  const [isDbConnected, setIsDbConnected] = useState(isSupabaseConfigured());

  // Load data from Supabase DB on startup / key change
  const loadDataFromSupabase = useCallback(async () => {
    if (!isSupabaseConfigured()) {
      setIsDbConnected(false);
      return;
    }

    try {
      // Purge mock/seed data from DB (runs once per device)
      await purgeMockDataFromSupabase();

      const [remoteJobs, remoteNotifs] = await Promise.all([
        fetchJobsFromSupabase(),
        fetchNotificationsFromSupabase()
      ]);

      if (Array.isArray(remoteJobs)) {
        setJobs(remoteJobs);
      }
      if (Array.isArray(remoteNotifs)) {
        setNotifications(remoteNotifs);
      }
      setIsDbConnected(true);
    } catch (err) {
      console.warn('Supabase DB load failed:', err);
      setIsDbConnected(false);
    }
  }, []);

  useEffect(() => {
    loadDataFromSupabase();
  }, [loadDataFromSupabase]);

  // Check for upcoming 1-day reminders and overdue jobs automatically
  useEffect(() => {
    if (jobs && jobs.length > 0) {
      // If Supabase is configured, wait until real DB jobs are loaded before checking reminders
      if (isSupabaseConfigured() && !isDbConnected) return;
      checkAndSendDueReminders(jobs).catch(() => {});
    }
  }, [jobs, isDbConnected]);

  // Sync state to localStorage
  useEffect(() => {
    localStorage.setItem('niitan_crm_jobs', JSON.stringify(jobs));
  }, [jobs]);

  useEffect(() => {
    localStorage.setItem('niitan_crm_notifications', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem('niitan_crm_role', userRole);
  }, [userRole]);

  // Handlers
  const handleCreateJob = async (newJob) => {
    try {
      const savedJob = await saveJobToSupabase(newJob);
      const finalJob = savedJob || newJob;

      const updatedJobs = [finalJob, ...jobs.filter(j => j.id !== finalJob.id)];
      setJobs(updatedJobs);
      localStorage.setItem('niitan_crm_jobs', JSON.stringify(updatedJobs));

      const newNotif = {
        id: `n-${Date.now()}`,
        job_id: finalJob.id,
        title: '✨ โครงการผลิตสินค้าใหม่เปิดเรียบร้อย',
        message: `${finalJob.id} (${finalJob.project_name}) เข้าสู่กระบวนการติดตามงานผลิต`,
        timestamp: new Date().toISOString(),
        read: false,
        type: 'info'
      };
      setNotifications([newNotif, ...notifications]);
      saveNotificationToSupabase(newNotif).catch(() => {});

      setActiveTab('dashboard');
      notifyJobCreated(finalJob).catch(() => {});
    } catch (e) {
      console.error('Could not sync created job to Supabase:', e);
      alert('⚠️ ไม่สามารถสร้างข้อมูลใน Supabase DB ได้: ' + (e.message || e));
    }
  };

  const handleUpdateJob = async (updatedJob) => {
    try {
      const savedJob = await saveJobToSupabase(updatedJob);
      const finalJob = savedJob || updatedJob;

      const newJobs = jobs.map(j => j.id === finalJob.id ? finalJob : j);
      setJobs(newJobs);
      localStorage.setItem('niitan_crm_jobs', JSON.stringify(newJobs));
      notifyJobStatusUpdated(finalJob, finalJob.current_stage || 'อัปเดตงาน', userRole).catch(() => {});
    } catch (e) {
      console.error('Could not sync updated job to Supabase:', e);
      alert('⚠️ ไม่สามารถบันทึกข้อมูลไปยัง Supabase DB ได้: ' + (e.message || e));
    }
  };

  const handleDeleteJob = async (jobId) => {
    if (!window.confirm(`⚠️ คุณแน่ใจหรือไม่ว่าต้องการลบโครงการ ${jobId} ออกจากระบบ?`)) return;
    
    try {
      await deleteJobFromSupabase(jobId);
      const updatedJobs = jobs.filter(j => j.id !== jobId);
      setJobs(updatedJobs);
      localStorage.setItem('niitan_crm_jobs', JSON.stringify(updatedJobs));
      if (selectedJobId === jobId) {
        setSelectedJobId(null);
      }
    } catch (e) {
      console.error('Could not delete job from Supabase:', e);
      alert('⚠️ ไม่สามารถลบข้อมูลจาก Supabase DB ได้: ' + (e.message || e));
    }
  };

  const handleMarkAsRead = (notifId) => {
    setNotifications(notifications.map(n => n.id === notifId ? { ...n, read: true } : n));
    markNotificationReadInSupabase(notifId).catch(() => {});
  };

  const handleMarkAllRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
    markAllNotificationsReadInSupabase().catch(() => {});
  };

  const selectedJob = jobs.find(j => j.id === selectedJobId);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans antialiased flex flex-col">
      
      {/* Edge to Edge Header Navigation */}
      <nav className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/80 shadow-2xs">
        <div className="w-full px-4 sm:px-6 lg:px-10">
          <div className="flex items-center justify-between h-16">
            
            {/* Left Brand & Tabs Navigation */}
            <div className="flex items-center gap-8">
              <div 
                onClick={() => setActiveTab('dashboard')} 
                className="flex items-center gap-3 cursor-pointer group"
              >
                <img 
                  src="/nitan-logo.png" 
                  alt="Nitan Logo" 
                  className="w-10 h-10 rounded-xl object-contain bg-black p-1 shadow-sm border border-slate-800 group-hover:border-blue-600 transition-all" 
                />
                <div className="flex flex-col">
                  <span className="font-bold text-lg tracking-tight text-slate-900 leading-none">
                    Nitan<span className="text-blue-600">Tracker</span>
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium tracking-wide">
                    Internal Production Workflow
                  </span>
                </div>
              </div>

              {/* Clean Navigation Links */}
              <div className="hidden md:flex items-center space-x-1">
                <button
                  onClick={() => setActiveTab('dashboard')}
                  className={`inline-flex items-center px-3.5 py-2 text-xs font-semibold rounded-xl transition-all ${
                    activeTab === 'dashboard'
                      ? 'text-blue-600 bg-blue-50/80'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                  }`}
                >
                  <Kanban className="w-4 h-4 mr-1.5" />
                  เมทริกซ์ติดตามงาน (Matrix)
                </button>

                <button
                  onClick={() => setActiveTab('gantt')}
                  className={`inline-flex items-center px-3.5 py-2 text-xs font-semibold rounded-xl transition-all ${
                    activeTab === 'gantt'
                      ? 'text-blue-600 bg-blue-50/80'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                  }`}
                >
                  <Calendar className="w-4 h-4 mr-1.5" />
                  ผังเวลาผลิต (Gantt Chart)
                </button>

                <button
                  onClick={() => setActiveTab('reports')}
                  className={`inline-flex items-center px-3.5 py-2 text-xs font-semibold rounded-xl transition-all ${
                    activeTab === 'reports'
                      ? 'text-blue-600 bg-blue-50/80'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                  }`}
                >
                  <BarChart3 className="w-4 h-4 mr-1.5" />
                  สรุปรายงาน & Export
                </button>

                {(userRole === 'marketing' || userRole === 'admin' || userRole === 'sales' || userRole === 'production') && (
                  <button
                    onClick={() => setActiveTab('new')}
                    className={`inline-flex items-center px-3.5 py-2 text-xs font-semibold rounded-xl transition-all ${
                      activeTab === 'new'
                        ? 'text-blue-600 bg-blue-50/80'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                    }`}
                  >
                    <PlusCircle className="w-4 h-4 mr-1.5" />
                    สร้างงานใหม่
                  </button>
                )}
              </div>
            </div>

            {/* Right Tools: Role Switcher & Notifications */}
            <div className="flex items-center gap-2.5">
              <RoleBadge 
                currentRole={userRole} 
                onRoleChange={(roleId) => setUserRole(roleId)} 
              />

              <NotificationPopover 
                notifications={notifications}
                onMarkAsRead={handleMarkAsRead}
                onMarkAllRead={handleMarkAllRead}
                onSelectJob={(jobId) => setSelectedJobId(jobId)}
              />
            </div>

          </div>
        </div>
      </nav>

      {/* Main Content Area - Edge to Edge Full Width Container */}
      <main className="w-full px-4 sm:px-6 lg:px-10 py-6">
        {activeTab === 'dashboard' && (
          <Dashboard 
            jobs={jobs} 
            userRole={userRole}
            onSelectJob={(jobId) => setSelectedJobId(jobId)} 
            onCreateNewClick={() => setActiveTab('new')}
            onDeleteJob={handleDeleteJob}
            onUpdateJob={handleUpdateJob}
          />
        )}

        {activeTab === 'gantt' && (
          <GanttView 
            jobs={jobs} 
            onSelectJob={(jobId) => setSelectedJobId(jobId)} 
          />
        )}

        {activeTab === 'reports' && (
          <ReportsExport 
            jobs={jobs} 
          />
        )}

        {activeTab === 'new' && (
          <JobForm 
            onCreateJob={handleCreateJob} 
            userRole={userRole}
          />
        )}
      </main>

      {/* Modal Stage Inspector */}
      {selectedJob && (
        <JobDetailModal 
          job={selectedJob}
          userRole={userRole}
          onClose={() => setSelectedJobId(null)}
          onUpdateJob={handleUpdateJob}
          onDeleteJob={handleDeleteJob}
        />
      )}

      {/* LINE Group Notification Settings Modal */}
      <LineNotifySettings
        isOpen={isLineModalOpen}
        onClose={() => setIsLineModalOpen(false)}
      />

      {/* Supabase Database Settings Modal */}
      <SupabaseSettingsModal
        isOpen={isSupabaseModalOpen}
        onClose={() => setIsSupabaseModalOpen(false)}
        onRefreshData={loadDataFromSupabase}
      />

    </div>
  );
}

export default App;

