import React, { useState } from 'react';
import {
  X,
  Download,
  Chrome,
  CheckCircle2,
  Copy,
  ExternalLink,
  ShieldCheck,
  FileText,
  Sparkles,
  Info,
  Check,
  ArrowRight,
  Globe,
  Lock,
} from 'lucide-react';
import { createChromeWebStoreZip, STORE_LISTING_INFO } from '../utils/extensionPackage';
import { copyToClipboard } from '../utils/helpers';
import confetti from 'canvas-confetti';

interface PublishToStoreModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PublishToStoreModal: React.FC<PublishToStoreModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [isZipping, setIsZipping] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'steps' | 'metadata' | 'privacy'>('steps');

  if (!isOpen) return null;

  const handleDownloadZip = async () => {
    setIsZipping(true);
    try {
      const blob = await createChromeWebStoreZip();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'autoalt-ai-chrome-webstore-v1.0.0.zip';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setDownloadSuccess(true);
      try {
        confetti({
          particleCount: 35,
          spread: 60,
          origin: { y: 0.7 },
          colors: ['#0071e3', '#34c759', '#5856d6'],
        });
      } catch (_) {}
      setTimeout(() => setDownloadSuccess(false), 3500);
    } catch (err) {
      console.error('Erro ao gerar ZIP da Web Store:', err);
    } finally {
      setIsZipping(false);
    }
  };

  const handleCopyText = async (text: string, fieldId: string) => {
    const ok = await copyToClipboard(text);
    if (ok) {
      setCopiedField(fieldId);
      setTimeout(() => setCopiedField(null), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="w-full max-w-2xl max-h-[90vh] bg-white rounded-3xl border border-neutral-200 shadow-2xl flex flex-col overflow-hidden relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-neutral-100 flex items-center justify-between bg-neutral-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-neutral-900 text-white flex items-center justify-center shadow-xs">
              <Chrome className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-neutral-900 flex items-center gap-2">
                <span>Publicar na Chrome Web Store</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-medium border border-emerald-200">
                  Pronto para Envio
                </span>
              </h2>
              <p className="text-xs text-neutral-500">
                Pacote Manifest V3 certificado com ícones PNG (16, 48, 128px) e metadados oficiais.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-neutral-200/60 text-neutral-400 hover:text-neutral-700 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Segmented Control Bar */}
        <div className="px-5 sm:px-6 pt-3 pb-1 border-b border-neutral-100 flex items-center gap-2">
          <button
            onClick={() => setActiveTab('steps')}
            className={`px-3 py-1.5 text-xs font-medium rounded-xl transition-all ${
              activeTab === 'steps'
                ? 'bg-neutral-900 text-white shadow-xs'
                : 'text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100'
            }`}
          >
            Passo a Passo
          </button>
          <button
            onClick={() => setActiveTab('metadata')}
            className={`px-3 py-1.5 text-xs font-medium rounded-xl transition-all ${
              activeTab === 'metadata'
                ? 'bg-neutral-900 text-white shadow-xs'
                : 'text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100'
            }`}
          >
            Textos da Loja (Copiar)
          </button>
          <button
            onClick={() => setActiveTab('privacy')}
            className={`px-3 py-1.5 text-xs font-medium rounded-xl transition-all ${
              activeTab === 'privacy'
                ? 'bg-neutral-900 text-white shadow-xs'
                : 'text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100'
            }`}
          >
            Privacidade & Permissões
          </button>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
          {/* TAB 1: STEPS */}
          {activeTab === 'steps' && (
            <div className="space-y-4">
              {/* Main Download CTA Box */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-neutral-900 to-neutral-950 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
                <div className="space-y-1">
                  <span className="text-[11px] font-medium text-sky-400 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    Arquivo ZIP de Produção Gerado
                  </span>
                  <h3 className="text-sm font-semibold text-white">
                    Baixar Pacote .ZIP Completo
                  </h3>
                  <p className="text-xs text-neutral-400 max-w-sm">
                    Inclui Manifest V3, Service Worker, Content Scripts e todos os ícones PNG (16x16, 48x48, 128x128).
                  </p>
                </div>

                <button
                  id="btn-download-production-zip"
                  onClick={handleDownloadZip}
                  disabled={isZipping}
                  className="px-4 py-2.5 bg-white hover:bg-neutral-100 text-neutral-950 rounded-xl text-xs font-semibold flex items-center gap-2 shadow-md transition-all active:scale-95 shrink-0"
                >
                  {isZipping ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-neutral-900 border-t-transparent rounded-full animate-spin" />
                      <span>Compactando...</span>
                    </>
                  ) : downloadSuccess ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Baixado com Sucesso!</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4" />
                      <span>Baixar .ZIP da Extensão</span>
                    </>
                  )}
                </button>
              </div>

              {/* 4 Step Action Guide */}
              <div className="space-y-3 pt-1">
                <h4 className="text-xs font-semibold text-neutral-700 uppercase tracking-wider">
                  Como enviar para a Chrome Web Store:
                </h4>

                <div className="space-y-2.5">
                  <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-neutral-50 border border-neutral-200/70">
                    <div className="w-6 h-6 rounded-full bg-neutral-900 text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                      1
                    </div>
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center justify-between">
                        <h5 className="text-xs font-semibold text-neutral-900">Acesse o Console de Desenvolvedor</h5>
                        <a
                          href="https://chrome.google.com/webstore/devconsole"
                          target="_blank"
                          rel="noreferrer"
                          className="text-[11px] font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1"
                        >
                          <span>Abrir Console</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                      <p className="text-[11px] text-neutral-500">
                        Faça login na sua conta Google. Se for sua primeira publicação, o Google solicita uma taxa única de US$ 5 para cadastro de desenvolvedor.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-neutral-50 border border-neutral-200/70">
                    <div className="w-6 h-6 rounded-full bg-neutral-900 text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                      2
                    </div>
                    <div className="space-y-1 flex-1">
                      <h5 className="text-xs font-semibold text-neutral-900">Clique em "Novo Item" e Envie o .ZIP</h5>
                      <p className="text-[11px] text-neutral-500">
                        Clique no botão azul <strong>"Novo item"</strong> (New Item) e selecione o arquivo <code className="text-neutral-800 bg-neutral-200/60 px-1 rounded font-mono">autoalt-ai-chrome-webstore-v1.0.0.zip</code> baixado acima.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-neutral-50 border border-neutral-200/70">
                    <div className="w-6 h-6 rounded-full bg-neutral-900 text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                      3
                    </div>
                    <div className="space-y-1 flex-1">
                      <h5 className="text-xs font-semibold text-neutral-900">Preencha a Ficha da Loja</h5>
                      <p className="text-[11px] text-neutral-500">
                        Use a aba <strong>"Textos da Loja"</strong> deste modal para copiar com 1 clique o Título, Descrição Curta (máx 132 caracteres) e Descrição Completa formatada.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-neutral-50 border border-neutral-200/70">
                    <div className="w-6 h-6 rounded-full bg-neutral-900 text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                      4
                    </div>
                    <div className="space-y-1 flex-1">
                      <h5 className="text-xs font-semibold text-neutral-900">Enviar para Revisão</h5>
                      <p className="text-[11px] text-neutral-500">
                        Clique em <strong>"Enviar para revisão"</strong>. A equipe do Google aprova a extensão em média entre 24 e 48 horas.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: STORE LISTING TEXTS */}
          {activeTab === 'metadata' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-blue-50/80 border border-blue-200/60 text-blue-900 text-xs flex items-center gap-2">
                <Info className="w-4 h-4 text-blue-600 shrink-0" />
                <span>Textos otimizados para aprovação rápida na Chrome Web Store. Clique nos botões para copiar.</span>
              </div>

              {/* Title */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-neutral-700">Título da Extensão (Nome na Loja)</label>
                  <button
                    onClick={() => handleCopyText(STORE_LISTING_INFO.title, 'title')}
                    className="text-[11px] text-neutral-600 hover:text-neutral-900 font-medium flex items-center gap-1"
                  >
                    {copiedField === 'title' ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-600" />
                        <span className="text-emerald-700">Copiado</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copiar</span>
                      </>
                    )}
                  </button>
                </div>
                <input
                  type="text"
                  readOnly
                  value={STORE_LISTING_INFO.title}
                  className="w-full text-xs font-medium text-neutral-900 bg-neutral-50 p-2.5 rounded-xl border border-neutral-200 outline-hidden"
                />
              </div>

              {/* Summary */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-neutral-700">
                    Resumo / Descrição Curta (Máx. 132 caracteres)
                  </label>
                  <button
                    onClick={() => handleCopyText(STORE_LISTING_INFO.summary, 'summary')}
                    className="text-[11px] text-neutral-600 hover:text-neutral-900 font-medium flex items-center gap-1"
                  >
                    {copiedField === 'summary' ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-600" />
                        <span className="text-emerald-700">Copiado</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copiar</span>
                      </>
                    )}
                  </button>
                </div>
                <textarea
                  rows={2}
                  readOnly
                  value={STORE_LISTING_INFO.summary}
                  className="w-full text-xs font-medium text-neutral-900 bg-neutral-50 p-2.5 rounded-xl border border-neutral-200 outline-hidden resize-none"
                />
                <span className="text-[10px] text-neutral-400">{STORE_LISTING_INFO.summary.length}/132 caracteres</span>
              </div>

              {/* Category & Single Purpose */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-neutral-700">Categoria</label>
                    <button
                      onClick={() => handleCopyText(STORE_LISTING_INFO.category, 'category')}
                      className="text-[11px] text-neutral-600 hover:text-neutral-900 font-medium flex items-center gap-1"
                    >
                      {copiedField === 'category' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    </button>
                  </div>
                  <input
                    type="text"
                    readOnly
                    value={STORE_LISTING_INFO.category}
                    className="w-full text-xs font-medium text-neutral-900 bg-neutral-50 p-2.5 rounded-xl border border-neutral-200 outline-hidden"
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-neutral-700">Finalidade Única (Single Purpose)</label>
                    <button
                      onClick={() => handleCopyText(STORE_LISTING_INFO.singlePurpose, 'singlePurpose')}
                      className="text-[11px] text-neutral-600 hover:text-neutral-900 font-medium flex items-center gap-1"
                    >
                      {copiedField === 'singlePurpose' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    </button>
                  </div>
                  <input
                    type="text"
                    readOnly
                    value={STORE_LISTING_INFO.singlePurpose}
                    className="w-full text-xs font-medium text-neutral-900 bg-neutral-50 p-2.5 rounded-xl border border-neutral-200 outline-hidden"
                  />
                </div>
              </div>

              {/* Full Description */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-neutral-700">Descrição Detalhada da Loja</label>
                  <button
                    onClick={() => handleCopyText(STORE_LISTING_INFO.description, 'description')}
                    className="text-[11px] text-neutral-600 hover:text-neutral-900 font-medium flex items-center gap-1"
                  >
                    {copiedField === 'description' ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-600" />
                        <span className="text-emerald-700">Copiado</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copiar Texto Completo</span>
                      </>
                    )}
                  </button>
                </div>
                <textarea
                  rows={6}
                  readOnly
                  value={STORE_LISTING_INFO.description}
                  className="w-full text-xs font-normal text-neutral-800 bg-neutral-50 p-3 rounded-xl border border-neutral-200 outline-hidden font-mono leading-relaxed"
                />
              </div>
            </div>
          )}

          {/* TAB 3: PRIVACY & PERMISSIONS */}
          {activeTab === 'privacy' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-emerald-50/80 border border-emerald-200/60 text-emerald-900 text-xs flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>O Google exige declaração de privacidade e justificativa de permissões no painel.</span>
              </div>

              {/* Permissions Justification */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-neutral-700">
                    Justificativa de Permissões (Storage / ActiveTab)
                  </label>
                  <button
                    onClick={() => handleCopyText(STORE_LISTING_INFO.permissionJustification, 'permissions')}
                    className="text-[11px] text-neutral-600 hover:text-neutral-900 font-medium flex items-center gap-1"
                  >
                    {copiedField === 'permissions' ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-600" />
                        <span className="text-emerald-700">Copiado</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copiar</span>
                      </>
                    )}
                  </button>
                </div>
                <textarea
                  rows={3}
                  readOnly
                  value={STORE_LISTING_INFO.permissionJustification}
                  className="w-full text-xs font-normal text-neutral-800 bg-neutral-50 p-3 rounded-xl border border-neutral-200 outline-hidden"
                />
              </div>

              {/* Privacy Policy */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-neutral-700">
                    Política de Privacidade (Texto Completo)
                  </label>
                  <button
                    onClick={() => handleCopyText(STORE_LISTING_INFO.privacyPolicy, 'privacy')}
                    className="text-[11px] text-neutral-600 hover:text-neutral-900 font-medium flex items-center gap-1"
                  >
                    {copiedField === 'privacy' ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-600" />
                        <span className="text-emerald-700">Copiado</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copiar Política</span>
                      </>
                    )}
                  </button>
                </div>
                <textarea
                  rows={6}
                  readOnly
                  value={STORE_LISTING_INFO.privacyPolicy}
                  className="w-full text-xs font-mono text-neutral-800 bg-neutral-50 p-3 rounded-xl border border-neutral-200 outline-hidden"
                />
              </div>
            </div>
          )}
        </div>

        {/* Bottom Footer Action */}
        <div className="p-4 sm:p-5 border-t border-neutral-100 bg-neutral-50 flex items-center justify-between gap-3">
          <a
            href="https://chrome.google.com/webstore/devconsole"
            target="_blank"
            rel="noreferrer"
            className="px-3.5 py-2 rounded-xl text-xs font-medium text-neutral-700 hover:bg-neutral-200/60 transition-colors flex items-center gap-1.5"
          >
            <span>Ir para o Console de Desenvolvedor</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-neutral-600 hover:bg-neutral-200/60 transition-colors"
            >
              Fechar
            </button>
            <button
              onClick={handleDownloadZip}
              disabled={isZipping}
              className="px-4 py-2 bg-neutral-900 hover:bg-black text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 shadow-xs transition-all active:scale-95 disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Baixar Pacote .ZIP</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
