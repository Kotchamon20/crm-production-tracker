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

export const INITIAL_JOBS = [];

export const INITIAL_NOTIFICATIONS = [];

