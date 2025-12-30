/**
 * Sensory Lexicon Validation
 * 
 * Acts as an "Editor-in-Chief" to prevent generic marketing language
 * and maintain the elevated, perfumery-accurate tone of Tarife Attär.
 * 
 * Returns WARNINGS (not errors) to allow content saving while guiding
 * editors toward more sophisticated language.
 */

// Compatible with both Sanity v3 types and simplified schema pattern
type SanityRule = {
  required: () => SanityRule;
  min: (n: number) => SanityRule;
  max: (n: number) => SanityRule;
  custom: (validator: (value: unknown) => true | string | { message: string; level?: 'error' | 'warning' }) => SanityRule;
};

type Rule = SanityRule;

// Forbidden generic terms and their sophisticated alternatives
const LEXICON_MAP: Record<string, string[]> = {
  smell: ['Olfactory Profile', 'Sillage', 'Aromatic Character', 'Scent Signature'],
  nice: ['Evocative', 'Compelling', 'Nuanced', 'Distinctive'],
  strong: ['Tenacious', 'Resinous', 'Potent', 'Concentrated'],
  cheap: ['Accessible', 'Approachable', 'Value-Oriented'],
  good: ['Exceptional', 'Notable', 'Remarkable', 'Distinguished'],
};

// Case-insensitive regex pattern for all forbidden terms
const FORBIDDEN_PATTERN = new RegExp(
  `\\b(${Object.keys(LEXICON_MAP).join('|')})\\b`,
  'gi'
);

/**
 * Extracts text content from Portable Text blocks
 */
function extractTextFromPortableText(value: unknown): string {
  if (!value || !Array.isArray(value)) return '';
  
  return value
    .map((block) => {
      if (block._type === 'block' && block.children) {
        return block.children
          .map((child: { text?: string }) => child.text || '')
          .join('');
      }
      return '';
    })
    .join(' ');
}

/**
 * Scans a string for forbidden generic terms
 * Returns array of warnings with suggestions
 */
function scanForGenericTerms(text: string): Array<{ term: string; suggestions: string[] }> {
  if (!text || typeof text !== 'string') return [];
  
  const found: Array<{ term: string; suggestions: string[] }> = [];
  let match: RegExpExecArray | null;
  
  // Use exec instead of matchAll for better compatibility
  while ((match = FORBIDDEN_PATTERN.exec(text)) !== null) {
    const term = match[1].toLowerCase();
    if (!found.some((f) => f.term === term)) {
      found.push({
        term,
        suggestions: LEXICON_MAP[term] || [],
      });
    }
  }
  
  return found;
}

/**
 * Main validation function for Sensory Lexicon
 * Works with both string fields and Portable Text blocks
 */
export function sensoryLexiconValidation(
  rule: Rule,
  fieldName: string = 'this field'
): Rule {
  return rule.custom((value: unknown) => {
    if (!value) return true; // Allow empty values
    
    let textToScan = '';
    
    // Handle Portable Text blocks
    if (Array.isArray(value)) {
      textToScan = extractTextFromPortableText(value);
    }
    // Handle string values
    else if (typeof value === 'string') {
      textToScan = value;
    }
    // Skip other types
    else {
      return true;
    }
    
    // Scan for forbidden terms
    const violations = scanForGenericTerms(textToScan);
    
    if (violations.length === 0) {
      return true; // No violations found
    }
    
    // Build warning message with suggestions
    const suggestions = violations
      .map((v) => {
        const altText = v.suggestions.length > 0
          ? ` Consider: ${v.suggestions.join(', ')}`
          : '';
        return `"${v.term}" →${altText}`;
      })
      .join('\n');
    
    return {
      message: `⚠️ Sensory Lexicon Warning: Generic language detected in ${fieldName}.\n\n${suggestions}\n\nMaintain Tarife Attär's elevated, perfumery-accurate tone.`,
      level: 'warning', // Warning allows saving, error would block
    };
  });
}

/**
 * Convenience function for validating string fields
 */
export function validateSensoryString(fieldName: string = 'this field'): (rule: Rule) => Rule {
  return (rule: Rule) => sensoryLexiconValidation(rule, fieldName);
}

/**
 * Convenience function for validating Portable Text fields
 */
export function validateSensoryPortableText(fieldName: string = 'this field'): (rule: Rule) => Rule {
  return (rule: Rule) => sensoryLexiconValidation(rule, fieldName);
}
