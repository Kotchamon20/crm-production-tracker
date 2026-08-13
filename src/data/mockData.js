// CRM Production Tracker - Initial Mock Data & Constants

export const DEPARTMENTS = [
  { id: 'production', name: 'ฝ่ายผลิต & วางขาย (Production)', badgeColor: 'bg-amber-100 text-amber-800 border-amber-200' },
  { id: 'designer', name: 'ฝ่ายออกแบบ (Design)', badgeColor: 'bg-pink-100 text-pink-800 border-pink-200' },
  { id: 'marketing', name: 'ฝ่ายการตลาด (Marketing)', badgeColor: 'bg-rose-100 text-rose-800 border-rose-200' },
  { id: 'logistics', name: 'ฝ่ายจัดส่ง & คลังสินค้า (Logistics)', badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-200' },
  { id: 'management', name: 'ฝ่ายบริหาร (Management / Admin)', badgeColor: 'bg-purple-100 text-purple-800 border-purple-200' }
];

export const WORKFLOW_STAGES = [
  { id: 'start', label: 'Start (เปิดโครงการผลิต)', shortLabel: 'Start', defaultDays: 1, departmentId: 'management', role: 'production' },
  { id: 'design', label: 'Design (ออกแบบ)', shortLabel: 'Design', defaultDays: 3, departmentId: 'designer', role: 'designer' },
  { id: 'approved', label: 'Approved (อนุมัติแบบ)', shortLabel: 'Approved', defaultDays: 2, departmentId: 'designer', role: 'designer' },
  { id: 'edit', label: 'Edit (แก้ไขแบบ)', shortLabel: 'Edit', defaultDays: 2, departmentId: 'designer', role: 'designer' },
  { id: 'production_order', label: 'สั่งผลิต (Production Order)', shortLabel: 'สั่งผลิต', defaultDays: 1, departmentId: 'production', role: 'production' },
  { id: 'production', label: 'Production (กำลังผลิต)', shortLabel: 'Production', defaultDays: 7, departmentId: 'production', role: 'production' },
  { id: 'qc', label: 'QC (ตรวจสอบคุณภาพ)', shortLabel: 'QC', defaultDays: 2, departmentId: 'production', role: 'production' },
  { id: 'complete', label: 'เสร็จสิ้น/จัดส่ง (Complete/Shipped)', shortLabel: 'Complete', defaultDays: 1, departmentId: 'logistics', role: 'production' },
  { id: 'marketing', label: 'Marketing (ทำโปรโมทสินค้า)', shortLabel: 'Marketing', defaultDays: 3, departmentId: 'marketing', role: 'marketing' },
  { id: 'on_sale', label: 'วางจำหน่าย (Release / On-Sale)', shortLabel: 'On-Sale', defaultDays: 1, departmentId: 'production', role: 'production' },
];

export const USER_ROLES = [
  { id: 'admin', name: 'Admin', description: 'ดูและจัดการได้ทุกจุด สามารถแก้ไขข้อมูลทุกส่วนได้', badgeColor: 'bg-purple-100 text-purple-700 border-purple-200' },
  { id: 'production', name: 'Production', description: 'อัปเดตขั้นตอนผลิต QC และทำหน้าที่ดูแลสเตจวางจำหน่ายสินค้า', badgeColor: 'bg-amber-100 text-amber-700 border-amber-200' },
  { id: 'designer', name: 'Designer', description: 'อัปเดตงานออกแบบ แนบลิงก์แบบ/Drive', badgeColor: 'bg-pink-100 text-pink-700 border-pink-200' },
  { id: 'marketing', name: 'Marketing', description: 'จัดการแคมเปญโปรโมต สื่อโฆษณา และสื่อโซเชียลมีเดีย', badgeColor: 'bg-rose-100 text-rose-700 border-rose-200' }
];

export const INITIAL_JOBS = [
  {
    id: 'JOB-2026-001',
    project_name: 'แก้วกาแฟพรีเมียม ลาย Summer Collection 2026',
    product_type: 'glass',
    specifications: {
      material_grade: 'Premium Glass Grade A (Borosilicate)',
      color: 'ใสสกรีน 4 สี',
      size: '16 oz (480 ml)',
      quantity: 5000,
      pattern_design: 'Summer Tropical Botanical v2'
    },
    start_date: '2026-08-01',
    due_date: '2026-08-22',
    on_sale_date: '2026-09-01',
    responsibles: [
      { id: 'r1', departmentId: 'production', departmentName: 'ฝ่ายผลิต & วางขาย (Production)', name: 'เกรียงไกร การผลิต' },
      { id: 'r2', departmentId: 'designer', departmentName: 'ฝ่ายออกแบบ (Design)', name: 'วิภาดา ดีไซน์' },
      { id: 'r3', departmentId: 'marketing', departmentName: 'ฝ่ายการตลาด (Marketing)', name: 'สมหญิง ทำโปรโมท' },
      { id: 'r4', departmentId: 'logistics', departmentName: 'ฝ่ายจัดส่ง & คลังสินค้า (Logistics)', name: 'สมศักดิ์ ขนส่ง' }
    ],
    current_stage: 'production',
    stages: {
      start: { status: 'completed', start_date: '2026-08-01', due_date: '2026-08-02', completed_at: '2026-08-01T10:30:00Z', assignee: 'เกรียงไกร การผลิต (ฝ่ายผลิต)', notes: 'อนุมัติเปิดโครงการผลิตสินค้าประจำซีซั่น', attachments: [] },
      design: { status: 'completed', start_date: '2026-08-02', due_date: '2026-08-05', completed_at: '2026-08-04T15:00:00Z', assignee: 'วิภาดา ดีไซน์ (ฝ่ายออกแบบ)', notes: 'ออกแบบม็อคอัพ 3D เรียบร้อย', attachments: [{ name: '3D Mockup Design v2', url: 'https://drive.google.com/file/sample-cafe-amazon-cup', type: 'link' }] },
      approved: { status: 'completed', start_date: '2026-08-05', due_date: '2026-08-07', completed_at: '2026-08-06T11:20:00Z', assignee: 'วิภาดา ดีไซน์ (ฝ่ายออกแบบ)', notes: 'สรุปผ่านแบบอนุมัติในทีมบริหาร', attachments: [{ name: 'Internal_Approval_Form.pdf', url: 'https://example.com/approval-001.pdf', type: 'file' }] },
      edit: { status: 'completed', start_date: '2026-08-07', due_date: '2026-08-08', completed_at: '2026-08-07T16:00:00Z', assignee: 'วิภาดา ดีไซน์ (ฝ่ายออกแบบ)', notes: 'ปรับตำแหน่งโลโก้ขยับขึ้น 5mm', attachments: [] },
      production_order: { status: 'completed', start_date: '2026-08-08', due_date: '2026-08-09', completed_at: '2026-08-08T09:00:00Z', assignee: 'เกรียงไกร การผลิต (ฝ่ายผลิต)', notes: 'ออก PO เลขที่ PO-2026-881', attachments: [] },
      production: { status: 'in_progress', start_date: '2026-08-09', due_date: '2026-08-16', completed_at: null, assignee: 'เกรียงไกร การผลิต (ฝ่ายผลิต)', notes: 'กำลังสกรีนแก้วชุดแรก 2,500 ใบ', attachments: [{ name: 'รูปถ่ายสายการผลิต_ลอต1.jpg', url: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&auto=format&fit=crop&q=60', type: 'image' }] },
      qc: { status: 'pending', start_date: '2026-08-16', due_date: '2026-08-18', completed_at: null, assignee: 'เกรียงไกร การผลิต (ฝ่ายผลิต)', notes: '', attachments: [] },
      complete: { status: 'pending', start_date: '2026-08-18', due_date: '2026-08-22', completed_at: null, assignee: 'สมศักดิ์ ขนส่ง (ฝ่ายจัดส่ง)', notes: 'กำหนดวันวางขายหน้าร้าน 1 ก.ย. 2026', attachments: [] },
      marketing: { status: 'pending', start_date: '2026-08-22', due_date: '2026-08-28', completed_at: null, assignee: 'สมหญิง ทำโปรโมท (ฝ่ายการตลาด)', notes: 'เตรียมทำสื่อโปรโมต Facebook/IG & Banner หน้าร้าน', attachments: [] },
      on_sale: { status: 'pending', start_date: '2026-09-01', due_date: '2026-09-01', completed_at: null, assignee: 'เกรียงไกร การผลิต (ฝ่ายผลิต)', notes: 'ฝ่ายผลิตดูแลการกระจายและวางจำหน่ายหน้าร้าน', attachments: [] }
    },
    audit_logs: [
      { id: 'l1', timestamp: '2026-08-01T10:30:00Z', user: 'เกรียงไกร การผลิต (ฝ่ายผลิต)', action: 'สร้างโครงการผลิต JOB-2026-001 เข้าสู่ระบบ' },
      { id: 'l2', timestamp: '2026-08-09T08:00:00Z', user: 'เกรียงไกร การผลิต (ฝ่ายผลิต)', action: 'เริ่มกระบวนการผลิต (In Production)' }
    ]
  },
  {
    id: 'JOB-2026-002',
    project_name: 'ถุงกระดาษคราฟท์ทรงสูง หูเกลียวสีกระดาษ',
    product_type: 'paper',
    specifications: {
      material_grade: 'Kraft Paper 150g GSM',
      color: 'พิมพ์ 2 สี (น้ำตาล/แดง)',
      size: '22 x 10 x 30 cm',
      quantity: 10000,
      pattern_design: 'Classic Original Pattern'
    },
    start_date: '2026-08-03',
    due_date: '2026-08-12',
    on_sale_date: '2026-08-25',
    responsibles: [
      { id: 'r1', departmentId: 'production', departmentName: 'ฝ่ายผลิต & วางขาย (Production)', name: 'เกรียงไกร การผลิต' },
      { id: 'r2', departmentId: 'designer', departmentName: 'ฝ่ายออกแบบ (Design)', name: 'วิภาดา ดีไซน์' },
      { id: 'r3', departmentId: 'marketing', departmentName: 'ฝ่ายการตลาด (Marketing)', name: 'สมหญิง ทำโปรโมท' }
    ],
    current_stage: 'design',
    stages: {
      start: { status: 'completed', start_date: '2026-08-03', due_date: '2026-08-04', completed_at: '2026-08-03T14:00:00Z', assignee: 'เกรียงไกร การผลิต (ฝ่ายผลิต)', notes: '', attachments: [] },
      design: { status: 'delayed', start_date: '2026-08-04', due_date: '2026-08-07', completed_at: null, assignee: 'วิภาดา ดีไซน์ (ฝ่ายออกแบบ)', notes: 'รอปรับสเปกความละเอียดโลโก้', attachments: [] },
      approved: { status: 'pending', start_date: '2026-08-07', due_date: '2026-08-08', completed_at: null, assignee: 'วิภาดา ดีไซน์ (ฝ่ายออกแบบ)', notes: '', attachments: [] },
      edit: { status: 'pending', start_date: '2026-08-08', due_date: '2026-08-09', completed_at: null, assignee: 'วิภาดา ดีไซน์ (ฝ่ายออกแบบ)', notes: '', attachments: [] },
      production_order: { status: 'pending', start_date: '2026-08-09', due_date: '2026-08-09', completed_at: null, assignee: 'เกรียงไกร การผลิต (ฝ่ายผลิต)', notes: '', attachments: [] },
      production: { status: 'pending', start_date: '2026-08-09', due_date: '2026-08-11', completed_at: null, assignee: 'เกรียงไกร การผลิต (ฝ่ายผลิต)', notes: '', attachments: [] },
      qc: { status: 'pending', start_date: '2026-08-11', due_date: '2026-08-12', completed_at: null, assignee: 'เกรียงไกร การผลิต (ฝ่ายผลิต)', notes: '', attachments: [] },
      complete: { status: 'pending', start_date: '2026-08-12', due_date: '2026-08-12', completed_at: null, assignee: 'เกรียงไกร การผลิต (ฝ่ายผลิต)', notes: '', attachments: [] },
      marketing: { status: 'pending', start_date: '2026-08-12', due_date: '2026-08-20', completed_at: null, assignee: 'สมหญิง ทำโปรโมท (ฝ่ายการตลาด)', notes: '', attachments: [] },
      on_sale: { status: 'pending', start_date: '2026-08-25', due_date: '2026-08-25', completed_at: null, assignee: 'เกรียงไกร การผลิต (ฝ่ายผลิต)', notes: '', attachments: [] }
    },
    audit_logs: [
      { id: 'l1', timestamp: '2026-08-03T14:00:00Z', user: 'เกรียงไกร การผลิต (ฝ่ายผลิต)', action: 'สร้างโครงการผลิต JOB-2026-002' }
    ]
  }
];

export const INITIAL_NOTIFICATIONS = [
  {
    id: 'n1',
    job_id: 'JOB-2026-002',
    title: '⚠️ เตือนงานล่าช้ากว่ากำหนด (Overdue)',
    message: 'JOB-2026-002 ในขั้นตอน Design เกินกำหนดส่งแล้ว!',
    timestamp: '2026-08-08T08:00:00Z',
    read: false,
    type: 'warning'
  },
  {
    id: 'n2',
    job_id: 'JOB-2026-001',
    title: '📢 ฝ่าย Production ดูแลสเตจ On-Sale',
    message: 'JOB-2026-001 ฝ่าย Production ทำหน้าที่ดูแลสเตจผลิตและกระจายสินค้าวางจำหน่ายหน้าร้าน (On-Sale)',
    timestamp: '2026-08-10T09:00:00Z',
    read: false,
    type: 'info'
  }
];
