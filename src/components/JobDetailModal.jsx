import { useState } from 'react';
import { 
  X, Calendar, Clock, CheckCircle2, AlertTriangle, ExternalLink, 
  FileText, Image as ImageIcon, Link as LinkIcon, User, Plus, 
  History, Settings, ChevronRight, Upload, Save, Check, Shield, Trash2, Megaphone, Building2
} from 'lucide-react';
import { WORKFLOW_STAGES, DEPARTMENTS } from '../data/mockData';

export default function JobDetailModal({ job, userRole, onClose, onUpdateJob }) {
  const [activeTab, setActiveTab] = useState('stages'); // 'stages' | 'specifications' | 'audit_log'
  const [selectedStageId, setSelectedStageId] = useState(job.current_stage || 'start');
  
  // Local state for editing selected stage
  const currentStageData = job.stages[selectedStageId] || {};
  const [stageStatus, setStageStatus] = useState(currentStageData.status || 'pending');
  const [stageAssignee, setStageAssignee] = useState(currentStageData.assignee || '');
  const [stageDueDate, setStageDueDate] = useState(currentStageData.due_date || '');
  const [stageNotes, setStageNotes] = useState(currentStageData.notes || '');
  const [newAttachmentName, setNewAttachmentName] = useState('');
  const [newAttachmentUrl, setNewAttachmentUrl] = useState('');
  const [newAttachmentType, setNewAttachmentType] = useState('link'); // 'link' | 'file' | 'image'
  const [isSavedAlert, setIsSavedAlert] = useState(false);

  // Dynamic team responsibles state linked to DEPARTMENTS
  const initialResponsibles = Array.isArray(job.responsibles) ? job.responsibles : [
    { id: '1', departmentId: 'production', departmentName: 'ฝ่ายผลิต & วางขาย (Production)', name: 'เกรียงไกร การผลิต' },
    { id: '2', departmentId: 'designer', departmentName: 'ฝ่ายออกแบบ (Design)', name: 'วิภาดา ดีไซน์' },
    { id: '3', departmentId: 'marketing', departmentName: 'ฝ่ายการตลาด (Marketing)', name: 'สมหญิง ทำโปรโมท' }
  ];
  const [responsiblesList, setResponsiblesList] = useState(initialResponsibles);
  const [selectedDeptId, setSelectedDeptId] = useState('production');
  const [customDeptTitle, setCustomDeptTitle] = useState('');
  const [newRolePersonName, setNewRolePersonName] = useState('');
  const [showAddRoleForm, setShowAddRoleForm] = useState(false);

  // Current selected stage's linked department info
  const stageDefinition = WORKFLOW_STAGES.find(s => s.id === selectedStageId);
  const linkedStageDept = DEPARTMENTS.find(d => d.id === stageDefinition?.departmentId) || DEPARTMENTS[0];

  // Dynamic hint per stage
  const getStageHint = (stageId) => {
    switch (stageId) {
      case 'start':
        return 'เอกสารการอนุมัติเปิดโครงการผลิตภายในบริษัท';
      case 'design':
        return 'ไฟล์แบบม็อคอัพ 3D, เค้าโครงดีไซน์ หรือลิงก์ไดรฟ์';
      case 'approved':
        return 'ใบอนุมัติแบบจากทีมบริหาร หรือเอกสารยืนยันสเปก';
      case 'edit':
        return 'ไฟล์แบบแก้ไขล่าสุด หรือบันทึกแก้ลายดีไซน์';
      case 'production_order':
        return 'ใบสั่งผลิต PO, เอกสารใบสั่งโรงงาน หรือใบสรุปงาน';
      case 'production':
        return 'รูปถ่ายสายการผลิตจริง, รูปถ่ายหน้างาน หรือความคืบหน้า';
      case 'qc':
        return 'รูปถ่ายตรวจคุณภาพ QC หรือรายงานผลสุ่มตรวจสินค้า';
      case 'complete':
        return 'ใบส่งสินค้าเข้าคลัง, กำหนดวันวางขาย หรือเอกสารรับของ';
      case 'marketing':
        return 'แบนเนอร์โปรโมต, สื่อ Social Media หรือคลิปวิดีโอตัวอย่าง';
      case 'on_sale':
        return 'รูปถ่ายวางจำหน่ายหน้าร้าน หรือลิงก์สต็อกสินค้า (ฝ่าย Production ดูแล)';
      default:
        return 'เอกสารอนุมัติ, รูปถ่าย หรือลิงก์ไดรฟ์';
    }
  };

  // Handlers for dynamic department-person linkage inside Modal
  const handleAddModalRole = (e) => {
    e.preventDefault();
    if (!newRolePersonName) return;

    const deptObj = DEPARTMENTS.find(d => d.id === selectedDeptId);
    const finalDeptName = selectedDeptId === 'custom' ? customDeptTitle : (deptObj?.name || 'ฝ่ายอื่นๆ');

    const updatedList = [
      ...responsiblesList,
      { id: `resp-${Date.now()}`, departmentId: selectedDeptId, departmentName: finalDeptName, name: newRolePersonName }
    ];
    setResponsiblesList(updatedList);
    
    // Save to job
    onUpdateJob({
      ...job,
      responsibles: updatedList,
      audit_logs: [
        {
          id: `log-${Date.now()}`,
          timestamp: new Date().toISOString(),
          user: getRoleUserName(userRole),
          action: `เชื่อมโยงผู้รับผิดชอบใหม่: ${finalDeptName} - ${newRolePersonName}`
        },
        ...job.audit_logs
      ]
    });

    setNewRolePersonName('');
    setCustomDeptTitle('');
    setShowAddRoleForm(false);
  };

  const handleRemoveModalRole = (idToRemove) => {
    const roleObj = responsiblesList.find(r => r.id === idToRemove);
    const updatedList = responsiblesList.filter(r => r.id !== idToRemove);
    setResponsiblesList(updatedList);

    onUpdateJob({
      ...job,
      responsibles: updatedList,
      audit_logs: [
        {
          id: `log-${Date.now()}`,
          timestamp: new Date().toISOString(),
          user: getRoleUserName(userRole),
          action: `ยกเลิกการเชื่อมโยงผู้รับผิดชอบ: ${roleObj?.departmentName || ''}`
        },
        ...job.audit_logs
      ]
    });
  };

  const handleUpdateModalRoleName = (idToUpdate, newName) => {
    const updatedList = responsiblesList.map(r => r.id === idToUpdate ? { ...r, name: newName } : r);
    setResponsiblesList(updatedList);

    onUpdateJob({
      ...job,
      responsibles: updatedList
    });
  };

  const handleUpdateModalRoleDept = (idToUpdate, newDeptId) => {
    const deptObj = DEPARTMENTS.find(d => d.id === newDeptId);
    const updatedList = responsiblesList.map(r => r.id === idToUpdate ? { 
      ...r, 
      departmentId: newDeptId, 
      departmentName: deptObj?.name || newDeptId 
    } : r);
    setResponsiblesList(updatedList);

    onUpdateJob({
      ...job,
      responsibles: updatedList
    });
  };

  // Sync state when selected stage tab changes
  const handleStageSelect = (stageId) => {
    setSelectedStageId(stageId);
    const data = job.stages[stageId] || {};
    setStageStatus(data.status || 'pending');
    setStageAssignee(data.assignee || '');
    setStageDueDate(data.due_date || '');
    setStageNotes(data.notes || '');
    setIsSavedAlert(false);
  };

  const handleAddAttachment = (e) => {
    e.preventDefault();
    if (!newAttachmentName || !newAttachmentUrl) return;

    const newAttachment = {
      name: newAttachmentName,
      url: newAttachmentUrl,
      type: newAttachmentType
    };

    const currentAttachments = job.stages[selectedStageId]?.attachments || [];
    const updatedStages = {
      ...job.stages,
      [selectedStageId]: {
        ...job.stages[selectedStageId],
        attachments: [...currentAttachments, newAttachment]
      }
    };

    const auditAction = `แนบไฟล์/ลิงก์ "${newAttachmentName}" ในขั้นตอน ${WORKFLOW_STAGES.find(s => s.id === selectedStageId)?.shortLabel}`;
    
    onUpdateJob({
      ...job,
      stages: updatedStages,
      audit_logs: [
        {
          id: `log-${Date.now()}`,
          timestamp: new Date().toISOString(),
          user: getRoleUserName(userRole),
          action: auditAction
        },
        ...job.audit_logs
      ]
    });

    setNewAttachmentName('');
    setNewAttachmentUrl('');
  };

  const handleRemoveAttachment = (indexToRemove) => {
    const currentAttachments = job.stages[selectedStageId]?.attachments || [];
    const updatedAttachments = currentAttachments.filter((_, idx) => idx !== indexToRemove);

    const updatedStages = {
      ...job.stages,
      [selectedStageId]: {
        ...job.stages[selectedStageId],
        attachments: updatedAttachments
      }
    };

    onUpdateJob({
      ...job,
      stages: updatedStages
    });
  };

  const handleSaveStageUpdate = () => {
    const stageInfo = WORKFLOW_STAGES.find(s => s.id === selectedStageId);
    const prevStatus = job.stages[selectedStageId]?.status;
    
    // Auto-update current_stage of the job if completing
    let updatedCurrentStage = job.current_stage;
    if (stageStatus === 'completed') {
      const currentIndex = WORKFLOW_STAGES.findIndex(s => s.id === selectedStageId);
      if (currentIndex < WORKFLOW_STAGES.length - 1) {
        updatedCurrentStage = WORKFLOW_STAGES[currentIndex + 1].id;
        // set next stage to in_progress if it was pending
        if (job.stages[updatedCurrentStage]?.status === 'pending') {
          job.stages[updatedCurrentStage].status = 'in_progress';
        }
      }
    }

    const updatedStages = {
      ...job.stages,
      [selectedStageId]: {
        ...job.stages[selectedStageId],
        status: stageStatus,
        assignee: stageAssignee,
        due_date: stageDueDate,
        notes: stageNotes,
        completed_at: stageStatus === 'completed' ? new Date().toISOString() : job.stages[selectedStageId]?.completed_at
      }
    };

    const actionText = `อัปเดตขั้นตอน ${stageInfo?.shortLabel}: สถานะ "${stageStatus}" ${stageStatus !== prevStatus ? `(เดิม: ${prevStatus})` : ''}`;

    onUpdateJob({
      ...job,
      current_stage: updatedCurrentStage,
      stages: updatedStages,
      audit_logs: [
        {
          id: `log-${Date.now()}`,
          timestamp: new Date().toISOString(),
          user: getRoleUserName(userRole),
          action: actionText
        },
        ...job.audit_logs
      ]
    });

    setIsSavedAlert(true);
    setTimeout(() => setIsSavedAlert(false), 3000);
  };

  const getRoleUserName = (role) => {
    const found = responsiblesList.find(r => r.departmentId?.toLowerCase().includes(role) || r.departmentName?.toLowerCase().includes(role));
    if (found) return `${found.name} (${found.departmentName})`;
    return `${userRole.toUpperCase()} User`;
  };

  // Check if current user role has permission to edit selected stage (Production has permission for on_sale)
  const canEditCurrentStage = userRole === 'admin' || stageDefinition?.role === userRole || (userRole === 'production' && ['start', 'production_order', 'production', 'qc', 'on_sale'].includes(selectedStageId));

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      {/* Horizontal Landscape Modal Container */}
      <div className="bg-white w-[94vw] max-w-7xl rounded-3xl shadow-2xl border border-slate-200/80 overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200 max-h-[92vh] flex flex-col">
        
        {/* Clean Light Theme Header */}
        <div className="bg-gradient-to-r from-slate-50 via-white to-blue-50/40 text-slate-900 px-6 py-5 flex items-center justify-between relative overflow-hidden border-b border-slate-200/80 shrink-0">
          <div className="absolute right-0 top-0 w-96 h-96 bg-blue-400/5 rounded-full blur-3xl pointer-events-none"></div>
          
          <div className="space-y-1 relative z-10">
            <div className="flex flex-wrap items-center gap-2">
              <span className="bg-blue-100/80 text-blue-800 text-xs font-mono px-3 py-0.5 rounded-lg font-bold border border-blue-200/80">
                {job.id}
              </span>
              <span className="text-slate-500 text-xs flex items-center gap-1.5 ml-1 font-medium">
                <Calendar className="w-3.5 h-3.5 text-blue-600" /> รับงาน: {job.start_date} | ส่งมอบผลิต: <strong className="text-amber-700 font-bold">{job.due_date}</strong>
              </span>
              {job.on_sale_date && (
                <span className="bg-amber-50 text-amber-800 border border-amber-200/80 text-xs px-2.5 py-0.5 rounded-md font-bold flex items-center gap-1">
                  <Megaphone className="w-3 h-3 text-amber-600" /> วันวางขาย (Production): {job.on_sale_date}
                </span>
              )}
            </div>

            <div className="flex items-center gap-3 pt-0.5">
              <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">{job.project_name}</h2>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors relative z-10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Clean Modal Sub-Navigation Tabs */}
        <div className="flex border-b border-slate-200/80 bg-slate-50/70 px-6 pt-1 shrink-0">
          <button
            onClick={() => setActiveTab('stages')}
            className={`py-3 px-4 font-semibold text-xs transition-all border-b-2 flex items-center gap-2 ${
              activeTab === 'stages'
                ? 'border-blue-600 text-blue-600 bg-white shadow-2xs rounded-t-xl'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            ติดตามขั้นตอนการทำงาน (Workflow Stages)
          </button>
          <button
            onClick={() => setActiveTab('specifications')}
            className={`py-3 px-4 font-semibold text-xs transition-all border-b-2 flex items-center gap-2 ${
              activeTab === 'specifications'
                ? 'border-blue-600 text-blue-600 bg-white shadow-2xs rounded-t-xl'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            ผู้รับผิดชอบเชื่อมโยงฝ่าย & สเปก ({responsiblesList.length} ฝ่าย)
          </button>
          <button
            onClick={() => setActiveTab('audit_log')}
            className={`py-3 px-4 font-semibold text-xs transition-all border-b-2 flex items-center gap-2 ${
              activeTab === 'audit_log'
                ? 'border-blue-600 text-blue-600 bg-white shadow-2xs rounded-t-xl'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            ประวัติการเปลี่ยนแปลง (Audit Log)
            <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-slate-200 text-slate-700 font-bold">
              {job.audit_logs?.length || 0}
            </span>
          </button>
        </div>

        {/* Modal Main Body Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5">
          {/* TAB 1: STAGES TRACKER & EDITOR */}
          {activeTab === 'stages' && (
            <div className="space-y-5">
              
              {/* Full Horizontal 10-Stage Pipeline Grid */}
              <div className="w-full">
                <div className="grid grid-cols-5 lg:grid-cols-10 gap-2">
                  {WORKFLOW_STAGES.map((st, idx) => {
                    const stData = job.stages[st.id] || {};
                    const isSelected = selectedStageId === st.id;
                    const isCompleted = stData.status === 'completed';
                    const isDelayed = stData.status === 'delayed';
                    const isInProgress = stData.status === 'in_progress';

                    return (
                      <button
                        key={st.id}
                        onClick={() => handleStageSelect(st.id)}
                        className={`p-2.5 rounded-2xl border text-left transition-all relative ${
                          isSelected
                            ? 'ring-2 ring-blue-600 border-blue-600 bg-blue-50/80 shadow-2xs'
                            : 'hover:bg-slate-50/80 border-slate-200/80 bg-white'
                        }`}
                      >
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="font-mono text-[10px] text-slate-400">0{idx + 1}</span>
                          {isCompleted ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                          ) : isDelayed ? (
                            <AlertTriangle className="w-3.5 h-3.5 text-rose-500 animate-bounce" />
                          ) : isInProgress ? (
                            <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping"></span>
                          ) : (
                            <span className="w-2 h-2 rounded-full bg-slate-300"></span>
                          )}
                        </div>
                        <p className={`font-bold text-xs truncate ${isSelected ? 'text-blue-900' : 'text-slate-800'}`}>
                          {st.shortLabel}
                        </p>
                        <p className="text-[10px] text-slate-400 mt-0.5 truncate">
                          {stData.assignee ? stData.assignee.split(' ')[0] : st.role}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Landscape 2-Column Split */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                
                {/* Left Column (5 Cols): Stage Status & Details Form */}
                <div className="lg:col-span-5 bg-slate-50/70 rounded-2xl p-5 border border-slate-200/80 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-200/80 pb-3">
                    <div>
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">
                          ขั้นตอนที่ {WORKFLOW_STAGES.findIndex(s => s.id === selectedStageId) + 1} จาก {WORKFLOW_STAGES.length}
                        </span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${linkedStageDept.badgeColor}`}>
                          {linkedStageDept.name}
                        </span>
                      </div>
                      <h3 className="text-base font-extrabold text-slate-900">
                        {WORKFLOW_STAGES.find(s => s.id === selectedStageId)?.label}
                      </h3>
                    </div>

                    {!canEditCurrentStage && (
                      <span className="text-[11px] bg-amber-50 text-amber-800 border border-amber-200 px-2.5 py-0.5 rounded-full font-medium flex items-center gap-1 shrink-0">
                        <Shield className="w-3 h-3 text-amber-600" /> ({WORKFLOW_STAGES.find(s => s.id === selectedStageId)?.role.toUpperCase()})
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Status Picker */}
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-700">สถานะขั้นตอน</label>
                      <select
                        value={stageStatus}
                        onChange={(e) => setStageStatus(e.target.value)}
                        disabled={!canEditCurrentStage}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-slate-100 disabled:text-slate-500"
                      >
                        <option value="pending">⏳ Pending (รอสเตจก่อนหน้า)</option>
                        <option value="in_progress">🔵 In Progress (กำลังดำเนินงาน)</option>
                        <option value="completed">✅ Completed (เสร็จสิ้น)</option>
                        <option value="delayed">⚠️ Delayed (ล่าช้ากว่ากำหนด)</option>
                      </select>
                    </div>

                    {/* Stage Target Due Date */}
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-700">กำหนดส่งสเตจนี้</label>
                      <input
                        type="date"
                        value={stageDueDate}
                        onChange={(e) => setStageDueDate(e.target.value)}
                        disabled={!canEditCurrentStage}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-slate-100 font-medium"
                      />
                    </div>

                    {/* Linked Assignee Dropdown Selector */}
                    <div className="space-y-1 sm:col-span-2">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-semibold text-slate-700">ผู้รับผิดชอบสเตจนี้ (เชื่อมโยงตามฝ่าย)</label>
                        <span className="text-[10px] text-slate-400 font-normal">เลือกจากทีมงานที่ผูกกับฝ่าย</span>
                      </div>
                      
                      <select
                        value={stageAssignee}
                        onChange={(e) => setStageAssignee(e.target.value)}
                        disabled={!canEditCurrentStage}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-slate-100"
                      >
                        {/* Option matched to current stage's department */}
                        <optgroup label={`--- ทีมงานประจำ ${linkedStageDept.name} ---`}>
                          {responsiblesList.filter(r => r.departmentId === linkedStageDept.id).map(r => (
                            <option key={r.id} value={`${r.name} (${r.departmentName})`}>
                              👤 {r.name} ({r.departmentName})
                            </option>
                          ))}
                        </optgroup>

                        {/* Options from all other assigned departments */}
                        <optgroup label="--- ทีมงานจากฝ่ายอื่นๆ ในออเดอร์ ---">
                          {responsiblesList.filter(r => r.departmentId !== linkedStageDept.id).map(r => (
                            <option key={r.id} value={`${r.name} (${r.departmentName})`}>
                              👤 {r.name} ({r.departmentName})
                            </option>
                          ))}
                        </optgroup>
                      </select>
                    </div>
                  </div>

                  {/* Notes */}
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700">บันทึกข้อความ / หมายเหตุขั้นตอน</label>
                    <textarea
                      rows={3}
                      value={stageNotes}
                      onChange={(e) => setStageNotes(e.target.value)}
                      disabled={!canEditCurrentStage}
                      placeholder="เช่น ปรับตำแหน่งโลโก้เพิ่มเติม, ตรวจสอบมัดจำแล้ว..."
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-slate-100"
                    />
                  </div>

                  {/* Save Button */}
                  {canEditCurrentStage && (
                    <div className="flex items-center justify-between pt-2 border-t border-slate-200/80">
                      {isSavedAlert ? (
                        <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                          <Check className="w-4 h-4" /> บันทึกสเตจเรียบร้อย!
                        </span>
                      ) : <span></span>}

                      <button
                        type="button"
                        onClick={handleSaveStageUpdate}
                        className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-xs shadow-2xs transition-all active:scale-95 ml-auto"
                      >
                        <Save className="w-4 h-4 mr-1.5" />
                        บันทึกสเตจ {WORKFLOW_STAGES.find(s => s.id === selectedStageId)?.shortLabel}
                      </button>
                    </div>
                  )}
                </div>

                {/* Right Column (7 Cols): Attachments & Files */}
                <div className="lg:col-span-7 bg-slate-50/70 rounded-2xl p-5 border border-slate-200/80 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-200/80 pb-3">
                    <h4 className="text-xs font-bold text-slate-900 flex items-center gap-2">
                      <LinkIcon className="w-4 h-4 text-blue-600" />
                      ลิงก์และไฟล์ตรวจสอบประจำสเตจ (Attachments & Links)
                    </h4>
                    <span className="text-xs text-slate-400 font-medium">
                      ({currentStageData.attachments?.length || 0} รายการ)
                    </span>
                  </div>

                  {/* List of Attachments */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 min-h-[120px]">
                    {currentStageData.attachments?.length > 0 ? (
                      currentStageData.attachments.map((file, idx) => (
                        <div 
                          key={idx} 
                          className="bg-white p-3 rounded-xl border border-slate-200/80 shadow-2xs flex items-center justify-between gap-2 group hover:border-blue-300 transition-colors"
                        >
                          <div className="flex items-center gap-2.5 overflow-hidden">
                            {file.type === 'image' ? (
                              <ImageIcon className="w-4 h-4 text-purple-600 shrink-0" />
                            ) : file.type === 'file' ? (
                              <FileText className="w-4 h-4 text-amber-600 shrink-0" />
                            ) : (
                              <LinkIcon className="w-4 h-4 text-blue-600 shrink-0" />
                            )}
                            <div className="min-w-0">
                              <p className="text-xs font-semibold text-slate-800 truncate">{file.name}</p>
                              <a 
                                href={file.url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-[11px] text-blue-600 hover:underline flex items-center gap-1 truncate"
                              >
                                {file.url}
                                <ExternalLink className="w-2.5 h-2.5 shrink-0" />
                              </a>
                            </div>
                          </div>

                          {canEditCurrentStage && (
                            <button
                              onClick={() => handleRemoveAttachment(idx)}
                              className="text-slate-300 hover:text-rose-600 p-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                              title="ลบลิงก์นี้"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-slate-400 italic col-span-2 py-4 text-center bg-white/60 rounded-xl border border-dashed border-slate-200">
                        ยังไม่มีลิงก์หรือไฟล์แนบในขั้นตอน {WORKFLOW_STAGES.find(s => s.id === selectedStageId)?.shortLabel} <br/>
                        <span className="text-[11px] text-slate-400 font-normal">({getStageHint(selectedStageId)})</span>
                      </p>
                    )}
                  </div>

                  {/* Add New Attachment Form */}
                  {canEditCurrentStage && (
                    <form onSubmit={handleAddAttachment} className="bg-white p-3.5 rounded-2xl border border-slate-200/80 space-y-3 pt-3">
                      <p className="text-xs font-bold text-slate-800 flex items-center gap-1">
                        <Plus className="w-3.5 h-3.5 text-blue-600" /> แนบลิงก์ / ไฟล์ใหม่ประจำสเตจนี้
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                        <input
                          type="text"
                          required
                          placeholder="ชื่อไฟล์/ชื่อลิงก์ (เช่น ใบสั่งผลิต, รูป QC)"
                          value={newAttachmentName}
                          onChange={(e) => setNewAttachmentName(e.target.value)}
                          className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <input
                          type="url"
                          required
                          placeholder="URL (https://drive.google...)"
                          value={newAttachmentUrl}
                          onChange={(e) => setNewAttachmentUrl(e.target.value)}
                          className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <div className="flex gap-2">
                          <select
                            value={newAttachmentType}
                            onChange={(e) => setNewAttachmentType(e.target.value)}
                            className="px-2 py-1.5 rounded-xl border border-slate-200 text-xs bg-white outline-none w-full"
                          >
                            <option value="link">🔗 ลิงก์ (Drive/URL)</option>
                            <option value="image">🖼️ รูปถ่าย (QC/หน้างาน)</option>
                            <option value="file">📄 เอกสาร (PDF/PO)</option>
                          </select>
                          <button
                            type="submit"
                            className="bg-slate-900 text-white px-3 py-1.5 rounded-xl text-xs font-semibold hover:bg-slate-800 shrink-0 transition-colors"
                          >
                            แนบข้อมูล
                          </button>
                        </div>
                      </div>
                    </form>
                  )}
                </div>

              </div>
            </div>
          )}

          {/* TAB 2: SPECIFICATIONS & LINKED TEAM RESPONSIBLES */}
          {activeTab === 'specifications' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Product Specifications Card */}
                <div className="bg-slate-50/70 p-5 rounded-2xl border border-slate-200/80 space-y-4">
                  <h3 className="font-bold text-slate-900 text-xs border-b border-slate-200/80 pb-2.5 flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-blue-600" />
                      รายละเอียดสินค้า (Product Specifications)
                    </span>
                  </h3>

                  <div className="space-y-3 text-xs">
                    <div className="flex justify-between border-b border-slate-100 pb-2">
                      <span className="text-slate-500">ประเภทสินค้า:</span>
                      <span className="font-semibold text-slate-800 capitalize">{job.product_type}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-100 pb-2">
                      <span className="text-slate-500">จำนวนที่ผลิต:</span>
                      <span className="font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                        {job.specifications?.quantity?.toLocaleString()} ชิ้น
                      </span>
                    </div>
                    <div className="flex justify-between border-b border-slate-100 pb-2">
                      <span className="text-slate-500">เกรดวัสดุ:</span>
                      <span className="font-semibold text-slate-800">{job.specifications?.material_grade || '-'}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-100 pb-2">
                      <span className="text-slate-500">สี / การพิมพ์:</span>
                      <span className="font-semibold text-slate-800">{job.specifications?.color || '-'}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-100 pb-2">
                      <span className="text-slate-500">ขนาด / ความจุ:</span>
                      <span className="font-semibold text-slate-800">{job.specifications?.size || '-'}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-100 pb-2">
                      <span className="text-slate-500">ลาย / ดีไซน์:</span>
                      <span className="font-semibold text-slate-800">{job.specifications?.pattern_design || '-'}</span>
                    </div>
                    {job.on_sale_date && (
                      <div className="flex justify-between pt-1">
                        <span className="text-amber-700 font-bold flex items-center gap-1">
                          <Megaphone className="w-3.5 h-3.5 text-amber-600" /> วันกำหนดวางจำหน่าย (Production):
                        </span>
                        <span className="font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                          {job.on_sale_date}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Linked Team Responsibles Card - Linked to DEPARTMENTS */}
                <div className="bg-slate-50/70 p-5 rounded-2xl border border-slate-200/80 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-200/80 pb-2.5">
                    <h3 className="font-bold text-slate-900 text-xs flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-blue-600" />
                      ผู้รับผิดชอบที่เชื่อมโยงตามฝ่าย/แผนก (Production ดูแลการผลิต & วางขาย)
                    </h3>

                    <button
                      type="button"
                      onClick={() => setShowAddRoleForm(!showAddRoleForm)}
                      className="text-[11px] text-blue-600 hover:text-blue-800 font-bold flex items-center gap-1 bg-white px-2.5 py-1 rounded-lg border border-blue-200"
                    >
                      <Plus className="w-3 h-3" /> เพิ่มคน/ฝ่าย
                    </button>
                  </div>

                  {/* Add role sub-form inside Modal */}
                  {showAddRoleForm && (
                    <div className="p-3.5 bg-white rounded-xl border border-slate-200 space-y-2.5 text-xs">
                      <div className="space-y-1">
                        <label className="text-[11px] font-semibold text-slate-600">เลือกฝ่าย/แผนกที่ต้องการเชื่อมโยง</label>
                        <select
                          value={selectedDeptId}
                          onChange={(e) => setSelectedDeptId(e.target.value)}
                          className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold bg-white"
                        >
                          {DEPARTMENTS.map(d => (
                            <option key={d.id} value={d.id}>{d.name}</option>
                          ))}
                          <option value="custom">➕ ระบุชื่อฝ่ายใหม่เอง...</option>
                        </select>
                      </div>

                      {selectedDeptId === 'custom' && (
                        <input
                          type="text"
                          placeholder="ระบุชื่อฝ่ายใหม่..."
                          value={customDeptTitle}
                          onChange={(e) => setCustomDeptTitle(e.target.value)}
                          className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs"
                        />
                      )}

                      <div className="space-y-1">
                        <label className="text-[11px] font-semibold text-slate-600">ชื่อผู้รับผิดชอบประจำฝ่าย</label>
                        <input
                          type="text"
                          required
                          placeholder="ชื่อ-นามสกุล"
                          value={newRolePersonName}
                          onChange={(e) => setNewRolePersonName(e.target.value)}
                          className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs"
                        />
                      </div>

                      <div className="flex gap-2 justify-end pt-1">
                        <button
                          type="button"
                          onClick={handleAddModalRole}
                          className="bg-blue-600 text-white px-3.5 py-1 rounded-lg text-xs font-semibold"
                        >
                          เชื่อมโยงฝ่ายและผู้รับผิดชอบ
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowAddRoleForm(false)}
                          className="bg-slate-200 text-slate-700 px-3 py-1 rounded-lg text-xs"
                        >
                          ยกเลิก
                        </button>
                      </div>
                    </div>
                  )}

                  {/* List of Dynamic Team Responsibles Linked to Departments */}
                  <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
                    {responsiblesList.map((resp) => {
                      return (
                        <div key={resp.id} className="p-3 bg-white rounded-xl border border-slate-200/80 shadow-2xs space-y-2 group">
                          <div className="flex items-center justify-between">
                            <select
                              value={resp.departmentId || 'production'}
                              onChange={(e) => handleUpdateModalRoleDept(resp.id, e.target.value)}
                              className="text-[11px] font-bold text-amber-900 bg-amber-50/90 border border-amber-200 rounded-lg px-2 py-0.5 outline-none cursor-pointer"
                            >
                              {DEPARTMENTS.map(d => (
                                <option key={d.id} value={d.id}>{d.name}</option>
                              ))}
                            </select>

                            {responsiblesList.length > 1 && (
                              <button
                                type="button"
                                onClick={() => handleRemoveModalRole(resp.id)}
                                className="text-slate-300 hover:text-rose-600 p-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                                title="ยกเลิกฝ่ายนี้"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>

                          <input
                            type="text"
                            value={resp.name}
                            onChange={(e) => handleUpdateModalRoleName(resp.id, e.target.value)}
                            className="text-xs font-bold text-slate-800 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-blue-500 outline-none w-full"
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* TAB 3: AUDIT LOG */}
          {activeTab === 'audit_log' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-900">
                  ประวัติการเปลี่ยนแปลงย้อนหลัง (Audit Log Timeline)
                </h3>
                <span className="text-xs text-slate-400">บันทึกอัตโนมัติทุกครั้งเมื่อมีการแก้ไข Stage หรือแนบไฟล์</span>
              </div>

              <div className="bg-slate-50/70 p-4 rounded-2xl border border-slate-200/80 max-h-96 overflow-y-auto">
                <div className="relative border-l-2 border-slate-200/80 ml-4 space-y-5 py-2">
                  {job.audit_logs?.map((log) => (
                    <div key={log.id} className="relative pl-6">
                      <div className="absolute -left-[9px] top-0.5 w-4 h-4 rounded-full bg-blue-600 ring-4 ring-white"></div>
                      <div className="bg-white p-3 rounded-xl border border-slate-200/80 shadow-2xs">
                        <div className="flex items-center justify-between text-[11px] text-slate-500">
                          <span className="font-semibold text-slate-700">{log.user}</span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-slate-400" />
                            {new Date(log.timestamp).toLocaleString('th-TH')}
                          </span>
                        </div>
                        <p className="text-xs text-slate-800 mt-1 font-medium">{log.action}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Clean Modal Footer */}
        <div className="p-4 bg-slate-50/70 border-t border-slate-200/80 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-200/80 hover:bg-slate-300 text-slate-700 font-semibold text-xs rounded-xl transition-colors"
          >
            ปิดหน้าต่าง
          </button>
        </div>

      </div>
    </div>
  );
}
