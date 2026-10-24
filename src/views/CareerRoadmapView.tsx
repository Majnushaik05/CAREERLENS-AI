```tsx
import React, { useMemo, useState } from 'react';
import {
  Target,
  Compass,
  BookOpen,
  Code2,
  BriefcaseBusiness,
  CheckCircle2,
  Circle,
  Clock,
  TrendingUp,
  ChevronDown,
  ChevronUp,
  GraduationCap,
  Rocket,
  RotateCcw,
  Trophy,
} from 'lucide-react';

type MilestoneStatus = 'Not Started' | 'In Progress' | 'Completed';

interface RoadmapMilestone {
  id: string;
  title: string;
  description: string;
  duration: string;
  skills: string[];
  tasks: string[];
  project: string;
  icon: React.ReactNode;
  status: MilestoneStatus;
}

const CAREER_ROLES = [
  'AI Engineer',
  'Machine Learning Engineer',
  'Data Scientist',
  'Data Analyst',
  'Software Developer',
  'Full Stack Developer',
  'Frontend Developer',
  'Backend Developer',
  'DevOps Engineer',
  'Cloud Engineer',
  'Cybersecurity Analyst',
  'UI/UX Designer',
  'Product Manager',
  'Business Analyst',
  'Digital Marketing Specialist',
  'HR Specialist',
  'Financial Analyst',
  'Custom Role',
];

const ROADMAP_TEMPLATES: Record<
  string,
  { skills: string[][]; projects: string[] }
> = {
  'AI Engineer': {
    skills: [
      ['Python', 'Programming fundamentals', 'Git and GitHub'],
      ['NumPy', 'Pandas', 'Statistics', 'Linear algebra'],
      ['Scikit-learn', 'Model evaluation', 'Feature engineering'],
      ['PyTorch or TensorFlow', 'Neural networks', 'Deep learning'],
      ['LLMs', 'Embeddings', 'RAG', 'Prompt engineering'],
      ['FastAPI', 'Docker basics', 'Deployment', 'Monitoring'],
    ],
    projects: [
      'Build a Python application and publish it on GitHub.',
      'Analyze a real dataset and create visualizations.',
      'Train and evaluate a machine-learning model.',
      'Build an image, text, or time-series deep-learning project.',
      'Create a document-question-answering application using an LLM.',
      'Deploy an AI application with a usable interface and documentation.',
    ],
  },
  'Machine Learning Engineer': {
    skills: [
      ['Python', 'Git', 'Data structures'],
      ['NumPy', 'Pandas', 'Statistics', 'SQL'],
      ['Scikit-learn', 'Feature engineering', 'Validation'],
      ['PyTorch', 'Neural networks', 'Experiment tracking'],
      ['ML pipelines', 'APIs', 'Docker'],
      ['Model serving', 'Monitoring', 'Cloud fundamentals'],
    ],
    projects: [
      'Create a reusable Python data-processing package.',
      'Analyze a dataset using SQL and Python.',
      'Build a classification model with proper evaluation.',
      'Compare models and document the experiments.',
      'Serve a model through a REST API.',
      'Deploy a model and document how to monitor it.',
    ],
  },
  'Data Scientist': {
    skills: [
      ['Python', 'SQL', 'Git'],
      ['Pandas', 'Data cleaning', 'Data visualization'],
      ['Probability', 'Statistics', 'Hypothesis testing'],
      ['Scikit-learn', 'Regression', 'Classification'],
      ['Feature engineering', 'Experiment design', 'Model interpretation'],
      ['Storytelling', 'Dashboards', 'Business communication'],
    ],
    projects: [
      'Write Python scripts to clean and analyze data.',
      'Produce an exploratory data analysis report.',
      'Analyze a business question using statistical methods.',
      'Build and evaluate a predictive model.',
      'Explain model results and limitations.',
      'Publish a complete end-to-end data science case study.',
    ],
  },
  'Data Analyst': {
    skills: [
      ['Excel', 'Spreadsheets', 'Data fundamentals'],
      ['SQL', 'Joins', 'Aggregations', 'Window functions'],
      ['Power BI or Tableau', 'Dashboard design'],
      ['Python', 'Pandas', 'Data cleaning'],
      ['Statistics', 'KPIs', 'Business analysis'],
      ['Presentation', 'Portfolio', 'Interview preparation'],
    ],
    projects: [
      'Create a spreadsheet report with formulas and charts.',
      'Answer business questions using SQL.',
      'Build an interactive business dashboard.',
      'Analyze a dataset using Python.',
      'Write recommendations based on measurable KPIs.',
      'Publish three case studies in a professional portfolio.',
    ],
  },
  'Software Developer': {
    skills: [
      ['One programming language', 'Git', 'Problem solving'],
      ['Data structures', 'Algorithms', 'OOP'],
      ['HTTP', 'APIs', 'Testing'],
      ['SQL', 'Database design', 'Authentication'],
      ['Frameworks', 'Clean code', 'System design basics'],
      ['Deployment', 'Documentation', 'Interview preparation'],
    ],
    projects: [
      'Build a command-line application.',
      'Solve coding problems and document solutions.',
      'Create a tested REST API.',
      'Build an application connected to a database.',
      'Create and test a complete full-stack project.',
      'Deploy a project and publish a portfolio.',
    ],
  },
  'Full Stack Developer': {
    skills: [
      ['HTML', 'CSS', 'JavaScript', 'Git'],
      ['TypeScript', 'React', 'Responsive design'],
      ['Node.js', 'Express', 'REST APIs'],
      ['SQL or PostgreSQL', 'Data modeling', 'Authentication'],
      ['Testing', 'Security basics', 'Performance'],
      ['Deployment', 'CI/CD basics', 'Portfolio'],
    ],
    projects: [
      'Build a responsive personal website.',
      'Create a React application with reusable components.',
      'Develop a REST API with validation and error handling.',
      'Connect a frontend and backend to a database.',
      'Add authentication and automated tests.',
      'Deploy a full-stack application and document its architecture.',
    ],
  },
  'Frontend Developer': {
    skills: [
      ['HTML', 'CSS', 'JavaScript', 'Git'],
      ['Responsive design', 'Accessibility', 'Flexbox', 'Grid'],
      ['React', 'Components', 'Hooks'],
      ['TypeScript', 'API integration', 'State management'],
      ['Testing', 'Performance', 'Browser tools'],
      ['Deployment', 'Portfolio', 'Interview preparation'],
    ],
    projects: [
      'Create a responsive landing page.',
      'Rebuild a website layout for mobile and desktop.',
      'Build a React application with multiple views.',
      'Create a typed application that consumes an API.',
      'Add tests, accessibility improvements, and performance checks.',
      'Publish a portfolio with three polished projects.',
    ],
  },
  'Backend Developer': {
    skills: [
      ['Python, JavaScript, Java, or another language', 'Git'],
      ['HTTP', 'REST APIs', 'Validation'],
      ['SQL', 'Database design', 'Indexes'],
      ['Authentication', 'Authorization', 'Security'],
      ['Automated tests', 'Caching', 'Background jobs'],
      ['Deployment', 'Logging', 'System design'],
    ],
    projects: [
      'Build a command-line service.',
      'Create a REST API with validation.',
      'Design a relational database for an application.',
      'Add authentication and role-based authorization.',
      'Add tests, caching, and reliable error handling.',
      'Deploy a documented API with logs and health checks.',
    ],
  },
};

const DEFAULT_SKILLS = [
  ['Role fundamentals', 'Industry terminology', 'Communication'],
  ['Core tools', 'Practical exercises', 'Problem solving'],
  ['Intermediate concepts', 'Analytical thinking', 'Best practices'],
  ['Advanced tools', 'Independent work', 'Quality assurance'],
  ['Real-world workflows', 'Collaboration', 'Documentation'],
  ['Portfolio', 'Interview preparation', 'Career planning'],
];

const DEFAULT_PROJECTS = [
  'Research the role and write a personal learning plan.',
  'Complete beginner exercises using the main industry tools.',
  'Complete a practical assignment relevant to the role.',
  'Build a larger project demonstrating independent work.',
  'Create a real-world case study and gather feedback.',
  'Publish a professional portfolio and prepare for interviews.',
];

function createRoadmap(role: string): RoadmapMilestone[] {
  const template = ROADMAP_TEMPLATES[role];
  const skillGroups = template?.skills ?? DEFAULT_SKILLS;
  const projects = template?.projects ?? DEFAULT_PROJECTS;

  const phases = [
    {
      title: 'Foundation',
      description: 'Build the fundamentals required for your target role.',
      duration: 'Weeks 1–2',
      icon: <GraduationCap className="h-5 w-5" />,
    },
    {
      title: 'Core Skills',
      description: 'Learn the primary tools, concepts, and workflows.',
      duration: 'Weeks 3–5',
      icon: <BookOpen className="h-5 w-5" />,
    },
    {
      title: 'Practical Skills',
      description: 'Apply your knowledge through guided exercises.',
      duration: 'Weeks 6–8',
      icon: <Code2 className="h-5 w-5" />,
    },
    {
      title: 'Portfolio Project',
      description: 'Build a substantial project that demonstrates your skills.',
      duration: 'Weeks 9–12',
      icon: <Rocket className="h-5 w-5" />,
    },
    {
      title: 'Industry Readiness',
      description: 'Practice real-world workflows and improve your project.',
      duration: 'Weeks 13–16',
      icon: <BriefcaseBusiness className="h-5 w-5" />,
    },
    {
      title: 'Job Preparation',
      description: 'Prepare applications, interviews, and a professional portfolio.',
      duration: 'Weeks 17–20',
      icon: <Trophy className="h-5 w-5" />,
    },
  ];

  return phases.map((phase, index) => ({
    id: `${role.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${index + 1}`,
    title: phase.title,
    description: phase.description,
    duration: phase.duration,
    skills: skillGroups[index],
    tasks: [
      `Study and practice ${skillGroups[index][0]}.`,
      `Complete exercises using ${skillGroups[index]
        .slice(1, 3)
        .join(' and ')}.`,
      'Write down what you learned and identify gaps to revisit.',
    ],
    project: projects[index],
    icon: phase.icon,
    status: 'Not Started',
  }));
}

const CareerRoadmapView: React.FC = () => {
  const [selectedRole, setSelectedRole] = useState('AI Engineer');
  const [customRole, setCustomRole] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>('phase-1');

  const [roadmaps, setRoadmaps] = useState<
    Record<string, RoadmapMilestone[]>
  >({});

  const activeRole =
    selectedRole === 'Custom Role'
      ? customRole.trim() || 'Custom Career'
      : selectedRole;

  const roadmapKey = activeRole.toLowerCase();

  const milestones = useMemo(
    () => roadmaps[roadmapKey] ?? createRoadmap(activeRole),
    [roadmaps, roadmapKey, activeRole]
  );

  const completedCount = milestones.filter(
    (item) => item.status === 'Completed'
  ).length;

  const inProgressCount = milestones.filter(
    (item) => item.status === 'In Progress'
  ).length;

  const progress =
    milestones.length > 0
      ? Math.round((completedCount / milestones.length) * 100)
      : 0;

  const updateStatus = (
    milestoneId: string,
    status: MilestoneStatus
  ) => {
    setRoadmaps((previous) => {
      const current = previous[roadmapKey] ?? createRoadmap(activeRole);

      return {
        ...previous,
        [roadmapKey]: current.map((milestone) =>
          milestone.id === milestoneId
            ? { ...milestone, status }
            : milestone
        ),
      };
    });
  };

  const resetRoadmap = () => {
    setRoadmaps((previous) => ({
      ...previous,
      [roadmapKey]: createRoadmap(activeRole),
    }));
    setExpandedId('phase-1');
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6 pb-10">
      <header className="overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-indigo-950 to-purple-900 p-6 text-white shadow-lg sm:p-9">
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
          <div className="max-w-2xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-bold text-purple-100">
              <Compass className="h-4 w-4" />
              CAREER INTELLIGENCE
            </div>

            <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
              Your Career Roadmap
            </h1>

            <p className="mt-3 text-sm leading-6 text-slate-300 sm:text-base">
              Turn your career goal into a clear, step-by-step plan.
              Build practical skills, complete projects, and track your
              progress toward professional readiness.
            </p>
          </div>

          <div className="flex h-28 w-28 shrink-0 flex-col items-center justify-center self-start rounded-2xl border border-white/20 bg-white/10 lg:self-center">
            <Target className="mb-2 h-6 w-6 text-purple-300" />
            <span className="text-2xl font-black">{progress}%</span>
            <span className="text-xs text-slate-300">Completed</span>
          </div>
        </div>
      </header>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">Total milestones</p>
          <p className="mt-2 text-3xl font-black text-slate-900">
            {milestones.length}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Across your learning journey
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">Completed phases</p>
          <p className="mt-2 text-3xl font-black text-emerald-600">
            {completedCount}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Keep building consistent progress
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">In progress</p>
          <p className="mt-2 text-3xl font-black text-indigo-600">
            {inProgressCount}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Phases you are currently working on
          </p>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div className="flex-1">
            <label
              htmlFor="career-role"
              className="mb-2 block text-sm font-bold text-slate-800"
            >
              Choose your target career
            </label>

            <select
              id="career-role"
              value={selectedRole}
              onChange={(event) => {
                setSelectedRole(event.target.value);
                setExpandedId('phase-1');
              }}
              className="w-full rounded-xl border border-slate-300 bg-white p-3 text-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
            >
              {CAREER_ROLES.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              )}
            </select>
          </div>

          <button
            type="button"
            onClick={resetRoadmap}
            className="flex items-center justify-center gap-2 rounded-xl border border-slate-300 px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50"
          >
            <RotateCcw className="h-4 w-4" />
            Reset progress
          </button>
        </div>

        {selectedRole === 'Custom Role' && (
          <div className="mt-4">
            <label
              htmlFor="custom-role"
              className="mb-2 block text-sm font-bold text-slate-800"
            >
              Enter any career role
            </label>

            <input
              id="custom-role"
              value={customRole}
              onChange={(event) => {
                setCustomRole(event.target.value);
                setExpandedId('phase-1');
              }}
              placeholder="e.g. Robotics Engineer, Teacher, Accountant"
              className="w-full rounded-xl border border-slate-300 p-3 text-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
            />
          </div>
        )}

        <div className="mt-5 rounded-xl bg-slate-50 p-4">
          <div className="mb-2 flex items-center justify-between gap-3">
            <span className="text-sm font-bold text-slate-700">
              Overall roadmap progress
            </span>
            <span className="text-sm font-black text-purple-700">
              {completedCount}/{milestones.length} phases
            </span>
          </div>

          <div
            className="h-3 overflow-hidden rounded-full bg-slate-200"
            role="progressbar"
            aria-label="Career roadmap completion"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={progress}
          >
            <div
              className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </section>

      <section>
        <div className="mb-5">
          <h2 className="text-xl font-black text-slate-900">
            Your learning journey
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Expand each phase to see its skills, activities, and project.
          </p>
        </div>

        <div className="space-y-4">
          {milestones.map((milestone, index) => {
            const isExpanded =
              expandedId === `phase-${index + 1}`;

            const isCompleted = milestone.status === 'Completed';

            return (
              <article
                key={milestone.id}
                className={`overflow-hidden rounded-2xl border bg-white shadow-sm transition ${
                  isCompleted
                    ? 'border-emerald-200'
                    : 'border-slate-200'
                }`}
              >
                <button
                  type="button"
                  onClick={() =>
                    setExpandedId(
                      isExpanded ? null : `phase-${index + 1}`
                    )
                  }
                  aria-expanded={isExpanded}
                  className="flex w-full items-center gap-4 p-5 text-left sm:p-6"
                >
                  <div
                    className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${
                      isCompleted
                        ? 'bg-emerald-100 text-emerald-700'
                        : milestone.status === 'In Progress'
                          ? 'bg-indigo-100 text-indigo-700'
                          : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="h-6 w-6" />
                    ) : (
                      milestone.icon
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-bold uppercase tracking-wide text-purple-600">
                        Phase {index + 1}
                      </span>

                      <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                        <Clock className="mr-1 inline h-3 w-3" />
                        {milestone.duration}
                      </span>
                    </div>

                    <h3 className="mt-1 text-base font-black text-slate-900 sm:text-lg">
                      {milestone.title}
                    </h3>

                    <p className="mt-1 text-sm text-slate-500">
                      {milestone.description}
                    </p>
                  </div>

                  <div className="shrink-0 text-slate-400">
                    {isExpanded ? (
                      <ChevronUp className="h-5 w-5" />
                    ) : (
                      <ChevronDown className="h-5 w-5" />
                    )}
                  </div>
                </button>

                {isExpanded && (
                  <div className="border-t border-slate-100 p-5 sm:p-6">
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                      <div>
                        <h4 className="flex items-center gap-2 text-sm font-bold text-slate-900">
                          <BookOpen className="h-4 w-4 text-purple-600" />
                          Skills to develop
                        </h4>

                        <div className="mt-3 flex flex-wrap gap-2">
                          {milestone.skills.map((skill) => (
                            <span
                              key={skill}
                              className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-700"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>

                        <h4 className="mt-6 flex items-center gap-2 text-sm font-bold text-slate-900">
                          <CheckCircle2 className="h-4 w-4 text-purple-600" />
                          Suggested activities
                        </h4>

                        <ul className="mt-3 space-y-3">
                          {milestone.tasks.map((task) => (
                            <li
                              key={task}
                              className="flex items-start gap-2 text-sm leading-6 text-slate-600"
                            >
                              <Circle className="mt-1 h-4 w-4 shrink-0 text-slate-300" />
                              {task}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="space-y-5">
                        <div className="rounded-xl border border-indigo-100 bg-indigo-50/70 p-4">
                          <h4 className="flex items-center gap-2 text-sm font-bold text-indigo-900">
                            <Rocket className="h-4 w-4" />
                            Recommended project
                          </h4>

                          <p className="mt-2 text-sm leading-6 text-indigo-900/80">
                            {milestone.project}
                          </p>

                          <p className="mt-3 text-xs leading-5 text-indigo-800">
                            Tip: Save your work in a version-controlled
                            repository and document what you learned.
                          </p>
                        </div>

                        <div>
                          <label
                            htmlFor={`status-${milestone.id}`}
                            className="mb-2 block text-sm font-bold text-slate-800"
                          >
                            Update phase status
                          </label>

                          <select
                            id={`status-${milestone.id}`}
                            value={milestone.status}
                            onChange={(event) =>
                              updateStatus(
                                milestone.id,
                                event.target.value as MilestoneStatus
                              )
                            }
                            className="w-full rounded-xl border border-slate-300 bg-white p-3 text-sm outline-none focus:border-purple-500"
                          >
                            <option value="Not Started">
                              Not Started
                            </option>
                            <option value="In Progress">
                              In Progress
                            </option>
                            <option value="Completed">
                              Completed
                            </option>
                          </select>

                          <p className="mt-2 text-xs text-slate-500">
                            Progress updates immediately in this view.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      </section>

      <section className="rounded-2xl border border-purple-100 bg-gradient-to-r from-purple-50 to-indigo-50 p-5 sm:p-6">
        <div className="flex items-start gap-4">
          <div className="rounded-xl bg-white p-3 text-purple-700 shadow-sm">
            <TrendingUp className="h-6 w-6" />
          </div>

          <div>
            <h2 className="font-black text-slate-900">
              Your next step matters
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Follow one phase at a time. Focus on practical skills,
              meaningful projects, and measurable progress rather than
              rushing through topics. Adjust the schedule to your current
              skill level and available study time.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default CareerRoadmapView;
```
