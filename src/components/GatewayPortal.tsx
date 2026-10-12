import React from 'react';
import { motion } from 'framer-motion';
import {
  Briefcase,
  Users,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  BarChart3,
  Award,
  Zap,
  TrendingUp,
  ShieldCheck,
  Layers,
} from 'lucide-react';
import { IMAGES } from '../assets/images';

interface GatewayPortalProps {
  username: string;
  onSelectPortal: (portal: 'Job Seeker Workspace' | 'Recruiter Workspace') => void;
}

export const GatewayPortal: React.FC<GatewayPortalProps> = ({ username, onSelectPortal }) => {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between py-10 px-6 sm:px-12 selection:bg-blue-600 selection:text-white">
      <div className="max-w-6xl mx-auto w-full space-y-6">
        {/* Banner with Official Emblem & Session Telemetry */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 sm:p-7 rounded-3xl bg-white border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl overflow-hidden border border-slate-200 bg-slate-900 shrink-0 shadow-xs">
              <img src={IMAGES.logo} alt="Career Lens Emblem" className="w-full h-full object-cover" />
            </div>
            <div>
              <div className="flex items-center gap-2 text-[11px] font-bold text-slate-500 mb-0.5 tracking-wider uppercase">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>SESSION AUTHENTICATED</span>
                <span>·</span>
                <span>WORKSPACE GATEWAY</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
                Welcome to Career Lens, <span className="text-blue-600">{username}</span>
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Select your designated environment. You can freely alternate between candidate and recruiter views anytime via the top navigation bar.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200">
              Dual Workspace Mode
            </span>
          </div>
        </motion.div>

        {/* Rolling Text Telemetry Marquee Banner */}
        <div className="rounded-2xl border border-slate-200 bg-white py-2.5 px-4 overflow-hidden shadow-2xs">
          <div className="animate-marquee whitespace-nowrap flex items-center gap-8 text-xs font-semibold text-slate-600">
            {[
              '🎯 ATS Score Radar',
              '📈 Real-Time Skill Gap Analytics',
              '🏢 Candidate Screening Leaderboard',
              '🎙️ STAR Method Mock Sessions',
              '🗺️ Personalized Career Nodes',
              '⚡ Tokenized Exam Dispatcher',
              '📊 Multi-Axis Telemetry Graphs',
              '💼 Live Market Compensation Bands',
              '🎯 ATS Score Radar',
              '📈 Real-Time Skill Gap Analytics',
              '🏢 Candidate Screening Leaderboard',
              '🎙️ STAR Method Mock Sessions',
            ].map((tag, idx) => (
              <span key={idx} className="flex items-center gap-2">
                <span>{tag}</span>
                <span className="text-slate-300">/</span>
              </span>
            ))}
          </div>
        </div>

        {/* Enhanced Portals Grid with Images, Logos, Rolling Tags & Beautified Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
          {/* Candidate Portal Card */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            whileHover={{ y: -4 }}
            className="rounded-3xl bg-white border border-slate-200 hover:border-blue-400 hover:shadow-lg transition flex flex-col justify-between overflow-hidden shadow-xs group"
          >
            <div>
              {/* Realistic Interface Preview Image Header */}
              <div className="h-44 sm:h-52 bg-slate-100 relative overflow-hidden border-b border-slate-200">
                <img
                  src={IMAGES.careerRoadmap}
                  alt="Candidate Intelligence Preview"
                  className="w-full h-full object-cover group-hover:scale-103 transition duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent" />
                
                {/* Floating Badge & Logo */}
                <div className="absolute top-3.5 left-3.5 flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg overflow-hidden border border-white/80 bg-slate-900 shadow-xs">
                    <img src={IMAGES.logo} alt="Emblem" className="w-full h-full object-cover" />
                  </div>
                  <span className="bg-white/95 backdrop-blur-xs text-[10px] font-bold text-blue-700 px-2.5 py-1 rounded-full border border-blue-200 shadow-xs">
                    FOR JOB SEEKERS &amp; CANDIDATES
                  </span>
                </div>

                <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-white text-xs font-bold">
                  <span>Candidate Career Intelligence</span>
                  <span className="bg-emerald-500 text-white text-[10px] px-2 py-0.5 rounded-full">
                    84% Avg ATS Optimization
                  </span>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-6 sm:p-7 space-y-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center">
                      <Briefcase className="w-4 h-4" />
                    </div>
                    <h2 className="text-xl font-black text-slate-950">Job Seeker Workspace</h2>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Improve your resume with instant ATS feedback, run role-based practice assessments, prepare with mock interviews, and map out your promotion roadmap.
                  </p>
                </div>

                {/* Rolling Modules Tags Strip */}
                <div className="overflow-hidden py-1 border-y border-slate-100">
                  <div className="animate-marquee whitespace-nowrap flex items-center gap-3 text-[11px] font-medium text-slate-500">
                    {['Resume Intelligence', 'Skill Growth', 'Mock Interview', 'Job Match', 'Salary Insights', 'Career Roadmap', 'Resume Intelligence', 'Skill Growth', 'Mock Interview'].map((t, idx) => (
                      <span key={idx} className="bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-md font-semibold">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Feature Checklist with Icons */}
                <div className="space-y-2.5 text-xs text-slate-700">
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                    <span>Circular ring score gauge &amp; line-by-line ATS telemetry</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                    <span>Dimensional skill gap bar graphs with industry benchmarks</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                    <span>Interactive STAR method mock interview scorecard &amp; advice</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                    <span>Salary spectrum percentiles &amp; multi-tier career progression roadmap</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Launch Button */}
            <div className="p-6 sm:p-7 pt-0">
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => onSelectPortal('Job Seeker Workspace')}
                className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition shadow-xs"
              >
                <span>Launch Job Seeker Workspace</span>
                <ArrowRight className="w-4 h-4" />
              </motion.button>
            </div>
          </motion.div>

          {/* Recruiter Portal Card */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            whileHover={{ y: -4 }}
            className="rounded-3xl bg-white border border-slate-200 hover:border-purple-400 hover:shadow-lg transition flex flex-col justify-between overflow-hidden shadow-xs group"
          >
            <div>
              {/* Realistic Interface Preview Image Header */}
              <div className="h-44 sm:h-52 bg-slate-100 relative overflow-hidden border-b border-slate-200">
                <img
                  src={IMAGES.recruiterCenter}
                  alt="Recruiter Command Center Preview"
                  className="w-full h-full object-cover group-hover:scale-103 transition duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent" />
                
                {/* Floating Badge & Logo */}
                <div className="absolute top-3.5 left-3.5 flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg overflow-hidden border border-white/80 bg-slate-900 shadow-xs">
                    <img src={IMAGES.logo} alt="Emblem" className="w-full h-full object-cover" />
                  </div>
                  <span className="bg-white/95 backdrop-blur-xs text-[10px] font-bold text-purple-700 px-2.5 py-1 rounded-full border border-purple-200 shadow-xs">
                    FOR TALENT TEAMS &amp; RECRUITERS
                  </span>
                </div>

                <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-white text-xs font-bold">
                  <span>Talent Command &amp; Pipeline Hub</span>
                  <span className="bg-purple-500 text-white text-[10px] px-2 py-0.5 rounded-full">
                    Cohort Screening Active
                  </span>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-6 sm:p-7 space-y-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-8 h-8 rounded-lg bg-purple-50 border border-purple-200 text-purple-600 flex items-center justify-center">
                      <Users className="w-4 h-4" />
                    </div>
                    <h2 className="text-xl font-black text-slate-950">Recruiter Workspace</h2>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Automate high-volume applicant screening, dispatch secure timed technical assessment tokens, track scoring leaderboards, and coordinate pipeline stages.
                  </p>
                </div>

                {/* Rolling Modules Tags Strip */}
                <div className="overflow-hidden py-1 border-y border-slate-100">
                  <div className="animate-marquee whitespace-nowrap flex items-center gap-3 text-[11px] font-medium text-slate-500">
                    {['Hiring Campaigns', 'Bulk Screening', 'Shortlisted Pool', 'Assessment Tokens', 'Results Vault', 'Pipeline Kanban', 'Hiring Campaigns', 'Bulk Screening'].map((t, idx) => (
                      <span key={idx} className="bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-md font-semibold">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Feature Checklist with Icons */}
                <div className="space-y-2.5 text-xs text-slate-700">
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                    <span>Automated resume screening matrix &amp; match fit sorting</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                    <span>Cohort applicant score distribution &amp; qualification cutoff</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                    <span>Timed assessment dispatch tokens with anti-fraud tracking</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                    <span>Full candidate lifecycle Kanban board from sourced to offered</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Launch Button */}
            <div className="p-6 sm:p-7 pt-0">
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => onSelectPortal('Recruiter Workspace')}
                className="w-full py-3 px-4 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition shadow-xs"
              >
                <span>Launch Recruiter Workspace</span>
                <ArrowRight className="w-4 h-4" />
              </motion.button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Footer Branding */}
      <div className="text-center text-xs text-slate-400 py-6">
        <span>Career Lens Unified Platform · Enterprise Edition</span>
      </div>
    </div>
  );
};
