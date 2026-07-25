const fs = require('fs');
const path = require('path');

// Helper to load dictionary file lines
const loadTxtFile = (fileName) => {
  try {
    const filePath = path.join(__dirname, '../moderation', fileName);
    if (!fs.existsSync(filePath)) {
      console.warn(`Moderation file not found: ${filePath}`);
      return [];
    }
    return fs.readFileSync(filePath, 'utf8')
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0 && !line.startsWith('#') && !/[|\\\[\]()+\-*]/.test(line));
  } catch (err) {
    console.error(`Error loading moderation file ${fileName}:`, err);
    return [];
  }
};

// Helper to load JSON file
const loadJsonFile = (fileName) => {
  try {
    const filePath = path.join(__dirname, '../moderation', fileName);
    if (!fs.existsSync(filePath)) {
      console.warn(`Moderation file not found: ${filePath}`);
      return {};
    }
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (err) {
    console.error(`Error loading moderation JSON file ${fileName}:`, err);
    return {};
  }
};

// Initialize dictionaries
const englishProfanity = loadTxtFile('english_profanity.txt');
const hindiProfanity = loadTxtFile('hindi_profanity.txt');
const hinglishProfanity = loadTxtFile('hinglish_profanity.txt');
const sexualTerms = loadTxtFile('sexual_terms.txt');
const harassmentPhrases = loadTxtFile('harassment_phrases.txt');
const contactRequestPhrases = loadTxtFile('contact_request_phrases.txt');
const threatPhrases = loadTxtFile('threat_phrases.txt');
const scamPhrases = loadTxtFile('scam_phrases.txt');
const spamPatterns = loadTxtFile('spam_patterns.txt');
const piiPatterns = loadJsonFile('pii_patterns.json');
const normalizationRules = loadJsonFile('normalization_rules.json');

// Combines word lists for easy checks
const allProfanityAndAbuse = [
  ...englishProfanity,
  ...hindiProfanity,
  ...hinglishProfanity,
  ...sexualTerms
];

// Unified 20-step text normalization pipeline
const applyPipeline = (text) => {
  if (!text) return "";
  let processed = text;

  // 1. Lowercase
  processed = processed.toLowerCase();

  // 2. Unicode Normalization
  processed = processed.normalize("NFKC");

  // 3. Remove Zero-width Characters
  processed = processed.replace(/[\u200B-\u200D\uFEFF]/g, "");

  // 13. Remove Emoji
  processed = processed.replace(/\p{Extended_Pictographic}/gu, " ");

  // 15. Normalize URLs (before converting leetspeak or removing decorative symbols)
  processed = processed.replace(/https?:\/\/\S+/gi, " URL ");

  // 16. Normalize Emails (before converting @)
  processed = processed.replace(/\S+@\S+\.\S+/g, " EMAIL ");

  // 17. Normalize Phone Numbers
  processed = processed.replace(/(?:\+91|91)?[\s-]?[6-9]\d{9}/g, " PHONE ");

  // 18. Normalize UPI IDs (before converting @)
  processed = processed.replace(/\b[a-z0-9._-]{2,}@[a-z]{2,}\b/gi, " UPI ");

  // 19. Normalize User Mentions (before converting @)
  processed = processed.replace(/@[a-z0-9_.]+/gi, " USER ");

  // 4. Convert Leetspeak
  const leetMap = {
    "0": "o", "1": "i", "!": "i", "|": "i", "3": "e", "4": "a",
    "@": "a", "$": "s", "5": "s", "7": "t", "8": "b", "9": "g", "+": "t"
  };
  processed = processed.replace(/[01345789@$!|+]/g, c => leetMap[c] || c);

  // 5. Remove Decorative Symbols
  processed = processed.replace(/[^\p{L}\p{N}\s]/gu, " ");

  // 8. Remove Spaces Between Letters (e.g. "h e l l o" -> "hello")
  processed = processed.replace(/\b(?:[a-z]\s+){2,}[a-z]\b/gi, m => m.replace(/\s+/g, ""));

  // 9. Normalize Mixed Separators
  processed = processed.replace(/[._\-]+/g, "");

  // 10. Normalize Numbers Used as Separators
  processed = processed.replace(/([a-z])[0-9]+([a-z])/gi, "$1$2");

  // 11. Transliteration Mapping (Roman Hindi)
  const variants = [
    [/kh/g, "k"],
    [/ph/g, "f"],
    [/bh/g, "b"],
    [/dh/g, "d"],
    [/th/g, "t"],
    [/chh/g, "ch"],
    [/sh/g, "s"]
  ];
  for (const [r, v] of variants) {
    processed = processed.replace(r, v);
  }

  // 12. Normalize Long Vowels
  processed = processed
    .replace(/aa/g, "a")
    .replace(/ee/g, "i")
    .replace(/ii/g, "i")
    .replace(/oo/g, "u")
    .replace(/uu/g, "u");

  // 7. Collapse Repeated Letters (Limit long stretches to 2 occurrences)
  processed = processed.replace(/([a-z])\1{2,}/g, "$1$1");

  // 14. Remove Repeated Punctuation
  processed = processed.replace(/[!?.,]{2,}/g, " ");

  // 6. Collapse Multiple Spaces & 20. Final Cleanup
  processed = processed.replace(/\s+/g, " ").trim();

  return processed;
};

// Helper to normalize a single word
const normalizeWord = (word) => {
  if (!word) return "";
  let normalized = word.toLowerCase();

  // Convert Leetspeak mapping
  const leetMap = {
    "0": "o", "1": "i", "!": "i", "|": "i", "3": "e", "4": "a",
    "@": "a", "$": "s", "5": "s", "7": "t", "8": "b", "9": "g", "+": "t"
  };
  normalized = normalized.replace(/[01345789@$!|+]/g, c => leetMap[c] || c);

  // Remove non-alphanumeric/non-unicode
  normalized = normalized.replace(/[^\p{L}\p{N}]/gu, '');

  // Transliteration variants
  const variants = [
    [/kh/g, "k"],
    [/ph/g, "f"],
    [/bh/g, "b"],
    [/dh/g, "d"],
    [/th/g, "t"],
    [/chh/g, "ch"],
    [/sh/g, "s"]
  ];
  for (const [r, v] of variants) {
    normalized = normalized.replace(r, v);
  }

  // Long vowels
  normalized = normalized
    .replace(/aa/g, "a")
    .replace(/ee/g, "i")
    .replace(/ii/g, "i")
    .replace(/oo/g, "u")
    .replace(/uu/g, "u");

  // Collapse repeated characters: e.g. "chutiyaaaaa" -> "chutiya"
  normalized = normalized.replace(/(.)\1+/g, '$1');

  return normalized;
};

// Calculate Damerau-Levenshtein distance between two strings (allowing transposition)
const getLevenshteinDistance = (a, b) => {
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  const d = [];
  for (let i = 0; i <= a.length; i++) {
    d[i] = [];
    d[i][0] = i;
  }
  for (let j = 0; j <= b.length; j++) {
    d[0][j] = j;
  }

  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a.charAt(i - 1) === b.charAt(j - 1) ? 0 : 1;
      d[i][j] = Math.min(
        d[i - 1][j] + 1,       // deletion
        d[i][j - 1] + 1,       // insertion
        d[i - 1][j - 1] + cost // substitution
      );
      if (i > 1 && j > 1 && a.charAt(i - 1) === b.charAt(j - 2) && a.charAt(i - 2) === b.charAt(j - 1)) {
        d[i][j] = Math.min(
          d[i][j],
          d[i - 2][j - 2] + cost // transposition
        );
      }
    }
  }

  return d[a.length][b.length];
};

// Check if two words match fuzzy constraints
const isFuzzyMatch = (word, dictWord) => {
  // Ignore short words of length less than 4
  if (word.length < 4) return false;

  // Filter comparisons of vastly different lengths to keep calculations fast
  if (Math.abs(word.length - dictWord.length) > 1) return false;

  // Specific false-positive whitelist protection using normalized word forms
  const falsePositives = [
    { w: 'helo', d: 'hel' },
    { w: 'helo', d: 'helno' },
    { w: 'want', d: 'wank' },
    { w: 'carer', d: 'cares' },
    { w: 'clas', d: 'as' },
    { w: 'glas', d: 'as' },
    { w: 'pas', d: 'as' },
    { w: 'gras', d: 'as' },
    { w: 'love', d: 'lovey' },
    { w: 'love', d: 'loveu' },
    { w: 'carir', d: 'sarir' },
    { w: 'carer', d: 'sarir' }
  ];

  if (falsePositives.some(item => 
    (word === item.w && dictWord === item.d) || 
    (word === item.d && dictWord === item.w)
  )) {
    return false;
  }

  const distance = getLevenshteinDistance(word, dictWord);

  // Constraints:
  // - Length 4-6: allow max 1 change (covers "fukc" -> "fuck")
  // - Length 7+: allow max 2 changes (covers "bhosarike" -> "bhosdike")
  if (word.length >= 7) {
    return distance <= 2;
  }
  return distance <= 1;
};


// Main normalization of full text
const normalizeText = (text) => {
  const cleaned = applyPipeline(text);

  // Remove non-word characters and spaces entirely
  const condensed = cleaned.replace(/[^\p{L}\p{N}]/gu, '');
  // Collapse repeated characters in the condensed version
  const collapsed = condensed.replace(/(.)\1+/g, '$1');

  return { cleaned, condensed, collapsed };
};

// Main message verification function
const validateMessage = (messageText) => {
  if (!messageText || typeof messageText !== 'string') {
    return { isValid: true };
  }

  const messageLower = messageText.toLowerCase();

  // 1. Check PII patterns (using patterns from pii_patterns.json)
  if (piiPatterns) {
    for (const [type, patterns] of Object.entries(piiPatterns)) {
      for (const patternStr of patterns) {
        const regex = new RegExp(patternStr, 'i');
        if (regex.test(messageText)) {
          return { isValid: false, violationType: `${type} contact/information` };
        }
      }
    }
  }

  // 2. Check phrase matching in original message (threats, harassment, contact requests, scam)
  const categoryPhrases = [
    { list: harassmentPhrases, type: 'harassment / self-harm' },
    { list: contactRequestPhrases, type: 'contact information request' },
    { list: threatPhrases, type: 'threat / abusive language' },
    { list: scamPhrases, type: 'scam / financial request' },
    { list: spamPatterns, type: 'spam / advertising' }
  ];

  for (const item of categoryPhrases) {
    for (const phrase of item.list) {
      if (phrase.length > 2 && messageLower.includes(phrase.toLowerCase())) {
        return { isValid: false, violationType: item.type };
      }
    }
  }

  // 3. De-obfuscation / Normalization check on individual words
  // Split message into words (both by spaces and punctuation)
  const words = messageText.split(/[\s,._\-?!@#%^&()=+\[\]{};:'"\\/|<>\u0964\u0965]+/);
  for (const word of words) {
    if (!word) continue;

    // Check if the word has masking symbols like *
    if (word.includes('*')) {
      const regexStr = '^' + word.toLowerCase().replace(/\*/g, '.') + '$';
      try {
        const regex = new RegExp(regexStr);
        for (const badWord of allProfanityAndAbuse) {
          if (regex.test(badWord.toLowerCase())) {
            return { isValid: false, violationType: 'profanity / abusive language' };
          }
        }
      } catch (e) {}
    }

    const normalizedWord = normalizeWord(word);
    
    // Check if the normalized word matches any of our bad words (exact & fuzzy matching)
    for (const badWord of allProfanityAndAbuse) {
      const normalizedBad = normalizeWord(badWord);
      
      // 1. Exact match check
      if (normalizedWord === normalizedBad || word.toLowerCase() === badWord.toLowerCase()) {
        return { isValid: false, violationType: 'profanity / abusive language' };
      }

      // 2. Fuzzy match check
      if (isFuzzyMatch(normalizedWord, normalizedBad)) {
        return { isValid: false, violationType: 'profanity / abusive language' };
      }
    }
  }

  // 4. Check fully condensed and collapsed text for bypass attempts (e.g. "c h u t i y a", "ch_u_t_i_y_a", "chutiyaaaaa")
  const { condensed, collapsed } = normalizeText(messageText);
  for (const badWord of allProfanityAndAbuse) {
    const normalizedBad = normalizeWord(badWord);
    // If the bad word is directly in the condensed or collapsed string as a full match or substring
    if (normalizedBad.length >= 4) {
      if (condensed.includes(normalizedBad) || collapsed.includes(normalizedBad)) {
        return { isValid: false, violationType: 'profanity / abusive language' };
      }
    } else {
      // For short words, only check exact matches to avoid blocking words like "classy" for "ass"
      if (condensed === normalizedBad || collapsed === normalizedBad) {
        return { isValid: false, violationType: 'profanity / abusive language' };
      }
    }
  }

  return { isValid: true };
};

module.exports = {
  validateMessage,
  normalizeText,
  normalizeWord
};
