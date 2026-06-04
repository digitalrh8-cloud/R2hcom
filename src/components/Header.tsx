/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Bell, 
  Mail, 
  Calendar, 
  Search, 
  Globe, 
  Compass, 
  Maximize2,
  Sliders,
  Sparkles,
  CheckCircle2,
  Menu,
  Plus,
  X
} from 'lucide-react';
import { SiteId, SiteConfig } from '../types';
import { initialSites } from '../initialData';

interface HeaderProps {
  selectedSite: SiteId;
  setSelectedSite: (siteId: SiteId) => void;
  title: string;
  onMenuToggle?: () => void;
  sites?: SiteConfig[];
  onAddSite?: (newSite: SiteConfig, numStands: number) => void;
}

export default function Header({ 
  selectedSite, 
  setSelectedSite, 
  title, 
  onMenuToggle,
  sites = initialSites,
  onAddSite
}: HeaderProps) {
  const [showBellNotification, setShowBellNotification] = useState(false);
  const [showMessageNotification, setShowMessageNotification] = useState(false);

  // States for creation modal
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newSalonName, setNewSalonName] = useState('');
  const [newSalonDomain, setNewSalonDomain] = useState('');
  const [newSalonColor, setNewSalonColor] = useState('#10B981'); // Emerald default
  const [newSalonDescription, setNewSalonDescription] = useState('');
  const [numStands, setNumStands] = useState(12);
  const [errorText, setErrorText] = useState('');

  const activeSiteConfig = sites.find(s => s.id === selectedSite) || sites[0] || initialSites[0];

  const colorPresets = [
    { value: '#10B981', name: 'Émeraude / Vert' },
    { value: '#EC4899', name: 'Rose Beldi / Tunis' },
    { value: '#F59E0B', name: 'Ambre / Or' },
    { value: '#8B5CF6', name: 'Iris / Violet' },
    { value: '#06B6D4', name: 'Bleu Majorelle' },
    { value: '#EAB308', name: 'Safran / Jaune' },
    { value: '#D97706', name: 'Terre Cuite / Bronze' },
    { value: '#EF4444', name: 'Rouge Casablanca' },
  ];

  const handleCreateSalon = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorText('');

    if (!newSalonName.trim()) {
      setErrorText('Le nom du salon est requis.');
      return;
    }

    const generatedId = newSalonName.toLowerCase()
      .replace(/[^a-z0-0]/g, '')
      .replace(/\s+/g, '-')
      .substring(0, 15);

    const slug = generatedId || `salon-${Date.now()}`;

    // Ensure ID uniqueness
    if (sites.some(s => s.id === slug)) {
      setErrorText('Un salon avec un nom similaire existe déjà.');
      return;
    }

    const domain = newSalonDomain.trim() || `${slug}.ma`;

    const newSite: SiteConfig = {
      id: slug,
      name: newSalonName.trim(),
      domain: domain,
      color: newSalonColor,
      secondaryColor: newSalonColor,
      bgGradient: 'from-[#A68A64] to-[#7A6240]',
      description: newSalonDescription.trim() || `Salon professionnel créé pour ${newSalonName.trim()}`,
      logoText: newSalonName.trim().substring(0, 10).toUpperCase()
    };

    if (onAddSite) {
      onAddSite(newSite, numStands);
    }

    // Reset forms & close
    setNewSalonName('');
    setNewSalonDomain('');
    setNewSalonDescription('');
    setNumStands(12);
    setIsCreateModalOpen(false);
  };

  return (
    <header id="header-bar" className="h-20 border-b border-[#E8E6DE] bg-white flex items-center justify-between px-4 sm:px-6 md:px-8 shrink-0 relative z-30 shadow-xs">
      {/* Left section: Breadcrumbs / Title & Global search */}
      <div className="flex items-center gap-3 sm:gap-4 md:gap-6 min-w-0">
        {onMenuToggle && (
          <button 
            type="button"
            onClick={onMenuToggle}
            className="p-2 -ml-1 text-[#2C3E36] hover:text-black hover:bg-[#F0EEE6] rounded-xl lg:hidden transition-all duration-150 shrink-0"
            title="Ouvrir le menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}
        <div className="min-w-0">
          <h2 className="text-xs sm:text-base md:text-xl font-serif font-bold italic text-[#2D2D2D] tracking-tight flex items-center gap-1.5 sm:gap-2 md:gap-3">
            <span className="truncate">{title}</span>
            <span className="text-[9px] md:text-[10px] uppercase tracking-wider font-sans font-bold px-1.5 py-0.5 sm:px-2.5 rounded-full bg-[#F0EEE6] text-[#7A7667] shrink-0">
              v1.0.0
            </span>
          </h2>
        </div>

        {/* Global Search Input */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-[#F8F7F2] rounded-xl border border-[#E8E6DE] max-w-[200px] xl:max-w-[320px] w-full shrink-0">
          <Search className="w-4 h-4 text-[#7A7667]" />
          <input 
            type="text" 
            placeholder="Rechercher..." 
            className="bg-transparent border-none text-xs outline-hidden text-[#2D2D2D] placeholder-[#7A7667]/60 w-full font-sans animate-none"
          />
        </div>
      </div>

      {/* Right section: Multi-site selector & action elements */}
      <div className="flex items-center gap-2 sm:gap-3 md:gap-4 shrink-0">
        
        {/* Real-time Website Context Switcher & Creation Button */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <Globe className="w-3.5 h-3.5 text-[#7A7667]" />
          
          {/* Mobile dropdown context-switcher */}
          <div className="flex xs:hidden">
            <select
              value={selectedSite}
              onChange={(e) => setSelectedSite(e.target.value as SiteId)}
              className="bg-[#F0EEE6] text-[#2D2D2D] border border-[#E8E6DE]/55 rounded-xl px-2 py-1 text-[11px] font-bold outline-hidden cursor-pointer"
            >
              {sites.map((site) => (
                <option key={site.id} value={site.id}>
                  {site.domain}
                </option>
              ))}
            </select>
          </div>

          {/* Desktop segmented control list switcher */}
          <div className="hidden xs:flex bg-[#F0EEE6] p-1 rounded-xl border border-[#E8E6DE]/55">
            {sites.map((site) => {
              const worksAsActive = selectedSite === site.id;
              return (
                <button
                  key={site.id}
                  id={`switcher-btn-${site.id}`}
                  onClick={() => setSelectedSite(site.id)}
                  className={`px-2.5 py-1.5 rounded-lg text-[10px] md:text-[11px] font-semibold transition-all duration-200 flex items-center gap-1.5 cursor-pointer ${
                    worksAsActive 
                      ? 'bg-white text-[#2D2D2D] shadow-xs font-bold' 
                      : 'text-[#7A7667] hover:text-[#2D2D2D] hover:bg-white/40'
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: site.color }}></span>
                  <span className="hidden md:inline">{site.domain}</span>
                  <span className="md:hidden uppercase">{site.id}</span>
                </button>
              );
            })}
          </div>

          {/* Button to create a new salon right next to the select/switcher bar */}
          <button
            type="button"
            onClick={() => setIsCreateModalOpen(true)}
            className="h-[32px] sm:h-[36px] px-2.5 sm:px-3.5 bg-[#A68A64] hover:bg-[#917550] text-white text-[10px] sm:text-[11px] font-bold rounded-xl transition-all shadow-xs cursor-pointer flex items-center gap-1 sm:gap-1.5 border border-[#917550]/20 shrink-0"
            title="Créer un nouveau salon"
          >
            <Plus className="w-3 sm:w-3.5 h-3 sm:h-3.5 font-bold shrink-0" />
            <span className="xs:inline hidden">Créer Salon</span>
            <span className="xs:hidden inline">Nouveau</span>
          </button>
        </div>

        {/* Modal structure for creating a new Salon/Site */}
        {isCreateModalOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-[9999] p-4 animate-fade-in">
            <div className="bg-white border border-[#E8E6DE] rounded-2xl max-w-md w-full shadow-2xl p-6 relative overflow-hidden font-sans">
              
              <button 
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="absolute top-4 right-4 p-1.5 hover:bg-[#F8F7F2] text-[#7A7667] hover:text-[#2D2D2D] rounded-xl transition-all cursor-pointer"
                title="Fermer"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-2 mb-4">
                <div className="p-2 bg-[#A68A64]/10 rounded-xl">
                  <Globe className="w-5 h-5 text-[#A68A64]" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-base text-[#2D2D2D] italic">Créer un Nouveau Salon</h3>
                  <p className="text-[10px] text-[#7A7667]">Configurez un nouvel espace d'exposition interactif.</p>
                </div>
              </div>

              {errorText && (
                <div className="mb-4 p-2.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl font-medium">
                  {errorText}
                </div>
              )}

              <form onSubmit={handleCreateSalon} className="space-y-4 text-left">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-[#7A7667] uppercase tracking-wider block">Nom du Salon *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Piscine & Paysage 2026"
                    value={newSalonName}
                    onChange={(e) => {
                      setNewSalonName(e.target.value);
                      // Auto-domain recommendation
                      if (!newSalonDomain) {
                        const slug = e.target.value.toLowerCase()
                          .replace(/[^a-z0-9]/g, '');
                        if (slug) setNewSalonDomain(`${slug}.ma`);
                      }
                    }}
                    className="w-full p-2.5 bg-[#F8F7F2] border border-[#E8E6DE] rounded-xl text-xs outline-hidden text-[#2D2D2D] font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-[#7A7667] uppercase tracking-wider block">Nom de domaine d'exposition (Optionnel)</label>
                  <input
                    type="text"
                    placeholder="Ex: piscinepaysage.ma"
                    value={newSalonDomain}
                    onChange={(e) => setNewSalonDomain(e.target.value)}
                    className="w-full p-2.5 bg-[#F8F7F2] border border-[#E8E6DE] rounded-xl text-xs outline-hidden text-[#2D2D2D]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-[#7A7667] uppercase tracking-wider block">Description rapide du salon</label>
                  <textarea
                    placeholder="Ex: Le rendez-vous national des installateurs et paysagistes..."
                    value={newSalonDescription}
                    onChange={(e) => setNewSalonDescription(e.target.value)}
                    rows={2}
                    className="w-full p-2.5 bg-[#F8F7F2] border border-[#E8E6DE] rounded-xl text-xs outline-hidden text-[#2D2D2D]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-[#7A7667] uppercase tracking-wider block">Stands à initialiser</label>
                    <input
                      type="number"
                      min={4}
                      max={40}
                      value={numStands}
                      onChange={(e) => setNumStands(parseInt(e.target.value, 10) || 12)}
                      className="w-full p-2.5 bg-[#F8F7F2] border border-[#E8E6DE] rounded-xl text-xs outline-hidden text-[#2D2D2D] font-mono font-bold"
                    />
                    <span className="text-[9px] text-[#7A7667]">Génère des stands S-01, S-02...</span>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-[#7A7667] uppercase tracking-wider block">Thématique Couleur</label>
                    <div className="grid grid-cols-4 gap-1.5 mt-1">
                      {colorPresets.map((preset) => (
                        <button
                          key={preset.value}
                          type="button"
                          onClick={() => setNewSalonColor(preset.value)}
                          className={`w-6 h-6 rounded-full border transition-all relative shrink-0 ${
                            newSalonColor === preset.value ? 'ring-2 ring-[#A68A64] ring-offset-1 scale-110' : 'hover:scale-105'
                          }`}
                          style={{ backgroundColor: preset.value }}
                          title={preset.name}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-[#E8E6DE] flex justify-end gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => setIsCreateModalOpen(false)}
                    className="px-4 py-2 hover:bg-[#F8F7F2] text-[#7A7667] font-bold rounded-xl transition-all cursor-pointer border border-transparent"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-[#A68A64] hover:bg-[#917550] text-white font-bold rounded-xl transition-all shadow-xs cursor-pointer border border-[#917550]/20"
                  >
                    Enregistrer le Salon
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Action icons */}
        <div className="flex items-center gap-1.5 sm:gap-2 md:gap-2.5 border-l border-slate-200 pl-2 sm:pl-4">
          {/* Calendar Indicator */}
          <button 
            title="Calendrier des Salons"
            className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-all"
          >
            <Calendar className="w-4 h-4" />
          </button>

          {/* Email Messages alert bubble */}
          <div className="relative">
            <button 
              onClick={() => setShowMessageNotification(!showMessageNotification)}
              className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-all"
            >
              <Mail className="w-4 h-4" />
              <span className="absolute top-0.5 right-0.5 w-4 h-4 bg-blue-500 text-white font-mono font-bold text-[9px] flex items-center justify-center rounded-full">
                5
              </span>
            </button>
            {showMessageNotification && (
              <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-slate-200 p-4 z-50 text-slate-700">
                <h4 className="font-semibold text-xs border-b pb-2 mb-2 flex justify-between items-center text-slate-800">
                  <span>Messages Récents (CRM)</span>
                  <span className="text-[10px] text-blue-500">Marquer lu</span>
                </h4>
                <div className="space-y-3 max-h-60 overflow-y-auto text-xs">
                  <div className="p-1.5 hover:bg-slate-50 rounded-lg transition-all">
                    <p className="font-medium text-slate-800">Khadija Bennani — AquaPools</p>
                    <p className="text-[10px] text-slate-400">Demande d'informations complémentaires stand angle.</p>
                  </div>
                  <div className="p-1.5 hover:bg-slate-50 rounded-lg transition-all">
                    <p className="font-medium text-slate-800">Karim Slaoui — Nature & Paysage</p>
                    <p className="text-[10px] text-slate-400">Demande de modification d'articles sur le devis.</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Regular Alert Bell alerts count */}
          <div className="relative">
            <button 
              onClick={() => setShowBellNotification(!showBellNotification)}
              className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-all"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-0.5 right-0.5 w-4 h-4 bg-amber-500 text-white font-mono font-bold text-[9px] flex items-center justify-center rounded-full animate-bounce">
                12
              </span>
            </button>
            {showBellNotification && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-slate-200 p-4 z-50 text-slate-700">
                <h4 className="font-semibold text-xs border-b pb-2 mb-2 flex justify-between items-center text-slate-800">
                  <span>Notifications d'activité</span>
                  <span className="text-[10px] text-amber-600">Tout effacer</span>
                </h4>
                <div className="space-y-3 max-h-64 overflow-y-auto text-xs">
                  <div className="flex gap-2.5 items-start p-1.5 border-b border-slate-100 last:border-0">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-slate-800 font-medium">Stand A18 Vendu !</p>
                      <p className="text-[10px] text-slate-400">Deco Jardin a signé le devis DEV-2024-152.</p>
                    </div>
                  </div>
                  <div className="flex gap-2.5 items-start p-1.5 border-b border-slate-100 last:border-0">
                    <div className="w-2.5 h-2.5 bg-amber-400 rounded-full mt-1.5 shrink-0 animate-ping"></div>
                    <div>
                      <p className="text-slate-800 font-medium font-sans">Nouveau Prospect Enregistré</p>
                      <p className="text-[10px] text-slate-400">Mehdi Naciri pour le Garden Expo.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
