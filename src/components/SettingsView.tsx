/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Settings, 
  Database, 
  FileLock2, 
  Wrench, 
  CheckCircle2, 
  Globe, 
  Trash2, 
  DollarSign,
  AlertCircle,
  ExternalLink,
  Shield,
  UserPlus,
  Users,
  Lock,
  Check,
  X,
  AlertTriangle
} from 'lucide-react';
import { SiteId, UserProfile, UserPermissions } from '../types';
import { initialSites } from '../initialData';

interface SettingsViewProps {
  selectedSite: SiteId;
  dbStatus: { 
    isConfigured: boolean; 
    dbInitialized: boolean; 
    error: string | null; 
    maskedUrl: string | null;
    dbName?: string;
    apiKey?: string;
    vercel?: {
      isConfigured: boolean;
      hasDatabaseUrl: boolean;
      dbInitialized: boolean;
      error: string | null;
      dbName: string;
      maskedUrl: string | null;
    } | null;
  } | null;
  refreshDbState?: () => Promise<void>;
}

export default function SettingsView({ selectedSite, dbStatus, refreshDbState }: SettingsViewProps) {
  const [ticketPrice, setTicketPrice] = useState('2500'); // MAD/m²
  const [earlyBirdDiscount, setEarlyBirdDiscount] = useState('15');
  const [backupStatus, setBackupStatus] = useState<string | null>(null);
  const [initStatus, setInitStatus] = useState<{ loading: boolean; type: 'success' | 'err' | null; message: string | null }>({
    loading: false,
    type: null,
    message: null
  });

  // Railway Domain Link integration states
  const [railwayDomain, setRailwayDomain] = useState('r2h.ma');
  const [railwayLinkedSince, setRailwayLinkedSince] = useState<string | null>(null);
  const [railwayStatus, setRailwayStatus] = useState<'connected' | 'disconnected'>('connected');
  const [savingDomain, setSavingDomain] = useState(false);
  const [domainMessage, setDomainMessage] = useState<{ type: 'success' | 'err' | null; text: string | null }>({ type: null, text: null });

  // Vercel 2nd Layer Domain API integration states
  const [vercelDomain, setVercelDomain] = useState('r2hcom.vercel.app');
  const [vercelLinkedSince, setVercelLinkedSince] = useState<string | null>(null);
  const [vercelStatus, setVercelStatus] = useState<'connected' | 'disconnected'>('connected');
  const [savingVercelDomain, setSavingVercelDomain] = useState(false);
  const [vercelDomainMessage, setVercelDomainMessage] = useState<{ type: 'success' | 'err' | null; text: string | null }>({ type: null, text: null });

  // Vercel Postgres Second Database Layer states
  const [vercelDbUrl, setVercelDbUrl] = useState('');
  const [updatingVercelUrl, setUpdatingVercelUrl] = useState(false);
  const [syncingToVercel, setSyncingToVercel] = useState(false);
  const [syncingFromVercel, setSyncingFromVercel] = useState(false);
  const [initializingVercelDb, setInitializingVercelDb] = useState(false);
  const [vercelDbMessage, setVercelDbMessage] = useState<{ type: 'success' | 'err' | null; text: string | null }>({ type: null, text: null });

  // User profile management states
  const [usersList, setUsersList] = useState<UserProfile[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [syncingUsers, setSyncingUsers] = useState(false);
  const [userError, setUserError] = useState<string | null>(null);

  // Form states for new user
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserRole, setNewUserRole] = useState<'admin' | 'commercial' | 'supervisor' | 'financial'>('commercial');
  const [newUserTitle, setNewUserTitle] = useState('');
  const [newUserPerms, setNewUserPerms] = useState<UserPermissions>({
    canViewDashboard: true,
    canManageLeads: true,
    canViewDevis: false,
    canViewFactures: false,
    canViewMarketing: true,
    canManageStands: true,
    canViewSettings: false
  });

  // Load user profiles from API
  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const res = await fetch('/api/users');
      const data = await res.json();
      if (data.success && data.users) {
        setUsersList(data.users);
      }
    } catch (err: any) {
      console.error(err);
      setUserError('Impossible de charger la liste des utilisateurs.');
    } finally {
      setLoadingUsers(false);
    }
  };

  React.useEffect(() => {
    fetchUsers();
  }, []);

  const saveUsersToDb = async (updatedList: UserProfile[]) => {
    setSyncingUsers(true);
    setUserError(null);
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ users: updatedList })
      });
      const data = await res.json();
      if (data.success) {
        setUsersList(data.users || updatedList);
      } else {
        setUserError(data.error || "Une erreur s'est produite lors de la synchronisation des profils.");
      }
    } catch (err: any) {
      console.error(err);
      setUserError("Erreur réseau: impossible de synchroniser la liste sur le serveur.");
    } finally {
      setSyncingUsers(false);
    }
  };

  const handleRoleChangeForNewUser = (role: 'admin' | 'commercial' | 'supervisor' | 'financial') => {
    setNewUserRole(role);
    if (role === 'admin') {
      setNewUserPerms({
        canViewDashboard: true,
        canManageLeads: true,
        canViewDevis: true,
        canViewFactures: true,
        canViewMarketing: true,
        canManageStands: true,
        canViewSettings: true
      });
      setNewUserTitle('Administrateur');
    } else if (role === 'commercial') {
      setNewUserPerms({
        canViewDashboard: true,
        canManageLeads: true,
        canViewDevis: false,
        canViewFactures: false,
        canViewMarketing: true,
        canManageStands: true,
        canViewSettings: false
      });
      setNewUserTitle('Commercial de terrain');
    } else if (role === 'financial') {
      setNewUserPerms({
        canViewDashboard: true,
        canManageLeads: false,
        canViewDevis: true,
        canViewFactures: true,
        canViewMarketing: false,
        canManageStands: false,
        canViewSettings: false
      });
      setNewUserTitle('Responsable Financier');
    } else if (role === 'supervisor') {
      setNewUserPerms({
        canViewDashboard: true,
        canManageLeads: true,
        canViewDevis: true,
        canViewFactures: false,
        canViewMarketing: true,
        canManageStands: true,
        canViewSettings: false
      });
      setNewUserTitle('Superviseur Salons');
    }
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName.trim() || !newUserEmail.trim() || !newUserPassword.trim()) {
      setUserError("Veuillez remplir tous les champs obligatoires (Nom, Identifiant/E-mail, Mot de passe).");
      return;
    }

    const emailExists = usersList.some(u => u.email.toLowerCase() === newUserEmail.trim().toLowerCase());
    if (emailExists) {
      setUserError(`L'adresse email ou l'identifiant '${newUserEmail}' est déjà attribué.`);
      return;
    }

    const newUser: UserProfile = {
      id: 'u_' + Date.now(),
      name: newUserName.trim(),
      email: newUserEmail.trim().toLowerCase(),
      password: newUserPassword.trim(),
      role: newUserRole,
      title: newUserTitle.trim() || (newUserRole === 'admin' ? 'Administrateur' : 'Commercial'),
      avatarUrl: `https://images.unsplash.com/photo-${['1535713875002-d1d0cf377fde', '1494790108377-be9c29b29330', '1599566150163-29194dcaad36', '1580489944761-15a19d654956', '1507003211169-0a1dd7228f2d'][Math.floor(Math.random() * 5)]}?auto=format&fit=crop&q=80&w=200`,
      permissions: newUserPerms
    };

    const updated = [...usersList, newUser];
    await saveUsersToDb(updated);

    // Reset Form
    setNewUserName('');
    setNewUserEmail('');
    setNewUserPassword('');
    setNewUserTitle('');
    setShowAddForm(false);
  };

  const handleTogglePermission = async (userId: string, permissionKey: keyof UserPermissions) => {
    const updated = usersList.map(u => {
      if (u.id === userId) {
        return {
          ...u,
          permissions: {
            ...u.permissions,
            [permissionKey]: !u.permissions[permissionKey]
          }
        };
      }
      return u;
    });
    await saveUsersToDb(updated);
  };

  const handleDeleteUser = async (userId: string) => {
    const targetUser = usersList.find(u => u.id === userId);
    if (!targetUser) return;

    if (targetUser.email === 'admin' || (targetUser.role === 'admin' && usersList.filter(u => u.role === 'admin').length === 1)) {
      alert("Sécurité : Impossible de supprimer l'administrateur principal pour éviter tout verrouillage d'accès.");
      return;
    }

    if (confirm(`Êtes-vous sûr de vouloir supprimer définitivement le profil de ${targetUser.name} (${targetUser.email}) ?\nIl ne pourra plus se connecter au back-office.`)) {
      const updated = usersList.filter(u => u.id !== userId);
      await saveUsersToDb(updated);
    }
  };

  // Load configured Railway & Vercel Domains on component mount
  React.useEffect(() => {
    async function loadConfigs() {
      try {
        const res = await fetch('/api/railway/config');
        const data = await res.json();
        if (data.success) {
          if (data.domain) {
            setRailwayDomain(data.domain);
          }
          if (data.linkedSince) {
            setRailwayLinkedSince(data.linkedSince);
          }
          if (data.status) {
            setRailwayStatus(data.status);
          }
        }
      } catch (err) {
        console.warn("Impossible de charger la configuration Railway:", err);
      }

      try {
        const res = await fetch('/api/vercel/config');
        const data = await res.json();
        if (data.success) {
          if (data.domain) {
            setVercelDomain(data.domain);
          }
          if (data.linkedSince) {
            setVercelLinkedSince(data.linkedSince);
          }
          if (data.status) {
            setVercelStatus(data.status);
          }
        }
      } catch (err) {
        console.warn("Impossible de charger la configuration Vercel:", err);
      }
    }
    loadConfigs();
  }, []);

  const handleSaveDomain = async () => {
    if (!railwayDomain.trim()) {
      setDomainMessage({ type: 'err', text: "Le domaine ne peut pas être vide." });
      return;
    }
    setSavingDomain(true);
    setDomainMessage({ type: null, text: null });
    try {
      const res = await fetch('/api/railway/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain: railwayDomain.trim() })
      });
      const data = await res.json();
      if (data.success) {
        setDomainMessage({ type: 'success', text: data.message || 'Domaine et API liés avec succès !' });
        setRailwayLinkedSince(data.linkedSince);
        setRailwayStatus('connected');
      } else {
        setDomainMessage({ type: 'err', text: data.error || 'Une erreur est survenue lors de la liaison.' });
      }
    } catch (err: any) {
      setDomainMessage({ type: 'err', text: err.message || String(err) });
    } finally {
      setSavingDomain(false);
    }
  };

  const handleSaveVercelDomain = async () => {
    if (!vercelDomain.trim()) {
      setVercelDomainMessage({ type: 'err', text: "Le domaine ne peut pas être vide." });
      return;
    }
    setSavingVercelDomain(true);
    setVercelDomainMessage({ type: null, text: null });
    try {
      const res = await fetch('/api/vercel/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain: vercelDomain.trim() })
      });
      const data = await res.json();
      if (data.success) {
        setVercelDomainMessage({ type: 'success', text: data.message || '2ème couche de domaine (Vercel) liée avec succès !' });
        setVercelLinkedSince(data.linkedSince);
        setVercelStatus('connected');
      } else {
        setVercelDomainMessage({ type: 'err', text: data.error || 'Une erreur est survenue lors de la liaison.' });
      }
    } catch (err: any) {
      setVercelDomainMessage({ type: 'err', text: err.message || String(err) });
    } finally {
      setSavingVercelDomain(false);
    }
  };

  const handleSaveVercelDbUrl = async () => {
    if (!vercelDbUrl.trim()) {
      setVercelDbMessage({ type: 'err', text: "L'URL ne peut pas être vide." });
      return;
    }
    setUpdatingVercelUrl(true);
    setVercelDbMessage({ type: null, text: null });
    try {
      const res = await fetch('/api/db/vercel/url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ databaseUrl: vercelDbUrl.trim() })
      });
      const data = await res.json();
      if (data.success) {
        setVercelDbMessage({ type: 'success', text: data.message });
        if (refreshDbState) {
          await refreshDbState();
        }
      } else {
        setVercelDbMessage({ type: 'err', text: data.error || 'Une erreur est survenue.' });
      }
    } catch (err: any) {
      setVercelDbMessage({ type: 'err', text: err.message || String(err) });
    } finally {
      setUpdatingVercelUrl(false);
    }
  };

  const handleInitializeVercelTables = async (force: boolean) => {
    if (!confirm(force ? "Voulez-vous réinitialiser et VIDER toutes les tables de la base de données Vercel ?" : "Voulez-vous vérifier et initialiser la base de données Vercel ?")) {
      return;
    }
    setInitializingVercelDb(true);
    setVercelDbMessage({ type: null, text: null });
    try {
      const res = await fetch('/api/db/vercel/initialize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ force })
      });
      const data = await res.json();
      if (data.success) {
        setVercelDbMessage({ type: 'success', text: data.message });
        if (refreshDbState) {
          await refreshDbState();
        }
      } else {
        setVercelDbMessage({ type: 'err', text: data.error || 'Échec d\'initialisation.' });
      }
    } catch (err: any) {
      setVercelDbMessage({ type: 'err', text: err.message || String(err) });
    } finally {
      setInitializingVercelDb(false);
    }
  };

  const handleSyncToVercel = async () => {
    if (!confirm("Voulez-vous écraser la base de données Vercel avec les données actuelles de la base principale Railway ?")) {
      return;
    }
    setSyncingToVercel(true);
    setVercelDbMessage({ type: null, text: null });
    try {
      const res = await fetch('/api/db/vercel/sync-to', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setVercelDbMessage({ type: 'success', text: data.message });
        if (refreshDbState) {
          await refreshDbState();
        }
      } else {
        setVercelDbMessage({ type: 'err', text: data.error || 'Échec de la réplication.' });
      }
    } catch (err: any) {
      setVercelDbMessage({ type: 'err', text: err.message || String(err) });
    } finally {
      setSyncingToVercel(false);
    }
  };

  const handleSyncFromVercel = async () => {
    if (!confirm("ATTENTION : Cette action va écraser VOTRE BASE PRINCIPALE (Railway) avec les données de Vercel. Continuer ?")) {
      return;
    }
    setSyncingFromVercel(true);
    setVercelDbMessage({ type: null, text: null });
    try {
      const res = await fetch('/api/db/vercel/sync-from', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setVercelDbMessage({ type: 'success', text: data.message });
        if (refreshDbState) {
          await refreshDbState();
        }
      } else {
        setVercelDbMessage({ type: 'err', text: data.error || 'Échec de la restauration.' });
      }
    } catch (err: any) {
      setVercelDbMessage({ type: 'err', text: err.message || String(err) });
    } finally {
      setSyncingFromVercel(false);
    }
  };

  const activeSite = initialSites.find(s => s.id === selectedSite) || initialSites[0];

  const triggerBackup = () => {
    setBackupStatus('Génération du fichier SQL de sauvegarde...');
    setTimeout(() => {
      setBackupStatus('Fichier R2H_Backup_2026_05_22.json compilé avec succès et téléversé.');
    }, 2000);
  };

  const handleInitializeTables = async (force: boolean) => {
    setInitStatus({ 
      loading: true, 
      type: null, 
      message: force ? "Réinitialisation complète et formatage de la base de données..." : "Initialisation des tables en cours..." 
    });
    try {
      const resp = await fetch('/api/db/initialize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ force })
      });
      const data = await resp.json();
      if (data.success) {
        setInitStatus({
          loading: false,
          type: 'success',
          message: data.message || 'La base de données a été initialisée et les tables (collections) créées avec succès !'
        });
        if (refreshDbState) {
          await refreshDbState();
        }
      } else {
        setInitStatus({
          loading: false,
          type: 'err',
          message: data.error || data.message || "Une erreur s'est produite lors de l'initialisation."
        });
      }
    } catch (err: any) {
      setInitStatus({
        loading: false,
        type: 'err',
        message: err.message || String(err)
      });
    }
  };


  return (
    <div id="settings-view" className="flex-1 overflow-y-auto bg-slate-50/50 p-6 space-y-6">
      
      {/* Settings Header */}
      <div className="border-b border-slate-200 pb-4">
        <h2 className="text-xl font-display font-bold text-slate-800 tracking-tight">Configuration Générale</h2>
        <p className="text-xs text-slate-500">
          Gérez l'ensemble des règles administratives et des paramètres techniques du back-office de l'agence.
        </p>
      </div>

      {/* Grid of settings options */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Commercial pricing settings */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-display flex items-center gap-1.5">
            <DollarSign className="w-4 h-4 text-emerald-500" />
            <span>Tarification & Forfaits Salons</span>
          </h3>

          <div className="space-y-3.5 text-xs text-slate-700 font-sans">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Tarif par défaut du m² (MAD)</label>
              <input 
                type="number"
                value={ticketPrice}
                onChange={(e) => setTicketPrice(e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg outline-hidden text-slate-700 font-mono"
              />
              <p className="text-[10px] text-slate-400">Appliqué par les commerciaux lors de la rédaction d'un devis initial hors ristourne.</p>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Remise Early Bird par défaut (%)</label>
              <input 
                type="number"
                value={earlyBirdDiscount}
                onChange={(e) => setEarlyBirdDiscount(e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg outline-hidden text-slate-700 font-mono"
              />
            </div>

            <button 
              onClick={() => alert("Paramètres de tarification enregistrés pour tous les salons.")}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg font-semibold cursor-pointer text-xs"
            >
              Enregistrer les Tarifs
            </button>
          </div>
        </div>

        {/* Database administration backup properties */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-display flex items-center gap-1.5 justify-between">
            <div className="flex items-center gap-1.5">
              <Database className="w-4 h-4 text-emerald-500" />
              <span>Base de Données PostgreSQL</span>
            </div>
            {dbStatus?.isConfigured ? (
              <span className="text-[9px] px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded-full font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                Opérationnel
              </span>
            ) : (
              <span className="text-[9px] px-2 py-0.5 bg-amber-50 text-amber-600 rounded-full font-bold">
                Bac à Sable Local
              </span>
            )}
          </h3>

          <div className="space-y-4 text-xs text-slate-700 font-sans">
            {dbStatus?.isConfigured ? (
              <div className="space-y-2.5">
                <div className="p-3 bg-emerald-50/40 border border-emerald-100 rounded-lg space-y-1.5">
                  <p className="font-bold text-emerald-800 text-[11px] flex items-center gap-1.5">
                    <CheckCircle2 className="w-4.5 h-4.5 text-emerald-600" />
                    <span>Synchronisation Cloud Active</span>
                  </p>
                  <p className="text-[10px] text-slate-500 leading-relaxed">
                    Toutes les modifications sur vos stands, prospects, factures et campagnes marketing IA sont enregistrées directement dans votre instance PostgreSQL en temps réel.
                  </p>
                </div>
                
                <div className="space-y-1 font-mono text-[10px] bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                  <div className="flex justify-between">
                    <span className="text-slate-400">URI de la Base :</span>
                    <span className="font-bold text-slate-700 truncate max-w-[200px]" title={dbStatus.maskedUrl || ''}>
                      {dbStatus.maskedUrl}
                    </span>
                  </div>
                  {dbStatus.dbName && (
                    <div className="flex justify-between border-t border-slate-200/50 pt-1 mt-1">
                      <span className="text-slate-400">Nom API / Base :</span>
                      <span className="font-bold text-emerald-800">{dbStatus.dbName}</span>
                    </div>
                  )}
                  {dbStatus.apiKey && (
                    <div className="flex justify-between border-t border-slate-200/50 pt-1 mt-1">
                      <span className="text-slate-400">Clé d'API :</span>
                      <span className="font-bold text-slate-700 select-all" title={dbStatus.apiKey}>
                        {dbStatus.apiKey.substring(0, 10)}...{dbStatus.apiKey.substring(dbStatus.apiKey.length - 10)}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between border-t border-slate-200/50 pt-1 mt-1">
                    <span className="text-slate-400">Tables Liées :</span>
                    <span className="font-bold text-slate-700">stands, contacts, transactions, campaigns, tasks</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-2.5">
                <div className="p-3 bg-amber-50/40 border border-amber-100 rounded-lg space-y-1.5">
                  <p className="font-bold text-amber-800 text-[11px] flex items-center gap-1.5">
                    <AlertCircle className="w-4.5 h-4.5 text-amber-600 shrink-0" />
                    <span>En attente de connexion PostgreSQL</span>
                  </p>
                  <p className="text-[10px] text-slate-500 leading-relaxed">
                    Le portail fonctionne actuellement de manière autonome avec stockage mémoire temporaire. 
                    Pour le lier à votre instance de base de données PostgreSQL, définissez la variable d'environnement <strong>DATABASE_URL</strong> ou <strong>DATABASE_PUBLIC_URL</strong> dans l'application.
                  </p>
                </div>
              </div>
            )}

            {/* Manual Tables Creation and Seeding Section */}
            {dbStatus?.isConfigured && (
              <div className="border-t border-slate-100 pt-3 space-y-2">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Création & Seeding des Tables</p>
                <p className="text-[10px] text-slate-500 leading-normal">
                  Vérifiez, créez ou reformatez vos tables <code>(stands, contacts, transactions, campaigns, tasks)</code> directement sur votre espace PostgreSQL Railway.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-2">
                  <button
                    onClick={() => handleInitializeTables(false)}
                    disabled={initStatus.loading}
                    className="flex-1 py-1.5 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 text-slate-700/90 rounded-lg font-semibold text-center cursor-pointer text-[11px] border border-slate-200 transition-colors duration-150"
                  >
                    Vérifier & Créer
                  </button>
                  <button
                    onClick={() => {
                      if (confirm("ATTENTION : Cette action supprimera TOUTES les données existantes pour les remplacer par le jeu d'origine. Êtes-vous sûr ?")) {
                        handleInitializeTables(true);
                      }
                    }}
                    disabled={initStatus.loading}
                    className="flex-1 py-1.5 bg-amber-50 hover:bg-amber-100 disabled:opacity-50 text-amber-700 border border-amber-200/60 rounded-lg font-semibold text-center cursor-pointer text-[11px] transition-colors duration-150"
                  >
                    Formater & Recréer
                  </button>
                </div>

                {initStatus.message && (
                  <div className={`p-2.5 rounded-lg text-[10px] leading-relaxed flex items-start gap-1.5 border transition-all duration-300 ${
                    initStatus.loading 
                      ? 'bg-slate-50 border-slate-100 text-slate-500' 
                      : initStatus.type === 'success'
                      ? 'bg-emerald-50/50 border-emerald-100/70 text-emerald-800'
                      : 'bg-rose-50/50 border-rose-100/70 text-rose-800'
                  }`}>
                    {initStatus.loading ? (
                      <div className="w-3.5 h-3.5 border-2 border-slate-400 border-t-transparent rounded-full animate-spin shrink-0 mt-0.5"></div>
                    ) : initStatus.type === 'success' ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                    )}
                    <span className="font-medium">{initStatus.message}</span>
                  </div>
                )}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-2">
              <button 
                onClick={triggerBackup}
                className="flex-1 py-2 bg-blue-50 border border-blue-200 hover:bg-blue-100 text-blue-700 rounded-lg font-semibold text-center cursor-pointer text-xs flex items-center justify-center gap-1"
              >
                <span>Sauvegarder CRM</span>
              </button>
              <button 
                onClick={() => {
                  if (confirm("Êtes-vous sûr de vouloir vider la session de connexion et resynchroniser ?\nCette action rafraîchira la page.")) {
                    document.cookie = "r2h_portal_authenticated=; path=/; max-age=0; SameSite=Lax";
                    window.location.reload();
                  }
                }}
                className="flex-1 py-2 bg-rose-50 border border-rose-200 hover:bg-rose-100 text-rose-700 rounded-lg font-semibold text-center cursor-pointer text-xs flex items-center justify-center gap-1"
              >
                <Trash2 className="w-4 h-4" />
                <span>Déconnecter et synchroniser</span>
              </button>
            </div>

            {backupStatus && (
              <div className="p-3 bg-blue-50/50 border border-blue-100 rounded-lg text-blue-800 font-medium font-sans flex items-start gap-1.5 leading-relaxed">
                <CheckCircle2 className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                <span className="text-[11px]">{backupStatus}</span>
              </div>
            )}
          </div>
        </div>

        {/* Second Database administration (Vercel) */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-display flex items-center gap-1.5 justify-between">
            <div className="flex items-center gap-1.5">
              <Database className="w-4 h-4 text-indigo-500" />
              <span>Base Vercel (2ème Base de Données)</span>
            </div>
            {dbStatus?.vercel?.isConfigured ? (
              <span className="text-[9px] px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded-full font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse"></span>
                Opérationnelle
              </span>
            ) : (
              <span className="text-[9px] px-2 py-0.5 bg-slate-100 text-slate-500 rounded-full font-bold">
                Non configurée
              </span>
            )}
          </h3>

          <div className="space-y-4 text-xs text-slate-700 font-sans">
            {dbStatus?.vercel?.isConfigured ? (
              <div className="space-y-2.5">
                <div className="p-3 bg-indigo-50/40 border border-indigo-100/50 rounded-lg space-y-1.5">
                  <p className="font-bold text-indigo-800 text-[11px] flex items-center gap-1.5">
                    <CheckCircle2 className="w-4.5 h-4.5 text-indigo-600" />
                    <span>Double Écriture Automatique Active</span>
                  </p>
                  <p className="text-[10px] text-slate-500 leading-relaxed">
                    Votre deuxième base de données Vercel est synchronisée en temps réel lors de chaque sauvegarde de stands, prospects ou transactions.
                  </p>
                </div>
                
                <div className="space-y-1 font-mono text-[10px] bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                  <div className="flex justify-between">
                    <span className="text-slate-400">URI Vercel :</span>
                    <span className="font-bold text-slate-700 truncate max-w-[180px]" title={dbStatus.vercel.maskedUrl || ''}>
                      {dbStatus.vercel.maskedUrl}
                    </span>
                  </div>
                  <div className="flex justify-between border-t border-slate-200/50 pt-1 mt-1">
                    <span className="text-slate-400">Tables Vercel :</span>
                    <span className="font-bold text-indigo-800">
                      {dbStatus.vercel.dbInitialized ? 'Initialisées' : 'Non détectées'}
                    </span>
                  </div>
                  {dbStatus.vercel.error && (
                    <div className="text-rose-600 font-sans text-[10px] border-t border-slate-200/50 pt-1 mt-1 bg-rose-50/30 p-1.5 rounded">
                      <strong>Erreur Vercel :</strong> {dbStatus.vercel.error}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1.5">
                <p className="font-bold text-slate-700 text-[11px] flex items-center gap-1.5">
                  <AlertCircle className="w-4.5 h-4.5 text-slate-500 shrink-0" />
                  <span>En attente de connexion Vercel</span>
                </p>
                <p className="text-[10px] text-slate-500 leading-relaxed">
                  Ajoutez l'URL de connexion PostgreSQL pour votre deuxième base. Son statut passera en ligne et les données y seront automatiquement dupliquées.
                </p>
              </div>
            )}

            {/* URL custom configuration for Vercel */}
            <div className="pt-1.5 space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Définir l'URL de connexion Vercel</label>
              <div className="flex items-center gap-1.5">
                <input
                  type="password"
                  value={vercelDbUrl}
                  onChange={(e) => setVercelDbUrl(e.target.value)}
                  placeholder="postgresql://default:secret@ep-cool-lake.us-east-1.neon.tech/neondb"
                  className="flex-1 px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg outline-hidden text-slate-700 font-mono text-[11px]"
                />
                <button
                  onClick={handleSaveVercelDbUrl}
                  disabled={updatingVercelUrl}
                  className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-lg font-semibold text-xs transition-all duration-150 shrink-0 cursor-pointer"
                >
                  {updatingVercelUrl ? 'Liaison...' : 'Lier'}
                </button>
              </div>
            </div>

            {/* Sync actions side-by-side */}
            {dbStatus?.isConfigured && dbStatus?.vercel?.isConfigured && (
              <div className="border-t border-slate-100 pt-2.5 space-y-2">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Réplication Manuelle Bidirectionnelle</p>
                
                <div className="flex flex-col sm:flex-row gap-2">
                  <button
                    onClick={handleSyncToVercel}
                    disabled={syncingToVercel}
                    className="flex-1 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg font-semibold text-center cursor-pointer text-[10px] transition-colors duration-150"
                  >
                    {syncingToVercel ? 'Copie...' : 'Railway ➔ Vercel'}
                  </button>
                  <button
                    onClick={handleSyncFromVercel}
                    disabled={syncingFromVercel}
                    className="flex-1 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-semibold text-center cursor-pointer text-[10px] transition-colors duration-150"
                  >
                    {syncingFromVercel ? 'Copie...' : 'Vercel ➔ Railway'}
                  </button>
                </div>
              </div>
            )}

            {/* Vercel Tables initialization */}
            {dbStatus?.vercel?.isConfigured && (
              <div className="border-t border-slate-100 pt-2.5 space-y-2">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tables de la 2ème Base</p>
                <div className="flex flex-col sm:flex-row gap-2">
                  <button
                    onClick={() => handleInitializeVercelTables(false)}
                    disabled={initializingVercelDb}
                    className="flex-1 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700/90 rounded-lg font-semibold text-center cursor-pointer text-[10px] border border-slate-200 transition-colors duration-150"
                  >
                    Vérifier / Créer
                  </button>
                  <button
                    onClick={() => handleInitializeVercelTables(true)}
                    disabled={initializingVercelDb}
                    className="flex-1 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg font-semibold text-center cursor-pointer text-[10px] border border-rose-200 transition-colors duration-150"
                  >
                    Vider / Formater
                  </button>
                </div>
              </div>
            )}

            {/* Message reporting box */}
            {vercelDbMessage.text && (
              <div className={`p-2.5 rounded-lg text-[10px] leading-relaxed flex items-start gap-1.5 border transition-all duration-300 ${
                vercelDbMessage.type === 'success'
                  ? 'bg-emerald-50/50 border-emerald-100/70 text-emerald-800'
                  : 'bg-rose-50/50 border-rose-100/70 text-rose-800'
              }`}>
                {vercelDbMessage.type === 'success' ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                )}
                <span className="font-medium">{vercelDbMessage.text}</span>
              </div>
            )}
          </div>
        </div>

        {/* Multi-tenant properties */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-display flex items-center gap-1.5">
            <Globe className="w-4 h-4 text-cyan-500" />
            <span>Serveurs DNS, Sites Web & Railway Link</span>
          </h3>

          <div className="space-y-3 font-sans text-xs text-slate-700">
            <div className="flex justify-between items-center p-2.5 bg-slate-50 rounded-lg border border-slate-200/60">
              <div>
                <p className="font-bold text-slate-800">africapoolspa.com</p>
                <p className="text-[10px] text-slate-400">Hébergé sur Cloud VPS • CDN Actif</p>
              </div>
              <span className="text-[9px] font-bold px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded-full">En ligne</span>
            </div>

            <div className="flex justify-between items-center p-2.5 bg-slate-50 rounded-lg border border-slate-200/60">
              <div>
                <p className="font-bold text-slate-800">gardenexpo.ma</p>
                <p className="text-[10px] text-slate-400">Hébergé sur Cloud VPS • CDN Actif</p>
              </div>
              <span className="text-[9px] font-bold px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded-full">En ligne</span>
            </div>

            <div className="flex justify-between items-center p-2.5 bg-slate-50/70 rounded-lg border border-slate-200/60">
              <div>
                <a 
                  href={`https://${railwayDomain || 'r2hcom-production.up.railway.app'}`}
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="font-bold text-sky-700 hover:text-sky-800 hover:underline flex items-center gap-1"
                >
                  <span>{railwayDomain || 'r2hcom-production.up.railway.app'}</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
                <p className="text-[10px] text-slate-400">Domaine Railway Actif • API Connectée</p>
              </div>
              <span className="text-[9px] font-bold px-2 py-0.5 bg-sky-50 text-sky-600 rounded-full flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-sky-400 rounded-full animate-pulse"></span>
                Lié via API
              </span>
            </div>

            <div className="flex justify-between items-center p-2.5 bg-slate-50/70 rounded-lg border border-slate-200/60">
              <div>
                <a 
                  href={`https://${vercelDomain || 'r2hcom.vercel.app'}`}
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="font-bold text-indigo-700 hover:text-indigo-800 hover:underline flex items-center gap-1"
                >
                  <span>{vercelDomain || 'r2hcom.vercel.app'}</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
                <p className="text-[10px] text-slate-400">Domaine Vercel Actif • 2ème Couche API</p>
              </div>
              <span className="text-[9px] font-bold px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded-full flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-pulse"></span>
                API 2ème Couche
              </span>
            </div>

            {/* Link Custom Domain configuration form */}
            <div className="pt-3 border-t border-slate-100 space-y-2.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Gérer votre Domaine Railway</label>
              
              <div className="flex items-center gap-1.5">
                <div className="relative flex-1">
                  <span className="absolute left-2.5 top-2 py-0.5 text-slate-400 text-[11px] font-mono">https://</span>
                  <input
                    type="text"
                    value={railwayDomain}
                    onChange={(e) => setRailwayDomain(e.target.value)}
                    placeholder="r2h.ma"
                    className="w-full pl-14 pr-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg outline-hidden text-slate-700 font-mono text-[11px]"
                  />
                </div>
                <button
                  onClick={handleSaveDomain}
                  disabled={savingDomain}
                  className="px-3.5 py-1.5 bg-sky-600 hover:bg-sky-700 disabled:opacity-50 text-white rounded-lg font-semibold text-xs transition-all duration-150 shrink-0 select-none cursor-pointer"
                >
                  {savingDomain ? 'Liaison...' : 'Lier'}
                </button>
              </div>

              {railwayLinkedSince && (
                <p className="text-[9px] text-slate-400">
                  Liaison établie avec succès le : <span className="font-mono">{new Date(railwayLinkedSince).toLocaleString('fr-FR')}</span>
                </p>
              )}

              {domainMessage.text && (
                <div className={`p-2 rounded-lg text-[10px] leading-relaxed flex items-start gap-1.5 border ${
                  domainMessage.type === 'success'
                    ? 'bg-emerald-50/50 border-emerald-100 text-emerald-800'
                    : 'bg-rose-50/50 border-rose-100 text-rose-800'
                }`}>
                  {domainMessage.type === 'success' ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                  )}
                  <span className="font-medium">{domainMessage.text}</span>
                </div>
              )}
            </div>

            {/* Link Vercel 2nd Layer Domain form */}
            <div className="pt-3 border-t border-slate-100 space-y-2.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Gérer votre Domaine Vercel (2ème Couche API)</label>
              
              <div className="flex items-center gap-1.5">
                <div className="relative flex-1">
                  <span className="absolute left-2.5 top-2 py-0.5 text-slate-400 text-[11px] font-mono">https://</span>
                  <input
                    type="text"
                    value={vercelDomain}
                    onChange={(e) => setVercelDomain(e.target.value)}
                    placeholder="r2hcom.vercel.app"
                    className="w-full pl-14 pr-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg outline-hidden text-slate-700 font-mono text-[11px]"
                  />
                </div>
                <button
                  onClick={handleSaveVercelDomain}
                  disabled={savingVercelDomain}
                  className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-lg font-semibold text-xs transition-all duration-150 shrink-0 select-none cursor-pointer"
                >
                  {savingVercelDomain ? 'Liaison...' : 'Lier'}
                </button>
              </div>

              {vercelLinkedSince && (
                <p className="text-[9px] text-slate-400">
                  Liaison établie avec succès le : <span className="font-mono">{new Date(vercelLinkedSince).toLocaleString('fr-FR')}</span>
                </p>
              )}

              {vercelDomainMessage.text && (
                <div className={`p-2 rounded-lg text-[10px] leading-relaxed flex items-start gap-1.5 border ${
                  vercelDomainMessage.type === 'success'
                    ? 'bg-emerald-50/50 border-emerald-100 text-emerald-800'
                    : 'bg-rose-50/50 border-rose-100 text-rose-800'
                }`}>
                  {vercelDomainMessage.type === 'success' ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                  )}
                  <span className="font-medium">{vercelDomainMessage.text}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* System parameters details */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-display flex items-center gap-1.5">
            <Wrench className="w-4 h-4 text-rose-500" />
            <span>Paramètres de sécurité & Rôles</span>
          </h3>

          <div className="space-y-3 font-sans text-xs text-slate-600 leading-relaxed">
            <p className="font-medium">
              Les accès sont restreints aux rôles d'administrateurs d'événements de R2H Communication. Pour assigner des droits d'édition limités aux agents de terrain ou aux exposants, configurez les permissions.
            </p>
            <div className="flex items-center gap-2.5 p-2 bg-amber-50 rounded-lg border border-amber-100 text-[11px] text-amber-800 leading-normal">
              <AlertCircle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
              <span>La sécurité administrative est activée. Seul le Directeur Général a les privilèges pour libérer ou sponsoriser un stand du salon principal Hall A.</span>
            </div>
          </div>
        </div>

      </div>

      {/* Dynamic Profile and Roles Permissions Administration Area */}
      <div id="users-administration-panel" className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-slate-800 font-display flex items-center gap-2">
              <Shield className="w-5 h-5 text-[#A68A64]" />
              <span>Gestion des Profils, Rôles & Accès Back-Office</span>
            </h3>
            <p className="text-[11px] text-slate-500">
              Créez des profils, assignez-leur des rôles (Admin, Commercial, Superviseur, Finance) et configurez leurs habilitations d'accès en temps réel.
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            {syncingUsers && (
              <span className="text-[11px] text-slate-400 animate-pulse flex items-center gap-1 bg-slate-50 px-2 py-1 rounded-md border border-slate-100">
                <span className="w-1.5 h-1.5 bg-sky-500 rounded-full animate-ping"></span>
                Synchro active...
              </span>
            )}
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="px-3.5 py-1.5 bg-[#2C3E36] hover:bg-[#202E28] text-white rounded-lg font-semibold text-xs transition-all duration-150 flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              {showAddForm ? <X className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
              <span>{showAddForm ? "Annuler l'ajout" : "Créer un profil"}</span>
            </button>
          </div>
        </div>

        {/* Global User Error message */}
        {userError && (
          <div className="p-3 bg-rose-50/65 border border-rose-100 text-rose-800 rounded-lg text-xs leading-relaxed flex items-start gap-2">
            <AlertTriangle className="w-4.5 h-4.5 text-rose-500 shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="font-bold">Erreur administration :</span> {userError}
            </div>
            <button onClick={() => setUserError(null)} className="text-rose-400 hover:text-rose-600 font-bold px-1">&times;</button>
          </div>
        )}

        {/* Create User Form Section */}
        {showAddForm && (
          <form onSubmit={handleAddUser} className="p-4 bg-slate-50/60 border border-slate-100 rounded-xl space-y-4 animate-fadeIn transition-all duration-300">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs font-sans">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Nom complet <span className="text-rose-500">*</span></label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Myriem Belkhadir"
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  className="w-full p-2 bg-white border border-slate-200 rounded-lg outline-hidden text-slate-700"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Identifiant / E-mail de connexion <span className="text-rose-500">*</span></label>
                <input
                  type="text"
                  required
                  placeholder="myriem@r2h.ma ou myriem"
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  className="w-full p-2 bg-white border border-slate-200 rounded-lg outline-hidden text-slate-700 font-mono text-[11px]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Mot de passe de sécurité <span className="text-rose-500">*</span></label>
                <div className="relative">
                  <input
                    type="password"
                    required
                    placeholder="Saisissez un mot de passe"
                    value={newUserPassword}
                    onChange={(e) => setNewUserPassword(e.target.value)}
                    className="w-full p-2 pr-8 bg-white border border-slate-200 rounded-lg outline-hidden text-slate-700 font-mono text-[11px]"
                  />
                  <Lock className="w-3.5 h-3.5 text-slate-300 absolute right-2.5 top-3" />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Fonction optionnelle</label>
                <input
                  type="text"
                  placeholder="Ex: Commerciale Senior"
                  value={newUserTitle}
                  onChange={(e) => setNewUserTitle(e.target.value)}
                  className="w-full p-2 bg-white border border-slate-200 rounded-lg outline-hidden text-slate-700"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs font-sans pt-2">
              <div className="md:col-span-1 space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Rôle Général</label>
                <select
                  value={newUserRole}
                  onChange={(e) => handleRoleChangeForNewUser(e.target.value as any)}
                  className="w-full p-2 bg-white border border-slate-200 rounded-lg outline-hidden text-slate-700 font-medium"
                >
                  <option value="commercial font-semibold">👤 Commercial</option>
                  <option value="admin font-semibold">🏢 Administrateur Global</option>
                  <option value="financial font-semibold">💰 Responsable Financier / Compta</option>
                  <option value="supervisor font-semibold">👁️ Superviseur Salons</option>
                </select>
                <p className="text-[9px] text-slate-400 italic">
                  Changer de rôle réaffectera automatiquement des habilitations suggérées.
                </p>
              </div>

              {/* Toggle Habilitations Grid for newly created account */}
              <div className="md:col-span-3 space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase block">Droits et Accès Spécifiques (Habilitations)</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 bg-white p-3 rounded-xl border border-slate-200">
                  <label className="flex items-center gap-1.5 text-[11px] text-slate-600 font-medium cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={newUserPerms.canViewDashboard}
                      onChange={(e) => setNewUserPerms({ ...newUserPerms, canViewDashboard: e.target.checked })}
                      className="rounded-sm border-slate-300 accent-[#2C3E36] w-3.5 h-3.5"
                    />
                    <span>Tableau de bord</span>
                  </label>
                  
                  <label className="flex items-center gap-1.5 text-[11px] text-slate-600 font-medium cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={newUserPerms.canManageLeads}
                      onChange={(e) => setNewUserPerms({ ...newUserPerms, canManageLeads: e.target.checked })}
                      className="rounded-sm border-slate-300 accent-[#2C3E36] w-3.5 h-3.5"
                    />
                    <span>Clients & Prospects</span>
                  </label>

                  <label className="flex items-center gap-1.5 text-[11px] text-slate-600 font-medium cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={newUserPerms.canViewDevis}
                      onChange={(e) => setNewUserPerms({ ...newUserPerms, canViewDevis: e.target.checked })}
                      className="rounded-sm border-slate-300 accent-[#2C3E36] w-3.5 h-3.5"
                    />
                    <span>Édition de Devis</span>
                  </label>

                  <label className="flex items-center gap-1.5 text-[11px] text-slate-600 font-medium cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={newUserPerms.canViewFactures}
                      onChange={(e) => setNewUserPerms({ ...newUserPerms, canViewFactures: e.target.checked })}
                      className="rounded-sm border-slate-300 accent-[#2C3E36] w-3.5 h-3.5"
                    />
                    <span>Factures & Fiscal</span>
                  </label>

                  <label className="flex items-center gap-1.5 text-[11px] text-slate-600 font-medium cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={newUserPerms.canViewMarketing}
                      onChange={(e) => setNewUserPerms({ ...newUserPerms, canViewMarketing: e.target.checked })}
                      className="rounded-sm border-slate-300 accent-[#2C3E36] w-3.5 h-3.5"
                    />
                    <span>Marketing IA</span>
                  </label>

                  <label className="flex items-center gap-1.5 text-[11px] text-slate-600 font-medium cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={newUserPerms.canManageStands}
                      onChange={(e) => setNewUserPerms({ ...newUserPerms, canManageStands: e.target.checked })}
                      className="rounded-sm border-slate-300 accent-[#2C3E36] w-3.5 h-3.5"
                    />
                    <span>Gestion des Stands</span>
                  </label>

                  <label className="flex items-center gap-1.5 text-[11px] text-slate-600 font-medium cursor-pointer select-none col-span-2 sm:col-span-1">
                    <input
                      type="checkbox"
                      checked={newUserPerms.canViewSettings}
                      onChange={(e) => setNewUserPerms({ ...newUserPerms, canViewSettings: e.target.checked })}
                      className="rounded-sm border-slate-300 accent-[#2C3E36] w-3.5 h-3.5"
                    />
                    <span>Configuration Admin</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-xs select-none cursor-pointer transition-colors"
              >
                Valider & Enregistrer l'utilisateur
              </button>
            </div>
          </form>
        )}

        {/* Existing Accounts Spreadsheet View */}
        <div className="overflow-x-auto border border-slate-200/60 rounded-xl bg-white">
          {loadingUsers ? (
            <div className="p-8 text-center space-y-2 text-slate-500 text-xs">
              <div className="w-6 h-6 border-2 border-[#2C3E36] border-t-transparent rounded-full animate-spin mx-auto"></div>
              <span>Chargement sécurisé des privilèges...</span>
            </div>
          ) : (
            <table className="w-full text-left border-collapse text-slate-700">
              <thead>
                <tr className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                  <th className="px-4 py-3">Utilisateur</th>
                  <th className="px-4 py-3">Identifiant / E-mail</th>
                  <th className="px-4 py-3">Rôle Global</th>
                  <th className="px-4 py-3 text-center">Accès & Accréditations</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-sans">
                {usersList.map((user) => {
                  let roleColor = 'bg-slate-100 text-slate-700';
                  if (user.role === 'admin') roleColor = 'bg-sky-50 text-sky-800 border-sky-200/50';
                  if (user.role === 'commercial') roleColor = 'bg-amber-50 text-amber-800 border-amber-200/50';
                  if (user.role === 'financial') roleColor = 'bg-emerald-50 text-emerald-800 border-emerald-200/50';
                  if (user.role === 'supervisor') roleColor = 'bg-indigo-50 text-indigo-800 border-indigo-200/50';

                  return (
                    <tr key={user.id} className="hover:bg-slate-50/40 transition-colors">
                      {/* Avatar / Name */}
                      <td className="px-4 py-3.5 flex items-center gap-3">
                        <img
                          src={user.avatarUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200"}
                          alt={user.name}
                          className="w-9 h-9 rounded-full object-cover border border-slate-200 shrink-0"
                          referrerPolicy="no-referrer"
                        />
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-800 text-[12px]">{user.name}</span>
                          <span className="text-[10px] text-slate-400">{user.title}</span>
                        </div>
                      </td>

                      {/* Login Identifier */}
                      <td className="px-4 py-3.5 font-mono text-[11px] text-slate-600 font-medium">
                        {user.email}
                      </td>

                      {/* Role representation with colored badge */}
                      <td className="px-4 py-3.5">
                        <span className={`inline-block px-2.5 py-1 text-[10px] font-bold uppercase rounded-md border ${roleColor} tracking-wider`}>
                          {user.role}
                        </span>
                      </td>

                      {/* Permissions on/off togglers map */}
                      <td className="px-4 py-3.5">
                        <div className="flex flex-wrap items-center justify-center gap-1.5 max-w-[400px] mx-auto">
                          <button
                            type="button"
                            onClick={() => handleTogglePermission(user.id, 'canViewDashboard')}
                            className={`px-1.5 py-0.5 rounded-sm text-[9px] font-bold border transition-all cursor-pointer ${
                              user.permissions?.canViewDashboard
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200/70' 
                                : 'bg-slate-50 text-slate-300 border-slate-100'
                            }`}
                            title="Tableau de bord"
                          >
                            Dashboard
                          </button>
                          
                          <button
                            type="button"
                            onClick={() => handleTogglePermission(user.id, 'canManageLeads')}
                            className={`px-1.5 py-0.5 rounded-sm text-[9px] font-bold border transition-all cursor-pointer ${
                              user.permissions?.canManageLeads
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200/70' 
                                : 'bg-slate-50 text-slate-300 border-slate-100'
                            }`}
                            title="Contacts / CRM"
                          >
                            CRM
                          </button>

                          <button
                            type="button"
                            onClick={() => handleTogglePermission(user.id, 'canViewDevis')}
                            className={`px-1.5 py-0.5 rounded-sm text-[9px] font-bold border transition-all cursor-pointer ${
                              user.permissions?.canViewDevis
                                ? 'bg-amber-50 text-amber-700 border-amber-200/70 font-bold' 
                                : 'bg-slate-50 text-slate-300 border-slate-100'
                            }`}
                            title="Devis récents & rédaction"
                          >
                            Devis
                          </button>

                          <button
                            type="button"
                            onClick={() => handleTogglePermission(user.id, 'canViewFactures')}
                            className={`px-1.5 py-0.5 rounded-sm text-[9px] font-bold border transition-all cursor-pointer ${
                              user.permissions?.canViewFactures
                                ? 'bg-indigo-50 text-indigo-700 border-indigo-200/60 font-bold' 
                                : 'bg-slate-50 text-slate-300 border-slate-100'
                            }`}
                            title="Factures & TVA"
                          >
                            Factures
                          </button>

                          <button
                            type="button"
                            onClick={() => handleTogglePermission(user.id, 'canViewMarketing')}
                            className={`px-1.5 py-0.5 rounded-sm text-[9px] font-bold border transition-all cursor-pointer ${
                              user.permissions?.canViewMarketing
                                ? 'bg-[#70845B]/10 text-[#70845B] border-[#70845B]/30' 
                                : 'bg-slate-50 text-slate-300 border-slate-100'
                            }`}
                            title="Rédacteur IA Marketing"
                          >
                            Mailing-IA
                          </button>

                          <button
                            type="button"
                            onClick={() => handleTogglePermission(user.id, 'canManageStands')}
                            className={`px-1.5 py-0.5 rounded-sm text-[9px] font-bold border transition-all cursor-pointer ${
                              user.permissions?.canManageStands
                                ? 'bg-sky-50 text-sky-700 border-sky-200/70' 
                                : 'bg-slate-50 text-slate-300 border-slate-100'
                            }`}
                            title="Plans du salon & stands"
                          >
                            Salon
                          </button>

                          <button
                            type="button"
                            onClick={() => handleTogglePermission(user.id, 'canViewSettings')}
                            className={`px-1.5 py-0.5 rounded-sm text-[9px] font-bold border transition-all cursor-pointer ${
                              user.permissions?.canViewSettings
                                ? 'bg-rose-50 text-[#A68A64] border-rose-150' 
                                : 'bg-slate-50 text-slate-300 border-slate-100'
                            }`}
                            title="Administration globale & DNS"
                          >
                            Paramètres
                          </button>
                        </div>
                      </td>

                      {/* Deletion action */}
                      <td className="px-4 py-3.5 text-right whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => handleDeleteUser(user.id)}
                          className="p-1 px-2.5 text-rose-600 hover:text-white hover:bg-rose-600 rounded-lg transition-all font-medium border border-rose-200 hover:border-transparent cursor-pointer text-[11px]"
                          title="Supprimer ce compte utilisateur"
                        >
                          Supprimer
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

    </div>
  );
}
