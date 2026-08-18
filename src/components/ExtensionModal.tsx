import React, { useState } from 'react';
import { X, Download, Chrome, CheckCircle2, FolderArchive, ArrowRight } from 'lucide-react';
import JSZip from 'jszip';

interface ExtensionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ExtensionModal: React.FC<ExtensionModalProps> = ({ isOpen, onClose }) => {
  const [isZipping, setIsZipping] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  if (!isOpen) return null;

  const handleDownloadZip = async () => {
    setIsZipping(true);
    try {
      const res = await fetch('/api/chrome-extension-bundle');
      const data = await res.json();
      const files = data.files || [];

      const zip = new JSZip();
      const folder = zip.folder('autoalt-chrome-extension');

      files.forEach((f: any) => {
        folder?.file(f.name, f.content);
      });

      const iconsFolder = folder?.folder('icons');
      iconsFolder?.file('README.txt', 'Coloque seus ícones aqui: icon16.png, icon48.png, icon128.png');

      const blob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'autoalt-chrome-plugin.zip';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 3000);
    } catch (err) {
      console.error('Erro ao baixar ZIP da extensão:', err);
    } finally {
      setIsZipping(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="w-full max-w-lg bg-white rounded-3xl p-6 sm:p-7 border border-neutral-200 shadow-2xl relative space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full hover:bg-neutral-100 text-neutral-400 hover:text-neutral-700 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-neutral-900 text-white flex items-center justify-center shadow-xs">
            <Chrome className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-neutral-900">Plugin para Google Chrome</h3>
            <p className="text-xs text-neutral-500">Instale e use direto no X (Twitter), LinkedIn, WordPress e Instagram.</p>
          </div>
        </div>

        {/* 3 Step Installation Guide */}
        <div className="space-y-2.5 pt-1">
          <div className="flex items-start gap-3 p-3 rounded-2xl bg-neutral-50 border border-neutral-200/60">
            <div className="w-6 h-6 rounded-full bg-neutral-900 text-white text-xs font-semibold flex items-center justify-center shrink-0 mt-0.5">
              1
            </div>
            <div>
              <h4 className="text-xs font-semibold text-neutral-900">Baixe e extraia o pacote .ZIP</h4>
              <p className="text-[11px] text-neutral-500">Descompacte o arquivo baixado em uma pasta no seu computador.</p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-2xl bg-neutral-50 border border-neutral-200/60">
            <div className="w-6 h-6 rounded-full bg-neutral-900 text-white text-xs font-semibold flex items-center justify-center shrink-0 mt-0.5">
              2
            </div>
            <div>
              <h4 className="text-xs font-semibold text-neutral-900">Abra chrome://extensions</h4>
              <p className="text-[11px] text-neutral-500">
                Acesse o gerenciador de extensões e ative o <strong>"Modo do desenvolvedor"</strong> no canto superior direito.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-2xl bg-neutral-50 border border-neutral-200/60">
            <div className="w-6 h-6 rounded-full bg-neutral-900 text-white text-xs font-semibold flex items-center justify-center shrink-0 mt-0.5">
              3
            </div>
            <div>
              <h4 className="text-xs font-semibold text-neutral-900">Carregar sem compactação</h4>
              <p className="text-[11px] text-neutral-500">
                Selecione a pasta extraída. A extensão preencherá o ALT automaticamente ao postar fotos!
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="pt-2 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-xs font-medium text-neutral-600 hover:bg-neutral-100 transition-colors"
          >
            Fechar
          </button>

          <button
            id="btn-download-plugin-zip"
            onClick={handleDownloadZip}
            disabled={isZipping}
            className="px-5 py-2.5 bg-neutral-900 hover:bg-black text-white text-xs font-semibold rounded-xl flex items-center gap-2 shadow-xs transition-all active:scale-95 disabled:opacity-50"
          >
            {isZipping ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Compactando...</span>
              </>
            ) : downloadSuccess ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Download Concluído!</span>
              </>
            ) : (
              <>
                <Download className="w-3.5 h-3.5" />
                <span>Baixar Plugin (.ZIP)</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
