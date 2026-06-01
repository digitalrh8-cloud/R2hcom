/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Mail, 
  Sparkles, 
  Send, 
  Layers, 
  Sliders, 
  Percent, 
  CheckCircle2, 
  Compass, 
  AlertCircle,
  Clock,
  ExternalLink,
  Edit3,
  BookOpen,
  PieChart
} from 'lucide-react';
import { SiteId, Campaign } from '../types';
import { initialSites } from '../initialData';

interface MarketingViewProps {
  selectedSite: SiteId;
  campaigns: Campaign[];
  setCampaigns: React.Dispatch<React.SetStateAction<Campaign[]>>;
}

export default function MarketingView({ selectedSite, campaigns, setCampaigns }: MarketingViewProps) {
  // Navigation states
  const [activePane, setActivePane] = useState<'liste' | 'redacteur'>('liste');
  
  // AI Form states
  const [targetAudience, setTargetAudience] = useState('Professionnels des piscines et paysagistes au Maroc');
  const [goal, setGoal] = useState('Inscrire et commercialiser les stands restants du salon Africa Pool & Spa');
  const [prompt, setPrompt] = useState('Rédiger une offre Early Bird avec 15% de rabais sur la réservation immédiate.');
  const [language, setLanguage] = useState<'fr' | 'en'>('fr');

  // Generator engine state
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationOutput, setGenerationOutput] = useState('');
  const [draftSubject, setDraftSubject] = useState('');
  const [draftName, setDraftName] = useState('Campagne IA de Relance');

  // Toast / Status messages
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Filters based on selected site context
  const siteFilter = (c: Campaign) => selectedSite === 'r2h' ? true : c.site === selectedSite;
  const filteredCampaigns = campaigns.filter(siteFilter);

  // Invoke Gemini AI server endpoint
  const handleQueryGeminiDrafter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt) return;

    setIsGenerating(true);
    setErrorMessage(null);
    setGenerationOutput('');

    try {
      const activeSiteName = initialSites.find(s => s.id === selectedSite)?.name || 'R2H Communication';

      const response = await fetch('/api/generate-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          siteName: activeSiteName,
          targetAudience,
          goal,
          language,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setGenerationOutput(data.emailText);
        
        // Extract a smart subject if found
        const lines = data.emailText.split('\n');
        const subjectLine = lines.find((l: string) => l.toLowerCase().startsWith('objet') || l.toLowerCase().startsWith('subject'));
        if (subjectLine) {
          setDraftSubject(subjectLine.replace(/^(objet|subject)\s*:\s*/i, ''));
        } else {
          setDraftSubject(`Invitation Spéciale — ${activeSiteName}`);
        }
      } else {
        throw new Error(data.error || 'Erreur lors de la génération avec Gemini.');
      }

    } catch (err: any) {
      console.error(err);
      setErrorMessage(
        err.message || "Une erreur s'est produite lors de l'appel de l'API Gemini. Configurez votre clé GEMINI_API_KEY dans le menu Secrets."
      );
    } finally {
      setIsGenerating(false);
    }
  };

  // Save generated email back to local state as a draft
  const handleSaveDraft = () => {
    if (!generationOutput) return;

    const newCampaign: Campaign = {
      id: `m_gen_${Date.now()}`,
      name: draftName,
      site: selectedSite === 'r2h' ? 'gardenexpo' : selectedSite,
      sentCount: 0,
      opens: 0,
      clicks: 0,
      status: 'brouillon',
      date: new Date().toISOString().split('T')[0],
      subject: draftSubject,
      content: generationOutput
    };

    setCampaigns(prev => [newCampaign, ...prev]);
    setActivePane('liste');
    triggerToast(`Brouillon "${draftName}" enregistré avec succès.`);
    setGenerationOutput('');
  };

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  return (
    <div id="marketing-view" className="flex-1 overflow-y-auto bg-slate-50/50 p-6 space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-4 right-4 bg-slate-900 border border-slate-700 text-white text-xs px-4 py-3 rounded-lg shadow-xl flex items-center gap-2 z-50 animate-bounce font-sans">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Marketing Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-xl font-display font-bold text-slate-800 tracking-tight">Emailing & Marketing Intelligent</h2>
          <p className="text-xs text-slate-500">
            Concevez et analysez vos compagnes d'emailing commerciales grâce à l'assistant de copie de Gemini.
          </p>
        </div>

        <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200/50 shrink-0 self-start sm:self-auto">
          <button
            onClick={() => setActivePane('liste')}
            className={`px-4 py-1.5 rounded-md text-xs font-semibold cursor-pointer transition-all ${
              activePane === 'liste' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500'
            }`}
          >
            Liste des Campagnes
          </button>
          <button
            onClick={() => setActivePane('redacteur')}
            className={`px-4 py-1.5 rounded-md text-xs font-semibold cursor-pointer transition-all flex items-center gap-1 ${
              activePane === 'redacteur' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-500" />
            <span>Rédacteur d'Emails IA</span>
          </button>
        </div>
      </div>

      {activePane === 'liste' ? (
        /* Outgoing campaigns list section */
        <div className="space-y-6">
          {/* Summary dashboard for open rates */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200/50 shadow-2xs flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-slate-400">TOTAL EMAILS ENVOYÉS</span>
                <h4 className="text-lg font-mono font-bold text-slate-800 mt-1">27,520</h4>
              </div>
              <Mail className="w-8 h-8 text-blue-100" />
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200/50 shadow-2xs flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-slate-400">OUVERTURES MOYENNES</span>
                <h4 className="text-lg font-mono font-bold text-slate-800 mt-1">34.5 %</h4>
              </div>
              <BookOpen className="w-8 h-8 text-emerald-100" />
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200/50 shadow-2xs flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-slate-400">CLICS CONVERTIS</span>
                <h4 className="text-lg font-mono font-bold text-slate-800 mt-1">11.8 %</h4>
              </div>
              <PieChart className="w-8 h-8 text-purple-100" />
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-gray-100">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-sans">Campagnes d'emailing enregistrées</h4>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-[10px] uppercase font-bold text-slate-400">
                    <th className="px-5 py-3">Nom de la Campagne</th>
                    <th className="px-5 py-3">Site assigné</th>
                    <th className="px-5 py-3">Destinataires</th>
                    <th className="px-5 py-3">Taux d'Ouverture</th>
                    <th className="px-5 py-3">Taux de Clics</th>
                    <th className="px-5 py-3">Date d'envoi</th>
                    <th className="px-5 py-3">Statut</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredCampaigns.length > 0 ? (
                    filteredCampaigns.map(camp => {
                      const openRate = camp.sentCount > 0 ? Math.round((camp.opens / camp.sentCount) * 100) : 0;
                      const clickRate = camp.opens > 0 ? Math.round((camp.clicks / camp.opens) * 100) : 0;
                      return (
                        <tr key={camp.id} className="hover:bg-slate-50/50 transition font-sans">
                          <td className="px-5 py-3.5 text-slate-800">
                            <div>
                              <p className="font-bold">{camp.name}</p>
                              <p className="text-[10px] text-slate-400 truncate max-w-[240px] mt-0.5">{camp.subject}</p>
                            </div>
                          </td>
                          <td className="px-5 py-3.5 font-medium text-slate-500">
                            {camp.site === 'africapool' ? 'africapoolspa.com' : camp.site === 'gardenexpo' ? 'gardenexpo.ma' : 'r2h.ma'}
                          </td>
                          <td className="px-5 py-3.5 font-mono font-medium">{camp.sentCount.toLocaleString()}</td>
                          <td className="px-5 py-3.5 font-mono text-emerald-600 font-semibold">{openRate}%</td>
                          <td className="px-5 py-3.5 font-mono text-blue-600 font-semibold">{clickRate}%</td>
                          <td className="px-5 py-3.5 text-slate-500 font-mono font-medium">{camp.date}</td>
                          <td className="px-5 py-3.5">
                            <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold ${
                              camp.status === 'envoye' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-slate-50 text-slate-400 border border-slate-200'
                            }`}>
                              {camp.status === 'envoye' ? 'Envoyé' : 'Brouillon'}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-400 font-sans">
                        <AlertCircle className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                        Aucune campagne enregistrée avec ces critères.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        /* Gemini model editor section */
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Controls form panel */}
          <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs">
            <h3 className="font-display font-semibold text-xs uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-purple-500" />
              <span>Paramètres de l'Assistant Gemini IA</span>
            </h3>

            <form onSubmit={handleQueryGeminiDrafter} className="space-y-4 text-xs font-sans text-slate-700">
              
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Audience / Public Cible de l'Email</label>
                <input
                  type="text"
                  required
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value)}
                  placeholder="Ex: Architectes d'intérieur et hôteliers à Marrakech..."
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg outline-hidden text-slate-700"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Objectif Commercial de l'Email</label>
                <input
                  type="text"
                  required
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                  placeholder="Ex: Proposer l'achat d'un stand de 18m² disponible"
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg outline-hidden text-slate-700"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Langue d'édition de la copie</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setLanguage('fr')}
                    className={`flex-1 py-1.5 rounded-lg border text-xs font-semibold cursor-pointer transition-all ${
                      language === 'fr' 
                        ? 'bg-blue-50 border-blue-400 text-blue-700 font-bold' 
                        : 'border-slate-200 text-slate-500 hover:bg-slate-50'
                    }`}
                  >
                    Français (Recommandé pour salons locaux)
                  </button>
                  <button
                    type="button"
                    onClick={() => setLanguage('en')}
                    className={`flex-1 py-1.5 rounded-lg border text-xs font-semibold cursor-pointer transition-all ${
                      language === 'en' 
                        ? 'bg-blue-50 border-blue-400 text-blue-700 font-bold' 
                        : 'border-slate-200 text-slate-500 hover:bg-slate-50'
                    }`}
                  >
                    Anglais (Pour exposants internationaux)
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Instructions ou arguments clés complémentaires *</label>
                <textarea
                  value={prompt}
                  required
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Ex: Mentionner que d'autres marques clés du secteur ont déjà réservé (AquaPools, GTS-GreenTech) pour créer de la réassurance..."
                  rows={4}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg outline-hidden text-slate-700 resize-none font-sans"
                />
              </div>

              <button
                type="submit"
                disabled={isGenerating}
                className="w-full py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold rounded-lg shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer text-xs"
              >
                {isGenerating ? (
                  <>
                    <Compass className="w-4 h-4 animate-spin" />
                    <span>Gemini rédige en français, veuillez patienter...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    <span>Rédiger l'Email de Prospection</span>
                  </>
                )}
              </button>

            </form>
          </div>

          {/* Output editor page */}
          <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
            <h3 className="font-display font-semibold text-xs uppercase tracking-wider text-slate-400 mb-4 pb-2 border-b">
              Copie générée par l'Intelligence Artificielle
            </h3>

            {isGenerating ? (
              <div className="flex-1 flex flex-col justify-center items-center py-16 gap-3.5 text-center text-xs text-slate-400">
                <div className="relative">
                  <div className="w-12 h-12 border-4 border-dashed border-purple-500 rounded-full animate-spin"></div>
                  <Sparkles className="w-5 h-5 text-amber-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
                </div>
                <div className="space-y-1 animate-pulse">
                  <p className="font-bold text-purple-600">Recherche de vocabulaire événementiel pertinent...</p>
                  <p className="text-[10px] text-slate-400">Génération de la structure de l'email par Gemini-3.5-Flash</p>
                </div>
              </div>
            ) : errorMessage ? (
              <div className="flex-1 flex flex-col justify-center items-center py-16 text-center text-xs text-rose-500 gap-2 font-sans border border-rose-100 rounded-xl p-4 bg-rose-50/10">
                <AlertCircle className="w-8 h-8 text-rose-400 shrink-0" />
                <div>
                  <p className="font-bold">{errorMessage}</p>
                </div>
              </div>
            ) : generationOutput ? (
              <div className="flex-1 space-y-4 text-xs font-sans text-slate-700 animate-in fade-in duration-300">
                
                {/* Draft details */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-slate-400 uppercase">Nom du Brouillon</label>
                    <input
                      type="text"
                      value={draftName}
                      onChange={(e) => setDraftName(e.target.value)}
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg outline-hidden text-slate-700"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-slate-400 uppercase">Objet de l'Email</label>
                    <input
                      type="text"
                      value={draftSubject}
                      onChange={(e) => setDraftSubject(e.target.value)}
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg outline-hidden text-slate-700"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Texte rédigé (Éditeur de message libre)</span>
                  <textarea
                    value={generationOutput}
                    onChange={(e) => setGenerationOutput(e.target.value)}
                    rows={12}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg outline-hidden text-slate-700 focus:ring-1 focus:ring-purple-400 font-mono text-[11px]"
                  />
                </div>

                <button
                  onClick={handleSaveDraft}
                  className="w-full py-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg shadow-sm transition-all cursor-pointer text-center text-xs flex items-center justify-center gap-1.5"
                >
                  <Send className="w-4 h-4 text-amber-300" />
                  <span>Enregistrer l'Email dans "Liste des Campagnes"</span>
                </button>
              </div>
            ) : (
              <div className="flex-1 flex flex-col justify-center items-center py-20 text-center text-slate-400 text-xs font-sans">
                <Compass className="w-8 h-8 text-slate-300 animate-spin" style={{ animationDuration: '6s' }} />
                <span>Réglez les critères à gauche et cliquez sur "Rédiger" pour lancer l'intelligence artificielle.</span>
              </div>
            )}
          </div>

        </div>
      )}

    </div>
  );
}
