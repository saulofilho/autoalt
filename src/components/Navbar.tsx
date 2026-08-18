import React from 'react';
import { Sparkles, Eye, Chrome, Code2, BookOpen, Layers } from 'lucide-react';

interface NavbarProps {
  activeTab: 'studio' | 'simulator' | 'extension' | 'guide';
  setActiveTab: (tab: 'studio' | 'simulator' | 'extension' | 'guide') => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab }) => {
  return (
    <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500 via-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-sky-500/20 ring-1 ring-white/20">
              <Sparkles className="w-5 h-5 text-white animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg text-slate-100 tracking-tight">AutoAlt</span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20">
                  AI Chrome Plugin
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">Acessibilidade Inteligente & Geração Automática de ALT</p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex items-center gap-1 sm:gap-2 bg-slate-900/90 p-1 rounded-xl border border-slate-800">
            <button
              id="nav-tab-studio"
              onClick={() => setActiveTab('studio')}
              className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                activeTab === 'studio'
                  ? 'bg-sky-600 text-white shadow-sm shadow-sky-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Eye className="w-4 h-4" />
              <span className="hidden md:inline">Laboratório & IA</span>
              <span className="md:hidden">IA</span>
            </button>

            <button
              id="nav-tab-simulator"
              onClick={() => setActiveTab('simulator')}
              className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                activeTab === 'simulator'
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Chrome className="w-4 h-4 text-emerald-400" />
              <span className="hidden md:inline">Simulador da Extensão</span>
              <span className="md:hidden">Simulador</span>
            </button>

            <button
              id="nav-tab-extension"
              onClick={() => setActiveTab('extension')}
              className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                activeTab === 'extension'
                  ? 'bg-purple-600 text-white shadow-sm shadow-purple-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Code2 className="w-4 h-4" />
              <span className="hidden md:inline">Código do Plugin (V3)</span>
              <span className="md:hidden">Código</span>
            </button>

            <button
              id="nav-tab-guide"
              onClick={() => setActiveTab('guide')}
              className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                activeTab === 'guide'
                  ? 'bg-slate-800 text-slate-100 border border-slate-700'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <BookOpen className="w-4 h-4 text-amber-400" />
              <span className="hidden md:inline">Guia WCAG 2.2</span>
              <span className="md:hidden">Guia</span>
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
};
