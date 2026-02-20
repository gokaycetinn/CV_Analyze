// Turkish NLP Utilities
// Türkçe metin normalizasyonu, kök-varyasyon eşleştirme, temizleme

// Türkçe karakter normalizasyonu
const TR_CHAR_MAP = {
    'İ': 'i', 'I': 'ı',
    'Ğ': 'ğ', 'Ü': 'ü', 'Ş': 'ş', 'Ö': 'ö', 'Ç': 'ç',
};

// ASCII normalization — strips all Turkish diacritics for fuzzy matching
const TR_TO_ASCII = {
    'ğ': 'g', 'Ğ': 'g',
    'ü': 'u', 'Ü': 'u',
    'ş': 's', 'Ş': 's',
    'ö': 'o', 'Ö': 'o',
    'ç': 'c', 'Ç': 'c',
    'ı': 'i', 'İ': 'i',
    'I': 'i',
};

export function turkishToAscii(text) {
    if (!text) return '';
    return text.replace(/[ğĞüÜşŞöÖçÇıİI]/g, ch => TR_TO_ASCII[ch] || ch).toLowerCase();
}

// Yaygın Türkçe fiil ekleri (basit stemming)
const TURKISH_SUFFIXES = [
    'ları', 'leri', 'ların', 'lerin',
    'ıyor', 'iyor', 'uyor', 'üyor',
    'dım', 'dim', 'dum', 'düm',
    'dık', 'dik', 'duk', 'dük',
    'mış', 'miş', 'muş', 'müş',
    'arak', 'erek',
    'ması', 'mesi',
    'mak', 'mek',
    'yor', 'yen', 'yan',
    'dığ', 'diğ', 'duğ', 'düğ',
    'tık', 'tik', 'tuk', 'tük',
    'ını', 'ini', 'unu', 'ünü',
    'nda', 'nde', 'dan', 'den',
    'yla', 'yle',
    'lar', 'ler',
    'lık', 'lik', 'luk', 'lük',
    'cı', 'ci', 'cu', 'cü',
    'ca', 'ce',
    'da', 'de', 'ta', 'te',
    'ın', 'in', 'un', 'ün',
    'ya', 'ye',
    'sı', 'si', 'su', 'sü',
];

// Metni Türkçe-duyarlı lowercase yapma
export function turkishLowerCase(text) {
    if (!text) return '';
    let result = text;
    // Özel İ/I dönüşümü
    result = result.replace(/İ/g, 'i');
    result = result.replace(/I/g, 'ı');
    // Diğer Türkçe büyük harfler
    result = result.replace(/Ğ/g, 'ğ');
    result = result.replace(/Ü/g, 'ü');
    result = result.replace(/Ş/g, 'ş');
    result = result.replace(/Ö/g, 'ö');
    result = result.replace(/Ç/g, 'ç');
    // Standart lowercase
    result = result.toLowerCase();
    return result;
}

// Basit Türkçe stemming (kök bul)
export function turkishStem(word) {
    if (!word || word.length < 3) return word;

    let stem = turkishLowerCase(word);

    // En uzun ekten başla
    const sortedSuffixes = [...TURKISH_SUFFIXES].sort((a, b) => b.length - a.length);

    for (const suffix of sortedSuffixes) {
        if (stem.endsWith(suffix) && stem.length - suffix.length >= 2) {
            stem = stem.slice(0, -suffix.length);
            break; // Sadece bir ek kaldır
        }
    }

    return stem;
}

// İki kelimenin kök-varyasyon eşleşmesi
export function stemMatch(word1, word2) {
    const stem1 = turkishStem(word1);
    const stem2 = turkishStem(word2);
    return stem1 === stem2;
}

// Metin temizleme ve normalizasyon
export function cleanText(text) {
    if (!text) return '';

    let cleaned = text;

    // Tab'ları boşluğa çevir
    cleaned = cleaned.replace(/\t/g, ' ');

    // Özel karakterleri temizle (bullet point, dash vb.)
    cleaned = cleaned.replace(/[•●○◦▪▸►▶→·∙⁃‣⦿⦾]/g, '-');

    // Satır içindeki çoklu boşlukları tek boşluğa çevir (newline KORUNSUN!)
    cleaned = cleaned.replace(/[^\S\n]+/g, ' ');

    // Çoklu yeni satırları tek yeni satıra çevir
    cleaned = cleaned.replace(/\n{3,}/g, '\n\n');

    // Baştaki/sondaki boşlukları temizle
    cleaned = cleaned.trim();

    return cleaned;
}

// Cümlelere ayır
export function splitSentences(text) {
    if (!text) return [];
    return text
        .split(/[.!?\n]/)
        .map(s => s.trim())
        .filter(s => s.length > 5);
}

// Kelimelere ayır (Türkçe-duyarlı)
export function tokenize(text) {
    if (!text) return [];
    return turkishLowerCase(text)
        .split(/[\s,;:()[\]{}"'`\-–—/\\|]+/)
        .filter(w => w.length > 1);
}

// Metin içinde anahtar kelime ara (kök-varyasyon destekli)
export function findKeywordInText(text, keyword) {
    const normalizedText = turkishLowerCase(text);
    const normalizedKeyword = turkishLowerCase(keyword);

    // Tam eşleşme
    if (normalizedText.includes(normalizedKeyword)) {
        return { found: true, type: 'exact' };
    }

    // Kök-varyasyon eşleşmesi
    const textTokens = tokenize(text);
    const keywordTokens = tokenize(keyword);

    if (keywordTokens.length === 1) {
        const keywordStem = turkishStem(keywordTokens[0]);
        for (const token of textTokens) {
            if (turkishStem(token) === keywordStem) {
                return { found: true, type: 'stem' };
            }
        }
    }

    // Çok kelimeli anahtar kelimeler için
    if (keywordTokens.length > 1) {
        const keywordStr = keywordTokens.join(' ');
        if (normalizedText.includes(keywordStr)) {
            return { found: true, type: 'exact' };
        }
    }

    return { found: false, type: null };
}

// Tarih aralığı çıkarımı (2021-2024, Ocak 2021 - Mart 2024 vb.)
export function extractDateRanges(text) {
    const ranges = [];

    // YYYY–YYYY veya YYYY-YYYY
    const yearPattern = /(\d{4})\s*[-–—]\s*(\d{4}|halen|devam|günümüz|present|current)/gi;
    let match;
    while ((match = yearPattern.exec(text)) !== null) {
        ranges.push({
            start: match[1],
            end: match[2].toLowerCase(),
            raw: match[0]
        });
    }

    // Ay YYYY - Ay YYYY
    const monthPattern = /(ocak|şubat|mart|nisan|mayıs|haziran|temmuz|ağustos|eylül|ekim|kasım|aralık|jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\s*\.?\s*(\d{4})\s*[-–—]\s*(ocak|şubat|mart|nisan|mayıs|haziran|temmuz|ağustos|eylül|ekim|kasım|aralık|jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec|halen|devam|günümüz|present|current)\s*\.?\s*(\d{4})?/gi;
    while ((match = monthPattern.exec(text)) !== null) {
        ranges.push({
            start: `${match[1]} ${match[2]}`,
            end: match[4] ? `${match[3]} ${match[4]}` : match[3],
            raw: match[0]
        });
    }

    return ranges;
}

// Seniority seviyesi tespiti
export function detectSeniority(text) {
    const lower = turkishLowerCase(text);

    const seniorityMap = {
        'intern': ['intern', 'stajyer', 'staj'],
        'junior': ['junior', 'jr', 'jr.', 'entry level', 'giriş seviye', 'başlangıç'],
        'mid': ['mid', 'mid-level', 'orta seviye', 'orta düzey', 'mid level'],
        'senior': ['senior', 'sr', 'sr.', 'kıdemli', 'deneyimli'],
        'lead': ['lead', 'takım lideri', 'tech lead', 'team lead', 'lider'],
        'principal': ['principal', 'staff', 'baş mühendis'],
        'manager': ['manager', 'yönetici', 'müdür', 'direktör', 'director']
    };

    for (const [level, keywords] of Object.entries(seniorityMap)) {
        for (const keyword of keywords) {
            if (lower.includes(keyword)) {
                return level;
            }
        }
    }

    return 'unknown';
}

// Dil karışıklığı tespiti  
export function detectLanguageMix(text) {
    const tokens = tokenize(text);
    if (tokens.length === 0) return { ratio: 0, dominant: 'unknown', mixed: false, trCount: 0, enCount: 0 };

    const trMarkers = new Set([
        've', 'ile', 'için', 'icin', 'olarak', 'gibi', 'bir', 'bu', 'şu', 'su', 'çok', 'cok',
        'daha', 'göre', 'gore', 'deneyim', 'yönetimi', 'yonetimi', 'analizi', 'geliştirme', 'gelistirme',
        'uzmanı', 'uzmani', 'seviyesi', 'ana', 'dil', 'özeti', 'ozeti'
    ]);
    const enMarkers = new Set([
        'and', 'with', 'for', 'the', 'of', 'to', 'in', 'on', 'is', 'are',
        'marketing', 'management', 'analysis', 'developer', 'engineer', 'specialist', 'experience'
    ]);

    let trCount = 0;
    let enCount = 0;

    for (const token of tokens) {
        if (trMarkers.has(token) || /[ğüşöçı]/.test(token)) {
            trCount++;
            continue;
        }
        if (enMarkers.has(token)) {
            enCount++;
        }
    }

    const total = trCount + enCount;
    if (total === 0) {
        return { ratio: 0.5, dominant: 'tr', mixed: false, trCount: 0, enCount: 0 };
    }

    const trRatio = trCount / total;
    return {
        ratio: trRatio,
        dominant: trRatio > 0.5 ? 'tr' : 'en',
        mixed: trRatio > 0.25 && trRatio < 0.75,
        trCount,
        enCount
    };
}
