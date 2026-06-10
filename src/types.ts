/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type SiteId = string;

export interface SiteConfig {
  id: SiteId;
  name: string;
  domain: string;
  color: string;
  secondaryColor: string;
  bgGradient: string;
  description: string;
  logoText: string;
}

export interface Contact {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  site: SiteId;
  role: 'prospect' | 'client' | 'fournisseur' | 'partner' | 'partner_media';
  dateAdded: string;
  notes?: string;
  standNumber?: string;
  prospectStatus?: 'interesse' | 'pas_interesse' | 'a_rappeler' | 'relance' | 'demande_devis';
  standType?: 'surface_nue' | 'equipe' | 'personalise' | 'exceptionnel';
  exceptionalPrice?: number;
  standArea?: number;
  includeRegistrationFee?: boolean;
  registrationFeeAmount?: number;
  includeTva?: boolean;
  fournisseurInvoicePhoto?: string;
  fournisseurAdvancePaid?: 'yes' | 'no';
  fournisseurInvoiceReceived?: 'yes' | 'no';
  fournisseurPaymentStatus?: 'paye' | 'non_paye';
  fournisseurCategory?: string;
  fournisseurStatus?: 'actif' | 'inactif';
  fournisseurType?: 'fournisseur' | 'prestataire';
  fournisseurLogo?: string;
  fournisseurInvoices?: { id: string; label: string; amount: number; date: string; fileUrl: string; status: 'paye' | 'non_paye' }[];
}

export type StandStatus = 'disponible' | 'reserve' | 'vendu' | 'sponsorise';

export interface Stand {
  id: string; // e.g., 'A01', 'A02'
  site: SiteId;
  num: string;
  hall: string; // e.g., 'Hall A', 'Hall B'
  area: number; // in m²
  pricePerM2: number; // in MAD
  status: StandStatus;
  clientName?: string;
  companyName?: string;
  category?: string;
  notes?: string;
  standType?: 'surface_nue' | 'equipe' | 'personalise';
  exceptionalPrice?: number;
}

export interface TransactionItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
}

export interface Transaction {
  id: string;
  num: string; // e.g., 'DEV-2024-156', 'FA-2024-089'
  clientName: string;
  companyName: string;
  site: SiteId;
  type: 'devis' | 'facture';
  amount: number;
  status: 'envoye' | 'negociation' | 'paye' | 'en_retard';
  date: string;
  dueDate: string;
  items: TransactionItem[];
  notes?: string;
  advancePaid?: number;
  includeTva?: boolean;
}

export interface Campaign {
  id: string;
  name: string;
  site: SiteId;
  sentCount: number;
  opens: number;
  clicks: number;
  status: 'brouillon' | 'planifie' | 'envoye';
  date: string;
  subject: string;
  content: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  site: SiteId;
  dueDate: string;
  priority: 'basse' | 'moyenne' | 'haute';
  status: 'a_faire' | 'en_cours' | 'termine';
}

export interface UserPermissions {
  canViewDashboard: boolean;
  canManageLeads: boolean; // Access to CrmView (leads/prospects/clients)
  canViewDevis: boolean; // Access to Devis tab
  canViewFactures: boolean; // Access to Factures/Invoices tab
  canViewMarketing: boolean; // Access to AI Marketing
  canManageStands: boolean; // Access to floor plan and stand reservation
  canViewSettings: boolean; // Access to general system configuration & user management
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: 'admin' | 'commercial' | 'supervisor' | 'financial';
  title: string;
  avatarUrl: string;
  permissions: UserPermissions;
}

