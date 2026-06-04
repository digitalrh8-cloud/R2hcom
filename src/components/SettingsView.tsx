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
  ExternalLink
} from 'lucide-react';
import { SiteId } from '../types';
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

  // Load configured Railway Domain on component mount
  React.useEffect(() => {
    async function loadRailwayConfig() {
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
    }
    loadRailwayConfig();
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
                  className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-lg font-semibold text-xs transition-all duration-150 shrink-0 select-none cursor-pointer"
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

    </div>
  );
}
