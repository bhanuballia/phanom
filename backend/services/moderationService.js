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
      .filter(line => line.length > 0 && !line.startsWith('#'));
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

// Helper to normalize a single word
const normalizeWord = (word) => {
  let normalized = word.toLowerCase();

  // Apply symbol substitutions
  if (normalizationRules.substitutions) {
    for (const [symbol, replacement] of Object.entries(normalizationRules.substitutions)) {
      // Escape special characters in symbol just in case
      const escapedSymbol = symbol.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
      normalized = normalized.replace(new RegExp(escapedSymbol, 'g'), replacement);
    }
  }

  // Remove non-alphanumeric/non-unicode characters (allow letters and digits)
  normalized = normalized.replace(/[^\p{L}\p{N}]/gu, '');

  // Collapse repeated characters: e.g. "chutiyaaaaa" -> "chutiya"
  normalized = normalized.replace(/(.)\1+/g, '$1');

  return normalized;
};

// Calculate Levenshtein distance between two strings
const getLevenshteinDistance = (a, b) => {
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  const matrix = [];

  // Increment along the first column of each row
  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }

  // Increment each column in the first row
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  // Fill in the rest of the matrix
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          Math.min(
            matrix[i][j - 1] + 1, // insertion
            matrix[i - 1][j] + 1  // deletion
          )
        );
      }
    }
  }

  return matrix[b.length][a.length];
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
    { w: 'love', d: 'loveu' }
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
  // 1. Convert to lowercase
  let cleaned = text.toLowerCase();

  // 2. Remove standard spaces/punctuation to check for spaces-between-letters trick (e.g. "c h u t i y a")
  // First normalize individual characters
  if (normalizationRules.substitutions) {
    for (const [symbol, replacement] of Object.entries(normalizationRules.substitutions)) {
      const escapedSymbol = symbol.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
      cleaned = cleaned.replace(new RegExp(escapedSymbol, 'g'), replacement);
    }
  }

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
