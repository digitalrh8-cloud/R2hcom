/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  TrendingUp, 
  MapPin, 
  Sparkles, 
  CheckCircle2, 
  Calendar, 
  SlidersHorizontal, 
  Plus, 
  Percent, 
  Users2, 
  BadgeHelp,
  Building2,
  Euro,
  FileSpreadsheet,
  AlertCircle
} from 'lucide-react';
import { SiteId, Stand, Contact, Transaction, Task } from '../types';
import { initialSites } from '../initialData';

interface DashboardViewProps {
  selectedSite: SiteId;
  stands: Stand[];
  setStands: React.Dispatch<React.SetStateAction<Stand[]>>;
  contacts: Contact[];
  transactions: Transaction[];
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  setCurrentTab: (tab: string) => void;
}

export default function DashboardView({
  selectedSite,
  stands,
  setStands,
  contacts,
  transactions,
  tasks,
  setTasks,
  setCurrentTab
}: DashboardViewProps) {
  // Local states for the stand reservation modal
  const [selectedStand, setSelectedStand] = useState<Stand | null>(null);
  const [editCompany, setEditCompany] = useState('');
  const [editClient, setEditClient] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editStatus, setEditStatus] = useState<'disponible' | 'reserve' | 'vendu' | 'sponsorise'>('disponible');
  const [editNotes, setEditNotes] = useState('');
  const [showNotification, setShowNotification] = useState<string | null>(null);

  // Determine current floor plan site (since R2H aggregates, default floor plan view is Garden Expo)
  const [activeFloorPlanSite, setActiveFloorPlanSite] = useState<'gardenexpo' | 'africapool'>(
    selectedSite === 'africapool' ? 'africapool' : 'gardenexpo'
  );

  // Sync state if chosen site changes
  React.useEffect(() => {
    if (selectedSite === 'africapool' || selectedSite === 'gardenexpo') {
      setActiveFloorPlanSite(selectedSite);
    }
  }, [selectedSite]);

  // Filters
  const filteredStands = stands.filter(s => s.site === activeFloorPlanSite);
  
  // Calculate stats dynamically depending on selected site
  const siteFilter = (item: { site: SiteId }) => selectedSite === 'r2h' ? true : item.site === selectedSite;

  const siteContacts = contacts.filter(siteFilter);
  const siteTransactions = transactions.filter(siteFilter);
  const siteTasks = tasks.filter(siteFilter);

  // KPI calculations
  const totalRevenue = siteTransactions
    .filter(t => t.status === 'paye' || t.status === 'envoye')
    .reduce((sum, curr) => sum + curr.amount, 0);

  const pendingInvoicesCount = siteTransactions.filter(t => t.type === 'facture' && t.status === 'envoye').length;
  const pendingInvoicesSum = siteTransactions
    .filter(t => t.type === 'facture' && t.status === 'envoye')
    .reduce((sum, curr) => sum + curr.amount, 0);

  const prospectCount = siteContacts.filter(c => c.role === 'prospect').length;

  // Stand booking ratio
  const applicableStands = stands.filter(s => selectedSite === 'r2h' ? true : s.site === selectedSite);
  const totalStandsCount = applicableStands.length;
  const reservedStandsCount = applicableStands.filter(s => s.status !== 'disponible').length;
  const standOccupationRate = totalStandsCount > 0 ? Math.round((reservedStandsCount / totalStandsCount) * 100) : 0;

  // Toggle tasks status
  const handleToggleTask = (taskId: string) => {
    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        return { ...t, status: t.status === 'termine' ? 'a_faire' : 'termine' };
      }
      return t;
    }));
  };

  // Click on stand
  const handleSelectStand = (stand: Stand) => {
    setSelectedStand(stand);
    setEditCompany(stand.companyName || '');
    setEditClient(stand.clientName || '');
    setEditCategory(stand.category || '');
    setEditStatus(stand.status);
    setEditNotes(stand.notes || '');
  };

  // Save stand changes
  const handleSaveStand = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStand) return;

    setStands(prev => prev.map(s => {
      if (s.id === selectedStand.id) {
        return {
          ...s,
          status: editStatus,
          companyName: editStatus === 'disponible' ? '' : editCompany,
          clientName: editStatus === 'disponible' ? '' : editClient,
          category: editStatus === 'disponible' ? '' : editCategory,
          notes: editNotes
        };
      }
      return s;
    }));

    triggerToast(`Stand ${selectedStand.num} mis à jour avec succès.`);
    setSelectedStand(null);
  };

  const triggerToast = (msg: string) => {
    setShowNotification(msg);
    setTimeout(() => {
      setShowNotification(null);
    }, 4000);
  };

  // Group stands into grid rows for display rendering matching coordinates on the map
  // Rows representing columns A01-A09
  const rowTop = filteredStands.filter(s => ['A01', 'A02', 'A03', 'A04', 'A05', 'A06', 'A07', 'A08', 'A09'].includes(s.num));
  const rowLeft = filteredStands.filter(s => ['A10', 'A11', 'A12'].includes(s.num));
  const rowRight = filteredStands.filter(s => ['A27', 'A28'].includes(s.num));
  const midCluster1 = filteredStands.filter(s => ['A13', 'A17'].includes(s.num));
  const midCluster2 = filteredStands.filter(s => ['A14', 'A15', 'A16'].includes(s.num));
  const rowBottom = filteredStands.filter(s => ['A20', 'A21', 'A22', 'A23', 'A24', 'A25', 'A26'].includes(s.num));
  const specialMid = filteredStands.filter(s => ['A18', 'A19'].includes(s.num));

  // Determine site config for presentation colors
  const activeColor = selectedSite === 'africapool' ? '#06B6D4' : selectedSite === 'gardenexpo' ? '#10B981' : '#3B82F6';

  return (
    <div id="dashboard-view" className="flex-1 overflow-y-auto bg-transparent p-4 sm:p-6 md:p-8 space-y-4 md:space-y-8">
      {/* Toast Notification */}
      {showNotification && (
        <div className="fixed top-4 right-4 bg-[#2C3E36] border border-[#3d564b] text-white font-sans text-xs px-4 py-3 rounded-xl shadow-xl flex items-center gap-2.5 z-50 animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-[#A68A64] shrink-0" />
          <span>{showNotification}</span>
        </div>
      )}

      {/* Header and Filter */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#E8E6DE] pb-6">
        <div>
          <h2 className="text-2xl font-serif font-bold text-[#2D2D2D] tracking-tight">Tableau de Bord</h2>
          <p className="text-xs text-[#7A7667]">
            {selectedSite === 'r2h' 
              ? "Vue d'ensemble consolidée de tous les événements" 
              : `Pilotage des activités pour ${initialSites.find(s => s.id === selectedSite)?.name}`}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-xs text-[#7A7667] bg-white border border-[#E8E6DE] px-4 py-2 rounded-xl shadow-xs flex items-center gap-1.5 font-mono">
            <span className="w-2 h-2 rounded-full bg-[#7E8F7A] animate-pulse"></span>
            <span>MAJ: 2026-05-22 BST</span>
          </div>
          <button 
            onClick={() => triggerToast("Actualisation des données de l'API...")}
            className="px-4 py-2 bg-[#A68A64] hover:bg-[#8e7451] text-white text-xs font-semibold rounded-xl shadow-xs cursor-pointer transition-all flex items-center gap-1.5"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Personnaliser</span>
          </button>
        </div>
      </div>

      {/* KPI Cards section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Chiffre d'Affaires Card */}
        <div className="bg-white p-6 rounded-3xl border border-[#E8E6DE] shadow-xs relative overflow-hidden flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-bold text-[#7A7667] tracking-wider uppercase">CHIFFRE D'AFFAIRES</span>
            <h3 className="text-2xl font-serif font-black text-[#2D2D2D] tracking-tight mt-1">
              {totalRevenue.toLocaleString()} <span className="text-xs text-[#7A7667] font-sans font-medium">MAD</span>
            </h3>
          </div>
          <div className="mt-4 flex items-center justify-between text-[11px]">
            <span className="text-[#7E8F7A] font-semibold flex items-center gap-0.5">↑ 31.2%</span>
            <span className="text-[#7A7667]/70">vs période préc.</span>
          </div>
          {/* Sparkline decoration */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#A68A64]/10">
            <div className="w-2/3 h-full bg-[#A68A64]"></div>
          </div>
        </div>

        {/* Stands reservations Ratio Card */}
        <div className="bg-white p-6 rounded-3xl border border-[#E8E6DE] shadow-xs relative overflow-hidden flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-bold text-[#7A7667] tracking-wider uppercase">RÉSERVATIONS CONFIRMÉES</span>
            <h3 className="text-2xl font-serif font-black text-[#2D2D2D] tracking-tight mt-1">
              {reservedStandsCount} / {totalStandsCount || 50} <span className="text-xs text-[#7A7667] font-sans font-medium font-normal">Stands</span>
            </h3>
          </div>
          <div className="mt-4">
            <div className="w-full bg-[#F0EEE6] h-1.5 rounded-full overflow-hidden">
              <div className="bg-[#7E8F7A] h-full rounded-full" style={{ width: `${standOccupationRate}%` }}></div>
            </div>
            <div className="flex justify-between items-center text-[10px] text-[#7A7667] mt-1.5">
              <span>Taux d'occupation</span>
              <span className="font-semibold text-[#2D2D2D]">{standOccupationRate}%</span>
            </div>
          </div>
        </div>

        {/* Prospects CRM Count */}
        <div className="bg-white p-6 rounded-3xl border border-[#E8E6DE] shadow-xs relative overflow-hidden flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-bold text-[#7A7667] tracking-wider uppercase">PROSPECTS CRM</span>
            <h3 className="text-2xl font-serif font-black text-[#2D2D2D] tracking-tight mt-1">
              {prospectCount.toLocaleString()}
            </h3>
          </div>
          <div className="mt-4 flex items-center justify-between text-[11px]">
            <span className="text-[#7E8F7A] font-semibold flex items-center gap-0.5">↑ 22.5%</span>
            <span className="text-[#7A7667]/70">Nouveaux leads</span>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#A68A64]/10">
            <div className="w-1/2 h-full bg-[#A68A64]"></div>
          </div>
        </div>

        {/* Invoices pending sum Card */}
        <div className="bg-white p-6 rounded-3xl border border-[#E8E6DE] shadow-xs relative overflow-hidden flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-bold text-[#7A7667] tracking-wider uppercase">FACTURES EN ATTENTE</span>
            <h3 className="text-2xl font-serif font-black text-[#2D2D2D] tracking-tight mt-1">
              {pendingInvoicesCount} <span className="text-xs text-[#7A7667] font-sans font-medium font-normal font-sans">Factures</span>
            </h3>
          </div>
          <div className="mt-4 flex items-center justify-between text-[11px]">
            <span className="text-rose-600 font-semibold font-mono">
              {pendingInvoicesSum.toLocaleString()} MAD
            </span>
            <span className="text-[#7A7667]/70">À recouvrer</span>
          </div>
        </div>

        {/* Newsletter metrics */}
        <div className="bg-white p-6 rounded-3xl border border-[#E8E6DE] shadow-xs relative overflow-hidden flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-bold text-[#7A7667] tracking-wider uppercase">CAMPAGNES EMAIL</span>
            <h3 className="text-2xl font-serif font-black text-[#2D2D2D] tracking-tight mt-1">
              34.5%
            </h3>
          </div>
          <div className="mt-4 flex items-center justify-between text-[11px]">
            <span className="text-[#7E8F7A] font-semibold">↑ 6.3%</span>
            <span className="text-[#7A7667]/70">Taux d'ouverture</span>
          </div>
        </div>
      </div>

      {/* Main Column Grid (Exhibition plan, Commercial activity, side panels) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT/MID: Plan de Stands & graph area */}
        <div className="lg:col-span-2 space-y-6">
          {/* Interactive Exhibition Plan matching original visual exact design */}
          <div className="bg-white p-6 rounded-3xl border border-[#E8E6DE] shadow-xs">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 border-b border-[#E8E6DE]/60 pb-4 mb-4">
              <div>
                <h3 className="text-sm font-bold text-[#2D2D2D] font-serif flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: '#A68A64' }}></span>
                  <span>Plan Interactif du Salon — {activeFloorPlanSite === 'gardenexpo' ? 'Garden Expo Africa 2025' : 'Africa Pool & Spa Expo 2025'}</span>
                </h3>
                <p className="text-[11px] text-[#7A7667] mt-0.5">Cliquez sur un pavillon de stand pour administrer l'attribution.</p>
              </div>

              {/* Floor Plan site selection dropdown in aggregated mode */}
              {selectedSite === 'r2h' && (
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-[#7A7667] font-semibold font-sans">SALON :</span>
                  <select
                    value={activeFloorPlanSite}
                    onChange={(e) => setActiveFloorPlanSite(e.target.value as 'gardenexpo' | 'africapool')}
                    className="text-xs bg-[#F8F7F2] border border-[#E8E6DE] rounded-xl px-3 py-1.5 outline-hidden text-[#2D2D2D] font-medium cursor-pointer"
                  >
                    <option value="gardenexpo">Garden Expo 2025</option>
                    <option value="africapool">Africa Pool & Spa 2025</option>
                  </select>
                </div>
              )}
            </div>

            {/* Simulated Canvas Layout Grid (Hall A mapping layout) */}
            <div className="bg-[#F8F7F2] border border-[#E8E6DE] rounded-2xl p-6 relative overflow-x-auto">
              <div className="min-w-[620px] max-w-[720px] mx-auto space-y-5">
                {/* Visual Header Grid indicating rows */}
                <div className="text-center font-serif font-semibold text-[11px] uppercase tracking-wider text-[#7A7667] mb-2">
                  -{activeFloorPlanSite === 'gardenexpo' ? 'Hall A - Pôle Principal Expo Casablanca' : 'Hall 1 - Palais des Congrès Marrakech'}-
                </div>

                {/* ROW 1: stands top horizontal row (A01 - A09) */}
                <div className="grid grid-cols-9 gap-2">
                  {rowTop.map((stand) => {
                    const colorMap = {
                      disponible: 'bg-emerald-50 border-emerald-300 text-emerald-800 hover:bg-emerald-100',
                      reserve: 'bg-amber-50 border-amber-300 text-amber-800 hover:bg-amber-100',
                      vendu: 'bg-rose-50 border-rose-300 text-rose-800 hover:bg-rose-100',
                      sponsorise: 'bg-purple-50 border-purple-300 text-purple-800 hover:bg-purple-100'
                    };
                    return (
                      <button
                        key={stand.id}
                        onClick={() => handleSelectStand(stand)}
                        className={`border rounded-lg p-2.5 text-center transition-all cursor-pointer ${colorMap[stand.status]} flex flex-col justify-between items-center h-20 min-w-[55px]`}
                      >
                        <span className="text-xs font-mono font-bold tracking-tight">{stand.num}</span>
                        <div className="w-1.5 h-1.5 rounded-full" style={{
                          backgroundColor: stand.status === 'disponible' ? '#10B981' : stand.status === 'reserve' ? '#F59E0B' : stand.status === 'vendu' ? '#EF4444' : '#8B5CF6'
                        }}></div>
                        <span className="text-[9px] scale-90 truncate w-full text-center text-slate-500 font-sans">{stand.area}m²</span>
                      </button>
                    );
                  })}
                </div>

                {/* ROW 2: splits left/right column structure & middle displays */}
                <div className="grid grid-cols-5 gap-4">
                  
                  {/* Left Column vertical blocks (A10 - A12) */}
                  <div className="col-span-1 flex flex-col gap-2">
                    {rowLeft.map((stand) => {
                      const colorMap = {
                        disponible: 'bg-emerald-50 border-emerald-250 text-emerald-800 hover:bg-emerald-100',
                        reserve: 'bg-amber-50 border-amber-250 text-amber-800 hover:bg-amber-100',
                        vendu: 'bg-rose-50 border-rose-250 text-rose-800 hover:bg-rose-100',
                        sponsorise: 'bg-purple-50 border-purple-250 text-purple-800 hover:bg-purple-100'
                      };
                      return (
                        <button
                          key={stand.id}
                          onClick={() => handleSelectStand(stand)}
                          className={`border rounded-lg p-2 text-center transition-all cursor-pointer ${colorMap[stand.status]} flex justify-between items-center h-12`}
                        >
                          <span className="text-[11px] font-mono font-bold">{stand.num}</span>
                          <span className="text-[9px] text-slate-500">{stand.area}m²</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Middle cluster displays (A13, A17 AND Central A14-16, A18-19) */}
                  <div className="col-span-3 grid grid-cols-2 gap-3 bg-white/40 border border-dashed border-slate-300 rounded-xl p-3">
                    
                    {/* Middle left inner vertical block (A13, A17) */}
                    <div className="flex flex-col justify-around gap-2">
                      {midCluster1.map((stand) => (
                        <button
                          key={stand.id}
                          onClick={() => handleSelectStand(stand)}
                          className={`border rounded-lg p-2.5 text-center transition-all cursor-pointer flex flex-col justify-between items-center h-16 ${
                            stand.status === 'disponible' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' :
                            stand.status === 'reserve' ? 'bg-amber-50 border-amber-200 text-amber-800' :
                            stand.status === 'vendu' ? 'bg-rose-50 border-rose-200 text-rose-800' : 'bg-purple-50 border-purple-200 text-purple-800'
                          }`}
                        >
                          <span className="text-[11px] font-mono font-bold">{stand.num}</span>
                          <span className="text-[9px] text-slate-400 font-sans truncate max-w-full">{stand.companyName || `${stand.area} m²`}</span>
                        </button>
                      ))}
                    </div>

                    {/* Middle right blocks (A14 - A16, A18 - A19) */}
                    <div className="flex flex-col justify-around gap-2">
                      {specialMid.map((stand) => (
                        <button
                          key={stand.id}
                          onClick={() => handleSelectStand(stand)}
                          className={`border rounded-lg p-1.5 text-center transition-all cursor-pointer flex items-center justify-between h-10 ${
                            stand.status === 'disponible' ? 'bg-emerald-50 border-emerald-200' :
                            stand.status === 'reserve' ? 'bg-amber-50 border-amber-200' :
                            stand.status === 'vendu' ? 'bg-rose-50 border-rose-200' : 'bg-purple-50 border-purple-200'
                          }`}
                        >
                          <span className="text-[10px] font-mono font-bold shrink-0">{stand.num}</span>
                          <span className="text-[9px] font-sans truncate text-slate-500 font-medium pl-1">{stand.companyName || `${stand.area}m²`}</span>
                        </button>
                      ))}
                    </div>

                  </div>

                  {/* Right Column vertical blocks (A27 - A28) */}
                  <div className="col-span-1 flex flex-col gap-2 justify-start">
                    {rowRight.map((stand) => {
                      const colorMap = {
                        disponible: 'bg-emerald-50 border-emerald-250 text-emerald-800 hover:bg-emerald-100',
                        reserve: 'bg-amber-50 border-amber-250 text-amber-800 hover:bg-amber-100',
                        vendu: 'bg-rose-50 border-rose-250 text-rose-800 hover:bg-rose-100',
                        sponsorise: 'bg-purple-50 border-purple-250 text-purple-800 hover:bg-purple-100'
                      };
                      return (
                        <button
                          key={stand.id}
                          onClick={() => handleSelectStand(stand)}
                          className={`border rounded-lg p-2 text-center transition-all cursor-pointer ${colorMap[stand.status]} flex flex-col justify-between items-center h-18`}
                        >
                          <span className="text-[11px] font-mono font-bold">{stand.num}</span>
                          <span className="text-[9px] text-slate-500 font-sans">{stand.area}m²</span>
                        </button>
                      );
                    })}
                  </div>

                </div>

                {/* ROW 3: horizontal row bottom (A20 - A26) */}
                <div className="grid grid-cols-7 gap-2">
                  {rowBottom.map((stand) => {
                    const colorMap = {
                      disponible: 'bg-emerald-50 border-emerald-350 text-emerald-800 hover:bg-emerald-100',
                      reserve: 'bg-amber-50 border-amber-350 text-amber-800 hover:bg-amber-100',
                      vendu: 'bg-rose-50 border-rose-350 text-rose-800 hover:bg-rose-100',
                      sponsorise: 'bg-purple-50 border-purple-350 text-purple-800 hover:bg-purple-100'
                    };
                    return (
                      <button
                        key={stand.id}
                        onClick={() => handleSelectStand(stand)}
                        className={`border rounded-lg p-2 text-center transition-all cursor-pointer ${colorMap[stand.status]} flex flex-col justify-between items-center h-16`}
                      >
                        <span className="text-xs font-mono font-bold">{stand.num}</span>
                        <div className="w-1 h-1 rounded-full bg-slate-400"></div>
                        <span className="text-[9px] text-slate-500 scale-90">{stand.area}m²</span>
                      </button>
                    );
                  })}
                </div>

                {/* Grid Color legend map indicators */}
                <div className="flex justify-center items-center gap-6 text-[10px] text-slate-500 border-t border-slate-200/50 pt-3 select-none">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span>
                    <span>Disponible</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block"></span>
                    <span>Réserve d'option</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block"></span>
                    <span>Vendu / Signé</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-purple-500 inline-block"></span>
                    <span>Sponsorisé</span>
                  </div>
                </div>

              </div>
            </div>
          </div>

          {/* Activity commercial trends curve built inline using custom SVGs exactly to reflect trends */}
          <div className="bg-white p-6 rounded-3xl border border-[#E8E6DE] shadow-xs">
            <div className="flex justify-between items-center mb-4 border-b border-[#E8E6DE]/60 pb-3">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#7A7667] font-sans">Activité commerciale</h4>
                <p className="text-xs text-[#7A7667]/80 mt-1">Évolution mensuelle des prospects et devis contractés (pour 2026 en MAD)</p>
              </div>

              <div className="flex items-center gap-4 text-[10px] text-[#7A7667] font-semibold">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-1 bg-[#A68A64] rounded-sm"></span>
                  <span>Devis créés</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-1 bg-[#7E8F7A] rounded-sm"></span>
                  <span>Commandes confirmées</span>
                </div>
              </div>
            </div>

            {/* Custom high contrast SVG graph reflecting commercial trends */}
            <div className="h-64 w-full relative">
              <svg className="w-full h-full" viewBox="0 0 600 220" preserveAspectRatio="none">
                {/* Defs for gradients */}
                <defs>
                  <linearGradient id="goldG" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#A68A64" stopOpacity="0.15" />
                    <stop offset="100%" stopColor="#A68A64" stopOpacity="0" />
                  </linearGradient>
                  <linearGradient id="sageG" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#7E8F7A" stopOpacity="0.15" />
                    <stop offset="100%" stopColor="#7E8F7A" stopOpacity="0" />
                  </linearGradient>
                </defs>

                {/* Horizontal Guide lines */}
                <line x1="10" y1="20" x2="590" y2="20" stroke="#E8E6DE" strokeWidth="1" />
                <line x1="10" y1="70" x2="590" y2="70" stroke="#E8E6DE" strokeWidth="1" />
                <line x1="10" y1="120" x2="590" y2="120" stroke="#E8E6DE" strokeWidth="1" />
                <line x1="10" y1="170" x2="590" y2="170" stroke="#E8E6DE" strokeWidth="1" />

                {/* Graph Grid Y-Axis descriptions */}
                <text x="15" y="32" className="text-[8px] font-mono fill-[#7A7667]/70">1.2 M</text>
                <text x="15" y="82" className="text-[8px] font-mono fill-[#7A7667]/70">800 K</text>
                <text x="15" y="132" className="text-[8px] font-mono fill-[#7A7667]/70">400 K</text>

                {/* Filled gradient under curve Devis */}
                <path d="M 10,180 C 100,160 180,110 240,115 C 320,120 400,90 480,95 C 540,105 590,80 590,80 L 590,180 L 10,180 Z" fill="url(#goldG)" />
                {/* Line path Devis */}
                <path d="M 10,180 C 100,160 180,110 240,115 C 320,120 400,90 480,95 C 540,105 590,80 590,80" fill="none" stroke="#A68A64" strokeWidth="2.5" />

                {/* Filled gradient under curve Sales */}
                <path d="M 10,195 C 100,190 180,160 240,140 C 320,145 400,120 480,130 C 540,115 590,100 590,100 L 590,180 L 10,180 Z" fill="url(#sageG)" />
                {/* Line path Sales */}
                <path d="M 10,195 C 100,190 180,160 240,140 C 320,145 400,120 480,130 C 540,115 590,100 590,100" fill="none" stroke="#7E8F7A" strokeWidth="2.5" />

                {/* Grid X-Axis Month names */}
                <text x="10" y="210" className="text-[8px] font-sans fill-[#7A7667]/70">Jan</text>
                <text x="60" y="210" className="text-[8px] font-sans fill-[#7A7667]/70">Fév</text>
                <text x="115" y="210" className="text-[8px] font-sans fill-[#7A7667]/70">Mar</text>
                <text x="170" y="210" className="text-[8px] font-sans fill-[#7A7667]/70">Avr</text>
                <text x="225" y="210" className="text-[8px] font-sans fill-[#7A7667]/70">Mai</text>
                <text x="280" y="210" className="text-[8px] font-sans fill-[#7A7667]/70">Juin</text>
                <text x="335" y="210" className="text-[8px] font-sans fill-[#7A7667]/70">Juil</text>
                <text x="390" y="210" className="text-[8px] font-sans fill-[#7A7667]/70">Août</text>
                <text x="445" y="210" className="text-[8px] font-sans fill-[#7A7667]/70">Sep</text>
                <text x="500" y="210" className="text-[8px] font-sans fill-[#7A7667]/70">Oct</text>
                <text x="555" y="210" className="text-[8px] font-sans fill-[#7A7667]/70">Nov</text>
                <text x="590" y="210" className="text-[8px] font-sans fill-[#7A7667]/70">Déc</text>

                {/* Point pointers indicators */}
                <circle cx="225" cy="115" r="4" fill="#A68A64" stroke="#ffffff" strokeWidth="1" />
                <circle cx="225" cy="140" r="4" fill="#7E8F7A" stroke="#ffffff" strokeWidth="1" />
              </svg>
            </div>
          </div>
        </div>

        {/* RIGHT: Invoices lists & interactive tasks to completion */}
        <div className="space-y-6">
          
          {/* Quick Actions Panel */}
          <div className="bg-white p-6 rounded-3xl border border-[#E8E6DE] shadow-xs">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#7A7667] mb-3.5 font-sans">Actions rapides</h4>
            <div className="grid grid-cols-2 gap-2.5">
              <button 
                onClick={() => setCurrentTab('devis')}
                className="p-3 bg-[#F0EEE6] hover:bg-[#E8E6DE] rounded-xl text-left transition text-[#2D2D2D] border border-[#E8E6DE] flex flex-col gap-1 cursor-pointer"
              >
                <span className="text-xs font-bold font-serif text-[#A68A64]">Créer devis</span>
                <span className="text-[10px] text-[#7A7667] leading-tight mt-0.5">Nouvelle offre commerciale</span>
              </button>
              <button 
                onClick={() => setCurrentTab('prospects')}
                className="p-3 bg-[#F8F7F2] hover:bg-[#E8E6DE] rounded-xl text-left transition text-[#2D2D2D] border border-[#E8E6DE] flex flex-col gap-1 cursor-pointer"
              >
                <span className="text-xs font-bold font-serif text-[#7E8F7A]">Nouveau prospect</span>
                <span className="text-[10px] text-[#7A7667] leading-tight mt-0.5">Ajouter au CRM</span>
              </button>
              <button 
                onClick={() => setCurrentTab('marketing')}
                className="p-3 bg-[#F0EEE6] hover:bg-[#E8E6DE] rounded-xl text-left transition text-[#2D2D2D] border border-[#E8E6DE] flex flex-col gap-1 cursor-pointer"
              >
                <span className="text-xs font-bold font-serif text-[#A68A64]">Emailing IA</span>
                <span className="text-[10px] text-[#7A7667] leading-tight mt-0.5">Rédiger avec Gemini</span>
              </button>
              <button 
                onClick={() => setActiveFloorPlanSite(activeFloorPlanSite === 'gardenexpo' ? 'africapool' : 'gardenexpo')}
                className="p-3 bg-[#F8F7F2] hover:bg-[#E8E6DE] rounded-xl text-left transition text-[#2D2D2D] border border-[#E8E6DE] flex flex-col gap-1 cursor-pointer"
              >
                <span className="text-xs font-bold font-serif text-[#7E8F7A]">Voir Salon</span>
                <span className="text-[10px] text-[#7A7667] leading-tight mt-0.5">Changer de plan</span>
              </button>
            </div>
          </div>

          {/* Tasks & follow ups checklist interactive */}
          <div className="bg-white p-6 rounded-3xl border border-[#E8E6DE] shadow-xs">
            <div className="flex justify-between items-center mb-3.5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#7A7667] font-sans">Tâches & Relances</h4>
              <span className="text-[11px] text-[#A68A64] font-semibold hover:underline cursor-pointer">Voir tout</span>
            </div>
            
            <div className="space-y-3">
              {siteTasks.map((task) => {
                const isCompleted = task.status === 'termine';
                return (
                  <div 
                    key={task.id}
                    className="flex gap-3 items-start p-3 rounded-xl border border-[#E8E6DE]/60 hover:bg-[#F8F7F2]/40 transition-all text-xs"
                  >
                    <input 
                      type="checkbox" 
                      checked={isCompleted}
                      id={`chk-${task.id}`}
                      onChange={() => handleToggleTask(task.id)}
                      className="mt-0.5 rounded-sm border-[#E8E6DE] text-[#A68A64] focus:ring-[#A68A64] cursor-pointer h-3.5 w-3.5"
                    />
                    <div className="flex-1 min-w-0">
                      <p className={`font-semibold ${isCompleted ? 'text-[#7A7667]/50 line-through' : 'text-[#2D2D2D]'}`}>
                        {task.title}
                      </p>
                      <p className="text-[10px] text-[#7A7667] truncate mt-0.5">
                        {task.description || 'Suivi CRM régulier'}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1 select-none">
                      <span className="text-[9px] font-mono text-[#7A7667] font-medium">
                        {task.dueDate}
                      </span>
                      <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded-sm uppercase ${
                        task.priority === 'haute' ? 'bg-red-50 text-red-600' :
                        task.priority === 'moyenne' ? 'bg-[#F0EEE6] text-[#A68A64]' : 'bg-[#F8F7F2] text-[#7A7667]'
                      }`}>
                        {task.priority}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Salons List timeline */}
          <div className="bg-white p-6 rounded-3xl border border-[#E8E6DE] shadow-xs">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#7A7667] mb-3.5 font-sans">Salons à venir</h4>
            
            <div className="space-y-4">
              <div className="flex gap-3 text-xs">
                <div className="w-10 h-10 bg-[#F0EEE6] rounded-xl flex items-center justify-center font-serif font-black text-[#A68A64] shrink-0">
                  GE
                </div>
                <div>
                  <h5 className="font-bold text-[#2D2D2D]">Garden Expo Africa 2025</h5>
                  <p className="text-[10px] text-[#7A7667] font-medium mt-0.5">17 - 20 Avril 2025 • Casablanca, Maroc</p>
                  <span className="mt-1.5 inline-block text-[8px] font-bold px-2 py-0.5 bg-[#7E8F7A]/10 text-[#4D5E4A] rounded-full">En cours</span>
                </div>
              </div>

              <div className="flex gap-3 text-xs">
                <div className="w-10 h-10 bg-[#F0EEE6] rounded-xl flex items-center justify-center font-serif font-black text-[#7E8F7A] shrink-0">
                  AP
                </div>
                <div>
                  <h5 className="font-bold text-[#2D2D2D]">Africa Pool & Spa Expo 2025</h5>
                  <p className="text-[10px] text-[#7A7667] font-medium mt-0.5">08 - 11 Mai 2025 • Marrakech, Maroc</p>
                  <span className="mt-1.5 inline-block text-[8px] font-bold px-2 py-0.5 bg-[#A68A64]/10 text-[#2D2D2D] rounded-full">À venir</span>
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* Active Devis list table filtered */}
      <div className="bg-white p-6 rounded-3xl border border-[#E8E6DE] shadow-xs">
        <div className="flex justify-between items-center border-b border-[#E8E6DE]/60 pb-3 mb-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-[#7A7667] font-serif">Devis récents</h4>
          <span 
            onClick={() => setCurrentTab('devis')}
            className="text-[11px] text-[#A68A64] font-semibold hover:underline cursor-pointer flex items-center gap-1"
          >
            <span>Voir tout</span>
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#2D2D2D]">
            <thead>
              <tr className="border-b border-[#E8E6DE]/60 text-[#7A7667] text-[10px] uppercase font-bold">
                <th className="py-2.5">N° Devis</th>
                <th className="py-2.5">Client</th>
                <th className="py-2.5">Salon / Site</th>
                <th className="py-2.5">Montant</th>
                <th className="py-2.5">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8E6DE]/40 font-sans">
              {siteTransactions.filter(t => t.type === 'devis').map((devis) => (
                <tr key={devis.id} className="hover:bg-[#F8F7F2]/40 transition">
                  <td className="py-2.5 text-[#A68A64] font-mono font-bold">{devis.num}</td>
                  <td className="py-2.5 font-bold text-[#2D2D2D]">{devis.companyName}</td>
                  <td className="py-2.5 text-[#7A7667] font-medium flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full" style={{
                      backgroundColor: devis.site === 'africapool' ? '#A68A64' : devis.site === 'gardenexpo' ? '#7E8F7A' : '#7A7667'
                    }}></span>
                    <span>{devis.site === 'africapool' ? 'Africa Pool & Spa' : devis.site === 'gardenexpo' ? 'Garden Expo Africa' : 'R2H Communication'}</span>
                  </td>
                  <td className="py-2.5 font-mono font-semibold text-[#2D2D2D]">{devis.amount.toLocaleString()} MAD</td>
                  <td className="py-2.5">
                    <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase ${
                      devis.status === 'paye' ? 'bg-[#7E8F7A]/15 text-[#4D5E4A]' :
                      devis.status === 'envoye' ? 'bg-[#A68A64]/15 text-[#2D2D2D]' : 'bg-[#F0EEE6] text-[#7A7667]'
                    }`}>
                      {devis.status === 'paye' ? 'Confirmé' : devis.status === 'envoye' ? 'Envoyé' : 'Négociation'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Stand Attribution Administration Modal */}
      {selectedStand && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl shadow-2xl border border-[#E8E6DE] max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200 text-[#2D2D2D] font-sans">
            <div className="p-6 border-b border-[#E8E6DE]/60 flex justify-between items-center bg-[#F8F7F2]">
              <div>
                <h4 className="font-serif font-black text-[#2D2D2D] text-base leading-tight">Administration du Stand {selectedStand.num}</h4>
                <p className="text-[11px] text-[#7A7667] mt-0.5">{selectedStand.hall} — surface : {selectedStand.area} m²</p>
              </div>
              <button 
                onClick={() => setSelectedStand(null)}
                className="text-[#7A7667] hover:text-[#2D2D2D] text-2xl font-semibold leading-none cursor-pointer"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSaveStand} className="p-6 space-y-4">
              {/* Stand status */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[#7A7667] uppercase tracking-wider">Statut d'occupation</label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value as any)}
                  className="w-full text-xs bg-[#F8F7F2] border border-[#E8E6DE] rounded-xl p-2.5 outline-hidden text-[#2D2D2D] font-semibold"
                >
                  <option value="disponible">✓ Disponible (Libre à la vente)</option>
                  <option value="reserve">⚠ Réservé (Option temporaire)</option>
                  <option value="vendu">⛔ Vendu (Contrat signé)</option>
                  <option value="sponsorise">★ Sponsorisé (Partenaire officiel)</option>
                </select>
              </div>

              {editStatus !== 'disponible' && (
                <>
                  {/* Company Name */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-[#7A7667] uppercase tracking-wider">Société / Entreprise</label>
                    <input
                      type="text"
                      required
                      value={editCompany}
                      onChange={(e) => setEditCompany(e.target.value)}
                      placeholder="Ex: AquaPools Maroc"
                      className="w-full text-xs bg-[#F8F7F2] border border-[#E8E6DE] rounded-xl p-2.5 outline-hidden text-[#2D2D2D]"
                    />
                  </div>

                  {/* Client Contact Person */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-[#7A7667] uppercase tracking-wider">Nom du Représentant</label>
                    <input
                      type="text"
                      required
                      value={editClient}
                      onChange={(e) => setEditClient(e.target.value)}
                      placeholder="Ex: Youssef Bennani"
                      className="w-full text-xs bg-[#F8F7F2] border border-[#E8E6DE] rounded-xl p-2.5 outline-hidden text-[#2D2D2D]"
                    />
                  </div>

                  {/* Category of activity */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-[#7A7667] uppercase tracking-wider">Secteur / Catégorie d'activité</label>
                    <input
                      type="text"
                      value={editCategory}
                      onChange={(e) => setEditCategory(e.target.value)}
                      placeholder="Ex: Piscines Polyester, Pépinière..."
                      className="w-full text-xs bg-[#F8F7F2] border border-[#E8E6DE] rounded-xl p-2.5 outline-hidden text-[#2D2D2D]"
                    />
                  </div>
                </>
              )}

              {/* Administrative note */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[#7A7667] uppercase tracking-wider">Notes internes / Administratif</label>
                <textarea
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  placeholder="Notes additionnelles sur le stand..."
                  rows={3}
                  className="w-full text-xs bg-[#F8F7F2] border border-[#E8E6DE] rounded-xl p-2.5 outline-hidden text-[#2D2D2D] resize-none"
                />
              </div>

              {/* Action buttons */}
              <div className="flex justify-end gap-2.5 pt-4 border-t border-[#E8E6DE]/60">
                <button
                  type="button"
                  onClick={() => setSelectedStand(null)}
                  className="px-4 py-2 rounded-xl border border-[#E8E6DE] text-xs font-semibold text-[#7A7667] hover:bg-[#F8F7F2] cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#2C3E36] hover:bg-[#202E28] rounded-xl text-xs font-semibold text-white cursor-pointer shadow-sm transition"
                >
                  Enregistrer les modifications
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
