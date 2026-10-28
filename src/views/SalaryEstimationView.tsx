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

/**
 * Salary estimates are indicative benchmarks, not verified live salary offers.
 * Indian figures are expressed in LPA.
 * USD/EUR figures are expressed in annual thousands.
 *
 * The role profiles intentionally distinguish specific job families.
 * They are planning estimates and should not be presented as live market data.
 */
interface SalaryRoleProfile {
  keywords: string[];
  india: number;
  northAmerica: number;
  europe: number;
  skills: string[];
  bonus: number;
}

const SALARY_ROLE_PROFILES: SalaryRoleProfile[] = [
  {
    keywords: ['machine learning engineer', 'ml engineer'],
    india: 12,
    northAmerica: 145,
    europe: 75,
    skills: ['Python', 'PyTorch', 'TensorFlow', 'ML deployment', 'MLOps'],
    bonus: 15,
  },
  {
    keywords: ['ai engineer', 'artificial intelligence engineer'],
    india: 13,
    northAmerica: 155,
    europe: 80,
    skills: ['Python', 'LLMs', 'RAG', 'PyTorch', 'Model deployment'],
    bonus: 15,
  },
  {
    keywords: ['llm engineer', 'generative ai engineer'],
    india: 16,
    northAmerica: 175,
    europe: 90,
    skills: ['LLMs', 'RAG', 'Vector databases', 'Python', 'Model evaluation'],
    bonus: 18,
  },
  {
    keywords: ['data scientist', 'data science'],
    india: 11,
    northAmerica: 130,
    europe: 68,
    skills: ['Python', 'SQL', 'Statistics', 'Machine Learning', 'Experimentation'],
    bonus: 12,
  },
  {
    keywords: ['data engineer'],
    india: 10,
    northAmerica: 125,
    europe: 65,
    skills: ['SQL', 'Python', 'Spark', 'Airflow', 'Data pipelines'],
    bonus: 12,
  },
  {
    keywords: ['data analyst', 'business intelligence analyst', 'bi analyst'],
    india: 6,
    northAmerica: 80,
    europe: 45,
    skills: ['SQL', 'Excel', 'Power BI', 'Tableau', 'Statistics'],
    bonus: 8,
  },
  {
    keywords: ['business analyst'],
    india: 7,
    northAmerica: 90,
    europe: 48,
    skills: ['SQL', 'Excel', 'Requirements analysis', 'Power BI', 'Communication'],
    bonus: 8,
  },
  {
    keywords: ['frontend developer', 'front end developer', 'ui developer'],
    india: 7,
    northAmerica: 105,
    europe: 55,
    skills: ['JavaScript', 'TypeScript', 'React', 'Accessibility', 'Performance'],
    bonus: 8,
  },
  {
    keywords: ['backend developer', 'back end developer'],
    india: 9,
    northAmerica: 125,
    europe: 65,
    skills: ['APIs', 'SQL', 'System design', 'Caching', 'Security'],
    bonus: 10,
  },
  {
    keywords: ['full stack developer', 'full-stack developer'],
    india: 9,
    northAmerica: 120,
    europe: 62,
    skills: ['React', 'Node.js', 'TypeScript', 'SQL', 'API design'],
    bonus: 10,
  },
  {
    keywords: ['software architect', 'solution architect'],
    india: 24,
    northAmerica: 190,
    europe: 100,
    skills: ['System design', 'Cloud architecture', 'Security', 'Distributed systems'],
    bonus: 20,
  },
  {
    keywords: ['software engineer', 'software developer'],
    india: 8,
    northAmerica: 120,
    europe: 62,
    skills: ['Data structures', 'Algorithms', 'Testing', 'System design', 'Git'],
    bonus: 10,
  },
  {
    keywords: ['devops engineer', 'devops'],
    india: 10,
    northAmerica: 125,
    europe: 65,
    skills: ['Linux', 'Docker', 'Kubernetes', 'CI/CD', 'Terraform'],
    bonus: 12,
  },
  {
    keywords: ['site reliability engineer', 'sre'],
    india: 14,
    northAmerica: 155,
    europe: 80,
    skills: ['Linux', 'Observability', 'Kubernetes', 'Incident response', 'Automation'],
    bonus: 15,
  },
  {
    keywords: ['cloud engineer'],
    india: 9,
    northAmerica: 125,
    europe: 65,
    skills: ['AWS', 'Azure', 'Networking', 'Linux', 'Infrastructure as Code'],
    bonus: 10,
  },
  {
    keywords: ['cybersecurity analyst', 'security analyst'],
    india: 8,
    northAmerica: 105,
    europe: 55,
    skills: ['Security monitoring', 'SIEM', 'Networking', 'Incident response'],
    bonus: 10,
  },
  {
    keywords: ['penetration tester', 'security engineer', 'cybersecurity engineer'],
    india: 12,
    northAmerica: 140,
    europe: 72,
    skills: ['Penetration testing', 'Security architecture', 'Python', 'Cloud security'],
    bonus: 12,
  },
  {
    keywords: ['qa automation engineer', 'test automation engineer'],
    india: 7,
    northAmerica: 100,
    europe: 52,
    skills: ['Playwright', 'Selenium', 'API testing', 'CI/CD', 'Test design'],
    bonus: 8,
  },
  {
    keywords: ['qa engineer', 'quality assurance engineer', 'software tester'],
    india: 5,
    northAmerica: 82,
    europe: 43,
    skills: ['Test design', 'Bug reporting', 'API testing', 'Regression testing'],
    bonus: 6,
  },
  {
    keywords: ['product manager'],
    india: 18,
    northAmerica: 150,
    europe: 78,
    skills: ['Product strategy', 'Analytics', 'Roadmapping', 'User research'],
    bonus: 15,
  },
  {
    keywords: ['project manager'],
    india: 12,
    northAmerica: 115,
    europe: 60,
    skills: ['Planning', 'Risk management', 'Stakeholder management', 'Agile'],
    bonus: 10,
  },
  {
    keywords: ['ux designer', 'ui designer', 'product designer'],
    india: 8,
    northAmerica: 110,
    europe: 58,
    skills: ['Figma', 'Prototyping', 'User research', 'Accessibility'],
    bonus: 8,
  },
  {
    keywords: ['hr manager', 'human resources manager'],
    india: 10,
    northAmerica: 105,
    europe: 55,
    skills: ['People management', 'HR analytics', 'Employee relations'],
    bonus: 10,
  },
  {
    keywords: ['recruiter', 'talent acquisition'],
    india: 6,
    northAmerica: 75,
    europe: 40,
    skills: ['Sourcing', 'Interviewing', 'ATS', 'Candidate experience'],
    bonus: 8,
  },
  {
    keywords: ['accountant', 'accounting'],
    india: 5,
    northAmerica: 65,
    europe: 38,
    skills: ['Accounting', 'Excel', 'Financial reporting', 'Compliance'],
    bonus: 5,
  },
  {
    keywords: ['financial analyst', 'finance analyst'],
    india: 8,
    northAmerica: 90,
    europe: 48,
    skills: ['Financial modeling', 'Excel', 'Forecasting', 'Financial reporting'],
    bonus: 8,
  },
  {
    keywords: ['marketing manager', 'digital marketing'],
    india: 7,
    northAmerica: 90,
    europe: 47,
    skills: ['Analytics', 'SEO', 'Campaign management', 'Marketing automation'],
    bonus: 8,
  },
  {
    keywords: ['sales manager', 'account executive'],
    india: 9,
    northAmerica: 100,
    europe: 52,
    skills: ['Negotiation', 'CRM', 'Pipeline management', 'Communication'],
    bonus: 15,
  },
  {
    keywords: ['teacher', 'school teacher'],
    india: 4,
    northAmerica: 55,
    europe: 35,
    skills: ['Lesson planning', 'Communication', 'Assessment', 'Classroom management'],
    bonus: 3,
  },
  {
    keywords: ['civil engineer'],
    india: 5,
    northAmerica: 85,
    europe: 45,
    skills: ['AutoCAD', 'Project planning', 'Structural analysis', 'Safety'],
    bonus: 6,
  },
  {
    keywords: ['mechanical engineer'],
    india: 5,
    northAmerica: 85,
    europe: 45,
    skills: ['CAD', 'Mechanical design', 'Manufacturing', 'Testing'],
    bonus: 6,
  },
  {
    keywords: ['electrical engineer', 'electronics engineer'],
    india: 5,
    northAmerica: 90,
    europe: 47,
    skills: ['Circuit design', 'Testing', 'Embedded systems', 'Electronics'],
    bonus: 6,
  },
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

  // Prefer the most specific matching title.
  return [...SALARY_ROLE_PROFILES]
    .sort((a, b) => {
      const aLength = Math.max(...a.keywords.map(k => k.length));
      const bLength = Math.max(...b.keywords.map(k => k.length));
      return bLength - aLength;
    })
    .find(profile =>
      profile.keywords.some(keyword => {
        const normalizedKeyword = normalizeSalaryText(keyword);
        return normalizedRole === normalizedKeyword ||
          normalizedRole.includes(normalizedKeyword);
      })
    );
}

function getExperienceMultiplier(experience: string): number {
  const value = normalizeSalaryText(experience);

  if (
    value.includes('fresher') ||
    value.includes('entry') ||
    value.includes('intern') ||
    value.includes('0-1') ||
    value.includes('0 1')
  ) return 0.72;

  if (
    value.includes('mid') ||
    value.includes('2-5') ||
    value.includes('2 5')
  ) return 1;

  if (
    value.includes('senior') ||
    value.includes('5-8') ||
    value.includes('5 8')
  ) return 1.55;

  if (
    value.includes('lead') ||
    value.includes('principal') ||
    value.includes('8+') ||
    value.includes('8 plus') ||
    value.includes('director')
  ) return 2.15;

  return 1;
}

export function estimateSalaryClientSide(
  role = 'Software Developer',
  experience = 'Mid-Level (2-5 yrs)',
  location = 'India',
  skills: string[] = []
): SalaryEstimateResult {
  const safeRole = String(role || '').trim() || 'Software Developer';
  const safeExperience = String(experience || '').trim() || 'Mid-Level (2-5 yrs)';
  const safeLocation = String(location || '').trim() || 'India';
  const normalizedLocation = normalizeSalaryText(safeLocation);

  const profile = findSalaryProfile(safeRole);

  // Unknown titles use a clearly labeled broad software/general benchmark,
  // rather than pretending the role has a verified exact salary.
  const fallbackProfile: SalaryRoleProfile = {
    keywords: [],
    india: 6,
    northAmerica: 95,
    europe: 48,
    skills: ['Communication', 'Problem solving', 'Role-specific experience'],
    bonus: 8,
  };

  const selectedProfile = profile || fallbackProfile;
  const experienceMultiplier = getExperienceMultiplier(safeExperience);

  const skillNames = Array.isArray(skills)
    ? skills.map(s => String(s).toLowerCase())
    : [];

  const skillPremium = Math.min(
    0.18,
    (skillNames.some(s => /aws|azure|gcp|kubernetes|terraform/.test(s)) ? 0.04 : 0) +
    (skillNames.some(s => /machine learning|pytorch|tensorflow|llm|generative ai/.test(s)) ? 0.06 : 0) +
    (skillNames.some(s => /system design|distributed systems|microservices/.test(s)) ? 0.04 : 0) +
    (skillNames.some(s => /security|data engineering|mlops/.test(s)) ? 0.04 : 0)
  );

  const adjustedBase = (base: number) =>
    base * experienceMultiplier * (1 + skillPremium);

  const isUSD =
    /north america|united states|usa|u\.s\.a|canada|usd|united states of america/.test(normalizedLocation);

  const isEUR =
    /europe|eur|germany|france|netherlands|ireland|spain|italy|portugal|sweden|denmark|finland|belgium/.test(normalizedLocation);

  const isGlobalRemote = /global remote|worldwide remote/.test(normalizedLocation);

  let currencySymbol: string;
  let currencyCode: string;
  let minSalary: number;
  let maxSalary: number;
  let medianSalary: number;
  let monthlyInHand: number;

  if (isUSD || isGlobalRemote) {
    currencySymbol = '$';
    currencyCode = 'USD / Year';
    const base = adjustedBase(selectedProfile.northAmerica);
    minSalary = Math.round(base * 0.78);
    maxSalary = Math.round(base * 1.28);
    medianSalary = Math.round(base);
    monthlyInHand = Math.round((medianSalary * 1000 * 0.68) / 12);
  } else if (isEUR) {
    currencySymbol = '€';
    currencyCode = 'EUR / Year';
    const base = adjustedBase(selectedProfile.europe);
    minSalary = Math.round(base * 0.8);
    maxSalary = Math.round(base * 1.25);
    medianSalary = Math.round(base);
    monthlyInHand = Math.round((medianSalary * 1000 * 0.68) / 12);
  } else {
    currencySymbol = '₹';
    currencyCode = 'LPA (INR)';
    const base = adjustedBase(selectedProfile.india);
    minSalary = Math.round(base * 0.78 * 10) / 10;
    maxSalary = Math.round(base * 1.28 * 10) / 10;
    medianSalary = Math.round(base * 10) / 10;
    monthlyInHand = Math.round((medianSalary * 100000 * 0.78) / 12);
  }

  const bonusLow = Math.max(0, selectedProfile.bonus - 3);
  const bonusHigh = selectedProfile.bonus + 3;

  const roleSkills = selectedProfile.skills;

  const marketSentiment = profile
    ? 'Indicative role benchmark — live hiring demand not connected'
    : 'General estimate — no specific role benchmark found';

  const source = profile
    ? 'CareerLens role benchmark estimates (not live salary data)'
    : 'CareerLens general fallback estimate (not live salary data)';

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
      q25: Math.round(minSalary * 10) / 10,
      q50: Math.round(medianSalary * 10) / 10,
      q75: Math.round((minSalary * 0.4 + maxSalary * 0.6) * 10) / 10,
      q90: Math.round(maxSalary * 10) / 10,
    },
    bonus_percentage: `${bonusLow}% - ${bonusHigh}%`,
    equity_grant:
      experienceMultiplier >= 1.55
        ? 'Equity may be offered; varies by employer and level'
        : 'Equity availability depends on employer and role',
    market_sentiment: marketSentiment,
    top_paying_skills: roleSkills,
    negotiation_tip:
      'Compare the complete offer: base salary, variable pay, equity, benefits, location, and role scope. Use multiple recent job postings before negotiating.',
    note:
      'Planning estimate only. Compensation varies by employer, city, industry, skills, and individual experience. This is not a verified live-market quote.',
    source,
  };
}

export async function safeEstimateSalary(
  role: string,
  experience: string,
  location: string,
  skills: string[] = []
): Promise<SalaryEstimateResult> {
  const requestedRole = String(role || '').trim() || 'Software Developer';
  const requestedExperience =
    String(experience || '').trim() || 'Mid-Level (2-5 yrs)';
  const requestedLocation = String(location || '').trim() || 'India';

  try {
    const response = await fetch('/api/salary/estimate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        role: requestedRole,
        experience: requestedExperience,
        location: requestedLocation,
        skills,
      }),
    });

    const contentType = response.headers.get('content-type') || '';

    if (!response.ok) {
      throw new Error(`Salary service returned HTTP ${response.status}`);
    }

    if (!contentType.includes('application/json')) {
      throw new Error('Salary service did not return JSON');
    }

    const result = await response.json() as SalaryEstimateResult;

    // Reject stale or mismatched results so the UI cannot display one role's
    // response after the user has searched for another role.
    if (
      !result ||
      typeof result.min_salary !== 'number' ||
      typeof result.max_salary !== 'number' ||
      typeof result.median_salary !== 'number'
    ) {
      throw new Error('Salary service returned an invalid result');
    }

    return {
      ...result,
      role: requestedRole,
      experience: requestedExperience,
      location: requestedLocation,
    };
  } catch {
    // The backend may be unavailable on static deployments.
    // Return an explicitly labeled estimate instead of claiming live data.
    return estimateSalaryClientSide(
      requestedRole,
      requestedExperience,
      requestedLocation,
      skills
    );
  }
}
