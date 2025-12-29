
/**
 * Lexicon Validation logic for Tarife Attär.
 * Ensures curators use evocative, scientific language instead of generic retail terms.
 */
export const validateScientificLexicon = (text: string | undefined) => {
  if (!text) return true;

  const forbidden = [
    { word: 'nice', alternatives: ['resinous', 'atmospheric', 'profound'] },
    { word: 'smell', alternatives: ['aroma', 'olfactory profile', 'vibration'] },
    { word: 'good', alternatives: ['refined', 'tenacious', 'exceptional'] },
    { word: 'strong', alternatives: ['potent', 'penetrating', 'assertive'] },
    { word: 'scent', alternatives: ['extraction', 'effluvium', 'essence'] }
  ];

  const found = forbidden.find(f => text.toLowerCase().includes(f.word));

  if (found) {
    return {
      message: `Lexicon Error: "${found.word}" is too generic for the Archive. Consider: ${found.alternatives.join(', ')}.`,
      level: 'warning'
    };
  }

  return true;
};
