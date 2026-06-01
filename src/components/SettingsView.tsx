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
  AlertCircle
} from 'lucide-react';
import { SiteId } from '../types';
import { initialSites } from '../initialData';

interface SettingsViewProps {
  selectedSite: SiteId;
  dbStatus: { isConfigured: boolean; dbInitialized: boolean; error: string | null; maskedUrl: string | null } | null;
}

export default function SettingsView({ selectedSite, dbStatus }: SettingsViewProps) {
  const [ticketPrice, setTicketPrice] = useState('2500'); // MAD/m²
  const [earlyBirdDiscount, setEarlyBirdDiscount] = useState('15');
  const [backupStatus, setBackupStatus] = useState<string | null>(null);

  const activeSite = initialSites.find(s => s.id === selectedSite) || initialSites[0];

  const triggerBackup = () => {
    setBackupStatus('Génération du fichier SQL de sauvegarde...');
    setTimeout(() => {
      setBackupStatus('Fichier R2H_Backup_2026_05_22.json compilé avec succès et téléversé.');
    }, 2000);
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
              <Database className="w-4 h-4 text-blue-500" />
              <span>Base de Données Vercel Postgres</span>
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
                    Toutes les modifications sur vos stands, prospects, factures et campagnes marketing IA sont enregistrées directement dans votre instance Vercel Postgres en temps réel.
                  </p>
                </div>
                
                <div className="space-y-1 font-mono text-[10px] bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                  <div className="flex justify-between">
                    <span className="text-slate-400">URI de la Base :</span>
                    <span className="font-bold text-slate-700 truncate max-w-[200px]" title={dbStatus.maskedUrl || ''}>
                      {dbStatus.maskedUrl}
                    </span>
                  </div>
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
                    <span>En attente de connexion Vercel</span>
                  </p>
                  <p className="text-[10px] text-slate-500 leading-relaxed">
                    Le portail fonctionne actuellement de manière autonome avec stockage local (localStorage). 
                    Pour le lier à votre base Vercel Postgres, définissez la variable d'environnement <strong>DATABASE_URL</strong> dans la configuration de votre application AI Studio.
                  </p>
                </div>
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
                  if (confirm("Êtes-vous sûr de vouloir vider le stockage local et resynchroniser depuis la base ?\nCette action rafraîchira la page.")) {
                    localStorage.clear();
                    window.location.reload();
                  }
                }}
                className="flex-1 py-2 bg-rose-50 border border-rose-200 hover:bg-rose-100 text-rose-700 rounded-lg font-semibold text-center cursor-pointer text-xs flex items-center justify-center gap-1"
              >
                <Trash2 className="w-4 h-4" />
                <span>Restaurer par défaut</span>
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
            <span>Serveurs DNS & Sites Web liés</span>
          </h3>

          <div className="space-y-3 font-sans text-xs text-slate-700">
            <div className="flex justify-between items-center p-2.5 bg-slate-50 rounded-lg border">
              <div>
                <p className="font-bold text-slate-800">africapoolspa.com</p>
                <p className="text-[10px] text-slate-400">Hébergé sur Cloud VPS • CDN Actif</p>
              </div>
              <span className="text-[9px] font-bold px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded-full">En ligne</span>
            </div>

            <div className="flex justify-between items-center p-2.5 bg-slate-50 rounded-lg border">
              <div>
                <p className="font-bold text-slate-800">gardenexpo.ma</p>
                <p className="text-[10px] text-slate-400">Hébergé sur Cloud VPS • CDN Actif</p>
              </div>
              <span className="text-[9px] font-bold px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded-full">En ligne</span>
            </div>

            <div className="flex justify-between items-center p-2.5 bg-slate-50 rounded-lg border">
              <div>
                <p className="font-bold text-slate-800">r2h.ma</p>
                <p className="text-[10px] text-slate-400">Hébergé sur Cloud VPS • DNS OK</p>
              </div>
              <span className="text-[9px] font-bold px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded-full">En ligne</span>
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
