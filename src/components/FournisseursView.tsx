/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Trash2, 
  Edit, 
  Eye, 
  Upload, 
  Download, 
  FileText, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Layers, 
  Briefcase, 
  User, 
  Mail, 
  Phone, 
  Building2, 
  X, 
  ChevronRight, 
  Info, 
  Calendar,
  DollarSign,
  TrendingUp,
  Sliders,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { SiteId, Contact } from '../types';

interface FournisseursViewProps {
  selectedSite: SiteId;
  contacts: Contact[];
  setContacts: React.Dispatch<React.SetStateAction<Contact[]>>;
  sites: { id: string; name: string }[];
}

export default function FournisseursView({ 
  selectedSite, 
  contacts, 
  setContacts,
  sites
}: FournisseursViewProps) {
  // 1. Filter contacts to only get providers/suppliers
  const allFournisseurs = contacts.filter(c => c.role === 'fournisseur');
  
  // 2. Local View States
  const [siteFilter, setSiteFilter] = useState<SiteId | 'all'>(selectedSite);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'fournisseur' | 'prestataire'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'actif' | 'inactif'>('all');
  const [selectedProvider, setSelectedProvider] = useState<Contact | null>(null);
  
  // Lightbox view state
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const [lightboxTitle, setLightboxTitle] = useState('');

  // Add/Edit Form state
  const [showAddForm, setShowAddForm] = useState(false);
  const [editProviderId, setEditProviderId] = useState<string | null>(null);

  // Form Fields
  const [formCompany, setFormCompany] = useState('');
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formType, setFormType] = useState<'fournisseur' | 'prestataire'>('prestataire');
  const [formCategory, setFormCategory] = useState('Impression & Signalétique');
  const [formCustomCategory, setFormCustomCategory] = useState('');
  const [formStatus, setFormStatus] = useState<'actif' | 'inactif'>('actif');
  const [formLogo, setFormLogo] = useState('');
  const [formNotes, setFormNotes] = useState('');
  const [formSite, setFormSite] = useState<SiteId>(selectedSite);

  // Invoice Adding Form Fields (inside detailed sheet)
  const [showAddInvoiceForm, setShowAddInvoiceForm] = useState(false);
  const [invLabel, setInvLabel] = useState('');
  const [invAmount, setInvAmount] = useState('');
  const [invDate, setInvDate] = useState(new Date().toISOString().split('T')[0]);
  const [invFile, setInvFile] = useState('');
  const [invStatus, setInvStatus] = useState<'paye' | 'non_paye'>('non_paye');

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const handleSeedData = () => {
    const demoProviders: Contact[] = [
      {
        id: `provider-demo-1`,
        company: "Alwane Print Maroc",
        name: "Yassine Alami",
        email: "y.alami@alwaneprint.ma",
        phone: "+212 522-480911",
        site: selectedSite,
        role: 'fournisseur',
        dateAdded: '2026-06-01',
        fournisseurType: 'fournisseur',
        fournisseurCategory: "Impression & Signalétique",
        fournisseurStatus: 'actif',
        notes: "Partenaire historique de l'agence pour toute l'impression grand format d'enseignes et kakemonos.",
        fournisseurInvoices: [
          {
            id: 'inv-demo-1a',
            label: 'Impression Bâches & Kakemonos',
            amount: 18500,
            date: '2026-06-03',
            fileUrl: '',
            status: 'paye'
          },
          {
            id: 'inv-demo-1b',
            label: 'Signalétique Extérieure Rollup',
            amount: 6200,
            date: '2026-06-05',
            fileUrl: '',
            status: 'non_paye'
          }
        ]
      },
      {
        id: `provider-demo-2`,
        company: "Régie Sound S.A.",
        name: "Omar Benjelloun",
        email: "contact@regiesound.ma",
        phone: "+212 661-897532",
        site: selectedSite,
        role: 'fournisseur',
        dateAdded: '2026-05-28',
        fournisseurType: 'prestataire',
        fournisseurCategory: "Régie Technique & Sonorisation",
        fournisseurStatus: 'actif',
        notes: "Fournit toute la sonorisation, les écrans géants LED et l'éclairage de scène des salles de conférence.",
        fournisseurInvoices: [
          {
            id: 'inv-demo-2a',
            label: 'Pack Sonorisation Hall Principal',
            amount: 45000,
            date: '2026-06-02',
            fileUrl: '',
            status: 'paye'
          }
        ]
      },
      {
        id: `provider-demo-3`,
        company: "Saveurs du Maroc Traiteur",
        name: "Fatima Zahra",
        email: "traiteur.saveurs@gmail.com",
        phone: "+212 662-114477",
        site: selectedSite,
        role: 'fournisseur',
        dateAdded: '2026-06-04',
        fournisseurType: 'prestataire',
        fournisseurCategory: "Traiteur & Restauration",
        fournisseurStatus: 'actif',
        notes: "Gère l'espace VIP et la restauration haut de gamme des officiels durant les 3 jours du salon.",
        fournisseurInvoices: [
          {
            id: 'inv-demo-3a',
            label: 'Cocktail Inauguration VIP (200 pax)',
            amount: 30000,
            date: '2026-06-04',
            fileUrl: '',
            status: 'non_paye'
          }
        ]
      }
    ];

    setContacts(prev => [...demoProviders, ...prev]);
    showToast("3 prestataires de démonstration initialisés.");
  };

  // Preset categories
  const categoriesPreset = [
    "Régie Technique & Sonorisation",
    "Impression & Signalétique",
    "Traiteur & Restauration",
    "Sécurité & Gardiennage",
    "Nettoyage & Propreté",
    "Aménagement de Stand & Déco",
    "Location de Mobilier",
    "Hôtesses & Accueil",
    "Logistique & Transport"
  ];

  // Helper file uploader
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormLogo(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleInvoiceUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setInvFile(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Submit main insert / update
  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formCompany || !formName || !formEmail) {
      alert("Veuillez remplir le nom de l'entreprise, du contact et son email.");
      return;
    }

    const categoryText = formCategory === 'Autre' ? formCustomCategory : formCategory;

    if (editProviderId) {
      // Edit
      setContacts(prev => prev.map(c => {
        if (c.id === editProviderId) {
          return {
            ...c,
            company: formCompany,
            name: formName,
            email: formEmail,
            phone: formPhone,
            fournisseurType: formType,
            fournisseurCategory: categoryText,
            fournisseurStatus: formStatus,
            fournisseurLogo: formLogo || c.fournisseurLogo,
            notes: formNotes,
            site: formSite
          };
        }
        return c;
      }));

      // Update selected provider details if open
      if (selectedProvider && selectedProvider.id === editProviderId) {
        setSelectedProvider(prev => prev ? {
          ...prev,
          company: formCompany,
          name: formName,
          email: formEmail,
          phone: formPhone,
          fournisseurType: formType,
          fournisseurCategory: categoryText,
          fournisseurStatus: formStatus,
          fournisseurLogo: formLogo || prev.fournisseurLogo,
          notes: formNotes,
          site: formSite
        } : null);
      }

      showToast(`Prestataire/Fournisseur ${formCompany} mis à jour.`);
    } else {
      // Insert new
      const newContact: Contact = {
        id: `provider-${Date.now()}`,
        company: formCompany,
        name: formName,
        email: formEmail,
        phone: formPhone,
        site: formSite,
        role: 'fournisseur',
        dateAdded: new Date().toISOString().split('T')[0],
        fournisseurType: formType,
        fournisseurCategory: categoryText,
        fournisseurStatus: formStatus,
        fournisseurLogo: formLogo,
        notes: formNotes,
        fournisseurInvoices: []
      };

      setContacts(prev => [newContact, ...prev]);
      showToast(`Prestataire/Fournisseur ${formCompany} ajouté avec succès !`);
    }

    // Reset fields
    resetForm();
  };

  const resetForm = () => {
    setFormCompany('');
    setFormName('');
    setFormEmail('');
    setFormPhone('');
    setFormType('prestataire');
    setFormCategory('Impression & Signalétique');
    setFormCustomCategory('');
    setFormStatus('actif');
    setFormLogo('');
    setFormNotes('');
    setFormSite(selectedSite);
    setEditProviderId(null);
    setShowAddForm(false);
  };

  const handleEditClick = (provider: Contact) => {
    setFormCompany(provider.company);
    setFormName(provider.name);
    setFormEmail(provider.email);
    setFormPhone(provider.phone || '');
    setFormType(provider.fournisseurType || 'fournisseur');
    setFormCategory(categoriesPreset.includes(provider.fournisseurCategory || '') ? (provider.fournisseurCategory || '') : 'Autre');
    setFormCustomCategory(categoriesPreset.includes(provider.fournisseurCategory || '') ? '' : (provider.fournisseurCategory || ''));
    setFormStatus(provider.fournisseurStatus || 'actif');
    setFormLogo(provider.fournisseurLogo || '');
    setFormNotes(provider.notes || '');
    setFormSite(provider.site);
    
    setEditProviderId(provider.id);
    setShowAddForm(true);
  };

  const handleDeleteProvider = (id: string, name: string) => {
    if (confirm(`Êtes-vous sûr de vouloir supprimer définitivement le prestataire / fournisseur "${name}" ?`)) {
      setContacts(prev => prev.filter(c => c.id !== id));
      if (selectedProvider?.id === id) {
        setSelectedProvider(null);
      }
      showToast(`Prestataire ${name} supprimé du système.`);
    }
  };

  // Add sub-invoice to specific provider
  const handleAddInvoiceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProvider) return;
    if (!invLabel || !invAmount) {
      alert("Veuillez saisir un libellé de facture et un montant.");
      return;
    }

    const parsedAmount = parseFloat(invAmount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      alert("Le montant de la facture doit être un nombre positif.");
      return;
    }

    const newInvoiceObj = {
      id: `inv-${Date.now()}`,
      label: invLabel,
      amount: parsedAmount,
      date: invDate,
      fileUrl: invFile,
      status: invStatus
    };

    const updatedInvoices = [...(selectedProvider.fournisseurInvoices || []), newInvoiceObj];

    // Persist up to source contacts array
    setContacts(prev => prev.map(c => {
      if (c.id === selectedProvider.id) {
        return {
          ...c,
          // Sync invoice statuses or latest summary tags 
          fournisseurInvoices: updatedInvoices,
          // Backwards compatibility with standard fields
          fournisseurInvoicePhoto: newInvoiceObj.fileUrl || c.fournisseurInvoicePhoto,
          fournisseurPaymentStatus: newInvoiceObj.status
        };
      }
      return c;
    }));

    // Update in-memory visual copy
    setSelectedProvider(prev => prev ? {
      ...prev,
      fournisseurInvoices: updatedInvoices,
      fournisseurInvoicePhoto: newInvoiceObj.fileUrl || prev.fournisseurInvoicePhoto,
      fournisseurPaymentStatus: newInvoiceObj.status
    } : null);

    // Reset invoice form
    setInvLabel('');
    setInvAmount('');
    setInvDate(new Date().toISOString().split('T')[0]);
    setInvFile('');
    setInvStatus('non_paye');
    setShowAddInvoiceForm(false);
    showToast(`Facture de ${parsedAmount} MAD enregistrée.`);
  };

  // Delete dynamic sub-invoice
  const handleDeleteSubInvoice = (invoiceId: string, amount: number) => {
    if (!selectedProvider) return;
    if (confirm("Confirmez-vous la suppression de cette facture de l'historique ?")) {
      const updatedInvoices = (selectedProvider.fournisseurInvoices || []).filter(item => item.id !== invoiceId);
      
      setContacts(prev => prev.map(c => {
        if (c.id === selectedProvider.id) {
          return {
            ...c,
            fournisseurInvoices: updatedInvoices
          };
        }
        return c;
      }));

      setSelectedProvider(prev => prev ? {
        ...prev,
        fournisseurInvoices: updatedInvoices
      } : null);

      showToast(`Facture supprimée.`);
    }
  };

  // Filter list of providers
  const filteredFournisseurs = allFournisseurs.filter(item => {
    const matchesSite = siteFilter === 'all' ? true : item.site === siteFilter;
    const matchesType = typeFilter === 'all' ? true : (item.fournisseurType === typeFilter);
    const matchesStatus = statusFilter === 'all' ? true : (item.fournisseurStatus === statusFilter);
    
    const sTerm = searchQuery.toLowerCase();
    const matchesSearch = 
      item.company.toLowerCase().includes(sTerm) ||
      item.name.toLowerCase().includes(sTerm) ||
      item.email.toLowerCase().includes(sTerm) ||
      (item.phone || '').includes(sTerm) ||
      (item.fournisseurCategory || '').toLowerCase().includes(sTerm);

    return matchesSite && matchesType && matchesStatus && matchesSearch;
  });

  // Calculate stats based on filtered list (or all list)
  const totalInvoicedSum = allFournisseurs.reduce((acc, curr) => {
    const subSum = (curr.fournisseurInvoices || []).reduce((s, i) => s + i.amount, 0);
    return acc + subSum;
  }, 0);

  const pendingFacturesCount = allFournisseurs.reduce((acc, curr) => {
    const unps = (curr.fournisseurInvoices || []).filter(i => i.status === 'non_paye').length;
    return acc + unps;
  }, 0);

  const totalS_Count = allFournisseurs.filter(c => c.fournisseurType === 'fournisseur').length;
  const totalP_Count = allFournisseurs.filter(c => c.fournisseurType !== 'fournisseur').length;

  return (
    <div className="flex-1 overflow-y-auto px-6 py-6 font-sans space-y-6">
      
      {/* Toast Alert Banner */}
      {toastMessage && (
        <div className="fixed top-24 right-6 bg-[#2C3E36] border-l-4 border-[#A68A64] text-white px-5 py-4.5 rounded-xl shadow-xl z-50 flex items-center gap-3 animate-in slide-in-from-right duration-200">
          <Sparkles className="w-5 h-5 text-[#A68A64] shrink-0" />
          <span className="text-xs font-semibold">{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="text-[#93A392] hover:text-white ml-2 text-xs">✕</button>
        </div>
      )}

      {/* DASHBOARD KIP CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        
        {/* KPI 1 : Total Prestataires */}
        <div className="bg-white border border-[#E8E6DE] rounded-2xl p-4.5 flex items-center gap-4 shadow-3xs hover:border-[#2C3E36]/30 transition">
          <div className="w-11 h-11 bg-[#F5F3E9] rounded-xl flex items-center justify-center text-[#2C3E36] shrink-0">
            <Layers className="w-5.5 h-5.5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-[#7A7667] uppercase tracking-wider">Prestataires</p>
            <h3 className="text-xl font-bold text-[#2D2D2D] leading-tight mt-0.5">{totalP_Count}</h3>
            <p className="text-[9px] text-[#A68A64] font-medium mt-0.5">Partenaires techniques</p>
          </div>
        </div>

        {/* KPI 2 : Total Fournisseurs */}
        <div className="bg-white border border-[#E8E6DE] rounded-2xl p-4.5 flex items-center gap-4 shadow-3xs hover:border-[#2C3E36]/30 transition">
          <div className="w-11 h-11 bg-[#F5F3E9] rounded-xl flex items-center justify-center text-[#A68A64] shrink-0">
            <Building2 className="w-5.5 h-5.5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-[#7A7667] uppercase tracking-wider">Fournisseurs</p>
            <h3 className="text-xl font-bold text-[#2D2D2D] leading-tight mt-0.5">{totalS_Count}</h3>
            <p className="text-[9px] text-[#93A392] font-medium mt-0.5">Matériel & Consommables</p>
          </div>
        </div>

        {/* KPI 3 : Factures en Attente */}
        <div className="bg-white border border-[#E8E6DE] rounded-2xl p-4.5 flex items-center gap-4 shadow-3xs hover:border-[#2C3E36]/30 transition">
          <div className="w-11 h-11 bg-rose-50 rounded-xl flex items-center justify-center text-rose-600 shrink-0">
            <AlertCircle className="w-5.5 h-5.5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-[#7A7667] uppercase tracking-wider">Factures en attente</p>
            <h3 className="text-xl font-bold text-rose-600 leading-tight mt-0.5">{pendingFacturesCount}</h3>
            <p className="text-[9px] text-rose-500 font-bold mt-0.5">Non soldées</p>
          </div>
        </div>

        {/* KPI 4 : Achats Investis HT */}
        <div className="bg-white border border-[#E8E6DE] rounded-2xl p-4.5 flex items-center gap-4 shadow-3xs hover:border-[#2C3E36]/30 transition lg:col-span-2">
          <div className="w-11 h-11 bg-[#2C3E36]/5 rounded-xl flex items-center justify-center text-[#2C3E36] shrink-0">
            <DollarSign className="w-6 h-6 text-[#A68A64]" />
          </div>
          <div className="flex-1">
            <p className="text-[10px] font-bold text-[#7A7667] uppercase tracking-wider">Budget Total Engagé / Achats</p>
            <h3 className="text-xl font-serif font-black text-[#2C3E36] leading-tight mt-0.5">
              {totalInvoicedSum.toLocaleString('fr-FR')} <span className="text-xs font-sans font-bold">MAD</span>
            </h3>
            <p className="text-[9px] text-[#7E8F7A] font-medium mt-0.5">Cumul de toutes les factures prestataires</p>
          </div>
        </div>

      </div>

      {/* FILTERING BAR & ADD BUTTON */}
      <div className="bg-white border border-[#E8E6DE] rounded-2xl p-4 flex flex-col md:flex-row gap-3 items-center justify-between shadow-3xs">
        
        {/* Left: Quick search and filters */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          
          {/* Text query search */}
          <div className="relative w-full sm:w-60">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-[#7A7667]/60" />
            <input 
              type="text" 
              placeholder="Rechercher entreprise, contact..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-[#F8F7F2] border border-[#E8E6DE] focus:border-[#2C3E36] outline-hidden rounded-xl text-xs text-[#2D2D2D] font-medium placeholder:text-[#7A7667]/40"
            />
          </div>

          {/* Exhibition Site select */}
          <select
            value={siteFilter}
            onChange={(e) => setSiteFilter(e.target.value as SiteId | 'all')}
            className="px-3 py-2 bg-white border border-[#E8E6DE] hover:border-[#2C3E36] rounded-xl text-xs font-semibold text-[#2D2D2D]"
          >
            <option value="all">Tous les Événements</option>
            {sites.map(s => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>

          {/* Type filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as any)}
            className="px-3 py-2 bg-white border border-[#E8E6DE] hover:border-[#2C3E36] rounded-xl text-xs font-semibold text-[#2D2D2D]"
          >
            <option value="all">Tous types (Prestataires + Fournisseurs)</option>
            <option value="prestataire">Prestataires uniquement</option>
            <option value="fournisseur">Fournisseurs uniquement</option>
          </select>

          {/* Status filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-3 py-2 bg-white border border-[#E8E6DE] hover:border-[#2C3E36] rounded-xl text-xs font-semibold text-[#2D2D2D]"
          >
            <option value="all">Tous statuts</option>
            <option value="actif">Actif</option>
            <option value="inactif">Inactif</option>
          </select>
        </div>

        {/* Right: Add Buttons */}
        <button
          onClick={() => {
            resetForm();
            setShowAddForm(true);
          }}
          className="w-full md:w-auto px-4.5 py-2.5 bg-[#2C3E36] hover:bg-[#1D2B25] text-white rounded-xl text-xs font-bold font-sans tracking-wide transition shadow-xs flex items-center justify-center gap-1.5 select-none cursor-pointer"
        >
          <Plus className="w-4 h-4 text-[#A68A64]" />
          <span>Nouveau Prestataire</span>
        </button>

      </div>

      {/* CORE TWO COLUMN LAYOUT: TABLE LIST / DETAILED VIEW */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
        
        {/* Column 1: Prestataires List Table */}
        <div className="bg-white border border-[#E8E6DE] rounded-2xl overflow-hidden shadow-3xs xl:col-span-2">
          
          <div className="px-5 py-4.5 border-b border-[#E8E6DE]/60 bg-slate-50/50 flex justify-between items-center">
            <h4 className="text-xs font-bold text-[#2D2D2D] uppercase tracking-wider flex items-center gap-1.5">
              <span>Fichier des partenaires commerciaux</span>
              <span className="text-[10px] bg-[#E8E6DE] px-2 py-0.5 rounded-full text-[#7A7667] font-bold">
                {filteredFournisseurs.length} trouvé(s)
              </span>
            </h4>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#FAF9F5] border-b border-[#E8E6DE] text-[#7A7667] font-bold text-[10px] uppercase tracking-wider">
                  <th className="py-3 px-4">Prestataire / Entreprise</th>
                  <th className="py-3 px-4">Catégorie</th>
                  <th className="py-3 px-4">Contact direct</th>
                  <th className="py-3 px-4 text-center">Factures</th>
                  <th className="py-3 px-4 text-center">Statut</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8E6DE]/65">
                {filteredFournisseurs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-16 text-center">
                      <p className="text-slate-400 italic text-xs mb-3">
                        Aucun prestataire ou fournisseur ne correspond aux filtres appliqués.
                      </p>
                      {allFournisseurs.length === 0 && (
                        <button
                          type="button"
                          onClick={handleSeedData}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#FAF9F5] hover:bg-[#F2EFE6] text-[#A68A64] hover:text-[#2C3E36] border border-[#E8E6DE] hover:border-[#A68A64] rounded-xl text-[10px] font-bold transition duration-150 cursor-pointer shadow-3xs"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>Initialiser 3 exemples réalistes</span>
                        </button>
                      )}
                    </td>
                  </tr>
                ) : (
                  filteredFournisseurs.map(p => {
                    const totalFacturesCount = p.fournisseurInvoices?.length || 0;
                    const providerSum = (p.fournisseurInvoices || []).reduce((acc, curr) => acc + curr.amount, 0);
                    
                    return (
                      <tr 
                        key={p.id}
                        onClick={() => setSelectedProvider(p)}
                        className={`hover:bg-[#FAF9F5] transition cursor-pointer ${
                          selectedProvider?.id === p.id ? 'bg-[#F2EFE6]/50' : ''
                        }`}
                      >
                        
                        {/* Company & Name */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-[#FAF9F5] border border-[#E8E6DE] overflow-hidden flex items-center justify-center shrink-0">
                              {p.fournisseurLogo ? (
                                <img src={p.fournisseurLogo} alt={p.company} className="w-full h-full object-cover" />
                              ) : (
                                <Building2 className="w-4 h-4 text-[#A68A64]" />
                              )}
                            </div>
                            <div>
                              <div className="font-bold text-[#2D2D2D] text-[12px] flex items-center gap-1.5 leading-tight">
                                <span>{p.company}</span>
                                {p.fournisseurType === 'fournisseur' ? (
                                  <span className="text-[8px] font-black text-rose-700 bg-rose-50 px-1 py-0.5 rounded uppercase font-sans">Fournisseur</span>
                                ) : (
                                  <span className="text-[8px] font-black text-[#A68A64] bg-[#F5F3E9] px-1 py-0.5 rounded uppercase font-sans">Prestataire</span>
                                )}
                              </div>
                              <span className="text-[10px] text-[#7A7667]/80 block mt-0.5">{p.name}</span>
                            </div>
                          </div>
                        </td>

                        {/* Category */}
                        <td className="py-3.5 px-4 font-semibold text-[#2D2D2D]">
                          <span className="bg-[#FAF9F5] px-2 py-1 border border-[#E8E6DE]/60 rounded-md text-[10px]">
                            {p.fournisseurCategory || "Non spécifiée"}
                          </span>
                        </td>

                        {/* Contacts / Phone / Mail */}
                        <td className="py-3.5 px-4 font-sans space-y-0.5">
                          <div className="flex items-center gap-1.5 text-slate-600 font-medium">
                            <Phone className="w-3 h-3 text-[#A68A64]" />
                            <span>{p.phone || "N/A"}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-slate-500 text-[10px]">
                            <Mail className="w-3 h-3 text-[#93A392]" />
                            <span className="truncate max-w-[130px]">{p.email}</span>
                          </div>
                        </td>

                        {/* Invoices historic tally */}
                        <td className="py-3.5 px-4 text-center">
                          <div className="inline-block px-2 py-1 rounded bg-[#FAF9F5] border border-[#E8E6DE] text-center">
                            <span className="font-bold text-[#2D2D2D] block">{totalFacturesCount} doc(s)</span>
                            <span className="text-[9px] text-[#8C7A5C] font-semibold mt-0.5 block">{providerSum.toLocaleString('fr-FR')} MAD</span>
                          </div>
                        </td>

                        {/* Status (Actif / Inactif) */}
                        <td className="py-3.5 px-4 text-center">
                          {p.fournisseurStatus === 'inactif' ? (
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-slate-100 text-slate-500 border border-slate-200">
                              Inactif
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              Actif
                            </span>
                          )}
                        </td>

                        {/* Actions buttons */}
                        <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-1.5">
                            
                            <button
                              onClick={() => handleEditClick(p)}
                              className="p-1 text-slate-500 hover:text-[#A68A64] hover:bg-[#FAF9F5] rounded-lg transition"
                              title="Modifier la fiche"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            
                            <button
                              onClick={() => handleDeleteProvider(p.id, p.company)}
                              className="p-1 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
                              title="Supprimer définitivement"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>

                          </div>
                        </td>

                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

        </div>

        {/* Column 2: Detailed Sheet & History Panel */}
        <div className="space-y-5">
          
          {selectedProvider ? (
            <div className="bg-white border border-[#E8E6DE] rounded-2xl p-5 shadow-3xs animate-in fade-in slide-in-from-bottom duration-250 font-sans space-y-4">
              
              {/* Header profile */}
              <div className="flex justify-between items-start border-b border-[#E8E6DE]/60 pb-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-[#F5F3E9] border border-[#E8E6DE] overflow-hidden flex items-center justify-center shadow-3xs">
                    {selectedProvider.fournisseurLogo ? (
                      <img src={selectedProvider.fournisseurLogo} alt={selectedProvider.company} className="w-full h-full object-cover" />
                    ) : (
                      <Building2 className="w-5 h-5 text-[#2C3E36]" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-sm font-serif font-bold text-[#2D2D2D] tracking-tight leading-tight flex items-center gap-2">
                      <span>{selectedProvider.company}</span>
                    </h3>
                    <p className="text-[10px] text-[#A68A64] uppercase tracking-wider font-semibold mt-0.5 flex items-center gap-1">
                      <Briefcase className="w-3 h-3 text-[#A68A64]" />
                      <span>{selectedProvider.fournisseurCategory || "Général"}</span>
                    </p>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1.5">
                  {selectedProvider.fournisseurStatus === 'inactif' ? (
                    <span className="text-[8.5px] font-black uppercase text-slate-500 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-full">
                      Inactif
                    </span>
                  ) : (
                    <span className="text-[8.5px] font-black uppercase text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                      Partenaire Actif
                    </span>
                  )}
                  <span className="text-[9px] text-[#7A7667]/60 italic font-medium">Ajouté le {selectedProvider.dateAdded}</span>
                </div>
              </div>

              {/* General contact particulars */}
              <div className="space-y-2 bg-[#FAF9F5] p-3 rounded-xl border border-[#E8E6DE]/40 text-xs">
                <div className="flex justify-between">
                  <span className="text-[#7A7667] font-semibold text-[10px] uppercase">Contact Direct</span>
                  <span className="text-[#2D2D2D] font-bold">{selectedProvider.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#7A7667] font-semibold text-[10px] uppercase">E-mail</span>
                  <a href={`mailto:${selectedProvider.email}`} className="text-[#A68A64] hover:underline font-bold flex items-center gap-1">
                    <span>{selectedProvider.email}</span>
                  </a>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#7A7667] font-semibold text-[10px] uppercase">Téléphone</span>
                  <span className="text-[#2D2D2D] font-bold">{selectedProvider.phone || "N/A"}</span>
                </div>
                {selectedProvider.notes && (
                  <div className="border-t border-[#E8E6DE]/40 pt-2 mt-1">
                    <span className="text-[#7A7667] font-bold text-[9px] uppercase block mb-1">Notes Internes</span>
                    <p className="text-[10px] text-slate-600 bg-white/70 p-2 rounded border border-[#E8E6DE]/30 italic leading-relaxed">
                      "{selectedProvider.notes}"
                    </p>
                  </div>
                )}
              </div>

              {/* Dynamic Invoice history table */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <h4 className="text-[10px] font-bold text-[#2D2D2D] uppercase tracking-widest flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-[#A68A64]" />
                    <span>Factures & Justificatifs</span>
                  </h4>

                  <button
                    onClick={() => setShowAddInvoiceForm(!showAddInvoiceForm)}
                    className="text-[9px] text-[#A68A64] hover:text-[#2C3E36] font-bold flex items-center gap-1 bg-[#FAF9F5] border border-[#E8E6DE] px-2 py-1 rounded-lg transition"
                  >
                    <span>{showAddInvoiceForm ? "Annuler" : "+ Ajouter facture"}</span>
                  </button>
                </div>

                {/* Sub-form to Add Invoice */}
                {showAddInvoiceForm && (
                  <form onSubmit={handleAddInvoiceSubmit} className="bg-[#FAF9F5] border border-[#E8E6DE] p-3.5 rounded-xl space-y-3 animate-in slide-in-from-top duration-200">
                    <div className="text-[10px] text-[#A68A64] font-bold uppercase pb-1 border-b border-[#E8E6DE] font-serif">Enregistrer un document / achat</div>
                    
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-[#7A7667] uppercase block">Libellé / Désignation</label>
                      <input 
                        type="text"
                        value={invLabel}
                        onChange={(e) => setInvLabel(e.target.value)}
                        placeholder="Ex: Facture Impression Bâches"
                        className="w-full p-2 bg-white border border-[#E8E6DE] rounded-lg text-xs"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-[#7A7667] uppercase block">Montant (MAD)</label>
                        <input 
                          type="number"
                          value={invAmount}
                          onChange={(e) => setInvAmount(e.target.value)}
                          placeholder="Ex: 14500"
                          className="w-full p-2 bg-white border border-[#E8E6DE] rounded-lg text-xs"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-[#7A7667] uppercase block">Date Facturation</label>
                        <input 
                          type="date"
                          value={invDate}
                          onChange={(e) => setInvDate(e.target.value)}
                          className="w-full p-2 bg-white border border-[#E8E6DE] rounded-lg text-xs"
                        />
                      </div>
                    </div>

                    {/* Invoice visual upload */}
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-[#7A7667] uppercase block">Fichier / Image Facture</label>
                      <div className="flex items-center gap-2">
                        <label className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#E8E6DE] hover:border-[#A68A64] rounded-lg text-[10px] font-bold text-[#2D2D2D] cursor-pointer shadow-3xs transition">
                          <Upload className="w-3 h-3 text-[#A68A64]" />
                          <span>Choisir photo</span>
                          <input 
                            type="file"
                            accept="image/*"
                            onChange={handleInvoiceUpload}
                            className="hidden"
                          />
                        </label>
                        {invFile ? (
                          <span className="text-[9px] text-emerald-600 font-bold">✓ Chargée</span>
                        ) : (
                          <span className="text-[9px] text-slate-400 italic">Aucun fichier</span>
                        )}
                      </div>
                    </div>

                    <div className="flex justify-between items-center pt-1 border-t border-[#E8E6DE]/50">
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] font-bold text-[#7A7667] uppercase">Statut</span>
                        <div className="flex bg-white border rounded-lg overflow-hidden text-[9px] font-bold shadow-3xs">
                          <button
                            type="button"
                            onClick={() => setInvStatus('paye')}
                            className={`px-2 py-1 ${invStatus === 'paye' ? 'bg-[#7E8F7A] text-white' : 'text-[#7A7667]'}`}
                          >
                            Payé
                          </button>
                          <button
                            type="button"
                            onClick={() => setInvStatus('non_paye')}
                            className={`px-2 py-1 ${invStatus === 'non_paye' ? 'bg-[#A68A64] text-white' : 'text-[#7A7667]'}`}
                          >
                            Non Payé
                          </button>
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="px-3.5 py-1.5 bg-[#2C3E36] hover:bg-[#1C2B24] text-white rounded-lg text-[10px] font-black transition"
                      >
                        Valider l'achat
                      </button>
                    </div>

                  </form>
                )}

                {/* HISTORICAL TABLE INVOICES */}
                <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
                  {(!selectedProvider.fournisseurInvoices || selectedProvider.fournisseurInvoices.length === 0) ? (
                    <div className="text-center py-8 bg-[#FAF9F5] rounded-xl border border-dashed border-[#E8E6DE] text-[#7A7667]/60 italic text-[11px]">
                      Historique vide. Créez la première facture en cliquant sur "+ Ajouter facture".
                    </div>
                  ) : (
                    selectedProvider.fournisseurInvoices.map((inv) => (
                      <div key={inv.id} className="bg-[#FAF9F5] border border-[#E8E6DE]/60 rounded-xl p-3 flex justify-between items-center gap-3 hover:border-[#A68A64]/40 transition group">
                        
                        {/* Left Info */}
                        <div className="flex items-center gap-3 shrink-0">
                          
                          {inv.fileUrl ? (
                            <div 
                              onClick={() => {
                                setLightboxImage(inv.fileUrl);
                                setLightboxTitle(`${selectedProvider.company} - ${inv.label}`);
                              }}
                              className="w-11 h-11 bg-zinc-950 border border-slate-200 rounded-lg overflow-hidden flex items-center justify-center shrink-0 cursor-zoom-in relative group/thumb"
                              title="Cliquer pour zoomer"
                            >
                              <img src={inv.fileUrl} alt={inv.label} className="w-full h-full object-cover group-hover/thumb:scale-110 transition duration-150" />
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/thumb:opacity-100 flex items-center justify-center transition">
                                <Eye className="w-3.5 h-3.5 text-white" />
                              </div>
                            </div>
                          ) : (
                            <div className="w-11 h-11 bg-slate-100 border border-[#E8E6DE] rounded-lg flex items-center justify-center text-slate-400 shrink-0">
                              <FileText className="w-4 h-4 text-slate-400" />
                            </div>
                          )}

                          <div>
                            <span className="font-bold text-[#2D2D2D] leading-tight block text-[11px] max-w-[130px] truncate">{inv.label}</span>
                            <span className="text-[9px] text-[#7A7667]/80 font-medium block mt-0.5">{inv.date}</span>
                          </div>
                        </div>

                        {/* Amount & Status Badge */}
                        <div className="flex flex-col items-end gap-1 shrink-0">
                          <span className="font-bold text-[#2C3E36] text-[12px]">{inv.amount.toLocaleString('fr-FR')} MAD</span>
                          
                          <div className="flex items-center gap-1.5">
                            {inv.status === 'paye' ? (
                              <span className="text-[8px] bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded font-bold border border-emerald-150 flex items-center gap-0.5">
                                <span>💰 Payé</span>
                              </span>
                            ) : (
                              <span className="text-[8px] bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded font-bold border border-amber-150 flex items-center gap-0.5">
                                <span>⏳ Attente</span>
                              </span>
                            )}

                            {/* Download Facture if has URL */}
                            {inv.fileUrl && (
                              <a
                                href={inv.fileUrl}
                                download={`${selectedProvider.company}_facture_${inv.label}.png`}
                                className="p-1 hover:bg-slate-200 rounded-md transition text-slate-500"
                                title="Télécharger le justificatif"
                              >
                                <Download className="w-3 h-3" />
                              </a>
                            )}

                            {/* Delete specific invoice */}
                            <button
                              onClick={() => handleDeleteSubInvoice(inv.id, inv.amount)}
                              className="p-1 text-slate-400 hover:text-rose-600 rounded-md hover:bg-rose-50 opacity-0 group-hover:opacity-100 transition"
                              title="Retirer cette facture"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>

                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Total calculations */}
              <div className="bg-[#2C3E36]/5 p-3.5 rounded-xl border border-[#2C3E36]/10 flex justify-between items-center font-sans">
                <div>
                  <span className="text-[9px] font-bold text-[#7A7667] uppercase block tracking-wider">Montant total facturé</span>
                  <span className="text-[10px] text-[#A68A64] font-medium block">Cumul de son activité enregistrée</span>
                </div>
                <div className="text-right">
                  <span className="text-sm font-serif font-black text-[#26352E]">
                    {((selectedProvider.fournisseurInvoices || []).reduce((acc, curr) => acc + curr.amount, 0)).toLocaleString('fr-FR')}
                  </span>
                  <span className="text-[11px] font-bold text-[#26352E] ml-1">MAD</span>
                </div>
              </div>

            </div>
          ) : (
            <div className="bg-white border border-[#E8E6DE] rounded-2xl p-8 shadow-3xs text-center font-sans space-y-3">
              <Info className="w-8 h-8 text-[#A68A64] mx-auto opacity-70" />
              <h4 className="text-xs font-serif font-bold text-[#2D2D2D] uppercase tracking-wider">Fiche détaillée du prestataire</h4>
              <p className="text-[11px] text-[#7A7667]/80 max-w-xs mx-auto leading-relaxed">
                Cliquez sur un prestataire commercial ou fournisseur dans la liste pour consulter sa fiche complète, ses coordonnées, son historique de facturation ou uploader un nouveau justificatif.
              </p>
            </div>
          )}

        </div>

      </div>

      {/* MODAL LIGHTBOX FOR ENLARGING INVOICES */}
      {lightboxImage && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-xs cursor-pointer" 
          onClick={() => setLightboxImage(null)}
        >
          <div 
            className="relative bg-white max-w-4xl max-h-[85vh] rounded-3xl overflow-hidden shadow-2xl flex flex-col cursor-default font-sans animate-in zoom-in-95 duration-200" 
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#E8E6DE] bg-slate-50/50 shrink-0">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#A68A64] shrink-0" />
                <span className="font-bold text-[#2D2D2D] text-sm font-serif">{lightboxTitle}</span>
              </div>
              <button 
                onClick={() => setLightboxImage(null)} 
                className="p-1 px-3 bg-rose-50 hover:bg-rose-100 text-rose-700 hover:text-rose-800 rounded-xl text-xs font-bold font-sans transition cursor-pointer border border-rose-200"
              >
                Fermer ✕
              </button>
            </div>
            <div className="p-5 overflow-auto flex items-center justify-center bg-zinc-950 border-none min-h-[400px]">
              <img src={lightboxImage} alt="Justificatif de Facture Agrandie" className="max-w-full max-h-[65vh] object-contain rounded-xl border border-white/10 shadow-md" referrerPolicy="no-referrer" />
            </div>
          </div>
        </div>
      )}

      {/* SLIDE DOWN FORM MODAL : ADD OR EDIT SUPPLIER */}
      {showAddForm && (
        <div className="fixed inset-0 bg-[#2D2D2D]/60 backdrop-blur-xs flex items-center justify-center p-4 z-40 animate-in fade-in duration-200 font-sans">
          
          <form 
            onSubmit={handleSubmitForm}
            className="bg-white rounded-3xl border border-[#E8E6DE] shadow-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto p-5 sm:p-7 space-y-4 animate-in zoom-in-95 duration-200"
          >
            <div className="flex justify-between items-center border-b border-[#E8E6DE] pb-3">
              <div>
                <span className="text-[10px] font-bold text-[#A68A64] uppercase tracking-wider font-serif">Option de configuration</span>
                <h3 className="text-md sm:text-lg font-bold text-[#2D2D2D]">{editProviderId ? `Modifier : ${formCompany}` : "Nouveau Prestataire / Fournisseur"}</h3>
              </div>
              <button 
                type="button" 
                onClick={resetForm}
                className="p-1.5 hover:bg-slate-100 rounded-lg text-[#7A7667]"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Company Logo Upload */}
              <div className="sm:col-span-2 space-y-1.5 p-3.5 bg-[#FAF9F5] border border-[#E8E6DE] rounded-2xl flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-white border border-[#E8E6DE] overflow-hidden flex items-center justify-center shadow-3xs shrink-0">
                  {formLogo ? (
                    <img src={formLogo} alt="Logo" className="w-full h-full object-cover" />
                  ) : (
                    <Building2 className="w-6 h-6 text-[#A68A64]" />
                  )}
                </div>
                <div className="flex-1 space-y-1.5">
                  <span className="text-[10px] font-bold text-[#7A7667] uppercase block">Logo ou Image de l'entreprise</span>
                  <div className="flex items-center gap-2">
                    <label className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#E8E6DE] hover:border-[#A68A64] rounded-xl text-[11px] font-bold text-[#2D2D2D] cursor-pointer shadow-3xs transition">
                      <Upload className="w-3.5 h-3.5 text-[#A68A64]" />
                      <span>Sélectionner Image</span>
                      <input 
                        type="file"
                        accept="image/*"
                        onChange={handleLogoUpload}
                        className="hidden"
                      />
                    </label>
                    {formLogo && (
                      <button
                        type="button"
                        onClick={() => setFormLogo('')}
                        className="text-[10px] text-red-500 hover:underline font-bold"
                      >
                        Supprimer
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Company Name */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[#7A7667] uppercase tracking-wider block">Nom de l'entreprise *</label>
                <input 
                  type="text" 
                  value={formCompany} 
                  onChange={(e) => setFormCompany(e.target.value)}
                  placeholder="Ex: Print Maroc SARL"
                  className="w-full p-2.5 bg-[#FAF9F5] border border-[#E8E6DE] hover:border-[#A68A64] focus:bg-white rounded-xl text-xs text-[#2D2D2D] font-medium outline-hidden transition shadow-3xs"
                  required
                />
              </div>

              {/* Contact Name */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[#7A7667] uppercase tracking-wider block">Nom du Contact direct *</label>
                <input 
                  type="text" 
                  value={formName} 
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="Ex: M. Kamal Tazi"
                  className="w-full p-2.5 bg-[#FAF9F5] border border-[#E8E6DE] hover:border-[#A68A64] focus:bg-white rounded-xl text-xs text-[#2D2D2D] font-medium outline-hidden transition shadow-3xs"
                  required
                />
              </div>

              {/* Email */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[#7A7667] uppercase tracking-wider block">Adresse Email *</label>
                <input 
                  type="email" 
                  value={formEmail} 
                  onChange={(e) => setFormEmail(e.target.value)}
                  placeholder="Ex: contact@printmaroc.ma"
                  className="w-full p-2.5 bg-[#FAF9F5] border border-[#E8E6DE] hover:border-[#A68A64] focus:bg-white rounded-xl text-xs text-[#2D2D2D] font-medium outline-hidden transition shadow-3xs"
                  required
                />
              </div>

              {/* Phone */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[#7A7667] uppercase tracking-wider block">Téléphone direct</label>
                <input 
                  type="text" 
                  value={formPhone} 
                  onChange={(e) => setFormPhone(e.target.value)}
                  placeholder="Ex: +212 661-123456"
                  className="w-full p-2.5 bg-[#FAF9F5] border border-[#E8E6DE] hover:border-[#A68A64] focus:bg-white rounded-xl text-xs text-[#2D2D2D] font-medium outline-hidden transition shadow-3xs"
                />
              </div>

              {/* Type Category */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[#7A7667] uppercase tracking-wider block">Type d'engagement</label>
                <select
                  value={formType}
                  onChange={(e) => setFormType(e.target.value as any)}
                  className="w-full p-2.5 bg-[#FAF9F5] border border-[#E8E6DE] rounded-xl text-xs font-semibold text-[#2D2D2D] outline-hidden"
                >
                  <option value="prestataire">Prestataire technique (Prestation de service)</option>
                  <option value="fournisseur">Fournisseur matériel (Achat de fournitures)</option>
                </select>
              </div>

              {/* Event Associated */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[#7A7667] uppercase tracking-wider block">Salon / Événement principal</label>
                <select
                  value={formSite}
                  onChange={(e) => setFormSite(e.target.value as SiteId)}
                  className="w-full p-2.5 bg-[#FAF9F5] border border-[#E8E6DE] rounded-xl text-xs font-semibold text-[#2D2D2D] outline-hidden"
                >
                  {sites.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>

              {/* Custom Category dropdown */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[#7A7667] uppercase tracking-wider block">Catégorie d'activité</label>
                <select
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value)}
                  className="w-full p-2.5 bg-[#FAF9F5] border border-[#E8E6DE] rounded-xl text-xs font-semibold text-[#2D2D2D] outline-hidden"
                >
                  {categoriesPreset.map((cat, idx) => (
                    <option key={idx} value={cat}>{cat}</option>
                  ))}
                  <option value="Autre">Autre (Saisir manuellement)</option>
                </select>
              </div>

              {/* Manual Category if necessary */}
              {formCategory === 'Autre' && (
                <div className="space-y-1 animate-in slide-in-from-top duration-150">
                  <label className="text-[10px] font-bold text-[#7A7667] uppercase tracking-wider block">Saisir Autre Catégorie *</label>
                  <input 
                    type="text" 
                    value={formCustomCategory} 
                    onChange={(e) => setFormCustomCategory(e.target.value)}
                    placeholder="Ex: Hôtellerie, Hébergement..."
                    className="w-full p-2.5 bg-yellow-50/20 border border-[#A68A64] rounded-xl text-xs text-[#2D2D2D] font-medium outline-hidden"
                    required
                  />
                </div>
              )}

              {/* Supplier Status */}
              <div className="space-y-1.5 sm:col-span-2 border-t border-[#E8E6DE]/40 pt-2 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-[#7A7667] uppercase tracking-wider block">Statut d'activité</span>
                  <span className="text-[9px] text-[#7A7667]/60 block">Si inactif, le partenaire sera masqué par défaut</span>
                </div>
                <div className="flex bg-[#F0EEE6] p-1 rounded-xl border border-[#E8E6DE]/60">
                  <button
                    type="button"
                    onClick={() => setFormStatus('actif')}
                    className={`px-4.5 py-1.5 rounded-lg text-[9.5px] font-black transition-all cursor-pointer ${
                      formStatus === 'actif'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'text-[#7A7667] hover:text-[#2D2D2D]'
                    }`}
                  >
                    Actif
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormStatus('inactif')}
                    className={`px-4.5 py-1.5 rounded-lg text-[9.5px] font-black transition-all cursor-pointer ${
                      formStatus === 'inactif'
                        ? 'bg-rose-500 text-white shadow-xs'
                        : 'text-[#7A7667] hover:text-[#2D2D2D]'
                    }`}
                  >
                    Inactif
                  </button>
                </div>
              </div>

              {/* Notes */}
              <div className="sm:col-span-2 space-y-1">
                <label className="text-[10px] font-bold text-[#7A7667] uppercase tracking-wider block">Notes Internes & Commentaires</label>
                <textarea 
                  rows={2}
                  value={formNotes} 
                  onChange={(e) => setFormNotes(e.target.value)}
                  placeholder="Coûts indicatifs, conditions de règlement de l'acompte, etc..."
                  className="w-full p-2.5 bg-[#FAF9F5] border border-[#E8E6DE] hover:border-[#A68A64] focus:bg-white rounded-xl text-xs text-[#2D2D2D] font-medium outline-hidden transition shadow-3xs"
                />
              </div>

            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-[#E8E6DE] shrink-0">
              <button 
                type="button" 
                onClick={resetForm}
                className="px-4.5 py-2.5 bg-slate-50 hover:bg-slate-100 text-[#7A7667] rounded-xl text-xs font-bold font-sans transition"
              >
                Annuler
              </button>
              
              <button 
                type="submit" 
                className="px-5 py-2.5 bg-[#2C3E36] hover:bg-[#1C2B24] text-white rounded-xl text-xs font-bold font-sans tracking-wide transition shadow-xs"
              >
                {editProviderId ? "Enregistrer les modifications" : "Créer le compte partenaire"}
              </button>
            </div>

          </form>

        </div>
      )}

    </div>
  );
}
