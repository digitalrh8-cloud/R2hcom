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
  role: 'prospect' | 'client' | 'fournisseur' | 'partner';
  dateAdded: string;
  notes?: string;
  standNumber?: string;
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
