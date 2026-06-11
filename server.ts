/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import { 
  getDatabaseStatus, 
  loadUserDataFromDatabase, 
  saveUserDataToDatabase,
  initializeDatabaseSchema,
  resetDatabaseSchema,
  getRailwayConfig,
  saveRailwayConfig,
  getVercelDatabaseStatus,
  loadFromVercelDatabase,
  saveToVercelDatabase,
  resetVercelDatabaseSchema
} from './db';

// Load environment variables
dotenv.config();

const app = express();
const PORT = 3000;

// Increase body parser limit to support saving large datasets (contacts, transactions, attachments)
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// API health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// --- PostgreSQL Database Sync Endpoints ---

// Get DB connection and configuration status
app.get('/api/db/status', (req, res) => {
  try {
    const status = getDatabaseStatus();
    const vercelStatus = getVercelDatabaseStatus();
    res.json({
      ...status,
      vercel: vercelStatus
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || String(err) });
  }
});

// Get Railway Domain configuration values
app.get('/api/railway/config', async (req, res) => {
  try {
    const status = getDatabaseStatus();
    if (!status.isConfigured) {
      res.json({
        success: true,
        domain: '',
        linkedSince: null,
        status: 'disconnected'
      });
      return;
    }
    let domain = await getRailwayConfig('railway_domain');
    const linkedSince = await getRailwayConfig('railway_linked_since');
    const configStatus = await getRailwayConfig('railway_api_status');

    if (domain) {
      // Clean up protocol if stored with https:// or http:// or trailing slashes
      domain = domain.replace(/^https?:\/\//i, '').replace(/\/+$/, '');
    }

    res.json({
      success: true,
      domain: domain || 'r2hcom-production.up.railway.app',
      linkedSince: linkedSince || null,
      status: configStatus || 'connected'
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || String(err) });
  }
});

// Update Railway Domain configuration
app.post('/api/railway/config', async (req, res) => {
  try {
    let { domain } = req.body || {};
    if (!domain) {
      res.status(400).json({ success: false, error: "Domaine non fourni" });
      return;
    }
    
    // Clean up domain URL formats
    domain = domain.trim().replace(/^https?:\/\//i, '').replace(/\/+$/, '');
    
    await saveRailwayConfig('railway_domain', domain);
    await saveRailwayConfig('railway_linked_since', new Date().toISOString());
    await saveRailwayConfig('railway_api_status', 'connected');
    
    res.json({ 
      success: true, 
      message: "Domaine Railway mis à jour et lié avec succès via l'API !", 
      domain,
      linkedSince: new Date().toISOString()
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || String(err) });
  }
});

// Get Vercel 2nd Layer Domain configuration values
app.get('/api/vercel/config', async (req, res) => {
  try {
    const status = getDatabaseStatus();
    if (!status.isConfigured) {
      res.json({
        success: true,
        domain: 'r2hcom.vercel.app',
        linkedSince: null,
        status: 'disconnected'
      });
      return;
    }
    let domain = await getRailwayConfig('vercel_domain');
    const linkedSince = await getRailwayConfig('vercel_linked_since');
    const configStatus = await getRailwayConfig('vercel_api_status');

    if (domain) {
      // Clean up protocol if stored with https:// or http:// or trailing slashes
      domain = domain.replace(/^https?:\/\//i, '').replace(/\/+$/, '');
    }

    res.json({
      success: true,
      domain: domain || 'r2hcom.vercel.app',
      linkedSince: linkedSince || null,
      status: configStatus || 'connected'
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || String(err) });
  }
});

// Update Vercel 2nd Layer Domain configuration
app.post('/api/vercel/config', async (req, res) => {
  try {
    let { domain } = req.body || {};
    if (!domain) {
      res.status(400).json({ success: false, error: "Domaine non fourni" });
      return;
    }
    
    // Clean up domain URL formats
    domain = domain.trim().replace(/^https?:\/\//i, '').replace(/\/+$/, '');
    
    await saveRailwayConfig('vercel_domain', domain);
    await saveRailwayConfig('vercel_linked_since', new Date().toISOString());
    await saveRailwayConfig('vercel_api_status', 'connected');
    
    res.json({ 
      success: true, 
      message: "2ème couche API (Vercel) mise à jour et liée avec succès !", 
      domain,
      linkedSince: new Date().toISOString()
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || String(err) });
  }
});

// Load all datasets from PostgreSQL
app.get('/api/db/load', async (req, res) => {
  try {
    const status = getDatabaseStatus();
    if (!status.isConfigured) {
      res.json({ success: false, configured: false, message: 'DATABASE_URL non configurée' });
      return;
    }
    const data = await loadUserDataFromDatabase();
    if (data) {
      res.json({ success: true, configured: true, data });
    } else {
      res.status(500).json({ success: false, configured: true, error: 'Échec du chargement des données depuis PostgreSQL' });
    }
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || String(err) });
  }
});

// Save / sync full state to PostgreSQL
app.post('/api/db/save', async (req, res) => {
  try {
    const status = getDatabaseStatus();
    if (!status.isConfigured) {
      res.json({ success: false, configured: false, message: 'DATABASE_URL non configurée' });
      return;
    }
    const success = await saveUserDataToDatabase(req.body);
    if (success) {
      res.json({ success: true });
    } else {
      res.status(500).json({ success: false, error: 'Échec de la sauvegarde des données dans PostgreSQL' });
    }
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || String(err) });
  }
});

// Force-create or reseed PostgreSQL tables
app.post('/api/db/initialize', async (req, res) => {
  try {
    const status = getDatabaseStatus();
    if (!status.isConfigured) {
      res.json({ success: false, configured: false, message: 'DATABASE_URL non configurée.' });
      return;
    }
    const { force = false } = req.body || {};
    const success = await resetDatabaseSchema(force);
    if (success) {
      res.json({ 
        success: true, 
        message: force 
          ? 'La base de données a été réinitialisée et toutes les tables ont été recréées avec succès !'
          : 'Les tables ont été vérifiées et initialisées avec succès !',
        collections: ['stands', 'contacts', 'transactions', 'campaigns', 'tasks']
      });
    } else {
      res.status(500).json({ success: false, error: 'Échec d\'initialisation des tables PostgreSQL. Vérifiez votre connexion.' });
    }
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || String(err) });
  }
});

// Force-create or reseed Vercel PostgreSQL tables
app.post('/api/db/vercel/initialize', async (req, res) => {
  try {
    const status = getVercelDatabaseStatus();
    if (!status.isConfigured) {
      res.json({ success: false, configured: false, message: 'URL de base de données Vercel non configurée.' });
      return;
    }
    const { force = false } = req.body || {};
    const success = await resetVercelDatabaseSchema(force);
    if (success) {
      res.json({ 
        success: true, 
        message: force 
          ? 'La deuxième base (Vercel) a été réinitialisée et toutes les tables ont été recréées avec succès !'
          : 'Les tables de la deuxième base (Vercel) ont été vérifiées et initialisées avec succès !',
        collections: ['stands', 'contacts', 'transactions', 'campaigns', 'tasks']
      });
    } else {
      res.status(500).json({ success: false, error: 'Échec d\'initialisation des tables Vercel. Vérifiez votre connexion.' });
    }
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || String(err) });
  }
});

// Update Vercel custom Database URL in config
app.post('/api/db/vercel/url', async (req, res) => {
  try {
    const { databaseUrl } = req.body || {};
    if (!databaseUrl) {
      res.status(400).json({ success: false, error: 'URL non fournie.' });
      return;
    }
    // Update config row
    await saveRailwayConfig('vercel_database_url', databaseUrl.trim());
    res.json({ success: true, message: 'URL de connexion de la deuxième base (Vercel) enregistrée avec succès !' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || String(err) });
  }
});

// Copy all records from Railway database into Vercel database (Sync To Vercel)
app.post('/api/db/vercel/sync-to', async (req, res) => {
  try {
    const primaryData = await loadUserDataFromDatabase();
    if (!primaryData) {
      res.status(500).json({ success: false, error: 'Impossible de lire les données de la base principale (Railway).' });
      return;
    }
    const success = await saveToVercelDatabase(primaryData);
    if (success) {
      res.json({ success: true, message: 'Réplication complète de la base Railway vers la base Vercel effectuée avec succès !' });
    } else {
      res.status(500).json({ success: false, error: 'Échec de la réplication vers Vercel. Assurez-vous d\'avoir configuré une URL valide.' });
    }
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || String(err) });
  }
});

// Copy all records from Vercel database into Railway database (Sync From Vercel)
app.post('/api/db/vercel/sync-from', async (req, res) => {
  try {
    const vercelData = await loadFromVercelDatabase();
    if (!vercelData) {
      res.status(500).json({ success: false, error: 'Impossible de lire les données depuis la base Vercel. Vérifiez la connexion.' });
      return;
    }
    const success = await saveUserDataToDatabase(vercelData);
    if (success) {
      res.json({ success: true, message: 'Restauration complète de la base Vercel vers la base Railway effectuée avec succès !' });
    } else {
      res.status(500).json({ success: false, error: 'Échec de la restauration vers la base principale (Railway).' });
    }
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || String(err) });
  }
});


// --- User Profiles Management Endpoints ---

// Default static users for seeding & fallback
const DEFAULT_USER_PROFILES = [
  {
    id: 'u1',
    name: 'Mehdi Rahho',
    email: 'admin',
    password: 'admin',
    role: 'admin',
    title: 'Directeur Général',
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200',
    permissions: {
      canViewDashboard: true,
      canManageLeads: true,
      canViewDevis: true,
      canViewFactures: true,
      canViewMarketing: true,
      canManageStands: true,
      canViewSettings: true
    }
  },
  {
    id: 'u2',
    name: 'Amira Alami',
    email: 'amira@r2h.ma',
    password: 'amira',
    role: 'commercial',
    title: 'Responsable Commerciale',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200',
    permissions: {
      canViewDashboard: true,
      canManageLeads: true,
      canViewDevis: false,
      canViewFactures: false,
      canViewMarketing: true,
      canManageStands: true,
      canViewSettings: false
    }
  },
  {
    id: 'u3',
    name: 'Yassine Naciri',
    email: 'yassine@r2h.ma',
    password: 'yassine',
    role: 'commercial',
    title: 'Commercial Senior',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
    permissions: {
      canViewDashboard: true,
      canManageLeads: true,
      canViewDevis: false,
      canViewFactures: false,
      canViewMarketing: true,
      canManageStands: true,
      canViewSettings: false
    }
  },
  {
    id: 'u4',
    name: 'Fatima Zahra',
    email: 'fatima@r2h.ma',
    password: 'fatima',
    role: 'commercial',
    title: 'Chargée de Clientèle',
    avatarUrl: 'https://images.unsplash.com/photo-1534751516642-a131ffd103fd?auto=format&fit=crop&q=80&w=200',
    permissions: {
      canViewDashboard: true,
      canManageLeads: true,
      canViewDevis: false,
      canViewFactures: false,
      canViewMarketing: true,
      canManageStands: true,
      canViewSettings: false
    }
  },
  {
    id: 'u5',
    name: 'Karim Tazi',
    email: 'karim@r2h.ma',
    password: 'karim',
    role: 'commercial',
    title: 'Négociateur Événementiel',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200',
    permissions: {
      canViewDashboard: true,
      canManageLeads: true,
      canViewDevis: false,
      canViewFactures: false,
      canViewMarketing: true,
      canManageStands: true,
      canViewSettings: false
    }
  }
];

// Get users list
app.get('/api/users', async (req, res) => {
  try {
    const status = getDatabaseStatus();
    if (!status.isConfigured) {
      res.json({ success: true, users: DEFAULT_USER_PROFILES });
      return;
    }
    const val = await getRailwayConfig('user_profiles');
    if (val) {
      res.json({ success: true, users: JSON.parse(val) });
    } else {
      await saveRailwayConfig('user_profiles', JSON.stringify(DEFAULT_USER_PROFILES));
      res.json({ success: true, users: DEFAULT_USER_PROFILES });
    }
  } catch (err: any) {
    res.json({ success: true, users: DEFAULT_USER_PROFILES, error: err.message });
  }
});

// Update users list
app.post('/api/users', async (req, res) => {
  try {
    const { users } = req.body || {};
    if (!users || !Array.isArray(users)) {
      res.status(400).json({ success: false, error: 'Format de données utilisateur invalide' });
      return;
    }
    const status = getDatabaseStatus();
    if (status.isConfigured) {
      await saveRailwayConfig('user_profiles', JSON.stringify(users));
    }
    res.json({ success: true, users });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || String(err) });
  }
});


// Lazy-loaded Gemini SDK client
let aiClient: GoogleGenAI | null = null;
function getGeminiClient() {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not defined. Please add it via the Settings/Secrets menu.');
    }
    aiClient = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

// Model alias selection from official skill documentation
const TEXT_MODEL = 'gemini-3.5-flash';

// API route to draft email with Gemini
app.post('/api/generate-email', async (req, res) => {
  try {
    const { prompt, siteName, targetAudience, goal, language = 'fr' } = req.body;

    if (!prompt) {
      res.status(400).json({ error: 'Le paramètre prompt est requis.' });
      return;
    }

    const ai = getGeminiClient();

    const systemInstruction = `Tu es un expert en marketing digital de salons professionnels et de communication d'entreprise pour l'agence R2H Communication. 
Ton rôle est de rédiger des emails ou des newsletters d'invitation impactants, en français ou en anglais selon la demande.
Le ton doit être professionnel, persuasif, chaleureux et raffiné. 
Structure clairement l'email rédigé (Objet:, Salutations, Corps de texte, Appel à l'action claire, et Signature).`;

    const userPrompt = `Rédige un e-mail marketing professionnel.
Détails :
- Salon / Contexte : ${siteName || 'R2H Communication / Événement'}
- Public cible : ${targetAudience || 'Professionnels et exposants'}
- Objectif de l'email : ${goal || 'Inscrire ou inviter au salon'}
- Instructions spécifiques : ${prompt}
- Langue de réponse : ${language === 'fr' ? 'Français' : 'Anglais'}

Génère un texte d'email complet et prêt à envoyer, contenant l'objet de l'email et un corps de texte formaté proprement.`;

    const response = await ai.models.generateContent({
      model: TEXT_MODEL,
      contents: userPrompt,
      config: {
        systemInstruction,
        temperature: 0.7,
      }
    });

    const generatedText = response.text || '';
    res.json({ success: true, emailText: generatedText });

  } catch (error: any) {
    console.error('Error generating email with Gemini:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Une erreur s\'est produite lors de la génération de l\'email.' 
    });
  }
});

async function startServer() {
  // Vite integration
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
    console.log('Vite middleware mounted in development mode');
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    // SPA Fallback inside express for React routing
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  // Try to initialize database schema on startup
  initializeDatabaseSchema()
    .then((success) => {
      if (success) {
        console.log('[PostgreSQL DB] Database tables successfully verified.');
      } else {
        console.log('[PostgreSQL DB] Database connection not active or configured.');
      }
    })
    .catch((err) => {
      console.error('[PostgreSQL DB] Async table boot failed raw:', err);
    });

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Back Office HTTP Server] Running at http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
