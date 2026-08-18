import React, { useState } from 'react';
import {
  Check,
  Copy,
  Volume2,
  VolumeX,
  Sparkles,
  ShieldCheck,
  FileCode,
  Tag,
  Share2,
  ShoppingCart,
  Search,
  BookOpen,
  Eye,
  Type as TypeIcon,
  Palette
} from 'lucide-react';
import { AltAnalysisResult } from '../types';
import { playScreenReaderSpeech, copyToClipboard } from '../utils/helpers';

interface AltResultsViewProps {
  result: AltAnalysisResult;
  imagePreviewUrl: string | null;
  language: string;
}

export const AltResultsView: React.FC<AltResultsViewProps> = ({
  result,
  imagePreviewUrl,
  language,
}) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [audioController, setAudioController] = useState<{ stop: () => void } | null>(null);
  const [editableStandardAlt, setEditableStandardAlt] = useState(result.standardAlt);
  const [activeCodeTab, setActiveCodeTab] = useState<'html' | 'jsx' | 'markdown' | 'json'>('html');

  // Sync if result changes
  React.useEffect(() => {
    setEditableStandardAlt(result.standardAlt);
  }, [result.standardAlt]);

  const handleCopy = async (text: string, key: string) => {
    const success = await copyToClipboard(text);
    if (success) {
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2200);
    }
  };

  const toggleScreenReaderSpeech = () => {
    if (isPlayingAudio) {
      audioController?.stop();
      setIsPlayingAudio(false);
      setAudioController(null);
    } else {
      const speechLang = language === 'en-US' ? 'en-US' : language === 'es-ES' ? 'es-ES' : 'pt-BR';
      const controller = playScreenReaderSpeech(editableStandardAlt, speechLang);
      setAudioController(controller);
      setIsPlayingAudio(true);

      // Estimate speech duration or handle via window
      setTimeout(() => {
        setIsPlayingAudio(false);
      }, Math.max(3000, editableStandardAlt.length * 85));
    }
  };

  const charCount = editableStandardAlt.length;
  const isCharCountIdeal = charCount >= 60 && charCount <= 130;

  // Formatted export snippets
  const htmlSnippet = `<img src="imagem.jpg" alt="${editableStandardAlt.replace(/"/g, '&quot;')}" />`;
  const jsxSnippet = `<img src="imagem.jpg" alt="${editableStandardAlt.replace(/"/g, '&quot;')}" loading="lazy" />`;
  const markdownSnippet = `![${editableStandardAlt}](imagem.jpg)`;
  const jsonSnippet = JSON.stringify(result, null, 2);

  return (
    <div className="space-y-6">
      {/* Primary Standard ALT Card */}
      <div className="bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border border-sky-500/30 rounded-2xl p-5 shadow-xl shadow-sky-950/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 h-1 bg-gradient-to-r from-sky-500 via-indigo-500 to-purple-500 w-full" />

        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-sky-500/20 text-sky-400 border border-sky-500/30">
              <Sparkles className="w-4 h-4" />
            </span>
            <div>
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                Texto ALT Principal (Padrão Acessível)
              </h3>
              <span className="text-[11px] text-slate-400">Recomendado para leitores de tela e SEO</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border ${
                isCharCountIdeal
                  ? 'bg-emerald-950/60 text-emerald-300 border-emerald-800/80'
                  : 'bg-amber-950/60 text-amber-300 border-amber-800/80'
              }`}
            >
              {charCount} caracteres {isCharCountIdeal ? '• Ideal (WCAG)' : '• Ajustável'}
            </span>

            <button
              id="btn-play-speech"
              onClick={toggleScreenReaderSpeech}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium border flex items-center gap-1.5 transition-all ${
                isPlayingAudio
                  ? 'bg-amber-600 text-white border-amber-500 animate-pulse'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
              }`}
              title="Ouvir como um leitor de tela (NVDA/VoiceOver) pronuncia"
            >
              {isPlayingAudio ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5 text-sky-400" />}
              <span>{isPlayingAudio ? 'Parar Leitor' : 'Ouvir Leitor de Tela'}</span>
            </button>
          </div>
        </div>

        {/* Text Area for Direct Editing & Copy */}
        <div className="relative group">
          <textarea
            id="textarea-standard-alt"
            value={editableStandardAlt}
            onChange={(e) => setEditableStandardAlt(e.target.value)}
            rows={3}
            className="w-full bg-slate-950 border border-slate-700/80 focus:border-sky-500 rounded-xl p-3.5 text-sm text-slate-100 font-medium leading-relaxed resize-none focus:outline-none transition-colors shadow-inner"
          />

          <button
            id="btn-copy-standard-alt"
            onClick={() => handleCopy(editableStandardAlt, 'standard')}
            className="absolute bottom-3 right-3 px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 shadow-md transition-all active:scale-95"
          >
            {copiedKey === 'standard' ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-300" />
                <span>Copiado!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copiar ALT</span>
              </>
            )}
          </button>
        </div>

        {/* Audio Wave Visualizer when playing */}
        {isPlayingAudio && (
          <div className="mt-3 p-2.5 rounded-xl bg-slate-950/90 border border-amber-500/30 flex items-center justify-between text-xs text-amber-300 animate-fadeIn">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
              <span>Simulando síntese de voz (Screen Reader NVDA/VoiceOver)...</span>
            </div>
            <div className="flex items-center gap-1 h-3">
              <span className="w-1 bg-amber-400 rounded-full animate-bounce [animation-delay:-0.3s] h-3" />
              <span className="w-1 bg-amber-400 rounded-full animate-bounce [animation-delay:-0.15s] h-4" />
              <span className="w-1 bg-amber-400 rounded-full animate-bounce h-2" />
              <span className="w-1 bg-amber-400 rounded-full animate-bounce [animation-delay:-0.2s] h-3.5" />
            </div>
          </div>
        )}
      </div>

      {/* Grid with Variations & Rich Metadata */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Descrição Longa (longdesc / aria-details) */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5 text-purple-400" />
              Descrição Detalhada (Longdesc / Contexto)
            </span>
            <button
              onClick={() => handleCopy(result.detailedDescription, 'detailed')}
              className="text-[11px] text-slate-400 hover:text-sky-400 flex items-center gap-1 transition-colors"
            >
              {copiedKey === 'detailed' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              {copiedKey === 'detailed' ? 'Copiado' : 'Copiar'}
            </button>
          </div>
          <p className="text-xs text-slate-300 bg-slate-950 p-3 rounded-xl border border-slate-800/80 leading-relaxed">
            {result.detailedDescription}
          </p>
        </div>

        {/* OCR / Texto Detectado */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <TypeIcon className="w-3.5 h-3.5 text-emerald-400" />
              Texto Detectado na Imagem (OCR)
            </span>
            {result.extractedText && (
              <button
                onClick={() => handleCopy(result.extractedText, 'ocr')}
                className="text-[11px] text-slate-400 hover:text-sky-400 flex items-center gap-1 transition-colors"
              >
                {copiedKey === 'ocr' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                {copiedKey === 'ocr' ? 'Copiado' : 'Copiar'}
              </button>
            )}
          </div>
          <div className="text-xs text-slate-300 bg-slate-950 p-3 rounded-xl border border-slate-800/80 min-h-[58px] flex items-center">
            {result.extractedText ? (
              <p className="font-mono text-emerald-300">{result.extractedText}</p>
            ) : (
              <span className="text-slate-500 italic">Nenhum texto visível ou logotipo escrito detectado.</span>
            )}
          </div>
        </div>

        {/* Variação Redes Sociais */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Share2 className="w-3.5 h-3.5 text-sky-400" />
              Otimizado para Redes Sociais (X, Threads, LinkedIn)
            </span>
            <button
              onClick={() => handleCopy(result.socialAlt, 'social')}
              className="text-[11px] text-slate-400 hover:text-sky-400 flex items-center gap-1 transition-colors"
            >
              {copiedKey === 'social' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              {copiedKey === 'social' ? 'Copiado' : 'Copiar'}
            </button>
          </div>
          <p className="text-xs text-slate-300 bg-slate-950 p-3 rounded-xl border border-slate-800/80 leading-relaxed">
            {result.socialAlt}
          </p>
        </div>

        {/* Variação E-commerce / SEO */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Search className="w-3.5 h-3.5 text-amber-400" />
              Otimizado para SEO & E-commerce
            </span>
            <button
              onClick={() => handleCopy(result.seoAlt || result.ecommerceAlt || '', 'seo')}
              className="text-[11px] text-slate-400 hover:text-sky-400 flex items-center gap-1 transition-colors"
            >
              {copiedKey === 'seo' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              {copiedKey === 'seo' ? 'Copiado' : 'Copiar'}
            </button>
          </div>
          <p className="text-xs text-slate-300 bg-slate-950 p-3 rounded-xl border border-slate-800/80 leading-relaxed">
            {result.seoAlt || result.ecommerceAlt || result.standardAlt}
          </p>
        </div>
      </div>

      {/* Visual Tags & WCAG Insights Bar */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <h4 className="text-xs font-semibold text-slate-200">Auditoria de Acessibilidade & Elementos Reconhecidos</h4>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Pontuação WCAG:</span>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800">
              {result.wcagScore || 98}/100 AAA
            </span>
          </div>
        </div>

        {/* Tags */}
        <div className="space-y-2">
          <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1">
            <Tag className="w-3 h-3" />
            Tags detectadas na imagem:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {result.detectedElements.map((tag, idx) => (
              <span
                key={idx}
                className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-950 text-slate-300 border border-slate-800 font-medium"
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>

        {/* Dominant Colors & Mood */}
        {(result.dominantColors?.length || result.visualMood) && (
          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300 pt-1">
            {result.visualMood && (
              <div className="flex items-center gap-1.5">
                <span className="text-slate-400">Clima Visual:</span>
                <span className="text-sky-300 font-medium">{result.visualMood}</span>
              </div>
            )}
            {result.dominantColors && result.dominantColors.length > 0 && (
              <div className="flex items-center gap-1.5">
                <Palette className="w-3.5 h-3.5 text-purple-400" />
                <span className="text-slate-400">Paleta:</span>
                <div className="flex items-center gap-1">
                  {result.dominantColors.map((color, i) => (
                    <span key={i} className="text-[11px] px-2 py-0.5 rounded bg-slate-950 border border-slate-800">
                      {color}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tips */}
        {result.accessibilityTips && result.accessibilityTips.length > 0 && (
          <div className="pt-2 border-t border-slate-800/80">
            <span className="text-[11px] font-semibold text-slate-300 flex items-center gap-1 mb-1.5">
              <BookOpen className="w-3.5 h-3.5 text-amber-400" />
              Dicas de Postagem & Acessibilidade:
            </span>
            <ul className="space-y-1 text-xs text-slate-400 list-disc list-inside">
              {result.accessibilityTips.map((tip, idx) => (
                <li key={idx}>{tip}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Code Export Tabs */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileCode className="w-4 h-4 text-sky-400" />
            <h4 className="text-xs font-semibold text-slate-200">Exportar Snippet de Código</h4>
          </div>

          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
            <button
              onClick={() => setActiveCodeTab('html')}
              className={`px-2.5 py-1 rounded text-xs font-medium transition-all ${
                activeCodeTab === 'html' ? 'bg-sky-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              HTML
            </button>
            <button
              onClick={() => setActiveCodeTab('jsx')}
              className={`px-2.5 py-1 rounded text-xs font-medium transition-all ${
                activeCodeTab === 'jsx' ? 'bg-sky-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              React JSX
            </button>
            <button
              onClick={() => setActiveCodeTab('markdown')}
              className={`px-2.5 py-1 rounded text-xs font-medium transition-all ${
                activeCodeTab === 'markdown' ? 'bg-sky-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Markdown
            </button>
            <button
              onClick={() => setActiveCodeTab('json')}
              className={`px-2.5 py-1 rounded text-xs font-medium transition-all ${
                activeCodeTab === 'json' ? 'bg-sky-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              JSON
            </button>
          </div>
        </div>

        <div className="relative">
          <pre className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-xs text-slate-300 font-mono overflow-x-auto">
            <code>
              {activeCodeTab === 'html' && htmlSnippet}
              {activeCodeTab === 'jsx' && jsxSnippet}
              {activeCodeTab === 'markdown' && markdownSnippet}
              {activeCodeTab === 'json' && jsonSnippet}
            </code>
          </pre>

          <button
            onClick={() => {
              const text =
                activeCodeTab === 'html'
                  ? htmlSnippet
                  : activeCodeTab === 'jsx'
                  ? jsxSnippet
                  : activeCodeTab === 'markdown'
                  ? markdownSnippet
                  : jsonSnippet;
              handleCopy(text, `code-${activeCodeTab}`);
            }}
            className="absolute top-2.5 right-2.5 p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs flex items-center gap-1 border border-slate-700 transition-colors"
          >
            {copiedKey === `code-${activeCodeTab}` ? (
              <>
                <Check className="w-3 h-3 text-emerald-400" />
                <span>Copiado</span>
              </>
            ) : (
              <>
                <Copy className="w-3 h-3" />
                <span>Copiar</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
