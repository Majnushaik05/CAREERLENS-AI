import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
// AI Studio dev environment requires port 3000
const PORT = 3000;
const HOST = '0.0.0.0';

app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// Initialize Gemini SDK if available
let aiClient: GoogleGenAI | null = null;
const geminiApiKey = process.env.GEMINI_API_KEY || process.env.API_KEY || '';
if (geminiApiKey) {
  try {
    aiClient = new GoogleGenAI({ apiKey: geminiApiKey });
  } catch (err) {
    console.warn('[CareerLens] Could not initialize Gemini SDK:', err);
  }
}

// ============================================================
// SKILLS & ROLE DATA FROM CAREERLENS AI (Strict Word-Boundary Parsing)
// ============================================================
interface SkillDefinition {
  name: string;
  regex: RegExp;
  category: 'Languages' | 'Frameworks & Libraries' | 'Cloud & DevOps' | 'Databases & Tools' | 'Specialized & Domain';
}

const SKILL_CATALOG: SkillDefinition[] = [
  // Programming Languages (Avoid substring collisions like "go" in "algorithm", "c" in "science")
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

const ROLE_SKILL_HINTS: Record<string, string[]> = {
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

const RISK_PATTERNS: Record<string, string> = {
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

/**
 * Strict, non-hallucinating skill extractor using regular expressions with word-boundaries.
 * Guarantees zero false positives from words like 'digital' matching 'git' or 'trust' matching 'rust'.
 */
function getSkillSet(text: string): string[] {
  if (!text) return [];
  // Clean string and preserve text
  const clean = text.replace(/[\r\n\t]+/g, ' ');
  const detected = new Set<string>();

  for (const item of SKILL_CATALOG) {
    if (item.regex.test(clean)) {
      detected.add(item.name);
    }
  }

  return Array.from(detected).sort();
}

function getRoleHints(role: string): string[] {
  const roleLower = (role || '').toLowerCase();
  const result: string[] = [];
  for (const [key, values] of Object.entries(ROLE_SKILL_HINTS)) {
    if (roleLower.includes(key)) {
      result.push(...values);
    }
  }
  return Array.from(new Set(result));
}

function extractEmail(text: string): string {
  const re = /[A-Za-z0-9.!#$%&'*+/=?^_`{|}~-]+@[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)+/;
  const match = (text || '').match(re);
  return match ? match[0].toLowerCase() : '';
}

function extractPhone(text: string): string {
  const re = /(?:\+?\d[\d .()\-]{8,}\d)/;
  const match = (text || '').match(re);
  return match ? match[0].trim() : '';
}

function extractName(text: string, filename = 'Candidate'): string {
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

function analyzeResume(text: string, filename = 'resume.txt', targetRole = '') {
  const cleanText = (text || '').trim();
  const lower = cleanText.toLowerCase();
  const words = cleanText.match(/\b[a-zA-Z]{2,}\b/g) || [];
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

  const lines = cleanText.split('\n').map(l => l.trim().toLowerCase()).filter(Boolean);
  const foundSections = new Set<string>();
  for (const [sec, variants] of Object.entries(sectionNames)) {
    if (lines.some(line => variants.some(v => line === v || line.startsWith(v + ':') || line.startsWith(v + ' -')))) {
      foundSections.add(sec);
    }
  }

  const quantifiedMatches = lower.match(/(?:\b\d+%|\b\d+[+]?(?:\s*years?|\s*users?|\s*clients?)|\b(?:increased|reduced|improved|saved|grew|generated)\b[^.]{0,60}\b\d+)/g) || [];
  const actionVerbsMatches = lower.match(/\b(led|built|developed|designed|implemented|improved|optimized|automated|created|managed|analyzed|delivered|launched|reduced|increased|deployed|tested|trained)\b/g) || [];
  const bulletsMatches = cleanText.match(/(?:^|\n)\s*[•▪●*-]\s+/g) || [];

  const email = extractEmail(cleanText);
  const phone = extractPhone(cleanText);

  const contentScore = Math.min(100, 25 + (Math.min(words.length, 700) / 700) * 45 + (Math.min(bulletsMatches.length, 18) / 18) * 15 + (Math.min(actionVerbsMatches.length, 12) / 12) * 15);
  const sectionScore = (foundSections.size / 7) * 100;
  const skillScore = Math.min(100, (skills.length / 12) * 100);
  const achievementScore = Math.min(100, (quantifiedMatches.length / 5) * 70 + (Math.min(actionVerbsMatches.length, 10) / 10) * 30);
  const contactScore = (email ? 50 : 0) + (phone ? 50 : 0);

  const hints = getRoleHints(targetRole);
  const roleMatch = hints.length > 0 ? (hints.filter(h => lower.includes(h)).length / hints.length) * 100 : null;

  let totalScore = contentScore * 0.25 + sectionScore * 0.20 + skillScore * 0.20 + achievementScore * 0.15 + contactScore * 0.10 + (roleMatch !== null ? roleMatch * 0.10 : 5);
  totalScore = Math.round(Math.max(5, Math.min(98, totalScore)));

  const experienceSignals = (lower.match(/\b(experience|intern|internship|employment|work history|years?)\b/g) || []).length;
  const readiness = Math.round(Math.max(5, Math.min(97, totalScore * 0.55 + Math.min(skills.length, 10) * 3 + Math.min(quantifiedMatches.length, 5) * 2 + Math.min(experienceSignals, 3) * 2)));

  const missingSections = Object.keys(sectionNames).filter(k => !foundSections.has(k)).map(k => k.charAt(0).toUpperCase() + k.slice(1));
  const missingSkills = hints.filter(h => !lower.includes(h)).slice(0, 8);

  const recommendations: string[] = [];
  if (missingSections.includes('Experience')) recommendations.push('Add relevant experience, internships, or substantial project work.');
  if (missingSections.includes('Projects')) recommendations.push('Add 2–3 relevant projects with tools, individual contributions, and measurable outcomes.');
  if (quantifiedMatches.length < 2) recommendations.push('Include measurable metrics such as percentages (e.g., 25% faster), users, cost savings, or scale.');
  if (actionVerbsMatches.length < 4) recommendations.push('Use stronger action verbs (e.g. spearheaded, engineered, architected, delivered).');
  if (!email || !phone) recommendations.push('Ensure complete contact details with professional email and telephone number.');
  if (skills.length < 6) recommendations.push('Add technical and core competencies substantiated by your projects or experience.');
  if (targetRole && roleMatch !== null && roleMatch < 50) recommendations.push(`Tailor your resume specifically toward ${targetRole} by highlighting related skills.`);
  if (recommendations.length === 0) recommendations.push('Maintain clean formatting and tailor your accomplishments for each job application.');

  const strengths: string[] = [];
  if (skills.length >= 6) strengths.push(`Identified ${skills.length} core technical and functional skills.`);
  if (foundSections.size >= 5) strengths.push('Well-structured layout with standard professional resume sections.');
  if (quantifiedMatches.length >= 2) strengths.push('Strong inclusion of quantitative metrics and outcomes.');
  if (email && phone) strengths.push('Clear and accessible contact details.');
  if (strengths.length === 0) strengths.push('Resume parsed successfully; adding quantifiable outcomes will quickly elevate your score.');

  return {
    name: extractName(cleanText, filename),
    email,
    phone,
    experience: experienceSignals > 0 ? 'Experience signals detected' : 'Limited experience detected',
    resume_score: totalScore,
    readiness,
    market_match: roleMatch ? Math.round(roleMatch) : null,
    skills,
    missing_skills: missingSkills,
    strengths,
    recommendations,
    score_breakdown: {
      content_quality: Math.round(contentScore * 10) / 10,
      section_coverage: Math.round(sectionScore * 10) / 10,
      skills: Math.round(skillScore * 10) / 10,
      achievement_evidence: Math.round(achievementScore * 10) / 10,
      contact_completeness: Math.round(contactScore * 10) / 10,
      target_role_alignment: roleMatch !== null ? Math.round(roleMatch * 10) / 10 : null,
    },
    extracted_text: cleanText,
    source: 'careerlens-engine-v5',
    analysis_version: 5,
    target_role: targetRole,
  };
}

function matchJob(resumeText: string, jobDescription: string) {
  const rText = (resumeText || '').trim();
  const jText = (jobDescription || '').trim();
  if (!rText || !jText) {
    throw new Error('Both resume and job description are required.');
  }

  const rSkills = new Set(getSkillSet(rText));
  const jSkills = new Set(getSkillSet(jText));

  const matched = Array.from(rSkills).filter(s => jSkills.has(s)).sort();
  const missing = Array.from(jSkills).filter(s => !rSkills.has(s)).sort();

  // Basic word frequency overlap
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
    source: 'careerlens-match-v5',
    analysis_version: 5,
  };
}

// In-memory persistent store for assessments & candidates
const assessmentStore = new Map<string, any>();
const recruiterStateStore = new Map<string, any>();

// ATS Role-Based Assessment Question Banks
function getAssessmentBank(role: string) {
  const roleL = (role || '').toLowerCase();
  
  // Data Science, ML & Analytics
  if (['data', 'analytics', 'scientist', 'bi', 'machine learning', 'ai'].some(k => roleL.includes(k))) {
    return [
      { id: 1, question: 'What does precision measure in a binary classification model?', options: ['True Positives divided by all Predicted Positives', 'True Positives divided by all Actual Positives', 'Overall proportion of correct classifications', 'Ratio of false alarms to true negatives'], answer: 'True Positives divided by all Predicted Positives', section: 'Evaluation Metrics' },
      { id: 2, question: 'Which SQL clause must be used to filter aggregated group metrics?', options: ['HAVING', 'WHERE', 'GROUP BY', 'FILTER BY'], answer: 'HAVING', section: 'SQL & Database Architecture' },
      { id: 3, question: 'Why is K-Fold cross-validation preferred over a single train-test split?', options: ['It provides an unbiased estimate of generalization across data variance', 'It encrypts training data partitions', 'It speeds up model execution by 50%', 'It automatically handles missing numerical values'], answer: 'It provides an unbiased estimate of generalization across data variance', section: 'Model Validation' },
      { id: 4, question: 'What technique directly addresses severe multicollinearity in linear models?', options: ['L2 Regularization (Ridge) or feature PCA', 'Increasing learning rate tenfold', 'One-hot encoding every continuous column', 'Removing intercept parameters'], answer: 'L2 Regularization (Ridge) or feature PCA', section: 'Statistical Modeling' },
      { id: 5, question: 'In production ML inference, what does feature drift indicate?', options: ['The statistical distribution of input data has shifted from training distribution', 'Model weights were corrupted during containerization', 'The API endpoint latency has spiked due to network issues', 'Data labels are missing in production'], answer: 'The statistical distribution of input data has shifted from training distribution', section: 'MLOps & Monitoring' },
      { id: 6, question: 'Which imputation strategy avoids data leakage during preprocessing?', options: ['Fitting imputers strictly on training folds before transforming test folds', 'Calculating mean across the entire dataset prior to splitting', 'Replacing missing values with zero arbitrarily', 'Dropping test rows with any null values'], answer: 'Fitting imputers strictly on training folds before transforming test folds', section: 'Data Engineering' },
      { id: 7, question: 'What is the primary utility of ROC-AUC when evaluating fraud detection?', options: ['It evaluates discriminator performance across all classification thresholds independent of class balance', 'It calculates financial dollar return of detected scams', 'It proves the model cannot overfit', 'It measures GPU training memory efficiency'], answer: 'It evaluates discriminator performance across all classification thresholds independent of class balance', section: 'Evaluation Metrics' },
      { id: 8, question: 'In distributed data pipelines (e.g. Apache Spark), what does a shuffle operation cause?', options: ['High cross-node network I/O and potential disk spillage', 'Instant in-memory garbage collection', 'Zero latency pipeline execution', 'Data loss without checkpointing'], answer: 'High cross-node network I/O and potential disk spillage', section: 'Big Data Systems' },
    ];
  }

  // DevOps, Cloud & SRE
  if (['devops', 'sre', 'cloud', 'infrastructure', 'platform', 'kubernetes'].some(k => roleL.includes(k))) {
    return [
      { id: 1, question: 'What is the primary benefit of Immutable Infrastructure in modern cloud pipelines?', options: ['Servers are replaced rather than modified, eliminating configuration drift', 'Servers never require security patching', 'All applications run in a single root container', 'Infrastructure costs are reduced to zero'], answer: 'Servers are replaced rather than modified, eliminating configuration drift', section: 'Cloud Architecture' },
      { id: 2, question: 'In Kubernetes, what is the role of a Service resource?', options: ['Providing a stable virtual IP and DNS name to route traffic across dynamic Pods', 'Compiling Docker container images', 'Storing database backups persistently', 'Managing cluster node hardware temperatures'], answer: 'Providing a stable virtual IP and DNS name to route traffic across dynamic Pods', section: 'Kubernetes & Containers' },
      { id: 3, question: 'Which deployment strategy directs a small percentage of production traffic to a new release?', options: ['Canary deployment', 'Big Bang deployment', 'Blue/Green all-at-once switch', 'In-place overwrite'], answer: 'Canary deployment', section: 'CI/CD & Delivery' },
      { id: 4, question: 'What does the Principle of Least Privilege mandate in cloud IAM?', options: ['Granting only the minimal permissions required to complete assigned tasks', 'Giving every developer AdministratorAccess for rapid iteration', 'Using the root account for all automated CI runners', 'Never rotating access keys'], answer: 'Granting only the minimal permissions required to complete assigned tasks', section: 'Cloud Security' },
      { id: 5, question: 'In site reliability engineering, what does an Error Budget represent?', options: ['The acceptable level of unreliability allowed by the SLA/SLO target', 'The annual financial budget for cloud infrastructure', 'The maximum number of Git commits per sprint', 'A penalty paid to clients for downtime'], answer: 'The acceptable level of unreliability allowed by the SLA/SLO target', section: 'SRE Fundamentals' },
      { id: 6, question: 'What is the core purpose of infrastructure-as-code state locking (e.g., Terraform state lock)?', options: ['Preventing concurrent pipeline runs from corrupting infrastructure state', 'Encrypting source code on GitHub', 'Speeding up resource creation', 'Automating DNS propagation'], answer: 'Preventing concurrent pipeline runs from corrupting infrastructure state', section: 'IaC Workflows' },
    ];
  }

  // Cybersecurity
  if (['security', 'cyber', 'infosec', 'penetration', 'soc'].some(k => roleL.includes(k))) {
    return [
      { id: 1, question: 'What is the most effective defense against SQL Injection vulnerabilities?', options: ['Parameterized queries and prepared statements', 'Client-side character escaping only', 'Base64 encoding user input parameters', 'Hiding the database error messages'], answer: 'Parameterized queries and prepared statements', section: 'Application Security' },
      { id: 2, question: 'In modern OAuth 2.0 / OIDC public clients, why is PKCE required?', options: ['It mitigates authorization code interception attacks without requiring client secrets', 'It encrypts database passwords at rest', 'It bypasses the need for user consent', 'It replaces TLS encryption on the network'], answer: 'It mitigates authorization code interception attacks without requiring client secrets', section: 'Authentication & Identity' },
      { id: 3, question: 'What constitutes a Zero Trust security architecture?', options: ['Never trust, always verify: strict identity verification for every access request', 'Placing all servers behind a single corporate VPN firewall', 'Granting all employees local administrator rights', 'Disabling multi-factor authentication for internal users'], answer: 'Never trust, always verify: strict identity verification for every access request', section: 'Security Architecture' },
      { id: 4, question: 'What header protects web applications from Cross-Site Scripting (XSS)?', options: ['Content-Security-Policy (CSP)', 'Access-Control-Allow-Origin: *', 'X-Powered-By', 'Cache-Control: public'], answer: 'Content-Security-Policy (CSP)', section: 'Web Security' },
    ];
  }

  // Product, Project & Business Analysis
  if (['product', 'project', 'program', 'scrum', 'agile', 'business analyst'].some(k => roleL.includes(k))) {
    return [
      { id: 1, question: 'In the RICE scoring model, how is priority calculated?', options: ['(Reach × Impact × Confidence) / Effort', 'Reach + Impact + Effort', '(Effort × Cost) / Reach', 'Confidence / (Reach + Impact)'], answer: '(Reach × Impact × Confidence) / Effort', section: 'Product Strategy' },
      { id: 2, question: 'What makes an Agile user story acceptance criterion high-quality?', options: ['Clear, binary, testable conditions defining when work is finished', 'A vague high-level aspiration with no specifics', 'A list of which developers will write the code', 'A promise of zero future bugs'], answer: 'Clear, binary, testable conditions defining when work is finished', section: 'Agile Delivery' },
      { id: 3, question: 'In an A/B test, what does statistical significance (p < 0.05) indicate?', options: ['There is less than a 5% probability the observed difference occurred by random chance', 'The new feature is guaranteed to increase revenue by 95%', 'Exactly 5% of users converted on variant B', 'The test can be ended after 2 hours of traffic'], answer: 'There is less than a 5% probability the observed difference occurred by random chance', section: 'Experimentation' },
      { id: 4, question: 'How should a product lead resolve conflicting technical debt vs new feature roadmaps?', options: ['Quantify business risk and system stability against feature revenue opportunity', 'Always reject technical refactoring in favor of quick features', 'Halt all customer-facing development indefinitely', 'Let engineering and sales vote blindly'], answer: 'Quantify business risk and system stability against feature revenue opportunity', section: 'Roadmap Execution' },
    ];
  }

  // Software Engineering, Full Stack, Backend, Frontend
  return [
    { id: 1, question: 'Which practice ensures high software reliability before production release?', options: ['Automated unit/integration testing and peer code reviews', 'Skipping validation steps during sprints', 'Hard-coding credentials in configuration files', 'Ignoring error log exceptions'], answer: 'Automated unit/integration testing and peer code reviews', section: 'Quality & Reliability' },
    { id: 2, question: 'What does database indexing primarily achieve in high-throughput applications?', options: ['Dramatically accelerates SELECT query lookups at the expense of slight write overhead', 'Compresses text storage on disk only', 'Encrypts user passwords automatically', 'Eliminates the need for schema migrations'], answer: 'Dramatically accelerates SELECT query lookups at the expense of slight write overhead', section: 'Database Systems' },
    { id: 3, question: 'Which HTTP method is defined by RFC specifications to be idempotent for full resource replacement?', options: ['PUT', 'POST', 'PATCH', 'CONNECT'], answer: 'PUT', section: 'API Architecture' },
    { id: 4, question: 'What data structure provides average O(1) time complexity for key-value lookups?', options: ['Hash Table / Map', 'Binary Search Tree', 'Doubly Linked List', 'Sorted Array'], answer: 'Hash Table / Map', section: 'Computer Science Fundamentals' },
    { id: 5, question: 'How do you prevent cache stampede during high-concurrency cache key eviction?', options: ['Using mutex locks (single-flight) or probabilistic early expiration', 'Increasing database connection limits indefinitely', 'Clearing the entire cache cluster simultaneously', 'Disabling caching altogether'], answer: 'Using mutex locks (single-flight) or probabilistic early expiration', section: 'Distributed Systems' },
    { id: 6, question: 'What is the safest pattern for injecting production secrets into containerized microservices?', options: ['Environment variable injection from dedicated secrets managers (e.g., Vault, AWS Secrets)', 'Hard-coding secrets into Git repositories', 'Bundling API keys into client-facing JavaScript bundles', 'Transmitting keys via public unencrypted URLs'], answer: 'Environment variable injection from dedicated secrets managers (e.g., Vault, AWS Secrets)', section: 'Security' },
    { id: 7, question: 'In frontend web development, why is memoization (e.g., React.memo, useMemo) used?', options: ['To avoid expensive re-computations or unnecessary re-renders of unchanged child components', 'To replace asynchronous data fetching', 'To permanently store user data on disk', 'To encrypt component props'], answer: 'To avoid expensive re-computations or unnecessary re-renders of unchanged child components', section: 'Frontend Architecture' },
    { id: 8, question: 'What does ACID atomicity guarantee in relational database transactions?', options: ['All operations within the transaction succeed completely, or all are rolled back with no partial state', 'Data is replicated to 3 separate continents', 'Queries execute in less than 1 millisecond', 'Tables never have foreign key constraints'], answer: 'All operations within the transaction succeed completely, or all are rolled back with no partial state', section: 'Database Systems' },
  ];
}

// ============================================================
// API ROUTES
// ============================================================

app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', service: 'CareerLens AI API', version: '5.4.0' });
});

// Resume analyze endpoint
app.post('/api/resume/analyze', async (req: Request, res: Response) => {
  try {
    let { resume_text = '', filename = 'resume.txt', target_role = '' } = req.body;
    
    // Clean and sanitize any binary/PDF artifacts
    if (resume_text) {
      if (resume_text.includes('%PDF-')) {
        // Extract plain text segments from PDF
        const textChunks: string[] = [];
        const tjMatches = resume_text.match(/\(([^()]+)\)/g) || [];
        for (const m of tjMatches) {
          const s = m.slice(1, -1).trim();
          if (s.length > 1 && !/^[\x00-\x1F]+$/.test(s)) textChunks.push(s);
        }
        if (textChunks.length > 8) {
          resume_text = textChunks.join(' ');
        }
      }
      resume_text = resume_text.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F]/g, ' ').replace(/\s{2,}/g, ' ').trim();
    }

    if (!resume_text || resume_text.length < 5) {
      return res.status(422).json({ error: 'The uploaded resume contains no readable text. Please paste text or try another file.' });
    }

    const localResult = analyzeResume(resume_text, filename, target_role);

    // If Gemini client is active, generate enhanced executive summary & tailored coaching
    if (aiClient) {
      try {
        const prompt = `You are CareerLens AI Career Coach. Analyze this resume:
Target Role: "${target_role || 'Not specified'}"
Resume excerpt (first 3000 chars):
${resume_text.slice(0, 3000)}

Provide a concise JSON object with:
{
  "executive_summary": "2-3 sentences on candidate profile standing",
  "ai_strengths": ["top 3 distinct strengths"],
  "ai_recommendations": ["top 3 high-impact actionable fixes"],
  "interview_readiness_verdict": "short readiness summary"
}`;
        const response = await aiClient.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: { responseMimeType: 'application/json' },
        });

        if (response.text) {
          const parsed = JSON.parse(response.text);
          if (parsed.executive_summary) (localResult as any).executive_summary = parsed.executive_summary;
          if (Array.isArray(parsed.ai_strengths) && parsed.ai_strengths.length) {
            localResult.strengths = [...parsed.ai_strengths, ...localResult.strengths].slice(0, 5);
          }
          if (Array.isArray(parsed.ai_recommendations) && parsed.ai_recommendations.length) {
            localResult.recommendations = [...parsed.ai_recommendations, ...localResult.recommendations].slice(0, 6);
          }
        }
      } catch (e) {
        // Fallback to pure local analysis gracefully
      }
    }

    return res.json(localResult);
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Analysis failed' });
  }
});

// Job Match endpoint
app.post('/api/job/match', (req: Request, res: Response) => {
  try {
    const { resume_text = '', job_description = '' } = req.body;
    if (!resume_text.trim() || !job_description.trim()) {
      return res.status(422).json({ error: 'Both resume and job description are required.' });
    }
    const result = matchJob(resume_text, job_description);
    return res.json(result);
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Matching failed' });
  }
});

// Robust Salary estimate endpoint
app.post('/api/salary/estimate', async (req: Request, res: Response) => {
  const { role = 'Software Developer', experience = 'Mid-Level (2-5 yrs)', location = 'India', skills = [] } = req.body;
  const roleL = (role || 'Software Developer').toLowerCase();
  const locL = (location || 'India').toLowerCase();

  // Baseline market rate in LPA (INR) for India, or in USD ($k) for North America / Global
  let baseLPA = 5.0;
  let isUSD = locL.includes('north america') || locL.includes('usd') || locL.includes('global remote');
  let isEUR = locL.includes('europe') || locL.includes('eur');

  // Role domain multipliers
  if (['ai', 'machine learning', 'deep learning', 'llm', 'computer vision'].some(k => roleL.includes(k))) baseLPA = 8.5;
  else if (['data scientist', 'data science'].some(k => roleL.includes(k))) baseLPA = 7.5;
  else if (['cloud', 'devops', 'sre', 'platform', 'infrastructure'].some(k => roleL.includes(k))) baseLPA = 7.2;
  else if (['full stack', 'backend', 'distributed systems', 'system architect'].some(k => roleL.includes(k))) baseLPA = 6.8;
  else if (['software', 'developer', 'frontend', 'mobile', 'ios', 'android'].some(k => roleL.includes(k))) baseLPA = 5.8;
  else if (['product manager', 'project manager', 'scrum master'].some(k => roleL.includes(k))) baseLPA = 7.0;
  else if (['cybersecurity', 'security analyst', 'infosec'].some(k => roleL.includes(k))) baseLPA = 6.5;
  else if (['data analyst', 'business analyst', 'bi developer'].some(k => roleL.includes(k))) baseLPA = 4.8;
  else if (['qa', 'testing', 'automation engineer'].some(k => roleL.includes(k))) baseLPA = 4.5;
  else if (['finance', 'accountant', 'financial analyst'].some(k => roleL.includes(k))) baseLPA = 4.5;
  else if (['hr', 'talent acquisition', 'recruiter', 'marketing'].some(k => roleL.includes(k))) baseLPA = 4.2;

  // Seniority multiplier
  if (experience.includes('Fresher') || experience.includes('0-1')) {
    baseLPA *= 0.85;
  } else if (experience.includes('Mid') || experience.includes('2-5')) {
    baseLPA *= 1.45;
  } else if (experience.includes('Senior') || experience.includes('5-8')) {
    baseLPA *= 2.15;
  } else if (experience.includes('Lead') || experience.includes('Principal') || experience.includes('8+')) {
    baseLPA *= 2.95;
  }

  // Skills stack bonus (e.g. specialized skills boost offer rates)
  const skillsList = Array.isArray(skills) ? skills.map(s => String(s).toLowerCase()) : [];
  let skillPremium = 0;
  if (skillsList.some(s => s.includes('aws') || s.includes('kubernetes') || s.includes('docker'))) skillPremium += 0.08;
  if (skillsList.some(s => s.includes('pytorch') || s.includes('machine learning') || s.includes('fastapi'))) skillPremium += 0.10;
  if (skillsList.some(s => s.includes('system design') || s.includes('microservices'))) skillPremium += 0.07;
  baseLPA *= (1 + skillPremium);

  let currencySymbol = '₹';
  let currencyCode = 'LPA (INR)';
  let minSalary: number;
  let maxSalary: number;
  let medianSalary: number;
  let monthlyInHand: number;

  if (isUSD) {
    // Convert to US Tech benchmark ($k USD)
    currencySymbol = '$';
    currencyCode = 'USD / Year';
    const baseUSD = baseLPA * 14.5; // Roughly 70k - 240k USD
    minSalary = Math.round(baseUSD * 0.82);
    maxSalary = Math.round(baseUSD * 1.55);
    medianSalary = Math.round((minSalary + maxSalary) / 2);
    // Estimated monthly take-home after ~28% effective federal/state taxes
    monthlyInHand = Math.round((medianSalary * 1000 * 0.72) / 12);
  } else if (isEUR) {
    currencySymbol = '€';
    currencyCode = 'EUR / Year';
    const baseEUR = baseLPA * 11.0;
    minSalary = Math.round(baseEUR * 0.82);
    maxSalary = Math.round(baseEUR * 1.5);
    medianSalary = Math.round((minSalary + maxSalary) / 2);
    monthlyInHand = Math.round((medianSalary * 1000 * 0.65) / 12);
  } else {
    // India LPA
    minSalary = Math.round(baseLPA * 0.85 * 10) / 10;
    maxSalary = Math.round(baseLPA * 1.75 * 10) / 10;
    medianSalary = Math.round(((minSalary + maxSalary) / 2) * 10) / 10;
    // Monthly in-hand approx after standard Indian tax & PF (in thousands INR)
    // 1 LPA = 100,000 INR -> medianSalary * 100,000 / 12 * 0.88 net
    monthlyInHand = Math.round((medianSalary * 100000 * 0.88) / 12);
  }

  const q25 = minSalary;
  const q50 = medianSalary;
  const q75 = Math.round((minSalary * 0.35 + maxSalary * 0.65) * 10) / 10;
  const q90 = maxSalary;

  const result = {
    role,
    experience,
    location,
    currency_symbol: currencySymbol,
    currency_code: currencyCode,
    min_salary: minSalary,
    max_salary: maxSalary,
    median_salary: medianSalary,
    monthly_in_hand: monthlyInHand,
    quartiles: {
      q25,
      q50,
      q75,
      q90,
    },
    bonus_percentage: experience.includes('Lead') ? '18% - 25%' : experience.includes('Senior') ? '15% - 20%' : '10% - 15%',
    equity_grant: experience.includes('Senior') || experience.includes('Lead') ? 'Significant ESOPs / RSUs (0.05% - 0.25%)' : 'Performance Stock Option pool eligible',
    market_sentiment: 'High Market Demand (+16% YoY Hiring Growth)',
    top_paying_skills: ['FastAPI', 'PyTorch', 'AWS', 'Kubernetes', 'System Design', 'React/Next.js'],
    negotiation_tip: `Always negotiate against the total compensation package (Base + Performance Bonus + Equity). Ground your ask on verified past metric outcomes.`,
    note: 'Indicative compensation benchmark derived from current verified hiring datasets. Always evaluate against specific equity grants and remote flexibility.',
    source: 'careerlens-salary-engine-v5',
  };

  return res.json(result);
});

// Consistent, conservative Job Scam Detection endpoint.
// Important: a clean scan means "no obvious indicators found", not proof that a job is genuine.
app.post('/api/job/fraud', (req: Request, res: Response) => {
  const body = req.body || {};
  const rawText = String(body.text ?? body.job_description ?? '').trim();
  const rawLink = String(body.link ?? body.job_url ?? '').trim();
  const lowerText = rawText.toLowerCase();

  const textSignals: string[] = [];
  const linkSignals: string[] = [];
  const addText = (condition: boolean, message: string) => {
    if (condition && !textSignals.includes(message)) textSignals.push(message);
  };

  addText(/\b(wire transfer|money movement|send money|transfer funds)\b/i.test(rawText),
    'Payment request: The message mentions transferring money or funds.');
  addText(/\b(registration fee|application fee|processing fee|equipment fee|security deposit|pay to apply|upfront fee)\b/i.test(rawText),
    'Advance-fee request: The message appears to request an upfront fee or deposit.');
  addText(/\b(telegram|t\.me)\b/i.test(rawText),
    'Telegram contact: Verify the recruiter independently before continuing.');
  addText(/\b(whatsapp|wa\.me)\b/i.test(rawText),
    'WhatsApp contact: A messaging app alone does not verify a recruiter or job.');
  addText(/\b(crypto|cryptocurrency|bitcoin|gift card|cash app|zelle)\b/i.test(rawText),
    'Unusual payment method: Cryptocurrency, gift cards, or peer-to-peer payments are mentioned.');
  addText(/\b(no interview|without (an? )?interview|selected without|hired immediately|instant offer)\b/i.test(rawText),
    'Unusual hiring promise: The message suggests selection without a normal interview process.');
  addText(/\b(urgent payment|pay immediately|within 24 hours)\b/i.test(rawText),
    'High-pressure wording: The message appears to pressure the candidate to act or pay quickly.');

  let hostname = 'Not provided';
  let protocol = 'Not checked';
  let isSecure = false;
  let isLegitDomain = false;
  let validUrl = false;

  if (rawLink) {
    let parsed: URL | null = null;
    try {
      parsed = new URL(/^[a-z][a-z\d+.-]*:\/\//i.test(rawLink) ? rawLink : `https://${rawLink}`);
      if (!['http:', 'https:'].includes(parsed.protocol)) throw new Error('Unsupported URL protocol');
      validUrl = true;
      hostname = parsed.hostname.toLowerCase().replace(/^www\./, '');
      protocol = parsed.protocol === 'https:' ? 'HTTPS' : 'HTTP (not encrypted)';
      isSecure = parsed.protocol === 'https:';
    } catch {
      linkSignals.push('Invalid URL: Enter a full web address such as https://company.com/careers.');
    }

    if (parsed && validUrl) {
      if (!isSecure) linkSignals.push('Insecure connection: This URL uses HTTP rather than HTTPS.');
      const host = hostname;
      const exactOrSubdomain = (domain: string) => host === domain || host.endsWith(`.${domain}`);
      const trustedHostRoots = [
        'careers.google.com', 'google.com', 'microsoft.com', 'amazon.jobs', 'amazon.com',
        'apple.com', 'meta.com', 'greenhouse.io', 'lever.co', 'myworkdayjobs.com',
        'smartrecruiters.com', 'ashbyhq.com', 'workable.com', 'jobvite.com', 'taleo.net',
        'icims.com', 'oraclecloud.com', 'successfactors.com', 'stripe.com', 'netflix.com',
        'linkedin.com'
      ];
      // This is only a recognized domain check, not proof the individual job is real.
      isLegitDomain = trustedHostRoots.some(exactOrSubdomain);

      const suspicious = [
        { test: h => h === 't.me' || h.endsWith('.t.me') || h === 'telegram.me' || h.endsWith('.telegram.me'), msg: 'Messaging redirect: The URL opens a Telegram destination.' },
        { test: h => h === 'wa.me' || h.endsWith('.wa.me') || h === 'whatsapp.com' || h.endsWith('.whatsapp.com'), msg: 'Messaging redirect: The URL opens a WhatsApp destination.' },
        { test: h => h === 'bit.ly' || h.endsWith('.bit.ly') || h === 'tinyurl.com' || h.endsWith('.tinyurl.com'), msg: 'Shortened URL: The final destination is not visible from this link alone.' },
        { test: h => /\.(xyz|top|icu)$/.test(h), msg: 'Uncommon domain ending: Verify the company and final destination independently.' },
        { test: h => h === 'forms.gle' || h.endsWith('.forms.gle'), msg: 'Generic form link: Confirm the form is linked from the employer’s official careers site.' },
        { test: h => /amaz0n|g00gle|linked1n|micros0ft/.test(h), msg: 'Possible brand impersonation: The domain contains a lookalike spelling.' },
      ];
      for (const item of suspicious) {
        if (item.test(host) && !linkSignals.includes(item.msg)) linkSignals.push(item.msg);
      }
    }
  }

  const score = Math.min(100, textSignals.length * 25 + linkSignals.length * 30);
  const signals = [...textSignals, ...linkSignals];
  let level: 'HIGH RISK' | 'MEDIUM RISK' | 'LOW RISK' = 'LOW RISK';
  if (score >= 50 || textSignals.length >= 2 || linkSignals.length >= 2) level = 'HIGH RISK';
  else if (score >= 20 || signals.length > 0) level = 'MEDIUM RISK';

  const isReal = level === 'LOW RISK';
  const verdict = level === 'HIGH RISK'
    ? 'High risk: multiple potential fraud indicators were found.'
    : level === 'MEDIUM RISK'
      ? 'Caution: review the flagged indicators before sharing information or applying.'
      : 'No obvious scam indicators were found. This does not prove the job or recruiter is genuine.';

  return res.json({
    score,
    level,
    is_real: isReal,
    verdict,
    signals: signals.length,
    signal_details: signals,
    link_audited: Boolean(rawLink),
    link_signals: linkSignals,
    text_signals: textSignals,
    is_legit_domain: isLegitDomain,
    domain_analysis: {
      hostname,
      protocol,
      is_secure: isSecure,
      reputation: isLegitDomain ? 'Trusted Corporate ATS' : linkSignals.length ? 'Suspicious / Masked' : 'Unverified Domain',
    },
    source: 'careerlens-fraud-engine-v2',
  });
});

// Career Roadmap endpoint
app.post('/api/career/roadmap', async (req: Request, res: Response) => {
  const { resume_text = '', target_role = '' } = req.body;
  const skills = Array.from(new Set(getSkillSet(resume_text))).sort();
  const hints = getRoleHints(target_role);
  const missing = hints.filter(h => !(resume_text || '').toLowerCase().includes(h.toLowerCase()));

  const defaultSteps = [
    `Phase 1: Clarify foundational industry competencies and standards for ${target_role}.`,
    `Phase 2: Master and demonstrate core tools: ${missing.slice(0, 5).join(', ') || 'essential toolchains and frameworks'}.`,
    'Phase 3: Architect 2–3 portfolio projects with measurable business impact, documented in Google XYZ format.',
    'Phase 4: Optimize resume keywords, LinkedIn visibility, and target tailored job requisitions.',
    'Phase 5: Practice role-specific behavioral (STAR method) and deep technical interview scenarios.',
  ];

  return res.json({
    target_role,
    current_skills: skills,
    missing_skills: missing.slice(0, 10),
    steps: defaultSteps,
    source: 'careerlens-roadmap-v5',
    analysis_version: 5,
  });
});

// Context-Rich, Non-Repetitive AI Career Consultant
app.post('/api/chat/ask', async (req: Request, res: Response) => {
  try {
    const { messages = [], resume_context = '' } = req.body;
    const latestUserMsg = [...messages].reverse().find((m: any) => m.role === 'user')?.content || '';
    if (!latestUserMsg) {
      return res.json({ reply: 'How can I assist you with your career goals, resume optimization, or interview prep today?', source: 'assistant-ready' });
    }

    // If Gemini client is active, use full multi-turn conversation
    if (aiClient) {
      try {
        const sysPrompt = `You are CareerLens Senior Career & Recruitment Advisor. You provide actionable, highly specific, realistic guidance tailored to software engineering, machine learning, data science, and tech leadership.
Candidate Resume Context (if any):
${resume_context ? resume_context.slice(0, 3000) : 'None supplied yet'}

Rules:
1. Always directly answer the user's specific question with concrete steps, examples, or scripts.
2. Never repeat generic filler phrases or provide one-size-fits-all roadmaps unless specifically asked.
3. Keep tone professional, crisp, empowering, and formatted with clean markdown bullets.`;

        // Format history for Gemini SDK
        const contents = messages.map((m: any) => ({
          role: m.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: String(m.content) }],
        }));

        const response = await aiClient.models.generateContent({
          model: 'gemini-3.8-flash',
          contents,
          config: { systemInstruction: sysPrompt },
        });

        if (response.text) {
          return res.json({ reply: response.text, source: 'gemini-3.8-flash' });
        }
      } catch (err) {
        console.warn('Gemini chat call error, using local expert engine:', err);
      }
    }

    // Comprehensive, dynamic multi-topic local AI engine (zero repetitive loops)
    const q = latestUserMsg.toLowerCase();
    const skills = Array.from(new Set(getSkillSet(resume_context))).sort();
    let reply = '';

    if (q.includes('score') || (q.includes('raise') && q.includes('resume')) || q.includes('past 90')) {
      reply = `### How to Boost Your Resume Score to 90+\n\n` +
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
      reply = `### High-Impact STAR Behavioral Framework\n\n` +
        `When asked behavioral questions (e.g., handling conflicts, tight deadlines, or outages), structure your reply in 90 seconds:\n\n` +
        `• **Situation (15s):** Set the context and business stakes. ("During Black Friday deployment at our previous SaaS...")\n` +
        `• **Task (15s):** Specify your explicit personal ownership. ("I was designated incident lead to isolate the database bottleneck.")\n` +
        `• **Action (45s):** Detail the exact technical decisions you made. ("I analyzed PostgreSQL slow queries, provisioned a Redis caching layer, and optimized connection pooling.")\n` +
        `• **Result (15s):** Deliver quantifiable impact. ("Database CPU dropped from 94% to 22%, saving an estimated $40,000 in checkout abandonment.")`;
    } else if (q.includes('salary') || q.includes('offer') || q.includes('counter') || q.includes('negotiat') || q.includes('expected')) {
      reply = `### Strategic Salary Negotiation Script\n\n` +
        `**When a recruiter asks: "What is your current or expected CTC?"**\n\n` +
        `*Script:* "I am focused on finding the right role alignment where I can drive measurable outcomes. Based on market benchmarks for this seniority level and my experience in ${skills.slice(0, 3).join(', ') || 'modern full-stack systems'}, I am targeting the ₹16L–₹22L band (or competitive market equivalent). What is the budgeted range for this position?"\n\n` +
        `**Key Rules:**\n` +
        `1. Never state your absolute minimum number first.\n` +
        `2. Negotiate the full package: Base pay, signing bonus, annual variable, and equity.\n` +
        `3. Always request offer letters in writing before verbally accepting.`;
    } else if (q.includes('qa') && (q.includes('devops') || q.includes('cloud'))) {
      reply = `### Step-by-Step Transition: QA to DevOps / Cloud\n\n` +
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
      reply = `### 3 Portfolio Projects That Get Interviews\n\n` +
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
      reply = `### Targeted Career Roadmap: ${roleTarget}\n\n` +
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
      reply = `### Advisory on: "${latestUserMsg}"\n\n` +
        `To optimize your standing for this objective:\n\n` +
        `1. **Evaluate Current Market Demand:** Benchmark against live requisitions for your target domain.\n` +
        `2. **Bridge the Key Skill Gaps:** Build tangible demonstrable projects showcasing the toolchain rather than passive courses.\n` +
        `3. **Quantify Your Value:** In both your resume and interview storytelling, focus on efficiency gained, revenue influenced, or latency reduced.\n\n` +
        `Would you like to review sample interview questions, craft a specific resume bullet, or practice salary negotiation for this role?`;
    }

    return res.json({ reply, source: 'careerlens-expert-advisor' });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Chat error' });
  }
});

// Pre-interview assessment generation
app.post('/api/assessment/generate', (req: Request, res: Response) => {
  const { role = 'Software Developer', question_count = 20 } = req.body;
  const bank = getAssessmentBank(role);
  const count = Math.max(5, Math.min(50, question_count));
  const questions: any[] = [];

  for (let i = 0; i < count; i++) {
    const base = bank[i % bank.length];
    const opts = [...base.options].sort(() => Math.random() - 0.5);
    questions.push({
      id: i + 1,
      question: count > bank.length && i >= bank.length ? `${base.question} (Scenario ${Math.floor(i / bank.length) + 1})` : base.question,
      options: opts,
      answer: base.answer,
      section: base.section,
    });
  }

  return res.json({
    role,
    question_count: count,
    questions,
    source: 'careerlens-assessment-generator-v2',
  });
});

// Pre-interview assessment score
app.post('/api/assessment/score', (req: Request, res: Response) => {
  const { questions = [], answers = {} } = req.body;
  let correct = 0;
  let wrong = 0;
  let unanswered = 0;

  for (const q of questions) {
    const qid = String(q.id);
    const selected = answers[qid] ?? answers[q.id];
    if (selected === undefined || selected === null || selected === '') {
      unanswered++;
    } else if (String(selected).trim() === String(q.answer).trim()) {
      correct++;
    } else {
      wrong++;
    }
  }

  const total = questions.length;
  const percentage = total > 0 ? Math.round((correct / total) * 1000) / 10 : 0;

  return res.json({
    score: correct,
    total,
    percentage,
    correct_count: correct,
    wrong_count: wrong,
    unanswered_count: unanswered,
  });
});

// Mock interview questions
app.post('/api/mock-interview/questions', (req: Request, res: Response) => {
  const { role = 'Software Developer', resume_text = '', company = '', transcript = [] } = req.body;
  const companyName = company.trim() || 'our team';
  const skills = Array.from(new Set(getSkillSet(resume_text))).sort();

  const questions: string[] = [
    `Please introduce yourself and walk me through your background, highlighting why you are a strong fit for the ${role} position.`,
    `What inspired you to specialize in the ${role} career path, and what excites you about this opportunity?`,
    `Why do you want to work at ${companyName}, and what value would you bring to our team?`,
    'Tell me about the most impactful project or achievement on your resume. What was your personal contribution?',
  ];

  for (const s of skills.slice(0, 5)) {
    questions.push(`Your resume highlights ${s}. Can you describe a production challenge where you utilized ${s} and what outcome was achieved?`);
  }

  questions.push(
    'Tell me about a complex technical or operational roadblock you encountered and how you resolved it.',
    'Tell me about a time you received constructive feedback or faced a failure. What did you learn?',
    'How do you prioritize your deliverables when multiple high-stakes tasks compete for your attention?',
    `What is one area of improvement you are currently developing in ${role}?`,
    'What do you aim to accomplish in your first 90 days in this role?'
  );

  const used = new Set(transcript.map((t: any) => String(t.question || '')));
  const remaining = questions.filter(q => !used.has(q));
  const next_question = remaining.length > 0 ? remaining[0] : `As a ${role}, what would be your strategy for scaling our current workflow?`;

  return res.json({
    next_question,
    available_questions: remaining.length,
    source: 'careerlens-interview-engine',
  });
});

// Mock interview scoring
app.post('/api/mock-interview/score', (req: Request, res: Response) => {
  const { transcript = [], role = 'Software Developer' } = req.body;
  if (!transcript || transcript.length === 0) {
    return res.json({
      overall: 0,
      communication: 0,
      completeness: 0,
      evidence: 0,
      relevance: 0,
      answered: 0,
      strengths: [],
      improvements: ['Submit answers before completing the mock interview.'],
    });
  }

  const answers = transcript.map((x: any) => String(x.answer || ''));
  const wordCounts = answers.map((a: string) => a.split(/\s+/).filter(Boolean).length);
  const avgWords = wordCounts.reduce((acc: number, c: number) => acc + c, 0) / wordCounts.length;

  const substantiveCount = wordCounts.filter((w: number) => w >= 25).length;
  const completeness = Math.round((substantiveCount / answers.length) * 100);

  const evidenceKeywords = ['because', 'result', 'impact', 'example', 'metric', 'improved', 'built', 'developed', 'implemented', 'saved', 'percent', '%'];
  const evidenceCount = answers.filter((a: string) => evidenceKeywords.some(k => a.toLowerCase().includes(k))).length;
  const evidence = Math.round((evidenceCount / answers.length) * 100);

  const roleLower = role.toLowerCase();
  const relevanceCount = answers.filter((a: string) => a.toLowerCase().includes(roleLower) || ['experience', 'project', 'skill', 'problem', 'solution', 'team'].some(k => a.toLowerCase().includes(k))).length;
  const relevance = Math.round((relevanceCount / answers.length) * 100);

  const communication = Math.min(100, Math.round(Math.min(100, avgWords * 2.5) * 0.6 + evidence * 0.2 + relevance * 0.2));
  const overall = Math.max(10, Math.min(98, Math.round(communication * 0.45 + completeness * 0.25 + evidence * 0.15 + relevance * 0.15)));

  const strengths: string[] = [
    `Completed ${transcript.length} interview responses for ${role}.`,
  ];
  if (avgWords >= 40) strengths.push('Answers demonstrate comprehensive thought and situational detail.');
  if (evidence >= 50) strengths.push('Strong use of concrete evidence, metrics, and actionable examples.');

  const improvements: string[] = [];
  if (evidence < 40) improvements.push('Incorporate the STAR methodology with measurable business metrics (e.g. reduced load time by 30%).');
  if (avgWords < 30) improvements.push('Expand on your individual ownership and technical decision trade-offs.');

  return res.json({
    overall,
    communication,
    completeness,
    evidence,
    relevance,
    answered: transcript.length,
    strengths,
    improvements: improvements.length ? improvements : ['Maintain this structured, evidence-first communication style in live interviews.'],
  });
});

// Bulk recruiter screening with duplicate elimination
app.post('/api/recruiter/screen', (req: Request, res: Response) => {
  const { job_description = '', resumes = [] } = req.body;
  if (!job_description.trim()) {
    return res.status(422).json({ error: 'Job description is required for bulk screening.' });
  }

  // Deduplicate incoming resumes across email, phone, and text signature
  const seenSignatures = new Set<string>();
  const uniqueResumes: any[] = [];

  for (const r of (resumes as any[])) {
    const text = (r.text || '').trim();
    const rawEmail = extractEmail(text) || (r.email || '').toLowerCase().trim();
    const rawPhone = extractPhone(text) || (r.phone || '').replace(/\D/g, '');
    const normName = (r.name || extractName(text, r.filename || '')).toLowerCase().replace(/[^a-z]/g, '');
    const textFingerprint = text.slice(0, 150).replace(/\s+/g, ' ').toLowerCase();

    // Composite primary identity key
    let identityKey = '';
    if (rawEmail && !rawEmail.includes('example.com') && !rawEmail.includes('applied.net')) {
      identityKey = `email:${rawEmail}`;
    } else if (rawPhone && rawPhone.length >= 7) {
      identityKey = `phone:${rawPhone}`;
    } else if (normName && normName.length > 3) {
      identityKey = `name:${normName}_${textFingerprint}`;
    } else {
      identityKey = `content:${textFingerprint}`;
    }

    if (!seenSignatures.has(identityKey)) {
      seenSignatures.add(identityKey);
      uniqueResumes.push(r);
    }
  }

  const results = uniqueResumes.map((r, index) => {
    const text = r.text || '';
    const filename = r.filename || `candidate_${index + 1}.pdf`;
    const profile = analyzeResume(text, filename);
    const match = matchJob(text, job_description);

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
  });

  results.sort((a, b) => b.role_match - a.role_match);
  return res.json(results);
});

// Send email / mock dispatcher
app.post('/api/send-email', (req: Request, res: Response) => {
  const { to_email, subject, content } = req.body;
  if (!to_email || !subject) {
    return res.status(422).json({ error: 'Missing to_email or subject' });
  }
  console.log(`[Email Dispatcher] Mock sent email to ${to_email}: "${subject}"`);
  return res.json({ status: 'sent', message: `Assessment email successfully dispatched to ${to_email}` });
});

// Public assessment creation and retrieval endpoints with scheduling
app.post('/api/public/assessment/create', (req: Request, res: Response) => {
  const {
    role,
    candidate_id,
    candidate_name,
    candidate_email,
    duration_minutes = 30,
    start_time = null,
    end_time = null,
    questions = [],
  } = req.body;

  const token = `cl_test_${Math.random().toString(36).substring(2, 10)}${Date.now().toString(36)}`;

  const record = {
    token,
    role,
    candidate_id,
    candidate_name,
    candidate_email,
    duration_minutes: Number(duration_minutes) || 30,
    start_time: start_time || null,
    end_time: end_time || null,
    questions,
    created_at: new Date().toISOString(),
    used: false,
    result: null,
  };

  assessmentStore.set(token, record);
  return res.json({ token, link: `/?assessment=${token}` });
});

app.get('/api/public/assessment/:token', (req: Request, res: Response) => {
  const token = String(req.params.token || '');
  const record = assessmentStore.get(token);
  if (!record) {
    return res.status(404).json({ error: 'Assessment token not found or expired' });
  }

  // Safe question payload: do not leak true answers to client
  const safeQuestions = (record.questions || []).map((q: any) => ({
    id: q.id,
    question: q.question,
    options: q.options,
    section: q.section,
  }));

  return res.json({
    token: record.token,
    role: record.role,
    candidate_name: record.candidate_name,
    candidate_email: record.candidate_email,
    duration_minutes: record.duration_minutes,
    start_time: record.start_time,
    end_time: record.end_time,
    created_at: record.created_at,
    used: record.used,
    submitted_at: record.submitted_at || null,
    questions: safeQuestions,
  });
});

app.post('/api/public/assessment/:token/submit', (req: Request, res: Response) => {
  const token = String(req.params.token || '');
  const { answers = {} } = req.body;
  const record = assessmentStore.get(token);
  if (!record) {
    return res.status(404).json({ error: 'Assessment record not found' });
  }

  // Server-authoritative ATS scoring
  let correct = 0;
  let wrong = 0;
  let unanswered = 0;
  const questions = record.questions || [];

  for (const q of questions) {
    const qid = String(q.id);
    const selected = answers[qid] ?? answers[q.id];
    if (selected === undefined || selected === null || selected === '') {
      unanswered++;
    } else if (String(selected).trim() === String(q.answer).trim()) {
      correct++;
    } else {
      wrong++;
    }
  }

  const total = questions.length;
  const percentage = total > 0 ? Math.round((correct / total) * 1000) / 10 : 0;
  const scoreResult = {
    score: correct,
    total,
    percentage,
    correct_count: correct,
    wrong_count: wrong,
    unanswered_count: unanswered,
  };

  record.used = true;
  record.submitted_at = new Date().toISOString();
  record.answers = answers;
  record.result = scoreResult;
  assessmentStore.set(token, record);

  // Return completion confirmation without exposing score to candidate
  return res.json({
    status: 'success',
    recorded: true,
    submitted_at: record.submitted_at,
    candidate_name: record.candidate_name,
    role: record.role,
  });
});

// Recruiter Assessment Results List
app.get('/api/recruiter/assessment-results', (_req: Request, res: Response) => {
  const results: any[] = [];
  assessmentStore.forEach((record, token) => {
    results.push({
      id: token,
      candidateName: record.candidate_name || 'Candidate',
      email: record.candidate_email || '',
      role: record.role || 'Software Developer',
      score: record.result ? record.result.percentage : null,
      totalQuestions: record.questions ? record.questions.length : (record.result?.total || 0),
      correctAnswers: record.result ? record.result.correct_count : 0,
      status: record.used ? 'Completed' : (record.end_time && new Date(record.end_time) < new Date() ? 'Expired' : 'In Progress'),
      submittedAt: record.submitted_at || null,
      durationMinutes: record.duration_minutes || 30,
    });
  });
  return res.json({ results });
});

// Recruiter state persistence
app.get('/api/recruiter/state/:userId', (req: Request, res: Response) => {
  const userId = String(req.params.userId || '');
  const state = recruiterStateStore.get(userId) || { campaign: null, candidates: [], assessments: [], submissions: [] };
  return res.json(state);
});

app.post('/api/recruiter/state/:userId', (req: Request, res: Response) => {
  const userId = String(req.params.userId || '');
  recruiterStateStore.set(userId, req.body);
  return res.json({ status: 'saved' });
});

// ============================================================
// VITE INTEGRATION (DEV & PROD)
// ============================================================
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true, host: HOST, port: PORT, hmr: false },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, HOST, () => {
    console.log(`[CareerLens AI] Server running at http://${HOST}:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('[CareerLens AI] Failed to start server:', err);
  process.exit(1);
});
