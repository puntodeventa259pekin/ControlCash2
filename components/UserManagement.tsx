import React, { useState } from 'react';
import { User, Role } from '../types';
import { Trash2, UserPlus, Shield, User as UserIcon, Briefcase } from 'lucide-react';

interface UserManagementProps {
  users: User[];
  onAddUser: (user: User) => void;
  onDeleteUser: (id: string) => void;
}

export const UserManagement: React.FC<UserManagementProps> = ({ users, onAddUser, onDeleteUser }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newUser, setNewUser] = useState({ name: '', role: 'OPERATOR' as Role });

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const user: User = {
      id: Date.now().toString(),
      name: newUser.name,
      role: newUser.role,
      avatar: `https://ui-avatars.com/api/?name=${newUser.name}&background=random&color=fff`
    };
    onAddUser(user);
    setIsModalOpen(false);
    setNewUser({ name: '', role: 'OPERATOR' });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Gestión de Usuarios</h2>
          <p className="text-sm text-slate-500">Administrar accesos y roles del sistema</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors font-medium shadow-sm"
        >
          <UserPlus size={18} /> Nuevo Usuario
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase">
              <th className="p-4">Usuario</th>
              <th className="p-4">Rol</th>
              <th className="p-4 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full bg-slate-100" />
                    <div>
                      <div className="font-semibold text-slate-900">{user.name}</div>
                      <div className="text-xs text-slate-400">ID: {user.id}</div>
                    </div>
                  </div>
                </td>
                <td className="p-4">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
                    user.role === 'ADMIN' ? 'bg-purple-50 text-purple-700 border-purple-100' :
                    user.role === 'ACCOUNTANT' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                    'bg-emerald-50 text-emerald-700 border-emerald-100'
                  }`}>
                    {user.role === 'ADMIN' && <Shield size={12} />}
                    {user.role === 'ACCOUNTANT' && <Briefcase size={12} />}
                    {user.role === 'OPERATOR' && <UserIcon size={12} />}
                    {user.role}
                  </span>
                </td>
                <td className="p-4 text-center">
                  <button 
                    onClick={() => onDeleteUser(user.id)}
                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    title="Eliminar Usuario"
                  >
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Agregar Nuevo Usuario</h3>
            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nombre Completo</label>
                <input 
                  required 
                  type="text" 
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" 
                  value={newUser.name}
                  onChange={e => setNewUser({...newUser, name: e.target.value})}
                  placeholder="Ej. Juan Pérez"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Rol</label>
                <select 
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={newUser.role}
                  onChange={e => setNewUser({...newUser, role: e.target.value as Role})}
                >
                  <option value="OPERATOR">OPERATOR - Solo Transacciones</option>
                  <option value="ACCOUNTANT">ACCOUNTANT - Validador</option>
                  <option value="ADMIN">ADMIN - Acceso Total</option>
                </select>
              </div>
              <div className="flex gap-3 mt-6 pt-2">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-2.5 border border-slate-200 rounded-lg text-slate-600 font-medium hover:bg-slate-50">Cancelar</button>
                <button type="submit" className="flex-1 py-2.5 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-200">Crear Usuario</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};