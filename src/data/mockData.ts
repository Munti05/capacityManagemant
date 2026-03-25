export interface Skill {
  id: string;
  name: string;
  category: string;
  description: string;
}

export interface EmployeeSkill {
  skillId: string;
  skillName: string;
  level: number; // 1-3
}

export interface Employee {
  id: string;
  name: string;
  jobTitle: string;
  salary: number;
  experience: number; // years
  skills: EmployeeSkill[];
  plannedCapacity: number;
  allocatedCapacity: number;
  totalCapacity: number;
}

export interface ProjectSkill {
  id: string;
  skillId: string;
  skillName: string;
  level: number; // 1-3
  duration: number; // man-days
  startDate: string;
  endDate: string;
  assignedEmployeeId: string | null;
  assignedEmployeeName: string | null;
  fixed: boolean;
}

export type ProjectStatus = 'Planned' | 'Ongoing' | 'Canceled' | 'Finished';

export interface Project {
  id: string;
  shortName: string;
  name: string;
  description: string;
  status: ProjectStatus;
  client: string;
  pmIds: string[];
  pmNames: string[];
  startDate: string;
  endDate: string;
  progress: number;
  overallCapacity: number;
  remainingCapacity: number;
  estimatedCost: number;
  spentCost: number;
  estimatedRevenue: number;
  skills: ProjectSkill[];
}

export const SKILLS: Skill[] = [
  { id: 's1', name: 'React', category: 'Frontend', description: 'React.js framework' },
  { id: 's2', name: 'TypeScript', category: 'Frontend', description: 'TypeScript language' },
  { id: 's3', name: 'Python', category: 'Backend', description: 'Python programming' },
  { id: 's4', name: 'Node.js', category: 'Backend', description: 'Node.js runtime' },
  { id: 's5', name: 'PostgreSQL', category: 'Database', description: 'PostgreSQL database' },
  { id: 's6', name: 'Docker', category: 'DevOps', description: 'Docker containerization' },
  { id: 's7', name: 'AWS', category: 'DevOps', description: 'Amazon Web Services' },
  { id: 's8', name: 'Figma', category: 'Design', description: 'UI/UX design tool' },
  { id: 's9', name: 'GraphQL', category: 'Backend', description: 'GraphQL API' },
  { id: 's10', name: 'Kubernetes', category: 'DevOps', description: 'Container orchestration' },
];

export const EMPLOYEES: Employee[] = [
  { id: 'e1', name: 'Alice Johnson', jobTitle: 'Senior Frontend Developer', salary: 850000, experience: 6, skills: [{ skillId: 's1', skillName: 'React', level: 3 }, { skillId: 's2', skillName: 'TypeScript', level: 3 }, { skillId: 's8', skillName: 'Figma', level: 2 }], plannedCapacity: 10, allocatedCapacity: 15, totalCapacity: 40 },
  { id: 'e2', name: 'Bob Smith', jobTitle: 'Backend Engineer', salary: 900000, experience: 8, skills: [{ skillId: 's3', skillName: 'Python', level: 3 }, { skillId: 's5', skillName: 'PostgreSQL', level: 3 }, { skillId: 's9', skillName: 'GraphQL', level: 2 }], plannedCapacity: 5, allocatedCapacity: 20, totalCapacity: 40 },
  { id: 'e3', name: 'Carol Davis', jobTitle: 'DevOps Lead', salary: 950000, experience: 10, skills: [{ skillId: 's4', skillName: 'Node.js', level: 3 }, { skillId: 's6', skillName: 'Docker', level: 3 }, { skillId: 's7', skillName: 'AWS', level: 3 }, { skillId: 's10', skillName: 'Kubernetes', level: 2 }], plannedCapacity: 8, allocatedCapacity: 12, totalCapacity: 40 },
  { id: 'e4', name: 'Dan Wilson', jobTitle: 'Full Stack Developer', salary: 800000, experience: 5, skills: [{ skillId: 's1', skillName: 'React', level: 2 }, { skillId: 's2', skillName: 'TypeScript', level: 3 }, { skillId: 's4', skillName: 'Node.js', level: 3 }], plannedCapacity: 12, allocatedCapacity: 8, totalCapacity: 40 },
  { id: 'e5', name: 'Eve Martinez', jobTitle: 'Cloud Architect', salary: 1100000, experience: 12, skills: [{ skillId: 's3', skillName: 'Python', level: 3 }, { skillId: 's7', skillName: 'AWS', level: 3 }, { skillId: 's6', skillName: 'Docker', level: 3 }, { skillId: 's10', skillName: 'Kubernetes', level: 3 }], plannedCapacity: 3, allocatedCapacity: 25, totalCapacity: 40 },
  { id: 'e6', name: 'Frank Lee', jobTitle: 'UI/UX Designer', salary: 700000, experience: 4, skills: [{ skillId: 's8', skillName: 'Figma', level: 3 }, { skillId: 's1', skillName: 'React', level: 1 }], plannedCapacity: 0, allocatedCapacity: 10, totalCapacity: 40 },
];

export const PROJECTS: Project[] = [
  {
    id: 'p1', shortName: 'CRM', name: 'Customer Relationship Management', description: 'Full CRM system with sales pipeline, customer tracking, and reporting.',
    status: 'Ongoing', client: 'Acme Corp', pmIds: ['pm1'], pmNames: ['Project Manager'],
    startDate: '2026-01-15', endDate: '2026-06-30', progress: 45, overallCapacity: 120,
    remainingCapacity: 66, estimatedCost: 5000000, spentCost: 2250000, estimatedRevenue: 8000000,
    skills: [
      { id: 'ps1', skillId: 's1', skillName: 'React', level: 3, duration: 30, startDate: '2026-01-15', endDate: '2026-04-15', assignedEmployeeId: 'e1', assignedEmployeeName: 'Alice Johnson', fixed: false },
      { id: 'ps2', skillId: 's3', skillName: 'Python', level: 3, duration: 25, startDate: '2026-02-01', endDate: '2026-05-01', assignedEmployeeId: 'e2', assignedEmployeeName: 'Bob Smith', fixed: false },
      { id: 'ps3', skillId: 's5', skillName: 'PostgreSQL', level: 2, duration: 15, startDate: '2026-03-01', endDate: '2026-05-30', assignedEmployeeId: 'e2', assignedEmployeeName: 'Bob Smith', fixed: true },
    ],
  },
  {
    id: 'p2', shortName: 'ERP', name: 'Enterprise Resource Planning', description: 'ERP module for inventory, procurement, and finance.',
    status: 'Planned', client: 'GlobalTech', pmIds: ['pm1'], pmNames: ['Project Manager'],
    startDate: '2026-04-01', endDate: '2026-12-31', progress: 0, overallCapacity: 200,
    remainingCapacity: 200, estimatedCost: 10000000, spentCost: 0, estimatedRevenue: 15000000,
    skills: [
      { id: 'ps4', skillId: 's2', skillName: 'TypeScript', level: 3, duration: 40, startDate: '2026-04-01', endDate: '2026-08-01', assignedEmployeeId: null, assignedEmployeeName: null, fixed: false },
      { id: 'ps5', skillId: 's4', skillName: 'Node.js', level: 3, duration: 35, startDate: '2026-05-01', endDate: '2026-10-01', assignedEmployeeId: null, assignedEmployeeName: null, fixed: false },
      { id: 'ps6', skillId: 's7', skillName: 'AWS', level: 3, duration: 20, startDate: '2026-06-01', endDate: '2026-11-01', assignedEmployeeId: null, assignedEmployeeName: null, fixed: false },
    ],
  },
  {
    id: 'p3', shortName: 'MOB', name: 'Mobile App Redesign', description: 'Complete redesign of the mobile application with new UX.',
    status: 'Ongoing', client: 'StartupXYZ', pmIds: ['pm2'], pmNames: ['Sarah Connor'],
    startDate: '2026-02-01', endDate: '2026-05-15', progress: 60, overallCapacity: 80,
    remainingCapacity: 32, estimatedCost: 3000000, spentCost: 1800000, estimatedRevenue: 4500000,
    skills: [
      { id: 'ps7', skillId: 's8', skillName: 'Figma', level: 3, duration: 20, startDate: '2026-02-01', endDate: '2026-03-15', assignedEmployeeId: 'e6', assignedEmployeeName: 'Frank Lee', fixed: false },
      { id: 'ps8', skillId: 's1', skillName: 'React', level: 2, duration: 25, startDate: '2026-03-01', endDate: '2026-05-15', assignedEmployeeId: 'e4', assignedEmployeeName: 'Dan Wilson', fixed: false },
    ],
  },
  {
    id: 'p4', shortName: 'API', name: 'API Gateway Platform', description: 'Centralized API gateway with rate limiting, auth, and monitoring.',
    status: 'Finished', client: 'MegaCorp', pmIds: ['pm1'], pmNames: ['Project Manager'],
    startDate: '2025-09-01', endDate: '2026-01-31', progress: 100, overallCapacity: 90,
    remainingCapacity: 0, estimatedCost: 4000000, spentCost: 3800000, estimatedRevenue: 6000000,
    skills: [
      { id: 'ps9', skillId: 's4', skillName: 'Node.js', level: 3, duration: 30, startDate: '2025-09-01', endDate: '2025-12-15', assignedEmployeeId: 'e3', assignedEmployeeName: 'Carol Davis', fixed: true },
      { id: 'ps10', skillId: 's6', skillName: 'Docker', level: 3, duration: 15, startDate: '2025-11-01', endDate: '2026-01-31', assignedEmployeeId: 'e3', assignedEmployeeName: 'Carol Davis', fixed: true },
    ],
  },
  {
    id: 'p5', shortName: 'DAS', name: 'Data Analytics Suite', description: 'Real-time analytics dashboard with ML-powered insights.',
    status: 'Canceled', client: 'DataDriven Inc', pmIds: ['pm2'], pmNames: ['Sarah Connor'],
    startDate: '2025-11-01', endDate: '2026-04-30', progress: 20, overallCapacity: 150,
    remainingCapacity: 120, estimatedCost: 7000000, spentCost: 1400000, estimatedRevenue: 12000000,
    skills: [
      { id: 'ps11', skillId: 's3', skillName: 'Python', level: 3, duration: 40, startDate: '2025-11-01', endDate: '2026-03-01', assignedEmployeeId: 'e5', assignedEmployeeName: 'Eve Martinez', fixed: false },
      { id: 'ps12', skillId: 's9', skillName: 'GraphQL', level: 2, duration: 20, startDate: '2026-01-01', endDate: '2026-04-30', assignedEmployeeId: null, assignedEmployeeName: null, fixed: false },
    ],
  },
];
