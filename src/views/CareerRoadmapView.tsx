import React, { useMemo, useState } from 'react';
import { ResumeAnalysis } from '../types';
import {
  CheckCircle2,
  Circle,
  Search,
  TrendingUp,
  Award,
  Layers,
  Code,
  Calendar,
  Check,
  Target,
  ChevronRight,
  BookOpen,
  Sparkles,
  RotateCcw,
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
  description: string;
  targetCompetencies: string[];
  capstoneDeliverable: string;
  interviewGate: string;
  completed: boolean;
}

type RoleFamily =
  | 'software'
  | 'ai'
  | 'data'
  | 'cybersecurity'
  | 'cloud'
  | 'building'
  | 'civil'
  | 'mechanical'
  | 'electrical'
  | 'design'
  | 'product'
  | 'business'
  | 'marketing'
  | 'finance'
  | 'healthcare'
  | 'education'
  | 'hr'
  | 'general';

interface RoadmapStageTemplate {
  title: string;
  level: string;
  timeline: string;
  description: string;
  skills: string[];
  project: string;
  interview: string;
}

const ROLE_SUGGESTIONS = [
  'AI Engineer',
  'Machine Learning Engineer',
  'Data Scientist',
  'Data Analyst',
  'Software Engineer',
  'Software Architect',
  'Full Stack Developer',
  'Frontend Developer',
  'Backend Developer',
  'Mobile App Developer',
  'Cybersecurity Analyst',
  'Cloud Engineer',
  'DevOps Engineer',
  'Product Manager',
  'UI/UX Designer',
  'Civil Engineer',
  'Architectural Engineer',
  'Mechanical Engineer',
  'Electrical Engineer',
  'Electronics Engineer',
  'Biomedical Engineer',
  'Business Analyst',
  'Digital Marketing Specialist',
  'Financial Analyst',
  'Accountant',
  'Human Resources Specialist',
  'Teacher',
  'Nurse',
  'Project Manager',
];

const ROLE_TEMPLATES: Record<RoleFamily, RoadmapStageTemplate[]> = {
  software: [
    { title: 'Core foundations for software development', level: 'Foundation', timeline: 'Stage 1 · Weeks 1–4', description: 'Build a dependable foundation in programming, debugging, version control, and problem solving for the selected software role.', skills: ['Programming fundamentals', 'Data structures and algorithms', 'Git and GitHub', 'Debugging and testing'], project: 'Build a small, well-documented application with tests and a clear README.', interview: 'Explain how you would debug a defect and choose an appropriate data structure.' },
    { title: 'Role-specific development skills', level: 'Practitioner', timeline: 'Stage 2 · Weeks 5–8', description: 'Learn the tools and frameworks commonly used in this role. Choose a stack that appears in the job descriptions you want to apply for.', skills: ['Language and framework for the target role', 'APIs and data handling', 'SQL and data modeling', 'Automated tests'], project: 'Create a functional application that uses a database and exposes or consumes an API.', interview: 'Walk through a feature from requirements to implementation, testing, and maintenance.' },
    { title: 'Production-quality engineering', level: 'Applied practice', timeline: 'Stage 3 · Weeks 9–12', description: 'Move beyond a working demo: improve reliability, accessibility, security, performance, and maintainability.', skills: ['Architecture and design patterns', 'Security fundamentals', 'Performance profiling', 'CI/CD and deployment'], project: 'Deploy your application and document architecture, trade-offs, monitoring, and known limitations.', interview: 'Describe how you would investigate a slow or unreliable production service.' },
    { title: 'Portfolio and collaboration', level: 'Job-ready practice', timeline: 'Stage 4 · Weeks 13–16', description: 'Demonstrate that you can collaborate, explain decisions, and maintain code over time.', skills: ['Code review', 'Technical documentation', 'Agile delivery', 'Resume and portfolio storytelling'], project: 'Polish two projects, publish demos where safe, and write concise case studies explaining your contribution.', interview: 'Explain a technical trade-off, a mistake you corrected, and what you learned.' },
    { title: 'Interview and application preparation', level: 'Application stage', timeline: 'Stage 5 · Ongoing', description: 'Practice the interview formats used for your target level and compare your skills against real job descriptions.', skills: ['Role-specific coding exercises', 'System or component design', 'Behavioral interviews', 'Job-description skill mapping'], project: 'Complete a timed mock interview and tailor one resume version to a specific vacancy.', interview: 'Solve a representative role-related problem aloud and justify your approach.' },
  ],
  ai: [
    { title: 'Programming, math, and data foundations', level: 'Foundation', timeline: 'Stage 1 · Weeks 1–4', description: 'Develop the coding and quantitative foundation needed to understand and implement AI solutions.', skills: ['Python', 'Linear algebra and probability basics', 'NumPy and pandas', 'Git and notebooks'], project: 'Explore a public dataset, clean it, visualize patterns, and document the findings.', interview: 'Explain train/test separation and why data leakage leads to misleading results.' },
    { title: 'Machine learning fundamentals', level: 'Core skills', timeline: 'Stage 2 · Weeks 5–8', description: 'Learn how to select, train, validate, and compare models instead of relying on a single score.', skills: ['Supervised and unsupervised learning', 'Feature engineering', 'Model evaluation', 'Scikit-learn'], project: 'Build a reproducible prediction project with a baseline, validation strategy, and error analysis.', interview: 'Choose suitable metrics for an imbalanced classification problem and explain why.' },
    { title: 'Specialize for the target AI role', level: 'Specialization', timeline: 'Stage 3 · Weeks 9–12', description: 'Focus on the methods most relevant to the exact job title: deep learning, NLP, computer vision, generative AI, or applied ML.', skills: ['PyTorch or TensorFlow', 'Neural network concepts', 'NLP / vision / LLM concepts', 'Experiment tracking'], project: 'Build a focused AI application and compare it against a simple baseline with documented limitations.', interview: 'Explain how you would evaluate model quality, bias, and failure cases before release.' },
    { title: 'Deploy and monitor an AI solution', level: 'Applied practice', timeline: 'Stage 4 · Weeks 13–16', description: 'Turn a notebook experiment into a usable, tested service with reproducible data and model handling.', skills: ['API development', 'Model serving', 'Docker basics', 'Monitoring, privacy, and responsible AI'], project: 'Deploy a small inference API or app and document latency, model limits, and safe-use considerations.', interview: 'Describe how you would detect model drift and decide when to retrain.' },
    { title: 'AI portfolio and interview readiness', level: 'Application stage', timeline: 'Stage 5 · Ongoing', description: 'Show the full problem-solving process, not only the final model or a high accuracy number.', skills: ['Experiment explanation', 'ML system design', 'Research reading', 'Technical and behavioral interviews'], project: 'Publish two clear case studies with datasets, metrics, error analysis, and reproducible instructions.', interview: 'Explain the complete lifecycle of one model you built, including what did not work.' },
  ],
  data: [
    { title: 'Data and analytical foundations', level: 'Foundation', timeline: 'Stage 1 · Weeks 1–4', description: 'Build confidence in data manipulation, querying, statistics, and asking precise questions of a dataset.', skills: ['SQL', 'Python or R', 'Statistics and probability', 'Spreadsheets and data cleaning'], project: 'Clean a public dataset and write a short analysis that answers specific questions with evidence.', interview: 'Explain how you would handle missing values, duplicates, and outliers.' },
    { title: 'Analysis, visualization, and measurement', level: 'Core skills', timeline: 'Stage 2 · Weeks 5–8', description: 'Turn raw data into reliable measures and understandable findings.', skills: ['Exploratory data analysis', 'Visualization tools', 'Metric definitions', 'Data storytelling'], project: 'Create a dashboard or analysis report with clearly defined metrics and actionable findings.', interview: 'Explain how you would investigate an unexpected change in a key metric.' },
    { title: 'Role-specific analytical methods', level: 'Specialization', timeline: 'Stage 3 · Weeks 9–12', description: 'For analyst roles, deepen business metrics and reporting; for scientist roles, add experimentation and predictive modeling.', skills: ['A/B testing or modeling', 'Data modeling', 'Validation and uncertainty', 'Reproducible workflows'], project: 'Complete a role-relevant case study and validate that the conclusions are supported by the data.', interview: 'Describe how you would test whether an observed relationship is meaningful.' },
    { title: 'Reliable data workflow', level: 'Applied practice', timeline: 'Stage 4 · Weeks 13–16', description: 'Make work repeatable, auditable, and useful to other people.', skills: ['ETL / ELT basics', 'Data quality checks', 'Documentation', 'Version control'], project: 'Create a repeatable pipeline or analysis with data-quality checks and clear documentation.', interview: 'Explain how you would find and prevent a data-quality issue in a recurring report.' },
    { title: 'Portfolio and interview preparation', level: 'Application stage', timeline: 'Stage 5 · Ongoing', description: 'Practice communicating findings to both technical and non-technical audiences.', skills: ['Case interviews', 'Business communication', 'Portfolio presentation', 'Role-specific SQL / statistics'], project: 'Present two case studies with the question, method, results, caveats, and recommendation.', interview: 'Summarize one analysis in plain language and explain its limitations.' },
  ],
  cybersecurity: [
    { title: 'Networking, operating systems, and security basics', level: 'Foundation', timeline: 'Stage 1 · Weeks 1–4', description: 'Understand how systems communicate and where common security failures occur. Practice only in authorized labs.', skills: ['Networking and DNS', 'Linux and Windows basics', 'Identity and access management', 'Security principles'], project: 'Document a safe home-lab environment and a basic threat model for a sample application.', interview: 'Explain the difference between authentication, authorization, and accounting.' },
    { title: 'Threats, detection, and defensive tooling', level: 'Core skills', timeline: 'Stage 2 · Weeks 5–8', description: 'Learn to identify suspicious activity, read logs, and prioritize alerts using a defensive workflow.', skills: ['Log analysis', 'SIEM concepts', 'Vulnerability management', 'Incident response basics'], project: 'Analyze sample logs and produce a short incident timeline with evidence and recommended actions.', interview: 'Walk through how you would triage a suspicious login alert.' },
    { title: 'Specialize for the security role', level: 'Specialization', timeline: 'Stage 3 · Weeks 9–12', description: 'Select a path such as SOC analysis, application security, cloud security, governance, or authorized penetration testing.', skills: ['Role-specific security tools', 'Secure configuration', 'Risk assessment', 'Security standards'], project: 'Complete a legal training-lab exercise or security review of your own test application.', interview: 'Explain how you would prioritize vulnerabilities based on impact and likelihood.' },
    { title: 'Security operations and reporting', level: 'Applied practice', timeline: 'Stage 4 · Weeks 13–16', description: 'Practice turning technical evidence into a repeatable response and a clear report.', skills: ['Incident playbooks', 'Evidence handling', 'Remediation verification', 'Clear reporting'], project: 'Write an incident-response playbook and a remediation report for a simulated scenario.', interview: 'Describe how you would contain an incident while preserving useful evidence.' },
    { title: 'Portfolio and interview readiness', level: 'Application stage', timeline: 'Stage 5 · Ongoing', description: 'Show careful reasoning, ethical boundaries, and evidence-backed recommendations.', skills: ['Security case studies', 'Threat modeling', 'Risk communication', 'Role-specific interview practice'], project: 'Publish sanitized lab notes and a clear security assessment report without exposing secrets.', interview: 'Explain a finding, its real-world impact, and a practical remediation.' },
  ],
  cloud: [
    { title: 'Systems and networking foundations', level: 'Foundation', timeline: 'Stage 1 · Weeks 1–4', description: 'Understand the operating systems, networks, and scripting used to support cloud workloads.', skills: ['Linux', 'Networking and DNS', 'Scripting', 'Git'], project: 'Automate a small server setup and document how to troubleshoot connectivity.', interview: 'Trace what happens when a client requests a web page from a hosted service.' },
    { title: 'Cloud platform and infrastructure basics', level: 'Core skills', timeline: 'Stage 2 · Weeks 5–8', description: 'Learn one cloud provider thoroughly before spreading across multiple platforms.', skills: ['Compute and storage', 'IAM and networking', 'Managed databases', 'Cost-aware resource hygiene'], project: 'Deploy a small service using least-privilege access and documented network rules.', interview: 'Explain how you would secure access to an application and its data.' },
    { title: 'Automation and reliable delivery', level: 'Specialization', timeline: 'Stage 3 · Weeks 9–12', description: 'Build repeatable infrastructure and deployment workflows appropriate to your chosen cloud role.', skills: ['Infrastructure as code', 'Containers', 'CI/CD', 'Secrets management'], project: 'Provision and deploy a test environment from version-controlled configuration.', interview: 'Explain how you would safely roll back a failed deployment.' },
    { title: 'Observability, resilience, and security', level: 'Applied practice', timeline: 'Stage 4 · Weeks 13–16', description: 'Practice operating services, diagnosing incidents, and recovering from failures.', skills: ['Logging and monitoring', 'Backups and recovery', 'Scaling concepts', 'Incident runbooks'], project: 'Add monitoring and a recovery runbook to your deployed service; test a failure scenario.', interview: 'Describe how you would investigate rising latency or an unavailable service.' },
    { title: 'Cloud portfolio and interview readiness', level: 'Application stage', timeline: 'Stage 5 · Ongoing', description: 'Demonstrate the architecture and operational reasoning behind your deployment.', skills: ['Cloud architecture diagrams', 'Security review', 'Scenario-based troubleshooting', 'Technical communication'], project: 'Publish a sanitized architecture diagram and deployment guide with trade-offs and limitations.', interview: 'Design a secure, resilient deployment for a small business application.' },
  ],
  building: [
    { title: 'Design, drawing, and built-environment foundations', level: 'Foundation', timeline: 'Stage 1 · Weeks 1–4', description: 'Build the drawing, spatial reasoning, material, and construction knowledge required for the specific architecture or building-design role.', skills: ['Technical drawing', 'Building materials and methods', 'Building codes applicable to your location', 'CAD fundamentals'], project: 'Prepare a small concept plan and drawing set for a clearly defined, non-structural practice brief.', interview: 'Explain how site conditions, user needs, and applicable codes shape an early design.' },
    { title: 'CAD / BIM and design development', level: 'Core skills', timeline: 'Stage 2 · Weeks 5–8', description: 'Develop a coordinated model or drawing package and learn how design decisions affect usability and constructability.', skills: ['AutoCAD or equivalent', 'Revit / BIM where relevant', 'Space planning', 'Materials and specifications'], project: 'Create a coordinated drawing or BIM model for a sample project and document assumptions.', interview: 'Describe how you would resolve a conflict between a design requirement and a site constraint.' },
    { title: 'Technical coordination and compliance', level: 'Specialization', timeline: 'Stage 3 · Weeks 9–12', description: 'Learn how design work coordinates with structural, mechanical, electrical, accessibility, safety, and regulatory requirements.', skills: ['Code and compliance research', 'Multidisciplinary coordination', 'Technical documentation', 'Sustainability basics'], project: 'Create a coordination checklist and revise your sample design to address identified conflicts.', interview: 'Explain how you identify and escalate a compliance or coordination issue.' },
    { title: 'Documentation and project delivery', level: 'Applied practice', timeline: 'Stage 4 · Weeks 13–16', description: 'Practice revisions, schedules, presentation, and communication through a realistic project workflow.', skills: ['Construction documentation', 'Quantity / specification basics', 'Revision control', 'Client communication'], project: 'Assemble a small portfolio package with drawings, rationale, and a revision log.', interview: 'Walk through how you would communicate a design change to the project team.' },
    { title: 'Portfolio and professional readiness', level: 'Application stage', timeline: 'Stage 5 · Ongoing', description: 'Show your process and technical judgment. Confirm local licensing or qualification requirements for regulated responsibilities.', skills: ['Portfolio curation', 'Design presentation', 'Technical review', 'Local professional requirements'], project: 'Prepare two case studies showing the brief, constraints, design decisions, and final deliverables.', interview: 'Explain one design decision, the alternatives considered, and the constraints that mattered.' },
  ],
  civil: [
    { title: 'Civil engineering fundamentals', level: 'Foundation', timeline: 'Stage 1 · Weeks 1–4', description: 'Refresh the engineering principles and calculations relevant to your intended civil engineering specialization.', skills: ['Engineering mathematics', 'Surveying fundamentals', 'Engineering drawing', 'Materials and construction basics'], project: 'Prepare a small site-analysis report using a practice dataset and clearly stated assumptions.', interview: 'Explain how site conditions influence engineering decisions.' },
    { title: 'Tools and discipline-specific methods', level: 'Core skills', timeline: 'Stage 2 · Weeks 5–8', description: 'Choose methods based on the target area, such as structures, transportation, geotechnical, water, or construction engineering.', skills: ['CAD / relevant engineering software', 'Design calculations', 'Codes and standards', 'Quantity estimation basics'], project: 'Complete a supervised-style academic design exercise and show calculations and assumptions.', interview: 'Explain the assumptions behind a design calculation and how you would verify it.' },
    { title: 'Safety, codes, and coordination', level: 'Specialization', timeline: 'Stage 3 · Weeks 9–12', description: 'Connect technical design with safety, applicable local codes, environmental constraints, and other disciplines.', skills: ['Relevant local standards', 'Risk assessment', 'Quality control', 'Technical reporting'], project: 'Create a risk and quality checklist for a sample civil engineering project.', interview: 'Describe what you would do if a site condition differed from the approved design assumptions.' },
    { title: 'Project delivery and field practice', level: 'Applied practice', timeline: 'Stage 4 · Weeks 13–16', description: 'Understand how plans, site observations, schedules, and records work together during delivery.', skills: ['Site documentation', 'Scheduling basics', 'Material testing concepts', 'Stakeholder communication'], project: 'Prepare a sample progress report with issues, evidence, and proposed next actions.', interview: 'Explain how you would record and escalate a safety or quality concern.' },
    { title: 'Portfolio and professional readiness', level: 'Application stage', timeline: 'Stage 5 · Ongoing', description: 'Present your technical work honestly and check the qualification or licensing rules for the responsibilities you seek.', skills: ['Technical portfolio', 'Calculation review', 'Interview practice', 'Professional ethics'], project: 'Compile two academic or practical case studies with drawings, calculations, and your contribution.', interview: 'Defend a technical decision and identify the assumptions that would need further verification.' },
  ],
  mechanical: [
    { title: 'Mechanical engineering foundations', level: 'Foundation', timeline: 'Stage 1 · Weeks 1–4', description: 'Strengthen the mechanics, materials, thermodynamics, and engineering drawing knowledge relevant to the target role.', skills: ['Engineering mathematics', 'Mechanics and materials', 'Thermodynamics basics', 'Technical drawing'], project: 'Analyze a simple mechanical component and document loads, materials, and design assumptions.', interview: 'Explain how loading and material choice influence component design.' },
    { title: 'CAD, simulation, and manufacturing', level: 'Core skills', timeline: 'Stage 2 · Weeks 5–8', description: 'Practice the design and analysis tools used by the intended industry and role.', skills: ['3D CAD', 'Engineering drawings and tolerances', 'FEA / simulation fundamentals', 'Manufacturing processes'], project: 'Model a component, create drawings, and explain manufacturability and tolerances.', interview: 'Explain when simulation results need validation before being trusted.' },
    { title: 'Specialize for the industry', level: 'Specialization', timeline: 'Stage 3 · Weeks 9–12', description: 'Focus on the target domain, such as design, thermal systems, automotive, robotics, maintenance, or production.', skills: ['Role-specific engineering methods', 'Standards and safety', 'Failure analysis', 'Quality methods'], project: 'Complete a domain-specific design or failure-analysis case study with evidence.', interview: 'Describe how you would investigate a recurring component failure.' },
    { title: 'Testing and engineering delivery', level: 'Applied practice', timeline: 'Stage 4 · Weeks 13–16', description: 'Connect design intent with testing, production, documentation, and cross-functional work.', skills: ['Test planning', 'Root-cause analysis', 'Technical documentation', 'Design reviews'], project: 'Prepare a test plan, results summary, and recommended design changes for a sample component.', interview: 'Explain how you would use test results to decide whether a design meets requirements.' },
    { title: 'Portfolio and interview readiness', level: 'Application stage', timeline: 'Stage 5 · Ongoing', description: 'Show your calculations, design iterations, and reasoning rather than presenting only final CAD images.', skills: ['Portfolio presentation', 'Engineering fundamentals review', 'Problem-solving interviews', 'Professional safety mindset'], project: 'Publish two portfolio case studies with drawings, calculations, decisions, and limitations.', interview: 'Walk through a design problem and explain how you checked your answer.' },
  ],
  electrical: [
    { title: 'Electrical and electronics foundations', level: 'Foundation', timeline: 'Stage 1 · Weeks 1–4', description: 'Refresh circuit theory, measurement, mathematics, and safety principles for the target electrical role.', skills: ['Circuit analysis', 'Electrical machines / electronics basics', 'Measurement and instrumentation', 'Electrical safety'], project: 'Simulate and document a small circuit or system, including assumptions and safety considerations.', interview: 'Explain how you would troubleshoot a circuit that is not behaving as expected.' },
    { title: 'Tools, design, and testing', level: 'Core skills', timeline: 'Stage 2 · Weeks 5–8', description: 'Use the tools and standards relevant to the chosen domain, from power systems to embedded electronics.', skills: ['Relevant CAD / simulation tools', 'Test equipment concepts', 'Schematics and documentation', 'Applicable standards'], project: 'Build or simulate a small role-relevant system and create a test plan.', interview: 'Describe how you would verify a design against its requirements.' },
    { title: 'Domain specialization', level: 'Specialization', timeline: 'Stage 3 · Weeks 9–12', description: 'Focus on the intended path, such as power, control systems, embedded systems, electronics, or renewable energy.', skills: ['Domain-specific analysis', 'Control / power / embedded concepts', 'Fault diagnosis', 'Reliability'], project: 'Complete a focused case study with measurements or simulation results and an error analysis.', interview: 'Explain how you would identify the likely cause of a system fault.' },
    { title: 'Integration and engineering practice', level: 'Applied practice', timeline: 'Stage 4 · Weeks 13–16', description: 'Practice integration, documentation, safety reviews, and communication with other engineering disciplines.', skills: ['System integration', 'Verification and validation', 'Technical reporting', 'Risk and safety review'], project: 'Document an integrated prototype or design with test results and a risk checklist.', interview: 'Explain how you would handle a failed verification test.' },
    { title: 'Portfolio and interview readiness', level: 'Application stage', timeline: 'Stage 5 · Ongoing', description: 'Demonstrate technical reasoning, safety awareness, and the ability to explain your design decisions.', skills: ['Portfolio documentation', 'Fundamentals review', 'Scenario interviews', 'Professional standards'], project: 'Prepare two technical case studies showing requirements, calculations, tests, and lessons learned.', interview: 'Defend a design choice and explain what additional testing would increase confidence.' },
  ],
  design: [
    { title: 'User-centered design foundations', level: 'Foundation', timeline: 'Stage 1 · Weeks 1–4', description: 'Learn to define the problem and understand the people who will use the product or experience.', skills: ['User research', 'Problem framing', 'Information architecture', 'Accessibility fundamentals'], project: 'Interview or analyze representative users and write a concise problem statement and user journey.', interview: 'Explain how research evidence changed or would change your initial assumptions.' },
    { title: 'Tools and interaction design', level: 'Core skills', timeline: 'Stage 2 · Weeks 5–8', description: 'Turn research into clear flows, prototypes, and consistent interface or design decisions.', skills: ['Wireframing and prototyping', 'Visual hierarchy', 'Interaction patterns', 'Design systems'], project: 'Prototype a key user flow and document the decisions behind the layout and interactions.', interview: 'Explain how you would simplify a confusing user flow.' },
    { title: 'Usability validation and iteration', level: 'Specialization', timeline: 'Stage 3 · Weeks 9–12', description: 'Use feedback and usability evidence to improve the design instead of relying only on personal preference.', skills: ['Usability testing', 'Feedback synthesis', 'Responsive design', 'Accessibility checks'], project: 'Run a small usability review, prioritize findings, and show before-and-after improvements.', interview: 'Describe how you prioritize conflicting user feedback.' },
    { title: 'Handoff and collaboration', level: 'Applied practice', timeline: 'Stage 4 · Weeks 13–16', description: 'Prepare designs that engineers, clients, or production teams can understand and implement.', skills: ['Design specifications', 'Asset organization', 'Developer / stakeholder handoff', 'Outcome measurement'], project: 'Create a handoff-ready prototype with component states and implementation notes.', interview: 'Explain how you would resolve a disagreement about a design decision.' },
    { title: 'Portfolio and interview readiness', level: 'Application stage', timeline: 'Stage 5 · Ongoing', description: 'Present the problem, process, constraints, iteration, and outcomes—not just attractive final screens.', skills: ['Case-study storytelling', 'Portfolio curation', 'Critique practice', 'Role-specific interviews'], project: 'Publish two case studies with research, iterations, rationale, and honest outcome measures.', interview: 'Walk through a project and explain what you would improve next.' },
  ],
  product: [
    { title: 'Customer, problem, and product foundations', level: 'Foundation', timeline: 'Stage 1 · Weeks 1–4', description: 'Learn to distinguish customer problems from proposed features and align work with a clear product outcome.', skills: ['Customer discovery', 'Problem statements', 'Product lifecycle', 'Stakeholder mapping'], project: 'Write a concise product brief supported by user evidence and explicit assumptions.', interview: 'How would you determine whether a problem is worth solving?' },
    { title: 'Prioritization and product planning', level: 'Core skills', timeline: 'Stage 2 · Weeks 5–8', description: 'Translate evidence into a focused roadmap, requirements, and trade-offs.', skills: ['User stories and acceptance criteria', 'Prioritization frameworks', 'Roadmapping', 'Agile collaboration'], project: 'Create a prioritized backlog with success criteria and explain what you intentionally left out.', interview: 'Explain how you would prioritize two competing high-value requests.' },
    { title: 'Metrics and experimentation', level: 'Specialization', timeline: 'Stage 3 · Weeks 9–12', description: 'Define success measures and use qualitative and quantitative evidence to make decisions.', skills: ['Product analytics', 'North-star and guardrail metrics', 'Experiment design', 'Data-informed decisions'], project: 'Design an experiment or measurement plan for a feature and identify possible confounders.', interview: 'Which metrics would tell you a feature is successful, and what could mislead you?' },
    { title: 'Delivery and cross-functional leadership', level: 'Applied practice', timeline: 'Stage 4 · Weeks 13–16', description: 'Practice aligning engineering, design, operations, and business stakeholders around delivery and outcomes.', skills: ['Release planning', 'Risk management', 'Communication', 'Post-launch learning'], project: 'Create a launch plan including dependencies, risks, rollout, and post-launch review.', interview: 'Describe how you would respond when a delivery date conflicts with quality.' },
    { title: 'Product case and interview readiness', level: 'Application stage', timeline: 'Stage 5 · Ongoing', description: 'Practice structured product thinking and clear communication under uncertainty.', skills: ['Product sense cases', 'Analytical cases', 'Behavioral stories', 'Portfolio / impact narrative'], project: 'Prepare a case study showing the problem, choices, metrics, result, and lessons learned.', interview: 'Structure a product improvement idea from user problem through measurement.' },
  ],
  business: [
    { title: 'Business and communication foundations', level: 'Foundation', timeline: 'Stage 1 · Weeks 1–4', description: 'Understand the organization, customers, processes, and business questions relevant to your target role.', skills: ['Business fundamentals', 'Structured problem solving', 'Spreadsheet skills', 'Professional communication'], project: 'Map a familiar business process and identify a measurable improvement opportunity.', interview: 'Explain how you would clarify a vague business request.' },
    { title: 'Role-specific tools and analysis', level: 'Core skills', timeline: 'Stage 2 · Weeks 5–8', description: 'Develop the tools and methods used in the target business role, based on real vacancy requirements.', skills: ['Role-specific software', 'Data interpretation', 'Process documentation', 'Requirements gathering'], project: 'Create an analysis, process map, or work sample that resembles a real task in the role.', interview: 'Describe how you would validate requirements before recommending a solution.' },
    { title: 'Execution and stakeholder alignment', level: 'Specialization', timeline: 'Stage 3 · Weeks 9–12', description: 'Practice converting findings into a realistic action plan with clear ownership and measurable outcomes.', skills: ['Prioritization', 'Risk and dependency tracking', 'Presentation skills', 'Stakeholder management'], project: 'Present a recommendation with options, evidence, risks, and success measures.', interview: 'Explain how you would handle stakeholders who disagree with your recommendation.' },
    { title: 'Measure results and improve processes', level: 'Applied practice', timeline: 'Stage 4 · Weeks 13–16', description: 'Use feedback and defined measures to check whether your proposed changes work.', skills: ['KPIs and reporting', 'Quality checks', 'Documentation', 'Continuous improvement'], project: 'Build a simple KPI report or improvement review using a sample or public dataset.', interview: 'How would you tell whether a process change actually improved performance?' },
    { title: 'Work samples and interview readiness', level: 'Application stage', timeline: 'Stage 5 · Ongoing', description: 'Prepare examples that show sound judgment, clear communication, and practical results.', skills: ['Role-specific case interviews', 'STAR examples', 'Portfolio / work samples', 'Resume alignment'], project: 'Create two anonymized work samples or case studies and practice presenting them.', interview: 'Give an evidence-based example of solving a problem with multiple constraints.' },
  ],
  marketing: [
    { title: 'Audience and marketing foundations', level: 'Foundation', timeline: 'Stage 1 · Weeks 1–4', description: 'Understand target audiences, positioning, customer journeys, and the goals of the chosen marketing role.', skills: ['Audience research', 'Positioning and messaging', 'Customer journey', 'Marketing fundamentals'], project: 'Create an audience profile and a campaign brief with a clear objective and hypothesis.', interview: 'Explain how you would choose an audience and message for a campaign.' },
    { title: 'Channel and content execution', level: 'Core skills', timeline: 'Stage 2 · Weeks 5–8', description: 'Practice the channels relevant to the role, such as SEO, content, paid media, email, social, or lifecycle marketing.', skills: ['Role-specific channel tools', 'Content planning', 'Campaign setup', 'Tracking and tagging'], project: 'Build a sample campaign plan with content examples, channel choices, and tracking requirements.', interview: 'How would you adapt a campaign when engagement is lower than expected?' },
    { title: 'Analytics and optimization', level: 'Specialization', timeline: 'Stage 3 · Weeks 9–12', description: 'Measure results against objectives and improve performance with controlled tests where possible.', skills: ['Conversion metrics', 'Analytics dashboards', 'A/B testing basics', 'Attribution limitations'], project: 'Analyze a sample campaign dataset and recommend changes supported by the numbers.', interview: 'Which metrics would you use and what are their limitations?' },
    { title: 'Campaign operations and collaboration', level: 'Applied practice', timeline: 'Stage 4 · Weeks 13–16', description: 'Coordinate creative, sales, product, and reporting work while keeping claims accurate and on-brand.', skills: ['Campaign calendars', 'Briefs and approvals', 'Brand consistency', 'Reporting'], project: 'Create an end-to-end campaign calendar and a post-campaign review template.', interview: 'Describe how you would handle a campaign that is on time but missing its target.' },
    { title: 'Portfolio and interview readiness', level: 'Application stage', timeline: 'Stage 5 · Ongoing', description: 'Show the objective, audience, execution, results, and lessons learned for each work sample.', skills: ['Case-study storytelling', 'Portfolio curation', 'Marketing cases', 'Behavioral interviews'], project: 'Prepare two campaign case studies, clearly separating actual results from simulated examples.', interview: 'Walk through a campaign decision and explain how you measured its impact.' },
  ],
  finance: [
    { title: 'Accounting, numeracy, and finance foundations', level: 'Foundation', timeline: 'Stage 1 · Weeks 1–4', description: 'Build a sound understanding of financial statements, numerical reasoning, and spreadsheet accuracy.', skills: ['Accounting principles', 'Financial statements', 'Excel / spreadsheets', 'Business mathematics'], project: 'Analyze a sample set of financial statements and document key assumptions and observations.', interview: 'Explain how the income statement, balance sheet, and cash-flow statement relate.' },
    { title: 'Role-specific analysis and tools', level: 'Core skills', timeline: 'Stage 2 · Weeks 5–8', description: 'Choose methods based on the target role, such as financial analysis, accounting, audit, planning, or risk.', skills: ['Financial modeling basics', 'Reconciliation and controls', 'Forecasting', 'Relevant finance tools'], project: 'Build a clearly labeled model or reconciliation exercise using sample data.', interview: 'Describe how you would check a financial model for errors.' },
    { title: 'Reporting, controls, and judgment', level: 'Specialization', timeline: 'Stage 3 · Weeks 9–12', description: 'Practice accuracy, documentation, internal controls, and the regulatory requirements relevant to your location and role.', skills: ['Variance analysis', 'Internal controls', 'Documentation', 'Relevant standards and regulations'], project: 'Prepare a variance report with explanations, supporting calculations, and follow-up questions.', interview: 'What would you do if the numbers do not reconcile before a deadline?' },
    { title: 'Business communication and decision support', level: 'Applied practice', timeline: 'Stage 4 · Weeks 13–16', description: 'Explain financial information clearly and distinguish evidence from assumptions.', skills: ['Management reporting', 'Presentation of findings', 'Risk awareness', 'Stakeholder communication'], project: 'Create a concise report that summarizes findings, risks, and recommended next steps.', interview: 'Explain a complex financial finding to a non-finance stakeholder.' },
    { title: 'Work samples and interview readiness', level: 'Application stage', timeline: 'Stage 5 · Ongoing', description: 'Prepare for the technical tasks and professional standards expected in the chosen finance role.', skills: ['Role-specific technical questions', 'Case analysis', 'Accuracy checks', 'Professional ethics'], project: 'Compile sanitized work samples and a checklist for validating calculations and assumptions.', interview: 'Walk through your analysis and identify its key assumptions and limitations.' },
  ],
  healthcare: [
    { title: 'Core knowledge and professional scope', level: 'Foundation', timeline: 'Stage 1 · Weeks 1–4', description: 'Review the foundational knowledge required by the target healthcare role and understand its local qualification and scope-of-practice requirements.', skills: ['Role-specific clinical / health knowledge', 'Patient safety', 'Communication', 'Ethics and confidentiality'], project: 'Create a learning portfolio or case reflection using only approved, anonymized learning material.', interview: 'Explain how you protect confidentiality and escalate a safety concern.' },
    { title: 'Practical procedures and evidence-based practice', level: 'Core skills', timeline: 'Stage 2 · Weeks 5–8', description: 'Use formal instruction, approved simulation, and current professional guidance to strengthen practical competence.', skills: ['Role-specific procedures', 'Evidence-based practice', 'Documentation', 'Infection prevention / safety as applicable'], project: 'Complete a supervised or simulated competency checklist appropriate to your training program.', interview: 'Describe how you would respond when you are unsure about a task or instruction.' },
    { title: 'Teamwork and quality improvement', level: 'Specialization', timeline: 'Stage 3 · Weeks 9–12', description: 'Understand handoffs, multidisciplinary teamwork, quality standards, and the limits of your role.', skills: ['Team communication', 'Quality improvement', 'Risk recognition', 'Accurate records'], project: 'Analyze an anonymized training scenario and propose a safe, evidence-based process improvement.', interview: 'Explain how you would communicate a change in a patient or service situation to the appropriate team.' },
    { title: 'Practice readiness and professional standards', level: 'Applied practice', timeline: 'Stage 4 · Weeks 13–16', description: 'Prepare for the working environment, required documentation, and local registration or certification requirements.', skills: ['Scenario practice', 'Professional conduct', 'Documentation standards', 'Escalation pathways'], project: 'Assemble a competency portfolio and a checklist of the requirements for your intended role.', interview: 'Describe how you balance timely action with safety and appropriate escalation.' },
    { title: 'Qualification and interview readiness', level: 'Application stage', timeline: 'Stage 5 · Ongoing', description: 'Verify the credentials, registration, and supervised-practice requirements applicable to your location and role.', skills: ['Qualification review', 'Scenario-based interviews', 'Communication', 'Continuing development'], project: 'Prepare evidence of training and a concise reflection on a relevant learning experience.', interview: 'Give an example of how you would handle an ethical or safety-related concern.' },
  ],
  education: [
    { title: 'Subject knowledge and learner needs', level: 'Foundation', timeline: 'Stage 1 · Weeks 1–4', description: 'Strengthen the subject knowledge and learner-centered principles required for your intended teaching or education role.', skills: ['Subject expertise', 'Learning objectives', 'Learner needs', 'Inclusive practice'], project: 'Write a lesson or learning session plan with clear objectives and ways to check understanding.', interview: 'How would you adapt your explanation for learners with different starting points?' },
    { title: 'Instructional design and delivery', level: 'Core skills', timeline: 'Stage 2 · Weeks 5–8', description: 'Plan clear learning activities and use appropriate tools to support participation and understanding.', skills: ['Lesson planning', 'Assessment design', 'Classroom / online tools', 'Clear explanations'], project: 'Create a short lesson with learning materials and a formative assessment.', interview: 'Explain how you would respond when learners are not meeting the lesson objective.' },
    { title: 'Assessment and feedback', level: 'Specialization', timeline: 'Stage 3 · Weeks 9–12', description: 'Use evidence of learning to provide useful feedback and refine teaching practice.', skills: ['Rubrics', 'Constructive feedback', 'Learning analytics where relevant', 'Reflection'], project: 'Design a rubric and show how feedback would help a learner improve.', interview: 'How would you ensure your assessment is fair and aligned with learning objectives?' },
    { title: 'Professional practice and collaboration', level: 'Applied practice', timeline: 'Stage 4 · Weeks 13–16', description: 'Build routines for planning, communication, safeguarding, and collaboration appropriate to your setting.', skills: ['Professional communication', 'Record keeping', 'Safeguarding requirements', 'Collaborative planning'], project: 'Prepare a teaching portfolio with plans, materials, reflections, and evidence of revision.', interview: 'Describe how you would handle a difficult learning or communication situation.' },
    { title: 'Portfolio and qualification readiness', level: 'Application stage', timeline: 'Stage 5 · Ongoing', description: 'Check local qualification and background requirements and prepare examples of your teaching practice.', skills: ['Portfolio presentation', 'Interview practice', 'Reflective practice', 'Local credential requirements'], project: 'Compile a portfolio showing lesson design, feedback, reflection, and improvements.', interview: 'Explain how you evaluate whether learners have achieved the intended outcomes.' },
  ],
  hr: [
    { title: 'People operations foundations', level: 'Foundation', timeline: 'Stage 1 · Weeks 1–4', description: 'Learn the employee lifecycle, professional communication, confidentiality, and applicable workplace rules.', skills: ['HR fundamentals', 'Employee lifecycle', 'Confidential records', 'Employment rules relevant to location'], project: 'Map a sample onboarding process and identify where clarity or consistency could improve.', interview: 'How would you handle sensitive employee information?' },
    { title: 'Recruitment and people tools', level: 'Core skills', timeline: 'Stage 2 · Weeks 5–8', description: 'Develop the processes and tools most relevant to the chosen HR, talent acquisition, or people operations role.', skills: ['Interview coordination', 'Applicant tracking systems', 'Structured evaluation', 'HR information systems basics'], project: 'Create a structured interview plan and candidate communication checklist for a sample role.', interview: 'How would you reduce inconsistency in candidate evaluation?' },
    { title: 'Policy, employee experience, and analysis', level: 'Specialization', timeline: 'Stage 3 · Weeks 9–12', description: 'Practice applying policy fairly, handling issues with care, and using people metrics responsibly.', skills: ['Policy interpretation', 'Employee relations basics', 'People metrics', 'Fair and inclusive processes'], project: 'Prepare a sample people report using anonymized or synthetic data and explain its limitations.', interview: 'How would you respond to a sensitive concern while following the right escalation process?' },
    { title: 'Process improvement and stakeholder work', level: 'Applied practice', timeline: 'Stage 4 · Weeks 13–16', description: 'Coordinate with managers and teams while maintaining clear records and consistent processes.', skills: ['Process documentation', 'Stakeholder communication', 'Change support', 'Service quality'], project: 'Propose an improvement to a sample HR process with measures and safeguards.', interview: 'Describe how you would balance employee experience with a consistent policy.' },
    { title: 'Portfolio and interview readiness', level: 'Application stage', timeline: 'Stage 5 · Ongoing', description: 'Prepare practical work samples and demonstrate discretion, fairness, and sound judgment.', skills: ['Scenario interviews', 'Policy awareness', 'Communication', 'Evidence-based decisions'], project: 'Prepare anonymized process documents and examples of measurable improvements.', interview: 'Explain how you would make a fair decision when information is incomplete.' },
  ],
  general: [
    { title: 'Understand the target role', level: 'Foundation', timeline: 'Stage 1 · Weeks 1–4', description: 'Break the job title into the responsibilities, tools, knowledge, and qualifications that appear in real job descriptions for this role.', skills: ['Analyze 5–10 relevant job descriptions', 'Identify recurring skills', 'Learn industry terminology', 'Set a baseline of current skills'], project: 'Create a role requirements checklist and map your current strengths and gaps against it.', interview: 'Explain what the role does and how its work contributes to an organization.' },
    { title: 'Build the core role skills', level: 'Core skills', timeline: 'Stage 2 · Weeks 5–8', description: 'Prioritize the most repeated foundational skills for your chosen role. Prefer practical exercises over passive learning alone.', skills: ['Top recurring technical / domain skill', 'Role-specific tools', 'Communication and collaboration', 'Quality and safety basics where relevant'], project: 'Complete a small work sample that demonstrates one core responsibility of the target role.', interview: 'Describe your approach to completing a typical task in this role.' },
    { title: 'Practice realistic job tasks', level: 'Specialization', timeline: 'Stage 3 · Weeks 9–12', description: 'Use a realistic brief or case study to connect individual skills into a complete workflow.', skills: ['Problem solving', 'Role-specific methods', 'Documentation', 'Review and feedback'], project: 'Complete a role-relevant case study and document your decisions, assumptions, and results.', interview: 'Walk through a practical challenge and explain how you would measure success.' },
    { title: 'Create evidence of capability', level: 'Applied practice', timeline: 'Stage 4 · Weeks 13–16', description: 'Build a portfolio, work sample, simulation, or documented practical outcome that employers can evaluate.', skills: ['Work sample presentation', 'Quality checks', 'Team communication', 'Continuous improvement'], project: 'Polish one substantial work sample and explain the problem, process, and outcome clearly.', interview: 'Describe a mistake or challenge and how you adapted your approach.' },
    { title: 'Apply and keep improving', level: 'Application stage', timeline: 'Stage 5 · Ongoing', description: 'Compare your evidence with actual vacancies, prepare for common interview formats, and update the plan when role requirements differ.', skills: ['Resume aligned to role', 'Role-specific interview practice', 'Professional networking', 'Learning from feedback'], project: 'Tailor an application to one genuine vacancy and record the skills you still need to strengthen.', interview: 'Explain why your skills fit this role and provide concrete evidence.' },
  ],
};

function getRoleFamily(role: string): RoleFamily {
  const value = role.toLowerCase();

  // Distinguish building architecture from software architecture.
  if (/(architectural|building architect|architecture engineer|architect\b|interior architect)/.test(value)) return 'building';
  if (/(civil|structural engineer|transportation engineer|geotechnical|construction engineer|quantity surveyor)/.test(value)) return 'civil';
  if (/(mechanical|automotive|mechatronic|manufacturing engineer|hvac|thermal engineer|robotics engineer)/.test(value)) return 'mechanical';
  if (/(electrical|electronics|embedded engineer|power systems|instrumentation engineer|telecommunication engineer)/.test(value)) return 'electrical';
  if (/(cyber|security analyst|penetration tester|soc analyst|information security|application security)/.test(value)) return 'cybersecurity';
  if (/(artificial intelligence|\bai\b|machine learning|\bml engineer|deep learning|nlp engineer|computer vision|generative ai)/.test(value)) return 'ai';
  if (/(data scientist|data analyst|analytics engineer|business intelligence|bi developer|data engineer|statistician)/.test(value)) return 'data';
  if (/(cloud|devops|site reliability|platform engineer|kubernetes|infrastructure engineer|cloud architect|software architect|solutions architect|solution architect|enterprise architect)/.test(value)) return 'cloud';
  if (/(software|developer|programmer|frontend|front-end|backend|back-end|full.?stack|web developer|mobile app|ios developer|android developer|qa engineer|test automation|engineering manager)/.test(value)) return 'software';
  if (/(ui.?ux|ux designer|ui designer|graphic designer|product designer|visual designer|interaction designer|service designer)/.test(value)) return 'design';
  if (/(product manager|product owner|program manager)/.test(value)) return 'product';
  if (/(marketing|seo|social media|content strategist|growth marketer|digital marketer|brand manager)/.test(value)) return 'marketing';
  if (/(finance|financial analyst|accountant|accounting|auditor|investment analyst|risk analyst|banking)/.test(value)) return 'finance';
  if (/(nurse|doctor|physician|healthcare|medical|pharmacist|physiotherapist|clinical|public health|dentist)/.test(value)) return 'healthcare';
  if (/(teacher|educator|lecturer|professor|instructional designer|tutor|academic)/.test(value)) return 'education';
  if (/(human resources|\bhr\b|recruiter|talent acquisition|people operations|hr specialist)/.test(value)) return 'hr';
  if (/(business analyst|business development|operations|consultant|project manager|management analyst|sales|customer success|supply chain|logistics)/.test(value)) return 'business';
  return 'general';
}

function buildRoadmap(role: string, completedIds: number[] = []): RoadmapMilestone[] {
  const family = getRoleFamily(role);
  return ROLE_TEMPLATES[family].map((stage, index) => ({
    id: index + 1,
    phase: `Stage ${String(index + 1).padStart(2, '0')}`,
    title: stage.title,
    level: stage.level,
    timeline: stage.timeline,
    description: stage.description,
    targetCompetencies: stage.skills,
    capstoneDeliverable: stage.project,
    interviewGate: stage.interview,
    completed: completedIds.includes(index + 1),
  }));
}

const normalizeRole = (role: string) => role.trim().replace(/\s+/g, ' ');

export const CareerRoadmapView: React.FC<CareerRoadmapViewProps> = ({ analysis }) => {
  const initialRole = normalizeRole(analysis?.target_role || 'AI Engineer');
  const [targetRole, setTargetRole] = useState(initialRole);
  const [searchInput, setSearchInput] = useState(initialRole);
  const [selectedPhaseId, setSelectedPhaseId] = useState(1);
  const [milestones, setMilestones] = useState<RoadmapMilestone[]>(() => buildRoadmap(initialRole));
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchError, setSearchError] = useState('');

  const candidateSkills = useMemo<string[]>(() => {
    const rawSkills: unknown[] = Array.isArray(analysis?.skills) ? analysis.skills : [];
    const skills = rawSkills.filter(
      (skill): skill is string => typeof skill === 'string' && skill.trim().length > 0
    );
    return [...new Set(skills.map((skill) => skill.trim()))].slice(0, 30);
  }, [analysis?.skills]);

  const roleFamily = getRoleFamily(targetRole);
  const completedCount = milestones.filter((milestone) => milestone.completed).length;
  const progressPercent = milestones.length ? Math.round((completedCount / milestones.length) * 100) : 0;
  const suggestions = ROLE_SUGGESTIONS.filter((role) =>
    role.toLowerCase().includes(searchInput.trim().toLowerCase())
  ).slice(0, 7);
  const focusSkills: string[] = Array.from(
    new Set<string>(milestones.slice(0, 3).flatMap((milestone) => milestone.targetCompetencies))
  ).slice(0, 9);

  const searchRole = (value = searchInput) => {
    const nextRole = normalizeRole(value);
    if (!nextRole) {
      setSearchError('Enter a job title to build its career roadmap.');
      return;
    }
    if (nextRole.length > 100) {
      setSearchError('Please keep the job title under 100 characters.');
      return;
    }
    setTargetRole(nextRole);
    setSearchInput(nextRole);
    setMilestones(buildRoadmap(nextRole));
    setSelectedPhaseId(1);
    setSearchError('');
    setShowSuggestions(false);
  };

  const toggleMilestoneComplete = (id: number) => {
    setMilestones((previous) =>
      previous.map((milestone) =>
        milestone.id === id ? { ...milestone, completed: !milestone.completed } : milestone
      )
    );
  };

  const resetProgress = () => {
    setMilestones((previous) => previous.map((milestone) => ({ ...milestone, completed: false })));
    setSelectedPhaseId(1);
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6 pb-16 selection:bg-blue-600 selection:text-white">
      <div className="flex flex-col justify-between gap-5 rounded-3xl border border-slate-200 bg-white p-6 shadow-xs sm:p-7 md:flex-row md:items-center">
        <div className="min-w-0">
          <div className="mb-1 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
            <span className="h-2 w-2 animate-pulse rounded-full bg-blue-600" />
            <span>Career roadmap &amp; learning milestones</span>
          </div>
          <h1 className="text-xl font-black tracking-tight text-slate-950 sm:text-2xl">
            Your path to <span className="break-words text-blue-600">{targetRole}</span>
          </h1>
          <p className="mt-1 max-w-2xl text-xs text-slate-500 sm:text-sm">
            Search a job title to get a learning map with relevant skills, practical projects, and interview preparation.
          </p>
        </div>

        <div className="min-w-[200px] shrink-0 rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <div className="mb-1.5 flex items-center justify-between text-xs font-bold text-slate-600">
            <span>Roadmap progress</span>
            <span className="font-extrabold text-blue-600">{progressPercent}%</span>
          </div>
          <div
            className="h-2.5 w-full overflow-hidden rounded-full bg-slate-200"
            role="progressbar"
            aria-label="Roadmap completion"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={progressPercent}
          >
            <div className="h-full rounded-full bg-blue-600 transition-all duration-500" style={{ width: `${progressPercent}%` }} />
          </div>
          <div className="mt-2 flex items-center justify-between gap-2 text-[11px] text-slate-500">
            <span>{completedCount} of {milestones.length} stages complete</span>
            <span className="flex items-center gap-1 font-semibold text-emerald-600">
              <Check className="h-3 w-3" /> Tracking
            </span>
          </div>
        </div>
      </div>

      <section className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-xs sm:p-5">
        <div className="flex items-center gap-2 text-sm font-extrabold text-slate-800">
          <Search className="h-4 w-4 text-blue-600" />
          Search any job title
        </div>
        <form
          className="flex flex-col gap-2 sm:flex-row"
          onSubmit={(event) => {
            event.preventDefault();
            searchRole();
          }}
        >
          <div className="relative min-w-0 flex-1">
            <input
              type="search"
              value={searchInput}
              onChange={(event) => {
                setSearchInput(event.target.value);
                setShowSuggestions(true);
                if (searchError) setSearchError('');
              }}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => window.setTimeout(() => setShowSuggestions(false), 120)}
              placeholder="Try AI Engineer, Civil Engineer, Architect, Nurse..."
              maxLength={100}
              aria-label="Search job title"
              aria-autocomplete="list"
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
            />
            {showSuggestions && searchInput.trim() && suggestions.length > 0 && (
              <div className="absolute z-20 mt-1 max-h-64 w-full overflow-y-auto rounded-xl border border-slate-200 bg-white p-1 shadow-lg">
                {suggestions.map((role) => (
                  <button
                    key={role}
                    type="button"
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => searchRole(role)}
                    className="flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm text-slate-700 hover:bg-blue-50 hover:text-blue-700"
                  >
                    <span>{role}</span>
                    <ChevronRight className="h-4 w-4" />
                  </button>
                ))}
              </div>
            )}
          </div>
          <button
            type="submit"
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-500/20"
          >
            <Search className="h-4 w-4" /> Generate roadmap
          </button>
        </form>
        {searchError && <p role="alert" className="text-xs font-semibold text-red-600">{searchError}</p>}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs leading-relaxed text-slate-500">
            You can enter a title that is not in the suggestions. The roadmap adapts to the closest role family or provides a general role-planning path.
          </p>
          <div className="flex flex-wrap gap-2">
            {['AI Engineer', 'Software Architect', 'Civil Engineer', 'Data Analyst'].map((role) => (
              <button
                key={role}
                type="button"
                onClick={() => searchRole(role)}
                className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-semibold text-slate-600 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
              >
                {role}
              </button>
            ))}
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <section className="space-y-2.5 rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-slate-800">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              <span>Your resume skills</span>
            </div>
            <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
              {candidateSkills.length} detected
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Skills available from your resume analysis. These are compared with the roadmap skills below.
          </p>
          {candidateSkills.length > 0 ? (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {candidateSkills.map((skill) => (
                <span key={skill} className="rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-800">
                  {skill}
                </span>
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-3 text-xs leading-relaxed text-slate-500">
              No resume skills are available yet. You can still use the roadmap; analyze a resume to see skill comparisons here.
            </div>
          )}
        </section>

        <section className="space-y-2.5 rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-slate-800">
              <TrendingUp className="h-4 w-4 text-purple-600" />
              <span>Focus areas for this role</span>
            </div>
            <span className="rounded-full border border-purple-200 bg-purple-50 px-2 py-0.5 text-[10px] font-bold text-purple-700">
              Role matched
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Key competencies from the {roleFamily === 'general' ? 'general career planning' : roleFamily.replace(/^\w/, (letter) => letter.toUpperCase())} pathway for {targetRole}.
          </p>
          <div className="flex flex-wrap gap-1.5 pt-1">
            {focusSkills.map((skill: string) => {
              const hasSkill = candidateSkills.some((candidateSkill) => candidateSkill.toLowerCase() === skill.toLowerCase());
              return (
                <span key={skill} className={`rounded-lg border px-2.5 py-1 text-xs font-semibold ${hasSkill ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-purple-200 bg-purple-50 text-purple-800'}`}>
                  {hasSkill ? '✓ ' : '+ '}{skill}
                </span>
              );
            })}
          </div>
        </section>
      </div>

      <section className="space-y-4">
        <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
          <h2 className="flex items-center gap-2 text-base font-black text-slate-950">
            <Layers className="h-4 w-4 text-blue-600" />
            Your learning map
          </h2>
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-400">Select a stage to explore it</span>
            <button
              type="button"
              onClick={resetProgress}
              className="inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-semibold text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
              title="Reset completion progress for this roadmap"
            >
              <RotateCcw className="h-3.5 w-3.5" /> Reset
            </button>
          </div>
        </div>

        <div className="relative space-y-3">
          <div className="absolute bottom-8 left-4 top-8 hidden w-px bg-blue-100 sm:block" aria-hidden="true" />
          {milestones.map((milestone) => {
            const isSelected = milestone.id === selectedPhaseId;
            const matchedSkills = milestone.targetCompetencies.filter((skill) =>
              candidateSkills.some((candidateSkill) => candidateSkill.toLowerCase() === skill.toLowerCase())
            );
            return (
              <article
                key={`${targetRole}-${milestone.id}`}
                className={`relative overflow-hidden rounded-2xl border bg-white shadow-xs transition-all ${isSelected ? 'border-blue-500 ring-2 ring-blue-500/10' : 'border-slate-200 hover:border-slate-300'}`}
              >
                <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-start sm:gap-4 sm:p-5">
                  <button
                    type="button"
                    onClick={() => toggleMilestoneComplete(milestone.id)}
                    aria-label={milestone.completed ? `Mark ${milestone.title} incomplete` : `Mark ${milestone.title} complete`}
                    className={`z-10 flex h-9 w-9 shrink-0 items-center justify-center self-start rounded-xl border transition ${milestone.completed ? 'border-emerald-600 bg-emerald-600 text-white' : 'border-slate-300 bg-white text-slate-300 hover:border-blue-500 hover:text-blue-500'}`}
                  >
                    {milestone.completed ? <Check className="h-4 w-4 stroke-[3]" /> : <Circle className="h-4 w-4" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedPhaseId(milestone.id)}
                    aria-expanded={isSelected}
                    className="min-w-0 flex-1 text-left"
                  >
                    <div className="mb-1 flex flex-wrap items-center gap-2">
                      <span className="rounded-md border border-blue-200 bg-blue-50 px-2 py-0.5 text-[11px] font-black uppercase text-blue-700">{milestone.phase}</span>
                      <span className="text-xs font-semibold text-slate-500">{milestone.level}</span>
                      {milestone.completed && <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">Completed</span>}
                    </div>
                    <h3 className="break-words text-sm font-bold text-slate-900 sm:text-base">{milestone.title}</h3>
                    <p className="mt-1 flex items-center gap-1 text-[11px] text-slate-400">
                      <Calendar className="h-3 w-3" /> {milestone.timeline}
                    </p>
                  </button>
                  <ChevronRight className={`h-5 w-5 shrink-0 self-center text-slate-400 transition-transform ${isSelected ? 'rotate-90 text-blue-600' : ''}`} />
                </div>

                {isSelected && (
                  <div className="space-y-4 border-t border-slate-100 bg-slate-50/60 p-4 sm:p-5">
                    <p className="text-xs leading-relaxed text-slate-600 sm:text-sm">{milestone.description}</p>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div className="space-y-2 rounded-xl border border-slate-200 bg-white p-4">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                          <Code className="h-4 w-4 text-blue-600" /> Skills to build
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {milestone.targetCompetencies.map((skill) => {
                            const possessed = candidateSkills.some((candidateSkill) => candidateSkill.toLowerCase() === skill.toLowerCase());
                            return (
                              <span key={skill} className={`rounded-lg border px-2.5 py-1 text-xs font-semibold ${possessed ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-blue-200 bg-blue-50 text-blue-800'}`}>
                                {possessed ? '✓ ' : ''}{skill}
                              </span>
                            );
                          })}
                        </div>
                        {matchedSkills.length > 0 && <p className="text-[11px] text-emerald-700">{matchedSkills.length} listed skill{matchedSkills.length === 1 ? '' : 's'} match your resume skills.</p>}
                      </div>

                      <div className="space-y-1.5 rounded-xl border border-slate-200 bg-white p-4">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                          <Award className="h-4 w-4 text-purple-600" /> Practical project
                        </div>
                        <p className="text-xs leading-relaxed text-slate-600">{milestone.capstoneDeliverable}</p>
                      </div>
                    </div>

                    <div className="space-y-1 rounded-xl border border-purple-200 bg-purple-50/70 p-4">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-purple-900">
                        <BookOpen className="h-4 w-4 text-purple-600" /> Interview practice
                      </div>
                      <p className="text-xs font-medium leading-relaxed text-purple-950">&ldquo;{milestone.interviewGate}&rdquo;</p>
                    </div>

                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={() => toggleMilestoneComplete(milestone.id)}
                        className={`inline-flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-xs font-bold transition ${milestone.completed ? 'bg-slate-200 text-slate-700 hover:bg-slate-300' : 'bg-blue-600 text-white shadow-xs hover:bg-blue-700'}`}
                      >
                        {milestone.completed ? <><Check className="h-3.5 w-3.5" /> Mark as in progress</> : <><CheckCircle2 className="h-3.5 w-3.5" /> Mark stage complete</>}
                      </button>
                    </div>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      </section>

      <div className="flex items-start gap-2 rounded-xl border border-blue-100 bg-blue-50/70 p-4 text-xs leading-relaxed text-blue-900">
        <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />
        <p>
          This is a locally generated starter roadmap, not a live vacancy feed or a guarantee of employment. For a more precise plan, compare the skills here with current job descriptions in your location and adjust the stages to your experience and available study time.
        </p>
      </div>
    </div>
  );
};
