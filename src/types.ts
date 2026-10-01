export type Program = 'NONE' | 'GRILL' | 'AIR CRISP' | 'ROAST' | 'BAKE' | 'DEHYDRATE';

export type VerdictLevel = 'perfect' | 'adapted' | 'batches' | 'partial' | 'unsuitable';

export interface Change {
  what: string;
  from: string;
  to: string;
  why: string;
}

export interface Ingredient {
  amount: string;
  item: string;
  note?: string;
  changed: boolean;
  originalAmount?: string;
}

export interface Step {
  text: string;
  program: Program;
  tempC?: number;
  grillLevel?: '' | 'LOW' | 'MEDIUM' | 'HIGH' | 'MAX';
  minutes: number;
  accessory?: string;
  preheat?: boolean;
  cue?: string;
  outsideNinja?: boolean;
}

export interface Recipe {
  title: string;
  subtitle?: string;
  verdict: { level: VerdictLevel; headline: string; explanation: string };
  primaryProgram: Program | 'MIXED';
  mainTempC?: number;
  accessory?: string;
  servingsOriginal?: string;
  servingsNinja?: string;
  scaleFactor?: number;
  totalMinutes?: number;
  ninjaMinutes?: number;
  batches?: { count: number; note: string };
  changes: Change[];
  ingredients: Ingredient[];
  steps: Step[];
  tips?: string[];
  warnings?: string[];
}

export interface HistoryItem {
  id: string;
  savedAt: number;
  sourceUrl?: string | null;
  recipe: Recipe;
}

export const PROGRAM_HE: Record<string, string> = {
  'GRILL': 'גריל',
  'AIR CRISP': 'טיגון אוויר',
  'ROAST': 'צלייה',
  'BAKE': 'אפייה',
  'DEHYDRATE': 'ייבוש',
  'MIXED': 'משולב',
  'NONE': 'מחוץ לנינג׳ה'
};

export const GRILL_HE: Record<string, string> = {
  LOW: 'LOW',
  MEDIUM: 'MED',
  HIGH: 'HIGH',
  MAX: 'MAX'
};
