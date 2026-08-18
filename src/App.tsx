import React, { useState, useEffect } from 'react';
import { AppleDropzone } from './components/AppleDropzone';
import { AppleAltResult } from './components/AppleAltResult';
import { ExtensionModal } from './components/ExtensionModal';
import { PublishToStoreModal } from './components/PublishToStoreModal';
import { AltAnalysisResult, AltStyle } from './types';
import {
  Sparkles,
  Chrome,
  AlertCircle,
  Eye,
  CheckCircle2,
  HelpCircle,
  BookOpen,
  Store,
  Upload,
  Download,
} from 'lucide-react';
import { ExtensionSimulator } from './components/ExtensionSimulator';

export default function App() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedMimeType, setSelectedMimeType] = useState<string>('image/jpeg');
  const [isLoading, setIsLoading] = useState(false);
  const [altResult, setAltResult] = useState<AltAnalysisResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isExtensionModalOpen, setIsExtensionModalOpen] = useState(false);
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const [showLiveSimulator, setShowLiveSimulator] = useState(false);

  // Automatic Generation as soon as image is loaded
  const generateAltForImage = async (base64Data: string, mimeType: string, style: AltStyle = 'standard') => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await fetch('/api/generate-alt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: base64Data,
          mimeType: mimeType || 'image/jpeg',
          language: 'pt-BR',
          style: style,
          context: 'general',
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Falha ao processar a imagem.');
      }

      setAltResult(data.data);
    } catch (err: any) {
      console.error('Erro na geração:', err);
      setErrorMessage(err.message || 'Erro temporário ao gerar o texto alternativo.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageSelected = (base64: string, mimeType: string) => {
    setSelectedImage(base64);
    setSelectedMimeType(mimeType);
    generateAltForImage(base64, mimeType, 'standard');
  };

  const handleClearImage = () => {
    setSelectedImage(null);
    setAltResult(null);
    setErrorMessage(null);
  };

  const handleRegenerate = (style: AltStyle = 'standard') => {
    if (selectedImage) {
      generateAltForImage(selectedImage, selectedMimeType, style);
    }
  };

  // Helper for Simulator to run AI generation in background
  const handleSimulateAi = async (base64Data: string, platformContext: string): Promise<string> => {
    const response = await fetch('/api/generate-alt', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        imageBase64: base64Data,
        mimeType: 'image/jpeg',
        language: 'pt-BR',
        style: 'standard',
        context: platformContext,
      }),
    });

    const data = await response.json();
    if (data.success && data.data?.standardAlt) {
      return data.data.standardAlt;
    }
    return 'Descrição acessível da imagem com foco no elemento principal da cena.';
  };

  return (
    <div className="min-h-screen bg-[#F5F5F7] text-neutral-900 flex flex-col font-sans selection:bg-neutral-900 selection:text-white">
      {/* Apple Minimalist Top Header */}
      <header className="w-full max-w-2xl mx-auto px-4 pt-8 pb-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl overflow-hidden shadow-xs border border-neutral-200/60 bg-neutral-950 flex items-center justify-center">
            <img src="/favicon.svg" alt="AutoAlt AI Avatar" className="w-full h-full object-cover" />
          </div>
          <div>
            <h1 className="text-sm font-semibold text-neutral-900 tracking-tight flex items-center gap-1.5">
              <span>AutoAlt</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-neutral-200/80 text-neutral-600 font-medium">
                AI Plugin
              </span>
            </h1>
          </div>
        </div>

        {/* Top Right Action: Download Plugin & Publish to Store */}
        <div className="flex items-center gap-2">
          <button
            id="btn-open-publish-modal"
            onClick={() => setIsPublishModalOpen(true)}
            className="px-3.5 py-1.5 rounded-xl bg-neutral-900 hover:bg-black text-white text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-all active:scale-95"
          >
            <Chrome className="w-3.5 h-3.5 text-white" />
            <span>Publicar na Store</span>
          </button>

          <button
            id="btn-open-plugin-modal"
            onClick={() => setIsExtensionModalOpen(true)}
            className="px-3 py-1.5 rounded-xl bg-white hover:bg-neutral-50 text-neutral-700 text-xs font-medium border border-neutral-200/80 shadow-[0_1px_2px_rgba(0,0,0,0.04)] flex items-center gap-1.5 transition-all active:scale-95"
          >
            <Download className="w-3.5 h-3.5 text-neutral-500" />
            <span className="hidden sm:inline">Testar</span>
            <span>.ZIP</span>
          </button>
        </div>
      </header>

      {/* Main Single Screen Content */}
      <main className="flex-1 w-full max-w-2xl mx-auto px-4 py-4 space-y-4">
        {/* Subtitle / Promise */}
        <div className="text-center space-y-1 py-1">
          <h2 className="text-lg sm:text-xl font-semibold text-neutral-900 tracking-tight">
            Gere o texto ALT da imagem em segundos.
          </h2>
          <p className="text-xs text-neutral-500 max-w-md mx-auto">
            Suba ou cole uma foto. A IA lê a imagem e entrega a descrição acessível ideal para leitores de tela e SEO.
          </p>
        </div>

        {/* Error Banner if any */}
        {errorMessage && (
          <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
              <span>{errorMessage}</span>
            </div>
            {selectedImage && (
              <button
                onClick={() => handleRegenerate('standard')}
                disabled={isLoading}
                className="px-2.5 py-1 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-medium shrink-0 transition-colors"
              >
                Tentar de novo
              </button>
            )}
          </div>
        )}

        {/* Step 1: Upload / Dropzone */}
        <AppleDropzone
          onImageSelected={handleImageSelected}
          selectedImage={selectedImage}
          onClear={handleClearImage}
          isLoading={isLoading}
        />

        {/* Step 2: Loading State (Apple Pulse) */}
        {isLoading && (
          <div className="w-full bg-white rounded-2xl border border-neutral-200/80 p-6 shadow-xs flex flex-col items-center justify-center text-center space-y-3 animate-pulse">
            <div className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-neutral-400 animate-spin" />
            </div>
            <div className="space-y-1">
              <p className="text-xs font-semibold text-neutral-800">Lendo imagem e gerando texto ALT...</p>
              <p className="text-[11px] text-neutral-400">Analisando composição, sujeitos e diretrizes WCAG 2.2</p>
            </div>
          </div>
        )}

        {/* Step 3: Result Card */}
        {altResult && !isLoading && (
          <AppleAltResult
            result={altResult}
            isLoading={isLoading}
            onRegenerate={handleRegenerate}
          />
        )}

        {/* Toggle to see Chrome Extension in simulated social networks */}
        <div className="pt-4 flex flex-col items-center">
          <button
            id="btn-toggle-simulator"
            onClick={() => setShowLiveSimulator(!showLiveSimulator)}
            className="px-4 py-2 rounded-full bg-neutral-200/60 hover:bg-neutral-200 text-neutral-700 text-xs font-medium transition-all flex items-center gap-1.5"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>{showLiveSimulator ? 'Ocultar Simulador no Navegador' : 'Ver como o Plugin funciona no Twitter/LinkedIn'}</span>
          </button>
        </div>

        {/* Live Simulator (Revealed on Click) */}
        {showLiveSimulator && (
          <div className="pt-2 animate-in fade-in duration-300">
            <ExtensionSimulator onSimulateAi={handleSimulateAi} />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="w-full max-w-2xl mx-auto px-4 py-6 text-center text-[11px] text-neutral-400">
        <p>AutoAlt AI • Acessibilidade WCAG 2.2 • Desenvolvido para Google Chrome</p>
      </footer>

      {/* Extension Download & Installation Modal */}
      <ExtensionModal
        isOpen={isExtensionModalOpen}
        onClose={() => setIsExtensionModalOpen(false)}
      />

      {/* Chrome Web Store Official Publish Modal */}
      <PublishToStoreModal
        isOpen={isPublishModalOpen}
        onClose={() => setIsPublishModalOpen(false)}
      />
    </div>
  );
}
