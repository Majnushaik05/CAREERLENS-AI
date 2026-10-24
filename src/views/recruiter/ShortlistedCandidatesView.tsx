import React, { useState } from 'react';
import { Candidate, HiringCampaign } from '../../types';
import { Award, Send, Mail, Phone, ArrowRight } from 'lucide-react';

interface ShortlistedCandidatesViewProps {
  campaign: HiringCampaign | null;
  candidates: Candidate[];
  onDispatchTest: (candidate: Candidate) => void;
  onNavigate?: (tool: string) => void;
}

export const ShortlistedCandidatesView: React.FC<ShortlistedCandidatesViewProps> = ({
  campaign,
  candidates,
  onDispatchTest,
  onNavigate,
}) => {
  const shortlisted = candidates.filter(c => c.status === 'Shortlisted' || c.status === 'Assessed');

  return (
    <div className="space-y-6 max-w-6xl mx-auto selection:bg-purple-600 selection:text-white pb-16">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>TALENT SHORTLIST &amp; DISPATCH QUEUE</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-950 tracking-tight">
            Shortlisted Candidates ({shortlisted.length})
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
            Every candidate you explicitly shortlist appears here. Duplicate resumes are consolidated during screening.
          </p>
        </div>


      </div>

      {shortlisted.length === 0 ? (
        <div className="bg-white rounded-3xl p-14 border border-slate-200 shadow-xs text-center space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-purple-50 border border-purple-200 text-purple-600 flex items-center justify-center mx-auto mb-2">
            <Award className="w-7 h-7" />
          </div>
          <h3 className="font-bold text-slate-900 text-base">No shortlisted candidates yet</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Run a bulk screening over your applicant resumes, then click &quot;Shortlist Candidate&quot; on high-match profiles to populate this priority roster.
          </p>
          {onNavigate && (
            <div className="pt-2">
              <button
                onClick={() => onNavigate('Bulk Resume Screening')}
                className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-xs transition inline-flex items-center gap-2"
              >
                <span>Go to Bulk Resume Screening</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
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
                className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs hover:border-purple-300 transition flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl border flex items-center justify-center font-black text-xs shrink-0 ${colorClass}`}>
                        {initials}
                      </div>
                      <div>
                        <h3 className="font-black text-slate-950 text-sm">{cand.name}</h3>
                        <div className="text-xs text-purple-700 font-bold font-mono">
                          {cand.role_match}% Role Match · {cand.resume_score}/100 ATS
                        </div>
                      </div>
                    </div>
                    <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                      {cand.assessment_status === 'Completed' ? 'Assessment Done' : 'Shortlisted'}
                    </span>
                  </div>

                  <div className="text-xs text-slate-600 space-y-1 mb-4">
                    <div className="flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      <a href={`mailto:${cand.email}`} className="hover:text-purple-600 transition truncate">
                        {cand.email}
                      </a>
                    </div>
                    {cand.phone && (
                      <div className="flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        <span>{cand.phone}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {cand.skills.slice(0, 8).map((s, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-[11px] font-medium"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div className="text-xs text-slate-500">
                    Test Token:{' '}
                    <strong className="text-slate-800">
                      {cand.test_token ? 'Active / Generated' : 'Pending'}
                    </strong>
                  </div>

                  <button
                    onClick={() => onDispatchTest(cand)}
                    className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-xs transition flex items-center gap-1.5"
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
