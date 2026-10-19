import { ResumeAnalysis, JobMatchResult, AssessmentQuestion, AssessmentResult, InterviewQuestionItem, InterviewScore } from '../types';

export const SKILLS: string[] = [
  'python', 'java', 'javascript', 'typescript', 'react', 'node.js', 'fastapi',
  'django', 'flask', 'sql', 'postgresql', 'mysql', 'mongodb', 'docker',
  'kubernetes', 'aws', 'azure', 'gcp', 'git', 'linux', 'machine learning',
  'deep learning', 'pandas', 'numpy', 'scikit-learn', 'tensorflow', 'pytorch',
  'rest api', 'graphql', 'redis', 'kafka', 'system design', 'html', 'css',
  'figma', 'excel', 'power bi', 'tableau', 'cybersecurity', 'testing', 'selenium',
  'communication', 'leadership', 'problem solving', 'data analysis', 'statistics',
  'ci/cd', 'devops', 'next.js', 'express', 'c++', 'c#', 'go', 'rust'
];

export const ROLE_SKILL_HINTS: Record<string, string[]> = {
  ai: ['python', 'machine learning', 'deep learning', 'pytorch', 'tensorflow', 'statistics', 'sql'],
  'machine learning': ['python', 'machine learning', 'statistics', 'pandas', 'numpy', 'scikit-learn'],
  'data scientist': ['python', 'statistics', 'sql', 'pandas', 'numpy', 'machine learning'],
  'data analyst': ['sql', 'excel', 'power bi', 'tableau', 'statistics', 'data analysis'],
  software: ['python', 'java', 'javascript', 'git', 'sql', 'rest api', 'testing'],
  developer: ['python', 'git', 'sql', 'testing', 'rest api', 'javascript'],
  devops: ['linux', 'docker', 'kubernetes', 'aws', 'git', 'ci/cd'],
  cloud: ['aws', 'azure', 'gcp', 'docker', 'kubernetes', 'linux'],
  cyber: ['cybersecurity', 'linux', 'networking', 'python'],
  qa: ['testing', 'selenium', 'automation', 'api testing', 'git'],
  hr: ['recruitment', 'employee relations', 'communication', 'hr analytics'],
  marketing: ['digital marketing', 'seo', 'content marketing', 'analytics', 'communication'],
  sales: ['sales', 'negotiation', 'communication', 'crm', 'lead generation'],
  finance: ['excel', 'financial analysis', 'accounting', 'forecasting', 'communication'],
  account: ['accounting', 'excel', 'financial analysis', 'tax', 'audit'],
  'project manager': ['project management', 'stakeholder management', 'communication', 'agile', 'risk management'],
  'product manager': ['product management', 'roadmapping', 'user research', 'analytics', 'stakeholder management'],
};

export const RISK_PATTERNS: Record<string, string> = {
  'wire transfer': 'Requests for wire transfers or direct money movement.',
  'registration fee': 'Upfront registration or application fees.',
  'processing fee': 'Upfront processing fees.',
  'telegram': 'Telegram-only recruitment communication.',
  'whatsapp': 'WhatsApp-only recruitment communication.',
  'crypto': 'Cryptocurrency payment/request.',
  'gift card': 'Gift-card payment request.',
  'no interview': 'No-interview hiring claim.',
  'pay to apply': 'Payment required to apply.',
  'urgent payment': 'Urgent payment pressure.',
  'security deposit': 'Demanding an upfront security deposit for equipment.',
};

export function getSkillSet(text: string): string[] {
  const lower = (text || '').toLowerCase();
  return SKILLS.filter(skill => lower.includes(skill));
}

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
  let cleanText = (text || '').trim();

  // Strip binary/PDF artifacts if present
  if (cleanText.includes('%PDF-')) {
    const textChunks: string[] = [];
    const tjMatches = cleanText.match(/\(([^()]+)\)/g) || [];
    for (const m of tjMatches) {
      const s = m.slice(1, -1).trim();
      if (s.length > 1 && !/^[\x00-\x1F]+$/.test(s)) textChunks.push(s);
    }
    if (textChunks.length > 8) {
      cleanText = textChunks.join(' ');
    }
  }
  cleanText = cleanText.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F]/g, ' ').replace(/\s{2,}/g, ' ').trim();

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
  if (missingSections.includes('Experience')) recommendations.push('Add relevant professional experience, internships, or substantial project work.');
  if (missingSections.includes('Projects')) recommendations.push('Add 2–3 relevant technical projects with tools, individual ownership, and measurable results.');
  if (quantifiedMatches.length < 2) recommendations.push('Include measurable metrics such as percentage improvements (e.g. 30% faster latency), user counts, or cost savings.');
  if (actionVerbsMatches.length < 4) recommendations.push('Use stronger action verbs (e.g. spearheaded, engineered, architected, delivered).');
  if (!email || !phone) recommendations.push('Ensure complete contact details with professional email and telephone number.');
  if (skills.length < 6) recommendations.push('Add core competencies and tech stack keywords substantiated by your projects.');
  if (targetRole && roleMatch !== null && roleMatch < 50) recommendations.push(`Tailor your keywords specifically toward ${targetRole} by highlighting related skills.`);
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
  const count = Math.max(5, Math.min(50, questionCount));
  const questions: AssessmentQuestion[] = [];

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

  return { role, question_count: count, questions };
}

export function scoreAssessmentClientSide(questions: AssessmentQuestion[], answers: Record<string | number, string>): AssessmentResult {
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

  return {
    score: correct,
    total,
    percentage,
    correct_count: correct,
    wrong_count: wrong,
    unanswered_count: unanswered,
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

  const questions: string[] = [
    `Please introduce yourself and walk me through your professional journey, highlighting why you are a strong fit for the ${role} position.`,
    `What inspired you to specialize in the ${role} career path, and what excites you about this opportunity?`,
    `Why do you want to work at ${companyName}, and what value would you bring to our team?`,
    'Tell me about the most impactful project or achievement on your resume. What was your personal contribution?',
  ];

  for (const s of skills.slice(0, 5)) {
    questions.push(`Your background mentions ${s}. Can you describe a production challenge where you utilized ${s} and what outcome was achieved?`);
  }

  questions.push(
    'Tell me about a complex technical roadblock or design challenge you encountered and how you resolved it.',
    'Tell me about a time you received constructive feedback or faced a project failure. What did you learn and adjust?',
    'How do you prioritize deliverables when multiple high-stakes tasks compete for your attention?',
    `What is one area of improvement or emerging technology you are currently mastering in ${role}?`,
    'What do you aim to accomplish in your first 90 days in this role?'
  );

  const used = new Set(transcript.map(t => String(t.question || '').trim()));
  const remaining = questions.filter(q => !used.has(q.trim()));
  const next_question = remaining.length > 0 ? remaining[0] : `As a ${role}, what would be your strategy for scaling our current workflow?`;

  return { next_question, available_questions: remaining.length };
}

export function scoreMockInterviewClientSide(transcript: InterviewQuestionItem[], role = 'Software Developer'): InterviewScore {
  if (!transcript || transcript.length === 0) {
    return {
      overall: 0,
      communication: 0,
      completeness: 0,
      evidence: 0,
      relevance: 0,
      answered: 0,
      strengths: [],
      improvements: ['Submit answers before completing the mock interview.'],
    };
  }

  const answers = transcript.map(x => String(x.answer || ''));
  const wordCounts = answers.map(a => a.split(/\s+/).filter(Boolean).length);
  const avgWords = wordCounts.reduce((acc, c) => acc + c, 0) / wordCounts.length;

  const substantiveCount = wordCounts.filter(w => w >= 25).length;
  const completeness = Math.round((substantiveCount / answers.length) * 100);

  const evidenceKeywords = ['because', 'result', 'impact', 'example', 'metric', 'improved', 'built', 'developed', 'implemented', 'saved', 'percent', '%'];
  const evidenceCount = answers.filter(a => evidenceKeywords.some(k => a.toLowerCase().includes(k))).length;
  const evidence = Math.round((evidenceCount / answers.length) * 100);

  const roleLower = role.toLowerCase();
  const relevanceCount = answers.filter(a => a.toLowerCase().includes(roleLower) || ['experience', 'project', 'skill', 'problem', 'solution', 'team'].some(k => a.toLowerCase().includes(k))).length;
  const relevance = Math.round((relevanceCount / answers.length) * 100);

  const communication = Math.min(100, Math.round(Math.min(100, avgWords * 2.5) * 0.6 + evidence * 0.2 + relevance * 0.2));
  const overall = Math.max(10, Math.min(98, Math.round(communication * 0.45 + completeness * 0.25 + evidence * 0.15 + relevance * 0.15)));

  const strengths: string[] = [
    `Completed ${transcript.length} comprehensive interview responses for ${role}.`,
  ];
  if (avgWords >= 40) strengths.push('Answers demonstrate comprehensive thought and situational detail.');
  if (evidence >= 50) strengths.push('Strong use of concrete evidence, metrics, and actionable examples.');

  const improvements: string[] = [];
  if (evidence < 40) improvements.push('Incorporate the STAR methodology with measurable business metrics (e.g. reduced load time by 30%).');
  if (avgWords < 30) improvements.push('Expand on your individual ownership and technical decision trade-offs.');

  return {
    overall,
    communication,
    completeness,
    evidence,
    relevance,
    answered: transcript.length,
    strengths,
    improvements: improvements.length ? improvements : ['Maintain this structured, evidence-first communication style in live interviews.'],
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

export async function safeAskAssistant(messages: Array<{ role: 'user' | 'assistant'; content: string }>, resumeContext = ''): Promise<string> {
  const latestUserMsg = [...messages].reverse().find(m => m.role === 'user')?.content || '';
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

  if (q.includes('how to become') || q.includes('become a')) {
    const role = latestUserMsg.replace(/.*?how to become\s+(?:an?\s+)?/i, '').replace(/[?.!]/g, '').trim() || 'your target role';
    return `### Roadmap to become a ${role}\n\n` +
      `**1. Learn Foundations** — understand core competencies and architecture patterns.\n\n` +
      `**2. Build Practical Skills** — build hands-on applications rather than just passive tutorials.\n\n` +
      `**3. Build a Proven Portfolio** — build 2–3 public repositories showcasing measurable impact and test coverage.\n\n` +
      `**4. Tailor Your Resume** — highlight achievements in the Google XYZ format (Accomplished [X] as measured by [Y] by doing [Z]).\n\n` +
      `**5. Master Interviews** — practice domain fundamentals, behavioral STAR stories, and system architecture.\n\n` +
      (skills.length > 0 ? `*Your current detected resume skills:* ${skills.slice(0, 10).join(', ')}.` : '');
  } else if (q.includes('resume') || q.includes('score')) {
    return 'Focus your resume on clear role alignment, quantified metric achievements (e.g. 35% latency reduction), strong action verbs (spearheaded, engineered, deployed), standard sections (Summary, Experience, Projects, Skills, Education), and keyword synchronization with target job requisitions.';
  } else if (q.includes('interview') || q.includes('star')) {
    return 'For interviews, prepare a crisp 90-second elevator pitch, 4–6 STAR stories (Situation, Task, Action, Result) highlighting your personal technical contribution, core domain fundamentals, and 3 insightful questions for the interviewer.';
  } else if (q.includes('salary') || q.includes('pay') || q.includes('ctc') || q.includes('compensation')) {
    return 'Salary is driven by role domain, experience level, regional market demand, and proven impact. Leverage the Career Lens Salary Estimation tool to benchmark your expected band before negotiating.';
  } else {
    return `For your goal regarding "${latestUserMsg}", divide your action plan into three phases: 1) Align with target role requirements, 2) Build tangible project evidence, and 3) Practice structured STAR communication. What specific role or milestone would you like to target next?`;
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
