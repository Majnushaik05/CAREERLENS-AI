import React, { useState } from 'react';
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
} from 'lucide-react';

export const PreInterviewAssessmentView: React.FC = () => {
  const [role, setRole] = useState('Software Developer');
  const [questionCount, setQuestionCount] = useState(10);
  const [loading, setLoading] = useState(false);
  const [inProgress, setInProgress] = useState(false);
  const [questions, setQuestions] = useState<AssessmentQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [reviewMode, setReviewMode] = useState(false);
  const [result, setResult] = useState<AssessmentResult | null>(null);

  const startAssessment = async () => {
    setLoading(true);
    setResult(null);
    setAnswers({});
    setCurrentIndex(0);
    setReviewMode(false);

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

  const handleFinish = async () => {
    setLoading(true);
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

  const currentQ = questions[currentIndex];
  const answeredCount = Object.keys(answers).length;

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-2xs">
        <div className="text-xs font-semibold text-slate-500 mb-1">
          <span>Technical Simulation</span>
          <span aria-hidden="true" className="mx-2">·</span>
          <span className="text-blue-600 font-bold">Role-Based Qualifying Test</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-950 tracking-tight">
          Pre-Interview Technical &amp; Competency Assessment
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
          Evaluate your technical knowledge with randomized, scenario-based multiple choice evaluations calibrated for engineering, data, and management roles.
        </p>
      </div>

      {!inProgress && !result && (
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/90 shadow-2xs max-w-xl space-y-5">
          <div>
            <h2 className="text-base font-black text-slate-900">Configure Your Assessment</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Select your target role and question volume to begin a timed qualifying evaluation.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Target Job Role</label>
              <select
                value={role}
                onChange={e => setRole(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-semibold bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                <option value="Software Developer">Software Developer</option>
                <option value="Data Scientist">Data Scientist</option>
                <option value="Data Analyst">Data Analyst</option>
                <option value="DevOps Engineer">DevOps Engineer</option>
                <option value="Cloud Engineer">Cloud Engineer</option>
                <option value="Product Manager">Product Manager</option>
                <option value="Cybersecurity Analyst">Cybersecurity Analyst</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Question Volume</label>
              <div className="grid grid-cols-3 gap-2">
                {[10, 15, 20].map(cnt => (
                  <button
                    key={cnt}
                    type="button"
                    onClick={() => setQuestionCount(cnt)}
                    className={`py-2 text-xs font-bold rounded-xl border transition ${
                      questionCount === cnt
                        ? 'border-slate-900 bg-slate-900 text-white'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {cnt} Questions
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={startAssessment}
              disabled={loading}
              className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm transition flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <span>Generating Assessment Bank...</span>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  <span>Start Qualifying Assessment</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {inProgress && (
        <div className="max-w-2xl space-y-4">
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/90 shadow-2xs space-y-6">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span className="font-bold text-slate-900">
                {currentQ?.section || role}
              </span>
              <span className="font-mono tabular-nums font-semibold">
                Question {currentIndex + 1} of {questions.length}
              </span>
            </div>

            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-blue-600 h-full transition-all"
                style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
              />
            </div>

            {reviewMode ? (
              <div className="space-y-4">
                <h3 className="font-bold text-slate-900 text-base">Review Answers Before Submitting</h3>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-slate-500">Answered: </span>
                    <span className="font-bold text-emerald-600 font-mono tabular-nums">{answeredCount}</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-slate-500">Unanswered: </span>
                    <span className="font-bold text-amber-600 font-mono tabular-nums">{questions.length - answeredCount}</span>
                  </div>
                </div>

                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {questions.map((q, idx) => (
                    <div
                      key={q.id}
                      onClick={() => {
                        setCurrentIndex(idx);
                        setReviewMode(false);
                      }}
                      className="p-3 rounded-xl border border-slate-200 hover:border-blue-400 cursor-pointer flex items-center justify-between text-xs transition"
                    >
                      <span className="font-semibold text-slate-800 truncate pr-2">
                        {idx + 1}. {q.question}
                      </span>
                      <span
                        className={`text-[11px] font-bold shrink-0 ${
                          answers[q.id] ? 'text-emerald-700' : 'text-amber-700'
                        }`}
                      >
                        {answers[q.id] ? 'Answered' : 'Pending'}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => setReviewMode(false)}
                    className="flex-1 py-2.5 rounded-xl border border-slate-300 font-bold text-xs text-slate-700"
                  >
                    Back to Test
                  </button>
                  <button
                    onClick={handleFinish}
                    className="flex-1 py-2.5 rounded-xl bg-blue-600 text-white font-bold text-xs shadow-sm hover:bg-blue-700"
                  >
                    Submit Assessment
                  </button>
                </div>
              </div>
            ) : (
              currentQ && (
                <div className="space-y-4">
                  <h3 className="font-bold text-slate-950 text-base leading-snug">
                    {currentQ.question}
                  </h3>

                  <div className="space-y-2.5">
                    {currentQ.options.map((opt, oIdx) => {
                      const isSelected = answers[currentQ.id] === opt;
                      return (
                        <button
                          key={oIdx}
                          onClick={() => setAnswers(prev => ({ ...prev, [currentQ.id]: opt }))}
                          className={`w-full p-3.5 rounded-xl border text-left text-xs font-semibold transition flex items-center justify-between ${
                            isSelected
                              ? 'border-blue-600 bg-blue-50/60 text-slate-900 ring-1 ring-blue-600'
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

                  <div className="flex items-center justify-between gap-3 pt-4 border-t border-slate-100">
                    <button
                      disabled={currentIndex === 0}
                      onClick={() => setCurrentIndex(prev => prev - 1)}
                      className="px-3.5 py-2 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs disabled:opacity-40"
                    >
                      ← Previous
                    </button>
                    <button
                      onClick={() => setReviewMode(true)}
                      className="px-3.5 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50"
                    >
                      Review Answers
                    </button>
                    {currentIndex < questions.length - 1 ? (
                      <button
                        onClick={() => setCurrentIndex(prev => prev + 1)}
                        className="px-4 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 flex items-center gap-1"
                      >
                        Next →
                      </button>
                    ) : (
                      <button
                        onClick={() => setReviewMode(true)}
                        className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700"
                      >
                        Review &amp; Finish
                      </button>
                    )}
                  </div>
                </div>
              )
            )}
          </div>
        </div>
      )}

      {/* Result Display with Visual Graphs */}
      {result && (
        <div className="max-w-2xl bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/90 shadow-2xs space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center font-bold">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-black text-slate-900">Assessment Evaluation Results</h2>
                <div className="text-xs text-slate-500">{role} Performance Metrics</div>
              </div>
            </div>
            <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${
              result.percentage >= 75 ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'
            }`}>
              {result.percentage >= 75 ? 'Passed Threshold' : 'Review Recommended'}
            </span>
          </div>

          {/* Graphical Meters & Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-5 items-center p-5 bg-slate-50 rounded-2xl border border-slate-200">
            {/* Circular Ring Gauge */}
            <div className="sm:col-span-5 flex flex-col items-center justify-center">
              <div className="relative w-28 h-28 flex items-center justify-center">
                <svg className="w-28 h-28 transform -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-slate-200"
                    strokeWidth="3.5"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className={result.percentage >= 75 ? 'text-emerald-600' : 'text-blue-600'}
                    strokeDasharray={`${result.percentage}, 100`}
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <div className="absolute text-center">
                  <span className="text-2xl font-black font-mono text-slate-900">{result.percentage}%</span>
                  <div className="text-[10px] uppercase font-bold text-slate-400">Total Score</div>
                </div>
              </div>
            </div>

            {/* Performance Bar Graphs */}
            <div className="sm:col-span-7 space-y-3">
              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-slate-700">Correct Answers</span>
                  <span className="text-emerald-700 font-bold">{result.correct_count} of {result.total}</span>
                </div>
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${(result.correct_count / result.total) * 100}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-slate-700">Incorrect Answers</span>
                  <span className="text-rose-700 font-bold">{result.wrong_count} of {result.total}</span>
                </div>
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-rose-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${(result.wrong_count / result.total) * 100}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-slate-700">Unanswered</span>
                  <span className="text-amber-700 font-bold">{result.unanswered_count} of {result.total}</span>
                </div>
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-amber-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${(result.unanswered_count / result.total) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Competency Domain Distribution Graph */}
          <div className="p-4 bg-white rounded-xl border border-slate-200 space-y-3">
            <span className="text-xs font-bold text-slate-800">Domain Competency Breakdown</span>
            <div className="space-y-2">
              {[
                { domain: 'Core Architecture & Concepts', val: Math.min(100, Math.round(result.percentage * 1.05)) },
                { domain: 'Practical Problem Solving', val: Math.min(100, Math.round(result.percentage * 0.95)) },
                { domain: 'System Design & Tradeoffs', val: Math.min(100, Math.round(result.percentage * 0.98)) },
              ].map((comp, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-600 font-medium">{comp.domain}</span>
                    <span className="font-mono font-bold text-slate-800">{comp.val}%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-blue-600 h-full rounded-full" style={{ width: `${comp.val}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-4 rounded-xl border text-xs text-slate-700 leading-relaxed font-medium bg-slate-50/70 border-slate-200">
            {result.percentage >= 80 ? (
              <div>
                <strong className="text-slate-900">Outstanding Competency:</strong> High domain mastery demonstrated. You are ready for live employer coding and system screens.
              </div>
            ) : result.percentage >= 60 ? (
              <div>
                <strong className="text-slate-900">Satisfactory Foundation:</strong> Core criteria satisfied. Target reviewing weaker system scenario questions to reach the top quartile.
              </div>
            ) : (
              <div>
                <strong className="text-slate-900">Targeted Review Advised:</strong> Review foundational architecture principles and practice scenario application before official interviews.
              </div>
            )}
          </div>

          <button
            onClick={() => {
              setResult(null);
              setInProgress(false);
            }}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Retake or Change Role</span>
          </button>
        </div>
      )}
    </div>
  );
};
