import React, { useState } from 'react';
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
  Activity,
  Compass,
  FileCheck,
  Cpu,
} from 'lucide-react';
import { CareerLensLogo } from './CareerLensLogo';

interface GatewayPortalProps {
  username: string;
  onSelectPortal: (portal: 'Job Seeker Workspace' | 'Recruiter Workspace') => void;
}

export const GatewayPortal: React.FC<GatewayPortalProps> = ({ username, onSelectPortal }) => {
  const [hoveredPortal, setHoveredPortal] = useState<'seeker' | 'recruiter' | null>(null);

  return (
    <div className="min-h-screen bg-slate-50/70 text-slate-900 flex flex-col justify-between py-8 px-4 sm:px-8 lg:px-12 selection:bg-blue-600 selection:text-white relative overflow-hidden">
      {/* Positional Background Engineering Matrix */}
      <div className="absolute inset-0 bg-graph-matrix pointer-events-none opacity-40" />

      <div className="max-w-6xl mx-auto w-full space-y-6 relative z-10">
        {/* Banner with Official Emblem & Session Telemetry */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 sm:p-7 rounded-3xl bg-white/95 backdrop-blur-md border border-slate-200/90 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5"
        >
          <div className="flex items-center gap-4">
            <CareerLensLogo size="lg" />
            <div>
              <div className="flex items-center gap-2 text-[11px] font-bold text-slate-500 mb-0.5 tracking-wider uppercase">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>SESSION AUTHENTICATED</span>
                <span>·</span>
                <span className="text-blue-600 font-bold">WORKSPACE GATEWAY</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
                Welcome to Career Lens, <span className="text-blue-600">{username}</span>
              </h1>
              <p className="text-xs text-slate-500 mt-0.5 font-normal">
                Choose your primary workspace environment below. You can seamlessly switch between candidate intelligence and recruiter talent operations anytime.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs font-bold text-slate-700 bg-slate-100/90 px-3 py-1.5 rounded-xl border border-slate-200 shadow-2xs">
              Dual Workspace Mode
            </span>
          </div>
        </motion.div>

        {/* Rolling Text Telemetry Marquee Banner */}
        <div className="rounded-2xl border border-slate-200/90 bg-white/90 backdrop-blur-sm py-2.5 px-4 overflow-hidden shadow-2xs">
          <div className="animate-marquee whitespace-nowrap flex items-center gap-8 text-xs font-semibold text-slate-600">
            {[
              '🎯 Precision Resume Radar',
              '📈 Interactive Career Node Map',
              '🎙️ Real-Time Voice Mock Sessions',
              '🛡️ Fraud & Scam Link Verification',
              '🏢 Recruiter Screening Leaderboard',
              '⚡ Tokenized Exam Dispatcher',
              '📊 Multi-Axis Telemetry Graphs',
              '💼 Live Market Compensation Bands',
              '🎯 Precision Resume Radar',
              '📈 Interactive Career Node Map',
              '🎙️ Real-Time Voice Mock Sessions',
              '🛡️ Fraud & Scam Link Verification',
            ].map((tag, idx) => (
              <span key={idx} className="flex items-center gap-2">
                <span>{tag}</span>
                <span className="text-slate-300">·</span>
              </span>
            ))}
          </div>
        </div>

        {/* Dynamic Animated Interactive Models Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-1">
          {/* Candidate Portal Card with Animated Interactive Model */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            whileHover={{ y: -4 }}
            onMouseEnter={() => setHoveredPortal('seeker')}
            onMouseLeave={() => setHoveredPortal(null)}
            className="rounded-3xl bg-white border border-slate-200/90 hover:border-blue-400 hover:shadow-xl transition-all duration-300 flex flex-col justify-between overflow-hidden shadow-xs group"
          >
            <div>
              {/* Animated Interactive UI Model Header (Replacing static flat image) */}
              <div className="h-48 sm:h-56 bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 relative overflow-hidden p-4 sm:p-5 flex flex-col justify-between select-none">
                {/* Positional Blueprint Grid Lines */}
                <div className="absolute inset-0 bg-graph-matrix opacity-25" />
                
                {/* Floating Ambient Aura */}
                <div className="absolute -top-12 -right-12 w-48 h-48 bg-blue-500/20 rounded-full blur-2xl pointer-events-none" />
                <div className="absolute -bottom-10 -left-10 w-44 h-44 bg-cyan-500/20 rounded-full blur-xl pointer-events-none" />

                {/* Top Badge & Model Meta */}
                <div className="relative z-10 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CareerLensLogo size="xs" />
                    <span className="bg-blue-500/20 text-cyan-300 border border-blue-400/30 text-[10px] font-bold px-2.5 py-0.5 rounded-full backdrop-blur-md">
                      CANDIDATE INTELLIGENCE
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] text-emerald-400 font-mono bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                    <span>SYSTEM READY</span>
                  </div>
                </div>

                {/* Center Dynamic Animated Graphics Model */}
                <div className="relative z-10 grid grid-cols-3 gap-3 my-auto pt-2">
                  {/* Metric 1: Circular Score Gauge Simulation */}
                  <div className="bg-slate-800/80 backdrop-blur-md border border-slate-700/80 rounded-2xl p-3 flex flex-col items-center justify-center text-center shadow-lg group-hover:border-blue-400/50 transition">
                    <div className="relative w-12 h-12 flex items-center justify-center mb-1">
                      <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                        <circle cx="18" cy="18" r="14" stroke="#334155" strokeWidth="3" fill="none" />
                        <circle
                          cx="18"
                          cy="18"
                          r="14"
                          stroke="#3B82F6"
                          strokeWidth="3"
                          strokeDasharray="88 100"
                          strokeLinecap="round"
                          fill="none"
                        />
                      </svg>
                      <span className="absolute text-xs font-black font-mono text-white">88%</span>
                    </div>
                    <span className="text-[10px] text-slate-300 font-semibold">ATS Match Score</span>
                  </div>

                  {/* Metric 2: Live Animated Voice Wave Preview */}
                  <div className="bg-slate-800/80 backdrop-blur-md border border-slate-700/80 rounded-2xl p-3 flex flex-col justify-between shadow-lg group-hover:border-blue-400/50 transition">
                    <div className="flex items-center justify-between text-[10px] text-cyan-300 font-bold">
                      <span>VOICE MOCK</span>
                      <Activity className="w-3 h-3 text-cyan-400 animate-pulse" />
                    </div>
                    <div className="flex items-center justify-center gap-1 h-8">
                      {[40, 75, 95, 60, 85, 45, 90, 65, 35].map((h, i) => (
                        <div
                          key={i}
                          className="w-1 bg-gradient-to-t from-blue-500 to-cyan-300 rounded-full animate-pulse"
                          style={{
                            height: `${h}%`,
                            animationDelay: `${i * 120}ms`,
                            animationDuration: '1.2s',
                          }}
                        />
                      ))}
                    </div>
                    <span className="text-[10px] text-slate-300 font-semibold text-center">Speech Analysis</span>
                  </div>

                  {/* Metric 3: Interactive Visual Roadmap Node */}
                  <div className="bg-slate-800/80 backdrop-blur-md border border-slate-700/80 rounded-2xl p-3 flex flex-col justify-between shadow-lg group-hover:border-blue-400/50 transition">
                    <div className="flex items-center justify-between text-[10px] text-emerald-300 font-bold">
                      <span>ROADMAP</span>
                      <Compass className="w-3 h-3 text-emerald-400" />
                    </div>
                    <div className="flex items-center justify-around py-1">
                      <div className="w-3.5 h-3.5 rounded-full bg-emerald-500 flex items-center justify-center text-[8px] text-white font-bold">✓</div>
                      <div className="h-0.5 w-4 bg-emerald-500" />
                      <div className="w-4 h-4 rounded-full bg-blue-500 border-2 border-white animate-pulse" />
                      <div className="h-0.5 w-4 bg-slate-600" />
                      <div className="w-3 h-3 rounded-full bg-slate-600" />
                    </div>
                    <span className="text-[10px] text-slate-300 font-semibold text-center">Milestone 3 of 5</span>
                  </div>
                </div>

                {/* Bottom Model Ticker */}
                <div className="relative z-10 flex items-center justify-between text-xs text-slate-300 font-medium pt-1 border-t border-slate-800/80">
                  <span className="text-white font-bold text-[11px]">Real-Time Skill &amp; Resume Intelligence</span>
                  <span className="text-cyan-400 text-[11px] font-mono font-bold">+18 Core Competencies</span>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-6 sm:p-7 space-y-4">
                <div>
                  <div className="flex items-center gap-2.5 mb-1.5">
                    <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center shadow-2xs">
                      <Briefcase className="w-4 h-4" />
                    </div>
                    <div>
                      <h2 className="text-xl font-black text-slate-950 tracking-tight">Job Seeker Workspace</h2>
                      <p className="text-[11px] font-medium text-blue-600">Candidate Career Elevation Hub</p>
                    </div>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed font-normal">
                    Audit resumes with instant scoring, practice simulated AI voice mock interviews, detect scam job links, and progress along an interactive visual roadmap.
                  </p>
                </div>

                {/* Rolling Modules Tags Strip */}
                <div className="overflow-hidden py-1 border-y border-slate-100">
                  <div className="animate-marquee whitespace-nowrap flex items-center gap-2.5 text-[11px] font-medium text-slate-600">
                    {['Resume Intelligence', 'Voice Mock Interview', 'Visual Journey Roadmap', 'Job Scam Link Audit', 'Salary Intelligence', 'Resume Builder', 'Resume Intelligence', 'Voice Mock Interview'].map((t, idx) => (
                      <span key={idx} className="bg-slate-100/90 text-slate-700 px-2.5 py-0.5 rounded-md font-semibold text-[10px]">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Feature Checklist */}
                <div className="space-y-2 text-xs text-slate-700 font-medium">
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                    <span>Circular ring score gauge &amp; line-by-line ATS resume telemetry</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                    <span>Real-time voice speech mock interview with STAR method scoring</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                    <span>Interactive visual metro roadmap with career altitude elevation graphs</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                    <span>Fraud &amp; scam detector: paste description and link for instant safety verdict</span>
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
                className="w-full py-3.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition shadow-xs"
              >
                <span>Launch Job Seeker Workspace</span>
                <ArrowRight className="w-4 h-4" />
              </motion.button>
            </div>
          </motion.div>

          {/* Recruiter Portal Card with Animated Interactive Model */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            whileHover={{ y: -4 }}
            onMouseEnter={() => setHoveredPortal('recruiter')}
            onMouseLeave={() => setHoveredPortal(null)}
            className="rounded-3xl bg-white border border-slate-200/90 hover:border-purple-400 hover:shadow-xl transition-all duration-300 flex flex-col justify-between overflow-hidden shadow-xs group"
          >
            <div>
              {/* Animated Interactive UI Model Header (Replacing static flat image) */}
              <div className="h-48 sm:h-56 bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 relative overflow-hidden p-4 sm:p-5 flex flex-col justify-between select-none">
                {/* Positional Blueprint Grid Lines */}
                <div className="absolute inset-0 bg-graph-matrix opacity-25" />
                
                {/* Floating Ambient Aura */}
                <div className="absolute -top-12 -right-12 w-48 h-48 bg-purple-500/20 rounded-full blur-2xl pointer-events-none" />
                <div className="absolute -bottom-10 -left-10 w-44 h-44 bg-indigo-500/20 rounded-full blur-xl pointer-events-none" />

                {/* Top Badge & Model Meta */}
                <div className="relative z-10 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CareerLensLogo size="xs" />
                    <span className="bg-purple-500/20 text-purple-300 border border-purple-400/30 text-[10px] font-bold px-2.5 py-0.5 rounded-full backdrop-blur-md">
                      TALENT &amp; RECRUITING HUB
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] text-purple-300 font-mono bg-purple-950/60 border border-purple-500/30 px-2 py-0.5 rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-ping" />
                    <span>COHORT PIPELINE ACTIVE</span>
                  </div>
                </div>

                {/* Center Dynamic Animated Graphics Model */}
                <div className="relative z-10 grid grid-cols-3 gap-3 my-auto pt-2">
                  {/* Column 1: Live Candidate Triage Stream */}
                  <div className="bg-slate-800/80 backdrop-blur-md border border-slate-700/80 rounded-2xl p-3 flex flex-col justify-between shadow-lg group-hover:border-purple-400/50 transition">
                    <div className="flex items-center justify-between text-[10px] text-purple-300 font-bold">
                      <span>TRIAGE STREAM</span>
                      <Users className="w-3 h-3 text-purple-400" />
                    </div>
                    <div className="space-y-1.5 py-1">
                      {[
                        { name: 'Alex M.', fit: 94, color: 'bg-emerald-400' },
                        { name: 'Elena R.', fit: 91, color: 'bg-blue-400' },
                        { name: 'Jordan S.', fit: 86, color: 'bg-purple-400' },
                      ].map((cand, i) => (
                        <div key={i} className="flex items-center justify-between text-[9px] text-slate-300">
                          <span className="font-semibold">{cand.name}</span>
                          <span className="font-mono text-white font-bold">{cand.fit}%</span>
                        </div>
                      ))}
                    </div>
                    <span className="text-[10px] text-slate-300 font-semibold text-center">Top Candidates</span>
                  </div>

                  {/* Column 2: Assessment Token Generator Dispenser */}
                  <div className="bg-slate-800/80 backdrop-blur-md border border-slate-700/80 rounded-2xl p-3 flex flex-col justify-between shadow-lg group-hover:border-purple-400/50 transition">
                    <div className="flex items-center justify-between text-[10px] text-cyan-300 font-bold">
                      <span>TOKEN VAULT</span>
                      <Cpu className="w-3 h-3 text-cyan-400 animate-pulse" />
                    </div>
                    <div className="text-center py-1">
                      <div className="font-mono font-black text-lg text-white">12 ACTIVE</div>
                      <div className="text-[9px] text-emerald-400 font-medium">Secured Tokens</div>
                    </div>
                    <span className="text-[10px] text-slate-300 font-semibold text-center">Timed Screening</span>
                  </div>

                  {/* Column 3: Pipeline Kanban Stage Distribution */}
                  <div className="bg-slate-800/80 backdrop-blur-md border border-slate-700/80 rounded-2xl p-3 flex flex-col justify-between shadow-lg group-hover:border-purple-400/50 transition">
                    <div className="flex items-center justify-between text-[10px] text-amber-300 font-bold">
                      <span>PIPELINE</span>
                      <BarChart3 className="w-3 h-3 text-amber-400" />
                    </div>
                    <div className="flex items-end justify-between h-8 px-1">
                      <div className="w-2.5 bg-blue-500/80 rounded-t h-[70%]" title="Screened" />
                      <div className="w-2.5 bg-purple-500/80 rounded-t h-[50%]" title="Shortlisted" />
                      <div className="w-2.5 bg-emerald-500/80 rounded-t h-[85%]" title="Assessed" />
                      <div className="w-2.5 bg-amber-500/80 rounded-t h-[40%]" title="Interview" />
                    </div>
                    <span className="text-[10px] text-slate-300 font-semibold text-center">4 Funnel Stages</span>
                  </div>
                </div>

                {/* Bottom Model Ticker */}
                <div className="relative z-10 flex items-center justify-between text-xs text-slate-300 font-medium pt-1 border-t border-slate-800/80">
                  <span className="text-white font-bold text-[11px]">Command Center &amp; Cohort Screening</span>
                  <span className="text-purple-300 text-[11px] font-mono font-bold">Anti-Cheat Enabled</span>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-6 sm:p-7 space-y-4">
                <div>
                  <div className="flex items-center gap-2.5 mb-1.5">
                    <div className="w-9 h-9 rounded-xl bg-purple-50 border border-purple-200 text-purple-600 flex items-center justify-center shadow-2xs">
                      <Users className="w-4 h-4" />
                    </div>
                    <div>
                      <h2 className="text-xl font-black text-slate-950 tracking-tight">Recruiter Workspace</h2>
                      <p className="text-[11px] font-medium text-purple-600">Talent Acquisition &amp; Pipeline Command</p>
                    </div>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed font-normal">
                    Automate high-volume applicant screening, dispatch secure timed technical assessment tokens, track scoring leaderboards, and coordinate pipeline stages.
                  </p>
                </div>

                {/* Rolling Modules Tags Strip */}
                <div className="overflow-hidden py-1 border-y border-slate-100">
                  <div className="animate-marquee whitespace-nowrap flex items-center gap-2.5 text-[11px] font-medium text-slate-600">
                    {['Hiring Campaigns', 'Bulk Screening', 'Shortlisted Pool', 'Assessment Tokens', 'Results Vault', 'Pipeline Kanban', 'Hiring Campaigns', 'Bulk Screening'].map((t, idx) => (
                      <span key={idx} className="bg-slate-100/90 text-slate-700 px-2.5 py-0.5 rounded-md font-semibold text-[10px]">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Feature Checklist */}
                <div className="space-y-2 text-xs text-slate-700 font-medium">
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
                className="w-full py-3.5 px-4 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition shadow-xs"
              >
                <span>Launch Recruiter Workspace</span>
                <ArrowRight className="w-4 h-4" />
              </motion.button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Footer Branding strictly Career Lens */}
      <div className="text-center text-xs text-slate-500 py-6 font-medium relative z-10 flex items-center justify-center gap-2">
        <CareerLensLogo size="xs" />
        <span>Career Lens · Precision Career &amp; Recruiter Talent Intelligence</span>
      </div>
    </div>
  );
};
