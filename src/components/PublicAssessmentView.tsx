import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { AssessmentQuestion } from '../types';
import { sanitizeCandidateName } from '../services/careerService';
import {
  Clock,
  CheckCircle2,
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  FileText,
  Check,
  Bookmark,
  Sparkles,
  RotateCcw,
  Building,
  Send,
  Zap,
  Calendar,
  Layers,
  ChevronRight,
  Eye,
  HelpCircle,
} from 'lucide-react';
import { CareerLensLogo } from './CareerLensLogo';

interface PublicAssessmentViewProps {
  token: string;
  onExit?: () => void;
}

export const PublicAssessmentView: React.FC<PublicAssessmentViewProps> = ({ token, onExit }) => {
  const [loading, setLoading] = useState(true);
  const [assessmentData, setAssessmentData] = useState<any>(null);
  const [questions, setQuestions] = useState<AssessmentQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [flagged, setFlagged] = useState<Record<number, boolean>>({});
  const [examStarted, setExamStarted] = useState(false);
  const [reviewMode, setReviewMode] = useState(false);
  const [confirmSubmitModal, setConfirmSubmitModal] = useState(false);
  const [timeLeft, setTimeLeft] = useState(1800); // in seconds
  const [submitted, setSubmitted] = useState(false);
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [submitting, setSubmitting] = useState(false);
  const [navFilter, setNavFilter] = useState<'all' | 'unanswered' | 'flagged'>('all');

  // Real-time tick every second
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch assessment payload
  useEffect(() => {
    async function fetchAssessment() {
      try {
        const res = await fetch(`/api/public/assessment/${token}`);
        if (res.ok) {
          const data = await res.json();
          setAssessmentData(data);
          setQuestions(data.questions || []);
          setTimeLeft((data.duration_minutes || 30) * 60);
          if (data.used) {
            setSubmitted(true);
          }
        } else {
          // If token not found in memory, load standard ATS role assessment
          const gen = await fetch('/api/assessment/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ role: 'Software Engineer', question_count: 10 }),
          });
          const genData = await gen.json();
          setQuestions(genData.questions || []);
          setAssessmentData({
            role: 'Software Engineer',
            company_name: 'Apex Systems',
            hiring_manager: 'Talent Acquisition Team',
            candidate_name: 'Candidate',
            duration_minutes: 30,
            start_time: null,
            end_time: null,
            used: false,
          });
        }
      } catch (err) {
        console.error('Failed to load assessment:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchAssessment();
  }, [token]);

  // Exam countdown timer (only ticks after exam starts and before submission)
  useEffect(() => {
    if (!examStarted || submitted || loading || timeLeft <= 0) return;

    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          handleSubmitAssessment();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [examStarted, timeLeft, submitted, loading]);

  const handleSubmitAssessment = async () => {
    if (submitting || submitted) return;
    setSubmitting(true);
    try {
      await fetch(`/api/public/assessment/${token}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers }),
      });
      setSubmitted(true);
      setConfirmSubmitModal(false);
      setReviewMode(false);
    } catch (e) {
      console.error('Error submitting assessment:', e);
      setSubmitted(true);
      setConfirmSubmitModal(false);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSelectOption = (qId: number, opt: string) => {
    setAnswers(prev => ({ ...prev, [qId]: opt }));
  };

  const handleClearOption = (qId: number) => {
    setAnswers(prev => {
      const next = { ...prev };
      delete next[qId];
      return next;
    });
  };

  const handleToggleFlag = (qId: number) => {
    setFlagged(prev => ({ ...prev, [qId]: !prev[qId] }));
  };

  // Keyboard navigation shortcuts
  useEffect(() => {
    if (!examStarted || reviewMode || submitted || !questions[currentIndex]) return;
    const currentQ = questions[currentIndex];

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in an input
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;

      if (e.key === 'ArrowRight' && currentIndex < questions.length - 1) {
        setCurrentIndex(prev => prev + 1);
      } else if (e.key === 'ArrowLeft' && currentIndex > 0) {
        setCurrentIndex(prev => prev - 1);
      } else if (['1', 'a', 'A'].includes(e.key) && currentQ.options[0]) {
        handleSelectOption(currentQ.id, currentQ.options[0]);
      } else if (['2', 'b', 'B'].includes(e.key) && currentQ.options[1]) {
        handleSelectOption(currentQ.id, currentQ.options[1]);
      } else if (['3', 'c', 'C'].includes(e.key) && currentQ.options[2]) {
        handleSelectOption(currentQ.id, currentQ.options[2]);
      } else if (['4', 'd', 'D'].includes(e.key) && currentQ.options[3]) {
        handleSelectOption(currentQ.id, currentQ.options[3]);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [examStarted, reviewMode, submitted, currentIndex, questions]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 selection:bg-purple-600 selection:text-white">
        <div className="bg-white p-8 rounded-3xl border border-slate-200/90 shadow-md text-center space-y-4 max-w-sm w-full">
          <div className="w-10 h-10 border-3 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <div>
            <p className="text-slate-900 font-black text-sm">Authenticating Assessment Token</p>
            <p className="text-slate-400 text-xs mt-1">Connecting to CareerLens ATS Gateway...</p>
          </div>
        </div>
      </div>
    );
  }

  const rawCandidateName = assessmentData?.candidate_name || 'Candidate';
  const candidateEmail = assessmentData?.candidate_email || '';
  const candidateName = sanitizeCandidateName(rawCandidateName, undefined, undefined, candidateEmail);
  const roleTitle = assessmentData?.role || 'Technical Screening Assessment';
  const companyName = assessmentData?.company_name || 'Hiring Organization';
  const hiringManager = assessmentData?.hiring_manager || 'Talent Acquisition Team';
  const durationMinutes = Number(assessmentData?.duration_minutes) || 30;
  const startTime = assessmentData?.start_time ? new Date(assessmentData.start_time) : null;
  const endTime = assessmentData?.end_time ? new Date(assessmentData.end_time) : null;

  const isBeforeStartTime = startTime ? startTime > currentTime : false;
  const isAfterEndTime = endTime ? endTime < currentTime : false;

  // ============================================================
  // VIEW 1: Scheduled Waiting Room & Pre-Exam Positional Briefing
  // ============================================================
  if (!examStarted && !submitted) {
    // If the scheduled end time has passed
    if (isAfterEndTime) {
      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 selection:bg-purple-600 selection:text-white">
          <div className="bg-white max-w-lg w-full rounded-3xl p-8 border border-slate-200 shadow-md text-center space-y-5">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h2 className="text-xl font-black text-slate-900">Assessment Window Closed</h2>
              <p className="text-xs text-slate-500">
                The scheduled examination window for this technical evaluation concluded on:
              </p>
              <p className="text-xs font-mono font-bold text-slate-800 bg-slate-100 py-1.5 px-3 rounded-lg inline-block mt-2">
                {endTime?.toLocaleString()}
              </p>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed max-w-sm mx-auto">
              If you require a rescheduled testing window or experienced technical difficulties, please contact {hiringManager} at {companyName}.
            </p>
            {onExit && (
              <button
                onClick={onExit}
                className="px-6 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition cursor-pointer"
              >
                Return to CareerLens Portal
              </button>
            )}
          </div>
        </div>
      );
    }

    // Live countdown calculation
    const diffSeconds = startTime && isBeforeStartTime
      ? Math.max(0, Math.floor((startTime.getTime() - currentTime.getTime()) / 1000))
      : 0;

    const days = Math.floor(diffSeconds / (3600 * 24));
    const hours = Math.floor((diffSeconds % (3600 * 24)) / 3600);
    const minutes = Math.floor((diffSeconds % 3600) / 60);
    const seconds = diffSeconds % 60;

    return (
      <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 selection:bg-purple-600 selection:text-white flex items-center justify-center">
        <div className="max-w-2xl w-full bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-xl space-y-7 relative overflow-hidden">
          {/* Subtle top ambient glow */}
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-800" />

          {/* Top Brand & Requisition Badge */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <CareerLensLogo size="sm" showText={true} />
            <div className="flex items-center gap-2 self-start sm:self-auto">
              <span className="text-[11px] font-bold text-purple-700 bg-purple-50 px-3 py-1 rounded-full border border-purple-200 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
                <span>Verified Positional Evaluation</span>
              </span>
            </div>
          </div>

          {/* Personalized Greeting & Requisition Details */}
          <div className="space-y-2 text-center sm:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold uppercase tracking-wider">
              <Building className="w-3.5 h-3.5 text-purple-600" />
              <span>{companyName}</span>
              <span className="text-slate-300">•</span>
              <span className="text-purple-700">Talent Acquisition</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight pt-1">
              Dear {candidateName},
            </h1>

            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              {isBeforeStartTime ? (
                <>
                  Please wait for your examination. Your test for the{' '}
                  <strong className="text-purple-700">{roleTitle}</strong> position will be starting shortly.
                </>
              ) : (
                <>
                  Welcome to your technical screening examination for the{' '}
                  <strong className="text-purple-700">{roleTitle}</strong> position at{' '}
                  <strong className="text-slate-900">{companyName}</strong>.
                </>
              )}
            </p>
          </div>

          {/* Trendy Countdown Section (If Scheduled in Future) */}
          {isBeforeStartTime && (
            <div className="p-6 sm:p-7 rounded-2xl bg-gradient-to-br from-purple-900 via-indigo-900 to-purple-950 text-white shadow-lg space-y-4 text-center relative overflow-hidden">
              <div className="text-xs font-black uppercase tracking-wider text-purple-200 flex items-center justify-center gap-1.5">
                <Clock className="w-4 h-4 text-amber-300 animate-spin" />
                <span>Examination Window Opens In:</span>
              </div>

              {/* 4 Digital Flip-Style Timer Blocks */}
              <div className="grid grid-cols-4 gap-2.5 sm:gap-4 max-w-md mx-auto pt-1">
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/15 shadow-inner">
                  <div className="text-2xl sm:text-3xl font-black font-mono tabular-nums text-white">
                    {String(days).padStart(2, '0')}
                  </div>
                  <div className="text-[10px] uppercase font-bold text-purple-200 mt-1">Days</div>
                </div>

                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/15 shadow-inner">
                  <div className="text-2xl sm:text-3xl font-black font-mono tabular-nums text-white">
                    {String(hours).padStart(2, '0')}
                  </div>
                  <div className="text-[10px] uppercase font-bold text-purple-200 mt-1">Hours</div>
                </div>

                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/15 shadow-inner">
                  <div className="text-2xl sm:text-3xl font-black font-mono tabular-nums text-white">
                    {String(minutes).padStart(2, '0')}
                  </div>
                  <div className="text-[10px] uppercase font-bold text-purple-200 mt-1">Mins</div>
                </div>

                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/15 shadow-inner">
                  <div className="text-2xl sm:text-3xl font-black font-mono tabular-nums text-amber-300">
                    {String(seconds).padStart(2, '0')}
                  </div>
                  <div className="text-[10px] uppercase font-bold text-purple-200 mt-1">Secs</div>
                </div>
              </div>

              <div className="text-xs text-purple-200/90 pt-1 font-medium">
                Scheduled Start:{' '}
                <strong className="text-white font-mono">{startTime?.toLocaleString()}</strong>
              </div>
            </div>
          )}

          {/* Positional Evaluation Blueprint Card */}
          <div className="p-5 rounded-2xl bg-purple-50/70 border border-purple-200/90 space-y-3">
            <div className="text-xs font-black uppercase tracking-wider text-purple-900 flex items-center justify-between">
              <span>Positional Examination Blueprint</span>
              <span className="font-mono text-[10px] text-purple-700">Strict 100-Mark Scale</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-1">
              <div className="bg-white p-3 rounded-xl border border-purple-100 shadow-2xs">
                <span className="text-[10px] font-bold uppercase text-slate-400 block">Target Role</span>
                <strong className="text-slate-900 font-extrabold truncate block mt-0.5">{roleTitle}</strong>
              </div>

              <div className="bg-white p-3 rounded-xl border border-purple-100 shadow-2xs">
                <span className="text-[10px] font-bold uppercase text-slate-400 block">Questions</span>
                <strong className="text-slate-900 font-extrabold block mt-0.5">{questions.length} Questions</strong>
              </div>

              <div className="bg-white p-3 rounded-xl border border-purple-100 shadow-2xs">
                <span className="text-[10px] font-bold uppercase text-slate-400 block">Allotted Time</span>
                <strong className="text-purple-700 font-extrabold block mt-0.5">{durationMinutes} Minutes</strong>
              </div>

              <div className="bg-white p-3 rounded-xl border border-purple-100 shadow-2xs">
                <span className="text-[10px] font-bold uppercase text-slate-400 block">Hiring Lead</span>
                <strong className="text-slate-900 font-extrabold truncate block mt-0.5">{hiringManager}</strong>
              </div>
            </div>
          </div>

          {/* Pre-Flight Proctoring & Integrity Checklist */}
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 text-xs text-slate-600 space-y-3">
            <div className="font-bold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Assessment Instructions &amp; Integrity Guidelines:</span>
            </div>

            <ul className="space-y-1.5 list-disc list-inside text-[11px] text-slate-600">
              <li>
                <strong>Single Attempt Session:</strong> Once started, the timer runs continuously. Do not refresh or close the tab.
              </li>
              <li>
                <strong>Positional Navigation:</strong> You can jump between questions and bookmark items using the question map.
              </li>
              <li>
                <strong>Autosaved Answers:</strong> Every selected answer is instantly saved in real time.
              </li>
              <li>
                <strong>Review Before Submit:</strong> You will have a review screen to verify unanswered questions before final submission.
              </li>
            </ul>
          </div>

          {/* Action CTA: Start Exam Button */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
            {onExit && (
              <button
                onClick={onExit}
                className="py-3 px-5 rounded-xl border border-slate-300 text-slate-600 font-bold text-xs hover:bg-slate-100 transition cursor-pointer w-full sm:w-auto"
              >
                Return to Portal
              </button>
            )}

            <button
              onClick={() => {
                setExamStarted(true);
              }}
              className="py-3.5 px-8 rounded-2xl bg-purple-700 hover:bg-purple-800 text-white font-black text-sm shadow-lg shadow-purple-600/25 transition flex items-center justify-center gap-2 cursor-pointer w-full sm:w-auto sm:ml-auto"
            >
              <Zap className="w-4 h-4 text-amber-300" />
              <span>
                {isBeforeStartTime ? 'Enter Room & Start Early' : 'Begin Positional Examination'}
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ============================================================
  // VIEW 2: Assessment Confirmed & Submitted Screen
  // ============================================================
  if (submitted) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 selection:bg-purple-600 selection:text-white">
        <div className="bg-white max-w-xl w-full rounded-3xl p-8 sm:p-10 border border-slate-200 shadow-xl text-center space-y-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600" />

          <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto shadow-2xs">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold uppercase tracking-wider">
              <Check className="w-3.5 h-3.5" />
              <span>Examination Completed &amp; Verified</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight pt-1">
              Thank You, {candidateName}!
            </h1>

            <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
              Your examination responses for the <strong className="text-purple-700">{roleTitle}</strong> position have been securely transmitted to the recruitment team at <strong className="text-slate-900">{companyName}</strong>.
            </p>
          </div>

          {/* Official Submission Receipt */}
          <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 text-left space-y-3">
            <div className="text-xs font-extrabold text-slate-800 uppercase tracking-wider flex items-center justify-between">
              <span>Official Submission Receipt</span>
              <span className="font-mono text-[10px] text-slate-400">SESSION: {token.slice(0, 14)}...</span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs pt-1">
              <div>
                <div className="text-[10px] font-bold text-slate-400 uppercase">Candidate</div>
                <div className="font-bold text-slate-900 truncate">{candidateName}</div>
              </div>
              <div>
                <div className="text-[10px] font-bold text-slate-400 uppercase">Target Role</div>
                <div className="font-bold text-slate-900 truncate">{roleTitle}</div>
              </div>
              <div>
                <div className="text-[10px] font-bold text-slate-400 uppercase">Hiring Company</div>
                <div className="font-bold text-purple-700 truncate">{companyName}</div>
              </div>
              <div>
                <div className="text-[10px] font-bold text-slate-400 uppercase">Recruiter / Lead</div>
                <div className="font-bold text-slate-800 truncate">{hiringManager}</div>
              </div>
              <div>
                <div className="text-[10px] font-bold text-slate-400 uppercase">Evaluation Delivery</div>
                <div className="font-bold text-emerald-600 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Delivered to ATS Dashboard</span>
                </div>
              </div>
              <div>
                <div className="text-[10px] font-bold text-slate-400 uppercase">Submitted At</div>
                <div className="font-mono text-slate-700 font-semibold">{new Date().toLocaleTimeString()}</div>
              </div>
            </div>
          </div>

          {/* Hiring Pipeline Explanation */}
          <div className="p-4 bg-purple-50/70 rounded-2xl border border-purple-200 text-left space-y-2">
            <div className="text-xs font-bold text-purple-900 flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-purple-600" />
              <span>Next Steps in the Hiring Process:</span>
            </div>
            <p className="text-[11px] text-purple-950/80 leading-relaxed">
              The talent acquisition team at <strong>{companyName}</strong> is reviewing your evaluation alongside your resume credentials. If your performance qualifies against benchmark requirements, {hiringManager} will contact you directly to schedule your technical interview.
            </p>
          </div>

          {onExit && (
            <div className="pt-2">
              <button
                onClick={onExit}
                className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs transition cursor-pointer"
              >
                Return to CareerLens Portal
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ============================================================
  // VIEW 3: Active Positional Examination Workspace
  // ============================================================
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const currentQ = questions[currentIndex];
  const answeredCount = Object.keys(answers).length;
  const flaggedCount = Object.values(flagged).filter(Boolean).length;
  const unansweredCount = questions.length - answeredCount;

  // Filter questions for the navigation palette
  const filteredQuestionIndices = questions.map((_, idx) => idx).filter(idx => {
    const q = questions[idx];
    if (navFilter === 'answered') return answers[q.id];
    if (navFilter === 'unanswered') return !answers[q.id];
    if (navFilter === 'flagged') return flagged[q.id];
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-50 py-6 px-4 sm:px-6 selection:bg-purple-600 selection:text-white">
      <div className="max-w-6xl mx-auto space-y-4">
        {/* Sticky Positional Executive Top Bar */}
        <div className="sticky top-3 z-30 bg-white/95 backdrop-blur-md rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <CareerLensLogo size="xs" showText={false} />
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-black uppercase tracking-wider text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-200">
                  POSITION: {roleTitle}
                </span>
                <span className="text-xs text-slate-300">•</span>
                <span className="text-xs font-bold text-slate-800">{companyName}</span>
              </div>
              <div className="text-xs text-slate-500 truncate mt-0.5">
                Candidate: <strong className="text-slate-800">{candidateName}</strong> · Lead: <span className="text-slate-600">{hiringManager}</span>
              </div>
            </div>
          </div>

          {/* Right Status Group: Autosaved, Review Trigger, Countdown Timer */}
          <div className="flex items-center gap-3 self-end md:self-auto shrink-0">
            {/* Real-time autosave pill */}
            <div className="hidden sm:flex items-center gap-1.5 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-xl border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Autosaved</span>
            </div>

            {/* Quick Review Mode Button */}
            <button
              onClick={() => setReviewMode(!reviewMode)}
              className="px-3.5 py-1.5 rounded-xl border border-slate-200 hover:border-purple-300 bg-slate-50 hover:bg-purple-50 text-slate-700 hover:text-purple-700 font-bold text-xs transition cursor-pointer flex items-center gap-1.5"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>{reviewMode ? 'Back to Questions' : 'Review Palette'}</span>
            </button>

            {/* Live Urgency Countdown Timer */}
            <div
              className={`flex items-center gap-2 font-mono tabular-nums font-black text-sm px-3.5 py-1.5 rounded-xl border shadow-xs transition ${
                timeLeft <= 60
                  ? 'bg-rose-50 text-rose-700 border-rose-300 animate-pulse'
                  : timeLeft <= 300
                  ? 'bg-amber-50 text-amber-800 border-amber-300'
                  : 'bg-purple-50 text-purple-900 border-purple-200'
              }`}
            >
              <Clock className="w-4 h-4 shrink-0" />
              <span>{String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}</span>
            </div>
          </div>
        </div>

        {/* REVIEW MODE OVERVIEW DRAWER / VIEW */}
        {reviewMode ? (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-md space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-xl font-black text-slate-950">Review Questions Before Final Submission</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Click any question to jump back and verify or modify your answer.
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setReviewMode(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-50 transition cursor-pointer"
                >
                  ← Back to Exam
                </button>
                <button
                  onClick={() => setConfirmSubmitModal(true)}
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-black text-xs shadow-md shadow-purple-600/20 transition cursor-pointer flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Submit Final Assessment</span>
                </button>
              </div>
            </div>

            {/* Answered / Unanswered Statistics Bar */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl">
                <div className="text-xs font-bold uppercase text-emerald-700">Answered</div>
                <div className="text-2xl font-black font-mono text-emerald-900 mt-1">{answeredCount}</div>
                <div className="text-[10px] text-emerald-700/80 mt-0.5">Ready for grading</div>
              </div>

              <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl">
                <div className="text-xs font-bold uppercase text-amber-700">Unanswered</div>
                <div className="text-2xl font-black font-mono text-amber-900 mt-1">{unansweredCount}</div>
                <div className="text-[10px] text-amber-700/80 mt-0.5">Will be marked zero</div>
              </div>

              <div className="bg-purple-50 border border-purple-200 p-4 rounded-2xl">
                <div className="text-xs font-bold uppercase text-purple-700">Flagged For Review</div>
                <div className="text-2xl font-black font-mono text-purple-900 mt-1">{flaggedCount}</div>
                <div className="text-[10px] text-purple-700/80 mt-0.5">Bookmarked questions</div>
              </div>
            </div>

            {/* Questions Grid Overview */}
            <div className="space-y-2.5 max-h-[460px] overflow-y-auto pr-2">
              {questions.map((q, idx) => {
                const isAnswered = Boolean(answers[q.id]);
                const isFlagged = Boolean(flagged[q.id]);

                return (
                  <div
                    key={q.id}
                    onClick={() => {
                      setCurrentIndex(idx);
                      setReviewMode(false);
                    }}
                    className={`p-4 rounded-2xl border transition flex items-center justify-between gap-4 cursor-pointer hover:border-purple-400 hover:shadow-xs ${
                      isAnswered ? 'bg-white border-slate-200' : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-8 h-8 rounded-xl font-bold text-xs flex items-center justify-center shrink-0 border ${
                          isAnswered
                            ? 'bg-purple-600 text-white border-purple-600'
                            : 'bg-white text-slate-600 border-slate-300'
                        }`}
                      >
                        {idx + 1}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700 bg-purple-50 px-2 py-0.2 rounded border border-purple-200">
                            {q.section || 'Technical Competency'}
                          </span>
                          {isFlagged && (
                            <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200 flex items-center gap-0.5">
                              <Bookmark className="w-2.5 h-2.5 fill-amber-500 text-amber-600" />
                              <span>Flagged</span>
                            </span>
                          )}
                        </div>
                        <p className="text-xs font-bold text-slate-900 truncate mt-1">{q.question}</p>
                        {isAnswered && (
                          <p className="text-[11px] text-slate-500 truncate mt-0.5">
                            Answer: <span className="font-semibold text-purple-900">{answers[q.id]}</span>
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="shrink-0 flex items-center gap-2">
                      <span
                        className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                          isAnswered
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}
                      >
                        {isAnswered ? 'Answered' : 'Unanswered'}
                      </span>
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          /* ACTIVE TWO-COLUMN POSITIONAL EXAM WORKSPACE */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            {/* LEFT COLUMN: Positional Question Navigator Palette (4 Columns) */}
            <div className="lg:col-span-4 bg-white rounded-3xl p-5 border border-slate-200 shadow-2xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                    Question Position Map
                  </h3>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    {answeredCount} of {questions.length} Answered
                  </div>
                </div>

                <span className="text-xs font-mono font-bold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-xl border border-purple-200">
                  {Math.round((answeredCount / (questions.length || 1)) * 100)}%
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-purple-600 h-full transition-all duration-300 rounded-full"
                  style={{ width: `${(answeredCount / (questions.length || 1)) * 100}%` }}
                />
              </div>

              {/* Quick Filters: All / Unanswered / Flagged */}
              <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 rounded-xl text-[11px] font-bold">
                <button
                  type="button"
                  onClick={() => setNavFilter('all')}
                  className={`py-1 rounded-lg transition cursor-pointer ${
                    navFilter === 'all' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  All ({questions.length})
                </button>
                <button
                  type="button"
                  onClick={() => setNavFilter('unanswered')}
                  className={`py-1 rounded-lg transition cursor-pointer ${
                    navFilter === 'unanswered' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  Left ({unansweredCount})
                </button>
                <button
                  type="button"
                  onClick={() => setNavFilter('flagged')}
                  className={`py-1 rounded-lg transition cursor-pointer ${
                    navFilter === 'flagged' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  Flagged ({flaggedCount})
                </button>
              </div>

              {/* Interactive Positional Grid */}
              <div className="grid grid-cols-5 gap-2 pt-1">
                {questions.map((q, idx) => {
                  const isCurrent = idx === currentIndex;
                  const isAnswered = Boolean(answers[q.id]);
                  const isFlagged = Boolean(flagged[q.id]);

                  return (
                    <button
                      key={q.id}
                      onClick={() => setCurrentIndex(idx)}
                      className={`relative h-11 rounded-xl font-bold font-mono text-xs transition flex items-center justify-center cursor-pointer border ${
                        isCurrent
                          ? 'border-purple-600 ring-2 ring-purple-600/30 bg-purple-50 text-purple-900 font-black shadow-xs scale-105 z-10'
                          : isAnswered
                          ? 'bg-purple-700 text-white border-purple-700 hover:bg-purple-800'
                          : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <span>{idx + 1}</span>
                      {isFlagged && (
                        <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-amber-400 ring-1 ring-white" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Map Legend */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400 font-medium">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded bg-purple-700" /> Answered
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded border border-purple-600 bg-purple-50" /> Current
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400" /> Flagged
                </span>
              </div>
            </div>

            {/* RIGHT COLUMN: Active Positional Question Card (8 Columns) */}
            <div className="lg:col-span-8 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-md space-y-6">
              {currentQ && (
                <>
                  {/* Category, Weight & Flag Row */}
                  <div className="flex items-center justify-between gap-3 flex-wrap border-b border-slate-100 pb-4">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black uppercase tracking-wider text-purple-700 bg-purple-50 px-3 py-1 rounded-full border border-purple-200">
                        {currentQ.section || 'Technical Competency'}
                      </span>
                      <span className="text-xs font-mono font-bold text-slate-400">
                        {Math.round(100 / (questions.length || 1))} Marks
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleToggleFlag(currentQ.id)}
                        className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                          flagged[currentQ.id]
                            ? 'bg-amber-50 text-amber-800 border-amber-300'
                            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <Bookmark
                          className={`w-3.5 h-3.5 ${
                            flagged[currentQ.id] ? 'fill-amber-500 text-amber-600' : 'text-slate-400'
                          }`}
                        />
                        <span>{flagged[currentQ.id] ? 'Flagged for Review' : 'Flag Question'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Question Header & Title */}
                  <div className="space-y-2">
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">
                      Question {currentIndex + 1} of {questions.length}
                    </div>
                    <h2 className="text-base sm:text-xl font-black text-slate-950 leading-snug">
                      {currentQ.question}
                    </h2>
                  </div>

                  {/* Positional Option Cards (A, B, C, D) */}
                  <div className="space-y-3 pt-1">
                    {currentQ.options.map((opt, oIdx) => {
                      const letter = ['A', 'B', 'C', 'D'][oIdx] || String(oIdx + 1);
                      const isSelected = answers[currentQ.id] === opt;

                      return (
                        <button
                          key={oIdx}
                          type="button"
                          onClick={() => handleSelectOption(currentQ.id, opt)}
                          className={`w-full p-4 sm:p-4.5 rounded-2xl border text-left text-xs sm:text-sm font-semibold transition flex items-center justify-between gap-3 cursor-pointer group ${
                            isSelected
                              ? 'border-purple-600 bg-gradient-to-r from-purple-50/90 to-purple-50/40 text-purple-950 ring-2 ring-purple-600/30 shadow-xs'
                              : 'border-slate-200 hover:border-purple-300 bg-white hover:bg-slate-50/70 text-slate-800'
                          }`}
                        >
                          <div className="flex items-center gap-3.5 min-w-0">
                            {/* Option Alphabet Badge */}
                            <div
                              className={`w-8 h-8 rounded-xl font-bold font-mono text-xs flex items-center justify-center shrink-0 border transition ${
                                isSelected
                                  ? 'bg-purple-600 text-white border-purple-600 shadow-2xs'
                                  : 'bg-slate-100 text-slate-600 border-slate-200 group-hover:bg-purple-50 group-hover:text-purple-700 group-hover:border-purple-200'
                              }`}
                            >
                              {letter}
                            </div>
                            <span className="leading-relaxed">{opt}</span>
                          </div>

                          {/* Selection Indicator Circle */}
                          <div
                            className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 transition ${
                              isSelected
                                ? 'border-purple-600 bg-purple-600 text-white'
                                : 'border-slate-300 group-hover:border-purple-400'
                            }`}
                          >
                            {isSelected && <Check className="w-3.5 h-3.5" />}
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Navigation Controls */}
                  <div className="flex items-center justify-between gap-3 pt-6 border-t border-slate-100 flex-wrap">
                    <button
                      type="button"
                      disabled={currentIndex === 0}
                      onClick={() => setCurrentIndex(prev => prev - 1)}
                      className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs disabled:opacity-30 hover:bg-slate-50 transition flex items-center gap-1.5 cursor-pointer disabled:cursor-not-allowed"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span>Previous</span>
                    </button>

                    <div className="flex items-center gap-2">
                      {answers[currentQ.id] && (
                        <button
                          type="button"
                          onClick={() => handleClearOption(currentQ.id)}
                          className="px-3 py-2 rounded-xl text-slate-400 hover:text-slate-600 font-bold text-xs hover:bg-slate-100 transition cursor-pointer"
                        >
                          Clear Selection
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => setReviewMode(true)}
                        className="px-4 py-2.5 rounded-xl border border-slate-200 text-purple-700 bg-purple-50 hover:bg-purple-100 font-bold text-xs transition cursor-pointer"
                      >
                        Review
                      </button>
                    </div>

                    {currentIndex < questions.length - 1 ? (
                      <button
                        type="button"
                        onClick={() => setCurrentIndex(prev => prev + 1)}
                        className="px-5 py-2.5 rounded-xl bg-purple-700 text-white font-bold text-xs hover:bg-purple-800 shadow-md shadow-purple-600/20 transition flex items-center gap-1.5 cursor-pointer ml-auto"
                      >
                        <span>Next Question</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setConfirmSubmitModal(true)}
                        className="px-6 py-2.5 rounded-xl bg-emerald-600 text-white font-black text-xs hover:bg-emerald-700 shadow-md shadow-emerald-600/25 transition flex items-center gap-1.5 cursor-pointer ml-auto"
                      >
                        <span>Finish &amp; Submit</span>
                        <Check className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* CONFIRM SUBMISSION SAFEGUARD MODAL */}
        {confirmSubmitModal && (
          <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white max-w-md w-full rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-2xl space-y-5">
              <div className="w-12 h-12 rounded-2xl bg-purple-50 border border-purple-200 text-purple-600 flex items-center justify-center mx-auto">
                <HelpCircle className="w-6 h-6" />
              </div>

              <div className="text-center space-y-1">
                <h3 className="text-lg font-black text-slate-900">Confirm Assessment Submission</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Are you ready to submit your responses? Once submitted, your examination is locked and delivered to {companyName}&apos;s talent team.
                </p>
              </div>

              {unansweredCount > 0 && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <span>
                    You have <strong>{unansweredCount} unanswered question(s)</strong>. Unanswered questions receive 0 marks.
                  </span>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setConfirmSubmitModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-50 transition cursor-pointer"
                >
                  Return to Questions
                </button>
                <button
                  type="button"
                  onClick={handleSubmitAssessment}
                  disabled={submitting}
                  className="flex-1 py-2.5 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-black text-xs shadow-md shadow-purple-600/20 transition cursor-pointer flex items-center justify-center gap-1.5"
                >
                  {submitting ? 'Submitting...' : 'Confirm Submission'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
