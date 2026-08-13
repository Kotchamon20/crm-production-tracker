import { useState } from 'react';
import { 
  Search, Filter, AlertTriangle, CheckCircle2, Clock, ChevronRight, 
  ExternalLink, Layers, PlusCircle, Paperclip, Eye, AlertCircle
} from 'lucide-react';
import { WORKFLOW_STAGES } from '../data/mockData';

export default function Dashboard({ jobs, userRole, onSelectJob, onCreateNewClick }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStageFilter, setSelectedStageFilter] = useState('all');
  const [showOnlyDelayed, setShowOnlyDelayed] = useState(false);

  // Compute summary metric metrics
  const totalJobs = jobs.length;
  const delayedJobsCount = jobs.filter(j => Object.values(j.stages).some(s => s.status === 'delayed')).length;
  const inProgressJobsCount = jobs.filter(j => j.current_stage !== 'complete' || j.stages.complete?.status !== 'completed').length;
  const completedJobsCount = jobs.filter(j => j.current_stage === 'complete' && j.stages.complete?.status === 'completed').length;

  // Filter jobs logic
  const filteredJobs = jobs.filter((job) => {
    const matchesSearch = 
      job.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.project_name.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStage = selectedStageFilter === 'all' || job.current_stage === selectedStageFilter;
    const isDelayed = Object.values(job.stages).some(s => s.status === 'delayed');
    const matchesDelayed = !showOnlyDelayed || isDelayed;

    return matchesSearch && matchesStage && matchesDelayed;
  });

  return (
    <div className="space-y-6 w-full">
      
      {/* Top Banner & Stat Cards - Clean Full Width Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500">ออเดอร์ทั้งหมดในระบบ</p>
            <h3 className="text-2xl font-extrabold text-slate-900 mt-1">{totalJobs}</h3>
          </div>
          <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold">
            <Layers className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500">กำลังดำเนินงาน</p>
            <h3 className="text-2xl font-extrabold text-blue-600 mt-1">{inProgressJobsCount}</h3>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        {/* OVERDUE HIGHLIGHT CARD */}
        <div 
          onClick={() => setShowOnlyDelayed(!showOnlyDelayed)}
          className={`p-5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
            delayedJobsCount > 0 
              ? 'bg-rose-50/70 border-rose-200 hover:bg-rose-100/70 shadow-2xs' 
              : 'bg-white border-slate-200/80'
          }`}
        >
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-rose-700">ล่าช้ากว่ากำหนด (Overdue)</span>
              {delayedJobsCount > 0 && (
                <span className="w-2 h-2 rounded-full bg-rose-600 animate-ping"></span>
              )}
            </div>
            <h3 className="text-2xl font-extrabold text-rose-600 mt-1">{delayedJobsCount}</h3>
          </div>
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${
            delayedJobsCount > 0 ? 'bg-rose-600 text-white shadow-sm' : 'bg-slate-100 text-slate-400'
          }`}>
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500">เสร็จสมบูรณ์ / จัดส่งแล้ว</p>
            <h3 className="text-2xl font-extrabold text-emerald-600 mt-1">{completedJobsCount}</h3>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Overdue Warning Banner */}
      {delayedJobsCount > 0 && (
        <div className="bg-rose-600 text-white p-4 rounded-2xl shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5 text-white" />
            </div>
            <div>
              <h4 className="font-bold text-sm">พบงานล่าช้ากว่ากำหนด (Overdue) {delayedJobsCount} ออเดอร์</h4>
              <p className="text-xs text-rose-100 mt-0.5">
                มีขั้นตอนที่เกินกำหนดส่งมอบเป้าหมาย โปรดตรวจสอบและติดตามเร่งรัดในสายงาน
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowOnlyDelayed(!showOnlyDelayed)}
            className="bg-white text-rose-700 hover:bg-rose-50 text-xs font-bold px-3.5 py-2 rounded-xl transition-colors shrink-0 shadow-2xs"
          >
            {showOnlyDelayed ? 'แสดงทุกงานทั้งหมด' : 'กรองเฉพาะงานที่ล่าช้า'}
          </button>
        </div>
      )}

      {/* Clean Filter & Search Header */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          {/* Search Box */}
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="ค้นหา Job ID, ชื่อลูกค้า, ชื่อโปรเจกต์..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 bg-slate-50/50 text-xs focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            />
          </div>

          {/* Stage Filter Dropdown */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter className="w-4 h-4 text-slate-400 shrink-0" />
            <select
              value={selectedStageFilter}
              onChange={(e) => setSelectedStageFilter(e.target.value)}
              className="w-full sm:w-auto px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50/50 text-xs font-medium focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="all">ทุกขั้นตอน (All 8 Stages)</option>
              {WORKFLOW_STAGES.map(st => (
                <option key={st.id} value={st.id}>{st.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
          <button
            onClick={() => setShowOnlyDelayed(!showOnlyDelayed)}
            className={`px-3.5 py-2 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 border ${
              showOnlyDelayed
                ? 'bg-rose-600 text-white border-rose-600 shadow-2xs'
                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <AlertCircle className="w-3.5 h-3.5" />
            {showOnlyDelayed ? 'กำลังกรอง: ล่าช้าเท่านั้น' : 'กรองเฉพาะงานล่าช้า'}
          </button>

          {(userRole === 'marketing' || userRole === 'admin' || userRole === 'sales') && (
            <button
              onClick={onCreateNewClick}
              className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium text-xs shadow-2xs transition-all shrink-0"
            >
              <PlusCircle className="w-4 h-4 mr-1.5" />
              สร้างงานใหม่
            </button>
          )}
        </div>
      </div>

      {/* 8-Stage Matrix Table - Full Width Clean Design */}
      <div className="bg-white rounded-2xl shadow-2xs border border-slate-200/80 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1280px]">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200/80 text-slate-600 text-xs">
                <th className="py-4 px-6 font-semibold w-80 sticky left-0 bg-slate-50/95 backdrop-blur-md z-10 border-r border-slate-200/80">
                  รายละเอียดออเดอร์ (Job Specifications)
                </th>
                {WORKFLOW_STAGES.map((st) => (
                  <th key={st.id} className="py-4 px-3 font-semibold text-center w-36 border-r border-slate-100 last:border-r-0">
                    <div className="text-slate-900">{st.shortLabel}</div>
                    <span className="text-[10px] text-slate-400 font-normal">({st.role})</span>
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredJobs.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    ไม่พบข้อมูลงานตรงตามเงื่อนไขการค้นหา
                  </td>
                </tr>
              ) : (
                filteredJobs.map((job) => {
                  const isJobDelayed = Object.values(job.stages).some(s => s.status === 'delayed');

                  return (
                    <tr 
                      key={job.id} 
                      className={`hover:bg-slate-50/80 transition-colors group ${
                        isJobDelayed ? 'bg-rose-50/15' : ''
                      }`}
                    >
                      {/* Sticky Left Column */}
                      <td className="py-4 px-6 sticky left-0 bg-white group-hover:bg-slate-50/90 z-10 border-r border-slate-200/80">
                        <div className="flex flex-col space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="font-mono font-bold text-blue-600 text-xs">{job.id}</span>
                            {isJobDelayed && (
                              <span className="bg-rose-100 text-rose-700 text-[10px] px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                                <AlertTriangle className="w-3 h-3" /> ล่าช้า
                              </span>
                            )}
                          </div>

                          <span className="font-bold text-slate-800 text-xs leading-snug truncate" title={job.project_name}>
                            {job.project_name}
                          </span>

                          <div className="flex items-center justify-between pt-1 text-[11px] text-slate-400">
                            <span className="bg-slate-100 px-2 py-0.5 rounded font-mono text-slate-700">
                              {job.specifications?.quantity?.toLocaleString()} ชิ้น
                            </span>
                            <button
                              onClick={() => onSelectJob(job.id)}
                              className="text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1 hover:underline"
                            >
                              <Eye className="w-3 h-3" /> ดู & อัปเดต
                            </button>
                          </div>
                        </div>
                      </td>

                      {/* 8-Stage Columns */}
                      {WORKFLOW_STAGES.map((st) => {
                        const stageData = job.stages[st.id] || {};
                        const status = stageData.status || 'pending';
                        const attachmentCount = stageData.attachments?.length || 0;
                        const isCurrentActiveStage = job.current_stage === st.id;

                        return (
                          <td 
                            key={st.id} 
                            onClick={() => onSelectJob(job.id)}
                            className="py-4 px-3 text-center align-middle border-r border-slate-100 last:border-r-0 cursor-pointer hover:bg-blue-50/30 transition-colors"
                          >
                            <div className="flex flex-col items-center justify-center space-y-1">
                              
                              {/* Status Node Icon */}
                              {status === 'completed' ? (
                                <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center border border-emerald-300">
                                  <CheckCircle2 className="w-4 h-4" />
                                </div>
                              ) : status === 'delayed' ? (
                                <div className="w-7 h-7 rounded-full bg-rose-500 text-white flex items-center justify-center shadow-sm animate-pulse">
                                  <AlertTriangle className="w-4 h-4" />
                                </div>
                              ) : status === 'in_progress' ? (
                                <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-sm ring-4 ring-blue-50">
                                  <span className="w-2.5 h-2.5 bg-white rounded-full"></span>
                                </div>
                              ) : (
                                <div className="w-6 h-6 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center">
                                  <div className="w-1.5 h-1.5 rounded-full bg-slate-300"></div>
                                </div>
                              )}

                              {/* Active Badge */}
                              {isCurrentActiveStage && (
                                <span className="text-[9px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200 uppercase">
                                  Active
                                </span>
                              )}

                              {/* Attachment Indicator */}
                              {attachmentCount > 0 && (
                                <span className="text-[10px] text-indigo-600 font-semibold flex items-center gap-0.5 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-100">
                                  <Paperclip className="w-2.5 h-2.5" />
                                  {attachmentCount}
                                </span>
                              )}
                            </div>
                          </td>
                        );
                      })}

                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
