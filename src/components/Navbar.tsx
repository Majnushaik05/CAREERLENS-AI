import React from 'react';
import { LogOut, ChevronRight, HelpCircle } from 'lucide-react';
import { CareerLensLogo } from './CareerLensLogo';

interface NavbarProps {
  workspace: 'Job Seeker Workspace' | 'Recruiter Workspace';
  onSwitchWorkspace: (ws: 'Job Seeker Workspace' | 'Recruiter Workspace') => void;
  activeTool: string;
  username: string;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  workspace,
  onSwitchWorkspace,
  activeTool,
  username,
  onLogout,
}) => {
  const isSeeker = workspace === 'Job Seeker Workspace';

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200 px-6 py-3 shadow-xs">
      <div className="max-w-[1440px] mx-auto flex items-center justify-between gap-6">
        {/* Zone 1: Official Emblem Brand Wordmark */}
        <div className="flex items-center gap-4 shrink-0">
          <a href="/" className="flex items-center font-bold text-slate-900 text-sm tracking-tight whitespace-nowrap">
            <CareerLensLogo size="sm" showText={true} />
          </a>

          <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-400 pl-3 border-l border-slate-200">
            <span className={isSeeker ? 'text-blue-600 font-semibold' : 'text-purple-600 font-semibold'}>
              {isSeeker ? 'Candidate Workspace' : 'Recruiter Workspace'}
            </span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
            <span className="font-semibold text-slate-800">{activeTool}</span>
          </div>
        </div>

        {/* Zone 2: Workspace Segmented Control in Clean Light Card */}
        <div className="hidden md:flex items-center p-1 bg-slate-100 border border-slate-200 rounded-lg">
          <button
            onClick={() => onSwitchWorkspace('Job Seeker Workspace')}
            className={`px-4 py-1.5 text-xs font-semibold rounded-md transition whitespace-nowrap ${
              isSeeker
                ? 'bg-white text-blue-700 shadow-xs border border-slate-200/80 font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Candidate Workspace
          </button>
          <button
            onClick={() => onSwitchWorkspace('Recruiter Workspace')}
            className={`px-4 py-1.5 text-xs font-semibold rounded-md transition whitespace-nowrap ${
              !isSeeker
                ? 'bg-white text-purple-700 shadow-xs border border-slate-200/80 font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Recruiter Workspace
          </button>
        </div>

        {/* Zone 3: User Monogram Profile with Verified Status */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="flex items-center gap-2.5 pl-2">
            <div className="w-8 h-8 rounded-lg border border-blue-200 bg-blue-50 text-blue-700 font-bold text-xs flex items-center justify-center shrink-0 shadow-2xs">
              {username.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || 'U'}
            </div>
            <div className="hidden lg:block text-left">
              <div className="text-xs font-bold text-slate-900 max-w-[130px] truncate">{username}</div>
              <div className="text-[10px] text-emerald-600 font-medium flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>Active Session</span>
              </div>
            </div>
          </div>

          <button
            onClick={onLogout}
            className="p-2 rounded-lg border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-500 hover:text-slate-800 transition"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
