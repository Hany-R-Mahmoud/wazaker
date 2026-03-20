export type BilingualText = {
  ar: string;
  en: string;
};

export type BilingualTextPair = {
  title: BilingualText;
  body: BilingualText;
};

export function createBilingualText(ar: string, en: string): BilingualText {
  return { ar, en };
}
