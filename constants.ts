import { Custodian, Invoice, Transaction, User } from './types';

export const USERS: User[] = [
  { id: 'u1', name: 'Admin General', role: 'ADMIN', avatar: 'https://ui-avatars.com/api/?name=Admin&background=0D8ABC&color=fff', username: 'admin', password: '123' },
  { id: 'u2', name: 'Contador Principal', role: 'ACCOUNTANT', avatar: 'https://ui-avatars.com/api/?name=Contador&background=6366f1&color=fff', username: 'contador', password: '123' },
  { id: 'u3', name: 'Operador Caja', role: 'OPERATOR', avatar: 'https://ui-avatars.com/api/?name=Operador&background=10b981&color=fff', username: 'operador', password: '123' },
];

export const INITIAL_CUSTODIANS: Custodian[] = [
  { id: '1', name: 'Ana García', balance: 1500.00, avatar: 'https://picsum.photos/seed/ana/200/200' },
  { id: '2', name: 'Carlos López', balance: 320.50, avatar: 'https://picsum.photos/seed/carlos/200/200' },
  { id: '3', name: 'Caja Principal', balance: 5400.00, avatar: 'https://picsum.photos/seed/caja/200/200' },
];

export const INITIAL_INVOICES: Invoice[] = [
  { id: '101', entityName: 'Tech Solutions S.A.', description: 'Servicios de IT Mayo', amount: 1200, dueDate: '2023-11-15', type: 'PAYABLE', status: 'PENDING', validationStatus: 'VALIDATED' },
  { id: '102', entityName: 'Cliente Juan Pérez', description: 'Venta de Hardware', amount: 450, dueDate: '2023-11-10', type: 'RECEIVABLE', status: 'PENDING', validationStatus: 'DRAFT' },
  { id: '103', entityName: 'Oficina Central', description: 'Alquiler Noviembre', amount: 800, dueDate: '2023-11-01', type: 'PAYABLE', status: 'PENDING', validationStatus: 'VALIDATED' },
  { id: '104', entityName: 'Distribuidora Norte', description: 'Compra de Insumos', amount: 2300, dueDate: '2023-11-20', type: 'PAYABLE', status: 'PENDING', validationStatus: 'DRAFT' },
  { id: '105', entityName: 'Consultora Global', description: 'Asesoría Mensual', amount: 3000, dueDate: '2023-11-05', type: 'RECEIVABLE', status: 'PENDING', validationStatus: 'VALIDATED' },
];

export const INITIAL_TRANSACTIONS: Transaction[] = [
  { id: 't1', date: '2023-10-25', amount: 500, type: 'INCOME', custodianId: '1', description: 'Abono Cliente A', status: 'VALIDATED' },
  { id: 't2', date: '2023-10-26', amount: 120, type: 'EXPENSE', custodianId: '2', description: 'Compra papelería', status: 'PENDING' },
  { id: 't3', date: '2023-10-27', amount: 1000, type: 'INCOME', custodianId: '3', description: 'Venta contado', status: 'VALIDATED' },
  { id: 't4', date: '2023-10-28', amount: 200, type: 'EXPENSE', custodianId: '1', description: 'Taxi corporativo', status: 'REJECTED' },
];