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
  TrendingDown,
  Download,
  CreditCard,
  Copy,
  Check
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

  const [advanceInput, setAdvanceInput] = useState<string>('');

  React.useEffect(() => {
    if (focusReceipt) {
      setAdvanceInput(focusReceipt.advancePaid ? String(focusReceipt.advancePaid) : '');
    } else {
      setAdvanceInput('');
    }
  }, [focusReceipt]);

  const handleUpdateAdvance = (amount: number) => {
    if (!focusReceipt) return;
    const hasTva = focusReceipt.includeTva !== false;
    const multiplier = hasTva ? 1.2 : 1.0;
    const ttcAmount = focusReceipt.amount * multiplier;

    // Automatiquement passer en paye si l'avance couvre la totalité du net à payer TTC
    const nextStatus = amount >= Math.round(ttcAmount) ? 'paye' : 'envoye';

    setTransactions(prev => prev.map(t => {
      if (t.id === focusReceipt.id) {
        return { ...t, advancePaid: amount, status: nextStatus };
      }
      return t;
    }));

    setFocusReceipt(prev => prev ? { ...prev, advancePaid: amount, status: nextStatus } : null);
    
    if (amount >= Math.round(ttcAmount)) {
      triggerToast(`Facture encaissée en totalité ! Statut mis à jour sur 'Encaissé'.`);
    } else {
      triggerToast(`Mise à jour de l'avance : ${amount.toLocaleString()} MAD. Reliquat recalculé automatiquement.`);
    }
  };

  const [copiedRib, setCopiedRib] = useState(false);
  const handleCopyRib = () => {
    navigator.clipboard.writeText('190780212115687449000681');
    setCopiedRib(true);
    setTimeout(() => setCopiedRib(false), 2000);
  };

  // Form states
  const [formCompany, setFormCompany] = useState('');
  const [formClient, setFormClient] = useState('');
  const [formSite, setFormSite] = useState<SiteId>(selectedSite === 'r2h' ? 'gardenexpo' : selectedSite);
  const [formType, setFormType] = useState<'devis' | 'facture'>('devis');
  const [formItems, setFormItems] = useState<{ description: string, quantity: number, unitPrice: number }[]>([
    { description: 'Réservation de Stand d\'exposition', quantity: 1, unitPrice: 24500 }
  ]);
  const [formNotes, setFormNotes] = useState('');
  const [formIncludeRegFee, setFormIncludeRegFee] = useState<boolean>(true);
  const [formIncludeTva, setFormIncludeTva] = useState<boolean>(false);

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
    const regFeeVal = formIncludeRegFee ? 2500 : 0;
    const totalRaw = formItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0) + regFeeVal;

    const docItems: TransactionItem[] = formItems.map((it, i) => ({
      id: `it_${Date.now()}_${i}`,
      description: it.description,
      quantity: Number(it.quantity),
      unitPrice: Number(it.unitPrice)
    }));

    if (formIncludeRegFee) {
      docItems.push({
        id: `it_reg_${Date.now()}`,
        description: "Frais d'enregistrement obligatoires",
        quantity: 1,
        unitPrice: 2500
      });
    }

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
      notes: formNotes,
      includeTva: formIncludeTva
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
    setFormIncludeRegFee(true);
    setFormIncludeTva(false);
  };

  // Switch status of invoice (e.g. mark as payed)
  const handleToggleDocStatus = (docId: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'paye' ? 'envoye' : 'paye';
    setTransactions(prev => prev.map(t => {
      if (t.id === docId) {
        const hasTva = t.includeTva !== false;
        const multiplier = hasTva ? 1.2 : 1.0;
        const ttcAmount = t.amount * multiplier;
        
        // Si marqué encaissé, l'avance payée devient égale au total TTC du document pour un reliquat de 0
        // Si marqué envoyé d'une facture entièrement réglée, l'avance est réinitialisée à 0
        let nextAdvance = t.advancePaid || 0;
        if (nextStatus === 'paye') {
          nextAdvance = Math.round(ttcAmount);
        } else if (nextStatus === 'envoye' && Math.round(t.advancePaid || 0) >= Math.round(ttcAmount)) {
          nextAdvance = 0;
        }

        return { ...t, status: nextStatus, advancePaid: nextAdvance };
      }
      return t;
    }));

    if (focusReceipt?.id === docId) {
      setFocusReceipt(prev => {
        if (!prev) return null;
        const hasTva = prev.includeTva !== false;
        const multiplier = hasTva ? 1.2 : 1.0;
        const ttcAmount = prev.amount * multiplier;

        let nextAdvance = prev.advancePaid || 0;
        if (nextStatus === 'paye') {
          nextAdvance = Math.round(ttcAmount);
        } else if (nextStatus === 'envoye' && Math.round(prev.advancePaid || 0) >= Math.round(ttcAmount)) {
          nextAdvance = 0;
        }

        return { ...prev, status: nextStatus, advancePaid: nextAdvance };
      });
    }
    
    triggerToast(nextStatus === 'paye' ? 
      "Transaction encaissée en totalité. Solde reliquat mis à 0 !" : 
      "Statut de la transaction actualisé. Reliquat réactivé."
    );
  };

  const handleDeleteDoc = (docId: string, docNum: string, docType: 'devis' | 'facture') => {
    setTransactions(prev => prev.filter(t => t.id !== docId));
    if (focusReceipt?.id === docId) {
      setFocusReceipt(null);
    }
    triggerToast(`${docType === 'devis' ? 'Devis' : 'Facture'} ${docNum} supprimé de la comptabilité.`);
  };

  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => {
      setToastMsg(null);
    }, 4000);
  };

  const printDocument = () => {
    if (focusReceipt) {
      downloadDocument(focusReceipt);
    } else {
      window.print();
    }
  };

  const downloadDocument = (receipt: Transaction) => {
    const totalHT = receipt.amount;
    const hasTva = receipt.includeTva !== false;
    const tva = hasTva ? totalHT * 0.2 : 0;
    const totalTTC = totalHT + tva;
    const siteLabel = receipt.site === 'africapool' ? 'Africa Pool & Spa Expo 2025' : receipt.site === 'gardenexpo' ? 'Garden Expo Africa 2025' : 'R2H Communication';
    
    // Create a hidden, isolated iframe for beautiful PDF vector rendering
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    iframe.style.zIndex = '-9999';
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document;
    if (!doc) {
      triggerToast("Erreur d'initialisation de l'assistant PDF.");
      return;
    }

    const itemsRows = receipt.items.map(item => `
      <tr style="border-bottom: 1px solid #e8e6de;">
        <td style="padding: 12px 14px; text-align: left; font-weight: 600; color: #2d2d2d; font-size: 11px;">${item.description}</td>
        <td style="padding: 12px 14px; text-align: center; color: #7a7667; font-family: 'JetBrains Mono', monospace; font-size: 10.5px; font-weight: bold;">${item.quantity}</td>
        <td style="padding: 12px 14px; text-align: right; color: #2d2d2d; font-family: 'JetBrains Mono', monospace; font-size: 10.5px; font-weight: bold; white-space: nowrap;">${item.unitPrice.toLocaleString('fr-FR')} MAD</td>
        <td style="padding: 12px 14px; text-align: right; color: #2d2d2d; font-family: 'JetBrains Mono', monospace; font-size: 11px; font-weight: 800; white-space: nowrap;">${(item.quantity * item.unitPrice).toLocaleString('fr-FR')} MAD</td>
      </tr>
    `).join('');

    const paidCheckWatermark = receipt.status === 'paye' ? `
      <div style="position: absolute; top: 40%; left: 50%; transform: translate(-50%, -50%) rotate(12deg); border: 4px dashed #7e8f7a; color: #7e8f7a; opacity: 0.16; font-size: 32px; font-weight: 900; letter-spacing: 0.18em; padding: 14px 28px; border-radius: 12px; z-index: 1; pointer-events: none; font-family: system-ui, sans-serif; text-align: center;">
        PAYÉ / ENCAISSÉ
      </div>
    ` : '';

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>${receipt.num || 'FACTURE'}_R2H</title>
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Playfair+Display:ital,wght@0,700;0,900;1,700&family=JetBrains+Mono:wght@400;500;700&display=swap" rel="stylesheet">
        <style>
          @page {
            size: A4 portrait;
            margin: 18mm 15mm;
          }
          body {
            font-family: "Inter", system-ui, -apple-system, sans-serif;
            color: #2d2d2d;
            background-color: #ffffff;
            margin: 0;
            padding: 0;
            line-height: 1.5;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .invoice-sheet {
            position: relative;
            max-width: 800px;
            margin: 0 auto;
            background: #ffffff;
          }
          .font-title {
            font-family: "Playfair Display", "Times New Roman", serif;
            letter-spacing: -0.01em;
          }
          .text-slate {
            color: #7a7667;
          }
        </style>
      </head>
      <body>
        <div class="invoice-sheet">
          ${paidCheckWatermark}
          
          <!-- Corporate Stationery Header -->
          <div style="display: flex; justify-content: space-between; align-items: flex-start; border-b: 1px solid #e8e6de; padding-bottom: 22px; margin-bottom: 24px;">
            <div>
              <div class="font-title" style="font-size: 20px; font-weight: 900; color: #2d2d2d; text-transform: uppercase; letter-spacing: 0.05em; line-height: 1.1;">R2H Communication</div>
              <div style="font-size: 11px; color: #7a7667; font-weight: 500; margin-top: 4px;">Agence Événementielle Globale • Marketing & Stands</div>
              <div style="font-size: 9.5px; color: #a4a090; font-family: 'JetBrains Mono', monospace; margin-top: 2px;">Rabat, Casablanca &bull; Royaume du Maroc</div>
            </div>
            
            <div style="text-align: right;">
              <div class="font-title" style="font-size: 14px; font-weight: 900; color: #a68a64; text-transform: uppercase; letter-spacing: 0.02em;">
                ${receipt.type === 'devis' ? 'DEVIS PROFORMA' : 'FACTURE DE VENTE'}
              </div>
              <div style="font-size: 12px; font-weight: 700; color: #2d2d2d; font-family: 'JetBrains Mono', monospace; margin-top: 4px;">N&deg; ${receipt.num}</div>
              <span style="display: inline-block; font-size: 9px; padding: 2px 7px; background-color: #fcfbf7; border: 1px solid #e8e6de; border-radius: 4px; color: #7a7667; text-transform: uppercase; font-weight: 700; margin-top: 6px; letter-spacing: 0.02em;">
                Salon : ${receipt.site === 'africapool' ? 'Africa Pool & Spa' : receipt.site === 'gardenexpo' ? 'Garden Expo Africa' : 'R2H Corporate'}
              </span>
            </div>
          </div>

          <!-- Customer and Issuer Addresses Grid -->
          <div style="display: grid; grid-template-columns: 1fr 1.05fr; gap: 30px; margin-bottom: 30px; font-size: 11px; line-height: 1.45;">
            <div>
              <span style="font-size: 8.5px; text-transform: uppercase; font-weight: 800; color: #a4a090; letter-spacing: 0.08em; display: block; margin-bottom: 5px;">Émetteur Officiel</span>
              <div style="font-weight: 700; color: #2d2d2d;">R2H Communication SARL a.u.b.m.</div>
              <div style="color: #7a7667; margin-top: 3px;">Résidence Valrose E – 2&ordm; étage, N&deg;8 Angle Place El Yasser, Casablanca – Maroc</div>
              <div style="color: #7a7667; margin-top: 3px; font-size: 9.5px;">Tél : +212 661 482 497 / +212 5 22 30 59 55</div>
              <div style="color: #7a7667; font-size: 9.5px;">E-mail : Contact@r2h.ma &bull; Web : www.r2h.ma</div>
              <div style="font-size: 9px; color: #a4a090; font-family: 'JetBrains Mono', monospace; margin-top: 6px; font-weight: 500;">ICE: 00234556111002 &bull; Patente: 3455829</div>
            </div>
            
            <div style="background-color: #fcfbf7; border: 1px solid #e8e6de; padding: 14px 18px; border-radius: 12px;">
              <span style="font-size: 8.5px; text-transform: uppercase; font-weight: 800; color: #a68a64; letter-spacing: 0.08em; display: block; margin-bottom: 5px;">Destinataire commercial</span>
              <div style="font-weight: 800; color: #2d2d2d; font-size: 12px;">${receipt.companyName}</div>
              <div style="color: #7a7667; margin-top: 3px; font-weight: 500;">Représentant désigné : <strong>${receipt.clientName}</strong></div>
              <div style="font-size: 9px; color: #7a7667; font-family: 'JetBrains Mono', monospace; margin-top: 8px;">Date d'édition : ${receipt.date}</div>
              <div style="font-size: 9px; color: #7a7667; font-family: 'JetBrains Mono', monospace;">Échéance limite : ${receipt.dueDate}</div>
            </div>
          </div>

          <!-- Prestation Detail Table -->
          <div style="border: 1px solid #e8e6de; border-radius: 12px; overflow: hidden; margin-bottom: 24px; box-shadow: 0 1px 2px rgba(0,0,0,0.01);">
            <table style="width: 100%; border-collapse: collapse; font-size: 11px;">
              <thead>
                <tr style="background-color: #fcfbf7; border-bottom: 1px solid #e8e6de; font-size: 8.5px; text-transform: uppercase; font-weight: 800; color: #7a7667; letter-spacing: 0.02em;">
                  <th style="padding: 10px 14px; text-align: left;">Désignation des prestations de stand</th>
                  <th style="padding: 10px 14px; text-align: center; width: 60px;">Qté</th>
                  <th style="padding: 10px 14px; text-align: right; width: 110px;">Prix Unit. HT</th>
                  <th style="padding: 10px 14px; text-align: right; width: 110px;">Montant HT</th>
                </tr>
              </thead>
              <tbody style="background-color: #ffffff;">
                ${itemsRows}
              </tbody>
            </table>
          </div>

          <!-- Financial Calculation and Bank Details Grid -->
          <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 30px; font-size: 11px;">
            <!-- Bank accounts details structured -->
            <div style="max-width: 280px; color: #7a7667; font-size: 9.5px; line-height: 1.4;">
              <span style="font-weight: 800; text-transform: uppercase; color: #a4a090; letter-spacing: 0.05em; display: block; margin-bottom: 4px; font-size: 8px;">Consignes de Règlement</span>
              <div>Règlement par chèque de banque barré ou par transfert de fonds direct aux coordonnées de l'agence régisseuse :</div>
              <div style="font-weight: bold; color: #2d2d2d; font-family: 'JetBrains Mono', monospace; margin-top: 6px; background-color: #fcfbf7; padding: 10px; border-radius: 8px; border: 1px solid #e8e6de; font-size: 8px; line-height: 1.45;">
                BANQUE POPULAIRE<br>
                RIB : <span style="letter-spacing: 0.05em; color: #a68a64;">190 780 2121156874490006 81</span><br>
                Code SWIFT : <span style="letter-spacing: 0.05em; color: #a68a64;">BCPOMAMC</span><br>
                Bénéficiaire : R2H COMMUNICATION
              </div>
            </div>

            <!-- Totals box identical to high end layouts -->
            <div style="width: 240px; border-top: 2px solid #a68a64; padding-top: 10px;">
              <div style="display: flex; justify-content: space-between; margin-bottom: 6px; font-size: 10px; color: #7a7667; font-weight: 500;">
                <span>SOUS-TOTAL HORS TAXES (HT) :</span>
                <span style="font-family: 'JetBrains Mono', monospace; font-weight: bold; color: #2d2d2d;">${totalHT.toLocaleString('fr-FR')} MAD</span>
              </div>
              <div style="display: flex; justify-content: space-between; margin-bottom: 6px; font-size: 10px; color: #7a7667; font-weight: 500;">
                <span>TVA EXIGIBLE (${hasTva ? '20.00%' : '0% - Exonérée'}) :</span>
                <span style="font-family: 'JetBrains Mono', monospace; font-weight: bold; color: #2d2d2d;">${tva.toLocaleString('fr-FR')} MAD</span>
              </div>
              <div style="display: flex; justify-content: space-between; padding-top: 8px; border-top: 1px solid #e8e6de; font-size: 12.5px; margin-top: 4px;">
                <span style="font-weight: 800; color: #2d2d2d; font-family: 'Playfair Display', serif;">NET À PAYER TTC :</span>
                <span style="font-family: 'JetBrains Mono', monospace; font-weight: 800; color: #a68a64; font-size: 13.5px;">${totalTTC.toLocaleString('fr-FR')} MAD</span>
              </div>
              ${receipt.advancePaid && receipt.advancePaid > 0 ? `
              <div style="display: flex; justify-content: space-between; margin-top: 6px; margin-bottom: 6px; font-size: 10px; color: #10b981; font-weight: 600;">
                <span>AVANCE REÇUE (TTC) :</span>
                <span style="font-family: 'JetBrains Mono', monospace; font-weight: bold;">-${receipt.advancePaid.toLocaleString('fr-FR')} MAD</span>
              </div>
              <div style="display: flex; justify-content: space-between; padding-top: 8px; border-top: 1px dashed #e8e6de; font-size: 12.5px; margin-top: 4px; color: #b45309;">
                <span style="font-weight: 800; font-family: 'Playfair Display', serif;">RESTE À PAYER :</span>
                <span style="font-family: 'JetBrains Mono', monospace; font-weight: 800; font-size: 13.5px;">${(totalTTC - receipt.advancePaid).toLocaleString('fr-FR')} MAD</span>
              </div>
              ` : ''}
            </div>
          </div>

          <!-- Notes section -->
          ${receipt.notes ? `
            <div style="border-top: 1px dashed #e8e6de; margin-top: 26px; padding-top: 12px; font-size: 9.5px; color: #7a7667;">
              <span style="font-weight: 800; text-transform: uppercase; color: #a68a64; display: block; margin-bottom: 3px; font-size: 8px; letter-spacing: 0.05em;">Mentions particulières & Conditions</span>
              <div style="font-style: italic; line-height: 1.45; color: #2d2d2d; font-weight: 500;">${receipt.notes}</div>
            </div>
          ` : ''}

          <!-- Page Stamp / Professional metadata footer -->
          <div style="margin-top: 45px; display: flex; justify-content: space-between; align-items: center; font-size: 9px; color: #a4a090; border-top: 1px solid #fcfbf7; padding-top: 12px; font-family: 'JetBrains Mono', monospace;">
            <div>Facture générée sécuritairement via R2H ERP</div>
            <div style="text-align: right; font-weight: bold; text-transform: uppercase; letter-spacing: 0.05em; color: #a68a64;">Cachet de l'Événement faisant foi</div>
          </div>
        </div>

        <script>
          window.onload = function() {
            // Slight delay to ensure content layout is fully computed
            setTimeout(function() {
              window.print();
              setTimeout(function() {
                window.frameElement.parentNode.removeChild(window.frameElement);
              }, 500);
            }, 300);
          }
        </script>
      </body>
      </html>
    `;

    doc.open();
    doc.write(htmlContent);
    doc.close();

    triggerToast("Ouverture de l'assistant d'impression vectorielle PDF - R2H...");
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
                    <th className="px-5 py-3 text-right">Actions</th>
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
                        <td className="px-5 py-3">
                          {(() => {
                            const transHasTva = trans.includeTva !== false;
                            const transTtc = transHasTva ? trans.amount * 1.2 : trans.amount;
                            return (
                              <>
                                <span className="font-mono font-medium text-slate-800">{transTtc.toLocaleString()} MAD</span>
                                {trans.advancePaid && trans.advancePaid > 0 && trans.type === 'facture' ? (
                                  <div className="mt-1 flex flex-col gap-0.5 select-none">
                                    <span className="text-[9px] bg-emerald-50/85 text-emerald-700 px-1.5 py-0.5 rounded-md font-semibold font-sans w-fit">
                                      Avance : -{trans.advancePaid.toLocaleString()} MAD
                                    </span>
                                    <span className="text-[9px] bg-amber-50/85 text-amber-700 px-1.5 py-0.5 rounded-md font-bold font-sans w-fit">
                                      Reste : {(transTtc - trans.advancePaid).toLocaleString()} MAD
                                    </span>
                                  </div>
                                ) : null}
                              </>
                            );
                          })()}
                        </td>
                        <td className="px-5 py-3">
                          <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded-full text-slate-500 font-medium font-sans">
                            {trans.site === 'africapool' ? 'Africa Pool' : trans.site === 'gardenexpo' ? 'Garden Expo' : 'R2H Com'}
                          </span>
                        </td>
                        <td className="px-5 py-3">
                          <span className={`text-[9px] px-2 py-0.5 rounded-full font-semibold ${
                            trans.status === 'paye' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 
                            (trans.advancePaid && trans.advancePaid > 0 && trans.type === 'facture') ? 'bg-indigo-50 text-indigo-700 border border-indigo-100 font-bold' :
                            'bg-amber-50 text-amber-600 border border-amber-100'
                          }`}>
                            {trans.status === 'paye' ? 'Encaissé' : 
                             (trans.advancePaid && trans.advancePaid > 0 && trans.type === 'facture') ? 'Avance perçue' : 
                             'Envoyé'}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                          <button
                            type="button"
                            onClick={() => handleDeleteDoc(trans.id, trans.num, trans.type)}
                            className="p-1 px-1.5 hover:bg-rose-50 hover:text-rose-700 text-rose-500 rounded-lg transition-all cursor-pointer border border-transparent hover:border-rose-100"
                            title={`Supprimer ce ${trans.type === 'devis' ? 'devis' : 'factures'}`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-400">
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
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Appliquer la TVA (20%) ?</label>
                    <div className="flex gap-1.5">
                      <button
                        type="button"
                        onClick={() => setFormIncludeTva(true)}
                        className={`flex-1 py-1 px-2 rounded-lg text-xs font-semibold border transition cursor-pointer text-center ${
                          formIncludeTva 
                            ? 'bg-blue-600 text-white border-blue-600 shadow-2xs' 
                            : 'bg-white text-[#7A7667] border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        ✅ Oui
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormIncludeTva(false)}
                        className={`flex-1 py-1 px-2 rounded-lg text-xs font-semibold border transition cursor-pointer text-center ${
                          !formIncludeTva 
                            ? 'bg-rose-700 text-white border-rose-700 shadow-2xs font-bold' 
                            : 'bg-white text-[#7A7667] border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        ❌ Non
                      </button>
                    </div>
                  </div>
                </div>

                {/* Registration Fee Select Buttons */}
                <div className="bg-[#FAF9F6] border border-[#E8E6DE]/80 rounded-xl p-3 my-1 space-y-1.5">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Inclure les Frais d'enregistrement ? (2500 MAD HT)</span>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setFormIncludeRegFee(true)}
                      className={`flex-1 py-2 rounded-lg text-xs font-semibold border transition cursor-pointer ${
                        formIncludeRegFee 
                          ? 'bg-blue-600 text-white border-blue-600 shadow-2xs' 
                          : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      ✅ OUI (+2,500 DH HT)
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormIncludeRegFee(false)}
                      className={`flex-1 py-2 rounded-lg text-xs font-semibold border transition cursor-pointer ${
                        !formIncludeRegFee 
                          ? 'bg-slate-800 text-white border-slate-800 shadow-2xs' 
                          : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      ❌ NON (Sans frais)
                    </button>
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
                    <button
                      onClick={() => downloadDocument(focusReceipt)}
                      className="p-1 px-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[10px] font-semibold flex items-center gap-1 cursor-pointer transition"
                    >
                      <Download className="w-3 h-3" />
                      <span>Télécharger</span>
                    </button>
                    <button
                      onClick={() => handleDeleteDoc(focusReceipt.id, focusReceipt.num, focusReceipt.type)}
                      className="p-1 px-2.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg text-[10px] font-semibold flex items-center gap-1 cursor-pointer transition border border-rose-200"
                      title="Supprimer ce document de la comptabilité"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Supprimer</span>
                    </button>
                  </div>
                )}
              </div>

              {focusReceipt ? (
                <>
                {/* Corporate printable page mockup frame rendering */}
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
                      <p className="text-slate-500 font-medium mt-0.5 leading-normal">
                        Résidence Valrose E – 2ᵉ étage, N°8 Angle Place El Yasser, Casablanca – Maroc
                      </p>
                      <p className="text-slate-400 text-[10px] mt-1 leading-normal font-medium">
                        Tél : +212 661 482 497 / +212 5 22 30 59 55<br />
                        Email : Contact@r2h.ma • Web : www.r2h.ma
                      </p>
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
                      <p className="font-bold text-slate-600 font-mono mt-1.5 select-all text-[8px] leading-tight">
                        BANQUE POPULAIRE<br />
                        RIB: 190 780 2121156874490006 81<br />
                        SWIFT: BCPOMAMC<br />
                        Bénéficiaire: R2H COMMUNICATION
                      </p>
                    </div>

                    {/* HT + VAT 20% + TTC summary block */}
                    {(() => {
                      const hasTva = focusReceipt.includeTva !== false;
                      const tvaAmount = hasTva ? focusReceipt.amount * 0.2 : 0;
                      const ttcAmount = hasTva ? focusReceipt.amount * 1.2 : focusReceipt.amount;
                      return (
                        <div className="w-full sm:max-w-[200px] border-t-2 border-slate-200 pt-2.5">
                          <div className="space-y-1 text-right font-sans text-[10px]">
                            <div className="flex justify-between">
                              <span className="text-slate-400 font-medium font-sans">TOTAL HT :</span>
                              <span className="font-mono font-medium text-slate-800">{focusReceipt.amount.toLocaleString()} MAD</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-400 font-medium font-sans">TVA ({hasTva ? '20.00%' : '0% (Exonérée)'}) :</span>
                              <span className="font-mono font-medium text-slate-800">{tvaAmount.toLocaleString()} MAD</span>
                            </div>
                            <div className="flex justify-between border-t border-slate-100 pt-1 text-xs select-none">
                              <span className="font-bold text-slate-900">NET À PAYER TTC:</span>
                              <span className="font-mono font-bold text-blue-600">{ttcAmount.toLocaleString()} MAD</span>
                            </div>
                            {focusReceipt.advancePaid && focusReceipt.advancePaid > 0 ? (
                              <>
                                <div className="flex justify-between text-emerald-600 font-semibold font-sans mt-1">
                                  <span>AVANCE REÇUE :</span>
                                  <span className="font-mono">-{focusReceipt.advancePaid.toLocaleString()} MAD</span>
                                </div>
                                <div className="flex justify-between border-t border-dashed border-slate-200 pt-1 text-xs font-bold text-amber-700">
                                  <span>RESTE À PAYER :</span>
                                  <span className="font-mono">{(ttcAmount - focusReceipt.advancePaid).toLocaleString()} MAD</span>
                                </div>
                              </>
                            ) : null}
                          </div>
                        </div>
                      );
                    })()}
                  </div>

                  {/* Bottom administrative footer conditions */}
                  {focusReceipt.notes && (
                    <div className="border-t border-slate-100 mt-5 pt-3 text-[9px] text-slate-400">
                      <span className="font-bold block uppercase mb-0.5">Clauses particulières</span>
                      <p className="font-medium italic leading-relaxed">{focusReceipt.notes}</p>
                    </div>
                  )}

                </div>

                {/* Advance payment management panel (only for Invoices/Factures and confirmed exhibitors) */}
                {focusReceipt.type === 'facture' && (
                  <div className="mt-4 p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-4 print:hidden text-xs">
                    <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
                      <span className="text-base select-none">💳</span>
                      <div>
                        <h4 className="font-bold text-slate-800 text-[11px] uppercase tracking-wider">Gestion de l'Avance / Acompte Exposant</h4>
                        <p className="text-[10px] text-slate-500 font-medium">Configurez l'avance perçue pour cet exposant d'exposition.</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {(() => {
                        const hasTva = focusReceipt.includeTva !== false;
                        const multiplier = hasTva ? 1.2 : 1.0;
                        return (
                          <>
                            <div className="space-y-1">
                              <label className="text-[10px] font-bold text-slate-500 uppercase">Montant de l'avance (MAD)</label>
                              <div className="relative">
                                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 font-mono font-bold text-[10px]">MAD</span>
                                <input
                                  type="number"
                                  min="0"
                                  max={Math.round(focusReceipt.amount * multiplier)}
                                  value={advanceInput}
                                  onChange={(e) => setAdvanceInput(e.target.value)}
                                  placeholder="0.00"
                                  className="w-full pl-12 pr-2.5 py-2 bg-white border border-slate-200 rounded-xl outline-hidden text-slate-800 font-mono font-bold text-xs"
                                />
                              </div>
                            </div>

                            <div className="space-y-1">
                              <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Raccourcis d'acompte</label>
                              <div className="grid grid-cols-2 gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => {
                                    const val = Math.round((focusReceipt.amount * multiplier) * 0.3);
                                    setAdvanceInput(String(val));
                                  }}
                                  className="px-2 py-1.5 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold rounded-lg text-center cursor-pointer text-[10px] transition-colors"
                                >
                                  30% (Acompte)
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    const val = Math.round((focusReceipt.amount * multiplier) * 0.5);
                                    setAdvanceInput(String(val));
                                  }}
                                  className="px-2 py-1.5 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold rounded-lg text-center cursor-pointer text-[10px] transition-colors"
                                >
                                  50% (Acompte)
                                </button>
                              </div>
                            </div>
                          </>
                        );
                      })()}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase font-sans">Mode de versement de l'avance</label>
                        <select
                          defaultValue="virement"
                          className="w-full p-2 bg-white border border-slate-200 rounded-xl outline-hidden text-slate-700 text-[11px]"
                        >
                          <option value="virement">🏦 Virement Bancaire (BP)</option>
                          <option value="cheque">✍️ Chèque de Banque</option>
                          <option value="especes">💵 Versement Espèces</option>
                          <option value="autre">⚙️ Autre mode</option>
                        </select>
                      </div>

                      <div className="flex flex-col justify-end">
                        <button
                          type="button"
                          onClick={() => {
                            const amount = parseFloat(advanceInput) || 0;
                            handleUpdateAdvance(amount);
                          }}
                          className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-center cursor-pointer transition-all shadow-2xs hover:shadow-xs text-[11px]"
                        >
                          Enregistrer l'Avance
                        </button>
                      </div>
                    </div>

                    {/* Display calculations indicators */}
                    {(() => {
                      const hasTva = focusReceipt.includeTva !== false;
                      const multiplier = hasTva ? 1.2 : 1.0;
                      const amtTTC = focusReceipt.amount * multiplier;
                      const advVal = parseFloat(advanceInput) || 0;
                      const restVal = Math.max(0, amtTTC - advVal);
                      return (
                        <div className="bg-white p-3 rounded-xl border border-slate-200 flex justify-between items-center text-[10.5px]">
                          <div>
                            <span className="text-slate-400 font-medium block">Total Facture TTC</span>
                            <span className="font-mono font-bold text-slate-800">{amtTTC.toLocaleString()} MAD</span>
                          </div>
                          <div className="border-l border-slate-200 h-8"></div>
                          <div>
                            <span className="text-slate-400 font-medium block">Avance Saisie</span>
                            <span className="font-mono font-bold text-emerald-600">-{advVal.toLocaleString()} MAD</span>
                          </div>
                          <div className="border-l border-slate-200 h-8"></div>
                          <div>
                            <span className="text-[#a68a64] font-bold block">Reste à payer TTC</span>
                            <span className="font-mono font-black text-amber-700">{restVal.toLocaleString()} MAD</span>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                )}
                </>
              ) : (
                <div className="py-8 px-4 flex flex-col items-center justify-center gap-6 font-sans text-xs">
                  <div className="text-center text-slate-400 flex flex-col items-center justify-center gap-2">
                    <AlertCircle className="w-8 h-8 text-slate-300" />
                    <span>Sélectionnez un devis ou une facture pour charger l'aperçu d'impression de l'agence.</span>
                  </div>

                  {/* RIB R2H Communication Interactive Information Card */}
                  <div className="w-full max-w-sm mt-4 bg-gradient-to-br from-[#FCFBF8] to-[#F5F3EB] border border-[#E8E6DE] rounded-xl p-4 shadow-2xs relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full -mr-8 -mt-8 pointer-events-none blur-xl"></div>
                    
                    <div className="flex items-center gap-2.5 mb-3">
                      <div className="bg-amber-100 text-amber-800 p-1.5 rounded-lg">
                        <CreditCard className="w-4 h-4 text-amber-700" />
                      </div>
                      <div>
                        <h4 className="font-serif font-black text-[#2D2D2D] text-xs leading-none">R2H COMMUNICATION</h4>
                        <p className="text-[9px] text-[#7A7667] mt-0.5">Relevé d'Identité Bancaire (RIB) Officiel</p>
                      </div>
                    </div>

                    <div className="space-y-2 text-left font-sans text-[11px] text-slate-600 bg-white/70 p-3 rounded-lg border border-[#E8E6DE]/40">
                      <div className="flex justify-between items-center pb-1.5 border-b border-[#E8E6DE]/30">
                        <span className="text-[10px] text-slate-400 font-medium">Établissement</span>
                        <span className="font-bold text-[#2D2D2D]">BANQUE POPULAIRE</span>
                      </div>
                      <div className="flex justify-between items-center pb-1.5 border-b border-[#E8E6DE]/30">
                        <span className="text-[10px] text-slate-400 font-medium">Agence</span>
                        <span className="font-semibold text-slate-700">IBNOU NAFIS (Casablanca)</span>
                      </div>
                      
                      <div className="pt-1 flex flex-col gap-1">
                        <span className="text-[10px] text-slate-400 font-medium">Code RIB (24 chiffres)</span>
                        <div className="flex items-center justify-between bg-[#F8F7F2] px-2.5 py-1.5 rounded-md border border-[#E8E6DE] group">
                          <code className="text-[11px] font-mono font-black text-[#2D2D2D] select-all tracking-wider">
                            190 780 2121156874490006 81
                          </code>
                          <button
                            onClick={handleCopyRib}
                            className="text-slate-400 hover:text-blue-600 p-1 hover:bg-white rounded transition-colors cursor-pointer"
                            title="Copier le RIB"
                          >
                            {copiedRib ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </div>

                      <div className="flex justify-between items-center pt-1.5 text-[10px]">
                        <span className="text-slate-400 font-medium">Code SWIFT (BIC)</span>
                        <span className="font-mono font-bold text-slate-800 bg-slate-100 px-1.5 py-0.5 rounded text-[9.5px]">BCPOMAMC</span>
                      </div>
                    </div>

                    {copiedRib && (
                      <div className="mt-2 text-center text-[10px] text-emerald-600 font-medium animate-pulse">
                        RIB copié dans le presse-papiers avec succès !
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
