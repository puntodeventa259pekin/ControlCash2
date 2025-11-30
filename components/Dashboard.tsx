import React, { useState } from 'react';
import { Custodian, Invoice, Transaction } from '../types';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, Wallet, Sparkles, Loader2 } from 'lucide-react';
import { analyzeFinancialStatus } from '../services/geminiService';

interface DashboardProps {
  custodians: Custodian[];
  invoices: Invoice[];
  transactions: Transaction[];
}

export const Dashboard: React.FC<DashboardProps> = ({ custodians, invoices, transactions }) => {
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);

  const totalCash = custodians.reduce((acc, c) => acc + c.balance, 0);
  
  // Only count VALIDATED invoices for the dashboard KPI
  const totalReceivables = invoices
    .filter(i => i.type === 'RECEIVABLE' && i.status === 'PENDING' && i.validationStatus === 'VALIDATED')
    .reduce((acc, i) => acc + i.amount, 0);
    
  const totalPayables = invoices
    .filter(i => i.type === 'PAYABLE' && i.status === 'PENDING' && i.validationStatus === 'VALIDATED')
    .reduce((acc, i) => acc + i.amount, 0);

  const chartData = transactions.map(t => ({
    name: new Date(t.date).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' }),
    amount: t.type === 'INCOME' ? t.amount : -t.amount,
    type: t.type
  }));

  const handleAnalyze = async () => {
    setLoadingAnalysis(true);
    // Filter invoices passed to AI as well
    const validatedInvoices = invoices.filter(i => i.validationStatus === 'VALIDATED');
    const result = await analyzeFinancialStatus(custodians, validatedInvoices);
    setAnalysis(result);
    setLoadingAnalysis(false);
  };

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-slate-500">Efectivo Total</p>
              <h3 className="text-3xl font-bold text-slate-800 mt-2">${totalCash.toLocaleString()}</h3>
            </div>
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
              <Wallet size={24} />
            </div>
          </div>
          <p className="text-xs text-slate-400 mt-2">Distribuido en {custodians.length} custodios</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-slate-500">Por Cobrar (Validado)</p>
              <h3 className="text-3xl font-bold text-emerald-600 mt-2">${totalReceivables.toLocaleString()}</h3>
            </div>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
              <TrendingUp size={24} />
            </div>
          </div>
          <p className="text-xs text-slate-400 mt-2">Pendiente de ingreso</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-slate-500">Por Pagar (Validado)</p>
              <h3 className="text-3xl font-bold text-rose-600 mt-2">${totalPayables.toLocaleString()}</h3>
            </div>
            <div className="p-2 bg-rose-50 text-rose-600 rounded-lg">
              <TrendingDown size={24} />
            </div>
          </div>
          <p className="text-xs text-slate-400 mt-2">Compromisos pendientes</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart Section */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Flujo de Caja Reciente</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <Tooltip 
                  contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                  formatter={(value: number) => [`$${Math.abs(value)}`, value > 0 ? 'Ingreso' : 'Egreso']}
                />
                <Area type="monotone" dataKey="amount" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#colorAmount)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* AI Advisor Section */}
        <div className="bg-gradient-to-br from-indigo-900 to-slate-900 text-white p-6 rounded-xl shadow-md flex flex-col">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="text-yellow-400" />
            <h3 className="text-lg font-bold">Asistente Inteligente</h3>
          </div>
          
          <div className="flex-1 bg-white/10 rounded-lg p-4 mb-4 overflow-y-auto text-sm leading-relaxed min-h-[150px]">
            {loadingAnalysis ? (
              <div className="flex flex-col items-center justify-center h-full text-indigo-200">
                <Loader2 className="animate-spin mb-2" size={24} />
                <p>Analizando finanzas...</p>
              </div>
            ) : analysis ? (
              <div className="whitespace-pre-wrap">{analysis}</div>
            ) : (
              <p className="text-indigo-200">
                Haz clic en analizar para obtener recomendaciones estratégicas sobre tu flujo de efectivo y cuentas pendientes.
              </p>
            )}
          </div>

          <button 
            onClick={handleAnalyze}
            disabled={loadingAnalysis}
            className="w-full bg-indigo-500 hover:bg-indigo-400 text-white font-semibold py-2 rounded-lg transition-colors disabled:opacity-50"
          >
            {loadingAnalysis ? 'Procesando...' : 'Analizar Estado Financiero'}
          </button>
        </div>
      </div>
    </div>
  );
};