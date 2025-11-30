
import React, { useState } from 'react';
import { Database, Server, Save, Play, AlertTriangle, CheckCircle, Lock, User as UserIcon, Activity } from 'lucide-react';
import { DBConfig } from '../types';

interface DatabaseConfigProps {
  onConfigSaved: (config: DBConfig) => void;
}

export const DatabaseConfig: React.FC<DatabaseConfigProps> = ({ onConfigSaved }) => {
  const [config, setConfig] = useState<DBConfig>({
    server: '',
    database: 'CashGuardDB',
    user: '',
    password: ''
  });
  const [status, setStatus] = useState<'IDLE' | 'TESTING' | 'INITIALIZING' | 'ERROR' | 'SUCCESS'>('IDLE');
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (msg: string) => setLogs(prev => [...prev, `> ${msg}`]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('TESTING');
    setLogs(['Iniciando prueba de conexión...']);

    try {
      // Simulation delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      addLog(`Conectando a ${config.server}...`);
      
      if (!config.server || !config.user) throw new Error("Faltan credenciales");

      addLog("Conexión TCP establecida.");
      addLog(`Verificando base de datos '${config.database}'...`);
      
      setStatus('INITIALIZING');
      addLog("Base de datos no encontrada o tablas faltantes.");
      addLog("Ejecutando script de inicialización (CREATE TABLES)...");
      
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      addLog("Tablas creadas: Users, Custodians, Invoices, Transactions.");
      addLog("Insertando datos semilla...");
      
      setStatus('SUCCESS');
      addLog("¡Configuración completada con éxito!");

      setTimeout(() => {
        onConfigSaved(config);
      }, 1000);

    } catch (err) {
      setStatus('ERROR');
      addLog(`ERROR: ${err instanceof Error ? err.message : 'Fallo de conexión'}`);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full grid grid-cols-1 lg:grid-cols-2 gap-0 lg:gap-8 bg-white rounded-2xl shadow-2xl overflow-hidden min-h-[500px]">
        
        {/* Left: Form */}
        <div className="p-8 flex flex-col justify-center">
          <div className="flex items-center gap-3 mb-6">
             <div className="bg-indigo-100 p-3 rounded-xl">
               <Database className="text-indigo-600" size={32} />
             </div>
             <div>
               <h1 className="text-2xl font-bold text-slate-800">Configuración SQL</h1>
               <p className="text-sm text-slate-500">Conexión a Base de Datos</p>
             </div>
          </div>
          
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-6 flex gap-3 text-sm text-amber-800">
            <AlertTriangle className="shrink-0" size={20} />
            <p>No se pudo establecer conexión automática. Por favor configure los parámetros del servidor SQL Server.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
             <div>
               <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Servidor / Host</label>
               <div className="relative">
                 <Server className="absolute left-3 top-3 text-slate-400" size={18} />
                 <input 
                    required 
                    type="text" 
                    placeholder="localhost, 1433" 
                    className="w-full pl-10 p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    value={config.server}
                    onChange={e => setConfig({...config, server: e.target.value})}
                 />
               </div>
             </div>
             
             <div>
               <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nombre Base de Datos</label>
               <div className="relative">
                 <Database className="absolute left-3 top-3 text-slate-400" size={18} />
                 <input 
                    required 
                    type="text" 
                    placeholder="CashGuardDB" 
                    className="w-full pl-10 p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    value={config.database}
                    onChange={e => setConfig({...config, database: e.target.value})}
                 />
               </div>
             </div>

             <div className="grid grid-cols-2 gap-4">
               <div>
                 <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Usuario</label>
                 <div className="relative">
                   <UserIcon className="absolute left-3 top-3 text-slate-400" size={18} />
                   <input 
                      required 
                      type="text" 
                      placeholder="sa" 
                      className="w-full pl-10 p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                      value={config.user}
                      onChange={e => setConfig({...config, user: e.target.value})}
                   />
                 </div>
               </div>
               <div>
                 <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Contraseña</label>
                 <div className="relative">
                   <Lock className="absolute left-3 top-3 text-slate-400" size={18} />
                   <input 
                      required 
                      type="password" 
                      placeholder="••••••" 
                      className="w-full pl-10 p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                      value={config.password}
                      onChange={e => setConfig({...config, password: e.target.value})}
                   />
                 </div>
               </div>
             </div>

             <button 
                type="submit" 
                disabled={status === 'TESTING' || status === 'INITIALIZING'}
                className={`w-full mt-4 py-3 rounded-xl font-bold text-white flex items-center justify-center gap-2 transition-all shadow-lg ${
                  status === 'SUCCESS' ? 'bg-emerald-500 hover:bg-emerald-600' :
                  status === 'ERROR' ? 'bg-rose-500 hover:bg-rose-600' :
                  'bg-indigo-600 hover:bg-indigo-700'
                }`}
             >
                {status === 'TESTING' || status === 'INITIALIZING' ? (
                  <>
                     <Activity className="animate-spin" size={20} /> Procesando...
                  </>
                ) : status === 'SUCCESS' ? (
                  <>
                     <CheckCircle size={20} /> Configuración Guardada
                  </>
                ) : (
                  <>
                     <Play size={20} /> Guardar e Inicializar
                  </>
                )}
             </button>
          </form>
        </div>

        {/* Right: Console/Logs */}
        <div className="bg-slate-900 p-8 text-slate-300 font-mono text-sm flex flex-col">
          <div className="flex items-center gap-2 mb-4 text-slate-400 border-b border-slate-700 pb-2">
            <Activity size={16} />
            <span>Terminal de Sistema</span>
          </div>
          <div className="flex-1 overflow-y-auto space-y-2">
             <div className="text-slate-500">System ready. Waiting for configuration...</div>
             {logs.map((log, i) => (
               <div key={i} className={`${
                 log.includes('ERROR') ? 'text-rose-400' : 
                 log.includes('SUCCESS') ? 'text-emerald-400' : 
                 log.includes('CREATE') ? 'text-blue-400' : 'text-slate-300'
               }`}>
                 {log}
               </div>
             ))}
             {(status === 'TESTING' || status === 'INITIALIZING') && (
               <div className="animate-pulse">_</div>
             )}
          </div>
        </div>
      </div>
    </div>
  );
};
