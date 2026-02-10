// Multilingual Bible APIs - Português via GitHub thiagobodruk/bible (JSON estático - SEM RATE LIMITS)
// Suporta: Português (NVI, ACF) via cache local

export interface BibleVerse {
  number: number;
  text: string;
}

export interface BibleChapter {
  book: { name: string; abbrev: string };
  chapter: { number: number };
  verses: BibleVerse[];
}

export interface BibleBook {
  abbrev: { pt: string };
  name: string;
  chapters: number;
  testament: string;
}

// Cache local da Bíblia em português e outras linguas
let bibleCache: Record<string, any> = {};

// Helper to fetch with retry and timeout
async function fetchWithTimeout(url: string, timeout = 10000): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  try {
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(id);
    return response;
  } catch (e) {
    clearTimeout(id);
    throw e;
  }
}

// Book name mappings for each language
const BOOK_MAPPINGS: Record<string, Record<string, string>> = {
  en: {
    'gn': 'Genesis', 'ex': 'Exodus', 'lv': 'Leviticus', 'nm': 'Numbers', 'dt': 'Deuteronomy',
    'js': 'Joshua', 'jz': 'Judges', 'rt': 'Ruth', '1sm': '1Samuel', '2sm': '2Samuel',
    '1rs': '1Kings', '2rs': '2Kings', '1cr': '1Chronicles', '2cr': '2Chronicles',
    'ed': 'Ezra', 'ne': 'Nehemiah', 'et': 'Esther', 'job': 'Job', 'sl': 'Psalms',
    'pv': 'Proverbs', 'ec': 'Ecclesiastes', 'ct': 'SongofSolomon', 'is': 'Isaiah',
    'jr': 'Jeremiah', 'lm': 'Lamentations', 'ez': 'Ezekiel', 'dn': 'Daniel',
    'os': 'Hosea', 'jl': 'Joel', 'am': 'Amos', 'ob': 'Obadiah', 'jn': 'Jonah',
    'mq': 'Micah', 'na': 'Nahum', 'hc': 'Habakkuk', 'sf': 'Zephaniah',
    'ag': 'Haggai', 'zc': 'Zechariah', 'ml': 'Malachi',
    'mt': 'Matthew', 'mc': 'Mark', 'lc': 'Luke', 'jo': 'John', 'at': 'Acts',
    'rm': 'Romans', '1co': '1Corinthians', '2co': '2Corinthians', 'gl': 'Galatians',
    'ef': 'Ephesians', 'fp': 'Philippians', 'cl': 'Colossians',
    '1ts': '1Thessalonians', '2ts': '2Thessalonians',
    '1tm': '1Timothy', '2tm': '2Timothy', 'tt': 'Titus', 'fm': 'Philemon',
    'hb': 'Hebrews', 'tg': 'James', '1pe': '1Peter', '2pe': '2Peter',
    '1jo': '1John', '2jo': '2John', '3jo': '3John', 'jd': 'Jude', 'ap': 'Revelation',
  },
  es: {
    'gn': 'genesis', 'ex': 'exodus', 'lv': 'leviticus', 'nm': 'numbers', 'dt': 'deuteronomy',
    'js': 'joshua', 'jz': 'judges', 'rt': 'ruth', '1sm': '1-samuel', '2sm': '2-samuel',
    '1rs': '1-kings', '2rs': '2-kings', '1cr': '1-chronicles', '2cr': '2-chronicles',
    'ed': 'ezra', 'ne': 'nehemiah', 'et': 'esther', 'job': 'job', 'sl': 'psalms',
    'pv': 'proverbs', 'ec': 'ecclesiastes', 'ct': 'song-of-solomon', 'is': 'isaiah',
    'jr': 'jeremiah', 'lm': 'lamentations', 'ez': 'ezekiel', 'dn': 'daniel',
    'os': 'hosea', 'jl': 'joel', 'am': 'amos', 'ob': 'obadiah', 'jn': 'jonah',
    'mq': 'micah', 'na': 'nahum', 'hc': 'habakkuk', 'sf': 'zephaniah',
    'ag': 'haggai', 'zc': 'zechariah', 'ml': 'malachi',
    'mt': 'matthew', 'mc': 'mark', 'lc': 'luke', 'jo': 'john', 'at': 'acts',
    'rm': 'romans', '1co': '1-corinthians', '2co': '2-corinthians', 'gl': 'galatians',
    'ef': 'ephesians', 'fp': 'philippians', 'cl': 'colossians',
    '1ts': '1-thessalonians', '2ts': '2-thessalonians',
    '1tm': '1-timothy', '2tm': '2-timothy', 'tt': 'titus', 'fm': 'philemon',
    'hb': 'hebrews', 'tg': 'james', '1pe': '1-peter', '2pe': '2-peter',
    '1jo': '1-john', '2jo': '2-john', '3jo': '3-john', 'jd': 'jude', 'ap': 'revelation',
  },
};

// Fetch English Bible (wldeh/bible-api via CDN)
export async function fetchEnglishBible(book: string, chapter: number): Promise<BibleChapter> {
  const bookName = BOOK_MAPPINGS.en[book] || book;
  const url = `https://cdn.jsdelivr.net/gh/wldeh/bible-api/bibles/eng-web/books/${bookName}/chapters/${chapter}.json`;
  
  const response = await fetchWithTimeout(url);
  
  if (!response.ok) {
    throw new Error(`English Bible API error: ${response.status}`);
  }
  
  const data = await response.json();
  
  return {
    book: { name: data.name || book, abbrev: book },
    chapter: { number: chapter },
    verses: data.verses.map((v: any) => ({
      number: v.verse,
      text: v.text,
    })),
  };
}

// Fetch Spanish Bible (Spanish Bible API - Reina Valera 1960)
export async function fetchSpanishBible(book: string, chapter: number): Promise<BibleChapter> {
  const bookName = BOOK_MAPPINGS.es[book] || book;
  const url = `https://ajphchgh0i.execute-api.us-west-2.amazonaws.com/dev/api/books/${bookName}/verses?range=${chapter}:1-${chapter}:200`;
  
  const response = await fetchWithTimeout(url);
  
  if (!response.ok) {
    throw new Error(`Spanish Bible API error: ${response.status}`);
  }
  
  const verses = await response.json();
  
  return {
    book: { name: bookName, abbrev: book },
    chapter: { number: chapter },
    verses: verses.map((v: any) => ({
      number: parseInt(v.reference.split(':')[1]) || v.verse || 1,
      text: v.text || v.cleanText,
    })),
  };
}

// Fetch Dutch Bible (wldeh/bible-api - Statenvertaling)
export async function fetchDutchBible(book: string, chapter: number): Promise<BibleChapter> {
  const bookName = BOOK_MAPPINGS.en[book] || book; // Use English mapping as fallback
  const url = `https://cdn.jsdelivr.net/gh/wldeh/bible-api/bibles/nld-sv/books/${bookName}/chapters/${chapter}.json`;
  
  const response = await fetchWithTimeout(url);
  
  if (!response.ok) {
    throw new Error(`Dutch Bible API error: ${response.status}`);
  }
  
  const data = await response.json();
  
  return {
    book: { name: data.name || book, abbrev: book },
    chapter: { number: chapter },
    verses: data.verses.map((v: any) => ({
      number: v.verse,
      text: v.text,
    })),
  };
}

// Fetch Portuguese Bible (GitHub thiagobodruk/bible - JSON estático, SEM RATE LIMITS!)
export async function fetchPortugueseBible(version: string, book: string, chapter: number): Promise<BibleChapter> {
  const versionMap: Record<string, string> = {
    'nvi': 'pt_nvi',
    'acf': 'pt_acf',
    'arc': 'pt_acf',
    'ra': 'pt_nvi',
  };
  
  const githubVersion = versionMap[version] || 'pt_nvi';
  const cacheKey = `full-${githubVersion}`;
  
  try {
    if (!bibleCache[cacheKey]) {
      console.log(`[Bible API] Loading full Portuguese Bible: ${githubVersion}`);
      const url = `https://raw.githubusercontent.com/thiagobodruk/bible/master/json/${githubVersion}.json`;
      const response = await fetchWithTimeout(url, 15000); // 15s for full bible load
      
      if (!response.ok) {
        throw new Error(`Portuguese Bible API error: ${response.status}`);
      }
      
      bibleCache[cacheKey] = await response.json();
    }
    
    const bibleData = bibleCache[cacheKey];
    // Exact mapping for thiagobodruk abbreviations
    const bookData = bibleData.find((b: any) => b.abbrev.toLowerCase() === book.toLowerCase());
    
    if (!bookData || !bookData.chapters || !bookData.chapters[chapter - 1]) {
      throw new Error(`Chapter not found in JSON: ${book} ${chapter}`);
    }
    
    const verses = bookData.chapters[chapter - 1];
    
    return {
      book: { 
        name: bookData.name || book, 
        abbrev: book 
      },
      chapter: { number: chapter },
      verses: Array.isArray(verses) ? verses.map((text: string, index: number) => ({
        number: index + 1,
        text: typeof text === 'string' ? text.trim() : (text as any).text || '',
      })) : [],
    };
  } catch (error) {
    console.warn(`[Portuguese Bible] Error for ${book} ${chapter}:`, error);
    throw error;
  }
}

// Main function - Switch based on language with caching
export async function fetchBibleChapter(
  language: string,
  version: string,
  book: string,
  chapter: number
): Promise<BibleChapter> {
  const cacheKey = `${language}-${version}-${book}-${chapter}`;
  if (bibleCache[cacheKey]) {
    return bibleCache[cacheKey];
  }

  let result: BibleChapter;
  try {
    switch (language) {
      case 'pt':
        result = await fetchPortugueseBible(version, book, chapter);
        break;
      case 'en':
        result = await fetchEnglishBible(book, chapter);
        break;
      case 'es':
        result = await fetchSpanishBible(book, chapter);
        break;
      case 'nl':
        result = await fetchDutchBible(book, chapter);
        break;
      default:
        result = await fetchPortugueseBible(version, book, chapter);
    }

    // Cache only if it has verses
    if (result && result.verses && result.verses.length > 0) {
      bibleCache[cacheKey] = result;
    }
    return result;
  } catch (error) {
    console.error(`[Bible API] Error fetching ${cacheKey}:`, error);
    // Try fallback for Portuguese if main fetch fails
    if (language === 'pt') {
      const { getFallbackChapter } = await import('./bible-chapters-fallback');
      const fallback = getFallbackChapter(version, book, chapter);
      if (fallback) return fallback;
    }
    throw error;
  }
}
