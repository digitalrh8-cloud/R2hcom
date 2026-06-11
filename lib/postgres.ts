/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { Stand, Contact, Transaction, Campaign, Task } from '../src/types';
import { 
  initialStands, 
  initialContacts, 
  initialTransactions, 
  initialCampaigns, 
  initialTasks 
} from '../src/initialData';

const { Pool } = pg;

// Helper to log diagnostics directly to a file
function logToFile(msg: string) {
  try {
    const filePath = path.join(process.cwd(), 'lib', 'postgres_debug.log');
    fs.appendFileSync(filePath, `[${new Date().toISOString()}] ${msg}\n`);
  } catch (err) {
    console.error('Error logging to file:', err);
  }
}

// Helper to sanitize environment variables by stripping leading/trailing quotes
function cleanEnv(val: string | undefined): string {
  if (!val) return '';
  return val.trim().replace(/^['"]|['"]$/g, '');
}

// Helper to resolve nested Railway placeholders like ${{VAR}} or ${VAR} in values recursively
function resolveEnvValue(key: string): string {
  const rawValue = process.env[key];
  if (!rawValue) return '';
  
  let resolved = rawValue.trim();
  const regex = /\$\{\{?([A-Za-z0-9_]+)\}?\}/g;
  
  let attempts = 0;
  while (regex.test(resolved) && attempts < 10) {
    regex.lastIndex = 0; // Reset regex state
    resolved = resolved.replace(regex, (_, varName) => {
      const matchVal = process.env[varName];
      return matchVal !== undefined ? matchVal : '';
    });
    attempts++;
  }
  return cleanEnv(resolved);
}

function getPgUri(): string {
  // Debug log environment variable status to file
  const rawState = {
    DATABASE_URL: process.env.DATABASE_URL,
    DATABASE_PUBLIC_URL: process.env.DATABASE_PUBLIC_URL,
    PGHOST: process.env.PGHOST,
    PGUSER: process.env.PGUSER,
    PGDATABASE: process.env.PGDATABASE,
    RAILWAY_PRIVATE_DOMAIN: process.env.RAILWAY_PRIVATE_DOMAIN,
    RAILWAY_TCP_PROXY_DOMAIN: process.env.RAILWAY_TCP_PROXY_DOMAIN,
    RAILWAY_TCP_PROXY_PORT: process.env.RAILWAY_TCP_PROXY_PORT,
    POSTGRES_USER: process.env.POSTGRES_USER,
    POSTGRES_DB: process.env.POSTGRES_DB
  };
  logToFile(`getPgUri called. Raw state: ${JSON.stringify(rawState)}`);

  // Helper to validate Postgres URIs and ignore configuration placeholders/names
  const isValidPgUri = (str: string): boolean => {
    const clean = (str || '').trim().toLowerCase();
    return clean.startsWith('postgresql://') || clean.startsWith('postgres://');
  };

  const rawDbUrl = resolveEnvValue('DATABASE_URL');
  const rawDbPublicUrl = resolveEnvValue('DATABASE_PUBLIC_URL');

  // Prioritize valid direct URIs first
  const directUri = isValidPgUri(rawDbUrl) 
    ? rawDbUrl 
    : (isValidPgUri(rawDbPublicUrl) ? rawDbPublicUrl : '');
  
  logToFile(`Resolved direct URI: ${directUri ? directUri.replace(/:([^:@]+)@/, ':******@') : 'none'}`);

  if (directUri) {
    return directUri;
  }

  // Compose from individual components if present
  const user = resolveEnvValue('PGUSER') || resolveEnvValue('POSTGRES_USER');
  const password = resolveEnvValue('PGPASSWORD') || resolveEnvValue('POSTGRES_PASSWORD');
  const host = resolveEnvValue('PGHOST') || resolveEnvValue('RAILWAY_PRIVATE_DOMAIN');
  const port = resolveEnvValue('PGPORT') || '5432';
  const database = resolveEnvValue('PGDATABASE') || resolveEnvValue('POSTGRES_DB') || 'railway';

  const composed = (user && password && host && host !== 'postgres.railway.internal')
    ? `postgresql://${user}:${password}@${host}:${port}/${database}`
    : '';

  logToFile(`Composed URI: ${composed ? composed.replace(/:([^:@]+)@/, ':******@') : 'none'}`);
  return composed;
}

let pgPool: pg.Pool | null = null;
let schemaInitialized = false;
let dbError: string | null = null;

let vercelPool: pg.Pool | null = null;
let vercelSchemaInitialized = false;
let vercelDbError: string | null = null;
let cachedVercelDbUrl = '';

/**
 * Helper to get vercel database URL either from cache, database config, or env variables
 */
export async function getVercelPgUri(): Promise<string> {
  if (cachedVercelDbUrl) return cachedVercelDbUrl;

  let url = '';
  try {
    if (schemaInitialized) {
      url = await getRailwayConfigValue('vercel_database_url');
    }
  } catch (err) {}

  if (!url) {
    url = cleanEnv(process.env.VERCEL_DATABASE_URL) || cleanEnv(process.env.POSTGRES_URL);
  }

  if (url) {
    cachedVercelDbUrl = url;
  }
  return url;
}

/**
 * 1. Initialize and test the reusable Vercel Postgres pool
 */
export async function getVercelPgPool(): Promise<pg.Pool | null> {
  const uri = await getVercelPgUri();
  if (!uri) {
    vercelDbError = "L'URL de la deuxième base de données (Vercel) n'est pas configurée.";
    return null;
  }

  if (!vercelPool) {
    try {
      console.log('[Vercel Postgres] Connection attempt to secondary database...');
      vercelPool = new Pool({
        connectionString: uri,
        ssl: uri.includes('localhost') || uri.includes('127.0.0.1') ? false : { rejectUnauthorized: false },
        connectionTimeoutMillis: 8000,
        idleTimeoutMillis: 30000,
        max: 10
      });

      vercelPool.on('error', (err) => {
        console.error('[Vercel Postgres] Unexpected error on idle client:', err);
        vercelPool = null;
        vercelSchemaInitialized = false;
      });

      const client = await vercelPool.connect();
      client.release();
      console.log('[Vercel Postgres] Connected to Vercel PostgreSQL successfully.');
      vercelDbError = null;
    } catch (err: any) {
      console.error('[Vercel Postgres] Startup connection pool failed:', err);
      logToFile(`Vercel Startup failed. Error: ${err.message || String(err)}`);
      vercelDbError = err.message || String(err);
      vercelPool = null;
      return null;
    }
  }
  return vercelPool;
}

/**
 * Executes a Vercel query with retry logic.
 */
export async function executeVercelQuery(queryText: string, params?: any[], retryCount = 1): Promise<any> {
  const pool = await getVercelPgPool();
  if (!pool) {
    throw new Error('Vercel database pool is offline.');
  }
  try {
    return await pool.query(queryText, params);
  } catch (err: any) {
    const isConnErr = err.message && (
      err.message.includes('terminated unexpectedly') ||
      err.message.includes('closed') ||
      err.message.includes('socket') ||
      err.message.includes('connection') ||
      err.message.includes('SSL') ||
      err.code === 'ECONNRESET' ||
      err.code === '57P01'
    );
    if (isConnErr && retryCount > 0) {
      console.warn(`[Vercel Postgres] Connection error caught ("${err.message}"). Re-establishing pool and retrying query...`);
      if (vercelPool) {
        try {
          await vercelPool.end();
        } catch (e) {}
        vercelPool = null;
      }
      vercelSchemaInitialized = false;
      return executeVercelQuery(queryText, params, retryCount - 1);
    }
    throw err;
  }
}

/**
 * 2. Vercel schema configuration setup
 */
export async function initializeVercelDbSchema(): Promise<boolean> {
  if (vercelSchemaInitialized) return true;

  const rawPool = await getVercelPgPool();
  if (!rawPool) {
    console.warn('[Vercel Postgres] Database pool is offline - skipping table initialization.');
    return false;
  }
  const pool = { query: (text: string, params?: any[]) => executeVercelQuery(text, params) };

  try {
    console.log('[Vercel Postgres] Creating Vercel relational tables...');
    
    await pool.query(`
      CREATE TABLE IF NOT EXISTS stands (
        id VARCHAR(255) PRIMARY KEY,
        data JSONB NOT NULL
      );
    `);
    
    await pool.query(`
      CREATE TABLE IF NOT EXISTS contacts (
        id VARCHAR(255) PRIMARY KEY,
        data JSONB NOT NULL
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS media_partners (
        id VARCHAR(255) PRIMARY KEY,
        data JSONB NOT NULL
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS transactions (
        id VARCHAR(255) PRIMARY KEY,
        data JSONB NOT NULL
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS campaigns (
        id VARCHAR(255) PRIMARY KEY,
        data JSONB NOT NULL
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS tasks (
        id VARCHAR(255) PRIMARY KEY,
        data JSONB NOT NULL
      );
    `);

    vercelSchemaInitialized = true;
    vercelDbError = null;
    return true;
  } catch (err: any) {
    console.error('[Vercel Postgres] Relational tables build layout failed:', err);
    vercelDbError = err.message || String(err);
    return false;
  }
}

/**
 * Reset and force re-create Vercel database schemas
 */
export async function resetVercelDbSchema(force = false): Promise<boolean> {
  const rawPool = await getVercelPgPool();
  if (!rawPool) {
    console.warn('[Vercel Postgres] Connection pool offline - cannot reset schemas.');
    return false;
  }
  const pool = { query: (text: string, params?: any[]) => executeVercelQuery(text, params) };

  try {
    if (force) {
      console.log('[Vercel Postgres] Dropping database tables...');
      await pool.query('DROP TABLE IF EXISTS stands, contacts, media_partners, transactions, campaigns, tasks;');
    }

    vercelSchemaInitialized = false;
    await initializeVercelDbSchema();
    return true;
  } catch (err: any) {
    console.error('[Vercel Postgres] Table reset failed:', err);
    vercelDbError = err.message || String(err);
    return false;
  }
}

/**
 * Load User Data from Vercel Postgresql
 */
export async function loadUserDataFromVercel() {
  const rawPool = await getVercelPgPool();
  if (!rawPool) {
    console.warn('[Vercel Postgres] Database offline, cannot load records.');
    return null;
  }
  const pool = { query: (text: string, params?: any[]) => executeVercelQuery(text, params) };

  try {
    await initializeVercelDbSchema();

    const [standsRes, contactsRes, mediaPartnersRes, transactionsRes, campaignsRes, tasksRes] = await Promise.all([
      pool.query('SELECT data FROM stands'),
      pool.query('SELECT data FROM contacts'),
      pool.query('SELECT data FROM media_partners'),
      pool.query('SELECT data FROM transactions'),
      pool.query('SELECT data FROM campaigns'),
      pool.query('SELECT data FROM tasks')
    ]);

    const dbContacts = contactsRes.rows.map((row: any) => row.data) as Contact[];
    const dbMediaPartners = mediaPartnersRes.rows.map((row: any) => row.data) as Contact[];
    
    dbMediaPartners.forEach(p => {
      p.role = 'partner_media';
    });

    return {
      stands: standsRes.rows.map((row: any) => row.data) as Stand[],
      contacts: [...dbContacts, ...dbMediaPartners],
      transactions: transactionsRes.rows.map((row: any) => row.data) as Transaction[],
      campaigns: campaignsRes.rows.map((row: any) => row.data) as Campaign[],
      tasks: tasksRes.rows.map((row: any) => row.data) as Task[]
    };
  } catch (err: any) {
    console.error('[Vercel Postgres] Load failed:', err);
    vercelDbError = err.message || String(err);
    return null;
  }
}

/**
 * Save / sync full state to Vercel Postgresql
 */
export async function saveUserDataToVercel(data: {
  stands: Stand[];
  contacts: Contact[];
  transactions: Transaction[];
  campaigns: Campaign[];
  tasks: Task[];
}) {
  const rawPool = await getVercelPgPool();
  if (!rawPool) return false;
  const pool = { query: (text: string, params?: any[]) => executeVercelQuery(text, params) };

  try {
    await initializeVercelDbSchema();

    // 1. Stands
    if (data.stands) {
      if (data.stands.length > 0) {
        for (const s of data.stands) {
          await pool.query(
            'INSERT INTO stands (id, data) VALUES ($1, $2) ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data',
            [s.id, JSON.stringify(s)]
          );
        }
        const standIds = data.stands.map(s => s.id);
        await pool.query(
          'DELETE FROM stands WHERE id NOT IN (' + standIds.map((_, i) => '$' + (i + 1)).join(', ') + ')',
          standIds
        );
      } else {
        await pool.query('DELETE FROM stands');
      }
    }

    // 2. Contacts & Media Partners Separation
    if (data.contacts) {
      if (data.contacts.length > 0) {
        const generalContacts = data.contacts.filter(c => c.role !== 'partner_media');
        const mediaPartners = data.contacts.filter(c => c.role === 'partner_media');

        // Block A: General Contacts
        if (generalContacts.length > 0) {
          for (const c of generalContacts) {
            await pool.query(
              'INSERT INTO contacts (id, data) VALUES ($1, $2) ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data',
              [c.id, JSON.stringify(c)]
            );
          }
          const contactIds = generalContacts.map(c => c.id);
          await pool.query(
            'DELETE FROM contacts WHERE id NOT IN (' + contactIds.map((_, i) => '$' + (i + 1)).join(', ') + ')',
            contactIds
          );
        } else {
          await pool.query('DELETE FROM contacts');
        }

        // Block B: Media Partners
        if (mediaPartners.length > 0) {
          for (const m of mediaPartners) {
            await pool.query(
              'INSERT INTO media_partners (id, data) VALUES ($1, $2) ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data',
              [m.id, JSON.stringify(m)]
            );
          }
          const partnerIds = mediaPartners.map(m => m.id);
          await pool.query(
            'DELETE FROM media_partners WHERE id NOT IN (' + partnerIds.map((_, i) => '$' + (i + 1)).join(', ') + ')',
            partnerIds
          );
        } else {
          await pool.query('DELETE FROM media_partners');
        }
      } else {
        await pool.query('DELETE FROM contacts');
        await pool.query('DELETE FROM media_partners');
      }
    }

    // 3. Transactions
    if (data.transactions) {
      if (data.transactions.length > 0) {
        for (const t of data.transactions) {
          await pool.query(
            'INSERT INTO transactions (id, data) VALUES ($1, $2) ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data',
            [t.id, JSON.stringify(t)]
          );
        }
        const transactionIds = data.transactions.map(t => t.id);
        await pool.query(
          'DELETE FROM transactions WHERE id NOT IN (' + transactionIds.map((_, i) => '$' + (i + 1)).join(', ') + ')',
          transactionIds
        );
      } else {
        await pool.query('DELETE FROM transactions');
      }
    }

    // 4. Campaigns
    if (data.campaigns) {
      if (data.campaigns.length > 0) {
        for (const c of data.campaigns) {
          await pool.query(
            'INSERT INTO campaigns (id, data) VALUES ($1, $2) ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data',
            [c.id, JSON.stringify(c)]
          );
        }
        const campaignIds = data.campaigns.map(c => c.id);
        await pool.query(
          'DELETE FROM campaigns WHERE id NOT IN (' + campaignIds.map((_, i) => '$' + (i + 1)).join(', ') + ')',
          campaignIds
        );
      } else {
        await pool.query('DELETE FROM campaigns');
      }
    }

    // 5. Tasks
    if (data.tasks) {
      if (data.tasks.length > 0) {
        for (const t of data.tasks) {
          await pool.query(
            'INSERT INTO tasks (id, data) VALUES ($1, $2) ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data',
            [t.id, JSON.stringify(t)]
          );
        }
        const taskIds = data.tasks.map(t => t.id);
        await pool.query(
          'DELETE FROM tasks WHERE id NOT IN (' + taskIds.map((_, i) => '$' + (i + 1)).join(', ') + ')',
          taskIds
        );
      } else {
        await pool.query('DELETE FROM tasks');
      }
    }

    console.log('[Vercel Postgres] Replication fully synchronized database rows.');
    return true;
  } catch (err: any) {
    console.error('[Vercel Postgres] Synchronize collections failed:', err);
    return false;
  }
}

export function getVercelPostgresStatus() {
  const uri = cachedVercelDbUrl || cleanEnv(process.env.VERCEL_DATABASE_URL) || cleanEnv(process.env.POSTGRES_URL);
  return {
    isConfigured: !!uri,
    hasDatabaseUrl: !!uri,
    dbInitialized: vercelSchemaInitialized,
    error: vercelDbError,
    dbName: 'data_bas2_vercel',
    maskedUrl: uri 
      ? uri.replace(/:([^:@]+)@/, ':******@').split('?')[0]
      : null,
  };
}

/**
 * 1. Initialize and test the reusable Postgres pool
 */
export async function getPgPool(): Promise<pg.Pool | null> {
  const uri = getPgUri();
  if (!uri) {
    dbError = 'DATABASE_URL system variable non configurée. Veuillez ajouter vos paramètres de base PostgreSQL.';
    return null;
  }

  if (!pgPool) {
    try {
      console.log('[Postgres Service] Connection attempt focusing on resolved URI...');
      pgPool = new Pool({
        connectionString: uri,
        ssl: uri.includes('localhost') || uri.includes('127.0.0.1') ? false : { rejectUnauthorized: false },
        connectionTimeoutMillis: 8000,
        idleTimeoutMillis: 30000,
        max: 10
      });

      // Register error handler to catch idle client connection terminations gracefully
      pgPool.on('error', (err) => {
        console.error('[Postgres Service] Unexpected error on idle client:', err);
        pgPool = null;
        schemaInitialized = false;
      });
      
      // Ping check
      const client = await pgPool.connect();
      client.release();
      console.log('[Postgres Service] Connected to PostgreSQL successfully.');
      dbError = null;
    } catch (err: any) {
      console.error('[Postgres Service] Startup connection pool failed:', err);
      logToFile(`Startup connection pool failed. Masked URI: ${uri.replace(/:([^:@]+)@/, ':******@')}. Error: ${err.message || String(err)}`);
      dbError = err.message || String(err);
      pgPool = null;
      return null;
    }
  }
  return pgPool;
}

/**
 * Executes a query with recursive connection error retry logic.
 * If a fatal connection termination is detected, the old pool is destroyed,
 * a fresh pool is created, and the query is re-evaluated.
 */
export async function executeQuery(queryText: string, params?: any[], retryCount = 2): Promise<any> {
  const pool = await getPgPool();
  if (!pool) {
    throw new Error('Database pool is offline.');
  }
  try {
    return await pool.query(queryText, params);
  } catch (err: any) {
    const isConnErr = err.message && (
      err.message.includes('terminated unexpectedly') ||
      err.message.includes('closed') ||
      err.message.includes('socket') ||
      err.message.includes('connection') ||
      err.message.includes('admin') ||
      err.message.includes('SSL') ||
      err.code === 'ECONNRESET' ||
      err.code === '57P01' ||
      err.message.includes('bad connection')
    );
    if (isConnErr && retryCount > 0) {
      console.warn(`[Postgres Service] Database connection error caught ("${err.message}"). Re-establishing pool and retrying query...`);
      if (pgPool) {
        try {
          await pgPool.end();
        } catch (e) {}
        pgPool = null;
      }
      schemaInitialized = false;
      return executeQuery(queryText, params, retryCount - 1);
    }
    throw err;
  }
}

/**
 * 2. Database schemas setup: Create relational tables if not exist
 */
export async function initializeDbSchema(): Promise<boolean> {
  if (schemaInitialized) return true;

  const rawPool = await getPgPool();
  if (!rawPool) {
    console.warn('[Postgres Service] Database pool is offline - skipping table initialization.');
    return false;
  }
  const pool = { query: (text: string, params?: any[]) => executeQuery(text, params) };

  try {
    console.log('[Postgres Service] Creating core relational tables...');
    
    // Create tables containing id and JSONB payload for dynamic fields schema mapping
    await pool.query(`
      CREATE TABLE IF NOT EXISTS stands (
        id VARCHAR(255) PRIMARY KEY,
        data JSONB NOT NULL
      );
    `);
    
    await pool.query(`
      CREATE TABLE IF NOT EXISTS contacts (
        id VARCHAR(255) PRIMARY KEY,
        data JSONB NOT NULL
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS media_partners (
        id VARCHAR(255) PRIMARY KEY,
        data JSONB NOT NULL
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS transactions (
        id VARCHAR(255) PRIMARY KEY,
        data JSONB NOT NULL
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS campaigns (
        id VARCHAR(255) PRIMARY KEY,
        data JSONB NOT NULL
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS tasks (
        id VARCHAR(255) PRIMARY KEY,
        data JSONB NOT NULL
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS railway_config (
        key VARCHAR(255) PRIMARY KEY,
        value TEXT NOT NULL
      );
    `);

    await seedCollectionsIfEmpty(rawPool);
    schemaInitialized = true;
    dbError = null;
    return true;
  } catch (err: any) {
    console.error('[Postgres Service] Relational tables build layout failed:', err);
    dbError = err.message || String(err);
    return false;
  }
}

/**
 * Reset and force re-create database schemas/baseline records
 */
export async function resetDbSchema(force = false): Promise<boolean> {
  const rawPool = await getPgPool();
  if (!rawPool) {
    console.warn('[Postgres Service] Connection pool offline - cannot reset schemas.');
    return false;
  }
  const pool = { query: (text: string, params?: any[]) => executeQuery(text, params) };

  try {
    if (force) {
      console.log('[Postgres Service] Dropping database tables...');
      await pool.query('DROP TABLE IF EXISTS stands, contacts, media_partners, transactions, campaigns, tasks;');
    }

    schemaInitialized = false;
    await initializeDbSchema();
    return true;
  } catch (err: any) {
    console.error('[Postgres Service] Reseeding database failed:', err);
    dbError = err.message || String(err);
    return false;
  }
}

/**
 * Seeds static baseline datasets when tables are empty
 */
async function seedCollectionsIfEmpty(rawPool: pg.Pool) {
  const pool = { query: (text: string, params?: any[]) => executeQuery(text, params) };
  try {
    // 1. Stands
    const standsCountRes = await pool.query('SELECT COUNT(*) FROM stands');
    const standsCount = parseInt(standsCountRes.rows[0].count, 10);
    if (standsCount === 0) {
      console.log('[Postgres Service] Seeding stands...');
      for (const s of initialStands) {
        await pool.query('INSERT INTO stands (id, data) VALUES ($1, $2)', [s.id, JSON.stringify(s)]);
      }
    }

    // 2. Contacts
    const contactsCountRes = await pool.query('SELECT COUNT(*) FROM contacts');
    const contactsCount = parseInt(contactsCountRes.rows[0].count, 10);
    if (contactsCount === 0) {
      console.log('[Postgres Service] Seeding contacts...');
      const nonMediaContacts = initialContacts.filter(c => c.role !== 'partner_media');
      for (const c of nonMediaContacts) {
        await pool.query('INSERT INTO contacts (id, data) VALUES ($1, $2)', [c.id, JSON.stringify(c)]);
      }
    }

    // 2.5 Media Partners
    const partnersCountRes = await pool.query('SELECT COUNT(*) FROM media_partners');
    const partnersCount = parseInt(partnersCountRes.rows[0].count, 10);
    if (partnersCount === 0) {
      console.log('[Postgres Service] Seeding media partners...');
      const mediaContacts = initialContacts.filter(c => c.role === 'partner_media');
      for (const m of mediaContacts) {
        await pool.query('INSERT INTO media_partners (id, data) VALUES ($1, $2)', [m.id, JSON.stringify(m)]);
      }
    }

    // 3. Transactions
    const transactionsCountRes = await pool.query('SELECT COUNT(*) FROM transactions');
    const transactionsCount = parseInt(transactionsCountRes.rows[0].count, 10);
    if (transactionsCount === 0) {
      console.log('[Postgres Service] Seeding transactions...');
      for (const t of initialTransactions) {
        await pool.query('INSERT INTO transactions (id, data) VALUES ($1, $2)', [t.id, JSON.stringify(t)]);
      }
    }

    // 4. Campaigns
    const campaignsCountRes = await pool.query('SELECT COUNT(*) FROM campaigns');
    const campaignsCount = parseInt(campaignsCountRes.rows[0].count, 10);
    if (campaignsCount === 0) {
      console.log('[Postgres Service] Seeding campaigns...');
      for (const c of initialCampaigns) {
        await pool.query('INSERT INTO campaigns (id, data) VALUES ($1, $2)', [c.id, JSON.stringify(c)]);
      }
    }

    // 5. Tasks
    const tasksCountRes = await pool.query('SELECT COUNT(*) FROM tasks');
    const tasksCount = parseInt(tasksCountRes.rows[0].count, 10);
    if (tasksCount === 0) {
      console.log('[Postgres Service] Seeding tasks...');
      for (const t of initialTasks) {
        await pool.query('INSERT INTO tasks (id, data) VALUES ($1, $2)', [t.id, JSON.stringify(t)]);
      }
    }

    // 6. Railway Config Seed
    const railwayDomainRes = await pool.query("SELECT value FROM railway_config WHERE key = 'railway_domain'");
    if (railwayDomainRes.rows.length === 0) {
      console.log('[Postgres Service] Seeding default Railway domain...');
      await pool.query("INSERT INTO railway_config (key, value) VALUES ('railway_domain', 'r2hcom-production.up.railway.app')");
      await pool.query("INSERT INTO railway_config (key, value) VALUES ('railway_linked_since', '" + new Date().toISOString() + "')");
      await pool.query("INSERT INTO railway_config (key, value) VALUES ('railway_api_status', 'connected')");
    }

    // 7. Vercel 2nd Layer Domain Seed
    const vercelDomainRes = await pool.query("SELECT value FROM railway_config WHERE key = 'vercel_domain'");
    if (vercelDomainRes.rows.length === 0) {
      console.log('[Postgres Service] Seeding default Vercel 2nd layer API domain...');
      await pool.query("INSERT INTO railway_config (key, value) VALUES ('vercel_domain', 'r2hcom.vercel.app')");
      await pool.query("INSERT INTO railway_config (key, value) VALUES ('vercel_linked_since', '" + new Date().toISOString() + "')");
      await pool.query("INSERT INTO railway_config (key, value) VALUES ('vercel_api_status', 'connected')");
    }

    console.log('[Postgres Service] PostgreSQL seed datasets loaded successfully.');
  } catch (err) {
    console.error('[Postgres Service] Error seeding tables:', err);
  }
}

/**
 * 3. Primary CRUD service layer: Load User Data from Postgresql
 */
export async function loadUserDataFromPostgres() {
  const rawPool = await getPgPool();
  if (!rawPool) {
    console.warn('[Postgres Service] Database offline, falling back to static sandbox data.');
    return null;
  }
  const pool = { query: (text: string, params?: any[]) => executeQuery(text, params) };

  try {
    await initializeDbSchema();

    const [standsRes, contactsRes, mediaPartnersRes, transactionsRes, campaignsRes, tasksRes] = await Promise.all([
      pool.query('SELECT data FROM stands'),
      pool.query('SELECT data FROM contacts'),
      pool.query('SELECT data FROM media_partners'),
      pool.query('SELECT data FROM transactions'),
      pool.query('SELECT data FROM campaigns'),
      pool.query('SELECT data FROM tasks')
    ]);

    const dbContacts = contactsRes.rows.map((row: any) => row.data) as Contact[];
    const dbMediaPartners = mediaPartnersRes.rows.map((row: any) => row.data) as Contact[];
    
    // Hard check to verify proper role alignment
    dbMediaPartners.forEach(p => {
      p.role = 'partner_media';
    });

    return {
      stands: standsRes.rows.map((row: any) => row.data) as Stand[],
      contacts: [...dbContacts, ...dbMediaPartners],
      transactions: transactionsRes.rows.map((row: any) => row.data) as Transaction[],
      campaigns: campaignsRes.rows.map((row: any) => row.data) as Campaign[],
      tasks: tasksRes.rows.map((row: any) => row.data) as Task[]
    };
  } catch (err: any) {
    console.error('[Postgres Service] Load failed:', err);
    dbError = err.message || String(err);
    return null;
  }
}

/**
 * 4. Primary CRUD service layer: Save full synchronized state data to Postgresql
 */
export async function saveUserDataToPostgres(data: {
  stands: Stand[];
  contacts: Contact[];
  transactions: Transaction[];
  campaigns: Campaign[];
  tasks: Task[];
}) {
  const rawPool = await getPgPool();
  if (!rawPool) return false;
  const pool = { query: (text: string, params?: any[]) => executeQuery(text, params) };

  try {
    await initializeDbSchema();

    // 1. Stands
    if (data.stands) {
      if (data.stands.length > 0) {
        for (const s of data.stands) {
          await pool.query(
            'INSERT INTO stands (id, data) VALUES ($1, $2) ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data',
            [s.id, JSON.stringify(s)]
          );
        }
        const standIds = data.stands.map(s => s.id);
        await pool.query(
          'DELETE FROM stands WHERE id NOT IN (' + standIds.map((_, i) => '$' + (i + 1)).join(', ') + ')',
          standIds
        );
      } else {
        await pool.query('DELETE FROM stands');
      }
    }

    // 2. Contacts & Media Partners Separation
    if (data.contacts) {
      if (data.contacts.length > 0) {
        const generalContacts = data.contacts.filter(c => c.role !== 'partner_media');
        const mediaPartners = data.contacts.filter(c => c.role === 'partner_media');

        // Block A: General Contacts
        if (generalContacts.length > 0) {
          for (const c of generalContacts) {
            await pool.query(
              'INSERT INTO contacts (id, data) VALUES ($1, $2) ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data',
              [c.id, JSON.stringify(c)]
            );
          }
          const contactIds = generalContacts.map(c => c.id);
          await pool.query(
            'DELETE FROM contacts WHERE id NOT IN (' + contactIds.map((_, i) => '$' + (i + 1)).join(', ') + ')',
            contactIds
          );
        } else {
          await pool.query('DELETE FROM contacts');
        }

        // Block B: Media Partners
        if (mediaPartners.length > 0) {
          for (const m of mediaPartners) {
            try {
              await pool.query(
                'INSERT INTO media_partners (id, data) VALUES ($1, $2) ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data',
                [m.id, JSON.stringify(m)]
              );
            } catch (err: any) {
              console.error(`[Postgres INSERT Error] Failed writing to media_partners (ID: ${m.id}) with:`, err.message || err);
              throw err;
            }
          }
          const partnerIds = mediaPartners.map(m => m.id);
          await pool.query(
            'DELETE FROM media_partners WHERE id NOT IN (' + partnerIds.map((_, i) => '$' + (i + 1)).join(', ') + ')',
            partnerIds
          );
        } else {
          await pool.query('DELETE FROM media_partners');
        }
      } else {
        await pool.query('DELETE FROM contacts');
        await pool.query('DELETE FROM media_partners');
      }
    }

    // 3. Transactions
    if (data.transactions) {
      if (data.transactions.length > 0) {
        for (const t of data.transactions) {
          await pool.query(
            'INSERT INTO transactions (id, data) VALUES ($1, $2) ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data',
            [t.id, JSON.stringify(t)]
          );
        }
        const transactionIds = data.transactions.map(t => t.id);
        await pool.query(
          'DELETE FROM transactions WHERE id NOT IN (' + transactionIds.map((_, i) => '$' + (i + 1)).join(', ') + ')',
          transactionIds
        );
      } else {
        await pool.query('DELETE FROM transactions');
      }
    }

    // 4. Campaigns
    if (data.campaigns) {
      if (data.campaigns.length > 0) {
        for (const c of data.campaigns) {
          await pool.query(
            'INSERT INTO campaigns (id, data) VALUES ($1, $2) ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data',
            [c.id, JSON.stringify(c)]
          );
        }
        const campaignIds = data.campaigns.map(c => c.id);
        await pool.query(
          'DELETE FROM campaigns WHERE id NOT IN (' + campaignIds.map((_, i) => '$' + (i + 1)).join(', ') + ')',
          campaignIds
        );
      } else {
        await pool.query('DELETE FROM campaigns');
      }
    }

    // 5. Tasks
    if (data.tasks) {
      if (data.tasks.length > 0) {
        for (const t of data.tasks) {
          await pool.query(
            'INSERT INTO tasks (id, data) VALUES ($1, $2) ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data',
            [t.id, JSON.stringify(t)]
          );
        }
        const taskIds = data.tasks.map(t => t.id);
        await pool.query(
          'DELETE FROM tasks WHERE id NOT IN (' + taskIds.map((_, i) => '$' + (i + 1)).join(', ') + ')',
          taskIds
        );
      } else {
        await pool.query('DELETE FROM tasks');
      }
    }

    console.log('[Postgres Service] Data tables successfully sychronized.');
    
    // Dual-write replication to Vercel (secondary database layer) if configured
    try {
      const vercelPoolConnected = await getVercelPgPool();
      if (vercelPoolConnected) {
        console.log('[Postgres Duel-Sync] Replicating updates to Vercel Database secondary layer...');
        await saveUserDataToVercel(data);
      }
    } catch (vErr) {
      console.warn('[Postgres Duel-Sync] Vercel replication failed, primary database is safe:', vErr);
    }

    return true;
  } catch (err: any) {
    console.error('[Postgres Service] Synchronize collections failed:', err);
    dbError = err.message || String(err);
    return false;
  }
}

/**
 * Get a specific configuration value from the railway_config table
 */
export async function getRailwayConfigValue(key: string): Promise<string> {
  const rawPool = await getPgPool();
  if (!rawPool) return '';
  const pool = { query: (text: string, params?: any[]) => executeQuery(text, params) };
  try {
    const res = await pool.query('SELECT value FROM railway_config WHERE key = $1', [key]);
    if (res.rows.length > 0) {
      return res.rows[0].value;
    }
  } catch (err) {
    console.warn('[Postgres Service] error query config:', err);
  }
  return '';
}

/**
 * Save / Update a specific configuration value in the railway_config table
 */
export async function saveRailwayConfigValue(key: string, value: string): Promise<boolean> {
  const rawPool = await getPgPool();
  if (!rawPool) return false;
  const pool = { query: (text: string, params?: any[]) => executeQuery(text, params) };
  try {
    await pool.query(
      'INSERT INTO railway_config (key, value) VALUES ($1, $2) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value',
      [key, value]
    );
    return true;
  } catch (err) {
    console.error('[Postgres Service] error writing config:', err);
    return false;
  }
}

/**
 * 5. Diagnostic connection stats indicator endpoint provider
 */
export function getPostgresStatus() {
  const uri = getPgUri();
  const apiKey = process.env.GEMINI_API_KEY || 'AQ.Ab8RN6L5DS5Xy1mzajNsNsPMYtd_bnDyXF70TERWU6Ba7A98mA';
  const dbName = 'data_bas1';
  return {
    isConfigured: !!uri,
    hasDatabaseUrl: !!uri,
    hasSupabaseUrl: false,
    hasAnonKey: false,
    dbInitialized: schemaInitialized,
    error: dbError,
    dbName,
    apiKey,
    maskedUrl: uri 
      ? uri.replace(/:([^:@]+)@/, ':******@').split('?')[0]
      : null,
    supabaseUrl: null,
    debug: {
      DATABASE_URL_defined: !!process.env.DATABASE_URL,
      DATABASE_PUBLIC_URL_defined: !!process.env.DATABASE_PUBLIC_URL,
      PGHOST: process.env.PGHOST || null,
      RAILWAY_PRIVATE_DOMAIN: process.env.RAILWAY_PRIVATE_DOMAIN || null,
      RAILWAY_TCP_PROXY_DOMAIN: process.env.RAILWAY_TCP_PROXY_DOMAIN || null,
      PGPORT: process.env.PGPORT || null,
      RAILWAY_TCP_PROXY_PORT: process.env.RAILWAY_TCP_PROXY_PORT || null
    }
  };
}
