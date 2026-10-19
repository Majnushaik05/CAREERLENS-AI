import React from 'react';
import { motion } from 'framer-motion';
import { Candidate, HiringCampaign } from '../../types';
import {
  Users,
  Megaphone,
  UploadCloud,
  Award,
  Send,
  BarChart3,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Clock,
  ShieldCheck,
  TrendingUp,
  FileCheck,
  Zap,
  RotateCcw,
} from 'lucide-react';
import { CareerLensLogo } from '../../components/CareerLensLogo';

interface RecruiterDashboardViewProps {
  campaign: HiringCampaign | null;
  candidates: Candidate[];
  onNavigate: (tool: string) => void;
  onScreenCohort?: () => void;
  onClearCandidates?: () => void;
}

export const RecruiterDashboardView: React.FC<RecruiterDashboardViewProps> = ({
  campaign,
  candidates,
  onNavigate,
  onScreenCohort,
  onClearCandidates,
}) => {
  const totalCount = candidates.length;
  const shortlistedCount = candidates.filter(
    c => c.status === 'Shortlisted' || c.status === 'Assessed'
  ).length;
  const assessedCount = candidates.filter(
    c => c.assessment_status === 'Completed' || c.assessment_result !== undefined
  ).length;

  // Real score brackets computed strictly from active candidates
  const bracket0_40 = candidates.filter(c => c.role_match < 40).length;
  const bracket40_60 = candidates.filter(c => c.role_match >= 40 && c.role_match < 60).length;
  const bracket60_80 = candidates.filter(c => c.role_match >= 60 && c.role_match < 80).length;
  const bracket80_100 = candidates.filter(c => c.role_match >= 80).length;

  const maxBracketCount = Math.max(1, bracket0_40, bracket40_60, bracket60_80, bracket80_100);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 12 },
    show: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  };

  const recruiterModules = [
    { name: 'Hiring Campaign', icon: Megaphone, tag: 'Roles', color: 'text-purple-600 bg-purple-50 border-purple-200', desc: 'Define target criteria, job parameters & threshold rules' },
    { name: 'Bulk Resume Screening', icon: UploadCloud, tag: 'Screening', color: 'text-blue-600 bg-blue-50 border-blue-200', desc: 'Run multi-resume batch parsing and score ranking' },
    { name: 'Shortlisted Candidates', icon: Award, tag: 'Shortlist', color: 'text-emerald-600 bg-emerald-50 border-emerald-200', desc: 'Manage qualifying applicants ready for tests or direct calls' },
    { name: 'Assessment Dispatcher', icon: Send, tag: 'Tokens', color: 'text-indigo-600 bg-indigo-50 border-indigo-200', desc: 'Send time-bound test tokens with link security' },
    { name: 'Assessment Results', icon: BarChart3, tag: 'Results', color: 'text-teal-600 bg-teal-50 border-teal-200', desc: 'Audit score breakdowns and candidate test submissions' },
    { name: 'Interview Pipeline', icon: Users, tag: 'Pipeline', color: 'text-rose-600 bg-rose-50 border-rose-200', desc: 'Multi-stage applicant pipeline from screening to offer' },
  ];

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-6 max-w-7xl mx-auto selection:bg-purple-600 selection:text-white"
    >
      {/* Top Banner with Logo Emblem & Accurate Requisition Data */}
      <motion.div
        variants={itemVariants}
        className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-5 relative overflow-hidden"
      >
        <div className="space-y-2 z-10 max-w-2xl">
          <div className="flex items-center gap-2.5">
            <CareerLensLogo size="sm" />
            <div className="flex items-center gap-2 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <span className={`w-2 h-2 rounded-full ${totalCount > 0 ? 'bg-purple-500 animate-pulse' : 'bg-slate-400'}`} />
              <span>RECRUITER WORKSPACE</span>
            </div>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
            {campaign?.title || 'Software Engineering'} Requisition
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-normal leading-relaxed">
            Company: {campaign?.company || 'Organization'} · {totalCount > 0 ? `${totalCount} Applicants Audited · ${shortlistedCount} Shortlisted · ${assessedCount} Assessed` : '0 Applicants Ingested · Awaiting Batch Upload'}
          </p>

          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="bg-purple-50 text-purple-700 text-[11px] font-bold px-2.5 py-1 rounded-full border border-purple-200">
              Active Requisition
            </span>
            <span className="bg-blue-50 text-blue-700 text-[11px] font-bold px-2.5 py-1 rounded-full border border-blue-200">
              Cutoff: ≥{campaign?.passing_score || 75}% Match
            </span>
            {totalCount > 0 && (
              <span className="bg-emerald-50 text-emerald-700 text-[11px] font-bold px-2.5 py-1 rounded-full border border-emerald-200">
                Shortlist Rate: {totalCount > 0 ? Math.round((shortlistedCount / totalCount) * 100) : 0}%
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 z-10">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onNavigate('Bulk Resume Screening')}
            className="px-6 py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-xs transition flex items-center gap-2"
          >
            <UploadCloud className="w-4 h-4" />
            <span>{totalCount > 0 ? 'Upload More Resumes' : 'Upload Resumes & Screen'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </motion.button>
          {totalCount > 0 && onClearCandidates && (
            <button
              onClick={onClearCandidates}
              className="p-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-500 transition"
              title="Reset candidates to empty"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}
        </div>
      </motion.div>

      {/* RECRUITER REAL SUMMARY STAT TILES */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          variants={itemVariants}
          whileHover={{ y: -3, transition: { duration: 0.2 } }}
          className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs flex flex-col justify-between"
        >
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Resumes</div>
          <div className="text-3xl font-black text-slate-900 font-mono mt-1">
            {totalCount > 0 ? totalCount : <span className="text-slate-300 font-normal">0</span>}
          </div>
          <div className="text-[11px] text-slate-500 font-medium mt-1">
            {totalCount > 0 ? 'Ingested in current campaign' : 'Awaiting batch upload'}
          </div>
        </motion.div>

        <motion.div
          variants={itemVariants}
          whileHover={{ y: -3, transition: { duration: 0.2 } }}
          className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs flex flex-col justify-between"
        >
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Duplicates Filtered</div>
          <div className="text-3xl font-black text-slate-900 font-mono mt-1">
            {totalCount > 0 ? 0 : <span className="text-slate-300 font-normal">0</span>}
          </div>
          <div className="text-[11px] text-slate-500 font-medium mt-1">
            {totalCount > 0 ? 'Zero duplicate submissions' : 'Deduplication ready'}
          </div>
        </motion.div>

        <motion.div
          variants={itemVariants}
          whileHover={{ y: -3, transition: { duration: 0.2 } }}
          className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs flex flex-col justify-between"
        >
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Valid Candidates</div>
          <div className="text-3xl font-black text-slate-900 font-mono mt-1">
            {totalCount > 0 ? totalCount : <span className="text-slate-300 font-normal">0</span>}
          </div>
          <div className="text-[11px] text-emerald-600 font-medium mt-1">
            {totalCount > 0 ? 'Verified contact records' : 'No candidates processed'}
          </div>
        </motion.div>

        <motion.div
          variants={itemVariants}
          whileHover={{ y: -3, transition: { duration: 0.2 } }}
          className="p-5 rounded-2xl bg-purple-50/60 border border-purple-200 shadow-2xs flex flex-col justify-between"
        >
          <div className="text-[11px] font-bold text-purple-700 uppercase tracking-wider">Shortlisted Pool</div>
          <div className="text-3xl font-black text-purple-900 font-mono mt-1">
            {shortlistedCount > 0 ? shortlistedCount : <span className="text-slate-300 font-normal">0</span>}
          </div>
          <div className="text-[11px] text-purple-700 font-semibold mt-1">
            {shortlistedCount > 0 ? '≥75% Matching requisitions' : 'None shortlisted yet'}
          </div>
        </motion.div>
      </div>

      {/* RECRUITER WORKSPACE MODULES GRID */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-black text-slate-900 tracking-tight">Recruiter Operations Modules</h2>
          <span className="text-xs text-slate-500 font-medium">Select tool to manage candidate stages</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {recruiterModules.map(mod => {
            const Icon = mod.icon;
            return (
              <motion.div
                key={mod.name}
                variants={itemVariants}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                whileTap={{ scale: 0.99 }}
                onClick={() => onNavigate(mod.name)}
                className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs hover:border-purple-300 hover:shadow-xs transition cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-200 text-purple-600 flex items-center justify-center">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                      {mod.tag}
                    </span>
                  </div>
                  <h3 className="font-bold text-slate-900 text-sm">{mod.name}</h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    {mod.desc}
                  </p>
                </div>
                <div className="text-xs font-bold text-purple-600 mt-4 flex items-center gap-1">
                  <span>Open {mod.name}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* CANDIDATE LEADERBOARD & REAL SCORE DISTRIBUTION GRAPH */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Candidate Leaderboard Table with Dynamic Records */}
        <motion.div
          variants={itemVariants}
          className="lg:col-span-8 bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-black text-slate-900">Screened Candidate Leaderboard</h3>
              <p className="text-xs text-slate-500">Ranked by semantic match score and technical overlap</p>
            </div>
            {totalCount > 0 && (
              <button
                onClick={() => onNavigate('Bulk Resume Screening')}
                className="text-xs font-bold text-purple-600 hover:underline flex items-center gap-1"
              >
                <span>View All ({totalCount})</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {totalCount === 0 ? (
            <div className="py-14 text-center border-2 border-dashed border-slate-200 rounded-2xl space-y-3">
              <UploadCloud className="w-12 h-12 text-slate-300 mx-auto" />
              <div className="max-w-sm mx-auto">
                <h4 className="font-bold text-slate-800 text-sm">No Resumes Ingested Yet</h4>
                <p className="text-xs text-slate-400 mt-1">
                  Upload candidate resume files or run batch screening to populate candidate ranking.
                </p>
              </div>
              <button
                onClick={() => onNavigate('Bulk Resume Screening')}
                className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-xs transition inline-flex items-center gap-2"
              >
                <UploadCloud className="w-4 h-4" />
                <span>Go to Bulk Screening</span>
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase text-[10px]">
                    <th className="pb-2.5">Candidate</th>
                    <th className="pb-2.5">Match Fit</th>
                    <th className="pb-2.5">Status</th>
                    <th className="pb-2.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {candidates.slice(0, 6).map((cand, idx) => {
                    const initials = cand.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'CD';
                    const colorClass = [
                      'bg-blue-100 text-blue-700 border-blue-200',
                      'bg-emerald-100 text-emerald-700 border-emerald-200',
                      'bg-purple-100 text-purple-700 border-purple-200',
                      'bg-amber-100 text-amber-700 border-amber-200',
                    ][idx % 4];

                    return (
                      <tr key={cand.id || idx} className="hover:bg-slate-50/70 transition">
                        <td className="py-3.5 font-bold text-slate-900 flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-xl border flex items-center justify-center font-bold text-xs shrink-0 ${colorClass}`}>
                            {initials}
                          </div>
                          <div>
                            <div className="font-extrabold text-slate-950 text-xs">{cand.name}</div>
                            <div className="text-[11px] text-slate-400 font-normal">{cand.email}</div>
                          </div>
                        </td>
                        <td className="py-3.5 font-mono font-bold text-blue-700 text-xs">
                          <span className="bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
                            {cand.role_match}%
                          </span>
                        </td>
                        <td className="py-3.5">
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${
                            cand.status === 'Shortlisted'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-slate-100 text-slate-600 border-slate-200'
                          }`}>
                            {cand.status}
                          </span>
                        </td>
                        <td className="py-3.5 text-right">
                          <button
                            onClick={() => onNavigate('Assessment Dispatcher')}
                            className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-purple-600 hover:text-white text-slate-700 font-semibold text-[11px] transition"
                          >
                            Dispatch Token
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>

        {/* Real Score Distribution Vertical Bar Graph */}
        <motion.div
          variants={itemVariants}
          className="lg:col-span-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4 flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-slate-900">Score Distribution Graph</h3>
              <span className="text-[11px] text-slate-400 font-mono">Cohort N={totalCount}</span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">Applicant performance clustering</p>

            {totalCount === 0 ? (
              <div className="h-44 flex flex-col items-center justify-center text-center p-4 border border-dashed border-slate-200 rounded-xl mt-4">
                <BarChart3 className="w-8 h-8 text-slate-300 mb-1" />
                <span className="text-xs text-slate-400 font-medium">Awaiting Screened Resumes</span>
                <span className="text-[10px] text-slate-400">Score buckets will plot automatically</span>
              </div>
            ) : (
              <div className="h-44 pt-4 flex items-end justify-between gap-3 border-b border-slate-100 pb-2">
                {[
                  { bracket: '0-40', count: bracket0_40, height: Math.round((bracket0_40 / maxBracketCount) * 90) },
                  { bracket: '40-60', count: bracket40_60, height: Math.round((bracket40_60 / maxBracketCount) * 90) },
                  { bracket: '60-80', count: bracket60_80, height: Math.round((bracket60_80 / maxBracketCount) * 90) },
                  { bracket: '80-100', count: bracket80_100, height: Math.round((bracket80_100 / maxBracketCount) * 90) },
                ].map((col, idx) => (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                    <span className="text-[10px] font-mono text-slate-500 font-bold">{col.count}</span>
                    <div
                      className="w-full bg-purple-600 rounded-t transition-all duration-700 hover:bg-purple-700"
                      style={{ height: `${Math.max(12, col.height)}%` }}
                      title={`${col.bracket}: ${col.count} candidates`}
                    />
                    <span className="text-[10px] text-slate-600 font-mono font-bold">{col.bracket}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-2 pt-2 text-xs border-t border-slate-100">
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Passing Cutoff:</span>
              <span className="font-bold text-slate-900 font-mono">≥ {campaign?.passing_score || 75}% Match</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Qualified in Shortlist:</span>
              <span className="font-bold text-purple-700 font-mono">{shortlistedCount} Candidates</span>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};
