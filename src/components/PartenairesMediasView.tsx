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
  Sparkles, 
  Radio, 
  Tv, 
  Newspaper, 
  Users, 
  Phone, 
  Mail, 
  Building2, 
  ExternalLink,
  Award,
  Calendar,
  Layers,
  Info,
  Globe
} from 'lucide-react';
import { SiteId, Contact } from '../types';

interface PartenairesMediasViewProps {
  selectedSite: SiteId;
  contacts: Contact[];
  setContacts: React.Dispatch<React.SetStateAction<Contact[]>>;
  sites: { id: string; name: string }[];
}

export default function PartenairesMediasView({
  selectedSite,
  contacts,
  setContacts,
  sites
}: PartenairesMediasViewProps) {
  
  // 1. Filter contacts to get media partners (role === 'partner_media')
  const mediaPartners = contacts.filter(c => c.role === 'partner_media');

  // 2. Local State variables
  const [siteFilter, setSiteFilter] = useState<SiteId | 'all'>(selectedSite);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'actif' | 'inactif'>('all');
  const [selectedPartner, setSelectedPartner] = useState<Contact | null>(null);

  // Lightbox view state
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const [lightboxTitle, setLightboxTitle] = useState('');

  // Add/Edit Form visibility toggle
  const [showAddForm, setShowAddForm] = useState(false);
  const [editPartnerId, setEditPartnerId] = useState<string | null>(null);

  // Main Form fields
  const [formCompany, setFormCompany] = useState('');
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formType, setFormType] = useState('Web / Actualités');
  const [formAudience, setFormAudience] = useState('National');
  const [formCoverage, setFormCoverage] = useState('');
  const [formStatus, setFormStatus] = useState<'actif' | 'inactif'>('actif');
  const [formLogo, setFormLogo] = useState('');
  const [formNotes, setFormNotes] = useState('');
  const [formSite, setFormSite] = useState<SiteId>(selectedSite);

  // Press article / Contract adding Form fields
  const [showAddArticleForm, setShowAddArticleForm] = useState(false);
  const [artLabel, setArtLabel] = useState('');
  const [artDate, setArtDate] = useState(new Date().toISOString().split('T')[0]);
  const [artUrl, setArtUrl] = useState('');
  const [artReach, setArtReach] = useState('');
  const [artImage, setArtImage] = useState('');

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Preset media types
  const mediaTypesPreset = [
    "Presse écrite (Papiers)",
    "Web / Actualités",
    "Télévision / Chaîne TV",
    "Radio / Diffusion",
    "Influenceur / Réseaux Sociaux",
    "Portail Spécialisé",
    "Autre"
  ];

  // Helper file loaders
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

  const handleArticleProofUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setArtImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Demo seed data loader
  const handleSeedMediaData = () => {
    const demoMediaPartners: Contact[] = [
      {
        id: `media-demo-1`,
        company: "L'Économiste du Maroc",
        name: "Amine Belghazi",
        email: "contact@leconomiste.com",
        phone: "+212 522-360150",
        site: selectedSite,
        role: 'partner_media',
        dateAdded: '2026-06-01',
        mediaType: "Presse écrite (Papiers)",
        mediaAudience: "National",
        mediaCoverage: "450k lecteurs / jour",
        mediaStatus: 'actif',
        mediaLogo: '',
        notes: "Partenaire presse francophone de premier plan au Maroc. Couverture complète de l'inauguration et diffusion de 3 bannières promotionnelles.",
        mediaArticles: [
          {
            id: 'art-demo-1a',
            label: 'Inauguration officielle du Salon de l\'immobilier',
            date: '2026-06-02',
            url: 'https://leconomiste.com',
            imageProof: '',
            reachEst: 120000
          },
          {
            id: 'art-demo-1b',
            label: 'Portrait d\'Innovation Éco-responsable',
            date: '2026-06-04',
            url: '',
            imageProof: '',
            reachEst: 85000
          }
        ]
      },
      {
        id: `media-demo-2`,
        company: "Medi1 TV Actualités",
        name: "Karim Tazi",
        email: "k.tazi@medi1tv.ma",
        phone: "+212 539-930202",
        site: selectedSite,
        role: 'partner_media',
        dateAdded: '2026-05-30',
        mediaType: "Télévision / Chaîne TV",
        mediaAudience: "International",
        mediaCoverage: "2.4M téléspectateurs",
        mediaStatus: 'actif',
        mediaLogo: '',
        notes: "Diffusion de flashs d'information en arabe et français réguliers durant la semaine du grand salon.",
        mediaArticles: [
          {
            id: 'art-demo-2a',
            label: 'Reportage télévisé - Direct Hall A',
            date: '2026-06-02',
            url: 'https://medi1tv.ma',
            imageProof: '',
            reachEst: 500000
          }
        ]
      },
      {
        id: `media-demo-3`,
        company: "TelQuel Magazine",
        name: "Yasmine Oufkir",
        email: "yasmine.o@telquel.ma",
        phone: "+212 661-412211",
        site: selectedSite,
        role: 'partner_media',
        dateAdded: '2026-06-03',
        mediaType: "Web / Actualités",
        mediaAudience: "National",
        mediaCoverage: "1.1M abonnés",
        mediaStatus: 'actif',
        mediaLogo: '',
        notes: "Relais digital intensif et couverture sur les plateformes sociales (Instagram, LinkedIn).",
        mediaArticles: [
          {
            id: 'art-demo-3a',
            label: 'Les tendances de l\'habitat de demain à Casablanca',
            date: '2026-06-03',
            url: 'https://telquel.ma',
            imageProof: '',
            reachEst: 140000
          }
        ]
      }
    ];

    setContacts(prev => [...demoMediaPartners, ...prev]);
    showToast("3 partenaires médias de démonstration initialisés.");
  };

  // Submit main creation/edition
  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formCompany || !formName || !formEmail) {
      alert("Veuillez remplir au moins le nom du média, du contact et l'email direct.");
      return;
    }

    if (editPartnerId) {
      // Edit mode
      setContacts(prev => prev.map(c => {
        if (c.id === editPartnerId) {
          return {
            ...c,
            company: formCompany,
            name: formName,
            email: formEmail,
            phone: formPhone,
            mediaType: formType,
            mediaAudience: formAudience,
            mediaCoverage: formCoverage,
            mediaStatus: formStatus,
            mediaLogo: formLogo || c.mediaLogo,
            notes: formNotes,
            site: formSite
          };
        }
        return c;
      }));

      // In-memory update
      if (selectedPartner && selectedPartner.id === editPartnerId) {
        setSelectedPartner(prev => prev ? {
          ...prev,
          company: formCompany,
          name: formName,
          email: formEmail,
          phone: formPhone,
          mediaType: formType,
          mediaAudience: formAudience,
          mediaCoverage: formCoverage,
          mediaStatus: formStatus,
          mediaLogo: formLogo || prev.mediaLogo,
          notes: formNotes,
          site: formSite
        } : null);
      }

      showToast(`Partenaire Média "${formCompany}" mis à jour.`);
    } else {
      // Creation mode
      const newMedia: Contact = {
        id: `media-${Date.now()}`,
        company: formCompany,
        name: formName,
        email: formEmail,
        phone: formPhone,
        site: formSite,
        role: 'partner_media',
        dateAdded: new Date().toISOString().split('T')[0],
        mediaType: formType,
        mediaAudience: formAudience,
        mediaCoverage: formCoverage,
        mediaStatus: formStatus,
        mediaLogo: formLogo,
        notes: formNotes,
        mediaArticles: []
      };

      setContacts(prev => [newMedia, ...prev]);
      showToast(`Partenaire Média "${formCompany}" inscrit avec succès !`);
    }

    resetForm();
  };

  const resetForm = () => {
    setFormCompany('');
    setFormName('');
    setFormEmail('');
    setFormPhone('');
    setFormType('Web / Actualités');
    setFormAudience('National');
    setFormCoverage('');
    setFormStatus('actif');
    setFormLogo('');
    setFormNotes('');
    setFormSite(selectedSite);
    setEditPartnerId(null);
    setShowAddForm(false);
  };

  const handleEditClick = (partner: Contact) => {
    setFormCompany(partner.company);
    setFormName(partner.name);
    setFormEmail(partner.email);
    setFormPhone(partner.phone || '');
    setFormType(partner.mediaType || 'Web / Actualités');
    setFormAudience(partner.mediaAudience || 'National');
    setFormCoverage(partner.mediaCoverage || '');
    setFormStatus(partner.mediaStatus || 'actif');
    setFormLogo(partner.mediaLogo || '');
    setFormNotes(partner.notes || '');
    setFormSite(partner.site);

    setEditPartnerId(partner.id);
    setShowAddForm(true);
  };

  const handleDeletePartner = (id: string, companyName: string) => {
    if (confirm(`Êtes-vous sûr de vouloir supprimer définitivement le partenaire média "${companyName}" ?`)) {
      setContacts(prev => prev.filter(c => c.id !== id));
      if (selectedPartner?.id === id) {
        setSelectedPartner(null);
      }
      showToast(`Partenaire ${companyName} supprimé.`);
    }
  };

  // Add press clipping or article proof to partner
  const handleAddArticleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPartner) return;
    if (!artLabel) {
      alert("Saisissez le titre ou libellé de l'article de presse.");
      return;
    }

    const reachVal = parseInt(artReach) || 0;

    const newArticle = {
      id: `art-${Date.now()}`,
      label: artLabel,
      date: artDate,
      url: artUrl,
      imageProof: artImage,
      reachEst: reachVal
    };

    const updatedArticles = [...(selectedPartner.mediaArticles || []), newArticle];

    setContacts(prev => prev.map(c => {
      if (c.id === selectedPartner.id) {
        return {
          ...c,
          mediaArticles: updatedArticles
        };
      }
      return c;
    }));

    setSelectedPartner(prev => prev ? {
      ...prev,
      mediaArticles: updatedArticles
    } : null);

    setArtLabel('');
    setArtDate(new Date().toISOString().split('T')[0]);
    setArtUrl('');
    setArtReach('');
    setArtImage('');
    setShowAddArticleForm(false);
    showToast(`Justificatif de couverture "${artLabel}" ajouté.`);
  };

  // Delete press clipping article
  const handleDeleteArticle = (articleId: string, titleName: string) => {
    if (!selectedPartner) return;
    if (confirm(`Confirmez-vous la suppression du justificatif "${titleName}" ?`)) {
      const updatedArticles = (selectedPartner.mediaArticles || []).filter(item => item.id !== articleId);

      setContacts(prev => prev.map(c => {
        if (c.id === selectedPartner.id) {
          return {
            ...c,
            mediaArticles: updatedArticles
          };
        }
        return c;
      }));

      setSelectedPartner(prev => prev ? {
        ...prev,
        mediaArticles: updatedArticles
      } : null);

      showToast("Justificatif retiré.");
    }
  };

  // Filter list
  const filteredPartners = mediaPartners.filter(item => {
    const matchesSite = siteFilter === 'all' ? true : item.site === siteFilter;
    const matchesType = typeFilter === 'all' ? true : (item.mediaType === typeFilter);
    const matchesStatus = statusFilter === 'all' ? true : (item.mediaStatus === statusFilter);

    const sTerm = searchQuery.toLowerCase();
    const matchesSearch = 
      item.company.toLowerCase().includes(sTerm) ||
      item.name.toLowerCase().includes(sTerm) ||
      item.email.toLowerCase().includes(sTerm) ||
      (item.phone || '').includes(sTerm) ||
      (item.mediaType || '').toLowerCase().includes(sTerm);

    return matchesSite && matchesType && matchesStatus && matchesSearch;
  });

  // Calculate stats based on all media partners list
  const activePartnersCount = mediaPartners.filter(p => p.mediaStatus === 'actif').length;
  const inactivePartnersCount = mediaPartners.filter(p => p.mediaStatus !== 'actif').length;

  const totalTrackedProofs = mediaPartners.reduce((acc, curr) => {
    return acc + (curr.mediaArticles?.length || 0);
  }, 0);

  const totalCoverageAudience = mediaPartners.reduce((acc, curr) => {
    const subSum = (curr.mediaArticles || []).reduce((s, a) => s + (a.reachEst || 0), 0);
    return acc + subSum;
  }, 0);

  // Helper type icons
  const getMediaTypeIcon = (type: string) => {
    if (type.includes("TV") || type.includes("Télévision")) return <Tv className="w-4 h-4 text-[#A68A64]" />;
    if (type.includes("Radio")) return <Radio className="w-4 h-4 text-[#A68A64]" />;
    return <Newspaper className="w-4 h-4 text-[#A68A64]" />;
  };

  return (
    <div className="flex-1 overflow-y-auto px-6 py-6 font-sans space-y-6">
      
      {/* Dynamic Toast feedback banner */}
      {toastMessage && (
        <div className="fixed top-24 right-6 bg-[#2C3E36] border-l-4 border-[#A68A64] text-white px-5 py-4.5 rounded-xl shadow-xl z-50 flex items-center gap-3 animate-in slide-in-from-right duration-200">
          <Sparkles className="w-5 h-5 text-[#A68A64] shrink-0" />
          <span className="text-xs font-semibold">{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="text-[#93A392] hover:text-white ml-2 text-xs">✕</button>
        </div>
      )}

      {/* DASHBOARD INDICATOR CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* KPI 1 : Total partenaires */}
        <div className="bg-white border border-[#E8E6DE] rounded-2xl p-4.5 flex items-center gap-4 shadow-3xs hover:border-[#2C3E36]/30 transition">
          <div className="w-11 h-11 bg-[#F5F3E9] rounded-xl flex items-center justify-center text-[#2C3E36] shrink-0">
            <Globe className="w-5.5 h-5.5 text-[#A68A64]" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-[#7A7667] uppercase tracking-wider">Partenaires Médias</p>
            <h3 className="text-xl font-bold text-[#2D2D2D] leading-tight mt-0.5">{mediaPartners.length}</h3>
            <p className="text-[9px] text-[#A68A64] font-medium mt-0.5">Radios, TV, Presse, Web</p>
          </div>
        </div>

        {/* KPI 2 : Actifs ratio */}
        <div className="bg-white border border-[#E8E6DE] rounded-2xl p-4.5 flex items-center gap-4 shadow-3xs hover:border-[#2C3E36]/30 transition">
          <div className="w-11 h-11 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600 shrink-0">
            <CheckCircle className="w-5.5 h-5.5 text-emerald-600" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-[#7A7667] uppercase tracking-wider">Médias Actifs</p>
            <h3 className="text-xl font-bold text-emerald-700 leading-tight mt-0.5">{activePartnersCount}</h3>
            <p className="text-[9px] text-[#93A392] font-semibold mt-0.5">{inactivePartnersCount} inactif(s)</p>
          </div>
        </div>

        {/* KPI 3 : Retombées de Presse / justificatifs */}
        <div className="bg-white border border-[#E8E6DE] rounded-2xl p-4.5 flex items-center gap-4 shadow-3xs hover:border-[#2C3E36]/30 transition">
          <div className="w-11 h-11 bg-rose-50 rounded-xl flex items-center justify-center text-rose-600 shrink-0">
            <FileText className="w-5.5 h-5.5 text-[#A68A64]" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-[#7A7667] uppercase tracking-wider">Justificatifs / Preuves</p>
            <h3 className="text-xl font-bold text-[#2D2D2D] leading-tight mt-0.5">{totalTrackedProofs}</h3>
            <p className="text-[9px] text-rose-500 font-bold mt-0.5">Articles & Directs TV</p>
          </div>
        </div>

        {/* KPI 4 : Audience cumulée Maroc/Ailleurs */}
        <div className="bg-white border border-[#E8E6DE] rounded-2xl p-4.5 flex items-center gap-4 shadow-3xs hover:border-[#2C3E36]/30 transition">
          <div className="w-11 h-11 bg-[#2C3E36]/5 rounded-xl flex items-center justify-center text-[#2C3E36] shrink-0">
            <Users className="w-5.5 h-5.5 text-[#2C3E36]" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-[#7A7667] uppercase tracking-wider font-sans">Audience Retombées Estimée</p>
            <h3 className="text-xl font-serif font-black text-[#2C3E36] leading-tight mt-0.5">
              {totalCoverageAudience >= 1000000 
                ? `${(totalCoverageAudience / 1000000).toFixed(1)}M` 
                : totalCoverageAudience.toLocaleString('fr-FR')} 
              <span className="text-xs font-sans font-bold ml-1 text-[#A68A64]">Vues</span>
            </h3>
            <p className="text-[9px] text-[#7E8F7A] font-medium mt-0.5">Portée de la couverture média</p>
          </div>
        </div>

      </div>

      {/* SEARCH AND FILTERS TOOLBAR */}
      <div className="bg-white border border-[#E8E6DE] rounded-3xl p-4 flex flex-col md:flex-row gap-3 items-center justify-between shadow-3xs">
        
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          
          <div className="relative w-full sm:w-60">
            <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-[#7A7667]/60" />
            <input 
              type="text" 
              placeholder="Rechercher média, contact, type..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-[#F8F7F2] border border-[#E8E6DE] focus:border-[#2C3E36] outline-hidden rounded-xl text-xs text-[#2D2D2D] font-medium placeholder:text-[#7A7667]/40"
            />
          </div>

          {/* Site context */}
          <select
            value={siteFilter}
            onChange={(e) => setSiteFilter(e.target.value as SiteId | 'all')}
            className="px-3 py-2 bg-white border border-[#E8E6DE] hover:border-[#2C3E36] rounded-xl text-xs font-semibold text-[#2D2D2D]"
          >
            <option value="all">Tous Événements</option>
            {sites.map(s => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>

          {/* Media type filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 bg-white border border-[#E8E6DE] hover:border-[#2C3E36] rounded-xl text-xs font-semibold text-[#2D2D2D]"
          >
            <option value="all">Tous types médias</option>
            {mediaTypesPreset.map(mt => (
              <option key={mt} value={mt}>{mt}</option>
            ))}
          </select>

          {/* Status filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-3 py-2 bg-white border border-[#E8E6DE] hover:border-[#2C3E36] rounded-xl text-xs font-semibold text-[#2D2D2D]"
          >
            <option value="all">Tous les statuts</option>
            <option value="actif">Actif uniquement</option>
            <option value="inactif">Inactif uniquement</option>
          </select>
        </div>

        {/* Action creation trigger button */}
        <button
          onClick={() => {
            resetForm();
            setShowAddForm(true);
          }}
          className="w-full md:w-auto px-5 py-2.5 bg-[#2C3E36] hover:bg-[#1C2B24] text-white rounded-xl text-xs font-bold font-sans tracking-wide transition shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <Plus className="w-4 h-4 text-[#A68A64]" />
          <span>Nouveau Partenaire Média</span>
        </button>

      </div>

      {/* TWO BLOCK COLLABORATION GRID: PARTNERS TABLE & IN-DEPTH DETAIL PANEL */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
        
        {/* Table representation Block */}
        <div className="bg-white border border-[#E8E6DE] rounded-3xl overflow-hidden shadow-3xs xl:col-span-2">
          
          <div className="px-5 py-4 border-b border-[#E8E6DE]/60 bg-slate-50/50 flex justify-between items-center">
            <h4 className="text-xs font-bold text-[#2D2D2D] uppercase tracking-wider flex items-center gap-2">
              <span>Fichier Relations Presse & Partenaires Médias</span>
              <span className="text-[10px] bg-[#E8E6DE] px-2 py-0.5 rounded-full text-[#7A7667] font-bold">
                {filteredPartners.length} média(s)
              </span>
            </h4>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#FAF9F5] border-b border-[#E8E6DE] text-[#7A7667] font-bold text-[10px] uppercase tracking-wider">
                  <th className="py-3 px-4">Média / Agence de presse</th>
                  <th className="py-3 px-4">Type de média</th>
                  <th className="py-3 px-4">Contact direct</th>
                  <th className="py-3 px-4">Audience / Couverture</th>
                  <th className="py-3 px-4 text-center">Retombées</th>
                  <th className="py-3 px-4 text-center">Statut</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8E6DE]/65">
                {filteredPartners.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-16 text-center text-slate-400">
                      <p className="italic text-xs mb-3">Aucun média enregistré ou ne correspond aux filtres.</p>
                      {mediaPartners.length === 0 && (
                        <button
                          type="button"
                          onClick={handleSeedMediaData}
                          className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#FAF9F5] hover:bg-[#F2EFE6] text-[#A68A64] hover:text-[#2C3E36] border border-[#E8E6DE] hover:border-[#A68A64] rounded-xl text-[10px] font-bold transition duration-150 cursor-pointer shadow-3xs"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>Initialiser des exemples de presse marocains</span>
                        </button>
                      )}
                    </td>
                  </tr>
                ) : (
                  filteredPartners.map(p => {
                    const totalClippingsCount = p.mediaArticles?.length || 0;
                    const reachSum = (p.mediaArticles || []).reduce((acc, curr) => acc + (curr.reachEst || 0), 0);

                    return (
                      <tr
                        key={p.id}
                        onClick={() => setSelectedPartner(p)}
                        className={`hover:bg-[#FAF9F5] transition cursor-pointer ${
                          selectedPartner?.id === p.id ? 'bg-[#F2EFE6]/50' : ''
                        }`}
                      >
                        
                        {/* Media Brand & Name */}
                        <td className="py-3.5 px-4 font-sans">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-[#FAF9F5] border border-[#E8E6DE] overflow-hidden flex items-center justify-center shrink-0">
                              {p.mediaLogo ? (
                                <img src={p.mediaLogo} alt={p.company} className="w-full h-full object-cover" />
                              ) : (
                                <Building2 className="w-4 h-4 text-[#A68A64]" />
                              )}
                            </div>
                            <div>
                              <div className="font-bold text-[#2D2D2D] text-[12px] flex items-center gap-1.5 leading-tight">
                                <span>{p.company}</span>
                              </div>
                              <span className="text-[10px] text-[#7A7667]/80 block mt-0.5">{p.name || 'Inconnu'}</span>
                            </div>
                          </div>
                        </td>

                        {/* Media type icon & Label */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-1.5 font-semibold text-[#2D2D2D]">
                            {getMediaTypeIcon(p.mediaType || '')}
                            <span className="text-[10px]">{p.mediaType || "Actualités"}</span>
                          </div>
                        </td>

                        {/* Communications (mail, ph) */}
                        <td className="py-3.5 px-4 font-sans space-y-0.5">
                          <div className="flex items-center gap-1.5 text-slate-600 font-medium">
                            <Phone className="w-3 h-3 text-[#A68A64]" />
                            <span>{p.phone || "N/A"}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-slate-500 text-[10px]">
                            <Mail className="w-3 h-3 text-[#93A392]" />
                            <span className="truncate max-w-[120px]">{p.email}</span>
                          </div>
                        </td>

                        {/* Coverage reach scale */}
                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-[#2D2D2D]">{p.mediaCoverage || "Non renseignée"}</div>
                          <span className="text-[9px] text-[#7A7667] bg-[#FAF9F5] border border-[#E8E6DE] px-1.5 py-0.5 rounded-sm mt-0.5 inline-block">
                            Cible : {p.mediaAudience || "Nationale"}
                          </span>
                        </td>

                        {/* Count of tracked clipping articles */}
                        <td className="py-3.5 px-4 text-center">
                          <div className="inline-block px-2.5 py-1 rounded bg-[#F5F3E9] border border-[#E2DFD3] text-center">
                            <span className="font-bold text-[#2C3E36] block">{totalClippingsCount} proof(s)</span>
                            <span className="text-[9px] text-[#A68A64] font-black mt-0.5 block">
                              {reachSum >= 1000 
                                ? `${(reachSum / 1000).toFixed(0)}k vues` 
                                : `${reachSum} vues`}
                            </span>
                          </div>
                        </td>

                        {/* Status badge */}
                        <td className="py-3.5 px-4 text-center">
                          {p.mediaStatus === 'inactif' ? (
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-semibold bg-slate-100 text-slate-500 border border-slate-200">
                              Inactif
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-250">
                              Actif
                            </span>
                          )}
                        </td>

                        {/* Control buttons */}
                        <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-1.5">
                            
                            <button
                              onClick={() => handleEditClick(p)}
                              className="p-1 text-slate-500 hover:text-[#A68A64] hover:bg-[#FAF9F5] rounded-lg transition"
                              title="Modifier les coordonnées"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            
                            <button
                              onClick={() => handleDeletePartner(p.id, p.company)}
                              className="p-1 text-slate-400 hover:text-red-500 hover:bg-rose-50 rounded-lg transition"
                              title="Supprimer"
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

        {/* Detailed Inspector Profile panel Column */}
        <div className="space-y-4">
          
          {selectedPartner ? (
            <div className="bg-white border border-[#E8E6DE] rounded-3xl p-5 shadow-3xs space-y-4 animate-in fade-in duration-200">
              
              {/* Profile Card Header */}
              <div className="flex justify-between items-start border-b border-[#E8E6DE]/60 pb-3.5">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-[#F5F3E9] border border-[#E8E6DE] overflow-hidden flex items-center justify-center shadow-3xs shrink-0">
                    {selectedPartner.mediaLogo ? (
                      <img src={selectedPartner.mediaLogo} alt={selectedPartner.company} className="w-full h-full object-cover" />
                    ) : (
                      <Building2 className="w-5 h-5 text-[#2C3E36]" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-sm font-serif font-black text-[#2D2D2D] leading-tight flex items-center gap-1.5">
                      <span>{selectedPartner.company}</span>
                    </h3>
                    <p className="text-[10px] text-[#A68A64] uppercase tracking-wider font-bold mt-0.5 flex items-center gap-1">
                      {getMediaTypeIcon(selectedPartner.mediaType || '')}
                      <span>{selectedPartner.mediaType || "Co-partenaire"}</span>
                    </p>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1">
                  {selectedPartner.mediaStatus === 'inactif' ? (
                    <span className="text-[8.5px] font-black uppercase text-slate-500 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-full">
                      Inactif
                    </span>
                  ) : (
                    <span className="text-[8.5px] font-black uppercase text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                      Média Actif
                    </span>
                  )}
                  <span className="text-[9px] text-[#7A7667]/60 mt-0.5">Depuis : {selectedPartner.dateAdded}</span>
                </div>
              </div>

              {/* Bio & Details Specs */}
              <div className="space-y-2 bg-[#FAF9F5] p-3 rounded-xl border border-[#E8E6DE]/40 text-xs">
                <div className="flex justify-between">
                  <span className="text-[#7A7667] font-semibold text-[10px] uppercase">Correspondant presse</span>
                  <span className="text-[#2D2D2D] font-bold">{selectedPartner.name || "N/A"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#7A7667] font-semibold text-[10px] uppercase">E-mail de contact</span>
                  <a href={`mailto:${selectedPartner.email}`} className="text-[#A68A64] hover:underline font-bold">
                    {selectedPartner.email}
                  </a>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#7A7667] font-semibold text-[10px] uppercase">Téléphone fixe/mobile</span>
                  <span className="text-[#2D2D2D] font-bold">{selectedPartner.phone || "N/A"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#7A7667] font-semibold text-[10px] uppercase">Diffusion estimée</span>
                  <span className="text-[#2D2D2D] font-bold">{selectedPartner.mediaCoverage || "Non déclarée"}</span>
                </div>

                {selectedPartner.notes && (
                  <div className="border-t border-[#E8E6DE]/45 pt-1.5 mt-1">
                    <span className="text-[#7A7667] font-bold text-[9px] uppercase block mb-1">Cahier des charges / Notes</span>
                    <p className="text-[10px] text-slate-600 bg-white/60 p-2 rounded-lg border border-[#E8E6DE]/30 italic leading-relaxed">
                      "{selectedPartner.notes}"
                    </p>
                  </div>
                )}
              </div>

              {/* Inbound publications list & Proof visual uploads */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <h4 className="text-[10px] font-bold text-[#2D2D2D] uppercase tracking-wider flex items-center gap-1">
                    <Award className="w-3.5 h-3.5 text-[#A68A64]" />
                    <span>Rapports & Retombées de Presse</span>
                  </h4>

                  <button
                    onClick={() => setShowAddArticleForm(!showAddArticleForm)}
                    className="text-[9px] text-[#A68A64] hover:text-[#2C3E36] font-bold flex items-center gap-1 bg-[#FAF9F5] border border-[#E8E6DE] px-2 py-1 rounded-lg transition"
                  >
                    <span>{showAddArticleForm ? "Annuler" : "+ Enregistrer"}</span>
                  </button>
                </div>

                {/* Proof Add Form block */}
                {showAddArticleForm && (
                  <form onSubmit={handleAddArticleSubmit} className="bg-[#FAF9F5] border border-[#E8E6DE] p-3.5 rounded-xl space-y-3 animate-in slide-in-from-top duration-200">
                    <div className="text-[9px] text-[#A68A64] font-bold uppercase pb-1 border-b border-[#E8E6DE]">Publier une preuve de parution</div>
                    
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-[#7A7667] uppercase block">Titre de la publication / émission</label>
                      <input 
                        type="text"
                        value={artLabel}
                        onChange={(e) => setArtLabel(e.target.value)}
                        placeholder="Ex: Pleine page - Édition du Matin"
                        className="w-full p-2 bg-white border border-[#E8E6DE] rounded-lg text-xs"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-[#7A7667] uppercase block">Date Parution</label>
                        <input 
                          type="date"
                          value={artDate}
                          onChange={(e) => setArtDate(e.target.value)}
                          className="w-full p-2 bg-white border border-[#E8E6DE] rounded-lg text-xs"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-[#7A7667] uppercase block">Audience estimée (vues)</label>
                        <input 
                          type="number"
                          value={artReach}
                          onChange={(e) => setArtReach(e.target.value)}
                          placeholder="Ex: 85000"
                          className="w-full p-2 bg-white border border-[#E8E6DE] rounded-lg text-xs"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-[#7A7667] uppercase block">Lien de l'article (si web)</label>
                      <input 
                        type="url"
                        value={artUrl}
                        onChange={(e) => setArtUrl(e.target.value)}
                        placeholder="Ex: https://..."
                        className="w-full p-2 bg-white border border-[#E8E6DE] rounded-lg text-xs"
                      />
                    </div>

                    {/* Clipping image upload */}
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-[#7A7667] uppercase block">Image justificative / Scan d'article</label>
                      <div className="flex items-center gap-2">
                        <label className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#E8E6DE] hover:border-[#A68A64] rounded-lg text-[10px] font-bold text-[#2D2D2D] cursor-pointer shadow-3xs transition">
                          <Upload className="w-3 h-3 text-[#A68A64]" />
                          <span>Mettre photo</span>
                          <input 
                            type="file"
                            accept="image/*"
                            onChange={handleArticleProofUpload}
                            className="hidden"
                          />
                        </label>
                        {artImage ? (
                          <span className="text-[9px] text-emerald-600 font-bold">✓ Chargée</span>
                        ) : (
                          <span className="text-[9px] text-slate-400 italic font-medium">Aucun fichier</span>
                        )}
                      </div>
                    </div>

                    <div className="flex justify-end pt-1.5 border-t border-[#E8E6DE]/40">
                      <button
                        type="submit"
                        className="px-3 py-1.5 bg-[#2C3E36] text-white font-bold rounded-lg text-[10px]"
                      >
                        Enregistrer retombée
                      </button>
                    </div>

                  </form>
                )}

                {/* Actual outputs mapping */}
                <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                  {(!selectedPartner.mediaArticles || selectedPartner.mediaArticles.length === 0) ? (
                    <div className="text-center py-8 bg-[#FAF9F5] rounded-xl border border-dashed border-[#E8E6DE] text-[#7A7667]/60 italic text-[11px]">
                      Aucun article de presse répertorié pour le moment.
                    </div>
                  ) : (
                    selectedPartner.mediaArticles.map((art) => (
                      <div key={art.id} className="bg-[#FAF9F5] border border-[#E8E6DE]/60 rounded-xl p-3 flex justify-between items-center gap-2 hover:border-[#A68A64]/40 transition group">
                        
                        <div className="flex items-center gap-2.5 shrink-0">
                          {art.imageProof ? (
                            <div 
                              onClick={() => {
                                setLightboxImage(art.imageProof || '');
                                setLightboxTitle(`${selectedPartner.company} - ${art.label}`);
                              }}
                              className="w-10 h-10 bg-black border border-slate-200 rounded-lg overflow-hidden flex items-center justify-center shrink-0 cursor-zoom-in relative group/th"
                            >
                              <img src={art.imageProof} alt={art.label} className="w-full h-full object-cover group-hover/th:scale-110 transition duration-150" />
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/th:opacity-100 flex items-center justify-center transition">
                                <Eye className="w-3.5 h-3.5 text-white" />
                              </div>
                            </div>
                          ) : (
                            <div className="w-10 h-10 bg-white border border-[#E8E6DE] rounded-lg flex items-center justify-center text-slate-400 shrink-0">
                              <FileText className="w-4 h-4 text-slate-400" />
                            </div>
                          )}

                          <div className="max-w-[130px]">
                            <span className="font-bold text-[#2D2D2D] leading-tight block text-[11px] truncate">{art.label}</span>
                            <span className="text-[9px] text-[#7A7667]/80 font-medium block mt-0.5">{art.date}</span>
                          </div>
                        </div>

                        <div className="flex flex-col items-end gap-1 shrink-0">
                          {art.reachEst ? (
                            <span className="font-bold text-[#2C3E36] text-[11px]">~{art.reachEst.toLocaleString('fr-FR')} vues</span>
                          ) : (
                            <span className="text-[10px] text-slate-400 font-medium">Portée ND</span>
                          )}

                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                            {art.url && (
                              <a 
                                href={art.url} 
                                target="_blank" 
                                rel="noreferrer"
                                className="p-1 hover:bg-slate-200 rounded-md transition text-[#A68A64]"
                                title="Ouvrir le lien web"
                              >
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            )}
                            
                            {art.imageProof && (
                              <a 
                                href={art.imageProof} 
                                download={`${selectedPartner.company}_retombee_${art.label}.png`}
                                className="p-1 hover:bg-slate-200 rounded-md transition text-slate-500"
                                title="Télécharger justificatif"
                              >
                                <Download className="w-3 h-3" />
                              </a>
                            )}

                            <button
                              onClick={() => handleDeleteArticle(art.id, art.label)}
                              className="p-1 text-slate-400 hover:text-rose-600 rounded-md hover:bg-rose-50 transition"
                              title="Retirer retombée"
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

            </div>
          ) : (
            <div className="bg-white border border-[#E8E6DE] rounded-3xl p-8 text-center font-sans space-y-3 shadow-3xs">
              <Info className="w-8 h-8 text-[#A68A64] mx-auto opacity-70" />
              <h4 className="text-xs font-serif font-bold text-[#2D2D2D] uppercase tracking-wider">Fiche Média Spécifique</h4>
              <p className="text-[11px] text-[#7A7667]/80 max-w-xs mx-auto leading-relaxed">
                Naviguez et sélectionnez un partenaire de presse ou d'actualités dans la liste de gauche pour consulter ses données d'audience, relances d'articles de presse, et justificatifs d'affichage d'événements.
              </p>
            </div>
          )}

        </div>

      </div>

      {/* LIGHTBOX POPUP FOR PRESS PREVIEWS */}
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
              <span className="font-bold text-[#2D2D2D] text-sm font-serif">{lightboxTitle}</span>
              <button 
                onClick={() => setLightboxImage(null)} 
                className="p-1 px-3 bg-rose-50 hover:bg-rose-100 text-rose-700 hover:text-rose-800 rounded-xl text-xs font-bold font-sans transition cursor-pointer border border-rose-200"
              >
                Fermer ✕
              </button>
            </div>
            <div className="p-5 overflow-auto flex items-center justify-center bg-zinc-950 border-none min-h-[400px]">
              <img src={lightboxImage} alt="Retombée ou parution" className="max-w-full max-h-[65vh] object-contain rounded-xl border border-white/10 shadow-md" referrerPolicy="no-referrer" />
            </div>
          </div>
        </div>
      )}

      {/* OVERLAY SLIDER FORM Modal: CREATE & MUTATE PARTNER */}
      {showAddForm && (
        <div className="fixed inset-0 bg-[#2D2D2D]/60 backdrop-blur-xs flex items-center justify-center p-4 z-40 animate-in fade-in duration-200">
          
          <form 
            onSubmit={handleSubmitForm}
            className="bg-white rounded-3xl border border-[#E8E6DE] shadow-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto p-5 sm:p-7 space-y-4 animate-in zoom-in-95 duration-200"
          >
            <div className="flex justify-between items-center border-b border-[#E8E6DE] pb-3">
              <div>
                <span className="text-[10px] font-bold text-[#A68A64] uppercase tracking-wider font-serif">Option Partenariat Presse</span>
                <h3 className="text-md sm:text-lg font-bold text-[#2D2D2D]">
                  {editPartnerId ? `Modifier : ${formCompany}` : "Nouveau Partenaire Média"}
                </h3>
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
              
              {/* Logo upload row */}
              <div className="sm:col-span-2 space-y-1.5 p-3 bg-[#FAF9F5] border border-[#E8E6DE] rounded-2xl flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-white border border-[#E8E6DE] overflow-hidden flex items-center justify-center shadow-3xs shrink-0">
                  {formLogo ? (
                    <img src={formLogo} alt="Logo" className="w-full h-full object-cover" />
                  ) : (
                    <Building2 className="w-6 h-6 text-[#A68A64]" />
                  )}
                </div>
                <div className="flex-1 space-y-1.5">
                  <span className="text-[10px] font-bold text-[#7A7667] uppercase block">Logo ou Emblème du média</span>
                  <div className="flex items-center gap-2">
                    <label className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#E8E6DE] hover:border-[#A68A64] rounded-xl text-[11px] font-bold text-[#2D2D2D] cursor-pointer shadow-3xs transition-all">
                      <Upload className="w-3.5 h-3.5 text-[#A68A64]" />
                      <span>Parcourir</span>
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
                        className="text-[10px] text-rose-500 hover:underline font-bold"
                      >
                        Retirer
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Company / Media Name */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[#7A7667] uppercase block">Nom du média / Organisme *</label>
                <input 
                  type="text" 
                  value={formCompany} 
                  onChange={(e) => setFormCompany(e.target.value)}
                  placeholder="Ex: Le Matin du Sahara"
                  className="w-full p-2.5 bg-[#FAF9F5] border border-[#E8E6DE] focus:bg-white rounded-xl text-xs text-[#2D2D2D] font-medium outline-hidden transition shadow-3xs"
                  required
                />
              </div>

              {/* Correspondent Name */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[#7A7667] uppercase block">Correspondant / Contact principal *</label>
                <input 
                  type="text" 
                  value={formName} 
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="Ex: Hicham Senhaji"
                  className="w-full p-2.5 bg-[#FAF9F5] border border-[#E8E6DE] focus:bg-white rounded-xl text-xs text-[#2D2D2D] font-medium outline-hidden transition shadow-3xs"
                  required
                />
              </div>

              {/* Direct E-mail */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[#7A7667] uppercase block">E-mail de contact *</label>
                <input 
                  type="email" 
                  value={formEmail} 
                  onChange={(e) => setFormEmail(e.target.value)}
                  placeholder="Ex: h.senhaji@lematin.ma"
                  className="w-full p-2.5 bg-[#FAF9F5] border border-[#E8E6DE] focus:bg-white rounded-xl text-xs text-[#2D2D2D] font-medium outline-hidden transition shadow-3xs"
                  required
                />
              </div>

              {/* Phone Line */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[#7A7667] uppercase block">Téléphone direct</label>
                <input 
                  type="text" 
                  value={formPhone} 
                  onChange={(e) => setFormPhone(e.target.value)}
                  placeholder="Ex: +212 663-123456"
                  className="w-full p-2.5 bg-[#FAF9F5] border border-[#E8E6DE] focus:bg-white rounded-xl text-xs text-[#2D2D2D] font-medium outline-hidden transition shadow-3xs"
                />
              </div>

              {/* Select type media */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[#7A7667] uppercase block">Type de support média</label>
                <select
                  value={formType}
                  onChange={(e) => setFormType(e.target.value)}
                  className="w-full p-2.5 bg-[#FAF9F5] border border-[#E8E6DE] rounded-xl text-xs font-semibold text-[#2D2D2D]"
                >
                  {mediaTypesPreset.map(mt => (
                    <option key={mt} value={mt}>{mt}</option>
                  ))}
                </select>
              </div>

              {/* Select audience scale */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[#7A7667] uppercase block">Audience de couverture</label>
                <select
                  value={formAudience}
                  onChange={(e) => setFormAudience(e.target.value)}
                  className="w-full p-2.5 bg-[#FAF9F5] border border-[#E8E6DE] rounded-xl text-xs font-semibold text-[#2D2D2D]"
                >
                  <option value="National">National (Maroc)</option>
                  <option value="Régional">Régional</option>
                  <option value="International">International</option>
                </select>
              </div>

              {/* Volume of reach (coverage) text */}
              <div className="space-y-1 sm:col-span-2">
                <label className="text-[10px] font-bold text-[#7A7667] uppercase block">Chiffres de couverture (Audience mensuelle / relayeurs)</label>
                <input 
                  type="text" 
                  value={formCoverage} 
                  onChange={(e) => setFormCoverage(e.target.value)}
                  placeholder="Ex: 850k abonnés Instagram / 120k tirages quotidiens"
                  className="w-full p-2.5 bg-[#FAF9F5] border border-[#E8E6DE] focus:bg-white rounded-xl text-xs text-[#2D2D2D] font-medium outline-hidden transition shadow-3xs"
                />
              </div>

              {/* Linked site/event project */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[#7A7667] uppercase block">Événement ciblé</label>
                <select
                  value={formSite}
                  onChange={(e) => setFormSite(e.target.value as SiteId)}
                  className="w-full p-2.5 bg-[#FAF9F5] border border-[#E8E6DE] rounded-xl text-xs font-semibold text-[#2D2D2D]"
                >
                  {sites.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>

              {/* Active / Inactive status */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[#7A7667] uppercase block">Statut du partenariat</label>
                <div className="flex bg-[#FAF9F5] border border-[#E8E6DE] p-1.5 rounded-xl text-xs font-bold shadow-3xs">
                  <button
                    type="button"
                    onClick={() => setFormStatus('actif')}
                    className={`flex-1 py-1.5 rounded-lg transition-all ${formStatus === 'actif' ? 'bg-[#2C3E36] text-white shadow-xs' : 'text-[#7A7667]'}`}
                  >
                    Actif
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormStatus('inactif')}
                    className={`flex-1 py-1.5 rounded-lg transition-all ${formStatus === 'inactive' || formStatus === 'inactif' ? 'bg-rose-750 bg-[#A68A64] text-white shadow-xs' : 'text-[#7A7667]'}`}
                  >
                    Inactif
                  </button>
                </div>
              </div>

              {/* Private Notes block */}
              <div className="sm:col-span-2 space-y-1">
                <label className="text-[10px] font-bold text-[#7A7667] uppercase block">Notes de négociation contractuelle & Accords</label>
                <textarea 
                  value={formNotes} 
                  onChange={(e) => setFormNotes(e.target.value)}
                  placeholder="Mentionner les détails de l'entente d'échange de visibilité (dates, formats publicitaires, etc.)"
                  rows={3}
                  className="w-full p-2.5 bg-[#FAF9F5] border border-[#E8E6DE] focus:bg-white rounded-xl text-xs text-[#2D2D2D] font-medium outline-hidden transition shadow-3xs resize-none"
                />
              </div>

            </div>

            {/* Buttons control footer */}
            <div className="flex justify-between items-center pt-4 border-t border-[#E8E6DE] font-semibold text-xs">
              <button
                type="button"
                onClick={resetForm}
                className="px-4.5 py-2.5 bg-slate-50 hover:bg-slate-100 border border-[#E8E6DE] rounded-xl text-[#7A7667] transition-all"
              >
                Annuler
              </button>
              
              <button
                type="submit"
                className="px-6 py-2.5 bg-[#2C3E36] hover:bg-[#1C2B24] text-white font-bold rounded-xl shadow-xs transition-all"
              >
                {editPartnerId ? "Enregistrer les modifications" : "Inscrire Partenaire"}
              </button>
            </div>

          </form>

        </div>
      )}

    </div>
  );
}
