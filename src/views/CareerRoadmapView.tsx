import React, { useState } from 'react';
import { ResumeAnalysis } from '../types';
import { Route, CheckCircle2, ArrowRight, Layers, Sparkles } from 'lucide-react';

interface CareerRoadmapViewProps {
  analysis: ResumeAnalysis | null;
}

export const CareerRoadmapView: React.FC<CareerRoadmapViewProps> = ({ analysis }) => {
  const [targetRole, setTargetRole] = useState(analysis?.target_role || 'Senior Software Engineer');
  const [roadmapData, setRoadmapData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<Record<number, boolean>>({});

  const generateRoadmap = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/career/roadmap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resume_text: analysis?.extracted_text || '',
          target_role: targetRole,
        }),
      });
      const data = await res.json();
      setRoadmapData(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    generateRoadmap();
  }, [targetRole]);

  const toggleStep = (idx: number) => {
    setCompletedSteps(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-2xs">
        <div className="text-xs font-semibold text-slate-500 mb-1">
          <span>Growth Strategy</span>
          <span aria-hidden="true" className="mx-2">·</span>
          <span className="text-indigo-600 font-bold">Career Progression Ladder</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-950 tracking-tight">
          Personalized Career Transition &amp; Advancement Roadmap
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
          Construct an end-to-end phased progression plan to bridge critical skill gaps and target high-seniority roles.
        </p>
      </div>

      {/* Target Selector */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="w-full sm:w-96">
          <label className="block text-xs font-bold text-slate-700 mb-1.5">Target Destination Role</label>
          <input
            type="text"
            value={targetRole}
            onChange={e => setTargetRole(e.target.value)}
            placeholder="e.g. Lead Machine Learning Engineer"
            className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>

        <button
          onClick={generateRoadmap}
          disabled={loading}
          className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm transition flex items-center justify-center gap-2"
        >
          <Route className="w-4 h-4" />
          <span>Regenerate Progression Plan</span>
        </button>
      </div>

      {roadmapData && (
        <div className="space-y-6">
          {/* Missing Priority Skills Box */}
          {roadmapData.missing_skills?.length > 0 && (
            <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-2xs space-y-3">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-indigo-600" />
                <span>Priority Technical Competencies to Build</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {roadmapData.missing_skills.map((s: string, idx: number) => (
                  <span
                    key={idx}
                    className="px-3 py-1 bg-slate-100 text-slate-800 rounded-lg text-xs font-semibold"
                  >
                    + {s}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Phased Timeline Cards */}
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/90 shadow-2xs space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-slate-950 text-base">
                Milestone Timeline toward {targetRole}
              </h3>
              <span className="text-xs text-slate-500 font-mono tabular-nums">
                {Object.values(completedSteps).filter(Boolean).length} of {roadmapData.steps?.length || 5} Completed
              </span>
            </div>

            <div className="space-y-3.5">
              {roadmapData.steps?.map((step: string, idx: number) => {
                const isDone = !!completedSteps[idx];
                return (
                  <div
                    key={idx}
                    onClick={() => toggleStep(idx)}
                    className={`flex items-start gap-4 p-4 rounded-xl border cursor-pointer transition ${
                      isDone
                        ? 'border-emerald-300 bg-emerald-50/40 text-slate-700'
                        : 'border-slate-200 hover:border-slate-300 bg-white text-slate-900'
                    }`}
                  >
                    <div
                      className={`w-7 h-7 rounded-lg font-black text-xs flex items-center justify-center shrink-0 mt-0.5 font-mono tabular-nums transition ${
                        isDone ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {isDone ? '✓' : idx + 1}
                    </div>
                    <div className="flex-1 text-xs sm:text-sm font-semibold leading-relaxed">
                      {step}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
