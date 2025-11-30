
import { DBConfig, User, Custodian, Invoice, Transaction } from '../types';
import { INITIAL_CUSTODIANS, INITIAL_INVOICES, INITIAL_TRANSACTIONS, USERS } from '../constants';

// SQL Server T-SQL Creation Scripts
const CREATE_TABLES_SQL = `
IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = '@DB_NAME')
BEGIN
    CREATE DATABASE [@DB_NAME];
END;

USE [@DB_NAME];

IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Users' and xtype='U')
CREATE TABLE Users (
    Id NVARCHAR(50) PRIMARY KEY,
    Name NVARCHAR(100),
    Role NVARCHAR(20),
    Username NVARCHAR(50),
    Password NVARCHAR(50),
    Avatar NVARCHAR(255)
);

IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Custodians' and xtype='U')
CREATE TABLE Custodians (
    Id NVARCHAR(50) PRIMARY KEY,
    Name NVARCHAR(100),
    Balance DECIMAL(18, 2),
    Avatar NVARCHAR(255)
);

IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Invoices' and xtype='U')
CREATE TABLE Invoices (
    Id NVARCHAR(50) PRIMARY KEY,
    EntityName NVARCHAR(100),
    Description NVARCHAR(255),
    Amount DECIMAL(18, 2),
    DueDate DATE,
    Type NVARCHAR(20),
    Status NVARCHAR(20),
    ValidationStatus NVARCHAR(20)
);

IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Transactions' and xtype='U')
CREATE TABLE Transactions (
    Id NVARCHAR(50) PRIMARY KEY,
    Date DATETIME,
    Amount DECIMAL(18, 2),
    Type NVARCHAR(20),
    CustodianId NVARCHAR(50) FOREIGN KEY REFERENCES Custodians(Id),
    Description NVARCHAR(255),
    Status NVARCHAR(20),
    RelatedInvoiceId NVARCHAR(50) NULL
);
`;

const LOCAL_STORAGE_KEY = 'sql_server_config';

export const dbService = {
  // Check if configuration exists
  hasConfig: (): boolean => {
    return !!localStorage.getItem(LOCAL_STORAGE_KEY);
  },

  // Save configuration
  saveConfig: (config: DBConfig) => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(config));
  },

  // Simulate Connection Test
  connect: async (config?: DBConfig): Promise<boolean> => {
    const cfg = config || JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || '{}');
    
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Validate connection string components
        // Either Integrated Security is ON, OR we have User/Pass
        const hasAuth = cfg.integratedSecurity || (cfg.user && cfg.password);
        
        if (cfg.server && cfg.database && hasAuth) {
          // In a real app, this would perform a fetch('/api/check-db')
          // Connection String Simulation:
          // const connStr = cfg.integratedSecurity 
          //    ? `Server=${cfg.server};Database=${cfg.database};Trusted_Connection=True;`
          //    : `Server=${cfg.server};Database=${cfg.database};User Id=${cfg.user};Password=${cfg.password};`;
          resolve(true); 
        } else {
          reject(new Error("Configuración inválida o credenciales faltantes"));
        }
      }, 1500);
    });
  },

  // Simulate Database Initialization (Create Tables + Seed Data)
  initializeDatabase: async (config: DBConfig): Promise<void> => {
    console.log("--- INICIANDO SCRIPT SQL SERVER ---");
    const script = CREATE_TABLES_SQL.replace(/@DB_NAME/g, config.database);
    console.log(script);
    console.log("--- TABLAS CREADAS CORRECTAMENTE ---");
    
    // Simulate seeding data
    console.log(`Insertando ${USERS.length} Usuarios iniciales...`);
    console.log(`Insertando ${INITIAL_CUSTODIANS.length} Custodios iniciales...`);
    
    return new Promise(resolve => setTimeout(resolve, 2000));
  },

  // Get Data (Simulated Fetch from DB)
  getData: async () => {
    // In a real scenario, these would be SELECT * queries
    return new Promise<{users: User[], custodians: Custodian[], invoices: Invoice[], transactions: Transaction[]}>((resolve) => {
      // Return "Mock" data as if it came from DB
      resolve({
        users: USERS,
        custodians: INITIAL_CUSTODIANS,
        invoices: INITIAL_INVOICES,
        transactions: INITIAL_TRANSACTIONS
      });
    });
  },

  // Save Data methods (Simulated INSERT/UPDATE)
  saveTransaction: async (tx: Transaction) => {
    console.log(`[SQL EXEC] INSERT INTO Transactions VALUES ('${tx.id}', '${tx.date}', ${tx.amount}, ...)`);
    return true;
  },
  
  saveInvoice: async (inv: Invoice) => {
     console.log(`[SQL EXEC] INSERT INTO Invoices VALUES ('${inv.id}', '${inv.entityName}', ...)`);
     return true;
  },

  updateCustodianBalance: async (id: string, newBalance: number) => {
    console.log(`[SQL EXEC] UPDATE Custodians SET Balance = ${newBalance} WHERE Id = '${id}'`);
    return true;
  }
};
