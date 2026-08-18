import React, { useState, useRef, useEffect } from 'react';
import { UploadCloud, Image as ImageIcon, Sparkles, X, Link as LinkIcon, AlertCircle } from 'lucide-react';
import { SAMPLE_IMAGES } from '../data/samples';
import { fileToBase64, urlToBase64 } from '../utils/helpers';
import { SampleImage } from '../types';

interface ImageUploaderProps {
  onImageSelected: (base64: string, mimeType: string, meta?: { name?: string; size?: number; source?: string }) => void;
  selectedImage: string | null;
  onClear: () => void;
  isLoading: boolean;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  onImageSelected,
  selectedImage,
  onClear,
  isLoading,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [urlError, setUrlError] = useState<string | null>(null);
  const [loadingSampleId, setLoadingSampleId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Support pasting image from clipboard (Ctrl+V / Cmd+V)
  useEffect(() => {
    const handlePaste = async (e: ClipboardEvent) => {
      if (isLoading) return;
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const file = items[i].getAsFile();
          if (file) {
            try {
              const base64 = await fileToBase64(file);
              onImageSelected(base64, file.type, { name: 'Imagem colada da Área de Transferência', size: file.size, source: 'clipboard' });
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
  }, [onImageSelected, isLoading]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (isLoading) return;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('image/')) {
        const base64 = await fileToBase64(file);
        onImageSelected(base64, file.type, { name: file.name, size: file.size, source: 'drop' });
      }
    }
  };

  const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (file.type.startsWith('image/')) {
        const base64 = await fileToBase64(file);
        onImageSelected(base64, file.type, { name: file.name, size: file.size, source: 'upload' });
      }
    }
  };

  const handleSelectSample = async (sample: SampleImage) => {
    if (isLoading) return;
    setLoadingSampleId(sample.id);
    setUrlError(null);
    try {
      // Fetch sample and convert to base64
      const response = await fetch(sample.url);
      const blob = await response.blob();
      const base64 = await fileToBase64(new File([blob], `${sample.id}.jpg`, { type: 'image/jpeg' }));
      onImageSelected(base64, 'image/jpeg', { name: sample.title, source: 'sample' });
    } catch (err) {
      console.error('Erro ao carregar imagem de exemplo:', err);
      setUrlError('Não foi possível carregar o exemplo. Tente outro ou envie do seu computador.');
    } finally {
      setLoadingSampleId(null);
    }
  };

  const handleLoadUrl = async () => {
    if (!imageUrlInput.trim()) return;
    setUrlError(null);
    try {
      const base64 = await urlToBase64(imageUrlInput.trim());
      onImageSelected(base64, 'image/jpeg', { name: 'Imagem via URL', source: 'url' });
      setShowUrlInput(false);
      setImageUrlInput('');
    } catch (err) {
      setUrlError('Falha ao carregar imagem da URL (CORS ou link inválido). Recomendamos salvar e arrastar o arquivo.');
    }
  };

  return (
    <div className="space-y-4">
      {/* Upload Box / Image Preview */}
      {!selectedImage ? (
        <div
          id="dropzone-area"
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-200 ${
            isDragging
              ? 'border-sky-400 bg-sky-950/30 scale-[1.01]'
              : 'border-slate-800 hover:border-slate-700 bg-slate-900/40 hover:bg-slate-900/70'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileInput}
          />

          <div className="flex flex-col items-center justify-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-sky-500/20 to-purple-500/20 border border-sky-500/30 flex items-center justify-center text-sky-400">
              <UploadCloud className="w-7 h-7" />
            </div>

            <div>
              <p className="text-sm font-semibold text-slate-200">
                Arraste e solte uma imagem aqui, ou clique para navegar
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Suporta PNG, JPG, WebP, GIF ou cole com <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-[10px] text-slate-300 font-mono">Ctrl + V</kbd>
              </p>
            </div>

            <div className="flex items-center gap-3 mt-1">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowUrlInput(!showUrlInput);
                }}
                className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-sky-400 transition-colors py-1 px-2.5 rounded-lg bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60"
              >
                <LinkIcon className="w-3.5 h-3.5" />
                <span>Carregar via URL</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="relative rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 group">
          <div className="max-h-80 flex items-center justify-center bg-slate-900/60 p-2">
            <img
              src={selectedImage}
              alt="Prévia da imagem selecionada"
              className="max-h-72 w-auto object-contain rounded-xl shadow-lg"
            />
          </div>

          {/* Action Overlay */}
          <div className="absolute top-3 right-3 flex items-center gap-2">
            <button
              id="btn-clear-image"
              onClick={onClear}
              disabled={isLoading}
              title="Remover imagem"
              className="p-2 rounded-xl bg-slate-900/90 hover:bg-rose-900/80 text-slate-300 hover:text-rose-200 border border-slate-700 backdrop-blur-sm transition-all shadow-md"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="px-4 py-2.5 bg-slate-900/90 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <ImageIcon className="w-3.5 h-3.5 text-sky-400" />
              Imagem pronta para análise e geração ALT
            </span>
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isLoading}
              className="text-sky-400 hover:text-sky-300 font-medium transition-colors"
            >
              Trocar imagem
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileInput}
            />
          </div>
        </div>
      )}

      {/* URL Input Modal / Box */}
      {showUrlInput && !selectedImage && (
        <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row gap-2">
          <input
            type="url"
            placeholder="https://exemplo.com/foto.jpg"
            value={imageUrlInput}
            onChange={(e) => setImageUrlInput(e.target.value)}
            className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-sky-500"
          />
          <div className="flex gap-2">
            <button
              onClick={handleLoadUrl}
              className="px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white text-xs font-medium rounded-lg transition-colors"
            >
              Importar
            </button>
            <button
              onClick={() => setShowUrlInput(false)}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-lg transition-colors"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {urlError && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-950/40 border border-rose-900/50 text-rose-300 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
          <span>{urlError}</span>
        </div>
      )}

      {/* Quick Test Samples */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            Ou teste com fotos de demonstração:
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
          {SAMPLE_IMAGES.map((sample) => (
            <button
              key={sample.id}
              onClick={() => handleSelectSample(sample)}
              disabled={isLoading || loadingSampleId === sample.id}
              className={`group relative rounded-xl overflow-hidden border transition-all text-left bg-slate-900 ${
                loadingSampleId === sample.id
                  ? 'border-sky-500 ring-2 ring-sky-500/20'
                  : 'border-slate-800 hover:border-slate-700 hover:scale-[1.02]'
              }`}
            >
              <div className="aspect-video w-full overflow-hidden bg-slate-950">
                <img
                  src={sample.url}
                  alt={sample.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
              </div>
              <div className="p-1.5">
                <p className="text-[11px] font-medium text-slate-300 truncate">{sample.title}</p>
                <p className="text-[9px] text-slate-400 truncate">{sample.category}</p>
              </div>
              {loadingSampleId === sample.id && (
                <div className="absolute inset-0 bg-slate-950/70 flex items-center justify-center">
                  <div className="w-4 h-4 border-2 border-sky-400 border-t-transparent rounded-full animate-spin" />
                </div>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
