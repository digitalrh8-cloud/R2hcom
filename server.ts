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
  resetDatabaseSchema
} from './db';

// Load environment variables
dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// API health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// --- PostgreSQL Database Sync Endpoints ---

// Get DB connection and configuration status
app.get('/api/db/status', (req, res) => {
  try {
    const status = getDatabaseStatus();
    res.json(status);
  } catch (err: any) {
    res.status(500).json({ error: err.message || String(err) });
  }
});

// Load all datasets from MongoDB
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

// Save / sync full state to MongoDB
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
