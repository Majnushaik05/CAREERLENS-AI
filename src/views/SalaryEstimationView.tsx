import { useMemo, useState } from 'react';
import {
  AlertCircle,
  Briefcase,
  Loader2,
  MapPin,
  Search,
  TrendingUp,
  Wallet,
} from 'lucide-react';
import {
  safeEstimateSalary,
  type SalaryEstimateResult,
} from '../services/careerService';

const ROLE_EXAMPLES: Record<string, string[]> = {
  'Information Technology': [
    'Software Engineer', 'AI Engineer', 'Data Analyst', 'Data Scientist',
    'Cloud Engineer', 'Cybersecurity Analyst', 'Frontend Developer',
  ],
  Engineering: [
    'Mechanical Engineer', 'Civil Engineer', 'Electrical Engineer',
    'Chemical Engineer', 'Automotive Engineer', 'Manufacturing Engineer',
  ],
  Healthcare: [
    'Doctor', 'Registered Nurse', 'Pharmacist', 'Dentist',
    'Physiotherapist', 'Medical Laboratory Technician',
  ],
  Finance: [
    'Accountant', 'Financial Analyst', 'Auditor', 'Tax Consultant',
    'Banking Associate', 'Financial Manager',
  ],
  Business: [
    'Business Analyst', 'HR Manager', 'Recruiter', 'Project Manager',
    'Operations Manager', 'Supply Chain Manager',
  ],
  'Sales & Marketing': [
    'Digital Marketing Specialist', 'Marketing Manager', 'Sales Executive',
    'Sales Manager', 'Content Writer', 'SEO Specialist',
  ],
  Education: [
    'School Teacher', 'College Professor', 'Lecturer',
    'Corporate Trainer', 'Instructional Designer',
  ],
  'Creative & Media': [
    'Graphic Designer', 'Video Editor', 'Journalist', 'Copywriter',
    'Content Creator', 'Animator',
  ],
  'Hospitality & Trades': [
    'Chef', 'Hotel Manager', 'Electrician', 'Plumber',
    'HVAC Technician', 'Automotive Technician',
  ],
  'Science & Agriculture': [
    'Research Scientist', 'Agricultural Engineer', 'Agronomist',
    'Food Technologist', 'Environmental Scientist',
  ],
  Legal: ['Lawyer', 'Legal Advisor', 'Compliance Officer', 'Paralegal'],
  Other: ['Customer Support Specialist', 'Procurement Specialist', 'Technician'],
};

const EXPERIENCE_LEVELS = [
  'Fresher',
  'Entry Level',
  'Mid Level',
  'Senior',
  'Lead / Manager',
];

const LOCATIONS = ['India', 'North America', 'Europe', 'Global Remote'];

const formatSalary = (
  amount: number,
  result: SalaryEstimateResult,
): string => {
  if (!Number.isFinite(amount)) return 'Not available';

  if (result.currency_code.startsWith('INR')) {
    return `₹${amount.toLocaleString('en-IN', {
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    })} LPA`;
  }

  // International benchmarks are stored as annual thousands in the salary engine.
  const suffix = result.currency_code.includes('thousands') ? 'k / year' : '/ year';
  return `${result.currency_symbol}${Math.round(amount).toLocaleString('en-US')} ${suffix}`;
};

const formatMonthly = (amount: number, result: SalaryEstimateResult): string => {
  if (!Number.isFinite(amount) || amount <= 0) return 'Not available';
  return `${result.currency_symbol}${Math.round(amount).toLocaleString(
    result.currency_code.startsWith('INR') ? 'en-IN' : 'en-US',
  )} / month`;
};

export function SalaryEstimationView() {
  const [industry, setIndustry] = useState('Information Technology');
  const [role, setRole] = useState('');
  const [experience, setExperience] = useState('Fresher');
  const [location, setLocation] = useState('India');
  const [skillsText, setSkillsText] = useState('');
  const [result, setResult] = useState<SalaryEstimateResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const industries = useMemo(() => Object.keys(ROLE_EXAMPLES), []);
  const suggestedRoles = ROLE_EXAMPLES[industry] ?? ROLE_EXAMPLES.Other;

  const runEstimate = async () => {
    const cleanRole = role.trim();
    if (!cleanRole) {
      setError('Enter a job title or choose one of the suggested roles.');
      setResult(null);
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const skills = skillsText
        .split(',')
        .map((skill) => skill.trim())
        .filter(Boolean)
        .slice(0, 30);

      const estimate = await safeEstimateSalary(
        cleanRole,
        experience,
        location,
        skills,
      );

      if (
        !estimate ||
        !Number.isFinite(estimate.median_salary) ||
        estimate.median_salary <= 0
      ) {
        throw new Error('No salary estimate was returned for this job title.');
      }

      setResult(estimate);
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : 'Could not estimate this salary. Please try again.',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="mx-auto w-full max-w-6xl space-y-6 p-4 sm:p-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950 sm:p-6">
        <div className="mb-6 flex items-start gap-3">
          <div className="rounded-xl bg-blue-500/10 p-3 text-blue-600 dark:text-blue-400">
            <Wallet size={25} />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Salary Estimation
            </h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Estimate compensation across industries, job titles, experience levels, and locations.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <div>
            <label htmlFor="salary-industry" className="mb-2 block text-sm font-medium">
              Industry (for role suggestions)
            </label>
            <select
              id="salary-industry"
              value={industry}
              onChange={(event) => setIndustry(event.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-transparent px-4 py-3 text-sm outline-none transition focus:border-blue-500 dark:border-slate-700"
            >
              {industries.map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="salary-role" className="mb-2 block text-sm font-medium">
              Job title
            </label>
            <div className="relative">
              <Briefcase
                size={17}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                id="salary-role"
                value={role}
                onChange={(event) => {
                  setRole(event.target.value);
                  setResult(null);
                  setError('');
                }}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') void runEstimate();
                }}
                placeholder="e.g. Mechanical Engineer, Chef, Accountant"
                maxLength={120}
                className="w-full rounded-xl border border-slate-300 bg-transparent py-3 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 dark:border-slate-700"
              />
            </div>
            <p className="mt-1.5 text-xs text-slate-500">
              Enter any title. You are not limited to the suggestions below.
            </p>
          </div>

          <div>
            <label htmlFor="salary-experience" className="mb-2 block text-sm font-medium">
              Experience level
            </label>
            <select
              id="salary-experience"
              value={experience}
              onChange={(event) => {
                setExperience(event.target.value);
                setResult(null);
              }}
              className="w-full rounded-xl border border-slate-300 bg-transparent px-4 py-3 text-sm outline-none transition focus:border-blue-500 dark:border-slate-700"
            >
              {EXPERIENCE_LEVELS.map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="salary-location" className="mb-2 flex items-center gap-2 text-sm font-medium">
              <MapPin size={16} />
              Job market
            </label>
            <select
              id="salary-location"
              value={location}
              onChange={(event) => {
                setLocation(event.target.value);
                setResult(null);
              }}
              className="w-full rounded-xl border border-slate-300 bg-transparent px-4 py-3 text-sm outline-none transition focus:border-blue-500 dark:border-slate-700"
            >
              {LOCATIONS.map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <label htmlFor="salary-skills" className="mb-2 block text-sm font-medium">
              Your skills (optional)
            </label>
            <input
              id="salary-skills"
              value={skillsText}
              onChange={(event) => {
                setSkillsText(event.target.value);
                setResult(null);
              }}
              placeholder="Comma-separated, e.g. AutoCAD, CAD/CAE, manufacturing"
              maxLength={500}
              className="w-full rounded-xl border border-slate-300 bg-transparent px-4 py-3 text-sm outline-none transition focus:border-blue-500 dark:border-slate-700"
            />
          </div>
        </div>

        <div className="mt-5">
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500">
            Suggested roles
          </p>
          <div className="flex flex-wrap gap-2">
            {suggestedRoles.map((suggestedRole) => (
              <button
                key={suggestedRole}
                type="button"
                onClick={() => {
                  setRole(suggestedRole);
                  setResult(null);
                  setError('');
                }}
                className="rounded-full border border-slate-200 px-3 py-1.5 text-xs transition hover:border-blue-500 hover:bg-blue-50 hover:text-blue-700 dark:border-slate-700 dark:hover:bg-blue-950/40 dark:hover:text-blue-300"
              >
                {suggestedRole}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div role="alert" className="mt-5 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300">
            <AlertCircle size={18} className="mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <button
          type="button"
          onClick={() => void runEstimate()}
          disabled={loading || !role.trim()}
          className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
        >
          {loading ? <Loader2 size={18} className="animate-spin" /> : <Search size={18} />}
          {loading ? 'Estimating…' : 'Estimate salary'}
        </button>
      </section>

      {result && (
        <section aria-live="polite" className="space-y-5">
          <div>
            <h2 className="text-xl font-bold">Estimated compensation</h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              {result.role} · {result.experience} · {result.location}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <article className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-950">
              <p className="text-sm text-slate-500">Estimated minimum</p>
              <p className="mt-2 text-xl font-bold">{formatSalary(result.min_salary, result)}</p>
            </article>
            <article className="rounded-2xl border border-blue-300 bg-blue-50 p-5 dark:border-blue-900 dark:bg-blue-950/30">
              <p className="text-sm text-blue-800 dark:text-blue-300">Estimated median</p>
              <p className="mt-2 text-2xl font-bold text-blue-700 dark:text-blue-300">
                {formatSalary(result.median_salary, result)}
              </p>
            </article>
            <article className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-950">
              <p className="text-sm text-slate-500">Estimated maximum</p>
              <p className="mt-2 text-xl font-bold">{formatSalary(result.max_salary, result)}</p>
            </article>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <article className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-950">
              <p className="text-sm text-slate-500">Approximate monthly take-home</p>
              <p className="mt-2 text-xl font-bold">{formatMonthly(result.monthly_in_hand, result)}</p>
              <p className="mt-2 text-xs leading-5 text-slate-500">
                A rough planning figure only; taxes, benefits, deductions, and country-specific rules can change actual take-home pay.
              </p>
            </article>
            <article className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-950">
              <h3 className="flex items-center gap-2 font-semibold">
                <TrendingUp size={18} />
                Bonus benchmark
              </h3>
              <p className="mt-2 text-xl font-bold">{result.bonus_percentage}</p>
              <p className="mt-2 text-xs leading-5 text-slate-500">
                Indicative only; bonus availability varies by employer and profession.
              </p>
            </article>
          </div>

          <article className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-950">
            <h3 className="font-semibold">Relevant skills for this role</h3>
            {result.top_paying_skills.length ? (
              <div className="mt-3 flex flex-wrap gap-2">
                {result.top_paying_skills.map((skill) => (
                  <span key={skill} className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1.5 text-sm text-blue-800 dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-300">
                    {skill}
                  </span>
                ))}
              </div>
            ) : (
              <p className="mt-2 text-sm text-slate-500">No role-specific skills are available for this title yet.</p>
            )}
          </article>

          <article className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-950">
            <h3 className="font-semibold">Negotiation guidance</h3>
            <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{result.negotiation_tip}</p>
            <p className="mt-3 text-xs leading-5 text-slate-500">
              {result.note} {result.source ? `Benchmark: ${result.source}.` : ''}
            </p>
          </article>
        </section>
      )}
    </main>
  );
}

export default SalaryEstimationView;
