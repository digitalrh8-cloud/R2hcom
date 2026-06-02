/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { 
  getMongoStatus, 
  loadUserDataFromMongo, 
  saveUserDataToMongo, 
  initializeDbSchema,
  getDb
} from './lib/mongodb';

import { Stand, Contact, Transaction, Campaign, Task } from './src/types';

/**
 * 1. Bridge schema initialization test
 */
export async function initializeDatabaseSchema(): Promise<boolean> {
  const result = await initializeDbSchema();
  
  // Initialization test on app startup via MongoDB Client
  if (result) {
    console.log('[Startup Test] MongoDB database initialisation check: SUCCESS.');
    const db = await getDb();
    if (db) {
      try {
        const count = await db.collection('stands').countDocuments();
        console.log('[Startup Test] MongoDB CRUD validation check: SUCCESS. Stands count:', count);
      } catch (err: any) {
        console.error('[Startup Test] MongoDB CRUD validation failed details:', err.message || err);
      }
    }
  } else {
    console.warn('[Startup Test] MongoDB database initialisation check: FAILED/OFFLINE.');
  }
  return result;
}

/**
 * 2. Bridge load operation
 */
export async function loadUserDataFromDatabase() {
  return loadUserDataFromMongo();
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
  return saveUserDataToMongo(data);
}

/**
 * 4. Bridge status check
 */
export function getDatabaseStatus() {
  return getMongoStatus();
}
