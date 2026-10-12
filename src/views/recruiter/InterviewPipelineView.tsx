import React from 'react';
import { Candidate } from '../../types';
import { Users, ArrowRight, CheckCircle2 } from 'lucide-react';

interface InterviewPipelineViewProps {
  candidates: Candidate[];
  onUpdateCandidate: (candidateId: string, updates: Partial<Candidate>) => void;
}

export const InterviewPipelineView: React.FC<InterviewPipelineViewProps> = ({
  candidates,
  onUpdateCandidate,
}) => {
  const stages: Array<{
    id: Candidate['status'];
    title: string;
  }> = [
    { id: 'Screened', title: '1. Sourced & Screened' },
    { id: 'Shortlisted', title: '2. Shortlisted' },
    { id: 'Assessed', title: '3. Assessment Passed' },
    { id: 'Interview Scheduled', title: '4. Interviewing' },
  ];

  const advanceCandidate = (cand: Candidate) => {
    let nextStatus: Candidate['status'] = 'Shortlisted';
    if (cand.status === 'Screened') nextStatus = 'Shortlisted';
    else if (cand.status === 'Shortlisted') nextStatus = 'Assessed';
    else if (cand.status === 'Assessed') nextStatus = 'Interview Scheduled';
    onUpdateCandidate(cand.id, { status: nextStatus });
  };

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-2xs">
        <div className="text-xs font-semibold text-slate-500 mb-1">
          <span>Recruitment Funnel</span>
          <span aria-hidden="true" className="mx-2">·</span>
          <span className="text-purple-700 font-bold">Pipeline Progression</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-950 tracking-tight">
          Candidate Hiring Pipeline &amp; Funnel
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
          Track stage progression from automated resume screening through technical exams to final employer interview rounds.
        </p>
      </div>

      {/* Kanban Board Columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stages.map(st => {
          const inStage = candidates.filter(
            c => c.status === st.id || (st.id === 'Assessed' && c.assessment_status === 'Completed' && c.status !== 'Interview Scheduled')
          );
          return (
            <div key={st.id} className="bg-slate-100 rounded-2xl p-3.5 border border-slate-200 flex flex-col min-h-[460px]">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200/80 mb-3 px-1">
                <span className="text-xs font-black text-slate-800">
                  {st.title}
                </span>
                <span className="text-xs font-bold font-mono tabular-nums text-slate-500 bg-white px-2 py-0.5 rounded-full border border-slate-200">
                  {inStage.length}
                </span>
              </div>

              <div className="flex-1 space-y-2.5 overflow-y-auto">
                {inStage.map((cand, idx) => {
                  const colorClass = [
                    'bg-blue-100 text-blue-700 border-blue-200',
                    'bg-emerald-100 text-emerald-700 border-emerald-200',
                    'bg-purple-100 text-purple-700 border-purple-200',
                    'bg-amber-100 text-amber-700 border-amber-200',
                  ][idx % 4];
                  const initials = cand.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'CD';

                  return (
                    <div
                      key={cand.id || idx}
                      className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-2xs space-y-2"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className={`w-7 h-7 rounded-full border flex items-center justify-center font-bold text-[10px] shrink-0 ${colorClass}`}>
                          {initials}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="font-bold text-slate-900 text-xs truncate">{cand.name}</div>
                          <div className="text-[10px] text-slate-400 font-mono tabular-nums">
                            {cand.role_match}% Match
                          </div>
                        </div>
                      </div>

                      <div className="text-[11px] text-slate-500 truncate">{cand.email}</div>

                      {st.id !== 'Interview Scheduled' && (
                        <button
                          onClick={() => advanceCandidate(cand)}
                          className="w-full mt-2 py-1.5 px-2 rounded-lg bg-slate-50 hover:bg-slate-100 text-[11px] font-bold text-slate-700 border border-slate-200 transition flex items-center justify-center gap-1"
                        >
                          <span>Move to Next Stage</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  );
                })}

                {inStage.length === 0 && (
                  <div className="h-32 flex items-center justify-center text-xs text-slate-400 font-medium">
                    No candidates in this stage
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
