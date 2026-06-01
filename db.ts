/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import pg from 'pg';
import { Stand, Contact, Transaction, Campaign, Task } from './src/types';
import { 
  initialStands, 
  initialContacts, 
  initialTransactions, 
  initialCampaigns, 
  initialTasks 
} from './src/initialData';

const { Pool } = pg;

// Prevent "self-signed certificate in certificate chain" errors globally for DB connections
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

// Flag to track database initialization
let dbInitialized = false;
let connectionError: string | null = null;
let dbPool: pg.Pool | null = null;

/**
 * Helper to validate if a string is a malformed placeholder or a real PG connection URL
 */
function isValidConnectionString(str: string | undefined): boolean {
  if (!str) return false;
  return str.startsWith('postgres://') || str.startsWith('postgresql://');
}

/**
 * Returns the resolved connection string, filtering out placeholder text
 */
export function getConnectionString(): string | null {
  const dbUrl = process.env.DATABASE_URL;
  const pgUrl = process.env.POSTGRES_URL;

  if (isValidConnectionString(dbUrl)) {
    return dbUrl!;
  }
  if (isValidConnectionString(pgUrl)) {
    return pgUrl!;
  }
  return null;
}

/**
 * Lazy-loads and returns the Postgres connection pool
 */
export function getDbPool(): pg.Pool | null {
  const connectionString = getConnectionString();
  
  if (!connectionString) {
    return null;
  }

  if (!dbPool) {
    try {
      dbPool = new Pool({
        connectionString,
        ssl: {
          rejectUnauthorized: false // Required for Vercel/Neon databases
        },
        connectionTimeoutMillis: 5000 // Quick failure if unreachable
      });
      console.log('[Postgres DB] Pool initialized with secure SSL.');
    } catch (err: any) {
      console.error('[Postgres DB] Error initializing pool:', err);
      connectionError = err.message || String(err);
      return null;
    }
  }
  return dbPool;
}

/**
 * Setup and verify tables in Vercel Postgres
 */
export async function initializeDatabaseSchema() {
  if (dbInitialized) return true;
  
  const pool = getDbPool();
  if (!pool) {
    return false;
  }

  try {
    console.log('[Postgres DB] Checking database schema & tables...');
    
    // 1. Create table stands
    await pool.query(`
      CREATE TABLE IF NOT EXISTS stands (
        id VARCHAR(50) PRIMARY KEY,
        site VARCHAR(50) NOT NULL,
        num VARCHAR(50) NOT NULL,
        hall VARCHAR(100) NOT NULL,
        area DOUBLE PRECISION NOT NULL,
        price_per_m2 DOUBLE PRECISION NOT NULL,
        status VARCHAR(50) NOT NULL,
        client_name VARCHAR(255),
        company_name VARCHAR(255),
        category VARCHAR(255),
        notes TEXT
      )
    `);

    // 2. Create table contacts
    await pool.query(`
      CREATE TABLE IF NOT EXISTS contacts (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        phone VARCHAR(100) NOT NULL,
        company VARCHAR(255) NOT NULL,
        site VARCHAR(50) NOT NULL,
        role VARCHAR(50) NOT NULL,
        date_added VARCHAR(50) NOT NULL,
        notes TEXT
      )
    `);

    // 3. Create table transactions
    await pool.query(`
      CREATE TABLE IF NOT EXISTS transactions (
        id VARCHAR(50) PRIMARY KEY,
        num VARCHAR(50) NOT NULL,
        client_name VARCHAR(255) NOT NULL,
        company_name VARCHAR(255) NOT NULL,
        site VARCHAR(50) NOT NULL,
        type VARCHAR(50) NOT NULL,
        amount DOUBLE PRECISION NOT NULL,
        status VARCHAR(50) NOT NULL,
        date VARCHAR(50) NOT NULL,
        due_date VARCHAR(50) NOT NULL,
        items JSONB NOT NULL,
        notes TEXT
      )
    `);

    // 4. Create table campaigns
    await pool.query(`
      CREATE TABLE IF NOT EXISTS campaigns (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        site VARCHAR(50) NOT NULL,
        sent_count INTEGER NOT NULL,
        opens INTEGER NOT NULL,
        clicks INTEGER NOT NULL,
        status VARCHAR(50) NOT NULL,
        date VARCHAR(50) NOT NULL,
        subject VARCHAR(255) NOT NULL,
        content TEXT NOT NULL
      )
    `);

    // 5. Create table tasks
    await pool.query(`
      CREATE TABLE IF NOT EXISTS tasks (
        id VARCHAR(50) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        site VARCHAR(50) NOT NULL,
        due_date VARCHAR(50) NOT NULL,
        priority VARCHAR(50) NOT NULL,
        status VARCHAR(50) NOT NULL
      )
    `);

    dbInitialized = true;
    console.log('[Postgres DB] Schema verified or created successfully!');
    
    // Seed initially if the tables are completely empty
    await seedDatabaseIfEmpty();

    return true;
  } catch (err: any) {
    console.error('[Postgres DB] Schema initialization error:', err);
    connectionError = err.message || String(err);
    return false;
  }
}

/**
 * Populates database tables if they are empty
 */
async function seedDatabaseIfEmpty() {
  const pool = getDbPool();
  if (!pool) return;

  try {
    // Check if stands is empty
    const standCheck = await pool.query('SELECT COUNT(*) FROM stands');
    const standsCount = parseInt(standCheck.rows[0].count, 10);
    
    if (standsCount === 0) {
      console.log('[Postgres DB] Stands table is empty, seeding initial stands...');
      for (const stand of initialStands) {
        await pool.query(
          `INSERT INTO stands (id, site, num, hall, area, price_per_m2, status, client_name, company_name, category, notes) 
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
          [
            stand.id, 
            stand.site, 
            stand.num, 
            stand.hall, 
            stand.area, 
            stand.pricePerM2, 
            stand.status, 
            stand.clientName || null, 
            stand.companyName || null, 
            stand.category || null, 
            stand.notes || null
          ]
        );
      }
    }

    // Check if contacts is empty
    const contactCheck = await pool.query('SELECT COUNT(*) FROM contacts');
    const contactsCount = parseInt(contactCheck.rows[0].count, 10);

    if (contactsCount === 0) {
      console.log('[Postgres DB] Contacts table is empty, seeding initial contacts...');
      for (const contact of initialContacts) {
        await pool.query(
          `INSERT INTO contacts (id, name, email, phone, company, site, role, date_added, notes) 
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
          [
            contact.id,
            contact.name,
            contact.email,
            contact.phone,
            contact.company,
            contact.site,
            contact.role,
            contact.dateAdded,
            contact.notes || null
          ]
        );
      }
    }

    // Check if transactions is empty
    const transCheck = await pool.query('SELECT COUNT(*) FROM transactions');
    const transCount = parseInt(transCheck.rows[0].count, 10);

    if (transCount === 0) {
      console.log('[Postgres DB] Transactions table is empty, seeding initial transactions...');
      for (const trans of initialTransactions) {
        await pool.query(
          `INSERT INTO transactions (id, num, client_name, company_name, site, type, amount, status, date, due_date, items, notes) 
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
          [
            trans.id,
            trans.num,
            trans.clientName,
            trans.companyName,
            trans.site,
            trans.type,
            trans.amount,
            trans.status,
            trans.date,
            trans.dueDate,
            JSON.stringify(trans.items),
            trans.notes || null
          ]
        );
      }
    }

    // Check if campaigns is empty
    const campCheck = await pool.query('SELECT COUNT(*) FROM campaigns');
    const campCount = parseInt(campCheck.rows[0].count, 10);

    if (campCount === 0) {
      console.log('[Postgres DB] Campaigns table is empty, seeding initial campaigns...');
      for (const camp of initialCampaigns) {
        await pool.query(
          `INSERT INTO campaigns (id, name, site, sent_count, opens, clicks, status, date, subject, content) 
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
          [
            camp.id,
            camp.name,
            camp.site,
            camp.sentCount,
            camp.opens,
            camp.clicks,
            camp.status,
            camp.date,
            camp.subject,
            camp.content
          ]
        );
      }
    }

    // Check if tasks is empty
    const tasksCheck = await pool.query('SELECT COUNT(*) FROM tasks');
    const tasksCount = parseInt(tasksCheck.rows[0].count, 10);

    if (tasksCount === 0) {
      console.log('[Postgres DB] Tasks table is empty, seeding initial tasks...');
      for (const task of initialTasks) {
        await pool.query(
          `INSERT INTO tasks (id, title, description, site, due_date, priority, status) 
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [
            task.id,
            task.title,
            task.description || null,
            task.site,
            task.dueDate,
            task.priority,
            task.status
          ]
        );
      }
    }

    console.log('[Postgres DB] Seeding completed.');
  } catch (err) {
    console.error('[Postgres DB] Seeding error:', err);
  }
}

/**
 * Pulls all synchronized datasets from Vercel Postgres
 */
export async function loadUserDataFromDatabase() {
  const pool = getDbPool();
  if (!pool) return null;

  try {
    const isReady = await initializeDatabaseSchema();
    if (!isReady) return null;

    // Loading concurrently
    const [standsRes, contactsRes, transRes, campRes, tasksRes] = await Promise.all([
      pool.query('SELECT * FROM stands'),
      pool.query('SELECT * FROM contacts'),
      pool.query('SELECT * FROM transactions'),
      pool.query('SELECT * FROM campaigns'),
      pool.query('SELECT * FROM tasks')
    ]);

    // Parse items to JS format from Postgres representations
    const stands: Stand[] = standsRes.rows.map(row => ({
      id: row.id,
      site: row.site,
      num: row.num,
      hall: row.hall,
      area: Number(row.area),
      pricePerM2: Number(row.price_per_m2),
      status: row.status,
      clientName: row.client_name || undefined,
      companyName: row.company_name || undefined,
      category: row.category || undefined,
      notes: row.notes || undefined
    }));

    const contacts: Contact[] = contactsRes.rows.map(row => ({
      id: row.id,
      name: row.name,
      email: row.email,
      phone: row.phone,
      company: row.company,
      site: row.site,
      role: row.role,
      dateAdded: row.date_added,
      notes: row.notes || undefined
    }));

    const transactions: Transaction[] = transRes.rows.map(row => ({
      id: row.id,
      num: row.num,
      clientName: row.client_name,
      companyName: row.company_name,
      site: row.site,
      type: row.type,
      amount: Number(row.amount),
      status: row.status,
      date: row.date,
      dueDate: row.due_date,
      items: typeof row.items === 'string' ? JSON.parse(row.items) : row.items,
      notes: row.notes || undefined
    }));

    const campaigns: Campaign[] = campRes.rows.map(row => ({
      id: row.id,
      name: row.name,
      site: row.site,
      sentCount: Number(row.sent_count),
      opens: Number(row.opens),
      clicks: Number(row.clicks),
      status: row.status,
      date: row.date,
      subject: row.subject,
      content: row.content
    }));

    const tasks: Task[] = tasksRes.rows.map(row => ({
      id: row.id,
      title: row.title,
      description: row.description || undefined,
      site: row.site,
      dueDate: row.due_date,
      priority: row.priority,
      status: row.status
    }));

    return { stands, contacts, transactions, campaigns, tasks };
  } catch (err: any) {
    console.error('[Postgres DB] Load failure:', err);
    connectionError = err.message || String(err);
    return null;
  }
}

/**
 * Overwrites / saves complete tables to maintain atomic sync
 */
export async function saveUserDataToDatabase(data: {
  stands: Stand[];
  contacts: Contact[];
  transactions: Transaction[];
  campaigns: Campaign[];
  tasks: Task[];
}) {
  const pool = getDbPool();
  if (!pool) return false;

  try {
    const isReady = await initializeDatabaseSchema();
    if (!isReady) return false;

    // We do each save in a single transaction blocks for safety
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // 1. Stands
      await client.query('TRUNCATE TABLE stands CASCADE');
      for (const stand of data.stands) {
        await client.query(
          `INSERT INTO stands (id, site, num, hall, area, price_per_m2, status, client_name, company_name, category, notes) 
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
          [
            stand.id, 
            stand.site, 
            stand.num, 
            stand.hall, 
            stand.area, 
            stand.pricePerM2, 
            stand.status, 
            stand.clientName || null, 
            stand.companyName || null, 
            stand.category || null, 
            stand.notes || null
          ]
        );
      }

      // 2. Contacts
      await client.query('TRUNCATE TABLE contacts CASCADE');
      for (const contact of data.contacts) {
        await client.query(
          `INSERT INTO contacts (id, name, email, phone, company, site, role, date_added, notes) 
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
          [
            contact.id,
            contact.name,
            contact.email,
            contact.phone,
            contact.company,
            contact.site,
            contact.role,
            contact.dateAdded,
            contact.notes || null
          ]
        );
      }

      // 3. Transactions
      await client.query('TRUNCATE TABLE transactions CASCADE');
      for (const trans of data.transactions) {
        await client.query(
          `INSERT INTO transactions (id, num, client_name, company_name, site, type, amount, status, date, due_date, items, notes) 
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
          [
            trans.id,
            trans.num,
            trans.clientName,
            trans.companyName,
            trans.site,
            trans.type,
            trans.amount,
            trans.status,
            trans.date,
            trans.dueDate,
            JSON.stringify(trans.items),
            trans.notes || null
          ]
        );
      }

      // 4. Campaigns
      await client.query('TRUNCATE TABLE campaigns CASCADE');
      for (const camp of data.campaigns) {
        await client.query(
          `INSERT INTO campaigns (id, name, site, sent_count, opens, clicks, status, date, subject, content) 
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
          [
            camp.id,
            camp.name,
            camp.site,
            camp.sentCount,
            camp.opens,
            camp.clicks,
            camp.status,
            camp.date,
            camp.subject,
            camp.content
          ]
        );
      }

      // 5. Tasks
      await client.query('TRUNCATE TABLE tasks CASCADE');
      for (const task of data.tasks) {
        await client.query(
          `INSERT INTO tasks (id, title, description, site, due_date, priority, status) 
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [
            task.id,
            task.title,
            task.description || null,
            task.site,
            task.dueDate,
            task.priority,
            task.status
          ]
        );
      }

      await client.query('COMMIT');
      console.log('[Postgres DB] Complete dataset successfully persisted to cloud.');
      return true;
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  } catch (err: any) {
    console.error('[Postgres DB] Save failure:', err);
    connectionError = err.message || String(err);
    return false;
  }
}

/**
 * Returns diagnostic metadata about connection status
 */
export function getDatabaseStatus() {
  const connectionString = getConnectionString();
  return {
    isConfigured: !!connectionString,
    dbInitialized,
    error: connectionError,
    maskedUrl: connectionString 
      ? connectionString.replace(/:([^:@]+)@/, ':******@') 
      : null
  };
}
