import React, { useState, useEffect } from 'react';
import {
  Code2,
  Download,
  Copy,
  Check,
  FileCode,
  FolderArchive,
  Terminal,
  ExternalLink,
  CheckCircle2,
  Sparkles,
  Info
} from 'lucide-react';
import JSZip from 'jszip';
import { ExtensionSourceFile } from '../types';
import { copyToClipboard } from '../utils/helpers';

export const ExtensionCodeViewer: React.FC = () => {
  const [files, setFiles] = useState<ExtensionSourceFile[]>([]);
  const [selectedFileName, setSelectedFileName] = useState<string>('manifest.json');
  const [copiedFile, setCopiedFile] = useState<string | null>(null);
  const [isZipping, setIsZipping] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  useEffect(() => {
    fetch('/api/chrome-extension-bundle')
      .then((res) => res.json())
      .then((data) => {
        if (data.files) {
          setFiles(data.files);
        }
      })
      .catch((err) => console.error('Erro ao carregar código da extensão:', err));
  }, []);

  const activeFile = files.find((f) => f.name === selectedFileName) || files[0];

  const handleCopyCode = async () => {
    if (!activeFile) return;
    const success = await copyToClipboard(activeFile.content);
    if (success) {
      setCopiedFile(activeFile.name);
      setTimeout(() => setCopiedFile(null), 2000);
    }
  };

  const handleDownloadZip = async () => {
    if (files.length === 0) return;
    setIsZipping(true);
    try {
      const zip = new JSZip();
      const folder = zip.folder('autoalt-chrome-extension');

      files.forEach((f) => {
        folder?.file(f.name, f.content);
      });

      // Also generate a simple icon placeholder in the zip
      const iconsFolder = folder?.folder('icons');
      iconsFolder?.file('README.txt', 'Coloque aqui seus ícones icon16.png, icon48.png, icon128.png');

      const blob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'autoalt-ai-chrome-extension-v1.0.zip';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 3000);
    } catch (err) {
      console.error('Erro ao gerar ZIP:', err);
    } finally {
      setIsZipping(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-purple-500/20 text-purple-400 border border-purple-500/30">
              <Code2 className="w-5 h-5" />
            </div>
            <h2 className="text-base font-bold text-slate-100">
              Código-Fonte Completo da Extensão Chrome (Manifest V3)
            </h2>
          </div>
          <p className="text-xs text-slate-400">
            Você pode copiar os arquivos individualmente ou baixar o pacote .ZIP pronto para carregar no Chrome em <code className="text-sky-400 font-mono">chrome://extensions</code>.
          </p>
        </div>

        <button
          id="btn-download-extension-zip"
          onClick={handleDownloadZip}
          disabled={isZipping || files.length === 0}
          className="px-4 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-semibold rounded-xl flex items-center gap-2 shadow-lg shadow-purple-900/20 transition-all shrink-0 active:scale-95"
        >
          {isZipping ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Compactando...</span>
            </>
          ) : downloadSuccess ? (
            <>
              <CheckCircle2 className="w-4 h-4 text-emerald-300" />
              <span>Download Concluído!</span>
            </>
          ) : (
            <>
              <FolderArchive className="w-4 h-4" />
              <span>Baixar Pacote .ZIP da Extensão</span>
            </>
          )}
        </button>
      </div>

      {/* Code Editor Container */}
      <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
        {/* File Tabs Bar */}
        <div className="bg-slate-900 px-3 pt-2 border-b border-slate-800 flex items-center justify-between overflow-x-auto">
          <div className="flex items-center gap-1">
            {files.map((file) => (
              <button
                key={file.name}
                onClick={() => setSelectedFileName(file.name)}
                className={`flex items-center gap-2 px-3 py-2 text-xs font-mono rounded-t-lg border-t border-x transition-colors whitespace-nowrap ${
                  selectedFileName === file.name
                    ? 'bg-slate-950 text-sky-400 border-slate-800 border-b-slate-950'
                    : 'text-slate-400 hover:text-slate-200 border-transparent hover:bg-slate-850'
                }`}
              >
                <FileCode className="w-3.5 h-3.5" />
                <span>{file.name}</span>
              </button>
            ))}
          </div>

          <button
            id="btn-copy-active-code"
            onClick={handleCopyCode}
            className="mb-1 px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded-lg flex items-center gap-1.5 border border-slate-700 transition-colors"
          >
            {copiedFile === activeFile?.name ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>Copiado!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copiar Arquivo</span>
              </>
            )}
          </button>
        </div>

        {/* Code Content */}
        <div className="p-4 max-h-[500px] overflow-y-auto">
          {activeFile && (
            <pre className="font-mono text-xs text-slate-300 leading-relaxed overflow-x-auto">
              <code>{activeFile.content}</code>
            </pre>
          )}
        </div>
      </div>

      {/* Step by Step Install Guide */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-4">
        <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
          <Terminal className="w-4 h-4 text-emerald-400" />
          Como Instalar e Rodar a Extensão no seu Chrome:
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1.5">
            <span className="w-6 h-6 rounded-full bg-sky-500/20 text-sky-400 border border-sky-500/30 flex items-center justify-center text-xs font-bold">
              1
            </span>
            <h4 className="text-xs font-bold text-slate-200">Baixe e Descompacte</h4>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Clique no botão "Baixar Pacote .ZIP" acima e extraia os arquivos em uma pasta permanente no seu computador.
            </p>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1.5">
            <span className="w-6 h-6 rounded-full bg-purple-500/20 text-purple-400 border border-purple-500/30 flex items-center justify-center text-xs font-bold">
              2
            </span>
            <h4 className="text-xs font-bold text-slate-200">Abra Gerenciador do Chrome</h4>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              No Chrome, acesse <code className="text-purple-300 bg-slate-900 px-1 py-0.5 rounded">chrome://extensions</code> e ative a chave <strong>"Modo do desenvolvedor"</strong> no canto superior direito.
            </p>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1.5">
            <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center text-xs font-bold">
              3
            </span>
            <h4 className="text-xs font-bold text-slate-200">Carregar sem compactação</h4>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Clique no botão <strong>"Carregar sem compactação"</strong> (Load unpacked) e selecione a pasta extraída. A extensão estará 100% ativa!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
