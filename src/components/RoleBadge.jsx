import { Shield, ChevronDown, UserCheck } from 'lucide-react';
import { USER_ROLES } from '../data/mockData';

export default function RoleBadge({ currentRole, onRoleChange }) {
  const roleObj = USER_ROLES.find(r => r.id === currentRole) || USER_ROLES[0];

  return (
    <div className="relative group">
      <div className="flex items-center gap-2 bg-slate-100/80 hover:bg-slate-200/80 p-1.5 pl-3 pr-2 rounded-xl transition-all border border-slate-200 cursor-pointer shadow-xs">
        <div className="flex items-center gap-1.5">
          <Shield className="w-4 h-4 text-slate-500" />
          <span className="text-xs text-slate-500 font-medium">สิทธิ์ปัจจุบัน:</span>
          <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold border ${roleObj.badgeColor}`}>
            {roleObj.name}
          </span>
        </div>
        <ChevronDown className="w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-transform group-hover:rotate-180" />
      </div>

      {/* Role Selector Dropdown Menu */}
      <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-200 p-2 z-50 hidden group-hover:block animate-in fade-in zoom-in-95 duration-200">
        <div className="px-3 py-2 border-b border-slate-100 mb-1">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">สลับสิทธิ์การใช้งาน (Role Switcher)</p>
          <p className="text-xs text-slate-500 mt-0.5">เลือกบทบาทเพื่อทดสอบการเข้าถึงและแก้ไขข้อมูล</p>
        </div>
        <div className="space-y-1">
          {USER_ROLES.map((role) => {
            const isSelected = role.id === currentRole;
            return (
              <button
                key={role.id}
                onClick={() => onRoleChange(role.id)}
                className={`w-full text-left p-2.5 rounded-xl transition-all flex items-start gap-3 ${
                  isSelected 
                    ? 'bg-blue-50/80 text-blue-900 border border-blue-200/80' 
                    : 'hover:bg-slate-50 text-slate-700 border border-transparent'
                }`}
              >
                <div className="pt-0.5">
                  <span className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-xs font-bold ${
                    isSelected ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-600'
                  }`}>
                    {role.name[0]}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-xs text-slate-800">{role.name}</span>
                    {isSelected && <UserCheck className="w-3.5 h-3.5 text-blue-600" />}
                  </div>
                  <p className="text-[11px] text-slate-500 leading-tight mt-0.5">{role.description}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
