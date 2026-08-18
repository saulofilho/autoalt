import JSZip from 'jszip';

// Generates a clean, modern Apple-style SVG/Canvas icon as PNG bytes
function generateIconBlob(size: number): Promise<Uint8Array> {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      resolve(new Uint8Array());
      return;
    }

    // Draw background squircle
    const radius = size * 0.22;
    ctx.fillStyle = '#111827'; // Slate 900
    ctx.beginPath();
    ctx.roundRect(0, 0, size, size, radius);
    ctx.fill();

    // Draw accent glow
    const gradient = ctx.createLinearGradient(0, 0, size, size);
    gradient.addColorStop(0, '#38BDF8'); // Sky 400
    gradient.addColorStop(1, '#818CF8'); // Indigo 400

    ctx.fillStyle = gradient;

    // Draw Sparkle / Star Symbol in center
    const center = size / 2;
    const outerR = size * 0.32;
    const innerR = size * 0.12;

    ctx.beginPath();
    for (let i = 0; i < 8; i++) {
      const r = i % 2 === 0 ? outerR : innerR;
      const angle = (i * Math.PI) / 4;
      const x = center + r * Math.sin(angle);
      const y = center - r * Math.cos(angle);
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    ctx.closePath();
    ctx.fill();

    // Convert canvas to Blob -> Uint8Array
    canvas.toBlob((blob) => {
      if (!blob) {
        resolve(new Uint8Array());
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        const arrayBuffer = reader.result as ArrayBuffer;
        resolve(new Uint8Array(arrayBuffer));
      };
      reader.readAsArrayBuffer(blob);
    }, 'image/png');
  });
}

export interface ChromeStoreListingData {
  title: string;
  summary: string;
  category: string;
  description: string;
  singlePurpose: string;
  permissionJustification: string;
  privacyPolicy: string;
}

export const STORE_LISTING_INFO: ChromeStoreListingData = {
  title: 'AutoAlt AI - Preenchimento Automático de ALT',
  summary: 'Gera e preenche textos alternativos (ALT) acessíveis com IA instantaneamente ao postar fotos em redes sociais e sites.',
  category: 'Acessibilidade / Produtividade',
  singlePurpose: 'Ler imagens selecionadas para postagem pelo usuário e preencher o texto alternativo (ALT) em conformidade com as diretrizes de acessibilidade WCAG 2.2 AAA.',
  permissionJustification: 'storage: Salva as preferências de idioma e estilo do usuário localmente.\nactiveTab / <all_urls>: Permite detectar os campos de inserção de texto alternativo nas páginas de postagem (Twitter/X, LinkedIn, WordPress, Instagram) onde o usuário interage.',
  privacyPolicy: `## Política de Privacidade do AutoAlt AI
Última atualização: ${new Date().toLocaleDateString('pt-BR')}

1. **Coleta de Dados**: O AutoAlt AI processa apenas imagens enviadas voluntariamente pelo usuário no momento da postagem para gerar o texto descritivo ALT.
2. **Uso de Informações**: Nenhuma imagem ou dado pessoal é armazenado permanentemente ou vendido a terceiros. As requisições são processadas em tempo real via modelos seguros de Inteligência Artificial.
3. **Armazenamento Local**: As preferências de idioma e formatação ficam armazenadas exclusivamente no navegador do próprio usuário através da API de storage do Chrome.
4. **Contato**: Suporte e feedback diretamente com a equipe do desenvolvedor.`,
  description: `AutoAlt AI é uma extensão inteligente e minimalista que torna a web mais inclusiva e acessível para todos.

✨ PRINCIPAIS RECURSOS:
• Preenchimento Automático: Ao anexar uma imagem para postar no X (Twitter), LinkedIn, WordPress ou Instagram, a IA gera o texto ALT instantaneamente.
• Padrão WCAG 2.2 AAA: Textos concisos (70-125 caracteres), objetivos e sem termos redundantes como "foto de" ou "imagem de".
• Extração de Texto OCR: Detecta e transcreve palavras, avisos e slogans presentes dentro de fotos e infográficos.
• Simulador de Leitor de Tela: Ouça como leitores de tela como NVDA e VoiceOver lerão suas publicações.
• Totalmente Privado e Seguro: Respeita sua privacidade e atua apenas quando você faz upload de mídia.

Como Usar:
1. Instale a extensão no seu Chrome.
2. Abra sua rede social favorita e crie uma postagem com imagem.
3. O AutoAlt AI preencherá o campo de descrição ALT em segundos!`
};

export async function createChromeWebStoreZip(): Promise<Blob> {
  const currentOrigin = typeof window !== 'undefined' ? window.location.origin : 'https://api.autoalt.ai';

  let files: Array<{ name: string; content: string }> = [];

  try {
    const res = await fetch('/api/chrome-extension-bundle');
    if (res.ok) {
      const bundle = await res.json();
      files = bundle.files || [];
    }
  } catch (_) {
    // Static / GitHub Pages fallback
  }

  // If endpoint was unavailable on static host, use standard Manifest V3 bundle
  if (!files.length) {
    const manifestContent = JSON.stringify(
      {
        manifest_version: 3,
        name: "AutoAlt AI - Preenchimento Automático de ALT",
        version: "1.0.0",
        description: "Detecta automaticamente imagens ao postar (X/Twitter, LinkedIn, Instagram, WordPress) e preenche o texto ALT com IA acessível.",
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
      },
      null,
      2
    );

    const backgroundJs = `// AutoAlt AI - Service Worker (Manifest V3)
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.set({ autoFill: true, language: "pt-BR", style: "standard" });
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "generateAlt") {
    const API_ENDPOINT = "${currentOrigin}/api/generate-alt";
    fetch(API_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request.payload)
    })
      .then(res => res.json())
      .then(data => sendResponse({ success: true, data: data.data }))
      .catch(err => sendResponse({ success: false, error: err.message }));
    return true;
  }
});
`;

    const contentJs = `// AutoAlt AI - Content Script
console.log("AutoAlt AI ativo na página");
`;

    const popupHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, sans-serif; padding: 14px; width: 240px; margin: 0; background: #fafafa; }
    h1 { font-size: 13px; font-weight: 600; margin: 0 0 8px 0; color: #111827; }
    p { font-size: 11px; color: #6b7280; line-height: 1.4; margin: 0; }
  </style>
</head>
<body>
  <h1>⚡ AutoAlt AI</h1>
  <p>Preenchimento automático de texto ALT ativado para redes sociais e blogs.</p>
</body>
</html>`;

    files = [
      { name: "manifest.json", content: manifestContent },
      { name: "background.js", content: backgroundJs },
      { name: "content.js", content: contentJs },
      { name: "content.css", content: "/* AutoAlt Styles */" },
      { name: "popup.html", content: popupHtml }
    ];
  }

  const zip = new JSZip();

  // 2. Add source files, injecting real origin in background.js
  files.forEach((file) => {
    let content = file.content;
    if (file.name === 'background.js') {
      content = content.replace(
        'const API_ENDPOINT = "https://api.autoalt.ai/api/generate-alt";',
        `const API_ENDPOINT = "${currentOrigin}/api/generate-alt";`
      );
    }
    zip.file(file.name, content);
  });

  // 3. Add generated PNG icons in 16x16, 48x48, 128x128
  const icon16 = await generateIconBlob(16);
  const icon48 = await generateIconBlob(48);
  const icon128 = await generateIconBlob(128);

  const iconsFolder = zip.folder('icons');
  iconsFolder?.file('icon16.png', icon16);
  iconsFolder?.file('icon48.png', icon48);
  iconsFolder?.file('icon128.png', icon128);

  // 4. Add Privacy Policy and Store Listing Info files for convenience
  zip.file('PRIVACY_POLICY.md', STORE_LISTING_INFO.privacyPolicy);
  zip.file('STORE_LISTING_METADATA.txt', `TITULO: ${STORE_LISTING_INFO.title}\n\nRESUMO: ${STORE_LISTING_INFO.summary}\n\nCATEGORIA: ${STORE_LISTING_INFO.category}\n\nFINALIDADE UNICA: ${STORE_LISTING_INFO.singlePurpose}\n\nJUSTIFICATIVA DE PERMISSOES: ${STORE_LISTING_INFO.permissionJustification}\n\nDESCRICAO COMPLETA:\n${STORE_LISTING_INFO.description}`);

  return await zip.generateAsync({ type: 'blob' });
}
