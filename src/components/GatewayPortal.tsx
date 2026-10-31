import React, { useState, useRef, useEffect } from 'react';
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
  Volume2,
  VolumeX,
} from 'lucide-react';
import { CareerLensLogo } from './CareerLensLogo';

interface GatewayPortalProps {
  username: string;
  onSelectPortal: (portal: 'Job Seeker Workspace' | 'Recruiter Workspace') => void;
}

export const GatewayPortal: React.FC<GatewayPortalProps> = ({ username, onSelectPortal }) => {
  const [hoveredPortal, setHoveredPortal] = useState<'seeker' | 'recruiter' | null>(null);
  const seekerVideoRef = useRef<HTMLVideoElement>(null);
  const recruiterVideoRef = useRef<HTMLVideoElement>(null);
  const [seekerMuted, setSeekerMuted] = useState(true);
  const [recruiterMuted, setRecruiterMuted] = useState(true);

  useEffect(() => {
    if (seekerVideoRef.current) {
      seekerVideoRef.current.playbackRate = 0.85;
      seekerVideoRef.current.play().catch(err => {
        console.warn('Seeker video play note:', err);
      });
    }
    if (recruiterVideoRef.current) {
      recruiterVideoRef.current.playbackRate = 0.85;
      recruiterVideoRef.current.play().catch(err => {
        console.warn('Recruiter video play note:', err);
      });
    }
  }, []);

  const toggleSeekerAudio = () => {
    if (seekerVideoRef.current) {
      seekerVideoRef.current.muted = !seekerMuted;
      setSeekerMuted(!seekerMuted);
    }
  };

  const toggleRecruiterAudio = () => {
    if (recruiterVideoRef.current) {
      recruiterVideoRef.current.muted = !recruiterMuted;
      setRecruiterMuted(!recruiterMuted);
    }
  };

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
              {/* Enhanced Ambient Video Header: Candidate Intelligence */}
              <div className="h-56 sm:h-64 bg-slate-950 relative overflow-hidden select-none group">
                <video
                  ref={seekerVideoRef}
                  autoPlay
                  loop
                  muted={seekerMuted}
                  playsInline
                  className="w-full h-full object-cover scale-[1.02] group-hover:scale-105 transition-transform duration-700 brightness-[1.08] contrast-[1.06]"
                  src="/assets/aistudio/job_seeker_header_video.mp4"
                />

                {/* Ambient Cinematic Gradient Overlays */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/25 to-transparent pointer-events-none" />
                <div className="absolute inset-0 bg-gradient-to-b from-slate-950/75 via-transparent to-transparent pointer-events-none" />
                <div className="absolute bottom-0 right-0 w-48 h-24 bg-gradient-to-tl from-slate-950 to-transparent pointer-events-none" />

                {/* Top Badge & Live Status */}
                <div className="absolute top-3 sm:top-4 inset-x-3 sm:inset-x-4 z-10 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CareerLensLogo size="xs" />
                    <span className="bg-blue-950/80 text-cyan-300 border border-blue-400/30 text-[10px] font-bold px-2.5 py-0.5 rounded-full backdrop-blur-md shadow-xs">
                      CANDIDATE INTELLIGENCE
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleSeekerAudio();
                      }}
                      className="p-1 rounded-lg bg-slate-900/80 border border-slate-700/70 text-slate-300 hover:text-white transition backdrop-blur-md cursor-pointer"
                      title={seekerMuted ? 'Unmute video audio' : 'Mute video audio'}
                    >
                      {seekerMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5 text-cyan-400" />}
                    </button>
                    <div className="flex items-center gap-1.5 text-[10px] text-emerald-400 font-mono bg-slate-950/80 border border-emerald-500/40 px-2 py-0.5 rounded-full backdrop-blur-md">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                      <span>NEURAL MODEL READY</span>
                    </div>
                  </div>
                </div>

                {/* Bottom Glassmorphic Telemetry HUD Overlay */}
                <div className="absolute bottom-3 inset-x-3 sm:inset-x-4 z-10 grid grid-cols-3 gap-2">
                  <div className="bg-slate-900/85 backdrop-blur-md border border-slate-700/60 rounded-xl p-2 sm:p-2.5 text-center shadow-lg">
                    <div className="text-[11px] font-mono font-black text-cyan-300">88% ATS</div>
                    <div className="text-[9px] text-slate-300 font-medium truncate">Precision Radar</div>
                  </div>
                  <div className="bg-slate-900/85 backdrop-blur-md border border-slate-700/60 rounded-xl p-2 sm:p-2.5 text-center shadow-lg">
                    <div className="text-[11px] font-mono font-black text-emerald-400">STAR PREP</div>
                    <div className="text-[9px] text-slate-300 font-medium truncate">Voice Mock AI</div>
                  </div>
                  <div className="bg-slate-900/85 backdrop-blur-md border border-slate-700/60 rounded-xl p-2 sm:p-2.5 text-center shadow-lg">
                    <div className="text-[11px] font-mono font-black text-blue-400">NODE 3/5</div>
                    <div className="text-[9px] text-slate-300 font-medium truncate">Career Elevation</div>
                  </div>
                </div>

                {/* Protective Bottom-Right Insignia Badge ensuring zero watermark residue */}
                <div className="absolute bottom-2 right-2 z-10 flex items-center gap-1.5 px-2 py-1 rounded-md bg-slate-950/90 border border-slate-800 text-[9px] font-bold text-slate-400 backdrop-blur-sm pointer-events-none">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                  <span>CAREER LENS</span>
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
              {/* Enhanced Ambient Video Header: Recruiter Workspace Talent Mesh */}
              <div className="h-56 sm:h-64 bg-slate-950 relative overflow-hidden select-none group">
                <video
                  ref={recruiterVideoRef}
                  autoPlay
                  loop
                  muted={recruiterMuted}
                  playsInline
                  className="w-full h-full object-cover scale-[1.02] group-hover:scale-105 transition-transform duration-700 brightness-[1.08] contrast-[1.06]"
                  src="/assets/aistudio/recruiter_header_video.mp4"
                />

                {/* Ambient Cinematic Gradient Overlays */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/25 to-transparent pointer-events-none" />
                <div className="absolute inset-0 bg-gradient-to-b from-slate-950/75 via-transparent to-transparent pointer-events-none" />
                <div className="absolute bottom-0 right-0 w-48 h-24 bg-gradient-to-tl from-slate-950 to-transparent pointer-events-none" />

                {/* Top Badge & Live Status */}
                <div className="absolute top-3 sm:top-4 inset-x-3 sm:inset-x-4 z-10 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CareerLensLogo size="xs" />
                    <span className="bg-purple-950/80 text-purple-300 border border-purple-400/30 text-[10px] font-bold px-2.5 py-0.5 rounded-full backdrop-blur-md shadow-xs">
                      TALENT &amp; RECRUITING HUB
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleRecruiterAudio();
                      }}
                      className="p-1 rounded-lg bg-slate-900/80 border border-slate-700/70 text-slate-300 hover:text-white transition backdrop-blur-md cursor-pointer"
                      title={recruiterMuted ? 'Unmute video audio' : 'Mute video audio'}
                    >
                      {recruiterMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5 text-purple-400" />}
                    </button>
                    <div className="flex items-center gap-1.5 text-[10px] text-purple-300 font-mono bg-slate-950/80 border border-purple-500/40 px-2 py-0.5 rounded-full backdrop-blur-md">
                      <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-ping" />
                      <span>TALENT MESH ACTIVE</span>
                    </div>
                  </div>
                </div>

                {/* Bottom Glassmorphic Telemetry HUD Overlay */}
                <div className="absolute bottom-3 inset-x-3 sm:inset-x-4 z-10 grid grid-cols-3 gap-2">
                  <div className="bg-slate-900/85 backdrop-blur-md border border-slate-700/60 rounded-xl p-2 sm:p-2.5 text-center shadow-lg">
                    <div className="text-[11px] font-mono font-black text-purple-300">140+ NODES</div>
                    <div className="text-[9px] text-slate-300 font-medium truncate">Applicant Stream</div>
                  </div>
                  <div className="bg-slate-900/85 backdrop-blur-md border border-slate-700/60 rounded-xl p-2 sm:p-2.5 text-center shadow-lg">
                    <div className="text-[11px] font-mono font-black text-cyan-400">12 DISPATCHED</div>
                    <div className="text-[9px] text-slate-300 font-medium truncate">Timed Tokens</div>
                  </div>
                  <div className="bg-slate-900/85 backdrop-blur-md border border-slate-700/60 rounded-xl p-2 sm:p-2.5 text-center shadow-lg">
                    <div className="text-[11px] font-mono font-black text-emerald-400">ANTI-CHEAT</div>
                    <div className="text-[9px] text-slate-300 font-medium truncate">Fraud Guard</div>
                  </div>
                </div>

                {/* Protective Bottom-Right Insignia Badge ensuring zero watermark residue */}
                <div className="absolute bottom-2 right-2 z-10 flex items-center gap-1.5 px-2 py-1 rounded-md bg-slate-950/90 border border-slate-800 text-[9px] font-bold text-slate-400 backdrop-blur-sm pointer-events-none">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                  <span>CAREER LENS</span>
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
