// Matching Engine - CV ve İlan beceri eşleştirme motoru
import { areSkillsSynonymous, findSynonym } from './skillDatabase.js';
import { turkishLowerCase, findKeywordInText, turkishStem } from './turkishNLP.js';

/**
 * CV ve iş ilanı becerilerini eşleştir
 */
export function matchSkills(cvAnalysis, jobAnalysis) {
    const cvSkills = cvAnalysis.skills;
    const requiredSkills = jobAnalysis.requiredSkills;
    const niceToHaveSkills = jobAnalysis.niceToHaveSkills;

    const matched = [];       // CV'de bulunan ve ilanda istenen
    const missing = [];       // İlanda istenen ama CV'de olmayan
    const extra = [];         // CV'de olan ama ilanda istenmeyen
    const synonymMatched = []; // Eşanlamlı ile eşleşen

    const cvSkillNames = new Set(cvSkills.map(s => s.name.toLowerCase()));
    const reqSkillNames = new Set(requiredSkills.map(s => s.name.toLowerCase()));

    // Required skills eşleştirme
    for (const reqSkill of requiredSkills) {
        const reqName = reqSkill.name.toLowerCase();
        let isMatched = false;
        let matchType = 'none';
        let matchedWith = null;

        // Exact match
        if (cvSkillNames.has(reqName)) {
            isMatched = true;
            matchType = 'exact';
            matchedWith = reqName;
        }

        // Synonym match
        if (!isMatched) {
            for (const cvSkill of cvSkills) {
                if (areSkillsSynonymous(reqName, cvSkill.name)) {
                    isMatched = true;
                    matchType = 'synonym';
                    matchedWith = cvSkill.name;
                    break;
                }
            }
        }

        // Stem match (Türkçe kök eşleşme)
        if (!isMatched) {
            const reqStem = turkishStem(reqName);
            for (const cvSkill of cvSkills) {
                const cvStem = turkishStem(cvSkill.name);
                if (reqStem === cvStem && reqStem.length > 3) {
                    isMatched = true;
                    matchType = 'stem';
                    matchedWith = cvSkill.name;
                    break;
                }
            }
        }

        // Text-based match (CV text içinde ara)
        if (!isMatched) {
            const result = findKeywordInText(cvAnalysis.rawText, reqName);
            if (result.found) {
                isMatched = true;
                matchType = `text_${result.type}`;
                matchedWith = reqName;
            }
        }

        if (isMatched) {
            if (matchType === 'synonym') {
                synonymMatched.push({
                    required: reqName,
                    found: matchedWith,
                    category: reqSkill.category,
                    matchType
                });
            }
            matched.push({
                name: reqName,
                category: reqSkill.category,
                matchType,
                matchedWith
            });
        } else {
            missing.push({
                name: reqName,
                category: reqSkill.category
            });
        }
    }

    // Nice-to-have eşleştirme
    const niceMatched = [];
    const niceMissing = [];

    for (const niceSkill of niceToHaveSkills) {
        const niceName = niceSkill.name.toLowerCase();
        let isMatched = false;

        if (cvSkillNames.has(niceName)) {
            isMatched = true;
        }

        if (!isMatched) {
            for (const cvSkill of cvSkills) {
                if (areSkillsSynonymous(niceName, cvSkill.name)) {
                    isMatched = true;
                    break;
                }
            }
        }

        if (isMatched) {
            niceMatched.push({ name: niceName, category: niceSkill.category });
        } else {
            niceMissing.push({ name: niceName, category: niceSkill.category });
        }
    }

    // CV'de olup ilanda istenmeyen beceriler
    for (const cvSkill of cvSkills) {
        const cvName = cvSkill.name.toLowerCase();
        let isRequired = false;

        if (reqSkillNames.has(cvName)) {
            isRequired = true;
        }

        if (!isRequired) {
            for (const reqSkill of requiredSkills) {
                if (areSkillsSynonymous(cvName, reqSkill.name)) {
                    isRequired = true;
                    break;
                }
            }
        }

        if (!isRequired) {
            extra.push({
                name: cvName,
                category: cvSkill.category
            });
        }
    }

    // Seniority eşleştirme
    const seniorityMatch = matchSeniority(cvAnalysis.seniority, jobAnalysis.seniority);

    // Rol eşleştirme
    const roleMatch = matchRole(cvAnalysis, jobAnalysis);

    return {
        matched,            // Eşleşen zorunlu beceriler
        missing,            // Eksik zorunlu beceriler
        synonymMatched,     // Eşanlamlı ile eşleşenler
        extra,              // CV'de fazla olan beceriler
        niceToHave: {
            matched: niceMatched,
            missing: niceMissing
        },
        seniorityMatch,
        roleMatch,
        stats: {
            totalRequired: requiredSkills.length,
            totalMatched: matched.length,
            totalMissing: missing.length,
            matchPercentage: requiredSkills.length > 0
                ? Math.round((matched.length / requiredSkills.length) * 100)
                : 0,
            niceToHavePercentage: niceToHaveSkills.length > 0
                ? Math.round((niceMatched.length / niceToHaveSkills.length) * 100)
                : 0
        }
    };
}

/**
 * Seniority eşleştirme
 */
function matchSeniority(cvSeniority, jobSeniority) {
    if (cvSeniority === 'unknown' || jobSeniority === 'unknown') {
        return { match: true, cvLevel: cvSeniority, jobLevel: jobSeniority, note: 'Seniority bilgisi yeterli değil' };
    }

    const levels = ['intern', 'junior', 'mid', 'senior', 'lead', 'principal', 'manager'];
    const cvIndex = levels.indexOf(cvSeniority);
    const jobIndex = levels.indexOf(jobSeniority);

    const diff = cvIndex - jobIndex;

    if (diff === 0) {
        return { match: true, cvLevel: cvSeniority, jobLevel: jobSeniority, note: 'Seniority seviyesi uyumlu' };
    } else if (diff > 0) {
        return { match: true, cvLevel: cvSeniority, jobLevel: jobSeniority, note: 'CV daha deneyimli bir profili gösteriyor' };
    } else {
        return { match: false, cvLevel: cvSeniority, jobLevel: jobSeniority, note: 'İlan daha deneyimli bir profil arıyor' };
    }
}

/**
 * Rol uyumu
 */
function matchRole(cvAnalysis, jobAnalysis) {
    // Basit kategori eşleştirme
    const cvCategories = new Set(cvAnalysis.skills.map(s => s.category));
    const jobCategories = new Set(jobAnalysis.allSkills.map(s => s.category));

    const commonCategories = [...cvCategories].filter(c => jobCategories.has(c));

    return {
        jobRole: jobAnalysis.role,
        commonCategories,
        match: commonCategories.length > 0,
        strength: commonCategories.length / Math.max(jobCategories.size, 1)
    };
}
