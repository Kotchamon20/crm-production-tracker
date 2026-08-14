import { useState } from 'react';
import { 
  Send, Box, Package, Image as ImageIcon, Sparkles, Calendar, 
  User, CheckCircle2, FileText, Layers, Tag, Plus, Trash2, Megaphone, Building2
} from 'lucide-react';
import { WORKFLOW_STAGES, DEPARTMENTS } from '../data/mockData';

export default function JobForm({ onCreateJob, userRole, jobs = [] }) {
  const [productType, setProductType] = useState('glass');
  const [customProductTypeName, setCustomProductTypeName] = useState('');
  const [startStageId, setStartStageId] = useState('design');
  
  const [formData, setFormData] = useState({
    projectName: '',
    startDate: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    onSaleDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    quantity: '1000',
    materialGrade: 'Premium Glass Grade A (Borosilicate)',
    color: 'ใสสกรีน 4 สี',
    size: '16 oz (480 ml)',
    patternDesign: 'Standard Brand Logo'
  });

  // Dynamic responsibles list starts with blank names until user selects from history or types
  const [responsiblesList, setResponsiblesList] = useState([
    { id: '1', departmentId: 'production', departmentName: 'ฝ่ายผลิต & วางขาย (Production)', name: '' },
    { id: '2', departmentId: 'designer', departmentName: 'ฝ่ายออกแบบ (Design)', name: '' },
    { id: '3', departmentId: 'marketing', departmentName: 'ฝ่ายการตลาด (Marketing)', name: '' },
    { id: '4', departmentId: 'logistics', departmentName: 'ฝ่ายจัดส่ง & คลังสินค้า (Logistics)', name: '' }
  ]);

  // Extract unique past responsible names from existing jobs history
  const getPastNamesForDepartment = (deptId) => {
    const nameSet = new Set();
    if (Array.isArray(jobs)) {
      jobs.forEach(j => {
        if (Array.isArray(j.responsibles)) {
          j.responsibles.forEach(r => {
            if (r.name && r.name.trim()) {
              if (!deptId || r.departmentId === deptId) {
                nameSet.add(r.name.trim());
              }
            }
          });
        }
        if (j.stages && typeof j.stages === 'object') {
          Object.values(j.stages).forEach(stage => {
            if (stage.assignee && typeof stage.assignee === 'string') {
              const rawName = stage.assignee.split('(')[0].trim();
              if (rawName && rawName !== 'ทีมงานผู้รับผิดชอบ') {
                nameSet.add(rawName);
              }
            }
          });
        }
      });
    }
    return Array.from(nameSet);
  };

  const [selectedDeptId, setSelectedDeptId] = useState('production');
  const [customDeptTitle, setCustomDeptTitle] = useState('');
  const [newRolePersonName, setNewRolePersonName] = useState('');
  const [showAddRoleForm, setShowAddRoleForm] = useState(false);

  const handleAddRole = (e) => {
    e.preventDefault();
    if (!newRolePersonName) return;

    const deptObj = DEPARTMENTS.find(d => d.id === selectedDeptId);
    const finalDeptName = selectedDeptId === 'custom' ? customDeptTitle : (deptObj?.name || 'ฝ่ายอื่นๆ');

    setResponsiblesList([
      ...responsiblesList,
      {
        id: `resp-${Date.now()}`,
        departmentId: selectedDeptId,
        departmentName: finalDeptName,
        name: newRolePersonName
      }
    ]);

    setNewRolePersonName('');
    setCustomDeptTitle('');
    setShowAddRoleForm(false);
  };

  const handleRemoveRole = (idToRemove) => {
    setResponsiblesList(responsiblesList.filter(r => r.id !== idToRemove));
  };

  const handleUpdateRolePerson = (idToUpdate, newName) => {
    setResponsiblesList(responsiblesList.map(r => r.id === idToUpdate ? { ...r, name: newName } : r));
  };

  const handleUpdateRoleDept = (idToUpdate, newDeptId) => {
    const deptObj = DEPARTMENTS.find(d => d.id === newDeptId);
    setResponsiblesList(responsiblesList.map(r => r.id === idToUpdate ? { 
      ...r, 
      departmentId: newDeptId,
      departmentName: deptObj?.name || newDeptId
    } : r));
  };

  const finalProductType = productType === 'custom' ? (customProductTypeName || 'สินค้าสั่งทำพิเศษ') : productType;

  const isFormValid = formData.projectName && formData.quantity && (productType !== 'custom' || customProductTypeName.trim());

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isFormValid) return;

    const newJobId = `JOB-2026-${Math.floor(100 + Math.random() * 900)}`;

    // Build 10 stages
    const initialStages = {};
    const startDateObj = new Date(formData.startDate);
    const activeStageIdx = WORKFLOW_STAGES.findIndex(s => s.id === startStageId);
    const targetIdx = activeStageIdx >= 0 ? activeStageIdx : 1;

    let currentDayOffset = 0;
    WORKFLOW_STAGES.forEach((st, idx) => {
      const stStart = new Date(startDateObj.getTime() + currentDayOffset * 24 * 60 * 60 * 1000);
      currentDayOffset += st.defaultDays;
      const stDue = new Date(startDateObj.getTime() + currentDayOffset * 24 * 60 * 60 * 1000);

      // Find assignee linked to this stage's department! (Production handles on_sale)
      const matchingResp = responsiblesList.find(r => r.departmentId === st.departmentId) || responsiblesList[0];
      const assigneeString = matchingResp ? `${matchingResp.name} (${matchingResp.departmentName})` : 'ทีมงานผู้รับผิดชอบ';

      let stageStatus = 'pending';
      let completedAt = null;

      if (idx < targetIdx) {
        // Prior stages are retroactively completed!
        stageStatus = 'completed';
        completedAt = new Date().toISOString();
      } else if (idx === targetIdx) {
        // Selected starting stage is in progress!
        stageStatus = 'in_progress';
        completedAt = null;
      } else {
        // Future stages are pending
        stageStatus = 'pending';
        completedAt = null;
      }

      initialStages[st.id] = {
        status: stageStatus,
        start_date: stStart.toISOString().split('T')[0],
        due_date: st.id === 'on_sale' ? formData.onSaleDate : stDue.toISOString().split('T')[0],
        completed_at: completedAt,
        assignee: assigneeString,
        notes: idx < targetIdx 
          ? 'อนุมัติ/เสร็จสิ้นย้อนหลังตอนเปิดโครงการ'
          : idx === targetIdx ? 'ขั้นตอนหลักที่กำลังดำเนินการอยู่ปัจจุบัน'
          : st.id === 'complete' ? `กำหนดวันวางขาย: ${formData.onSaleDate}` 
          : st.id === 'marketing' ? 'เตรียมสื่อการตลาด & แคมเปญโปรโมต' 
          : st.id === 'on_sale' ? 'ฝ่ายผลิต (Production) ดูแลจัดส่งและวางจำหน่ายหน้าร้าน' 
          : '',
        attachments: []
      };
    });

    const activeStageObj = WORKFLOW_STAGES[targetIdx] || WORKFLOW_STAGES[1];

    const newJob = {
      id: newJobId,
      project_name: formData.projectName,
      product_type: finalProductType,
      specifications: {
        material_grade: formData.materialGrade,
        color: formData.color,
        size: formData.size,
        quantity: parseInt(formData.quantity, 10),
        pattern_design: formData.patternDesign
      },
      start_date: formData.startDate,
      due_date: formData.dueDate,
      on_sale_date: formData.onSaleDate,
      responsibles: responsiblesList,
      current_stage: startStageId,
      stages: initialStages,
      audit_logs: [
        {
          id: `log-${Date.now()}`,
          timestamp: new Date().toISOString(),
          user: responsiblesList[0]?.name || 'Production Team',
          action: `สร้างโครงการผลิตใหม่ ${newJobId} (${finalProductType}) ที่ขั้นตอน "${activeStageObj.label}"${targetIdx > 0 ? ` (ขั้นตอนก่อนหน้า ${targetIdx} สเตจถูกทำเครื่องหมายว่าเสร็จสิ้นย้อนหลังอัตโนมัติ)` : ''}`
        }
      ]
    };

    onCreateJob(newJob);
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">สร้างโครงการผลิตสินค้าใหม่ (Internal Project)</h2>
        <p className="text-xs text-slate-500 mt-1">
          กรอกรายละเอียดเพื่อสร้าง Pipeline ติดตามงาน 10 ขั้นตอน ( Design + Production + Marketing & วางจำหน่ายโดย Production )
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-2xs border border-slate-200/80 overflow-hidden">
        <form onSubmit={handleSubmit} className="p-6 sm:p-10 space-y-8">
          
          {/* SECTION 1: Project & Schedule Header */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-200/80 pb-2.5 flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-600" />
              1. ข้อมูลโครงการและกำหนดส่งมอบ / วันวางขาย (Project & Release Schedule)
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs font-semibold text-slate-700">ชื่อโปรเจกต์ / สินค้าของบริษัท <span className="text-rose-500">*</span></label>
                <input
                  type="text"
                  required
                  value={formData.projectName}
                  onChange={(e) => setFormData({...formData, projectName: e.target.value})}
                  placeholder="เช่น แก้วกาแฟพรีเมียม ลาย Summer Collection 2026"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-xs font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                />
              </div>

              <div className="space-y-1.5 sm:col-span-2 bg-blue-50/40 p-4 rounded-2xl border border-blue-200/80">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-1">
                  <label className="text-xs font-bold text-blue-900 flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-blue-600" /> ขั้นตอนปัจจุบันที่กำลังดำเนินงาน (Active Starting Stage)
                  </label>
                  {WORKFLOW_STAGES.findIndex(s => s.id === startStageId) > 0 && (
                    <span className="text-[11px] font-bold text-amber-800 bg-amber-100 border border-amber-300 px-2.5 py-0.5 rounded-full shadow-2xs">
                      ⚡ บันทึกย้อนหลัง: ขั้นตอนก่อนหน้า {WORKFLOW_STAGES.findIndex(s => s.id === startStageId)} ขั้นตอนจะถูกปรับเป็น "เสร็จสิ้น (Completed)" อัตโนมัติ
                    </span>
                  )}
                </div>
                <select
                  value={startStageId}
                  onChange={(e) => setStartStageId(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-blue-300 bg-white text-xs font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer"
                >
                  {WORKFLOW_STAGES.map((st, idx) => {
                    const currentIdx = WORKFLOW_STAGES.findIndex(s => s.id === startStageId);
                    let labelTag = '';
                    if (idx < currentIdx) labelTag = ' (จะเสร็จสมบูรณ์ย้อนหลัง ✅)';
                    else if (idx === currentIdx) labelTag = ' (กำลังดำเนินการ 🔵)';
                    else labelTag = ' (รอดำเนินการ ⏳)';

                    return (
                      <option key={st.id} value={st.id}>
                        {idx + 1}. {st.label}{labelTag}
                      </option>
                    );
                  })}
                </select>
                <p className="text-[11px] text-slate-500 mt-1">
                  💡 หากมาบันทึกย้อนหลัง และเลือกขั้นตอนเช่น "สั่งผลิต" หรือ "Production" ระบบจะเปลี่ยนขั้นตอนก่อนหน้าทั้งหมดให้เป็น <strong className="text-emerald-600">เสร็จสมบูรณ์ (Completed)</strong> โดยอัตโนมัติ
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">วันที่เริ่มโครงการ (Start Date)</label>
                <input
                  type="date"
                  required
                  value={formData.startDate}
                  onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-xs focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">วันกำหนดส่งมอบผลิตรวม (Production Due Date)</label>
                <input
                  type="date"
                  required
                  value={formData.dueDate}
                  onChange={(e) => setFormData({...formData, dueDate: e.target.value})}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-xs font-bold text-blue-700 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                />
              </div>

              {/* Target On-Sale Date / Release Date */}
              <div className="space-y-1.5 sm:col-span-2 bg-amber-50/50 p-4 rounded-2xl border border-amber-200/80">
                <label className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                  <Megaphone className="w-4 h-4 text-amber-600" /> วันกำหนดวางจำหน่ายหน้าร้าน / On-Sale Date (ฝ่าย Production ทำหน้าที่ดูแลวางขาย)
                </label>
                <input
                  type="date"
                  required
                  value={formData.onSaleDate}
                  onChange={(e) => setFormData({...formData, onSaleDate: e.target.value})}
                  className="w-full px-4 py-2.5 rounded-xl border border-amber-300 bg-white text-xs font-extrabold text-amber-800 focus:ring-2 focus:ring-amber-500 outline-none"
                />
              </div>
            </div>
          </div>

          {/* SECTION 2: Product Type & Specifications */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-200/80 pb-2.5 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Box className="w-4 h-4 text-blue-600" />
                2. รายละเอียดสเปกสินค้า (Product Specifications)
              </span>
            </h3>

            {/* Product Type Selector */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {[
                { id: 'glass', label: 'แก้ว (Glass)', icon: Box },
                { id: 'paper', label: 'ถุงกระดาษ', icon: Package },
                { id: 'box', label: 'กล่องบรรจุภัณฑ์', icon: Layers },
                { id: 'sticker', label: 'สติ๊กเกอร์', icon: Tag },
                { id: 'custom', label: '➕ เพิ่มประเภทใหม่', icon: Plus }
              ].map(item => {
                const Icon = item.icon;
                const isSelected = productType === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setProductType(item.id)}
                    className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all text-xs font-semibold ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50/80 text-blue-700 shadow-2xs ring-1 ring-blue-600'
                        : 'border-slate-200 hover:border-slate-300 text-slate-600 bg-slate-50/40 hover:bg-slate-50'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isSelected ? 'text-blue-600' : 'text-slate-400'}`} />
                    <span className="truncate">{item.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Custom Product Type */}
            {productType === 'custom' && (
              <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-200/80 space-y-2 animate-in fade-in duration-200">
                <label className="text-xs font-bold text-blue-900 flex items-center gap-1.5">
                  <Plus className="w-4 h-4 text-blue-600" /> ระบุชื่อประเภทสินค้าใหม่ (Custom Product Type) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required={productType === 'custom'}
                  value={customProductTypeName}
                  onChange={(e) => setCustomProductTypeName(e.target.value)}
                  placeholder="เช่น กระบอกน้ำอลูมิเนียม, เสื้อโปโล, หมวกสกรีน..."
                  className="w-full px-4 py-2.5 rounded-xl border border-blue-300 bg-white text-xs font-semibold focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            )}

            {/* Specification Fields Grid */}
            <div className="bg-slate-50/60 p-5 rounded-2xl border border-slate-200/80 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">จำนวนที่ผลิต (ชิ้น) <span className="text-rose-500">*</span></label>
                <input
                  type="number"
                  min="1"
                  required
                  value={formData.quantity}
                  onChange={(e) => setFormData({...formData, quantity: e.target.value})}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs bg-white focus:ring-2 focus:ring-blue-500 outline-none font-semibold text-blue-700"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">เกรดวัสดุ (Material Grade)</label>
                <input
                  type="text"
                  value={formData.materialGrade}
                  onChange={(e) => setFormData({...formData, materialGrade: e.target.value})}
                  placeholder="เช่น Premium Borosilicate Glass..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">สี / การพิมพ์ (Color & Print)</label>
                <input
                  type="text"
                  value={formData.color}
                  onChange={(e) => setFormData({...formData, color: e.target.value})}
                  placeholder="เช่น สกรีน UV 4 สี"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">ขนาด / ความจุ (Size / Spec)</label>
                <input
                  type="text"
                  value={formData.size}
                  onChange={(e) => setFormData({...formData, size: e.target.value})}
                  placeholder="เช่น 16 oz (480 ml)"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs font-semibold text-slate-700">ลาย / ดีไซน์ (Pattern / Design Note)</label>
                <input
                  type="text"
                  value={formData.patternDesign}
                  onChange={(e) => setFormData({...formData, patternDesign: e.target.value})}
                  placeholder="เช่น Custom Brand Pattern v1"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>
          </div>

          {/* SECTION 3: Linked Department & Team Assignment */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200/80 pb-2.5">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-blue-600" />
                3. ผู้รับผิดชอบที่เชื่อมโยงตามฝ่าย/แผนก (Production ดูแลการผลิต & วางขาย)
              </h3>

              <button
                type="button"
                onClick={() => setShowAddRoleForm(!showAddRoleForm)}
                className="text-xs text-blue-600 hover:text-blue-800 font-bold flex items-center gap-1 bg-blue-50 px-3 py-1.5 rounded-xl border border-blue-200 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                เพิ่มฝ่าย/ผู้รับผิดชอบใหม่
              </button>
            </div>

            {/* Form to add department & person */}
            {showAddRoleForm && (
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-3 animate-in fade-in duration-200">
                <p className="text-xs font-bold text-slate-800 flex items-center gap-1">
                  <Plus className="w-3.5 h-3.5 text-blue-600" /> เชื่อมโยงฝ่าย/แผนก กับ ชื่อผู้รับผิดชอบ
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <select
                    value={selectedDeptId}
                    onChange={(e) => setSelectedDeptId(e.target.value)}
                    className="px-3.5 py-2 rounded-xl border border-slate-200 text-xs bg-white outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                  >
                    {DEPARTMENTS.map(d => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                    <option value="custom">➕ ระบุชื่อฝ่ายใหม่เอง...</option>
                  </select>

                  {selectedDeptId === 'custom' && (
                    <input
                      type="text"
                      placeholder="ระบุชื่อฝ่ายใหม่..."
                      value={customDeptTitle}
                      onChange={(e) => setCustomDeptTitle(e.target.value)}
                      className="px-3.5 py-2 rounded-xl border border-slate-200 text-xs bg-white outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  )}

                  <input
                    type="text"
                    required
                    placeholder="ชื่อ-นามสกุล ผู้รับผิดชอบ"
                    value={newRolePersonName}
                    onChange={(e) => setNewRolePersonName(e.target.value)}
                    className="px-3.5 py-2 rounded-xl border border-slate-200 text-xs bg-white outline-none focus:ring-2 focus:ring-blue-500"
                  />

                  <div className="flex gap-2 sm:col-span-3 justify-end pt-1">
                    <button
                      type="button"
                      onClick={handleAddRole}
                      className="bg-blue-600 text-white px-4 py-2 rounded-xl text-xs font-semibold hover:bg-blue-700 shrink-0"
                    >
                      เพิ่มฝ่ายและผู้รับผิดชอบ
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowAddRoleForm(false)}
                      className="bg-slate-200 text-slate-700 px-3 py-2 rounded-xl text-xs font-medium hover:bg-slate-300"
                    >
                      ยกเลิก
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Linked Responsibles Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {responsiblesList.map((resp) => {
                return (
                  <div key={resp.id} className="p-4 bg-slate-50/70 rounded-2xl border border-slate-200/80 space-y-2.5 relative group">
                    <div className="flex items-center justify-between">
                      {/* Department Selector Link */}
                      <select
                        value={resp.departmentId || 'production'}
                        onChange={(e) => handleUpdateRoleDept(resp.id, e.target.value)}
                        className="text-xs font-bold text-amber-900 bg-amber-50/90 border border-amber-200 rounded-lg px-2 py-1 outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer max-w-[210px]"
                      >
                        {DEPARTMENTS.map(d => (
                          <option key={d.id} value={d.id}>{d.name}</option>
                        ))}
                      </select>

                      {responsiblesList.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveRole(resp.id)}
                          className="text-slate-300 hover:text-rose-600 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          title="ลบฝ่ายนี้"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <label className="text-[11px] font-semibold text-slate-500">ชื่อผู้รับผิดชอบประจำฝ่าย</label>
                        {getPastNamesForDepartment(resp.departmentId).length > 0 && (
                          <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100">
                            📋 มีประวัติเดิม {getPastNamesForDepartment(resp.departmentId).length} รายชื่อ
                          </span>
                        )}
                      </div>
                      <input
                        type="text"
                        list={`past-names-${resp.id}`}
                        value={resp.name}
                        onChange={(e) => handleUpdateRolePerson(resp.id, e.target.value)}
                        placeholder={getPastNamesForDepartment(resp.departmentId).length > 0 ? "พิมพ์ค้นหา หรือเลือกจากประวัติเดิม..." : "กรอกชื่อผู้รับผิดชอบ..."}
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs bg-white font-bold text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                      <datalist id={`past-names-${resp.id}`}>
                        {getPastNamesForDepartment(resp.departmentId).map((pastName, idx) => (
                          <option key={idx} value={pastName} />
                        ))}
                      </datalist>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-4 border-t border-slate-200/80 flex justify-end">
            <button
              type="submit"
              disabled={!isFormValid}
              className={`inline-flex items-center justify-center px-6 py-3 rounded-xl font-semibold text-xs shadow-2xs transition-all ${
                isFormValid
                  ? 'bg-blue-600 text-white hover:bg-blue-700 active:scale-95'
                  : 'bg-slate-100 text-slate-400 cursor-not-allowed'
              }`}
            >
              <Send className="w-4 h-4 mr-2" />
              บันทึกสร้างโครงการผลิตสินค้า (Production ดูแลสเตจ On-Sale)
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
