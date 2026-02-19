// CV Parser - Türkçe CV metnini bölümlere ayırma ve bilgi çıkarımı
import { cleanText, turkishLowerCase, turkishToAscii, tokenize, extractDateRanges, detectSeniority, detectLanguageMix } from './turkishNLP.js';
import { getAllSkills, findSynonym, SKILL_CATEGORIES, getSkillCategory } from './skillDatabase.js';

// CV bölüm başlıkları — stored as ASCII for reliable matching
// turkishToAscii is applied to both the header keywords AND the input line
const SECTION_HEADERS = {
    experience: [
        'deneyim', 'is deneyimi', 'is tecrubesi', 'profesyonel deneyim',
        'work experience', 'experience', 'professional experience', 'employment history',
        'calisma gecmisi', 'staj deneyimi', 'staj ve is deneyimi', 'staj is deneyimi',
        'tecrube', 'is gecmisi', 'staj', 'stajlar', 'internship'
    ],
    education: [
        'egitim', 'egitim bilgileri', 'ogrenim', 'akademik',
        'education', 'academic background', 'egitim gecmisi'
    ],
    skills: [
        'beceriler', 'yetenekler', 'teknik beceriler', 'yetkinlikler',
        'skills', 'technical skills', 'competencies', 'teknolojiler',
        'programlama dilleri', 'araclar', 'tools', 'technologies',
        'teknik yetkinlikler', 'yazilim becerileri'
    ],
    projects: [
        'projeler', 'kisisel projeler', 'akademik projeler',
        'projects', 'personal projects', 'portfolio'
    ],
    certificates: [
        'sertifikalar', 'sertifika', 'belgeler',
        'certificates', 'certifications', 'licenses'
    ],
    contact: [
        'iletisim', 'iletisim bilgileri', 'kisisel bilgiler',
        'contact', 'personal information', 'contact information'
    ],
    summary: [
        'ozet', 'profil', 'hakkimda', 'kariyer hedefi', 'on yazi',
        'summary', 'profile', 'about', 'about me', 'objective', 'career objective'
    ],
    languages: [
        'diller', 'yabanci diller', 'dil bilgisi',
        'languages', 'language skills'
    ],
    references: [
        'referanslar', 'references'
    ],
    hobbies: [
        'hobiler', 'ilgi alanlari',
        'hobbies', 'interests'
    ]
};

/**
 * CV metnini bölümlere ayırma
 */
export function parseCVSections(text) {
    const cleaned = cleanText(text);
    const lines = cleaned.split('\n');
    const sections = {};
    let currentSection = 'header';
    let currentContent = [];

    for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) continue;

        const detectedSection = detectSectionHeader(trimmed);

        if (detectedSection) {
            if (currentContent.length > 0) {
                // If section already exists, append content
                if (sections[currentSection]) {
                    sections[currentSection] += '\n' + currentContent.join('\n');
                } else {
                    sections[currentSection] = currentContent.join('\n');
                }
            }
            currentSection = detectedSection;
            // Initialize section immediately so it exists even with empty content
            if (!(currentSection in sections)) {
                sections[currentSection] = '';
            }
            currentContent = [];
        } else {
            currentContent.push(trimmed);
        }
    }

    // Son bölümü ekle
    if (currentContent.length > 0) {
        if (sections[currentSection]) {
            sections[currentSection] += '\n' + currentContent.join('\n');
        } else {
            sections[currentSection] = currentContent.join('\n');
        }
    }

    return sections;
}

/**
 * Bir satırın bölüm başlığı olup olmadığını tespit et
 * Uses turkishToAscii() to normalize BOTH the line and keywords
 * so "Hakkımda" → "hakkimda", "STAJ & İŞ DENEYİMİ" → "staj  is deneyimi"
 */
function detectSectionHeader(line) {
    // Normalize: strip diacritics → ASCII, remove punctuation, collapse spaces
    const normalized = turkishToAscii(line)
        .replace(/[:\-\u2013\u2014_=*#|\u2022\u25cf\u25cb\u25ba\u25b6\u2192&/\\,()[\]{}]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

    // Skip empty or content lines (headers are typically 1-4 words)
    const wordCount = normalized.split(' ').length;
    if (wordCount > 5) return null;

    // Split into individual words for word-boundary matching
    const words = normalized.split(' ');

    // Priority 1: exact match
    for (const [section, headers] of Object.entries(SECTION_HEADERS)) {
        for (const header of headers) {
            if (normalized === header) {
                return section;
            }
        }
    }

    // Priority 2: line starts with a known header (word boundary check)
    // The header words must match the BEGINNING of the normalized line as complete words
    for (const [section, headers] of Object.entries(SECTION_HEADERS)) {
        for (const header of headers) {
            if (header.length < 4) continue;
            const headerWords = header.split(' ');
            // Check if the line starts with all the words from the header
            if (headerWords.length <= words.length) {
                let match = true;
                for (let j = 0; j < headerWords.length; j++) {
                    if (words[j] !== headerWords[j]) {
                        match = false;
                        break;
                    }
                }
                if (match) return section;
            }
        }
    }

    // Priority 3: line contains a multi-word header as complete consecutive words
    // Only for multi-word headers to avoid single-word false positives on content lines
    let bestMatch = null;
    let bestLen = 0;

    for (const [section, headers] of Object.entries(SECTION_HEADERS)) {
        for (const header of headers) {
            // Only check multi-word headers with 8+ chars
            if (!header.includes(' ') || header.length < 8) continue;
            const headerWords = header.split(' ');
            // Check if headerWords appear as consecutive words anywhere in `words`
            for (let i = 0; i <= words.length - headerWords.length; i++) {
                let match = true;
                for (let j = 0; j < headerWords.length; j++) {
                    if (words[i + j] !== headerWords[j]) {
                        match = false;
                        break;
                    }
                }
                if (match && header.length > bestLen) {
                    bestMatch = section;
                    bestLen = header.length;
                    break;
                }
            }
        }
    }

    if (bestMatch) return bestMatch;

    return null;
}

/**
 * CV'den beceri/teknoloji çıkarımı
 */
export function extractSkillsFromCV(text) {
    const allSkills = getAllSkills();
    const normalizedText = turkishLowerCase(text);
    const foundSkills = new Set();

    for (const skill of allSkills) {
        const skillLower = skill.toLowerCase();
        // Tam kelime eşleşmesi (skill'in etrafında kelime sınırı olmalı)
        const regex = new RegExp(`(?:^|[\\s,;:()\\[\\]{}/\\"'\\-\u2013\u2014\u2022\u25cf|])${escapeRegex(skillLower)}(?:$|[\\s,;:()\\[\\]{}/\\"'\\-\u2013\u2014\u2022\u25cf|.])`, 'i');
        if (regex.test(normalizedText)) {
            // Canonical formunu bul
            const syn = findSynonym(skillLower);
            foundSkills.add(syn ? syn.canonical : skillLower);
        }
    }

    return Array.from(foundSkills).map(skill => ({
        name: skill,
        category: getSkillCategory(skill),
    }));
}

/**
 * Regex special karakterlerini escape et
 */
function escapeRegex(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * CV'den tam analiz çıkarımı
 */
export function analyzeCV(text) {
    const sections = parseCVSections(text);
    const skills = extractSkillsFromCV(text);
    const dateRanges = extractDateRanges(text);
    const seniority = detectSeniority(text);
    const languageMix = detectLanguageMix(text);

    // Bölüm başlıklarının standartlığını kontrol et
    const standardHeaders = checkHeaderStandards(sections);

    // İçerik kalitesi analizi
    const contentQuality = analyzeContentQuality(text, sections);

    return {
        sections,
        skills,
        dateRanges,
        seniority,
        languageMix,
        standardHeaders,
        contentQuality,
        rawText: text,
        wordCount: tokenize(text).length,
        lineCount: text.split('\n').filter(l => l.trim()).length,
    };
}

/**
 * Bölüm başlıklarının ATS uyumluluğunu kontrol et
 */
function checkHeaderStandards(sections) {
    const expectedSections = ['experience', 'education', 'skills'];
    const found = [];
    const missing = [];

    for (const section of expectedSections) {
        if (sections[section]) {
            found.push(section);
        } else {
            missing.push(section);
        }
    }

    return {
        found,
        missing,
        score: (found.length / expectedSections.length) * 100,
        hasSummary: !!sections.summary,
        hasProjects: !!sections.projects,
        hasCertificates: !!sections.certificates,
        hasContact: !!sections.contact || !!sections.header,
    };
}

/**
 * İçerik kalitesi analizi
 */
function analyzeContentQuality(text, sections) {
    const issues = [];

    // Çok kısa CV
    const wordCount = tokenize(text).length;
    if (wordCount < 100) {
        issues.push({
            type: 'warning',
            message: 'CV çok kısa görünüyor. Daha fazla detay eklemeyi düşünün.',
            severity: 'high'
        });
    }

    // Çok uzun CV
    if (wordCount > 1500) {
        issues.push({
            type: 'info',
            message: 'CV oldukça uzun. Gereksiz detayları kısaltmayı düşünün.',
            severity: 'low'
        });
    }

    // Deneyim bölümünde eylem fiili kontrolü
    if (sections.experience) {
        const actionVerbs = [
            'geliştirdim', 'geliştirme', 'gelistirdim', 'gelistirme',
            'yönettim', 'yonettim', 'tasarladım', 'tasarladim',
            'oluşturdum', 'olusturdum', 'uyguladım', 'uyguladim',
            'optimize ettim', 'analiz ettim',
            'koordine ettim', 'hayata geçirdim', 'hayata gecirdim',
            'katkıda bulundum', 'katkida bulundum',
            'iyileştirdim', 'iyilestirdim',
            'görev aldım', 'gorev aldim',
            'görev alıyorum', 'gorev aliyorum',
            'çalıştım', 'calistim',
            'katıldım', 'katildim',
            'geliştiriyorum', 'gelistiriyorum',
            'katılarak', 'katilarak',
            'developed', 'managed', 'designed', 'created',
            'implemented', 'optimized', 'led', 'built',
            'improved', 'achieved', 'contributed'
        ];

        const expLower = turkishToAscii(sections.experience);
        const hasActionVerbs = actionVerbs.some(verb => expLower.includes(turkishToAscii(verb)));

        if (!hasActionVerbs) {
            issues.push({
                type: 'warning',
                message: 'Deneyim bölümünde eylem fiilleri kullanın (geliştirdim, yönettim, tasarladım vb.)',
                severity: 'medium'
            });
        }
    }

    // E-posta kontrolü
    const emailRegex = /[\w.+-]+@[\w-]+\.[\w.]+/;
    if (!emailRegex.test(text)) {
        issues.push({
            type: 'warning',
            message: 'CV\'de e-posta adresi bulunamadı.',
            severity: 'medium'
        });
    }

    return {
        wordCount,
        issues,
        hasEmail: emailRegex.test(text),
        hasPhone: /(\+?\d{1,3}[\s.-]?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{2}[\s.-]?\d{2}/.test(text) || /\d{3}\s?\d{7}/.test(text),
    };
}
