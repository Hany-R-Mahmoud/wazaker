import { type BilingualText } from '../../../shared/i18n/bilingual-copy';

export type BilingualTone = 'default' | 'muted' | 'brand';

export interface BilingualLineProps {
  ar: string;
  en: string;
  tone?: BilingualTone;
}

export interface QuickAction {
  title: BilingualText;
  detail: BilingualText;
}

export interface SessionCardData {
  title: BilingualText;
  status: BilingualText;
  time: string;
}

export interface FeedbackItem {
  label: BilingualText;
  value: BilingualText;
}
