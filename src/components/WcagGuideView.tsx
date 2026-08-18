import React from 'react';
import { BookOpen, CheckCircle2, XCircle, Sparkles, HelpCircle, Eye, ShieldCheck, HeartHandshake } from 'lucide-react';

export const WcagGuideView: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Intro Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 rounded-2xl p-6 space-y-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-100">Guia de Boas Práticas WCAG 2.2 & Texto ALT</h2>
            <p className="text-xs text-slate-400">
              Como escrever descrições de imagem verdadeiramente úteis para leitores de tela e robôs de busca.
            </p>
          </div>
        </div>
      </div>

      {/* 4 Golden Rules */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-2">
          <div className="flex items-center gap-2 text-sky-400 font-semibold text-xs">
            <span className="w-5 h-5 rounded-full bg-sky-500/20 flex items-center justify-center text-[10px]">1</span>
            Seja Direto e Conciso (70 a 125 caracteres)
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Usuários de leitores de tela ouvem todo o conteúdo em áudio sintetizado. Descrições longas demais tornam a navegação exaustiva. Foque no sujeito principal, ação e contexto relevante.
          </p>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-2">
          <div className="flex items-center gap-2 text-purple-400 font-semibold text-xs">
            <span className="w-5 h-5 rounded-full bg-purple-500/20 flex items-center justify-center text-[10px]">2</span>
            Evite Redundâncias como "Foto de..." ou "Imagem de..."
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Leitores de tela como NVDA e VoiceOver já anunciam automaticamente que o elemento é um gráfico ou imagem antes de ler o texto ALT. Use apenas se o estilo visual for crucial (ex: "Gráfico de barras", "Ilustração vetorial").
          </p>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-2">
          <div className="flex items-center gap-2 text-emerald-400 font-semibold text-xs">
            <span className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center text-[10px]">3</span>
            Transcreva Textos e Números Relevantes (OCR)
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Se a imagem contiver um slogan, dado estatístico, aviso ou promoção, transcreva textualmente no ALT. O usuário não vidente não pode ler texto desenhado em bitmaps.
          </p>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-2">
          <div className="flex items-center gap-2 text-amber-400 font-semibold text-xs">
            <span className="w-5 h-5 rounded-full bg-amber-500/20 flex items-center justify-center text-[10px]">4</span>
            Imagens Puramente Decorativas
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Se uma imagem for apenas um divisor estético ou fundo sem informação semântica, utilize <code className="text-amber-300 bg-slate-950 px-1 py-0.5 rounded font-mono">alt=""</code> para que o leitor de tela a ignore suavemente.
          </p>
        </div>
      </div>

      {/* Comparisons: Good vs Bad Examples */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-4">
        <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          Exemplos Práticos: O que Fazer vs O que Evitar
        </h3>

        <div className="space-y-3">
          {/* Example 1: E-commerce */}
          <div className="bg-slate-950 rounded-xl p-4 border border-slate-800 space-y-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Cenário: Foto de Tênis de Corrida</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-2.5 rounded-lg bg-rose-950/30 border border-rose-900/40 text-rose-300 flex items-start gap-2">
                <XCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
                <div>
                  <span className="font-semibold block text-rose-200">Ruim:</span>
                  "tenis.jpg" ou "foto de tenis esportivo legal compre agora"
                </div>
              </div>
              <div className="p-2.5 rounded-lg bg-emerald-950/30 border border-emerald-900/40 text-emerald-300 flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400 mt-0.5" />
                <div>
                  <span className="font-semibold block text-emerald-200">Excelente (AutoAlt AI):</span>
                  "Tênis de corrida masculino azul marinho com detalhes em laranja e solado amortecido."
                </div>
              </div>
            </div>
          </div>

          {/* Example 2: Social / Event */}
          <div className="bg-slate-950 rounded-xl p-4 border border-slate-800 space-y-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Cenário: Foto de Palestra / Evento no LinkedIn</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-2.5 rounded-lg bg-rose-950/30 border border-rose-900/40 text-rose-300 flex items-start gap-2">
                <XCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
                <div>
                  <span className="font-semibold block text-rose-200">Ruim:</span>
                  "Palestra evento tecnologia pessoas"
                </div>
              </div>
              <div className="p-2.5 rounded-lg bg-emerald-950/30 border border-emerald-900/40 text-emerald-300 flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400 mt-0.5" />
                <div>
                  <span className="font-semibold block text-emerald-200">Excelente (AutoAlt AI):</span>
                  "Palestrante mulher apresentando slides sobre Inteligência Artificial no palco para um auditório lotado."
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
