/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { 
  getPostgresStatus, 
  loadUserDataFromPostgres, 
  saveUserDataToPostgres, 
  initializeDbSchema,
  getPgPool,
  resetDbSchema,
  getRailwayConfigValue,
  saveRailwayConfigValue
} from './lib/postgres';

import { Stand, Contact, Transaction, Campaign, Task } from './src/types';

/**
 * 1. Bridge schema initialization test
 */
export async function initializeDatabaseSchema(): Promise<boolean> {
  const result = await initializeDbSchema();
  
  // Initialization test on app startup via Postgres pool
  if (result) {
    console.log('[Startup Test] Postgres database initialisation check: SUCCESS.');
    const pool = await getPgPool();
    if (pool) {
      try {
        const res = await pool.query('SELECT COUNT(*) FROM stands');
        const count = parseInt(res.rows[0].count, 10);
        console.log('[Startup Test] Postgres CRUD validation check: SUCCESS. Stands count:', count);
      } catch (err: any) {
        console.error('[Startup Test] Postgres CRUD validation failed details:', err.message || err);
      }
    }
  } else {
    console.warn('[Startup Test] Postgres database initialisation check: FAILED/OFFLINE.');
  }
  return result;
}

/**
 * Bridge force schema reset operation
 */
export async function resetDatabaseSchema(force = false): Promise<boolean> {
  return resetDbSchema(force);
}

/**
 * 2. Bridge load operation
 */
export async function loadUserDataFromDatabase() {
  return loadUserDataFromPostgres();
}

/**
 * 3. Bridge save operation
 */
export async function saveUserDataToDatabase(data: {
  stands: Stand[];
  contacts: Contact[];
  transactions: Transaction[];
  campaigns: Campaign[];
  tasks: Task[];
}) {
  return saveUserDataToPostgres(data);
}

/**
 * 4. Bridge status check
 */
export function getDatabaseStatus() {
  return getPostgresStatus();
}

/**
 * 5. Railway Domain and API config helpers
 */
export async function getRailwayConfig(key: string): Promise<string> {
  return getRailwayConfigValue(key);
}

export async function saveRailwayConfig(key: string, value: string): Promise<boolean> {
  return saveRailwayConfigValue(key, value);
}
