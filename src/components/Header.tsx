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
  CheckCircle2
} from 'lucide-react';
import { SiteId, SiteConfig } from '../types';
import { initialSites } from '../initialData';

interface HeaderProps {
  selectedSite: SiteId;
  setSelectedSite: (siteId: SiteId) => void;
  title: string;
}

export default function Header({ selectedSite, setSelectedSite, title }: HeaderProps) {
  const [showBellNotification, setShowBellNotification] = useState(false);
  const [showMessageNotification, setShowMessageNotification] = useState(false);

  const activeSiteConfig = initialSites.find(s => s.id === selectedSite) || initialSites[0];

  return (
    <header id="header-bar" className="h-20 border-b border-[#E8E6DE] bg-white flex items-center justify-between px-8 shrink-0 relative z-30 shadow-xs">
      {/* Left section: Breadcrumbs / Title & Global search */}
      <div className="flex items-center gap-6">
        <div>
          <h2 className="text-xl font-serif font-bold italic text-[#2D2D2D] tracking-tight flex items-center gap-3">
            <span>{title}</span>
            <span className="text-[10px] uppercase tracking-wider font-sans font-bold px-2.5 py-0.5 rounded-full bg-[#F0EEE6] text-[#7A7667]">
              v1.0.0
            </span>
          </h2>
        </div>

        {/* Global Search Input */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-[#F8F7F2] rounded-xl border border-[#E8E6DE] max-w-[320px] w-full shrink-0">
          <Search className="w-4 h-4 text-[#7A7667]" />
          <input 
            type="text" 
            placeholder="Rechercher prospect, devis, stand..." 
            className="bg-transparent border-none text-xs outline-hidden text-[#2D2D2D] placeholder-[#7A7667]/60 w-full font-sans animate-none"
          />
          <kbd className="text-[10px] bg-white border border-[#E8E6DE] text-[#7A7667] font-mono px-1.5 rounded-md shadow-2xs">⌘K</kbd>
        </div>
      </div>

      {/* Right section: Multi-site selector & action elements */}
      <div className="flex items-center gap-5">
        {/* Real-time Website Context Switcher */}
        <div className="flex items-center gap-2">
          <Globe className="w-4 h-4 text-[#7A7667]" />
          <div className="flex bg-[#F0EEE6] p-1 rounded-xl border border-[#E8E6DE]/55">
            {initialSites.map((site) => {
              const worksAsActive = selectedSite === site.id;
              return (
                <button
                  key={site.id}
                  id={`switcher-btn-${site.id}`}
                  onClick={() => setSelectedSite(site.id)}
                  className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all duration-200 flex items-center gap-1.5 cursor-pointer ${
                    worksAsActive 
                      ? 'bg-white text-[#2D2D2D] shadow-xs font-bold' 
                      : 'text-[#7A7667] hover:text-[#2D2D2D] hover:bg-white/40'
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: site.color }}></span>
                  <span>{site.domain}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-2.5 border-l border-slate-200 pl-4">
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
