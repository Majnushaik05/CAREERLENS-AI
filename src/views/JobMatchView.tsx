import React, { useState } from 'react';
import { ResumeAnalysis, JobMatchResult } from '../types';
import { Target, CheckCircle2, XCircle, AlertCircle, ArrowRight, Search, SlidersHorizontal } from 'lucide-react';

interface JobMatchViewProps {
  analysis: ResumeAnalysis | null;
}

export const JobMatchView: React.FC<JobMatchViewProps> = ({ analysis }) => {
  const [searchQuery, setSearchQuery] = useState('AI Engineer');
  const [selectedRoleIndex, setSelectedRoleIndex] = useState(0);

  // Top job matches list matching Reference Image 1 bottom-left
  const topJobMatches = [
    { title: 'AI Engineer', company: 'TechNova Solutions', location: 'Bengaluru, India', match: '92%' },
    { title: 'ML Engineer', company: 'DataSense Labs', location: 'Hyderabad, India', match: '88%' },
    { title: 'AI Developer', company: 'InnovateX', location: 'Pune, India', match: '84%' },
  ];

  const matchedSkillsList = [
    { skill: 'Python', level: 'High', imp: 'High' },
    { skill: 'Machine Learning', level: 'High', imp: 'High' },
    { skill: 'NLP', level: 'Medium', imp: 'High' },
    { skill: 'SQL', level: 'High', imp: 'Medium' },
    { skill: 'Streamlit', level: 'Medium', imp: 'Medium' },
    { skill: 'Pandas', level: 'High', imp: 'High' },
  ];

  const skillsToUpgrade = [
    { skill: 'Deep Learning', gap: 'Medium' },
    { skill: 'MLOps', gap: 'High' },
    { skill: 'Docker', gap: 'Medium' },
    { skill: 'AWS', gap: 'High' },
    { skill: 'System Design', gap: 'Medium' },
    { skill: 'Data Structures', gap: 'Medium' },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs">
        <h1 className="text-xl font-black text-slate-900 tracking-tight">AI Job Match</h1>
        <p className="text-xs text-slate-500 mt-1">
          Find the best job opportunities that match your skills and experience.
        </p>
      </div>

      {/* SEARCH BAR (Matching Reference Image 1 bottom-left) */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search role or keywords..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
          />
        </div>

        <button className="w-full sm:w-auto px-6 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition shadow-xs">
          Search Jobs
        </button>
        <button className="w-full sm:w-auto px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs transition flex items-center justify-center gap-1.5">
          <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500" />
          <span>Advanced Filters</span>
        </button>
      </div>

      {/* 4 COLUMNS / CARDS GRID (Matching Reference Image 1 bottom-left) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Overall Match Score Ring */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Overall Match Score</div>
            <div className="flex items-center justify-center py-6">
              <div className="relative w-28 h-28 flex items-center justify-center">
                <svg className="w-28 h-28 transform -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-slate-100"
                    strokeWidth="3"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className="text-blue-600"
                    strokeDasharray="86, 100"
                    strokeWidth="3"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <div className="absolute text-center">
                  <div className="text-2xl font-black text-slate-900 font-mono">86%</div>
                  <div className="text-[10px] font-bold text-emerald-600">Excellent Match</div>
                </div>
              </div>
            </div>
          </div>
          <div className="text-[11px] text-slate-500 text-center border-t border-slate-100 pt-3">
            You are a strong fit for AI Engineer roles in market.
          </div>
        </div>

        {/* Card 2: Matched Skills */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Matched Skills (12)</h3>
            <span className="text-[10px] text-slate-400">Level • Imp</span>
          </div>
          <div className="space-y-2">
            {matchedSkillsList.map((m, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs py-0.5 border-b border-slate-50">
                <span className="font-semibold text-slate-800">{m.skill}</span>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono text-emerald-600 font-bold">{m.level}</span>
                  <span className="text-[10px] font-mono text-slate-400">{m.imp}</span>
                </div>
              </div>
            ))}
          </div>
          <button className="text-[11px] font-bold text-blue-600 hover:underline pt-1">
            View all matched skills →
          </button>
        </div>

        {/* Card 3: Skills to Upgrade */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Skills to Upgrade (6)</h3>
            <span className="text-[10px] text-slate-400">Gap Severity</span>
          </div>
          <div className="space-y-2">
            {skillsToUpgrade.map((u, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs py-0.5 border-b border-slate-50">
                <span className="font-semibold text-slate-800">{u.skill}</span>
                <span className={`text-[10px] font-mono font-bold ${u.gap === 'High' ? 'text-rose-600' : 'text-amber-600'}`}>
                  {u.gap}
                </span>
              </div>
            ))}
          </div>
          <button className="text-[11px] font-bold text-blue-600 hover:underline pt-1">
            How to improve these skills →
          </button>
        </div>

        {/* Card 4: Top Job Matches */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Top Job Matches</h3>
            <span className="text-[10px] font-bold text-emerald-600">Active</span>
          </div>
          <div className="space-y-2.5">
            {topJobMatches.map((j, idx) => (
              <div key={idx} className="p-2.5 rounded-xl border border-slate-100 bg-slate-50/60 hover:bg-blue-50/30 transition">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900">{j.title}</span>
                  <span className="text-[11px] font-bold text-blue-600 font-mono">{j.match}</span>
                </div>
                <div className="text-[11px] text-slate-600 mt-0.5">{j.company}</div>
                <div className="text-[10px] text-slate-400">{j.location}</div>
              </div>
            ))}
          </div>
          <button className="text-[11px] font-bold text-blue-600 hover:underline pt-1">
            View all 12 matches →
          </button>
        </div>
      </div>

      {/* ESTIMATED SALARY & MARKET SIGNALS (Matching Reference Image 1 bottom-left) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Estimated Compensation Range</div>
          <div className="text-2xl font-black text-slate-950 font-mono">
            ₹12.5 – ₹18.5 LPA
          </div>
          <div className="text-xs text-slate-500">(For AI Engineer in India)</div>

          {/* Salary scale slider visual */}
          <div className="pt-3 space-y-1">
            <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
              <div className="h-full bg-blue-600 rounded-full" style={{ width: '65%' }} />
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono pt-1">
              <span>₹8 LPA</span>
              <span>₹15 LPA (Avg)</span>
              <span>₹25 LPA</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Market Demand Signals</div>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs text-slate-700">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>High demand for AI Engineers in India &amp; Remote</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-700">
              <span className="w-2 h-2 rounded-full bg-blue-500" />
              <span>+34% job posting growth over the last quarter</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-700">
              <span className="w-2 h-2 rounded-full bg-purple-500" />
              <span>Top skills in demand: Python, ML, NLP, Docker</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
