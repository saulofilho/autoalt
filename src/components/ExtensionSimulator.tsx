import React, { useState, useRef } from 'react';
import {
  Chrome,
  Sparkles,
  Upload,
  Image as ImageIcon,
  CheckCircle2,
  Send,
  Sliders,
  Twitter,
  Linkedin,
  FileText,
  Instagram,
  RefreshCw,
  Eye,
  Check,
  Zap,
  Volume2
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { SAMPLE_IMAGES } from '../data/samples';
import { fileToBase64, playScreenReaderSpeech } from '../utils/helpers';

interface ExtensionSimulatorProps {
  onSimulateAi: (base64: string, platform: string) => Promise<string>;
}

export const ExtensionSimulator: React.FC<ExtensionSimulatorProps> = ({ onSimulateAi }) => {
  const [platform, setPlatform] = useState<'twitter' | 'linkedin' | 'wordpress' | 'instagram'>('twitter');
  const [postContent, setPostContent] = useState('Acabamos de lançar nosso novo projeto! Confiram a foto abaixo 👇🚀');
  const [uploadedImage, setUploadedImage] = useState<string | null>(SAMPLE_IMAGES[0].url);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [altText, setAltText] = useState('');
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const [autoFillEnabled, setAutoFillEnabled] = useState(true);
  const [extensionBadgeStatus, setExtensionBadgeStatus] = useState<string | null>(null);
  const [isAltModalOpen, setIsAltModalOpen] = useState(false);
  const [postPublished, setPostPublished] = useState(false);
  const [highlightInput, setHighlightInput] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize sample image base64 on first mount
  React.useEffect(() => {
    const loadInitialSample = async () => {
      try {
        const res = await fetch(SAMPLE_IMAGES[0].url);
        const blob = await res.blob();
        const b64 = await fileToBase64(new File([blob], 'sample.jpg', { type: 'image/jpeg' }));
        setImageBase64(b64);
        triggerAiAutoFill(b64, 'twitter');
      } catch (err) {
        console.error('Erro ao carregar imagem inicial do simulador:', err);
      }
    };
    loadInitialSample();
  }, []);

  const triggerAiAutoFill = async (base64Data: string, currentPlatform: string) => {
    if (!autoFillEnabled) return;
    setIsAiProcessing(true);
    setExtensionBadgeStatus('detecting');

    setTimeout(() => {
      setExtensionBadgeStatus('generating');
    }, 600);

    try {
      const generatedAlt = await onSimulateAi(base64Data, currentPlatform);
      setAltText(generatedAlt);
      setExtensionBadgeStatus('success');
      setHighlightInput(true);

      setTimeout(() => {
        setHighlightInput(false);
      }, 3500);

      setTimeout(() => {
        setExtensionBadgeStatus(null);
      }, 4500);
    } catch (err) {
      console.error('Erro no simulador:', err);
      setExtensionBadgeStatus('error');
    } finally {
      setIsAiProcessing(false);
    }
  };

  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (file.type.startsWith('image/')) {
        const b64 = await fileToBase64(file);
        setUploadedImage(b64);
        setImageBase64(b64);
        setPostPublished(false);
        triggerAiAutoFill(b64, platform);
      }
    }
  };

  const handleSelectSample = async (url: string) => {
    setUploadedImage(url);
    setPostPublished(false);
    try {
      const res = await fetch(url);
      const blob = await res.blob();
      const b64 = await fileToBase64(new File([blob], 'sample.jpg', { type: 'image/jpeg' }));
      setImageBase64(b64);
      triggerAiAutoFill(b64, platform);
    } catch (err) {
      console.error(err);
    }
  };

  const handlePublish = () => {
    setPostPublished(true);
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <Chrome className="w-5 h-5" />
            </div>
            <h2 className="text-base font-bold text-slate-100">
              Simulador do Plugin Chrome em Redes Sociais
            </h2>
          </div>
          <p className="text-xs text-slate-400">
            Veja exatamente como a extensão atua no navegador do usuário: ao arrastar ou subir uma foto no Twitter/X, LinkedIn ou WordPress, o plugin detecta o upload e preenche o campo ALT com IA!
          </p>
        </div>

        {/* Plugin Setting Switch in UI */}
        <div className="flex items-center gap-3 bg-slate-950 p-2.5 rounded-xl border border-slate-800 shrink-0">
          <div className="text-right">
            <span className="block text-xs font-semibold text-slate-200">Auto-Fill da Extensão</span>
            <span className="block text-[10px] text-slate-400">
              {autoFillEnabled ? 'Preenchimento Ativo' : 'Pausado'}
            </span>
          </div>
          <button
            onClick={() => setAutoFillEnabled(!autoFillEnabled)}
            className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors duration-200 ease-in-out ${
              autoFillEnabled ? 'bg-emerald-600' : 'bg-slate-700'
            }`}
          >
            <div
              className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ease-in-out ${
                autoFillEnabled ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Platform Selector Tabs */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold text-slate-400 mr-2">Simular Plataforma:</span>
        <button
          onClick={() => {
            setPlatform('twitter');
            if (imageBase64) triggerAiAutoFill(imageBase64, 'twitter');
          }}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-medium border transition-all ${
            platform === 'twitter'
              ? 'bg-sky-600/20 text-sky-300 border-sky-500/50 shadow-sm'
              : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700'
          }`}
        >
          <Twitter className="w-3.5 h-3.5" />
          <span>X / Twitter</span>
        </button>

        <button
          onClick={() => {
            setPlatform('linkedin');
            if (imageBase64) triggerAiAutoFill(imageBase64, 'linkedin');
          }}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-medium border transition-all ${
            platform === 'linkedin'
              ? 'bg-blue-600/20 text-blue-300 border-blue-500/50 shadow-sm'
              : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700'
          }`}
        >
          <Linkedin className="w-3.5 h-3.5" />
          <span>LinkedIn Post</span>
        </button>

        <button
          onClick={() => {
            setPlatform('wordpress');
            if (imageBase64) triggerAiAutoFill(imageBase64, 'wordpress');
          }}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-medium border transition-all ${
            platform === 'wordpress'
              ? 'bg-slate-700 text-slate-200 border-slate-600 shadow-sm'
              : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>WordPress / Blog Media</span>
        </button>

        <button
          onClick={() => {
            setPlatform('instagram');
            if (imageBase64) triggerAiAutoFill(imageBase64, 'instagram');
          }}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-medium border transition-all ${
            platform === 'instagram'
              ? 'bg-pink-600/20 text-pink-300 border-pink-500/50 shadow-sm'
              : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700'
          }`}
        >
          <Instagram className="w-3.5 h-3.5" />
          <span>Instagram / Threads</span>
        </button>
      </div>

      {/* Simulated Browser Window Canvas */}
      <div className="relative border border-slate-700/80 rounded-2xl bg-slate-950 overflow-hidden shadow-2xl">
        {/* Browser Top Bar */}
        <div className="bg-slate-900 px-4 py-2.5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-rose-500/80" />
              <span className="w-3 h-3 rounded-full bg-amber-500/80" />
              <span className="w-3 h-3 rounded-full bg-emerald-500/80" />
            </div>
            <div className="ml-3 px-3 py-1 rounded-lg bg-slate-950 border border-slate-800 text-[11px] text-slate-400 font-mono flex items-center gap-2 max-w-xs truncate">
              <span className="text-emerald-400">🔒</span>
              <span>
                {platform === 'twitter' && 'https://x.com/compose/post'}
                {platform === 'linkedin' && 'https://linkedin.com/feed/new-post'}
                {platform === 'wordpress' && 'https://meusite.com.br/wp-admin/upload.php'}
                {platform === 'instagram' && 'https://instagram.com/create/details'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-indigo-950/80 border border-indigo-700/60 text-[11px] text-indigo-300">
              <Chrome className="w-3.5 h-3.5 text-indigo-400" />
              <span className="font-semibold">AutoAlt AI v1.0 Ativo</span>
            </div>
          </div>
        </div>

        {/* Browser Content Area: Simulated Post Composer */}
        <div className="p-6 max-w-2xl mx-auto">
          {postPublished ? (
            <div className="py-12 text-center space-y-4 animate-fadeIn">
              <div className="w-16 h-16 rounded-full bg-emerald-950 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-100">Post Publicado com Sucesso!</h3>
                <p className="text-xs text-slate-400 mt-1">
                  A imagem foi postada com o texto alternativo acessível preenchido pela IA. Leitores de tela e robôs de busca conseguem entender perfeitamente o conteúdo!
                </p>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-slate-300 text-left max-w-md mx-auto">
                <span className="font-semibold text-emerald-400 block mb-1">ALT Text Enviado:</span>
                <p className="italic">"{altText}"</p>
              </div>

              <button
                onClick={() => setPostPublished(false)}
                className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold rounded-xl transition-colors"
              >
                Criar Outro Post de Teste
              </button>
            </div>
          ) : (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-lg">
              {/* User Avatar Header */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-sky-400 to-indigo-500 flex items-center justify-center font-bold text-white text-sm">
                  VS
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-200">
                    {platform === 'twitter' ? 'Você (@meuusuario)' : platform === 'linkedin' ? 'Você • Criador de Conteúdo' : 'WordPress Admin'}
                  </h4>
                  <span className="text-[10px] text-slate-400">Público • Qualquer pessoa</span>
                </div>
              </div>

              {/* Textarea */}
              <textarea
                value={postContent}
                onChange={(e) => setPostContent(e.target.value)}
                rows={2}
                placeholder="O que está acontecendo?"
                className="w-full bg-transparent text-sm text-slate-100 placeholder-slate-500 focus:outline-none resize-none"
              />

              {/* Uploaded Image Media Box in Composer */}
              {uploadedImage ? (
                <div className="relative rounded-xl overflow-hidden border border-slate-800 bg-slate-950 group">
                  <div className="max-h-64 flex items-center justify-center bg-slate-900/40">
                    <img
                      src={uploadedImage}
                      alt={altText || 'Prévia'}
                      className="max-h-60 w-auto object-contain"
                    />
                  </div>

                  {/* Simulated ALT Badge inside Image (like Twitter ALT tag) */}
                  <div className="absolute bottom-3 left-3 flex items-center gap-2">
                    <button
                      onClick={() => setIsAltModalOpen(true)}
                      className={`px-2.5 py-1 rounded-md text-xs font-bold transition-all shadow-md flex items-center gap-1.5 ${
                        altText
                          ? 'bg-slate-950/90 text-emerald-400 border border-emerald-500/40 hover:bg-slate-900'
                          : 'bg-slate-950/90 text-amber-400 border border-amber-500/40 animate-pulse'
                      }`}
                    >
                      <span>ALT</span>
                      {altText && <Check className="w-3 h-3 text-emerald-400" />}
                    </button>

                    {isAiProcessing && (
                      <span className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-indigo-950/90 text-indigo-300 border border-indigo-500/50 flex items-center gap-1.5 animate-pulse">
                        <Sparkles className="w-3 h-3 text-indigo-400" />
                        AutoAlt gerando...
                      </span>
                    )}
                  </div>

                  {/* Change Image Button */}
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute top-3 right-3 px-2.5 py-1 rounded-lg bg-slate-950/80 hover:bg-slate-900 text-xs text-slate-300 border border-slate-700 transition-colors"
                  >
                    Trocar Foto
                  </button>
                </div>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-800 hover:border-sky-500/50 rounded-xl p-6 text-center cursor-pointer bg-slate-950/50 hover:bg-slate-950 transition-colors"
                >
                  <Upload className="w-6 h-6 text-slate-400 mx-auto mb-2" />
                  <p className="text-xs font-medium text-slate-300">
                    Clique ou arraste uma foto para testar a captura automática do plugin
                  </p>
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageFileChange}
              />

              {/* Form ALT Input Preview inside Post Composer */}
              <div
                className={`p-3.5 rounded-xl border transition-all duration-300 ${
                  highlightInput
                    ? 'bg-emerald-950/30 border-emerald-500 ring-2 ring-emerald-500/20'
                    : 'bg-slate-950 border-slate-800'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-semibold text-slate-300">
                      Campo: Descrição de Texto Alternativo (ALT)
                    </span>
                    {highlightInput && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 animate-pulse">
                        ✨ Preenchido pelo Plugin!
                      </span>
                    )}
                  </div>

                  {altText && (
                    <button
                      onClick={() => playScreenReaderSpeech(altText, 'pt-BR')}
                      className="text-[11px] text-slate-400 hover:text-sky-400 flex items-center gap-1 transition-colors"
                    >
                      <Volume2 className="w-3 h-3 text-sky-400" />
                      <span>Ouvir</span>
                    </button>
                  )}
                </div>

                <input
                  id="simulated-alt-input"
                  type="text"
                  value={altText}
                  onChange={(e) => setAltText(e.target.value)}
                  placeholder={
                    isAiProcessing
                      ? 'Lendo imagem e gerando texto ALT com Gemini...'
                      : 'O plugin preencherá este campo automaticamente ao subir a foto...'
                  }
                  className="w-full bg-slate-900 border border-slate-700/80 rounded-lg px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500 font-medium"
                />
                <div className="flex justify-between items-center mt-1 text-[10px] text-slate-400">
                  <span>{altText.length} caracteres</span>
                  <span>{altText ? 'Acessível para deficientes visuais e robôs de busca' : 'Vazio (sem acessibilidade)'}</span>
                </div>
              </div>

              {/* Action Bar */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="p-2 rounded-lg text-sky-400 hover:bg-sky-950/50 transition-colors"
                    title="Adicionar imagem"
                  >
                    <ImageIcon className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      if (imageBase64) triggerAiAutoFill(imageBase64, platform);
                    }}
                    disabled={isAiProcessing || !imageBase64}
                    className="p-2 rounded-lg text-purple-400 hover:bg-purple-950/50 transition-colors"
                    title="Regerar ALT com IA"
                  >
                    <RefreshCw className={`w-4 h-4 ${isAiProcessing ? 'animate-spin' : ''}`} />
                  </button>
                </div>

                <button
                  id="btn-publish-simulated-post"
                  onClick={handlePublish}
                  disabled={isAiProcessing || !uploadedImage}
                  className="px-4 py-2 bg-sky-600 hover:bg-sky-500 disabled:bg-slate-800 disabled:text-slate-500 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-all shadow-md"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Publicar Post</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Floating Simulated Chrome Extension Badge */}
        {extensionBadgeStatus && (
          <div
            id="simulated-plugin-badge"
            className={`absolute bottom-5 right-5 p-3 rounded-xl shadow-2xl border flex items-center gap-3 backdrop-blur-md transition-all duration-300 animate-slideUp z-30 ${
              extensionBadgeStatus === 'generating' || extensionBadgeStatus === 'detecting'
                ? 'bg-indigo-950/95 border-indigo-500/50 text-indigo-200'
                : extensionBadgeStatus === 'success'
                ? 'bg-emerald-950/95 border-emerald-500/50 text-emerald-200'
                : 'bg-rose-950/95 border-rose-500/50 text-rose-200'
            }`}
          >
            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4 text-indigo-300 animate-pulse" />
            </div>

            <div className="text-xs">
              <div className="font-bold flex items-center gap-1.5">
                <span>AutoAlt AI (Extensão Chrome)</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              </div>
              <p className="text-[11px] text-slate-300">
                {extensionBadgeStatus === 'detecting' && '📸 Imagem detectada na página! Lendo arquivo...'}
                {extensionBadgeStatus === 'generating' && '✨ Gerando texto ALT acessível com IA...'}
                {extensionBadgeStatus === 'success' && '🎉 Campo ALT preenchido automaticamente!'}
                {extensionBadgeStatus === 'error' && '❌ Falha ao processar.'}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Test Sample Quick Buttons for Simulator */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
        <span className="text-xs font-semibold text-slate-300 block mb-2">
          Trocar imagem do simulador rapidamente:
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-6 gap-2">
          {SAMPLE_IMAGES.map((sample) => (
            <button
              key={sample.id}
              onClick={() => handleSelectSample(sample.url)}
              className="flex items-center gap-2 p-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-left transition-colors"
            >
              <img src={sample.url} alt="" className="w-8 h-8 rounded object-cover" />
              <span className="text-[11px] font-medium text-slate-300 truncate">{sample.title}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
