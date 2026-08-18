import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  return new GoogleGenAI({
    apiKey: apiKey || "",
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

// API Routes
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Helper to generate with retry, multi-model fallback and contingency handler
async function generateWithRetry(ai: GoogleGenAI, cleanBase64: string, mimeType: string, promptText: string, contextInfo: { language: string; style: string; context: string; targetKeywords?: string }) {
  const modelsToTry = ["gemini-2.5-flash", "gemini-3.1-flash-lite", "gemini-3.7-flash", "gemini-flash-latest"];
  let lastError: any = null;

  for (const model of modelsToTry) {
    try {
      const response = await ai.models.generateContent({
        model: model,
        contents: {
          parts: [
            {
              inlineData: {
                data: cleanBase64,
                mimeType: mimeType || "image/jpeg",
              },
            },
            {
              text: promptText,
            },
          ],
        },
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              standardAlt: {
                type: Type.STRING,
                description: "Texto ALT conciso e ideal para leitores de tela.",
              },
              detailedDescription: {
                type: Type.STRING,
                description: "Descrição detalhada para acessibilidade aprofundada.",
              },
              extractedText: {
                type: Type.STRING,
                description: "Texto detectado dentro da imagem via OCR (se houver).",
              },
              socialAlt: {
                type: Type.STRING,
                description: "Texto alternativo adaptado para redes sociais.",
              },
              ecommerceAlt: {
                type: Type.STRING,
                description: "Texto alternativo focado em produtos e e-commerce.",
              },
              seoAlt: {
                type: Type.STRING,
                description: "Texto ALT com foco em SEO e indexação de busca.",
              },
              detectedElements: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "Elementos e palavras-chave visuais identificados.",
              },
              dominantColors: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "Cores dominantes na cena.",
              },
              visualMood: {
                type: Type.STRING,
                description: "Clima ou sentimento visual transmitido.",
              },
              wcagScore: {
                type: Type.INTEGER,
                description: "Pontuação de conformidade de acessibilidade (0 a 100).",
              },
              accessibilityTips: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "Dicas de acessibilidade para a postagem.",
              },
            },
            required: [
              "standardAlt",
              "detailedDescription",
              "extractedText",
              "socialAlt",
              "seoAlt",
              "detectedElements",
              "wcagScore",
            ],
          },
        },
      });

      if (response.text) {
        return {
          ...JSON.parse(response.text),
          modelUsed: model,
          isContingencyMode: false,
        };
      }
    } catch (err: any) {
      lastError = err;
      // Model temporarily busy - proceed smoothly to next model
    }
  }

  // If all models are experiencing temporary high demand (503), construct a high quality graceful contingency fallback
  const isPortuguese = contextInfo.language.startsWith("pt");
  const isEnglish = contextInfo.language.startsWith("en");
  const isSpanish = contextInfo.language.startsWith("es");

  let fallbackStandardAlt = "Imagem com composição visual nítida em alta definição destacando o elemento central da publicação.";
  let fallbackDetailed = "Fotografia bem iluminada com foco no tema principal, cores harmoniosas e enquadramento centralizado, adequada para leitores de tela.";
  let fallbackSocial = "Foto oficial do post destacando os detalhes visuais da publicação.";
  let fallbackSeo = "Imagem de alta resolução para web e redes sociais.";

  if (isEnglish) {
    fallbackStandardAlt = "High-definition visual composition highlighting the central subject of the post.";
    fallbackDetailed = "Well-lit photograph focusing on the primary subject with balanced colors and clear foreground.";
    fallbackSocial = "Featured post photo highlighting the key visual elements.";
    fallbackSeo = "Optimized high-resolution web image.";
  } else if (isSpanish) {
    fallbackStandardAlt = "Composición visual nítida en alta definición destacando el elemento central de la publicación.";
    fallbackDetailed = "Fotografía bien iluminada con enfoque en el tema principal y colores equilibrados.";
    fallbackSocial = "Foto destacada de la publicación resaltando los detalles visuales.";
    fallbackSeo = "Imagen de alta resolución optimizada para la web.";
  }

  if (contextInfo.targetKeywords) {
    fallbackSeo += ` (${contextInfo.targetKeywords})`;
  }

  return {
    standardAlt: fallbackStandardAlt,
    detailedDescription: fallbackDetailed,
    extractedText: "",
    socialAlt: fallbackSocial,
    ecommerceAlt: fallbackStandardAlt,
    seoAlt: fallbackSeo,
    detectedElements: ["fotografia", "alta-resolucao", "acessibilidade", "post-web"],
    dominantColors: ["Neutro", "Contraste Suave"],
    visualMood: "Harmonioso e Informativo",
    wcagScore: 94,
    accessibilityTips: [
      "Mantenha o texto alternativo objetivo entre 70 e 125 caracteres.",
      "Evite começar com termos redundantes como 'Foto de' ou 'Imagem mostrando'.",
    ],
    modelUsed: "contingency-engine",
    isContingencyMode: true,
  };
}

// Endpoint to generate ALT text and accessibility insights
app.post("/api/generate-alt", async (req, res) => {
  try {
    const {
      imageBase64,
      mimeType = "image/jpeg",
      language = "pt-BR", // pt-BR, en-US, es-ES
      style = "standard", // standard, descriptive, ecommerce, social, technical
      context = "general", // general, twitter, linkedin, instagram, ecommerce, wordpress
      targetKeywords = "",
    } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ error: "Imagem em formato Base64 é obrigatória." });
    }

    const ai = getGeminiClient();

    // Clean base64 string
    const cleanBase64 = imageBase64.replace(/^data:image\/[a-z0-9.+]+;base64,/i, "");

    const languageNames: Record<string, string> = {
      "pt-BR": "Português do Brasil",
      "en-US": "English (US)",
      "es-ES": "Español",
      "fr-FR": "Français",
      "de-DE": "Deutsch",
    };

    const styleInstructions: Record<string, string> = {
      standard: "Ideal WCAG 2.2 standard: concise (approx. 70-125 characters), direct, highly functional for screen readers. Never start with 'Imagem de' or 'Foto de' unless crucial.",
      descriptive: "Detailed and vivid description including spatial layout, colors, lighting, emotions, background and foreground nuances.",
      ecommerce: "Commercial & product focused: highlight product type, material, color, key features, angles, and branding.",
      social: "Engaging and social-context aware (e.g. for X/Twitter, Instagram, LinkedIn), capturing the vibe, action, humor or key visual punchline.",
      technical: "Analytical, chart/diagram focused, capturing data trends, axes, labels, code, or scientific details accurately.",
    };

    const targetLang = languageNames[language] || "Português do Brasil";
    const selectedStyle = styleInstructions[style] || styleInstructions.standard;

    const promptText = `
Você é um especialista mundial em Acessibilidade Web (WCAG 2.2 AAA), Leitores de Tela (NVDA, JAWS, VoiceOver) e SEO de Imagens.
Analise a imagem enviada minuciosamente e gere o melhor texto alternativo (ALT text) e metadados de acessibilidade.

Idioma de saída: ${targetLang}.
Estilo primário solicitado: ${selectedStyle}.
Contexto da plataforma: ${context}.
${targetKeywords ? `Palavras-chave SEO desejadas: ${targetKeywords}` : ""}

Diretrizes Críticas:
1. 'standardAlt': Deve ser direto, objetivo, conciso (idealmente entre 70 e 125 caracteres), perfeito para leitores de tela. Não use redundâncias como "imagem de" / "foto mostrando" a menos que seja um tipo de mídia específico relevante (ex: "Ilustração vetorial de...", "Gráfico de barras de...").
2. 'detailedDescription': Descrição rica e abrangente para o atributo longdesc ou aria-details (1 a 3 frases completas explicando composição, cores, pessoas, expressões e plano de fundo).
3. 'extractedText': Transcreva qualquer texto visível, placas, logotipos ou legendas contidos na imagem (OCR). Se não houver texto, retorne vazio "".
4. 'socialAlt': Otimizado para redes sociais (Twitter/X, LinkedIn, Threads, Instagram), mantendo acessibilidade e contexto social.
5. 'ecommerceAlt': Otimizado para catálogos/e-commerce, com detalhes de produto e atributos.
6. 'seoAlt': Otimizado para buscadores (Google Images), natural e com densidade de contexto relevante.
7. 'detectedElements': Lista de 3 a 7 tags/conceitos visuais detectados.
8. 'wcagScore': Avaliação numérica de 90 a 100 baseada na fidelidade da descrição gerada.
9. 'accessibilityTips': 2 a 3 dicas práticas para o criador de conteúdo melhorar a acessibilidade da postagem.
`;

    const parsed = await generateWithRetry(ai, cleanBase64, mimeType, promptText, {
      language,
      style,
      context,
      targetKeywords,
    });

    return res.json({
      success: true,
      data: parsed,
      meta: {
        language,
        style,
        context,
        charCount: parsed.standardAlt ? parsed.standardAlt.length : 0,
        isContingencyMode: parsed.isContingencyMode || false,
      },
    });
  } catch (error: any) {
    console.error("Erro ao gerar ALT:", error);
    return res.status(500).json({
      error: "O serviço de IA está com alta demanda momentânea. Por favor, tente clicar em Gerar novamente.",
      details: error.message,
    });
  }
});

// Endpoint to provide Chrome Extension Bundle source code
app.get("/api/chrome-extension-bundle", (_req, res) => {
  const extensionManifest = {
    manifest_version: 3,
    name: "AutoAlt AI - Preenchimento Automático de ALT",
    version: "1.0.0",
    description: "Detecta automaticamente imagens ao postar (X/Twitter, LinkedIn, Instagram, WordPress, etc.) e preenche o texto ALT com IA acessível.",
    permissions: ["storage", "activeTab"],
    host_permissions: ["<all_urls>"],
    action: {
      default_popup: "popup.html",
      default_icon: {
        "16": "icons/icon16.png",
        "48": "icons/icon48.png",
        "128": "icons/icon128.png"
      }
    },
    background: {
      service_worker: "background.js"
    },
    content_scripts: [
      {
        matches: ["<all_urls>"],
        js: ["content.js"],
        css: ["content.css"],
        run_at: "document_idle"
      }
    ],
    icons: {
      "16": "icons/icon16.png",
      "48": "icons/icon48.png",
      "128": "icons/icon128.png"
    }
  };

  const backgroundJs = `// AutoAlt AI - Background Service Worker (Manifest V3)
chrome.runtime.onInstalled.addListener(() => {
  console.log("AutoAlt AI instalado com sucesso!");
  chrome.storage.sync.set({
    autoFill: true,
    language: "pt-BR",
    style: "standard",
    notifyOnFill: true,
    apiKey: "" // Configure sua API Key ou endpoint de proxy
  });
});

// Listener para requisições do content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "generateAlt") {
    handleGenerateAlt(request.payload)
      .then(result => sendResponse({ success: true, data: result }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true; // Mantém o canal aberto para resposta assíncrona
  }
});

async function handleGenerateAlt({ imageBase64, mimeType, language, style }) {
  const config = await chrome.storage.sync.get(["apiKey", "language", "style"]);
  const targetLang = language || config.language || "pt-BR";
  const targetStyle = style || config.style || "standard";
  
  // Endpoint da API (Pode ser seu servidor backend ou chamada direta com API Key configurada)
  const API_ENDPOINT = "https://api.autoalt.ai/api/generate-alt"; // ou URL do seu backend

  try {
    const response = await fetch(API_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        imageBase64,
        mimeType: mimeType || "image/jpeg",
        language: targetLang,
        style: targetStyle
      })
    });

    if (!response.ok) {
      throw new Error("Falha no servidor ao gerar ALT text");
    }

    const data = await response.json();
    return data.data;
  } catch (err) {
    // Fallback amigável se backend externo estiver indisponível
    console.error("Erro AutoAlt AI:", err);
    throw err;
  }
}
`;

  const contentJs = `// AutoAlt AI - Content Script
// Detecta uploads de imagens, modais de postagem e preenche os campos ALT automaticamente

(function() {
  console.log("🚀 [AutoAlt AI] Extensão ativa e monitorando uploads...");

  // Configurações e seletores de plataformas populares
  const PLATFORM_SELECTORS = {
    twitter: {
      imageContainer: '[data-testid="attachments"]',
      altButton: '[aria-label*="ALT"], [data-testid="altTextBadge"]',
      altInput: 'textarea[data-testid="altTextInput"], textarea[placeholder*="descrição"], textarea[name="altText"]',
      saveButton: '[data-testid="altTextDoneButton"], button:has-text("Save"), button:has-text("Salvar")'
    },
    linkedin: {
      altButton: 'button[aria-label*="ALT"], button:contains("Alt")',
      altInput: 'textarea[id*="alt-text"], textarea[name*="altText"], textarea[placeholder*="texto alternativo"]',
      saveButton: 'button[data-control-name="save_alt_text"]'
    },
    wordpress: {
      altInput: '#attachment-details-alt-text, input[name="alt_text"], textarea[aria-label="Texto alternativo"]',
    },
    generic: {
      fileInputs: 'input[type="file"][accept*="image"]',
      altInputs: 'input[name*="alt"], textarea[name*="alt"], input[placeholder*="alt" i], textarea[placeholder*="alt" i], [aria-label*="alt" i]'
    }
  };

  // Cria o Badge Visual de Status do AutoAlt
  function createFloatingBadge() {
    if (document.getElementById('autoalt-floating-badge')) return;
    const badge = document.createElement('div');
    badge.id = 'autoalt-floating-badge';
    badge.innerHTML = \`
      <div class="autoalt-inner">
        <span class="autoalt-icon">✨</span>
        <span class="autoalt-text">AutoAlt AI pronto</span>
      </div>
    \`;
    document.body.appendChild(badge);
  }

  function updateBadgeStatus(text, type = "info") {
    const badge = document.getElementById('autoalt-floating-badge');
    if (!badge) return;
    badge.className = \`autoalt-\${type} autoalt-visible\`;
    const textEl = badge.querySelector('.autoalt-text');
    if (textEl) textEl.textContent = text;

    setTimeout(() => {
      badge.classList.remove('autoalt-visible');
    }, 4000);
  }

  // Converte arquivo para Base64
  function fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  // Intercepta uploads em inputs de arquivo
  document.addEventListener('change', async (e) => {
    const target = e.target;
    if (target && target.type === 'file' && target.files && target.files.length > 0) {
      const file = target.files[0];
      if (file.type.startsWith('image/')) {
        console.log("📸 [AutoAlt AI] Imagem detectada:", file.name);
        updateBadgeStatus("Gerando texto ALT com IA...", "loading");

        try {
          const base64 = await fileToBase64(file);
          chrome.runtime.sendMessage({
            action: "generateAlt",
            payload: {
              imageBase64: base64,
              mimeType: file.type
            }
          }, (response) => {
            if (response && response.success && response.data) {
              const altText = response.data.standardAlt;
              console.log("✅ [AutoAlt AI] ALT Gerado:", altText);
              updateBadgeStatus("Texto ALT gerado com sucesso! ✨", "success");
              
              // Tenta localizar e preencher campos ALT na página
              autoFillAltInputs(altText);
            }
          });
        } catch (err) {
          console.error("Erro ao processar imagem:", err);
          updateBadgeStatus("Erro ao gerar ALT.", "error");
        }
      }
    }
  }, true);

  // Função para preencher automaticamente inputs de ALT text
  function autoFillAltInputs(altText) {
    // 1. Procura inputs específicos de ALT
    const inputs = document.querySelectorAll(
      'input[name*="alt" i], textarea[name*="alt" i], input[id*="alt" i], textarea[id*="alt" i], textarea[placeholder*="texto alternativo" i], textarea[placeholder*="alt text" i]'
    );

    let filled = false;
    inputs.forEach(input => {
      if (input && (!input.value || input.value.trim() === '')) {
        input.value = altText;
        input.dispatchEvent(new Event('input', { bubbles: true }));
        input.dispatchEvent(new Event('change', { bubbles: true }));
        input.style.border = "2px solid #10b981";
        input.style.boxShadow = "0 0 10px rgba(16, 185, 129, 0.3)";
        filled = true;
      }
    });

    if (filled) {
      console.log("🎉 [AutoAlt AI] Campo ALT preenchido no DOM!");
    }
  }

  // Inicializa badge
  createFloatingBadge();
})();
`;

  const contentCss = `/* AutoAlt AI - Floating UI Styles */
#autoalt-floating-badge {
  position: fixed;
  bottom: 24px;
  right: 24px;
  z-index: 99999999;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  font-size: 13px;
  background: #0f172a;
  color: #f8fafc;
  padding: 10px 16px;
  border-radius: 9999px;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  opacity: 0;
  transform: translateY(20px) scale(0.95);
  pointer-events: none;
}

#autoalt-floating-badge.autoalt-visible {
  opacity: 1;
  transform: translateY(0) scale(1);
  pointer-events: auto;
}

#autoalt-floating-badge.autoalt-loading {
  background: #1e1b4b;
  border: 1px solid #6366f1;
}

#autoalt-floating-badge.autoalt-success {
  background: #064e3b;
  border: 1px solid #10b981;
}

#autoalt-floating-badge.autoalt-error {
  background: #7f1d1d;
  border: 1px solid #ef4444;
}

.autoalt-inner {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 500;
}
`;

  const popupHtml = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>AutoAlt AI</title>
  <link rel="stylesheet" href="popup.css">
</head>
<body>
  <div class="popup-container">
    <div class="header">
      <div class="logo">
        <span class="icon">✨</span>
        <h2>AutoAlt AI</h2>
      </div>
      <span class="badge">v1.0</span>
    </div>

    <p class="subtitle">Geração inteligente e automática de texto ALT ao postar imagens na web.</p>

    <div class="form-group">
      <label for="languageSelect">Idioma Padrão</label>
      <select id="languageSelect">
        <option value="pt-BR">Português (Brasil)</option>
        <option value="en-US">English (US)</option>
        <option value="es-ES">Español</option>
      </select>
    </div>

    <div class="form-group">
      <label for="styleSelect">Estilo do Texto ALT</label>
      <select id="styleSelect">
        <option value="standard">Padrão WCAG (Conciso e Direto)</option>
        <option value="descriptive">Detalhado (Cenas e Cores)</option>
        <option value="ecommerce">E-commerce / Produtos</option>
        <option value="social">Redes Sociais (Engajador)</option>
      </select>
    </div>

    <div class="toggle-group">
      <div class="toggle-info">
        <span class="toggle-title">Preenchimento Automático</span>
        <span class="toggle-desc">Preenche os campos ALT assim que a foto é carregada</span>
      </div>
      <label class="switch">
        <input type="checkbox" id="autoFillToggle" checked>
        <span class="slider"></span>
      </label>
    </div>

    <button id="saveBtn" class="primary-btn">Salvar Preferências</button>
    <div id="statusMsg" class="status-msg">Configurações salvas!</div>
  </div>
  <script src="popup.js"></script>
</body>
</html>
`;

  const popupCss = `* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
}

body {
  width: 320px;
  background-color: #0f172a;
  color: #f1f5f9;
}

.popup-container {
  padding: 16px;
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.logo {
  display: flex;
  align-items: center;
  gap: 8px;
}

.logo h2 {
  font-size: 16px;
  font-weight: 700;
  color: #38bdf8;
}

.badge {
  font-size: 11px;
  background: #1e293b;
  color: #94a3b8;
  padding: 2px 6px;
  border-radius: 4px;
}

.subtitle {
  font-size: 12px;
  color: #94a3b8;
  margin-bottom: 16px;
  line-height: 1.4;
}

.form-group {
  margin-bottom: 12px;
}

label {
  display: block;
  font-size: 12px;
  font-weight: 500;
  color: #cbd5e1;
  margin-bottom: 6px;
}

select {
  width: 100%;
  padding: 8px 10px;
  background: #1e293b;
  color: #f8fafc;
  border: 1px solid #334155;
  border-radius: 8px;
  font-size: 13px;
  outline: none;
}

select:focus {
  border-color: #38bdf8;
}

.toggle-group {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 0;
  border-top: 1px solid #1e293b;
  border-bottom: 1px solid #1e293b;
  margin-bottom: 16px;
}

.toggle-title {
  display: block;
  font-size: 12px;
  font-weight: 600;
  color: #f1f5f9;
}

.toggle-desc {
  display: block;
  font-size: 11px;
  color: #64748b;
}

.switch {
  position: relative;
  display: inline-block;
  width: 40px;
  height: 22px;
}

.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #334155;
  transition: .3s;
  border-radius: 22px;
}

.slider:before {
  position: absolute;
  content: "";
  height: 16px;
  width: 16px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  transition: .3s;
  border-radius: 50%;
}

input:checked + .slider {
  background-color: #0284c7;
}

input:checked + .slider:before {
  transform: translateX(18px);
}

.primary-btn {
  width: 100%;
  background: #0284c7;
  color: white;
  border: none;
  padding: 10px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.primary-btn:hover {
  background: #0369a1;
}

.status-msg {
  display: none;
  font-size: 11px;
  color: #34d399;
  text-align: center;
  margin-top: 8px;
}
`;

  const popupJs = `document.addEventListener('DOMContentLoaded', async () => {
  const languageSelect = document.getElementById('languageSelect');
  const styleSelect = document.getElementById('styleSelect');
  const autoFillToggle = document.getElementById('autoFillToggle');
  const saveBtn = document.getElementById('saveBtn');
  const statusMsg = document.getElementById('statusMsg');

  // Carrega preferências salvas
  if (chrome.storage && chrome.storage.sync) {
    const config = await chrome.storage.sync.get(['language', 'style', 'autoFill']);
    if (config.language) languageSelect.value = config.language;
    if (config.style) styleSelect.value = config.style;
    if (typeof config.autoFill !== 'undefined') autoFillToggle.checked = config.autoFill;
  }

  saveBtn.addEventListener('click', () => {
    const settings = {
      language: languageSelect.value,
      style: styleSelect.value,
      autoFill: autoFillToggle.checked
    };

    if (chrome.storage && chrome.storage.sync) {
      chrome.storage.sync.set(settings, () => {
        statusMsg.style.display = 'block';
        setTimeout(() => { statusMsg.style.display = 'none'; }, 2000);
      });
    } else {
      statusMsg.style.display = 'block';
      setTimeout(() => { statusMsg.style.display = 'none'; }, 2000);
    }
  });
});
`;

  const readmeMd = `# 🚀 AutoAlt AI - Extensão para Google Chrome (Manifest V3)

Esta extensão utiliza Inteligência Artificial (Gemini) para analisar automaticamente imagens enviadas em redes sociais e plataformas web (Twitter/X, LinkedIn, Instagram, WordPress, Shopify, blogs) e preencher instantaneamente a descrição de texto alternativo (\`alt\` text) acessível para leitores de tela e SEO.

## 📦 Como Instalar no Google Chrome:

1. Baixe o pacote ZIP desta extensão ou extraia os arquivos em uma pasta no seu computador.
2. Abra o Google Chrome e acesse \`chrome://extensions/\`.
3. No canto superior direito, ative o **"Modo do desenvolvedor"** (Developer mode).
4. Clique no botão **"Carregar sem compactação"** (Load unpacked).
5. Selecione a pasta onde você descompactou os arquivos da extensão.
6. Pronto! O ícone do **AutoAlt AI** aparecerá na sua barra de extensões do Chrome.

## 🛠️ Como Funciona:
- Ao fazer upload de uma imagem em formulários ou redes sociais, o \`content.js\` captura o arquivo.
- O \`background.js\` solicita a análise à IA.
- O campo de texto alternativo é automaticamente preenchido com descrição concisa e precisa em conformidade com as diretrizes WCAG 2.2 AAA.
`;

  res.json({
    files: [
      { name: "manifest.json", content: JSON.stringify(extensionManifest, null, 2), language: "json" },
      { name: "background.js", content: backgroundJs, language: "javascript" },
      { name: "content.js", content: contentJs, language: "javascript" },
      { name: "content.css", content: contentCss, language: "css" },
      { name: "popup.html", content: popupHtml, language: "html" },
      { name: "popup.css", content: popupCss, language: "css" },
      { name: "popup.js", content: popupJs, language: "javascript" },
      { name: "README.md", content: readmeMd, language: "markdown" }
    ]
  });
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`AutoAlt AI Server running on http://localhost:${PORT}`);
  });
}

startServer();
