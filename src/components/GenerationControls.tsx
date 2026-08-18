import React from 'react';
import { Sparkles, Globe2, Sliders, Target, Tag, ArrowRight } from 'lucide-react';
import { LanguageCode, AltStyle, PlatformContext } from '../types';

interface GenerationControlsProps {
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  style: AltStyle;
  setStyle: (style: AltStyle) => void;
  context: PlatformContext;
  setContext: (ctx: PlatformContext) => void;
  targetKeywords: string;
  setTargetKeywords: (keywords: string) => void;
  onGenerate: () => void;
  isLoading: boolean;
  hasImage: boolean;
}

export const GenerationControls: React.FC<GenerationControlsProps> = ({
  language,
  setLanguage,
  style,
  setStyle,
  context,
  setContext,
  targetKeywords,
  setTargetKeywords,
  onGenerate,
  isLoading,
  hasImage,
}) => {
  return (
    <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-sky-400" />
          <h3 className="text-sm font-semibold text-slate-200">Parâmetros de Geração de ALT</h3>
        </div>
        <span className="text-[11px] text-slate-400">Gemini 3.7 Flash Vision</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Idioma */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
            <Globe2 className="w-3.5 h-3.5 text-sky-400" />
            Idioma de Saída
          </label>
          <select
            id="select-language"
            value={language}
            onChange={(e) => setLanguage(e.target.value as LanguageCode)}
            className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-sky-500 transition-colors"
          >
            <option value="pt-BR">🇧🇷 Português (Brasil)</option>
            <option value="en-US">🇺🇸 English (US)</option>
            <option value="es-ES">🇪🇸 Español</option>
            <option value="fr-FR">🇫🇷 Français</option>
            <option value="de-DE">🇩🇪 Deutsch</option>
          </select>
        </div>

        {/* Estilo WCAG / Tom */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            Estilo / Diretriz
          </label>
          <select
            id="select-style"
            value={style}
            onChange={(e) => setStyle(e.target.value as AltStyle)}
            className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-sky-500 transition-colors"
          >
            <option value="standard">🎯 Padrão WCAG (Conciso 70-125 char)</option>
            <option value="descriptive">🎨 Detalhado (Ambiente, Cores e Expressões)</option>
            <option value="ecommerce">🛍️ E-commerce & Catálogo de Produto</option>
            <option value="social">💬 Redes Sociais (Engajador & Contextual)</option>
            <option value="technical">📊 Técnico / Gráficos & Infográficos</option>
          </select>
        </div>

        {/* Contexto da Plataforma */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
            <Target className="w-3.5 h-3.5 text-indigo-400" />
            Plataforma Alvo
          </label>
          <select
            id="select-context"
            value={context}
            onChange={(e) => setContext(e.target.value as PlatformContext)}
            className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-sky-500 transition-colors"
          >
            <option value="general">🌐 Web Geral / HTML Standard</option>
            <option value="twitter">🐦 X (Antigo Twitter)</option>
            <option value="linkedin">💼 LinkedIn Post</option>
            <option value="instagram">📸 Instagram / Threads</option>
            <option value="wordpress">📝 WordPress / CMS Blog</option>
            <option value="ecommerce">🛒 Shopify / E-commerce</option>
          </select>
        </div>
      </div>

      {/* SEO Keywords */}
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
          <Tag className="w-3.5 h-3.5 text-emerald-400" />
          Palavras-chave SEO Opcionais (separadas por vírgula)
        </label>
        <input
          id="input-keywords"
          type="text"
          placeholder="Ex: tenis corrida masculino, amortecimento boost, lancamento 2026"
          value={targetKeywords}
          onChange={(e) => setTargetKeywords(e.target.value)}
          className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-sky-500 transition-colors"
        />
      </div>

      {/* Generate Action Button */}
      <div className="pt-2">
        <button
          id="btn-generate-alt"
          onClick={onGenerate}
          disabled={!hasImage || isLoading}
          className={`w-full py-3 px-4 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 shadow-lg transition-all ${
            !hasImage
              ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700/50'
              : isLoading
              ? 'bg-sky-600/80 text-white cursor-wait'
              : 'bg-gradient-to-r from-sky-500 via-indigo-500 to-purple-600 hover:from-sky-400 hover:to-purple-500 text-white shadow-sky-500/25 hover:shadow-sky-500/40 hover:scale-[1.008]'
          }`}
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Analisando imagem com IA e gerando ALT acessível...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>Gerar Texto ALT com Inteligência Artificial</span>
              <ArrowRight className="w-4 h-4 ml-1 opacity-80" />
            </>
          )}
        </button>
      </div>
    </div>
  );
};
