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
} from 'lucide-react';
import { CareerLensLogo } from './CareerLensLogo';

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
    { name: 'Dashboard', icon: LayoutDashboard },
    { name: 'Resume Intelligence', icon: FileText },
    { name: 'Pre-Interview Assessment', icon: GraduationCap },
    { name: 'Mock Interview', icon: Mic },
    { name: 'Job Match', icon: Target },
    { name: 'Salary Estimation', icon: DollarSign },
    { name: 'Career Roadmap', icon: Route },
    { name: 'Job Detection', icon: ShieldAlert },
    { name: 'Resume Builder', icon: PenTool },
    { name: 'Career Assistant', icon: Bot },
  ];

  const recruiterTools = [
    { name: 'Recruiter Dashboard', icon: LayoutDashboard },
    { name: 'Hiring Campaign', icon: Megaphone },
    { name: 'Bulk Resume Screening', icon: UploadCloud },
    { name: 'Shortlisted Candidates', icon: Award },
    { name: 'Assessment Dispatcher', icon: Send },
    { name: 'Assessment Results', icon: BarChart3 },
    { name: 'Interview Pipeline', icon: Users },
  ];

  const tools = isSeeker ? seekerTools : recruiterTools;

  return (
    <aside className="w-full lg:w-72 bg-slate-950 border-r border-slate-800 flex flex-col shrink-0 min-h-full text-slate-100 selection:bg-blue-600 selection:text-white">
      {/* Workspace Context Switcher for mobile screens */}
      <div className="p-3 border-b border-slate-800 lg:hidden">
        <div className="grid grid-cols-2 gap-1 p-1 bg-slate-900 rounded-xl border border-slate-800">
          <button
            onClick={() => onSelectWorkspace('Job Seeker Workspace')}
            className={`py-1.5 px-2 text-xs font-semibold rounded-md transition ${
              isSeeker ? 'bg-blue-600 text-white shadow font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            Candidate
          </button>
          <button
            onClick={() => onSelectWorkspace('Recruiter Workspace')}
            className={`py-1.5 px-2 text-xs font-semibold rounded-md transition ${
              !isSeeker ? 'bg-purple-600 text-white shadow font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            Recruiter
          </button>
        </div>
      </div>

      {/* Navigation Tools List with subtle framer-motion micro-animations */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        <div className="px-3 pt-2 pb-2 text-[10px] font-bold text-slate-500 uppercase tracking-[0.18em] flex items-center justify-between">
          <span>{isSeeker ? 'WORKSPACE MODULES' : 'RECRUITER MODULES'}</span>
          <span className="font-mono text-slate-400 text-[10px]">{tools.length}</span>
        </div>

        <div className="space-y-2">
          {tools.map(tool => {
            const Icon = tool.icon;
            const isSelected = activeTool === tool.name;
            return (
              <motion.button
                key={tool.name}
                whileHover={{ x: 3 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onSelectTool(tool.name)}
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-semibold transition relative border ${
                  isSelected
                    ? isSeeker
                      ? 'bg-blue-500/15 text-blue-200 border-blue-400/30 shadow-sm'
                      : 'bg-purple-500/15 text-purple-200 border-purple-400/30 shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-slate-900 border-transparent hover:border-slate-800'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon
                    className={`w-4 h-4 shrink-0 transition-colors ${
                      isSelected
                        ? isSeeker
                          ? 'text-blue-300'
                          : 'text-purple-300'
                        : 'text-slate-500'
                    }`}
                  />
                  <span className="truncate">{tool.name}</span>
                </div>
                
                {isSelected && <ChevronRight className="w-4 h-4 opacity-70 shrink-0" />}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Bottom Brand Card with App Logo Emblem & Status */}
      <div className="p-4 border-t border-slate-800 bg-slate-950">
        <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800 shadow-sm">
          <div className="flex items-center gap-2.5 min-w-0">
            <CareerLensLogo size="xs" />
            <div className="min-w-0">
              <div className="text-xs font-bold text-white truncate">{username}</div>
              <div className="text-[10px] text-emerald-600 font-medium flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span>Career Lens</span>
              </div>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            title="Sign Out"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
};
