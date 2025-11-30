import React, { useState } from 'react';
import { Custodian, Transaction } from '../types';
import { Wallet, ShieldCheck, MoreVertical, ArrowRightLeft, Plus, History, X, Trash2, TrendingUp, TrendingDown, CheckCircle2 } from 'lucide-react';

interface CustodiansProps {
  custodians: Custodian[];
  transactions: Transaction[];
  onTransfer?: (fromId: string, toId: string, amount: number) => void;
  onAddCustodian: (custodian: Omit<Custodian, 'id'>) => void;
  onDeleteCustodian: (id: string) => void;
}

export const Custodians: React.FC<CustodiansProps> = ({ 
  custodians, 
  transactions,
  onTransfer,
  onAddCustodian,
  onDeleteCustodian
}) => {
  // Modal states
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  
  // Data states
  const [transferData, setTransferData] = useState({ fromId: '', toId: '', amount: '' });
  const [newCustodianName, setNewCustodianName] = useState('');
  const [selectedCustodianForHistory, setSelectedCustodianForHistory] = useState<Custodian | null>(null);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  const handleTransferSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onTransfer && transferData.fromId && transferData.toId && transferData.amount) {
      onTransfer(transferData.fromId, transferData.toId, Number(transferData.amount));
      setIsTransferModalOpen(false);
      setTransferData({ fromId: '', toId: '', amount: '' });
    }
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newCustodianName.trim()) {
      onAddCustodian({
        name: newCustodianName,
        balance: 0,
        avatar: `https://ui-avatars.com/api/?name=${newCustodianName}&background=random&color=fff`
      });
      setIsAddModalOpen(false);
      setNewCustodianName('');
    }
  };

  const openHistory = (custodian: Custodian) => {
    setSelectedCustodianForHistory(custodian);
    setIsHistoryModalOpen(true);
  };

  const handleDeleteClick = (id: string) => {
    if (window.confirm('¿Está seguro de eliminar este custodio?')) {
      onDeleteCustodian(id);
      setActiveMenuId(null);
    }
  };

  // Filter transactions for the selected custodian in history modal
  const custodianTransactions = selectedCustodianForHistory 
    ? transactions.filter(t => t.custodianId === selectedCustodianForHistory.id).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    : [];

  return (
    <div className="space-y-6" onClick={() => setActiveMenuId(null)}>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
           <h2 className="text-2xl font-bold text-slate-800">Custodios de Efectivo</h2>
           <p className="text-sm text-slate-500">Gestión de cajas y responsables</p>
        </div>
        
        <div className="flex gap-2">
           {onTransfer && (
            <button 
              onClick={() => setIsTransferModalOpen(true)}
              className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-lg flex items-center gap-2 transition-colors font-medium shadow-sm"
            >
              <ArrowRightLeft size={18} />
              <span>Transferir Fondos</span>
            </button>
           )}
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors font-medium shadow-sm"
          >
            <Plus size={18} />
            <span>Nuevo Custodio</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {custodians.map((custodian) => (
          <div key={custodian.id} className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-visible hover:shadow-md transition-shadow group relative">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4 relative">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-full bg-slate-50 flex items-center justify-center overflow-hidden border-4 border-white shadow-sm">
                    {custodian.avatar ? (
                      <img src={custodian.avatar} alt={custodian.name} className="w-full h-full object-cover" />
                    ) : (
                      <ShieldCheck className="text-slate-400" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">{custodian.name}</h3>
                    <p className="text-xs text-slate-500 uppercase tracking-wide font-medium">ID: {custodian.id}</p>
                  </div>
                </div>
                
                {/* Dropdown Menu */}
                <div className="relative">
                  <button 
                    onClick={(e) => { e.stopPropagation(); setActiveMenuId(activeMenuId === custodian.id ? null : custodian.id); }}
                    className="text-slate-400 hover:text-slate-600 p-1 rounded-md hover:bg-slate-100"
                  >
                    <MoreVertical size={20} />
                  </button>
                  {activeMenuId === custodian.id && (
                    <div className="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-lg border border-slate-100 z-10 py-1">
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleDeleteClick(custodian.id); }}
                        className="w-full text-left px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 flex items-center gap-2"
                      >
                        <Trash2 size={16} /> Eliminar
                      </button>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="mt-6 p-4 bg-slate-50 rounded-xl border border-slate-100 text-center">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Saldo Disponible</p>
                <p className={`text-3xl font-bold ${custodian.balance >= 0 ? 'text-slate-800' : 'text-red-600'}`}>
                  ${custodian.balance.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                </p>
              </div>

              <div className="mt-6">
                <button 
                  onClick={() => openHistory(custodian)}
                  className="w-full bg-white text-indigo-600 py-3 rounded-xl text-sm font-bold hover:bg-indigo-50 transition-all border border-indigo-100 shadow-sm flex items-center justify-center gap-2 group-hover:border-indigo-200"
                >
                  <History size={18} className="text-indigo-500" />
                  Ver Movimientos
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Transfer Modal */}
      {isTransferModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
           <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-200">
             <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
               <ArrowRightLeft className="text-indigo-600"/> Transferencia de Efectivo
             </h3>
             <form onSubmit={handleTransferSubmit} className="space-y-4">
               <div>
                 <label className="block text-sm font-medium text-slate-700 mb-1.5">Custodio Origen (Envía)</label>
                 <select required className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                   value={transferData.fromId} onChange={e => setTransferData({...transferData, fromId: e.target.value})}>
                   <option value="">Seleccionar origen...</option>
                   {custodians.map(c => (
                     <option key={c.id} value={c.id} disabled={c.id === transferData.toId}>
                       {c.name} (${c.balance.toLocaleString()})
                     </option>
                   ))}
                 </select>
               </div>
               <div>
                 <label className="block text-sm font-medium text-slate-700 mb-1.5">Custodio Destino (Recibe)</label>
                 <select required className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                   value={transferData.toId} onChange={e => setTransferData({...transferData, toId: e.target.value})}>
                   <option value="">Seleccionar destino...</option>
                   {custodians.map(c => (
                     <option key={c.id} value={c.id} disabled={c.id === transferData.fromId}>
                       {c.name}
                     </option>
                   ))}
                 </select>
               </div>
               <div>
                 <label className="block text-sm font-medium text-slate-700 mb-1.5">Monto a Transferir</label>
                 <input required type="number" step="0.01" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold outline-none focus:ring-2 focus:ring-indigo-500"
                   value={transferData.amount} onChange={e => setTransferData({...transferData, amount: e.target.value})} placeholder="0.00" />
               </div>

               <div className="flex gap-3 mt-6 pt-4 border-t border-slate-100">
                  <button type="button" onClick={() => setIsTransferModalOpen(false)} className="flex-1 py-3 text-slate-600 font-medium hover:bg-slate-50 rounded-xl transition-colors">Cancelar</button>
                  <button type="submit" className="flex-1 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-colors">Transferir</button>
               </div>
             </form>
           </div>
        </div>
      )}

      {/* Add Custodian Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
           <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 animate-in fade-in zoom-in duration-200">
             <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
               <Wallet className="text-indigo-600"/> Nuevo Custodio
             </h3>
             <form onSubmit={handleAddSubmit} className="space-y-4">
               <div>
                 <label className="block text-sm font-medium text-slate-700 mb-1.5">Nombre del Responsable</label>
                 <input 
                    required 
                    type="text" 
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                    value={newCustodianName} 
                    onChange={e => setNewCustodianName(e.target.value)} 
                    placeholder="Ej. Juan Pérez" 
                 />
               </div>
               <p className="text-xs text-slate-400">El saldo inicial será de $0.00. Para agregar fondos utilice una transferencia o un ingreso.</p>

               <div className="flex gap-3 mt-6 pt-4 border-t border-slate-100">
                  <button type="button" onClick={() => setIsAddModalOpen(false)} className="flex-1 py-3 text-slate-600 font-medium hover:bg-slate-50 rounded-xl transition-colors">Cancelar</button>
                  <button type="submit" className="flex-1 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-colors">Crear</button>
               </div>
             </form>
           </div>
        </div>
      )}

      {/* History Modal */}
      {isHistoryModalOpen && selectedCustodianForHistory && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
           <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full flex flex-col max-h-[80vh] animate-in fade-in zoom-in duration-200">
             <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 rounded-t-2xl">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Historial de Movimientos</h3>
                  <p className="text-sm text-slate-500">{selectedCustodianForHistory.name}</p>
                </div>
                <button onClick={() => setIsHistoryModalOpen(false)} className="text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-full p-1 transition-colors">
                  <X size={24} />
                </button>
             </div>
             
             <div className="p-0 overflow-y-auto flex-1">
               {custodianTransactions.length === 0 ? (
                 <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                   <History size={48} className="mb-3 opacity-20" />
                   <p>No hay movimientos registrados.</p>
                 </div>
               ) : (
                 <div className="divide-y divide-slate-100">
                   {custodianTransactions.map(tx => (
                     <div key={tx.id} className="p-4 hover:bg-slate-50 flex items-center justify-between transition-colors">
                        <div className="flex items-start gap-3">
                           <div className={`mt-1 p-2 rounded-lg ${tx.type === 'INCOME' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                              {tx.type === 'INCOME' ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                           </div>
                           <div>
                             <p className="font-semibold text-slate-800">{tx.description}</p>
                             <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                               <span>{new Date(tx.date).toLocaleDateString()}</span>
                               <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                               <span className={`${
                                  tx.status === 'VALIDATED' ? 'text-emerald-600' : 
                                  tx.status === 'REJECTED' ? 'text-rose-600' : 'text-amber-600'
                               } font-medium`}>
                                 {tx.status === 'VALIDATED' ? 'Validado' : tx.status === 'REJECTED' ? 'Rechazado' : 'Pendiente'}
                               </span>
                             </div>
                           </div>
                        </div>
                        <div className={`font-bold text-lg ${tx.type === 'INCOME' ? 'text-emerald-600' : 'text-rose-600'}`}>
                          {tx.type === 'EXPENSE' ? '-' : '+'}${tx.amount.toLocaleString()}
                        </div>
                     </div>
                   ))}
                 </div>
               )}
             </div>

             <div className="p-4 border-t border-slate-100 bg-slate-50 rounded-b-2xl">
               <button onClick={() => setIsHistoryModalOpen(false)} className="w-full py-2.5 bg-white border border-slate-200 text-slate-600 font-semibold rounded-xl hover:bg-slate-100 transition-colors">
                 Cerrar
               </button>
             </div>
           </div>
        </div>
      )}
    </div>
  );
};