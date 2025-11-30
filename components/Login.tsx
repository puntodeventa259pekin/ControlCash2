import React, { useState } from 'react';
import { User } from '../types';
import { ShieldCheck, User as UserIcon, Lock, ArrowRight, AlertCircle } from 'lucide-react';

interface LoginProps {
  users: User[];
  onLogin: (user: User) => void;
}

export const Login: React.FC<LoginProps> = ({ users, onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const user = users.find(u => u.username === username && u.password === password);
    
    if (user) {
      setError('');
      onLogin(user);
    } else {
      setError('Credenciales incorrectas. Intente nuevamente.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-600 to-blue-600 p-8 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>
          <div className="mx-auto w-16 h-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm mb-4 relative z-10 shadow-lg">
            <ShieldCheck className="text-white w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-1 relative z-10">CashGuard</h1>
          <p className="text-indigo-100 text-sm relative z-10">Sistema de Control Financiero</p>
        </div>
        
        <div className="p-8">
          <form onSubmit={handleLogin} className="space-y-5">
             <div>
               <label className="block text-sm font-medium text-slate-700 mb-1.5 ml-1">Usuario</label>
               <div className="relative group">
                 <div className="absolute left-3 top-3 text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                   <UserIcon size={20} />
                 </div>
                 <input 
                   type="text" 
                   value={username}
                   onChange={(e) => setUsername(e.target.value)}
                   className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all font-medium text-slate-700"
                   placeholder="Ingrese su usuario"
                   required
                 />
               </div>
             </div>

             <div>
               <label className="block text-sm font-medium text-slate-700 mb-1.5 ml-1">Contraseña</label>
               <div className="relative group">
                 <div className="absolute left-3 top-3 text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                   <Lock size={20} />
                 </div>
                 <input 
                   type="password" 
                   value={password}
                   onChange={(e) => setPassword(e.target.value)}
                   className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all font-medium text-slate-700"
                   placeholder="••••••••"
                   required
                 />
               </div>
             </div>

             {error && (
               <div className="bg-rose-50 text-rose-600 text-sm p-3 rounded-lg flex items-center gap-2 animate-pulse">
                 <AlertCircle size={16} />
                 {error}
               </div>
             )}

             <button 
               type="submit"
               className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-indigo-200 flex items-center justify-center gap-2 transition-all mt-2"
             >
               Iniciar Sesión <ArrowRight size={18} />
             </button>
          </form>
          
          <div className="mt-8 text-center">
             <p className="text-xs text-slate-400 mb-2">Credenciales demo:</p>
             <div className="flex justify-center gap-4 text-xs text-slate-500">
               <span>admin / 123</span>
               <span>contador / 123</span>
               <span>operador / 123</span>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};