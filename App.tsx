
import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Banknote, 
  Menu, 
  X,
  LogOut,
  History,
  ShieldAlert,
  Loader2
} from 'lucide-react';

import { Dashboard } from './components/Dashboard';
import { Custodians } from './components/Custodians';
import { Accounts } from './components/Accounts';
import { Login } from './components/Login';
import { TransactionsView } from './components/TransactionsView';
import { UserManagement } from './components/UserManagement';
import { DatabaseConfig } from './components/DatabaseConfig';

import { dbService } from './services/db';
import { Custodian, Invoice, Transaction, User, Role, DBConfig } from './types';

function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeView, setActiveView] = useState<'DASHBOARD' | 'CUSTODIANS' | 'ACCOUNTS' | 'TRANSACTIONS' | 'USERS'>('DASHBOARD');
  
  // App Loading & DB State
  const [isLoading, setIsLoading] = useState(true);
  const [isDbConnected, setIsDbConnected] = useState(false);

  // App Data State
  const [appUsers, setAppUsers] = useState<User[]>([]);
  const [custodians, setCustodians] = useState<Custodian[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  // 1. Initial Load Effect
  useEffect(() => {
    const initApp = async () => {
      setIsLoading(true);
      try {
        if (!dbService.hasConfig()) {
          setIsDbConnected(false);
          setIsLoading(false);
          return;
        }

        const connected = await dbService.connect();
        if (connected) {
          const data = await dbService.getData();
          setAppUsers(data.users);
          setCustodians(data.custodians);
          setInvoices(data.invoices);
          setTransactions(data.transactions);
          setIsDbConnected(true);
        }
      } catch (error) {
        console.error("Connection failed:", error);
        setIsDbConnected(false);
      } finally {
        setIsLoading(false);
      }
    };

    initApp();
  }, []);

  // Handle SQL Configuration Save
  const handleDbConfigSaved = async (config: DBConfig) => {
    dbService.saveConfig(config);
    await dbService.initializeDatabase(config);
    
    // Refresh Data
    const data = await dbService.getData();
    setAppUsers(data.users);
    setCustodians(data.custodians);
    setInvoices(data.invoices);
    setTransactions(data.transactions);
    
    setIsDbConnected(true);
  };

  // Set default view based on role on login
  const handleLogin = (user: User) => {
    setCurrentUser(user);
    if (user.role === 'OPERATOR') {
      setActiveView('TRANSACTIONS');
    } else {
      setActiveView('DASHBOARD');
    }
  };

  // --- Invoice Logic ---

  const handleAddInvoice = async (newInv: Omit<Invoice, 'id'>) => {
    const inv: Invoice = { ...newInv, id: Date.now().toString() };
    await dbService.saveInvoice(inv);
    setInvoices([inv, ...invoices]);
  };

  const handleUpdateInvoice = (updatedInv: Invoice) => {
    setInvoices(invoices.map(i => i.id === updatedInv.id ? updatedInv : i));
  };

  const handleDeleteInvoice = (id: string) => {
    setInvoices(invoices.filter(i => i.id !== id));
  };

  const processInvoice = async (invoiceId: string, custodianId: string) => {
    const invoice = invoices.find(i => i.id === invoiceId);
    const custodian = custodians.find(c => c.id === custodianId);

    if (!invoice || !custodian) return;

    // 1. Update Invoice Status
    const updatedInvoices = invoices.map(inv => 
      inv.id === invoiceId ? { ...inv, status: 'PAID' as const } : inv
    );
    setInvoices(updatedInvoices);

    // 2. Update Custodian Balance
    const amountChange = invoice.type === 'RECEIVABLE' ? invoice.amount : -invoice.amount;
    const newBalance = custodian.balance + amountChange;
    const updatedCustodians = custodians.map(c => 
      c.id === custodianId ? { ...c, balance: newBalance } : c
    );
    setCustodians(updatedCustodians);
    await dbService.updateCustodianBalance(custodianId, newBalance);

    // 3. Create Transaction Record
    const newTransaction: Transaction = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      amount: invoice.amount,
      type: invoice.type === 'RECEIVABLE' ? 'INCOME' : 'EXPENSE',
      custodianId: custodianId,
      description: `${invoice.type === 'RECEIVABLE' ? 'Cobro' : 'Pago'} Factura: ${invoice.entityName}`,
      relatedInvoiceId: invoiceId,
      status: 'VALIDATED'
    };
    await dbService.saveTransaction(newTransaction);
    setTransactions([newTransaction, ...transactions]);
  };

  // --- Transaction Logic ---

  const handleAddTransaction = async (tx: Omit<Transaction, 'id'>) => {
    const newTx = { ...tx, id: Date.now().toString() };
    await dbService.saveTransaction(newTx);
    setTransactions([newTx, ...transactions]);
  };

  const handleValidateTransaction = async (id: string, status: 'VALIDATED' | 'REJECTED') => {
    const tx = transactions.find(t => t.id === id);
    if (!tx) return;

    // If it's being validated now, apply effect to balance
    if (status === 'VALIDATED' && tx.status !== 'VALIDATED') {
       const amountChange = tx.type === 'INCOME' ? tx.amount : -tx.amount;
       const custodian = custodians.find(c => c.id === tx.custodianId);
       if (custodian) {
          const newBalance = custodian.balance + amountChange;
          setCustodians(custodians.map(c => 
             c.id === tx.custodianId ? { ...c, balance: newBalance } : c
          ));
          await dbService.updateCustodianBalance(tx.custodianId, newBalance);
       }
    }

    setTransactions(transactions.map(t => t.id === id ? { ...t, status } : t));
  };

  const handleDeleteTransaction = (id: string) => {
    setTransactions(transactions.filter(t => t.id !== id));
  };

  const handleTransfer = async (fromId: string, toId: string, amount: number) => {
    const fromCustodian = custodians.find(c => c.id === fromId);
    const toCustodian = custodians.find(c => c.id === toId);
    if (!fromCustodian || !toCustodian) return;

    const date = new Date().toISOString();
    const timestamp = Date.now();

    const expenseTx: Transaction = {
      id: `tx-${timestamp}-1`,
      date,
      amount,
      type: 'EXPENSE',
      custodianId: fromId,
      description: `Transferencia enviada a ${toCustodian.name}`,
      status: 'PENDING'
    };

    const incomeTx: Transaction = {
      id: `tx-${timestamp}-2`,
      date,
      amount,
      type: 'INCOME',
      custodianId: toId,
      description: `Transferencia recibida de ${fromCustodian.name}`,
      status: 'PENDING'
    };

    await dbService.saveTransaction(expenseTx);
    await dbService.saveTransaction(incomeTx);
    setTransactions([incomeTx, expenseTx, ...transactions]);
  };

  // --- Custodian Management Logic ---

  const handleAddCustodian = (newCustodian: Omit<Custodian, 'id'>) => {
    const custodian: Custodian = {
      ...newCustodian,
      id: Date.now().toString(),
      balance: 0 // Always start with 0
    };
    setCustodians([...custodians, custodian]);
  };

  const handleDeleteCustodian = (id: string) => {
    setCustodians(custodians.filter(c => c.id !== id));
  };

  // --- User Management Logic ---

  const handleAddUser = (user: User) => {
    setAppUsers([...appUsers, user]);
  };

  const handleDeleteUser = (id: string) => {
    setAppUsers(appUsers.filter(u => u.id !== id));
  };

  // RENDER STATES

  if (isLoading) {
    return (
      <div className="h-screen w-full bg-slate-50 flex flex-col items-center justify-center text-slate-400">
        <Loader2 className="animate-spin mb-4" size={48} />
        <p>Conectando a base de datos...</p>
      </div>
    );
  }

  if (!isDbConnected) {
    return <DatabaseConfig onConfigSaved={handleDbConfigSaved} />;
  }

  if (!currentUser) {
    return <Login users={appUsers} onLogin={handleLogin} />;
  }

  // --- Menu Config ---

  const navItems = [
    ...(currentUser.role !== 'OPERATOR' ? [{ id: 'DASHBOARD', label: 'Tablero Principal', icon: LayoutDashboard }] : []),
    { id: 'TRANSACTIONS', label: 'Transacciones', icon: History },
    { id: 'ACCOUNTS', label: 'Cuentas C/P', icon: Banknote },
    { id: 'CUSTODIANS', label: 'Custodios', icon: Users },
    ...(currentUser.role === 'ADMIN' ? [{ id: 'USERS', label: 'Usuarios', icon: ShieldAlert }] : []),
  ];

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Sidebar Mobile Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-30 w-64 bg-slate-900 text-white transform transition-transform duration-200 ease-in-out lg:relative lg:translate-x-0
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col h-full">
          <div className="p-6 border-b border-slate-800 flex justify-between items-center">
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
                CashGuard
              </h1>
              <p className="text-xs text-slate-400">Rol: {currentUser.name}</p>
            </div>
            <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-slate-400">
              <X size={20} />
            </button>
          </div>

          <nav className="flex-1 p-4 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveView(item.id as any);
                    setIsSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                    activeView === item.id
                      ? 'bg-indigo-600 text-white'
                      : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <Icon size={20} />
                  {item.label}
                </button>
              );
            })}
          </nav>

          <div className="p-4 border-t border-slate-800">
            <button 
              onClick={() => setCurrentUser(null)}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
            >
              <LogOut size={20} />
              Cerrar Sesión
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 z-10">
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="lg:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-md"
          >
            <Menu size={24} />
          </button>
          <div className="text-sm text-slate-500">
            {new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
          <div className="flex items-center gap-3">
             <div className="flex flex-col items-end mr-2">
                <span className="text-sm font-medium text-slate-700 hidden sm:block">{currentUser.name}</span>
                <span className="text-xs text-indigo-600 font-semibold">{currentUser.role}</span>
             </div>
             <img src={currentUser.avatar} alt="Profile" className="w-9 h-9 rounded-full border border-slate-200" />
          </div>
        </header>

        {/* View Content */}
        <div className="flex-1 overflow-auto p-6">
          <div className="max-w-7xl mx-auto">
            {activeView === 'DASHBOARD' && currentUser.role !== 'OPERATOR' && (
              <Dashboard 
                custodians={custodians} 
                invoices={invoices} 
                transactions={transactions.filter(t => t.status === 'VALIDATED')}
              />
            )}
            {activeView === 'TRANSACTIONS' && (
              <TransactionsView 
                transactions={transactions} 
                custodians={custodians}
                currentUser={currentUser}
                onValidate={handleValidateTransaction}
                onDelete={handleDeleteTransaction}
                onAddTransaction={handleAddTransaction}
              />
            )}
            {activeView === 'CUSTODIANS' && (
              <Custodians 
                custodians={custodians} 
                transactions={transactions}
                onTransfer={handleTransfer}
                onAddCustodian={handleAddCustodian}
                onDeleteCustodian={handleDeleteCustodian}
              />
            )}
            {activeView === 'ACCOUNTS' && (
              <Accounts 
                invoices={invoices} 
                custodians={custodians}
                currentUser={currentUser}
                onProcessInvoice={processInvoice}
                onAddInvoice={handleAddInvoice}
                onUpdateInvoice={handleUpdateInvoice}
                onDeleteInvoice={handleDeleteInvoice}
              />
            )}
             {activeView === 'USERS' && currentUser.role === 'ADMIN' && (
              <UserManagement 
                users={appUsers}
                onAddUser={handleAddUser}
                onDeleteUser={handleDeleteUser}
              />
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
