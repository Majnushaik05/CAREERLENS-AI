import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight,
  TrendingUp,
  Award,
  Layers,
  ShieldCheck,
  Zap,
  Globe,
  Cpu,
  BarChart3,
  Sliders,
  FileText,
  Search,
  Check,
  Route,
  Target,
  Users,
  Sparkles,
  ChevronRight,
  Briefcase,
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

  // Gallery of realistic systems, graphs, and interfaces for rolling marquee
  const previewImages = [
    { src: IMAGES.systemGraphMatrix, title: 'Multi-Dimensional Score Matrix', tag: 'Graph Telemetry' },
    { src: IMAGES.careerDashboard, title: 'System Analytics Architecture', tag: 'Core System' },
    { src: IMAGES.analyticsMockup, title: 'ATS Resume Audit & Scoring', tag: 'Intelligence' },
    { src: IMAGES.recruiterCenter, title: 'Recruiter Command Dashboard', tag: 'Talent Acquisition' },
    { src: IMAGES.careerRoadmap, title: 'Career Progression Pathway', tag: 'Growth Roadmap' },
    { src: IMAGES.heroMockup, title: 'System Analytics Overview', tag: 'Architecture' },
  ];

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* TOP NAVIGATION BAR */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 px-6 sm:px-12 py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-6">
          {/* Logo with App Logo Emblem and Clean Name */}
          <div className="flex items-center gap-2.5 shrink-0">
            <CareerLensLogo size="sm" showText={true} />
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-xs font-semibold text-slate-600">
            <a href="#home" className="hover:text-blue-600 transition-colors">Home</a>
            <a href="#features" className="hover:text-blue-600 transition-colors">Workspace Features</a>
            <a href="#gallery" className="hover:text-blue-600 transition-colors">Live Platforms</a>
            <a href="#about" className="hover:text-blue-600 transition-colors">About</a>
          </nav>

          {/* Action Button */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => {
                setAuthTab('signin');
                setAuthModalOpen(true);
              }}
              className="text-xs font-bold text-slate-600 hover:text-slate-900 px-3 py-2 transition hidden sm:inline-block"
            >
              Sign In
            </button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onExploreGuest}
              className="px-5 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition shadow-xs flex items-center gap-2"
            >
              <span>Get Started</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </motion.button>
          </div>
        </div>
      </header>

      {/* CONTINUOUS ROLLING TICKER STRIP */}
      <div className="border-b border-slate-200 bg-slate-50 py-2 overflow-hidden">
        <div className="animate-marquee whitespace-nowrap flex items-center gap-8 text-[11px] font-semibold text-slate-600">
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
              <span>{item}</span>
              <span className="text-slate-300">/</span>
            </span>
          ))}
        </div>
      </div>

      {/* HERO SECTION WITH SUBTLE BACKGROUND GRAPHS & TELEMETRY */}
      <section id="home" className="pt-14 pb-16 px-6 sm:px-12 bg-white relative overflow-hidden">
        {/* Subtle Background Technical Graph Grid & Telemetry Coordinate Curves */}
        <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden select-none">
          {/* Subtle Technical Grid Lines */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#f1f5f9_1px,transparent_1px),linear-gradient(to_bottom,#f1f5f9_1px,transparent_1px)] bg-[size:48px_48px] opacity-70" />
          
          {/* Faint Vector Line Graph Overlay */}
          <svg className="absolute w-full h-full opacity-[0.06] text-blue-600" viewBox="0 0 1440 600" fill="none" preserveAspectRatio="none">
            <path
              d="M0 450 Q 240 380, 480 410 T 960 280 T 1440 180"
              stroke="currentColor"
              strokeWidth="3"
              fill="none"
            />
            <path
              d="M0 500 Q 360 440, 720 460 T 1440 320"
              stroke="currentColor"
              strokeWidth="2"
              strokeDasharray="6 6"
              fill="none"
            />
            <path
              d="M0 560 L 200 520 L 400 535 L 600 480 L 800 510 L 1000 430 L 1200 460 L 1440 390 L 1440 600 L 0 600 Z"
              fill="currentColor"
              opacity="0.3"
            />
            {/* Telemetry Coordinate Nodes */}
            <circle cx="480" cy="410" r="6" fill="currentColor" />
            <circle cx="960" cy="280" r="6" fill="currentColor" />
            <circle cx="1200" cy="460" r="5" fill="currentColor" />
          </svg>

          {/* Faint Graph Watermark on Right */}
          <div
            className="absolute -right-20 top-1/2 -translate-y-1/2 w-[700px] h-[550px] opacity-[0.035] bg-cover bg-no-repeat bg-center"
            style={{ backgroundImage: `url(${IMAGES.systemGraphMatrix})` }}
          />
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Content Column */}
            <div className="lg:col-span-6 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-xs font-bold text-blue-700 uppercase tracking-wider">
                <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
                <span>Smart Career &amp; Recruiter Intelligence</span>
              </div>

              {/* Dynamic Headline with Rolling Text */}
              <div className="space-y-2">
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-950 tracking-tight leading-[1.12]">
                  Your Career Journey,{' '}
                  <span className="text-slate-900 block">Smarter with</span>
                </h1>
                
                {/* Rolling Text Animated Display */}
                <div className="h-14 sm:h-16 overflow-hidden flex items-center">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={currentWordIndex}
                      initial={{ opacity: 0, y: 25 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -25 }}
                      transition={{ duration: 0.4, ease: 'easeOut' }}
                      className="text-3xl sm:text-4xl lg:text-5xl font-black text-blue-600 tracking-tight"
                    >
                      {rollingWords[currentWordIndex]}
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>

              <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-xl font-normal">
                Evaluate resumes with precision scoring, benchmark in-demand skills, practice structured mock interviews, detect scam job links, and access recruiter talent screening.
              </p>

              {/* Action Buttons with framer motion feedback */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onExploreGuest}
                  className="px-7 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition flex items-center justify-center gap-2"
                >
                  <span>Launch Career Lens</span>
                  <ArrowRight className="w-4 h-4" />
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setAuthTab('signin');
                    setAuthModalOpen(true);
                  }}
                  className="px-6 py-3.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 font-bold text-xs transition flex items-center justify-center gap-2"
                >
                  <span>Sign In to Account</span>
                </motion.button>
              </div>

              {/* Trust Checkmarks */}
              <div className="flex flex-wrap items-center gap-5 text-xs text-slate-500 pt-2 font-medium">
                <div className="flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>Real-time graph metrics</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>Dual candidate &amp; recruiter workflows</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>Zero guesswork</span>
                </div>
              </div>
            </div>

            {/* Right Column: Interactive System & Graph Mockup */}
            <div className="lg:col-span-6">
              <motion.div
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="rounded-3xl p-6 bg-slate-50 border border-slate-200 shadow-xl space-y-4"
              >
                {/* Mock Window Top Bar */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-rose-400" />
                    <span className="w-3 h-3 rounded-full bg-amber-400" />
                    <span className="w-3 h-3 rounded-full bg-emerald-400" />
                  </div>
                  <div className="text-xs font-bold text-slate-500 font-mono flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span>careerlens.app / workspace</span>
                  </div>
                  <div className="w-12" />
                </div>

                {/* Simulated Realistic UI Component Inside Card */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Left sub-box: Resume Analysis Card */}
                  <div className="bg-white p-4.5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800">Your Resume Score</span>
                      <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        Top 15%
                      </span>
                    </div>

                    <div className="flex items-center justify-center py-2">
                      <div className="relative w-20 h-20 flex items-center justify-center">
                        <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 36 36">
                          <path
                            className="text-slate-100"
                            strokeWidth="3.5"
                            stroke="currentColor"
                            fill="none"
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          />
                          <path
                            className="text-blue-600"
                            strokeDasharray="84, 100"
                            strokeWidth="3.5"
                            strokeLinecap="round"
                            stroke="currentColor"
                            fill="none"
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          />
                        </svg>
                        <span className="absolute text-sm font-mono font-bold text-blue-700">84%</span>
                      </div>
                    </div>

                    <div className="space-y-1.5 text-[11px] text-slate-600">
                      <div className="flex items-center gap-1.5 text-emerald-700 font-medium">
                        <span>✓</span> <span>High action-verb quantification</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-emerald-700 font-medium">
                        <span>✓</span> <span>Verified technical competencies</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-amber-600 font-medium">
                        <span>•</span> <span>3 target keywords missing</span>
                      </div>
                    </div>
                  </div>

                  {/* Right sub-box: Top Skill Matches Bar Graph */}
                  <div className="bg-white p-4.5 rounded-2xl border border-slate-200 shadow-xs space-y-2.5">
                    <span className="text-xs font-bold text-slate-800">Top Skill Matches</span>
                    <div className="space-y-2 pt-1">
                      {[
                        { skill: 'Distributed Systems', pct: 92 },
                        { skill: 'React & TypeScript', pct: 88 },
                        { skill: 'API Architecture', pct: 81 },
                        { skill: 'Performance Tuning', pct: 76 },
                      ].map((item, idx) => (
                        <div key={idx} className="space-y-0.5">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="text-slate-700 font-medium">{item.skill}</span>
                            <span className="font-mono font-bold text-slate-900">{item.pct}%</span>
                          </div>
                          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-blue-600 rounded-full"
                              style={{ width: `${item.pct}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-white rounded-xl border border-slate-200 text-xs text-slate-600 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="font-semibold text-slate-800">Full Stack &amp; Systems Cohorts Active</span>
                  </div>
                  <button onClick={onExploreGuest} className="text-blue-600 font-bold hover:underline flex items-center gap-1">
                    <span>Enter Live</span>
                    <span>→</span>
                  </button>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* ROLLING IMAGES GALLERY: REALISTIC SYSTEMS & GRAPHS CAROUSEL */}
      <section id="gallery" className="py-12 bg-slate-50 border-y border-slate-200 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 sm:px-12 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="text-[11px] font-bold text-blue-600 uppercase tracking-wider">Live System Gallery</div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-950 tracking-tight">
              Realistic Systems, Analytics &amp; Command Centers
            </h2>
          </div>
          <p className="text-xs text-slate-500 max-w-md">
            Continuous view of real-time dashboards, progression pathways, and recruiter evaluation systems.
          </p>
        </div>

        {/* Continuous Horizontal Rolling Images Reel */}
        <div className="relative w-full overflow-hidden py-3">
          <div className="animate-marquee flex gap-6">
            {[...previewImages, ...previewImages].map((imgItem, idx) => (
              <div
                key={idx}
                className="w-[320px] sm:w-[400px] shrink-0 bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition group"
              >
                <div className="h-48 sm:h-56 overflow-hidden bg-slate-100 relative">
                  <img
                    src={imgItem.src}
                    alt={imgItem.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  />
                  <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-xs px-2.5 py-1 rounded-full text-[10px] font-bold text-slate-800 border border-slate-200/80 shadow-xs">
                    {imgItem.tag}
                  </div>
                </div>
                <div className="p-4 bg-white flex items-center justify-between">
                  <div className="font-bold text-xs text-slate-900 truncate">{imgItem.title}</div>
                  <span className="text-[10px] font-mono font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                    Active
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6 COLORFUL MODULE ICONS ROW */}
      <section id="features" className="py-16 bg-white px-6 sm:px-12">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider">WORKSPACE HIGHLIGHTS</span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
              Powerful Modules for Candidates &amp; Recruiters
            </h2>
            <p className="text-xs sm:text-sm text-slate-600">
              Each module is engineered to give actionable telemetry and clear score breakdowns.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs text-center space-y-2 hover:border-blue-300 transition">
              <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center mx-auto">
                <FileText className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-xs text-slate-900">Resume Intelligence</h3>
              <p className="text-[11px] text-slate-500 leading-tight">Instant resume feedback &amp; circular ring scoring</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs text-center space-y-2 hover:border-purple-300 transition">
              <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-200 text-purple-600 flex items-center justify-center mx-auto">
                <Route className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-xs text-slate-900">Career Roadmap</h3>
              <p className="text-[11px] text-slate-500 leading-tight">Milestone progression graph &amp; path nodes</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs text-center space-y-2 hover:border-emerald-300 transition">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto">
                <BarChart3 className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-xs text-slate-900">Skill Growth</h3>
              <p className="text-[11px] text-slate-500 leading-tight">In-demand skill gaps with dimensional graphs</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs text-center space-y-2 hover:border-indigo-300 transition">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-600 flex items-center justify-center mx-auto">
                <Award className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-xs text-slate-900">Assessments</h3>
              <p className="text-[11px] text-slate-500 leading-tight">Timed technical test tokens &amp; results vault</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs text-center space-y-2 hover:border-amber-300 transition">
              <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto">
                <Target className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-xs text-slate-900">Job Match</h3>
              <p className="text-[11px] text-slate-500 leading-tight">Vector cosine similarity &amp; keyword overlap</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs text-center space-y-2 hover:border-rose-300 transition">
              <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto">
                <Users className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-xs text-slate-900">Recruiter Tools</h3>
              <p className="text-[11px] text-slate-500 leading-tight">Screening, tokens, pipelines &amp; shortlists</p>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-slate-200 bg-slate-50 py-8 px-6 sm:px-12 text-xs text-slate-500 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <CareerLensLogo size="xs" showText={true} />
            <span className="text-slate-300">·</span>
            <span>Smart Career &amp; Recruiter Intelligence</span>
          </div>
          <div className="flex items-center gap-6">
            <button onClick={onExploreGuest} className="hover:text-slate-900 transition">Candidate Workspace</button>
            <button onClick={onExploreGuest} className="hover:text-slate-900 transition">Recruiter Workspace</button>
            <button onClick={() => { setAuthTab('signin'); setAuthModalOpen(true); }} className="hover:text-slate-900 transition">Sign In</button>
          </div>
        </div>
      </footer>

      {/* AUTH MODAL */}
      {authModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-xs">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md p-6 sm:p-7 rounded-2xl bg-white border border-slate-200 shadow-2xl relative"
          >
            <button
              onClick={() => setAuthModalOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 text-base font-bold p-1"
            >
              ✕
            </button>

            <div className="text-center space-y-1 mb-5">
              <CareerLensLogo size="md" className="justify-center mx-auto" />
              <h2 className="text-lg font-black text-slate-900 pt-2">
                {authTab === 'signin' ? 'Sign In to Career Lens' : 'Create Your Account'}
              </h2>
              <p className="text-xs text-slate-500">
                Choose how you want to continue
              </p>
            </div>

            {/* Guest Action Button with Official Emblem Logo */}
            <button
              onClick={() => {
                onExploreGuest();
                setAuthModalOpen(false);
              }}
              className="w-full py-2.5 px-4 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-800 font-bold text-xs flex items-center justify-center gap-2 mb-4 transition"
            >
              <CareerLensLogo size="xs" />
              <span>Continue as Guest</span>
            </button>

            <div className="relative text-center my-4">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200" /></div>
              <span className="relative bg-white px-2 text-[10px] uppercase font-bold text-slate-400">OR</span>
            </div>

            {/* Auth Tab Switcher */}
            <div className="grid grid-cols-2 gap-1 p-1 bg-slate-100 rounded-lg mb-4">
              <button
                onClick={() => setAuthTab('signin')}
                className={`py-1.5 text-xs font-bold rounded-md transition ${
                  authTab === 'signin' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-500'
                }`}
              >
                Sign In
              </button>
              <button
                onClick={() => setAuthTab('register')}
                className={`py-1.5 text-xs font-bold rounded-md transition ${
                  authTab === 'register' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-500'
                }`}
              >
                Create Account
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              {authTab === 'register' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    placeholder="e.g. Alex Morgan"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Email or Username</label>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  placeholder="Enter your email or username"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition mt-2 flex items-center justify-center gap-1.5"
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
