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
  AlertCircle,
  Download
} from 'lucide-react';
import { SiteId, SiteConfig, Stand, Contact, Transaction, Task } from '../types';
import { initialSites } from '../initialData';

interface DashboardViewProps {
  selectedSite: SiteId;
  stands: Stand[];
  setStands: React.Dispatch<React.SetStateAction<Stand[]>>;
  contacts: Contact[];
  setContacts?: React.Dispatch<React.SetStateAction<Contact[]>>;
  transactions: Transaction[];
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  setCurrentTab: (tab: string) => void;
  sites?: SiteConfig[];
}

export default function DashboardView({
  selectedSite,
  stands,
  setStands,
  contacts,
  setContacts,
  transactions,
  tasks,
  setTasks,
  setCurrentTab,
  sites
}: DashboardViewProps) {
  const sitesList = sites || initialSites;

  // Local states for the stand reservation modal
  const [selectedStand, setSelectedStand] = useState<Stand | null>(null);
  const [editCompany, setEditCompany] = useState('');
  const [editClient, setEditClient] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editStatus, setEditStatus] = useState<'disponible' | 'reserve' | 'vendu' | 'sponsorise'>('disponible');
  const [editNotes, setEditNotes] = useState('');
  const [editStandType, setEditStandType] = useState<'surface_nue' | 'equipe' | 'personalise'>('surface_nue');
  const [editExceptionalPrice, setEditExceptionalPrice] = useState<string>('');
  const [showNotification, setShowNotification] = useState<string | null>(null);

  // Determine current floor plan site (since R2H aggregates, default floor plan view is Garden Expo)
  const [activeFloorPlanSite, setActiveFloorPlanSite] = useState<string>(
    selectedSite === 'r2h' ? 'gardenexpo' : selectedSite
  );

  // Sync state if chosen site changes
  React.useEffect(() => {
    if (selectedSite !== 'r2h') {
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

  // Export and download floor plan as a high-fidelity vector SVG blueprint file
  const downloadPlanAsSvg = (site: 'gardenexpo' | 'africapool') => {
    let svgContent = '';
    const dateStr = new Date().toLocaleDateString('fr-FR');
    
    if (site === 'gardenexpo') {
      const siteStands = stands.filter(s => s.site === 'gardenexpo');
      const total = siteStands.length;
      const sold = siteStands.filter(s => s.status === 'vendu').length;
      const reserved = siteStands.filter(s => s.status === 'reserve').length;
      const sponsored = siteStands.filter(s => s.status === 'sponsorise').length;
      const free = siteStands.filter(s => s.status === 'disponible').length;
      
      svgContent = `<?xml version="1.0" encoding="utf-8"?>
<svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 780" width="100%" height="100%" style="background-color: #F8F7F2; font-family: 'Inter', system-ui, -apple-system, sans-serif;">
  <style>
    .title { font-family: 'Playfair Display', serif; font-size: 24px; font-weight: 900; fill: #2D2D2D; }
    .subtitle { font-size: 11px; fill: #7A7667; letter-spacing: 1px; font-weight: bold; text-transform: uppercase; }
    .meta-box { font-size: 10px; font-weight: bold; }
    .hall-label { font-family: 'Playfair Display', serif; font-size: 12px; font-weight: bold; fill: #7E8F7A; letter-spacing: 2px; }
    .stand-label { font-size: 11px; font-weight: bold; font-family: monospace; }
    .stand-sub { font-size: 8px; font-weight: bold; }
    .legend-text { font-size: 10px; font-weight: bold; fill: #2D2D2D; }
  </style>

  <rect x="0" y="0" width="1000" height="780" fill="#F8F7F2"/>
  <rect x="30" y="30" width="940" height="720" rx="20" fill="#FFFFFF" stroke="#E8E6DE" stroke-width="1.5"/>
  
  <text x="60" y="75" class="title">GARDEN EXPO AFRICA 2025</text>
  <text x="60" y="95" class="subtitle">PLAN D'EXPOSITION OFFICIEL — CASABLANCA</text>
  
  <g transform="translate(620, 55)">
    <rect x="0" y="0" width="320" height="55" rx="8" fill="#F8F7F2" stroke="#E8E6DE" stroke-width="1"/>
    <text x="15" y="20" class="meta-box" fill="#2D2D2D">Stands de l'exposition :</text>
    <text x="15" y="40" class="meta-box" fill="#065F46">● Libre : ${free}</text>
    <text x="100" y="40" class="meta-box" fill="#92400E">● Réservé : ${reserved}</text>
    <text x="195" y="40" class="meta-box" fill="#991B1B">● Vendu : ${sold}</text>
    <text x="270" y="40" class="meta-box" fill="#6B21A8">● Spons. : ${sponsored}</text>
    <text x="240" y="20" class="meta-box" fill="#2D2D2D">Export : ${dateStr}</text>
  </g>

  <text x="500" y="145" class="hall-label" text-anchor="middle">- Hall A - Pôle Principal Expo -</text>
  
  <g transform="translate(60, 160)">
    ${rowTop.map((s, idx) => {
      const cx = idx * 98;
      const cy = 10;
      const fill = s.status === 'disponible' ? '#E6F4EA' : s.status === 'reserve' ? '#FEF3C7' : s.status === 'vendu' ? '#FEE2E2' : '#F3E8FF';
      const stroke = s.status === 'disponible' ? '#A3E635' : s.status === 'reserve' ? '#FBBF24' : s.status === 'vendu' ? '#F87171' : '#C084FC';
      const textCol = s.status === 'disponible' ? '#065F46' : s.status === 'reserve' ? '#92400E' : s.status === 'vendu' ? '#991B1B' : '#6B21A8';
      const details = s.companyName ? (s.companyName.length > 12 ? s.companyName.substring(0, 11) + '..' : s.companyName) : 'Disponible';
      return `
    <g transform="translate(${cx}, ${cy})">
      <rect x="0" y="0" width="88" height="90" rx="8" fill="${fill}" stroke="${stroke}" stroke-width="1.5"/>
      <text x="44" y="25" class="stand-label" fill="${textCol}" text-anchor="middle">${s.num}</text>
      <circle cx="44" cy="40" r="3" fill="${textCol}"/>
      <text x="44" y="65" class="stand-sub" fill="#4B5563" text-anchor="middle">${details}</text>
      <text x="44" y="78" class="stand-sub" fill="#9CA3AF" text-anchor="middle">${s.area}m²</text>
    </g>`;
    }).join('')}

    ${rowLeft.map((s, idx) => {
      const cx = 0;
      const cy = 120 + idx * 78;
      const fill = s.status === 'disponible' ? '#E6F4EA' : s.status === 'reserve' ? '#FEF3C7' : s.status === 'vendu' ? '#FEE2E2' : '#F3E8FF';
      const stroke = s.status === 'disponible' ? '#A3E635' : s.status === 'reserve' ? '#FBBF24' : s.status === 'vendu' ? '#F87171' : '#C084FC';
      const textCol = s.status === 'disponible' ? '#065F46' : s.status === 'reserve' ? '#92400E' : s.status === 'vendu' ? '#991B1B' : '#6B21A8';
      const details = s.companyName ? (s.companyName.length > 20 ? s.companyName.substring(0, 18) + '..' : s.companyName) : 'Disponible';
      return `
    <g transform="translate(${cx}, ${cy})">
      <rect x="0" y="0" width="130" height="66" rx="8" fill="${fill}" stroke="${stroke}" stroke-width="1.5"/>
      <text x="65" y="25" class="stand-label" fill="${textCol}" text-anchor="middle">${s.num}</text>
      <text x="65" y="45" class="stand-sub" fill="#4B5563" text-anchor="middle">${details}</text>
      <text x="65" y="56" class="stand-sub" fill="#9CA3AF" text-anchor="middle">${s.area}m²</text>
    </g>`;
    }).join('')}

    ${rowRight.map((s, idx) => {
      const cx = 750;
      const cy = 120 + idx * 115;
      const fill = s.status === 'disponible' ? '#E6F4EA' : s.status === 'reserve' ? '#FEF3C7' : s.status === 'vendu' ? '#FEE2E2' : '#F3E8FF';
      const stroke = s.status === 'disponible' ? '#A3E635' : s.status === 'reserve' ? '#FBBF24' : s.status === 'vendu' ? '#F87171' : '#C084FC';
      const textCol = s.status === 'disponible' ? '#065F46' : s.status === 'reserve' ? '#92400E' : s.status === 'vendu' ? '#991B1B' : '#6B21A8';
      const details = s.companyName ? (s.companyName.length > 20 ? s.companyName.substring(0, 18) + '..' : s.companyName) : 'Disponible';
      return `
    <g transform="translate(${cx}, ${cy})">
      <rect x="0" y="0" width="130" height="95" rx="8" fill="${fill}" stroke="${stroke}" stroke-width="1.5"/>
      <text x="65" y="30" class="stand-label" fill="${textCol}" text-anchor="middle">${s.num}</text>
      <text x="65" y="55" class="stand-sub" fill="#4B5563" text-anchor="middle">${details}</text>
      <text x="65" y="75" class="stand-sub" fill="#9CA3AF" text-anchor="middle">${s.area}m²</text>
    </g>`;
    }).join('')}

    ${midCluster1.map((s, idx) => {
      const cx = 170;
      const cy = 120 + idx * 115;
      const fill = s.status === 'disponible' ? '#E6F4EA' : s.status === 'reserve' ? '#FEF3C7' : s.status === 'vendu' ? '#FEE2E2' : '#F3E8FF';
      const stroke = s.status === 'disponible' ? '#A3E635' : s.status === 'reserve' ? '#FBBF24' : s.status === 'vendu' ? '#F87171' : '#C084FC';
      const textCol = s.status === 'disponible' ? '#065F46' : s.status === 'reserve' ? '#92400E' : s.status === 'vendu' ? '#991B1B' : '#6B21A8';
      const details = s.companyName ? (s.companyName.length > 24 ? s.companyName.substring(0, 22) + '..' : s.companyName) : 'Disponible';
      return `
    <g transform="translate(${cx}, ${cy})">
      <rect x="0" y="0" width="160" height="95" rx="8" fill="${fill}" stroke="${stroke}" stroke-width="1.5"/>
      <text x="80" y="30" class="stand-label" fill="${textCol}" text-anchor="middle">${s.num}</text>
      <text x="80" y="55" class="stand-sub" fill="#4B5563" text-anchor="middle">${details}</text>
      <text x="80" y="75" class="stand-sub" fill="#9CA3AF" text-anchor="middle">${s.area}m²</text>
    </g>`;
    }).join('')}

    ${midCluster2.map((s, idx) => {
      const cx = 360 + idx * 122;
      const cy = 120;
      const fill = s.status === 'disponible' ? '#E6F4EA' : s.status === 'reserve' ? '#FEF3C7' : s.status === 'vendu' ? '#FEE2E2' : '#F3E8FF';
      const stroke = s.status === 'disponible' ? '#A3E635' : s.status === 'reserve' ? '#FBBF24' : s.status === 'vendu' ? '#F87171' : '#C084FC';
      const textCol = s.status === 'disponible' ? '#065F46' : s.status === 'reserve' ? '#92400E' : s.status === 'vendu' ? '#991B1B' : '#6B21A8';
      const details = s.companyName ? (s.companyName.length > 15 ? s.companyName.substring(0, 13) + '..' : s.companyName) : 'Disponible';
      return `
    <g transform="translate(${cx}, ${cy})">
      <rect x="0" y="0" width="112" height="95" rx="8" fill="${fill}" stroke="${stroke}" stroke-width="1.5"/>
      <text x="56" y="30" class="stand-label" fill="${textCol}" text-anchor="middle">${s.num}</text>
      <text x="56" y="55" class="stand-sub" fill="#4B5563" text-anchor="middle">${details}</text>
      <text x="56" y="75" class="stand-sub" fill="#9CA3AF" text-anchor="middle">${s.area}m²</text>
    </g>`;
    }).join('')}

    ${specialMid.map((s, idx) => {
      const cx = 360 + idx * 185;
      const cy = 235;
      const fill = s.status === 'disponible' ? '#E6F4EA' : s.status === 'reserve' ? '#FEF3C7' : s.status === 'vendu' ? '#FEE2E2' : '#F3E8FF';
      const stroke = s.status === 'disponible' ? '#A3E635' : s.status === 'reserve' ? '#FBBF24' : s.status === 'vendu' ? '#F87171' : '#C084FC';
      const textCol = s.status === 'disponible' ? '#065F46' : s.status === 'reserve' ? '#92400E' : s.status === 'vendu' ? '#991B1B' : '#6B21A8';
      const details = s.companyName ? (s.companyName.length > 24 ? s.companyName.substring(0, 22) + '..' : s.companyName) : 'Disponible';
      return `
    <g transform="translate(${cx}, ${cy})">
      <rect x="0" y="0" width="175" height="110" rx="8" fill="${fill}" stroke="${stroke}" stroke-width="1.5"/>
      <text x="87.5" y="35" class="stand-label" fill="${textCol}" text-anchor="middle">${s.num}</text>
      <text x="87.5" y="65" class="stand-sub" fill="#4B5563" text-anchor="middle">${details}</text>
      <text x="87.5" y="85" class="stand-sub" fill="#9CA3AF" text-anchor="middle">${s.area}m²</text>
    </g>`;
    }).join('')}

    ${rowBottom.map((s, idx) => {
      const cx = idx * 125;
      const cy = 370;
      const fill = s.status === 'disponible' ? '#E6F4EA' : s.status === 'reserve' ? '#FEF3C7' : s.status === 'vendu' ? '#FEE2E2' : '#F3E8FF';
      const stroke = s.status === 'disponible' ? '#A3E635' : s.status === 'reserve' ? '#FBBF24' : s.status === 'vendu' ? '#F87171' : '#C084FC';
      const textCol = s.status === 'disponible' ? '#065F46' : s.status === 'reserve' ? '#92400E' : s.status === 'vendu' ? '#991B1B' : '#6B21A8';
      const details = s.companyName ? (s.companyName.length > 18 ? s.companyName.substring(0, 16) + '..' : s.companyName) : 'Disponible';
      return `
    <g transform="translate(${cx}, ${cy})">
      <rect x="0" y="0" width="112" height="95" rx="8" fill="${fill}" stroke="${stroke}" stroke-width="1.5"/>
      <text x="56" y="30" class="stand-label" fill="${textCol}" text-anchor="middle">${s.num}</text>
      <text x="56" y="55" class="stand-sub" fill="#4B5563" text-anchor="middle">${details}</text>
      <text x="56" y="75" class="stand-sub" fill="#9CA3AF" text-anchor="middle">${s.area}m²</text>
    </g>`;
    }).join('')}
  </g>

  <g transform="translate(60, 670)">
    <line x1="0" y1="0" x2="880" y2="0" stroke="#E8E6DE" stroke-dasharray="2,2"/>
    
    <rect x="0" y="20" width="15" height="15" rx="3" fill="#E6F4EA" stroke="#A3E635"/>
    <text x="22" y="32" class="legend-text">Libre (Sols Intérieurs / Pépinière)</text>

    <rect x="250" y="20" width="15" height="15" rx="3" fill="#FEF3C7" stroke="#FBBF24"/>
    <text x="272" y="32" class="legend-text">Option Réservée (Option client)</text>

    <rect x="500" y="20" width="15" height="15" rx="3" fill="#FEE2E2" stroke="#F87171"/>
    <text x="522" y="32" class="legend-text">Vendu officiel (Exposant)</text>

    <rect x="730" y="20" width="15" height="15" rx="3" fill="#F3E8FF" stroke="#C084FC"/>
    <text x="752" y="32" class="legend-text">Sponsorisé / Partenariat</text>
    
    <text x="440" y="60" font-size="8.5" fill="#7A7667" text-anchor="middle" font-weight="semibold">R2H COMMUNICATION © TOUS DROITS RÉSERVÉS - PORTAIL TECHNIQUE WORKSPACE DU SALON</text>
  </g>
</svg>
`;
    } else {
      const siteStands = stands.filter(s => s.site === 'africapool');
      const total = siteStands.length;
      const sold = siteStands.filter(s => s.status === 'vendu').length;
      const reserved = siteStands.filter(s => s.status === 'reserve').length;
      const sponsored = siteStands.filter(s => s.status === 'sponsorise').length;
      const free = siteStands.filter(s => s.status === 'disponible').length;

      const cols = {
        A: poolColA,
        B: poolColB,
        C: poolColC,
        D: poolColD,
        E: poolColE,
        F: poolColF,
        G: poolColG,
        H: poolColH
      };

      svgContent = `<?xml version="1.0" encoding="utf-8"?>
<svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1280 880" width="100%" height="100%" style="background-color: #F8F7F2; font-family: 'Inter', system-ui, -apple-system, sans-serif;">
  <style>
    .title { font-family: 'Playfair Display', serif; font-size: 24px; font-weight: 900; fill: #2D2D2D; }
    .subtitle { font-size: 11px; fill: #7A7667; letter-spacing: 1px; font-weight: bold; text-transform: uppercase; }
    .col-title { font-size: 11px; font-weight: 900; fill: #2D2D2D; text-anchor: middle; font-family: monospace; }
    .stand-label { font-size: 10px; font-weight: bold; font-family: monospace; }
    .stand-sub { font-size: 8px; font-weight: bold; }
    .legend-text { font-size: 10px; font-weight: bold; fill: #2D2D2D; }
    .meta-box { font-size: 10px; font-weight: bold; }
    .conf-text-head { font-size: 9px; font-weight: 900; fill: #FFFFFF; font-family: sans-serif; letter-spacing: 1px; }
    .conf-text-body { font-size: 7.5px; font-weight: bold; fill: #FFFFFF; opacity: 0.95; }
  </style>

  <rect width="100%" height="100%" fill="#F8F7F2"/>
  <rect x="30" y="30" width="1220" height="820" rx="20" fill="#FFFFFF" stroke="#E8E6DE" stroke-width="1.5"/>

  <text x="60" y="75" class="title">AFRICA POOL &amp; SPA EXPO 2026</text>
  <text x="60" y="95" class="subtitle">PLAN INTERACTIF OFFICIEL DE L'EXPOSITION (OFEC CASABLANCA)</text>

  <g transform="translate(860, 55)">
    <rect x="0" y="0" width="360" height="55" rx="8" fill="#F8F7F2" stroke="#E8E6DE" stroke-width="1"/>
    <text x="15" y="20" class="meta-box" fill="#2D2D2D">Stands de l'exposition :</text>
    <text x="15" y="40" class="meta-box" fill="#065F46">● Libre : ${free}</text>
    <text x="110" y="40" class="meta-box" fill="#92400E">● Réservé : ${reserved}</text>
    <text x="215" y="40" class="meta-box" fill="#991B1B">● Vendu : ${sold}</text>
    <text x="300" y="40" class="meta-box" fill="#6B21A8">● Spons : ${sponsored}</text>
    <text x="255" y="20" class="meta-box" fill="#2D2D2D">Export : ${dateStr}</text>
  </g>

  <g transform="translate(50, 150)">
    ${Object.entries(cols).map(([colName, colStands], colIdx) => {
      const cx = colIdx * 148;
      let renderStandsSvg = '';
      let yOffset = 45;

      if (colName === 'B') {
        renderStandsSvg += `
        <g transform="translate(10, ${yOffset})">
          <rect x="0" y="0" width="114" height="150" rx="8" fill="url(#orangeGrad)" stroke="#C2410C" stroke-width="1.5"/>
          <text x="57" y="55" class="conf-text-head" text-anchor="middle">SALLE</text>
          <text x="57" y="70" class="conf-text-head" text-anchor="middle">DE CONFÉRENCE</text>
          <text x="57" y="85" class="conf-text-head" text-anchor="middle">SPA &amp; BIEN-ÊTRE</text>
          <rect x="33" y="105" width="48" height="18" rx="4" fill="rgba(255,255,255,0.2)"/>
          <text x="57" y="117" class="conf-text-body" font-family="monospace" text-anchor="middle">60 m²</text>
        </g>
        `;
        yOffset += 160;
      }

      colStands.forEach((s) => {
        const fill = s.status === 'disponible' ? '#E6F4EA' : s.status === 'reserve' ? '#FEF3C7' : s.status === 'vendu' ? '#FEE2E2' : '#F3E8FF';
        const stroke = s.status === 'disponible' ? '#A3E635' : s.status === 'reserve' ? '#FBBF24' : s.status === 'vendu' ? '#F87171' : '#C084FC';
        const textCol = s.status === 'disponible' ? '#065F46' : s.status === 'reserve' ? '#92400E' : s.status === 'vendu' ? '#991B1B' : '#6B21A8';
        const height = s.area >= 72 ? 160 : s.area >= 36 ? 85 : 45;
        const details = s.companyName ? (s.companyName.length > 15 ? s.companyName.substring(0, 13) + '..' : s.companyName) : 'Disponible';

        renderStandsSvg += `
        <g transform="translate(10, ${yOffset})">
          <rect x="0" y="0" width="114" height="${height}" rx="8" fill="${fill}" stroke="${stroke}" stroke-width="1.2"/>
          <text x="57" y="${height > 60 ? 25 : 20}" class="stand-label" fill="${textCol}" text-anchor="middle">${s.num}</text>
          <text x="57" y="${height > 60 ? 55 : height - 10}" class="stand-sub" fill="#4B5563" text-anchor="middle" font-size="8">${details}</text>
          \${height > 60 ? \`<text x="57" y="\${height - 20}" class="stand-sub" fill="#9CA3AF" text-anchor="middle">\${s.area}m²</text>\` : ''}
        </g>
        `;
        yOffset += height + 8;
      });

      return `
      <g transform="translate(${cx}, 0)">
        <rect x="0" y="0" width="134" height="600" rx="12" fill="#F3F1E9" fill-opacity="0.5" stroke="#E8E6DE" stroke-width="1"/>
        <rect x="10" y="10" width="114" height="24" rx="6" fill="#FFFFFF" stroke="#E8E6DE" stroke-width="1"/>
        <text x="67" y="26" class="col-title">COLONNE ${colName}</text>
        ${renderStandsSvg}
      </g>`;
    }).join('')}
  </g>

  <defs>
    <linearGradient id="orangeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#F59E0B" />
      <stop offset="100%" stop-color="#EA580C" />
    </linearGradient>
  </defs>

  <g transform="translate(60, 780)">
    <line x1="0" y1="0" x2="1160" y2="0" stroke="#E8E6DE" stroke-dasharray="2,2"/>
    
    <rect x="0" y="20" width="15" height="15" rx="3" fill="#E6F4EA" stroke="#A3E635"/>
    <text x="22" y="32" class="legend-text">Disponible (Équipements &amp; Spas)</text>

    <rect x="300" y="20" width="15" height="15" rx="3" fill="#FEF3C7" stroke="#FBBF24"/>
    <text x="322" y="32" class="legend-text">Option Négociation (Option en cours)</text>

    <rect x="620" y="20" width="15" height="15" rx="3" fill="#FEE2E2" stroke="#F87171"/>
    <text x="642" y="32" class="legend-text">Acheté &amp; Affecté (Exposant officiel)</text>

    <rect x="940" y="20" width="15" height="15" rx="3" fill="#F3E8FF" stroke="#C084FC"/>
    <text x="962" y="32" class="legend-text">Partenaire Premium / Sponsorisé</text>
    
    <text x="580" y="55" font-size="8.5" fill="#7A7667" text-anchor="middle" font-weight="semibold">PORTAIL TECHNIQUE WORKSPACE DE L'EXPOSITION - R2H COMMUNICATION © TOUS DROITS RÉSERVÉS</text>
  </g>
</svg>
`;
    }

    const blob = new Blob([svgContent], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `plan_${site}_${new Date().toISOString().split('T')[0]}.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Click on stand
  const handleSelectStand = (stand: Stand) => {
    setSelectedStand(stand);
    setEditCompany(stand.companyName || '');
    setEditClient(stand.clientName || '');
    setEditCategory(stand.category || '');
    setEditStatus(stand.status);
    setEditNotes(stand.notes || '');
    setEditStandType(stand.standType || 'surface_nue');
    setEditExceptionalPrice(stand.exceptionalPrice ? String(stand.exceptionalPrice) : '');
  };

  // Save stand changes
  const handleSaveStand = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStand) return;

    const parsedPrice = parseFloat(editExceptionalPrice);

    setStands(prev => prev.map(s => {
      if (s.id === selectedStand.id) {
        return {
          ...s,
          status: editStatus,
          companyName: editStatus === 'disponible' ? '' : editCompany,
          clientName: editStatus === 'disponible' ? '' : editClient,
          category: editStatus === 'disponible' ? '' : editCategory,
          notes: editNotes,
          standType: editStandType,
          exceptionalPrice: !isNaN(parsedPrice) && parsedPrice >= 0 ? parsedPrice : undefined
        };
      }
      return s;
    }));

    // Bidirectional sync: propagate changes to the CRM contact list
    if (setContacts) {
      if (editStatus === 'disponible') {
        // Clear stand assignment on matching CRM contact
        setContacts(prev => prev.map(c => {
          if (c.site === selectedSite && c.standNumber?.toLowerCase() === selectedStand.num.toLowerCase()) {
            return {
              ...c,
              standNumber: undefined
            };
          }
          return c;
        }));
      } else {
        // Update or insert a CRM contact
        setContacts(prev => {
          const hasStandMatch = prev.some(c => c.site === selectedSite && c.standNumber?.toLowerCase() === selectedStand.num.toLowerCase());
          
          if (hasStandMatch) {
            return prev.map(c => {
              if (c.site === selectedSite && c.standNumber?.toLowerCase() === selectedStand.num.toLowerCase()) {
                return {
                  ...c,
                  company: editCompany.trim(),
                  name: editClient.trim(),
                  role: editStatus === 'vendu' || editStatus === 'sponsorise' ? 'client' : 'prospect'
                };
              }
              return c;
            });
          } else {
            // Check matching company name with no stand number assigned yet
            const companyMatchIdx = prev.findIndex(c => c.site === selectedSite && c.company.toLowerCase() === editCompany.trim().toLowerCase());
            if (companyMatchIdx !== -1) {
              return prev.map((c, idx) => {
                if (idx === companyMatchIdx) {
                  return {
                    ...c,
                    name: editClient.trim(),
                    role: editStatus === 'vendu' || editStatus === 'sponsorise' ? 'client' : 'prospect',
                    standNumber: selectedStand.num
                  };
                }
                return c;
              });
            } else {
              // Create brand new Contact in the CRM
              const newC: Contact = {
                id: `c_gen_map_${Date.now()}`,
                name: editClient.trim() || 'À désigner',
                company: editCompany.trim() || 'Exposant',
                email: `info@${editCompany.trim().toLowerCase().replace(/[^a-z0-9]/g, '') || 'exposant'}.ma`,
                phone: '+212 660 000 000',
                site: selectedSite,
                role: editStatus === 'vendu' || editStatus === 'sponsorise' ? 'client' : 'prospect',
                dateAdded: new Date().toISOString().split('T')[0],
                notes: `Créé automatiquement lors de la réservation du stand ${selectedStand.num} sur le plan.`,
                standNumber: selectedStand.num
              };
              return [newC, ...prev];
            }
          }
        });
      }
    }

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

  // --- AFRICA POOL & SPA FLOORPLAN LOGIC ---
  // Sort helper for Column A / Column H and others to look perfectly formatted from top to bottom
  const sortPoolStands = (standsList: Stand[]) => {
    return [...standsList].sort((a, b) => {
      // Sort based on numeric row (the number in 'A-1B' or 'H-2B', i.e. 3, 2, 1) to go from top (high) to bottom (low)
      const aParts = a.num.split('-');
      const bParts = b.num.split('-');
      if (aParts.length > 1 && bParts.length > 1) {
        // e.g. "3A" or "3F"
        const aCode = aParts[1];
        const bCode = bParts[1];
        const aRow = parseInt(aCode.charAt(0), 10) || 1;
        const bRow = parseInt(bCode.charAt(0), 10) || 1;
        if (bRow !== aRow) {
          return bRow - aRow; // Row 6 at the top, row 1 at the bottom
        }
        // Sub-letter comparison (F before E before A)
        const aLetter = aCode.substring(1) || '';
        const bLetter = bCode.substring(1) || '';
        return bLetter.localeCompare(aLetter);
      }
      return a.num.localeCompare(b.num);
    });
  };

  const poolColA = sortPoolStands(filteredStands.filter(s => s.num.startsWith('A-')));
  const poolColB = sortPoolStands(filteredStands.filter(s => s.num.startsWith('B-')));
  const poolColC = sortPoolStands(filteredStands.filter(s => s.num.startsWith('C-')));
  const poolColD = sortPoolStands(filteredStands.filter(s => s.num.startsWith('D-')));
  const poolColE = sortPoolStands(filteredStands.filter(s => s.num.startsWith('E-')));
  const poolColF = sortPoolStands(filteredStands.filter(s => s.num.startsWith('F-')));
  const poolColG = sortPoolStands(filteredStands.filter(s => s.num.startsWith('G-')));
  const poolColH = sortPoolStands(filteredStands.filter(s => s.num.startsWith('H-')));

  const getStandColorClasses = (status: 'disponible' | 'reserve' | 'vendu' | 'sponsorise') => {
    switch (status) {
      case 'disponible':
        return 'bg-emerald-50 border-emerald-300 text-emerald-800 hover:bg-emerald-100';
      case 'reserve':
        return 'bg-amber-50/90 border-amber-300 text-amber-800 hover:bg-amber-100';
      case 'vendu':
        return 'bg-rose-50 border-rose-300 text-rose-800 hover:bg-rose-100';
      case 'sponsorise':
        return 'bg-purple-50 border-purple-300 text-purple-800 hover:bg-purple-100';
      default:
        return 'bg-slate-50 border-slate-300 text-slate-800 hover:bg-slate-100';
    }
  };

  const getStatusDotColor = (status: 'disponible' | 'reserve' | 'vendu' | 'sponsorise') => {
    switch (status) {
      case 'disponible': return '#10B981';
      case 'reserve': return '#F59E0B';
      case 'vendu': return '#EF4444';
      case 'sponsorise': return '#8B5CF6';
      default: return '#6B7280';
    }
  };

  const getStandTooltip = (stand: Stand) => {
    let typeName = "Surface Nue";
    if (stand.standType === 'equipe') typeName = "Stand Équipé";
    else if (stand.standType === 'personalise') typeName = "Stand Personnalisé";
    
    let priceText = "";
    if (stand.exceptionalPrice !== undefined && stand.exceptionalPrice !== null && stand.exceptionalPrice > 0) {
      priceText = `${stand.exceptionalPrice.toLocaleString()} MAD (Exceptionnel)`;
    } else {
      let r = stand.pricePerM2 || 2500;
      if (stand.standType === 'equipe') r += 500;
      else if (stand.standType === 'personalise') r += 1200;
      priceText = `${(stand.area * r).toLocaleString()} MAD`;
    }

    const companyStr = stand.companyName ? ` - ${stand.companyName}` : " - Libre";
    return `Stand ${stand.num} (${stand.area}m²)${companyStr}\nType: ${typeName}\nPrix: ${priceText}`;
  };

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
                  <span>Plan Interactif du Salon — {sitesList.find(s => s.id === activeFloorPlanSite)?.name || activeFloorPlanSite.toUpperCase()}</span>
                </h3>
                <p className="text-[11px] text-[#7A7667] mt-0.5">Cliquez sur un pavillon de stand pour administrer l'attribution.</p>
              </div>

              {/* Floor Plan site selection & Download Action */}
              <div className="flex flex-wrap items-center gap-2.5">
                {selectedSite === 'r2h' && (
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-[#7A7667] font-bold font-sans">SALON :</span>
                    <select
                      value={activeFloorPlanSite}
                      onChange={(e) => setActiveFloorPlanSite(e.target.value)}
                      className="text-xs bg-[#F8F7F2] border border-[#E8E6DE] rounded-xl px-2.5 py-1.5 outline-hidden text-[#2D2D2D] font-bold cursor-pointer transition-all hover:bg-[#F1EFE6]"
                    >
                      {sitesList.map(s => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                    </select>
                  </div>
                )}
                
                <button
                  type="button"
                  onClick={() => downloadPlanAsSvg(activeFloorPlanSite)}
                  className="px-3.5 py-1.5 bg-[#A68A64] hover:bg-[#917550] text-white text-[11px] font-bold rounded-xl shadow-sm transition-all cursor-pointer flex items-center gap-1.5 shrink-0 border border-[#917550]/20"
                  title="Télécharger le plan vectoriel SVG haute définition"
                >
                  <Download className="w-3.5 h-3.5 shrink-0" />
                  <span>Télécharger Plan (SVG)</span>
                </button>
              </div>
            </div>

            {/* Simulated Canvas Layout Grid (Hall A/Hall 1 mapping layout) */}
            <div className="bg-[#F8F7F2] border border-[#E8E6DE] rounded-2xl p-4 sm:p-6 relative overflow-x-auto">
              {activeFloorPlanSite === 'gardenexpo' ? (
                <div className="min-w-[620px] max-w-[720px] mx-auto space-y-5">
                  {/* Visual Header Grid indicating rows */}
                  <div className="text-center font-serif font-semibold text-[11px] uppercase tracking-wider text-[#7A7667] mb-2">
                    - Hall A - Pôle Principal Expo Casablanca -
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
                </div>
              ) : activeFloorPlanSite === 'africapool' ? (
                /* --- HIGH FIDELITY LAYOUT REPRESENTATION OF AFRICA POOL & SPA EXPO FROM PDF --- */
                <div className="min-w-[1050px] mx-auto space-y-6">
                  {/* Visual Header Grid */}
                  <div className="text-center font-serif font-black text-[12px] uppercase tracking-wider text-[#7A7667] mb-2 flex items-center justify-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#06B6D4]"></span>
                    <span>AFRICA POOL & SPA EXPO 2026 — PLAN INTERACTIF DE L'EXPOSITION (OFEC CASABLANCA)</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-[#06B6D4]"></span>
                  </div>

                  {/* 8 Columns Grid to mirror the visual schema exactly */}
                  <div className="grid grid-cols-8 gap-3.5 items-stretch">
                    
                    {/* COLUMN A (9m² vertical stands) */}
                    <div className="col-span-1 flex flex-col gap-2 bg-[#F3F1E9]/40 p-2 rounded-xl border border-[#E8E6DE]">
                      <div className="text-center font-black font-mono text-[11px] text-[#2D2D2D] border-b border-[#E8E6DE]/60 pb-1.5 mb-1 bg-white rounded-md py-0.5">COL. A</div>
                      <div className="flex flex-col gap-1.5">
                        {poolColA.map(stand => (
                          <button
                            key={stand.id}
                            onClick={() => handleSelectStand(stand)}
                            className={`border rounded-lg p-1 text-center transition-all cursor-pointer ${getStandColorClasses(stand.status)} flex flex-col justify-between items-center h-12`}
                          >
                            <span className="text-[10px] font-mono font-bold leading-none">{stand.num}</span>
                            <span className="text-[8px] font-sans text-slate-500 scale-95 leading-none truncate w-full" title={stand.companyName}>
                              {stand.companyName ? stand.companyName.substring(0, 8) + '..' : `${stand.area}m²`}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* COLUMN B (Salle de Conférence + B stands) */}
                    <div className="col-span-1 flex flex-col gap-2 bg-[#F3F1E9]/40 p-2 rounded-xl border border-[#E8E6DE]">
                      <div className="text-center font-black font-mono text-[11px] text-[#2D2D2D] border-b border-[#E8E6DE]/60 pb-1.5 mb-1 bg-white rounded-md py-0.5">COL. B</div>
                      <div className="flex flex-col gap-1.5 h-full">
                        {/* SALLE DE CONFÉRENCE (spanning rows 4-6 vertically matching orange block) */}
                        <div className="bg-gradient-to-br from-amber-500 to-orange-600 text-white rounded-lg p-2.5 text-center flex flex-col justify-center items-center h-[178px] shadow-sm border border-orange-700 select-none">
                          <span className="text-[9px] uppercase font-bold tracking-wider leading-none">SALLE</span>
                          <span className="text-[8px] font-medium leading-normal opacity-90">DE CONFÉRENCE</span>
                          <span className="text-[8px] font-mono bg-white/20 px-1 py-0.5 rounded mt-2 text-white">60 m²</span>
                        </div>

                        {/* B stands sorted descending */}
                        {poolColB.map(stand => (
                          <button
                            key={stand.id}
                            onClick={() => handleSelectStand(stand)}
                            className={`border rounded-lg p-2 text-center transition-all cursor-pointer ${getStandColorClasses(stand.status)} flex flex-col justify-between items-center ${stand.area >= 72 ? 'h-[148px] justify-center bg-gray-50' : 'h-[72px]'}`}
                          >
                            <span className="text-[10px] font-mono font-bold leading-tight">{stand.num}</span>
                            <span className="text-[9px] font-sans font-bold leading-normal truncate w-full text-center" title={stand.companyName}>
                              {stand.companyName || (stand.status === 'disponible' ? 'Libre' : 'Réservé')}
                            </span>
                            <span className="text-[8px] font-mono text-slate-500">{stand.area}m²</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* COLUMN C */}
                    <div className="col-span-1 flex flex-col gap-2 bg-[#F3F1E9]/40 p-2 rounded-xl border border-[#E8E6DE]">
                      <div className="text-center font-black font-mono text-[11px] text-[#2D2D2D] border-b border-[#E8E6DE]/60 pb-1.5 mb-1 bg-white rounded-md py-0.5">COL. C</div>
                      <div className="flex flex-col gap-1.5">
                        {/* Row 6 Top stand */}
                        {poolColC.filter(s => s.num === 'C-6A').map(stand => (
                          <button
                            key={stand.id}
                            onClick={() => handleSelectStand(stand)}
                            className={`border rounded-lg p-1.5 text-center transition-all cursor-pointer ${getStandColorClasses(stand.status)} flex flex-col justify-between items-center h-12`}
                          >
                            <span className="text-[10px] font-mono font-bold">{stand.num}</span>
                            <span className="text-[8px] text-slate-500">{stand.area}m²</span>
                          </button>
                        ))}

                        {/* Corridor / Space holder for row 5 */}
                        <div className="border border-dashed border-[#E8E6DE]/80 rounded-lg h-[116px] flex flex-col items-center justify-center bg-white/20 text-[#7A7667]/50 font-mono text-[9px] select-none text-center p-1">
                          <span>Allée</span>
                          <span>Centrale</span>
                        </div>

                        {/* Rest of C stands */}
                        {poolColC.filter(s => s.num !== 'C-6A').map(stand => (
                          <button
                            key={stand.id}
                            onClick={() => handleSelectStand(stand)}
                            className={`border rounded-lg p-2 text-center transition-all cursor-pointer ${getStandColorClasses(stand.status)} flex flex-col justify-between items-center ${stand.area >= 72 ? 'h-[148px] justify-center' : 'h-[72px]'}`}
                          >
                            <span className="text-[10px] font-mono font-bold leading-tight">{stand.num}</span>
                            <span className="text-[9px] font-sans font-bold leading-normal truncate w-full text-center" title={stand.companyName}>
                              {stand.companyName || (stand.status === 'disponible' ? 'Libre' : 'Réservé')}
                            </span>
                            <span className="text-[8px] font-mono text-slate-500">{stand.area}m²</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* COLUMN D */}
                    <div className="col-span-1 flex flex-col gap-2 bg-[#F3F1E9]/40 p-2 rounded-xl border border-[#E8E6DE]">
                      <div className="text-center font-black font-mono text-[11px] text-[#2D2D2D] border-b border-[#E8E6DE]/60 pb-1.5 mb-1 bg-white rounded-md py-0.5">COL. D</div>
                      <div className="flex flex-col gap-1.5">
                        {/* Row 6 Small stands */}
                        <div className="grid grid-cols-3 gap-0.5">
                          {poolColD.filter(s => ['D-6A', 'D-6B', 'D-6C'].includes(s.num)).map(stand => (
                            <button
                              key={stand.id}
                              onClick={() => handleSelectStand(stand)}
                              className={`border rounded-md p-1 text-center transition-all cursor-pointer ${getStandColorClasses(stand.status)} flex flex-col justify-center items-center h-9`}
                            >
                              <span className="text-[8px] font-mono font-bold leading-none">{stand.num.substring(2)}</span>
                              <span className="text-[7px] text-slate-500 leading-none">{stand.area}m²</span>
                            </button>
                          ))}
                        </div>

                        {/* Row 5 Small stands */}
                        <div className="grid grid-cols-2 gap-1">
                          {poolColD.filter(s => ['D-5A', 'D-5B'].includes(s.num)).map(stand => (
                            <button
                              key={stand.id}
                              onClick={() => handleSelectStand(stand)}
                              className={`border rounded-md p-1 text-center transition-all cursor-pointer ${getStandColorClasses(stand.status)} flex flex-col justify-center items-center h-9`}
                            >
                              <span className="text-[8px] font-mono font-bold leading-none">{stand.num.substring(2)}</span>
                              <span className="text-[7px] text-slate-500 leading-none">{stand.area}m²</span>
                            </button>
                          ))}
                        </div>

                        {/* Row 4 stands */}
                        <div className="flex flex-col gap-1">
                          {poolColD.filter(s => ['D-4A', 'D-4B', 'D-4C'].includes(s.num)).map(stand => (
                            <button
                              key={stand.id}
                              onClick={() => handleSelectStand(stand)}
                              className={`border rounded-md p-1 text-center transition-all cursor-pointer ${getStandColorClasses(stand.status)} flex items-center justify-between h-[34px]`}
                            >
                              <span className="text-[9px] font-mono font-bold leading-none shrink-0">{stand.num.substring(2)}</span>
                              <span className="text-[8px] font-sans truncate text-slate-500 font-semibold pl-1 leading-none text-right" title={stand.companyName}>
                                {stand.companyName || `${stand.area}m²`}
                              </span>
                            </button>
                          ))}
                        </div>

                        {/* Big central stands (D-3A, D-2A, D-1A) */}
                        {poolColD.filter(s => !['D-6A', 'D-6B', 'D-6C', 'D-5A', 'D-5B', 'D-4A', 'D-4B', 'D-4C'].includes(s.num)).map(stand => (
                          <button
                            key={stand.id}
                            onClick={() => handleSelectStand(stand)}
                            className={`border rounded-lg p-2.5 text-center transition-all cursor-pointer ${getStandColorClasses(stand.status)} flex flex-col justify-between items-center h-[148px] justify-center`}
                          >
                            <span className="text-[10px] font-mono font-bold leading-tight">{stand.num}</span>
                            <span className="text-[9px] font-sans font-bold leading-normal truncate w-full text-center" title={stand.companyName}>
                              {stand.companyName || (stand.status === 'disponible' ? 'Libre' : 'Réservé')}
                            </span>
                            <span className="text-[8px] font-mono text-slate-500">{stand.area}m²</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* COLUMN E */}
                    <div className="col-span-1 flex flex-col gap-2 bg-[#F3F1E9]/40 p-2 rounded-xl border border-[#E8E6DE]">
                      <div className="text-center font-black font-mono text-[11px] text-[#2D2D2D] border-b border-[#E8E6DE]/60 pb-1.5 mb-1 bg-white rounded-md py-0.5">COL. E</div>
                      <div className="flex flex-col gap-1.5">
                        {/* Row 6 Small stands */}
                        <div className="grid grid-cols-4 gap-0.5">
                          {poolColE.filter(s => ['E-6A', 'E-6B', 'E-6C', 'E-6D'].includes(s.num)).map(stand => (
                            <button
                              key={stand.id}
                              onClick={() => handleSelectStand(stand)}
                              className={`border rounded-md p-0.5 text-center transition-all cursor-pointer ${getStandColorClasses(stand.status)} flex flex-col justify-center items-center h-9`}
                            >
                              <span className="text-[8px] font-mono font-bold leading-none">{stand.num.substring(2)}</span>
                              <span className="text-[7px] text-slate-500 leading-none">{stand.area}m²</span>
                            </button>
                          ))}
                        </div>

                        {/* Row 5 Alteza */}
                        {poolColE.filter(s => s.num === 'E-5A').map(stand => (
                          <button
                            key={stand.id}
                            onClick={() => handleSelectStand(stand)}
                            className={`border rounded-lg p-1.5 text-center transition-all cursor-pointer ${getStandColorClasses(stand.status)} flex flex-col justify-between items-center h-10`}
                          >
                            <span className="text-[9px] font-mono font-bold leading-none">{stand.num}</span>
                            <span className="text-[8px] text-slate-500 font-sans truncate max-w-full font-semibold leading-none">{stand.companyName || 'Alteza'}</span>
                          </button>
                        ))}

                        {/* Row 4 stands */}
                        <div className="grid grid-cols-2 gap-1">
                          {poolColE.filter(s => ['E-4A', 'E-4B'].includes(s.num)).map(stand => (
                            <button
                              key={stand.id}
                              onClick={() => handleSelectStand(stand)}
                              className={`border rounded-md p-1 text-center transition-all cursor-pointer ${getStandColorClasses(stand.status)} flex flex-col justify-between items-center h-[52px]`}
                            >
                              <span className="text-[8px] font-mono font-bold leading-none">{stand.num}</span>
                              <span className="text-[7px] font-sans truncate w-full leading-none font-semibold text-[#2D2D2D]" title={stand.companyName}>
                                {stand.companyName || `${stand.area}m²`}
                              </span>
                            </button>
                          ))}
                        </div>

                        {/* Row 3 stands */}
                        <div className="flex flex-col gap-1">
                          {poolColE.filter(s => ['E-3A', 'E-3B', 'E-3C'].includes(s.num)).map(stand => (
                            <button
                              key={stand.id}
                              onClick={() => handleSelectStand(stand)}
                              className={`border rounded-md p-1 text-center transition-all cursor-pointer ${getStandColorClasses(stand.status)} flex items-center justify-between h-[34px]`}
                            >
                              <span className="text-[9px] font-mono font-bold leading-none shrink-0">{stand.num.substring(2)}</span>
                              <span className="text-[7px] font-sans truncate text-slate-500 font-semibold pl-1 leading-none text-right" title={stand.companyName}>
                                {stand.companyName || `${stand.area}m²`}
                              </span>
                            </button>
                          ))}
                        </div>

                        {/* Row 2 & Row 1 Big slots */}
                        {poolColE.filter(s => !['E-6A', 'E-6B', 'E-6C', 'E-6D', 'E-5A', 'E-4A', 'E-4B', 'E-3A', 'E-3B', 'E-3C'].includes(s.num)).map(stand => (
                          <button
                            key={stand.id}
                            onClick={() => handleSelectStand(stand)}
                            className={`border rounded-lg p-2.5 text-center transition-all cursor-pointer ${getStandColorClasses(stand.status)} flex flex-col justify-between items-center h-[148px] justify-center`}
                          >
                            <span className="text-[10px] font-mono font-bold leading-tight">{stand.num}</span>
                            <span className="text-[9px] font-sans font-bold leading-normal truncate w-full text-center" title={stand.companyName}>
                              {stand.companyName || (stand.status === 'disponible' ? 'Libre' : 'Réservé')}
                            </span>
                            <span className="text-[8px] font-mono text-slate-500">{stand.area}m²</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* COLUMN F */}
                    <div className="col-span-1 flex flex-col gap-2 bg-[#F3F1E9]/40 p-2 rounded-xl border border-[#E8E6DE]">
                      <div className="text-center font-black font-mono text-[11px] text-[#2D2D2D] border-b border-[#E8E6DE]/60 pb-1.5 mb-1 bg-white rounded-md py-0.5">COL. F</div>
                      <div className="flex flex-col gap-1.5">
                        {/* RESTAURANT Shared Header Row 6 (spanning F-G, left portion shown in F) */}
                        <div className="bg-[#148F4C] text-white rounded-lg p-1 text-center flex flex-col justify-center items-center h-9 border border-[#0d6e38] select-none">
                          <span className="text-[9px] uppercase font-bold tracking-wider leading-none">RESTAURANT</span>
                        </div>

                        {/* Row 5 Small stands */}
                        <div className="grid grid-cols-2 gap-1">
                          {poolColF.filter(s => ['F-5A', 'F-5B'].includes(s.num)).map(stand => (
                            <button
                              key={stand.id}
                              onClick={() => handleSelectStand(stand)}
                              className={`border rounded-md p-1 text-center transition-all cursor-pointer ${getStandColorClasses(stand.status)} flex flex-col justify-center items-center h-9`}
                            >
                              <span className="text-[8px] font-mono font-bold leading-none">{stand.num.substring(2)}</span>
                              <span className="text-[7px] text-slate-500 leading-none">{stand.area}m²</span>
                            </button>
                          ))}
                        </div>

                        {/* Row 4 stands */}
                        <div className="grid grid-cols-2 gap-1">
                          {poolColF.filter(s => ['F-4A', 'F-4B'].includes(s.num)).map(stand => (
                            <button
                              key={stand.id}
                              onClick={() => handleSelectStand(stand)}
                              className={`border rounded-md p-1 text-center transition-all cursor-pointer ${getStandColorClasses(stand.status)} flex flex-col justify-between items-center h-[52px]`}
                            >
                              <span className="text-[8px] font-mono font-bold leading-none">{stand.num}</span>
                              <span className="text-[7px] font-sans truncate w-full leading-none font-semibold text-slate-600" title={stand.companyName}>
                                {stand.companyName || `${stand.area}m²`}
                              </span>
                            </button>
                          ))}
                        </div>

                        {/* Row 3 stands */}
                        <div className="flex flex-col gap-1">
                          {poolColF.filter(s => ['F-3A', 'F-3B', 'F-3C'].includes(s.num)).map(stand => (
                            <button
                              key={stand.id}
                              onClick={() => handleSelectStand(stand)}
                              className={`border rounded-md p-1 text-center transition-all cursor-pointer ${getStandColorClasses(stand.status)} flex items-center justify-between h-[34px]`}
                            >
                              <span className="text-[9px] font-mono font-bold leading-none shrink-0">{stand.num.substring(2)}</span>
                              <span className="text-[7px] font-sans truncate text-slate-500 font-semibold pl-1 leading-none text-right" title={stand.companyName}>
                                {stand.companyName || `${stand.area}m²`}
                              </span>
                            </button>
                          ))}
                        </div>

                        {/* Row 2 Big slot */}
                        {poolColF.filter(s => s.num === 'F-2A').map(stand => (
                          <button
                            key={stand.id}
                            onClick={() => handleSelectStand(stand)}
                            className={`border rounded-lg p-2.5 text-center transition-all cursor-pointer ${getStandColorClasses(stand.status)} flex flex-col justify-between items-center h-[148px] justify-center`}
                          >
                            <span className="text-[10px] font-mono font-bold leading-tight">{stand.num}</span>
                            <span className="text-[9px] font-sans font-bold leading-normal truncate w-full text-center hover:whitespace-normal" title={stand.companyName}>
                              {stand.companyName || (stand.status === 'disponible' ? 'Libre' : 'Réservé')}
                            </span>
                            <span className="text-[8px] font-mono text-slate-500">{stand.area}m²</span>
                          </button>
                        ))}

                        {/* Row 1 Small stands (F-1A & F-1B) representing AAFM & UPEK */}
                        <div className="grid grid-cols-2 gap-1 pt-1.5">
                          {poolColF.filter(s => ['F-1A', 'F-1B'].includes(s.num)).map(stand => (
                            <button
                              key={stand.id}
                              onClick={() => handleSelectStand(stand)}
                              className={`border rounded-md p-1 text-center transition-all cursor-pointer ${getStandColorClasses(stand.status)} flex flex-col justify-between items-center h-[141px]`}
                            >
                              <span className="text-[8px] font-mono font-bold leading-none">{stand.num}</span>
                              <span className="text-[7.5px] font-sans font-black leading-tight truncate w-full text-center" title={stand.companyName}>{stand.companyName || 'Libre'}</span>
                              <span className="text-[7px] text-slate-500 leading-none">{stand.area}m²</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* COLUMN G */}
                    <div className="col-span-1 flex flex-col gap-2 bg-[#F3F1E9]/40 p-2 rounded-xl border border-[#E8E6DE]">
                      <div className="text-center font-black font-mono text-[11px] text-[#2D2D2D] border-b border-[#E8E6DE]/60 pb-1.5 mb-1 bg-white rounded-md py-0.5">COL. G</div>
                      <div className="flex flex-col gap-1.5">
                        {/* RESTAURANT Shared Header Row 6 (spanning G-F, right portion shown in G) */}
                        <div className="bg-[#148F4C] text-white rounded-lg p-1 text-center flex flex-col justify-center items-center h-9 border border-[#0d6e38] select-none">
                          <span className="text-[9px] uppercase font-bold tracking-wider leading-none font-semibold">TERRASSE</span>
                        </div>

                        {/* Row 5 Small stand */}
                        {poolColG.filter(s => s.num === 'G-5A').map(stand => (
                          <button
                            key={stand.id}
                            onClick={() => handleSelectStand(stand)}
                            className={`border rounded-lg p-1.5 text-center transition-all cursor-pointer ${getStandColorClasses(stand.status)} flex flex-col justify-between items-center h-10`}
                          >
                            <span className="text-[9px] font-mono font-bold leading-none">{stand.num}</span>
                            <span className="text-[7px] text-slate-500 leading-none">{stand.area}m²</span>
                          </button>
                        ))}

                        {/* Row 4 stands */}
                        <div className="grid grid-cols-2 gap-1">
                          {poolColG.filter(s => ['G-4A', 'G-4B'].includes(s.num)).map(stand => (
                            <button
                              key={stand.id}
                              onClick={() => handleSelectStand(stand)}
                              className={`border rounded-md p-1 text-center transition-all cursor-pointer ${getStandColorClasses(stand.status)} flex flex-col justify-between items-center h-[52px]`}
                            >
                              <span className="text-[8px] font-mono font-bold leading-none">{stand.num}</span>
                              <span className="text-[7px] font-sans truncate w-full leading-none font-semibold" title={stand.companyName}>
                                {stand.companyName || `${stand.area}m²`}
                              </span>
                            </button>
                          ))}
                        </div>

                        {/* Big yellow G stands (G-3A, G-2A, G-1A) */}
                        {poolColG.filter(s => !['G-5A', 'G-4A', 'G-4B'].includes(s.num)).map(stand => (
                          <button
                            key={stand.id}
                            onClick={() => handleSelectStand(stand)}
                            className={`border rounded-lg p-2.5 text-center transition-all cursor-pointer ${getStandColorClasses(stand.status)} flex flex-col justify-between items-center h-[148px] justify-center`}
                          >
                            <span className="text-[10px] font-mono font-bold leading-tight">{stand.num}</span>
                            <span className="text-[9px] font-sans font-bold leading-normal truncate w-full text-center" title={stand.companyName}>
                              {stand.companyName || (stand.status === 'disponible' ? 'Libre' : 'Réservé')}
                            </span>
                            <span className="text-[8px] font-mono text-slate-500">{stand.area}m²</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* COLUMN H */}
                    <div className="col-span-1 flex flex-col gap-2 bg-[#F3F1E9]/40 p-2 rounded-xl border border-[#E8E6DE]">
                      <div className="text-center font-black font-mono text-[11px] text-[#2D2D2D] border-b border-[#E8E6DE]/60 pb-1.5 mb-1 bg-white rounded-md py-0.5">COL. H</div>
                      <div className="flex flex-col gap-1.5">
                        {/* A+E administration block inside Row 6 of Column H */}
                        <div className="bg-[#475569] text-white rounded-lg p-1 text-center flex flex-col justify-center items-center h-9 border border-[#334155] select-none">
                          <span className="text-[8.5px] uppercase font-bold tracking-wider leading-none">SERVICES A+E</span>
                        </div>

                        {/* Column H Stands */}
                        {poolColH.map(stand => (
                          <button
                            key={stand.id}
                            onClick={() => handleSelectStand(stand)}
                            className={`border rounded-lg p-1 text-center transition-all cursor-pointer ${getStandColorClasses(stand.status)} flex flex-col justify-between items-center h-[46px]`}
                          >
                            <span className="text-[9px] font-mono font-bold leading-none">{stand.num}</span>
                            <span className="text-[7.5px] text-slate-500 leading-none">{stand.area}m²</span>
                          </button>
                        ))}
                      </div>
                    </div>

                  </div>

                  {/* Labeled Entrance (Entrée) banner representing bottom entry design of the PDF layout */}
                  <div className="flex justify-center items-center pt-3 select-none">
                    <div className="flex items-center gap-4 bg-white border-2 border-dashed border-red-500 rounded-2xl px-12 py-3 shadow-md animate-pulse">
                      <span className="text-red-600 font-black text-xs">➔ ➔</span>
                      <h5 className="font-serif font-black text-xs tracking-widest text-[#2D2D2D] uppercase">ENTRÉE EXPOSTION AFRICA POOL & SPA</h5>
                      <span className="text-red-600 font-black text-xs">➔ ➔</span>
                    </div>
                  </div>
                </div>
              ) : (
                /* Falling back to dynamic newly created salon stand list */
                <div className="min-w-[500px] sm:min-w-[620px] max-w-[720px] mx-auto space-y-5 text-center">
                  <div className="text-center font-serif font-semibold text-[11px] uppercase tracking-wider text-[#A68A64] mb-2 leading-none">
                    - Pavillon D'Exposition Modulaire Personnalisé -
                  </div>

                  {filteredStands.length === 0 ? (
                    <div className="p-12 text-center text-xs text-[#7A7667] bg-white border border-[#E8E6DE] rounded-2xl">
                      Aucun stand n'est encore initialisé dans ce salon.
                    </div>
                  ) : (
                    <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2.5">
                      {filteredStands.map((stand) => {
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
                            title={getStandTooltip(stand)}
                            className={`border rounded-xl p-2.5 text-center transition-all cursor-pointer ${colorMap[stand.status] || colorMap['disponible']} flex flex-col justify-between items-center h-20 min-w-[55px]`}
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
                  )}

                  <div className="flex justify-center items-center pt-3 select-none">
                    <div className="flex items-center gap-4 bg-white border-2 border-dashed border-[#A68A64] rounded-2xl px-12 py-3 shadow-md">
                      <span className="text-[#A68A64] font-black text-xs">➔ ➔</span>
                      <h5 className="font-serif font-black text-xs tracking-widest text-[#2D2D2D] uppercase leading-none">
                        ENTRÉE {sitesList.find(s => s.id === activeFloorPlanSite)?.name || activeFloorPlanSite.toUpperCase()}
                      </h5>
                      <span className="text-[#A68A64] font-black text-xs">➔ ➔</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Grid Color legend map indicators */}
              <div className="flex justify-center items-center gap-6 text-[10px] text-[#7A7667] border-t border-slate-200/60 pt-5 mt-4 select-none">
                <div className="flex items-center gap-1.5 font-sans">
                  <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: '#10B981' }}></span>
                  <span>Libre / Disponible</span>
                </div>
                <div className="flex items-center gap-1.5 font-sans">
                  <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: '#F59E0B' }}></span>
                  <span>Réservé (Option CRM)</span>
                </div>
                <div className="flex items-center gap-1.5 font-sans">
                  <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: '#EF4444' }}></span>
                  <span>Vendu / Contrat signé</span>
                </div>
                <div className="flex items-center gap-1.5 font-sans">
                  <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: '#8B5CF6' }}></span>
                  <span>Sponsor Officiel</span>
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

              {/* Stand Type Category Package */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[#7A7667] uppercase tracking-wider">Catégorie du Stand</label>
                <select
                  value={editStandType}
                  onChange={(e) => setEditStandType(e.target.value as any)}
                  className="w-full text-xs bg-[#F8F7F2] border border-[#E8E6DE] rounded-xl p-2.5 outline-hidden text-[#2D2D2D] font-semibold"
                >
                  <option value="surface_nue">🏢 Surface Nue (Prix standard)</option>
                  <option value="equipe">📦 Stand Équipé (+500 MAD/m²)</option>
                  <option value="personalise">✨ Stand Personnalisé (+1200 MAD/m²)</option>
                </select>
              </div>

              {/* Exceptional Stand rate override */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[#7A7667] uppercase tracking-wider">Tarif stand - Prix Exceptionnel (MAD)</label>
                <input
                  type="number"
                  min="0"
                  value={editExceptionalPrice}
                  onChange={(e) => setEditExceptionalPrice(e.target.value)}
                  placeholder="Laisser vide pour calcul standard"
                  className="w-full text-xs bg-[#F8F7F2] border border-[#E8E6DE] rounded-xl p-2.5 outline-hidden text-[#2D2D2D] font-mono font-semibold"
                />
                <p className="text-[9px] text-[#7A7667]/80">Si renseigné, ce tarif exceptionnel remplacera le calcul au m² lors des facturations.</p>
              </div>

              {/* Dynamic Pricing Estimate Box */}
              <div className="bg-[#FBFBFA] border border-[#E8E6DE]/60 rounded-2xl p-4.5 space-y-2 text-xs text-[#7A7667]">
                <div className="flex justify-between font-medium">
                  <span>Surface :</span>
                  <span className="font-mono text-[#2D2D2D] font-semibold">{selectedStand.area} m²</span>
                </div>
                <div className="flex justify-between font-medium">
                  <span>Tarif m² de base :</span>
                  <span className="font-mono text-[#2D2D2D] font-semibold">{(selectedStand.pricePerM2 || 2500).toLocaleString()} MAD</span>
                </div>
                <div className="flex justify-between font-medium">
                  <span>Formule :</span>
                  <span className="font-serif italic text-xs text-[#2D2D2D] font-bold">
                    {editStandType === 'surface_nue' ? 'Surface Nue' : editStandType === 'equipe' ? 'Stand Équipé (+500/m²)' : 'Stand Personnalisé (+1200/m²)'}
                  </span>
                </div>
                <div className="border-t border-[#E8E6DE]/50 pt-2 flex justify-between font-bold text-sm text-[#2D2D2D]">
                  <span>Total Financier Estimé :</span>
                  <span className="font-mono text-[#A68A64]">
                    {(() => {
                      const exp = parseFloat(editExceptionalPrice);
                      if (!isNaN(exp) && exp >= 0) {
                        return `${exp.toLocaleString()} MAD (Exceptionnel)`;
                      }
                      let rate = selectedStand.pricePerM2 || 2500;
                      if (editStandType === 'equipe') rate += 500;
                      if (editStandType === 'personalise') rate += 1200;
                      return `${(selectedStand.area * rate).toLocaleString()} MAD`;
                    })()}
                  </span>
                </div>
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
