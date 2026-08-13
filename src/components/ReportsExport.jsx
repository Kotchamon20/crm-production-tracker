import { useState } from 'react';
import { Download, Printer, BarChart3, PieChart, CheckCircle2, AlertTriangle, Clock, FileSpreadsheet, Megaphone } from 'lucide-react';
import { WORKFLOW_STAGES } from '../data/mockData';

export default function ReportsExport({ jobs }) {
  const [selectedMonth, setSelectedMonth] = useState('2026-08');

  // Stats calculation
  const totalJobs = jobs.length;
  const completedJobs = jobs.filter(j => j.current_stage === 'on_sale' || (j.current_stage === 'complete' && j.stages.complete?.status === 'completed')).length;
  const delayedJobs = jobs.filter(j => Object.values(j.stages).some(s => s.status === 'delayed')).length;
  const inProgressJobs = totalJobs - completedJobs;
  const onTimeRate = totalJobs > 0 ? Math.round(((totalJobs - delayedJobs) / totalJobs) * 100) : 100;

  const formatResponsibles = (responsibles) => {
    if (!responsibles) return '';
    if (Array.isArray(responsibles)) {
      return responsibles.map(r => `${r.departmentName || r.role}: ${r.name}`).join(' | ');
    }
    return `Marketing: ${responsibles.marketing || ''}, Design: ${responsibles.designer || ''}, Prod: ${responsibles.production || ''}`;
  };

  // Export to Excel / CSV with UTF-8 BOM for Thai support
  const handleExportCSV = () => {
    const headers = [
      'เลขที่โครงการ (Job ID)',
      'ชื่อโปรเจกต์/สินค้า',
      'ประเภทสินค้า',
      'จำนวนที่ผลิต',
      'วันเริ่มงาน',
      'วันส่งมอบผลิต',
      'วันกำหนดวางขาย (Release Date)',
      'สถานะขั้นตอนปัจจุบัน',
      'สถานะการล่าช้า',
      'ทีมผู้รับผิดชอบตามฝ่าย'
    ];

    const rows = jobs.map(j => {
      const isDelayed = Object.values(j.stages).some(s => s.status === 'delayed');
      const stageLabel = WORKFLOW_STAGES.find(s => s.id === j.current_stage)?.label || j.current_stage;
      return [
        `"${j.id}"`,
        `"${j.project_name.replace(/"/g, '""')}"`,
        `"${j.product_type}"`,
        j.specifications?.quantity || 0,
        `"${j.start_date}"`,
        `"${j.due_date}"`,
        `"${j.on_sale_date || '-'}"`,
        `"${stageLabel}"`,
        isDelayed ? '"ล่าช้ากว่ากำหนด"' : '"ตรงตามกำหนด"',
        `"${formatResponsibles(j.responsibles).replace(/"/g, '""')}"`
      ];
    });

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Internal_Production_Summary_${selectedMonth}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 w-full">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            รายงานและสรุปผลการผลิตสินค้าภายในบริษัท (Internal Production Reports)
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            ภาพรวมประสิทธิภาพการทำงาน 10 ขั้นตอน (Design + Production + Marketing & วางจำหน่าย)
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-medium text-xs shadow-2xs transition-all active:scale-95"
          >
            <FileSpreadsheet className="w-4 h-4 mr-2" />
            Export เป็น Excel (CSV)
          </button>
          <button
            onClick={handlePrint}
            className="inline-flex items-center px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-medium text-xs shadow-2xs transition-all active:scale-95"
          >
            <Printer className="w-4 h-4 mr-2" />
            พิมพ์รายงาน / PDF
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">โครงการทั้งหมด</span>
            <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
              <BarChart3 className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-slate-900 mt-2">{totalJobs} <span className="text-xs text-slate-400 font-normal">โครงการ</span></p>
          <p className="text-[11px] text-slate-400 mt-1">รวมทุกสินค้าผลิตภายในบริษัท</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">กำลังรันกระบวนการ</span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-blue-600 mt-2">{inProgressJobs} <span className="text-xs text-slate-400 font-normal">โครงการ</span></p>
          <p className="text-[11px] text-blue-500 mt-1">อยู่ในกระบวนการผลิต / โปรโมต</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">งานที่เสร็จสิ้น / วางจำหน่าย</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-emerald-600 mt-2">{completedJobs} <span className="text-xs text-slate-400 font-normal">โครงการ</span></p>
          <p className="text-[11px] text-emerald-600 mt-1">พร้อมวางขายหน้าร้าน / ออนไลน์</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">อัตราตรงต่อเวลา (On-Time Rate)</span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <PieChart className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-amber-700 mt-2">{onTimeRate}%</p>
          <p className="text-[11px] text-rose-500 mt-1 font-medium">พบงานล่าช้ากว่ากำหนด {delayedJobs} โครงการ</p>
        </div>
      </div>

      {/* Full Width Clean Summary Data Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="p-5 border-b border-slate-200/80 flex items-center justify-between bg-slate-50/70">
          <h3 className="font-bold text-slate-800 text-sm">
            ตารางสรุปสถานะรายละเอียดโครงการผลิตสินค้าทั้งหมด
          </h3>
          <span className="text-xs text-slate-400">ข้อมูลอัปเดตล่าสุดเรียลไทม์</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse min-w-[1000px]">
            <thead>
              <tr className="bg-slate-100/70 border-b border-slate-200/80 text-slate-600">
                <th className="py-3.5 px-4 font-semibold">Job ID</th>
                <th className="py-3.5 px-4 font-semibold">ชื่อโปรเจกต์ / สินค้า</th>
                <th className="py-3.5 px-4 font-semibold text-center">จำนวน</th>
                <th className="py-3.5 px-4 font-semibold text-center">ส่งมอบผลิต</th>
                <th className="py-3.5 px-4 font-semibold text-center">วันกำหนดวางขาย</th>
                <th className="py-3.5 px-4 font-semibold text-center">Stage ปัจจุบัน</th>
                <th className="py-3.5 px-4 font-semibold text-center">สถานะ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {jobs.map((job) => {
                const isDelayed = Object.values(job.stages).some(s => s.status === 'delayed');
                const isComplete = job.current_stage === 'on_sale' || (job.current_stage === 'complete' && job.stages.complete?.status === 'completed');
                const stageObj = WORKFLOW_STAGES.find(s => s.id === job.current_stage);

                return (
                  <tr key={job.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-blue-600">{job.id}</td>
                    <td className="py-3 px-4 text-slate-800 font-bold">{job.project_name}</td>
                    <td className="py-3 px-4 text-center font-mono">
                      {job.specifications?.quantity?.toLocaleString()} ชิ้น
                    </td>
                    <td className="py-3 px-4 text-center font-medium text-slate-700">{job.due_date}</td>
                    <td className="py-3 px-4 text-center font-bold text-rose-600">{job.on_sale_date || '-'}</td>
                    <td className="py-3 px-4 text-center">
                      <span className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md font-semibold text-[11px]">
                        {stageObj?.shortLabel || job.current_stage}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      {isDelayed ? (
                        <span className="inline-flex items-center gap-1 bg-rose-100 text-rose-700 px-2.5 py-1 rounded-full font-bold text-[11px]">
                          <AlertTriangle className="w-3 h-3" /> ล่าช้ากว่ากำหนด
                        </span>
                      ) : isComplete ? (
                        <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-full font-bold text-[11px]">
                          <CheckCircle2 className="w-3 h-3" /> เสร็จสมบูรณ์ / วางจำหน่าย
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 border border-blue-100 px-2.5 py-1 rounded-full font-semibold text-[11px]">
                          กำลังดำเนินการ
                        </span>
                      )}
                    </td>
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
