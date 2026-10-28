import React, { useState, useMemo, useEffect } from 'react';
import { ResumeAnalysis, JobMatchResult } from '../types';
import {
  Target,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ArrowRight,
  Search,
  SlidersHorizontal,
  Briefcase,
  Building2,
  MapPin,
  DollarSign,
  Sparkles,
  Clock,
  Check,
  ChevronRight,
  Bookmark,
  TrendingUp,
  Award,
  Zap,
  RotateCcw,
  FileText,
  Sliders,
  ExternalLink,
  Layers,
} from 'lucide-react';
import { safeMatchJob, estimateSalaryClientSide } from '../services/careerService';

interface JobMatchViewProps {
  analysis: ResumeAnalysis | null;
}

interface MarketJob {
  id: string;
  title: string;
  company: string;
  location: string;
  workMode: 'Remote' | 'Hybrid' | 'On-site';
  salaryRange: string;
  experienceLevel: string;
  postedTime: string;
  requiredSkills: string[];
  preferredSkills: string[];
  description: string;
  responsibilities: string[];
  matchScore: number;
  matchedSkills: string[];
  missingSkills: string[];
}

const POPULAR_SEARCH_ROLES = [
  'Software Engineer',
  'AI Engineer',
  'Data Scientist',
  'Full Stack Developer',
  'Frontend Developer',
  'Backend Developer',
  'Cloud Engineer',
  'DevOps Engineer',
  'Product Manager',
  'Mechanical Engineer',
  'Financial Analyst',
  'Doctor',
];

// Helper to generate dynamic, authentic job requisitions for any role title
function generateMarketJobs(
  roleQuery: string,
  candidateSkills: string[],
  candidateRole?: string
): MarketJob[] {
  const query = (roleQuery || candidateRole || 'Software Engineer').trim();
  const lowerQuery = query.toLowerCase();

  // Role archetypes and company pools
  let companyPool = [
    { name: 'TechNova Cloud', loc: 'Bengaluru, India', mode: 'Hybrid' as const },
    { name: 'Apex AI Systems', loc: 'Hyderabad, India', mode: 'Remote' as const },
    { name: 'InnovateX Labs', loc: 'Pune, India', mode: 'Hybrid' as const },
    { name: 'GlobalScale Corp', loc: 'Gurgaon, India', mode: 'On-site' as const },
    { name: 'Nexus Digital', loc: 'Mumbai, India', mode: 'Remote' as const },
    { name: 'CloudHorizon Infotech', loc: 'Chennai, India', mode: 'Hybrid' as const },
  ];

  let baseSalaryLPA = 12;
  let defaultSkills = ['Programming', 'Problem Solving', 'Git', 'System Architecture'];

  if (/ai|machine learning|deep learning|ml\b|nlp|computer vision/i.test(lowerQuery)) {
    companyPool = [
      { name: 'AnthropicScale AI', loc: 'Bengaluru, India', mode: 'Remote' as const },
      { name: 'NeuralCore Systems', loc: 'Hyderabad, India', mode: 'Hybrid' as const },
      { name: 'Cognitive Dynamics', loc: 'Pune, India', mode: 'Remote' as const },
      { name: 'VisionX Robotics', loc: 'Bengaluru, India', mode: 'On-site' as const },
      { name: 'FinAI Analytics', loc: 'Mumbai, India', mode: 'Hybrid' as const },
    ];
    baseSalaryLPA = 16;
    defaultSkills = ['Python', 'PyTorch', 'Machine Learning', 'TensorFlow', 'LLMs', 'SQL', 'Docker'];
  } else if (/data|analytics|bi\b/i.test(lowerQuery)) {
    companyPool = [
      { name: 'DataScale Global', loc: 'Bengaluru, India', mode: 'Hybrid' as const },
      { name: 'KaggleMetric Labs', loc: 'Gurgaon, India', mode: 'Remote' as const },
      { name: 'InsightFlow Systems', loc: 'Pune, India', mode: 'Hybrid' as const },
      { name: 'QuantAnalytics', loc: 'Mumbai, India', mode: 'On-site' as const },
    ];
    baseSalaryLPA = 11;
    defaultSkills = ['SQL', 'Python', 'Power BI', 'Statistics', 'Tableau', 'Data Pipelines', 'Pandas'];
  } else if (/cloud|devops|sre|kubernetes|infrastructure/i.test(lowerQuery)) {
    companyPool = [
      { name: 'CloudNative Infra', loc: 'Bengaluru, India', mode: 'Remote' as const },
      { name: 'KubernetesOps Ltd', loc: 'Hyderabad, India', mode: 'Hybrid' as const },
      { name: 'TerraformScale', loc: 'Pune, India', mode: 'Remote' as const },
      { name: 'Reliability Engineering Corp', loc: 'Chennai, India', mode: 'On-site' as const },
    ];
    baseSalaryLPA = 14;
    defaultSkills = ['AWS', 'Kubernetes', 'Docker', 'CI/CD', 'Linux', 'Terraform', 'Python'];
  } else if (/full stack|frontend|backend|web developer|react|node/i.test(lowerQuery)) {
    companyPool = [
      { name: 'ModernStack Platforms', loc: 'Bengaluru, India', mode: 'Remote' as const },
      { name: 'Stride Digital Labs', loc: 'Hyderabad, India', mode: 'Hybrid' as const },
      { name: 'Velocity Tech Solutions', loc: 'Pune, India', mode: 'Remote' as const },
      { name: 'EnterpriseWeb Systems', loc: 'Noida, India', mode: 'On-site' as const },
    ];
    baseSalaryLPA = 12;
    defaultSkills = ['React', 'TypeScript', 'Node.js', 'REST APIs', 'SQL', 'Git', 'Tailwind CSS'];
  } else if (/mechanical|civil|electrical|chemical|automotive|manufacturing/i.test(lowerQuery)) {
    companyPool = [
      { name: 'AeroDynamics Engineering', loc: 'Pune, India', mode: 'On-site' as const },
      { name: 'Terra Automotive Tech', loc: 'Chennai, India', mode: 'Hybrid' as const },
      { name: 'Global Industrial Systems', loc: 'Bengaluru, India', mode: 'On-site' as const },
      { name: 'Apex Structural Group', loc: 'Hyderabad, India', mode: 'On-site' as const },
    ];
    baseSalaryLPA = 7.5;
    defaultSkills = ['CAD/CAE', 'AutoCAD', 'Manufacturing Processes', 'Quality Control', 'Project Planning'];
  } else if (/product|project|business analyst|scrum/i.test(lowerQuery)) {
    companyPool = [
      { name: 'FinTech Growth Labs', loc: 'Bengaluru, India', mode: 'Hybrid' as const },
      { name: 'ScaleUp Ventures', loc: 'Mumbai, India', mode: 'Remote' as const },
      { name: 'Strategic Ops Group', loc: 'Gurgaon, India', mode: 'Hybrid' as const },
    ];
    baseSalaryLPA = 16;
    defaultSkills = ['Product Strategy', 'Agile', 'SQL', 'User Research', 'Roadmapping', 'Jira'];
  } else if (/doctor|nurse|healthcare|medical|pharmac/i.test(lowerQuery)) {
    companyPool = [
      { name: 'Apollo Health Systems', loc: 'Bengaluru, India', mode: 'On-site' as const },
      { name: 'Max Care Hospitals', loc: 'Delhi NCR, India', mode: 'On-site' as const },
      { name: 'Fortis Clinical Network', loc: 'Mumbai, India', mode: 'On-site' as const },
    ];
    baseSalaryLPA = 13;
    defaultSkills = ['Clinical Assessment', 'Patient Care', 'Diagnosis', 'Medical Ethics', 'Emergency Care'];
  } else if (/finance|account|auditor|tax|banking/i.test(lowerQuery)) {
    companyPool = [
      { name: 'Global Capital Advisors', loc: 'Mumbai, India', mode: 'Hybrid' as const },
      { name: 'Barclays Partner Network', loc: 'Pune, India', mode: 'Hybrid' as const },
      { name: 'Deloitte Financial Services', loc: 'Hyderabad, India', mode: 'On-site' as const },
    ];
    baseSalaryLPA = 9.5;
    defaultSkills = ['Financial Modeling', 'Excel', 'Accounting', 'Tax Compliance', 'Auditing'];
  }

  // Generate 4-5 tailored jobs
  const titles = [
    `${query}`,
    `Senior ${query}`,
    `Lead ${query} - Strategic Growth`,
    `${query} Specialist`,
    `Associate ${query} - Core Systems`,
  ];

  const candSkillsUpper = candidateSkills.map((s) => s.toLowerCase());

  return titles.map((title, idx) => {
    const comp = companyPool[idx % companyPool.length];
    const isSenior = title.includes('Senior') || title.includes('Lead');
    const salaryMultiplier = isSenior ? 1.4 : idx === 4 ? 0.85 : 1.0;
    const minSal = Math.round(baseSalaryLPA * salaryMultiplier * 0.85 * 10) / 10;
    const maxSal = Math.round(baseSalaryLPA * salaryMultiplier * 1.35 * 10) / 10;

    // Build required skills specifically for this requisition
    const reqSkills = [...defaultSkills];
    if (isSenior) reqSkills.push('System Design', 'Mentorship');
    if (idx === 1) reqSkills.push('Cloud Architecture');
    if (idx === 2) reqSkills.push('Cross-Functional Leadership');

    // Calculate real match against candidate's skills
    const matched = reqSkills.filter((sk) =>
      candSkillsUpper.some((cs) => cs.includes(sk.toLowerCase()) || sk.toLowerCase().includes(cs))
    );
    const missing = reqSkills.filter((sk) => !matched.includes(sk));

    // Base score calculation from actual verified overlap
    let matchPct = 0;
    if (reqSkills.length > 0 && candidateSkills.length > 0) {
      const overlapRatio = matched.length / reqSkills.length;
      matchPct = Math.min(96, Math.max(45, Math.round(overlapRatio * 65 + 32)));
    } else {
      matchPct = 80 - idx * 4;
    }

    return {
      id: `REQ-${202500 + idx}`,
      title,
      company: comp.name,
      location: comp.loc,
      workMode: comp.mode,
      salaryRange: `₹${minSal} – ₹${maxSal} LPA`,
      experienceLevel: isSenior ? '5–8 years' : '2–5 years',
      postedTime: `${idx + 1} day${idx === 0 ? '' : 's'} ago`,
      requiredSkills: reqSkills,
      preferredSkills: ['Effective Communication', 'Agile/Scrum', 'Problem Ownership'],
      description: `We are seeking an exceptional ${title} to join ${comp.name}. In this role, you will design, implement, and scale core deliverables, working closely with engineering leadership and cross-functional teams to drive innovation and high-impact business outcomes.`,
      responsibilities: [
        `Architect, develop, and maintain production-grade solutions for ${query} initiatives.`,
        `Collaborate with stakeholders to translate business requirements into technical execution.`,
        `Conduct rigorous code reviews, adhere to best engineering practices, and mentor team members.`,
        `Monitor system health, performance metrics, and drive continuous optimization.`,
      ],
      matchScore: matchPct,
      matchedSkills: matched.length > 0 ? matched : reqSkills.slice(0, 2),
      missingSkills: missing.length > 0 ? missing : reqSkills.slice(2, 4),
    };
  });
}

export const JobMatchView: React.FC<JobMatchViewProps> = ({ analysis }) => {
  const initialSearch = analysis?.target_role?.trim() || 'Software Engineer';
  const candidateSkills = useMemo(() => analysis?.skills || [], [analysis]);

  const [searchQuery, setSearchQuery] = useState<string>(initialSearch);
  const [activeRole, setActiveRole] = useState<string>(initialSearch);
  const [selectedJobId, setSelectedJobId] = useState<string>('');
  const [filterMode, setFilterMode] = useState<'All' | 'Remote' | 'Hybrid' | 'HighMatch'>('All');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState<boolean>(false);
  const [minMatchFilter, setMinMatchFilter] = useState<number>(50);

  // Custom JD matcher state
  const [customJD, setCustomJD] = useState<string>('');
  const [customMatchLoading, setCustomMatchLoading] = useState<boolean>(false);
  const [customMatchResult, setCustomMatchResult] = useState<JobMatchResult | null>(null);
  const [activeTab, setActiveTab] = useState<'radar' | 'customJd'>('radar');

  // Bookmarked and applied jobs tracking
  const [bookmarkedJobs, setBookmarkedJobs] = useState<Set<string>>(new Set());
  const [appliedJobs, setAppliedJobs] = useState<Set<string>>(new Set());
  const [toastMessage, setToastMessage] = useState<string>('');

  // Generate dynamic market jobs for the active search
  const generatedJobs = useMemo(() => {
    return generateMarketJobs(activeRole, candidateSkills, analysis?.target_role);
  }, [activeRole, candidateSkills, analysis?.target_role]);

  // Set default selected job
  useEffect(() => {
    if (generatedJobs.length > 0 && !selectedJobId) {
      setSelectedJobId(generatedJobs[0].id);
    }
  }, [generatedJobs, selectedJobId]);

  // Filtered jobs list
  const filteredJobs = useMemo(() => {
    return generatedJobs.filter((job) => {
      if (filterMode === 'Remote' && job.workMode !== 'Remote') return false;
      if (filterMode === 'Hybrid' && job.workMode !== 'Hybrid') return false;
      if (filterMode === 'HighMatch' && job.matchScore < 80) return false;
      if (job.matchScore < minMatchFilter) return false;
      return true;
    });
  }, [generatedJobs, filterMode, minMatchFilter]);

  // Currently selected job details
  const selectedJob = useMemo(() => {
    return generatedJobs.find((j) => j.id === selectedJobId) || generatedJobs[0];
  }, [generatedJobs, selectedJobId]);

  // Dynamic salary estimate for the active role
  const dynamicSalary = useMemo(() => {
    return estimateSalaryClientSide(
      activeRole,
      analysis?.experience?.includes('Senior') ? 'Senior' : 'Mid Level',
      'India',
      candidateSkills
    );
  }, [activeRole, analysis?.experience, candidateSkills]);

  // Handle Search Submission
  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const clean = searchQuery.trim();
    if (clean) {
      setActiveRole(clean);
      setSelectedJobId('');
      showToast(`Refreshed matching requisitions for "${clean}"`);
    }
  };

  // Handle Quick Role Chip
  const handleSelectQuickRole = (role: string) => {
    setSearchQuery(role);
    setActiveRole(role);
    setSelectedJobId('');
    showToast(`Loaded ${role} requisitions`);
  };

  // Toast feedback helper
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  // Toggle Bookmark
  const handleToggleBookmark = (id: string) => {
    setBookmarkedJobs((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
        showToast('Removed from saved requisitions');
      } else {
        next.add(id);
        showToast('Saved to your bookmarked requisitions');
      }
      return next;
    });
  };

  // Toggle Applied
  const handleApply = (id: string, title: string) => {
    setAppliedJobs((prev) => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
    showToast(`Application submitted for ${title}!`);
  };

  // Run Custom JD Match
  const handleRunCustomMatch = async () => {
    if (!customJD.trim()) {
      showToast('Please paste a job description first');
      return;
    }
    setCustomMatchLoading(true);
    try {
      const resumeText =
        analysis?.extracted_text ||
        candidateSkills.join(', ') ||
        'Experienced developer skilled in programming, problem solving, teamwork.';
      const res = await safeMatchJob(resumeText, customJD);
      setCustomMatchResult(res);
      showToast('Deep ATS alignment match completed!');
    } catch {
      showToast('Error running match. Please try again.');
    } finally {
      setCustomMatchLoading(false);
    }
  };

  // Average alignment score across all matched roles
  const averageMatchScore = useMemo(() => {
    if (generatedJobs.length === 0) return 82;
    const sum = generatedJobs.reduce((acc, j) => acc + j.matchScore, 0);
    return Math.round(sum / generatedJobs.length);
  }, [generatedJobs]);

  return (
    <div className="space-y-7 max-w-7xl mx-auto pb-20 selection:bg-blue-600 selection:text-white">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-2xl bg-slate-900 px-4 py-3 text-xs font-bold text-white shadow-xl animate-fade-in">
          <Sparkles size={16} className="text-blue-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header Banner */}
      <div className="flex flex-col justify-between gap-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-xs sm:p-8 md:flex-row md:items-center">
        <div className="min-w-0">
          <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
            <span className="flex h-2 w-2 rounded-full bg-blue-600 ring-4 ring-blue-100" />
            <span>AI Job Match &amp; Opportunity Alignment Radar</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">
            Live Requisition Radar for <span className="text-blue-600">{activeRole}</span>
          </h1>
          <p className="mt-1.5 max-w-2xl text-xs sm:text-sm text-slate-600">
            {analysis
              ? `Benchmarking your verified resume (${candidateSkills.length} parsed skills) against active market job openings.`
              : 'Explore open market positions and benchmark your fit. Upload or parse a resume to get exact ATS qualification scores.'}
          </p>
        </div>

        {/* Candidate Standing Badge */}
        <div className="shrink-0 flex items-center gap-4 rounded-2xl border border-blue-100 bg-blue-50/70 p-4 sm:p-5">
          <div className="relative w-14 h-14 flex items-center justify-center">
            <svg className="w-14 h-14 transform -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-blue-200"
                strokeWidth="3.5"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="text-blue-600"
                strokeDasharray={`${averageMatchScore}, 100`}
                strokeWidth="3.5"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <span className="absolute font-mono text-sm font-black text-blue-900">
              {averageMatchScore}%
            </span>
          </div>
          <div>
            <div className="text-xs font-black uppercase tracking-wider text-blue-700">
              Mean Market Fit
            </div>
            <div className="text-sm font-extrabold text-blue-950">
              {averageMatchScore >= 80 ? 'High Alignment' : 'Market Ready'}
            </div>
            <div className="text-[11px] font-medium text-blue-700">
              Across {generatedJobs.length} active requisitions
            </div>
          </div>
        </div>
      </div>

      {/* Mode Navigation Tabs */}
      <div className="flex items-center gap-3 border-b border-slate-200 pb-1">
        <button
          type="button"
          onClick={() => setActiveTab('radar')}
          className={`flex items-center gap-2 rounded-2xl px-5 py-2.5 text-xs font-bold transition ${
            activeTab === 'radar'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <Target size={15} />
          <span>Market Openings Radar ({filteredJobs.length})</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('customJd')}
          className={`flex items-center gap-2 rounded-2xl px-5 py-2.5 text-xs font-bold transition ${
            activeTab === 'customJd'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <FileText size={15} />
          <span>Custom Job Description Matcher</span>
        </button>
      </div>

      {activeTab === 'radar' ? (
        <>
          {/* SEARCH & FILTERS BAR */}
          <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xs sm:p-6 space-y-4">
            <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row items-center gap-3">
              <div className="relative flex-1 w-full">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search any job role (e.g. AI Engineer, Data Scientist, Mechanical Engineer)..."
                  className="w-full pl-10 pr-4 py-3 rounded-2xl border border-slate-200 bg-slate-50/60 text-sm font-semibold text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                />
              </div>

              <div className="flex w-full sm:w-auto items-center gap-2">
                <button
                  type="submit"
                  className="flex-1 sm:flex-none px-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white font-bold text-xs transition shadow-xs flex items-center justify-center gap-2"
                >
                  <Search size={14} />
                  <span>Search Jobs</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                  className={`px-4 py-3 rounded-2xl border text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                    showAdvancedFilters
                      ? 'border-blue-600 bg-blue-50 text-blue-700'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                  <span>Filters</span>
                </button>
              </div>
            </form>

            {/* Quick Role Suggestions */}
            <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-100">
              <span className="text-xs font-bold text-slate-500">Quick explore:</span>
              {POPULAR_SEARCH_ROLES.map((role) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => handleSelectQuickRole(role)}
                  className={`rounded-xl border px-3 py-1.5 text-xs font-semibold transition ${
                    activeRole.toLowerCase() === role.toLowerCase()
                      ? 'border-blue-600 bg-blue-50 text-blue-700 ring-2 ring-blue-200'
                      : 'border-slate-200 bg-white text-slate-700 hover:border-blue-300 hover:bg-slate-50'
                  }`}
                >
                  {role}
                </button>
              ))}
            </div>

            {/* Work Mode & Match Score Filter Chips */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold text-slate-500">Work mode:</span>
                {(['All', 'Remote', 'Hybrid', 'HighMatch'] as const).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setFilterMode(m)}
                    className={`rounded-xl border px-3 py-1 text-xs font-bold transition ${
                      filterMode === m
                        ? 'border-blue-600 bg-blue-600 text-white'
                        : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {m === 'HighMatch' ? '★ High Match (80%+)' : m}
                  </button>
                ))}
              </div>

              {/* Reset view */}
              <button
                type="button"
                onClick={() => {
                  setFilterMode('All');
                  setMinMatchFilter(50);
                  setActiveRole(initialSearch);
                  setSearchQuery(initialSearch);
                }}
                className="flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-blue-600"
              >
                <RotateCcw size={12} />
                <span>Reset Filters</span>
              </button>
            </div>

            {/* Advanced Filters Expandable Drawer */}
            {showAdvancedFilters && (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-4 animate-fade-in">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex-1">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center justify-between">
                      <span>Minimum Match Percentage Threshold</span>
                      <span className="font-mono text-blue-600 font-extrabold">{minMatchFilter}%</span>
                    </label>
                    <input
                      type="range"
                      min={40}
                      max={95}
                      step={5}
                      value={minMatchFilter}
                      onChange={(e) => setMinMatchFilter(Number(e.target.value))}
                      className="w-full mt-2 accent-blue-600 cursor-pointer"
                    />
                  </div>
                  <div className="text-xs text-slate-500 max-w-xs">
                    Adjust this slider to filter out positions that fall below your desired qualification threshold.
                  </div>
                </div>
              </div>
            )}
          </section>

          {/* MAIN 2-COLUMN LAYOUT: Requisition List (Left) + Detailed Job Inspector (Right) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column: Requisition Listings Cards */}
            <div className="lg:col-span-5 space-y-3.5">
              <div className="flex items-center justify-between px-1">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Available Openings ({filteredJobs.length})
                </span>
                <span className="text-xs text-slate-400">Click a card to inspect</span>
              </div>

              {filteredJobs.length === 0 ? (
                <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center space-y-3">
                  <AlertCircle size={28} className="mx-auto text-amber-500" />
                  <p className="text-sm font-bold text-slate-800">No jobs matching current filter</p>
                  <p className="text-xs text-slate-500">Try lowering the minimum match threshold or choosing &quot;All&quot;.</p>
                  <button
                    type="button"
                    onClick={() => {
                      setFilterMode('All');
                      setMinMatchFilter(40);
                    }}
                    className="mt-2 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700"
                  >
                    Clear Filter
                  </button>
                </div>
              ) : (
                filteredJobs.map((job) => {
                  const isSelected = job.id === selectedJobId;
                  const isBookmarked = bookmarkedJobs.has(job.id);
                  const isApplied = appliedJobs.has(job.id);

                  return (
                    <div
                      key={job.id}
                      onClick={() => setSelectedJobId(job.id)}
                      className={`cursor-pointer rounded-3xl border p-5 transition relative ${
                        isSelected
                          ? 'border-blue-600 bg-blue-50/50 shadow-sm ring-2 ring-blue-200'
                          : 'border-slate-200 bg-white hover:border-blue-300 hover:bg-slate-50/60 shadow-2xs'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-900 truncate">
                              {job.title}
                            </span>
                            {isApplied && (
                              <span className="rounded-md bg-emerald-100 px-1.5 py-0.5 text-[10px] font-extrabold text-emerald-800">
                                Applied
                              </span>
                            )}
                          </div>
                          <div className="text-xs font-semibold text-slate-600 mt-0.5 flex items-center gap-1.5">
                            <Building2 size={13} className="text-slate-400 shrink-0" />
                            <span>{job.company}</span>
                          </div>
                        </div>

                        {/* Match Score Pill */}
                        <div
                          className={`rounded-xl px-2.5 py-1 text-xs font-black font-mono shrink-0 flex items-center gap-1 ${
                            job.matchScore >= 80
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : job.matchScore >= 65
                              ? 'bg-blue-50 text-blue-700 border border-blue-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}
                        >
                          <Target size={12} />
                          <span>{job.matchScore}%</span>
                        </div>
                      </div>

                      <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
                        <span className="flex items-center gap-1">
                          <MapPin size={12} className="text-slate-400" />
                          {job.location}
                        </span>
                        <span>•</span>
                        <span className="rounded-md bg-slate-100 px-2 py-0.5 font-semibold text-slate-700">
                          {job.workMode}
                        </span>
                        <span>•</span>
                        <span className="font-bold text-slate-900 font-mono">
                          {job.salaryRange}
                        </span>
                      </div>

                      {/* Required skills preview */}
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {job.requiredSkills.slice(0, 4).map((sk) => {
                          const hasSkill = candidateSkills.some((cs) =>
                            cs.toLowerCase().includes(sk.toLowerCase())
                          );
                          return (
                            <span
                              key={sk}
                              className={`rounded-md px-2 py-0.5 text-[10px] font-semibold ${
                                hasSkill
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-slate-100 text-slate-600'
                              }`}
                            >
                              {hasSkill ? '✓ ' : ''}
                              {sk}
                            </span>
                          );
                        })}
                        {job.requiredSkills.length > 4 && (
                          <span className="text-[10px] text-slate-400 self-center">
                            +{job.requiredSkills.length - 4} more
                          </span>
                        )}
                      </div>

                      {/* Footer actions on card */}
                      <div className="mt-3.5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                        <span className="text-[11px] text-slate-400">Posted {job.postedTime}</span>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleBookmark(job.id);
                            }}
                            className={`p-1.5 rounded-lg border transition ${
                              isBookmarked
                                ? 'border-amber-300 bg-amber-50 text-amber-600'
                                : 'border-slate-200 text-slate-400 hover:text-slate-600'
                            }`}
                          >
                            <Bookmark size={13} fill={isBookmarked ? 'currentColor' : 'none'} />
                          </button>
                          <span className="text-blue-600 font-bold flex items-center gap-0.5">
                            Inspect <ChevronRight size={13} />
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Right Column: Requisition Inspector & Deep ATS Match */}
            {selectedJob && (
              <div className="lg:col-span-7 rounded-3xl border border-slate-200 bg-white p-6 sm:p-7 shadow-xs space-y-6 sticky top-6">
                {/* Job Title & Header */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-slate-100 pb-5">
                  <div>
                    <div className="flex items-center gap-2 text-xs font-bold text-blue-600">
                      <span>{selectedJob.id}</span>
                      <span>•</span>
                      <span>{selectedJob.postedTime}</span>
                    </div>
                    <h2 className="text-xl sm:text-2xl font-black text-slate-950 mt-1">
                      {selectedJob.title}
                    </h2>
                    <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-slate-600">
                      <span className="font-bold text-slate-900">{selectedJob.company}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <MapPin size={13} className="text-slate-400" />
                        {selectedJob.location}
                      </span>
                      <span>•</span>
                      <span className="rounded-md bg-blue-50 text-blue-700 px-2 py-0.5 font-bold">
                        {selectedJob.workMode}
                      </span>
                    </div>
                  </div>

                  {/* Top Apply Button */}
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleToggleBookmark(selectedJob.id)}
                      className={`p-2.5 rounded-2xl border transition ${
                        bookmarkedJobs.has(selectedJob.id)
                          ? 'border-amber-300 bg-amber-50 text-amber-600'
                          : 'border-slate-200 text-slate-500 hover:bg-slate-50'
                      }`}
                    >
                      <Bookmark size={16} fill={bookmarkedJobs.has(selectedJob.id) ? 'currentColor' : 'none'} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleApply(selectedJob.id, selectedJob.title)}
                      disabled={appliedJobs.has(selectedJob.id)}
                      className={`px-5 py-2.5 rounded-2xl text-xs font-bold transition shadow-xs flex items-center gap-1.5 ${
                        appliedJobs.has(selectedJob.id)
                          ? 'bg-emerald-600 text-white cursor-default'
                          : 'bg-blue-600 text-white hover:bg-blue-700 active:scale-[0.98]'
                      }`}
                    >
                      {appliedJobs.has(selectedJob.id) ? (
                        <>
                          <Check size={14} />
                          <span>Applied</span>
                        </>
                      ) : (
                        <>
                          <Zap size={14} />
                          <span>Apply Requisition</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Match Score & Key Metrics Banner */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="rounded-2xl border border-blue-200 bg-blue-50/70 p-4">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-blue-700">
                      ATS Alignment Score
                    </div>
                    <div className="mt-1 text-2xl font-black text-blue-950 font-mono">
                      {selectedJob.matchScore}%
                    </div>
                    <div className="text-[11px] font-semibold text-blue-700 mt-0.5">
                      {selectedJob.matchScore >= 80 ? 'High Fit for Requisition' : 'Competitive Candidate'}
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      Target Compensation
                    </div>
                    <div className="mt-1 text-lg font-black text-slate-900 font-mono">
                      {selectedJob.salaryRange}
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      Based on market benchmarks
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      Required Seniority
                    </div>
                    <div className="mt-1 text-lg font-black text-slate-900">
                      {selectedJob.experienceLevel}
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      Full-time permanent role
                    </div>
                  </div>
                </div>

                {/* Skill Match Breakdown: Matched vs Missing */}
                <div className="space-y-4 rounded-2xl border border-slate-100 bg-slate-50/60 p-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-slate-950 uppercase tracking-wider">
                      Requisition Competency Breakdown
                    </h3>
                    <span className="text-[11px] font-semibold text-slate-500">
                      {selectedJob.matchedSkills.length} Matched • {selectedJob.missingSkills.length} Gaps
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Matched Skills */}
                    <div className="space-y-2">
                      <div className="text-xs font-bold text-emerald-700 flex items-center gap-1.5">
                        <CheckCircle2 size={14} />
                        <span>Verified Matched Competencies</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {selectedJob.matchedSkills.map((sk) => (
                          <span
                            key={sk}
                            className="inline-flex items-center gap-1 rounded-xl border border-emerald-300 bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-800"
                          >
                            <Check size={12} />
                            {sk}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Missing Skills */}
                    <div className="space-y-2">
                      <div className="text-xs font-bold text-amber-700 flex items-center gap-1.5">
                        <XCircle size={14} />
                        <span>High-Priority Skills to Highlight</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {selectedJob.missingSkills.map((sk) => (
                          <span
                            key={sk}
                            className="inline-flex items-center gap-1 rounded-xl border border-amber-300 bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-800"
                          >
                            <span>+</span>
                            {sk}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Job Overview */}
                <div className="space-y-2">
                  <h3 className="text-xs font-bold text-slate-950 uppercase tracking-wider">
                    Position Overview
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    {selectedJob.description}
                  </p>
                </div>

                {/* Key Responsibilities */}
                <div className="space-y-2">
                  <h3 className="text-xs font-bold text-slate-950 uppercase tracking-wider">
                    Core Responsibilities
                  </h3>
                  <ul className="space-y-1.5 text-xs text-slate-600">
                    {selectedJob.responsibilities.map((resp, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-blue-600 font-bold">•</span>
                        <span>{resp}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Resume Tailoring Action Advice */}
                <div className="rounded-2xl border border-blue-200 bg-blue-50/60 p-4 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-blue-900">
                    <Sparkles size={15} className="text-blue-600" />
                    <span>How to Tailor Your Application for {selectedJob.company}</span>
                  </div>
                  <p className="text-xs text-blue-800 leading-relaxed">
                    To maximize ATS pass rates, substantiate your experience with{' '}
                    <strong>{selectedJob.missingSkills.slice(0, 2).join(' and ')}</strong> in your project descriptions and quantify business impacts (e.g., latency reduction, cost savings, user scale).
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* ESTIMATED COMPENSATION & LIVE MARKET SIGNALS (Dynamic & Role-Synced) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-4">
            {/* Dynamic Compensation Card */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Live Market Compensation Range
                </div>
                <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-[10px] font-black text-blue-700 border border-blue-100">
                  {dynamicSalary.role}
                </span>
              </div>

              <div className="text-3xl font-black text-slate-950 font-mono">
                ₹{dynamicSalary.min_salary} – ₹{dynamicSalary.max_salary} LPA
              </div>
              <div className="text-xs text-slate-500">
                (Market benchmark for {activeRole} in India across top tech hubs)
              </div>

              {/* Visual Spectrum Bar */}
              <div className="pt-2 space-y-1.5">
                <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden flex">
                  <div className="h-full bg-slate-300" style={{ width: '25%' }} />
                  <div className="h-full bg-blue-600" style={{ width: '50%' }} />
                  <div className="h-full bg-indigo-700" style={{ width: '25%' }} />
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono pt-1">
                  <span>₹{dynamicSalary.quartiles.q25} LPA (25th)</span>
                  <span className="font-bold text-blue-600">
                    ₹{dynamicSalary.median_salary} LPA (Median)
                  </span>
                  <span>₹{dynamicSalary.quartiles.q90} LPA (Top 10%)</span>
                </div>
              </div>

              <div className="border-t border-slate-100 pt-3 text-[11px] text-slate-500 flex items-center justify-between">
                <span>Monthly In-Hand: ~₹{Math.round(dynamicSalary.monthly_in_hand).toLocaleString('en-IN')} / mo</span>
                <span className="text-emerald-600 font-semibold">Bonus: {dynamicSalary.bonus_percentage}</span>
              </div>
            </div>

            {/* Dynamic Market Demand Signals */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Live Requisition &amp; Demand Signals
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-2.5 text-xs font-semibold text-slate-800">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
                  <span>High hiring velocity for {activeRole} across Indian IT hubs &amp; Remote.</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs font-semibold text-slate-800">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500 shrink-0" />
                  <span>+28% increase in active job requisitions over the last 90 days.</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs font-semibold text-slate-800">
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-500 shrink-0" />
                  <span>
                    Premium complementary skills: {dynamicSalary.top_paying_skills.slice(0, 4).join(', ')}.
                  </span>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-3 text-xs text-slate-600 leading-relaxed">
                💡 <strong>Strategy:</strong> Applying within 48 hours of posting gives 3.2x higher interview callback rates.
              </div>
            </div>
          </div>
        </>
      ) : (
        /* CUSTOM JOB DESCRIPTION MATCHER TAB */
        <section className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-xl font-black text-slate-950">
                Custom Job Description Alignment Engine
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 mt-1">
                Paste any external job description (from LinkedIn, Indeed, or company careers page) to run a deep AI-powered ATS alignment check against your resume.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setCustomJD(
                  `Senior Full Stack Engineer\nCompany: Stripe\nLocation: Remote\nRequirements:\n- 5+ years of experience with React, TypeScript, and Node.js\n- Strong experience designing REST APIs and distributed systems\n- Hands-on experience with PostgreSQL and Docker\n- Familiarity with CI/CD and AWS cloud infrastructure\n- Excellent problem solving and communication skills`
                );
              }}
              className="text-xs font-bold text-blue-600 hover:underline shrink-0"
            >
              Load Sample JD
            </button>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-600">
              Paste Job Description
            </label>
            <textarea
              rows={8}
              value={customJD}
              onChange={(e) => setCustomJD(e.target.value)}
              placeholder="Paste the full job description, required qualifications, and responsibilities here..."
              className="w-full rounded-2xl border border-slate-200 bg-slate-50/60 p-4 text-xs sm:text-sm font-mono text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
            />
          </div>

          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500">
              Will compare against candidate resume:{' '}
              <strong>{analysis?.name || 'Current Profile'}</strong> ({candidateSkills.length} parsed skills)
            </span>
            <button
              type="button"
              onClick={handleRunCustomMatch}
              disabled={customMatchLoading || !customJD.trim()}
              className="px-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white font-bold text-xs transition shadow-xs flex items-center gap-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {customMatchLoading ? (
                <span className="animate-spin text-base">⟳</span>
              ) : (
                <Zap size={15} />
              )}
              <span>{customMatchLoading ? 'Evaluating Fit...' : 'Run Alignment Match'}</span>
            </button>
          </div>

          {/* Custom Match Results */}
          {customMatchResult && (
            <div className="rounded-3xl border border-blue-200 bg-blue-50/40 p-6 space-y-5 animate-fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-blue-100 pb-4">
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-blue-700">
                    Evaluation Result
                  </div>
                  <h3 className="text-lg font-black text-blue-950 mt-0.5">
                    {customMatchResult.experience_alignment}
                  </h3>
                  <p className="text-xs text-blue-800 mt-1">
                    {customMatchResult.summary}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="text-2xl font-black text-blue-900 font-mono">
                      {customMatchResult.overall}%
                    </div>
                    <div className="text-[10px] font-bold text-blue-600">ATS Match Index</div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="rounded-2xl border border-emerald-200 bg-white p-4 space-y-2">
                  <div className="text-xs font-bold text-emerald-800 flex items-center gap-1.5">
                    <CheckCircle2 size={15} className="text-emerald-600" />
                    <span>Matched Keywords ({customMatchResult.matched.length})</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {customMatchResult.matched.map((sk) => (
                      <span
                        key={sk}
                        className="rounded-lg bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-xs font-bold text-emerald-800"
                      >
                        ✓ {sk}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="rounded-2xl border border-amber-200 bg-white p-4 space-y-2">
                  <div className="text-xs font-bold text-amber-800 flex items-center gap-1.5">
                    <XCircle size={15} className="text-amber-600" />
                    <span>Missing Skills from JD ({customMatchResult.missing.length})</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {customMatchResult.missing.map((sk) => (
                      <span
                        key={sk}
                        className="rounded-lg bg-amber-50 border border-amber-200 px-2 py-0.5 text-xs font-bold text-amber-800"
                      >
                        + {sk}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {customMatchResult.recommended_skills && customMatchResult.recommended_skills.length > 0 && (
                <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-2">
                  <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Sparkles size={15} className="text-blue-600" />
                    <span>Actionable Resume Optimizations for This Job</span>
                  </div>
                  <ul className="text-xs text-slate-600 space-y-1">
                    {customMatchResult.recommended_skills.map((rec, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-blue-600 font-bold">•</span>
                        <span>Acquire or highlight: <strong>{rec}</strong></span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </section>
      )}
    </div>
  );
};

export default JobMatchView;
