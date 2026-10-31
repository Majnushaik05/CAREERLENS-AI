import { ResumeAnalysis, JobMatchResult, AssessmentQuestion, AssessmentResult, InterviewQuestionItem, InterviewScore } from '../types';

interface SkillDefinition {
  name: string;
  regex: RegExp;
  category: 'Languages' | 'Frameworks & Libraries' | 'Cloud & DevOps' | 'Databases & Tools' | 'Specialized & Domain';
}

export const SKILL_CATALOG: SkillDefinition[] = [
  // Programming Languages
  { name: 'Python', regex: /\bpython\d*\b/i, category: 'Languages' },
  { name: 'JavaScript', regex: /\bjavascript\b|\bjs\b/i, category: 'Languages' },
  { name: 'TypeScript', regex: /\btypescript\b|\bts\b/i, category: 'Languages' },
  { name: 'Java', regex: /\bjava\b(?!script)/i, category: 'Languages' },
  { name: 'C++', regex: /(?:^|[\s,;:(])c\+\+(?:$|[\s,;:.)])/i, category: 'Languages' },
  { name: 'C#', regex: /(?:^|[\s,;:(])c#(?:$|[\s,;:.)])|\bc-sharp\b/i, category: 'Languages' },
  { name: 'Go', regex: /\b(?:golang|go\s+language)\b|(?:^|[\s,;:(])go(?:$|[\s,;:.)])/i, category: 'Languages' },
  { name: 'Rust', regex: /\brust\b(?!worthy)/i, category: 'Languages' },
  { name: 'PHP', regex: /\bphp\b/i, category: 'Languages' },
  { name: 'Ruby', regex: /\bruby\b/i, category: 'Languages' },
  { name: 'Kotlin', regex: /\bkotlin\b/i, category: 'Languages' },
  { name: 'Swift', regex: /\bswift\b/i, category: 'Languages' },
  { name: 'SQL', regex: /\bsql\b/i, category: 'Languages' },
  { name: 'HTML5/CSS3', regex: /\bhtml5?\b|\bcss3?\b/i, category: 'Languages' },
  { name: 'Bash/Shell', regex: /\bbash\b|\bshell\s+script/i, category: 'Languages' },

  // Frameworks & Libraries
  { name: 'React', regex: /\breact(?:\.js)?\b(?!ion)/i, category: 'Frameworks & Libraries' },
  { name: 'Next.js', regex: /\bnext(?:\.js)?\b/i, category: 'Frameworks & Libraries' },
  { name: 'Node.js', regex: /\bnode(?:\.js)?\b/i, category: 'Frameworks & Libraries' },
  { name: 'Express', regex: /\bexpress(?:\.js)?\b/i, category: 'Frameworks & Libraries' },
  { name: 'FastAPI', regex: /\bfastapi\b/i, category: 'Frameworks & Libraries' },
  { name: 'Django', regex: /\bdjango\b/i, category: 'Frameworks & Libraries' },
  { name: 'Flask', regex: /\bflask\b/i, category: 'Frameworks & Libraries' },
  { name: 'Vue.js', regex: /\bvue(?:\.js)?\b/i, category: 'Frameworks & Libraries' },
  { name: 'Angular', regex: /\bangular\b/i, category: 'Frameworks & Libraries' },
  { name: 'Spring Boot', regex: /\bspring\s*boot\b|\bspring\s*framework\b/i, category: 'Frameworks & Libraries' },
  { name: 'PyTorch', regex: /\bpytorch\b/i, category: 'Frameworks & Libraries' },
  { name: 'TensorFlow', regex: /\btensorflow\b|\btf\b/i, category: 'Frameworks & Libraries' },
  { name: 'Scikit-Learn', regex: /\bscikit[\s_-]?learn\b|\bsklearn\b/i, category: 'Frameworks & Libraries' },
  { name: 'Pandas', regex: /\bpandas\b/i, category: 'Frameworks & Libraries' },
  { name: 'NumPy', regex: /\bnumpy\b/i, category: 'Frameworks & Libraries' },
  { name: 'Tailwind CSS', regex: /\btailwind(?:\s*css)?\b/i, category: 'Frameworks & Libraries' },

  // Cloud & DevOps
  { name: 'AWS', regex: /\baws\b|\bamazon\s+web\s+services\b/i, category: 'Cloud & DevOps' },
  { name: 'Azure', regex: /\bazure\b/i, category: 'Cloud & DevOps' },
  { name: 'Google Cloud (GCP)', regex: /\bgcp\b|\bgoogle\s+cloud\b/i, category: 'Cloud & DevOps' },
  { name: 'Docker', regex: /\bdocker\b/i, category: 'Cloud & DevOps' },
  { name: 'Kubernetes', regex: /\bkubernetes\b|\bk8s\b/i, category: 'Cloud & DevOps' },
  { name: 'CI/CD', regex: /\bci[\s/_-]?cd\b|\bcontinuous\s+integration\b/i, category: 'Cloud & DevOps' },
  { name: 'Terraform', regex: /\bterraform\b/i, category: 'Cloud & DevOps' },
  { name: 'Linux', regex: /\blinux\b|\bubuntu\b|\bdebian\b/i, category: 'Cloud & DevOps' },
  { name: 'Git', regex: /\bgit\b(?!hub|lab)/i, category: 'Cloud & DevOps' },

  // Databases & Tools
  { name: 'PostgreSQL', regex: /\bpostgres(?:ql)?\b/i, category: 'Databases & Tools' },
  { name: 'MySQL', regex: /\bmysql\b/i, category: 'Databases & Tools' },
  { name: 'MongoDB', regex: /\bmongodb\b|\bmongo\b/i, category: 'Databases & Tools' },
  { name: 'Redis', regex: /\bredis\b/i, category: 'Databases & Tools' },
  { name: 'Kafka', regex: /\bkafka\b/i, category: 'Databases & Tools' },
  { name: 'GraphQL', regex: /\bgraphql\b/i, category: 'Databases & Tools' },
  { name: 'REST API', regex: /\brest(?:ful)?\s*(?:api|service|endpoint)s?\b/i, category: 'Databases & Tools' },
  { name: 'Power BI', regex: /\bpower\s*bi\b/i, category: 'Databases & Tools' },
  { name: 'Tableau', regex: /\btableau\b/i, category: 'Databases & Tools' },
  { name: 'Excel', regex: /\bexcel\b|\badvanced\s+excel\b/i, category: 'Databases & Tools' },

  // Specialized & Domain
  { name: 'Machine Learning', regex: /\bmachine\s+learning\b|\bml\b/i, category: 'Specialized & Domain' },
  { name: 'Deep Learning', regex: /\bdeep\s+learning\b/i, category: 'Specialized & Domain' },
  { name: 'NLP', regex: /\bnlp\b|\bnatural\s+language\s+processing\b/i, category: 'Specialized & Domain' },
  { name: 'Computer Vision', regex: /\bcomputer\s+vision\b|\bopencv\b/i, category: 'Specialized & Domain' },
  { name: 'System Design', regex: /\bsystem\s+design\b|\bsoftware\s+architecture\b/i, category: 'Specialized & Domain' },
  { name: 'Microservices', regex: /\bmicroservices?\b/i, category: 'Specialized & Domain' },
  { name: 'Unit Testing', regex: /\bunit\s+test(?:ing)?\b|\bjest\b|\bpytest\b|\bjunit\b|\bselenium\b/i, category: 'Specialized & Domain' },
  { name: 'Cybersecurity', regex: /\bcybersecurity\b|\binformation\s+security\b|\bpenetration\s+testing\b/i, category: 'Specialized & Domain' },
  { name: 'Agile/Scrum', regex: /\bagile\b|\bscrum\b|\bkanban\b/i, category: 'Specialized & Domain' },
];

export const SKILLS: string[] = SKILL_CATALOG.map(s => s.name.toLowerCase());

export const ROLE_SKILL_HINTS: Record<string, string[]> = {
  ai: ['Python', 'Machine Learning', 'Deep Learning', 'PyTorch', 'TensorFlow', 'SQL'],
  'machine learning': ['Python', 'Machine Learning', 'Scikit-Learn', 'Pandas', 'NumPy', 'PyTorch'],
  'data scientist': ['Python', 'SQL', 'Pandas', 'NumPy', 'Machine Learning', 'Power BI'],
  'data analyst': ['SQL', 'Excel', 'Power BI', 'Tableau', 'Python'],
  software: ['Python', 'Java', 'TypeScript', 'JavaScript', 'Git', 'SQL', 'REST API', 'Unit Testing'],
  developer: ['TypeScript', 'React', 'Node.js', 'Git', 'SQL', 'REST API'],
  devops: ['Linux', 'Docker', 'Kubernetes', 'AWS', 'Git', 'CI/CD', 'Terraform'],
  cloud: ['AWS', 'Azure', 'Google Cloud (GCP)', 'Docker', 'Kubernetes', 'Linux'],
  cyber: ['Cybersecurity', 'Linux', 'Python', 'Bash/Shell'],
  qa: ['Unit Testing', 'Python', 'JavaScript', 'Git', 'CI/CD'],
  product: ['System Design', 'Agile/Scrum', 'REST API', 'SQL'],
};

export const RISK_PATTERNS: Record<string, string> = {
  'wire transfer': 'Requests for wire transfers or direct money movement.',
  'registration fee': 'Demands upfront registration or processing fees.',
  'processing fee': 'Demands upfront application or orientation fees.',
  'telegram': 'Recruitment conducted solely on Telegram messaging channels.',
  'whatsapp': 'Unverified WhatsApp messaging used for official hiring.',
  'crypto': 'Cryptocurrency or Bitcoin payment solicitations.',
  'gift card': 'Gift-card payment requests.',
  'no interview': 'Instant hiring without technical screening or interview rounds.',
  'pay to apply': 'Payment required to submit an application.',
  'urgent payment': 'High-pressure immediate payment deadlines.',
  'security deposit': 'Upfront security deposits demanded for company laptop or equipment.',
};

export function getSkillSet(text: string): string[] {
  if (!text) return [];
  const clean = text.replace(/[\r\n\t]+/g, ' ');
  const detected = new Set<string>();

  for (const item of SKILL_CATALOG) {
    if (item.regex.test(clean)) {
      detected.add(item.name);
    }
  }

  return Array.from(detected).sort();
}

export const extractResumeSkills = getSkillSet;

export function getRoleHints(role: string): string[] {
  const roleLower = (role || '').toLowerCase();
  const result: string[] = [];
  for (const [key, values] of Object.entries(ROLE_SKILL_HINTS)) {
    if (roleLower.includes(key)) {
      result.push(...values);
    }
  }
  return Array.from(new Set(result));
}

export function extractEmail(text: string): string {
  const re = /[A-Za-z0-9.!#$%&'*+/=?^_`{|}~-]+@[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)+/;
  const match = (text || '').match(re);
  return match ? match[0].toLowerCase() : '';
}

export function extractPhone(text: string): string {
  const re = /(?:\+?\d[\d .()\-]{8,}\d)/;
  const match = (text || '').match(re);
  return match ? match[0].trim() : '';
}

export function extractName(text: string, filename = 'Candidate'): string {
  const lines = (text || '').split('\n').map(l => l.trim()).filter(Boolean);
  for (const line of lines.slice(0, 12)) {
    if (line.includes('@') || /(?:\+?\d[\d .()\-]{8,}\d)/.test(line)) continue;
    if (line.length > 70) continue;
    const lower = line.toLowerCase();
    if (['resume', 'curriculum vitae', 'objective', 'summary', 'skills'].some(t => lower.includes(t))) continue;
    const words = line.split(/\s+/);
    if (words.length >= 2 && words.length <= 5 && words.every(w => /^[A-Za-z.'-]+$/.test(w))) {
      return words.map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
    }
  }
  const stem = (filename || 'Candidate').replace(/\.[^/.]+$/, '').replace(/[_-]+/g, ' ').trim();
  return stem ? stem.charAt(0).toUpperCase() + stem.slice(1) : 'Candidate';
}

export function analyzeResumeClientSide(text: string, filename = 'resume.txt', targetRole = ''): ResumeAnalysis {
  const cleanText = String(text || '')
    .replace(/\r\n?/g, '\n')
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F]/g, ' ')
    .replace(/[ \t]+/g, ' ')
    .trim();

  const lower = cleanText.toLowerCase();
  const words = cleanText.match(/\b[\w+#.-]+\b/g) || [];
  const skills = Array.from(new Set(getSkillSet(cleanText))).sort();

  const sectionNames: Record<string, string[]> = {
    summary: ['summary', 'professional summary', 'profile', 'objective', 'about me'],
    experience: ['experience', 'work experience', 'professional experience', 'employment', 'work history'],
    education: ['education', 'academic background', 'academics', 'qualifications'],
    projects: ['projects', 'personal projects', 'academic projects', 'key projects'],
    skills: ['skills', 'technical skills', 'core skills', 'technologies'],
    certifications: ['certifications', 'certificates', 'licenses'],
    achievements: ['achievements', 'accomplishments', 'awards', 'honors'],
  };

  const lines = cleanText.split('\n').map(line => line.trim().toLowerCase()).filter(Boolean);
  const foundSections = new Set<string>();
  for (const [section, variants] of Object.entries(sectionNames)) {
    if (lines.some(line => variants.some(v => line === v || line.startsWith(v + ':') || line.startsWith(v + ' -')))) {
      foundSections.add(section);
    }
  }

  const quantifiedMatches = cleanText.match(/\b\d+(?:\.\d+)?\s?(?:%|percent|x|k|m|million|billion|users?|customers?|clients?|projects?|hours?|days?|weeks?|months?|years?|₹|rs\.?|\$)\b/gi) || [];
  const actionVerbsMatches = lower.match(/\b(achieved|analyzed|automated|built|created|delivered|deployed|designed|developed|improved|implemented|increased|launched|led|managed|migrated|optimized|reduced|resolved|secured|streamlined|tested|trained)\b/g) || [];
  const bulletLines = lines.filter(line => /^[•▪●*-]\s+/.test(line));
  const email = extractEmail(cleanText);
  const phone = extractPhone(cleanText);

  // Scores measure observable resume evidence, not candidate ability or employability.
  const wordCount = words.length;
  const contentScore = Math.min(100,
    (Math.min(wordCount, 500) / 500) * 45 +
    (Math.min(bulletLines.length, 12) / 12) * 25 +
    (Math.min(actionVerbsMatches.length, 10) / 10) * 30
  );
  const sectionScore = (foundSections.size / Object.keys(sectionNames).length) * 100;
  const skillScore = Math.min(100, (skills.length / 10) * 100);
  const achievementScore = Math.min(100,
    (Math.min(quantifiedMatches.length, 5) / 5) * 65 +
    (Math.min(actionVerbsMatches.length, 7) / 7) * 35
  );
  const contactScore = (email ? 50 : 0) + (phone ? 50 : 0);

  const hints = getRoleHints(targetRole);
  const matchedRoleSkills = hints.filter(skill => new RegExp(`\\b${skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i').test(cleanText));
  const roleMatch = hints.length ? (matchedRoleSkills.length / hints.length) * 100 : null;

  const weightedScore =
    contentScore * 0.20 +
    sectionScore * 0.20 +
    skillScore * 0.15 +
    achievementScore * 0.20 +
    contactScore * 0.10 +
    (roleMatch !== null ? roleMatch * 0.15 : 0);

  const totalScore = Math.round(Math.max(0, Math.min(100, weightedScore)));
  const readiness = totalScore; // Same evidence-based score; no artificial score inflation.

  const missingSections = Object.keys(sectionNames)
    .filter(section => !foundSections.has(section))
    .map(section => section.charAt(0).toUpperCase() + section.slice(1));
  const missingSkills = hints.filter(skill => !matchedRoleSkills.includes(skill)).slice(0, 8);

  const recommendations: string[] = [];
  if (!email) recommendations.push('Add a professional email address in the contact section.');
  if (!phone) recommendations.push('Add a reachable phone number in the contact section.');
  if (!foundSections.has('experience')) recommendations.push('Add an Experience section, including internships, freelance work, or relevant practical work.');
  if (!foundSections.has('projects')) recommendations.push('Add relevant projects with your role, technologies used, and verifiable outcomes.');
  if (!foundSections.has('education')) recommendations.push('Add your education, institution, qualification, and completion date.');
  if (quantifiedMatches.length < 2) recommendations.push('Support impact claims with genuine numbers, such as time saved, scale, volume, or percentage change. Do not invent metrics.');
  if (bulletLines.length < 3) recommendations.push('Use concise bullet points so responsibilities and achievements are easy for ATS software and recruiters to parse.');
  if (hints.length && missingSkills.length) recommendations.push(`For ${targetRole}, consider adding relevant experience with: ${missingSkills.slice(0, 5).join(', ')}. Include only skills you can demonstrate.`);
  if (!recommendations.length) recommendations.push('No major gaps were detected by this rules-based scan. Compare the resume against the exact job description before applying.');

  const strengths: string[] = [];
  if (email && phone) strengths.push('Both email and phone contact details were detected.');
  if (foundSections.size >= 5) strengths.push(`${foundSections.size} standard resume sections were detected.`);
  if (skills.length) strengths.push(`${skills.length} skills from the application's keyword catalogue were detected.`);
  if (quantifiedMatches.length) strengths.push(`${quantifiedMatches.length} numeric impact or scale indicators were detected.`);
  if (bulletLines.length) strengths.push(`${bulletLines.length} bullet-style lines were detected.`);
  if (!strengths.length) strengths.push('The document contains text that can be evaluated; add standard sections and contact details to improve parseability.');

  return {
    name: extractName(cleanText, filename),
    email,
    phone,
    experience: foundSections.has('experience') ? 'Experience section detected' : 'No clearly labelled experience section detected',
    resume_score: totalScore,
    readiness,
    market_match: roleMatch !== null ? Math.round(roleMatch) : null,
    skills,
    missing_skills: missingSkills,
    strengths,
    recommendations,
    score_breakdown: {
      content_quality: Math.round(contentScore),
      section_coverage: Math.round(sectionScore),
      skills: Math.round(skillScore),
      achievement_evidence: Math.round(achievementScore),
      contact_completeness: Math.round(contactScore),
      target_role_alignment: roleMatch !== null ? Math.round(roleMatch) : null,
    },
    extracted_text: cleanText,
    target_role: targetRole,
  };
}

export function matchJobClientSide(resumeText: string, jobDescription: string): JobMatchResult {
  const rText = (resumeText || '').trim();
  const jText = (jobDescription || '').trim();
  if (!rText || !jText) {
    throw new Error('Both resume and job description are required.');
  }

  const rSkills = new Set(getSkillSet(rText));
  const jSkills = new Set(getSkillSet(jText));

  const matched = Array.from(rSkills).filter(s => jSkills.has(s)).sort();
  const missing = Array.from(jSkills).filter(s => !rSkills.has(s)).sort();

  const rWords = new Set(rText.toLowerCase().match(/\b[a-z]{3,}\b/g) || []);
  const jWords = Array.from(new Set(jText.toLowerCase().match(/\b[a-z]{3,}\b/g) || []));
  const commonWords = jWords.filter(w => rWords.has(w));
  const lexicalSimilarity = jWords.length > 0 ? (commonWords.length / jWords.length) * 100 : 0;

  const skillScore = jSkills.size > 0 ? (matched.length / jSkills.size) * 100 : lexicalSimilarity;
  const overall = jSkills.size > 0
    ? Math.round(Math.max(5, Math.min(99, lexicalSimilarity * 0.45 + skillScore * 0.55)))
    : Math.round(Math.max(5, Math.min(99, lexicalSimilarity)));

  return {
    overall,
    matched,
    missing,
    recommended_skills: missing.slice(0, 10),
    semantic_similarity: Math.round(lexicalSimilarity * 10) / 10,
    summary: `Matched ${matched.length} explicit skills and identified ${missing.length} skill gap(s).`,
    experience_alignment: overall >= 75 ? 'Strong Alignment' : overall >= 50 ? 'Moderate Alignment' : 'Needs Improvement',
  };
}

// Question bank
export function getAssessmentBank(role: string): AssessmentQuestion[] {
  const roleL = (role || '').toLowerCase();
  if (['software', 'developer', 'programmer', 'engineer', 'devops', 'cloud'].some(k => roleL.includes(k))) {
    return [
      { id: 1, question: 'Which practice improves software reliability before release?', options: ['Automated tests and code reviews', 'Skipping validation', 'Hard-coding secrets', 'Ignoring error logs'], answer: 'Automated tests and code reviews', section: 'Quality & Reliability' },
      { id: 2, question: 'What does version control primarily provide?', options: ['A history of code changes and collaboration', 'Automatic salary calculation', 'Network encryption by itself', 'Hardware monitoring'], answer: 'A history of code changes and collaboration', section: 'Tools & Workflow' },
      { id: 3, question: 'Which approach is safest for managing production application secrets?', options: ['Secret management / environment variable injection', 'Hard-coding them in source control', 'Embedding them in public client HTML', 'Sharing them in chat channels'], answer: 'Secret management / environment variable injection', section: 'Security' },
      { id: 4, question: 'Which HTTP status code typically indicates successful resource creation?', options: ['201 Created', '200 OK', '404 Not Found', '500 Server Error'], answer: '201 Created', section: 'Web Architecture' },
      { id: 5, question: 'Which data structure offers average O(1) time complexity for key lookups?', options: ['Hash Table / Map', 'Linked List', 'Stack', 'Unsorted Array'], answer: 'Hash Table / Map', section: 'Computer Science' },
      { id: 6, question: 'Why are automated unit tests valuable in continuous integration?', options: ['They prevent regressions and verify discrete logic early', 'They eliminate the need for any other documentation', 'They ensure 100% bug-free software forever', 'They slow down deployments intentionally'], answer: 'They prevent regressions and verify discrete logic early', section: 'Testing' },
      { id: 7, question: 'What is the purpose of database indexing?', options: ['To significantly speed up data query retrieval', 'To compress text size only', 'To prevent any unauthorized logins', 'To automatically backup the database'], answer: 'To significantly speed up data query retrieval', section: 'Databases' },
      { id: 8, question: 'In RESTful APIs, which HTTP verb is generally idempotent for updating entire resources?', options: ['PUT', 'POST', 'PATCH', 'CONNECT'], answer: 'PUT', section: 'API Design' },
    ];
  }
  if (['data', 'analytics', 'scientist', 'bi'].some(k => roleL.includes(k))) {
    return [
      { id: 1, question: 'What should you do first when an analysis produces an unexpected outlier?', options: ['Validate data pipeline quality, provenance, and assumptions', 'Delete the outliers immediately without note', 'Publish the findings without checking', 'Alter chart dimensions to hide it'], answer: 'Validate data pipeline quality, provenance, and assumptions', section: 'Data Integrity' },
      { id: 2, question: 'What does precision measure in classification models?', options: ['Correct positives among all predicted positives', 'Correct positives among all actual positives', 'Overall accuracy across all classes', 'Only false negative rates'], answer: 'Correct positives among all predicted positives', section: 'Evaluation Metrics' },
      { id: 3, question: 'Why is cross-validation widely used during model training?', options: ['To assess generalization performance and reduce overfitting', 'To encrypt dataset rows', 'To format numbers into currency', 'To replace data cleaning'], answer: 'To assess generalization performance and reduce overfitting', section: 'Machine Learning' },
      { id: 4, question: 'Which SQL clause is used to filter aggregated group values?', options: ['HAVING', 'WHERE', 'GROUP BY', 'ORDER BY'], answer: 'HAVING', section: 'SQL & Querying' },
      { id: 5, question: 'What is the primary danger of multicollinearity in regression?', options: ['Unreliable and unstable coefficient estimates', 'Instant database crashing', 'Underfitting on trivial variables', 'Loss of memory on the client'], answer: 'Unreliable and unstable coefficient estimates', section: 'Statistics' },
    ];
  }
  return [
    { id: 1, question: `What is most essential when performing the ${role} role?`, options: ['Delivering role-relevant outcomes with quality, accuracy, and accountability', 'Avoiding cross-functional feedback', 'Ignoring client guidelines', 'Skipping validation steps'], answer: 'Delivering role-relevant outcomes with quality, accuracy, and accountability', section: 'Core Competency' },
    { id: 2, question: 'What is the most effective way to communicate complex project progress?', options: ['Structured updates detailing deliverables, metrics, and risks', 'Unscheduled long verbal calls without notes', 'Only communicating when a critical crisis happens', 'Sending raw unorganized logs'], answer: 'Structured updates detailing deliverables, metrics, and risks', section: 'Communication' },
    { id: 3, question: 'How should you prioritize competing tasks with tight deadlines?', options: ['Assess business impact, urgency, dependencies, and clarify expectations', 'Work randomly on whichever was received last', 'Postpone all difficult tasks until next week', 'Promise completion of everything without review'], answer: 'Assess business impact, urgency, dependencies, and clarify expectations', section: 'Execution' },
    { id: 4, question: 'What is the recommended approach to receiving critical stakeholder feedback?', options: ['Listen actively, acknowledge points, and propose an action-oriented improvement plan', 'Become defensive and blame tools', 'Ignore the feedback completely', 'Withdraw from communication'], answer: 'Listen actively, acknowledge points, and propose an action-oriented improvement plan', section: 'Professionalism' },
  ];
}

export function generateAssessmentClientSide(role: string, questionCount = 10): { role: string; question_count: number; questions: AssessmentQuestion[] } {
  const bank = getAssessmentBank(role);
  const count = Math.max(1, Math.min(100, questionCount));
  const questions: AssessmentQuestion[] = [];

  for (let i = 0; i < count; i++) {
    const base = bank[i % bank.length];
    const opts = [...base.options].sort(() => Math.random() - 0.5);
    const cycle = Math.floor(i / bank.length);
    const prefix = cycle > 0 ? `[Scenario Context ${cycle + 1}] ` : '';
    questions.push({
      id: i + 1,
      question: `${prefix}${base.question}`,
      options: opts,
      answer: base.answer,
      section: base.section || 'Technical Competency',
    });
  }

  return { role, question_count: count, questions };
}

export function scoreAssessmentClientSide(questions: AssessmentQuestion[], answers: Record<string | number, string>): AssessmentResult {
  let correct = 0;
  let wrong = 0;
  let unanswered = 0;
  const sectionStats: Record<string, { total: number; correct: number; percentage: number }> = {};

  for (const q of questions) {
    const sec = q.section || 'General';
    if (!sectionStats[sec]) sectionStats[sec] = { total: 0, correct: 0, percentage: 0 };
    sectionStats[sec].total++;

    const qid = String(q.id);
    const selected = answers[qid] ?? answers[q.id];
    if (selected === undefined || selected === null || selected === '') {
      unanswered++;
    } else if (String(selected).trim() === String(q.answer).trim()) {
      correct++;
      sectionStats[sec].correct++;
    } else {
      wrong++;
    }
  }

  for (const sec of Object.keys(sectionStats)) {
    const s = sectionStats[sec];
    s.percentage = s.total > 0 ? Math.round((s.correct / s.total) * 100) : 0;
  }

  const total = questions.length || 1;
  const scoreOutOf100 = Math.round((correct / total) * 1000) / 10;
  const percentage = scoreOutOf100;

  return {
    score: correct,
    total,
    score_out_of_100: scoreOutOf100,
    percentage,
    correct_count: correct,
    wrong_count: wrong,
    unanswered_count: unanswered,
    section_breakdown: sectionStats,
  };
}

export function getMockInterviewQuestionClientSide(
  role = 'Software Developer',
  company = '',
  resumeText = '',
  transcript: InterviewQuestionItem[] = []
): { next_question: string; available_questions: number } {
  const companyName = company.trim() || 'our team';
  const skills = Array.from(new Set(getSkillSet(resumeText))).sort();
  const qIndex = transcript.length + 1;

  const questions: string[] = [
    `Please introduce yourself and walk me through your professional journey, highlighting why you are a strong fit for the ${role} position.`,
    `What inspired you to specialize in the ${role} career path, and what excites you about this opportunity at ${companyName}?`,
    'Tell me about the most impactful project or achievement on your resume. What was your personal contribution?',
    'Describe a scenario where you had to quickly learn an unfamiliar technology or toolchain to deliver a critical milestone.',
    'Walk me through a major technical design trade-off you evaluated recently. Why did you choose that path over alternatives?',
    'Tell me about a high-severity production bug or system incident you diagnosed. How did you isolate root cause?',
    'How do you balance delivering rapid feature prototypes with maintaining long-term code quality and test coverage?',
    'Tell me about a time you received critical code review feedback or architectural pushback. How did you resolve the disagreement?',
    'Describe an experience working under tight or shifting deadlines. How did you prioritize deliverables?',
    'How do you approach performance profiling, latency reduction, or resource optimization in your systems?',
    'Tell me about a time you had to mentor a junior engineer or guide a cross-functional teammate through a complex workflow.',
    `What are the most exciting emerging methodologies or technological shifts happening right now in ${role}?`,
    'Tell me about an initiative where you proactively identified a gap in existing processes and drove improvement without being asked.',
    'How do you ensure data integrity, security best practices, and error handling in high-throughput workflows?',
    `What do you aim to accomplish in your first 90 days as a ${role} with ${companyName}?`,
  ];

  for (const s of skills.slice(0, 10)) {
    questions.push(`Your background mentions ${s}. Can you describe a production challenge where you utilized ${s} and what outcome was achieved?`);
  }

  const cycle = Math.floor((qIndex - 1) / questions.length);
  const picked = questions[(qIndex - 1) % questions.length];
  const next_question = cycle > 0 ? `[Depth Level ${cycle + 1}] ${picked}` : picked;

  return { next_question, available_questions: 100 - transcript.length };
}

export function scoreMockInterviewClientSide(transcript: InterviewQuestionItem[], role = 'Software Developer'): InterviewScore {
  if (!transcript || transcript.length === 0) {
    return {
      overall: 0,
      confidence_index: 0,
      readiness_level: 'Not Evaluated',
      communication: 0,
      completeness: 0,
      evidence: 0,
      relevance: 0,
      answered: 0,
      strengths: [],
      improvements: ['Submit at least one answer before completing the mock interview.'],
    };
  }

  const answers = transcript.map(x => String(x.answer || ''));
  const wordCounts = answers.map(a => a.split(/\s+/).filter(Boolean).length);
  const avgWords = wordCounts.reduce((acc, c) => acc + c, 0) / wordCounts.length;

  const substantiveCount = wordCounts.filter(w => w >= 20).length;
  const completeness = Math.round((substantiveCount / answers.length) * 100);

  const evidenceKeywords = ['because', 'result', 'impact', 'example', 'metric', 'improved', 'built', 'developed', 'implemented', 'saved', 'percent', '%', 'reduced', 'increased', 'optimized'];
  const evidenceCount = answers.filter(a => evidenceKeywords.some(k => a.toLowerCase().includes(k))).length;
  const evidence = Math.round((evidenceCount / answers.length) * 100);

  const roleLower = role.toLowerCase();
  const relevanceCount = answers.filter(a => a.toLowerCase().includes(roleLower) || ['experience', 'project', 'skill', 'problem', 'solution', 'team', 'system', 'design', 'process'].some(k => a.toLowerCase().includes(k))).length;
  const relevance = Math.round((relevanceCount / answers.length) * 100);

  const communication = Math.min(100, Math.round(Math.min(100, avgWords * 2.2) * 0.55 + evidence * 0.25 + relevance * 0.20));
  const overall = Math.max(15, Math.min(98, Math.round(communication * 0.40 + completeness * 0.25 + evidence * 0.20 + relevance * 0.15)));
  const confidenceIndex = Math.min(99, Math.round(overall * 0.92 + Math.min(transcript.length, 10) * 1.2));

  let readinessLevel = 'Emerging Candidate';
  if (confidenceIndex >= 85) readinessLevel = 'High Interview Readiness (Offer Caliber)';
  else if (confidenceIndex >= 70) readinessLevel = 'Competitive Candidate (Interview Ready)';
  else if (confidenceIndex >= 50) readinessLevel = 'Moderate Readiness (Polish Evidence & STAR Format)';

  const strengths: string[] = [
    `Completed ${transcript.length} interview responses for ${role}.`,
  ];
  if (avgWords >= 35) strengths.push('Answers demonstrate comprehensive thought and clear situational detail.');
  if (evidence >= 45) strengths.push('Strong use of concrete evidence, metrics, and actionable examples.');
  if (relevance >= 60) strengths.push(`Consistently aligned responses with target competencies for ${role}.`);

  const improvements: string[] = [];
  if (evidence < 40) improvements.push('Incorporate the STAR methodology with measurable business metrics (e.g. reduced load time by 30%).');
  if (avgWords < 30) improvements.push('Expand on your individual ownership and technical decision trade-offs.');
  if (improvements.length === 0) improvements.push('Maintain this structured, confident communication style in your live interviews.');

  return {
    overall,
    confidence_index: confidenceIndex,
    readiness_level: readinessLevel,
    communication,
    completeness,
    evidence,
    relevance,
    answered: transcript.length,
    strengths,
    improvements,
  };
}

// SAFE HYBRID API CLIENT (Never throws JSON parse error on 404 HTML)
export async function safeAnalyzeResume(text: string, targetRole = 'Software Developer', filename = 'resume.txt'): Promise<ResumeAnalysis> {
  try {
    const res = await fetch('/api/resume/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ resume_text: text, target_role: targetRole, filename }),
    });

    const contentType = res.headers.get('content-type') || '';
    if (res.ok && contentType.includes('application/json')) {
      const data = await res.json();
      return data;
    }
  } catch (err) {
    // Network failure, static host (GitHub Pages), or server offline
  }

  // Seamless client-side execution
  return analyzeResumeClientSide(text, filename, targetRole);
}

export async function safeMatchJob(resumeText: string, jobDescription: string): Promise<JobMatchResult> {
  try {
    const res = await fetch('/api/job/match', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ resume_text: resumeText, job_description: jobDescription }),
    });
    const contentType = res.headers.get('content-type') || '';
    if (res.ok && contentType.includes('application/json')) {
      return await res.json();
    }
  } catch (err) {
    // fallback
  }
  return matchJobClientSide(resumeText, jobDescription);
}

export async function safeGenerateAssessment(role: string, count = 10) {
  try {
    const res = await fetch('/api/assessment/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role, question_count: count }),
    });
    const contentType = res.headers.get('content-type') || '';
    if (res.ok && contentType.includes('application/json')) {
      return await res.json();
    }
  } catch (err) {
    // fallback
  }
  return generateAssessmentClientSide(role, count);
}

export async function safeScoreAssessment(questions: AssessmentQuestion[], answers: Record<string | number, string>) {
  try {
    const res = await fetch('/api/assessment/score', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ questions, answers }),
    });
    const contentType = res.headers.get('content-type') || '';
    if (res.ok && contentType.includes('application/json')) {
      return await res.json();
    }
  } catch (err) {
    // fallback
  }
  return scoreAssessmentClientSide(questions, answers);
}

export async function safeGetMockQuestion(role: string, company: string, resumeText: string, transcript: InterviewQuestionItem[]) {
  try {
    const res = await fetch('/api/mock-interview/questions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role, company, resume_text: resumeText, transcript }),
    });
    const contentType = res.headers.get('content-type') || '';
    if (res.ok && contentType.includes('application/json')) {
      return await res.json();
    }
  } catch (err) {
    // fallback
  }
  return getMockInterviewQuestionClientSide(role, company, resumeText, transcript);
}

export async function safeScoreMockInterview(transcript: InterviewQuestionItem[], role: string) {
  try {
    const res = await fetch('/api/mock-interview/score', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ transcript, role }),
    });
    const contentType = res.headers.get('content-type') || '';
    if (res.ok && contentType.includes('application/json')) {
      return await res.json();
    }
  } catch (err) {
    // fallback
  }
  return scoreMockInterviewClientSide(transcript, role);
}

export interface SalaryEstimateResult {
  role: string;
  experience: string;
  location: string;
  currency_symbol: string;
  currency_code: string;
  min_salary: number;
  max_salary: number;
  median_salary: number;
  monthly_in_hand: number;
  quartiles: {
    q25: number;
    q50: number;
    q75: number;
    q90: number;
  };
  bonus_percentage: string;
  equity_grant: string;
  market_sentiment: string;
  top_paying_skills: string[];
  negotiation_tip: string;
  note: string;
  source: string;
}

interface SalaryRoleProfile {
  keywords: string[];
  india: number;       // Annual LPA
  northAmerica: number; // Annual USD thousands
  europe: number;       // Annual EUR thousands
  skills: string[];
  bonus: number;
}

/**
 * CareerLens planning benchmarks, not a live salary feed.
 * India values are LPA; North America/Europe values are annual thousands.
 * Keep job-family skills specific so a non-IT role never receives an IT stack.
 */
const SALARY_ROLE_PROFILES: SalaryRoleProfile[] = [
  { keywords: ['generative ai engineer', 'llm engineer'], india: 16, northAmerica: 175, europe: 90, skills: ['LLMs', 'RAG', 'Vector databases', 'Python', 'Model evaluation'], bonus: 18 },
  { keywords: ['machine learning engineer', 'ml engineer'], india: 12, northAmerica: 145, europe: 75, skills: ['Python', 'PyTorch', 'TensorFlow', 'Model deployment', 'MLOps'], bonus: 15 },
  { keywords: ['artificial intelligence engineer', 'ai engineer'], india: 13, northAmerica: 155, europe: 80, skills: ['Python', 'Machine learning', 'Model evaluation', 'Data preparation', 'Model deployment'], bonus: 15 },
  { keywords: ['data scientist', 'data science'], india: 11, northAmerica: 130, europe: 68, skills: ['Python', 'SQL', 'Statistics', 'Machine learning', 'Experimentation'], bonus: 12 },
  { keywords: ['data engineer'], india: 10, northAmerica: 125, europe: 65, skills: ['SQL', 'Python', 'Data pipelines', 'ETL', 'Cloud data platforms'], bonus: 12 },
  { keywords: ['business intelligence analyst', 'data analyst', 'bi analyst'], india: 6, northAmerica: 80, europe: 45, skills: ['SQL', 'Excel', 'Power BI', 'Tableau', 'Statistics'], bonus: 8 },
  { keywords: ['business analyst'], india: 7, northAmerica: 90, europe: 48, skills: ['Requirements analysis', 'Process mapping', 'Excel', 'SQL', 'Stakeholder communication'], bonus: 8 },
  { keywords: ['software architect', 'solution architect'], india: 24, northAmerica: 190, europe: 100, skills: ['System design', 'Architecture', 'Security', 'Cloud platforms', 'Distributed systems'], bonus: 20 },
  { keywords: ['full stack developer', 'full-stack developer'], india: 9, northAmerica: 120, europe: 62, skills: ['JavaScript', 'TypeScript', 'React', 'Node.js', 'SQL'], bonus: 10 },
  { keywords: ['frontend developer', 'front end developer', 'ui developer'], india: 7, northAmerica: 105, europe: 55, skills: ['HTML', 'CSS', 'JavaScript', 'React', 'Accessibility'], bonus: 8 },
  { keywords: ['backend developer', 'back end developer'], india: 9, northAmerica: 125, europe: 65, skills: ['API design', 'SQL', 'Authentication', 'Testing', 'System design'], bonus: 10 },
  { keywords: ['software engineer', 'software developer', 'application developer'], india: 8, northAmerica: 120, europe: 62, skills: ['Programming', 'Data structures', 'Testing', 'Git', 'System design'], bonus: 10 },
  { keywords: ['devops engineer', 'devops'], india: 10, northAmerica: 125, europe: 65, skills: ['Linux', 'CI/CD', 'Docker', 'Kubernetes', 'Infrastructure as Code'], bonus: 12 },
  { keywords: ['site reliability engineer', 'sre'], india: 14, northAmerica: 155, europe: 80, skills: ['Linux', 'Observability', 'Incident response', 'Automation', 'Cloud infrastructure'], bonus: 15 },
  { keywords: ['cloud engineer'], india: 9, northAmerica: 125, europe: 65, skills: ['AWS', 'Azure', 'Networking', 'Linux', 'Infrastructure as Code'], bonus: 10 },
  { keywords: ['cybersecurity engineer', 'penetration tester', 'security engineer'], india: 12, northAmerica: 140, europe: 72, skills: ['Security testing', 'Threat modelling', 'Networking', 'Incident response', 'Cloud security'], bonus: 12 },
  { keywords: ['cybersecurity analyst', 'security analyst'], india: 8, northAmerica: 105, europe: 55, skills: ['SIEM', 'Security monitoring', 'Networking', 'Incident response', 'Risk assessment'], bonus: 10 },
  { keywords: ['qa automation engineer', 'test automation engineer'], india: 7, northAmerica: 100, europe: 52, skills: ['Test automation', 'Playwright', 'Selenium', 'API testing', 'CI/CD'], bonus: 8 },
  { keywords: ['quality assurance engineer', 'qa engineer', 'software tester'], india: 5, northAmerica: 82, europe: 43, skills: ['Test cases', 'Bug reporting', 'Regression testing', 'API testing', 'Attention to detail'], bonus: 6 },
  { keywords: ['product manager'], india: 18, northAmerica: 150, europe: 78, skills: ['Product strategy', 'Roadmapping', 'Analytics', 'User research', 'Stakeholder management'], bonus: 15 },
  { keywords: ['project manager'], india: 12, northAmerica: 115, europe: 60, skills: ['Project planning', 'Risk management', 'Budget tracking', 'Communication', 'Agile'], bonus: 10 },
  { keywords: ['ux designer', 'ui designer', 'product designer'], india: 8, northAmerica: 110, europe: 58, skills: ['Figma', 'Prototyping', 'User research', 'Accessibility', 'Design systems'], bonus: 8 },

  { keywords: ['mechanical engineering manager', 'mechanical engineer', 'mechanical engineering'], india: 5.5, northAmerica: 86, europe: 46, skills: ['CAD/CAE', 'Mechanical design', 'Manufacturing processes', 'Materials', 'Quality testing'], bonus: 6 },
  { keywords: ['civil engineer', 'civil engineering', 'structural engineer'], india: 5.5, northAmerica: 84, europe: 45, skills: ['AutoCAD', 'Structural analysis', 'Construction planning', 'Building codes', 'Site safety'], bonus: 6 },
  { keywords: ['electrical engineer', 'electrical engineering'], india: 6, northAmerica: 92, europe: 48, skills: ['Circuit design', 'Power systems', 'Electrical safety', 'PLC', 'Testing'], bonus: 7 },
  { keywords: ['electronics engineer', 'electronics engineering', 'embedded systems engineer'], india: 6.5, northAmerica: 100, europe: 52, skills: ['Circuit design', 'Embedded C', 'Microcontrollers', 'PCB design', 'Testing'], bonus: 7 },
  { keywords: ['chemical engineer', 'chemical engineering'], india: 6, northAmerica: 100, europe: 54, skills: ['Process engineering', 'Process safety', 'Quality control', 'Thermodynamics', 'Plant operations'], bonus: 8 },
  { keywords: ['automobile engineer', 'automotive engineer', 'automotive technician'], india: 5.5, northAmerica: 78, europe: 43, skills: ['Vehicle systems', 'Diagnostics', 'CAD', 'Quality testing', 'Manufacturing'], bonus: 6 },
  { keywords: ['aerospace engineer', 'aeronautical engineer'], india: 8, northAmerica: 120, europe: 62, skills: ['Aerodynamics', 'CAD/CAE', 'Materials', 'Systems testing', 'Safety standards'], bonus: 8 },
  { keywords: ['biomedical engineer', 'biomedical engineering'], india: 6, northAmerica: 90, europe: 48, skills: ['Medical devices', 'Instrumentation', 'Quality systems', 'Regulatory standards', 'Testing'], bonus: 7 },
  { keywords: ['industrial engineer', 'manufacturing engineer', 'production engineer'], india: 6, northAmerica: 88, europe: 47, skills: ['Lean manufacturing', 'Process improvement', 'Quality control', 'CAD', 'Production planning'], bonus: 7 },
  { keywords: ['environmental engineer', 'environmental scientist'], india: 5.5, northAmerica: 78, europe: 43, skills: ['Environmental compliance', 'Impact assessment', 'Sampling', 'Waste management', 'Reporting'], bonus: 5 },
  { keywords: ['construction manager', 'site engineer'], india: 7, northAmerica: 95, europe: 50, skills: ['Project scheduling', 'Cost estimation', 'Site coordination', 'Safety compliance', 'Quality control'], bonus: 8 },

  { keywords: ['doctor', 'physician', 'medical doctor'], india: 12, northAmerica: 220, europe: 90, skills: ['Clinical assessment', 'Patient care', 'Diagnosis', 'Medical ethics', 'Clinical documentation'], bonus: 10 },
  { keywords: ['registered nurse', 'nurse'], india: 4, northAmerica: 82, europe: 42, skills: ['Patient care', 'Clinical documentation', 'Medication safety', 'Communication', 'Emergency response'], bonus: 4 },
  { keywords: ['dentist'], india: 7, northAmerica: 150, europe: 65, skills: ['Dental assessment', 'Patient care', 'Oral surgery', 'Infection control', 'Treatment planning'], bonus: 6 },
  { keywords: ['pharmacist'], india: 4.5, northAmerica: 125, europe: 48, skills: ['Medication safety', 'Drug interactions', 'Dispensing', 'Patient counselling', 'Regulatory compliance'], bonus: 4 },
  { keywords: ['physiotherapist', 'physical therapist'], india: 4, northAmerica: 78, europe: 40, skills: ['Rehabilitation', 'Exercise prescription', 'Patient assessment', 'Anatomy', 'Treatment planning'], bonus: 4 },
  { keywords: ['medical laboratory technician', 'lab technician'], india: 3.5, northAmerica: 55, europe: 32, skills: ['Sample handling', 'Laboratory safety', 'Quality control', 'Clinical testing', 'Documentation'], bonus: 3 },
  { keywords: ['healthcare administrator', 'hospital administrator'], india: 8, northAmerica: 105, europe: 55, skills: ['Healthcare operations', 'Compliance', 'Staff coordination', 'Budgeting', 'Patient experience'], bonus: 8 },

  { keywords: ['financial manager', 'finance manager'], india: 14, northAmerica: 145, europe: 75, skills: ['Financial planning', 'Forecasting', 'Budgeting', 'Financial reporting', 'Risk management'], bonus: 15 },
  { keywords: ['financial analyst', 'finance analyst'], india: 8, northAmerica: 90, europe: 48, skills: ['Financial modelling', 'Excel', 'Forecasting', 'Financial reporting', 'Data analysis'], bonus: 8 },
  { keywords: ['accountant', 'accounting'], india: 5, northAmerica: 65, europe: 38, skills: ['Accounting', 'Excel', 'Financial statements', 'Tax compliance', 'Reconciliation'], bonus: 5 },
  { keywords: ['auditor', 'audit associate'], india: 6, northAmerica: 72, europe: 40, skills: ['Audit procedures', 'Internal controls', 'Accounting standards', 'Documentation', 'Risk assessment'], bonus: 5 },
  { keywords: ['tax consultant', 'tax analyst'], india: 6, northAmerica: 78, europe: 42, skills: ['Tax preparation', 'Tax regulations', 'Accounting', 'Research', 'Client communication'], bonus: 6 },
  { keywords: ['banking associate', 'bank officer'], india: 5, northAmerica: 65, europe: 38, skills: ['Customer service', 'Financial products', 'Compliance', 'Risk awareness', 'Communication'], bonus: 5 },

  { keywords: ['human resources manager', 'hr manager'], india: 10, northAmerica: 105, europe: 55, skills: ['People management', 'Employee relations', 'HR analytics', 'Performance management', 'Employment law'], bonus: 10 },
  { keywords: ['recruiter', 'talent acquisition'], india: 6, northAmerica: 75, europe: 40, skills: ['Candidate sourcing', 'Interviewing', 'ATS', 'Candidate experience', 'Communication'], bonus: 8 },
  { keywords: ['marketing manager', 'digital marketing specialist', 'digital marketing'], india: 7, northAmerica: 90, europe: 47, skills: ['SEO/SEM', 'Campaign analytics', 'Content strategy', 'Marketing automation', 'Conversion optimisation'], bonus: 8 },
  { keywords: ['sales manager', 'account executive'], india: 9, northAmerica: 100, europe: 52, skills: ['Negotiation', 'CRM', 'Pipeline management', 'Forecasting', 'Client relationships'], bonus: 15 },
  { keywords: ['sales executive', 'sales representative'], india: 4.5, northAmerica: 65, europe: 36, skills: ['Product knowledge', 'Customer communication', 'CRM', 'Negotiation', 'Lead generation'], bonus: 12 },
  { keywords: ['operations manager'], india: 10, northAmerica: 100, europe: 52, skills: ['Process improvement', 'People management', 'KPIs', 'Budgeting', 'Operational planning'], bonus: 10 },
  { keywords: ['supply chain manager', 'logistics manager'], india: 9, northAmerica: 100, europe: 52, skills: ['Demand planning', 'Inventory management', 'Procurement', 'Logistics', 'ERP systems'], bonus: 10 },
  { keywords: ['customer support specialist', 'customer service representative'], india: 3.5, northAmerica: 48, europe: 30, skills: ['Customer communication', 'Ticketing systems', 'Problem solving', 'Product knowledge', 'Conflict resolution'], bonus: 3 },

  { keywords: ['college professor', 'university lecturer', 'lecturer'], india: 7, northAmerica: 85, europe: 48, skills: ['Subject expertise', 'Teaching', 'Research', 'Assessment design', 'Student mentoring'], bonus: 5 },
  { keywords: ['school teacher', 'teacher'], india: 4, northAmerica: 55, europe: 35, skills: ['Lesson planning', 'Classroom management', 'Assessment', 'Communication', 'Student support'], bonus: 3 },
  { keywords: ['corporate trainer', 'instructional designer'], india: 6, northAmerica: 78, europe: 42, skills: ['Learning design', 'Facilitation', 'Curriculum development', 'Learning assessment', 'Presentation'], bonus: 5 },

  { keywords: ['graphic designer'], india: 5, northAmerica: 62, europe: 36, skills: ['Adobe Creative Suite', 'Typography', 'Layout', 'Brand systems', 'Visual communication'], bonus: 4 },
  { keywords: ['video editor', 'film editor'], india: 4.5, northAmerica: 60, europe: 35, skills: ['Video editing', 'Storytelling', 'Audio editing', 'Colour correction', 'Motion graphics'], bonus: 4 },
  { keywords: ['content writer', 'copywriter'], india: 4.5, northAmerica: 60, europe: 34, skills: ['Writing', 'Editing', 'Research', 'SEO writing', 'Audience awareness'], bonus: 4 },
  { keywords: ['journalist', 'reporter'], india: 4, northAmerica: 58, europe: 34, skills: ['Research', 'Fact checking', 'Interviewing', 'Writing', 'Editorial standards'], bonus: 3 },

  { keywords: ['chef', 'head chef'], india: 4.5, northAmerica: 52, europe: 32, skills: ['Food preparation', 'Food safety', 'Menu planning', 'Kitchen operations', 'Cost control'], bonus: 4 },
  { keywords: ['hotel manager', 'hospitality manager'], india: 7, northAmerica: 72, europe: 42, skills: ['Guest relations', 'Staff scheduling', 'Revenue management', 'Operations', 'Service standards'], bonus: 6 },
  { keywords: ['electrician'], india: 3.5, northAmerica: 62, europe: 38, skills: ['Electrical safety', 'Wiring', 'Fault diagnosis', 'Blueprint reading', 'Local code compliance'], bonus: 3 },
  { keywords: ['plumber'], india: 3, northAmerica: 58, europe: 35, skills: ['Pipe installation', 'Leak diagnosis', 'Blueprint reading', 'Safety', 'Maintenance'], bonus: 3 },
  { keywords: ['hvac technician', 'hvac engineer'], india: 4.5, northAmerica: 65, europe: 38, skills: ['HVAC systems', 'Refrigeration', 'Troubleshooting', 'Electrical safety', 'Preventive maintenance'], bonus: 4 },

  { keywords: ['agricultural engineer', 'agriculture engineer'], india: 5, northAmerica: 78, europe: 42, skills: ['Irrigation systems', 'Soil and water management', 'Farm machinery', 'Sustainability', 'Field assessment'], bonus: 5 },
  { keywords: ['agronomist'], india: 4.5, northAmerica: 68, europe: 38, skills: ['Crop science', 'Soil management', 'Field trials', 'Pest management', 'Data collection'], bonus: 4 },
  { keywords: ['food technologist', 'food scientist'], india: 5, northAmerica: 75, europe: 42, skills: ['Food safety', 'Quality assurance', 'Product development', 'HACCP', 'Laboratory testing'], bonus: 5 },
  { keywords: ['research scientist'], india: 7, northAmerica: 105, europe: 55, skills: ['Research methods', 'Data analysis', 'Experimental design', 'Scientific writing', 'Lab safety'], bonus: 7 },

  { keywords: ['lawyer', 'attorney'], india: 7, northAmerica: 130, europe: 62, skills: ['Legal research', 'Drafting', 'Negotiation', 'Case analysis', 'Client communication'], bonus: 8 },
  { keywords: ['compliance officer', 'legal advisor'], india: 8, northAmerica: 100, europe: 52, skills: ['Regulatory compliance', 'Policy review', 'Risk assessment', 'Documentation', 'Legal research'], bonus: 8 },
];

function normalizeSalaryText(value: string): string {
  return String(value || '')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}+.#\s-]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function findSalaryProfile(role: string): SalaryRoleProfile | undefined {
  const normalizedRole = normalizeSalaryText(role);
  const profiles = [...SALARY_ROLE_PROFILES].sort((a, b) => {
    const aLength = Math.max(...a.keywords.map(keyword => normalizeSalaryText(keyword).length));
    const bLength = Math.max(...b.keywords.map(keyword => normalizeSalaryText(keyword).length));
    return bLength - aLength;
  });

  return profiles.find(profile =>
    profile.keywords.some(keyword => {
      const normalizedKeyword = normalizeSalaryText(keyword);
      return normalizedRole === normalizedKeyword ||
        normalizedRole.startsWith(`${normalizedKeyword} `) ||
        normalizedRole.includes(` ${normalizedKeyword} `) ||
        normalizedRole.endsWith(` ${normalizedKeyword}`);
    })
  );
}

function getExperienceMultiplier(experience: string): number {
  const value = normalizeSalaryText(experience);
  if (value.includes('fresher') || value.includes('intern') || value.includes('0-1') || value.includes('0 1')) return 0.72;
  if (value.includes('entry')) return 0.82;
  if (value.includes('lead') || value.includes('principal') || value.includes('director') || value.includes('manager') || value.includes('8+')) return 1.85;
  if (value.includes('senior') || value.includes('5-8') || value.includes('5 8')) return 1.5;
  if (value.includes('mid') || value.includes('2-5') || value.includes('2 5')) return 1;
  return 1;
}

export function estimateSalaryClientSide(
  role = 'Software Developer',
  experience = 'Mid Level',
  location = 'India',
  skills: string[] = []
): SalaryEstimateResult {
  const safeRole = String(role || '').trim().slice(0, 120) || 'Other Professional';
  const safeExperience = String(experience || '').trim().slice(0, 60) || 'Mid Level';
  const safeLocation = String(location || '').trim().slice(0, 100) || 'India';
  const normalizedLocation = normalizeSalaryText(safeLocation);
  const profile = findSalaryProfile(safeRole);

  // Generic cross-industry fallback; does not assume a software job.
  const fallbackProfile: SalaryRoleProfile = {
    keywords: [],
    india: 5.5,
    northAmerica: 72,
    europe: 40,
    skills: ['Role-specific qualifications', 'Communication', 'Problem solving', 'Relevant work experience'],
    bonus: 5,
  };
  const selectedProfile = profile || fallbackProfile;
  const multiplier = getExperienceMultiplier(safeExperience);

  // Dynamic title seniority modifier
  const roleLower = safeRole.toLowerCase();
  let titleBonus = 1.0;
  if (/principal|staff|director|vice president|\bvp\b|head of/.test(roleLower)) titleBonus = 1.35;
  else if (/architect|lead|manager/.test(roleLower)) titleBonus = 1.20;
  else if (/senior|sr\b/.test(roleLower)) titleBonus = 1.12;
  else if (/junior|jr\b|associate|entry/.test(roleLower)) titleBonus = 0.88;
  else if (/intern|fresher|trainee/.test(roleLower)) titleBonus = 0.75;

  // High-demand skill premium: every specialized keyword adds customized market value
  const HIGH_DEMAND_BOOSTS: Record<string, number> = {
    ai: 0.08, 'machine learning': 0.08, pytorch: 0.07, llm: 0.09, rag: 0.08,
    aws: 0.06, kubernetes: 0.07, docker: 0.05, cloud: 0.05, 'system design': 0.07,
    python: 0.05, typescript: 0.05, react: 0.05, 'next.js': 0.05, 'node.js': 0.05,
    golang: 0.07, rust: 0.08, microservices: 0.06, sql: 0.04, security: 0.06,
  };

  const suppliedSkills = Array.isArray(skills)
    ? skills.map(skill => normalizeSalaryText(String(skill)))
    : [];

  let accumulatedSkillBoost = 0;
  for (const sk of suppliedSkills) {
    for (const [kw, boost] of Object.entries(HIGH_DEMAND_BOOSTS)) {
      if (sk.includes(kw)) {
        accumulatedSkillBoost += boost;
        break;
      }
    }
  }
  // Cap boost between 0% and 35%
  const finalSkillMultiplier = 1 + Math.min(0.35, Math.max(0.02, accumulatedSkillBoost));

  // Dynamic variance hash from role string to ensure unique realistic numbers
  let strHash = 0;
  for (let i = 0; i < safeRole.length; i++) {
    strHash = (strHash * 31 + safeRole.charCodeAt(i)) & 0xffffffff;
  }
  const varianceFactor = 0.96 + (Math.abs(strHash) % 90) / 1000; // 0.96 - 1.05

  const adjusted = (base: number) => base * multiplier * titleBonus * finalSkillMultiplier * varianceFactor;

  const isUSD = /north america|united states|usa|canada|usd/.test(normalizedLocation);
  const isEUR = /europe|eur|germany|france|netherlands|ireland|spain|italy|portugal|sweden|denmark|finland|belgium/.test(normalizedLocation);
  const isGlobalRemote = /global remote|worldwide remote/.test(normalizedLocation);

  let currencySymbol = '₹';
  let currencyCode = 'INR / LPA';
  let minSalary: number;
  let maxSalary: number;
  let medianSalary: number;
  let monthlyInHand: number;

  if (isUSD || isGlobalRemote) {
    currencySymbol = '$';
    currencyCode = 'USD / year (thousands)';
    const base = adjusted(selectedProfile.northAmerica);
    minSalary = Math.round(base * 0.82);
    maxSalary = Math.round(base * 1.28);
    medianSalary = Math.round(base);
    monthlyInHand = Math.round((medianSalary * 1000 * 0.70) / 12);
  } else if (isEUR) {
    currencySymbol = '€';
    currencyCode = 'EUR / year (thousands)';
    const base = adjusted(selectedProfile.europe);
    minSalary = Math.round(base * 0.82);
    maxSalary = Math.round(base * 1.26);
    medianSalary = Math.round(base);
    monthlyInHand = Math.round((medianSalary * 1000 * 0.65) / 12);
  } else {
    const base = adjusted(selectedProfile.india);
    minSalary = Math.round(base * 0.82 * 10) / 10;
    maxSalary = Math.round(base * 1.28 * 10) / 10;
    medianSalary = Math.round(base * 10) / 10;
    monthlyInHand = Math.round((medianSalary * 100000 * 0.80) / 12);
  }

  const bonusLow = Math.max(5, Math.round(selectedProfile.bonus * titleBonus) - 2);
  const bonusHigh = Math.round(selectedProfile.bonus * titleBonus) + 4;

  const dynamicTip = suppliedSkills.length > 0
    ? `In negotiations for ${safeRole} (${safeExperience}) in ${safeLocation}, emphasize your proven track record in ${suppliedSkills.slice(0, 3).join(', ')}. Anchor counter-offers above ${currencySymbol}${medianSalary} ${currencyCode.includes('LPA') ? 'LPA' : 'k'} and request milestone performance reviews for accelerated equity vesting.`
    : `When negotiating a ${safeRole} offer in ${safeLocation}, request a full compensation breakdown across base pay, performance incentives, and benefits. Benchmark your target at the 75th percentile (${currencySymbol}${Math.round(medianSalary * 1.15)}).`;

  const dynamicEquity = multiplier >= 1.5 || titleBonus > 1.1
    ? `Senior/lead band: High likelihood of RSUs or equity incentives (typically 15%–35% of annual compensation on a 4-year vesting schedule).`
    : `Mid/entry band: Equity grants vary by stage; standard ESOPs common in growth-stage startups, retention bonuses in enterprises.`;

  const dynamicSentiment = titleBonus > 1.1 || accumulatedSkillBoost > 0.1
    ? `Strong market velocity: specialized talent in ${safeRole} commanding premium multiple offers across ${safeLocation}.`
    : `Stable hiring volume across ${safeLocation} with competitive compensation for candidates with substantiated practical impact.`;

  return {
    role: safeRole,
    experience: safeExperience,
    location: safeLocation,
    currency_symbol: currencySymbol,
    currency_code: currencyCode,
    min_salary: minSalary,
    max_salary: maxSalary,
    median_salary: medianSalary,
    monthly_in_hand: monthlyInHand,
    quartiles: {
      q25: minSalary,
      q50: medianSalary,
      q75: Math.round((minSalary * 0.35 + maxSalary * 0.65) * 10) / 10,
      q90: maxSalary,
    },
    bonus_percentage: `${bonusLow}% - ${bonusHigh}%`,
    equity_grant: dynamicEquity,
    market_sentiment: dynamicSentiment,
    top_paying_skills: selectedProfile.skills,
    negotiation_tip: dynamicTip,
    note: 'Dynamic market model calculated from skill premiums, seniority multipliers, and regional benchmark data.',
    source: 'CareerLens Adaptive Market Intelligence',
  };
}

export async function safeEstimateSalary(
  role: string,
  experience: string,
  location: string,
  skills: string[] = []
): Promise<SalaryEstimateResult> {
  const requestedRole = String(role || '').trim() || 'Other Professional';
  const requestedExperience = String(experience || '').trim() || 'Mid Level';
  const requestedLocation = String(location || '').trim() || 'India';

  try {
    const response = await fetch('/api/salary/estimate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        role: requestedRole,
        experience: requestedExperience,
        location: requestedLocation,
        skills: Array.isArray(skills) ? skills : [],
      }),
    });

    const contentType = response.headers.get('content-type') || '';
    if (!response.ok || !contentType.includes('application/json')) {
      throw new Error('Salary API unavailable');
    }

    const result = await response.json() as SalaryEstimateResult;
    if (
      !result ||
      typeof result.min_salary !== 'number' ||
      typeof result.max_salary !== 'number' ||
      typeof result.median_salary !== 'number' ||
      !Array.isArray(result.top_paying_skills)
    ) {
      throw new Error('Invalid salary API response');
    }

    return {
      ...result,
      role: requestedRole,
      experience: requestedExperience,
      location: requestedLocation,
    };
  } catch {
    return estimateSalaryClientSide(
      requestedRole,
      requestedExperience,
      requestedLocation,
      skills
    );
  }
}


export async function safeAskAssistant(messages: Array<{ role: 'user' | 'assistant'; content: string }>, resumeContext = ''): Promise<string> {
  const latestUserMsg = [...messages].reverse().find(m => m.role === 'user')?.content || '';
  if (!latestUserMsg) return 'How can I assist you with your career goals, resume optimization, or interview prep today?';

  try {
    const res = await fetch('/api/chat/ask', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages, resume_context: resumeContext }),
    });
    const contentType = res.headers.get('content-type') || '';
    if (res.ok && contentType.includes('application/json')) {
      const data = await res.json();
      if (data.reply) return data.reply;
    }
  } catch (err) {
    // fallback
  }

  const q = latestUserMsg.toLowerCase();
  const skills = Array.from(new Set(getSkillSet(resumeContext))).sort();

  if (q.includes('score') || (q.includes('raise') && q.includes('resume')) || q.includes('past 90')) {
    return `### How to Boost Your Resume Score to 90+\n\n` +
      `**1. Rewrite bullets with Google XYZ Formula:**\n` +
      `• *Instead of:* "Worked on backend APIs using FastAPI."\n` +
      `• *Write:* "Architected 8 asynchronous FastAPI endpoints, reducing response latency by 38% for 120,000 daily active users."\n\n` +
      `**2. Ensure All 6 Core Sections Exist:**\n` +
      `• Professional Summary (3 lines max)\n` +
      `• Core Technical Competencies (Categorized)\n` +
      `• Work Experience (quantified with % / $ / hours saved)\n` +
      `• Key Projects (with public GitHub or live deployment links)\n` +
      `• Education & Certifications\n` +
      `• Contact Details (Email, phone, LinkedIn, GitHub)\n\n` +
      `**3. Keyword Density:** Include tools matching your target role requisition (${skills.slice(0, 5).join(', ') || 'Docker, AWS, TypeScript'}).`;
  } else if (q.includes('star') || q.includes('behavioral') || q.includes('tell me about a time')) {
    return `### High-Impact STAR Behavioral Framework\n\n` +
      `When asked behavioral questions (e.g., handling conflicts, tight deadlines, or outages), structure your reply in 90 seconds:\n\n` +
      `• **Situation (15s):** Set the context and business stakes. ("During Black Friday deployment at our previous SaaS...")\n` +
      `• **Task (15s):** Specify your explicit personal ownership. ("I was designated incident lead to isolate the database bottleneck.")\n` +
      `• **Action (45s):** Detail the exact technical decisions you made. ("I analyzed PostgreSQL slow queries, provisioned a Redis caching layer, and optimized connection pooling.")\n` +
      `• **Result (15s):** Deliver quantifiable impact. ("Database CPU dropped from 94% to 22%, saving an estimated $40,000 in checkout abandonment.")`;
  } else if (q.includes('salary') || q.includes('offer') || q.includes('counter') || q.includes('negotiat') || q.includes('expected')) {
    return `### Strategic Salary Negotiation Script\n\n` +
      `**When a recruiter asks: "What is your current or expected CTC?"**\n\n` +
      `*Script:* "I am focused on finding the right role alignment where I can drive measurable outcomes. Based on market benchmarks for this seniority level and my experience in ${skills.slice(0, 3).join(', ') || 'modern full-stack systems'}, I am targeting the ₹16L–₹22L band (or competitive market equivalent). What is the budgeted range for this position?"\n\n` +
      `**Key Rules:**\n` +
      `1. Never state your absolute minimum number first.\n` +
      `2. Negotiate the full package: Base pay, signing bonus, annual variable, and equity.\n` +
      `3. Always request offer letters in writing before verbally accepting.`;
  } else if (q.includes('qa') && (q.includes('devops') || q.includes('cloud'))) {
    return `### Step-by-Step Transition: QA to DevOps / Cloud\n\n` +
      `**1. Pivot from Manual/UI Testing to Infrastructure-as-Code:**\n` +
      `• Leverage your existing testing mindset for automated integration and smoke testing in CI/CD pipelines.\n\n` +
      `**2. High-Priority Toolchain to Master:**\n` +
      `• **Linux & Bash:** Master file system management, process signals, and shell automation.\n` +
      `• **Docker:** Containerize existing test environments and microservices.\n` +
      `• **Kubernetes:** Learn Pods, Deployments, Services, and Helm charts.\n` +
      `• **GitHub Actions / GitLab CI:** Build end-to-end automated build-test-deploy workflows.\n` +
      `• **AWS/GCP:** Obtain AWS Solutions Architect Associate or CKA.\n\n` +
      `**3. Build a Proof-of-Work Project:** Host a multi-service containerized application with automated rollout and rollback strategies.`;
  } else if (q.includes('project') || q.includes('portfolio')) {
    return `### 3 Portfolio Projects That Get Interviews\n\n` +
      `Avoid generic tutorial clones (like basic to-do apps). Build production-grade systems:\n\n` +
      `1. **Real-Time Data Pipeline / Distributed Engine:**\n` +
      `• Tech: FastAPI, Redis Pub/Sub, Kafka, or WebSocket streaming.\n` +
      `• Shows: Understanding of concurrency, caching, and rate limiting.\n\n` +
      `2. **AI-Powered Analytics or Classification Engine:**\n` +
      `• Tech: Python, PyTorch/Scikit-Learn, React dashboard, Docker.\n` +
      `• Shows: End-to-end model serving, vector similarity search, and clean UX.\n\n` +
      `3. **Full-Stack SaaS with Authentication & Role-Based Access (RBAC):**\n` +
      `• Tech: Next.js/React, TypeScript, PostgreSQL, Stripe/mock billing.\n` +
      `• Shows: Enterprise readiness, database migration hygiene, and modular design.`;
  } else if (q.includes('how to become') || q.includes('become a')) {
    const roleTarget = latestUserMsg.replace(/.*?how to become\s+(?:an?\s+)?/i, '').replace(/[?.!]/g, '').trim() || 'your target role';
    return `### Targeted Career Roadmap: ${roleTarget}\n\n` +
      `**1. Core Competency Mastery:**\n` +
      `• Master the foundational tools and industry paradigms demanded by top tech firms.\n\n` +
      `**2. Hands-On Proof of Work:**\n` +
      `• Build 2 production repositories with unit test coverage, automated CI/CD, and Dockerized setups.\n\n` +
      `**3. Tailor Your Digital Presence:**\n` +
      `• Align your resume bullets with target requisitions. Highlight business metrics rather than passive responsibilities.\n\n` +
      `**4. Network Strategically:**\n` +
      `• Send personalized cold notes to engineering leads showcasing a solution you built for a problem their team faces.\n\n` +
      (skills.length > 0 ? `*Your current detected resume competencies:* ${skills.join(', ')}.` : '');
  } else {
    return `### Advisory on: "${latestUserMsg}"\n\n` +
      `To optimize your standing for this objective:\n\n` +
      `1. **Evaluate Current Market Demand:** Benchmark against live requisitions for your target domain.\n` +
      `2. **Bridge the Key Skill Gaps:** Build tangible demonstrable projects showcasing the toolchain rather than passive courses.\n` +
      `3. **Quantify Your Value:** In both your resume and interview storytelling, focus on efficiency gained, revenue influenced, or latency reduced.\n\n` +
      `Would you like to review sample interview questions, craft a specific resume bullet, or practice salary negotiation for this role?`;
  }
}

export function screenBatchCandidatesClientSide(jobDescription: string, resumes: any[]): any[] {
  return resumes.map((r, index) => {
    const text = r.text || '';
    const filename = r.filename || `candidate_${index + 1}.pdf`;
    const profile = analyzeResumeClientSide(text, filename);
    const match = matchJobClientSide(text, jobDescription);

    return {
      id: r.id || `cand_${Date.now()}_${index}`,
      name: r.name || profile.name,
      email: profile.email || r.email || `candidate${index + 1}@example.com`,
      phone: profile.phone || r.phone || '',
      resume_score: profile.resume_score,
      role_match: match.overall,
      status: match.overall >= 70 ? 'Shortlisted' : 'Screened',
      assessment_status: 'Not Sent',
      email_status: profile.email ? 'Found' : 'Missing',
      skills: profile.skills,
      missing_skills: match.missing,
      strengths: profile.strengths,
      recommendations: profile.recommendations,
    };
  }).sort((a, b) => b.role_match - a.role_match);
}
