import React, { useState } from 'react';
import { motion } from 'framer-motion';
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
} from 'lucide-react';
import { ResumeAnalysis } from '../types';
import { IMAGES } from '../assets/images';

interface DashboardViewProps {
  analysis: ResumeAnalysis | null;
  onNavigate: (tool: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ analysis, onNavigate }) => {
  const [roleSearch, setRoleSearch] = useState('');

  // Default benchmark metrics if user hasn't scanned yet
  const score = analysis ? analysis.resume_score : 84;
  const readiness = analysis ? analysis.readiness : 78;
  const skillsCount = analysis ? analysis.skills.length : 18;
  const jobMatchesCount = 14;

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 12 },
    show: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-6 max-w-7xl mx-auto selection:bg-blue-600 selection:text-white"
    >
      {/* WELCOME BANNER WITH OFFICIAL EMBLEM & PREVIEW VISUAL */}
      <motion.div
        variants={itemVariants}
        className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-xs flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 overflow-hidden relative"
      >
        <div className="space-y-3 z-10 max-w-2xl">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl overflow-hidden border border-slate-200 bg-slate-900 shrink-0 shadow-2xs">
              <img src={IMAGES.logo} alt="Career Lens Emblem" className="w-full h-full object-cover" />
            </div>
            <div className="flex items-center gap-2 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>CANDIDATE INTELLIGENCE ENGINE ONLINE</span>
            </div>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight flex items-center gap-2">
            <span>Welcome back, {analysis?.name || 'Candidate'}</span>
            <span className="text-2xl">👋</span>
          </h1>

          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
            Track your ATS score progress, practice role-tailored assessments and mock interviews, and evaluate matching requisitions in real time.
          </p>

          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="bg-blue-50 text-blue-700 text-[11px] font-bold px-2.5 py-1 rounded-full border border-blue-200">
              ATS Optimized
            </span>
            <span className="bg-emerald-50 text-emerald-700 text-[11px] font-bold px-2.5 py-1 rounded-full border border-emerald-200">
              Verified Readiness: {readiness}%
            </span>
            <span className="bg-purple-50 text-purple-700 text-[11px] font-bold px-2.5 py-1 rounded-full border border-purple-200">
              {skillsCount} Core Skills Tracked
            </span>
          </div>
        </div>

        {/* Action Button & Interface Teaser */}
        <div className="flex flex-col sm:flex-row lg:flex-col items-start lg:items-end gap-3 z-10 shrink-0">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onNavigate('Resume Intelligence')}
            className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition flex items-center gap-2"
          >
            <FileText className="w-4 h-4" />
            <span>{analysis ? 'Re-scan Resume' : 'Scan Resume First'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </motion.button>
          <span className="text-[11px] text-slate-400 font-medium">Instant 5-second NLP parser audit</span>
        </div>
      </motion.div>

      {/* 4 CIRCULAR METRIC RING METERS WITH FRAMER MOTION MICRO-HOVER */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Resume Score */}
        <motion.div
          variants={itemVariants}
          whileHover={{ y: -3, transition: { duration: 0.2 } }}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between"
        >
          <div>
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Resume Score</div>
            <div className="text-2xl font-black text-slate-900 font-mono tabular-nums mt-1">
              {score}<span className="text-sm font-normal text-slate-400">/100</span>
            </div>
            <div className="text-[11px] font-semibold text-blue-600 mt-1">Good • Top 15%</div>
          </div>
          <div className="relative w-16 h-16 shrink-0 flex items-center justify-center">
            <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-slate-100"
                strokeWidth="3.5"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="text-blue-600"
                strokeDasharray={`${score}, 100`}
                strokeWidth="3.5"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <span className="absolute text-xs font-mono font-bold text-blue-700">{score}%</span>
          </div>
        </motion.div>

        {/* Metric 2: Career Readiness */}
        <motion.div
          variants={itemVariants}
          whileHover={{ y: -3, transition: { duration: 0.2 } }}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between"
        >
          <div>
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Career Readiness</div>
            <div className="text-2xl font-black text-slate-900 font-mono tabular-nums mt-1">
              {readiness}%
            </div>
            <div className="text-[11px] font-semibold text-emerald-600 mt-1">Strong Core</div>
          </div>
          <div className="relative w-16 h-16 shrink-0 flex items-center justify-center">
            <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-slate-100"
                strokeWidth="3.5"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="text-emerald-500"
                strokeDasharray={`${readiness}, 100`}
                strokeWidth="3.5"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <span className="absolute text-xs font-mono font-bold text-emerald-700">{readiness}%</span>
          </div>
        </motion.div>

        {/* Metric 3: Skills Detected */}
        <motion.div
          variants={itemVariants}
          whileHover={{ y: -3, transition: { duration: 0.2 } }}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between"
        >
          <div>
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Skills Detected</div>
            <div className="text-2xl font-black text-slate-900 font-mono tabular-nums mt-1">
              {skillsCount}
            </div>
            <div className="text-[11px] font-semibold text-purple-600 mt-1">Verified Badges</div>
          </div>
          <div className="relative w-16 h-16 shrink-0 flex items-center justify-center">
            <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-slate-100"
                strokeWidth="3.5"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="text-purple-500"
                strokeDasharray="74, 100"
                strokeWidth="3.5"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <span className="absolute text-xs font-mono font-bold text-purple-700">{skillsCount}</span>
          </div>
        </motion.div>

        {/* Metric 4: Job Matches */}
        <motion.div
          variants={itemVariants}
          whileHover={{ y: -3, transition: { duration: 0.2 } }}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between"
        >
          <div>
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Job Matches</div>
            <div className="text-2xl font-black text-slate-900 font-mono tabular-nums mt-1">
              {jobMatchesCount}
            </div>
            <div className="text-[11px] font-semibold text-teal-600 mt-1">High Alignment</div>
          </div>
          <div className="relative w-16 h-16 shrink-0 flex items-center justify-center">
            <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-slate-100"
                strokeWidth="3.5"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="text-teal-500"
                strokeDasharray="80, 100"
                strokeWidth="3.5"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <span className="absolute text-xs font-mono font-bold text-teal-700">{jobMatchesCount}</span>
          </div>
        </motion.div>
      </div>

      {/* INTERACTIVE CAREER WORKSPACE MODULE TILES WITH FRAMER MOTION */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-black text-slate-900 tracking-tight">Your Career Workspace</h2>
          <span className="text-xs text-slate-500 font-medium">Click any module to launch tool</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Resume Intelligence */}
          <motion.div
            variants={itemVariants}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            whileTap={{ scale: 0.99 }}
            onClick={() => onNavigate('Resume Intelligence')}
            className="card-clean-hover p-5 rounded-2xl cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center">
                  <FileText className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-mono font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                  ATS AUDIT
                </span>
              </div>
              <h3 className="font-bold text-slate-900 text-sm">Resume Intelligence</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Scan your resume, get line-by-line feedback, and preview circular ring score metrics.
              </p>
            </div>
            <div className="text-xs font-bold text-blue-600 mt-4 flex items-center gap-1">
              <span>Analyze Resume</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </motion.div>

          {/* Card 2: Pre-Interview Assessments */}
          <motion.div
            variants={itemVariants}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            whileTap={{ scale: 0.99 }}
            onClick={() => onNavigate('Pre-Interview Assessment')}
            className="card-clean-hover p-5 rounded-2xl cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-600 flex items-center justify-center">
                  <Award className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-mono font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                  TEST PRACTICE
                </span>
              </div>
              <h3 className="font-bold text-slate-900 text-sm">Pre-Interview Tests</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Take timed role-specific quizzes and view correct vs incorrect bar graphs in scorecards.
              </p>
            </div>
            <div className="text-xs font-bold text-indigo-600 mt-4 flex items-center gap-1">
              <span>Start Assessment</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </motion.div>

          {/* Card 3: Mock Interview */}
          <motion.div
            variants={itemVariants}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            whileTap={{ scale: 0.99 }}
            onClick={() => onNavigate('Mock Interview')}
            className="card-clean-hover p-5 rounded-2xl cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-200 text-purple-600 flex items-center justify-center">
                  <Mic className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-mono font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded">
                  STAR METHOD
                </span>
              </div>
              <h3 className="font-bold text-slate-900 text-sm">Mock Interview</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Practice behavioral questions with structured STAR feedback and multi-axis performance bars.
              </p>
            </div>
            <div className="text-xs font-bold text-purple-600 mt-4 flex items-center gap-1">
              <span>Start Interview</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </motion.div>

          {/* Card 4: Job Match */}
          <motion.div
            variants={itemVariants}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            whileTap={{ scale: 0.99 }}
            onClick={() => onNavigate('Job Match')}
            className="card-clean-hover p-5 rounded-2xl cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-200 text-teal-600 flex items-center justify-center">
                  <Target className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-mono font-bold text-teal-600 bg-teal-50 px-2 py-0.5 rounded">
                  ALIGNMENT
                </span>
              </div>
              <h3 className="font-bold text-slate-900 text-sm">Job Match</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Compare your resume to target job descriptions with similarity graphs and upgrade paths.
              </p>
            </div>
            <div className="text-xs font-bold text-teal-600 mt-4 flex items-center gap-1">
              <span>Match Jobs</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </motion.div>

          {/* Card 5: Job Scam Detection */}
          <motion.div
            variants={itemVariants}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            whileTap={{ scale: 0.99 }}
            onClick={() => onNavigate('Job Detection')}
            className="card-clean-hover p-5 rounded-2xl cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-mono font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded">
                  SAFETY
                </span>
              </div>
              <h3 className="font-bold text-slate-900 text-sm">Job Scam Detection</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Scan suspicious recruiter emails or offer letters for fraud flags and domain risks.
              </p>
            </div>
            <div className="text-xs font-bold text-amber-600 mt-4 flex items-center gap-1">
              <span>Verify Job</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </motion.div>

          {/* Card 6: Resume Builder */}
          <motion.div
            variants={itemVariants}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            whileTap={{ scale: 0.99 }}
            onClick={() => onNavigate('Resume Builder')}
            className="card-clean-hover p-5 rounded-2xl cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center">
                  <PenTool className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-mono font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded">
                  BUILDER
                </span>
              </div>
              <h3 className="font-bold text-slate-900 text-sm">Resume Builder</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Draft an ATS-tailored resume format with action verbs and quantifiable achievements.
              </p>
            </div>
            <div className="text-xs font-bold text-rose-600 mt-4 flex items-center gap-1">
              <span>Build Resume</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </motion.div>

          {/* Card 7: Career Assistant */}
          <motion.div
            variants={itemVariants}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            whileTap={{ scale: 0.99 }}
            onClick={() => onNavigate('Career Assistant')}
            className="card-clean-hover p-5 rounded-2xl cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center">
                  <Bot className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-mono font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                  ADVISOR
                </span>
              </div>
              <h3 className="font-bold text-slate-900 text-sm">Career Assistant</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Receive personalized guidance on portfolio projects, interview negotiation, and career steps.
              </p>
            </div>
            <div className="text-xs font-bold text-blue-600 mt-4 flex items-center gap-1">
              <span>Chat Advisor</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </motion.div>

          {/* Card 8: Career Roadmap */}
          <motion.div
            variants={itemVariants}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            whileTap={{ scale: 0.99 }}
            onClick={() => onNavigate('Career Roadmap')}
            className="card-clean-hover p-5 rounded-2xl cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center">
                  <Route className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-mono font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                  PROGRESSION
                </span>
              </div>
              <h3 className="font-bold text-slate-900 text-sm">Career Roadmap</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Explore an interactive milestone progression graph connecting junior to principal levels.
              </p>
            </div>
            <div className="text-xs font-bold text-emerald-600 mt-4 flex items-center gap-1">
              <span>View Pathway</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </motion.div>
        </div>
      </div>

      {/* SEARCH STRIP & RECENT ACTIVITY */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <motion.div variants={itemVariants} className="lg:col-span-8 bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Search Any Role or Skill Benchmark</div>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={roleSearch}
                onChange={e => setRoleSearch(e.target.value)}
                placeholder="e.g. Full Stack Engineer, Cloud Architect, Data Scientist..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
              />
            </div>
            <button
              onClick={() => onNavigate('Job Match')}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-xs"
            >
              Search Jobs
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <span className="text-[11px] text-slate-400">Popular:</span>
            {['Software Engineer', 'Data Scientist', 'Cloud DevOps', 'ML Specialist', 'Engineering Lead'].map((k, i) => (
              <button
                key={i}
                onClick={() => setRoleSearch(k)}
                className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 text-[11px] font-semibold transition"
              >
                {k}
              </button>
            ))}
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="lg:col-span-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Telemetry Stream</span>
            <span className="text-xs font-bold text-blue-600 cursor-pointer">Live Feed</span>
          </div>
          <div className="space-y-3">
            <div className="flex items-start gap-3 text-xs">
              <div className="w-6 h-6 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5 font-bold">
                ✓
              </div>
              <div className="min-w-0">
                <div className="font-bold text-slate-800">Resume Scanned &amp; Scored</div>
                <div className="text-slate-400 text-[11px]">84/100 ATS Rating · Quantified bullets verified</div>
              </div>
            </div>

            <div className="flex items-start gap-3 text-xs">
              <div className="w-6 h-6 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 mt-0.5 font-bold">
                ⚡
              </div>
              <div className="min-w-0">
                <div className="font-bold text-slate-800">Vector Job Alignment Active</div>
                <div className="text-slate-400 text-[11px]">88% Similarity to Senior Software requisitions</div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};
