import React, { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Candidate, HiringCampaign } from '../../types';
import {
  Users,
  Megaphone,
  UploadCloud,
  Award,
  Send,
  BarChart3,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Clock,
  ShieldCheck,
  TrendingUp,
  FileCheck,
  Zap,
  RotateCcw,
  RefreshCw,
  Mail,
  Check,
  AlertCircle,
  ExternalLink,
  Target
} from 'lucide-react';
import { CareerLensLogo } from '../../components/CareerLensLogo';

interface RecruiterDashboardViewProps {
  campaign: HiringCampaign | null;
  candidates: Candidate[];
  onNavigate: (tool: string) => void;
  onScreenCohort?: () => void;
  onClearCandidates?: () => void;
  onUpdateCandidate?: (candidateId: string, updates: Partial<Candidate>) => void;
}

interface LiveAssessmentItem {
  id: string;
  candidateId?: string;
  candidateName: string;
  email: string;
  role: string;
  score: number | null;
  totalQuestions: number;
  correctAnswers: number;
  status: 'Completed' | 'In Progress' | 'Expired';
  submittedAt?: string;
  durationMinutes?: number;
}

export const RecruiterDashboardView: React.FC<RecruiterDashboardViewProps> = ({
  campaign,
  candidates,
  onNavigate,
  onScreenCohort,
  onClearCandidates,
  onUpdateCandidate,
}) => {
  const [liveAssessments, setLiveAssessments] = useState<LiveAssessmentItem[]>([]);
  const [loadingResults, setLoadingResults] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());

  // Fetch real-time assessment submissions from server-authoritative store
  const fetchLiveAssessments = async () => {
    setLoadingResults(true);
    try {
      const res = await fetch('/api/recruiter/assessment-results');
      if (res.ok) {
        const data = await res.json();
        const rawResults: LiveAssessmentItem[] = Array.isArray(data)
          ? data
          : Array.isArray(data.results)
          ? data.results
          : [];

        setLiveAssessments(rawResults);
        setLastRefreshed(new Date());

        // Automatically sync completed submissions back to candidates
        if (onUpdateCandidate) {
          rawResults.forEach(item => {
            if (item.status === 'Completed' && item.score !== null) {
              const matchedCand = candidates.find(
                c => (item.candidateId && c.id === item.candidateId) ||
                     (item.email && c.email.toLowerCase() === item.email.toLowerCase())
              );

              if (matchedCand && matchedCand.assessment_status !== 'Completed') {
                onUpdateCandidate(matchedCand.id, {
                  assessment_status: 'Completed',
                  status: 'Assessed',
                  assessment_result: {
                    score: item.correctAnswers,
                    total: item.totalQuestions,
                    percentage: item.score,
                    correct_count: item.correctAnswers,
                    wrong_count: item.totalQuestions - item.correctAnswers,
                    unanswered_count: 0,
                    score_out_of_100: item.score,
                  },
                });
              }
            }
          });
        }
      }
    } catch {
      // Graceful offline fallback
    } finally {
      setLoadingResults(false);
    }
  };

  useEffect(() => {
    fetchLiveAssessments();
    // Auto-poll every 12 seconds for fresh incoming submissions
    const interval = setInterval(fetchLiveAssessments, 12000);
    return () => clearInterval(interval);
  }, [candidates.length]);

  const totalCount = candidates.length;
  const shortlistedCount = candidates.filter(
    c => c.status === 'Shortlisted' || c.status === 'Assessed'
  ).length;

  // Assessments dispatched & completed count
  const dispatchedTokensCount = candidates.filter(
    c => c.assessment_status === 'Sent' || c.assessment_status === 'Completed' || c.test_token
  ).length;

  const completedSubmissions = liveAssessments.filter(a => a.status === 'Completed');
  const inProgressSubmissions = liveAssessments.filter(a => a.status === 'In Progress');

  // Overall average assessment score
  const avgExamScore = useMemo(() => {
    if (completedSubmissions.length === 0) return null;
    const total = completedSubmissions.reduce((acc, curr) => acc + (curr.score || 0), 0);
    return Math.round(total / completedSubmissions.length);
  }, [completedSubmissions]);

  // Pass rate based on campaign threshold
  const passRate = useMemo(() => {
    if (completedSubmissions.length === 0) return 0;
    const threshold = campaign?.passing_score || 70;
    const passed = completedSubmissions.filter(a => (a.score || 0) >= threshold).length;
    return Math.round((passed / completedSubmissions.length) * 100);
  }, [completedSubmissions, campaign?.passing_score]);

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

  const recruiterModules = [
    { name: 'Hiring Campaign', icon: Megaphone, tag: 'Requisition', color: 'text-purple-600 bg-purple-50 border-purple-200', desc: 'Define criteria, job requisitions & qualifying cutoff thresholds' },
    { name: 'Bulk Resume Screening', icon: UploadCloud, tag: 'Screening', color: 'text-blue-600 bg-blue-50 border-blue-200', desc: 'Batch parse resumes and extract candidate emails directly' },
    { name: 'Shortlisted Candidates', icon: Award, tag: 'Shortlist', color: 'text-emerald-600 bg-emerald-50 border-emerald-200', desc: 'Manage qualifying applicants ready for tests or direct calls' },
    { name: 'Assessment Dispatcher', icon: Send, tag: 'SendGrid', color: 'text-indigo-600 bg-indigo-50 border-indigo-200', desc: 'Finalize exam questions, timers, and send via SendGrid' },
    { name: 'Assessment Results', icon: BarChart3, tag: 'Audit', color: 'text-teal-600 bg-teal-50 border-teal-200', desc: 'Detailed score breakdowns and question-level candidate audits' },
    { name: 'Interview Pipeline', icon: Users, tag: 'Pipeline', color: 'text-rose-600 bg-rose-50 border-rose-200', desc: 'Multi-stage candidate flow from screening to hiring offer' },
  ];

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-6 max-w-7xl mx-auto selection:bg-purple-600 selection:text-white"
    >
      {/* Top Banner with Logo Emblem & Requisition Meta */}
      <motion.div
        variants={itemVariants}
        className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-5 relative overflow-hidden"
      >
        <div className="space-y-2 z-10 max-w-2xl">
          <div className="flex items-center gap-2.5">
            <CareerLensLogo size="sm" />
            <div className="flex items-center gap-2 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <span className={`w-2 h-2 rounded-full ${totalCount > 0 ? 'bg-purple-500 animate-pulse' : 'bg-slate-400'}`} />
              <span>RECRUITER WORKSPACE</span>
            </div>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
            {campaign?.title || 'Software Engineering'} Requisition
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-normal leading-relaxed">
            Company: {campaign?.company || 'Organization'} · {totalCount > 0 ? `${totalCount} Applicants Screened · ${shortlistedCount} Shortlisted · ${completedSubmissions.length} Exam Submissions` : '0 Applicants Ingested · Ready for Bulk Resume Screening'}
          </p>

          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="bg-purple-50 text-purple-700 text-[11px] font-bold px-2.5 py-1 rounded-full border border-purple-200">
              Active Campaign
            </span>
            <span className="bg-blue-50 text-blue-700 text-[11px] font-bold px-2.5 py-1 rounded-full border border-blue-200">
              Cutoff: ≥{campaign?.passing_score || 70}% Pass
            </span>
            <span className="bg-emerald-50 text-emerald-700 text-[11px] font-bold px-2.5 py-1 rounded-full border border-emerald-200 flex items-center gap-1">
              <Zap className="w-3 h-3 text-emerald-600" />
              SendGrid Integration Active
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 z-10">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onNavigate('Assessment Dispatcher')}
            className="px-5 py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-xs transition flex items-center gap-2 cursor-pointer"
          >
            <Send className="w-4 h-4" />
            <span>Open Exam Dispatcher</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </motion.button>

          <button
            onClick={fetchLiveAssessments}
            disabled={loadingResults}
            className="p-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition cursor-pointer"
            title="Refresh Live Assessment Results"
          >
            <RefreshCw className={`w-4 h-4 ${loadingResults ? 'animate-spin text-purple-600' : ''}`} />
          </button>

          {totalCount > 0 && onClearCandidates && (
            <button
              onClick={onClearCandidates}
              className="p-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-500 transition cursor-pointer"
              title="Reset candidates roster"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}
        </div>
      </motion.div>

      {/* TOP REAL-TIME RECRUITER METRIC TILES */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Screened */}
        <motion.div
          variants={itemVariants}
          whileHover={{ y: -3, transition: { duration: 0.2 } }}
          className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs flex flex-col justify-between"
        >
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Resumes</div>
          <div className="text-3xl font-black text-slate-900 font-mono mt-1">
            {totalCount}
          </div>
          <div className="text-[11px] text-slate-500 font-medium mt-1">
            {totalCount > 0 ? 'Extracted & Parsed' : 'Awaiting batch upload'}
          </div>
        </motion.div>

        {/* Shortlisted Pool */}
        <motion.div
          variants={itemVariants}
          whileHover={{ y: -3, transition: { duration: 0.2 } }}
          className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs flex flex-col justify-between"
        >
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Shortlisted Candidates</div>
          <div className="text-3xl font-black text-purple-900 font-mono mt-1">
            {shortlistedCount}
          </div>
          <div className="text-[11px] text-purple-700 font-semibold mt-1">
            {totalCount > 0 ? `${Math.round((shortlistedCount / totalCount) * 100)}% Qualified pool` : 'Cutoff ≥ 70%'}
          </div>
        </motion.div>

        {/* Dispatched Exam Invitations */}
        <motion.div
          variants={itemVariants}
          whileHover={{ y: -3, transition: { duration: 0.2 } }}
          className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs flex flex-col justify-between"
        >
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Exams Dispatched</div>
          <div className="text-3xl font-black text-indigo-900 font-mono mt-1">
            {dispatchedTokensCount || liveAssessments.length}
          </div>
          <div className="text-[11px] text-indigo-600 font-medium mt-1 flex items-center gap-1">
            <Mail className="w-3 h-3 text-indigo-500" />
            <span>SendGrid invitation tokens</span>
          </div>
        </motion.div>

        {/* Completed Submissions & Score */}
        <motion.div
          variants={itemVariants}
          whileHover={{ y: -3, transition: { duration: 0.2 } }}
          className="p-5 rounded-2xl bg-emerald-50/60 border border-emerald-200 shadow-2xs flex flex-col justify-between"
        >
          <div className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider">Completed Exams</div>
          <div className="text-3xl font-black text-emerald-950 font-mono mt-1 flex items-baseline gap-2">
            <span>{completedSubmissions.length}</span>
            {avgExamScore !== null && (
              <span className="text-xs font-bold text-emerald-700 font-sans">
                Avg: {avgExamScore}%
              </span>
            )}
          </div>
          <div className="text-[11px] text-emerald-700 font-semibold mt-1">
            {completedSubmissions.length > 0 ? `${passRate}% Qualified Pass Rate` : 'Awaiting candidate submissions'}
          </div>
        </motion.div>
      </div>

      {/* ============================================================ */}
      {/* CRITICAL UPGRADE: LIVE ASSESSMENT SUBMISSIONS & EXAM RESULTS */}
      {/* ============================================================ */}
      <motion.div
        variants={itemVariants}
        className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-xs space-y-5"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                Live Submissions
              </span>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs text-slate-500 font-medium">
                Real-Time Candidate Exam Submissions &amp; Grades
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
              Candidate Examination Results
            </h2>
            <p className="text-xs text-slate-500">
              Exam scores, question counts, and submission timestamps delivered directly to your recruiter dashboard.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={fetchLiveAssessments}
              disabled={loadingResults}
              className="px-3.5 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-700 transition flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingResults ? 'animate-spin text-purple-600' : ''}`} />
              <span>Refresh Results</span>
            </button>
            <button
              onClick={() => onNavigate('Assessment Results')}
              className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
            >
              <span>Full Audit View</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Live Submissions Table / Cards */}
        {liveAssessments.length === 0 ? (
          <div className="py-12 text-center border-2 border-dashed border-slate-200 rounded-2xl space-y-3 bg-slate-50/40">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mx-auto">
              <BarChart3 className="w-6 h-6" />
            </div>
            <div className="max-w-sm mx-auto space-y-1">
              <h4 className="font-bold text-slate-800 text-sm">No Assessment Submissions Yet</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Send time-bound test tokens via SendGrid in the Assessment Dispatcher. Once candidates submit, their scores will immediately appear here.
              </p>
            </div>
            <div className="pt-2">
              <button
                onClick={() => onNavigate('Assessment Dispatcher')}
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Go to Assessment Dispatcher</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase text-[10px]">
                  <th className="pb-3">Candidate</th>
                  <th className="pb-3">Target Role</th>
                  <th className="pb-3">Exam Status</th>
                  <th className="pb-3">Score &amp; Accuracy</th>
                  <th className="pb-3">Submitted At</th>
                  <th className="pb-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {liveAssessments.map((item, idx) => {
                  const isPassed = item.score !== null && item.score >= (campaign?.passing_score || 70);
                  const initials = item.candidateName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'CD';

                  return (
                    <tr key={item.id || idx} className="hover:bg-slate-50/70 transition">
                      {/* Candidate Name & Resume Extracted Email */}
                      <td className="py-3.5 font-bold text-slate-900 flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-purple-50 border border-purple-200 text-purple-700 flex items-center justify-center font-bold text-xs shrink-0">
                          {initials}
                        </div>
                        <div>
                          <div className="font-extrabold text-slate-950 text-xs flex items-center gap-1.5">
                            <span>{item.candidateName}</span>
                          </div>
                          <div className="text-[11px] text-slate-500 font-mono flex items-center gap-1">
                            <Mail className="w-3 h-3 text-slate-400" />
                            <span>{item.email || 'Email in resume'}</span>
                          </div>
                        </div>
                      </td>

                      {/* Role */}
                      <td className="py-3.5">
                        <span className="font-semibold text-slate-800 text-xs">
                          {item.role || 'Software Developer'}
                        </span>
                        <div className="text-[10px] text-slate-400">
                          {item.durationMinutes || 30} Min Allotted
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3.5">
                        {item.status === 'Completed' ? (
                          <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                            isPassed
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              : 'bg-purple-50 text-purple-800 border-purple-200'
                          }`}>
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            {isPassed ? 'Passed' : 'Completed'}
                          </span>
                        ) : item.status === 'In Progress' ? (
                          <span className="inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-ping" />
                            In Progress
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                            <Clock className="w-3 h-3 text-amber-600" />
                            Expired
                          </span>
                        )}
                      </td>

                      {/* Score Gauge */}
                      <td className="py-3.5">
                        {item.score !== null ? (
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-black font-mono text-slate-900">
                                {item.score}%
                              </span>
                              <span className="text-[10px] text-slate-500">
                                ({item.correctAnswers}/{item.totalQuestions} correct)
                              </span>
                            </div>
                            <div className="w-24 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full ${
                                  isPassed ? 'bg-emerald-500' : 'bg-purple-600'
                                }`}
                                style={{ width: `${Math.min(100, item.score)}%` }}
                              />
                            </div>
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-400 italic">Awaiting submission</span>
                        )}
                      </td>

                      {/* Timestamp */}
                      <td className="py-3.5 text-[11px] text-slate-500">
                        {item.submittedAt ? (
                          <div>
                            <div>{new Date(item.submittedAt).toLocaleDateString()}</div>
                            <div className="text-[10px] text-slate-400">
                              {new Date(item.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </div>
                        ) : (
                          <span className="text-slate-400">--</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 text-right">
                        <button
                          onClick={() => onNavigate('Assessment Results')}
                          className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-purple-100 text-purple-700 text-xs font-bold transition cursor-pointer"
                        >
                          View Audit
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

      {/* RECRUITER WORKSPACE MODULES GRID */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-black text-slate-900 tracking-tight">Recruiter Operations Modules</h2>
          <span className="text-xs text-slate-500 font-medium">Quick access across the recruitment lifecycle</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {recruiterModules.map(mod => {
            const Icon = mod.icon;
            return (
              <motion.div
                key={mod.name}
                variants={itemVariants}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                whileTap={{ scale: 0.99 }}
                onClick={() => onNavigate(mod.name)}
                className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs hover:border-purple-300 hover:shadow-xs transition cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-200 text-purple-600 flex items-center justify-center">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                      {mod.tag}
                    </span>
                  </div>
                  <h3 className="font-bold text-slate-900 text-sm">{mod.name}</h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    {mod.desc}
                  </p>
                </div>
                <div className="text-xs font-bold text-purple-600 mt-4 flex items-center gap-1">
                  <span>Open {mod.name}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* CANDIDATE LEADERBOARD & REQUISITION FIT TABLE */}
      <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-black text-slate-900">Screened Candidate Roster</h3>
            <p className="text-xs text-slate-500">Ranked by resume match score, extracted contact status, and assessment progress</p>
          </div>
          {totalCount > 0 && (
            <button
              onClick={() => onNavigate('Bulk Resume Screening')}
              className="text-xs font-bold text-purple-600 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>View All ({totalCount})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {totalCount === 0 ? (
          <div className="py-12 text-center border-2 border-dashed border-slate-200 rounded-2xl space-y-3">
            <UploadCloud className="w-10 h-10 text-slate-300 mx-auto" />
            <div className="max-w-sm mx-auto">
              <h4 className="font-bold text-slate-800 text-sm">No Candidates Screened Yet</h4>
              <p className="text-xs text-slate-400 mt-1">
                Upload resume files to batch extract contact details, score candidates, and dispatch SendGrid exam invitations.
              </p>
            </div>
            <button
              onClick={() => onNavigate('Bulk Resume Screening')}
              className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-xs transition inline-flex items-center gap-2 cursor-pointer"
            >
              <UploadCloud className="w-4 h-4" />
              <span>Go to Bulk Screening</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase text-[10px]">
                  <th className="pb-2.5">Candidate</th>
                  <th className="pb-2.5">Resume Score</th>
                  <th className="pb-2.5">Role Match</th>
                  <th className="pb-2.5">Assessment Status</th>
                  <th className="pb-2.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {candidates.slice(0, 6).map((cand, idx) => {
                  const initials = cand.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'CD';
                  const isAssessed = cand.assessment_status === 'Completed';

                  return (
                    <tr key={cand.id || idx} className="hover:bg-slate-50/70 transition">
                      <td className="py-3.5 font-bold text-slate-900 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs shrink-0">
                          {initials}
                        </div>
                        <div>
                          <div className="font-extrabold text-slate-950 text-xs">{cand.name}</div>
                          <div className="text-[11px] text-slate-400 font-mono">{cand.email}</div>
                        </div>
                      </td>
                      <td className="py-3.5 font-mono font-bold text-slate-900 text-xs">
                        {cand.resume_score}/100
                      </td>
                      <td className="py-3.5 font-mono font-bold text-blue-700 text-xs">
                        <span className="bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
                          {cand.role_match}%
                        </span>
                      </td>
                      <td className="py-3.5">
                        <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                          isAssessed
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : cand.assessment_status === 'Sent'
                            ? 'bg-purple-50 text-purple-700 border-purple-200'
                            : 'bg-slate-100 text-slate-600 border-slate-200'
                        }`}>
                          {isAssessed ? (
                            <>
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              Assessed {cand.assessment_result ? `(${cand.assessment_result.percentage}%)` : ''}
                            </>
                          ) : cand.assessment_status === 'Sent' ? (
                            <>
                              <Mail className="w-3 h-3 text-purple-600" />
                              Exam Sent
                            </>
                          ) : (
                            'Not Sent'
                          )}
                        </span>
                      </td>
                      <td className="py-3.5 text-right">
                        <button
                          onClick={() => onNavigate('Assessment Dispatcher')}
                          className="px-3 py-1.5 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-bold transition cursor-pointer"
                        >
                          {cand.assessment_status === 'Completed' ? 'View Result' : 'Dispatch Exam'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </motion.div>
  );
};
