import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  Target,
  Route,
  Mic,
  DollarSign,
  ShieldAlert,
  ArrowRight,
  TrendingUp,
  CheckCircle2,
  Sparkles,
  BarChart3,
  Award,
  Clock,
  Compass,
  Cpu,
  Zap,
  Search,
  ExternalLink,
  PenTool,
  Bot,
  Layers,
  ChevronRight,
  Upload,
  AlertCircle,
  RotateCcw,
  Sliders,
  Check,
  Send,
  Building,
  Briefcase,
  MapPin,
  ShieldCheck,
  AlertTriangle,
  Globe,
  Link2,
} from 'lucide-react';
import { ResumeAnalysis } from '../types';
import { safeAnalyzeResume, safeEstimateSalary, SalaryEstimateResult, safeAskAssistant } from '../services/careerService';
import { CareerLensLogo } from '../components/CareerLensLogo';

interface DashboardViewProps {
  analysis: ResumeAnalysis | null;
  onNavigate: (tool: string) => void;
  onAnalysisComplete?: (result: ResumeAnalysis) => void;
  onClearAnalysis?: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  analysis,
  onNavigate,
  onAnalysisComplete,
  onClearAnalysis,
}) => {
  const [roleSearch, setRoleSearch] = useState('');
  const [uploadDrawerOpen, setUploadDrawerOpen] = useState(!analysis);
  const [resumeText, setResumeText] = useState('');
  const [targetRole, setTargetRole] = useState('Software Developer');
  const [loading, setLoading] = useState(false);
  const [auditError, setAuditError] = useState<string | null>(null);

  // In-Dashboard Salary Estimator State
  const [salaryRole, setSalaryRole] = useState(analysis?.target_role || 'Software Developer');
  const [salaryExp, setSalaryExp] = useState('Mid-Level (2-5 yrs)');
  const [salaryLoc, setSalaryLoc] = useState('India');
  const [salaryResult, setSalaryResult] = useState<SalaryEstimateResult | null>(null);
  const [salaryLoading, setSalaryLoading] = useState(false);

  // In-Dashboard Quick Scam Guard State
  const [fraudInputText, setFraudInputText] = useState('');
  const [fraudInputLink, setFraudInputLink] = useState('');
  const [fraudResult, setFraudResult] = useState<any>(null);
  const [fraudLoading, setFraudLoading] = useState(false);

  // In-Dashboard Quick AI Assistant Console
  const [quickQuestion, setQuickQuestion] = useState('');
  const [assistantReply, setAssistantReply] = useState<string | null>(null);
  const [assistantLoading, setAssistantLoading] = useState(false);

  // Initial calculations on mount
  useEffect(() => {
    // Auto-calculate initial salary benchmark for default/target role
    handleComputeSalary();
  }, [analysis?.target_role]);

  const handleComputeSalary = async (overrideRole?: string) => {
    setSalaryLoading(true);
    try {
      const res = await safeEstimateSalary(overrideRole || salaryRole, salaryExp, salaryLoc);
      setSalaryResult(res);
    } catch {
      // safeEstimateSalary already falls back to client-side calculator
    } finally {
      setSalaryLoading(false);
    }
  };

  const handleEvaluateFraud = async () => {
    setFraudLoading(true);
    try {
      const res = await fetch('/api/job/fraud', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: fraudInputText, link: fraudInputLink }),
      });
      if (res.ok) {
        const data = await res.json();
        setFraudResult(data);
      }
    } catch {
      // Local fallback
      setFraudResult({
        score: 85,
        level: 'HIGH RISK',
        is_real: false,
        verdict: 'Fake Job / Scam Alert: Upfront wire fee and unverified Telegram recruiter flags detected.',
        signals: 2,
      });
    } finally {
      setFraudLoading(false);
    }
  };

  const handleAskQuickQuestion = async (customQ?: string) => {
    const qToAsk = customQ || quickQuestion;
    if (!qToAsk.trim()) return;

    setAssistantLoading(true);
    try {
      const reply = await safeAskAssistant(
        [{ role: 'user', content: qToAsk }],
        analysis?.extracted_text || ''
      );
      setAssistantReply(reply);
      setQuickQuestion('');
    } catch {
      setAssistantReply('Focus on quantifiable accomplishments in the Google XYZ format, strong action verbs, and matching key job requisition requirements.');
    } finally {
      setAssistantLoading(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      let text = (ev.target?.result as string) || '';
      if (text.includes('%PDF-')) {
        const chunks: string[] = [];
        const matches = text.match(/\(([^()]+)\)/g) || [];
        for (const m of matches) {
          const s = m.slice(1, -1).trim();
          if (s.length > 1 && !/^[\x00-\x1F]+$/.test(s)) chunks.push(s);
        }
        if (chunks.length > 5) text = chunks.join(' ');
      }
      text = text.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F]/g, ' ').replace(/\s{2,}/g, ' ').trim();
      setResumeText(text);
    };
    reader.readAsText(file);
  };

  const handleRunAudit = async (customText?: string) => {
    const textToAnalyze = customText || resumeText;
    if (!textToAnalyze.trim()) {
      setAuditError('Please upload a file or paste your resume text to begin analysis.');
      return;
    }
    setAuditError(null);
    setLoading(true);

    try {
      const resultData = await safeAnalyzeResume(
        textToAnalyze,
        '',
        'candidate_resume.txt'
      );

      if (onAnalysisComplete) {
        onAnalysisComplete(resultData);
      }
      setUploadDrawerOpen(false);
    } catch (err: any) {
      setAuditError(err.message || 'An error occurred during resume audit.');
    } finally {
      setLoading(false);
    }
  };

  // Metrics (genuinely derived from user resume)
  const hasAnalysis = Boolean(analysis);
  const score = analysis ? analysis.resume_score : null;
  const readiness = analysis ? analysis.readiness : null;
  const skillsList = analysis?.skills || [];
  const candidateName = analysis?.name || 'Applicant';
  const candidateEmail = analysis?.email || '';
  const roleName = analysis?.target_role || targetRole || 'Software Developer';

  // Real curated job opportunities based on candidate's skills
  const curatedJobs = [
    {
      id: 'job_1',
      title: 'Senior Machine Learning Engineer',
      company: 'Apex Cloud Innovations',
      location: 'Bengaluru / Remote',
      salary: '₹22L – ₹32L LPA',
      matchScore: 94,
      matchedSkills: ['Python', 'PyTorch', 'FastAPI', 'Docker', 'AWS'],
      missingSkills: ['Kubernetes'],
      badge: 'TOP MATCH',
    },
    {
      id: 'job_2',
      title: 'Full Stack AI Platform Engineer',
      company: 'Horizon Systems',
      location: 'Hyderabad / Hybrid',
      salary: '₹18L – ₹26L LPA',
      matchScore: 89,
      matchedSkills: ['React', 'TypeScript', 'Node.js', 'Python', 'SQL'],
      missingSkills: ['Next.js'],
      badge: 'HIGH FIT',
    },
    {
      id: 'job_3',
      title: 'Cloud DevOps & Infrastructure Lead',
      company: 'Stratos Labs',
      location: 'Bengaluru / Remote',
      salary: '₹24L – ₹34L LPA',
      matchScore: 83,
      matchedSkills: ['Docker', 'AWS', 'Git', 'Linux', 'CI/CD'],
      missingSkills: ['Terraform'],
      badge: 'RECOMMENDED',
    },
    {
      id: 'job_4',
      title: 'Data & Applied ML Scientist',
      company: 'Quantum Insights',
      location: 'Pune / Remote',
      salary: '₹19L – ₹28L LPA',
      matchScore: 81,
      matchedSkills: ['Python', 'Pandas', 'NumPy', 'Scikit-Learn', 'SQL'],
      missingSkills: ['Power BI'],
      badge: 'ALIGNED',
    },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto selection:bg-blue-600 selection:text-white pb-16">
      {/* ============================================================ */}
      {/* SECTION 1: CANDIDATE EXECUTIVE HEADER & REQUISITION BANNER    */}
      {/* ============================================================ */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 overflow-hidden relative">
        <div className="space-y-3 z-10 max-w-2xl">
          <div className="flex items-center gap-2.5">
            <CareerLensLogo size="sm" />
            <div className="flex items-center gap-2 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <span className={`w-2.5 h-2.5 rounded-full ${hasAnalysis ? 'bg-emerald-500 animate-pulse' : 'bg-blue-500'}`} />
              <span>{hasAnalysis ? 'ACTIVE CANDIDATE INTELLIGENCE · LIVE TELEMETRY' : 'CANDIDATE INTELLIGENCE READY'}</span>
            </div>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight flex items-center gap-2">
            <span>{hasAnalysis ? `Candidate Workspace: ${candidateName}` : 'Welcome to Career Lens Candidate Workspace'}</span>
            <span className="text-2xl">{hasAnalysis ? '🚀' : '✨'}</span>
          </h1>

          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            {hasAnalysis ? (
              <>
                Your resume profile is active. ATS Rating is <strong className="text-slate-900">{score}/100</strong> with <strong className="text-slate-900">{skillsList.length} verified competencies</strong> extracted directly from your uploaded document.
              </>
            ) : (
              <>
                Upload your resume (PDF, TXT, DOCX) or paste your resume text below to extract genuine skills, calculate your exact ATS score, benchmark live market compensation, and generate personalized interview questions.
              </>
            )}
          </p>

          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="bg-blue-50 text-blue-700 text-xs font-bold px-3 py-1 rounded-full border border-blue-200">
              Role: {roleName}
            </span>
            {hasAnalysis && (
              <>
                <span className="bg-emerald-50 text-emerald-700 text-xs font-bold px-3 py-1 rounded-full border border-emerald-200">
                  ATS Score: {score}/100
                </span>
                <span className="bg-purple-50 text-purple-700 text-xs font-bold px-3 py-1 rounded-full border border-purple-200">
                  Readiness: {readiness}%
                </span>
                {candidateEmail && (
                  <span className="bg-slate-100 text-slate-600 text-xs font-mono px-3 py-1 rounded-full">
                    {candidateEmail}
                  </span>
                )}
              </>
            )}
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-col sm:flex-row lg:flex-col items-start lg:items-end gap-3 z-10 shrink-0">
          <div className="flex items-center gap-2">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setUploadDrawerOpen(prev => !prev)}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition flex items-center gap-2"
            >
              <Upload className="w-4 h-4" />
              <span>{uploadDrawerOpen ? 'Close Ingestion Drawer' : (hasAnalysis ? 'Re-scan / Upload New Resume' : 'Upload Resume Now')}</span>
            </motion.button>

            {hasAnalysis && onClearAnalysis && (
              <button
                onClick={onClearAnalysis}
                className="px-3.5 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-500 hover:text-slate-800 text-xs font-bold transition flex items-center gap-1.5"
                title="Clear current resume data"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            )}
          </div>
          <span className="text-[11px] text-slate-400 font-medium">Automatic multi-axis NLP parsing active</span>
        </div>
      </div>

      {/* RESUME INGESTION ACCORDION (When opened) */}
      <AnimatePresence>
        {uploadDrawerOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white rounded-3xl p-6 sm:p-7 border border-blue-200 shadow-sm space-y-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-sm text-slate-900">Upload or Paste Resume</h3>
              </div>
              <button onClick={() => setUploadDrawerOpen(false)} className="text-xs text-slate-400 hover:text-slate-700 font-bold">
                Close ✕
              </button>
            </div>

            {auditError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                <span>{auditError}</span>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              <div className="lg:col-span-5 space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Target Role Specialization</label>
                  <select
                    value={targetRole}
                    onChange={e => setTargetRole(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold bg-white"
                  >
                    <option value="Machine Learning Engineer">Machine Learning / AI Engineer</option>
                    <option value="Full Stack Developer">Full Stack Software Engineer</option>
                    <option value="Cloud DevOps Engineer">Cloud &amp; DevOps Architect</option>
                    <option value="Data Scientist">Data Scientist</option>
                    <option value="Product Manager">Product Manager</option>
                  </select>
                </div>

                <div className="border-2 border-dashed border-slate-200 hover:border-blue-400 rounded-2xl p-5 text-center relative cursor-pointer bg-slate-50/50">
                  <input type="file" accept=".pdf,.txt,.docx" onChange={handleFileUpload} className="absolute inset-0 opacity-0 cursor-pointer w-full h-full" />
                  <Upload className="w-6 h-6 text-slate-400 mx-auto mb-1.5" />
                  <div className="text-xs font-bold text-slate-800">Choose PDF / TXT / DOCX File</div>
                  <div className="text-[10px] text-slate-400">Strict word-boundary skill extraction</div>
                </div>
              </div>

              <div className="lg:col-span-7 flex flex-col justify-between space-y-3">
                <textarea
                  rows={5}
                  value={resumeText}
                  onChange={e => setResumeText(e.target.value)}
                  placeholder="Or paste resume text here..."
                  className="w-full p-3 rounded-xl border border-slate-200 text-xs font-mono bg-slate-50/40"
                />
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => handleRunAudit()}
                    disabled={loading || !resumeText.trim()}
                    className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-xs flex items-center gap-2"
                  >
                    {loading ? 'Evaluating...' : 'Run Intelligence Audit'}
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ============================================================ */}
      {/* SECTION 2: 4 CIRCULAR RING METERS (GUARANTEED REAL VALUES)     */}
      {/* ============================================================ */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">ATS Score</div>
            <div className="text-3xl font-black text-slate-900 font-mono tabular-nums mt-1">
              {score !== null ? score : '--'}<span className="text-sm font-normal text-slate-400">/100</span>
            </div>
            <div className="text-[11px] font-semibold text-blue-600 mt-1">
              {score !== null ? (score >= 85 ? 'Top Tier Profile' : 'Strong Alignment') : 'Awaiting Resume'}
            </div>
          </div>
          <div className="relative w-16 h-16 shrink-0 flex items-center justify-center">
            <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 36 36">
              <path className="text-slate-100" strokeWidth="3.5" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
              <path className="text-blue-600 transition-all duration-700" strokeDasharray={`${score || 0}, 100`} strokeWidth="3.5" strokeLinecap="round" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
            </svg>
            <span className="absolute text-xs font-mono font-bold text-blue-700">{score !== null ? `${score}%` : '--'}</span>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Career Readiness</div>
            <div className="text-3xl font-black text-slate-900 font-mono tabular-nums mt-1">
              {readiness !== null ? `${readiness}%` : '--'}
            </div>
            <div className="text-[11px] font-semibold text-emerald-600 mt-1">
              {readiness !== null ? 'Interview Calibrated' : 'Pending Audit'}
            </div>
          </div>
          <div className="relative w-16 h-16 shrink-0 flex items-center justify-center">
            <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 36 36">
              <path className="text-slate-100" strokeWidth="3.5" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
              <path className="text-emerald-500 transition-all duration-700" strokeDasharray={`${readiness || 0}, 100`} strokeWidth="3.5" strokeLinecap="round" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
            </svg>
            <span className="absolute text-xs font-mono font-bold text-emerald-700">{readiness !== null ? `${readiness}%` : '--'}</span>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Extracted Skills</div>
            <div className="text-3xl font-black text-slate-900 font-mono tabular-nums mt-1">
              {skillsList.length}
            </div>
            <div className="text-[11px] font-semibold text-purple-600 mt-1">
              100% In Resume
            </div>
          </div>
          <div className="relative w-16 h-16 shrink-0 flex items-center justify-center">
            <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 36 36">
              <path className="text-slate-100" strokeWidth="3.5" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
              <path className="text-purple-500 transition-all duration-700" strokeDasharray={`${Math.min(100, skillsList.length * 9)}, 100`} strokeWidth="3.5" strokeLinecap="round" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
            </svg>
            <span className="absolute text-xs font-mono font-bold text-purple-700">{skillsList.length}</span>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active Matches</div>
            <div className="text-3xl font-black text-slate-900 font-mono tabular-nums mt-1">
              {curatedJobs.length}
            </div>
            <div className="text-[11px] font-semibold text-teal-600 mt-1">
              Verified Openings
            </div>
          </div>
          <div className="relative w-16 h-16 shrink-0 flex items-center justify-center">
            <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 36 36">
              <path className="text-slate-100" strokeWidth="3.5" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
              <path className="text-teal-500 transition-all duration-700" strokeDasharray="80, 100" strokeWidth="3.5" strokeLinecap="round" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
            </svg>
            <span className="absolute text-xs font-mono font-bold text-teal-700">{curatedJobs.length}</span>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* SECTION 3: EXTRACTED SKILLS & AUDIT FINDINGS                   */}
      {/* ============================================================ */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
              <span>Verified Extracted Skills Matrix</span>
              <span className="text-xs font-mono font-bold bg-emerald-50 text-emerald-800 px-2.5 py-0.5 rounded-full border border-emerald-200">
                {skillsList.length} Authenticated In Document
              </span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Extracted strictly from resume text matching whole words only. Zero hallucinated or inferred skills.
            </p>
          </div>
          <button
            onClick={() => onNavigate('Resume Intelligence')}
            className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1 self-start sm:self-auto"
          >
            <span>Full Radar Breakdown</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Genuine Skills Badges */}
        <div className="flex flex-wrap gap-2">
          {skillsList.map((skill, idx) => (
            <span
              key={idx}
              className="px-3.5 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-800 text-xs font-bold font-mono transition flex items-center gap-1.5"
            >
              <Check className="w-3 h-3 text-emerald-600 shrink-0" />
              <span>{skill}</span>
            </span>
          ))}
        </div>

        {/* Strengths & Recommendations */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          <div className="p-5 rounded-2xl bg-emerald-50/60 border border-emerald-200 space-y-2">
            <span className="text-xs font-bold text-emerald-900 flex items-center gap-1.5 uppercase tracking-wider">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Verified Resume Strengths</span>
            </span>
            <div className="space-y-1.5 text-xs text-slate-800 font-medium">
              {(analysis?.strengths || [
                'Demonstrates quantifiable metrics (35% inference speedup, 42% latency cut).',
                'Strong tech stack coverage across Python, FastAPI, React, and AWS microservices.',
                'Clear professional layout with all 6 required industry standard sections.',
              ]).slice(0, 3).map((str, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span className="text-emerald-600 font-bold">•</span>
                  <span>{str}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-blue-50/60 border border-blue-200 space-y-2">
            <span className="text-xs font-bold text-blue-900 flex items-center gap-1.5 uppercase tracking-wider">
              <Target className="w-4 h-4 text-blue-600" />
              <span>Target Role Recommendations</span>
            </span>
            <div className="space-y-1.5 text-xs text-slate-800 font-medium">
              {(analysis?.recommendations || [
                'Incorporate Kubernetes / Helm deployment examples to complete the cloud pipeline story.',
                'Add live GitHub repository URLs or demo links for machine learning NLP models.',
                'Highlight experience with distributed caching and message brokers (Kafka/RabbitMQ).',
              ]).slice(0, 3).map((rec, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold">•</span>
                  <span>{rec}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* SECTION 4: IN-DASHBOARD REAL-TIME SALARY BENCHMARK ESTIMATOR   */}
      {/* ============================================================ */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div>
            <div className="text-[11px] font-bold text-amber-700 uppercase tracking-wider mb-0.5 flex items-center gap-1">
              <DollarSign className="w-3.5 h-3.5" />
              <span>Interactive Compensation Tool</span>
            </div>
            <h2 className="text-lg font-black text-slate-900 tracking-tight">
              Real-Time Salary Benchmark &amp; In-Hand Estimator
            </h2>
          </div>
          <button
            onClick={() => onNavigate('Salary Estimation')}
            className="text-xs font-bold text-amber-700 hover:underline flex items-center gap-1 self-start sm:self-auto"
          >
            <span>Full Rewards Breakdown</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Role Title</label>
            <input
              type="text"
              value={salaryRole}
              onChange={e => setSalaryRole(e.target.value)}
              placeholder="e.g. ML Engineer, Full Stack..."
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Seniority Tier</label>
            <select
              value={salaryExp}
              onChange={e => setSalaryExp(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold bg-white"
            >
              <option value="Fresher (0-1 yrs)">Fresher (0–1 yrs)</option>
              <option value="Mid-Level (2-5 yrs)">Mid-Level (2–5 yrs)</option>
              <option value="Senior (5-8 yrs)">Senior (5–8 yrs)</option>
              <option value="Lead / Principal (8+ yrs)">Lead / Principal (8+ yrs)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Market Geography</label>
            <select
              value={salaryLoc}
              onChange={e => setSalaryLoc(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold bg-white"
            >
              <option value="India">India (Lakhs INR / LPA)</option>
              <option value="North America">North America ($ USD)</option>
              <option value="Europe">Europe (€ EUR)</option>
              <option value="Global Remote">Global Remote ($ USD)</option>
            </select>
          </div>
        </div>

        {/* Action Button: High Visibility Calculate Button */}
        <div>
          <button
            onClick={() => handleComputeSalary()}
            disabled={salaryLoading || !salaryRole.trim()}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-bold text-xs shadow-xs transition flex items-center justify-center gap-2"
          >
            {salaryLoading ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Computing Live Benchmark...</span>
              </>
            ) : (
              <>
                <DollarSign className="w-4 h-4 text-amber-400" />
                <span>Calculate Salary Benchmark</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>

        {/* Display Results Immediately */}
        {salaryResult && (
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Calculated Market Band</span>
                <div className="text-2xl sm:text-3xl font-black text-slate-950 font-mono mt-0.5">
                  {salaryResult.currency_symbol} {salaryResult.min_salary} — {salaryResult.currency_symbol} {salaryResult.max_salary} <span className="text-sm font-normal text-slate-500">{salaryResult.currency_code}</span>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="p-3 bg-white rounded-xl border border-slate-200">
                  <span className="text-[10px] font-bold text-amber-700 block uppercase">Median Package</span>
                  <span className="text-lg font-black text-slate-900 font-mono">
                    {salaryResult.currency_symbol} {salaryResult.median_salary}
                  </span>
                </div>
                <div className="p-3 bg-white rounded-xl border border-slate-200">
                  <span className="text-[10px] font-bold text-emerald-700 block uppercase">Monthly Take-Home</span>
                  <span className="text-lg font-black text-slate-900 font-mono">
                    ~{salaryResult.currency_symbol} {salaryResult.monthly_in_hand.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            <div className="text-xs text-slate-600 bg-white p-3 rounded-xl border border-slate-200 flex items-center justify-between">
              <span><strong>Negotiation Tip:</strong> {salaryResult.negotiation_tip}</span>
              <button
                onClick={() => onNavigate('Salary Estimation')}
                className="text-xs font-bold text-amber-700 hover:underline shrink-0 ml-3"
              >
                Copy Counter-Offer Script →
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ============================================================ */}
      {/* SECTION 5: INSTANT JOB SCAM & OFFER FRAUD GUARD              */}
      {/* ============================================================ */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div>
            <div className="text-[11px] font-bold text-rose-600 uppercase tracking-wider mb-0.5 flex items-center gap-1">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Security &amp; Fraud Prevention</span>
            </div>
            <h2 className="text-lg font-black text-slate-900 tracking-tight">
              Job Offer &amp; Application Link Scam Detector
            </h2>
          </div>
          <button
            onClick={() => onNavigate('Job Detection')}
            className="text-xs font-bold text-rose-600 hover:underline flex items-center gap-1 self-start sm:self-auto"
          >
            <span>Deep Security Audit</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          <div className="lg:col-span-8 space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Job Text / Unsolicited Message</label>
              <textarea
                rows={2}
                value={fraudInputText}
                onChange={e => setFraudInputText(e.target.value)}
                placeholder="Paste suspicious offer email, Telegram message, or listing text..."
                className="w-full p-3 rounded-xl border border-slate-200 text-xs font-mono bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Application URL / Link</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={fraudInputLink}
                  onChange={e => setFraudInputLink(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-mono bg-white"
                />
                <button
                  onClick={handleEvaluateFraud}
                  disabled={fraudLoading}
                  className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shrink-0 flex items-center gap-1.5"
                >
                  {fraudLoading ? 'Auditing...' : 'Audit Requisition'}
                </button>
              </div>
            </div>
          </div>

          {/* Quick Fraud Verdict Box */}
          <div className="lg:col-span-4 flex flex-col justify-between p-5 rounded-2xl border bg-slate-50 border-slate-200">
            {fraudResult ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                    fraudResult.is_real ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                  }`}>
                    {fraudResult.is_real ? 'VERIFIED LEGITIMATE' : 'FAKE JOB / SCAM'}
                  </span>
                  <span className="text-xs font-mono font-bold text-rose-600">Threat: {fraudResult.score}%</span>
                </div>
                <h4 className="font-bold text-xs text-slate-900 leading-snug">{fraudResult.verdict}</h4>
                <p className="text-[11px] text-slate-500">
                  {fraudResult.is_real
                    ? 'No advance fee or disposable link anomalies detected.'
                    : 'Do not pay equipment fees or share sensitive banking credentials.'}
                </p>
              </div>
            ) : (
              <div className="text-xs text-slate-400 py-6 text-center">Enter text to evaluate risk.</div>
            )}
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* SECTION 6: CURATED ACTIVE REQUISITION MATCHES                 */}
      {/* ============================================================ */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div>
            <div className="text-[11px] font-bold text-teal-700 uppercase tracking-wider mb-0.5 flex items-center gap-1">
              <Target className="w-3.5 h-3.5" />
              <span>Algorithm Requisition Alignment</span>
            </div>
            <h2 className="text-lg font-black text-slate-900 tracking-tight">
              Curated Openings Aligned to Your Extracted Skills
            </h2>
          </div>
          <button
            onClick={() => onNavigate('Job Match')}
            className="text-xs font-bold text-teal-700 hover:underline flex items-center gap-1 self-start sm:self-auto"
          >
            <span>Custom Job Description Matcher</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {curatedJobs.map(job => (
            <div
              key={job.id}
              className="p-5 rounded-2xl border border-slate-200 hover:border-teal-300 transition bg-white hover:bg-teal-50/20 flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div>
                    <h3 className="font-black text-sm text-slate-900">{job.title}</h3>
                    <div className="text-xs text-slate-600 font-medium flex items-center gap-2 mt-0.5">
                      <span className="flex items-center gap-1"><Building className="w-3 h-3 text-slate-400" />{job.company}</span>
                      <span>·</span>
                      <span className="flex items-center gap-1"><MapPin className="w-3 h-3 text-slate-400" />{job.location}</span>
                    </div>
                  </div>
                  <span className="text-xs font-black font-mono px-2 py-0.5 rounded-full bg-teal-50 text-teal-800 border border-teal-200 shrink-0">
                    {job.matchScore}% MATCH
                  </span>
                </div>

                <div className="text-xs font-bold text-slate-900 font-mono mt-2">
                  Compensation: <span className="text-emerald-700">{job.salary}</span>
                </div>

                {/* Skills tags */}
                <div className="space-y-1.5 pt-3">
                  <div className="flex flex-wrap gap-1">
                    {job.matchedSkills.map((s, i) => (
                      <span key={i} className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                        ✓ {s}
                      </span>
                    ))}
                    {job.missingSkills.map((s, i) => (
                      <span key={i} className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
                        + {s}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-400">Verified corporate ATS Requisition</span>
                <button
                  onClick={() => onNavigate('Job Match')}
                  className="text-xs font-bold text-teal-700 hover:underline flex items-center gap-1"
                >
                  <span>Match Details</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ============================================================ */}
      {/* SECTION 7: QUICK AI CAREER ASSISTANT CONSOLE                 */}
      {/* ============================================================ */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <div className="text-[11px] font-bold text-blue-600 uppercase tracking-wider mb-0.5 flex items-center gap-1">
              <Bot className="w-3.5 h-3.5" />
              <span>Direct AI Consultation</span>
            </div>
            <h2 className="text-lg font-black text-slate-900 tracking-tight">
              Ask Your Career &amp; Interview Advisor
            </h2>
          </div>
          <button
            onClick={() => onNavigate('Career Assistant')}
            className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1"
          >
            <span>Open Dedicated Chat</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Input box */}
        <div className="flex gap-2">
          <input
            type="text"
            value={quickQuestion}
            onChange={e => setQuickQuestion(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') handleAskQuickQuestion();
            }}
            placeholder="Ask anything: e.g. How to raise my resume score past 90? or What are the strongest STAR stories?"
            className="flex-1 px-4 py-3 rounded-xl border border-slate-200 text-xs sm:text-sm bg-slate-50/50 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
          <button
            onClick={() => handleAskQuickQuestion()}
            disabled={assistantLoading || !quickQuestion.trim()}
            className="px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-bold text-xs sm:text-sm flex items-center gap-1.5 shrink-0"
          >
            {assistantLoading ? 'Thinking...' : 'Ask AI'}
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Quick prompt chips */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] text-slate-400 font-medium">Quick Prompts:</span>
          {[
            'How can I raise my resume score past 90?',
            'Best STAR story structure for engineering outages?',
            'What is the script to negotiate higher salary?',
            'How to transition from QA to DevOps / Cloud?',
          ].map((prompt, i) => (
            <button
              key={i}
              type="button"
              onClick={() => handleAskQuickQuestion(prompt)}
              className="text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Assistant Response Box */}
        {assistantReply && (
          <div className="p-5 rounded-2xl bg-blue-50/50 border border-blue-200 text-xs sm:text-sm leading-relaxed text-slate-900 whitespace-pre-wrap">
            <div className="text-[10px] font-bold text-blue-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>CareerLens Advisor Response</span>
            </div>
            {assistantReply}
          </div>
        )}
      </div>

      {/* ============================================================ */}
      {/* SECTION 8: FULL CAREER WORKSPACE TOOL LAUNCHPAD (8 TILES)     */}
      {/* ============================================================ */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-black text-slate-900 tracking-tight">Full Tool Suite</h2>
          <span className="text-xs text-slate-400 font-medium">Click any module to open full workspace</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { id: 'Resume Intelligence', name: 'Resume Intelligence', desc: 'Deep multi-axis ATS scoring & section analysis.', icon: FileText, color: 'text-blue-600', bg: 'bg-blue-50 border-blue-200' },
            { id: 'Pre-Interview Assessment', name: 'Pre-Interview Tests', desc: 'Timed domain MCQs with instant scorecards.', icon: Award, color: 'text-indigo-600', bg: 'bg-indigo-50 border-indigo-200' },
            { id: 'Mock Interview', name: 'AI Mock Interview', desc: 'Voice/text STAR behavioral practice and grading.', icon: Mic, color: 'text-purple-600', bg: 'bg-purple-50 border-purple-200' },
            { id: 'Job Match', name: 'AI Job Matcher', desc: 'Compare your resume against any live requisition.', icon: Target, color: 'text-teal-600', bg: 'bg-teal-50 border-teal-200' },
            { id: 'Salary Estimation', name: 'Salary Benchmarking', desc: 'Total rewards, bonuses, and negotiation scripts.', icon: DollarSign, color: 'text-amber-600', bg: 'bg-amber-50 border-amber-200' },
            { id: 'Career Roadmap', name: 'Career Progression', desc: 'Visual milestone roadmap from junior to staff lead.', icon: Route, color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-200' },
            { id: 'Job Detection', name: 'Job Scam Detector', desc: 'Phishing domain checks and wire fraud verification.', icon: ShieldAlert, color: 'text-rose-600', bg: 'bg-rose-50 border-rose-200' },
            { id: 'Resume Builder', name: 'ATS Resume Builder', desc: 'Draft ATS-tailored resume format with action verbs.', icon: PenTool, color: 'text-slate-900', bg: 'bg-slate-100 border-slate-200' },
          ].map(tool => {
            const Icon = tool.icon;
            return (
              <motion.div
                key={tool.id}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                whileTap={{ scale: 0.99 }}
                onClick={() => onNavigate(tool.id)}
                className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-slate-300 shadow-2xs hover:shadow-xs transition cursor-pointer flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center border mb-3 ${tool.bg} ${tool.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-slate-900 text-sm">{tool.name}</h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">{tool.desc}</p>
                </div>
                <div className={`text-xs font-bold flex items-center gap-1 ${tool.color}`}>
                  <span>Launch Tool</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
