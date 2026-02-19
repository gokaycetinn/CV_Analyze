// Job Parser - İş ilanı metnini analiz etme ve bilgi çıkarımı
import { cleanText, turkishLowerCase, tokenize, detectSeniority } from './turkishNLP.js';
import { getAllSkills, findSynonym, getSkillCategory } from './skillDatabase.js';

// İlan bölüm başlıkları
const JOB_SECTION_HEADERS = {
    responsibilities: [
        'sorumluluklar', 'görev tanımı', 'yapacağınız işler', 'iş tanımı',
        'ne yapacaksınız', 'görevler', 'roller',
        'responsibilities', 'job description', 'what you will do', 'role',
        'neler yapacaksınız', 'beklentilerimiz'
    ],
    requirements: [
        'aranan nitelikler', 'gereksinimler', 'aranan özellikler',
        'aranan yetkinlikler', 'olması gerekenler', 'beklediğimiz nitelikler',
        'requirements', 'qualifications', 'what we are looking for',
        'sizden beklentilerimiz', 'adayda aranan nitelikler'
    ],
    technologies: [
        'teknolojiler', 'kullanılan teknolojiler', 'tech stack',
        'teknoloji yığını', 'araçlar', 'tools', 'technologies'
    ],
    niceToHave: [
        'tercih sebepleri', 'artı olan', 'olması tercih edilen',
        'nice to have', 'preferred', 'bonus', 'plus',
        'avantaj sağlayacak', 'tercih nedenleri', 'ekstra'
    ],
    benefits: [
        'yan haklar', 'faydalar', 'sunduklarımız', 'neler sunuyoruz',
        'benefits', 'perks', 'what we offer', 'avantajlar'
    ],
    about: [
        'şirket hakkında', 'hakkımızda', 'biz kimiz',
        'about us', 'about the company', 'company overview'
    ]
};

/**
 * İlan metnini bölümlere ayırma
 */
export function parseJobSections(text) {
    const cleaned = cleanText(text);
    const lines = cleaned.split('\n');
    const sections = {};
    let currentSection = 'general';
    let currentContent = [];

    for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) continue;

        const detectedSection = detectJobSectionHeader(trimmed);

        if (detectedSection) {
            if (currentContent.length > 0) {
                sections[currentSection] = currentContent.join('\n');
            }
            currentSection = detectedSection;
            currentContent = [];
        } else {
            currentContent.push(trimmed);
        }
    }

    if (currentContent.length > 0) {
        sections[currentSection] = currentContent.join('\n');
    }

    return sections;
}

/**
 * İlan satırının bölüm başlığı olup olmadığını tespit et
 */
function detectJobSectionHeader(line) {
    const normalized = turkishLowerCase(line)
        .replace(/[:\-–—_=*#|•●○►▶→]/g, '')
        .trim();

    for (const [section, headers] of Object.entries(JOB_SECTION_HEADERS)) {
        for (const header of headers) {
            if (normalized === header || normalized.startsWith(header + ' ') || normalized.includes(header)) {
                return section;
            }
        }
    }

    return null;
}

/**
 * İlandan beceri/teknoloji çıkarımı
 */
export function extractSkillsFromJob(text) {
    const allSkills = getAllSkills();
    const normalizedText = turkishLowerCase(text);
    const foundSkills = new Set();

    for (const skill of allSkills) {
        const skillLower = skill.toLowerCase();
        const regex = new RegExp(`(?:^|[\\s,;:()\\[\\]{}/"'\\-–—•●|])${escapeRegex(skillLower)}(?:$|[\\s,;:()\\[\\]{}/"'\\-–—•●|.])`, 'i');
        if (regex.test(normalizedText)) {
            const syn = findSynonym(skillLower);
            foundSkills.add(syn ? syn.canonical : skillLower);
        }
    }

    return Array.from(foundSkills).map(skill => ({
        name: skill,
        category: getSkillCategory(skill),
    }));
}

function escapeRegex(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * İlan tam analizi
 */
export function analyzeJob(text) {
    const sections = parseJobSections(text);
    const allSkills = extractSkillsFromJob(text);
    const seniority = detectSeniority(text);

    // Nice-to-have becerilerini ayır
    let requiredSkills = allSkills;
    let niceToHaveSkills = [];

    if (sections.niceToHave) {
        const niceSkills = extractSkillsFromJob(sections.niceToHave);
        const niceSkillNames = new Set(niceSkills.map(s => s.name));

        niceToHaveSkills = niceSkills;
        requiredSkills = allSkills.filter(s => !niceSkillNames.has(s.name));
    }

    // Rol tespiti
    const role = detectRole(text);

    return {
        sections,
        allSkills,
        requiredSkills,
        niceToHaveSkills,
        seniority,
        role,
        rawText: text,
    };
}

/**
 * Rol/pozisyon tespiti
 */
function detectRole(text) {
    const lower = turkishLowerCase(text);

    const roles = {
        'Frontend Developer': ['frontend', 'front-end', 'front end', 'react developer', 'vue developer', 'angular developer', 'ön yüz'],
        'Backend Developer': ['backend', 'back-end', 'back end', 'server side', 'sunucu tarafı', 'arka yüz'],
        'Full Stack Developer': ['full stack', 'fullstack', 'full-stack', 'tam yığın'],
        'Mobile Developer': ['mobile', 'mobil', 'ios developer', 'android developer', 'react native', 'flutter'],
        'DevOps Engineer': ['devops', 'dev ops', 'site reliability', 'sre', 'altyapı'],
        'Data Scientist': ['data scientist', 'veri bilimci', 'data science', 'veri bilimi'],
        'Data Engineer': ['data engineer', 'veri mühendisi', 'data engineering'],
        'ML Engineer': ['machine learning', 'makine öğrenmesi', 'ml engineer', 'yapay zeka', 'ai engineer'],
        'QA Engineer': ['qa', 'quality assurance', 'test engineer', 'test mühendisi', 'kalite güvence'],
        'Project Manager': ['proje yöneticisi', 'project manager', 'scrum master'],
        'UI/UX Designer': ['ui/ux', 'ui designer', 'ux designer', 'tasarımcı', 'designer'],
        'System Administrator': ['sistem yöneticisi', 'system admin', 'sysadmin', 'sistem mühendisi'],
        'Security Engineer': ['güvenlik', 'security', 'siber güvenlik', 'cybersecurity'],
        'Software Engineer': ['yazılım mühendisi', 'software engineer', 'yazılım geliştirici', 'software developer'],
    };

    for (const [role, keywords] of Object.entries(roles)) {
        for (const keyword of keywords) {
            if (lower.includes(keyword)) {
                return role;
            }
        }
    }

    return 'Software Engineer'; // Default
}
