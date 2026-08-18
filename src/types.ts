export type LanguageCode = 'pt-BR' | 'en-US' | 'es-ES' | 'fr-FR' | 'de-DE';

export type AltStyle = 'standard' | 'descriptive' | 'ecommerce' | 'social' | 'technical';

export type PlatformContext = 'general' | 'twitter' | 'linkedin' | 'instagram' | 'ecommerce' | 'wordpress';

export interface AltAnalysisResult {
  standardAlt: string;
  detailedDescription: string;
  extractedText: string;
  socialAlt: string;
  ecommerceAlt?: string;
  seoAlt: string;
  detectedElements: string[];
  dominantColors?: string[];
  visualMood?: string;
  wcagScore: number;
  accessibilityTips: string[];
}

export interface SampleImage {
  id: string;
  title: string;
  category: string;
  description: string;
  url: string;
}

export interface ExtensionSourceFile {
  name: string;
  content: string;
  language: string;
}
