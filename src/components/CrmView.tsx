/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
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
  Compass
} from 'lucide-react';
import { SiteId, Contact } from '../types';
import { initialSites } from '../initialData';

interface CrmViewProps {
  selectedSite: SiteId;
  contacts: Contact[];
  setContacts: React.Dispatch<React.SetStateAction<Contact[]>>;
}

export default function CrmView({ selectedSite, contacts, setContacts }: CrmViewProps) {
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
  const [newRole, setNewRole] = useState<'prospect' | 'client'>('prospect');
  const [newNotes, setNewNotes] = useState('');

  // Toast indicator
  const [toastMessage, setToastMessage] = useState<string | null>(null);

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

    const newContact: Contact = {
      id: `c_gen_${Date.now()}`,
      name: newName,
      email: newEmail,
      phone: newPhone || '+212 660 000 000',
      company: newCompany,
      site: newSite,
      role: newRole,
      dateAdded: new Date().toISOString().split('T')[0],
      notes: newNotes
    };

    setContacts(prev => [newContact, ...prev]);

    // Clear form
    setNewName('');
    setNewEmail('');
    setNewPhone('');
    setNewCompany('');
    setNewNotes('');
    setShowAddForm(false);
    triggerToast(`Prospect ${newName} ajouté au CRM.`);
  };

  // Convert prospect to signed exhibitor / client
  const handleConvertProspectToClient = (contactId: string) => {
    setContacts(prev => prev.map(c => {
      if (c.id === contactId) {
        return { ...c, role: 'client' };
      }
      return c;
    }));
    
    // Update active inspector if focused
    if (selectedContact?.id === contactId) {
      setSelectedContact(prev => prev ? { ...prev, role: 'client' } : null);
    }

    triggerToast("Prospect promu au statut d'exposant officiel !");
  };

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  return (
    <div id="crm-view" className="flex-1 overflow-y-auto bg-transparent p-6 sm:p-8 space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 right-6 bg-[#2C3E36] border border-[#E8E6DE] text-white text-xs px-4.5 py-3 rounded-2xl shadow-xl flex items-center gap-2.5 z-50 font-sans">
          <UserCheck className="w-4 h-4 text-[#A68A64] shrink-0" />
          <span className="font-semibold">{toastMessage}</span>
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

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-4.5 py-2.5 bg-[#2C3E36] hover:bg-[#202E28] text-white text-xs font-semibold rounded-xl shadow-xs font-sans flex items-center gap-2 cursor-pointer transition-all shrink-0"
        >
          <UserPlus className="w-4 h-4" />
          <span>Inscrire Prospect</span>
        </button>
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
            <div className="flex bg-[#F0EEE6] p-1 rounded-xl border border-[#E8E6DE]/60 w-full sm:w-auto">
              {[
                { id: 'all', text: 'Tous' },
                { id: 'prospect', text: 'Prospects' },
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
                          <div>
                            <p className="font-bold text-[#2D2D2D]">{contact.company}</p>
                            <p className="text-[10px] text-[#7A7667] mt-0.5">Ajouté: {contact.dateAdded}</p>
                          </div>
                        </td>
                        <td className="px-5 py-3.5 font-bold text-[#2D2D2D]">{contact.name}</td>
                        <td className="px-5 py-3.5">
                          <p className="font-semibold text-[#2D2D2D]">{contact.email}</p>
                          <p className="text-[10px] text-[#7A7667] font-mono mt-0.5">{contact.phone}</p>
                        </td>
                        <td className="px-5 py-3.5 font-medium">
                          <span className="text-[11px] px-2.5 py-0.5 rounded-xl bg-[#F8F7F2] border border-[#E8E6DE] text-[#7A7667] max-w-max block">
                            {contact.site === 'africapool' ? 'africapoolspa.com' : contact.site === 'gardenexpo' ? 'gardenexpo.ma' : 'r2h.ma'}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 uppercase font-mono text-[9px] font-bold">
                          <span className={`px-2 py-0.5 rounded-xl ${
                            contact.role === 'client' ? 'bg-[#7E8F7A]/15 text-[#4D5E4A] border border-[#7E8F7A]/30' :
                            contact.role === 'prospect' ? 'bg-[#A68A64]/15 text-[#2D2D2D] border border-[#A68A64]/30' : 'bg-[#F0EEE6] text-[#7A7667] border border-[#E8E6DE]'
                          }`}>
                            {contact.role === 'client' ? 'Exposant' : contact.role === 'prospect' ? 'Prospect' : 'Fournisseur'}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-right" onClick={(e) => e.stopPropagation()}>
                          {contact.role === 'prospect' ? (
                            <button
                              id={`promote-btn-${contact.id}`}
                              onClick={() => handleConvertProspectToClient(contact.id)}
                              className="px-2.5 py-1.5 bg-[#7E8F7A] hover:bg-[#6C7D69] text-white rounded-lg text-[10px] font-bold shadow-xs transition cursor-pointer inline-flex items-center gap-1"
                              title="Convertir en Exposant officiel"
                            >
                              <ArrowRight className="w-3 h-3" />
                              <span>Convertir</span>
                            </button>
                          ) : (
                            <span className="text-[10px] text-[#7E8F7A] font-bold flex items-center justify-end gap-1">
                              ✓ Validé
                            </span>
                          )}
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
                <span>Nouveau Prospect</span>
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
                      <option value="gardenexpo">Garden Expo 2025</option>
                      <option value="africapool">Africa Pool 2025</option>
                      <option value="r2h">R2H Communication</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-[#7A7667] uppercase tracking-wider">Notes initiales</label>
                  <textarea
                    value={newNotes}
                    onChange={(e) => setNewNotes(e.target.value)}
                    placeholder="Besoins exprimés par le client..."
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
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#7A7667] mb-4.5 font-serif">Fiche Prospect / Client</h4>

            {selectedContact ? (
              <div className="space-y-5 text-xs text-[#2D2D2D]">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full bg-[#F0EEE6] font-serif font-black text-[#A68A64] flex items-center justify-center text-base uppercase shrink-0">
                    {selectedContact.company.slice(0, 2)}
                  </div>
                  <div>
                    <h5 className="font-serif font-black text-[#2D2D2D] text-sm leading-tight">{selectedContact.company}</h5>
                    <p className="text-[9px] text-[#A68A64] uppercase font-bold tracking-wider mt-1">{selectedContact.role === 'client' ? 'Exposant Officiel' : 'Prospect Enregistré'}</p>
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
                      <p className="font-bold text-[#2D2D2D]">{selectedContact.site === 'africapool' ? 'africapoolspa.com' : 'gardenexpo.ma'}</p>
                      <p className="text-[9px] text-[#7A7667]">Salon référencé</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <span className="text-[9px] font-bold text-[#7A7667] uppercase tracking-wider block">Notes de suivi CRM</span>
                  <div className="bg-[#F8F7F2] border border-[#E8E6DE] rounded-xl p-3.5 text-[#7A7667] font-medium leading-relaxed italic text-[11px]">
                    {selectedContact.notes || "Aucune note complémentaire consignée pour le moment. Utilisez le suivi pour relancer."}
                  </div>
                </div>

                {selectedContact.role === 'prospect' && (
                  <button
                    onClick={() => handleConvertProspectToClient(selectedContact.id)}
                    className="w-full py-2.5 bg-[#7E8F7A] hover:bg-[#6C7D69] text-white font-semibold rounded-xl shadow-xs transition-all cursor-pointer flex items-center justify-center gap-2 text-xs"
                  >
                    <UserCheck className="w-4 h-4" />
                    <span>Valider comme Exposant</span>
                  </button>
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

    </div>
  );
}
