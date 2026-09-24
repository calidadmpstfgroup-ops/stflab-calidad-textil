import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';
import { Shield, ChevronDown, User, LogOut, Check } from 'lucide-react';

export const UserRoleBadge: React.FC = () => {
  const { usuario, cambiarRolActivo, cerrarSesion } = useAuth();
  const [menuAbierto, setMenuAbierto] = useState(false);

  if (!usuario) return null;

  const rolesList: UserRole[] = [
    'ADMIN',
    'COMPRAS',
    'LABORATORIO',
    'PATRONAJE',
    'CORTE',
    'SUPERVISOR'
  ];

  const getRoleLabel = (role: UserRole) => {
    switch (role) {
      case 'ADMIN': return 'Administrador';
      case 'COMPRAS': return 'Compras';
      case 'LABORATORIO': return 'Laboratorio';
      case 'PATRONAJE': return 'Patronaje';
      case 'CORTE': return 'Corte';
      case 'PROVEEDOR': return 'Proveedor';
      case 'SUPERVISOR': return 'Supervisor';
      default: return role;
    }
  };

  const getRoleColor = (role: UserRole) => {
    switch (role) {
      case 'ADMIN': return 'bg-[#FAF0EC] text-[#8C3D35] border-[#DBA097]';
      case 'COMPRAS': return 'bg-[#EBF2F7] text-[#2E5875] border-[#9BBCD6]';
      case 'LABORATORIO': return 'bg-[#F9F3E3] text-[#7A6428] border-[#DEC987]';
      case 'PATRONAJE': return 'bg-[#EEF3EA] text-[#485C3E] border-[#94A786]';
      case 'CORTE': return 'bg-[#AA9E80]/20 text-[#AA9E80] border-[#AA9E80]/40';
      case 'PROVEEDOR': return 'bg-[#F9F3E3] text-[#7A6428] border-[#DEC987]';
      case 'SUPERVISOR': return 'bg-[#EEF3EA] text-[#485C3E] border-[#94A786]';
      default: return 'bg-[#E5E4DF] text-[#6B6256] border-[#D8D6CF]';
    }
  };

  return (
    <div className="relative font-sans">
      <button
        type="button"
        onClick={() => setMenuAbierto(!menuAbierto)}
        className="flex items-center gap-2 px-3 py-1.5 bg-[#2D2D30] border border-[#424246] rounded-2xl hover:border-[#AA9E80]/40 transition-all shadow-sm cursor-pointer"
      >
        <div className="w-6 h-6 rounded-full bg-[#2E2822] flex items-center justify-center text-[#AA9E80] text-xs font-bold">
          <User className="w-3.5 h-3.5" />
        </div>
        <div className="text-left hidden md:block">
          <span className="text-xs font-bold text-[#F0EFEB] block truncate max-w-[130px]">
            {getRoleLabel(usuario.role)}
          </span>
          <span className={`text-[9px] font-black uppercase px-1.5 py-0.2 rounded border ${getRoleColor(usuario.role)}`}>
            {usuario.role}
          </span>
        </div>
        <ChevronDown className="w-3.5 h-3.5 text-[#A69E90]" />
      </button>

      {menuAbierto && (
        <div className="absolute right-0 mt-2 w-60 bg-[#2D2D30] border border-[#424246] rounded-2xl shadow-2xl p-2 z-50 text-xs text-[#F0EFEB] space-y-1 animate-fade-in">
          <div className="p-2 border-b border-[#424246]">
            <span className="text-[10px] text-[#A69E90] block font-bold uppercase tracking-wider">Rol Autenticado</span>
            <strong className="text-white text-xs block truncate">{getRoleLabel(usuario.role)}</strong>
            <span className="text-[11px] text-[#AA9E80] font-mono block">{usuario.email}</span>
          </div>

          <div className="py-1">
            <span className="text-[10px] text-[#A69E90] px-2 font-bold uppercase tracking-wider block mb-1">
              Conmutar Rol (RBAC):
            </span>
            {rolesList.map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => {
                  cambiarRolActivo(r);
                  setMenuAbierto(false);
                }}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left transition-colors cursor-pointer ${
                  usuario.role === r ? 'bg-[#2E2822] text-[#AA9E80] font-bold' : 'text-[#A69E90] hover:text-[#F0EFEB] hover:bg-[#2E2822]'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded border ${getRoleColor(r)}`}>
                    {r}
                  </span>
                  <span className="text-xs text-[#F0EFEB] font-medium">{getRoleLabel(r)}</span>
                </div>
                {usuario.role === r && <Check className="w-3.5 h-3.5 text-[#AA9E80]" />}
              </button>
            ))}
          </div>

          <div className="pt-1 border-t border-slate-800">
            <button
              type="button"
              onClick={() => {
                cerrarSesion();
                setMenuAbierto(false);
              }}
              className="w-full flex items-center gap-2 px-2.5 py-1.5 text-rose-400 hover:bg-rose-950/30 rounded-lg font-bold transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Cerrar Sesión</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
