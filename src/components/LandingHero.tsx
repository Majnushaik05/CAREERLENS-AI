import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight,
  BarChart3,
  Award,
  FileText,
  Check,
  Route,
  Target,
  Users,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Activity,
  ShieldCheck,
  Zap,
  Sparkles,
  Lock,
  Mail,
  User,
  X,
  Sun,
} from 'lucide-react';
import { IMAGES } from '../assets/images';
import { CareerLensLogo } from './CareerLensLogo';

interface LandingHeroProps {
  onLogin: (name: string) => void;
  onExploreGuest: () => void;
}

export const LandingHero: React.FC<LandingHeroProps> = ({ onLogin, onExploreGuest }) => {
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authTab, setAuthTab] = useState<'signin' | 'register'>('signin');
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');

  // Video background controls
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isVideoPlaying, setIsVideoPlaying] = useState(true);
  const [isVideoMuted, setIsVideoMuted] = useState(true);
  const [isLuminous, setIsLuminous] = useState(true);

  // Dynamic rolling text terms for Hero
  const rollingWords = [
    'Resume Scoring & Audit',
    'Career Roadmaps',
    'Mock Interview Prep',
    'Candidate Intelligence',
    'Real-time Job Matching',
  ];
  const [currentWordIndex, setCurrentWordIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentWordIndex(prev => (prev + 1) % rollingWords.length);
    }, 2800);
    return () => clearInterval(interval);
  }, [rollingWords.length]);

  // Attempt autoPlay gracefully
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch(err => {
        console.warn('Autoplay prevented or waiting for interaction:', err);
      });
    }
  }, []);

  const toggleVideoPlayback = () => {
    if (!videoRef.current) return;
    if (isVideoPlaying) {
      videoRef.current.pause();
      setIsVideoPlaying(false);
    } else {
      videoRef.current.play().catch(console.warn);
      setIsVideoPlaying(true);
    }
  };

  const toggleVideoMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !videoRef.current.muted;
    setIsVideoMuted(videoRef.current.muted);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (authTab === 'register') {
      const name = fullName.trim() || username.trim() || 'Candidate';
      onLogin(name);
    } else {
      const name = username.trim() ? username.split('@')[0] : 'Professional';
      onLogin(name);
    }
    setAuthModalOpen(false);
  };

  return (
    <div className="min-h-screen text-slate-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white relative overflow-x-hidden">
      {/* 
        FULL-SCREEN BACKGROUND VIDEO LAYER
        Fills the overall screen edge-to-edge (fixed, 100vw, 100vh, object-cover)
        Features calibrated scale and luminosity boost for vivid modern workplace ambience.
      */}
      <div className="fixed inset-0 w-screen h-screen -z-30 overflow-hidden pointer-events-none select-none bg-slate-950">
        <video
          ref={videoRef}
          autoPlay
          loop
          muted
          playsInline
          className={`w-full h-full object-cover scale-[1.08] transition-all duration-700 ${
            isLuminous ? 'brightness-[1.20] contrast-[1.07] saturate-[1.12]' : 'brightness-[1.10] contrast-[1.03]'
          }`}
          src="/assets/aistudio/careerlens_slow_15s_no_logo_e121e1ef.mp4"
        />

        {/* Corner Watermark Masking Vignettes - Guarantees zero watermark visibility */}
        <div className="absolute bottom-0 right-0 w-[460px] h-52 bg-gradient-to-tl from-slate-950 via-slate-950/95 to-transparent pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-36 bg-gradient-to-tr from-slate-950 via-slate-950/80 to-transparent pointer-events-none" />
        <div className="absolute top-0 right-0 w-64 h-24 bg-gradient-to-bl from-slate-950/70 to-transparent pointer-events-none" />

        {/* Dedicated Career Lens Optical Core Insignia Shield permanently masking video corner */}
        <div className="absolute bottom-4 right-4 z-10 flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-slate-950/95 border border-slate-800 shadow-[0_4px_28px_rgba(0,0,0,0.95)] backdrop-blur-md">
          <div className="w-5 h-5 rounded-lg bg-blue-600 flex items-center justify-center p-0.5 shadow-xs">
            <div className="w-2.5 h-2.5 rounded-full border border-white flex items-center justify-center">
              <div className="w-1 h-1 rounded-full bg-white" />
            </div>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-white tracking-wider uppercase leading-none">CAREER LENS</span>
            <span className="text-[8.5px] font-semibold text-blue-400 tracking-wider leading-tight">OPTICAL TELEMETRY</span>
          </div>
        </div>
      </div>

      {/* 
        MULTI-STAGE CINEMATIC GLASS OVERLAY
        Softened scrim allows rich natural daylight, modern monitors, and warm Scandinavian timber to shine through clearly.
      */}
      {/* Directional scrim: softened in center to make background video noticeably brighter */}
      <div className="fixed inset-0 -z-20 bg-gradient-to-b from-slate-950/60 via-slate-950/20 to-slate-950/65 pointer-events-none" />
      
      {/* Subtle radial electric blue ambient illumination matching Career Lens branding */}
      <div className="fixed inset-0 -z-20 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(37,99,235,0.18),transparent)] pointer-events-none" />

      {/* Subtle architectural coordinate grid for precision feel */}
      <div className="fixed inset-0 -z-20 bg-[linear-gradient(to_right,rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[size:48px_48px] pointer-events-none" />

      {/* TOP NAVIGATION BAR */}
      <header className="sticky top-0 z-40 bg-slate-950/70 backdrop-blur-xl border-b border-white/10 px-6 sm:px-12 py-3.5 transition-all">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-6">
          {/* Logo with Black & Electric Blue Optical Lens Emblem */}
          <div className="flex items-center gap-2.5 shrink-0">
            <CareerLensLogo size="sm" showText={true} textClassName="text-white" />
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-xs font-semibold text-slate-300">
            <a href="#home" className="hover:text-white hover:text-blue-400 transition-colors">Home</a>
            <a href="#features" className="hover:text-white hover:text-blue-400 transition-colors">Workspace Features</a>
            <a href="#about" className="hover:text-white hover:text-blue-400 transition-colors">About</a>
          </nav>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => {
                setAuthTab('signin');
                setAuthModalOpen(true);
              }}
              className="text-xs font-bold text-slate-300 hover:text-white px-3 py-2 transition hidden sm:inline-block"
            >
              Sign In
            </button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onExploreGuest}
              className="px-5 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-xl transition shadow-lg shadow-blue-600/30 border border-blue-400/30 flex items-center gap-2"
            >
              <span>Get Started</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </motion.button>
          </div>
        </div>
      </header>

      {/* CONTINUOUS ROLLING TICKER STRIP */}
      <div className="border-b border-white/10 bg-slate-950/50 backdrop-blur-md py-2 overflow-hidden relative z-10">
        <div className="animate-marquee whitespace-nowrap flex items-center gap-8 text-[11px] font-semibold text-slate-300">
          {[
            '⚡ 94+ Score Radar',
            '📊 Real-Time Skill Gap Analysis',
            '🎯 Role-Based Assessment Tokens',
            '🎙️ STAR Method Mock Interviews',
            '📈 Live Salary Market Bands',
            '🏢 Sourced Applicant Shortlisting',
            '🔒 Credential Verification & Vault',
            '🗺️ Personalized Career Roadmap Nodes',
            '⚡ 94+ Score Radar',
            '📊 Real-Time Skill Gap Analysis',
            '🎯 Role-Based Assessment Tokens',
            '🎙️ STAR Method Mock Interviews',
            '📈 Live Salary Market Bands',
            '🏢 Sourced Applicant Shortlisting',
          ].map((item, idx) => (
            <span key={idx} className="flex items-center gap-2">
              <span className="text-slate-200">{item}</span>
              <span className="text-blue-500/50">/</span>
            </span>
          ))}
        </div>
      </div>

      {/* HERO SECTION MATCHED TO MODERN TECH WORKPLACE VIDEO */}
      <section id="home" className="pt-14 pb-20 px-6 sm:px-12 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Content Column */}
            <div className="lg:col-span-6 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/15 border border-blue-400/30 text-xs font-bold text-blue-300 backdrop-blur-md">
                <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                <span>Smart Career &amp; Recruiter Intelligence</span>
              </div>

              {/* Dynamic Headline with Rolling Text */}
              <div className="space-y-2">
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.12]">
                  Your Career Journey,{' '}
                  <span className="text-slate-200 block">Smarter with</span>
                </h1>
                
                {/* Rolling Text Animated Display in Electric Blue */}
                <div className="h-14 sm:h-16 overflow-hidden flex items-center">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={currentWordIndex}
                      initial={{ opacity: 0, y: 25 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -25 }}
                      transition={{ duration: 0.4, ease: 'easeOut' }}
                      className="text-3xl sm:text-4xl lg:text-5xl font-black text-blue-400 drop-shadow-[0_0_24px_rgba(59,130,246,0.6)] tracking-tight"
                    >
                      {rollingWords[currentWordIndex]}
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>

              <p className="text-sm sm:text-base text-slate-200 leading-relaxed max-w-xl font-normal drop-shadow-sm">
                Evaluate resumes with precision scoring, benchmark in-demand skills, practice structured mock interviews, detect scam job links, and access recruiter talent screening.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 pt-2">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onExploreGuest}
                  className="px-7 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-xl shadow-blue-600/40 border border-blue-400/30 transition flex items-center justify-center gap-2 group"
                >
                  <span>Launch Career Lens</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setAuthTab('signin');
                    setAuthModalOpen(true);
                  }}
                  className="px-6 py-3.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/20 text-white font-bold text-xs backdrop-blur-md transition flex items-center justify-center gap-2"
                >
                  <span>Sign In to Account</span>
                </motion.button>
              </div>

              {/* Trust Checkmarks */}
              <div className="flex flex-wrap items-center gap-5 text-xs text-slate-300 pt-2 font-medium">
                <div className="flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>Real-time graph metrics</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>Dual candidate &amp; recruiter workflows</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>Scam link verification</span>
                </div>
              </div>
            </div>

            {/* Right Column: Glassmorphic Interactive System & Graph Mockup */}
            <div className="lg:col-span-6">
              <motion.div
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="rounded-3xl p-6 bg-slate-900/80 backdrop-blur-2xl border border-white/15 shadow-2xl space-y-4"
              >
                {/* Mock Window Top Bar */}
                <div className="flex items-center justify-between pb-3 border-b border-white/10">
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-rose-500/80" />
                    <span className="w-3 h-3 rounded-full bg-amber-500/80" />
                    <span className="w-3 h-3 rounded-full bg-emerald-500/80" />
                  </div>
                  <div className="text-xs font-bold text-slate-300 font-mono flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>careerlens.app / live-telemetry</span>
                  </div>
                  <div className="w-12" />
                </div>

                {/* Simulated Realistic UI Component Inside Card */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Left sub-box: Resume Analysis Card */}
                  <div className="bg-slate-950/70 p-4.5 rounded-2xl border border-white/10 shadow-lg space-y-3 backdrop-blur-md">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white">Your Resume Score</span>
                      <span className="text-[10px] font-bold text-emerald-300 bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-500/30">
                        Top 15%
                      </span>
                    </div>

                    <div className="flex items-center justify-center py-2">
                      <div className="relative w-20 h-20 flex items-center justify-center">
                        <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 36 36">
                          <defs>
                            <linearGradient id="scoreBlueGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                              <stop offset="0%" stopColor="#3B82F6" />
                              <stop offset="100%" stopColor="#60A5FA" />
                            </linearGradient>
                          </defs>
                          <circle
                            cx="18"
                            cy="18"
                            r="15.9155"
                            className="text-slate-800"
                            strokeWidth="3.5"
                            stroke="currentColor"
                            fill="none"
                          />
                          <circle
                            cx="18"
                            cy="18"
                            r="15.9155"
                            stroke="url(#scoreBlueGrad)"
                            strokeDasharray="84, 100"
                            strokeWidth="3.5"
                            strokeLinecap="round"
                            fill="none"
                          />
                        </svg>
                        <span className="absolute text-sm font-mono font-black text-blue-400">84%</span>
                      </div>
                    </div>

                    <div className="space-y-1.5 text-[11px] text-slate-300">
                      <div className="flex items-center gap-1.5 text-emerald-400 font-medium">
                        <span>✓</span> <span>High action-verb quantification</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-emerald-400 font-medium">
                        <span>✓</span> <span>Verified technical competencies</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-amber-300 font-medium">
                        <span>•</span> <span>3 target keywords missing</span>
                      </div>
                    </div>
                  </div>

                  {/* Right sub-box: Top Skill Matches Bar Graph */}
                  <div className="bg-slate-950/70 p-4.5 rounded-2xl border border-white/10 shadow-lg space-y-2.5 backdrop-blur-md">
                    <span className="text-xs font-bold text-white">Top Skill Matches</span>
                    <div className="space-y-2 pt-1">
                      {[
                        { skill: 'Distributed Systems', pct: 92 },
                        { skill: 'React & TypeScript', pct: 88 },
                        { skill: 'API Architecture', pct: 81 },
                        { skill: 'Performance Tuning', pct: 76 },
                      ].map((item, idx) => (
                        <div key={idx} className="space-y-0.5">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="text-slate-300 font-medium">{item.skill}</span>
                            <span className="font-mono font-bold text-blue-300">{item.pct}%</span>
                          </div>
                          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-blue-600 to-cyan-400 rounded-full"
                              style={{ width: `${item.pct}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-slate-950/70 rounded-xl border border-white/10 text-xs text-slate-300 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="font-semibold text-white">Full Stack &amp; Systems Cohorts Active</span>
                  </div>
                  <button
                    onClick={onExploreGuest}
                    className="text-blue-400 font-bold hover:text-blue-300 flex items-center gap-1 transition"
                  >
                    <span>Enter Live</span>
                    <span>→</span>
                  </button>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>


      {/* 6 COLORFUL MODULE ICONS ROW (Glassmorphic cards) */}
      <section id="features" className="py-16 bg-slate-950/60 backdrop-blur-xl px-6 sm:px-12 relative z-10">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-[11px] font-bold text-blue-400 uppercase tracking-wider">WORKSPACE HIGHLIGHTS</span>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Powerful Modules for Candidates &amp; Recruiters
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              Each module is engineered to give actionable telemetry and clear score breakdowns.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="bg-slate-900/70 backdrop-blur-xl p-5 rounded-2xl border border-white/10 shadow-lg text-center space-y-2 hover:border-blue-500/50 hover:bg-slate-900/90 hover:shadow-[0_0_25px_rgba(37,99,235,0.2)] transition-all duration-300">
              <div className="w-10 h-10 rounded-xl bg-blue-950/70 border border-blue-500/30 text-blue-400 flex items-center justify-center mx-auto shadow-inner">
                <FileText className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-xs text-white">Resume Intelligence</h3>
              <p className="text-[11px] text-slate-400 leading-tight">Instant resume feedback &amp; circular ring scoring</p>
            </div>

            <div className="bg-slate-900/70 backdrop-blur-xl p-5 rounded-2xl border border-white/10 shadow-lg text-center space-y-2 hover:border-purple-500/50 hover:bg-slate-900/90 hover:shadow-[0_0_25px_rgba(168,85,247,0.2)] transition-all duration-300">
              <div className="w-10 h-10 rounded-xl bg-purple-950/70 border border-purple-500/30 text-purple-400 flex items-center justify-center mx-auto shadow-inner">
                <Route className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-xs text-white">Career Roadmap</h3>
              <p className="text-[11px] text-slate-400 leading-tight">Milestone progression graph &amp; path nodes</p>
            </div>

            <div className="bg-slate-900/70 backdrop-blur-xl p-5 rounded-2xl border border-white/10 shadow-lg text-center space-y-2 hover:border-emerald-500/50 hover:bg-slate-900/90 hover:shadow-[0_0_25px_rgba(16,185,129,0.2)] transition-all duration-300">
              <div className="w-10 h-10 rounded-xl bg-emerald-950/70 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto shadow-inner">
                <BarChart3 className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-xs text-white">Skill Growth</h3>
              <p className="text-[11px] text-slate-400 leading-tight">In-demand skill gaps with dimensional graphs</p>
            </div>

            <div className="bg-slate-900/70 backdrop-blur-xl p-5 rounded-2xl border border-white/10 shadow-lg text-center space-y-2 hover:border-indigo-500/50 hover:bg-slate-900/90 hover:shadow-[0_0_25px_rgba(99,102,241,0.2)] transition-all duration-300">
              <div className="w-10 h-10 rounded-xl bg-indigo-950/70 border border-indigo-500/30 text-indigo-400 flex items-center justify-center mx-auto shadow-inner">
                <Award className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-xs text-white">Assessments</h3>
              <p className="text-[11px] text-slate-400 leading-tight">Timed technical test tokens &amp; results vault</p>
            </div>

            <div className="bg-slate-900/70 backdrop-blur-xl p-5 rounded-2xl border border-white/10 shadow-lg text-center space-y-2 hover:border-amber-500/50 hover:bg-slate-900/90 hover:shadow-[0_0_25px_rgba(245,158,11,0.2)] transition-all duration-300">
              <div className="w-10 h-10 rounded-xl bg-amber-950/70 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto shadow-inner">
                <Target className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-xs text-white">Job Match</h3>
              <p className="text-[11px] text-slate-400 leading-tight">Vector cosine similarity &amp; keyword overlap</p>
            </div>

            <div className="bg-slate-900/70 backdrop-blur-xl p-5 rounded-2xl border border-white/10 shadow-lg text-center space-y-2 hover:border-rose-500/50 hover:bg-slate-900/90 hover:shadow-[0_0_25px_rgba(244,63,94,0.2)] transition-all duration-300">
              <div className="w-10 h-10 rounded-xl bg-rose-950/70 border border-rose-500/30 text-rose-400 flex items-center justify-center mx-auto shadow-inner">
                <Users className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-xs text-white">Recruiter Tools</h3>
              <p className="text-[11px] text-slate-400 leading-tight">Screening, tokens, pipelines &amp; shortlists</p>
            </div>
          </div>
        </div>
      </section>

      {/* CAREER LENS LIVE ATMOSPHERE CONTROLLER & WATERMARK SHIELD */}
      <div className="fixed bottom-4 right-4 z-40 flex items-center gap-2.5 bg-slate-950/95 backdrop-blur-2xl border border-blue-500/30 px-3.5 py-2 rounded-2xl shadow-[0_10px_35px_rgba(0,0,0,0.9)] transition-all">
        {/* Optical Emblem & System Status */}
        <div className="flex items-center gap-2.5 pr-2.5 border-r border-white/15">
          <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-slate-900 to-blue-900 border border-blue-500/40 flex items-center justify-center shrink-0 shadow-xs">
            <div className="w-3 h-3 rounded-full border border-blue-400 flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
            </div>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="relative flex h-2 w-2">
                {isVideoPlaying && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />}
                <span className={`relative inline-flex rounded-full h-2 w-2 ${isVideoPlaying ? 'bg-emerald-500' : 'bg-slate-500'}`} />
              </span>
              <span className="text-[11px] font-bold text-white tracking-wide">
                {isVideoPlaying ? 'Live Atmosphere' : 'Atmosphere Paused'}
              </span>
            </div>
            <span className="text-[9px] font-mono text-blue-400 hidden sm:inline leading-none mt-0.5">
              Career Lens Studio
            </span>
          </div>
        </div>

        {/* Ambient Video Brightness Boost Toggle */}
        <button
          onClick={() => setIsLuminous(!isLuminous)}
          aria-label={isLuminous ? 'Switch to Standard Brightness' : 'Boost Background Brightness'}
          className={`p-1.5 rounded-xl transition ${
            isLuminous
              ? 'bg-blue-600/30 text-blue-300 border border-blue-400/40 shadow-xs'
              : 'hover:bg-white/10 text-slate-400 hover:text-white'
          }`}
          title={isLuminous ? 'Switch to Standard Brightness' : 'Boost Background Brightness'}
        >
          <Sun className="w-3.5 h-3.5" />
        </button>

        {/* Video Play / Pause Toggle */}
        <button
          onClick={toggleVideoPlayback}
          aria-label={isVideoPlaying ? 'Pause live atmosphere' : 'Play live atmosphere'}
          className="p-1.5 rounded-xl hover:bg-white/10 text-slate-300 hover:text-white transition"
          title={isVideoPlaying ? 'Pause Live Background' : 'Play Live Background'}
        >
          {isVideoPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
        </button>

        {/* Audio Mute / Unmute Toggle */}
        <button
          onClick={toggleVideoMute}
          aria-label={isVideoMuted ? 'Unmute atmosphere audio' : 'Mute atmosphere audio'}
          className="p-1.5 rounded-xl hover:bg-white/10 text-slate-300 hover:text-white transition"
          title={isVideoMuted ? 'Unmute Audio' : 'Mute Audio'}
        >
          {isVideoMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* FOOTER */}
      <footer className="border-t border-white/10 bg-slate-950/90 backdrop-blur-xl py-8 px-6 sm:px-12 text-xs text-slate-400 mt-auto relative z-10">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <CareerLensLogo size="xs" showText={true} textClassName="text-white" />
            <span className="text-white/20">·</span>
            <span className="text-slate-400">Smart Career &amp; Recruiter Intelligence</span>
          </div>
          <div className="flex items-center gap-6 text-slate-300">
            <button onClick={onExploreGuest} className="hover:text-white transition">Candidate Workspace</button>
            <button onClick={onExploreGuest} className="hover:text-white transition">Recruiter Workspace</button>
            <button onClick={() => { setAuthTab('signin'); setAuthModalOpen(true); }} className="hover:text-white transition">Sign In</button>
          </div>
        </div>
      </footer>

      {/* AUTH MODAL */}
      {authModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md p-6 sm:p-7 rounded-2xl bg-slate-900 border border-white/15 shadow-2xl relative text-white backdrop-blur-2xl"
          >
            <button
              onClick={() => setAuthModalOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white text-base font-bold p-1 transition"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="text-center space-y-1 mb-5">
              <CareerLensLogo size="md" className="justify-center mx-auto" textClassName="text-white" />
              <h2 className="text-lg font-black text-white pt-2">
                {authTab === 'signin' ? 'Sign In to Career Lens' : 'Create Your Account'}
              </h2>
              <p className="text-xs text-slate-400">
                Choose how you want to continue
              </p>
            </div>

            {/* Guest Action Button with Official Emblem Logo */}
            <button
              onClick={() => {
                onExploreGuest();
                setAuthModalOpen(false);
              }}
              className="w-full py-2.5 px-4 rounded-xl border border-white/15 hover:bg-white/10 text-white font-bold text-xs flex items-center justify-center gap-2 mb-4 transition"
            >
              <CareerLensLogo size="xs" textClassName="text-white" />
              <span>Continue as Guest</span>
            </button>

            <div className="relative text-center my-4">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10" /></div>
              <span className="relative bg-slate-900 px-2 text-[10px] uppercase font-bold text-slate-400">OR</span>
            </div>

            {/* Auth Tab Switcher */}
            <div className="grid grid-cols-2 gap-1 p-1 bg-slate-950 rounded-lg mb-4 border border-white/10">
              <button
                onClick={() => setAuthTab('signin')}
                className={`py-1.5 text-xs font-bold rounded-md transition ${
                  authTab === 'signin' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Sign In
              </button>
              <button
                onClick={() => setAuthTab('register')}
                className={`py-1.5 text-xs font-bold rounded-md transition ${
                  authTab === 'register' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Create Account
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              {authTab === 'register' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    placeholder="e.g. Alex Morgan"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950/80 border border-white/15 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Email or Username</label>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  placeholder="Enter your email or username"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950/80 border border-white/15 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Password</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950/80 border border-white/15 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-600/30 transition mt-2 flex items-center justify-center gap-1.5"
              >
                <span>{authTab === 'signin' ? 'Sign In' : 'Create Account'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};
