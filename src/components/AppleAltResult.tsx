import React, { useState, useEffect } from 'react';
import {
  Copy,
  Check,
  Volume2,
  VolumeX,
  Sparkles,
  RotateCw,
  CheckCircle2,
  FileText,
  SlidersHorizontal,
} from 'lucide-react';
import { AltAnalysisResult, AltStyle } from '../types';
import { copyToClipboard, speakText, stopSpeaking } from '../utils/helpers';
import confetti from 'canvas-confetti';

interface AppleAltResultProps {
  result: AltAnalysisResult;
  isLoading: boolean;
  onRegenerate: (newStyle?: AltStyle) => void;
}

export const AppleAltResult: React.FC<AppleAltResultProps> = ({
  result,
  isLoading,
  onRegenerate,
}) => {
  const [activeTab, setActiveTab] = useState<'standard' | 'descriptive' | 'social'>('standard');
  const [currentText, setCurrentText] = useState<string>(result.standardAlt);
  const [copied, setCopied] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Sync state when result changes
  useEffect(() => {
    if (activeTab === 'standard') {
      setCurrentText(result.standardAlt || '');
    } else if (activeTab === 'descriptive') {
      setCurrentText(result.detailedDescription || result.standardAlt || '');
    } else if (activeTab === 'social') {
      setCurrentText(result.socialAlt || result.standardAlt || '');
    }
  }, [result, activeTab]);

  const handleCopy = async () => {
    const success = await copyToClipboard(currentText);
    if (success) {
      setCopied(true);
      try {
        confetti({
          particleCount: 28,
          spread: 45,
          origin: { y: 0.85 },
          colors: ['#0071e3', '#34c759', '#5856d6'],
        });
      } catch (_) {}
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleToggleSpeak = () => {
    if (isSpeaking) {
      stopSpeaking();
      setIsSpeaking(false);
    } else {
      setIsSpeaking(true);
      speakText(
        currentText,
        'pt-BR',
        () => setIsSpeaking(false),
        () => setIsSpeaking(false)
      );
    }
  };

  const handleTabChange = (tab: 'standard' | 'descriptive' | 'social') => {
    setActiveTab(tab);
    stopSpeaking();
    setIsSpeaking(false);
    if (tab === 'standard') setCurrentText(result.standardAlt || '');
    if (tab === 'descriptive') setCurrentText(result.detailedDescription || '');
    if (tab === 'social') setCurrentText(result.socialAlt || '');
  };

  const charCount = currentText.length;
  const isIdealLength = charCount >= 50 && charCount <= 140;

  return (
    <div className="w-full bg-white rounded-2xl border border-neutral-200/80 p-5 sm:p-6 shadow-[0_2px_12px_rgba(0,0,0,0.04)] space-y-4">
      {/* Top Header & Style Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-100 pb-3.5">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-semibold text-neutral-800 tracking-tight">
            Texto Alternativo Gerado
          </span>
          {result.wcagScore && (
            <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60">
              WCAG 2.2 AAA ({result.wcagScore}%)
            </span>
          )}
        </div>

        {/* Apple Style Segmented Pill Control */}
        <div className="flex items-center bg-neutral-100 p-1 rounded-xl border border-neutral-200/50 self-start sm:self-auto">
          <button
            id="tab-alt-standard"
            onClick={() => handleTabChange('standard')}
            className={`px-3 py-1 text-xs font-medium rounded-lg transition-all ${
              activeTab === 'standard'
                ? 'bg-white text-neutral-900 shadow-xs'
                : 'text-neutral-500 hover:text-neutral-800'
            }`}
          >
            Conciso
          </button>
          <button
            id="tab-alt-descriptive"
            onClick={() => handleTabChange('descriptive')}
            className={`px-3 py-1 text-xs font-medium rounded-lg transition-all ${
              activeTab === 'descriptive'
                ? 'bg-white text-neutral-900 shadow-xs'
                : 'text-neutral-500 hover:text-neutral-800'
            }`}
          >
            Descritivo
          </button>
          <button
            id="tab-alt-social"
            onClick={() => handleTabChange('social')}
            className={`px-3 py-1 text-xs font-medium rounded-lg transition-all ${
              activeTab === 'social'
                ? 'bg-white text-neutral-900 shadow-xs'
                : 'text-neutral-500 hover:text-neutral-800'
            }`}
          >
            Redes Sociais
          </button>
        </div>
      </div>

      {/* Editable ALT Text Area */}
      <div className="relative group">
        <textarea
          id="alt-text-output"
          rows={3}
          value={currentText}
          onChange={(e) => setCurrentText(e.target.value)}
          className="w-full text-sm sm:text-base font-normal text-neutral-900 bg-neutral-50/60 hover:bg-neutral-50 focus:bg-white p-4 rounded-xl border border-neutral-200 focus:border-neutral-400 focus:ring-4 focus:ring-neutral-200/50 outline-hidden transition-all resize-none leading-relaxed"
          placeholder="O texto alternativo aparecerá aqui..."
        />

        {/* Speech indicator waves if speaking */}
        {isSpeaking && (
          <div className="absolute top-3 right-3 flex items-center gap-1 bg-neutral-900/90 text-white text-[10px] font-medium px-2 py-1 rounded-full backdrop-blur-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            <span>Lendo em áudio...</span>
          </div>
        )}
      </div>

      {/* Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
        {/* Character Count & Compliance Pill */}
        <div className="flex items-center gap-2 text-xs text-neutral-500">
          <span className={`font-mono font-medium ${isIdealLength ? 'text-neutral-700' : 'text-amber-600'}`}>
            {charCount} caracteres
          </span>
          <span className="text-neutral-300">•</span>
          <span className="text-[11px] text-neutral-400">
            {isIdealLength ? 'Tamanho ideal para leitores de tela' : 'Tamanho aceitável'}
          </span>
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-2">
          {/* Listen Button */}
          <button
            id="btn-speak-alt"
            onClick={handleToggleSpeak}
            className={`px-3 py-2 rounded-xl text-xs font-medium border transition-all flex items-center gap-1.5 active:scale-95 ${
              isSpeaking
                ? 'bg-rose-50 border-rose-200 text-rose-700'
                : 'bg-neutral-100 hover:bg-neutral-200/80 border-neutral-200 text-neutral-700'
            }`}
            title="Ouvir como leitor de tela"
          >
            {isSpeaking ? (
              <>
                <VolumeX className="w-3.5 h-3.5 text-rose-600" />
                <span>Parar</span>
              </>
            ) : (
              <>
                <Volume2 className="w-3.5 h-3.5 text-neutral-600" />
                <span>Ouvir</span>
              </>
            )}
          </button>

          {/* Regenerate Button */}
          <button
            id="btn-regenerate-alt"
            onClick={() => onRegenerate(activeTab)}
            disabled={isLoading}
            className="p-2 bg-neutral-100 hover:bg-neutral-200/80 border border-neutral-200 text-neutral-700 rounded-xl text-xs transition-all active:scale-95 disabled:opacity-50"
            title="Regerar texto com IA"
          >
            <RotateCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>

          {/* Main Copy Button */}
          <button
            id="btn-copy-alt-main"
            onClick={handleCopy}
            className={`px-4 py-2 rounded-xl text-xs font-semibold shadow-xs transition-all flex items-center gap-1.5 active:scale-95 ${
              copied
                ? 'bg-emerald-600 text-white'
                : 'bg-neutral-900 hover:bg-black text-white'
            }`}
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5" />
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
      </div>

      {/* OCR Tag (if text was detected inside image) */}
      {result.extractedText && (
        <div className="mt-3 p-3 rounded-xl bg-neutral-50 border border-neutral-200/60 flex items-start gap-2.5 text-xs text-neutral-600">
          <FileText className="w-4 h-4 text-neutral-400 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <span className="font-semibold text-neutral-800">Texto detectado na imagem (OCR):</span>
            <p className="text-neutral-600 font-mono text-[11px] bg-white px-2 py-1 rounded border border-neutral-200/80">
              "{result.extractedText}"
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
