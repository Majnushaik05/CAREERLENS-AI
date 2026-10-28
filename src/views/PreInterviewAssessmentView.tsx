import React, { useState, useEffect, useRef } from 'react';
import { AssessmentQuestion, AssessmentResult } from '../types';
import { safeGenerateAssessment, safeScoreAssessment } from '../services/careerService';
import {
  GraduationCap,
  Play,
  CheckCircle2,
  Clock,
  Award,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  Bookmark,
  Check,
  XCircle,
  Sliders,
  HelpCircle,
  ShieldCheck,
  FileText,
  ChevronRight,
} from 'lucide-react';

const ROLE_CATEGORIES: Record<string, string[]> = {
  'Software & Cloud Engineering': [
    'Software Engineer',
    'Frontend Developer',
    'Backend Developer',
    'Full Stack Developer',
    'Cloud Solutions Architect',
    'DevOps & Site Reliability Engineer',
    'Cybersecurity Analyst',
    'QA Automation Engineer',
  ],
  'AI, Data & Analytics': [
    'AI & Machine Learning Engineer',
    'Data Scientist',
    'Data Analyst & BI Specialist',
    'Big Data Engineer',
  ],
  'Core Engineering': [
    'Mechanical Design Engineer',
    'Civil & Structural Engineer',
    'Electrical & Electronics Engineer',
    'Automotive Systems Engineer',
  ],
  'Business, Product & Management': [
    'Product Manager',
    'Project & Scrum Lead',
    'Business Analyst',
    'Financial Analyst',
    'Accountant & Auditor',
    'HR & Talent Acquisition Lead',
    'Digital Marketing Specialist',
  ],
  'Healthcare & Science': [
    'Physician / Medical Doctor',
    'Registered Nurse & Clinical Care',
    'Pharmacist',
  ],
};

const PRESET_QUESTION_COUNTS = [5, 10, 20, 25, 50, 100];

export const PreInterviewAssessmentView: React.FC = () => {
  const [role, setRole] = useState<string>('Software Engineer');
  const [questionCount, setQuestionCount] = useState<number>(20);
  const [loading, setLoading] = useState<boolean>(false);
  const [inProgress, setInProgress] = useState<boolean>(false);
  const [questions, setQuestions] = useState<AssessmentQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [flagged, setFlagged] = useState<Set<number>>(new Set());
  const [reviewMode, setReviewMode] = useState<boolean>(false);
  const [result, setResult] = useState<AssessmentResult | null>(null);

  // Timer states
  const [timeRemainingSeconds, setTimeRemainingSeconds] = useState<number>(1200);
  const timerRef = useRef<any>(null);

  // Countdown Timer
  useEffect(() => {
    if (inProgress && timeRemainingSeconds > 0) {
      timerRef.current = setInterval(() => {
        setTimeRemainingSeconds((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            void handleFinishAuto();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [inProgress, timeRemainingSeconds]);

  const startAssessment = async () => {
    setLoading(true);
    setResult(null);
    setAnswers({});
    setFlagged(new Set());
    setCurrentIndex(0);
    setReviewMode(false);

    // Calculate exam time: 1.5 minutes per question (e.g. 20 Qs = 30 mins)
    const totalSeconds = Math.max(300, Math.round(questionCount * 90));
    setTimeRemainingSeconds(totalSeconds);

    try {
      const data = await safeGenerateAssessment(role, questionCount);
      setQuestions(data.questions || []);
      setInProgress(true);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleFinishAuto = async () => {
    if (timerRef.current) clearInterval(timerRef.current);
    await handleFinish();
  };

  const handleFinish = async () => {
    setLoading(true);
    if (timerRef.current) clearInterval(timerRef.current);
    try {
      const data: AssessmentResult = await safeScoreAssessment(questions, answers);
      setResult(data);
      setInProgress(false);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // Toggle flag for review
  const toggleFlag = (id: number) => {
    setFlagged((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const currentQ = questions[currentIndex];
  const answeredCount = Object.keys(answers).length;
  const marksPerQuestion = questions.length > 0 ? Math.round((100 / questions.length) * 100) / 100 : 5;

  const formatTimer = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remaining = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remaining.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-20 selection:bg-blue-600 selection:text-white">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs">
        <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1 flex items-center gap-2">
          <span className="flex h-2 w-2 rounded-full bg-blue-600 ring-4 ring-blue-100" />
          <span>Role Qualifying Examination • 100-Mark Professional Evaluation</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
          Pre-Interview Competency &amp; Technical Examination
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl">
          Standardized scenario-based multiple-choice evaluation calibrated across engineering, healthcare, finance, and management disciplines. Scored on a strict 100-mark qualification benchmark.
        </p>
      </div>

      {/* CONFIGURATION & SETUP SCREEN */}
      {!inProgress && !result && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs max-w-2xl mx-auto space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-lg font-black text-slate-950 flex items-center gap-2">
              <Sliders size={18} className="text-blue-600" />
              Configure Examination Parameters
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Select your target role and choose your exact examination volume from 1 to 100 questions.
            </p>
          </div>

          <div className="space-y-5">
            {/* Role Selection Dropdown grouped by categories */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Target Professional Role
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50/60 px-4 py-3 text-sm font-semibold text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
              >
                {Object.entries(ROLE_CATEGORIES).map(([cat, rolesList]) => (
                  <optgroup key={cat} label={cat}>
                    {rolesList.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>

            {/* Question Volume (1 to 100 Questions) */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-600">
                  Select Question Volume (1 to 100 Questions)
                </label>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-slate-500">
                    {Math.round((100 / questionCount) * 100) / 100} Marks / Question
                  </span>
                  <span className="font-mono text-xs font-black text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded-lg">
                    {questionCount} Questions (100 Marks Total)
                  </span>
                </div>
              </div>

              {/* Preset Buttons */}
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
                {PRESET_QUESTION_COUNTS.map((cnt) => (
                  <button
                    key={cnt}
                    type="button"
                    onClick={() => setQuestionCount(cnt)}
                    className={`py-2 text-xs font-bold rounded-xl border transition ${
                      questionCount === cnt
                        ? 'border-blue-600 bg-blue-600 text-white shadow-xs'
                        : 'border-slate-200 bg-slate-50/50 text-slate-700 hover:border-blue-300 hover:bg-blue-50'
                    }`}
                  >
                    {cnt} Questions
                  </button>
                ))}
              </div>

              {/* Slider for Exact Custom Count from 1 to 100 */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-4">
                <span className="text-[11px] font-bold text-slate-400">1</span>
                <input
                  type="range"
                  min={1}
                  max={100}
                  step={1}
                  value={questionCount}
                  onChange={(e) => setQuestionCount(Number(e.target.value))}
                  className="flex-1 accent-blue-600 cursor-pointer h-2 bg-slate-200 rounded-lg"
                />
                <span className="text-[11px] font-bold text-slate-400">100</span>
                <input
                  type="number"
                  min={1}
                  max={100}
                  value={questionCount}
                  onChange={(e) =>
                    setQuestionCount(Math.max(1, Math.min(100, Number(e.target.value) || 1)))
                  }
                  className="w-16 text-center text-xs font-bold py-1.5 border border-slate-200 rounded-xl focus:border-blue-500 outline-none"
                />
              </div>
            </div>

            {/* Exam Information Banner */}
            <div className="rounded-2xl border border-blue-100 bg-blue-50/60 p-4 space-y-1.5 text-xs text-blue-900">
              <div className="font-bold flex items-center gap-1.5">
                <ShieldCheck size={15} className="text-blue-600" />
                <span>Examination Structure &amp; Passing Standard</span>
              </div>
              <p className="text-[11px] text-blue-800 leading-relaxed">
                Total Marks: <strong>100 Marks</strong> • Passing Score: <strong>60 / 100 Marks (60%)</strong> • Time Allocation: ~<strong>{Math.round((questionCount * 90) / 60)} minutes</strong>.
                Unanswered questions receive zero marks. No negative marking is applied.
              </p>
            </div>

            <button
              type="button"
              onClick={startAssessment}
              disabled={loading}
              className="w-full py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white font-bold text-sm shadow-xs transition flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
            >
              {loading ? (
                <span className="animate-spin text-base">⟳</span>
              ) : (
                <Play size={16} />
              )}
              <span>{loading ? 'Preparing Examination Paper...' : `Begin ${questionCount}-Question Examination (100 Marks)`}</span>
            </button>
          </div>
        </div>
      )}

      {/* ACTIVE EXAMINATION ENVIRONMENT */}
      {inProgress && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Main Question Interface (Left 8 Cols) */}
          <div className="lg:col-span-8 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
            {/* Top Bar: Section Name & Timer */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                <span className="rounded-lg bg-blue-50 text-blue-700 px-2 py-1 border border-blue-100">
                  {currentQ?.section || 'Core Competency'}
                </span>
                <span className="text-slate-400">•</span>
                <span className="text-slate-500 font-mono">
                  Question {currentIndex + 1} of {questions.length} ({marksPerQuestion} Marks)
                </span>
              </div>

              {/* Countdown Timer */}
              <div
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-bold ${
                  timeRemainingSeconds < 180
                    ? 'bg-rose-50 text-rose-700 border border-rose-200 animate-pulse'
                    : 'bg-slate-100 text-slate-700'
                }`}
              >
                <Clock size={14} />
                <span>{formatTimer(timeRemainingSeconds)}</span>
              </div>
            </div>

            {/* Question Text */}
            <div className="space-y-4">
              <div className="flex items-start justify-between gap-4">
                <h2 className="text-base sm:text-lg font-bold text-slate-950 leading-relaxed">
                  {currentQ?.question}
                </h2>
                <button
                  type="button"
                  onClick={() => toggleFlag(currentQ?.id)}
                  className={`p-2 rounded-xl border transition shrink-0 ${
                    flagged.has(currentQ?.id)
                      ? 'border-amber-400 bg-amber-50 text-amber-700'
                      : 'border-slate-200 text-slate-400 hover:text-slate-600'
                  }`}
                  title="Flag for review"
                >
                  <Bookmark size={16} fill={flagged.has(currentQ?.id) ? 'currentColor' : 'none'} />
                </button>
              </div>

              {/* Multiple Choice Options */}
              <div className="space-y-2.5 pt-2">
                {currentQ?.options.map((opt, idx) => {
                  const isSelected = answers[currentQ.id] === opt;
                  const optionLetters = ['A', 'B', 'C', 'D'];
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setAnswers((prev) => ({ ...prev, [currentQ.id]: opt }))}
                      className={`w-full text-left p-4 rounded-2xl border text-xs sm:text-sm font-medium transition flex items-center gap-3.5 ${
                        isSelected
                          ? 'border-blue-600 bg-blue-50/70 text-blue-950 ring-2 ring-blue-200 font-semibold'
                          : 'border-slate-200 bg-slate-50/40 text-slate-800 hover:border-slate-300 hover:bg-slate-100/60'
                      }`}
                    >
                      <span
                        className={`w-6 h-6 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                          isSelected
                            ? 'bg-blue-600 text-white'
                            : 'bg-white border border-slate-300 text-slate-600'
                        }`}
                      >
                        {optionLetters[idx]}
                      </span>
                      <span className="flex-1">{opt}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Navigation & Action Controls */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
                disabled={currentIndex === 0}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition flex items-center gap-1.5 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ArrowLeft size={14} />
                <span>Previous</span>
              </button>

              <div className="flex items-center gap-2">
                {answers[currentQ?.id] && (
                  <button
                    type="button"
                    onClick={() => {
                      setAnswers((prev) => {
                        const copy = { ...prev };
                        delete copy[currentQ.id];
                        return copy;
                      });
                    }}
                    className="text-xs text-slate-400 hover:text-slate-600 font-semibold px-2 py-1"
                  >
                    Clear Response
                  </button>
                )}

                {currentIndex < questions.length - 1 ? (
                  <button
                    type="button"
                    onClick={() => setCurrentIndex((prev) => Math.min(questions.length - 1, prev + 1))}
                    className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
                  >
                    <span>Next</span>
                    <ArrowRight size={14} />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setReviewMode(true)}
                    className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
                  >
                    <CheckCircle2 size={14} />
                    <span>Review &amp; Submit</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Question Navigator Palette (Right 4 Cols) */}
          <div className="lg:col-span-4 bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-5 sticky top-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                Examination Navigator
              </h3>
              <span className="text-xs font-bold text-slate-500 font-mono">
                {answeredCount}/{questions.length} Answered
              </span>
            </div>

            {/* Status Legend */}
            <div className="grid grid-cols-3 gap-2 text-[10px] font-bold text-slate-600 border-y border-slate-100 py-2.5">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-blue-600" />
                <span>Answered</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-amber-400" />
                <span>Flagged</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded border border-slate-300 bg-white" />
                <span>Unanswered</span>
              </div>
            </div>

            {/* Numbers Grid */}
            <div className="grid grid-cols-5 sm:grid-cols-6 gap-2 max-h-72 overflow-y-auto pr-1">
              {questions.map((q, idx) => {
                const isCurrent = idx === currentIndex;
                const isAnswered = answers[q.id] !== undefined;
                const isFlagged = flagged.has(q.id);

                let btnStyle = 'border-slate-200 bg-white text-slate-700 hover:border-blue-300';
                if (isAnswered) btnStyle = 'border-blue-600 bg-blue-600 text-white';
                if (isFlagged) btnStyle = 'border-amber-400 bg-amber-400 text-amber-950 font-black';
                if (isCurrent) btnStyle += ' ring-2 ring-blue-400 ring-offset-2';

                return (
                  <button
                    key={q.id}
                    type="button"
                    onClick={() => setCurrentIndex(idx)}
                    className={`h-9 rounded-xl border text-xs font-bold transition flex items-center justify-center font-mono ${btnStyle}`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>

            {/* Quick Final Submit Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => setReviewMode(true)}
                className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition shadow-xs flex items-center justify-center gap-2"
              >
                <Check size={14} />
                <span>Complete &amp; Grade (100 Marks)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REVIEW BEFORE SUBMIT MODAL */}
      {inProgress && reviewMode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-slate-200 shadow-xl space-y-6">
            <div>
              <h3 className="text-xl font-black text-slate-950">
                Ready to Finalize Your Examination?
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Verify your answered items below. Once submitted, your 100-mark score will be evaluated.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="rounded-2xl border border-blue-200 bg-blue-50 p-3.5">
                <div className="text-xs font-bold text-blue-700">Answered</div>
                <div className="text-xl font-black text-blue-950 font-mono mt-0.5">{answeredCount}</div>
              </div>
              <div className="rounded-2xl border border-amber-200 bg-amber-50 p-3.5">
                <div className="text-xs font-bold text-amber-700">Flagged</div>
                <div className="text-xl font-black text-amber-950 font-mono mt-0.5">{flagged.size}</div>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3.5">
                <div className="text-xs font-bold text-slate-500">Unanswered</div>
                <div className="text-xl font-black text-slate-800 font-mono mt-0.5">
                  {questions.length - answeredCount}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setReviewMode(false)}
                className="px-5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50"
              >
                Return to Exam
              </button>
              <button
                type="button"
                onClick={handleFinish}
                disabled={loading}
                className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-xs flex items-center gap-1.5"
              >
                {loading ? <span className="animate-spin">⟳</span> : <Check size={14} />}
                <span>Confirm &amp; Grade</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FINAL 100-MARK SCORE REPORT */}
      {result && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs max-w-4xl mx-auto space-y-7 animate-fade-in">
          {/* Top Score Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 border-b border-slate-100 pb-6">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                Official Examination Outcome • {role}
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-950">
                100-Mark Technical Evaluation Result
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 mt-1">
                Completed {result.total} questions ({Math.round((100 / result.total) * 100) / 100} marks each).
              </p>
            </div>

            {/* Big 100-Mark Score Hero */}
            <div className="flex items-center gap-4 rounded-2xl border border-blue-200 bg-blue-50/80 p-5 shrink-0">
              <div className="text-center">
                <div className="text-3xl sm:text-4xl font-black text-blue-900 font-mono">
                  {result.score_out_of_100 ?? result.percentage} / 100
                </div>
                <div className="text-[11px] font-extrabold uppercase tracking-wider text-blue-700 mt-0.5">
                  Total Marks Obtained
                </div>
              </div>
            </div>
          </div>

          {/* Qualification Verdict Banner */}
          <div
            className={`rounded-2xl border p-4.5 flex items-center gap-3.5 ${
              (result.score_out_of_100 ?? result.percentage) >= 60
                ? 'border-emerald-200 bg-emerald-50/70 text-emerald-950'
                : 'border-amber-200 bg-amber-50/70 text-amber-950'
            }`}
          >
            {(result.score_out_of_100 ?? result.percentage) >= 60 ? (
              <CheckCircle2 size={24} className="text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle size={24} className="text-amber-600 shrink-0" />
            )}
            <div>
              <div className="text-sm font-black">
                {(result.score_out_of_100 ?? result.percentage) >= 80
                  ? 'Distinction / Strong Pass — Top Tier Competency'
                  : (result.score_out_of_100 ?? result.percentage) >= 60
                  ? 'Qualified Pass — Standard Benchmark Met'
                  : 'Review Needed — Below Passing Benchmark (60/100 Marks)'}
              </div>
              <div className="text-xs mt-0.5 opacity-90">
                You correctly answered {result.correct_count} of {result.total} questions with {result.wrong_count} incorrect and {result.unanswered_count} left unanswered.
              </div>
            </div>
          </div>

          {/* Section Breakdown (if available) */}
          {result.section_breakdown && Object.keys(result.section_breakdown).length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Performance by Competency Area
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {Object.entries(result.section_breakdown).map(([sec, stats]) => (
                  <div key={sec} className="rounded-2xl border border-slate-200 bg-slate-50/60 p-3.5">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                      <span>{sec}</span>
                      <span className="font-mono text-blue-600">{stats.percentage}%</span>
                    </div>
                    <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden mt-2">
                      <div
                        className="bg-blue-600 h-full rounded-full"
                        style={{ width: `${stats.percentage}%` }}
                      />
                    </div>
                    <div className="text-[10px] text-slate-500 mt-1.5 font-medium">
                      {stats.correct} of {stats.total} correct
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Detailed Question Review */}
          <div className="space-y-3 pt-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Question-by-Question Review ({questions.length} Items)
            </h3>
            <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
              {questions.map((q, idx) => {
                const userAns = answers[q.id];
                const isCorrect = userAns && String(userAns).trim() === String(q.answer).trim();
                return (
                  <div
                    key={q.id}
                    className={`rounded-2xl border p-4 space-y-2 ${
                      isCorrect
                        ? 'border-emerald-200 bg-emerald-50/30'
                        : userAns
                        ? 'border-rose-200 bg-rose-50/30'
                        : 'border-slate-200 bg-slate-50/50'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-xs font-bold text-slate-900">
                        {idx + 1}. {q.question}
                      </span>
                      <span
                        className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md shrink-0 ${
                          isCorrect
                            ? 'bg-emerald-100 text-emerald-800'
                            : userAns
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-slate-200 text-slate-700'
                        }`}
                      >
                        {isCorrect ? 'Correct' : userAns ? 'Incorrect' : 'Skipped'}
                      </span>
                    </div>

                    <div className="text-xs space-y-1 pt-1">
                      <div className="text-slate-600">
                        Your answer: <span className="font-semibold text-slate-900">{userAns || 'None (Unanswered)'}</span>
                      </div>
                      {!isCorrect && (
                        <div className="text-emerald-700 font-semibold">
                          Correct answer: <span>{q.answer}</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Reset / Retake Button */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-500">Benchmark your technical mastery across various roles.</span>
            <button
              type="button"
              onClick={() => {
                setInProgress(false);
                setResult(null);
                setAnswers({});
                setFlagged(new Set());
              }}
              className="px-5 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition shadow-xs flex items-center gap-2"
            >
              <RotateCcw size={14} />
              <span>Configure New Examination</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PreInterviewAssessmentView;
