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
    id: 'media-init-1',
    company: "L'Économiste du Maroc",
    name: "Amine Belghazi",
    email: "contact@leconomiste.com",
    phone: "+212 522-360150",
    site: "r2h",
    role: 'partner_media',
    dateAdded: '2026-06-01',
    mediaType: "Presse écrite (Papiers)",
    mediaAudience: "National",
    mediaCoverage: "450k lecteurs / jour",
    mediaStatus: 'actif',
    mediaLogo: '',
    notes: "Partenaire de presse francophone de premier plan au Maroc. Couverture complète de l'inauguration et diffusion de bannières.",
    mediaArticles: [
      {
        id: 'art-init-1a',
        label: "Inauguration officielle du Salon de l'immobilier",
        date: '2026-06-02',
        url: 'https://leconomiste.com',
        imageProof: '',
        reachEst: 120000
      }
    ]
  },
  {
    id: 'media-init-2',
    company: "Medi1 TV Actualités",
    name: "Karim Tazi",
    email: "k.tazi@medi1tv.ma",
    phone: "+212 539-930202",
    site: "r2h",
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
        id: 'art-init-2a',
        label: "Reportage direct télévisé - Session plénière",
        date: '2026-06-02',
        url: 'https://medi1tv.ma',
        imageProof: '',
        reachEst: 500000
      }
    ]
  },
  {
    id: 'c-ap-1',
    name: 'youssef Elhafid',
    email: 'yelhafid@ccei.ma',
    phone: '645729742',
    company: 'CCEI',
    site: 'africapool',
    role: 'client',
    dateAdded: '2026-05-10',
    notes: 'Surface: 36m² (surface nue). Tarif HT: 1250 MAD / m². Acompte/Avance perçu.',
    standNumber: 'A-3F'
  },
  {
    id: 'c-ap-2',
    name: 'Nawal',
    email: 'firstwater2010@gmail.com',
    phone: '0661704340',
    company: 'First Water',
    site: 'africapool',
    role: 'client',
    dateAdded: '2026-05-12',
    notes: 'Surface: 18m² (surface équipé). Tarif HT: 1250 MAD / m² + Frais d\'inscription 1500 MAD.',
    standNumber: 'B-3B'
  },
  {
    id: 'c-ap-3',
    name: 'Belkacem Achaour ( Gérant )',
    email: 'atlantapompe2019@gmail.com',
    phone: '212-661655904 / 212-662805898',
    company: 'ATLANTA POMPE',
    site: 'africapool',
    role: 'client',
    dateAdded: '2026-05-15',
    notes: 'Surface: 36m² (surface équipé). Tarif HT: 1600 MAD / m².',
    standNumber: 'F-4A'
  },
  {
    id: 'c-ap-4',
    name: 'mohamed',
    email: 'eaushop21@gmail.com',
    phone: '+212 661-410471',
    company: 'Frio Equipement',
    site: 'africapool',
    role: 'client',
    dateAdded: '2026-05-18',
    notes: 'Surface: 72m² (surface nue). Tarif HT: 1000 MAD / m² + 1500 MAD frais d\'inscription.',
    standNumber: 'D-2A'
  },
  {
    id: 'c-ap-5',
    name: 'Oussama Amine',
    email: 'Contact@paledo.ma',
    phone: '212663421998',
    company: 'Paledo',
    site: 'africapool',
    role: 'client',
    dateAdded: '2026-05-20',
    notes: 'Surface: 36m² (surface nue). Forfait global de 50 000 MAD TTC.',
    standNumber: 'E-3A'
  },
  {
    id: 'c-ap-6',
    name: 'tarek sekkat',
    email: 'sales@sayaline.com',
    phone: '+212 661-314597',
    company: 'saya line',
    site: 'africapool',
    role: 'client',
    dateAdded: '2026-05-22',
    notes: 'Surface: 18m² (surface NUE). Tarif HT: 1400 MAD/m².',
    standNumber: 'F-3C'
  },
  {
    id: 'c-ap-7',
    name: 'OUAFA lidya',
    email: 'l.ouafa@poolspa.ma',
    phone: '212 672-525044',
    company: 'POOL SPA',
    site: 'africapool',
    role: 'client',
    dateAdded: '2026-05-24',
    notes: 'Surface: 18m² (surface équipé). Tarif HT: 1800 MAD/m² + Frais d\'inscription HT 2400 MAD.',
    standNumber: 'E-1A'
  },
  {
    id: 'c-ap-8',
    name: 'Yoan Di cosimo',
    email: 'direction@hwgroup.Fr',
    phone: '212 673-874777',
    company: 'HWG - hitech water group',
    site: 'africapool',
    role: 'client',
    dateAdded: '2026-05-26',
    notes: 'Surface: 72 M² NUE. Forfait de 70 000 MAD TTC.',
    standNumber: 'E-2A'
  },
  {
    id: 'c-ap-9',
    name: 'SARA',
    email: 'admin@medyassinesanitaire.com',
    phone: '212 675-941653',
    company: 'med yassine sanitaire ALTEZA',
    site: 'africapool',
    role: 'client',
    dateAdded: '2026-05-28',
    notes: 'Surface: 18M2 EQUIPE. Tarif HT: 2400 MAD/m² + Frais d\'inscription 2400 MAD.',
    standNumber: 'E-5A'
  },
  {
    id: 'c-ap-10',
    name: 'DAISY',
    email: 'daisy@ledlightcn.net',
    phone: '+86 137 3677 9371',
    company: 'swin.led',
    site: 'africapool',
    role: 'client',
    dateAdded: '2026-05-30',
    notes: 'Surface: 9M² EQUIPE. Tarif HT: 3000 MAD / m².',
    standNumber: 'A-1A'
  },
  {
    id: 'c-ap-11',
    name: 'MOHAMED',
    email: 'Mohammed.Hegab@MPT-Egypt.com',
    phone: '20 10 22290100',
    company: 'MISR POOL TECHNOLOGY',
    site: 'africapool',
    role: 'client',
    dateAdded: '2026-06-01',
    notes: 'Surface: 9M² EQUIPE. Tarif HT: 2200 MAD / m².',
    standNumber: 'A-1B'
  },
  {
    id: 'c-ap-12',
    name: 'tarik bensadik',
    email: 'tarik@versosignature.ma',
    phone: '+212 660 000 000',
    company: 'verso signature',
    site: 'africapool',
    role: 'client',
    dateAdded: '2026-06-02',
    notes: 'Surface: 36 NUE. Forfait HT: 37 500 MAD.',
    standNumber: 'D-3A'
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

  // --- AFRICA POOL & SPA EXPO ---
  // Column A
  { id: 'p-A-1A', site: 'africapool', num: 'A-1A', hall: 'Hall 1', area: 9, pricePerM2: 3000, status: 'vendu', companyName: 'swin.led', clientName: 'DAISY', category: 'Lumières de Piscine' },
  { id: 'p-A-1B', site: 'africapool', num: 'A-1B', hall: 'Hall 1', area: 9, pricePerM2: 2200, status: 'vendu', companyName: 'MISR POOL TECHNOLOGY', clientName: 'MOHAMED', category: 'Équipements et Technologie' },
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
  { id: 'p-A-3F', site: 'africapool', num: 'A-3F', hall: 'Hall 1', area: 36, pricePerM2: 1250, status: 'vendu', companyName: 'CCEI', clientName: 'youssef Elhafid', category: 'Équipements de Piscine' },

  // Row 6 Top stands
  { id: 'p-C-6A', site: 'africapool', num: 'C-6A', hall: 'Hall 1', area: 9, pricePerM2: 2800, status: 'disponible' },
  { id: 'p-D-6A', site: 'africapool', num: 'D-6A', hall: 'Hall 1', area: 9, pricePerM2: 2800, status: 'disponible' },
  { id: 'p-D-6B', site: 'africapool', num: 'D-6B', hall: 'Hall 1', area: 9, pricePerM2: 2800, status: 'disponible' },
  { id: 'p-D-6C', site: 'africapool', num: 'D-6C', hall: 'Hall 1', area: 9, pricePerM2: 2800, status: 'disponible' },
  { id: 'p-E-6A', site: 'africapool', num: 'E-6A', hall: 'Hall 1', area: 9, pricePerM2: 2800, status: 'disponible' },
  { id: 'p-E-6B', site: 'africapool', num: 'E-6B', hall: 'Hall 1', area: 9, pricePerM2: 2800, status: 'disponible' },
  { id: 'p-E-6C', site: 'africapool', num: 'E-6C', hall: 'Hall 1', area: 9, pricePerM2: 2800, status: 'disponible' },
  { id: 'p-E-6D', site: 'africapool', num: 'E-6D', hall: 'Hall 1', area: 9, pricePerM2: 2800, status: 'disponible' },

  // Row 5 stands
  { id: 'p-D-5A', site: 'africapool', num: 'D-5A', hall: 'Hall 1', area: 9, pricePerM2: 2800, status: 'disponible' },
  { id: 'p-D-5B', site: 'africapool', num: 'D-5B', hall: 'Hall 1', area: 9, pricePerM2: 2800, status: 'disponible' },
  { id: 'p-E-5A', site: 'africapool', num: 'E-5A', hall: 'Hall 1', area: 18, pricePerM2: 2400, status: 'vendu', companyName: 'med yassine sanitaire ALTEZA', clientName: 'SARA', category: 'Sanitaire & Plomberie' },
  { id: 'p-F-5A', site: 'africapool', num: 'F-5A', hall: 'Hall 1', area: 9, pricePerM2: 2800, status: 'disponible' },
  { id: 'p-F-5B', site: 'africapool', num: 'F-5B', hall: 'Hall 1', area: 9, pricePerM2: 2800, status: 'disponible' },
  { id: 'p-G-5A', site: 'africapool', num: 'G-5A', hall: 'Hall 1', area: 18, pricePerM2: 2800, status: 'disponible' },

  // Row 4 stands
  { id: 'p-D-4A', site: 'africapool', num: 'D-4A', hall: 'Hall 1', area: 36, pricePerM2: 2800, status: 'disponible' },
  { id: 'p-D-4B', site: 'africapool', num: 'D-4B', hall: 'Hall 1', area: 18, pricePerM2: 2800, status: 'disponible' },
  { id: 'p-D-4C', site: 'africapool', num: 'D-4C', hall: 'Hall 1', area: 18, pricePerM2: 2800, status: 'disponible' },
  { id: 'p-E-4A', site: 'africapool', num: 'E-4A', hall: 'Hall 1', area: 36, pricePerM2: 2800, status: 'disponible' },
  { id: 'p-E-4B', site: 'africapool', num: 'E-4B', hall: 'Hall 1', area: 36, pricePerM2: 2800, status: 'disponible' },
  { id: 'p-F-4A', site: 'africapool', num: 'F-4A', hall: 'Hall 1', area: 36, pricePerM2: 1600, status: 'vendu', companyName: 'ATLANTA POMPE', clientName: 'Belkacem Achaour', category: 'Pompes & Moteurs' },
  { id: 'p-F-4B', site: 'africapool', num: 'F-4B', hall: 'Hall 1', area: 36, pricePerM2: 2800, status: 'disponible' },
  { id: 'p-G-4A', site: 'africapool', num: 'G-4A', hall: 'Hall 1', area: 18, pricePerM2: 2800, status: 'disponible' },
  { id: 'p-G-4B', site: 'africapool', num: 'G-4B', hall: 'Hall 1', area: 54, pricePerM2: 2800, status: 'disponible' },

  // Row 3
  { id: 'p-B-3A', site: 'africapool', num: 'B-3A', hall: 'Hall 1', area: 36, pricePerM2: 2800, status: 'disponible' },
  { id: 'p-B-3B', site: 'africapool', num: 'B-3B', hall: 'Hall 1', area: 18, pricePerM2: 1250, status: 'vendu', companyName: 'First Water', clientName: 'Nawal', category: 'Traitement de l\'eau' },
  { id: 'p-C-4A', site: 'africapool', num: 'C-4A', hall: 'Hall 1', area: 18, pricePerM2: 2800, status: 'disponible' },
  { id: 'p-D-3A', site: 'africapool', num: 'D-3A', hall: 'Hall 1', area: 36, pricePerM2: 2800, status: 'vendu', companyName: 'verso signature', clientName: 'tarik bensadik', category: 'Architecture extérieure' },
  { id: 'p-E-3A', site: 'africapool', num: 'E-3A', hall: 'Hall 1', area: 36, pricePerM2: 2800, status: 'vendu', companyName: 'Paledo', clientName: 'Oussama Amine', category: 'Piscines & Équipements' },
  { id: 'p-E-3B', site: 'africapool', num: 'E-3B', hall: 'Hall 1', area: 18, pricePerM2: 2800, status: 'disponible' },
  { id: 'p-E-3C', site: 'africapool', num: 'E-3C', hall: 'Hall 1', area: 18, pricePerM2: 2800, status: 'disponible' },
  { id: 'p-F-3A', site: 'africapool', num: 'F-3A', hall: 'Hall 1', area: 36, pricePerM2: 2800, status: 'disponible' },
  { id: 'p-F-3B', site: 'africapool', num: 'F-3B', hall: 'Hall 1', area: 18, pricePerM2: 2800, status: 'disponible' },
  { id: 'p-F-3C', site: 'africapool', num: 'F-3C', hall: 'Hall 1', area: 18, pricePerM2: 1400, status: 'vendu', companyName: 'saya line', clientName: 'tarek sekkat', category: 'Design & Aménagement' },
  { id: 'p-G-3A', site: 'africapool', num: 'G-3A', hall: 'Hall 1', area: 72, pricePerM2: 2800, status: 'disponible' },

  // Row 2
  { id: 'p-B-2A', site: 'africapool', num: 'B-2A', hall: 'Hall 1', area: 72, pricePerM2: 2800, status: 'disponible' },
  { id: 'p-C-2A', site: 'africapool', num: 'C-2A', hall: 'Hall 1', area: 18, pricePerM2: 2800, status: 'disponible' },
  { id: 'p-C-2B', site: 'africapool', num: 'C-2B', hall: 'Hall 1', area: 54, pricePerM2: 2800, status: 'disponible' },
  { id: 'p-D-2A', site: 'africapool', num: 'D-2A', hall: 'Hall 1', area: 72, pricePerM2: 1000, status: 'vendu', companyName: 'Frio Equipement', clientName: 'mohamed', category: 'Froid industriel & Spas' },
  { id: 'p-E-2A', site: 'africapool', num: 'E-2A', hall: 'Hall 1', area: 72, pricePerM2: 1000, status: 'vendu', companyName: 'HWG - hitech water group', clientName: 'Yoan Di cosimo', category: 'Équipements de Piscine' },
  { id: 'p-F-2A', site: 'africapool', num: 'F-2A', hall: 'Hall 1', area: 72, pricePerM2: 2800, status: 'disponible' },
  { id: 'p-G-2A', site: 'africapool', num: 'G-2A', hall: 'Hall 1', area: 72, pricePerM2: 2800, status: 'disponible' },

  // Row 1
  { id: 'p-B-1A', site: 'africapool', num: 'B-1A', hall: 'Hall 1', area: 72, pricePerM2: 2800, status: 'disponible' },
  { id: 'p-C-1A', site: 'africapool', num: 'C-1A', hall: 'Hall 1', area: 72, pricePerM2: 2800, status: 'disponible' },
  { id: 'p-D-1A', site: 'africapool', num: 'D-1A', hall: 'Hall 1', area: 72, pricePerM2: 2800, status: 'disponible' },
  { id: 'p-E-1A', site: 'africapool', num: 'E-1A', hall: 'Hall 1', area: 18, pricePerM2: 1800, status: 'vendu', companyName: 'POOL SPA', clientName: 'OUAFA lidya', category: 'Spas & Balnéothérapie' },
  { id: 'p-F-1A', site: 'africapool', num: 'F-1A', hall: 'Hall 1', area: 36, pricePerM2: 2800, status: 'disponible' },
  { id: 'p-F-1B', site: 'africapool', num: 'F-1B', hall: 'Hall 1', area: 36, pricePerM2: 2800, status: 'disponible' },
  { id: 'p-G-1A', site: 'africapool', num: 'G-1A', hall: 'Hall 1', area: 72, pricePerM2: 2800, status: 'disponible' },

  // Column H
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
    id: 't-ap-1',
    num: 'FA-2026-001',
    clientName: 'youssef Elhafid',
    companyName: 'CCEI',
    site: 'africapool',
    type: 'facture',
    amount: 45000,
    status: 'envoye',
    date: '2026-05-10',
    dueDate: '2026-06-10',
    advancePaid: 27000,
    items: [
      { id: 'item-1', description: 'Stand d\'angle 36m² (surface nue)', quantity: 1, unitPrice: 45000 }
    ],
    notes: 'Exposant validé'
  },
  {
    id: 't-ap-2',
    num: 'FA-2026-002',
    clientName: 'Nawal',
    companyName: 'First Water',
    site: 'africapool',
    type: 'facture',
    amount: 24000,
    status: 'envoye',
    date: '2026-05-12',
    dueDate: '2026-06-12',
    advancePaid: 0,
    items: [
      { id: 'item-2', description: 'Stand 18m² (surface équipé) + Frais d\'inscription', quantity: 1, unitPrice: 24000 }
    ],
    notes: 'Exposant validé - Reliquat complet à régler'
  },
  {
    id: 't-ap-3',
    num: 'FA-2026-003',
    clientName: 'Belkacem Achaour ( Gérant )',
    companyName: 'ATLANTA POMPE',
    site: 'africapool',
    type: 'facture',
    amount: 57000,
    status: 'envoye',
    date: '2026-05-15',
    dueDate: '2026-06-15',
    advancePaid: 34200,
    items: [
      { id: 'item-3', description: 'Stand 36m² (surface équipé)', quantity: 1, unitPrice: 57000 }
    ],
    notes: 'Exposant validé'
  },
  {
    id: 't-ap-4',
    num: 'FA-2026-004',
    clientName: 'mohamed',
    companyName: 'Frio Equipement',
    site: 'africapool',
    type: 'facture',
    amount: 73500,
    status: 'envoye',
    date: '2026-05-18',
    dueDate: '2026-06-18',
    advancePaid: 44100,
    items: [
      { id: 'item-4', description: 'Stand 72m² (surface nue) + Frais d\'inscription', quantity: 1, unitPrice: 73500 }
    ],
    notes: 'Exposant validé'
  },
  {
    id: 't-ap-5',
    num: 'FA-2026-005',
    clientName: 'Oussama Amine',
    companyName: 'Paledo',
    site: 'africapool',
    type: 'facture',
    amount: 41666.67,
    status: 'envoye',
    date: '2026-05-20',
    dueDate: '2026-06-20',
    advancePaid: 25000,
    items: [
      { id: 'item-5', description: 'Stand 36m² (surface nue) - Forfait Global', quantity: 1, unitPrice: 41666.67 }
    ],
    notes: 'Exposant validé'
  },
  {
    id: 't-ap-6',
    num: 'FA-2026-006',
    clientName: 'tarek sekkat',
    companyName: 'saya line',
    site: 'africapool',
    type: 'facture',
    amount: 25200,
    status: 'envoye',
    date: '2026-05-22',
    dueDate: '2026-06-22',
    advancePaid: 15120,
    items: [
      { id: 'item-6', description: 'Stand 18m² (surface NUE)', quantity: 1, unitPrice: 25200 }
    ],
    notes: 'Exposant validé'
  },
  {
    id: 't-ap-7',
    num: 'FA-2026-007',
    clientName: 'OUAFA lidya',
    companyName: 'POOL SPA',
    site: 'africapool',
    type: 'facture',
    amount: 34800,
    status: 'envoye',
    date: '2026-05-24',
    dueDate: '2026-06-24',
    advancePaid: 20000,
    items: [
      { id: 'item-7', description: 'Stand 18m² (surface équipé) + Frais d\'inscription', quantity: 1, unitPrice: 34800 }
    ],
    notes: 'Exposant validé'
  },
  {
    id: 't-ap-8',
    num: 'FA-2026-008',
    clientName: 'Yoan Di cosimo',
    companyName: 'HWG - hitech water group',
    site: 'africapool',
    type: 'facture',
    amount: 58333.33,
    status: 'envoye',
    date: '2026-05-26',
    dueDate: '2026-06-26',
    advancePaid: 10000,
    items: [
      { id: 'item-8', description: 'Stand 72m² (surface NUE) - Forfait Global', quantity: 1, unitPrice: 58333.33 }
    ],
    notes: 'Exposant validé'
  },
  {
    id: 't-ap-9',
    num: 'FA-2026-009',
    clientName: 'SARA',
    companyName: 'med yassine sanitaire ALTEZA',
    site: 'africapool',
    type: 'facture',
    amount: 45600,
    status: 'envoye',
    date: '2026-05-28',
    dueDate: '2026-06-28',
    advancePaid: 0,
    items: [
      { id: 'item-9', description: 'Stand 18m² EQUIPE + Frais d\'inscription', quantity: 1, unitPrice: 45600 }
    ],
    notes: 'Exposant validé - Reliquat compet'
  },
  {
    id: 't-ap-10',
    num: 'FA-2026-010',
    clientName: 'DAISY',
    companyName: 'swin.led',
    site: 'africapool',
    type: 'facture',
    amount: 22500,
    status: 'envoye',
    date: '2026-05-30',
    dueDate: '2026-06-30',
    advancePaid: 0,
    items: [
      { id: 'item-10', description: 'Stand 9m² EQUIPE', quantity: 1, unitPrice: 22500 }
    ],
    notes: 'Exposant validé'
  },
  {
    id: 't-ap-11',
    num: 'FA-2026-011',
    clientName: 'MOHAMED',
    companyName: 'MISR POOL TECHNOLOGY',
    site: 'africapool',
    type: 'facture',
    amount: 16500,
    status: 'envoye',
    date: '2026-06-01',
    dueDate: '2026-07-01',
    advancePaid: 0,
    items: [
      { id: 'item-11', description: 'Stand 9m² EQUIPE', quantity: 1, unitPrice: 16500 }
    ],
    notes: 'Exposant validé'
  },
  {
    id: 't-ap-12',
    num: 'FA-2026-012',
    clientName: 'tarik bensadik',
    companyName: 'verso signature',
    site: 'africapool',
    type: 'facture',
    amount: 37500,
    status: 'envoye',
    date: '2026-06-02',
    dueDate: '2026-07-02',
    advancePaid: 0,
    items: [
      { id: 'item-12', description: 'Stand 36m² NUE - Tarifs direct signature', quantity: 1, unitPrice: 37500 }
    ],
    notes: 'Exposant validé'
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
