import React, { useState } from 'react';
import { Invoice, Custodian, InvoiceType, User, InvoiceValidationStatus } from '../types';
import { ArrowUpRight, ArrowDownLeft, Calendar, Plus, Trash2, CheckCircle2, AlertCircle, Edit2, DollarSign, FileText } from 'lucide-react';

interface AccountsProps {
  invoices: Invoice[];
  custodians: Custodian[];
  currentUser: User;
  onProcessInvoice: (invoiceId: string, custodianId: string) => void;
  onAddInvoice: (invoice: Omit<Invoice, 'id'>) => void;
  onUpdateInvoice: (invoice: Invoice) => void;
  onDeleteInvoice: (id: string) => void;
}

type TabView = 'DRAFTS' | 'TO_PROCESS' | 'HISTORY';

export const Accounts: React.FC<AccountsProps> = ({ 
  invoices, 
  custodians, 
  currentUser,
  onProcessInvoice,
  onAddInvoice,
  onUpdateInvoice,
  onDeleteInvoice
}) => {
  const [activeTab, setActiveTab] = useState<TabView>('TO_PROCESS');
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [selectedCustodian, setSelectedCustodian] = useState<string>('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
  // Modal State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<Invoice>>({
    entityName: '', description: '', amount: 0, dueDate: '', type: 'PAYABLE', status: 'PENDING', validationStatus: 'DRAFT'
  });
  const [isEditing, setIsEditing] = useState(false);

  // Filter Logic
  const filteredInvoices = invoices.filter(inv => {
    // 1. Tab Status Filter
    let statusMatch = false;
    if (activeTab === 'HISTORY') statusMatch = inv.status === 'PAID';
    else if (activeTab === 'TO_PROCESS') statusMatch = inv.status === 'PENDING' && inv.validationStatus === 'VALIDATED';
    else if (activeTab === 'DRAFTS') statusMatch = inv.status === 'PENDING' && inv.validationStatus === 'DRAFT';
    
    // 2. Date Filter
    const matchesStartDate = startDate ? new Date(inv.dueDate) >= new Date(startDate) : true;
    const matchesEndDate = endDate ? new Date(inv.dueDate) <= new Date(endDate) : true;

    return statusMatch && matchesStartDate && matchesEndDate;
  });

  // KPI Calculations (Validated Only)
  const totalReceivable = invoices.filter(i => i.status === 'PENDING' && i.validationStatus === 'VALIDATED' && i.type === 'RECEIVABLE').reduce((a, b) => a + b.amount, 0);
  const totalPayable = invoices.filter(i => i.status === 'PENDING' && i.validationStatus === 'VALIDATED' && i.type === 'PAYABLE').reduce((a, b) => a + b.amount, 0);

  // Permissions
  const canValidate = currentUser.role === 'ACCOUNTANT' || currentUser.role === 'ADMIN';
  const canEdit = currentUser.role === 'OPERATOR' || currentUser.role === 'ACCOUNTANT' || currentUser.role === 'ADMIN';
  const canPay = currentUser.role === 'OPERATOR' || currentUser.role === 'ADMIN';

  const handleProcess = () => {
    if (selectedInvoice && selectedCustodian) {
      onProcessInvoice(selectedInvoice.id, selectedCustodian);
      setSelectedInvoice(null);
      setSelectedCustodian('');
    }
  };

  const handleValidate = (inv: Invoice) => {
    onUpdateInvoice({ ...inv, validationStatus: 'VALIDATED' });
  };

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (isEditing && formData.id) {
       onUpdateInvoice(formData as Invoice);
    } else {
       onAddInvoice({
         entityName: formData.entityName!,
         description: formData.description!,
         amount: Number(formData.amount),
         dueDate: formData.dueDate!,
         type: formData.type!,
         status: 'PENDING',
         validationStatus: 'DRAFT'
       });
    }
    setIsFormOpen(false);
  };

  const openNewForm = () => {
    setIsEditing(false);
    setFormData({ entityName: '', description: '', amount: 0, dueDate: '', type: 'PAYABLE', status: 'PENDING', validationStatus: 'DRAFT' });
    setIsFormOpen(true);
  };

  const openEditForm = (inv: Invoice) => {
    setIsEditing(true);
    setFormData({ ...inv });
    setIsFormOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Cuentas por Cobrar y Pagar</h2>
          <p className="text-slate-500 text-sm mt-1">Gestión del flujo de compromisos financieros</p>
        </div>
         {canEdit && (
          <button 
            onClick={openNewForm}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl shadow-lg shadow-indigo-200 flex items-center gap-2 transition-all font-medium"
          >
            <Plus size={20} /> Nueva Cuenta
          </button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-5 rounded-xl border border-emerald-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Por Cobrar (Validado)</p>
            <h3 className="text-2xl font-bold text-emerald-600 mt-1">${totalReceivable.toLocaleString()}</h3>
          </div>
          <div className="h-12 w-12 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
            <ArrowDownLeft size={24} />
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-rose-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Por Pagar (Validado)</p>
            <h3 className="text-2xl font-bold text-rose-600 mt-1">${totalPayable.toLocaleString()}</h3>
          </div>
          <div className="h-12 w-12 rounded-full bg-rose-50 flex items-center justify-center text-rose-600">
            <ArrowUpRight size={24} />
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Custom Tab Header & Filters */}
        <div className="flex flex-col md:flex-row border-b border-slate-100 bg-slate-50/50 p-2 gap-4 items-center justify-between">
           {/* Tabs */}
           <div className="flex gap-2 w-full md:w-auto">
             {[
                { id: 'TO_PROCESS', label: 'Por Procesar' },
                { id: 'DRAFTS', label: 'En Edición' },
                { id: 'HISTORY', label: 'Histórico' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as TabView)}
                  className={`flex-1 md:flex-none py-2 px-4 rounded-lg text-sm font-medium transition-all ${
                    activeTab === tab.id 
                      ? 'bg-white text-indigo-600 shadow-sm ring-1 ring-slate-200' 
                      : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {tab.label}
                  {tab.id !== 'HISTORY' && (
                    <span className={`ml-2 text-xs py-0.5 px-2 rounded-full ${
                      activeTab === tab.id ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-200 text-slate-500'
                    }`}>
                      {invoices.filter(i => {
                         if (tab.id === 'TO_PROCESS') return i.status === 'PENDING' && i.validationStatus === 'VALIDATED';
                         if (tab.id === 'DRAFTS') return i.status === 'PENDING' && i.validationStatus === 'DRAFT';
                         return false;
                      }).length}
                    </span>
                  )}
                </button>
              ))}
           </div>
           
           {/* Date Filter */}
           <div className="flex items-center gap-2 w-full md:w-auto">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide hidden md:block">Vencimiento:</span>
              <div className="relative flex-1 md:flex-none">
                 <input 
                   type="date" 
                   value={startDate}
                   onChange={(e) => setStartDate(e.target.value)}
                   className="w-full pl-3 pr-2 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 outline-none text-slate-600"
                   placeholder="Desde"
                 />
              </div>
              <span className="text-slate-400 text-sm">-</span>
              <div className="relative flex-1 md:flex-none">
                 <input 
                   type="date" 
                   value={endDate}
                   onChange={(e) => setEndDate(e.target.value)}
                   className="w-full pl-3 pr-2 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 outline-none text-slate-600"
                   placeholder="Hasta"
                 />
              </div>
           </div>
        </div>

        {/* List Content */}
        <div className="divide-y divide-slate-100">
           {filteredInvoices.length === 0 ? (
             <div className="p-12 text-center">
               <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                 <FileText className="text-slate-300" size={32} />
               </div>
               <p className="text-slate-500 font-medium">No hay registros en esta sección para los filtros seleccionados.</p>
             </div>
           ) : (
             filteredInvoices.map((inv) => (
               <div key={inv.id} className="p-4 hover:bg-slate-50 transition-colors flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                 <div className="flex items-start gap-4 flex-1">
                   <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 mt-1 ${
                     inv.type === 'RECEIVABLE' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'
                   }`}>
                      {inv.type === 'RECEIVABLE' ? <ArrowDownLeft size={20} /> : <ArrowUpRight size={20} />}
                   </div>
                   <div>
                     <div className="flex items-center gap-2">
                       <h4 className="font-semibold text-slate-900">{inv.entityName}</h4>
                       {inv.validationStatus === 'DRAFT' && (
                         <span className="text-[10px] uppercase font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-100">Borrador</span>
                       )}
                     </div>
                     <p className="text-sm text-slate-500">{inv.description}</p>
                     <div className="flex items-center gap-3 mt-1.5">
                       <span className="flex items-center gap-1 text-xs text-slate-400 font-medium bg-slate-100 px-2 py-0.5 rounded">
                         <Calendar size={12} /> {inv.dueDate}
                       </span>
                     </div>
                   </div>
                 </div>

                 <div className="flex items-center gap-6 w-full sm:w-auto justify-between sm:justify-end">
                    <div className="text-right">
                      <p className={`text-lg font-bold ${inv.type === 'RECEIVABLE' ? 'text-emerald-600' : 'text-rose-600'}`}>
                        ${inv.amount.toLocaleString()}
                      </p>
                      <p className="text-xs text-slate-400 font-medium uppercase">{inv.type === 'RECEIVABLE' ? 'Por Cobrar' : 'Por Pagar'}</p>
                    </div>

                    <div className="flex items-center gap-2">
                       {/* DRAFT ACTIONS */}
                       {activeTab === 'DRAFTS' && (
                         <>
                           {canEdit && (
                             <button onClick={() => openEditForm(inv)} className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors" title="Editar">
                               <Edit2 size={18} />
                             </button>
                           )}
                           {canValidate && (
                             <button onClick={() => handleValidate(inv)} className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors" title="Validar">
                                <CheckCircle2 size={18} />
                             </button>
                           )}
                           {canEdit && (
                             <button onClick={() => onDeleteInvoice(inv.id)} className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors" title="Eliminar">
                               <Trash2 size={18} />
                             </button>
                           )}
                         </>
                       )}

                       {/* PROCESS ACTIONS */}
                       {activeTab === 'TO_PROCESS' && canPay && (
                         <button
                           onClick={() => setSelectedInvoice(inv)}
                           className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white shadow-sm transition-all hover:shadow-md ${
                              inv.type === 'RECEIVABLE' 
                              ? 'bg-emerald-600 hover:bg-emerald-700' 
                              : 'bg-rose-600 hover:bg-rose-700'
                           }`}
                         >
                            <DollarSign size={16} />
                            {inv.type === 'RECEIVABLE' ? 'Cobrar' : 'Pagar'}
                         </button>
                       )}
                       
                       {/* HISTORY INDICATOR */}
                       {activeTab === 'HISTORY' && (
                         <span className="text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full text-xs font-bold border border-emerald-100">
                           PAGADO
                         </span>
                       )}
                    </div>
                 </div>
               </div>
             ))
           )}
        </div>
      </div>

      {/* ADD/EDIT FORM MODAL */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-200">
            <h3 className="text-xl font-bold text-slate-900 mb-6">
              {isEditing ? 'Editar Cuenta' : 'Nueva Cuenta'}
            </h3>
            <form onSubmit={handleSaveForm} className="space-y-4">
               <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Entidad (Cliente/Proveedor)</label>
                <input required type="text" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all" 
                  value={formData.entityName} onChange={e => setFormData({...formData, entityName: e.target.value})} placeholder="Ej. Tech Solutions S.A." />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Descripción</label>
                <input required type="text" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all" 
                  value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="Ej. Pago de servicios..." />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                   <label className="block text-sm font-medium text-slate-700 mb-1.5">Monto</label>
                   <div className="relative">
                     <span className="absolute left-3 top-3 text-slate-400">$</span>
                     <input required type="number" step="0.01" className="w-full pl-7 p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-semibold" 
                       value={formData.amount} onChange={e => setFormData({...formData, amount: Number(e.target.value)})} />
                   </div>
                </div>
                <div>
                   <label className="block text-sm font-medium text-slate-700 mb-1.5">Vencimiento</label>
                   <input required type="date" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all" 
                     value={formData.dueDate} onChange={e => setFormData({...formData, dueDate: e.target.value})} />
                </div>
              </div>
              <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Tipo de Operación</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button type="button" 
                      onClick={() => setFormData({...formData, type: 'PAYABLE'})}
                      className={`p-3 rounded-xl border flex items-center justify-center gap-2 transition-all ${
                        formData.type === 'PAYABLE' 
                        ? 'border-rose-500 bg-rose-50 text-rose-700 font-bold' 
                        : 'border-slate-200 text-slate-500 hover:bg-slate-50'
                      }`}
                    >
                      <ArrowUpRight size={18} /> Por Pagar
                    </button>
                    <button type="button" 
                      onClick={() => setFormData({...formData, type: 'RECEIVABLE'})}
                      className={`p-3 rounded-xl border flex items-center justify-center gap-2 transition-all ${
                        formData.type === 'RECEIVABLE' 
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-700 font-bold' 
                        : 'border-slate-200 text-slate-500 hover:bg-slate-50'
                      }`}
                    >
                      <ArrowDownLeft size={18} /> Por Cobrar
                    </button>
                  </div>
              </div>
              
              <div className="flex gap-3 mt-8 pt-4 border-t border-slate-100">
                <button type="button" onClick={() => setIsFormOpen(false)} className="flex-1 py-3 border border-slate-200 rounded-xl text-slate-700 font-medium hover:bg-slate-50 transition-colors">Cancelar</button>
                <button type="submit" className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-colors">Guardar Cuenta</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PROCESS PAYMENT/COLLECTION MODAL */}
      {selectedInvoice && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-200">
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              {selectedInvoice.type === 'RECEIVABLE' 
                ? <span className="text-emerald-600 flex items-center gap-2"><ArrowDownLeft /> Registrar Cobro</span> 
                : <span className="text-rose-600 flex items-center gap-2"><ArrowUpRight /> Registrar Pago</span>
              }
            </h3>
            
            <div className="bg-slate-50 p-5 rounded-xl mb-6 border border-slate-200">
              <div className="flex justify-between mb-2">
                <span className="text-sm text-slate-500">Entidad:</span>
                <span className="text-sm font-semibold text-slate-900">{selectedInvoice.entityName}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-500">Monto Total:</span>
                <span className="text-2xl font-bold text-slate-900">${selectedInvoice.amount.toLocaleString()}</span>
              </div>
            </div>

            <div className="mb-8">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Seleccionar Custodio {selectedInvoice.type === 'RECEIVABLE' ? 'receptor' : 'emisor'}
              </label>
              <select
                value={selectedCustodian}
                onChange={(e) => setSelectedCustodian(e.target.value)}
                className="w-full p-3.5 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none shadow-sm"
              >
                <option value="">Seleccione un custodio...</option>
                {custodians.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name} (Disp: ${c.balance.toLocaleString()})
                  </option>
                ))}
              </select>
              {selectedInvoice.type === 'PAYABLE' && selectedCustodian && (() => {
                 const cust = custodians.find(c => c.id === selectedCustodian);
                 if (cust && cust.balance < selectedInvoice.amount) {
                   return (
                     <div className="mt-2 text-rose-600 text-xs flex items-center gap-1 font-medium bg-rose-50 p-2 rounded-lg">
                       <AlertCircle size={14} /> Saldo insuficiente en este custodio.
                     </div>
                   )
                 }
                 return null;
              })()}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => { setSelectedInvoice(null); setSelectedCustodian(''); }}
                className="flex-1 py-3 border border-slate-200 rounded-xl text-slate-700 font-medium hover:bg-slate-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleProcess}
                disabled={!selectedCustodian || (selectedInvoice.type === 'PAYABLE' && (custodians.find(c => c.id === selectedCustodian)?.balance || 0) < selectedInvoice.amount)}
                className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-200 transition-colors"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};