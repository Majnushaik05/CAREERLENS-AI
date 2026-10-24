import React, { useMemo, useState } from 'react';
import { ResumeAnalysis } from '../types';
import { CheckCircle2, Circle, Route, Target, BookOpen, Code2, BriefcaseBusiness, ArrowRight } from 'lucide-react';

interface CareerRoadmapViewProps { analysis: ResumeAnalysis | null; }
interface RoadmapStep { title: string; timeframe: string; purpose: string; tasks: string[]; project: string; }

export const CareerRoadmapView: React.FC<CareerRoadmapViewProps> = ({ analysis }) => {
  const [targetRole, setTargetRole] = useState(analysis?.target_role || 'Software Engineer');
  const [completed, setCompleted] = useState<number[]>([]);
  const currentSkills = (analysis?.skills || []).map((s: any) => typeof s === 'string' ? s : s.name).filter(Boolean) as string[];
  const roadmap: RoadmapStep[] = useMemo(() => {
    const role = targetRole.trim() || 'your target role';
    const lower = role.toLowerCase();
    const technical = /data|ai|machine learning|analyst|scientist/.test(lower)
      ? ['Strengthen Python and SQL fundamentals', 'Practice data cleaning, statistics, and model evaluation', 'Learn version control and reproducible workflows']
      : /design|ux|product/.test(lower)
      ? ['Build user research and problem-framing skills', 'Practice wireframes, prototyping, and usability testing', 'Document design decisions and measurable outcomes']
      : /sales|marketing|hr|recruit|business|manager/.test(lower)
      ? ['Build role-specific domain knowledge', 'Practice communication, analysis, and stakeholder workflows', 'Track outcomes with clear metrics and case studies']
      : ['Strengthen programming and problem-solving fundamentals', 'Practice data structures, APIs, databases, and testing', 'Use Git and write maintainable, documented code'];
    return [
      { title: 'Build your foundation', timeframe: 'Weeks 1–2', purpose: `Understand the core expectations for ${role}.`, tasks: technical, project: 'Create a short skills checklist and one small practice exercise.' },
      { title: 'Practice the most important skills', timeframe: 'Weeks 3–5', purpose: 'Turn concepts into repeatable hands-on ability.', tasks: ['Complete 3 focused exercises each week', 'Review mistakes and write down what you learned', 'Ask for feedback from a peer, mentor, or community'], project: 'Build one small project that demonstrates two or three role-relevant skills.' },
      { title: 'Create proof of work', timeframe: 'Weeks 6–8', purpose: 'Give employers clear evidence of what you can do.', tasks: ['Finish a portfolio project with a clear README or case study', 'Explain the problem, your approach, and the result', 'Add tests, screenshots, or supporting evidence where relevant'], project: 'Publish a polished project or case study with a concise explanation of your contribution.' },
      { title: 'Prepare and apply', timeframe: 'Weeks 9–10', purpose: 'Translate your preparation into focused applications.', tasks: ['Tailor your resume to each job description honestly', 'Practice role-specific interview questions', 'Track applications and improve based on feedback'], project: 'Prepare a role-focused resume, portfolio link, and interview notes.' },
    ];
  }, [targetRole]);
  const progress = Math.round((completed.length / roadmap.length) * 100);
  const toggle = (index: number) => setCompleted(prev => prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]);

  return <div className="mx-auto max-w-5xl space-y-6">
    <header className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
      <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700"><Route className="h-4 w-4"/> YOUR CAREER PLAN</div>
      <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-950">A clear path to your next role</h1>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">Follow these practical steps in order. Mark each phase complete as you make progress. This is a suggested plan, not a guarantee of employment.</p>
      <div className="mt-6 grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
        <label className="block"><span className="mb-2 block text-sm font-bold text-slate-700">What role are you working toward?</span><input value={targetRole} onChange={e => setTargetRole(e.target.value)} placeholder="e.g. AI Engineer, HR Manager, UX Designer" className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"/></label>
        <div className="min-w-40 rounded-xl bg-slate-50 p-3"><div className="flex items-center justify-between text-xs font-bold text-slate-600"><span>Plan progress</span><span>{progress}%</span></div><div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-200"><div className="h-full rounded-full bg-blue-600 transition-all" style={{width:`${progress}%`}}/></div><div className="mt-1 text-[11px] text-slate-500">{completed.length} of {roadmap.length} phases complete</div></div>
      </div>
    </header>
    {analysis && <section className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4"><div className="flex items-start gap-3"><div className="rounded-xl bg-white p-2 text-emerald-700"><Target className="h-5 w-5"/></div><div><h2 className="text-sm font-bold text-emerald-950">Personalize your starting point</h2><p className="mt-1 text-sm leading-5 text-emerald-900">{currentSkills.length ? `Your resume analysis detected ${currentSkills.slice(0, 8).join(', ')}${currentSkills.length > 8 ? ', and more' : ''}. Use these as skills to build on and compare them with the requirements in job descriptions.` : 'Your resume has not provided a usable skills list yet. Add or analyze a resume to make the plan more specific.'}</p></div></div></section>}
    <section className="space-y-4">{roadmap.map((step, index) => { const done = completed.includes(index); const Icon = [BookOpen, Code2, BriefcaseBusiness, Target][index]; return <article key={step.title} className={`rounded-2xl border bg-white p-5 sm:p-6 shadow-sm transition ${done ? 'border-emerald-200' : 'border-slate-200'}`}><div className="flex items-start gap-4"><button onClick={() => toggle(index)} aria-label={done ? `Mark ${step.title} incomplete` : `Mark ${step.title} complete`} className={`mt-0.5 rounded-full ${done ? 'text-emerald-600' : 'text-slate-300 hover:text-blue-600'}`}>{done ? <CheckCircle2 className="h-7 w-7"/> : <Circle className="h-7 w-7"/>}</button><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-600">PHASE {index + 1}</span><span className="text-xs font-semibold text-blue-700">{step.timeframe}</span>{done && <span className="text-xs font-bold text-emerald-700">Completed</span>}</div><h2 className="mt-2 text-lg font-extrabold text-slate-950">{step.title}</h2><p className="mt-1 text-sm leading-6 text-slate-600">{step.purpose}</p><div className="mt-4 grid gap-4 md:grid-cols-2"><div className="rounded-xl bg-slate-50 p-4"><h3 className="flex items-center gap-2 text-sm font-bold text-slate-800"><Icon className="h-4 w-4 text-blue-600"/> Actions to take</h3><ul className="mt-3 space-y-2">{step.tasks.map(task => <li key={task} className="flex gap-2 text-sm leading-5 text-slate-600"><ArrowRight className="mt-0.5 h-4 w-4 shrink-0 text-blue-500"/>{task}</li>)}</ul></div><div className="rounded-xl border border-blue-100 bg-blue-50/70 p-4"><h3 className="text-sm font-bold text-blue-950">Practical deliverable</h3><p className="mt-2 text-sm leading-6 text-blue-900">{step.project}</p></div></div></div></div></article>; })}</section>
    <footer className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-600">Tip: Start with the first incomplete phase, keep small weekly goals, and adjust the plan to the requirements of real job postings in your location.</footer>
  </div>;
};
