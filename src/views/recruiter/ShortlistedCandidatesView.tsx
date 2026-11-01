import React from 'react';
import { Candidate, HiringCampaign } from '../../types';
import { sanitizeCandidateName } from '../../services/careerService';
import {
  Award,
  Send,
  Mail,
  Phone,
  ArrowRight,
  CheckCircle2,
  Target,
  FileCheck,
} from 'lucide-react';

interface ShortlistedCandidatesViewProps {
  campaign: HiringCampaign | null;
  candidates: Candidate[];
  onDispatchTest: (candidate: Candidate) => void;
  onNavigate?: (tool: string) => void;
}

export const ShortlistedCandidatesView: React.FC<
  ShortlistedCandidatesViewProps
> = ({
  candidates,
  onDispatchTest,
  onNavigate,
}) => {
  // Keep both shortlisted and assessed candidates visible.
  const shortlisted = candidates.filter(
    candidate =>
      candidate.status === 'Shortlisted' ||
      candidate.status === 'Assessed'
  );

  // Prevent invalid or missing scores from appearing as fabricated values.
  const formatScore = (value: number | null | undefined): string => {
    if (
      typeof value !== 'number' ||
      !Number.isFinite(value)
    ) {
      return 'Not calculated';
    }

    const score = Math.max(0, Math.min(100, Math.round(value)));
    return `${score}%`;
  };

  const getEmail = (candidate: Candidate): string => {
    return candidate.email?.trim() || 'Not found';
  };

  const getPhone = (candidate: Candidate): string => {
    return candidate.phone?.trim() || 'Not found';
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto selection:bg-purple-600 selection:text-white pb-16">

      {/* HEADER */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>TALENT SHORTLIST & DISPATCH QUEUE</span>
          </div>

          <h1 className="text-xl sm:text-2xl font-black text-slate-950 tracking-tight">
            Shortlisted Candidates ({shortlisted.length})
          </h1>

          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
            Review candidate contact information, ATS resume scores,
            and job-specific matching percentages.
          </p>
        </div>

        {shortlisted.length > 0 && (
          <div className="flex items-center gap-2 bg-purple-50 px-3.5 py-1.5 rounded-2xl border border-purple-200 text-xs font-bold text-purple-800 shrink-0">
            <CheckCircle2 className="w-4 h-4 text-purple-600" />

            <span>
              {shortlisted.length} Priority Candidate
              {shortlisted.length === 1 ? '' : 's'} Ready
            </span>
          </div>
        )}
      </div>

      {/* EMPTY STATE */}
      {shortlisted.length === 0 ? (
        <div className="bg-white rounded-3xl p-14 border border-slate-200 shadow-sm text-center space-y-3">

          <div className="w-14 h-14 rounded-2xl bg-purple-50 border border-purple-200 text-purple-600 flex items-center justify-center mx-auto mb-2">
            <Award className="w-7 h-7" />
          </div>

          <h3 className="font-bold text-slate-900 text-base">
            No shortlisted candidates yet
          </h3>

          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Run bulk resume screening and shortlist candidates
            to populate this section.
          </p>

          {onNavigate && (
            <div className="pt-2">
              <button
                onClick={() =>
                  onNavigate('Bulk Resume Screening')
                }
                className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-sm transition inline-flex items-center gap-2"
              >
                <span>Go to Bulk Resume Screening</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      ) : (

        /* SHORTLISTED CANDIDATE CARDS */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          {shortlisted.map(candidate => {
            const email = getEmail(candidate);
            const phone = getPhone(candidate);

            const atsScore = formatScore(
              candidate.resume_score
            );

            const jobMatch = formatScore(
              candidate.role_match
            );

            return (
              <div
                key={candidate.id}
                className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:border-purple-300 hover:shadow-md transition flex flex-col justify-between space-y-5"
              >
                {/* CANDIDATE HEADER */}
                <div className="flex items-center justify-between gap-3 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-200 text-purple-700 font-bold text-xs flex items-center justify-center shrink-0">
                      {sanitizeCandidateName(candidate.name).slice(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-extrabold text-slate-900 text-sm truncate">
                        {sanitizeCandidateName(candidate.name, candidate.resume_text, undefined, candidate.email || candidate.extracted_email)}
                      </h3>
                      <p className="text-[11px] text-slate-400 font-medium truncate">Candidate Profile</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200 shrink-0">
                    {candidate.status}
                  </span>
                </div>

                {/* FOUR REQUESTED FIELDS */}
                <div className="space-y-4">

                  {/* EMAIL */}
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
                      <Mail className="w-4 h-4 text-blue-600" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Email Address
                      </p>

                      {email === 'Not found' ? (
                        <p className="text-sm font-semibold text-slate-500 mt-1">
                          Not found
                        </p>
                      ) : (
                        <a
                          href={`mailto:${email}`}
                          className="text-sm font-semibold text-slate-800 hover:text-purple-600 transition break-all mt-1 block"
                        >
                          {email}
                        </a>
                      )}
                    </div>
                  </div>

                  {/* MOBILE NUMBER */}
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0">
                      <Phone className="w-4 h-4 text-emerald-600" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Mobile Number
                      </p>

                      {phone === 'Not found' ? (
                        <p className="text-sm font-semibold text-slate-500 mt-1">
                          Not found
                        </p>
                      ) : (
                        <a
                          href={`tel:${phone.replace(/[^\d+]/g, '')}`}
                          className="text-sm font-semibold text-slate-800 hover:text-purple-600 transition mt-1 block"
                        >
                          {phone}
                        </a>
                      )}
                    </div>
                  </div>

                  {/* ATS RESUME SCORE */}
                  <div className="flex items-center justify-between gap-3 p-4 rounded-2xl bg-blue-50/70 border border-blue-100">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-white border border-blue-100 flex items-center justify-center shrink-0">
                        <FileCheck className="w-5 h-5 text-blue-600" />
                      </div>

                      <div>
                        <p className="text-xs font-bold text-slate-700">
                          ATS Resume Score
                        </p>

                        <p className="text-[10px] text-slate-500 mt-0.5">
                          Resume quality evaluation
                        </p>
                      </div>
                    </div>

                    <span className="text-xl font-black font-mono text-blue-700">
                      {atsScore}
                    </span>
                  </div>

                  {/* JOB MATCH PERCENTAGE */}
                  <div className="flex items-center justify-between gap-3 p-4 rounded-2xl bg-purple-50/70 border border-purple-100">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-white border border-purple-100 flex items-center justify-center shrink-0">
                        <Target className="w-5 h-5 text-purple-600" />
                      </div>

                      <div>
                        <p className="text-xs font-bold text-slate-700">
                          Job Match Percentage
                        </p>

                        <p className="text-[10px] text-slate-500 mt-0.5">
                          Match against campaign job description
                        </p>
                      </div>
                    </div>

                    <span className="text-xl font-black font-mono text-purple-700">
                      {jobMatch}
                    </span>
                  </div>

                </div>

                {/* ASSESSMENT ACTION */}
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  {candidate.assessment_result ? (
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                      Exam Passed: {candidate.assessment_result.percentage}%
                    </span>
                  ) : candidate.assessment_status === 'Sent' ? (
                    <span className="text-xs font-bold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-full border border-purple-200">
                      Exam Dispatched
                    </span>
                  ) : (
                    <span className="text-xs text-slate-400">Exam not sent yet</span>
                  )}

                  <div className="flex items-center gap-2">
                    {candidate.status === 'Assessed' && onNavigate && (
                      <button
                        onClick={() => onNavigate('Interview Pipeline')}
                        className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-purple-100 text-purple-700 font-bold text-xs transition cursor-pointer"
                      >
                        Pipeline
                      </button>
                    )}
                    <button
                      onClick={() => onDispatchTest(candidate)}
                      className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-sm transition flex items-center gap-2 cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>{candidate.assessment_status === 'Completed' ? 'Re-dispatch Exam' : 'Dispatch Assessment'}</span>
                    </button>
                  </div>
                </div>

              </div>
            );
          })}

        </div>
      )}

    </div>
  );
};
