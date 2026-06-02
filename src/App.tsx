/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { SiteId, Stand, Contact, Transaction, Campaign, Task } from './types';
import { 
  initialStands, 
  initialContacts, 
  initialTransactions, 
  initialCampaigns, 
  initialTasks 
} from './initialData';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import DashboardView from './components/DashboardView';
import CrmView from './components/CrmView';
import ComptabiliteView from './components/ComptabiliteView';
import MarketingView from './components/MarketingView';
import SettingsView from './components/SettingsView';
import LoginView from './components/LoginView';

// Browser cookie helpers for local session persistence without localStorage
function getCookie(name: string): string | null {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
  return null;
}

function setCookie(name: string, value: string, days = 365) {
  const d = new Date();
  d.setTime(d.getTime() + (days * 24 * 60 * 60 * 1000));
  const expires = `expires=${d.toUTCString()}`;
  document.cookie = `${name}=${value};${expires};path=/;SameSite=Lax`;
}

function eraseCookie(name: string) {
  document.cookie = `${name}=; Max-Age=-99999999;path=/;SameSite=Lax`;
}

export default function App() {
  // Global site context switcher, defaulting to R2H consolidator in Moroccan workspace
  const [selectedSite, setSelectedSite] = useState<SiteId>('r2h');
  
  // Authentication status with cookie session persistence (excluding localStorage)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return getCookie('r2h_portal_authenticated') === 'true';
  });

  const handleLoginSuccess = (adminName: string) => {
    setIsAuthenticated(true);
    setCookie('r2h_portal_authenticated', 'true');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    eraseCookie('r2h_portal_authenticated');
  };
  
  // Navigation tabs 'dashboard' | 'prospects' | 'clients' | 'devis' | 'factures' | 'stands' | 'marketing' | 'parametres'
  const [currentTab, setCurrentTab] = useState<string>('dashboard');

  // Database states
  const [stands, setStands] = useState<Stand[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);

  // MongoDB Database sync states
  const [dbStatus, setDbStatus] = useState<{ isConfigured: boolean; dbInitialized: boolean; error: string | null; maskedUrl: string | null } | null>(null);
  const [isInitiallyLoaded, setIsInitiallyLoaded] = useState<boolean>(false);

  // Load connection status and hydrate data from master MongoDB database or static memory sandbox
  useEffect(() => {
    async function loadInitialData() {
      try {
        const statusResp = await fetch('/api/db/status');
        const status = await statusResp.json();
        setDbStatus(status);

        if (status.isConfigured) {
          console.log('[MongoDB Sync] Database is configured. Executing load...');
          const loadResp = await fetch('/api/db/load');
          const result = await loadResp.json();
          
          if (result.success && result.data) {
            console.log('[MongoDB Sync] Loaded data successfully from MongoDB database.');
            const { stands: dbS, contacts: dbC, transactions: dbT, campaigns: dbM, tasks: dbK } = result.data;
            setStands(dbS);
            setContacts(dbC);
            setTransactions(dbT);
            setCampaigns(dbM);
            setTasks(dbK);
            
            setIsInitiallyLoaded(true);
            return;
          } else {
            console.warn('[MongoDB Sync] Collections load failed, falling back to static sandbox state:', result.error);
          }
        } else {
          console.log('[MongoDB Sync] Database not configured. Running default static sandbox memory mode.');
        }
      } catch (err) {
        console.error('[MongoDB Sync] Failed to communicate with database API:', err);
      }

      // Memory sandboxing fallback (No localStorage)
      setStands(initialStands);
      setContacts(initialContacts);
      setTransactions(initialTransactions);
      setCampaigns(initialCampaigns);
      setTasks(initialTasks);

      setIsInitiallyLoaded(true);
    }

    loadInitialData();
  }, []);

  // Sync state snapshot to MongoDB if active
  const saveToMongoDB = async (
    currentStands: Stand[],
    currentContacts: Contact[],
    currentTransactions: Transaction[],
    currentCampaigns: Campaign[],
    currentTasks: Task[]
  ) => {
    try {
      if (!dbStatus?.isConfigured) return;
      await fetch('/api/db/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stands: currentStands,
          contacts: currentContacts,
          transactions: currentTransactions,
          campaigns: currentCampaigns,
          tasks: currentTasks
        })
      });
    } catch (err) {
      console.error('[MongoDB Sync] Auto-save database fail:', err);
    }
  };

  // Synchronise state changes to MongoDB database without any LocalStorage
  useEffect(() => {
    if (!isInitiallyLoaded) return;
    if (stands.length > 0) {
      saveToMongoDB(stands, contacts, transactions, campaigns, tasks);
    }
  }, [stands, isInitiallyLoaded]);

  useEffect(() => {
    if (!isInitiallyLoaded) return;
    if (contacts.length > 0) {
      saveToMongoDB(stands, contacts, transactions, campaigns, tasks);
    }
  }, [contacts, isInitiallyLoaded]);

  useEffect(() => {
    if (!isInitiallyLoaded) return;
    if (transactions.length > 0) {
      saveToMongoDB(stands, contacts, transactions, campaigns, tasks);
    }
  }, [transactions, isInitiallyLoaded]);

  useEffect(() => {
    if (!isInitiallyLoaded) return;
    if (campaigns.length > 0) {
      saveToMongoDB(stands, contacts, transactions, campaigns, tasks);
    }
  }, [campaigns, isInitiallyLoaded]);

  useEffect(() => {
    if (!isInitiallyLoaded) return;
    if (tasks.length > 0) {
      saveToMongoDB(stands, contacts, transactions, campaigns, tasks);
    }
  }, [tasks, isInitiallyLoaded]);


  // Decouple tabs naming header
  const getHeaderTitle = () => {
    switch(currentTab) {
      case 'dashboard': return "Tableau de bord Général";
      case 'prospects': return "Suivi CRM — Prospects Event";
      case 'clients': return "Suivi CRM — Exposants officiels";
      case 'devis': return "Gestion de Devis Émis";
      case 'factures': return "Transactions & Facturation R2H";
      case 'stands': return "Plan d'Exposition Interactif";
      case 'marketing': return "Emailing IA — Copie Gemini";
      case 'parametres': return "Configuration Back-Office";
      default: return "R2H Communication Portal";
    }
  };

  // Switch context of CrmView for tab shortcuts
  const renderTabContent = () => {
    switch(currentTab) {
      case 'dashboard':
      case 'stands': // Stands links maps directly to Dashboard displaying the 2D layout map
        return (
          <DashboardView 
            selectedSite={selectedSite}
            stands={stands}
            setStands={setStands}
            contacts={contacts}
            transactions={transactions}
            tasks={tasks}
            setTasks={setTasks}
            setCurrentTab={setCurrentTab}
          />
        );
      case 'prospects':
        return (
          <CrmView 
            selectedSite={selectedSite}
            contacts={contacts}
            setContacts={setContacts}
            stands={stands}
            transactions={transactions}
            setTransactions={setTransactions}
            setCurrentTab={setCurrentTab}
          />
        );
      case 'clients':
        return (
          <CrmView 
            selectedSite={selectedSite}
            contacts={contacts}
            setContacts={setContacts}
            stands={stands}
            transactions={transactions}
            setTransactions={setTransactions}
            setCurrentTab={setCurrentTab}
          />
        );
      case 'devis':
        return (
          <ComptabiliteView 
            selectedSite={selectedSite}
            transactions={transactions}
            setTransactions={setTransactions}
            currentSubTab="devis"
          />
        );
      case 'factures':
        return (
          <ComptabiliteView 
            selectedSite={selectedSite}
            transactions={transactions}
            setTransactions={setTransactions}
            currentSubTab="factures"
          />
        );
      case 'marketing':
        return (
          <MarketingView 
            selectedSite={selectedSite}
            campaigns={campaigns}
            setCampaigns={setCampaigns}
          />
        );
      case 'parametres':
        return (
          <SettingsView 
            selectedSite={selectedSite}
            dbStatus={dbStatus}
          />
        );
      default:
        return (
          <div className="flex-1 flex items-center justify-center p-6 text-slate-400 font-sans">
            Onglet en cours de maintenance technique.
          </div>
        );
    }
  };

  if (!isAuthenticated) {
    return <LoginView onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div id="root-portal-view" className="h-screen w-screen bg-[#F8F7F2] text-[#2D2D2D] flex overflow-hidden font-sans">
      
      {/* Sidebar Navigation Panel */}
      <Sidebar 
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        selectedSite={selectedSite}
        onLogout={handleLogout}
      />

      {/* Primary Workspace viewport */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        
        {/* Dynamic Context Header */}
        <Header 
          selectedSite={selectedSite}
          setSelectedSite={setSelectedSite}
          title={getHeaderTitle()}
        />

        {/* Dynamic active sub-view */}
        <main className="flex-1 flex flex-col overflow-hidden">
          {renderTabContent()}
        </main>

      </div>

    </div>
  );
}
