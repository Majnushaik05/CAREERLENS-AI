import React, { useState, useEffect } from 'react';
import { AssessmentQuestion } from '../types';
import { Clock, CheckCircle2, ArrowLeft, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';

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
  const [reviewMode, setReviewMode] = useState(false);
  const [timeLeft, setTimeLeft] = useState(1800); // 30 mins
  const [submitted, setSubmitted] = useState(false);
  const [startCountdown, setStartCountdown] = useState(0);

  useEffect(() => {
    async function fetchAssessment() {
      try {
        const res = await fetch(`/api/public/assessment/${token}`);
        if (res.ok) {
          const data = await res.json();
          setAssessmentData(data);
          setQuestions(data.questions || []);
          setTimeLeft(Math.max(1, Math.min((data.duration_minutes || 30) * 60, data.ends_at ? Math.ceil((Date.parse(data.ends_at) - Date.now()) / 1000) : (data.duration_minutes || 30) * 60)));
          if (data.status === 'scheduled' && data.starts_at) setStartCountdown(Math.max(0, Math.ceil((Date.parse(data.starts_at) - Date.now()) / 1000)));
        } else {
          const data = await res.json().catch(() => ({}));
          setAssessmentData({ error: data.error || 'This assessment link is invalid, expired, or already used.' });
        }
      } catch {
        setAssessmentData({ error: 'Unable to load this assessment because the server could not be reached. Please contact the recruiter.' });
      } finally {
        setLoading(false);
      }
    }
    fetchAssessment();
  }, [token]);

  // Timer countdown
  useEffect(() => {
    if (submitted || loading || assessmentData?.status !== 'available' || timeLeft <= 0) return;
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
  }, [timeLeft, submitted, loading, assessmentData?.status]);

  useEffect(() => {
    if (assessmentData?.status !== 'scheduled' || !assessmentData?.starts_at) return;
    const update = () => setStartCountdown(Math.max(0, Math.ceil((Date.parse(assessmentData.starts_at) - Date.now()) / 1000)));
    update();
    const timer = window.setInterval(update, 1000);
    return () => window.clearInterval(timer);
  }, [assessmentData?.status, assessmentData?.starts_at]);

  useEffect(() => {
    if (assessmentData?.status !== 'scheduled' || startCountdown > 0) return;
    let cancelled = false;
    const refresh = async () => {
      try {
        const res = await fetch(`/api/public/assessment/${token}`);
        const data = await res.json();
        if (!cancelled && res.ok) {
          setAssessmentData(data);
          setQuestions(data.questions || []);
          setTimeLeft(Math.max(1, Math.min((data.duration_minutes || 30) * 60, data.ends_at ? Math.ceil((Date.parse(data.ends_at) - Date.now()) / 1000) : (data.duration_minutes || 30) * 60)));
        } else if (!cancelled) setAssessmentData({ error: data.error || 'The assessment is not available.' });
      } catch { if (!cancelled) setAssessmentData({ error: 'Unable to refresh the assessment. Please retry.' }); }
    };
    refresh();
    return () => { cancelled = true; };
  }, [assessmentData?.status, startCountdown, token]);

  const handleSubmitAssessment = async () => {
    if (submitted) return;
    try {
      const submitRes = await fetch(`/api/public/assessment/${token}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers }),
      });
      const payload = await submitRes.json().catch(() => ({}));
      if (!submitRes.ok) {
        setAssessmentData((prev: any) => ({ ...prev, error: payload.error || 'Submission failed. Please contact the recruiter.' }));
        return;
      }
      setSubmitted(true);
      setAssessmentData((prev: any) => ({ ...prev, status: 'submitted' }));
    } catch {
      setAssessmentData((prev: any) => ({ ...prev, error: 'Unable to submit because the server could not be reached. Your answers have not been confirmed as saved.' }));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl border border-slate-200/90 shadow-2xs text-center">
          <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-slate-700 font-bold text-xs">Loading Candidate Assessment...</p>
        </div>
      </div>
    );
  }

  if (assessmentData?.error) {
    return <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6"><div className="max-w-lg rounded-2xl border border-amber-200 bg-white p-8 text-center shadow-sm"><AlertCircle className="mx-auto mb-3 h-8 w-8 text-amber-600"/><h1 className="text-xl font-bold text-slate-900">Assessment unavailable</h1><p className="mt-2 text-sm text-slate-600">{assessmentData.error}</p></div></div>;
  }

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const currentQ = questions[currentIndex];
  const answeredCount = Object.keys(answers).length;

  if (submitted) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
        <div className="relative w-full max-w-xl overflow-hidden rounded-3xl border border-slate-700 bg-white p-8 text-center shadow-2xl sm:p-10">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600"><ShieldCheck className="h-9 w-9"/></div>
          <div className="mt-6 text-xs font-bold uppercase tracking-[0.2em] text-emerald-700">Submission confirmed</div>
          <h1 className="mt-2 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">Thank you for completing the assessment.</h1>
          <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-600">Your responses have been securely submitted for recruiter review. Your score and evaluation are not displayed on this page.</p>
          <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4 text-left"><p className="text-sm font-bold text-slate-800">What happens next?</p><p className="mt-1 text-sm leading-6 text-slate-600">The recruitment team will review your submission and contact you if there are further steps.</p></div>
          <div className="mt-6 text-xs font-semibold text-slate-400">CareerLens AI · Career Intelligence Platform</div>
        </div>
      </div>
    );
  }

  if (assessmentData?.status === 'scheduled') {
    const days = Math.floor(startCountdown / 86400);
    const hrs = Math.floor((startCountdown % 86400) / 3600);
    const mins = Math.floor((startCountdown % 3600) / 60);
    const secs = startCountdown % 60;
    return <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6"><div className="w-full max-w-xl rounded-3xl border border-slate-700 bg-white p-8 text-center shadow-2xl sm:p-10"><div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-700"><Clock className="h-7 w-7"/></div><p className="mt-5 text-xs font-bold uppercase tracking-[0.2em] text-blue-700">Scheduled assessment</p><h1 className="mt-2 text-2xl font-black text-slate-950">Please wait for your exam</h1><p className="mt-2 text-sm text-slate-600">Your {assessmentData.role} assessment will begin at the scheduled time.</p><div className="my-6 grid grid-cols-4 gap-2">{[['Days',days],['Hours',hrs],['Minutes',mins],['Seconds',secs]].map(([label,value]) => <div key={String(label)} className="rounded-xl border border-slate-200 bg-slate-50 p-3"><div className="text-xl font-black tabular-nums text-slate-950">{String(value).padStart(2,'0')}</div><div className="mt-1 text-[10px] font-bold uppercase tracking-wide text-slate-500">{label}</div></div>)}</div><p className="text-xs leading-5 text-slate-500">Keep this page open. The assessment will become available automatically when the exam window opens.</p><div className="mt-6 text-xs font-semibold text-slate-400">CareerLens AI · Secure Assessment</div></div></div>;
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-6">
      <div className="max-w-3xl mx-auto space-y-4">
        {/* Sticky Timer Header */}
        <div className="sticky top-4 z-20 bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-2xs flex items-center justify-between gap-4">
          <div>
            <div className="font-extrabold text-slate-950 text-sm sm:text-base">
              {assessmentData?.role || 'Technical Qualifying Test'}
            </div>
            <div className="text-xs text-slate-500">
              Candidate: <span className="font-semibold text-slate-700">{assessmentData?.candidate_name || 'Candidate'}</span> · {questions.length} Questions
            </div>
          </div>

          <div className="flex items-center gap-2 font-mono tabular-nums font-bold text-sm text-slate-900 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200">
            <Clock className="w-4 h-4 text-slate-500 shrink-0" />
            <span>{String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}</span>
          </div>
        </div>

        {reviewMode ? (
          /* Review Mode View */
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/90 shadow-2xs space-y-6">
            <div>
              <h3 className="text-base font-black text-slate-950">Review Your Answers</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Review answered and unanswered questions before final submission.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200/80">
              <div>
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Answered</div>
                <div className="text-xl font-black text-slate-950 font-mono tabular-nums mt-0.5">{answeredCount}</div>
              </div>
              <div>
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Unanswered</div>
                <div className="text-xl font-black text-amber-600 font-mono tabular-nums mt-0.5">{questions.length - answeredCount}</div>
              </div>
              <div>
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total</div>
                <div className="text-xl font-black text-slate-950 font-mono tabular-nums mt-0.5">{questions.length}</div>
              </div>
            </div>

            <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
              {questions.map((q, idx) => (
                <div
                  key={q.id}
                  onClick={() => {
                    setCurrentIndex(idx);
                    setReviewMode(false);
                  }}
                  className="p-3 rounded-xl border border-slate-200 hover:border-slate-300 cursor-pointer flex items-center justify-between text-xs transition"
                >
                  <div className="min-w-0 pr-2">
                    <span className="font-bold text-slate-900">Q{idx + 1}. </span>
                    <span className="text-slate-600 truncate">{q.question}</span>
                  </div>
                  <span
                    className={`shrink-0 font-bold text-[11px] ${
                      answers[q.id] ? 'text-emerald-700' : 'text-amber-700'
                    }`}
                  >
                    {answers[q.id] ? 'Answered' : 'Unanswered'}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setReviewMode(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 font-bold text-xs text-slate-700 transition"
              >
                ← Back to Questions
              </button>
              <button
                onClick={handleSubmitAssessment}
                className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 font-bold text-xs text-white shadow-sm transition"
              >
                Final Submit Assessment
              </button>
            </div>
          </div>
        ) : (
          /* Question Mode */
          currentQ && (
            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/90 shadow-2xs space-y-6">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span className="font-bold text-slate-900">
                  {currentQ.section || 'Technical Competency'}
                </span>
                <span className="font-mono tabular-nums font-semibold">
                  Question {currentIndex + 1} of {questions.length}
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-blue-600 h-full transition-all"
                  style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
                />
              </div>

              <div className="py-1">
                <h3 className="text-base sm:text-lg font-bold text-slate-950 leading-snug">
                  {currentQ.question}
                </h3>
              </div>

              {/* Options */}
              <div className="space-y-2.5">
                {currentQ.options.map((opt, oIdx) => {
                  const isSelected = answers[currentQ.id] === opt;
                  return (
                    <button
                      key={oIdx}
                      onClick={() => setAnswers(prev => ({ ...prev, [currentQ.id]: opt }))}
                      className={`w-full p-4 rounded-xl border text-left text-xs sm:text-sm font-semibold transition flex items-center justify-between ${
                        isSelected
                          ? 'border-blue-600 bg-blue-50/60 text-slate-950 ring-1 ring-blue-600'
                          : 'border-slate-200 hover:border-slate-300 bg-white text-slate-800'
                      }`}
                    >
                      <span>{opt}</span>
                      <div
                        className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                          isSelected ? 'border-blue-600 bg-blue-600 text-white' : 'border-slate-300'
                        }`}
                      >
                        {isSelected && <CheckCircle2 className="w-3 h-3" />}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Nav buttons */}
              <div className="flex items-center justify-between gap-3 pt-4 border-t border-slate-100">
                <button
                  disabled={currentIndex === 0}
                  onClick={() => setCurrentIndex(prev => prev - 1)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs disabled:opacity-40 hover:bg-slate-50 transition flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Previous
                </button>

                <button
                  onClick={() => setReviewMode(true)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 transition"
                >
                  Review
                </button>

                {currentIndex < questions.length - 1 ? (
                  <button
                    onClick={() => setCurrentIndex(prev => prev + 1)}
                    className="px-4 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 transition flex items-center gap-1.5"
                  >
                    Next <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <button
                    onClick={() => setReviewMode(true)}
                    className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 transition flex items-center gap-1.5"
                  >
                    Review &amp; Submit
                  </button>
                )}
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
};
