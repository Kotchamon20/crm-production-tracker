import { WORKFLOW_STAGES } from '../data/mockData';
import { Calendar, AlertTriangle, CheckCircle2, ChevronRight, User } from 'lucide-react';

export default function GanttView({ jobs, onSelectJob }) {
  return (
    <div className="space-y-6 w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Timeline / Gantt Chart ภาพรวมขั้นตอนกระบวนการผลิต
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            แสดงลำดับและสถานะย่อยทั้ง 8 ขั้นตอนสำหรับทุกออเดอร์ในรูปแบบ Timeline ความละเอียดสูง
          </p>
        </div>

        {/* Clean Legend */}
        <div className="flex flex-wrap items-center gap-4 text-xs bg-white px-4 py-2.5 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            <span className="text-slate-600">เสร็จสิ้น (Completed)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
            <span className="text-slate-600">กำลังทำ (In Progress)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
            <span className="text-slate-600 font-semibold text-rose-600">ล่าช้ากว่ากำหนด (Overdue)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-200"></span>
            <span className="text-slate-500">รอคิว (Pending)</span>
          </div>
        </div>
      </div>

      {/* Gantt Matrix Table - Full Width */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1100px]">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200/80 text-slate-600 text-xs">
                <th className="py-4 px-6 font-semibold w-80 sticky left-0 bg-slate-50/95 backdrop-blur-md border-r border-slate-200/80 z-10">
                  รายละเอียดออเดอร์ (Job ID & Project)
                </th>
                {WORKFLOW_STAGES.map((st) => (
                  <th key={st.id} className="py-4 px-3 font-semibold text-center w-36 border-r border-slate-100 last:border-r-0">
                    <div className="text-slate-900">{st.shortLabel}</div>
                    <span className="text-[10px] text-slate-400 font-normal">~{st.defaultDays} วัน</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {jobs.map((job) => {
                const hasDelayedStage = Object.values(job.stages).some(s => s.status === 'delayed');

                return (
                  <tr 
                    key={job.id} 
                    className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                    onClick={() => onSelectJob(job.id)}
                  >
                    {/* Left Sticky Column */}
                    <td className="py-4 px-6 sticky left-0 bg-white group-hover:bg-slate-50/90 border-r border-slate-200/80 z-10">
                      <div className="flex flex-col space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-mono font-bold text-blue-600 text-xs">{job.id}</span>
                          {hasDelayedStage && (
                            <span className="inline-flex items-center gap-1 bg-rose-100 text-rose-700 text-[10px] px-2 py-0.5 rounded-full font-bold">
                              <AlertTriangle className="w-3 h-3" /> ล่าช้า
                            </span>
                          )}
                        </div>
                        <span className="font-bold text-slate-800 text-xs truncate max-w-[240px]" title={job.project_name}>
                          {job.project_name}
                        </span>
                        <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                          <span className="text-slate-400 font-mono">จำนวน: {job.specifications?.quantity?.toLocaleString()} ชิ้น</span>
                          <span className="font-semibold text-slate-700">{job.due_date}</span>
                        </div>
                      </div>
                    </td>

                    {/* Stage Gantt Cells */}
                    {WORKFLOW_STAGES.map((st) => {
                      const stageData = job.stages[st.id] || {};
                      const status = stageData.status || 'pending';

                      return (
                        <td key={st.id} className="py-4 px-2 align-middle border-r border-slate-100 last:border-r-0">
                          <div className="flex flex-col items-center justify-center space-y-1">
                            
                            {/* Bar / Node Indicator */}
                            {status === 'completed' ? (
                              <div className="w-full py-1.5 px-2 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold text-[11px] text-center flex items-center justify-center gap-1">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                <span>เสร็จแล้ว</span>
                              </div>
                            ) : status === 'delayed' ? (
                              <div className="w-full py-1.5 px-2 rounded-lg bg-rose-50 text-rose-800 border border-rose-200 font-bold text-[11px] text-center flex items-center justify-center gap-1 animate-pulse">
                                <AlertTriangle className="w-3 h-3 text-rose-600" />
                                <span>เกินกำหนด</span>
                              </div>
                            ) : status === 'in_progress' ? (
                              <div className="w-full py-1.5 px-2 rounded-lg bg-blue-600 text-white font-bold text-[11px] text-center shadow-2xs flex items-center justify-center gap-1">
                                <span className="w-2 h-2 rounded-full bg-white animate-ping"></span>
                                <span>กำลังทำ</span>
                              </div>
                            ) : (
                              <div className="w-full py-1.5 px-2 rounded-lg bg-slate-100/80 text-slate-400 border border-slate-200/60 text-[11px] text-center font-medium">
                                รอคิว
                              </div>
                            )}

                            {/* Target date hint */}
                            {stageData.due_date && (
                              <span className="text-[10px] text-slate-400 truncate">
                                {stageData.due_date}
                              </span>
                            )}
                          </div>
                        </td>
                      );
                    })}

                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
