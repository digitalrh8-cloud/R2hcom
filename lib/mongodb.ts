/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { MongoClient, Db } from 'mongodb';
import { Stand, Contact, Transaction, Campaign, Task } from '../src/types';
import { 
  initialStands, 
  initialContacts, 
  initialTransactions, 
  initialCampaigns, 
  initialTasks 
} from '../src/initialData';

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

// Extract database name from connection string safely
export function getDatabaseNameFromUri(uri: string): string {
  try {
    // Strip protocol prefix (e.g. mongodb:// or mongodb+srv://)
    const withoutProtocol = uri.replace(/^mongodb(\+srv)?:\/\//i, '');
    const cleanUri = withoutProtocol.split('?')[0];
    const slashIdx = cleanUri.indexOf('/');
    if (slashIdx !== -1) {
      const dbPart = cleanUri.substring(slashIdx + 1);
      // Ensure dbPart doesn't contain nested slashes or option query structures
      if (dbPart && !dbPart.includes('/')) {
        return dbPart;
      }
    }
  } catch (e) {
    // Ignore error
  }
  return '';
}

function getMongoUri(): string {
  // Try direct URIs with parsed placeholders first
  const directUri = resolveEnvValue('MONGODB_URI') || 
                    resolveEnvValue('MONGO_URL') || 
                    resolveEnvValue('MONGO_PUBLIC_URL');
  if (directUri) {
    return directUri;
  }

  // Compose from individual components if present
  const user = resolveEnvValue('MONGOUSER') || resolveEnvValue('MONGO_INITDB_ROOT_USERNAME');
  const password = resolveEnvValue('MONGOPASSWORD') || resolveEnvValue('MONGO_INITDB_ROOT_PASSWORD');
  const host = resolveEnvValue('MONGOHOST') || resolveEnvValue('RAILWAY_PRIVATE_DOMAIN');
  const port = resolveEnvValue('MONGOPORT') || '27017';
  const database = resolveEnvValue('MONGO_DATABASE_NAME') || 'r2h';

  if (user && password && host) {
    return `mongodb://${user}:${password}@${host}:${port}/${database}?authSource=admin`;
  }

  return '';
}

let mongoClient: MongoClient | null = null;
let dbInstance: Db | null = null;
let schemaInitialized = false;
let dbError: string | null = null;

/**
 * 1. Initialize the reusable MongoDB client
 */
export async function getMongoClient(): Promise<MongoClient | null> {
  const uri = getMongoUri();
  if (!uri) {
    dbError = 'MONGODB_URI is not defined. Please add it in the environment settings.';
    return null;
  }

  if (!mongoClient) {
    try {
      mongoClient = new MongoClient(uri, {
        connectTimeoutMS: 5000,
        serverSelectionTimeoutMS: 5000,
      });
      await mongoClient.connect();
      console.log('[MongoDB Service] Connected to MongoDB deployment successfully.');
    } catch (err: any) {
      console.error('[MongoDB Service] Error connecting client:', err);
      dbError = err.message || String(err);
      return null;
    }
  }
  return mongoClient;
}

/**
 * Helper to retrieve MongoDB database instance
 */
export async function getDb(): Promise<Db | null> {
  const client = await getMongoClient();
  if (!client) return null;
  if (!dbInstance) {
    // Dynamically retrieve database name from MONGODB_URI if not manually specified in MONGO_DATABASE_NAME
    const uriDatabase = getDatabaseNameFromUri(getMongoUri());
    const dbName = process.env.MONGO_DATABASE_NAME || uriDatabase || 'r2h';
    dbInstance = client.db(dbName);
  }
  return dbInstance;
}

/**
 * 2. Database collections and initial dataset setup
 */
export async function initializeDbSchema(): Promise<boolean> {
  if (schemaInitialized) return true;

  const db = await getDb();
  if (!db) {
    console.warn('[MongoDB Service] MONGODB_URI missing or connection failed - skipping schema seeding.');
    return false;
  }

  try {
    console.log('[MongoDB Service] Initializing collections and default baseline seed records...');
    await seedCollectionsIfEmpty(db);
    schemaInitialized = true;
    dbError = null;
    return true;
  } catch (err: any) {
    console.error('[MongoDB Service] Collection initialization failed:', err);
    dbError = err.message || String(err);
    return false;
  }
}

/**
 * Seeds static baseline datasets when collections are empty
 */
async function seedCollectionsIfEmpty(db: Db) {
  try {
    // 1. Stands
    const standsColl = db.collection('stands');
    const standsCount = await standsColl.countDocuments();
    if (standsCount === 0) {
      console.log('[MongoDB Service] Seeding stands...');
      await standsColl.insertMany(initialStands.map(s => ({ ...s })));
    }

    // 2. Contacts
    const contactsColl = db.collection('contacts');
    const contactsCount = await contactsColl.countDocuments();
    if (contactsCount === 0) {
      console.log('[MongoDB Service] Seeding contacts...');
      await contactsColl.insertMany(initialContacts.map(c => ({ ...c })));
    }

    // 3. Transactions
    const transactionsColl = db.collection('transactions');
    const transactionsCount = await transactionsColl.countDocuments();
    if (transactionsCount === 0) {
      console.log('[MongoDB Service] Seeding transactions...');
      await transactionsColl.insertMany(initialTransactions.map(t => ({ ...t })));
    }

    // 4. Campaigns
    const campaignsColl = db.collection('campaigns');
    const campaignsCount = await campaignsColl.countDocuments();
    if (campaignsCount === 0) {
      console.log('[MongoDB Service] Seeding campaigns...');
      await campaignsColl.insertMany(initialCampaigns.map(c => ({ ...c })));
    }

    // 5. Tasks
    const tasksColl = db.collection('tasks');
    const tasksCount = await tasksColl.countDocuments();
    if (tasksCount === 0) {
      console.log('[MongoDB Service] Seeding tasks...');
      await tasksColl.insertMany(initialTasks.map(t => ({ ...t })));
    }

    console.log('[MongoDB Service] Default collections setup and seed records verified.');
  } catch (err) {
    console.error('[MongoDB Service] Error seeding collections:', err);
  }
}

/**
 * 3. Primary CRUD service layer: Load User Data from MongoDB
 */
export async function loadUserDataFromMongo() {
  const db = await getDb();
  if (!db) {
    console.warn('[MongoDB Service] Database offline, falling back to static sandbox data.');
    return null;
  }

  try {
    await initializeDbSchema();

    const [standsDocs, contactsDocs, transactionsDocs, campaignsDocs, tasksDocs] = await Promise.all([
      db.collection('stands').find({}).toArray(),
      db.collection('contacts').find({}).toArray(),
      db.collection('transactions').find({}).toArray(),
      db.collection('campaigns').find({}).toArray(),
      db.collection('tasks').find({}).toArray()
    ]);

    // Format utility to strip internal Mongo _id properties away from standard UI states
    const cleanDoc = (doc: any) => {
      const { _id, ...rest } = doc;
      return rest;
    };

    return {
      stands: standsDocs.map(cleanDoc) as Stand[],
      contacts: contactsDocs.map(cleanDoc) as Contact[],
      transactions: transactionsDocs.map(cleanDoc) as Transaction[],
      campaigns: campaignsDocs.map(cleanDoc) as Campaign[],
      tasks: tasksDocs.map(cleanDoc) as Task[]
    };
  } catch (err: any) {
    console.error('[MongoDB Service] Load failed:', err);
    dbError = err.message || String(err);
    return null;
  }
}

/**
 * 4. Primary CRUD service layer: Save full synchronized state data to MongoDB
 */
export async function saveUserDataToMongo(data: {
  stands: Stand[];
  contacts: Contact[];
  transactions: Transaction[];
  campaigns: Campaign[];
  tasks: Task[];
}) {
  const db = await getDb();
  if (!db) return false;

  try {
    await initializeDbSchema();

    // 1. Stands
    if (data.stands && data.stands.length > 0) {
      const coll = db.collection('stands');
      for (const s of data.stands) {
        await coll.updateOne({ id: s.id }, { $set: s }, { upsert: true });
      }
    }

    // 2. Contacts
    if (data.contacts && data.contacts.length > 0) {
      const coll = db.collection('contacts');
      for (const c of data.contacts) {
        await coll.updateOne({ id: c.id }, { $set: c }, { upsert: true });
      }
    }

    // 3. Transactions
    if (data.transactions && data.transactions.length > 0) {
      const coll = db.collection('transactions');
      for (const t of data.transactions) {
        await coll.updateOne({ id: t.id }, { $set: t }, { upsert: true });
      }
    }

    // 4. Campaigns
    if (data.campaigns && data.campaigns.length > 0) {
      const coll = db.collection('campaigns');
      for (const c of data.campaigns) {
        await coll.updateOne({ id: c.id }, { $set: c }, { upsert: true });
      }
    }

    // 5. Tasks
    if (data.tasks && data.tasks.length > 0) {
      const coll = db.collection('tasks');
      for (const t of data.tasks) {
        await coll.updateOne({ id: t.id }, { $set: t }, { upsert: true });
      }
    }

    console.log('[MongoDB Service] Collections successfully synchronized.');
    return true;
  } catch (err: any) {
    console.error('[MongoDB Service] Sync failed:', err);
    dbError = err.message || String(err);
    return false;
  }
}

/**
 * 5. Diagnostic connection stats indicator endpoint provider
 */
export function getMongoStatus() {
  const uri = getMongoUri();
  return {
    isConfigured: !!uri,
    hasDatabaseUrl: !!uri,
    hasSupabaseUrl: false,
    hasAnonKey: false,
    dbInitialized: schemaInitialized,
    error: dbError,
    maskedUrl: uri 
      ? uri.replace(/:([^:@]+)@/, ':******@') 
      : null,
    supabaseUrl: null
  };
}
