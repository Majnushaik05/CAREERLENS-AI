import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Wallet,
  TrendingUp,
  MapPin,
  Briefcase,
  Search,
  AlertCircle,
  Copy,
  Check,
  ChevronRight,
  Sparkles,
  Award,
  Layers,
  ArrowUpRight,
  ShieldCheck,
  Building,
  RotateCcw,
  Sliders,
  DollarSign,
  Info,
} from 'lucide-react';
import {
  safeEstimateSalary,
  estimateSalaryClientSide,
  type SalaryEstimateResult,
} from '../services/careerService';
import { ResumeAnalysis } from '../types';

interface SalaryEstimationViewProps {
  analysis?: ResumeAnalysis | null;
}

const INDUSTRY_ROLES: Record<string, string[]> = {
  'Information Technology': [
    'Software Engineer',
    'AI Engineer',
    'Data Scientist',
    'Frontend Developer',
    'Backend Developer',
    'Full Stack Developer',
    'Cloud Engineer',
    'Cybersecurity Analyst',
    'DevOps Engineer',
  ],
  Engineering: [
    'Mechanical Engineer',
    'Civil Engineer',
    'Electrical Engineer',
    'Chemical Engineer',
    'Automotive Engineer',
    'Manufacturing Engineer',
  ],
  Healthcare: [
    'Doctor',
    'Registered Nurse',
    'Pharmacist',
    'Dentist',
    'Physiotherapist',
    'Medical Laboratory Technician',
  ],
  'Finance & Banking': [
    'Financial Analyst',
    'Accountant',
    'Financial Manager',
    'Auditor',
    'Tax Consultant',
    'Banking Associate',
  ],
  'Management & Operations': [
    'Product Manager',
    'Project Manager',
    'Business Analyst',
    'Operations Manager',
    'HR Manager',
    'Supply Chain Manager',
  ],
  'Sales & Marketing': [
    'Digital Marketing Specialist',
    'Marketing Manager',
    'Sales Executive',
    'Sales Manager',
    'Content Writer',
    'SEO Specialist',
  ],
  Creative: [
    'UX Designer',
    'Graphic Designer',
    'Video Editor',
    'Copywriter',
    'Brand Manager',
  ],
};

const EXPERIENCE_LEVELS = [
  { id: 'Fresher', label: 'Fresher / Intern', years: '0–1 years' },
  { id: 'Entry Level', label: 'Entry Level', years: '1–2 years' },
  { id: 'Mid Level', label: 'Mid Level', years: '2–5 years' },
  { id: 'Senior', label: 'Senior', years: '5–8 years' },
  { id: 'Lead / Manager', label: 'Lead / Principal / Manager', years: '8+ years' },
];

const LOCATIONS = [
  { id: 'India', label: 'India (INR / LPA)', currency: '₹', market: 'Tech Hubs & Pan-India' },
  { id: 'North America', label: 'United States & Canada (USD)', currency: '$', market: 'US & CA Tech Centers' },
  { id: 'Europe', label: 'Western Europe (EUR)', currency: '€', market: 'UK, Germany, EU Hubs' },
  { id: 'Global Remote', label: 'Global Remote (USD)', currency: '$', market: 'International Distributed' },
];

export const SalaryEstimationView: React.FC<SalaryEstimationViewProps> = ({ analysis }) => {
  const initialRole = analysis?.target_role?.trim() || 'Software Engineer';
  const initialSkills = analysis?.skills ? analysis.skills.slice(0, 5).join(', ') : 'React, TypeScript, Python';

  const [selectedIndustry, setSelectedIndustry] = useState<string>('Information Technology');
  const [role, setRole] = useState<string>(initialRole);
  const [experience, setExperience] = useState<string>('Mid Level');
  const [location, setLocation] = useState<string>('India');
  const [skillsText, setSkillsText] = useState<string>(initialSkills);

  const [result, setResult] = useState<SalaryEstimateResult | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [copiedScript, setCopiedScript] = useState<boolean>(false);

  // Parse skill array safely
  const parsedSkills = useMemo(() => {
    return skillsText
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
      .slice(0, 15);
  }, [skillsText]);

  // Execute salary estimation
  const executeEstimate = useCallback(
    async (
      targetRole: string,
      targetExp: string,
      targetLoc: string,
      skillsList: string[]
    ) => {
      const cleanRole = targetRole.trim();
      if (!cleanRole) {
        setError('Please enter or select a job title.');
        return;
      }

      setLoading(true);
      setError('');

      try {
        const data = await safeEstimateSalary(
          cleanRole,
          targetExp,
          targetLoc,
          skillsList
        );

        if (
          !data ||
          !Number.isFinite(data.median_salary) ||
          data.median_salary <= 0
        ) {
          // Fallback to client-side estimator
          const localFallback = estimateSalaryClientSide(
            cleanRole,
            targetExp,
            targetLoc,
            skillsList
          );
          setResult(localFallback);
        } else {
          setResult(data);
        }
      } catch (err: unknown) {
        // Fallback gracefully to client calculation so user never gets blocked
        const localFallback = estimateSalaryClientSide(
          cleanRole,
          targetExp,
          targetLoc,
          skillsList
        );
        setResult(localFallback);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Initial estimate on mount or when target role from analysis changes
  useEffect(() => {
    void executeEstimate(role, experience, location, parsedSkills);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Format currency helpers
  const formatAnnual = (amount: number, res: SalaryEstimateResult): string => {
    if (!Number.isFinite(amount)) return 'N/A';
    if (res.currency_code.startsWith('INR')) {
      return `₹${amount.toLocaleString('en-IN', {
        minimumFractionDigits: 1,
        maximumFractionDigits: 1,
      })} LPA`;
    }
    // North America or Europe: stored in thousands (e.g. 120 = $120,000)
    const thousands = res.currency_code.includes('thousands');
    const fullAmount = thousands ? amount * 1000 : amount;
    return `${res.currency_symbol}${Math.round(fullAmount).toLocaleString('en-US')}/yr`;
  };

  const formatMonthlyInHand = (amount: number, res: SalaryEstimateResult): string => {
    if (!Number.isFinite(amount) || amount <= 0) return 'N/A';
    const isIndia = res.currency_code.startsWith('INR');
    return `${res.currency_symbol}${Math.round(amount).toLocaleString(isIndia ? 'en-IN' : 'en-US')} / mo`;
  };

  // Career ladder across all experience levels for the current role
  const ladderData = useMemo(() => {
    if (!result) return [];
    return EXPERIENCE_LEVELS.map((lvl) => {
      const est = estimateSalaryClientSide(result.role, lvl.id, result.location, parsedSkills);
      return {
        level: lvl.id,
        label: lvl.label,
        years: lvl.years,
        median: est.median_salary,
        min: est.min_salary,
        max: est.max_salary,
        isCurrent: lvl.id === result.experience,
      };
    });
  }, [result, parsedSkills]);

  // Handle suggested role click
  const handleSelectSuggestedRole = (suggested: string) => {
    setRole(suggested);
    void executeEstimate(suggested, experience, location, parsedSkills);
  };

  // Handle experience change
  const handleExperienceChange = (newExp: string) => {
    setExperience(newExp);
    void executeEstimate(role, newExp, location, parsedSkills);
  };

  // Handle location change
  const handleLocationChange = (newLoc: string) => {
    setLocation(newLoc);
    void executeEstimate(role, experience, newLoc, parsedSkills);
  };

  // Generate negotiation script
  const negotiationScript = useMemo(() => {
    if (!result) return '';
    const formattedMedian = formatAnnual(result.median_salary, result);
    const formattedMax = formatAnnual(result.max_salary, result);

    return `Dear [Hiring Manager / Recruiter Name],

Thank you very much for offering me the ${result.role} position at [Company Name]. I am genuinely excited about the team's mission and the opportunity to contribute.

Based on current market benchmarks for ${result.role} in ${result.location} with ${result.experience.toLowerCase()} experience—and considering my background in ${result.top_paying_skills.slice(0, 3).join(', ')}—the industry competitive median sits around ${formattedMedian}, with upper-quartile offers reaching ${formattedMax}.

Given the value and immediate impact I will bring to the team, I would like to explore if we can align the total base compensation closer to ${formattedMedian} (or include a signing / performance review structure).

I am very enthusiastic about joining the team and look forward to finding a package that reflects our mutual commitment.

Best regards,
[Your Name]`;
  }, [result]);

  const handleCopyScript = async () => {
    try {
      await navigator.clipboard.writeText(negotiationScript);
      setCopiedScript(true);
      setTimeout(() => setCopiedScript(false), 3000);
    } catch {
      // Fallback
    }
  };

  return (
    <div className="mx-auto max-w-6xl space-y-7 pb-20 selection:bg-blue-600 selection:text-white">
      {/* Header Banner */}
      <div className="flex flex-col justify-between gap-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-xs sm:p-8 md:flex-row md:items-center">
        <div className="min-w-0">
          <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
            <span className="flex h-2 w-2 rounded-full bg-blue-600 ring-4 ring-blue-100" />
            <span>Market Intelligence &amp; Compensation Engine</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">
            Real-Time Salary &amp; Offer Intelligence
          </h1>
          <p className="mt-1.5 max-w-2xl text-sm text-slate-600">
            Benchmark realistic compensation, take-home net estimates, equity bands, and percentile distributions across industries and locations.
          </p>
        </div>

        {result && (
          <div className="shrink-0 rounded-2xl border border-blue-100 bg-blue-50/70 p-4 sm:p-5">
            <div className="text-xs font-bold uppercase tracking-wider text-blue-700">
              Current Benchmark Target
            </div>
            <div className="mt-1 text-2xl font-black text-blue-900 sm:text-3xl">
              {formatAnnual(result.median_salary, result)}
            </div>
            <div className="mt-1 flex items-center gap-2 text-xs font-semibold text-blue-700">
              <span>{result.role}</span>
              <span>•</span>
              <span>{result.experience}</span>
            </div>
          </div>
        )}
      </div>

      {/* Control / Config Panel */}
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs sm:p-7">
        <div className="mb-6 flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="rounded-xl bg-blue-600 p-2 text-white">
              <Sliders size={18} />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-950">Compensation Calculator Parameters</h2>
              <p className="text-xs text-slate-500">Customize role, seniority, market location, and specialized skill sets</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              setRole('Software Engineer');
              setExperience('Mid Level');
              setLocation('India');
              setSkillsText('React, TypeScript, Python');
              void executeEstimate('Software Engineer', 'Mid Level', 'India', ['React', 'TypeScript', 'Python']);
            }}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-blue-600 transition"
          >
            <RotateCcw size={13} />
            <span>Reset Defaults</span>
          </button>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-12">
          {/* Industry Category */}
          <div className="md:col-span-4">
            <label htmlFor="salary-industry" className="mb-1.5 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-600">
              <Building size={13} className="text-slate-400" />
              Industry Sector
            </label>
            <select
              id="salary-industry"
              value={selectedIndustry}
              onChange={(e) => setSelectedIndustry(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50/60 px-4 py-3 text-sm font-semibold text-slate-800 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
            >
              {Object.keys(INDUSTRY_ROLES).map((ind) => (
                <option key={ind} value={ind}>
                  {ind}
                </option>
              ))}
            </select>
          </div>

          {/* Job Title Input */}
          <div className="md:col-span-8">
            <label htmlFor="salary-role" className="mb-1.5 flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-600">
              <span className="flex items-center gap-1.5">
                <Briefcase size={13} className="text-slate-400" />
                Target Job Title
              </span>
              <span className="text-[11px] font-normal text-slate-400 lowercase">
                type any role or click quick chips below
              </span>
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <input
                  id="salary-role"
                  type="text"
                  value={role}
                  onChange={(e) => {
                    setRole(e.target.value);
                    setError('');
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      void executeEstimate(role, experience, location, parsedSkills);
                    }
                  }}
                  placeholder="e.g. Full Stack Developer, Data Scientist, Mechanical Engineer..."
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50/60 px-4 py-3 text-sm font-semibold text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                />
              </div>
              <button
                type="button"
                onClick={() => void executeEstimate(role, experience, location, parsedSkills)}
                disabled={loading || !role.trim()}
                className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 text-sm font-bold text-white shadow-xs transition hover:bg-blue-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? <span className="animate-spin text-base">⟳</span> : <Search size={16} />}
                <span>Calculate</span>
              </button>
            </div>
          </div>

          {/* Quick Role Suggestions */}
          <div className="md:col-span-12">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-slate-500">Quick roles:</span>
              {(INDUSTRY_ROLES[selectedIndustry] || INDUSTRY_ROLES['Information Technology']).map(
                (suggestedRole) => (
                  <button
                    key={suggestedRole}
                    type="button"
                    onClick={() => handleSelectSuggestedRole(suggestedRole)}
                    className={`rounded-xl border px-3 py-1.5 text-xs font-semibold transition ${
                      role.toLowerCase() === suggestedRole.toLowerCase()
                        ? 'border-blue-600 bg-blue-50 text-blue-700 ring-2 ring-blue-200'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-blue-300 hover:bg-slate-50'
                    }`}
                  >
                    {suggestedRole}
                  </button>
                )
              )}
            </div>
          </div>

          {/* Experience Level Selector */}
          <div className="md:col-span-6">
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-600">
              Seniority &amp; Experience Level
            </label>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {EXPERIENCE_LEVELS.map((lvl) => (
                <button
                  key={lvl.id}
                  type="button"
                  onClick={() => handleExperienceChange(lvl.id)}
                  className={`flex flex-col items-start rounded-2xl border p-3 text-left transition ${
                    experience === lvl.id
                      ? 'border-blue-600 bg-blue-50/70 text-blue-900 ring-2 ring-blue-300'
                      : 'border-slate-200 bg-slate-50/50 text-slate-700 hover:border-slate-300 hover:bg-slate-100/60'
                  }`}
                >
                  <span className="text-xs font-bold">{lvl.label}</span>
                  <span className="text-[11px] text-slate-500">{lvl.years}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Location & Market Selector */}
          <div className="md:col-span-6">
            <label className="mb-1.5 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-600">
              <MapPin size={13} className="text-slate-400" />
              Geographic Job Market
            </label>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {LOCATIONS.map((loc) => (
                <button
                  key={loc.id}
                  type="button"
                  onClick={() => handleLocationChange(loc.id)}
                  className={`flex flex-col items-start rounded-2xl border p-3 text-left transition ${
                    location === loc.id
                      ? 'border-blue-600 bg-blue-50/70 text-blue-900 ring-2 ring-blue-300'
                      : 'border-slate-200 bg-slate-50/50 text-slate-700 hover:border-slate-300 hover:bg-slate-100/60'
                  }`}
                >
                  <div className="flex w-full items-center justify-between">
                    <span className="text-xs font-bold">{loc.label}</span>
                    <span className="rounded-md bg-white px-1.5 py-0.5 text-[10px] font-black text-slate-700 shadow-2xs">
                      {loc.currency}
                    </span>
                  </div>
                  <span className="mt-0.5 text-[11px] text-slate-500">{loc.market}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Specialized Skills Tags */}
          <div className="md:col-span-12">
            <label htmlFor="salary-skills" className="mb-1.5 flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-600">
              <span className="flex items-center gap-1.5">
                <Sparkles size={13} className="text-amber-500" />
                High-Value Skills &amp; Tech Stack (Optional Bonus Multiplier)
              </span>
              <span className="text-[11px] font-normal text-slate-400">
                comma-separated keywords
              </span>
            </label>
            <div className="relative">
              <input
                id="salary-skills"
                type="text"
                value={skillsText}
                onChange={(e) => setSkillsText(e.target.value)}
                onBlur={() => void executeEstimate(role, experience, location, parsedSkills)}
                placeholder="e.g. AWS, System Design, PyTorch, Kubernetes, React, Node.js"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50/60 px-4 py-3 text-sm font-medium text-slate-800 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
              />
            </div>
            {analysis?.skills && analysis.skills.length > 0 && (
              <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                <span className="text-[11px] font-semibold text-slate-500">From your parsed resume:</span>
                {analysis.skills.slice(0, 6).map((sk) => (
                  <button
                    key={sk}
                    type="button"
                    onClick={() => {
                      if (!skillsText.toLowerCase().includes(sk.toLowerCase())) {
                        const updated = skillsText ? `${skillsText}, ${sk}` : sk;
                        setSkillsText(updated);
                        void executeEstimate(role, experience, location, updated.split(',').map(s => s.trim()));
                      }
                    }}
                    className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-100/80 px-2 py-0.5 text-[11px] font-medium text-slate-700 hover:border-blue-400 hover:bg-blue-50 hover:text-blue-700 transition"
                  >
                    <span>+</span>
                    <span>{sk}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {error && (
          <div className="mt-5 flex items-center gap-2.5 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
            <AlertCircle size={18} className="shrink-0 text-red-600" />
            <span>{error}</span>
          </div>
        )}
      </section>

      {/* Main Results View */}
      {result && (
        <>
          {/* Key Metric Headline Cards */}
          <section className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {/* Median Card (Hero) */}
            <div className="relative overflow-hidden rounded-3xl border border-blue-200 bg-gradient-to-br from-blue-600 to-indigo-700 p-6 text-white shadow-md sm:col-span-2 lg:col-span-1">
              <div className="flex items-center justify-between text-blue-100">
                <span className="text-xs font-black uppercase tracking-wider">Median Target Pay</span>
                <span className="rounded-full bg-white/20 px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wide">
                  50th Percentile
                </span>
              </div>
              <div className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">
                {formatAnnual(result.median_salary, result)}
              </div>
              <div className="mt-2 text-xs font-medium text-blue-100">
                Representative market offer for {result.role} ({result.experience}) in {result.location}.
              </div>
              <div className="mt-4 flex items-center gap-1.5 border-t border-white/20 pt-3 text-xs font-semibold text-blue-100">
                <span>Range:</span>
                <span className="font-bold text-white">
                  {formatAnnual(result.min_salary, result)} – {formatAnnual(result.max_salary, result)}
                </span>
              </div>
            </div>

            {/* In-Hand Monthly Take-Home */}
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs">
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-xs font-bold uppercase tracking-wider">Estimated Monthly Net</span>
                <div className="rounded-xl bg-emerald-50 p-1.5 text-emerald-600">
                  <Wallet size={16} />
                </div>
              </div>
              <div className="mt-3 text-2xl font-black text-slate-950 sm:text-3xl">
                {formatMonthlyInHand(result.monthly_in_hand, result)}
              </div>
              <p className="mt-2 text-xs text-slate-500 leading-relaxed">
                Approximate take-home after statutory deductions (PF, standard tax bands, and withholding).
              </p>
              <div className="mt-4 border-t border-slate-100 pt-3 text-[11px] font-semibold text-emerald-600 flex items-center gap-1">
                <ShieldCheck size={14} />
                <span>Standard tax bracket applied</span>
              </div>
            </div>

            {/* Variable Pay & Bonus */}
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs">
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-xs font-bold uppercase tracking-wider">Annual Variable Pay</span>
                <div className="rounded-xl bg-amber-50 p-1.5 text-amber-600">
                  <TrendingUp size={16} />
                </div>
              </div>
              <div className="mt-3 text-2xl font-black text-slate-950 sm:text-3xl">
                {result.bonus_percentage}
              </div>
              <p className="mt-2 text-xs text-slate-500 leading-relaxed">
                Typical performance bonus band tied to company and individual OKR milestones.
              </p>
              <div className="mt-4 border-t border-slate-100 pt-3 text-[11px] font-semibold text-amber-700 flex items-center gap-1">
                <Award size={14} />
                <span>Performance-linked incentive</span>
              </div>
            </div>

            {/* Equity / Long-Term Incentives */}
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs">
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-xs font-bold uppercase tracking-wider">Equity &amp; LTI</span>
                <div className="rounded-xl bg-purple-50 p-1.5 text-purple-600">
                  <Layers size={16} />
                </div>
              </div>
              <div className="mt-3 text-sm font-bold text-slate-800 leading-snug">
                {result.equity_grant}
              </div>
              <p className="mt-2 text-xs text-slate-500 leading-relaxed">
                Stock grants (RSUs/ESOPs) commonly structured over a 4-year vesting schedule with a 1-year cliff.
              </p>
              <div className="mt-4 border-t border-slate-100 pt-3 text-[11px] font-semibold text-purple-700 flex items-center gap-1">
                <ArrowUpRight size={14} />
                <span>Seniority vesting applies</span>
              </div>
            </div>
          </section>

          {/* Visual Percentile Spectrum Card */}
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs sm:p-7">
            <div className="mb-4 flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
              <div>
                <h3 className="text-base font-extrabold text-slate-950 flex items-center gap-2">
                  <DollarSign size={18} className="text-blue-600" />
                  Market Compensation Distribution Spectrum
                </h3>
                <p className="text-xs text-slate-500">
                  Visual distribution from entry baseline to high-performer upper tier
                </p>
              </div>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
                Market: {result.location}
              </span>
            </div>

            {/* Gradient Spectrum Bar */}
            <div className="relative mt-8 mb-12 px-2">
              <div className="h-4 w-full rounded-full bg-gradient-to-r from-slate-200 via-blue-500 to-indigo-700 shadow-inner" />

              {/* Markers along the spectrum */}
              <div className="mt-4 grid grid-cols-4 gap-2 text-center">
                {/* 25th percentile */}
                <div className="flex flex-col items-center">
                  <div className="h-3 w-0.5 bg-slate-300" />
                  <span className="mt-1 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    25th (Entry Band)
                  </span>
                  <span className="text-sm font-extrabold text-slate-800">
                    {formatAnnual(result.quartiles.q25, result)}
                  </span>
                </div>

                {/* 50th percentile (Median) */}
                <div className="flex flex-col items-center">
                  <div className="h-4 w-1 rounded-full bg-blue-600 ring-4 ring-blue-100" />
                  <span className="mt-1 text-[11px] font-black uppercase tracking-wider text-blue-600">
                    50th (Median)
                  </span>
                  <span className="rounded-lg bg-blue-50 px-2 py-0.5 text-sm font-black text-blue-900 border border-blue-200">
                    {formatAnnual(result.quartiles.q50, result)}
                  </span>
                </div>

                {/* 75th percentile */}
                <div className="flex flex-col items-center">
                  <div className="h-3 w-0.5 bg-slate-400" />
                  <span className="mt-1 text-[11px] font-bold uppercase tracking-wider text-slate-600">
                    75th (Senior Tier)
                  </span>
                  <span className="text-sm font-extrabold text-slate-800">
                    {formatAnnual(result.quartiles.q75, result)}
                  </span>
                </div>

                {/* 90th percentile */}
                <div className="flex flex-col items-center">
                  <div className="h-3 w-0.5 bg-indigo-600" />
                  <span className="mt-1 text-[11px] font-bold uppercase tracking-wider text-indigo-700">
                    90th (Top 10%)
                  </span>
                  <span className="text-sm font-extrabold text-indigo-900">
                    {formatAnnual(result.quartiles.q90, result)}
                  </span>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 text-xs text-slate-600 flex items-start gap-3">
              <Info size={17} className="mt-0.5 shrink-0 text-blue-600" />
              <span>
                <strong>Benchmark Source &amp; Methodology:</strong> {result.source}. {result.note} Offers in top-tier tech hubs typically index closer to the 75th percentile.
              </span>
            </div>
          </section>

          {/* Career Level Progression Ladder */}
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs sm:p-7">
            <div className="mb-5">
              <h3 className="text-base font-extrabold text-slate-950 flex items-center gap-2">
                <TrendingUp size={18} className="text-emerald-600" />
                Seniority Earning Trajectory for {result.role}
              </h3>
              <p className="text-xs text-slate-500">
                Explore how compensation scales over your 5–10 year career progression
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-5">
              {ladderData.map((step) => (
                <div
                  key={step.level}
                  onClick={() => handleExperienceChange(step.level)}
                  className={`cursor-pointer rounded-2xl border p-4 transition ${
                    step.isCurrent
                      ? 'border-blue-600 bg-blue-50/80 shadow-xs ring-2 ring-blue-300'
                      : 'border-slate-200 bg-white hover:border-blue-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-bold ${step.isCurrent ? 'text-blue-900' : 'text-slate-800'}`}>
                      {step.level}
                    </span>
                    {step.isCurrent && (
                      <span className="rounded-full bg-blue-600 px-1.5 py-0.5 text-[10px] font-bold text-white">
                        Active
                      </span>
                    )}
                  </div>
                  <div className="mt-1 text-[11px] text-slate-500">{step.years}</div>
                  <div className={`mt-3 text-lg font-black ${step.isCurrent ? 'text-blue-700' : 'text-slate-900'}`}>
                    {formatAnnual(step.median, result)}
                  </div>
                  <div className="mt-1 text-[11px] text-slate-500">
                    {formatAnnual(step.min, result)} - {formatAnnual(step.max, result)}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* High Paying Skills & Negotiation Script Grid */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            {/* High Paying Skills */}
            <div className="lg:col-span-5 rounded-3xl border border-slate-200 bg-white p-6 shadow-xs sm:p-7 flex flex-col justify-between">
              <div>
                <h3 className="text-base font-extrabold text-slate-950 flex items-center gap-2">
                  <Sparkles size={18} className="text-amber-500" />
                  High-Value Skills For {result.role}
                </h3>
                <p className="mt-1 text-xs text-slate-500">
                  Skills that drive offers toward the 75th–90th percentile
                </p>

                <div className="mt-5 flex flex-wrap gap-2">
                  {result.top_paying_skills.map((skill) => {
                    const isMatched = parsedSkills.some((s) =>
                      s.toLowerCase().includes(skill.toLowerCase()) || skill.toLowerCase().includes(s.toLowerCase())
                    );
                    return (
                      <span
                        key={skill}
                        className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-bold transition ${
                          isMatched
                            ? 'border-emerald-300 bg-emerald-50 text-emerald-800'
                            : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-blue-300'
                        }`}
                      >
                        {isMatched ? <Check size={13} className="text-emerald-600" /> : <ChevronRight size={13} className="text-slate-400" />}
                        <span>{skill}</span>
                        {isMatched && <span className="text-[10px] text-emerald-600 font-extrabold">(In Resume)</span>}
                      </span>
                    );
                  })}
                </div>
              </div>

              <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50/70 p-4">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-800">
                  <Award size={15} />
                  <span>Strategic Compensation Tip</span>
                </div>
                <p className="mt-1.5 text-xs leading-relaxed text-amber-900">
                  {result.negotiation_tip}
                </p>
              </div>
            </div>

            {/* Negotiation Script Tool */}
            <div className="lg:col-span-7 rounded-3xl border border-slate-200 bg-white p-6 shadow-xs sm:p-7">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div>
                  <h3 className="text-base font-extrabold text-slate-950 flex items-center gap-2">
                    <Briefcase size={18} className="text-blue-600" />
                    Offer Counter &amp; Negotiation Script
                  </h3>
                  <p className="text-xs text-slate-500">
                    Ready-to-use template tailored to your {result.role} role &amp; target market
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleCopyScript}
                  className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold transition active:scale-[0.98] ${
                    copiedScript
                      ? 'border border-emerald-300 bg-emerald-50 text-emerald-700'
                      : 'border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100'
                  }`}
                >
                  {copiedScript ? <Check size={14} /> : <Copy size={14} />}
                  <span>{copiedScript ? 'Copied to Clipboard!' : 'Copy Script'}</span>
                </button>
              </div>

              <div className="mt-4">
                <div className="relative rounded-2xl border border-slate-200 bg-slate-50/70 p-4 font-mono text-xs leading-relaxed text-slate-800 whitespace-pre-wrap max-h-[290px] overflow-y-auto">
                  {negotiationScript}
                </div>
              </div>

              <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500">
                <span>💡 Customize bracketed values before sending to your hiring manager or recruiter.</span>
                <span className="font-semibold text-blue-600">CareerLens Negotiation Suite</span>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default SalaryEstimationView;
