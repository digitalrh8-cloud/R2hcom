/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  FileText, 
  Receipt, 
  Plus, 
  Printer, 
  Trash2, 
  CheckCircle2, 
  FileSpreadsheet, 
  AlertCircle,
  TrendingUp,
  Sliders,
  Sparkles,
  Percent,
  TrendingDown
} from 'lucide-react';
import { SiteId, Transaction, TransactionItem } from '../types';
import { initialSites } from '../initialData';

interface ComptabiliteViewProps {
  selectedSite: SiteId;
  transactions: Transaction[];
  setTransactions: React.Dispatch<React.SetStateAction<Transaction[]>>;
  currentSubTab: 'devis' | 'factures';
}

export default function ComptabiliteView({ 
  selectedSite, 
  transactions, 
  setTransactions,
  currentSubTab
}: ComptabiliteViewProps) {
  const [activeType, setActiveType] = useState<'devis' | 'facture'>(currentSubTab === 'devis' ? 'devis' : 'facture');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [focusReceipt, setFocusReceipt] = useState<Transaction | null>(null);

  // Form states
  const [formCompany, setFormCompany] = useState('');
  const [formClient, setFormClient] = useState('');
  const [formSite, setFormSite] = useState<SiteId>(selectedSite === 'r2h' ? 'gardenexpo' : selectedSite);
  const [formType, setFormType] = useState<'devis' | 'facture'>('devis');
  const [formItems, setFormItems] = useState<{ description: string, quantity: number, unitPrice: number }[]>([
    { description: 'Réservation de Stand d\'exposition', quantity: 1, unitPrice: 24500 }
  ]);
  const [formNotes, setFormNotes] = useState('');

  // Toast
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Filter lists based on chosen site and sub-tab selection
  const siteFilter = (t: Transaction) => selectedSite === 'r2h' ? true : t.site === selectedSite;
  const typeFilter = (t: Transaction) => t.type === activeType;
  const filteredTransactions = transactions.filter(t => siteFilter(t) && typeFilter(t));

  // Sync activeType if subTab triggers it
  React.useEffect(() => {
    setActiveType(currentSubTab === 'devis' ? 'devis' : 'facture');
  }, [currentSubTab]);

  // Calculations for billing creation
  const handleAddItem = () => {
    setFormItems(prev => [...prev, { description: '', quantity: 1, unitPrice: 0 }]);
  };

  const handleRemoveItem = (idx: number) => {
    setFormItems(prev => prev.filter((_, i) => i !== idx));
  };

  const handleUpdateItem = (idx: number, field: string, value: any) => {
    setFormItems(prev => prev.map((item, i) => {
      if (idx === i) {
        return { ...item, [field]: value };
      }
      return item;
    }));
  };

  const handleSaveInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formCompany || !formClient || formItems.length === 0) return;

    // Calculate total amount
    const totalRaw = formItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);

    const docItems: TransactionItem[] = formItems.map((it, i) => ({
      id: `it_${Date.now()}_${i}`,
      description: it.description,
      quantity: Number(it.quantity),
      unitPrice: Number(it.unitPrice)
    }));

    const docNum = formType === 'devis' 
      ? `DEV-2024-${150 + transactions.length}` 
      : `FA-2024-${100 + transactions.length}`;

    const newDoc: Transaction = {
      id: `doc_${Date.now()}`,
      num: docNum,
      clientName: formClient,
      companyName: formCompany,
      site: formSite,
      type: formType,
      amount: totalRaw,
      status: 'envoye',
      date: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      items: docItems,
      notes: formNotes
    };

    setTransactions(prev => [newDoc, ...prev]);
    setShowCreateForm(false);
    setFocusReceipt(newDoc); // auto focalize visual print report 
    triggerToast(`${formType === 'devis' ? 'Devis' : 'Facture'} ${docNum} généré.`);

    // Reset default form items
    setFormItems([{ description: 'Réservation de Stand d\'exposition', quantity: 1, unitPrice: 24500 }]);
    setFormCompany('');
    setFormClient('');
    setFormNotes('');
  };

  // Switch status of invoice (e.g. mark as payed)
  const handleToggleDocStatus = (docId: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'paye' ? 'envoye' : 'paye';
    setTransactions(prev => prev.map(t => {
      if (t.id === docId) {
        return { ...t, status: nextStatus };
      }
      return t;
    }));

    if (focusReceipt?.id === docId) {
      setFocusReceipt(prev => prev ? { ...prev, status: nextStatus } : null);
    }
    triggerToast("Statut de la transaction actualisé avec succès.");
  };

  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => {
      setToastMsg(null);
    }, 4000);
  };

  const printDocument = () => {
    window.print();
  };

  return (
    <div id="accounting-view" className="flex-1 overflow-y-auto bg-slate-50/50 p-6 space-y-6">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed top-4 right-4 bg-slate-900 border border-slate-700 text-white text-xs px-4 py-3 rounded-lg shadow-xl flex items-center gap-2.5 z-50 animate-bounce font-sans">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Billing Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-xl font-display font-bold text-slate-800 tracking-tight">Comptabilité & Factures</h2>
          <p className="text-xs text-slate-500">
            Générez des devis descriptifs (offres) et factures réglementaires conformes aux dispositions fiscales de R2H Communication.
          </p>
        </div>

        <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200/50 self-start sm:self-auto">
          <button
            onClick={() => setActiveType('devis')}
            className={`px-4 py-1.5 rounded-md text-xs font-semibold cursor-pointer transition-all ${
              activeType === 'devis' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500'
            }`}
          >
            Devis Proforma
          </button>
          <button
            onClick={() => setActiveType('facture')}
            className={`px-4 py-1.5 rounded-md text-xs font-semibold cursor-pointer transition-all ${
              activeType === 'facture' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500'
            }`}
          >
            Factures TVA
          </button>
        </div>
      </div>

      {/* Main Layout Grid split into Lists and Receipts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Transactions list panel (Col span 2 unless form active) */}
        <div className={showCreateForm ? 'lg:col-span-1 space-y-4' : 'lg:col-span-2 space-y-4'}>
          <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-sans">
              Liste des {activeType === 'devis' ? 'Devis' : 'Factures'}
            </h4>
            <button
              onClick={() => {
                setFormType(activeType);
                setShowCreateForm(!showCreateForm);
              }}
              className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-semibold rounded-lg flex items-center gap-1.5 cursor-pointer shadow-2xs transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Nouveau document</span>
            </button>
          </div>

          <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-[10px] uppercase font-bold text-slate-400">
                    <th className="px-5 py-3">Numéro</th>
                    <th className="px-5 py-3">Entreprise / Client</th>
                    <th className="px-5 py-3">Montant TTC</th>
                    <th className="px-5 py-3">Salon</th>
                    <th className="px-5 py-3">Statut</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-sans">
                  {filteredTransactions.length > 0 ? (
                    filteredTransactions.map(trans => (
                      <tr 
                        key={trans.id} 
                        onClick={() => setFocusReceipt(trans)}
                        className={`hover:bg-slate-50/50 transition cursor-pointer ${focusReceipt?.id === trans.id ? 'bg-blue-50/20' : ''}`}
                      >
                        <td className="px-5 py-3 text-blue-600 font-mono font-bold">{trans.num}</td>
                        <td className="px-5 py-3">
                          <p className="font-semibold text-slate-800">{trans.companyName}</p>
                          <p className="text-[10px] text-slate-400 mt-0.5">{trans.clientName} • {trans.date}</p>
                        </td>
                        <td className="px-5 py-3 font-mono font-medium text-slate-800">
                          {(trans.amount * 1.2).toLocaleString()} MAD
                        </td>
                        <td className="px-5 py-3">
                          <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded-full text-slate-500 font-medium">
                            {trans.site === 'africapool' ? 'Africa Pool' : trans.site === 'gardenexpo' ? 'Garden Expo' : 'R2H Com'}
                          </span>
                        </td>
                        <td className="px-5 py-3">
                          <span className={`text-[9px] px-2 py-0.5 rounded-full font-semibold ${
                            trans.status === 'paye' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-amber-50 text-amber-600 border border-amber-100'
                          }`}>
                            {trans.status === 'paye' ? 'Encaissé' : 'Envoyé'}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-400">
                        <AlertCircle className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                        Aucune transaction listée sous ces critères.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* MIDDLE / RIGHT: Creation Form or Print Preview report details */}
        <div className={showCreateForm ? 'lg:col-span-2 space-y-4' : 'lg:col-span-1 space-y-4'}>

          {showCreateForm ? (
            /* Billing PDF creation panel */
            <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-md animate-in slide-in-from-right-3 duration-200">
              <div className="flex justify-between items-center border-b pb-3 mb-4">
                <h3 className="font-display font-semibold text-sm text-slate-800 flex items-center gap-2">
                  <FileSpreadsheet className="w-5 h-5 text-blue-500" />
                  <span>Nouveau Document Commercial : de {formType === 'devis' ? 'Devis' : 'Facture'}</span>
                </h3>
                <button 
                  onClick={() => setShowCreateForm(false)}
                  className="text-slate-400 hover:text-slate-600 font-bold"
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleSaveInvoice} className="space-y-4 text-xs font-sans text-slate-700">
                
                {/* Basic client selectors */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Société Client *</label>
                    <input
                      type="text" required
                      value={formCompany}
                      onChange={(e) => setFormCompany(e.target.value)}
                      placeholder="Ex: AquaPools Maroc"
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg outline-hidden text-slate-700"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Représentant *</label>
                    <input
                      type="text" required
                      value={formClient}
                      onChange={(e) => setFormClient(e.target.value)}
                      placeholder="Ex: Mme Bennani"
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg outline-hidden text-slate-700"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Projet Salon récepteur</label>
                    <select
                      value={formSite}
                      onChange={(e) => setFormSite(e.target.value as SiteId)}
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg outline-hidden text-slate-700 text-[11px] font-medium"
                    >
                      <option value="gardenexpo">Garden Expo Africa 2025</option>
                      <option value="africapool">Africa Pool & Spa Expo 2025</option>
                      <option value="r2h">R2H Communication</option>
                    </select>
                  </div>
                </div>

                {/* Document Type select */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Format Document</label>
                    <select
                      value={formType}
                      onChange={(e) => setFormType(e.target.value as any)}
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg outline-hidden text-slate-700 text-[11px] font-semibold"
                    >
                      <option value="devis">Devis Proforma (Offre commerciale)</option>
                      <option value="facture">Facture Officielle (Déclarante TVA)</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Taux de TVA marocain</label>
                    <div className="w-full p-2 bg-slate-100 border border-slate-200 rounded-lg text-slate-500 font-mono font-medium flex items-center justify-between select-none">
                      <span>Régime de Commerce Standard</span>
                      <span className="text-blue-500">20.00 %</span>
                    </div>
                  </div>
                </div>

                {/* Items grid loop list */}
                <div className="space-y-2.5">
                  <div className="flex justify-between items-center border-b border-slate-100 pb-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Lignes d'articles facturables</label>
                    <button
                      type="button"
                      onClick={handleAddItem}
                      className="text-[10px] text-blue-600 hover:text-blue-700 font-bold flex items-center gap-0.5 cursor-pointer"
                    >
                      + Ajouter ligne
                    </button>
                  </div>

                  <div className="space-y-2">
                    {formItems.map((item, idx) => (
                      <div key={idx} className="flex gap-2 items-center">
                        <input
                          type="text" required
                          value={item.description}
                          onChange={(e) => handleUpdateItem(idx, 'description', e.target.value)}
                          placeholder="Description de l'article"
                          className="flex-1 p-2 bg-slate-50 border border-slate-200 rounded-lg outline-hidden text-slate-700"
                        />
                        <input
                          type="number" required min={1}
                          value={item.quantity}
                          onChange={(e) => handleUpdateItem(idx, 'quantity', e.target.value)}
                          placeholder="Qté"
                          className="w-16 p-2 bg-slate-50 border border-slate-200 rounded-lg outline-hidden text-slate-700 font-mono"
                        />
                        <input
                          type="number" required min={0}
                          value={item.unitPrice}
                          onChange={(e) => handleUpdateItem(idx, 'unitPrice', e.target.value)}
                          placeholder="PU (MAD)"
                          className="w-28 p-2 bg-slate-50 border border-slate-200 rounded-lg outline-hidden text-slate-700 font-mono"
                        />
                        {formItems.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(idx)}
                            className="p-2 text-rose-500 hover:text-rose-700 cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Notes and financial conditions */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Conditions de règlement & notes comptables</label>
                  <textarea
                    value={formNotes}
                    onChange={(e) => setFormNotes(e.target.value)}
                    placeholder="Ex: Acompte de 50% à la réservation, solde 15 jours avant installation..."
                    rows={2}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg outline-hidden text-slate-700 resize-none"
                  />
                </div>

                {/* Submit panel */}
                <div className="flex gap-2 pt-2 border-t mt-4">
                  <button
                    type="button"
                    onClick={() => setShowCreateForm(false)}
                    className="flex-1 py-2 rounded-lg border border-slate-200 text-slate-500 font-semibold hover:bg-slate-50 cursor-pointer text-center"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-sm cursor-pointer text-center"
                  >
                    Générer et focaliser
                  </button>
                </div>

              </form>
            </div>
          ) : (
            /* Printable Report visual paper details corresponding to Moroccan invoices standards */
            <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs p-5 relative select-text">
              <div className="flex justify-between items-center pb-3 border-b border-slate-100 mb-4 no-print">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-display">Rapport de Facturation</h4>
                
                {focusReceipt && (
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => handleToggleDocStatus(focusReceipt.id, focusReceipt.status)}
                      className={`px-2 py-1 rounded-lg text-[10px] font-semibold transition cursor-pointer ${
                        focusReceipt.status === 'paye' ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      }`}
                    >
                      {focusReceipt.status === 'paye' ? "Marquer Envoyé" : "Marquer Encaissé"}
                    </button>
                    <button
                      onClick={printDocument}
                      className="p-1 px-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-[10px] font-semibold flex items-center gap-1 cursor-pointer transition"
                    >
                      <Printer className="w-3 h-3" />
                      <span>Imprimer PDF</span>
                    </button>
                  </div>
                )}
              </div>

              {focusReceipt ? (
                /* Corporate printable page mockup frame rendering */
                <div id="printable-area-mockup" className="bg-white border border-slate-300 p-6 rounded-lg font-sans text-[11px] leading-relaxed relative text-slate-800 selection:bg-rose-100">
                  
                  {/* Watermark paid indicator */}
                  {focusReceipt.status === 'paye' && (
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 border-4 border-dotted border-emerald-500/30 text-emerald-500/30 font-bold uppercase tracking-widest text-3xl rotate-12 px-6 py-2 rounded-md select-none pointer-events-none font-display">
                      PAYÉ / ENCAISSÉ
                    </div>
                  )}

                  {/* Corporate header details */}
                  <div className="flex justify-between items-start border-b border-slate-200 pb-4 mb-4">
                    <div className="space-y-1">
                      <div className="font-display font-black text-slate-900 tracking-wider text-sm select-none">
                        R2H COMMUNICATION
                      </div>
                      <p className="text-[10px] text-slate-400 font-medium">Agence Événementielle Globale</p>
                      <p className="text-[9px] text-slate-400 font-medium font-mono leading-none">Rabat, Casablanca • Maroc</p>
                    </div>

                    <div className="text-right font-mono space-y-1">
                      <p className="text-xs font-bold text-slate-900">
                        {focusReceipt.type === 'devis' ? 'DEVIS PROFORMA' : 'FACTURE DE VENTE'}
                      </p>
                      <p className="text-slate-600 font-semibold text-[10px]">{focusReceipt.num}</p>
                      <p className="text-slate-400 text-[9px] uppercase">Réf: {focusReceipt.site === 'africapool' ? 'Africa Pool Expo' : 'Garden Expo Africa'}</p>
                    </div>
                  </div>

                  {/* Grid showing both Sender and Receiver addresses */}
                  <div className="grid grid-cols-2 gap-4 mb-5 leading-relaxed">
                    <div>
                      <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wide block mb-1">Émetteur</span>
                      <p className="font-bold text-slate-800">R2H Communication SARL au b.m.</p>
                      <p className="text-slate-500 font-medium mt-0.5">N° 45, avenue des FAR, Tour des Habous, Casablanca, Maroc</p>
                      <p className="text-[9px] text-slate-400 mt-1 font-mono">ICE: 00234556111002 • CNSS: 4455123</p>
                    </div>

                    <div className="bg-slate-50/50 border border-slate-100 rounded-lg p-2.5">
                      <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wide block mb-1">Destinataire (Client)</span>
                      <p className="font-bold text-slate-800">{focusReceipt.companyName}</p>
                      <p className="text-slate-500 font-medium mt-0.5">Représentant : {focusReceipt.clientName}</p>
                      <p className="text-[9px] text-slate-400 font-mono mt-1">Date d'édition : {focusReceipt.date}</p>
                      <p className="text-[9px] text-slate-400 font-mono">Échéance de paiement : {focusReceipt.dueDate}</p>
                    </div>
                  </div>

                  {/* Items bill layout table */}
                  <div className="border border-slate-100 rounded-lg overflow-hidden mb-5">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-100 text-[9px] uppercase font-bold text-slate-400">
                          <th className="p-2">Désignation des prestations</th>
                          <th className="p-2 text-center w-12">Qté</th>
                          <th className="p-2 text-right w-24">Prix Unit. HT</th>
                          <th className="p-2 text-right w-24">Montant HT</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-sans text-[10px]">
                        {focusReceipt.items.map((item) => (
                          <tr key={item.id}>
                            <td className="p-2 font-medium text-slate-800">{item.description}</td>
                            <td className="p-2 text-center text-slate-500 font-mono">{item.quantity}</td>
                            <td className="p-2 text-right text-slate-700 font-mono">{item.unitPrice.toLocaleString()} MAD</td>
                            <td className="p-2 text-right text-slate-800 font-mono">{(item.quantity * item.unitPrice).toLocaleString()} MAD</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Sums and Bank coordinates totals */}
                  <div className="flex flex-col sm:flex-row justify-between gap-5 leading-normal">
                    {/* Bank Coordinates block */}
                    <div className="max-w-[180px] text-slate-400 text-[9px]">
                      <span className="font-bold uppercase tracking-wider block mb-1">Information de Règlement</span>
                      <p className="font-medium">Règlement par chèque barré ou virement aux coordonnées :</p>
                      <p className="font-bold text-slate-600 font-mono mt-1.5 select-all text-[8px] leading-tight">ATTIJARIWAFA BANK CASABLANCA<br />RIB: 007 780 0001234567890123 44</p>
                    </div>

                    {/* HT + VAT 20% + TTC summary block */}
                    <div className="w-full sm:max-w-[200px] border-t-2 border-slate-200 pt-2.5">
                      <div className="space-y-1 text-right font-sans text-[10px]">
                        <div className="flex justify-between">
                          <span className="text-slate-400 font-medium">TOTAL HT :</span>
                          <span className="font-mono font-medium text-slate-800">{focusReceipt.amount.toLocaleString()} MAD</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400 font-medium">TVA (20.00%) :</span>
                          <span className="font-mono font-medium text-slate-800">{(focusReceipt.amount * 0.2).toLocaleString()} MAD</span>
                        </div>
                        <div className="flex justify-between border-t border-slate-100 pt-1 text-xs select-none">
                          <span className="font-bold text-slate-900">NET À PAYER TTC:</span>
                          <span className="font-mono font-bold text-blue-600">{(focusReceipt.amount * 1.2).toLocaleString()} MAD</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Bottom administrative footer conditions */}
                  {focusReceipt.notes && (
                    <div className="border-t border-slate-100 mt-5 pt-3 text-[9px] text-slate-400">
                      <span className="font-bold block uppercase mb-0.5">Clauses particulières</span>
                      <p className="font-medium italic leading-relaxed">{focusReceipt.notes}</p>
                    </div>
                  )}

                </div>
              ) : (
                <div className="text-center py-12 text-slate-400 flex flex-col items-center justify-center gap-2 font-sans text-xs">
                  <AlertCircle className="w-8 h-8 text-slate-300" />
                  <span>Sélectionnez un devis ou une facture pour charger l'aperçu d'impression de l'agence.</span>
                </div>
              )}
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
