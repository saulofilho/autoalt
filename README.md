# ⚡ AutoAlt AI — Gerador de Texto Alternativo (ALT) & Extensão para Google Chrome

> **Acessibilidade web descomplicada com Inteligência Artificial.** Gere descrições ALT instantâneas em conformidade com as diretrizes **WCAG 2.2 AAA** para redes sociais, blogs e plataformas de e-commerce.

---

## 📌 Visão Geral

O **AutoAlt AI** é uma solução completa para acessibilidade visual na web, composta por:
1. **Aplicação Web Minimalista (Estilo Apple)**: Faça upload, arraste ou cole (<kbd>Ctrl+V</kbd> / <kbd>⌘V</kbd>) qualquer imagem para gerar o texto ALT acessível instantaneamente.
2. **Extensão para Google Chrome (Manifest V3)**: Detecta campos de imagem e preenche automaticamente o texto alternativo ao publicar no **X (Twitter)**, **LinkedIn**, **WordPress** e **Instagram**.
3. **Simulador de Leitor de Tela**: Ouça via sintetizador de voz (Web Speech API) exatamente como usuários de leitores de tela (NVDA, VoiceOver, JAWS) ouvirão a imagem descrita.

---

## ✨ Principais Funcionalidades

- **⚡ Geração Instantânea Multimodal**: Análise de imagem via **Google Gemini Vision** em alta velocidade.
- **♿ Padrão WCAG 2.2 AAA**: Gera textos concisos (70 a 125 caracteres), sem redundâncias do tipo *"foto de"* ou *"imagem contendo"*.
- **🔍 OCR Integrado**: Detecta, lê e transcreve com precisão textos, slogans e avisos contidos dentro de gráficos e banners.
- **🎨 Múltiplos Perfis de Saída**:
  - **Conciso / WCAG**: Focado na síntese do elemento visual principal.
  - **Descritivo**: Riqueza de detalhes sobre cores, posicionamento e ambiente.
  - **Redes Sociais & SEO**: Termos otimizados para busca e engajamento.
- **🧩 Exportação para Chrome Web Store**: Download do pacote `.zip` da extensão com ícones PNG (16x16, 48x48, 128x128) e metadados oficiais prontos para submissão.

---

## 🛠️ Tecnologias Utilizadas

- **Frontend**: [React 19](https://react.dev/), [TypeScript](https://www.typescriptlang.org/), [Tailwind CSS v4](https://tailwindcss.com/), [Lucide React](https://lucide.dev/), [Canvas Confetti](https://www.npmjs.com/package/canvas-confetti)
- **Backend / Servidor**: [Express](https://expressjs.com/), [Node.js](https://nodejs.org/)
- **IA & Modelos**: [@google/genai](https://www.npmjs.com/package/@google/genai) (`gemini-2.5-flash`, `gemini-3.1-flash-lite`, `gemini-3.7-flash`)
- **Manipulação de Pacotes**: [JSZip](https://stuk.github.io/jszip/)
- **Extensão do Navegador**: Google Chrome Manifest V3 (Service Worker + Content Scripts)

---

## 🚀 Como Executar Localmente

### Pré-requisitos
- [Node.js](https://nodejs.org/) (versão 18 ou superior)
- Chave de API do [Google Gemini](https://aistudio.google.com/)

### 1. Clonar o repositório
```bash
git clone https://github.com/seu-usuario/autoalt-ai.git
cd autoalt-ai
```

### 2. Instalar dependências
```bash
npm install
```

### 3. Configurar variáveis de ambiente
Crie um arquivo `.env` na raiz do projeto baseado no `.env.example`:
```bash
cp .env.example .env
```

Edite o `.env` e insira sua chave da API Gemini:
```env
GEMINI_API_KEY=sua_chave_gemini_aqui
```

### 4. Iniciar o servidor de desenvolvimento
```bash
npm run dev
```
O aplicativo estará disponível em: `http://localhost:3000`

---

## 📦 Como Usar a Extensão no Google Chrome

### Modo de Teste Local (Desenvolvedor)
1. Na interface da aplicação, clique em **"Testar .ZIP"** para baixar o arquivo compactado da extensão;
2. Extraia o arquivo `.zip` em uma pasta no seu computador;
3. No Google Chrome, acesse `chrome://extensions`;
4. Ative a opção **"Modo do desenvolvedor"** no canto superior direito;
5. Clique em **"Carregar sem compactação"** (*Load unpacked*) e selecione a pasta extraída;
6. Acesse o X (Twitter), LinkedIn ou WordPress e anexe uma imagem: a extensão gerará e preencherá o ALT automaticamente.

---

## 🌐 Publicação na Chrome Web Store

Para publicar a extensão na loja oficial do Google:

1. No aplicativo, clique em **"Publicar na Store"** no topo da página;
2. Baixe o pacote oficial `autoalt-ai-chrome-webstore-v1.0.0.zip`;
3. Acesse o [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole);
4. Clique em **"Novo item"** e envie o arquivo `.zip`;
5. Copie e cole os textos informativos (título, descrição curta, permissões e política de privacidade) disponíveis na aba **"Textos da Loja"** do modal;
6. Clique em **"Enviar para revisão"**.

---

## 📡 Endpoints da API

| Método | Endpoint | Descrição |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Verificação de status e saúde do servidor. |
| `POST` | `/api/generate-alt` | Analisa a imagem em base64 e retorna os textos alternativos gerados pela IA. |
| `GET` | `/api/chrome-extension-bundle` | Retorna o código-fonte empacotado da extensão Manifest V3. |

### Exemplo de Payload (`POST /api/generate-alt`):
```json
{
  "imageBase64": "data:image/jpeg;base64,...",
  "mimeType": "image/jpeg",
  "language": "pt-BR",
  "style": "standard",
  "context": "social"
}
```

---

## 📄 Licença

Este projeto é disponibilizado sob a licença [MIT](LICENSE).
Sinta-se à vontade para utilizar, customizar e contribuir para uma web mais inclusiva e acessível! 💙
