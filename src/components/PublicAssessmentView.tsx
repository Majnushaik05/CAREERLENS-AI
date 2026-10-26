import React, { useState, useEffect } from 'react';
import { AssessmentQuestion } from '../types';
import { Clock, CheckCircle2, ArrowLeft, ArrowRight, ShieldCheck, AlertCircle, FileText, Check } from 'lucide-react';
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
  const [reviewMode, setReviewMode] = useState(false);
  const [timeLeft, setTimeLeft] = useState(1800); // in seconds
  const [submitted, setSubmitted] = useState(false);
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [submitting, setSubmitting] = useState(false);

  // Poll current time every second for start/end timers
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch assessment configuration
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
          // If token not found in memory, load role-based ATS exam generator
          const gen = await fetch('/api/assessment/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ role: 'Software Engineer', question_count: 10 }),
          });
          const genData = await gen.json();
          setQuestions(genData.questions || []);
          setAssessmentData({
            role: 'Software Engineer',
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

  // Exam in-progress countdown timer
  useEffect(() => {
    if (submitted || loading || timeLeft <= 0) return;

    // Check if start time has arrived before ticking exam timer
    if (assessmentData?.start_time && new Date(assessmentData.start_time) > currentTime) {
      return;
    }

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
  }, [timeLeft, submitted, loading, assessmentData?.start_time, currentTime]);

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
    } catch (e) {
      console.error('Error submitting assessment:', e);
      setSubmitted(true);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl border border-slate-200/90 shadow-2xs text-center space-y-3">
          <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-slate-800 font-bold text-xs">Authenticating Assessment Token...</p>
          <p className="text-slate-400 text-[11px]">Connecting to ATS Examination Gateway</p>
        </div>
      </div>
    );
  }

  const roleTitle = assessmentData?.role || 'Technical Screening Assessment';
  const candidateName = assessmentData?.candidate_name || 'Candidate';
  const startTime = assessmentData?.start_time ? new Date(assessmentData.start_time) : null;
  const endTime = assessmentData?.end_time ? new Date(assessmentData.end_time) : null;

  // 1. Check if exam is scheduled for future (Before Start Time) -> SHOW WAITING TIMER
  if (startTime && startTime > currentTime && !submitted) {
    const diffSeconds = Math.max(0, Math.floor((startTime.getTime() - currentTime.getTime()) / 1000));
    const days = Math.floor(diffSeconds / (3600 * 24));
    const hours = Math.floor((diffSeconds % (3600 * 24)) / 3600);
    const minutes = Math.floor((diffSeconds % 3600) / 60);
    const seconds = diffSeconds % 60;

    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 selection:bg-purple-600 selection:text-white">
        <div className="bg-white max-w-xl w-full rounded-3xl p-8 sm:p-10 border border-slate-200 shadow-lg space-y-6 text-center">
          <div className="flex justify-center mb-2">
            <CareerLensLogo size="md" showText={true} />
          </div>

          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 border border-purple-200 text-purple-700 text-xs font-bold uppercase tracking-wider">
              <Clock className="w-3.5 h-3.5 animate-pulse" />
              <span>Upcoming Scheduled Assessment</span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight pt-2">
              {roleTitle}
            </h1>
            <p className="text-xs text-slate-500">
              Welcome, <strong className="text-slate-800">{candidateName}</strong>. Your examination link is active.
            </p>
          </div>

          {/* Prominent Live Waiting Timer */}
          <div className="p-6 bg-gradient-to-br from-purple-50/60 to-slate-50 rounded-2xl border border-purple-200/80 space-y-3">
            <div className="text-xs font-extrabold uppercase tracking-wider text-purple-900">
              Please wait for the exam. Your exam will start in:
            </div>

            <div className="grid grid-cols-4 gap-2 max-w-sm mx-auto pt-2">
              <div className="bg-white rounded-xl p-3 border border-purple-200 shadow-2xs">
                <div className="text-2xl font-black text-purple-700 font-mono tabular-nums">{String(days).padStart(2, '0')}</div>
                <div className="text-[10px] uppercase font-bold text-slate-400 mt-0.5">Days</div>
              </div>
              <div className="bg-white rounded-xl p-3 border border-purple-200 shadow-2xs">
                <div className="text-2xl font-black text-purple-700 font-mono tabular-nums">{String(hours).padStart(2, '0')}</div>
                <div className="text-[10px] uppercase font-bold text-slate-400 mt-0.5">Hours</div>
              </div>
              <div className="bg-white rounded-xl p-3 border border-purple-200 shadow-2xs">
                <div className="text-2xl font-black text-purple-700 font-mono tabular-nums">{String(minutes).padStart(2, '0')}</div>
                <div className="text-[10px] uppercase font-bold text-slate-400 mt-0.5">Mins</div>
              </div>
              <div className="bg-white rounded-xl p-3 border border-purple-200 shadow-2xs">
                <div className="text-2xl font-black text-purple-700 font-mono tabular-nums">{String(seconds).padStart(2, '0')}</div>
                <div className="text-[10px] uppercase font-bold text-slate-400 mt-0.5">Secs</div>
              </div>
            </div>

            <p className="text-[11px] text-slate-500 mt-2">
              Scheduled Start: <strong className="text-slate-800">{startTime.toLocaleString()}</strong>
            </p>
          </div>

          {/* Candidate Preparation Guidelines */}
          <div className="text-left bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs text-slate-600 space-y-2">
            <div className="font-bold text-slate-800 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Assessment Preparation Guidelines:</span>
            </div>
            <ul className="space-y-1 list-disc list-inside text-[11px] text-slate-500">
              <li>Allocated Duration: <strong>{assessmentData?.duration_minutes || 30} minutes</strong> once the exam begins.</li>
              <li>Questions are role-tailored to industry competencies and system architecture.</li>
              <li>Ensure a stable network connection before starting.</li>
              <li>The exam will automatically unlock when the countdown timer reaches zero.</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  // 2. Check if exam window expired (After End Time)
  if (endTime && endTime < currentTime && !submitted) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="bg-white max-w-lg w-full rounded-3xl p-8 border border-slate-200 shadow-sm text-center space-y-5">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h2 className="text-xl font-black text-slate-900">Assessment Window Closed</h2>
            <p className="text-xs text-slate-500">
              The scheduled window for this technical evaluation concluded on:
            </p>
            <p className="text-xs font-mono font-bold text-slate-800 bg-slate-100 py-1.5 px-3 rounded-lg inline-block mt-2">
              {endTime.toLocaleString()}
            </p>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed max-w-sm mx-auto">
            If you experienced technical difficulties or require a rescheduled testing window, please reach out directly to your recruitment coordinator.
          </p>
          {onExit && (
            <button
              onClick={onExit}
              className="px-6 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition"
            >
              Return to Portal
            </button>
          )}
        </div>
      </div>
    );
  }

  // 3. User has submitted -> Professional "Thank You For Your Submission" (Zero score leakage)
  if (submitted) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 selection:bg-emerald-600 selection:text-white">
        <div className="bg-white max-w-xl w-full rounded-3xl p-8 sm:p-10 border border-slate-200 shadow-lg text-center space-y-6">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto shadow-2xs">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold uppercase tracking-wider">
              <Check className="w-3.5 h-3.5" />
              <span>Assessment Completed &amp; Confirmed</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight pt-1">
              Thank You for Your Submission!
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto">
              Your examination responses for the <strong className="text-slate-900">{roleTitle}</strong> position have been securely transmitted to the recruitment team.
            </p>
          </div>

          {/* Secure Submission Card */}
          <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 text-left space-y-3">
            <div className="text-xs font-extrabold text-slate-800 uppercase tracking-wider flex items-center justify-between">
              <span>Submission Receipt</span>
              <span className="font-mono text-[10px] text-slate-400">ID: {token.slice(0, 14)}...</span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs pt-1">
              <div>
                <div className="text-[10px] font-bold text-slate-400 uppercase">Candidate</div>
                <div className="font-bold text-slate-900">{candidateName}</div>
              </div>
              <div>
                <div className="text-[10px] font-bold text-slate-400 uppercase">Target Role</div>
                <div className="font-bold text-slate-900">{roleTitle}</div>
              </div>
              <div>
                <div className="text-[10px] font-bold text-slate-400 uppercase">Status</div>
                <div className="font-bold text-emerald-600 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span>Submitted Successfully</span>
                </div>
              </div>
              <div>
                <div className="text-[10px] font-bold text-slate-400 uppercase">Timestamp</div>
                <div className="font-mono text-slate-700 font-semibold">{new Date().toLocaleTimeString()}</div>
              </div>
            </div>
          </div>

          {/* Next Steps Information */}
          <div className="p-4 bg-purple-50/60 rounded-2xl border border-purple-200 text-left space-y-2">
            <div className="text-xs font-bold text-purple-900 flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-purple-600" />
              <span>What Happens Next?</span>
            </div>
            <p className="text-[11px] text-purple-950/80 leading-relaxed">
              Our hiring team is reviewing your assessment alongside your resume credentials. If your performance matches our engineering benchmark, your talent coordinator will contact you directly regarding the next interview stage.
            </p>
          </div>

          {onExit && (
            <div className="pt-2">
              <button
                onClick={onExit}
                className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs transition"
              >
                Return to CareerLens Portal
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // 4. Live Examination Screen (ATS Style)
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const currentQ = questions[currentIndex];
  const answeredCount = Object.keys(answers).length;

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 selection:bg-purple-600 selection:text-white">
      <div className="max-w-3xl mx-auto space-y-4">
        {/* Sticky Header with Timer */}
        <div className="sticky top-4 z-20 bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs flex items-center justify-between gap-4">
          <div className="min-w-0">
            <div className="font-extrabold text-slate-950 text-sm sm:text-base truncate">
              {roleTitle}
            </div>
            <div className="text-xs text-slate-500">
              Candidate: <span className="font-semibold text-slate-700">{candidateName}</span> · {questions.length} Questions
            </div>
          </div>

          <div className="flex items-center gap-2 font-mono tabular-nums font-bold text-sm text-purple-900 bg-purple-50 px-3 py-1.5 rounded-xl border border-purple-200 shrink-0">
            <Clock className="w-4 h-4 text-purple-600 shrink-0" />
            <span>{String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}</span>
          </div>
        </div>

        {reviewMode ? (
          /* Review Mode View */
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
            <div>
              <h3 className="text-base font-black text-slate-950">Review Your Answers Before Submission</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Ensure all technical questions are answered before submitting your examination.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
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
                  className="p-3 rounded-xl border border-slate-200 hover:border-purple-300 cursor-pointer flex items-center justify-between text-xs transition"
                >
                  <div className="min-w-0 pr-2">
                    <span className="font-bold text-slate-900">Q{idx + 1}. </span>
                    <span className="text-slate-600 truncate">{q.question}</span>
                  </div>
                  <span
                    className={`shrink-0 font-bold text-[11px] ${
                      answers[q.id] ? 'text-emerald-700 font-semibold' : 'text-amber-700'
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
                disabled={submitting}
                className="flex-1 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:opacity-50 font-bold text-xs text-white shadow-xs transition"
              >
                {submitting ? 'Submitting Responses...' : 'Final Submit Assessment'}
              </button>
            </div>
          </div>
        ) : (
          /* Question Mode */
          currentQ && (
            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span className="font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-200">
                  {currentQ.section || 'Technical Competency'}
                </span>
                <span className="font-mono tabular-nums font-semibold">
                  Question {currentIndex + 1} of {questions.length}
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-purple-600 h-full transition-all"
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
                          ? 'border-purple-600 bg-purple-50/60 text-purple-950 ring-1 ring-purple-600'
                          : 'border-slate-200 hover:border-slate-300 bg-white text-slate-800'
                      }`}
                    >
                      <span>{opt}</span>
                      <div
                        className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                          isSelected ? 'border-purple-600 bg-purple-600 text-white' : 'border-slate-300'
                        }`}
                      >
                        {isSelected && <CheckCircle2 className="w-3 h-3" />}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Navigation buttons */}
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
                    className="px-4 py-2 rounded-xl bg-purple-600 text-white font-bold text-xs hover:bg-purple-700 transition flex items-center gap-1.5"
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
