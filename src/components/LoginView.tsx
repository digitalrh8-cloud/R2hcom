/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Lock, Mail, ArrowRight, Eye, EyeOff, ShieldCheck, Sparkles, Building2 } from 'lucide-react';
import R2HLogo from './R2HLogo';

interface LoginViewProps {
  onLoginSuccess: (adminName: string) => void;
}

export default function LoginView({ onLoginSuccess }: LoginViewProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    // Simulate database lookup / validation
    setTimeout(() => {
      const cleanEmail = email.trim().toLowerCase();
      const cleanPassword = password.trim();

      // Flexible validation supporting full enterprise emails or generic quick ids
      if (
        (cleanEmail === 'admin@r2h.ma' && cleanPassword === 'admin2026') ||
        (cleanEmail === 'admin' && cleanPassword === 'admin') ||
        (cleanEmail === 'digitalrh8@gmail.com' && cleanPassword === 'admin')
      ) {
        setIsLoading(false);
        onLoginSuccess('Mehdi Rahho');
      } else {
        setIsLoading(false);
        setError('Adresse e-mail ou mot de passe incorrect. Veuillez vérifier vos identifiants de connexion.');
      }
    }, 800);
  };

  return (
    <div id="login-view-container" className="min-h-screen w-screen flex items-center justify-center bg-[#F8F7F2] p-4 relative overflow-hidden font-sans">
      {/* Decorative organic background accents matching R2H style */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-[#7E8F7A]/5 blur-3xl"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-[#A68A64]/5 blur-3xl"></div>

      <div className="w-full max-w-md bg-white rounded-3xl border border-[#E8E6DE] shadow-xl p-8 relative z-10 transition-all duration-300">
        
        {/* R2H Branched Header Icon */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-18 h-18 text-[#0c5494] flex items-center justify-center mb-4 select-none">
            <R2HLogo className="w-full h-full" />
          </div>
          <h1 className="text-2xl font-serif font-black text-[#2D2D2D] tracking-tight">R2H Communication</h1>
          <p className="text-xs text-[#7A7667] mt-1 font-medium">Portail de Gestion & Back-Office Multi-Salons</p>
        </div>

        {/* Form Container */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email field */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-[#7A7667] uppercase tracking-wider block">Identifiant / E-mail</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-[13px] w-4 h-4 text-[#7A7667]" />
              <input
                type="text"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Ex : admin@r2h.ma"
                className="w-full pl-10 pr-4 py-3 bg-[#F8F7F2] border border-[#E8E6DE] rounded-xl text-xs outline-hidden text-[#2D2D2D] font-sans placeholder-[#7A7667]/50 focus:border-[#A68A64] transition-all"
              />
            </div>
          </div>

          {/* Password field */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="text-[10px] font-bold text-[#7A7667] uppercase tracking-wider block">Mot de passe</label>
            </div>
            <div className="relative">
              <Lock className="absolute left-3.5 top-[13px] w-4 h-4 text-[#7A7667]" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mot de passe d'administration"
                className="w-full pl-10 pr-10 py-3 bg-[#F8F7F2] border border-[#E8E6DE] rounded-xl text-xs outline-hidden text-[#2D2D2D] font-mono focus:border-[#A68A64] transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-3 text-[#7A7667] hover:text-[#2D2D2D] outline-hidden cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Validation error feedback */}
          {error && (
            <div className="p-3.5 bg-red-50 border border-red-200/60 rounded-xl text-red-700 text-xs font-semibold leading-relaxed animate-shake">
              {error}
            </div>
          )}

          {/* Submit Action Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 bg-[#2C3E36] hover:bg-[#202E28] disabled:bg-[#2C3E36]/70 text-white font-semibold rounded-xl shadow-md cursor-pointer transition-all flex items-center justify-center gap-2 text-xs"
          >
            {isLoading ? (
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
            ) : (
              <>
                <span>Se connecter au Back-Office</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Workspace Security Note */}
        <div className="mt-8 pt-6 border-t border-[#E8E6DE]/60">
          <div className="bg-[#F8F7F2] border border-[#E8E6DE] rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <ShieldCheck className="w-4 h-4 text-[#A68A64]" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#2D2D2D]">Accès Sécurisé</span>
            </div>
            <p className="text-[11px] text-[#7A7667] leading-normal">
              Portail d'administration chiffré. L'accès est restreint aux collaborateurs autorisés de R2H Communication possédant les habilitations requises.
            </p>
          </div>
        </div>

        {/* Global Footer */}
        <div className="mt-6 text-center">
          <p className="text-[9px] text-[#7A7667] font-semibold uppercase tracking-wider">
            R2H Communication © 2026 — Workspace Sécurisé
          </p>
        </div>

      </div>
    </div>
  );
}
