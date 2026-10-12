import React from 'react';
import { Candidate, HiringCampaign } from '../../types';
import { Award, Send, Mail, Phone, Users } from 'lucide-react';

interface ShortlistedCandidatesViewProps {
  campaign: HiringCampaign | null;
  candidates: Candidate[];
  onDispatchTest: (candidate: Candidate) => void;
}

export const ShortlistedCandidatesView: React.FC<ShortlistedCandidatesViewProps> = ({
  campaign,
  candidates,
  onDispatchTest,
}) => {
  const shortlisted = candidates.filter(c => c.status === 'Shortlisted' || c.status === 'Assessed');

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-2xs">
        <div className="text-xs font-semibold text-slate-500 mb-1">
          <span>Talent Pool</span>
          <span aria-hidden="true" className="mx-2">·</span>
          <span className="text-purple-700 font-bold">Shortlisted Requisitions</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-950 tracking-tight">
          Shortlisted Candidate Pool ({shortlisted.length})
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
          Top-tier applicants qualifying past screening thresholds ready for technical assessments or direct interview scheduling.
        </p>
      </div>

      {shortlisted.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 border border-slate-200/90 shadow-2xs text-center">
          <Award className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="font-bold text-slate-800 text-sm">No shortlisted candidates yet</h3>
          <p className="text-xs text-slate-400 mt-1">
            Navigate to &quot;Bulk Resume Screening&quot; and click &quot;Shortlist Candidate&quot; on high-match profiles.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {shortlisted.map((cand, idx) => {
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
                className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-2xs hover:shadow-sm transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl border flex items-center justify-center font-bold text-xs shrink-0 ${colorClass}`}>
                        {initials}
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-950 text-sm">{cand.name}</h3>
                        <div className="text-xs text-slate-500 font-mono tabular-nums">Match Fit: {cand.role_match}%</div>
                      </div>
                    </div>
                    <span className="text-xs font-semibold text-purple-700">
                      {cand.assessment_status === 'Completed' ? 'Assessment Done' : 'Shortlisted'}
                    </span>
                  </div>

                  <div className="text-xs text-slate-500 mb-4 space-y-0.5">
                    <div>{cand.email}</div>
                    {cand.phone && <div>{cand.phone}</div>}
                  </div>

                  <div className="flex flex-wrap gap-1.5 mb-6">
                    {cand.skills.slice(0, 7).map((s, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-[11px] font-semibold"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div className="text-xs text-slate-500">
                    Status: <strong className="text-slate-800">{cand.assessment_status}</strong>
                  </div>

                  <button
                    onClick={() => onDispatchTest(cand)}
                    className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-sm transition flex items-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Dispatch Assessment</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
