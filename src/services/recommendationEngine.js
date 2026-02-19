// Recommendation Engine - Kullanıcıya aksiyon veren öneri motoru

/**
 * Eksik becerilere göre öneri üret
 */
export function generateRecommendations(cvAnalysis, jobAnalysis, matchResults, atsScore, jobMatchScore) {
    const recommendations = [];

    // 1. Eksik anahtar kelime önerileri
    if (matchResults.missing.length > 0) {
        const missingByCategory = groupByCategory(matchResults.missing);

        for (const [category, skills] of Object.entries(missingByCategory)) {
            const skillNames = skills.map(s => s.name);
            recommendations.push({
                id: `missing_${category}`,
                type: 'keyword',
                priority: 'high',
                icon: '🔑',
                title: `Eksik ${category} Becerileri`,
                description: `Bu ilan için CV'nize eklemeniz gereken ${category.toLowerCase()} becerileri:`,
                items: skillNames,
                action: `Bu kelimeleri CV'nizin "Beceriler" bölümüne ve ilgili deneyim maddelerine ekleyin.`
            });
        }
    }

    // 2. Deneyim maddesi iyileştirme önerileri
    if (matchResults.missing.length > 0) {
        const suggestions = generateExperienceSuggestions(matchResults.missing, jobAnalysis);
        if (suggestions.length > 0) {
            recommendations.push({
                id: 'experience_improvement',
                type: 'content',
                priority: 'high',
                icon: '✏️',
                title: 'Deneyim Maddelerini İyileştirin',
                description: 'İlanın diliyle uyumlu örnek deneyim maddeleri:',
                items: suggestions,
                action: 'Bu örnekleri kendi deneyimlerinize uyarlayarak CV\'nize ekleyin.'
            });
        }
    }

    // 3. ATS format önerileri
    if (atsScore.risks.length > 0) {
        const highRisks = atsScore.risks.filter(r => r.level === 'high');
        if (highRisks.length > 0) {
            recommendations.push({
                id: 'ats_format',
                type: 'format',
                priority: 'high',
                icon: '⚠️',
                title: 'ATS Format Düzeltmeleri',
                description: 'ATS uyumluluğu için acil düzeltilmesi gereken noktalar:',
                items: highRisks.map(r => `${r.title}: ${r.fix}`),
                action: 'Bu düzeltmeleri yaparak ATS skorunuzu önemli ölçüde artırabilirsiniz.'
            });
        }
    }

    // 4. Eşanlamlı eşleşme uyarıları
    if (matchResults.synonymMatched.length > 0) {
        recommendations.push({
            id: 'synonym_warning',
            type: 'keyword',
            priority: 'medium',
            icon: '🔄',
            title: 'Eşanlamlı Kelime Uyarıları',
            description: 'Bu beceriler eşanlamlı formda eşleşti. İlandaki terimi de kullanmayı düşünün:',
            items: matchResults.synonymMatched.map(s =>
                `CV'nizdeki "${s.found}" → İlandaki "${s.required}" olarak da ekleyin`
            ),
            action: 'ATS sistemleri her zaman eşanlamlıları tanımaz. İlandaki kelimeleri birebir kullanmak daha güvenlidir.'
        });
    }

    // 5. Nice-to-have önerileri
    if (matchResults.niceToHave.missing.length > 0) {
        recommendations.push({
            id: 'nice_to_have',
            type: 'keyword',
            priority: 'low',
            icon: '⭐',
            title: 'Bonus Beceriler',
            description: 'Bu beceriler zorunlu değil ama eklerseniz öne çıkarsınız:',
            items: matchResults.niceToHave.missing.map(s => s.name),
            action: 'Bu becerilerden bildiklerinizi CV\'nize ekleyin.'
        });
    }

    // 6. Seniority uyumu önerisi
    if (!matchResults.seniorityMatch.match) {
        recommendations.push({
            id: 'seniority',
            type: 'content',
            priority: 'medium',
            icon: '📊',
            title: 'Deneyim Seviyesi Uyumu',
            description: matchResults.seniorityMatch.note,
            items: [
                'Deneyim maddelerinizde liderlik ve sorumluluk vurgusunu artırın',
                'Proje yönetimi ve mentörlük deneyimlerinizi öne çıkarın',
                'Ölçülebilir başarılarınızı (metrikler, sayılar) ekleyin'
            ],
            action: 'Deneyim maddelerinizi pozisyonun gerektirdiği seviyeye uygun şekilde düzenleyin.'
        });
    }

    // 7. Genel iyileştirme önerileri
    if (cvAnalysis.contentQuality.issues.length > 0) {
        const generalItems = cvAnalysis.contentQuality.issues.map(i => i.message);
        recommendations.push({
            id: 'general',
            type: 'content',
            priority: 'low',
            icon: '💡',
            title: 'Genel İyileştirmeler',
            description: 'CV\'nizin genel kalitesini artırmak için:',
            items: generalItems,
            action: 'Bu önerileri uygulayarak CV\'nizin profesyonelliğini artırın.'
        });
    }

    // 8. Profil özeti önerisi
    if (!cvAnalysis.standardHeaders.hasSummary) {
        recommendations.push({
            id: 'add_summary',
            type: 'content',
            priority: 'medium',
            icon: '📝',
            title: 'Profil Özeti Ekleyin',
            description: 'CV\'nizin başına kısa bir profil özeti ekleyin:',
            items: [
                generateSummaryExample(jobAnalysis, cvAnalysis)
            ],
            action: 'Bu örneği kendi deneyiminize göre uyarlayın ve CV\'nizin en üstüne ekleyin.'
        });
    }

    // Önceliklere göre sırala
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    recommendations.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

    return recommendations;
}

/**
 * Deneyim maddesi önerileri üret
 */
function generateExperienceSuggestions(missingSkills, jobAnalysis) {
    const suggestions = [];
    const role = jobAnalysis.role;
    const skillNames = missingSkills.slice(0, 5).map(s => s.name);

    const templates = [
        `{skill} kullanarak {role} projesinde aktif rol aldım ve başarıyla teslim ettim.`,
        `{skill} teknolojisi ile uygulama geliştirdim ve performans optimizasyonları gerçekleştirdim.`,
        `{skill} kullanarak ekip içinde işbirliği yaparak {role} çözümleri oluşturdum.`,
        `{skill} tabanlı sistemlerin tasarımı ve implementasyonunda sorumluluk aldım.`,
        `{skill} ile ilgili teknik kararlar aldım ve takımın teknik gelişimine katkı sağladım.`
    ];

    for (let i = 0; i < Math.min(skillNames.length, templates.length); i++) {
        suggestions.push(
            templates[i]
                .replace('{skill}', skillNames[i])
                .replace('{role}', role.toLowerCase())
        );
    }

    return suggestions;
}

/**
 * Örnek profil özeti oluştur
 */
function generateSummaryExample(jobAnalysis, cvAnalysis) {
    const role = jobAnalysis.role;
    const topSkills = cvAnalysis.skills.slice(0, 3).map(s => s.name).join(', ');
    const experience = cvAnalysis.dateRanges.length > 0 ? `${cvAnalysis.dateRanges.length}+ yıl deneyimli` : 'Deneyimli';

    return `"${experience} ${role}, ${topSkills || 'yazılım geliştirme'} alanlarında uzmanlaşmış, sonuç odaklı bir profesyonel."`;
}

/**
 * Becerileri kategoriye göre grupla
 */
function groupByCategory(skills) {
    const groups = {};
    for (const skill of skills) {
        const cat = skill.category || 'Other';
        if (!groups[cat]) groups[cat] = [];
        groups[cat].push(skill);
    }
    return groups;
}
