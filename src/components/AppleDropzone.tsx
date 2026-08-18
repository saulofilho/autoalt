import React, { useState, useRef, useEffect } from 'react';
import { UploadCloud, Image as ImageIcon, Sparkles, X, RefreshCw } from 'lucide-react';
import { SAMPLE_IMAGES } from '../data/samples';
import { urlToBase64, fileToBase64 } from '../utils/helpers';

interface AppleDropzoneProps {
  onImageSelected: (base64: string, mimeType: string) => void;
  selectedImage: string | null;
  onClear: () => void;
  isLoading: boolean;
}

export const AppleDropzone: React.FC<AppleDropzoneProps> = ({
  onImageSelected,
  selectedImage,
  onClear,
  isLoading,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isConvertingSample, setIsConvertingSample] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Listen to Global Clipboard Paste (Cmd+V / Ctrl+V)
  useEffect(() => {
    const handlePaste = async (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const file = items[i].getAsFile();
          if (file) {
            try {
              const base64 = await fileToBase64(file);
              onImageSelected(base64, file.type || 'image/jpeg');
            } catch (err) {
              console.error('Erro ao colar imagem:', err);
            }
          }
          break;
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [onImageSelected]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('image/')) {
        const base64 = await fileToBase64(file);
        onImageSelected(base64, file.type);
      }
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (file.type.startsWith('image/')) {
        const base64 = await fileToBase64(file);
        onImageSelected(base64, file.type);
      }
    }
  };

  const handleSampleClick = async (sample: typeof SAMPLE_IMAGES[0]) => {
    setIsConvertingSample(true);
    try {
      const base64 = await urlToBase64(sample.url);
      onImageSelected(base64, 'image/jpeg');
    } catch (err) {
      console.error('Erro ao carregar sample:', err);
    } finally {
      setIsConvertingSample(false);
    }
  };

  return (
    <div className="w-full space-y-3">
      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Main Upload Box */}
      {!selectedImage ? (
        <div
          id="dropzone-area"
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`relative group cursor-pointer rounded-2xl p-8 sm:p-10 border transition-all duration-200 flex flex-col items-center justify-center text-center ${
            isDragging
              ? 'bg-blue-50/80 border-blue-500 ring-4 ring-blue-500/10'
              : 'bg-white/80 hover:bg-white border-neutral-200/80 hover:border-neutral-300 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)]'
          }`}
        >
          {/* Subtle Icon */}
          <div className="w-12 h-12 rounded-2xl bg-neutral-100 group-hover:bg-neutral-200/70 text-neutral-700 flex items-center justify-center mb-3.5 transition-colors">
            <UploadCloud className="w-6 h-6 stroke-[1.75]" />
          </div>

          <h3 className="text-sm font-semibold text-neutral-900 mb-1">
            Escolha uma imagem ou arraste até aqui
          </h3>
          <p className="text-xs text-neutral-500 max-w-xs">
            A IA analisará a imagem e preencherá o texto ALT instantaneamente.
          </p>

          <div className="mt-4 flex items-center gap-1.5 text-[11px] text-neutral-400 bg-neutral-100/70 px-2.5 py-1 rounded-full border border-neutral-200/60">
            <span>Dica: Pressione</span>
            <kbd className="font-mono bg-white px-1.5 py-0.5 rounded shadow-xs text-neutral-600 font-medium">⌘V</kbd>
            <span>para colar direto</span>
          </div>
        </div>
      ) : (
        /* Image Preview Box */
        <div className="relative rounded-2xl overflow-hidden bg-neutral-900 border border-neutral-200 shadow-sm flex items-center justify-center max-h-[260px] group">
          <img
            src={selectedImage}
            alt="Imagem selecionada para análise"
            className="w-full h-full max-h-[260px] object-contain"
          />

          {/* Action Overlay */}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <button
              id="btn-change-image"
              onClick={() => fileInputRef.current?.click()}
              className="px-3.5 py-2 bg-white/90 hover:bg-white text-neutral-900 rounded-xl text-xs font-medium backdrop-blur-sm shadow-md transition-all flex items-center gap-1.5 active:scale-95"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Trocar Foto</span>
            </button>

            <button
              id="btn-remove-image"
              onClick={onClear}
              className="p-2 bg-white/90 hover:bg-rose-50 text-neutral-700 hover:text-rose-600 rounded-xl text-xs backdrop-blur-sm shadow-md transition-all active:scale-95"
              title="Remover imagem"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Quick Test Samples */}
      <div className="flex items-center gap-1.5 overflow-x-auto py-1">
        <span className="text-[11px] font-medium text-neutral-400 shrink-0 flex items-center gap-1 mr-1">
          <Sparkles className="w-3 h-3 text-neutral-400" />
          Testar com:
        </span>
        {SAMPLE_IMAGES.map((sample) => (
          <button
            key={sample.id}
            onClick={() => handleSampleClick(sample)}
            disabled={isLoading || isConvertingSample}
            className="px-2.5 py-1 rounded-lg bg-neutral-100 hover:bg-neutral-200/80 text-neutral-600 hover:text-neutral-900 text-xs font-medium transition-all shrink-0 border border-neutral-200/60 active:scale-95 disabled:opacity-50"
          >
            {sample.title.split(' ')[0]} {sample.title.split(' ')[1] || ''}
          </button>
        ))}
      </div>
    </div>
  );
};
