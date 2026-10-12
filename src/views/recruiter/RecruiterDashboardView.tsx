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
} from 'lucide-react';
import { IMAGES } from '../../assets/images';

interface RecruiterDashboardViewProps {
  campaign: HiringCampaign | null;
  candidates: Candidate[];
  onNavigate: (tool: string) => void;
}

export const RecruiterDashboardView: React.FC<RecruiterDashboardViewProps> = ({
  campaign,
  candidates,
  onNavigate,
}) => {
  // Sample candidate list with rich details and avatars
  const recentScreened = [
    { name: 'Ananya Sharma', match: 92, status: 'Shortlisted', role: 'Staff Backend Architect', color: 'bg-blue-100 text-blue-700 border-blue-200' },
    { name: 'Rohit Kumar', match: 88, status: 'Shortlisted', role: 'Senior React Engineer', color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
    { name: 'Neha Gupta', match: 84, status: 'Shortlisted', role: 'Distributed Systems Lead', color: 'bg-purple-100 text-purple-700 border-purple-200' },
    { name: 'Arjun Singh', match: 78, status: 'Reviewed', role: 'DevOps / SRE Engineer', color: 'bg-amber-100 text-amber-700 border-amber-200' },
    { name: 'Priya Mehta', match: 72, status: 'Reviewed', role: 'Cloud Infrastructure Eng', color: 'bg-rose-100 text-rose-700 border-rose-200' },
  ];

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
    { name: 'Hiring Campaign', icon: Megaphone, tag: 'ROLES', color: 'text-purple-600 bg-purple-50 border-purple-200', desc: 'Define target criteria, job parameters & threshold rules' },
    { name: 'Bulk Resume Screening', icon: UploadCloud, tag: 'SCREENING', color: 'text-blue-600 bg-blue-50 border-blue-200', desc: 'Run multi-resume batch semantic parsing and ranking' },
    { name: 'Shortlisted Candidates', icon: Award, tag: 'QUALIFIED', color: 'text-emerald-600 bg-emerald-50 border-emerald-200', desc: 'Manage qualifying applicants ready for tests or direct calls' },
    { name: 'Assessment Dispatcher', icon: Send, tag: 'TOKENS', color: 'text-indigo-600 bg-indigo-50 border-indigo-200', desc: 'Send time-bound test tokens with link security' },
    { name: 'Assessment Results', icon: BarChart3, tag: 'VAULT', color: 'text-teal-600 bg-teal-50 border-teal-200', desc: 'Audit score breakdowns and candidate test submissions' },
    { name: 'Interview Pipeline', icon: Users, tag: 'KANBAN', color: 'text-rose-600 bg-rose-50 border-rose-200', desc: 'Multi-stage applicant pipeline from screening to offer' },
  ];

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-6 max-w-7xl mx-auto selection:bg-purple-600 selection:text-white"
    >
      {/* Top Banner with Official Logo Emblem & Command Center Telemetry */}
      <motion.div
        variants={itemVariants}
        className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-5 relative overflow-hidden"
      >
        <div className="space-y-2 z-10 max-w-2xl">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl overflow-hidden border border-slate-200 bg-slate-900 shrink-0 shadow-2xs">
              <img src={IMAGES.logo} alt="Career Lens Emblem" className="w-full h-full object-cover" />
            </div>
            <div className="flex items-center gap-2 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
              <span>RECRUITER WORKSPACE COMMAND CENTER</span>
            </div>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
            {campaign?.title || 'Senior Software Engineer'} – Active Hiring Cohort
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-normal leading-relaxed">
            Company: {campaign?.company || 'TechNova Solutions'} · 248 Applicants Screened · 32 Shortlisted · 28 Assessment Tokens Issued
          </p>

          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="bg-purple-50 text-purple-700 text-[11px] font-bold px-2.5 py-1 rounded-full border border-purple-200">
              Active Requisition
            </span>
            <span className="bg-blue-50 text-blue-700 text-[11px] font-bold px-2.5 py-1 rounded-full border border-blue-200">
              Threshold: ≥75% Role Match
            </span>
            <span className="bg-emerald-50 text-emerald-700 text-[11px] font-bold px-2.5 py-1 rounded-full border border-emerald-200">
              Pass Rate: 84%
            </span>
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onNavigate('Bulk Resume Screening')}
          className="self-start md:self-auto px-6 py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-xs transition flex items-center gap-2 shrink-0 z-10"
        >
          <UploadCloud className="w-4 h-4" />
          <span>Launch Bulk Screening</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </motion.button>
      </motion.div>

      {/* BULK SCREENING SUMMARY STAT TILES WITH FRAMER MOTION MICRO-HOVER */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          variants={itemVariants}
          whileHover={{ y: -3, transition: { duration: 0.2 } }}
          className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs flex flex-col justify-between"
        >
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Resumes</div>
          <div className="text-3xl font-black text-slate-900 font-mono mt-1">248</div>
          <div className="text-[11px] text-slate-500 font-medium mt-1">Ingested via batch parser</div>
        </motion.div>

        <motion.div
          variants={itemVariants}
          whileHover={{ y: -3, transition: { duration: 0.2 } }}
          className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs flex flex-col justify-between"
        >
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Duplicates Filtered</div>
          <div className="text-3xl font-black text-slate-900 font-mono mt-1">36</div>
          <div className="text-[11px] text-slate-500 font-medium mt-1">Deduplicated across channels</div>
        </motion.div>

        <motion.div
          variants={itemVariants}
          whileHover={{ y: -3, transition: { duration: 0.2 } }}
          className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs flex flex-col justify-between"
        >
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Valid Candidates</div>
          <div className="text-3xl font-black text-slate-900 font-mono mt-1">212</div>
          <div className="text-[11px] text-emerald-600 font-medium mt-1">Verified contact information</div>
        </motion.div>

        <motion.div
          variants={itemVariants}
          whileHover={{ y: -3, transition: { duration: 0.2 } }}
          className="p-5 rounded-2xl bg-purple-50/60 border border-purple-200 shadow-2xs flex flex-col justify-between"
        >
          <div className="text-[11px] font-bold text-purple-700 uppercase tracking-wider">Shortlisted Pool</div>
          <div className="text-3xl font-black text-purple-900 font-mono mt-1">32</div>
          <div className="text-[11px] text-purple-700 font-semibold mt-1">≥75% Matching requisitions</div>
        </motion.div>
      </div>

      {/* RECRUITER WORKSPACE MODULES GRID */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-black text-slate-900 tracking-tight">Recruiter Operations Modules</h2>
          <span className="text-xs text-slate-500 font-medium">Click module to manage workflow</span>
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
                className="card-clean-hover p-5 rounded-2xl cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className={`w-10 h-10 rounded-xl border flex items-center justify-center ${mod.color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-mono font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded">
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

      {/* RECENT SCREENING TABLE WITH AVATARS & SCORE DISTRIBUTION GRAPH */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Candidate Leaderboard Table with Stylish Monogram Avatars */}
        <motion.div
          variants={itemVariants}
          className="lg:col-span-8 bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-black text-slate-900">Screened Candidate Leaderboard</h3>
              <p className="text-xs text-slate-500">Ranked by semantic keyword and cosine match</p>
            </div>
            <button
              onClick={() => onNavigate('Bulk Resume Screening')}
              className="text-xs font-bold text-purple-600 hover:underline flex items-center gap-1"
            >
              <span>View All 212 Candidates</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase text-[10px]">
                  <th className="pb-2.5">Candidate &amp; Profile</th>
                  <th className="pb-2.5">Match Fit</th>
                  <th className="pb-2.5">Status</th>
                  <th className="pb-2.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentScreened.map((cand, idx) => {
                  const initials = cand.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
                  return (
                    <tr key={idx} className="hover:bg-slate-50/70 transition">
                      <td className="py-3.5 font-bold text-slate-900 flex items-center gap-3">
                        {/* Candidate Avatar Monogram Badge with Color Accent */}
                        <div className={`w-8 h-8 rounded-xl border flex items-center justify-center font-bold text-xs shrink-0 ${cand.color} shadow-2xs`}>
                          {initials}
                        </div>
                        <div>
                          <div className="font-extrabold text-slate-950 text-xs">{cand.name}</div>
                          <div className="text-[11px] text-slate-400 font-normal">{cand.role}</div>
                        </div>
                      </td>
                      <td className="py-3.5 font-mono font-bold text-blue-700 text-xs">
                        <span className="bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
                          {cand.match}%
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
        </motion.div>

        {/* Score Distribution Vertical Bar Graph */}
        <motion.div
          variants={itemVariants}
          className="lg:col-span-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4 flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-slate-900">Score Distribution Graph</h3>
              <span className="text-[11px] text-slate-400 font-mono">Cohort N=212</span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">Applicant performance clustering</p>

            <div className="h-44 pt-4 flex items-end justify-between gap-3 border-b border-slate-100 pb-2">
              {[
                { bracket: '0-40', count: 12, height: 20 },
                { bracket: '40-60', count: 35, height: 45 },
                { bracket: '60-80', count: 86, height: 85 },
                { bracket: '80-100', count: 79, height: 80 },
              ].map((col, idx) => (
                <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                  <span className="text-[10px] font-mono text-slate-500 font-bold">{col.count}</span>
                  <div
                    className="w-full bg-purple-600 rounded-t transition-all duration-700 hover:bg-purple-700"
                    style={{ height: `${col.height}%` }}
                    title={`${col.bracket}: ${col.count} candidates`}
                  />
                  <span className="text-[10px] text-slate-600 font-mono font-bold">{col.bracket}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2 pt-2 text-xs border-t border-slate-100">
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Passing Cutoff:</span>
              <span className="font-bold text-slate-900 font-mono">≥ 75% Match</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Qualified in Shortlist:</span>
              <span className="font-bold text-purple-700 font-mono">32 Candidates</span>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};
