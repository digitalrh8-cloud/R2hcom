/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Users, 
  UserPlus, 
  Search, 
  MapPin, 
  CheckCircle2, 
  ArrowRight, 
  Mail, 
  Phone, 
  Building,
  UserCheck,
  AlertCircle,
  Clock,
  ExternalLink,
  UserSquare2,
  Compass,
  FileText,
  Receipt,
  X,
  Plus,
  Trash2,
  RefreshCw,
  Edit
} from 'lucide-react';
import { SiteId, SiteConfig, Contact, Stand, Transaction, TransactionItem } from '../types';
import { initialSites } from '../initialData';

interface CrmViewProps {
  selectedSite: SiteId;
  contacts: Contact[];
  setContacts: React.Dispatch<React.SetStateAction<Contact[]>>;
  stands?: Stand[];
  setStands?: React.Dispatch<React.SetStateAction<Stand[]>>;
  transactions?: Transaction[];
  setTransactions?: React.Dispatch<React.SetStateAction<Transaction[]>>;
  setCurrentTab?: (tab: string) => void;
  sites?: SiteConfig[];
}

export const getProspectStatusLabel = (status?: string) => {
  switch (status) {
    case 'interesse': return 'Intéressé';
    case 'pas_interesse': return 'Pas intéressé';
    case 'a_rappeler': return 'À rappeler';
    case 'relance': return 'Relance';
    case 'demande_devis': return 'Demande de devis';
    default: return 'Nouveau';
  }
};

export const getProspectStatusColorClass = (status?: string) => {
  switch (status) {
    case 'interesse': return 'bg-emerald-50 text-emerald-700 border-emerald-200/80';
    case 'pas_interesse': return 'bg-rose-50 text-rose-700 border-rose-200/80';
    case 'a_rappeler': return 'bg-amber-50 text-amber-700 border-amber-250/80';
    case 'relance': return 'bg-cyan-50 text-cyan-700 border-cyan-200/80';
    case 'demande_devis': return 'bg-purple-50 text-purple-700 border-purple-200/80';
    default: return 'bg-slate-50 text-slate-600 border-slate-200/80';
  }
};

export default function CrmView({ 
  selectedSite, 
  contacts, 
  setContacts,
  stands = [],
  setStands,
  transactions = [],
  setTransactions,
  setCurrentTab,
  sites
}: CrmViewProps) {
  const sitesList = sites || initialSites;
  
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);

  // Form Fields State
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newCompany, setNewCompany] = useState('');
  const [newSite, setNewSite] = useState<SiteId>(selectedSite === 'r2h' ? 'gardenexpo' : selectedSite);
  const [newRole, setNewRole] = useState<'prospect' | 'client' | 'partner_media'>('prospect');
  const [newNotes, setNewNotes] = useState('');
  const [newStandNumber, setNewStandNumber] = useState('');
  const [newProspectStatus, setNewProspectStatus] = useState<'interesse' | 'pas_interesse' | 'a_rappeler' | 'relance' | 'demande_devis'>('interesse');
  const [newStandType, setNewStandType] = useState<'surface_nue' | 'equipe' | 'personalise' | 'exceptionnel'>('surface_nue');
  const [newExceptionalPrice, setNewExceptionalPrice] = useState<string>('');
  const [newStandArea, setNewStandArea] = useState<string>('');
  const [newIncludeRegFee, setNewIncludeRegFee] = useState<boolean>(true);
  const [newRegFeeMode, setNewRegFeeMode] = useState<'yes' | 'no' | 'manual'>('yes');
  const [newRegFeeManualAmount, setNewRegFeeManualAmount] = useState<string>('2500');

  // Calculate sorted free stands for the selected site
  const freeStands = stands
    .filter(s => s.site === newSite && s.status === 'disponible')
    .sort((a, b) => a.num.localeCompare(b.num, undefined, { numeric: true, sensitivity: 'base' }));

  // Edit Modal State
  const [editModalContact, setEditModalContact] = useState<Contact | null>(null);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editCompany, setEditCompany] = useState('');
  const [editSite, setEditSite] = useState<SiteId>('gardenexpo');
  const [editRole, setEditRole] = useState<'prospect' | 'client' | 'fournisseur' | 'partner' | 'partner_media'>('prospect');
  const [editNotes, setEditNotes] = useState('');
  const [editStandNumber, setEditStandNumber] = useState('');
  const [editProspectStatus, setEditProspectStatus] = useState<'interesse' | 'pas_interesse' | 'a_rappeler' | 'relance' | 'demande_devis'>('interesse');
  const [editStandType, setEditStandType] = useState<'surface_nue' | 'equipe' | 'personalise' | 'exceptionnel'>('surface_nue');
  const [editExceptionalPrice, setEditExceptionalPrice] = useState<string>('');
  const [editStandArea, setEditStandArea] = useState<string>('');
  const [editIncludeRegFee, setEditIncludeRegFee] = useState<boolean>(true);
  const [editRegFeeMode, setEditRegFeeMode] = useState<'yes' | 'no' | 'manual'>('yes');
  const [editRegFeeManualAmount, setEditRegFeeManualAmount] = useState<string>('2500');

  // Calculate sorted free stands for editing site, including the contact's current stand
  const editFreeStands = stands
    .filter(s => s.site === editSite && (s.status === 'disponible' || (editModalContact && s.num.toLowerCase() === editModalContact.standNumber?.toLowerCase() && s.site === editModalContact.site)))
    .sort((a, b) => a.num.localeCompare(b.num, undefined, { numeric: true, sensitivity: 'base' }));

  // Toast indicator
  const [toastMessage, setToastMessage] = useState<React.ReactNode | null>(null);

  // Synchronise sold and reserved stands to CRM contacts dynamically
  const handleSyncStandsToCrm = (isSilent = false) => {
    let countAdded = 0;
    let countUpdated = 0;
    
    setContacts(prev => {
      const updatedContacts = [...prev];
      
      stands.forEach(stand => {
        // We look at rented ('vendu') and optioned ('reserve') stands
        if (stand.status === 'vendu' || stand.status === 'reserve' || stand.status === 'sponsorise') {
          // Check if there is already a contact assigned to this specific stand (case insensitive)
          const contactWithStandIdx = updatedContacts.findIndex(c => 
            c.site === stand.site && 
            c.standNumber?.trim().toLowerCase() === stand.num.trim().toLowerCase()
          );
          
          // Or find a contact matching the identical company name in that site that doesn't have a standNumber yet
          const contactWithCompanyIdx = updatedContacts.findIndex(c => 
            c.site === stand.site && 
            c.company.trim().toLowerCase() === (stand.companyName || '').trim().toLowerCase()
          );
          
          if (contactWithStandIdx !== -1) {
            // Found a matching contact for this stand. Let's make sure its role and name are synchronized!
            const match = updatedContacts[contactWithStandIdx];
            let changed = false;
            
            if (stand.companyName && match.company !== stand.companyName) {
              match.company = stand.companyName;
              changed = true;
            }
            if (stand.clientName && match.name !== stand.clientName) {
              match.name = stand.clientName;
              changed = true;
            }
            const expectedRole = stand.status === 'vendu' || stand.status === 'sponsorise' ? 'client' : 'prospect';
            if (match.role !== expectedRole) {
              match.role = expectedRole;
              changed = true;
            }
            
            if (changed) {
              countUpdated++;
            }
          } else if (contactWithCompanyIdx !== -1) {
            // Found matching company name in GRC without stand number. Let's assign the stand number to link them.
            const match = updatedContacts[contactWithCompanyIdx];
            match.standNumber = stand.num;
            const expectedRole = stand.status === 'vendu' || stand.status === 'sponsorise' ? 'client' : 'prospect';
            if (match.role !== expectedRole) {
              match.role = expectedRole;
            }
            if (stand.clientName && stand.clientName !== 'À désigner' && match.name !== stand.clientName) {
              match.name = stand.clientName;
            }
            countUpdated++;
          } else {
            // NO MATCH FOUND - Create a synchronized contact card in GRC
            const companyName = stand.companyName?.trim() || `Option Stand ${stand.num}`;
            const clientName = stand.clientName?.trim() || `Interlocuteur ${stand.num}`;
            
            // Format temporary email as requested by user
            const normalizedCompany = companyName
              .toLowerCase()
              .normalize("NFD")
              .replace(/[\u0300-\u036f]/g, "") // remove accents
              .replace(/[^a-z0-9]/g, ''); // alphanumeric slug
            
            const tempEmail = `contact@${normalizedCompany || 'exposant'}-${stand.num.toLowerCase().replace(/[^a-z0-9]/g, '')}.ma`;
            
            const newContact: Contact = {
              id: `c_synced_${stand.site}_${stand.num}_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
              name: clientName,
              company: companyName,
              email: tempEmail,
              phone: '+212 660 000 000',
              site: stand.site,
              role: stand.status === 'vendu' || stand.status === 'sponsorise' ? 'client' : 'prospect',
              dateAdded: new Date().toISOString().split('T')[0],
              notes: `Synchronisé automatiquement depuis le plan (Stand ${stand.num}, ${stand.hall}).`,
              standNumber: stand.num
            };
            
            updatedContacts.push(newContact);
            countAdded++;
          }
        }
      });
      
      return updatedContacts;
    });

    if (!isSilent) {
      if (countAdded > 0 || countUpdated > 0) {
        triggerToast(
          <span>
            <strong>Synchro réussie !</strong> {countAdded} entreprises importées dans le CRM, {countUpdated} coordonnées ré-associées de manière transparente.
          </span>
        );
      } else {
        triggerToast("Vos coordonnées CRM sont déjà à jour avec le plan.");
      }
    }
  };

  // Run automatically on load to ensure everything from Africa Pool and Garden Expo plans matches the CRM
  useEffect(() => {
    // Only run this when stands have loaded and we have contacts
    if (stands && stands.length > 0 && contacts && contacts.length > 0) {
      const timer = setTimeout(() => {
        handleSyncStandsToCrm(true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [stands.length]);

  // Invoice Generator State
  const [invoiceModalContact, setInvoiceModalContact] = useState<Contact | null>(null);
  const [customInvoiceItems, setCustomInvoiceItems] = useState<TransactionItem[]>([]);
  const [invoiceNotes, setInvoiceNotes] = useState<string>('');

  const handleOpenInvoiceGenerator = (contact: Contact) => {
    // Step 1: Find matching stands
    const matchedStands = stands.filter(s => 
      s.companyName?.toLowerCase() === contact.company.toLowerCase() || 
      s.clientName?.toLowerCase() === contact.name.toLowerCase()
    );

    // Step 2: Find matching devis (quotes) by client name or company name (most recent first)
    const matchedDevis = transactions
      .filter(t => t.type === 'devis' && (
        t.companyName?.toLowerCase() === contact.company.toLowerCase() || 
        t.clientName?.toLowerCase() === contact.name.toLowerCase()
      ))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    let initialItems: TransactionItem[] = [];

    if (matchedStands.length > 0) {
      initialItems = matchedStands.map((stand, idx) => {
        let finalPrice = stand.area * (stand.pricePerM2 || 2500);
        let categoryLabel = "Surface Nue";
        
        if (stand.standType === 'equipe') {
          categoryLabel = "Stand Équipé";
          finalPrice = stand.area * ((stand.pricePerM2 || 2500) + 500);
        } else if (stand.standType === 'personalise') {
          categoryLabel = "Stand Personnalisé";
          finalPrice = stand.area * ((stand.pricePerM2 || 2500) + 1200);
        }
        
        // Exceptional price overrides default calculations if configured
        if (stand.exceptionalPrice !== undefined && stand.exceptionalPrice !== null && stand.exceptionalPrice > 0) {
          finalPrice = stand.exceptionalPrice;
          categoryLabel += " - Tarif Exceptionnel";
        }

        return {
          id: `item_st_${stand.id}_${idx}_${Date.now()}`,
          description: `Espace stand ${stand.num} (${stand.hall}) - ${stand.area}m² (${categoryLabel})`,
          quantity: 1,
          unitPrice: finalPrice
        };
      });
    } else if (matchedDevis.length > 0 && matchedDevis[0].items && matchedDevis[0].items.length > 0) {
      initialItems = matchedDevis[0].items.map((item, idx) => ({
        id: `item_dv_${item.id}_${idx}_${Date.now()}`,
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice
      }));
    } else {
      const selectedSiteConfig = sitesList.find(s => s.id === contact.site);
      const siteTag = selectedSiteConfig ? selectedSiteConfig.logoText : 'R2H Event';
      const rate = selectedSiteConfig && selectedSiteConfig.id === 'africapool' ? 2800 : 2500;
      initialItems = [
        {
          id: `item_df_${Date.now()}`,
          description: `Réservation de Stand d'exposition standard (${siteTag}) - 18m²`,
          quantity: 1,
          unitPrice: 18 * rate
        }
      ];
    }

    if (contact.includeRegistrationFee !== false) {
      const alreadyHasRegFee = initialItems.some(item => item.description.toLowerCase().includes("enregistrement"));
      if (!alreadyHasRegFee) {
        const regAmount = contact.registrationFeeAmount !== undefined ? contact.registrationFeeAmount : 2500;
        initialItems.push({
          id: `item_reg_${Date.now()}`,
          description: "Frais d'enregistrement d'Enquête",
          quantity: 1,
          unitPrice: regAmount
        });
      }
    }

    setCustomInvoiceItems(initialItems);
    setInvoiceNotes(`Facture d'exposant formulée en fonction des tarifs et des emplacements validés pour le salon ${
      sitesList.find(s => s.id === contact.site)?.name || 'R2H Communication'
    }.`);
    setInvoiceModalContact(contact);
  };

  const handleAddInvoiceItem = () => {
    setCustomInvoiceItems(prev => [
      ...prev,
      {
        id: `item_add_${Date.now()}`,
        description: 'Option de stand / Prestation complémentaire',
        quantity: 1,
        unitPrice: 2500
      }
    ]);
  };

  const handleUpdateInvoiceItem = (id: string, field: keyof TransactionItem, value: any) => {
    setCustomInvoiceItems(prev => prev.map(item => {
      if (item.id === id) {
        return { ...item, [field]: value };
      }
      return item;
    }));
  };

  const handleRemoveInvoiceItem = (id: string) => {
    setCustomInvoiceItems(prev => prev.filter(item => item.id !== id));
  };

  const handleGenerateInvoiceSubmit = () => {
    if (!invoiceModalContact || !setTransactions) return;

    const totalAmount = customInvoiceItems.reduce((acc, item) => acc + (item.unitPrice * item.quantity), 0);
    const randNum = Math.floor(100 + Math.random() * 900);
    const currentYear = new Date().getFullYear();
    const invoiceNum = `FA-${currentYear}-${randNum}`;

    const newInvoice: Transaction = {
      id: `fa_${Date.now()}`,
      num: invoiceNum,
      clientName: invoiceModalContact.name,
      companyName: invoiceModalContact.company,
      site: invoiceModalContact.site,
      type: 'facture',
      amount: totalAmount,
      status: 'envoye',
      date: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      items: customInvoiceItems,
      notes: invoiceNotes
    };

    setTransactions(prev => [newInvoice, ...prev]);
    setInvoiceModalContact(null);

    const messageWithAction = (
      <div className="flex flex-col gap-1 text-[#FFFFFF] font-sans">
        <p className="font-bold text-[11px]">Facture {invoiceNum} générée !</p>
        <p className="text-[10px] leading-relaxed text-[#D2C8B8]">Le montant de {totalAmount.toLocaleString('fr-FR')} MAD a été consigné pour {invoiceModalContact.company}.</p>
        {setCurrentTab && (
          <button
            onClick={() => {
              setCurrentTab('factures');
              setToastMessage(null);
            }}
            className="text-left font-bold text-[#A68A64] hover:underline flex items-center gap-1 text-[10px] mt-1.5 cursor-pointer underline-offset-2"
          >
            <Receipt className="w-3.5 h-3.5 text-[#A68A64] shrink-0" />
            <span>Consulter les factures</span>
          </button>
        )}
      </div>
    );

    setToastMessage(messageWithAction);
    setTimeout(() => {
      setToastMessage(null);
    }, 8000);
  };

  // Filter contacts by site check and filters
  const siteFilter = (c: Contact) => selectedSite === 'r2h' ? true : c.site === selectedSite;
  const roleCheck = (c: Contact) => roleFilter === 'all' ? true : c.role === roleFilter;
  const searchCheck = (c: Contact) => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.company.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.email.toLowerCase().includes(searchTerm.toLowerCase());

  const filteredContacts = contacts.filter(c => siteFilter(c) && roleCheck(c) && searchCheck(c));

  // Handle registrations
  const handleAddNewContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newCompany || !newEmail) return;

    const formattedStandNumber = newStandNumber.trim();
    const parsedPrice = parseFloat(newExceptionalPrice);
    const parsedArea = parseFloat(newStandArea);

    const newContact: Contact = {
      id: `c_gen_${Date.now()}`,
      name: newName,
      email: newEmail,
      phone: newPhone || '+212 660 000 000',
      company: newCompany,
      site: newSite,
      role: newRole,
      dateAdded: new Date().toISOString().split('T')[0],
      notes: newNotes,
      standNumber: formattedStandNumber || undefined,
      prospectStatus: newRole === 'prospect' ? newProspectStatus : undefined,
      standType: newRole === 'prospect' ? newStandType : undefined,
      exceptionalPrice: newRole === 'prospect' && !isNaN(parsedPrice) && parsedPrice >= 0 ? parsedPrice : undefined,
      standArea: newRole === 'prospect' && !isNaN(parsedArea) && parsedArea >= 0 ? parsedArea : undefined,
      includeRegistrationFee: newRole === 'prospect' ? (newRegFeeMode !== 'no') : undefined,
      registrationFeeAmount: newRole === 'prospect' ? (newRegFeeMode === 'manual' ? (parseFloat(newRegFeeManualAmount) || 0) : (newRegFeeMode === 'yes' ? 2500 : 0)) : undefined
    };

    setContacts(prev => [newContact, ...prev]);

    // Synchronize to the floorplan stands
    if (setStands && formattedStandNumber) {
      setStands(prev => prev.map(s => {
        if (s.site === newSite && s.num.toLowerCase() === formattedStandNumber.toLowerCase()) {
          return {
            ...s,
            status: (newRole === 'client' || newRole === 'partner_media') ? 'vendu' : 'reserve',
            companyName: newCompany,
            clientName: newName
          };
        }
        return s;
      }));
    }

    // Clear form
    setNewName('');
    setNewEmail('');
    setNewPhone('');
    setNewCompany('');
    setNewNotes('');
    setNewStandNumber('');
    setNewStandType('surface_nue');
    setNewExceptionalPrice('');
    setNewStandArea('');
    setNewIncludeRegFee(true);
    setNewRegFeeMode('yes');
    setNewRegFeeManualAmount('2500');
    setShowAddForm(false);
    triggerToast(
      newRole === 'client' 
        ? `Exposant ${newName} ajouté au CRM avec succès.` 
        : `Prospect ${newName} ajouté au CRM (en attente).`
    );
  };

  // Convert prospect to signed exhibitor / client
  const handleConvertProspectToClient = (contactId: string) => {
    setContacts(prev => prev.map(c => {
      if (c.id === contactId) {
        return { ...c, role: 'client', prospectStatus: undefined };
      }
      return c;
    }));
    
    // Update active inspector if focused
    if (selectedContact?.id === contactId) {
      setSelectedContact(prev => prev ? { ...prev, role: 'client' } : null);
    }

    // Synchronize to the floorplan stands
    const targetContact = contacts.find(c => c.id === contactId);
    if (setStands && targetContact && targetContact.standNumber) {
      setStands(prev => prev.map(s => {
        if (s.site === targetContact.site && s.num.toLowerCase() === targetContact.standNumber?.trim().toLowerCase()) {
          return {
            ...s,
            status: 'vendu',
            companyName: targetContact.company,
            clientName: targetContact.name
          };
        }
        return s;
      }));
    }

    triggerToast("Prospect promu au statut d'exposant officiel !");
  };

  // Delete a prospect or exhibitor/client
  const handleDeleteContact = (contactId: string, name: string) => {
    setContacts(prev => prev.filter(c => c.id !== contactId));
    if (selectedContact?.id === contactId) {
      setSelectedContact(null);
    }

    // Synchronize to the floorplan stands: reset stand to available
    const targetContact = contacts.find(c => c.id === contactId);
    if (setStands && targetContact && targetContact.standNumber) {
      setStands(prev => prev.map(s => {
        if (s.site === targetContact.site && s.num.toLowerCase() === targetContact.standNumber?.trim().toLowerCase()) {
          return {
            ...s,
            status: 'disponible',
            companyName: '',
            clientName: '',
            category: ''
          };
        }
        return s;
      }));
    }

    triggerToast(`Le contact ${name} a été supprimé avec succès.`);
  };
   
  // Open Edit modal with contact's current info
  const handleOpenEditModal = (contact: Contact) => {
    setEditModalContact(contact);
    setEditName(contact.name);
    setEditEmail(contact.email);
    setEditPhone(contact.phone);
    setEditCompany(contact.company);
    setEditSite(contact.site);
    setEditRole(contact.role);
    setEditNotes(contact.notes || '');
    setEditStandNumber(contact.standNumber || '');
    setEditProspectStatus(contact.prospectStatus || 'interesse');
    setEditStandType(contact.standType || 'surface_nue');
    setEditExceptionalPrice(contact.exceptionalPrice ? String(contact.exceptionalPrice) : '');
    setEditStandArea(contact.standArea ? String(contact.standArea) : '');
    setEditIncludeRegFee(contact.includeRegistrationFee !== false); // default to true if undefined or true
    
    if (contact.includeRegistrationFee === false) {
      setEditRegFeeMode('no');
      setEditRegFeeManualAmount('2500');
    } else {
      if (contact.registrationFeeAmount !== undefined && contact.registrationFeeAmount !== 2500) {
        setEditRegFeeMode('manual');
        setEditRegFeeManualAmount(String(contact.registrationFeeAmount));
      } else {
        setEditRegFeeMode('yes');
        setEditRegFeeManualAmount('2500');
      }
    }
  };

  // Save changes from Edit modal
  const handleSaveContactEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editModalContact || !editName || !editCompany || !editEmail) return;

    const oldStandNum = editModalContact.standNumber?.trim();
    const oldSite = editModalContact.site;
    const newStandNum = editStandNumber.trim();
    const newSite = editSite;

    const parsedEditPrice = parseFloat(editExceptionalPrice);
    const parsedEditArea = parseFloat(editStandArea);

    // 1. Update GRC contacts list
    setContacts(prev => prev.map(c => {
      if (c.id === editModalContact.id) {
        return {
          ...c,
          name: editName.trim(),
          email: editEmail.trim(),
          phone: editPhone.trim(),
          company: editCompany.trim(),
          site: editSite,
          role: editRole,
          notes: editNotes.trim(),
          standNumber: newStandNum || undefined,
          prospectStatus: editRole === 'prospect' ? editProspectStatus : undefined,
          standType: editRole === 'prospect' ? editStandType : undefined,
          exceptionalPrice: editRole === 'prospect' && !isNaN(parsedEditPrice) && parsedEditPrice >= 0 ? parsedEditPrice : undefined,
          standArea: editRole === 'prospect' && !isNaN(parsedEditArea) && parsedEditArea >= 0 ? parsedEditArea : undefined,
          includeRegistrationFee: editRole === 'prospect' ? (editRegFeeMode !== 'no') : undefined,
          registrationFeeAmount: editRole === 'prospect' ? (editRegFeeMode === 'manual' ? (parseFloat(editRegFeeManualAmount) || 0) : (editRegFeeMode === 'yes' ? 2500 : 0)) : undefined
        };
      }
      return c;
    }));

    // Update active inspector if focused
    if (selectedContact?.id === editModalContact.id) {
      setSelectedContact({
        ...editModalContact,
        name: editName.trim(),
        email: editEmail.trim(),
        phone: editPhone.trim(),
        company: editCompany.trim(),
        site: editSite,
        role: editRole,
        notes: editNotes.trim(),
        standNumber: newStandNum || undefined,
        prospectStatus: editRole === 'prospect' ? editProspectStatus : undefined,
        standType: editRole === 'prospect' ? editStandType : undefined,
        exceptionalPrice: editRole === 'prospect' && !isNaN(parsedEditPrice) && parsedEditPrice >= 0 ? parsedEditPrice : undefined,
        standArea: editRole === 'prospect' && !isNaN(parsedEditArea) && parsedEditArea >= 0 ? parsedEditArea : undefined,
        includeRegistrationFee: editRole === 'prospect' ? (editRegFeeMode !== 'no') : undefined,
        registrationFeeAmount: editRole === 'prospect' ? (editRegFeeMode === 'manual' ? (parseFloat(editRegFeeManualAmount) || 0) : (editRegFeeMode === 'yes' ? 2500 : 0)) : undefined
      });
    }

    // 2. Synchronize to floorplan stands if configured
    if (setStands) {
      setStands(prev => prev.map(s => {
        let updatedStand = { ...s };

        // 2a. Free old stand if it was assigned, and is now removed or changed
        if (oldStandNum && s.site === oldSite && s.num.toLowerCase() === oldStandNum.toLowerCase()) {
          const isStillSameStand = (newStandNum && s.site === newSite && s.num.toLowerCase() === newStandNum.toLowerCase());
          if (!isStillSameStand) {
            updatedStand.status = 'disponible';
            updatedStand.companyName = '';
            updatedStand.clientName = '';
            updatedStand.category = '';
          }
        }

        // 2b. Assign new stand if provided
        if (newStandNum && s.site === newSite && s.num.toLowerCase() === newStandNum.toLowerCase()) {
          updatedStand.status = (editRole === 'client' || editRole === 'partner' || editRole === 'partner_media') ? 'vendu' : 'reserve';
          updatedStand.companyName = editCompany.trim();
          updatedStand.clientName = editName.trim();
        }

        return updatedStand;
      }));
    }

    triggerToast(`Informations de l'entreprise ${editCompany} mises à jour.`);
    setEditModalContact(null);
  };

  const triggerToast = (msg: React.ReactNode) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 7000);
  };

  return (
    <div id="crm-view" className="flex-1 overflow-y-auto bg-transparent p-6 sm:p-8 space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 right-6 bg-[#2C3E36] border border-[#E8E6DE] text-white text-xs px-4.5 py-3 rounded-2xl shadow-xl flex items-start gap-2.5 z-50 font-sans max-w-sm animate-in slide-in-from-top-4 duration-200">
          <UserCheck className="w-4 h-4 text-[#A68A64] shrink-0 mt-0.5" />
          <div className="font-semibold text-white">{toastMessage}</div>
        </div>
      )}

      {/* CRM Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E8E6DE]/60 pb-5">
        <div>
          <h2 className="text-2xl font-serif font-black text-[#2D2D2D] tracking-tight">Gestion de Relation Client (CRM)</h2>
          <p className="text-xs text-[#7A7667] mt-1">
            Suivi des pépinières, piscinistes, exposants et prospects qualifiés pour l'ensemble des salons R2H.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => handleSyncStandsToCrm(false)}
            className="px-4 py-2.5 bg-[#A68A64]/10 hover:bg-[#A68A64]/20 border border-[#A68A64]/30 text-[#2D2D2D] text-xs font-bold rounded-xl shadow-xs font-sans flex items-center gap-2 cursor-pointer transition-all"
            title="Synchroniser automatiquement avec les réservations de stands du plan"
          >
            <RefreshCw className="w-4 h-4 text-[#A68A64]" />
            <span>Synchroniser Plan</span>
          </button>

          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-4.5 py-2.5 bg-[#2C3E36] hover:bg-[#202E28] text-white text-xs font-semibold rounded-xl shadow-xs font-sans flex items-center gap-2 cursor-pointer transition-all shrink-0"
          >
            <UserPlus className="w-4 h-4" />
            <span>Inscrire Prospect</span>
          </button>
        </div>
      </div>

      {/* Grid containing Contact List and Contact profile inspection Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* List of contacts (Col-span 2) */}
        <div className="lg:col-span-2 space-y-4">
          
          {/* Filters card */}
          <div className="bg-white p-5 rounded-3xl border border-[#E8E6DE] shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
            
            {/* Search filter input */}
            <div className="relative w-full sm:max-w-xs">
              <Search className="absolute left-3.5 top-3 w-4 h-4 text-[#7A7667]" />
              <input
                type="text"
                placeholder="Filtrer par nom ou société..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-[#F8F7F2] border border-[#E8E6DE] rounded-xl text-xs outline-hidden text-[#2D2D2D] font-sans placeholder-[#7A7667]/50"
              />
            </div>

            {/* Quick role tabs filter */}
            <div className="flex bg-[#F0EEE6] p-1 rounded-xl border border-[#E8E6DE]/60 w-full sm:w-auto overflow-x-auto scrollbar-none">
              {[
                { id: 'all', text: 'Tous' },
                { id: 'prospect', text: 'Prospects' },
                { id: 'partner_media', text: 'Partenaires Médias' },
                { id: 'client', text: 'Clients / Exposants' },
                { id: 'fournisseur', text: 'Prestataires' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setRoleFilter(tab.id)}
                  className={`flex-1 sm:flex-none px-3.5 py-1.5 rounded-lg text-[10px] font-bold font-serif transition-all cursor-pointer ${
                    roleFilter === tab.id 
                      ? 'bg-white text-[#2D2D2D] shadow-xs' 
                      : 'text-[#7A7667] hover:text-[#2D2D2D]'
                  }`}
                >
                  {tab.text}
                </button>
              ))}
            </div>

          </div>

          {/* Contacts Data Grid table */}
          <div className="bg-white rounded-3xl border border-[#E8E6DE] shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-[#2D2D2D]">
                <thead>
                  <tr className="bg-[#F8F7F2] border-b border-[#E8E6DE]/60 text-[10px] uppercase font-bold text-[#7A7667]">
                    <th className="px-5 py-3">Entreprise</th>
                    <th className="px-5 py-3">Contact Principal</th>
                    <th className="px-5 py-3">E-mail / Téléphone</th>
                    <th className="px-5 py-3">Site ciblé</th>
                    <th className="px-5 py-3">Rôle</th>
                    <th className="px-5 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E8E6DE]/40 font-sans">
                  {filteredContacts.length > 0 ? (
                    filteredContacts.map(contact => (
                      <tr 
                        key={contact.id} 
                        className={`hover:bg-[#F8F7F2]/40 transition cursor-pointer ${selectedContact?.id === contact.id ? 'bg-[#F0EEE6]/30' : ''}`}
                        onClick={() => setSelectedContact(contact)}
                      >
                        <td className="px-5 py-3.5">
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <p className="font-bold text-[#2D2D2D]">{contact.company}</p>
                              {contact.standNumber && (
                                <span className="inline-flex items-center gap-0.5 text-[9px] font-bold font-mono text-[#A68A64] bg-[#A68A64]/10 px-1.5 py-0.5 rounded-sm">
                                  <MapPin className="w-2.5 h-2.5" />
                                  <span>{contact.standNumber}</span>
                                </span>
                              )}
                            </div>
                            <p className="text-[10px] text-[#7A7667]">Ajouté: {contact.dateAdded}</p>
                          </div>
                        </td>
                        <td className="px-5 py-3.5 font-bold text-[#2D2D2D]">{contact.name}</td>
                        <td className="px-5 py-3.5">
                          <p className="font-semibold text-[#2D2D2D]">{contact.email}</p>
                          <p className="text-[10px] text-[#7A7667] font-mono mt-0.5">{contact.phone}</p>
                        </td>
                        <td className="px-5 py-3.5 font-medium">
                          <span className="text-[11px] px-2.5 py-0.5 rounded-xl bg-[#F8F7F2] border border-[#E8E6DE] text-[#7A7667] max-w-max block">
                            {sitesList.find(s => s.id === contact.site)?.domain || 'r2h.ma'}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 whitespace-nowrap">
                          <div className="flex flex-col gap-1.5 items-start font-sans">
                            <span className={`px-2 py-0.5 rounded-xl uppercase font-mono text-[8px] font-bold ${
                              contact.role === 'client' ? 'bg-[#7E8F7A]/15 text-[#4D5E4A] border border-[#7E8F7A]/30' :
                              contact.role === 'prospect' ? 'bg-[#A68A64]/15 text-[#2D2D2D] border border-[#A68A64]/30' :
                              contact.role === 'partner_media' ? 'bg-purple-100 text-purple-800 border border-purple-200' :
                              'bg-[#F0EEE6] text-[#7A7667] border border-[#E8E6DE]'
                            }`}>
                              {contact.role === 'client' ? 'Exposant' : 
                               contact.role === 'prospect' ? 'Prospect' : 
                               contact.role === 'partner_media' ? 'Partenaire Média' : 'Fournisseur'}
                            </span>
                            {contact.role === 'prospect' && (
                              <span className={`text-[9.5px] px-2 py-0.5 rounded-md font-bold border leading-none shadow-3xs ${getProspectStatusColorClass(contact.prospectStatus)}`}>
                                {getProspectStatusLabel(contact.prospectStatus)}
                              </span>
                            )}
                            {contact.role === 'prospect' && contact.standType && (
                              <span className="text-[9px] font-sans text-slate-650 bg-amber-50/40 border border-[#E8E6DE] px-2 py-0.5 rounded-md font-semibold truncate max-w-[170px] mt-0.5">
                                {contact.standType === 'surface_nue' ? '🏢 Sec (1800 MAD)' :
                                 contact.standType === 'equipe' ? '📦 Équipé (2400 MAD)' :
                                 contact.standType === 'personalise' ? '✨ Perso (Manuel)' : '💎 Exceptionnel'}
                                {contact.standArea ? ` [${contact.standArea}m²]` : ''}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-5 py-3.5 text-right font-sans" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-1.5 flex-wrap">
                            <button
                              onClick={() => handleOpenEditModal(contact)}
                              className="p-1.5 hover:bg-[#A68A64]/10 text-[#A68A64] hover:text-[#917550] rounded-xl transition-all cursor-pointer border border-[#E8E6DE]/40"
                              title="Modifier les coordonnées"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>

                            {contact.role === 'prospect' ? (
                              <>
                                <button
                                  id={`promote-btn-${contact.id}`}
                                  onClick={() => handleConvertProspectToClient(contact.id)}
                                  className="px-2.5 py-1.5 bg-[#7E8F7A] hover:bg-[#6C7D69] text-white rounded-lg text-[10px] font-bold shadow-xs transition cursor-pointer inline-flex items-center gap-1"
                                  title="Convertir en Exposant officiel"
                                >
                                  <ArrowRight className="w-3 h-3" />
                                  <span>Convertir</span>
                                </button>
                                <button
                                  onClick={() => handleDeleteContact(contact.id, contact.name)}
                                  className="p-1.5 hover:bg-red-50 text-red-500 hover:text-red-700 rounded-lg transition-all cursor-pointer border border-[#E8E6DE]/40"
                                  title="Supprimer le prospect"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </>
                            ) : contact.role === 'client' ? (
                              <>
                                <span className="text-[9px] px-2 py-0.5 bg-[#7E8F7A]/15 text-[#4D5E4A] font-black rounded-md uppercase border border-[#7E8F7A]/20">
                                  ✓ Exposant
                                </span>
                                <button
                                  onClick={() => handleOpenInvoiceGenerator(contact)}
                                  className="px-2.5 py-1.5 bg-[#A68A64] hover:bg-[#917550] text-white rounded-lg text-[10.5px] font-bold shadow-xs transition cursor-pointer inline-flex items-center gap-1 border border-[#917550]/20"
                                  title="Générer une facture de stand"
                                >
                                  <FileText className="w-3.5 h-3.5 shrink-0" />
                                  <span>Facturer</span>
                                </button>
                                <button
                                  onClick={() => handleDeleteContact(contact.id, contact.name)}
                                  className="p-1.5 hover:bg-red-50 text-red-500 hover:text-red-700 rounded-lg transition-all cursor-pointer border border-[#E8E6DE]/40"
                                  title="Supprimer l'exposant"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </>
                            ) : (
                              <button
                                onClick={() => handleDeleteContact(contact.id, contact.name)}
                                className="p-1.5 hover:bg-red-50 text-red-500 hover:text-red-700 rounded-lg transition-all cursor-pointer border border-[#E8E6DE]/40"
                                title="Supprimer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-5 py-10 text-center text-slate-400">
                        <AlertCircle className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                        Aucun contact correspondant au filtre.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* Detail Panel of Selected Contact / Adding prospect menu */}
        <div className="space-y-6">
          {/* Dynamic Registration form in sidebar mode */}
          {showAddForm && (
            <div className="bg-white p-6 rounded-3xl border border-[#E8E6DE] shadow-md animate-in slide-in-from-right-5 duration-200">
              <h3 className="font-serif font-black text-xs uppercase tracking-wider text-[#A68A64] mb-4 flex items-center gap-2">
                <UserSquare2 className="w-4 h-4 text-[#7E8F7A]" />
                <span>Nouveau Contact (CRM)</span>
              </h3>

              <form onSubmit={handleAddNewContact} className="space-y-3.5 text-xs">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-[#7A7667] uppercase tracking-wider">Société / Compagnie *</label>
                  <input
                    type="text" required
                    value={newCompany}
                    onChange={(e) => setNewCompany(e.target.value)}
                    placeholder="Nom légal de l'entreprise"
                    className="w-full p-2.5 bg-[#F8F7F2] border border-[#E8E6DE] rounded-xl outline-hidden text-[#2D2D2D]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-[#7A7667] uppercase tracking-wider">Nom du Représentant *</label>
                  <input
                    type="text" required
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="Ex: Youssef El Amrani"
                    className="w-full p-2.5 bg-[#F8F7F2] border border-[#E8E6DE] rounded-xl outline-hidden text-[#2D2D2D]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-[#7A7667] uppercase tracking-wider">Adresse E-mail *</label>
                  <input
                    type="email" required
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="ex: contact@entreprise.ma"
                    className="w-full p-2.5 bg-[#F8F7F2] border border-[#E8E6DE] rounded-xl outline-hidden text-[#2D2D2D]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-[#7A7667] uppercase tracking-wider">Téléphone</label>
                    <input
                      type="text"
                      value={newPhone}
                      onChange={(e) => setNewPhone(e.target.value)}
                      placeholder="+212 6..."
                      className="w-full p-2.5 bg-[#F8F7F2] border border-[#E8E6DE] rounded-xl outline-hidden text-[#2D2D2D]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-[#7A7667] uppercase tracking-wider">Salon cible</label>
                    <select
                      value={newSite}
                      onChange={(e) => setNewSite(e.target.value as SiteId)}
                      className="w-full p-2.5 bg-[#F8F7F2] border border-[#E8E6DE] rounded-xl outline-hidden text-[#2D2D2D] text-[11px] font-semibold"
                    >
                      {sitesList.map(s => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-[#7A7667] uppercase tracking-wider">Statut CRM</label>
                    <select
                      value={newRole}
                      onChange={(e) => setNewRole(e.target.value as 'prospect' | 'client' | 'partner_media')}
                      className="w-full p-2.5 bg-[#F8F7F2] border border-[#E8E6DE] rounded-xl outline-hidden text-[#2D2D2D] text-[11px] font-semibold"
                    >
                      <option value="prospect">Prospect (En attente)</option>
                      <option value="client">Exposant (Officiel)</option>
                      <option value="partner_media">Partenaire Média</option>
                    </select>
                  </div>

                  {newRole === 'prospect' && (
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-[#7A7667] uppercase tracking-wider">Qualification du Prospect</label>
                      <select
                        value={newProspectStatus}
                        onChange={(e) => setNewProspectStatus(e.target.value as any)}
                        className="w-full p-2.5 border border-[#E8E6DE] rounded-xl outline-hidden text-[#2D2D2D] text-[11px] font-bold cursor-pointer"
                        style={{
                          backgroundColor: newProspectStatus === 'interesse' ? '#ECFDF5' : newProspectStatus === 'pas_interesse' ? '#FEF2F2' : newProspectStatus === 'a_rappeler' ? '#FFFBEB' : newProspectStatus === 'relance' ? '#ECFEFF' : '#F5F3FF',
                          color: newProspectStatus === 'interesse' ? '#047857' : newProspectStatus === 'pas_interesse' ? '#B91C1C' : newProspectStatus === 'a_rappeler' ? '#B45309' : newProspectStatus === 'relance' ? '#0891B2' : '#6D28D9'
                        }}
                      >
                        <option value="interesse" style={{ backgroundColor: '#fff', color: '#047857' }}>✓ Intéressé</option>
                        <option value="pas_interesse" style={{ backgroundColor: '#fff', color: '#B91C1C' }}>✗ Pas intéressé</option>
                        <option value="a_rappeler" style={{ backgroundColor: '#fff', color: '#B45309' }}>☎ À rappeler</option>
                        <option value="relance" style={{ backgroundColor: '#fff', color: '#0891B2' }}>↻ Relance</option>
                        <option value="demande_devis" style={{ backgroundColor: '#fff', color: '#6D28D9' }}>✎ Demande de devis</option>
                      </select>
                    </div>
                  )}

                  {newRole === 'prospect' && (
                    <div className="col-span-2 border border-[#E8E6DE]/60 bg-[#FAFAF8] rounded-2xl p-4.5 space-y-3.5 my-1">
                      <div className="flex justify-between items-center border-b border-[#E8E6DE]/50 pb-2">
                        <span className="text-[10px] font-bold text-[#A68A64] uppercase tracking-wider">Option Tarifaire de l'Enquête</span>
                        <span className="text-[9px] bg-amber-50 text-amber-700 font-semibold px-2 py-0.5 rounded-full border border-amber-200">Prospect</span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-[#7A7667] uppercase tracking-wider">Catégorie de Stand</label>
                          <select
                            value={newStandType}
                            onChange={(e) => setNewStandType(e.target.value as any)}
                            className="w-full p-2.5 bg-white border border-[#E8E6DE] rounded-xl outline-hidden text-[#2D2D2D] text-xs font-semibold"
                          >
                            <option value="surface_nue">🏢 Surface Nue (1800 MAD/m²)</option>
                            <option value="equipe">📦 Stand Équipé (2400 MAD/m²)</option>
                            <option value="personalise">✨ Stand Personnalisé (Saisie Manuelle)</option>
                            <option value="exceptionnel">💎 Tarif Exceptionnel (Saisie Manuelle)</option>
                          </select>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-[#7A7667] uppercase tracking-wider">Surface Envisagée (m²)</label>
                          <input
                            type="number"
                            min="1"
                            placeholder="ex: 18"
                            value={newStandArea}
                            onChange={(e) => setNewStandArea(e.target.value)}
                            className="w-full p-2.5 bg-white border border-[#E8E6DE] rounded-xl outline-hidden text-[#2D2D2D] text-xs font-mono font-semibold"
                          />
                        </div>

                        <div className="space-y-1 col-span-2">
                          <label className="text-[10px] font-bold text-[#7A7667] uppercase tracking-wider block">Frais d'enregistrement d'Enquête</label>
                          <div className="grid grid-cols-3 gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                setNewRegFeeMode('yes');
                                setNewIncludeRegFee(true);
                              }}
                              className={`py-2 rounded-xl text-xs font-semibold border transition cursor-pointer text-center ${
                                newRegFeeMode === 'yes' 
                                  ? 'bg-[#A68A64] text-white border-[#A68A64] shadow-xs' 
                                  : 'bg-white text-[#7A7667] border-[#E8E6DE] hover:bg-[#F8F7F2]'
                              }`}
                            >
                              ✅ Oui (2500)
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setNewRegFeeMode('no');
                                setNewIncludeRegFee(false);
                              }}
                              className={`py-2 rounded-xl text-xs font-semibold border transition cursor-pointer text-center ${
                                newRegFeeMode === 'no' 
                                  ? 'bg-[#FAF9F5] text-rose-700 border-[#E8E6DE] shadow-inner font-bold' 
                                  : 'bg-white text-[#7A7667] border-[#E8E6DE] hover:bg-[#F8F7F2]'
                              }`}
                            >
                              ❌ Non (Exclu)
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setNewRegFeeMode('manual');
                                setNewIncludeRegFee(true);
                              }}
                              className={`py-2 rounded-xl text-xs font-semibold border transition cursor-pointer text-center ${
                                newRegFeeMode === 'manual' 
                                  ? 'bg-purple-600 text-white border-purple-600 shadow-xs font-bold' 
                                  : 'bg-white text-[#7A7667] border-[#E8E6DE] hover:bg-[#F8F7F2]'
                              }`}
                            >
                              ✏️ Manuel
                            </button>
                          </div>
                          {newRegFeeMode === 'manual' && (
                            <div className="mt-2 text-left animate-in fade-in duration-200">
                              <label className="text-[9px] font-bold text-purple-600 uppercase tracking-wider block mb-1">Indiquer le montant des frais d'enregistrement (MAD HT) *</label>
                              <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-400 text-xs font-bold font-sans">MAD</span>
                                <input
                                  type="number"
                                  min="0"
                                  placeholder="Saisir montant manuellement"
                                  value={newRegFeeManualAmount}
                                  onChange={(e) => {
                                    setNewRegFeeManualAmount(e.target.value);
                                  }}
                                  className="w-full pl-12 pr-3 py-2 bg-purple-50/50 border border-purple-200 rounded-xl outline-hidden text-purple-950 font-mono font-bold text-xs"
                                />
                              </div>
                            </div>
                          )}
                        </div>

                        {(newStandType === 'personalise' || newStandType === 'exceptionnel') && (
                          <div className="space-y-1 col-span-2">
                            <label className="text-[10px] font-bold text-[#7A7667] uppercase tracking-wider">Prix Total Manuel (MAD)</label>
                            <input
                              type="number"
                              min="0"
                              placeholder="Entrer le prix personnalisé total"
                              value={newExceptionalPrice}
                              onChange={(e) => setNewExceptionalPrice(e.target.value)}
                              className="w-full p-2.5 bg-white border border-[#E8E6DE] rounded-xl outline-hidden text-[#2D2D2D] text-xs font-mono font-semibold"
                            />
                          </div>
                        )}
                      </div>

                      {/* Simulator with HT, TVA 20% & TTC */}
                      {(() => {
                        const area = parseFloat(newStandArea) || 0;
                        let amountHT = 0;
                        let formulaDesc = "";
                        if (newStandType === 'surface_nue') {
                          amountHT = area * 1800;
                          formulaDesc = `${area} m² x 1800 MAD`;
                        } else if (newStandType === 'equipe') {
                          amountHT = area * 2400;
                          formulaDesc = `${area} m² x 2400 MAD`;
                        } else {
                          amountHT = parseFloat(newExceptionalPrice) || 0;
                          formulaDesc = "Manuel";
                        }

                        if (newRegFeeMode === 'yes') {
                          amountHT += 2500;
                          formulaDesc += " + 2500 MAD Enregistrement";
                        } else if (newRegFeeMode === 'manual') {
                          const manualAmount = parseFloat(newRegFeeManualAmount) || 0;
                          amountHT += manualAmount;
                          formulaDesc += ` + ${manualAmount} MAD Enregistrement (manuel)`;
                        }

                        const tvaAmount = amountHT * 0.20;
                        const amountTTC = amountHT * 1.20;

                        return (
                          <div className="bg-[#FDFDFB] border border-[#E8E6DE]/70 rounded-2xl p-4.5 space-y-2.5 text-xs text-[#7A7667] shadow-3xs w-full col-span-2">
                            <div className="flex justify-between items-center text-[10px] font-bold text-[#A68A64] border-b border-[#E8E6DE]/50 pb-1.5 mb-1">
                              <span>SIMULATEUR DE TARIF (HT + TVA 20%)</span>
                              <span className="font-mono text-slate-400">({formulaDesc})</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="font-medium text-[11px]">Total HT :</span>
                              <span className="font-bold font-mono text-[#2D2D2D]">{amountHT.toLocaleString()} MAD</span>
                            </div>
                            <div className="flex justify-between items-center text-[#7A7667] border-dashed border-b border-[#E8E6DE]/55 pb-2">
                              <span className="font-medium text-[11.5px] items-center gap-1">
                                TVA (20% par défaut) :
                              </span>
                              <span className="font-bold font-mono text-slate-600">+{tvaAmount.toLocaleString()} MAD</span>
                            </div>
                            <div className="flex justify-between items-center pt-1">
                              <span className="font-black text-[#2D2D2D] text-[11.5px]">NET À PAYER TTC :</span>
                              <span className="font-black font-mono text-[#A68A64] text-sm bg-amber-50/50 px-2 py-1 rounded-lg border border-amber-150">{amountTTC.toLocaleString()} MAD</span>
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  )}

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-[#7A7667] uppercase tracking-wider">N° Stand (dans le plan)</label>
                    <select
                      value={newStandNumber}
                      onChange={(e) => setNewStandNumber(e.target.value)}
                      className="w-full p-2.5 bg-[#F8F7F2] border border-[#E8E6DE] rounded-xl outline-hidden text-[#2D2D2D] text-[11px] font-semibold"
                    >
                      <option value="">
                        {freeStands.length > 0 ? "-- Sélectionner un stand libre --" : "-- Aucun stand disponible --"}
                      </option>
                      {freeStands.map(s => (
                        <option key={s.id} value={s.num}>
                          {s.num} ({s.area}m²)
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-[#7A7667] uppercase tracking-wider">Notes de suivi / Besoins</label>
                  <textarea
                    value={newNotes}
                    onChange={(e) => setNewNotes(e.target.value)}
                    placeholder="Besoins exprimés, détails matériels, etc..."
                    rows={3}
                    className="w-full p-2.5 bg-[#F8F7F2] border border-[#E8E6DE] rounded-xl outline-hidden text-[#2D2D2D] resize-none"
                  />
                </div>

                <div className="flex gap-2 pt-2.5">
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="flex-1 py-2.5 rounded-xl border border-[#E8E6DE] text-[#7A7667] font-semibold hover:bg-[#F8F7F2] cursor-pointer text-[11px]"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 bg-[#2C3E36] hover:bg-[#202E28] text-white font-semibold rounded-xl shadow-xs cursor-pointer text-[11px] transition"
                  >
                    Enregistrer au CRM
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Contact detailed Card viewer */}
          <div className="bg-white p-6 rounded-3xl border border-[#E8E6DE] shadow-xs relative">
            <div className="flex items-center justify-between mb-4.5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#7A7667] font-serif">Fiche Prospect / Client</h4>
              {selectedContact && (
                <button
                  type="button"
                  onClick={() => handleOpenEditModal(selectedContact)}
                  className="px-2.5 py-1.5 bg-[#A68A64]/10 hover:bg-[#A68A64]/20 text-[#2D2D2D] hover:text-[#917550] border border-[#A68A64]/20 rounded-xl transition-all font-sans text-[10px] font-bold cursor-pointer flex items-center gap-1.5 shadow-3xs"
                  title="Modifier les informations"
                >
                  <Edit className="w-3.5 h-3.5 text-[#A68A64]" />
                  <span>Modifier</span>
                </button>
              )}
            </div>

            {selectedContact ? (
              <div className="space-y-5 text-xs text-[#2D2D2D]">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full bg-[#F0EEE6] font-serif font-black text-[#A68A64] flex items-center justify-center text-base uppercase shrink-0">
                    {selectedContact.company.slice(0, 2)}
                  </div>
                  <div>
                    <h5 className="font-serif font-black text-[#2D2D2D] text-sm leading-tight">{selectedContact.company}</h5>
                    <div className="flex items-center gap-1.5 mt-1 flex-wrap font-sans">
                      <span className="text-[9px] text-[#A68A64] uppercase font-bold tracking-wider">
                        {selectedContact.role === 'client' ? 'Exposant Officiel' : 
                         selectedContact.role === 'prospect' ? 'Prospect Enregistré' : 
                         selectedContact.role === 'partner_media' ? 'Partenaire Média Officiel' : 
                         selectedContact.role === 'partner' ? 'Partenaire Officiel' : 'Fournisseur / Prestataire'}
                      </span>
                      {selectedContact.role === 'prospect' && (
                        <span className={`text-[9.5px] px-2 py-0.5 rounded-md font-bold border leading-tight ${getProspectStatusColorClass(selectedContact.prospectStatus)}`}>
                          {getProspectStatusLabel(selectedContact.prospectStatus)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-3.5 border-t border-b border-[#E8E6DE]/60 py-4 font-sans">
                  <div className="flex items-center gap-2.5">
                    <Users className="w-4 h-4 text-[#7A7667]" />
                    <div>
                      <p className="font-bold text-[#2D2D2D]">{selectedContact.name}</p>
                      <p className="text-[9px] text-[#7A7667]">Représentant officiel</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <Mail className="w-4 h-4 text-[#7A7667]" />
                    <div>
                      <p className="font-mono text-[#2D2D2D] font-semibold">{selectedContact.email}</p>
                      <p className="text-[9px] text-[#7A7667]">Adresse E-mail</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <Phone className="w-4 h-4 text-[#7A7667]" />
                    <div>
                      <p className="font-mono text-[#2D2D2D] font-semibold">{selectedContact.phone}</p>
                      <p className="text-[9px] text-[#7A7667]">Téléphone Mobile</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <Building className="w-4 h-4 text-[#7A7667]" />
                    <div>
                      <p className="font-bold text-[#2D2D2D]">{sitesList.find(s => s.id === selectedContact.site)?.domain || 'r2h.ma'}</p>
                      <p className="text-[9px] text-[#7A7667]">Salon référencé</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <MapPin className="w-4 h-4 text-[#A68A64]" />
                    <div>
                      <p className="font-mono font-bold text-[#A68A64] bg-[#A68A64]/10 px-2 py-0.5 rounded-md max-w-max">
                        {selectedContact.standNumber || "Non spécifié"}
                      </p>
                      <p className="text-[9px] text-[#7A7667]">N° de stand (dans le plan)</p>
                    </div>
                  </div>

                  {selectedContact.role === 'prospect' && selectedContact.standType && (
                    <div className="bg-[#FAF9F5] border border-[#E8E6DE]/60 rounded-2xl p-4 my-2 col-span-1 space-y-2.5 font-sans">
                      <div className="flex items-center gap-2 border-b border-[#E8E6DE]/50 pb-2 mb-1">
                        <span className="text-base">📋</span>
                        <div>
                          <p className="text-[9px] font-bold text-[#7A7667] uppercase tracking-wider leading-none">Option Tarifaire Prospect</p>
                          <p className="font-bold text-[#2D2D2D] text-[10.5px] mt-0.5">
                            {selectedContact.standType === 'surface_nue' ? '🏢 Surface Nue (1800 MAD)' :
                             selectedContact.standType === 'equipe' ? '📦 Stand Équipé (2400 MAD)' :
                             selectedContact.standType === 'personalise' ? '✨ Stand Personnalisé' : '💎 Tarif Exceptionnel'}
                          </p>
                        </div>
                      </div>
                      
                      {(() => {
                        const area = selectedContact.standArea || 0;
                        let amountHT = 0;
                        if (selectedContact.standType === 'surface_nue') {
                          amountHT = area * 1800;
                        } else if (selectedContact.standType === 'equipe') {
                          amountHT = area * 2400;
                        } else {
                          amountHT = selectedContact.exceptionalPrice || 0;
                        }
                        const preRegAmount = amountHT;
                        const includeReg = selectedContact.includeRegistrationFee !== false;
                        const regAmount = includeReg 
                          ? (selectedContact.registrationFeeAmount !== undefined ? selectedContact.registrationFeeAmount : 2500)
                          : 0;
                        amountHT += regAmount;
                        const tvaAmount = amountHT * 0.20;
                        const amountTTC = amountHT * 1.20;

                        return (
                          <div className="space-y-1.5 text-xs font-sans">
                            <div className="flex justify-between items-center text-[11px] text-[#7A7667]">
                              <span>Total HT de base {area > 0 && `(${area} m²)`} :</span>
                              <span className="font-semibold font-mono text-[#2D2D2D]">{preRegAmount.toLocaleString()} MAD</span>
                            </div>
                            <div className="flex justify-between items-center text-[11px] text-[#7A7667]">
                              <span>Frais d'enregistrement :</span>
                              <span className={`font-semibold font-mono ${includeReg ? 'text-amber-700 font-bold' : 'text-slate-400 line-through'}`}>
                                {includeReg ? `+${regAmount.toLocaleString()} MAD` : '0 MAD (Exclu)'}
                              </span>
                            </div>
                            <div className="flex justify-between items-center text-[11.5px] font-bold text-[#A68A64] border-t border-[#E8E6DE]/30 pt-1">
                              <span>Total HT :</span>
                              <span className="font-mono">{amountHT.toLocaleString()} MAD</span>
                            </div>
                            <div className="flex justify-between items-center text-[11px] text-[#7A7667] border-dashed border-b border-[#E8E6DE]/40 pb-1.5">
                              <span>TVA (20%) :</span>
                              <span className="font-semibold font-mono text-slate-500">+{tvaAmount.toLocaleString()} MAD</span>
                            </div>
                            <div className="flex justify-between items-center pt-1 font-bold">
                              <span className="text-[#2D2D2D]">Montant TTC :</span>
                              <span className="font-black font-mono text-[#A68A64] text-xs bg-amber-50/60 px-2 py-0.5 rounded-md border border-amber-150">{amountTTC.toLocaleString()} MAD</span>
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  )}

                  {selectedContact.role === 'partner_media' && (
                    <div className="bg-purple-50/50 border border-purple-200/60 rounded-2xl p-4 my-2 col-span-1 space-y-2.5 font-sans">
                      <div className="flex items-center gap-2 border-b border-purple-100 pb-2 mb-1 border-dashed">
                        <span className="text-xl">🎥</span>
                        <div>
                          <p className="text-[9px] font-bold text-purple-700 uppercase tracking-wider leading-none">Partenaire Média</p>
                          <p className="font-bold text-purple-900 text-[11px] mt-0.5">Gratuit (Aucun frais de stand)</p>
                        </div>
                      </div>
                      <p className="text-[11px] text-[#55476D] font-medium leading-relaxed italic">
                        Ce contact est un partenaire média officiel. Il occupe un stand gratuitement et n'a pas de facturation ni devis associé.
                      </p>
                    </div>
                  )}
                </div>

                <div className="space-y-1.5 font-sans">
                  <span className="text-[9px] font-bold text-[#7A7667] uppercase tracking-wider block">Notes de suivi CRM</span>
                  <div className="bg-[#F8F7F2] border border-[#E8E6DE] rounded-xl p-3.5 text-[#7A7667] font-medium leading-relaxed italic text-[11px]">
                    {selectedContact.notes || "Aucune note complémentaire consignée pour le moment. Utilisez le suivi pour relancer."}
                  </div>
                </div>

                {selectedContact.role === 'prospect' && (
                  <div className="space-y-2 pt-1 font-sans">
                    <button
                      type="button"
                      onClick={() => handleConvertProspectToClient(selectedContact.id)}
                      className="w-full py-2.5 bg-[#7E8F7A] hover:bg-[#6C7D69] text-white font-semibold rounded-xl shadow-xs transition-all cursor-pointer flex items-center justify-center gap-2 text-xs"
                    >
                      <UserCheck className="w-4 h-4" />
                      <span>Valider comme Exposant</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteContact(selectedContact.id, selectedContact.name)}
                      className="w-full py-2.5 bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-700 font-semibold rounded-xl border border-red-200 transition-all cursor-pointer flex items-center justify-center gap-2 text-xs text-center"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Supprimer le Prospect</span>
                    </button>
                  </div>
                )}

                {selectedContact.role === 'partner_media' && (
                  <div className="space-y-2 pt-1 font-sans">
                    <button
                      type="button"
                      onClick={() => handleDeleteContact(selectedContact.id, selectedContact.name)}
                      className="w-full py-2.5 bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-700 font-semibold rounded-xl border border-red-200 transition-all cursor-pointer flex items-center justify-center gap-2 text-xs text-center"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Supprimer le Partenaire Média</span>
                    </button>
                  </div>
                )}

                {selectedContact.role === 'client' && (
                  <div className="space-y-2 pt-1 font-sans">
                    <button
                      type="button"
                      onClick={() => handleOpenInvoiceGenerator(selectedContact)}
                      className="w-full py-2.5 bg-[#A68A64] hover:bg-[#917550] text-white font-semibold rounded-xl shadow-xs transition-all cursor-pointer flex items-center justify-center gap-2 text-xs border border-[#917550]/20"
                    >
                      <FileText className="w-4 h-4 shrink-0" />
                      <span>Générer Facture R2H</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteContact(selectedContact.id, selectedContact.name)}
                      className="w-full py-2.5 bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-700 font-semibold rounded-xl border border-red-200 transition-all cursor-pointer flex items-center justify-center gap-2 text-xs text-center"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Supprimer l'Exposant</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12 text-[#7A7667] flex flex-col items-center justify-center gap-2 font-sans text-xs">
                <Compass className="w-8 h-8 text-[#A68A64]/60 animate-spin" style={{ animationDuration: '6s' }} />
                <span>Sélectionnez un contact dans le tableau pour inspecter sa fiche.</span>
              </div>
            )}
          </div>

        </div>

      </div>

      {/* Invoice Generator Modal dialog */}
      {invoiceModalContact && (
        <div className="fixed inset-0 bg-[#2D2D2D]/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in-40 duration-200 font-sans">
          <div className="bg-white rounded-3xl border border-[#E8E6DE] shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-6 animate-in zoom-in-95 duration-200">
            
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[#E8E6DE]/60 pb-4">
              <div className="flex items-center gap-2.5 text-[#2D2D2D]">
                <Receipt className="w-5.5 h-5.5 text-[#A68A64] shrink-0" />
                <div>
                  <h3 className="text-base font-serif font-black tracking-tight">Générer la Facture d'Exposant</h3>
                  <p className="text-[10px] text-[#7A7667] font-semibold mt-0.5">Compte client : {invoiceModalContact.company}</p>
                </div>
              </div>
              <button 
                onClick={() => setInvoiceModalContact(null)} 
                className="p-1.5 hover:bg-[#F8F7F2] rounded-full text-[#7A7667] hover:text-[#2D2D2D] transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Profile Brief */}
            <div className="grid grid-cols-2 gap-4 bg-[#F8F7F2] border border-[#E8E6DE]/50 rounded-2xl p-4 text-xs">
              <div>
                <p className="text-[9px] uppercase tracking-wider font-bold text-[#7A7667]">Client Principal</p>
                <p className="font-bold text-[#2D2D2D] mt-0.5">{invoiceModalContact.name}</p>
                <p className="text-[#7A7667] mt-0.5 font-semibold">{invoiceModalContact.email}</p>
              </div>
              <div>
                <p className="text-[9px] uppercase tracking-wider font-bold text-[#7A7667]">Salon & Destination</p>
                <p className="font-bold text-[#2D2D2D] mt-0.5">
                  {sitesList.find(s => s.id === invoiceModalContact.site)?.name || 'R2H Communication'}
                </p>
                <span className="inline-block text-[9px] px-2 py-0.5 bg-[#4D5E4A]/10 text-[#4D5E4A] font-bold rounded-md mt-1 border border-[#7E8F7A]/20 uppercase">
                  {sitesList.find(s => s.id === invoiceModalContact.site)?.domain || 'r2h.ma'}
                </span>
              </div>
            </div>

            {/* Invoice Line Items */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#2D2D2D] font-serif uppercase tracking-wider">Lignes de prestations (Tarif Validé)</span>
                <button
                  type="button"
                  onClick={handleAddInvoiceItem}
                  className="px-2.5 py-1 text-[10px] font-bold text-[#7E8F7A] border border-[#7E8F7A]/30 hover:bg-[#7E8F7A]/5 rounded-lg flex items-center gap-1 transition cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Ajouter une ligne</span>
                </button>
              </div>

              <div className="border border-[#E8E6DE]/60 rounded-2xl overflow-hidden shadow-2xs">
                <table className="w-full text-left text-xs text-[#2D2D2D]">
                  <thead className="bg-[#F8F7F2] border-b border-[#E8E6DE]/60 text-[9px] uppercase font-bold text-[#7A7667]">
                    <tr>
                      <th className="px-4 py-2.5 w-7/12">Description Prestation</th>
                      <th className="px-4 py-2.5 w-1/12 text-center">Qté</th>
                      <th className="px-4 py-2.5 w-3/12 text-right text-nowrap">P.U. (MAD)</th>
                      <th className="px-4 py-2.5 w-1/12 text-center"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E8E6DE]/40">
                    {customInvoiceItems.length > 0 ? (
                      customInvoiceItems.map((item) => (
                        <tr key={item.id} className="hover:bg-[#F8F7F2]/20">
                          <td className="px-4 py-2">
                            <input
                              type="text"
                              value={item.description}
                              onChange={(e) => handleUpdateInvoiceItem(item.id, 'description', e.target.value)}
                              placeholder="Prestation..."
                              className="w-full bg-transparent border-b border-transparent focus:border-[#A68A64] py-1 text-xs outline-hidden text-[#2D2D2D] font-semibold"
                            />
                          </td>
                          <td className="px-4 py-2 text-center">
                            <input
                              type="number"
                              min={1}
                              value={item.quantity}
                              onChange={(e) => handleUpdateInvoiceItem(item.id, 'quantity', parseInt(e.target.value) || 1)}
                              className="w-12 bg-transparent border-b border-transparent focus:border-[#A68A64] py-1 text-center text-xs outline-hidden font-bold"
                            />
                          </td>
                          <td className="px-4 py-2 text-right">
                            <input
                              type="number"
                              min={0}
                              value={item.unitPrice}
                              onChange={(e) => handleUpdateInvoiceItem(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                              className="w-24 bg-transparent border-b border-transparent focus:border-[#A68A64] py-1 text-right text-xs outline-hidden font-mono font-bold text-[#2D2D2D]"
                            />
                          </td>
                          <td className="px-4 py-2 text-center">
                            <button
                              type="button"
                              onClick={() => handleRemoveInvoiceItem(item.id)}
                              className="p-1 hover:bg-red-50 text-red-500 rounded-lg transition cursor-pointer"
                              title="Retirer la ligne"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="px-4 py-6 text-center text-[#7A7667]/60 italic font-medium">
                          Aucune ligne de facture. Ajoutez au moins une ligne de prestation.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Total Calculation Display */}
              {customInvoiceItems.length > 0 && (
                <div className="flex justify-end p-4 bg-[#F8F7F2]/50 border border-[#E8E6DE]/40 rounded-2xl">
                  <div className="text-right space-y-1">
                    <p className="text-[10px] text-[#7A7667] font-bold uppercase tracking-wider">Montant Total HT</p>
                    <p className="text-lg font-serif font-black text-[#2D2D2D]">
                      {customInvoiceItems.reduce((acc, item) => acc + (item.unitPrice * item.quantity), 0).toLocaleString('fr-FR')} <span className="text-xs font-sans font-medium text-[#7A7667]">MAD</span>
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Note block */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-[#7A7667] uppercase tracking-wider font-mono">Notes d'accompagnement & Conditions</label>
              <textarea
                value={invoiceNotes}
                onChange={(e) => setInvoiceNotes(e.target.value)}
                placeholder="Rédigez les conditions de règlement ou notes additionnelles..."
                rows={2}
                className="w-full p-2.5 bg-[#F8F7F2] border border-[#E8E6DE] rounded-xl outline-hidden text-[#2D2D2D] text-xs resize-none font-medium"
              />
            </div>

            {/* Footer Buttons */}
            <div className="flex gap-3 justify-end border-t border-[#E8E6DE]/60 pt-4.5">
              <button
                type="button"
                onClick={() => setInvoiceModalContact(null)}
                className="px-4.5 py-2.5 rounded-xl border border-[#E8E6DE] text-[#7A7667] font-semibold hover:bg-[#F8F7F2] cursor-pointer text-xs transition animate-none"
              >
                Annuler
              </button>
              <button
                type="button"
                disabled={customInvoiceItems.length === 0}
                onClick={handleGenerateInvoiceSubmit}
                className={`px-5 py-2.5 bg-[#A68A64] hover:bg-[#917550] text-[#FFFFFF] font-semibold rounded-xl shadow-md cursor-pointer text-xs transition flex items-center gap-2 ${
                  customInvoiceItems.length === 0 ? 'opacity-40 cursor-not-allowed bg-slate-200 text-slate-400 border-none' : ''
                }`}
              >
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Compiler & Confirmer la Facture</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Contact Information Edit Modal dialog */}
      {editModalContact && (
        <div className="fixed inset-0 bg-[#2D2D2D]/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in-40 duration-200 font-sans">
          <form 
            onSubmit={handleSaveContactEdit}
            className="bg-white rounded-3xl border border-[#E8E6DE] shadow-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-5 animate-in zoom-in-95 duration-200"
          >
            
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[#E8E6DE]/60 pb-4">
              <div className="flex items-center gap-2.5 text-[#2D2D2D]">
                <Edit className="w-5.5 h-5.5 text-[#A68A64] shrink-0" />
                <div>
                  <h3 className="text-base font-serif font-black tracking-tight">Modifier les coordonnées CRM</h3>
                  <p className="text-[10px] text-[#7A7667] font-semibold mt-0.5">Identifiant unique : {editModalContact.id}</p>
                </div>
              </div>
              <button 
                type="button"
                onClick={() => setEditModalContact(null)} 
                className="p-1.5 hover:bg-[#F8F7F2] rounded-full text-[#7A7667] hover:text-[#2D2D2D] transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-sans">
              <div className="space-y-1 sm:col-span-2">
                <label className="text-[10px] font-bold text-[#7A7667] uppercase tracking-wider">Nom de l'entreprise *</label>
                <input
                  type="text"
                  required
                  value={editCompany}
                  onChange={(e) => setEditCompany(e.target.value)}
                  className="w-full p-2.5 bg-[#F8F7F2] border border-[#E8E6DE] rounded-xl outline-hidden text-[#2D2D2D] font-medium"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[#7A7667] uppercase tracking-wider">Représentant Principal *</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full p-2.5 bg-[#F8F7F2] border border-[#E8E6DE] rounded-xl outline-hidden text-[#2D2D2D] font-medium"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[#7A7667] uppercase tracking-wider">Téléphone Mobile</label>
                <input
                  type="text"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  className="w-full p-2.5 bg-[#F8F7F2] border border-[#E8E6DE] rounded-xl outline-hidden text-[#2D2D2D] font-mono font-medium"
                />
              </div>

              <div className="space-y-1 sm:col-span-2">
                <label className="text-[10px] font-bold text-[#7A7667] uppercase tracking-wider">Adresse E-mail *</label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    className="w-full p-2.5 bg-[#F8F7F2] border border-[#E8E6DE] rounded-xl outline-hidden text-[#2D2D2D] font-mono pr-24 font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (!editCompany) return;
                      const slug = editCompany
                        .toLowerCase()
                        .normalize("NFD")
                        .replace(/[\u0300-\u036f]/g, "")
                        .replace(/[^a-z0-9]/g, '');
                      setEditEmail(`contact@${slug || 'exposant'}.ma`);
                    }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-[9px] font-bold text-[#A68A64] hover:underline bg-white px-2 py-1 rounded-md border border-[#E8E6DE] cursor-pointer"
                    title="Générer un email provisoire basé sur l'entreprise"
                  >
                    Générer .ma
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[#7A7667] uppercase tracking-wider">Salon référencé</label>
                <select
                  value={editSite}
                  onChange={(e) => {
                    const nextSite = e.target.value as SiteId;
                    setEditSite(nextSite);
                    if (editModalContact && editModalContact.site !== nextSite) {
                      setEditStandNumber('');
                    } else if (editModalContact) {
                      setEditStandNumber(editModalContact.standNumber || '');
                    }
                  }}
                  className="w-full p-2.5 bg-[#F8F7F2] border border-[#E8E6DE] rounded-xl outline-hidden text-[#2D2D2D] font-semibold"
                >
                  {sitesList.map(s => (
                    <option key={s.id} value={s.id}>{s.domain} ({s.name})</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[#7A7667] uppercase tracking-wider">Statut / Rôle CRM</label>
                <select
                  value={editRole}
                  onChange={(e) => setEditRole(e.target.value as any)}
                  className="w-full p-2.5 bg-[#F8F7F2] border border-[#E8E6DE] rounded-xl outline-hidden text-[#2D2D2D] font-semibold"
                >
                  <option value="prospect">Prospect (En cours de démarchage)</option>
                  <option value="client">Client (Exposant officiel)</option>
                  <option value="partner">Partenaire officiel</option>
                  <option value="partner_media">Partenaire Média</option>
                  <option value="fournisseur">Fournisseur / Prestataire</option>
                </select>
              </div>

              {editRole === 'prospect' && (
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-[#7A7667] uppercase tracking-wider">Qualification / Évolution Prospect</label>
                  <select
                    value={editProspectStatus}
                    onChange={(e) => setEditProspectStatus(e.target.value as any)}
                    className="w-full p-2.5 border border-[#E8E6DE] rounded-xl outline-hidden text-[#2D2D2D] font-bold cursor-pointer"
                    style={{
                      backgroundColor: editProspectStatus === 'interesse' ? '#ECFDF5' : editProspectStatus === 'pas_interesse' ? '#FEF2F2' : editProspectStatus === 'a_rappeler' ? '#FFFBEB' : editProspectStatus === 'relance' ? '#ECFEFF' : '#F5F3FF',
                      color: editProspectStatus === 'interesse' ? '#047857' : editProspectStatus === 'pas_interesse' ? '#B91C1C' : editProspectStatus === 'a_rappeler' ? '#B45309' : editProspectStatus === 'relance' ? '#0891B2' : '#6D28D9'
                    }}
                  >
                    <option value="interesse" style={{ backgroundColor: '#fff', color: '#047857' }}>✓ Intéressé</option>
                    <option value="pas_interesse" style={{ backgroundColor: '#fff', color: '#B91C1C' }}>✗ Pas intéressé</option>
                    <option value="a_rappeler" style={{ backgroundColor: '#fff', color: '#B45309' }}>☎ À rappeler</option>
                    <option value="relance" style={{ backgroundColor: '#fff', color: '#0891B2' }}>↻ Relance</option>
                    <option value="demande_devis" style={{ backgroundColor: '#fff', color: '#6D28D9' }}>✎ Demande de devis</option>
                  </select>
                </div>
              )}

              {editRole === 'prospect' && (
                <div className="sm:col-span-2 border border-[#E8E6DE]/60 bg-[#FAFAF8] rounded-2xl p-4 space-y-3.5 my-1">
                  <div className="flex justify-between items-center border-b border-[#E8E6DE]/50 pb-2">
                    <span className="text-[10px] font-bold text-[#A68A64] uppercase tracking-wider">Option Tarifaire du Prospect (Modification)</span>
                    <span className="text-[9px] bg-amber-50 text-amber-700 font-semibold px-2 py-0.5 rounded-full border border-amber-200">Mise à jour</span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-[#7A7667] uppercase tracking-wider">Catégorie de Stand</label>
                      <select
                        value={editStandType}
                        onChange={(e) => setEditStandType(e.target.value as any)}
                        className="w-full p-2.5 bg-white border border-[#E8E6DE] rounded-xl outline-hidden text-[#2D2D2D] text-xs font-semibold"
                      >
                        <option value="surface_nue">🏢 Surface Nue (1800 MAD/m²)</option>
                        <option value="equipe">📦 Stand Équipé (2400 MAD/m²)</option>
                        <option value="personalise">✨ Stand Personnalisé (Saisie Manuelle)</option>
                        <option value="exceptionnel">💎 Tarif Exceptionnel (Saisie Manuelle)</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-[#7A7667] uppercase tracking-wider">Surface Envisagée (m²)</label>
                      <input
                        type="number"
                        min="1"
                        placeholder="ex: 18"
                        value={editStandArea}
                        onChange={(e) => setEditStandArea(e.target.value)}
                        className="w-full p-2.5 bg-white border border-[#E8E6DE] rounded-xl outline-hidden text-[#2D2D2D] text-xs font-mono font-semibold"
                      />
                    </div>

                    <div className="space-y-1 col-span-2">
                      <label className="text-[10px] font-bold text-[#7A7667] uppercase tracking-wider block">Frais d'enregistrement d'Enquête</label>
                      <div className="grid grid-cols-3 gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setEditRegFeeMode('yes');
                            setEditIncludeRegFee(true);
                          }}
                          className={`py-2 rounded-xl text-xs font-semibold border transition cursor-pointer text-center ${
                            editRegFeeMode === 'yes' 
                              ? 'bg-[#A68A64] text-white border-[#A68A64] shadow-xs' 
                              : 'bg-white text-[#7A7667] border-[#E8E6DE] hover:bg-[#F8F7F2]'
                          }`}
                        >
                          ✅ Oui (2500)
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setEditRegFeeMode('no');
                            setEditIncludeRegFee(false);
                          }}
                          className={`py-2 rounded-xl text-xs font-semibold border transition cursor-pointer text-center ${
                            editRegFeeMode === 'no' 
                              ? 'bg-[#FAF9F5] text-rose-700 border-[#E8E6DE] shadow-inner font-bold' 
                              : 'bg-white text-[#7A7667] border-[#E8E6DE] hover:bg-[#F8F7F2]'
                          }`}
                        >
                          ❌ Non (Exclu)
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setEditRegFeeMode('manual');
                            setEditIncludeRegFee(true);
                          }}
                          className={`py-2 rounded-xl text-xs font-semibold border transition cursor-pointer text-center ${
                            editRegFeeMode === 'manual' 
                              ? 'bg-purple-600 text-white border-purple-600 shadow-xs font-bold' 
                              : 'bg-white text-[#7A7667] border-[#E8E6DE] hover:bg-[#F8F7F2]'
                          }`}
                        >
                          ✏️ Manuel
                        </button>
                      </div>
                      {editRegFeeMode === 'manual' && (
                        <div className="mt-2 text-left animate-in fade-in duration-200">
                          <label className="text-[9px] font-bold text-purple-600 uppercase tracking-wider block mb-1">Indiquer le montant des frais d'enregistrement (MAD HT) *</label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-400 text-xs font-bold font-sans">MAD</span>
                            <input
                              type="number"
                              min="0"
                              placeholder="Saisir montant manuellement"
                              value={editRegFeeManualAmount}
                              onChange={(e) => {
                                setEditRegFeeManualAmount(e.target.value);
                              }}
                              className="w-full pl-12 pr-3 py-2 bg-purple-50/50 border border-purple-200 rounded-xl outline-hidden text-purple-950 font-mono font-bold text-xs"
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {(editStandType === 'personalise' || editStandType === 'exceptionnel') && (
                      <div className="space-y-1 col-span-2">
                        <label className="text-[10px] font-bold text-[#7A7667] uppercase tracking-wider">Prix Total Manuel (MAD)</label>
                        <input
                          type="number"
                          min="0"
                          placeholder="Entrer le prix personnalisé"
                          value={editExceptionalPrice}
                          onChange={(e) => setEditExceptionalPrice(e.target.value)}
                          className="w-full p-2.5 bg-white border border-[#E8E6DE] rounded-xl outline-hidden text-[#2D2D2D] text-xs font-mono font-semibold"
                        />
                      </div>
                    )}
                  </div>

                  {/* Simulator with HT, TVA 20% & TTC */}
                  {(() => {
                    const area = parseFloat(editStandArea) || 0;
                    let amountHT = 0;
                    let formulaDesc = "";
                    if (editStandType === 'surface_nue') {
                      amountHT = area * 1800;
                      formulaDesc = `${area} m² x 1800 MAD`;
                    } else if (editStandType === 'equipe') {
                      amountHT = area * 2400;
                      formulaDesc = `${area} m² x 2400 MAD`;
                    } else {
                      amountHT = parseFloat(editExceptionalPrice) || 0;
                      formulaDesc = "Manuel";
                    }

                    if (editRegFeeMode === 'yes') {
                      amountHT += 2500;
                      formulaDesc += " + 2500 MAD Enregistrement";
                    } else if (editRegFeeMode === 'manual') {
                      const manualAmount = parseFloat(editRegFeeManualAmount) || 0;
                      amountHT += manualAmount;
                      formulaDesc += ` + ${manualAmount} MAD Enregistrement (manuel)`;
                    }

                    const tvaAmount = amountHT * 0.20;
                    const amountTTC = amountHT * 1.20;

                    return (
                      <div className="bg-[#FDFDFB] border border-[#E8E6DE]/70 rounded-2xl p-4.5 space-y-2.5 text-xs text-[#7A7667] shadow-3xs w-full col-span-2">
                        <div className="flex justify-between items-center text-[10px] font-bold text-[#A68A64] border-b border-[#E8E6DE]/50 pb-1.5 mb-1">
                          <span>SIMULATEUR DE TARIF (HT + TVA 20%)</span>
                          <span className="font-mono text-slate-400">({formulaDesc})</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="font-medium text-[11px]">Total HT :</span>
                          <span className="font-bold font-mono text-[#2D2D2D]">{amountHT.toLocaleString()} MAD</span>
                        </div>
                        <div className="flex justify-between items-center text-[#7A7667] border-dashed border-b border-[#E8E6DE]/55 pb-2">
                          <span className="font-medium text-[11.5px] items-center gap-1">
                            TVA (20% par défaut) :
                          </span>
                          <span className="font-bold font-mono text-slate-600">+{tvaAmount.toLocaleString()} MAD</span>
                        </div>
                        <div className="flex justify-between items-center pt-1">
                          <span className="font-black text-[#2D2D2D] text-[11.5px]">NET À PAYER TTC :</span>
                          <span className="font-black font-mono text-[#A68A64] text-sm bg-amber-50/50 px-2 py-1 rounded-lg border border-amber-150">{amountTTC.toLocaleString()} MAD</span>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}

              <div className="space-y-1 sm:col-span-2">
                <label className="text-[10px] font-bold text-[#7A7667] uppercase tracking-wider">
                  N° Stand attribué
                </label>
                <select
                  value={editStandNumber}
                  onChange={(e) => setEditStandNumber(e.target.value)}
                  className="w-full p-2.5 bg-[#F8F7F2] border border-[#E8E6DE] rounded-xl outline-hidden text-[#2D2D2D] text-[11px] font-semibold"
                >
                  <option value="">-- Aucun stand assigné (Détacher) --</option>
                  {editFreeStands.map(s => {
                    const isCurrent = editModalContact && s.num.toLowerCase() === editModalContact.standNumber?.toLowerCase() && s.site === editModalContact.site;
                    return (
                      <option key={s.id} value={s.num}>
                        {s.num} ({s.area}m²) {isCurrent ? "★ Stand Actuel" : "✓ Libre"}
                      </option>
                    );
                  })}
                </select>
                <p className="text-[9px] text-[#7A7667] font-medium leading-relaxed">
                  Modifier ce stand mettra à jour automatiquement son statut et ses informations sur le plan interactif correspondant.
                </p>
              </div>

              <div className="space-y-1 sm:col-span-2">
                <label className="text-[10px] font-bold text-[#7A7667] uppercase tracking-wider">Notes de suivi CRM / Commentaires</label>
                <textarea
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  placeholder="Notes de négociation, avancement, besoins techniques..."
                  rows={3}
                  className="w-full p-2.5 bg-[#F8F7F2] border border-[#E8E6DE] rounded-xl outline-hidden text-[#2D2D2D] resize-none font-medium text-xs"
                />
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="flex gap-3 justify-end border-t border-[#E8E6DE]/60 pt-4.5">
              <button
                type="button"
                onClick={() => setEditModalContact(null)}
                className="px-4.5 py-2.5 rounded-xl border border-[#E8E6DE] text-[#7A7667] font-semibold hover:bg-[#F8F7F2] cursor-pointer text-xs transition"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 bg-[#2C3E36] hover:bg-[#202E28] text-white font-semibold rounded-xl shadow-md cursor-pointer text-xs transition flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Enregistrer les modifications</span>
              </button>
            </div>

          </form>
        </div>
      )}

    </div>
  );
}
