import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ResumeAnalysis } from '../types';
import {
  Route,
  CheckCircle2,
  ArrowRight,
  Layers,
  Sparkles,
  MapPin,
  TrendingUp,
  Compass,
  Award,
  Zap,
  BarChart3,
  Calendar,
  DollarSign,
  ChevronRight,
  Circle,
  HelpCircle,
  ExternalLink,
} from 'lucide-react';

interface CareerRoadmapViewProps {
  analysis: ResumeAnalysis | null;
}

interface StationMilestone {
  id: number;
  phase: string;
  stationName: string;
  tagline: string;
  timeline: string;
  salaryBand: string;
  level: string;
  x: number; // percentage along map SVG
  y: number; // percentage altitude
  competencies: string[];
  capstoneProject: string;
  interviewGate: string;
  completed: boolean;
}

export const CareerRoadmapView: React.FC<CareerRoadmapViewProps> = ({ analysis }) => {
  const [targetRole, setTargetRole] = useState(analysis?.target_role || 'Senior Software Engineer');
  const [selectedStationId, setSelectedStationId] = useState<number>(2);
  const [viewMode, setViewMode] = useState<'map' | 'elevation' | 'checklist'>('map');
  const [loading, setLoading] = useState(false);

  // Initial Waypoints for the Visual Map Presentation
  const [stations, setStations] = useState<StationMilestone[]>([
    {
      id: 1,
      phase: 'Waypoint 01',
      stationName: 'Foundational Baseline & Gap Audit',
      tagline: 'Benchmark current technical proficiencies against role standards',
      timeline: 'Weeks 1–4',
      salaryBand: '$85,000 – $105,000',
      level: 'Mid-Level Foundation',
      x: 10,
      y: 65,
      competencies: ['Data Structures & Algorithms', 'Clean Code Architecture', 'Git Workflows', 'Unit Testing'],
      capstoneProject: 'Audit current codebase, introduce CI/CD linting, and achieve >85% code coverage.',
      interviewGate: 'Explain trade-offs between array-based vs linked-list memory layouts in high-throughput loops.',
      completed: true,
    },
    {
      id: 2,
      phase: 'Waypoint 02',
      stationName: 'Distributed Toolchain & Core Frameworks',
      tagline: 'Master essential distributed storage, caching, and container ecosystems',
      timeline: 'Months 2–3',
      salaryBand: '$110,000 – $135,000',
      level: 'Advanced Practitioner',
      x: 30,
      y: 48,
      competencies: ['PostgreSQL & Index Optimization', 'Docker Containerization', 'Redis Caching', 'FastAPI / Node.js'],
      capstoneProject: 'Implement a distributed caching layer reducing database p99 latency from 240ms to 18ms.',
      interviewGate: 'How do you prevent cache stampede during high-concurrency eviction cycles?',
      completed: true,
    },
    {
      id: 3,
      phase: 'Waypoint 03',
      stationName: 'Scalable Systems Architecture',
      tagline: 'Design resilient microservices, asynchronous message queues, and cloud telemetry',
      timeline: 'Months 4–6',
      salaryBand: '$140,000 – $170,000',
      level: 'Senior Specialist',
      x: 52,
      y: 35,
      competencies: ['Kafka / RabbitMQ', 'Kubernetes Orchestration', 'AWS / Cloud Architecture', 'System Observability'],
      capstoneProject: 'Architect an event-driven pub/sub data ingestion engine handling 50k events/sec with zero loss.',
      interviewGate: 'Compare idempotency strategies in message consumers with at-least-once delivery semantics.',
      completed: false,
    },
    {
      id: 4,
      phase: 'Waypoint 04',
      stationName: 'Market Visibility & Portfolio Tuning',
      tagline: 'Quantify business impact using Google XYZ format and optimize ATS visibility',
      timeline: 'Months 7–8',
      salaryBand: '$165,000 – $195,000',
      level: 'High-Demand Senior',
      x: 74,
      y: 22,
      competencies: ['STAR Method Articulation', 'Google XYZ Accomplishments', 'Technical Writing', 'Open Source'],
      capstoneProject: 'Publish an open-source technical benchmark and optimize resume keyword alignment to 92%+ ATS score.',
      interviewGate: 'Describe how you drove technical consensus across conflicting engineering stakeholder groups.',
      completed: false,
    },
    {
      id: 5,
      phase: 'Waypoint 05',
      stationName: 'Executive Mock Board & Final Offer Gate',
      tagline: 'Conquer senior architectural onsite rounds, system design, and compensation negotiation',
      timeline: 'Months 9–10',
      salaryBand: '$190,000 – $240,000+',
      level: 'Staff / Principal Target',
      x: 92,
      y: 12,
      competencies: ['Complex System Design', 'Cross-Functional Leadership', 'Executive Presence', 'Equity & Compensation Strategy'],
      capstoneProject: 'Complete 3 full-length simulated architectural design boards with STAR method behavioral mastery.',
      interviewGate: 'Architect a globally distributed key-value store with tunable consistency (PACELC theorem).',
      completed: false,
    },
  ]);

  const toggleStationCompleted = (id: number) => {
    setStations(prev =>
      prev.map(st => (st.id === id ? { ...st, completed: !st.completed } : st))
    );
  };

  const completedCount = stations.filter(s => s.completed).length;
  const progressPercent = Math.round((completedCount / stations.length) * 100);
  const activeStation = stations.find(s => s.id === selectedStationId) || stations[1];

  const handleRoleChange = (newRole: string) => {
    setTargetRole(newRole);
    // Dynamic role adjustment of milestones
    setStations(prev =>
      prev.map((s, idx) => ({
        ...s,
        tagline: `Targeted milestone for ${newRole}: Competency level ${idx + 1}`,
      }))
    );
  };

  return (
    <div className="space-y-6 max-w-5xl selection:bg-blue-600 selection:text-white">
      {/* Header Banner with Positional Graph Grid */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-xs relative overflow-hidden">
        {/* Subtle Positional Graph Overlay */}
        <div className="absolute inset-0 bg-graph-matrix pointer-events-none opacity-30" />
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-[11px] font-bold text-slate-500 mb-1 tracking-wider uppercase">
              <Compass className="w-3.5 h-3.5 text-indigo-600" />
              <span>GROWTH STRATEGY</span>
              <span>·</span>
              <span className="text-indigo-600 font-bold">VISUAL JOURNEY MAP &amp; ELEVATION</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
              Interactive Career Roadmap &amp; Altitude Map
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl leading-relaxed">
              An authentic map presentation charting your progression journey to <strong className="text-slate-900">{targetRole}</strong> with waypoint stations, compensation milestones, and skill deliverables.
            </p>
          </div>

          {/* Completion Progress Gauge Badge */}
          <div className="bg-slate-50/90 border border-slate-200/90 rounded-2xl p-4 flex items-center gap-3.5 shrink-0 shadow-2xs">
            <div className="relative w-12 h-12 flex items-center justify-center shrink-0">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="14" stroke="#e2e8f0" strokeWidth="3" fill="none" />
                <motion.circle
                  cx="18"
                  cy="18"
                  r="14"
                  stroke="#4F46E5"
                  strokeWidth="3.2"
                  strokeDasharray={`${progressPercent} 100`}
                  strokeLinecap="round"
                  fill="none"
                  transition={{ duration: 0.8 }}
                />
              </svg>
              <span className="absolute text-xs font-black font-mono text-indigo-900">{progressPercent}%</span>
            </div>
            <div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">JOURNEY PROGRESS</div>
              <div className="text-xs font-black text-slate-900 font-mono">
                {completedCount} of {stations.length} Milestones
              </div>
              <div className="text-[10px] text-emerald-600 font-semibold mt-0.5">
                {progressPercent >= 100 ? 'Target Attained!' : 'Waypoint Active'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Target Role Selector & Perspective Switcher */}
      <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <label className="text-xs font-bold text-slate-700 whitespace-nowrap flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-indigo-600" />
            <span>Target Role:</span>
          </label>
          <div className="relative flex-1 sm:w-72">
            <input
              type="text"
              value={targetRole}
              onChange={e => handleRoleChange(e.target.value)}
              placeholder="e.g. Lead Machine Learning Engineer"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition"
            />
          </div>
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200/80 w-full sm:w-auto justify-center">
          <button
            onClick={() => setViewMode('map')}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition flex items-center gap-1.5 ${
              viewMode === 'map'
                ? 'bg-white text-indigo-700 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Route className="w-3.5 h-3.5" />
            <span>Visual Metro Map</span>
          </button>

          <button
            onClick={() => setViewMode('elevation')}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition flex items-center gap-1.5 ${
              viewMode === 'elevation'
                ? 'bg-white text-indigo-700 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Salary Elevation Curve</span>
          </button>

          <button
            onClick={() => setViewMode('checklist')}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition flex items-center gap-1.5 ${
              viewMode === 'checklist'
                ? 'bg-white text-indigo-700 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Milestone Dossier</span>
          </button>
        </div>
      </div>

      {/* PERSPECTIVE 1: THE VISUAL METRO JOURNEY MAP */}
      {viewMode === 'map' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm space-y-6 relative overflow-hidden">
          {/* Subtle topographic coordinate lines */}
          <div className="absolute inset-0 bg-graph-matrix opacity-20 pointer-events-none" />

          <div className="flex items-center justify-between relative z-10">
            <div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">
                TOPOLOGICAL METRO TRANSIT LINE
              </div>
              <h3 className="font-extrabold text-slate-950 text-base">
                Ascent Line: Junior Foundation → {targetRole}
              </h3>
            </div>
            <div className="text-xs text-slate-500 hidden sm:flex items-center gap-3">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Completed
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse" /> Selected Station
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-300" /> Upcoming
              </span>
            </div>
          </div>

          {/* Interactive SVG Railway Map Presentation */}
          <div className="relative w-full h-56 sm:h-64 bg-gradient-to-b from-slate-50 to-indigo-50/30 rounded-2xl border border-slate-200/90 overflow-hidden select-none p-4">
            {/* Background Grid Lines in Canvas */}
            <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
              <defs>
                {/* Flowing animated rail gradient */}
                <linearGradient id="railGrad" x1="0%" y1="100%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#10B981" />
                  <stop offset="50%" stopColor="#3B82F6" />
                  <stop offset="100%" stopColor="#6366F1" />
                </linearGradient>

                {/* Roadway Flowing Dash Filter */}
                <filter id="glowShadow" x="-20%" y="-20%" width="140%" height="140%">
                  <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#4F46E5" floodOpacity="0.25" />
                </filter>
              </defs>

              {/* Background Coordinate Axis Grid Lines */}
              <line x1="0" y1="25%" x2="100%" y2="25%" stroke="#e2e8f0" strokeDasharray="3 3" />
              <line x1="0" y1="50%" x2="100%" y2="50%" stroke="#e2e8f0" strokeDasharray="3 3" />
              <line x1="0" y1="75%" x2="100%" y2="75%" stroke="#e2e8f0" strokeDasharray="3 3" />

              {/* The Curving Master Railway Transit Track */}
              <path
                d="M 60 160 C 180 140, 240 115, 380 95 S 650 70, 840 40"
                fill="none"
                stroke="#cbd5e1"
                strokeWidth="8"
                strokeLinecap="round"
              />

              {/* Animated Glowing Active Track Line */}
              <path
                d="M 60 160 C 180 140, 240 115, 380 95 S 650 70, 840 40"
                fill="none"
                stroke="url(#railGrad)"
                strokeWidth="4"
                strokeLinecap="round"
                className="animate-roadmap-path"
              />
            </svg>

            {/* Positioned Waypoint Stations */}
            <div className="absolute inset-0 flex items-center justify-between px-6 sm:px-12 pointer-events-none">
              {stations.map(station => {
                const isSelected = selectedStationId === station.id;
                return (
                  <div
                    key={station.id}
                    style={{
                      transform: `translateY(${station.y - 45}px)`,
                    }}
                    className="flex flex-col items-center pointer-events-auto cursor-pointer group"
                    onClick={() => setSelectedStationId(station.id)}
                  >
                    {/* Station Pulsing Outer Ring */}
                    <div className="relative flex items-center justify-center">
                      {isSelected && (
                        <div className="absolute w-12 h-12 rounded-full bg-blue-500/20 animate-ping pointer-events-none" />
                      )}

                      <motion.div
                        whileHover={{ scale: 1.25 }}
                        whileTap={{ scale: 0.95 }}
                        className={`w-9 h-9 sm:w-10 sm:h-10 rounded-2xl flex items-center justify-center text-xs font-black shadow-md border-2 transition-all ${
                          station.completed
                            ? 'bg-emerald-500 border-white text-white'
                            : isSelected
                            ? 'bg-blue-600 border-white text-white shadow-blue-400/40 ring-4 ring-blue-100'
                            : 'bg-white border-slate-300 text-slate-700 hover:border-blue-400'
                        }`}
                      >
                        {station.completed ? '✓' : `0${station.id}`}
                      </motion.div>
                    </div>

                    {/* Station Label & Compensation Badge */}
                    <div className="mt-2 text-center max-w-[110px]">
                      <div
                        className={`text-[11px] font-black tracking-tight leading-tight transition ${
                          isSelected ? 'text-blue-700' : 'text-slate-800'
                        }`}
                      >
                        {station.phase}
                      </div>
                      <div className="text-[9px] text-slate-500 font-medium truncate mt-0.5">
                        {station.timeline}
                      </div>
                      <div className="text-[9px] font-bold font-mono text-emerald-700 bg-emerald-50 px-1 rounded mt-0.5 border border-emerald-200/60 truncate">
                        {station.salaryBand.split('–')[0]}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Interactive Selected Station Dossier Card */}
          <motion.div
            key={activeStation.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 rounded-2xl border border-slate-200/90 bg-slate-50/70 space-y-4 shadow-2xs"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center font-mono font-black text-sm text-white shadow-2xs ${
                    activeStation.completed ? 'bg-emerald-600' : 'bg-blue-600'
                  }`}
                >
                  0{activeStation.id}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-mono">
                      {activeStation.phase} · {activeStation.timeline}
                    </span>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-md font-mono">
                      {activeStation.salaryBand}
                    </span>
                  </div>
                  <h4 className="text-base sm:text-lg font-black text-slate-950 mt-0.5">
                    {activeStation.stationName}
                  </h4>
                </div>
              </div>

              {/* Station Completion Toggle */}
              <button
                onClick={() => toggleStationCompleted(activeStation.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-2xs shrink-0 ${
                  activeStation.completed
                    ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border border-emerald-300'
                    : 'bg-white hover:bg-slate-100 text-slate-800 border border-slate-200'
                }`}
              >
                <CheckCircle2 className={`w-4 h-4 ${activeStation.completed ? 'text-emerald-600' : 'text-slate-400'}`} />
                <span>{activeStation.completed ? 'Milestone Attained' : 'Mark Station Completed'}</span>
              </button>
            </div>

            <p className="text-xs text-slate-600 font-normal leading-relaxed">
              {activeStation.tagline}
            </p>

            {/* Core Competencies & Capstone Project Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
              {/* Competencies */}
              <div className="p-4 bg-white rounded-xl border border-slate-200 space-y-2">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-blue-600" />
                  <span>Target Technical Competencies:</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {activeStation.competencies.map((comp, i) => (
                    <span
                      key={i}
                      className="text-xs font-semibold px-2.5 py-1 rounded-md bg-blue-50/80 text-blue-800 border border-blue-100"
                    >
                      {comp}
                    </span>
                  ))}
                </div>
              </div>

              {/* Capstone Deliverable in Google XYZ Format */}
              <div className="p-4 bg-white rounded-xl border border-slate-200 space-y-2">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Capstone Portfolio Deliverable:</span>
                </div>
                <p className="text-xs text-slate-800 leading-relaxed font-mono bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                  {activeStation.capstoneProject}
                </p>
              </div>
            </div>

            {/* Technical Interview Gate Check */}
            <div className="p-4 rounded-xl bg-indigo-50/70 border border-indigo-200/80 space-y-1.5 text-xs">
              <div className="font-bold text-indigo-950 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                <span>Station Technical Gate Interview Question:</span>
              </div>
              <p className="text-indigo-900 leading-relaxed italic pl-6">
                "{activeStation.interviewGate}"
              </p>
            </div>
          </motion.div>
        </div>
      )}

      {/* PERSPECTIVE 2: SALARY & ALTITUDE ELEVATION GRAPH */}
      {viewMode === 'elevation' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">
                COMPENSATION &amp; VELOCITY ELEVATION
              </div>
              <h3 className="font-extrabold text-slate-950 text-base">
                Altitude Curve: Seniority vs Market Compensation
              </h3>
            </div>
            <div className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
              Median Target: $190k - $240k+
            </div>
          </div>

          {/* Elevation Graph Canvas */}
          <div className="h-64 sm:h-72 bg-slate-50/80 rounded-2xl border border-slate-200 p-4 relative flex flex-col justify-between overflow-hidden">
            {/* Coordinate Grid Lines */}
            <div className="absolute inset-0 bg-graph-matrix opacity-25" />

            <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="elevationAreaGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#4F46E5" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#4F46E5" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Shaded Area Under Elevation Curve */}
              <polygon
                points="40,220 180,180 340,140 500,90 680,40 680,240 40,240"
                fill="url(#elevationAreaGrad)"
              />

              {/* Ascending Elevation Vector Line */}
              <polyline
                points="40,220 180,180 340,140 500,90 680,40"
                fill="none"
                stroke="#4F46E5"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Data Point Waypoints */}
              <circle cx="40" cy="220" r="5" fill="#FFFFFF" stroke="#10B981" strokeWidth="2.5" />
              <circle cx="180" cy="180" r="5" fill="#FFFFFF" stroke="#3B82F6" strokeWidth="2.5" />
              <circle cx="340" cy="140" r="5" fill="#FFFFFF" stroke="#6366F1" strokeWidth="2.5" />
              <circle cx="500" cy="90" r="5" fill="#FFFFFF" stroke="#8B5CF6" strokeWidth="2.5" />
              <circle cx="680" cy="40" r="6" fill="#10B981" stroke="#FFFFFF" strokeWidth="2" />
            </svg>

            {/* Label overlays across altitude brackets */}
            <div className="relative z-10 flex justify-between text-xs font-bold text-slate-700 h-full items-end pb-2 px-4">
              <div className="text-left">
                <span className="block text-[10px] text-slate-400 font-mono">Stage 1</span>
                <span>$95k Baseline</span>
              </div>
              <div className="text-left">
                <span className="block text-[10px] text-slate-400 font-mono">Stage 2</span>
                <span>$125k Core</span>
              </div>
              <div className="text-left">
                <span className="block text-[10px] text-slate-400 font-mono">Stage 3</span>
                <span>$155k Systems</span>
              </div>
              <div className="text-left">
                <span className="block text-[10px] text-slate-400 font-mono">Stage 4</span>
                <span>$180k Lead</span>
              </div>
              <div className="text-right">
                <span className="block text-[10px] text-slate-400 font-mono">Stage 5</span>
                <span className="text-emerald-700 font-extrabold">$240k+ Staff</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PERSPECTIVE 3: MILESTONE CHECKLIST */}
      {viewMode === 'checklist' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm space-y-4">
          <h3 className="font-extrabold text-slate-950 text-base">
            Actionable Roadmap Deliverables Checklist
          </h3>
          <div className="space-y-3">
            {stations.map(station => (
              <div
                key={station.id}
                onClick={() => toggleStationCompleted(station.id)}
                className={`p-4 rounded-2xl border transition cursor-pointer flex items-start gap-4 ${
                  station.completed
                    ? 'bg-emerald-50/50 border-emerald-200'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 ${
                    station.completed ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {station.completed ? '✓' : `0${station.id}`}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="text-xs sm:text-sm font-bold text-slate-950 truncate">
                      {station.stationName}
                    </h4>
                    <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded">
                      {station.salaryBand}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1">{station.capstoneProject}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
