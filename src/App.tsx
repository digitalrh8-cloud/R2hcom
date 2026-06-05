/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { SiteId, SiteConfig, Stand, Contact, Transaction, Campaign, Task } from './types';
import { 
  initialSites,
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
  // Global sites list
  const [sites, setSites] = useState<SiteConfig[]>(() => {
    const saved = getCookie('r2h_portal_sites');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Error parsing sites cookie:', e);
      }
    }
    return initialSites;
  });

  // Global site context switcher, defaulting to R2H consolidator in Moroccan workspace
  const [selectedSite, setSelectedSite] = useState<SiteId>('r2h');
  
  // Authentication status with cookie session persistence (excluding localStorage)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return getCookie('r2h_portal_authenticated') === 'true';
  });

  const [currentUser, setCurrentUser] = useState<{name: string, role: string, title: string, avatarUrl: string, permissions?: any}>(() => {
    let perms = null;
    const cookiePerms = getCookie('r2h_portal_user_perms');
    if (cookiePerms) {
      try {
        perms = JSON.parse(cookiePerms);
      } catch (e) {
        console.error('Error parsing perms cookie:', e);
      }
    }
    return {
      name: getCookie('r2h_portal_user_name') || 'Mehdi Rahho',
      role: getCookie('r2h_portal_user_role') || 'admin',
      title: getCookie('r2h_portal_user_title') || 'Directeur Général',
      avatarUrl: getCookie('r2h_portal_user_avatar') || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200',
      permissions: perms || {
        canViewDashboard: true,
        canManageLeads: true,
        canViewDevis: true,
        canViewFactures: true,
        canViewMarketing: true,
        canManageStands: true,
        canViewSettings: true
      }
    };
  });

  const handleLoginSuccess = (adminName: string, role: string, title: string, avatarUrl: string, permissions?: any) => {
    setIsAuthenticated(true);
    setCookie('r2h_portal_authenticated', 'true');
    setCookie('r2h_portal_user_name', adminName);
    setCookie('r2h_portal_user_role', role);
    setCookie('r2h_portal_user_title', title);
    setCookie('r2h_portal_user_avatar', avatarUrl);
    
    const finalPerms = permissions || (role === 'admin' ? {
      canViewDashboard: true,
      canManageLeads: true,
      canViewDevis: true,
      canViewFactures: true,
      canViewMarketing: true,
      canManageStands: true,
      canViewSettings: true
    } : {
      canViewDashboard: true,
      canManageLeads: true,
      canViewDevis: false,
      canViewFactures: false,
      canViewMarketing: true,
      canManageStands: true,
      canViewSettings: false
    });

    setCookie('r2h_portal_user_perms', JSON.stringify(finalPerms));

    setCurrentUser({
      name: adminName,
      role: role,
      title: title,
      avatarUrl: avatarUrl,
      permissions: finalPerms
    });
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    eraseCookie('r2h_portal_authenticated');
    eraseCookie('r2h_portal_user_name');
    eraseCookie('r2h_portal_user_role');
    eraseCookie('r2h_portal_user_title');
    eraseCookie('r2h_portal_user_avatar');
    eraseCookie('r2h_portal_user_perms');
    setCurrentTab('dashboard');
  };
  
  // Navigation tabs 'dashboard' | 'prospects' | 'clients' | 'devis' | 'factures' | 'stands' | 'marketing' | 'parametres'
  const [currentTab, setCurrentTab] = useState<string>('dashboard');

  // Mobile sidebar visibility toggle drawer
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);

  // Database states
  const [stands, setStands] = useState<Stand[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);

  // Database sync states
  const [dbStatus, setDbStatus] = useState<{ isConfigured: boolean; dbInitialized: boolean; error: string | null; maskedUrl: string | null } | null>(null);
  const [isInitiallyLoaded, setIsInitiallyLoaded] = useState<boolean>(false);

  // Load connection status and hydrate data from PostgreSQL database or static memory sandbox
  useEffect(() => {
    async function loadInitialData() {
      try {
        const statusResp = await fetch('/api/db/status');
        const status = await statusResp.json();
        setDbStatus(status);

        if (status.isConfigured) {
          console.log('[Database Sync] Database is configured. Executing load...');
          const loadResp = await fetch('/api/db/load');
          const result = await loadResp.json();
          
          if (result.success && result.data) {
            console.log('[Database Sync] Loaded data successfully from database.');
            const { stands: dbS, contacts: dbC, transactions: dbT, campaigns: dbM, tasks: dbK } = result.data;
            setStands(dbS);
            setContacts(dbC);
            setTransactions(dbT);
            setCampaigns(dbM);
            setTasks(dbK);
            
            setIsInitiallyLoaded(true);
            return;
          } else {
            console.warn('[Database Sync] Collections load failed, falling back to static sandbox state:', result.error);
          }
        } else {
          console.log('[Database Sync] Database not configured. Running default static sandbox memory mode.');
        }
      } catch (err) {
        console.error('[Database Sync] Failed to communicate with database API:', err);
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

  // Function to manually trigger database state refresh on demand
  const refreshDbState = async (): Promise<void> => {
    try {
      const statusResp = await fetch('/api/db/status');
      const status = await statusResp.json();
      setDbStatus(status);

      if (status.isConfigured) {
        const loadResp = await fetch('/api/db/load');
        const result = await loadResp.json();
        
        if (result.success && result.data) {
          const { stands: dbS, contacts: dbC, transactions: dbT, campaigns: dbM, tasks: dbK } = result.data;
          setStands(dbS);
          setContacts(dbC);
          setTransactions(dbT);
          setCampaigns(dbM);
          setTasks(dbK);
        }
      }
    } catch (err) {
      console.error('[Database Manual Refresh] Error refreshing DB state:', err);
    }
  };

  // Sync state snapshot to database if active
  const saveToDatabase = async (
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
      console.error('[Database Sync] Auto-save database fail:', err);
    }
  };

  // Synchronise state changes to database without any LocalStorage
  useEffect(() => {
    if (!isInitiallyLoaded) return;
    saveToDatabase(stands, contacts, transactions, campaigns, tasks);
  }, [stands, contacts, transactions, campaigns, tasks, isInitiallyLoaded]);


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
            setContacts={setContacts}
            transactions={transactions}
            tasks={tasks}
            setTasks={setTasks}
            setCurrentTab={setCurrentTab}
            sites={sites}
          />
        );
      case 'prospects':
        return (
          <CrmView 
            selectedSite={selectedSite}
            contacts={contacts}
            setContacts={setContacts}
            stands={stands}
            setStands={setStands}
            transactions={transactions}
            setTransactions={setTransactions}
            setCurrentTab={setCurrentTab}
            sites={sites}
          />
        );
      case 'clients':
        return (
          <CrmView 
            selectedSite={selectedSite}
            contacts={contacts}
            setContacts={setContacts}
            stands={stands}
            setStands={setStands}
            transactions={transactions}
            setTransactions={setTransactions}
            setCurrentTab={setCurrentTab}
            sites={sites}
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
            refreshDbState={refreshDbState}
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
    <div id="root-portal-view" className="h-screen w-screen bg-[#F8F7F2] text-[#2D2D2D] flex overflow-hidden font-sans relative">
      
      {/* Mobile backdrop slide overlay */}
      {isMobileSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-xs z-40 lg:hidden transition-all duration-300"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      {/* Sidebar Navigation Panel */}
      <Sidebar 
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        selectedSite={selectedSite}
        onLogout={handleLogout}
        isMobileOpen={isMobileSidebarOpen}
        onClose={() => setIsMobileSidebarOpen(false)}
        currentUser={currentUser}
      />

      {/* Primary Workspace viewport */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        
        {/* Dynamic Context Header */}
        <Header 
          selectedSite={selectedSite}
          setSelectedSite={setSelectedSite}
          title={getHeaderTitle()}
          onMenuToggle={() => setIsMobileSidebarOpen(true)}
          sites={sites}
          onAddSite={(newSite, numStandsToCreate) => {
            const updatedSites = [...sites, newSite];
            setSites(updatedSites);
            setCookie('r2h_portal_sites', JSON.stringify(updatedSites));
            
            // Add custom stands for the newly created salon
            const newStands: Stand[] = [];
            for (let i = 1; i <= numStandsToCreate; i++) {
              const numStr = `S-${i < 10 ? '0' + i : i}`;
              // Alternating properties
              const area = i % 3 === 0 ? 36 : i % 2 === 0 ? 18 : 9;
              newStands.push({
                id: `${newSite.id}-${numStr.toLowerCase()}`,
                site: newSite.id,
                num: numStr,
                hall: 'Hall Principal',
                area: area,
                pricePerM2: 2500,
                status: 'disponible'
              });
            }
            setStands(prev => [...prev, ...newStands]);
            setSelectedSite(newSite.id);
          }}
        />

        {/* Dynamic active sub-view */}
        <main className="flex-1 flex flex-col overflow-hidden">
          {renderTabContent()}
        </main>

      </div>

    </div>
  );
}
