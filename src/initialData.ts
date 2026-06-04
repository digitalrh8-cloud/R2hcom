/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { SiteConfig, Contact, Stand, Transaction, Campaign, Task } from './types';

export const initialSites: SiteConfig[] = [
  {
    id: 'r2h',
    name: 'R2H Communication',
    domain: 'r2h.ma',
    color: '#3B82F6', // Blue
    secondaryColor: '#1d4ed8',
    bgGradient: 'from-blue-600 to-indigo-700',
    description: 'Agence de communication événementielle & créateur de salons professionnels en Afrique.',
    logoText: 'R2H'
  },
  {
    id: 'africapool',
    name: 'Africa Pool & Spa Expo',
    domain: 'africapoolspa.com',
    color: '#06B6D4', // Cyan
    secondaryColor: '#0891b2',
    bgGradient: 'from-cyan-500 to-teal-600',
    description: 'Le salon international de référence pour les professionnels de la piscine, du spa et de l\'aménagement extérieur.',
    logoText: 'AFRICA POOL'
  },
  {
    id: 'gardenexpo',
    name: 'Garden Expo Africa',
    domain: 'gardenexpo.ma',
    color: '#10B981', // Emerald
    secondaryColor: '#047857',
    bgGradient: 'from-emerald-600 to-green-700',
    description: 'Le rendez-vous incontournable pour le jardinage, le paysage, la pépinière, le mobilier de jardin et l\'espace vert.',
    logoText: 'GARDEN EXPO'
  }
];

export const initialContacts: Contact[] = [
  {
    id: 'c1',
    name: 'Youssef El Amrani',
    email: 'youssef@greentech.ma',
    phone: '+212 661 234 567',
    company: 'GreenTech Solutions',
    site: 'gardenexpo',
    role: 'client',
    dateAdded: '2024-01-15',
    notes: 'Exposant majeur du salon Garden Expo, spécialisé en solutions d\'irrigation intelligentes.',
    standNumber: 'A17'
  },
  {
    id: 'c2',
    name: 'Khadija Bennani',
    email: 'khadija@aquapools.ma',
    phone: '+212 662 987 654',
    company: 'AquaPools Maroc',
    site: 'africapool',
    role: 'client',
    dateAdded: '2024-02-10',
    notes: 'Fabricant de structures de piscines en composite. Intéressé par un grand stand double face.',
    standNumber: 'E-4A'
  },
  {
    id: 'c3',
    name: 'Karim Slaoui',
    email: 'karim@naturepaysage.ma',
    phone: '+212 663 111 222',
    company: 'Nature & Paysage',
    site: 'gardenexpo',
    role: 'client',
    dateAdded: '2024-01-20',
    notes: 'Paysagiste réputé à Rabat. Veut un espace extérieur de pépinière.',
    standNumber: 'A23'
  },
  {
    id: 'c4',
    name: 'Chen Wei',
    email: 'c.wei@chinawatertech.com',
    phone: '+86 138 5555 6666',
    company: 'China Water Tech',
    site: 'africapool',
    role: 'client',
    dateAdded: '2024-03-05',
    notes: 'Fournisseur d\'équipements de filtration d\'eau de piscine. Coordonne son déplacement depuis Guangzhou.'
  },
  {
    id: 'c5',
    name: 'Amine Guessous',
    email: 'amine@decojardin.ma',
    phone: '+212 664 444 555',
    company: 'Deco Jardin',
    site: 'gardenexpo',
    role: 'client',
    dateAdded: '2024-01-18',
    notes: 'Mobilier de jardin premium en teck et résine tressée.',
    standNumber: 'A18'
  },
  {
    id: 'c6',
    name: 'Mehdi Naciri',
    email: 'mehdi@atlaspaysage.ma',
    phone: '+212 660 777 888',
    company: 'Atlas Paysage',
    site: 'gardenexpo',
    role: 'prospect',
    dateAdded: '2024-04-12',
    notes: 'Prospect chaud. A visité l\'édition précédente, hésite encore pour l\'emplacement.',
    standNumber: 'A04'
  },
  {
    id: 'c7',
    name: 'Sarah Touzani',
    email: 's.touzani@smartwatering.ma',
    phone: '+212 665 222 333',
    company: 'Smart Irrigation',
    site: 'gardenexpo',
    role: 'client',
    dateAdded: '2024-02-28',
    notes: 'Exposant spécialisé dans le goutte-à-goutte connecté.',
    standNumber: 'A24'
  },
  {
    id: 'c8',
    name: 'Olivier Laurent',
    email: 'laurent@batimatex.fr',
    phone: '+33 6 12 34 56 78',
    company: 'BatiMat SARL',
    site: 'r2h',
    role: 'fournisseur',
    dateAdded: '2023-11-20',
    notes: 'Prestataire de structures métalliques auto-portées pour chapiteaux extérieurs.'
  },
  {
    id: 'c-ap-1',
    name: 'Kamal Sghiouar',
    email: 'kamal@astralpool.ma',
    phone: '+212 661 888 221',
    company: 'AstralPool Maroc',
    site: 'africapool',
    role: 'client',
    dateAdded: '2024-03-10',
    notes: 'Exposant de référence (Stand A-3F), équipementier piscine mondial.',
    standNumber: 'A-3F'
  },
  {
    id: 'c-ap-2',
    name: 'Fouad Laroui',
    email: 'fouad@bwt.ma',
    phone: '+212 662 445 771',
    company: 'BWT-Barco',
    site: 'africapool',
    role: 'client',
    dateAdded: '2024-03-12',
    notes: 'Leader du traitement de l’eau (Stand D-6C).',
    standNumber: 'D-6C'
  },
  {
    id: 'c-ap-3',
    name: 'Adil Bennis',
    email: 'bennis@lgthermique.ma',
    phone: '+212 663 555 888',
    company: 'O/D L.G THERMIQUE',
    site: 'africapool',
    role: 'prospect',
    dateAdded: '2024-05-02',
    notes: 'Dossier d’option de réservation pour le stand D-5B (Génie climatique).',
    standNumber: 'D-5B'
  },
  {
    id: 'c-ap-4',
    name: 'Yassir Ghamri',
    email: 'ghamri@alteza.com',
    phone: '+212 660 112 233',
    company: 'ALTEZA',
    site: 'africapool',
    role: 'client',
    dateAdded: '2024-01-20',
    notes: 'Spécialiste pergolas bioccimatiques et pool houses (Stand E-5A).',
    standNumber: 'E-5A'
  },
  {
    id: 'c-ap-5',
    name: 'Driss Tazi',
    email: 'driss@topromaroc.com',
    phone: '+212 664 778 899',
    company: 'Topromaroc',
    site: 'africapool',
    role: 'client',
    dateAdded: '2024-02-15',
    notes: 'Équipements et barrières de sécurité de piscine (Stand F-5A).',
    standNumber: 'F-5A'
  },
  {
    id: 'c-ap-6',
    name: 'Hassan Filali',
    email: 'filali@fluidramatic.ma',
    phone: '+212 665 999 111',
    company: 'Fluidra Maroc',
    site: 'africapool',
    role: 'client',
    dateAdded: '2024-02-11',
    notes: 'Fournisseur majeur de filtration et pompes (Stand G-5A).',
    standNumber: 'G-5A'
  },
  {
    id: 'c-ap-7',
    name: 'Amine El Alami',
    email: 'commercial@cci-maroc.com',
    phone: '+212 522 344 556',
    company: 'CCI',
    site: 'africapool',
    role: 'client',
    dateAdded: '2024-03-01',
    notes: 'Climatisation et chauffage de grands bassins de natation (Stand D-4A).',
    standNumber: 'D-4A'
  },
  {
    id: 'c-ap-8',
    name: 'Sami Naciri',
    email: 'sami@lgthermique.ma',
    phone: '+212 661 445 992',
    company: 'L.G. THERMIQUE',
    site: 'africapool',
    role: 'client',
    dateAdded: '2024-03-04',
    notes: 'Pompes à chaleur connectées d\'extérieur (Stand D-4C).',
    standNumber: 'D-4C'
  },
  {
    id: 'c-ap-10',
    name: 'Mehdi Naciri',
    email: 'mehdi@atlantapompes.ma',
    phone: '+212 660 334 455',
    company: 'ATLANTA POMPES',
    site: 'africapool',
    role: 'client',
    dateAdded: '2024-02-28',
    notes: 'Pompes de circulation et moteurs de filtration (Stand F-4A).',
    standNumber: 'F-4A'
  },
  {
    id: 'c-ap-11',
    name: 'Karim Slaoui',
    email: 'karim@paledo.ma',
    phone: '+212 663 111 222',
    company: 'PALEDO',
    site: 'africapool',
    role: 'client',
    dateAdded: '2024-01-20',
    notes: 'Constructeur de piscines écologiques et bassins préfabriqués (Stand B-3A).',
    standNumber: 'B-3A'
  },
  {
    id: 'c-ap-12',
    name: 'Said Bennani',
    email: 'said@poolspa.ma',
    phone: '+212 664 321 098',
    company: 'POOLSPA',
    site: 'africapool',
    role: 'client',
    dateAdded: '2024-01-25',
    notes: 'Équipementier bien-être, spas et balnéothérapie (Stand B-3B).',
    standNumber: 'B-3B'
  },
  {
    id: 'c-ap-13',
    name: 'Nabil Chraibi',
    email: 'nabil@chraibi-holding.ma',
    phone: '+212 661 112 233',
    company: 'Option Stand C-4A',
    site: 'africapool',
    role: 'prospect',
    dateAdded: '2024-05-10',
    notes: 'Option posée pour le stand C-4A (spa résidentiel).',
    standNumber: 'C-4A'
  },
  {
    id: 'c-ap-14',
    name: 'Mehdi Rahho',
    email: 'rahho@gamis-bienetre.ma',
    phone: '+212 662 555 666',
    company: 'Gamis',
    site: 'africapool',
    role: 'prospect',
    dateAdded: '2024-05-12',
    notes: 'Option temporaire sur l’îlot central D-3A (Traitement de l’eau).',
    standNumber: 'D-3A'
  },
  {
    id: 'c-ap-15',
    name: 'Yassine Alami',
    email: 'yassine@versosignature.ma',
    phone: '+212 661 990 011',
    company: 'VERSO SIGNATURE',
    site: 'africapool',
    role: 'client',
    dateAdded: '2024-02-18',
    notes: 'Architecte d’extérieur prestige (Stand E-3A).',
    standNumber: 'E-3A'
  },
  {
    id: 'c-ap-16',
    name: 'Anas Ouazzani',
    email: 'anas@watertech.ma',
    phone: '+212 663 888 777',
    company: 'Water Tech',
    site: 'africapool',
    role: 'client',
    dateAdded: '2024-02-05',
    notes: 'Accessoires de filtration et douches d’extérieur (Stand E-3B).',
    standNumber: 'E-3B'
  },
  {
    id: 'c-ap-17',
    name: 'Samira Belkadi',
    email: 's.belkadi@zenpiscine.ma',
    phone: '+212 660 771 122',
    company: 'Zen Piscine',
    site: 'africapool',
    role: 'client',
    dateAdded: '2024-02-26',
    notes: 'Aménagement de bords de bassins, bois composite, transats (Stand F-3A).',
    standNumber: 'F-3A'
  },
  {
    id: 'c-ap-18',
    name: 'Omar Benjelloun',
    email: 'omar@azul-izmawn.ma',
    phone: '+212 665 444 333',
    company: 'AZUL IZMAWN',
    site: 'africapool',
    role: 'client',
    dateAdded: '2024-03-02',
    notes: 'Importateur d’émaux et pierres naturelles de Bali pour piscines (Stand F-3B).',
    standNumber: 'F-3B'
  },
  {
    id: 'c-ap-19',
    name: 'Youssef El Amrani',
    email: 'youssef@frio-equipement.ma',
    phone: '+212 661 234 567',
    company: 'Frio Equipement',
    site: 'africapool',
    role: 'client',
    dateAdded: '2024-01-15',
    notes: 'Froid industriel et spas de massage (Stand D-2A).',
    standNumber: 'D-2A'
  },
  {
    id: 'c-ap-20',
    name: 'Rachid Alami',
    email: 'rachid@aireausolution.ma',
    phone: '+212 664 555 111',
    company: 'AIR EAU SOLUTION',
    site: 'africapool',
    role: 'client',
    dateAdded: '2024-02-20',
    notes: 'Solutions hydrauliques et pompes immergées (Stand C-1A).',
    standNumber: 'C-1A'
  },
  {
    id: 'c-ap-21',
    name: 'Idriss Filali',
    email: 'filali@wellnessgroup.ma',
    phone: '+212 665 112 288',
    company: 'Option Wellness Group',
    site: 'africapool',
    role: 'prospect',
    dateAdded: '2024-05-14',
    notes: 'Option d’emplacement réservé WG sur le stand D-1A.',
    standNumber: 'D-1A'
  },
  {
    id: 'c-ap-22',
    name: 'Sarah Touzani',
    email: 's.touzani@massor.ma',
    phone: '+212 665 222 333',
    company: 'MASSOR',
    site: 'africapool',
    role: 'client',
    dateAdded: '2024-02-28',
    notes: 'Piscines naturelles écologiques, revêtements de prestige (Stand E-1A).',
    standNumber: 'E-1A'
  },
  {
    id: 'c-ap-23',
    name: 'Amine Guessous',
    email: 'amine@aafm.ma',
    phone: '+212 664 444 555',
    company: 'AAFM',
    site: 'africapool',
    role: 'client',
    dateAdded: '2024-01-18',
    notes: 'Stand institutionnel de l\'Association Piscine (Stand F-1A).',
    standNumber: 'F-1A'
  },
  {
    id: 'c-ap-24',
    name: 'Karim Slaoui',
    email: 'karim@upek.ma',
    phone: '+212 663 111 222',
    company: 'UPEK',
    site: 'africapool',
    role: 'client',
    dateAdded: '2024-01-20',
    notes: 'Distribution de margelles, pierres de parement (Stand F-1B).',
    standNumber: 'F-1B'
  }
];

export const initialStands: Stand[] = [
  // --- GARDEN EXPO AFRICA 2025 ---
  { id: 'g-A01', site: 'gardenexpo', num: 'A01', hall: 'Hall A', area: 18, pricePerM2: 2500, status: 'disponible' },
  { id: 'g-A02', site: 'gardenexpo', num: 'A02', hall: 'Hall A', area: 18, pricePerM2: 2500, status: 'disponible' },
  { id: 'g-A03', site: 'gardenexpo', num: 'A03', hall: 'Hall A', area: 18, pricePerM2: 2500, status: 'disponible' },
  { id: 'g-A04', site: 'gardenexpo', num: 'A04', hall: 'Hall A', area: 18, pricePerM2: 2500, status: 'vendu', companyName: 'Atlas Paysage', clientName: 'Mehdi Naciri', category: 'Pépinière et Plantes' },
  { id: 'g-A05', site: 'gardenexpo', num: 'A05', hall: 'Hall A', area: 18, pricePerM2: 2500, status: 'vendu', companyName: 'Garden Design Maroc', clientName: 'Rachid Alami', category: 'Aménagement' },
  { id: 'g-A06', site: 'gardenexpo', num: 'A06', hall: 'Hall A', area: 18, pricePerM2: 2500, status: 'vendu', companyName: 'Poteries de Safi', clientName: 'Imane Slaoui', category: 'Décoration extérieure' },
  { id: 'g-A07', site: 'gardenexpo', num: 'A07', hall: 'Hall A', area: 18, pricePerM2: 2500, status: 'disponible' },
  { id: 'g-A08', site: 'gardenexpo', num: 'A08', hall: 'Hall A', area: 18, pricePerM2: 2500, status: 'disponible' },
  { id: 'g-A09', site: 'gardenexpo', num: 'A09', hall: 'Hall A', area: 18, pricePerM2: 2500, status: 'disponible' },
  
  { id: 'g-A10', site: 'gardenexpo', num: 'A10', hall: 'Hall A', area: 12, pricePerM2: 2400, status: 'disponible' },
  { id: 'g-A11', site: 'gardenexpo', num: 'A11', hall: 'Hall A', area: 12, pricePerM2: 2400, status: 'disponible' },
  { id: 'g-A12', site: 'gardenexpo', num: 'A12', hall: 'Hall A', area: 12, pricePerM2: 2400, status: 'vendu', companyName: 'Gazon du Sud', clientName: 'Said Bennani', category: 'Gazon Synthétique' },
  
  { id: 'g-A13', site: 'gardenexpo', num: 'A13', hall: 'Hall A', area: 36, pricePerM2: 2600, status: 'disponible' },
  { id: 'g-A14', site: 'gardenexpo', num: 'A14', hall: 'Hall A', area: 36, pricePerM2: 2600, status: 'disponible' },
  { id: 'g-A15', site: 'gardenexpo', num: 'A15', hall: 'Hall A', area: 36, pricePerM2: 2600, status: 'disponible' },
  { id: 'g-A16', site: 'gardenexpo', num: 'A16', hall: 'Hall A', area: 36, pricePerM2: 2600, status: 'disponible' },
  
  { id: 'g-A17', site: 'gardenexpo', num: 'A17', hall: 'Hall A', area: 36, pricePerM2: 2600, status: 'reserve', companyName: 'GreenTech Solutions', clientName: 'Youssef El Amrani', category: 'Irrigation Connectée' },
  { id: 'g-A18', site: 'gardenexpo', num: 'A18', hall: 'Hall A', area: 18, pricePerM2: 2500, status: 'vendu', companyName: 'Deco Jardin', clientName: 'Amine Guessous', category: 'Mobilier en teck' },
  { id: 'g-A19', site: 'gardenexpo', num: 'A19', hall: 'Hall A', area: 36, pricePerM2: 2600, status: 'sponsorise', companyName: 'OCP Group Landscape', clientName: 'Khalid Laroui', category: 'Sponsor Officiel' },
  
  { id: 'g-A20', site: 'gardenexpo', num: 'A20', hall: 'Hall A', area: 18, pricePerM2: 2500, status: 'disponible' },
  { id: 'g-A21', site: 'gardenexpo', num: 'A21', hall: 'Hall A', area: 18, pricePerM2: 2500, status: 'disponible' },
  { id: 'g-A22', site: 'gardenexpo', num: 'A22', hall: 'Hall A', area: 18, pricePerM2: 2500, status: 'disponible' },
  { id: 'g-A23', site: 'gardenexpo', num: 'A23', hall: 'Hall A', area: 18, pricePerM2: 2500, status: 'vendu', companyName: 'Nature & Paysage', clientName: 'Karim Slaoui', category: 'Paysagisme & Pépinière' },
  { id: 'g-A24', site: 'gardenexpo', num: 'A24', hall: 'Hall A', area: 18, pricePerM2: 2500, status: 'vendu', companyName: 'Smart Irrigation', clientName: 'Sarah Touzani', category: 'Solutions arrosage' },
  { id: 'g-A25', site: 'gardenexpo', num: 'A25', hall: 'Hall A', area: 18, pricePerM2: 2500, status: 'disponible' },
  { id: 'g-A26', site: 'gardenexpo', num: 'A26', hall: 'Hall A', area: 18, pricePerM2: 2500, status: 'disponible' },
  { id: 'g-A27', site: 'gardenexpo', num: 'A27', hall: 'Hall A', area: 18, pricePerM2: 2500, status: 'vendu', companyName: 'Eco-Outdoors', clientName: 'Fouad Chraibi', category: 'Éclairage Solaire' },
  { id: 'g-A28', site: 'gardenexpo', num: 'A28', hall: 'Hall A', area: 18, pricePerM2: 2500, status: 'disponible' },

  // --- AFRICA POOL & SPA EXPO 2025 ---
  // Column A (9m² vertical stands)
  { id: 'p-A-1A', site: 'africapool', num: 'A-1A', hall: 'Hall 1', area: 9, pricePerM2: 2800, status: 'disponible' },
  { id: 'p-A-1B', site: 'africapool', num: 'A-1B', hall: 'Hall 1', area: 9, pricePerM2: 2800, status: 'disponible' },
  { id: 'p-A-1C', site: 'africapool', num: 'A-1C', hall: 'Hall 1', area: 9, pricePerM2: 2800, status: 'disponible' },
  { id: 'p-A-1D', site: 'africapool', num: 'A-1D', hall: 'Hall 1', area: 9, pricePerM2: 2800, status: 'disponible' },
  { id: 'p-A-1E', site: 'africapool', num: 'A-1E', hall: 'Hall 1', area: 9, pricePerM2: 2800, status: 'disponible' },
  { id: 'p-A-2A', site: 'africapool', num: 'A-2A', hall: 'Hall 1', area: 9, pricePerM2: 2800, status: 'disponible' },
  { id: 'p-A-2B', site: 'africapool', num: 'A-2B', hall: 'Hall 1', area: 9, pricePerM2: 2800, status: 'disponible' },
  { id: 'p-A-2C', site: 'africapool', num: 'A-2C', hall: 'Hall 1', area: 9, pricePerM2: 2800, status: 'disponible' },
  { id: 'p-A-2D', site: 'africapool', num: 'A-2D', hall: 'Hall 1', area: 9, pricePerM2: 2800, status: 'disponible' },
  { id: 'p-A-2E', site: 'africapool', num: 'A-2E', hall: 'Hall 1', area: 9, pricePerM2: 2800, status: 'disponible' },
  { id: 'p-A-3A', site: 'africapool', num: 'A-3A', hall: 'Hall 1', area: 9, pricePerM2: 2800, status: 'disponible' },
  { id: 'p-A-3B', site: 'africapool', num: 'A-3B', hall: 'Hall 1', area: 9, pricePerM2: 2800, status: 'disponible' },
  { id: 'p-A-3C', site: 'africapool', num: 'A-3C', hall: 'Hall 1', area: 9, pricePerM2: 2800, status: 'disponible' },
  { id: 'p-A-3D', site: 'africapool', num: 'A-3D', hall: 'Hall 1', area: 9, pricePerM2: 2800, status: 'disponible' },
  { id: 'p-A-3E', site: 'africapool', num: 'A-3E', hall: 'Hall 1', area: 9, pricePerM2: 2800, status: 'disponible' },
  { id: 'p-A-3F', site: 'africapool', num: 'A-3F', hall: 'Hall 1', area: 9, pricePerM2: 2800, status: 'vendu', companyName: 'AstralPool Maroc', clientName: 'Kamal Sghiouar', category: 'Équipements de Piscine' },

  // Row 6 Top stands (small yellow/red 9m²)
  { id: 'p-C-6A', site: 'africapool', num: 'C-6A', hall: 'Hall 1', area: 9, pricePerM2: 2800, status: 'disponible' },
  { id: 'p-D-6A', site: 'africapool', num: 'D-6A', hall: 'Hall 1', area: 9, pricePerM2: 2800, status: 'disponible' },
  { id: 'p-D-6B', site: 'africapool', num: 'D-6B', hall: 'Hall 1', area: 9, pricePerM2: 2800, status: 'disponible' },
  { id: 'p-D-6C', site: 'africapool', num: 'D-6C', hall: 'Hall 1', area: 9, pricePerM2: 2800, status: 'vendu', companyName: 'BWT-Barco', clientName: 'Fouad Laroui', category: 'Traitement de l\'eau' },
  { id: 'p-E-6A', site: 'africapool', num: 'E-6A', hall: 'Hall 1', area: 9, pricePerM2: 2800, status: 'disponible' },
  { id: 'p-E-6B', site: 'africapool', num: 'E-6B', hall: 'Hall 1', area: 9, pricePerM2: 2800, status: 'disponible' },
  { id: 'p-E-6C', site: 'africapool', num: 'E-6C', hall: 'Hall 1', area: 9, pricePerM2: 2800, status: 'disponible' },
  { id: 'p-E-6D', site: 'africapool', num: 'E-6D', hall: 'Hall 1', area: 9, pricePerM2: 2800, status: 'disponible' },

  // Row 5 stands
  { id: 'p-D-5A', site: 'africapool', num: 'D-5A', hall: 'Hall 1', area: 9, pricePerM2: 2800, status: 'disponible' },
  { id: 'p-D-5B', site: 'africapool', num: 'D-5B', hall: 'Hall 1', area: 9, pricePerM2: 2800, status: 'reserve', companyName: 'O/D L.G THERMIQUE', clientName: 'Adil Bennis' },
  { id: 'p-E-5A', site: 'africapool', num: 'E-5A', hall: 'Hall 1', area: 18, pricePerM2: 2800, status: 'vendu', companyName: 'ALTEZA', clientName: 'Yassir Ghamri', category: 'Pergolas & Pool Houses' },
  { id: 'p-F-5A', site: 'africapool', num: 'F-5A', hall: 'Hall 1', area: 9, pricePerM2: 2800, status: 'vendu', companyName: 'Topromaroc', clientName: 'Driss Tazi', category: 'Sécurité de piscine' },
  { id: 'p-F-5B', site: 'africapool', num: 'F-5B', hall: 'Hall 1', area: 9, pricePerM2: 2800, status: 'disponible' },
  { id: 'p-G-5A', site: 'africapool', num: 'G-5A', hall: 'Hall 1', area: 18, pricePerM2: 2800, status: 'vendu', companyName: 'Fluidra Maroc', clientName: 'Hassan Filali', category: 'Systèmes de filtration' },

  // Row 4 stands
  { id: 'p-D-4A', site: 'africapool', num: 'D-4A', hall: 'Hall 1', area: 36, pricePerM2: 2800, status: 'vendu', companyName: 'CCI', clientName: 'Amine El Alami', category: 'Climatisation / Chauffage' },
  { id: 'p-D-4B', site: 'africapool', num: 'D-4B', hall: 'Hall 1', area: 18, pricePerM2: 2800, status: 'disponible' },
  { id: 'p-D-4C', site: 'africapool', num: 'D-4C', hall: 'Hall 1', area: 18, pricePerM2: 2800, status: 'vendu', companyName: 'L.G. THERMIQUE', clientName: 'Sami Naciri', category: 'Pompes à chaleur' },
  { id: 'p-E-4A', site: 'africapool', num: 'E-4A', hall: 'Hall 1', area: 36, pricePerM2: 2800, status: 'vendu', companyName: 'Spasauna', clientName: 'Khadija Bennani', category: 'Saunas & Hammams' },
  { id: 'p-E-4B', site: 'africapool', num: 'E-4B', hall: 'Hall 1', area: 36, pricePerM2: 2800, status: 'disponible' },
  { id: 'p-F-4A', site: 'africapool', num: 'F-4A', hall: 'Hall 1', area: 36, pricePerM2: 2800, status: 'vendu', companyName: 'ATLANTA POMPES', clientName: 'Mehdi Naciri', category: 'Pompes de circulation' },
  { id: 'p-F-4B', site: 'africapool', num: 'F-4B', hall: 'Hall 1', area: 36, pricePerM2: 2800, status: 'disponible' },
  { id: 'p-G-4A', site: 'africapool', num: 'G-4A', hall: 'Hall 1', area: 18, pricePerM2: 2800, status: 'disponible' },
  { id: 'p-G-4B', site: 'africapool', num: 'G-4B', hall: 'Hall 1', area: 54, pricePerM2: 2800, status: 'disponible' },

  // Row 3 (Paledo, Poolspa, Gamis, Verso, Zen, etc.)
  { id: 'p-B-3A', site: 'africapool', num: 'B-3A', hall: 'Hall 1', area: 36, pricePerM2: 2800, status: 'vendu', companyName: 'PALEDO', clientName: 'Karim Slaoui', category: 'Piscines & Équipements' },
  { id: 'p-B-3B', site: 'africapool', num: 'B-3B', hall: 'Hall 1', area: 18, pricePerM2: 2800, status: 'vendu', companyName: 'POOLSPA', clientName: 'Said Bennani', category: 'Spas & Balnéothérapie' },
  { id: 'p-C-4A', site: 'africapool', num: 'C-4A', hall: 'Hall 1', area: 18, pricePerM2: 2800, status: 'reserve', companyName: 'Réservé Option C-4A', clientName: 'Nabil Chraibi' },
  { id: 'p-D-3A', site: 'africapool', num: 'D-3A', hall: 'Hall 1', area: 72, pricePerM2: 2800, status: 'reserve', companyName: 'Gamis', clientName: 'Mehdi Rahho', category: 'Traitement de l\'eau' },
  { id: 'p-E-3A', site: 'africapool', num: 'E-3A', hall: 'Hall 1', area: 36, pricePerM2: 2800, status: 'vendu', companyName: 'VERSO SIGNATURE', clientName: 'Yassine Alami', category: 'Architecture extérieure' },
  { id: 'p-E-3B', site: 'africapool', num: 'E-3B', hall: 'Hall 1', area: 18, pricePerM2: 2800, status: 'vendu', companyName: 'Water Tech', clientName: 'Anas Ouazzani', category: 'Filtration' },
  { id: 'p-E-3C', site: 'africapool', num: 'E-3C', hall: 'Hall 1', area: 18, pricePerM2: 2800, status: 'disponible' },
  { id: 'p-F-3A', site: 'africapool', num: 'F-3A', hall: 'Hall 1', area: 36, pricePerM2: 2800, status: 'vendu', companyName: 'Zen Piscine', clientName: 'Samira Belkadi', category: 'Aménagement paysager' },
  { id: 'p-F-3B', site: 'africapool', num: 'F-3B', hall: 'Hall 1', area: 18, pricePerM2: 2800, status: 'vendu', companyName: 'AZUL IZMAWN', clientName: 'Omar Benjelloun', category: 'Revêtements' },
  { id: 'p-F-3C', site: 'africapool', num: 'F-3C', hall: 'Hall 1', area: 18, pricePerM2: 2800, status: 'disponible' },
  { id: 'p-G-3A', site: 'africapool', num: 'G-3A', hall: 'Hall 1', area: 72, pricePerM2: 2800, status: 'disponible' },

  // Row 2
  { id: 'p-B-2A', site: 'africapool', num: 'B-2A', hall: 'Hall 1', area: 72, pricePerM2: 2800, status: 'reserve', companyName: 'Réservé B-2A' },
  { id: 'p-C-2A', site: 'africapool', num: 'C-2A', hall: 'Hall 1', area: 18, pricePerM2: 2800, status: 'disponible' },
  { id: 'p-C-2B', site: 'africapool', num: 'C-2B', hall: 'Hall 1', area: 54, pricePerM2: 2800, status: 'disponible' },
  { id: 'p-D-2A', site: 'africapool', num: 'D-2A', hall: 'Hall 1', area: 72, pricePerM2: 2800, status: 'vendu', companyName: 'Frio Equipement', clientName: 'Youssef El Amrani', category: 'Froid industriel & Spas' },
  { id: 'p-E-2A', site: 'africapool', num: 'E-2A', hall: 'Hall 1', area: 72, pricePerM2: 2800, status: 'vendu', companyName: 'Desjoyaux', clientName: 'Khadija Bennani', category: 'Piscines monoblocs' },
  { id: 'p-F-2A', site: 'africapool', num: 'F-2A', hall: 'Hall 1', area: 72, pricePerM2: 2800, status: 'reserve', companyName: 'Réservé F-2A' },
  { id: 'p-G-2A', site: 'africapool', num: 'G-2A', hall: 'Hall 1', area: 72, pricePerM2: 2800, status: 'disponible' },

  // Row 1 (Bottom row)
  { id: 'p-B-1A', site: 'africapool', num: 'B-1A', hall: 'Hall 1', area: 72, pricePerM2: 2800, status: 'disponible' },
  { id: 'p-C-1A', site: 'africapool', num: 'C-1A', hall: 'Hall 1', area: 72, pricePerM2: 2800, status: 'vendu', companyName: 'AIR EAU SOLUTION', clientName: 'Rachid Alami', category: 'Hydraulique' },
  { id: 'p-D-1A', site: 'africapool', num: 'D-1A', hall: 'Hall 1', area: 72, pricePerM2: 2800, status: 'reserve', companyName: 'Réservé WG', clientName: 'Idriss Filali', category: 'Wellness solutions' },
  { id: 'p-E-1A', site: 'africapool', num: 'E-1A', hall: 'Hall 1', area: 72, pricePerM2: 2800, status: 'vendu', companyName: 'MASSOR', clientName: 'Sarah Touzani', category: 'Piscines Naturelles' },
  { id: 'p-F-1A', site: 'africapool', num: 'F-1A', hall: 'Hall 1', area: 36, pricePerM2: 2800, status: 'vendu', companyName: 'AAFM', clientName: 'Amine Guessous', category: 'Association piscine' },
  { id: 'p-F-1B', site: 'africapool', num: 'F-1B', hall: 'Hall 1', area: 36, pricePerM2: 2800, status: 'vendu', companyName: 'UPEK', clientName: 'Karim Slaoui', category: 'Matériaux de Construction' },
  { id: 'p-G-1A', site: 'africapool', num: 'G-1A', hall: 'Hall 1', area: 72, pricePerM2: 2800, status: 'disponible' },

  // Column H (yellow vertical stands on RHS)
  { id: 'p-H-1A', site: 'africapool', num: 'H-1A', hall: 'Hall 1', area: 9, pricePerM2: 2800, status: 'disponible' },
  { id: 'p-H-1B', site: 'africapool', num: 'H-1B', hall: 'Hall 1', area: 9, pricePerM2: 2800, status: 'disponible' },
  { id: 'p-H-1C', site: 'africapool', num: 'H-1C', hall: 'Hall 1', area: 9, pricePerM2: 2800, status: 'disponible' },
  { id: 'p-H-1D', site: 'africapool', num: 'H-1D', hall: 'Hall 1', area: 9, pricePerM2: 2800, status: 'disponible' },
  { id: 'p-H-1E', site: 'africapool', num: 'H-1E', hall: 'Hall 1', area: 18, pricePerM2: 2800, status: 'disponible' },
  { id: 'p-H-2A', site: 'africapool', num: 'H-2A', hall: 'Hall 1', area: 24, pricePerM2: 2800, status: 'disponible' },
  { id: 'p-H-2B', site: 'africapool', num: 'H-2B', hall: 'Hall 1', area: 24, pricePerM2: 2800, status: 'disponible' },
  { id: 'p-H-3A', site: 'africapool', num: 'H-3A', hall: 'Hall 1', area: 18, pricePerM2: 2800, status: 'disponible' },
  { id: 'p-H-3C', site: 'africapool', num: 'H-3C', hall: 'Hall 1', area: 18, pricePerM2: 2800, status: 'disponible' },
  { id: 'p-H-4A', site: 'africapool', num: 'H-4A', hall: 'Hall 1', area: 24, pricePerM2: 2800, status: 'disponible' },
  { id: 'p-H-4B', site: 'africapool', num: 'H-4B', hall: 'Hall 1', area: 18, pricePerM2: 2800, status: 'disponible' },
  { id: 'p-H-5A', site: 'africapool', num: 'H-5A', hall: 'Hall 1', area: 18, pricePerM2: 2800, status: 'disponible' }
];

export const initialTransactions: Transaction[] = [
  {
    id: 't1',
    num: 'DEV-2024-156',
    clientName: 'Youssef El Amrani',
    companyName: 'GreenTech Solutions',
    site: 'gardenexpo',
    type: 'devis',
    amount: 24500,
    status: 'envoye',
    date: '2024-05-18',
    dueDate: '2024-06-18',
    items: [
      { id: 'i1', description: 'Réservation de Stand de Jardin - 9m²', quantity: 1, unitPrice: 22500 },
      { id: 'i2', description: 'Frais de branchement électrique', quantity: 1, unitPrice: 2000 }
    ],
    notes: 'Devis de réservation de base envoyé après premier appel téléphonique.'
  },
  {
    id: 't2',
    num: 'DEV-2024-155',
    clientName: 'Khadija Bennani',
    companyName: 'AquaPools Maroc',
    site: 'africapool',
    type: 'devis',
    amount: 85000,
    status: 'negociation',
    date: '2024-05-17',
    dueDate: '2024-06-17',
    items: [
      { id: 'i3', description: 'Stand d\'angle Premium Hall 1 - 27m²', quantity: 1, unitPrice: 75600 },
      { id: 'i4', description: 'Sponsorisation Catalogue Official', quantity: 1, unitPrice: 5000 },
      { id: 'i5', description: 'Badges VIP additionnels', quantity: 4, unitPrice: 1100 }
    ],
    notes: 'Exposant régulier. Négociation en cours d\'un rabais de 5% sur le forfait global.'
  },
  {
    id: 't3',
    num: 'DEV-2024-154',
    clientName: 'Karim Slaoui',
    companyName: 'Nature & Paysage',
    site: 'gardenexpo',
    type: 'devis',
    amount: 60000,
    status: 'envoye',
    date: '2024-05-15',
    dueDate: '2024-06-15',
    items: [
      { id: 'i6', description: 'Espace Pépinière extérieur - 50m²', quantity: 1, unitPrice: 50000 },
      { id: 'i7', description: 'Pack Communication Digital', quantity: 1, unitPrice: 10000 }
    ],
    notes: 'Validé par le commercial régional, en attente de signature du client.'
  },
  {
    id: 't4',
    num: 'DEV-2024-153',
    clientName: 'Chen Wei',
    companyName: 'China Water Tech',
    site: 'africapool',
    type: 'devis',
    amount: 110000,
    status: 'negociation',
    date: '2024-05-14',
    dueDate: '2024-06-14',
    items: [
      { id: 'i8', description: 'Stand Central Îlot - 36m²', quantity: 2, unitPrice: 50000 },
      { id: 'i9', description: 'Frais de montage et nettoyage spécifique', quantity: 1, unitPrice: 10000 }
    ],
    notes: 'Prise de contact au salon de Guangzhou. Discussions opérationnelles sur l\'importation temporaire de matériel.'
  },
  {
    id: 't5',
    num: 'DEV-2024-152',
    clientName: 'Amine Guessous',
    companyName: 'Deco Jardin',
    site: 'gardenexpo',
    type: 'devis',
    amount: 40000,
    status: 'envoye',
    date: '2024-05-10',
    dueDate: '2024-06-10',
    items: [
      { id: 'i10', description: 'Stand Hall A - 12m²', quantity: 1, unitPrice: 30000 },
      { id: 'i11', description: 'Vitrine rétro-éclairée et mobilier de base', quantity: 1, unitPrice: 10000 }
    ]
  },
  {
    id: 't6',
    num: 'FA-2024-098',
    clientName: 'Imane Slaoui',
    companyName: 'Poteries de Safi',
    site: 'gardenexpo',
    type: 'facture',
    amount: 45000,
    status: 'paye',
    date: '2024-04-10',
    dueDate: '2024-05-10',
    items: [
      { id: 'i12', description: 'Stand d\'exposition de terre cuite - 18m²', quantity: 1, unitPrice: 45000 }
    ],
    notes: 'Payé par virement bancaire. Reçu transmis.'
  },
  {
    id: 't7',
    num: 'FA-2024-099',
    clientName: 'Said Bennani',
    companyName: 'Gazon du Sud',
    site: 'gardenexpo',
    type: 'facture',
    amount: 28800,
    status: 'en_retard',
    date: '2024-03-01',
    dueDate: '2024-04-01',
    items: [
      { id: 'i13', description: 'Exposition Pelouse Premium en rouleau', quantity: 12, unitPrice: 2400 }
    ],
    notes: 'Facture en souffrance. Relance envoyée par email le 10 avril.'
  }
];

export const initialCampaigns: Campaign[] = [
  {
    id: 'm1',
    name: 'Invitation Exposants Garden Expo 2025',
    site: 'gardenexpo',
    sentCount: 12450,
    opens: 4230,
    clicks: 1245,
    status: 'envoye',
    date: '2024-05-01',
    subject: 'Boostez vos ventes : Réservez votre espace au Garden Expo Africa 2025',
    content: `Cher Professionnel,

Le rendez-vous annuel du paysage et du jardin revient pour sa grande édition 2025. 
Une visibilité unique devant plus de 15 000 visiteurs qualifiés et investisseurs privés et publics.

Bénéficiez de remises "Early Bird" de -15% pour toute confirmation avant la fin du mois.

Cordialement,
L'équipe R2H Communication`
  },
  {
    id: 'm2',
    name: 'Newsletter Visiteurs Africa Pool & Spa (Mai)',
    site: 'africapool',
    sentCount: 8750,
    opens: 2910,
    clicks: 876,
    status: 'envoye',
    date: '2024-05-15',
    subject: 'Rupture technologique et innovations dans l\'industrie de la piscine',
    content: `Bonjour,

Découvrez en avant-première les dernières technologies de filtration sans chlore et d'automatisation des spas qui seront présentées à Marrakech en Avril 2025.
Téléchargez votre badge d'accès gratuit dès aujourd'hui.

L'équipe Africa Pool & Spa Expo`
  },
  {
    id: 'm3',
    name: 'Lancement Commercial Salon Marrakech 2025',
    site: 'africapool',
    sentCount: 6320,
    opens: 1890,
    clicks: 542,
    status: 'envoye',
    date: '2024-04-20',
    subject: 'Marrakech accueille l\'Africa Pool & Spa Expo 2025 !',
    content: `Marrakech, capitale de l'hôtellerie de luxe, accueillera la prochaine édition de l'Africa Pool & Spa Expo. Un regroupement de tout l'écosystème africain du bien-être et de l'eau. Réservez votre stand.`
  }
];

export const initialTasks: Task[] = [
  {
    id: 'k1',
    title: 'Relancer devis GTS-00124',
    description: 'Relancer GreenTech Solutions pour leur accord d\'acompte.',
    site: 'gardenexpo',
    dueDate: 'Aujourd\'hui',
    priority: 'haute',
    status: 'a_faire'
  },
  {
    id: 'k2',
    title: 'Appel de suivi AquaPools',
    description: 'Négocier l\'emplacement d\'angle A05 avec Khadija.',
    site: 'africapool',
    dueDate: 'Demain',
    priority: 'moyenne',
    status: 'en_cours'
  },
  {
    id: 'k3',
    title: 'Envoyer contrat stand A15',
    description: 'Envoyer le contrat définitif de OCP Landscape.',
    site: 'gardenexpo',
    dueDate: '2 jours',
    priority: 'moyenne',
    status: 'a_faire'
  },
  {
    id: 'k4',
    title: 'Relance facture FA-00098',
    description: 'Suivi de paiement pour le solde Poteries de Safi.',
    site: 'r2h',
    dueDate: '3 jours',
    priority: 'haute',
    status: 'a_faire'
  },
  {
    id: 'k5',
    title: 'Préparer proposition Build Expo',
    description: 'Rédaction de la présentation préliminaire pour l\'édition d\'Abidjan.',
    site: 'r2h',
    dueDate: '4 jours',
    priority: 'basse',
    status: 'termine'
  }
];
