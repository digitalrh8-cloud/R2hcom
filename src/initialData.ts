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
    notes: 'Exposant majeur du salon Garden Expo, spécialisé en solutions d\'irrigation intelligentes.'
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
    notes: 'Fabricant de structures de piscines en composite. Intéressé par un grand stand double face.'
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
    notes: 'Paysagiste réputé à Rabat. Veut un espace extérieur de pépinière.'
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
    notes: 'Mobilier de jardin premium en teck et résine tressée.'
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
    notes: 'Prospect chaud. A visité l\'édition précédente, hésite encore pour l\'emplacement.'
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
    notes: 'Exposant spécialisé dans le goutte-à-goutte connecté.'
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
  { id: 'p-A01', site: 'africapool', num: 'A01', hall: 'Hall 1', area: 18, pricePerM2: 2800, status: 'disponible' },
  { id: 'p-A02', site: 'africapool', num: 'A02', hall: 'Hall 1', area: 18, pricePerM2: 2800, status: 'vendu', companyName: 'Smal Pools Morocco', clientName: 'Hakim Filali', category: 'Coques Polyester' },
  { id: 'p-A03', site: 'africapool', num: 'A03', hall: 'Hall 1', area: 18, pricePerM2: 2800, status: 'disponible' },
  { id: 'p-A04', site: 'africapool', num: 'A04', hall: 'Hall 1', area: 18, pricePerM2: 2800, status: 'disponible' },
  { id: 'p-A05', site: 'africapool', num: 'A05', hall: 'Hall 1', area: 18, pricePerM2: 2800, status: 'vendu', companyName: 'AquaPools Maroc', clientName: 'Khadija Bennani', category: 'Piscines & Spas Haut de Gamme' },
  { id: 'p-A06', site: 'africapool', num: 'A06', hall: 'Hall 1', area: 18, pricePerM2: 2800, status: 'vendu', companyName: 'China Water Tech', clientName: 'Chen Wei', category: 'Filtration & Pompes' },
  { id: 'p-A07', site: 'africapool', num: 'A07', hall: 'Hall 1', area: 18, pricePerM2: 2800, status: 'disponible' },
  { id: 'p-A08', site: 'africapool', num: 'A08', hall: 'Hall 1', area: 18, pricePerM2: 2800, status: 'disponible' },
  { id: 'p-A17', site: 'africapool', num: 'A17', hall: 'Hall 1', area: 36, pricePerM2: 2900, status: 'reserve', companyName: 'Diffazur Maroc', clientName: 'Antoine Dubois', category: 'Piscines béton' }
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
