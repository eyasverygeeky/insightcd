export type PosterFormat = 'dossier' | 'id-card';

export interface UploadedAssessmentImage {
  name: string;
  mimeType: string;
  base64Data: string;
  previewUrl: string;
  sizeLabel: string;
}

export interface RiasecScores {
  realistic: number;
  investigative: number;
  artistic: number;
  social: number;
  enterprising: number;
  conventional: number;
}

export interface BigFiveScores {
  openness: number;
  conscientiousness: number;
  extraversion: number;
  agreeableness: number;
  neuroticism: number;
}

export interface DominantRiasecTrait {
  code: 'R' | 'I' | 'A' | 'S' | 'E' | 'C';
  name: string;
  score: number;
  insight: string;
}

export interface BigFiveTraitHighlight {
  trait: string;
  score: number;
  level: 'High' | 'Moderate' | 'Low';
  interpretation: string;
}

export interface CareerAlignmentItem {
  choiceRank: number;
  careerTitle: string;
  fitRating: 'Strong Fit' | 'Aligned' | 'Exploratory Fit';
  synergyAnalysis: string;
  growthEdge: string;
}

export interface CareerProfileAnalysis {
  dossierId: string;
  generatedAt: string;
  riasec: {
    extractedCode: string;
    rawUnit: string;
    scores: RiasecScores;
    dominantTraits: DominantRiasecTrait[];
    visualSummary: string;
  };
  bigFive: {
    rawUnit: string;
    neuroticismLabel: 'Neuroticism' | 'Emotional Stability';
    scores: BigFiveScores;
    traitHighlights: BigFiveTraitHighlight[];
    visualSummary: string;
  };
  careerAlignment: CareerAlignmentItem[];
  profileSynthesis: {
    archetypeTitle: string;
    shortSummary: string;
    interpretation: string;
    workEnvironmentIdeal: string;
    recommendedNextStep: string;
    keyStrengths: string[];
  };
}
