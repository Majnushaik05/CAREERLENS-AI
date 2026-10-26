import React, { useState } from 'react';
import { ResumeAnalysis } from '../types';
import {
  Compass,
  CheckCircle2,
  Circle,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Award,
  Layers,
  Code,
  Calendar,
  DollarSign,
  Check,
  Target,
  Briefcase,
  ChevronRight,
  BookOpen
} from 'lucide-react';

interface CareerRoadmapViewProps {
  analysis: ResumeAnalysis | null;
}

interface RoadmapMilestone {
  id: number;
  phase: string;
  title: string;
  level: string;
  timeline: string;
  salaryBand: string;
  description: string;
  targetCompetencies: string[];
  capstoneDeliverable: string;
  interviewGate: string;
  completed: boolean;
}

const ROLE_PRESETS = [
  'Senior Software Engineer',
  'Full Stack Developer',
  'DevOps & Cloud Architect',
  'AI / Machine Learning Engineer',
  'Data Scientist',
  'Engineering Manager',
];

export const CareerRoadmapView: React.FC<CareerRoadmapViewProps> = ({ analysis }) => {
  const [targetRole, setTargetRole] = useState(
    analysis?.target_role || 'Senior Software Engineer'
  );
  const [customRoleInput, setCustomRoleInput] = useState('');
  const [selectedPhaseId, setSelectedPhaseId] = useState<number>(2);

  const candidateSkills = analysis?.skills || [
    'Python',
    'JavaScript',
    'React',
    'SQL',
    'Git',
  ];

  // Milestone Stages tailored for role progression
  const [milestones, setMilestones] = useState<RoadmapMilestone[]>([
    {
      id: 1,
      phase: 'Phase 01',
      title: 'Foundational Baseline & Code Quality Standards',
      level: 'Mid-Level Foundation',
      timeline: 'Month 1–2',
      salaryBand: '$90,000 – $115,000',
      description: 'Solidify clean code architecture, automated testing pipelines, and design pattern fundamentals.',
      targetCompetencies: ['Data Structures & Algorithms', 'Clean Code Architecture', 'Git Workflows', 'Unit & Integration Testing'],
      capstoneDeliverable: 'Audit an existing codebase, set up strict CI/CD linting, and achieve >85% automated test coverage.',
      interviewGate: 'Explain trade-offs between array-based vs linked memory layouts in high-throughput loops.',
      completed: true,
    },
    {
      id: 2,
      phase: 'Phase 02',
      title: 'Distributed Storage & Core Framework Toolchains',
      level: 'Advanced Practitioner',
      timeline: 'Month 3–4',
      salaryBand: '$115,000 – $140,000',
      description: 'Master asynchronous backends, distributed caching, containerization, and database indexing.',
      targetCompetencies: ['PostgreSQL & Query Optimization', 'Docker Containerization', 'Redis In-Memory Caching', 'FastAPI / Node.js'],
      capstoneDeliverable: 'Implement a distributed caching layer that decreases database p99 query latency from 250ms to under 20ms.',
      interviewGate: 'How do you prevent cache stampede during high-concurrency cache eviction cycles?',
      completed: true,
    },
    {
      id: 3,
      phase: 'Phase 03',
      title: 'Scalable Systems Architecture & Cloud Telemetry',
      level: 'Senior Specialist',
      timeline: 'Month 5–6',
      salaryBand: '$145,000 – $175,000',
      description: 'Design resilient event-driven microservices, message queues, and cloud observability pipelines.',
      targetCompetencies: ['Kafka / RabbitMQ', 'Kubernetes Orchestration', 'AWS Cloud Infrastructure', 'System Observability (p99 Metrics)'],
      capstoneDeliverable: 'Architect an event-driven pub/sub ingestion engine handling 50,000 events/second with zero message loss.',
      interviewGate: 'Compare idempotency strategies in message consumers with at-least-once delivery guarantees.',
      completed: false,
    },
    {
      id: 4,
      phase: 'Phase 04',
      title: 'ATS Resume Keyword Tuning & Metric Storytelling',
      level: 'High-Demand Senior',
      timeline: 'Month 7–8',
      salaryBand: '$170,000 – $200,000',
      description: 'Align resume bullets with Google XYZ accomplishments and maximize recruiter ATS discovery.',
      targetCompetencies: ['Google XYZ Accomplishments', 'STAR Behavioral Methodology', 'Technical Whitepaper', 'Open-Source Contributions'],
      capstoneDeliverable: 'Publish a technical case study on GitHub and tune resume keywords to score 92%+ on enterprise ATS scanners.',
      interviewGate: 'Describe how you drove technical consensus across conflicting engineering stakeholder groups.',
      completed: false,
    },
    {
      id: 5,
      phase: 'Phase 05',
      title: 'Executive System Design & Final Offer Negotiation',
      level: 'Staff / Lead Target',
      timeline: 'Month 9–10',
      salaryBand: '$195,000 – $250,000+',
      description: 'Master senior onsite architecture rounds, cross-functional leadership, and equity compensation leverage.',
      targetCompetencies: ['Complex System Design', 'Cross-Functional Leadership', 'Executive Presence', 'Equity & Total Compensation Strategy'],
      capstoneDeliverable: 'Complete 3 full-length simulated architectural design boards with STAR method behavioral mastery.',
      interviewGate: 'Architect a globally distributed key-value store with tunable consistency (PACELC theorem).',
      completed: false,
    },
  ]);

  const toggleMilestoneComplete = (id: number) => {
    setMilestones(prev =>
      prev.map(m => (m.id === id ? { ...m, completed: !m.completed } : m))
    );
  };

  const handleSelectRole = (role: string) => {
    setTargetRole(role);
  };

  const completedCount = milestones.filter(m => m.completed).length;
  const progressPercent = Math.round((completedCount / milestones.length) * 100);
  const activeMilestone = milestones.find(m => m.id === selectedPhaseId) || milestones[0];

  return (
    <div className="space-y-6 max-w-6xl mx-auto selection:bg-blue-600 selection:text-white pb-16">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
            <span>CAREER ROADMAP &amp; COMPETENCY MILESTONES</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-950 tracking-tight">
            Target Career Progression: <span className="text-blue-600">{targetRole}</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
            A clear, phased milestone blueprint comparing your verified resume skills against market requirements for promotion and senior hiring.
          </p>
        </div>

        {/* Overall Completion Metric Card */}
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 shrink-0 min-w-[220px]">
          <div className="flex items-center justify-between text-xs font-bold text-slate-600 mb-1.5">
            <span>Roadmap Progress</span>
            <span className="text-blue-600 font-extrabold">{progressPercent}%</span>
          </div>
          <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
            <div
              className="bg-blue-600 h-full rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <div className="text-[11px] text-slate-500 mt-2 flex items-center justify-between">
            <span>{completedCount} of {milestones.length} Phases Done</span>
            <span className="text-emerald-600 font-semibold flex items-center gap-1">
              <Check className="w-3 h-3" /> On Track
            </span>
          </div>
        </div>
      </div>

      {/* Target Role Selector Tabs */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-3">
        <div className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
          <Target className="w-4 h-4 text-blue-600" />
          <span>Select or Change Target Career Destination:</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {ROLE_PRESETS.map(role => (
            <button
              key={role}
              onClick={() => handleSelectRole(role)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                targetRole === role
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
              }`}
            >
              <span>{role}</span>
              {targetRole === role && <Check className="w-3 h-3" />}
            </button>
          ))}
        </div>
      </div>

      {/* Verified Skills vs Gaps Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Verified Resume Skills */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="text-xs font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Verified In Your Resume ({candidateSkills.length})</span>
            </div>
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              Active Strengths
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Competencies successfully detected from your uploaded profile that count toward your baseline.
          </p>
          <div className="flex flex-wrap gap-1.5 pt-1">
            {candidateSkills.map(skill => (
              <span
                key={skill}
                className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>

        {/* Milestone Gaps & Focus */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="text-xs font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-purple-600" />
              <span>Priority Skills for {targetRole}</span>
            </div>
            <span className="text-[10px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200">
              High Market Demand
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Recommended tools and systems architecture required to reach top-percentile compensation.
          </p>
          <div className="flex flex-wrap gap-1.5 pt-1">
            {['Docker', 'PostgreSQL Optimization', 'Redis Caching', 'Kafka', 'Kubernetes', 'AWS', 'System Design'].map(skill => (
              <span
                key={skill}
                className="px-2.5 py-1 rounded-lg bg-purple-50 text-purple-800 border border-purple-200 text-xs font-semibold"
              >
                + {skill}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Sequential Phase Breakdown: Clear 5-Step Cards */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-black text-slate-950 flex items-center gap-2">
            <Layers className="w-4 h-4 text-blue-600" />
            <span>Step-by-Step Career Progression Phases</span>
          </h2>
          <span className="text-xs text-slate-400">Click any milestone card to expand details</span>
        </div>

        <div className="space-y-3">
          {milestones.map((milestone) => {
            const isSelected = milestone.id === selectedPhaseId;
            return (
              <div
                key={milestone.id}
                className={`bg-white rounded-2xl border transition-all duration-200 overflow-hidden shadow-xs ${
                  isSelected
                    ? 'border-blue-500 ring-2 ring-blue-500/10'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                {/* Milestone Summary Header Row */}
                <div
                  onClick={() => setSelectedPhaseId(milestone.id)}
                  className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer hover:bg-slate-50/50 transition"
                >
                  <div className="flex items-start sm:items-center gap-3.5 min-w-0">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleMilestoneComplete(milestone.id);
                      }}
                      className={`w-8 h-8 rounded-xl border flex items-center justify-center shrink-0 transition ${
                        milestone.completed
                          ? 'bg-emerald-600 border-emerald-600 text-white'
                          : 'bg-white border-slate-300 text-slate-300 hover:border-blue-500 hover:text-blue-500'
                      }`}
                      title={milestone.completed ? 'Mark as incomplete' : 'Mark as completed'}
                    >
                      {milestone.completed ? <Check className="w-4 h-4 stroke-[3]" /> : <Circle className="w-4 h-4" />}
                    </button>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[11px] font-black uppercase text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                          {milestone.phase}
                        </span>
                        <span className="text-xs text-slate-400">•</span>
                        <span className="text-xs font-semibold text-slate-500">{milestone.level}</span>
                        {milestone.completed && (
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                            Completed
                          </span>
                        )}
                      </div>
                      <h3 className="text-sm sm:text-base font-bold text-slate-900 mt-1 truncate">
                        {milestone.title}
                      </h3>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 shrink-0 sm:pl-4 sm:border-l sm:border-slate-100">
                    <div className="text-left sm:text-right">
                      <div className="text-xs font-bold text-slate-900 flex items-center gap-1 sm:justify-end">
                        <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{milestone.salaryBand}</span>
                      </div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-1 sm:justify-end">
                        <Calendar className="w-3 h-3" />
                        <span>{milestone.timeline}</span>
                      </div>
                    </div>

                    <ChevronRight
                      className={`w-5 h-5 text-slate-400 transition-transform ${
                        isSelected ? 'rotate-90 text-blue-600' : ''
                      }`}
                    />
                  </div>
                </div>

                {/* Expanded Details Section */}
                {isSelected && (
                  <div className="p-5 pt-0 bg-slate-50/60 border-t border-slate-100 space-y-4">
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed pt-3">
                      {milestone.description}
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Required Competencies */}
                      <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-2">
                        <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                          <Code className="w-4 h-4 text-blue-600" />
                          <span>Core Competencies in this Phase:</span>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {milestone.targetCompetencies.map(comp => {
                            const isPossessed = candidateSkills.some(s => s.toLowerCase() === comp.toLowerCase());
                            return (
                              <span
                                key={comp}
                                className={`px-2.5 py-1 rounded-lg text-xs font-semibold border ${
                                  isPossessed
                                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                    : 'bg-blue-50 text-blue-800 border-blue-200'
                                }`}
                              >
                                {isPossessed ? '✓ ' : ''}{comp}
                              </span>
                            );
                          })}
                        </div>
                      </div>

                      {/* Capstone Deliverable */}
                      <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-1.5">
                        <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                          <Award className="w-4 h-4 text-purple-600" />
                          <span>Actionable Capstone Project:</span>
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed">
                          {milestone.capstoneDeliverable}
                        </p>
                      </div>
                    </div>

                    {/* Interview Gate Question */}
                    <div className="bg-purple-50/70 p-4 rounded-xl border border-purple-200 space-y-1">
                      <div className="text-xs font-bold text-purple-900 flex items-center gap-1.5">
                        <BookOpen className="w-4 h-4 text-purple-600" />
                        <span>ATS Interview Gate Benchmark:</span>
                      </div>
                      <p className="text-xs text-purple-950 font-medium italic">
                        &quot;{milestone.interviewGate}&quot;
                      </p>
                    </div>

                    {/* Toggle Completion Button */}
                    <div className="flex justify-end pt-1">
                      <button
                        onClick={() => toggleMilestoneComplete(milestone.id)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                          milestone.completed
                            ? 'bg-slate-200 hover:bg-slate-300 text-slate-700'
                            : 'bg-blue-600 hover:bg-blue-700 text-white shadow-xs'
                        }`}
                      >
                        {milestone.completed ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>Mark as In Progress</span>
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Mark Phase Completed</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
