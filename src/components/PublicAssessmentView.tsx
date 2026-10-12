import React, { useState, useEffect } from 'react';
import { AssessmentQuestion, AssessmentResult } from '../types';
import { Clock, CheckCircle2, ArrowLeft, ArrowRight, Award, AlertCircle } from 'lucide-react';

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
  const [result, setResult] = useState<AssessmentResult | null>(null);

  useEffect(() => {
    async function fetchAssessment() {
      try {
        const res = await fetch(`/api/public/assessment/${token}`);
        if (res.ok) {
          const data = await res.json();
          setAssessmentData(data);
          setQuestions(data.questions || []);
          setTimeLeft((data.duration_minutes || 30) * 60);
        } else {
          // If token not in map, generate test bank on the fly
          const gen = await fetch('/api/assessment/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ role: 'Software Developer', question_count: 10 }),
          });
          const genData = await gen.json();
          setQuestions(genData.questions || []);
          setAssessmentData({ role: 'Software Developer', candidate_name: 'Candidate' });
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchAssessment();
  }, [token]);

  // Timer countdown
  useEffect(() => {
    if (submitted || loading || timeLeft <= 0) return;
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
  }, [timeLeft, submitted, loading]);

  const handleSubmitAssessment = async () => {
    try {
      const scoreRes = await fetch('/api/assessment/score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questions, answers }),
      });
      const scoreData: AssessmentResult = await scoreRes.json();
      setResult(scoreData);
      setSubmitted(true);

      // Record in public API
      await fetch(`/api/public/assessment/${token}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers, result: scoreData }),
      });
    } catch (e) {
      console.error(e);
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

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const currentQ = questions[currentIndex];
  const answeredCount = Object.keys(answers).length;

  if (submitted && result) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="bg-white max-w-xl w-full rounded-2xl p-8 border border-slate-200/90 shadow-2xs text-center space-y-6">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto">
            <Award className="w-6 h-6" />
          </div>

          <div>
            <div className="text-xs font-semibold text-slate-500 mb-1">
              <span>Exam Complete</span>
              <span aria-hidden="true" className="mx-2">·</span>
              <span className="text-emerald-700 font-bold">Submission Confirmed</span>
            </div>
            <h2 className="text-2xl font-black text-slate-950">
              Assessment Successfully Recorded
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Your exam results have been transmitted directly to the CareerLens AI Recruiter Score Vault.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200/80">
            <div>
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Score</div>
              <div className="text-2xl font-black text-slate-950 font-mono tabular-nums mt-0.5">{result.percentage}%</div>
            </div>
            <div>
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Correct</div>
              <div className="text-2xl font-black text-emerald-600 font-mono tabular-nums mt-0.5">{result.correct_count} / {result.total}</div>
            </div>
            <div>
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Unanswered</div>
              <div className="text-2xl font-black text-amber-600 font-mono tabular-nums mt-0.5">{result.unanswered_count}</div>
            </div>
          </div>

          {onExit && (
            <button
              onClick={onExit}
              className="px-6 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition shadow-xs"
            >
              Return to CareerLens Portal
            </button>
          )}
        </div>
      </div>
    );
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
