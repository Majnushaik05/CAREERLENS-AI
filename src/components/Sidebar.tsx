import React from 'react';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  FileText,
  GraduationCap,
  Mic,
  Target,
  DollarSign,
  Route,
  ShieldAlert,
  PenTool,
  Bot,
  Megaphone,
  UploadCloud,
  Award,
  Send,
  BarChart3,
  Users,
  LogOut,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { IMAGES } from '../assets/images';

interface SidebarProps {
  workspace: 'Job Seeker Workspace' | 'Recruiter Workspace';
  onSelectWorkspace: (ws: 'Job Seeker Workspace' | 'Recruiter Workspace') => void;
  activeTool: string;
  onSelectTool: (tool: string) => void;
  username: string;
  onLogout: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  workspace,
  onSelectWorkspace,
  activeTool,
  onSelectTool,
  username,
  onLogout,
}) => {
  const isSeeker = workspace === 'Job Seeker Workspace';

  const seekerTools = [
    { name: 'Dashboard', icon: LayoutDashboard, tag: 'Overview' },
    { name: 'Resume Intelligence', icon: FileText, tag: 'ATS Audit' },
    { name: 'Pre-Interview Assessment', icon: GraduationCap, tag: 'Practice' },
    { name: 'Mock Interview', icon: Mic, tag: 'STAR Prep' },
    { name: 'Job Match', icon: Target, tag: 'Alignment' },
    { name: 'Salary Estimation', icon: DollarSign, tag: 'Market' },
    { name: 'Career Roadmap', icon: Route, tag: 'Growth' },
    { name: 'Job Detection', icon: ShieldAlert, tag: 'Safety' },
    { name: 'Resume Builder', icon: PenTool, tag: 'Editor' },
    { name: 'Career Assistant', icon: Bot, tag: 'Advisor' },
  ];

  const recruiterTools = [
    { name: 'Recruiter Dashboard', icon: LayoutDashboard, tag: 'Overview' },
    { name: 'Hiring Campaign', icon: Megaphone, tag: 'Roles' },
    { name: 'Bulk Resume Screening', icon: UploadCloud, tag: 'Screening' },
    { name: 'Shortlisted Candidates', icon: Award, tag: 'Qualified' },
    { name: 'Assessment Dispatcher', icon: Send, tag: 'Tokens' },
    { name: 'Assessment Results', icon: BarChart3, tag: 'Vault' },
    { name: 'Interview Pipeline', icon: Users, tag: 'Kanban' },
  ];

  const tools = isSeeker ? seekerTools : recruiterTools;

  return (
    <aside className="w-full lg:w-64 bg-white border-r border-slate-200 flex flex-col shrink-0 min-h-full selection:bg-blue-600 selection:text-white">
      {/* Workspace Context Switcher for mobile screens */}
      <div className="p-3 border-b border-slate-100 lg:hidden">
        <div className="grid grid-cols-2 gap-1 p-1 bg-slate-100 rounded-lg">
          <button
            onClick={() => onSelectWorkspace('Job Seeker Workspace')}
            className={`py-1.5 px-2 text-xs font-semibold rounded-md transition ${
              isSeeker ? 'bg-white text-blue-700 shadow-xs font-bold' : 'text-slate-600'
            }`}
          >
            Candidate
          </button>
          <button
            onClick={() => onSelectWorkspace('Recruiter Workspace')}
            className={`py-1.5 px-2 text-xs font-semibold rounded-md transition ${
              !isSeeker ? 'bg-white text-purple-700 shadow-xs font-bold' : 'text-slate-600'
            }`}
          >
            Recruiter
          </button>
        </div>
      </div>

      {/* Navigation Tools List with subtle framer-motion micro-animations */}
      <div className="flex-1 overflow-y-auto p-3 space-y-1">
        <div className="px-3 pt-2 pb-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
          <span>{isSeeker ? 'WORKSPACE MODULES' : 'RECRUITER MODULES'}</span>
          <span className="font-mono text-slate-400 text-[10px]">{tools.length}</span>
        </div>

        <div className="space-y-1">
          {tools.map(tool => {
            const Icon = tool.icon;
            const isSelected = activeTool === tool.name;
            return (
              <motion.button
                key={tool.name}
                whileHover={{ x: 3 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onSelectTool(tool.name)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition relative ${
                  isSelected
                    ? isSeeker
                      ? 'bg-blue-50 text-blue-800 border border-blue-200/90 font-bold shadow-2xs'
                      : 'bg-purple-50 text-purple-800 border border-purple-200/90 font-bold shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon
                    className={`w-4 h-4 shrink-0 transition-colors ${
                      isSelected
                        ? isSeeker
                          ? 'text-blue-700'
                          : 'text-purple-700'
                        : 'text-slate-400'
                    }`}
                  />
                  <span className="truncate">{tool.name}</span>
                </div>
                
                <div className="flex items-center gap-1.5 shrink-0">
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-md font-mono ${
                      isSelected
                        ? isSeeker
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-purple-100 text-purple-800'
                        : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {tool.tag}
                  </span>
                  {isSelected && <ChevronRight className="w-3.5 h-3.5 opacity-60" />}
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Bottom Brand Card with App Logo Emblem & Status */}
      <div className="p-3 border-t border-slate-100 bg-slate-50/70">
        <div className="flex items-center justify-between p-2 rounded-xl bg-white border border-slate-200 shadow-2xs">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg overflow-hidden border border-slate-200 bg-slate-900 shrink-0 shadow-2xs">
              <img src={IMAGES.logo} alt="Career Lens Emblem" className="w-full h-full object-cover" />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold text-slate-900 truncate">{username}</div>
              <div className="text-[10px] text-emerald-600 font-medium flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span>Career Lens</span>
              </div>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
            title="Sign Out"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
};
