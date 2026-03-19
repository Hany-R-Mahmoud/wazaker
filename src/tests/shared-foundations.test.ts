import { createBilingualText } from '../shared/i18n/bilingual-copy';
import { recitationHomeCopy } from '../shared/i18n/recitation-home-copy';
import { recitationTheme } from '../shared/theme';

describe('shared recitation foundations', () => {
  it('creates bilingual copy entries', () => {
    expect(createBilingualText('ابدأ', 'Start')).toEqual({
      ar: 'ابدأ',
      en: 'Start',
    });
  });

  it('exposes the recitation home copy with bilingual hero content', () => {
    expect(recitationHomeCopy.hero.title.ar).toBe('رفيق مراجعة التلاوة');
    expect(recitationHomeCopy.hero.title.en).toBe('AI-guided Quran recitation revision');
  });

  it('exposes shared theme tokens for the recitation flow', () => {
    expect(recitationTheme.colors.background).toBe('#F7F1E8');
    expect(recitationTheme.spacing.xl).toBeGreaterThan(recitationTheme.spacing.md);
  });
});
