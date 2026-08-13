import { useState, useEffect, useCallback } from 'react';
import { 
  LayoutDashboard, PlusCircle, BarChart3, Clock, Bell, Kanban, Calendar,
  Layers, Shield, Sparkles, CheckCircle2, AlertTriangle, FileSpreadsheet, MessageSquare, Database
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
    return saved ? JSON.parse(saved) : INITIAL_JOBS;
  });

  const [notifications, setNotifications] = useState(() => {
    const saved = localStorage.getItem('niitan_crm_notifications');
    return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
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
      const [remoteJobs, remoteNotifs] = await Promise.all([
        fetchJobsFromSupabase(),
        fetchNotificationsFromSupabase()
      ]);

      if (remoteJobs && remoteJobs.length > 0) {
        setJobs(remoteJobs);
      }
      if (remoteNotifs && remoteNotifs.length > 0) {
        setNotifications(remoteNotifs);
      }
      setIsDbConnected(true);
    } catch (err) {
      console.warn('Supabase DB load failed, using local state:', err);
      setIsDbConnected(false);
    }
  }, []);

  useEffect(() => {
    loadDataFromSupabase();
  }, [loadDataFromSupabase]);

  // Check for upcoming 1-day reminders and overdue jobs automatically
  useEffect(() => {
    if (jobs && jobs.length > 0) {
      checkAndSendDueReminders(jobs).catch(() => {});
    }
  }, [jobs]);

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
    const updatedJobs = [newJob, ...jobs];
    setJobs(updatedJobs);
    
    // Add notification
    const newNotif = {
      id: `n-${Date.now()}`,
      job_id: newJob.id,
      title: '✨ โครงการผลิตสินค้าใหม่เปิดเรียบร้อย',
      message: `${newJob.id} (${newJob.project_name}) เข้าสู่กระบวนการติดตามงานผลิต`,
      timestamp: new Date().toISOString(),
      read: false,
      type: 'info'
    };
    setNotifications([newNotif, ...notifications]);

    setActiveTab('dashboard');

    // Sync to Supabase DB & Send LINE Notification
    try {
      await saveJobToSupabase(newJob);
      await saveNotificationToSupabase(newNotif);
    } catch (e) {
      console.warn('Could not sync created job to Supabase:', e);
    }

    // Send LINE Bot message to group
    notifyJobCreated(newJob).catch(() => {});
  };

  const handleUpdateJob = async (updatedJob) => {
    setJobs(jobs.map(j => j.id === updatedJob.id ? updatedJob : j));

    // Sync to Supabase DB if connected
    try {
      await saveJobToSupabase(updatedJob);
    } catch (e) {
      console.warn('Could not sync updated job to Supabase:', e);
    }

    // Send LINE Bot message to group
    notifyJobStatusUpdated(updatedJob, updatedJob.current_stage || 'อัปเดตงาน', userRole).catch(() => {});
  };

  const handleDeleteJob = async (jobId) => {
    if (!window.confirm('⚠️ คุณแน่ใจหรือไม่ว่าต้องการลบโครงการนี้ออกจากระบบ?')) return;
    const updatedJobs = jobs.filter(j => j.id !== jobId);
    setJobs(updatedJobs);
    if (selectedJobId === jobId) {
      setSelectedJobId(null);
    }
    try {
      await deleteJobFromSupabase(jobId);
    } catch (e) {
      console.warn('Could not delete job from Supabase:', e);
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

            {/* Right Tools: Test LINE Button, Role Switcher & Notifications */}
            <div className="flex items-center gap-2.5">
              <button
                onClick={async () => {
                  const success = await sendTestLineNotification();
                  alert(success ? '🚀 ส่งการ์ดแจ้งเตือนทดสอบเข้า LINE เรียบร้อยแล้ว!' : '⚠️ ส่งข้อความทดสอบไปยัง LINE');
                }}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200/80 rounded-xl text-xs font-bold transition-all shadow-2xs cursor-pointer"
                title="ทดสอบยิงข้อความเข้า LINE"
              >
                <MessageSquare className="w-4 h-4 text-emerald-600" />
                ทดสอบส่ง LINE
              </button>

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

