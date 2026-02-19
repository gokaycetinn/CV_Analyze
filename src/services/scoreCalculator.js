// Score Calculator - ATS Uyum Skoru ve İlan Eşleşme Skoru hesaplama

/**
 * ATS Uyum Skoru hesaplama (0-100)
 * - Okunabilirlik ve ATS riskleri
 * - Başlıkların standartlığı
 * - Tarih formatı tutarlılığı
 * - Anahtar kelime yerleşimi ve tekrar dengesi
 */
export function calculateATSScore(cvAnalysis) {
    let score = 100;
    const breakdown = [];

    // 1. Bölüm başlıklarının standartlığı (max 25 puan)
    const headerScore = cvAnalysis.standardHeaders.score;
    const headerPoints = Math.round(headerScore * 0.25);
    if (headerPoints < 25) {
        score -= (25 - headerPoints);
        const missingHeaders = cvAnalysis.standardHeaders.missing.map(h => {
            const names = { experience: 'Deneyim', education: 'Eğitim', skills: 'Beceriler' };
            return names[h] || h;
        });
        breakdown.push({
            category: 'Bölüm Başlıkları',
            score: headerPoints,
            maxScore: 25,
            message: missingHeaders.length > 0
                ? `Eksik bölümler: ${missingHeaders.join(', ')}`
                : 'Tüm standart bölümler mevcut',
            severity: missingHeaders.length >= 2 ? 'high' : 'medium'
        });
    } else {
        breakdown.push({
            category: 'Bölüm Başlıkları',
            score: 25,
            maxScore: 25,
            message: 'Tüm standart bölüm başlıkları mevcut',
            severity: 'none'
        });
    }

    // 2. İletişim bilgileri (max 15 puan)
    let contactScore = 15;
    if (!cvAnalysis.contentQuality.hasEmail) {
        contactScore -= 8;
    }
    if (!cvAnalysis.contentQuality.hasPhone) {
        contactScore -= 7;
    }
    score -= (15 - contactScore);
    breakdown.push({
        category: 'İletişim Bilgileri',
        score: contactScore,
        maxScore: 15,
        message: contactScore < 15
            ? `${!cvAnalysis.contentQuality.hasEmail ? 'E-posta' : ''} ${!cvAnalysis.contentQuality.hasPhone ? 'Telefon' : ''} bilgisi eksik`.trim()
            : 'E-posta ve telefon bilgisi mevcut',
        severity: contactScore < 8 ? 'high' : contactScore < 15 ? 'medium' : 'none'
    });

    // 3. İçerik uzunluğu (max 15 puan)
    let lengthScore = 15;
    const wordCount = cvAnalysis.wordCount;
    if (wordCount < 100) {
        lengthScore -= 10;
    } else if (wordCount < 200) {
        lengthScore -= 5;
    } else if (wordCount > 1500) {
        lengthScore -= 3;
    }
    score -= (15 - lengthScore);
    breakdown.push({
        category: 'İçerik Uzunluğu',
        score: lengthScore,
        maxScore: 15,
        message: wordCount < 100
            ? `CV çok kısa (${wordCount} kelime). En az 200 kelime önerilir.`
            : wordCount > 1500
                ? `CV oldukça uzun (${wordCount} kelime). 500-1000 kelime idealdir.`
                : `İçerik uzunluğu uygun (${wordCount} kelime)`,
        severity: wordCount < 100 ? 'high' : wordCount > 1500 ? 'low' : 'none'
    });

    // 4. Tarih formatı tutarlılığı (max 10 puan)
    let dateScore = 10;
    const dateRanges = cvAnalysis.dateRanges;
    if (dateRanges.length === 0 && cvAnalysis.sections.experience) {
        dateScore -= 7;
    }
    score -= (10 - dateScore);
    breakdown.push({
        category: 'Tarih Formatı',
        score: dateScore,
        maxScore: 10,
        message: dateRanges.length > 0
            ? `${dateRanges.length} tarih aralığı tespit edildi`
            : 'Tarih aralığı bulunamadı. Deneyim maddelerine tarih ekleyin.',
        severity: dateScore < 5 ? 'high' : 'none'
    });

    // 5. Beceri çeşitliliği (max 15 puan)
    let skillScore = 15;
    const skillCount = cvAnalysis.skills.length;
    if (skillCount < 3) {
        skillScore -= 10;
    } else if (skillCount < 6) {
        skillScore -= 5;
    }
    score -= (15 - skillScore);
    breakdown.push({
        category: 'Beceri Çeşitliliği',
        score: skillScore,
        maxScore: 15,
        message: skillCount < 3
            ? `Sadece ${skillCount} beceri tespit edildi. Daha fazla beceri ekleyin.`
            : `${skillCount} beceri tespit edildi`,
        severity: skillCount < 3 ? 'high' : skillCount < 6 ? 'medium' : 'none'
    });

    // 6. Dil tutarlılığı (max 10 puan)
    let langScore = 10;
    if (cvAnalysis.languageMix.mixed) {
        langScore -= 4;
    }
    score -= (10 - langScore);
    breakdown.push({
        category: 'Dil Tutarlılığı',
        score: langScore,
        maxScore: 10,
        message: cvAnalysis.languageMix.mixed
            ? 'Türkçe ve İngilizce karışık kullanılmış. Tutarlı bir dil tercih edin.'
            : 'Dil kullanımı tutarlı',
        severity: cvAnalysis.languageMix.mixed ? 'medium' : 'none'
    });

    // 7. Profil/Özet bölümü (max 10 puan)
    let summaryScore = 10;
    if (!cvAnalysis.standardHeaders.hasSummary) {
        summaryScore -= 5;
    }
    score -= (10 - summaryScore);
    breakdown.push({
        category: 'Profil Özeti',
        score: summaryScore,
        maxScore: 10,
        message: cvAnalysis.standardHeaders.hasSummary
            ? 'Profil/Özet bölümü mevcut'
            : 'Profil veya Özet bölümü ekleyin. ATS sistemleri bu bölümü önemser.',
        severity: !cvAnalysis.standardHeaders.hasSummary ? 'medium' : 'none'
    });

    score = Math.max(0, Math.min(100, score));

    return {
        score,
        grade: getGrade(score),
        breakdown,
        risks: generateRisks(cvAnalysis, breakdown)
    };
}

/**
 * İlan Eşleşme Skoru hesaplama (0-100)
 */
export function calculateJobMatchScore(matchResults) {
    let score = 0;
    const breakdown = [];

    // 1. Hard-skill uyumu (40 puan)
    const skillMatchPct = matchResults.stats.matchPercentage;
    const skillPoints = Math.round(skillMatchPct * 0.4);
    score += skillPoints;
    breakdown.push({
        category: 'Teknik Beceri Uyumu',
        score: skillPoints,
        maxScore: 40,
        message: `İstenen ${matchResults.stats.totalRequired} beceriden ${matchResults.stats.totalMatched}'i eşleşti (%${skillMatchPct})`,
        severity: skillMatchPct < 30 ? 'high' : skillMatchPct < 60 ? 'medium' : 'none'
    });

    // 2. Rol uyumu (20 puan)
    const rolePoints = matchResults.roleMatch.match
        ? Math.round(matchResults.roleMatch.strength * 20)
        : 0;
    score += rolePoints;
    breakdown.push({
        category: 'Rol Uyumu',
        score: rolePoints,
        maxScore: 20,
        message: matchResults.roleMatch.match
            ? `${matchResults.roleMatch.jobRole} pozisyonu ile uyumlu`
            : 'Rol uyumu düşük. CV\'nizdeki beceriler farklı bir alanda yoğunlaşmış.',
        severity: rolePoints < 10 ? 'high' : 'none'
    });

    // 3. Seniority uyumu (20 puan)
    const seniorityPoints = matchResults.seniorityMatch.match ? 20 : 5;
    score += seniorityPoints;
    breakdown.push({
        category: 'Deneyim Seviyesi',
        score: seniorityPoints,
        maxScore: 20,
        message: matchResults.seniorityMatch.note,
        severity: seniorityPoints < 20 ? 'medium' : 'none'
    });

    // 4. Nice-to-have uyumu (10 puan)
    const nicePct = matchResults.stats.niceToHavePercentage;
    const nicePoints = Math.round(nicePct * 0.1);
    score += nicePoints;
    if (matchResults.niceToHave.matched.length + matchResults.niceToHave.missing.length > 0) {
        breakdown.push({
            category: 'Tercih Edilen Beceriler',
            score: nicePoints,
            maxScore: 10,
            message: `Tercih edilen becerilerden %${nicePct}'i karşılandı`,
            severity: 'none'
        });
    }

    // 5. Eşanlamlı eşleşme bonusu (10 puan)
    const synPoints = Math.min(10, matchResults.synonymMatched.length * 3);
    score += synPoints;
    if (matchResults.synonymMatched.length > 0) {
        breakdown.push({
            category: 'Eşanlamlı Eşleşmeler',
            score: synPoints,
            maxScore: 10,
            message: `${matchResults.synonymMatched.length} beceri eşanlamlı formda eşleşti`,
            severity: 'none'
        });
    }

    score = Math.max(0, Math.min(100, score));

    return {
        score,
        grade: getGrade(score),
        breakdown
    };
}

/**
 * Not (grade) hesaplama
 */
function getGrade(score) {
    if (score >= 90) return { letter: 'A+', color: '#06d6a0', label: 'Mükemmel' };
    if (score >= 80) return { letter: 'A', color: '#06d6a0', label: 'Çok İyi' };
    if (score >= 70) return { letter: 'B+', color: '#00b4d8', label: 'İyi' };
    if (score >= 60) return { letter: 'B', color: '#00b4d8', label: 'Orta-İyi' };
    if (score >= 50) return { letter: 'C', color: '#ffd166', label: 'Geliştirilmeli' };
    if (score >= 40) return { letter: 'D', color: '#ffd166', label: 'Zayıf' };
    return { letter: 'F', color: '#ef476f', label: 'Yetersiz' };
}

/**
 * ATS risk raporu oluştur
 */
function generateRisks(cvAnalysis, breakdown) {
    const risks = [];

    // Yüksek riskler
    const highRiskItems = breakdown.filter(b => b.severity === 'high');
    for (const item of highRiskItems) {
        risks.push({
            level: 'high',
            title: item.category,
            description: item.message,
            reason: getATSReason(item.category),
            fix: getATSFix(item.category)
        });
    }

    // Orta riskler
    const mediumRiskItems = breakdown.filter(b => b.severity === 'medium');
    for (const item of mediumRiskItems) {
        risks.push({
            level: 'medium',
            title: item.category,
            description: item.message,
            reason: getATSReason(item.category),
            fix: getATSFix(item.category)
        });
    }

    // Düşük riskler
    const lowRiskItems = breakdown.filter(b => b.severity === 'low');
    for (const item of lowRiskItems) {
        risks.push({
            level: 'low',
            title: item.category,
            description: item.message,
            reason: getATSReason(item.category),
            fix: getATSFix(item.category)
        });
    }

    return risks;
}

function getATSReason(category) {
    const reasons = {
        'Bölüm Başlıkları': 'ATS sistemleri standart bölüm başlıklarını tanır. Yaratıcı veya farklı başlıklar sistemin CV\'yi doğru okumasını engeller.',
        'İletişim Bilgileri': 'ATS sistemleri e-posta ve telefon bilgisini otomatik çeker. Eksik iletişim bilgisi, işe alımcının size ulaşamamasına neden olur.',
        'İçerik Uzunluğu': 'Çok kısa CV\'ler yeterli bilgi sunmaz, çok uzun CV\'ler ise ATS tarafından tam okunmayabilir.',
        'Tarih Formatı': 'ATS sistemleri deneyim sürelerini tarih aralıklarından hesaplar. Tutarsız veya eksik tarihler deneyim hesaplamasını bozar.',
        'Beceri Çeşitliliği': 'ATS sistemleri anahtar kelime eşleştirmesi yapar. Yeterli beceri belirtilmemesi düşük eşleşme oranına neden olur.',
        'Dil Tutarlılığı': 'ATS sistemleri genelde tek bir dil üzerinden analiz yapar. Karışık dil kullanımı eşleşme doğruluğunu düşürür.',
        'Profil Özeti': 'Profil özeti, ATS\'nin adayın uygunluğunu hızlıca değerlendirmesine yardımcı olur.'
    };
    return reasons[category] || '';
}

function getATSFix(category) {
    const fixes = {
        'Bölüm Başlıkları': 'Standart başlıklar kullanın: "Deneyim", "Eğitim", "Beceriler", "Projeler", "Sertifikalar"',
        'İletişim Bilgileri': 'CV\'nin başına e-posta adresinizi ve telefon numaranızı ekleyin.',
        'İçerik Uzunluğu': 'CV\'nizi 400-1000 kelime arasında tutun. Her deneyim maddesi için 2-3 cümle yazın.',
        'Tarih Formatı': 'Tüm deneyim maddelerine "Ay YYYY - Ay YYYY" formatında tarih ekleyin.',
        'Beceri Çeşitliliği': 'Ayrı bir "Beceriler" bölümü oluşturup teknik becerilerinizi listeleyin.',
        'Dil Tutarlılığı': 'CV\'nizi tek bir dilde yazın veya teknik terimler dışında dil karıştırmayın.',
        'Profil Özeti': 'CV\'nin başına 2-3 cümle uzunluğunda bir profil özeti ekleyin.'
    };
    return fixes[category] || '';
}
