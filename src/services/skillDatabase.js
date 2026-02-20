// TR-ATS Skill Database
// 200+ IT/Yazılım beceri & teknoloji listesi + Türkçe-İngilizce eşanlamlılar

export const SKILL_CATEGORIES = {
  'Frontend': [
    'react', 'react.js', 'reactjs', 'vue', 'vue.js', 'vuejs', 'angular', 'angularjs',
    'javascript', 'js', 'typescript', 'ts', 'html', 'html5', 'css', 'css3',
    'sass', 'scss', 'less', 'tailwind', 'tailwindcss', 'bootstrap',
    'next.js', 'nextjs', 'nuxt', 'nuxt.js', 'gatsby', 'svelte', 'jquery',
    'webpack', 'vite', 'babel', 'redux', 'mobx', 'zustand', 'recoil',
    'material ui', 'mui', 'ant design', 'chakra ui', 'styled-components',
    'react native', 'react-native', 'reactnative', 'rn', 'flutter', 'dart', 'ionic', 'expo',
    'pwa', 'responsive design', 'duyarlı tasarım', 'web components'
  ],
  'Backend': [
    'node.js', 'nodejs', 'node', 'express', 'express.js', 'expressjs',
    'nestjs', 'nest.js', 'fastify', 'koa',
    'python', 'django', 'flask', 'fastapi',
    'java', 'spring', 'spring boot', 'springboot',
    'c#', 'csharp', '.net', 'dotnet', 'asp.net', 'asp.net core',
    'php', 'laravel', 'symfony', 'codeigniter',
    'ruby', 'ruby on rails', 'rails',
    'go', 'golang', 'gin', 'fiber',
    'rust', 'kotlin', 'scala',
    'graphql', 'rest', 'restful', 'rest api', 'grpc', 'websocket',
    'microservices', 'mikroservis', 'monolith', 'serverless',
    'swagger', 'openapi'
  ],
  'Database': [
    'sql', 'mysql', 'postgresql', 'postgres', 'sqlite',
    'mongodb', 'mongo', 'redis', 'elasticsearch',
    'firebase', 'firestore', 'dynamodb', 'cassandra', 'couchdb',
    'oracle', 'mssql', 'sql server', 'mariadb',
    'prisma', 'sequelize', 'typeorm', 'mongoose', 'knex',
    'nosql', 'veritabanı', 'database'
  ],
  'DevOps': [
    'docker', 'kubernetes', 'k8s', 'jenkins', 'ci/cd', 'cicd',
    'aws', 'amazon web services', 'azure', 'gcp', 'google cloud',
    'terraform', 'ansible', 'puppet', 'chef',
    'nginx', 'apache', 'linux', 'ubuntu', 'centos',
    'git', 'github', 'gitlab', 'bitbucket', 'svn',
    'github actions', 'circleci', 'travis ci',
    'prometheus', 'grafana', 'elk', 'datadog',
    'heroku', 'vercel', 'netlify', 'digitalocean'
  ],
  'Testing': [
    'jest', 'mocha', 'chai', 'cypress', 'selenium', 'playwright',
    'junit', 'pytest', 'unittest', 'rspec',
    'test driven development', 'tdd', 'bdd',
    'unit test', 'birim test', 'integration test', 'entegrasyon testi',
    'e2e', 'end-to-end', 'load testing', 'yük testi',
    'postman', 'insomnia', 'swagger'
  ],
  'Mobile': [
    'ios', 'android', 'swift', 'objective-c', 'kotlin',
    'react native', 'react-native', 'reactnative', 'swiftui', 'swift ui', 'flutter', 'dart', 'xamarin',
    'mobile development', 'mobil geliştirme', 'mobil uygulama'
  ],
  'AI/ML': [
    'machine learning', 'makine öğrenmesi', 'ml',
    'deep learning', 'derin öğrenme', 'dl',
    'artificial intelligence', 'yapay zeka', 'ai', 'yz',
    'tensorflow', 'pytorch', 'keras', 'scikit-learn', 'sklearn',
    'nlp', 'doğal dil işleme', 'natural language processing',
    'computer vision', 'bilgisayarlı görü',
    'opencv', 'huggingface', 'transformers',
    'pandas', 'numpy', 'matplotlib', 'seaborn',
    'data science', 'veri bilimi', 'data analysis', 'veri analizi',
    'big data', 'büyük veri', 'hadoop', 'spark', 'airflow'
  ],
  'Marketing': [
    'marketing', 'pazarlama', 'digital marketing', 'dijital pazarlama',
    'content marketing', 'içerik pazarlaması', 'icerik pazarlamasi',
    'social media', 'sosyal medya', 'social media management', 'sosyal medya yönetimi',
    'brand management', 'marka yönetimi',
    'campaign management', 'kampanya yönetimi',
    'email marketing', 'e-posta pazarlama', 'eposta pazarlama',
    'performance marketing', 'performans pazarlaması',
    'advertising analysis', 'reklam analizi',
    'market research', 'pazar araştırması', 'pazar arastirmasi',
    'seo', 'sem', 'google ads', 'meta ads',
    'a/b test', 'ab test', 'conversion rate', 'dönüşüm oranı', 'donusum orani',
    'customer engagement', 'müşteri etkileşimi', 'musteri etkilesimi',
    'brand positioning', 'marka konumlandırma', 'marka konumlandirma',
    'communication strategy', 'iletişim yönetimi', 'iletisim yonetimi'
  ],
  'Soft Skills': [
    'iletişim', 'communication', 'takım çalışması', 'teamwork',
    'problem çözme', 'problem solving', 'analitik düşünme', 'analytical thinking',
    'liderlik', 'leadership', 'proje yönetimi', 'project management',
    'zaman yönetimi', 'time management', 'agile', 'scrum', 'kanban',
    'jira', 'trello', 'asana', 'confluence', 'notion',
    'sunum', 'presentation', 'müşteri ilişkileri', 'client relations'
  ],
  'Security': [
    'cybersecurity', 'siber güvenlik', 'information security', 'bilgi güvenliği',
    'oauth', 'jwt', 'ssl', 'tls', 'https',
    'encryption', 'şifreleme', 'authentication', 'kimlik doğrulama',
    'authorization', 'yetkilendirme', 'owasp', 'penetration testing',
    'firewall', 'vpn', 'soc', 'siem'
  ],
  'Other': [
    'figma', 'sketch', 'adobe xd', 'photoshop', 'illustrator',
    'ui/ux', 'ui ux', 'ui-ux', 'ux/ui', 'ui', 'ux', 'kullanıcı deneyimi', 'kullanıcı arayüzü',
    'design patterns', 'tasarım desenleri', 'solid', 'oop',
    'functional programming', 'fonksiyonel programlama',
    'api', 'sdk', 'cli',
    'blockchain', 'web3', 'solidity', 'ethereum',
    'iot', 'embedded', 'gömülü sistem',
    'erp', 'sap', 'crm', 'salesforce'
  ]
};

// Türkçe-İngilizce ve kısaltma eşanlamlıları
export const SYNONYMS = {
  'react native': ['rn', 'react-native', 'reactnative'],
  'swiftui': ['swift ui', 'swift-ui', 'swift uı'],
  'react': ['react.js', 'reactjs', 'react-js', 'react native', 'react-native', 'reactnative'],
  'vue': ['vue.js', 'vuejs'],
  'angular': ['angularjs', 'angular.js'],
  'node.js': ['nodejs', 'node'],
  'express': ['express.js', 'expressjs'],
  'next.js': ['nextjs', 'next'],
  'typescript': ['ts'],
  'javascript': ['js'],
  '.net': ['dotnet', 'dot net'],
  'c#': ['csharp', 'c sharp'],
  'asp.net': ['asp.net core', 'aspnet'],
  'postgresql': ['postgres', 'pgsql'],
  'mongodb': ['mongo'],
  'kubernetes': ['k8s'],
  'ci/cd': ['cicd', 'ci cd', 'sürekli entegrasyon'],
  'machine learning': ['makine öğrenmesi', 'makine öğrenimi', 'ml'],
  'deep learning': ['derin öğrenme', 'dl'],
  'artificial intelligence': ['yapay zeka', 'ai', 'yz'],
  'natural language processing': ['doğal dil işleme', 'nlp', 'ddi'],
  'data science': ['veri bilimi'],
  'data analysis': ['veri analizi', 'veri analitiği'],
  'digital marketing': ['dijital pazarlama'],
  'content marketing': ['içerik pazarlaması', 'icerik pazarlamasi'],
  'social media management': ['sosyal medya yönetimi', 'sosyal medya'],
  'brand management': ['marka yönetimi'],
  'email marketing': ['e-posta pazarlama', 'eposta pazarlama'],
  'advertising analysis': ['reklam analizi'],
  'market research': ['pazar araştırması', 'pazar arastirmasi'],
  'campaign management': ['kampanya yönetimi'],
  'conversion rate': ['dönüşüm oranı', 'donusum orani'],
  'customer engagement': ['müşteri etkileşimi', 'musteri etkilesimi'],
  'big data': ['büyük veri'],
  'computer vision': ['bilgisayarlı görü', 'görüntü işleme'],
  'agile': ['çevik', 'çevik metodoloji'],
  'scrum': ['scrum metodolojisi'],
  'microservices': ['mikroservis', 'mikro servis'],
  'unit test': ['birim test', 'birim testi'],
  'integration test': ['entegrasyon testi'],
  'project management': ['proje yönetimi'],
  'teamwork': ['takım çalışması', 'ekip çalışması'],
  'problem solving': ['problem çözme', 'sorun çözme'],
  'communication': ['iletişim', 'iletişim becerisi'],
  'leadership': ['liderlik'],
  'responsive design': ['duyarlı tasarım', 'responsive tasarım'],
  'mobile development': ['mobil geliştirme', 'mobil uygulama geliştirme'],
  'cybersecurity': ['siber güvenlik'],
  'authentication': ['kimlik doğrulama'],
  'authorization': ['yetkilendirme'],
  'database': ['veritabanı', 'veri tabanı'],
  'software development': ['yazılım geliştirme'],
  'web development': ['web geliştirme'],
  'full stack': ['full-stack', 'fullstack', 'tam yığın'],
  'front end': ['frontend', 'front-end', 'ön yüz'],
  'back end': ['backend', 'back-end', 'arka yüz'],
  'devops': ['dev ops', 'dev-ops'],
  'rest api': ['restful api', 'restful apis', 'rest api\'s', 'rest', 'restful', 'rest apı'],
  'ui/ux': ['ui ux', 'ui-ux', 'ux/ui', 'ux-ui', 'ui', 'ux', 'user interface', 'user experience', 'kullanıcı arayüzü', 'kullanıcı deneyimi'],
  'sql': ['structured query language'],
  'nosql': ['no-sql', 'non-sql'],
  'version control': ['versiyon kontrol', 'sürüm kontrol'],
  'object oriented': ['nesne yönelimli', 'oop', 'object-oriented'],
  'design patterns': ['tasarım desenleri', 'tasarım kalıpları'],
  'user experience': ['kullanıcı deneyimi', 'ux'],
  'user interface': ['kullanıcı arayüzü', 'ui'],
};

// Tüm becerileri düz liste olarak al
export function getAllSkills() {
  const skills = new Set();
  Object.values(SKILL_CATEGORIES).forEach(category => {
    category.forEach(skill => skills.add(skill.toLowerCase()));
  });
  return Array.from(skills);
}

// Bir becerinin kategorisini bul
export function getSkillCategory(skill) {
  const normalized = skill.toLowerCase().trim();
  for (const [category, skills] of Object.entries(SKILL_CATEGORIES)) {
    if (skills.some(s => s.toLowerCase() === normalized)) {
      return category;
    }
  }
  return 'Other';
}

// Eşanlamlı karşılığını bul
export function findSynonym(skill) {
  const normalized = skill.toLowerCase().trim();
  
  // Direkt eşleşme
  if (SYNONYMS[normalized]) {
    return { canonical: normalized, variants: SYNONYMS[normalized] };
  }
  
  // Varyant olarak eşleşme
  for (const [canonical, variants] of Object.entries(SYNONYMS)) {
    if (variants.some(v => v.toLowerCase() === normalized)) {
      return { canonical, variants };
    }
  }
  
  return null;
}

// İki becerinin eşanlamlı olup olmadığını kontrol et
export function areSkillsSynonymous(skill1, skill2) {
  const s1 = skill1.toLowerCase().trim();
  const s2 = skill2.toLowerCase().trim();
  
  if (s1 === s2) return true;
  
  const syn1 = findSynonym(s1);
  const syn2 = findSynonym(s2);
  
  if (syn1 && syn2) {
    return syn1.canonical === syn2.canonical;
  }
  
  if (syn1) {
    return syn1.canonical === s2 || syn1.variants.includes(s2);
  }
  
  if (syn2) {
    return syn2.canonical === s1 || syn2.variants.includes(s1);
  }
  
  return false;
}
