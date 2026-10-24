
import React from "react";
import {
  LayoutDashboard,
  FileText,
  ClipboardCheck,
  Users,
  Send,
  Trophy,
  BriefcaseBusiness,
  Map,
  MessageSquare,
  Settings,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  X,
  LogOut,
} from "lucide-react";

interface SidebarProps {
  activeItem?: string;
  onNavigate?: (item: string) => void;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
  userName?: string;
  userRole?: string;
  onLogout?: () => void;
}

interface NavigationItem {
  label: string;
  icon: React.ReactNode;
  section: string;
}

const navigationItems: NavigationItem[] = [
  {
    label: "Dashboard",
    icon: <LayoutDashboard size={19} />,
    section: "WORKSPACE",
  },
  {
    label: "Resume Intelligence",
    icon: <FileText size={19} />,
    section: "WORKSPACE",
  },
  {
    label: "Job Matching",
    icon: <BriefcaseBusiness size={19} />,
    section: "WORKSPACE",
  },
  {
    label: "Career Roadmap",
    icon: <Map size={19} />,
    section: "WORKSPACE",
  },
  {
    label: "Career Assistant",
    icon: <MessageSquare size={19} />,
    section: "WORKSPACE",
  },
  {
    label: "Assessment Dispatcher",
    icon: <Send size={19} />,
    section: "RECRUITMENT",
  },
  {
    label: "Assessment Results",
    icon: <Trophy size={19} />,
    section: "RECRUITMENT",
  },
  {
    label: "Candidate Screening",
    icon: <Users size={19} />,
    section: "RECRUITMENT",
  },
  {
    label: "Assessments",
    icon: <ClipboardCheck size={19} />,
    section: "RECRUITMENT",
  },
  {
    label: "Settings",
    icon: <Settings size={19} />,
    section: "PREFERENCES",
  },
];

const Sidebar: React.FC<SidebarProps> = ({
  activeItem = "Dashboard",
  onNavigate,
  collapsed = false,
  onToggleCollapse,
  mobileOpen = false,
  onCloseMobile,
  userName = "CareerLens User",
  userRole = "Career Intelligence",
  onLogout,
}) => {
  const sections = Array.from(
    new Set(navigationItems.map((item) => item.section))
  );

  const handleNavigate = (label: string) => {
    onNavigate?.(label);
    onCloseMobile?.();
  };

  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <button
          type="button"
          aria-label="Close navigation"
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-sm lg:hidden"
        />
      )}

      <aside
        className={[
          "fixed inset-y-0 left-0 z-50 flex h-screen flex-col",
          "border-r border-slate-200 bg-white text-slate-800",
          "shadow-sm transition-all duration-300",
          collapsed ? "w-[84px]" : "w-[272px]",
          mobileOpen
            ? "translate-x-0"
            : "-translate-x-full lg:translate-x-0",
        ].join(" ")}
      >
        {/* Brand */}
        <div className="flex min-h-[82px] items-center justify-between border-b border-slate-100 px-5">
          <button
            type="button"
            onClick={() => handleNavigate("Dashboard")}
            className="flex min-w-0 items-center gap-3 text-left"
            aria-label="CareerLens AI home"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-200">
              <Sparkles size={21} />
            </div>

            {!collapsed && (
              <div className="min-w-0">
                <h1 className="truncate text-lg font-extrabold tracking-tight text-slate-900">
                  CareerLens
                  <span className="text-blue-600"> AI</span>
                </h1>
                <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                  Career Intelligence
                </p>
              </div>
            )}
          </button>

          {/* Close on mobile */}
          <button
            type="button"
            onClick={onCloseMobile}
            aria-label="Close sidebar"
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 lg:hidden"
          >
            <X size={19} />
          </button>
        </div>

        {/* Workspace label */}
        {!collapsed && (
          <div className="px-6 pb-2 pt-6">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
              Navigation
            </p>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-4">
          {sections.map((section) => {
            const items = navigationItems.filter(
              (item) => item.section === section
            );

            return (
              <div key={section}>
                {!collapsed && (
                  <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
                    {section}
                  </p>
                )}

                <div className="space-y-1">
                  {items.map((item) => {
                    const active = activeItem === item.label;

                    return (
                      <button
                        key={item.label}
                        type="button"
                        title={collapsed ? item.label : undefined}
                        onClick={() => handleNavigate(item.label)}
                        aria-current={active ? "page" : undefined}
                        className={[
                          "group relative flex w-full items-center gap-3",
                          "rounded-xl px-3 py-3 text-left text-sm",
                          "transition-all duration-200",
                          collapsed ? "justify-center" : "",
                          active
                            ? "bg-blue-50 font-semibold text-blue-700"
                            : "font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900",
                        ].join(" ")}
                      >
                        {active && (
                          <span className="absolute bottom-2 left-0 top-2 w-[3px] rounded-r-full bg-blue-600" />
                        )}

                        <span
                          className={[
                            "shrink-0 transition-colors",
                            active
                              ? "text-blue-600"
                              : "text-slate-400 group-hover:text-slate-700",
                          ].join(" ")}
                        >
                          {item.icon}
                        </span>

                        {!collapsed && (
                          <span className="truncate">{item.label}</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </nav>

        {/* AI status */}
        {!collapsed && (
          <div className="mx-4 mb-4 rounded-xl border border-blue-100 bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-50" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </span>
              <span className="text-xs font-bold text-slate-800">
                CareerLens AI
              </span>
            </div>

            <p className="mt-2 text-xs leading-relaxed text-slate-500">
              Your career intelligence workspace is ready.
            </p>
          </div>
        )}

        {/* User profile */}
        <div className="border-t border-slate-200 p-3">
          <div
            className={[
              "flex items-center gap-3 rounded-xl p-2",
              collapsed ? "justify-center" : "",
            ].join(" ")}
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700">
              {userName.trim().charAt(0).toUpperCase() || "U"}
            </div>

            {!collapsed && (
              <>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-slate-800">
                    {userName}
                  </p>
                  <p className="mt-0.5 truncate text-xs text-slate-500">
                    {userRole}
                  </p>
                </div>

                {onLogout && (
                  <button
                    type="button"
                    onClick={onLogout}
                    title="Log out"
                    aria-label="Log out"
                    className="rounded-lg p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-600"
                  >
                    <LogOut size={17} />
                  </button>
                )}
              </>
            )}
          </div>

          {/* Collapse button */}
          {onToggleCollapse && (
            <button
              type="button"
              onClick={onToggleCollapse}
              className="mt-2 hidden w-full items-center justify-center gap-2 rounded-lg border border-slate-200 py-2 text-xs font-medium text-slate-500 transition hover:bg-slate-50 hover:text-slate-800 lg:flex"
            >
              {collapsed ? (
                <ChevronRight size={16} />
              ) : (
                <>
                  <ChevronLeft size={16} />
                  Collapse sidebar
                </>
              )}
            </button>
          )}
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
