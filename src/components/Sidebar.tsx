/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  BarChart3, 
  Users, 
  UserSquare2, 
  FileText, 
  Receipt, 
  Clock, 
  FileSignature,
  Tent, 
  Map, 
  Grid3X3, 
  Ticket, 
  Mail, 
  Layers, 
  LayoutTemplate, 
  TrendingUp, 
  BookOpen, 
  Scale, 
  PiggyBank, 
  FolderLock, 
  UserCheck, 
  Settings, 
  Database,
  Menu,
  ChevronRight,
  Sparkles,
  LogOut
} from 'lucide-react';
import { SiteId } from '../types';

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  selectedSite: SiteId;
  onOpenMobileMenu?: () => void;
  onLogout?: () => void;
}

export default function Sidebar({ currentTab, setCurrentTab, selectedSite, onLogout }: SidebarProps) {
  // Helper to determine text and icons based on active classes
  const getLinkClass = (tabId: string) => {
    const isSelected = currentTab === tabId;
    return `flex items-center gap-3 px-4 py-2.5 text-[13px] rounded-xl border transition-all duration-200 ${
      isSelected 
        ? 'bg-white/10 text-white font-semibold border-white/10 shadow-sm' 
        : 'text-[#93A392] border-transparent hover:text-white hover:bg-white/5'
    }`;
  };

  return (
    <aside id="sidebar-panel" className="w-[240px] bg-[#2C3E36] text-white flex flex-col h-full shrink-0 select-none border-r border-[#25352E]/30">
      {/* Brand Header */}
      <div className="h-20 px-4 border-b border-[#25352E] flex items-center gap-2.5">
        <div className="w-11 h-11 bg-[#A68A64] rounded-xl flex items-center justify-center font-serif font-black text-white text-base tracking-tight select-none shrink-0 leading-none">
          R2H
        </div>
        <div className="flex flex-col min-w-0">
          <span className="font-serif font-black text-white tracking-tight text-xs md:text-sm leading-tight truncate">R2H Communication</span>
          <span className="text-[9px] text-[#93A392] uppercase tracking-wider font-bold flex items-center gap-1.5 mt-0.5">
            <span className="w-1.5 h-1.5 bg-[#A68A64] rounded-full animate-pulse shrink-0"></span>
            SOCIÉTÉ GLOBALE
          </span>
        </div>
      </div>

      {/* Sidebar Items Scroller */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
        {/* Core Dashboard Group */}
        <div className="space-y-1">
          <p className="px-3 text-[10px] font-bold text-[#6E8B7E] uppercase tracking-widest pb-1">Main Dashboard</p>
          <button 
            id="nav-dashboard"
            onClick={() => setCurrentTab('dashboard')} 
            className={getLinkClass('dashboard')}
          >
            <BarChart3 className="w-4 h-4 text-[#A68A64]" />
            <span>Vue d'ensemble</span>
          </button>
        </div>

        {/* Commercial Section */}
        <div className="space-y-1">
          <p className="px-3 text-[10px] font-bold text-[#6E8B7E] uppercase tracking-widest pb-1">Commercial & CRM</p>
          <button 
            id="nav-prospects"
            onClick={() => setCurrentTab('prospects')} 
            className={getLinkClass('prospects')}
          >
            <Users className="w-4 h-4 text-[#A68A64]" />
            <span>Prospects</span>
          </button>
          <button 
            id="nav-clients"
            onClick={() => setCurrentTab('clients')} 
            className={getLinkClass('clients')}
          >
            <UserSquare2 className="w-4 h-4 text-[#A68A64]" />
            <span>Clients & Exposants</span>
          </button>
          <button 
            id="nav-devis"
            onClick={() => setCurrentTab('devis')} 
            className={getLinkClass('devis')}
          >
            <FileText className="w-4 h-4 text-[#A68A64]" />
            <span>Devis récents</span>
          </button>
          <button 
            id="nav-factures"
            onClick={() => setCurrentTab('factures')} 
            className={getLinkClass('factures')}
          >
            <Receipt className="w-4 h-4 text-[#A68A64]" />
            <span>Factures & TVA</span>
          </button>
        </div>

        {/* Shows & Salons and Floor plans */}
        <div className="space-y-1">
          <p className="px-3 text-[10px] font-bold text-[#6E8B7E] uppercase tracking-widest pb-1">Salons & Événements</p>
          <button 
            id="nav-stands"
            onClick={() => setCurrentTab('stands')} 
            className={getLinkClass('stands')}
          >
            <Grid3X3 className="w-4 h-4 text-[#A68A64]" />
            <span>Plan du salon & Stands</span>
          </button>
        </div>

        {/* Marketing campaign drafers */}
        <div className="space-y-1">
          <p className="px-3 text-[10px] font-bold text-[#6E8B7E] uppercase tracking-widest pb-1">Marketing IA</p>
          <button 
            id="nav-marketing"
            onClick={() => setCurrentTab('marketing')} 
            className={getLinkClass('marketing')}
          >
            <Sparkles className="w-4 h-4 text-[#A68A64]" />
            <span>Rédacteur d'Emails IA</span>
          </button>
        </div>

        {/* Settings Group */}
        <div className="space-y-1">
          <p className="px-3 text-[10px] font-bold text-[#6E8B7E] uppercase tracking-widest pb-1">Paramètres</p>
          <button 
            id="nav-parametres"
            onClick={() => setCurrentTab('parametres')} 
            className={getLinkClass('parametres')}
          >
            <Settings className="w-4 h-4 text-[#93A392]" />
            <span>Configuration</span>
          </button>
        </div>
      </div>

      {/* User profile footer */}
      <div className="p-5 border-t border-[#25352E] bg-[#25352E] flex items-center gap-3">
        <div className="relative">
          <img 
            src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop&crop=faces" 
            alt="Youssef" 
            referrerPolicy="no-referrer"
            className="w-10 h-10 rounded-full border border-[#3F594F]"
          />
          <div className="absolute right-0 bottom-0 w-2.5 h-2.5 bg-[#A68A64] border-2 border-[#25352E] rounded-full"></div>
        </div>
        <div className="flex-1 overflow-hidden font-sans">
          <h4 className="text-xs font-semibold text-white truncate">Youssef Admin</h4>
          <p className="text-[10px] text-[#93A392] truncate">Directeur Général</p>
        </div>
        {onLogout && (
          <button 
            onClick={onLogout}
            title="Se déconnecter de l'administration"
            className="p-2 text-[#93A392] hover:text-white hover:bg-white/10 rounded-lg transition-all cursor-pointer outline-hidden shrink-0"
          >
            <LogOut className="w-4.5 h-4.5" />
          </button>
        )}
      </div>
    </aside>
  );
}
