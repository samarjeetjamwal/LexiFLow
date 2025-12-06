export enum StyleType {
  PROFESSIONAL = 'Professional',
  FORMAL = 'Formal',
  INFORMAL = 'Informal',
  SOCIAL = 'Social',
  PERSUASIVE = 'Persuasive',
  CONCISE = 'Concise',
  ELABORATE = 'Elaborate',
  HUMOROUS = 'Humorous'
}

export interface EnhancementVariation {
  style: string;
  text: string;
  explanation: string;
}

export interface EnhancementResult {
  correctedText: string;
  variations: EnhancementVariation[];
  isValidEnglish: boolean;
  detectedIssues?: string[];
}

export interface TextStats {
  wordCount: number;
  charCount: number;
  readabilityScore: number; // Flesch-Kincaid Reading Ease
  readingTime: number; // in seconds
}
