import React, { useState } from 'react';
import { ResumeAnalysis, InterviewQuestionItem, InterviewScore } from '../types';
import {
  Mic,
  Send,
  Award,
  CheckCircle2,
  TrendingUp,
  RotateCcw,
  MessageSquare,
  Sparkles,
} from 'lucide-react';

interface MockInterviewViewProps {
  analysis: ResumeAnalysis | null;
}

export const MockInterviewView: React.FC<MockInterviewViewProps> = ({ analysis }) => {
  const [role, setRole] = useState(analysis?.target_role || 'Software Developer');
  const [company, setCompany] = useState('Apex Cloud Innovations');
  const [interviewStarted, setInterviewStarted] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [transcript, setTranscript] = useState<InterviewQuestionItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [interviewScore, setInterviewScore] = useState<InterviewScore | null>(null);

  const startInterview = async () => {
    setLoading(true);
    setTranscript([]);
    setInterviewScore(null);
    try {
      const res = await fetch('/api/mock-interview/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role,
          company,
          resume_text: analysis?.extracted_text || '',
          transcript: [],
        }),
      });
      const data = await res.json();
      setCurrentQuestion(data.next_question || `Please introduce yourself and your background for the ${role} role.`);
      setInterviewStarted(true);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSendAnswer = async () => {
    if (!currentAnswer.trim()) return;
    const updated = [...transcript, { question: currentQuestion, answer: currentAnswer }];
    setTranscript(updated);
    setCurrentAnswer('');
    setLoading(true);

    if (updated.length >= 4) {
      await scoreInterview(updated);
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/mock-interview/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role,
          company,
          resume_text: analysis?.extracted_text || '',
          transcript: updated,
        }),
      });
      const data = await res.json();
      setCurrentQuestion(data.next_question || 'What is an important technical tradeoff you have made recently?');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const scoreInterview = async (t: InterviewQuestionItem[]) => {
    try {
      const res = await fetch('/api/mock-interview/score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript: t, role }),
      });
      const score: InterviewScore = await res.json();
      setInterviewScore(score);
    } catch (err) {
      console.error(err);
    }
  };

  const wordCount = currentAnswer.trim() ? currentAnswer.trim().split(/\s+/).length : 0;

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-2xs">
        <div className="text-xs font-semibold text-slate-500 mb-1">
          <span>Simulation Cockpit</span>
          <span aria-hidden="true" className="mx-2">·</span>
          <span className="text-purple-600 font-bold">Resume-Grounded Interview</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-950 tracking-tight">
          AI Mock Interview &amp; Response Evaluation
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
          Practice adaptive conversational technical and behavioral interview scenarios grounded in your background, projects, and target role.
        </p>
      </div>

      {!interviewStarted && !interviewScore && (
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/90 shadow-2xs max-w-xl space-y-5">
          <div>
            <h2 className="text-base font-black text-slate-900">Setup Mock Interview</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {analysis
                ? `Questions will adapt to ${analysis.name}'s detected skills and project experience.`
                : 'General domain questions will be used (scan resume first for customized questions).'}
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Target Role</label>
              <input
                type="text"
                value={role}
                onChange={e => setRole(e.target.value)}
                placeholder="e.g. Senior Full Stack Engineer"
                className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500/20"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Target Employer / Company (Optional)</label>
              <input
                type="text"
                value={company}
                onChange={e => setCompany(e.target.value)}
                placeholder="e.g. Google, Stripe, Datadog"
                className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500/20"
              />
            </div>

            <button
              onClick={startInterview}
              disabled={loading}
              className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-sm transition flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <span>Initializing Interview Simulation...</span>
              ) : (
                <>
                  <Mic className="w-4 h-4" />
                  <span>Begin 4-Question Simulation</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {interviewStarted && !interviewScore && (
        <div className="max-w-3xl space-y-4">
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/90 shadow-2xs space-y-6">
            <div className="flex items-center justify-between text-xs text-slate-500 border-b border-slate-100 pb-3">
              <div>
                <span className="font-bold text-slate-900">{company || 'Target Employer'}</span>
                <span aria-hidden="true" className="mx-2">·</span>
                <span>{role}</span>
              </div>
              <span className="font-mono tabular-nums font-semibold">
                Question {transcript.length + 1} of 4
              </span>
            </div>

            {/* Past transcript items */}
            {transcript.map((t, idx) => (
              <div key={idx} className="space-y-2 text-xs border-b border-slate-100 pb-4">
                <div className="font-bold text-slate-900 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  <span className="text-purple-600 mr-2 font-mono tabular-nums">Q{idx + 1}:</span>
                  {t.question}
                </div>
                <div className="text-slate-700 p-3.5 bg-slate-50/50 rounded-xl border border-slate-100">
                  <span className="text-slate-400 font-bold mr-2">Answer:</span>
                  {t.answer}
                </div>
              </div>
            ))}

            {/* Current prompt question */}
            <div className="p-4 rounded-xl bg-purple-50/60 border border-purple-200/80 flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-purple-600 text-white flex items-center justify-center shrink-0 mt-0.5">
                <MessageSquare className="w-4 h-4" />
              </div>
              <div className="text-xs sm:text-sm font-bold text-purple-950 leading-relaxed">
                {currentQuestion}
              </div>
            </div>

            {/* Answer Input */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <label className="font-bold text-slate-700">
                  Your Answer (Aim for STAR structure: Situation, Task, Action, Result)
                </label>
                <span className="text-slate-400 font-mono tabular-nums">{wordCount} words</span>
              </div>

              <textarea
                rows={5}
                value={currentAnswer}
                onChange={e => setCurrentAnswer(e.target.value)}
                placeholder="Structure your response with specific decisions made, technologies applied, and measurable outcomes..."
                className="w-full p-3.5 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
              />

              <div className="flex items-center justify-between gap-3 pt-2">
                <button
                  onClick={() => scoreInterview(transcript)}
                  disabled={transcript.length === 0}
                  className="px-3.5 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs disabled:opacity-40 hover:bg-slate-50 transition"
                >
                  End &amp; Score Early
                </button>

                <button
                  onClick={handleSendAnswer}
                  disabled={loading || !currentAnswer.trim()}
                  className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-bold text-xs shadow-sm transition flex items-center gap-1.5"
                >
                  {loading ? (
                    <span>Evaluating...</span>
                  ) : (
                    <>
                      <span>Submit Answer</span>
                      <Send className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {interviewScore && (
        <div className="max-w-2xl bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/90 shadow-2xs space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-200 text-purple-600 flex items-center justify-center font-bold">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900">Mock Interview Scorecard</h2>
              <div className="text-xs text-slate-500">{role} Multi-Axis Evaluation</div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Overall</div>
              <div className="text-2xl font-black text-slate-950 font-mono tabular-nums mt-0.5">{interviewScore.overall}/100</div>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Communication</div>
              <div className="text-2xl font-black text-slate-950 font-mono tabular-nums mt-0.5">{interviewScore.communication}%</div>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Evidence Ratio</div>
              <div className="text-2xl font-black text-emerald-600 font-mono tabular-nums mt-0.5">{interviewScore.evidence}%</div>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Role Relevance</div>
              <div className="text-2xl font-black text-purple-600 font-mono tabular-nums mt-0.5">{interviewScore.relevance}%</div>
            </div>
          </div>

          {/* Visual Performance Dimensions Graph */}
          <div className="p-4.5 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
            <span className="text-xs font-bold text-slate-800">Response Evaluation Breakdown</span>
            <div className="space-y-2.5">
              {[
                { label: 'Communication Clarity', score: interviewScore.communication, color: 'bg-blue-600' },
                { label: 'STAR Evidence & Metrics', score: interviewScore.evidence, color: 'bg-emerald-600' },
                { label: 'Domain & Role Alignment', score: interviewScore.relevance, color: 'bg-purple-600' },
              ].map((bar, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-600 font-medium">{bar.label}</span>
                    <span className="font-mono font-bold text-slate-900">{bar.score}%</span>
                  </div>
                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                    <div className={`${bar.color} h-full rounded-full transition-all duration-500`} style={{ width: `${bar.score}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Demonstrated Strengths</span>
              </div>
              {interviewScore.strengths.map((s, idx) => (
                <div key={idx} className="text-xs text-slate-700">• {s}</div>
              ))}
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-blue-600" />
                <span>Actionable Improvements</span>
              </div>
              {interviewScore.improvements.map((imp, idx) => (
                <div key={idx} className="text-xs text-slate-700">• {imp}</div>
              ))}
            </div>
          </div>

          <button
            onClick={() => {
              setInterviewStarted(false);
              setInterviewScore(null);
              setTranscript([]);
            }}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Practice Another Session</span>
          </button>
        </div>
      )}
    </div>
  );
};
