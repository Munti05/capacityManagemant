import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Project, PROJECTS, SKILLS, EMPLOYEES, Skill, Employee, EmployeeSkill, ProjectStatus, ProjectSkill } from '@/data/mockData';

interface DataContextType {
  projects: Project[];
  skills: Skill[];
  employees: Employee[];
  addProject: (project: Omit<Project, 'id' | 'progress' | 'remainingCapacity' | 'skills'>) => string;
  updateProjectStatus: (projectId: string, status: ProjectStatus) => void;
  updateProject: (projectId: string, updates: Partial<Pick<Project, 'description' | 'startDate' | 'endDate' | 'spentCost' | 'netProfitMargin' | 'profitMarginExclEmployee' | 'fixedCost' | 'revenue' | 'status'>>) => void;
  addProjectSkill: (projectId: string, skill: Omit<ProjectSkill, 'id'>) => void;
  removeProjectSkill: (projectId: string, skillRowId: string) => void;
  updateProjectSkill: (projectId: string, skillRowId: string, updates: Partial<ProjectSkill>) => void;
  reorderProjectSkills: (projectId: string, orderedSkillRowIds: string[]) => void;
  autoAssignSkill: (projectId: string, skillRowId: string, preference: 'cost' | 'capacity') => void;
  autoAssignAllEmptySkills: (projectId: string, preference: 'cost' | 'capacity') => void;
  addSkill: (skill: Omit<Skill, 'id'>) => void;
  deleteSkill: (skillId: string) => void;
  updateSkill: (skill: Skill) => void;
  getSkillUsageCount: (skillId: string) => number;
  addEmployee: (employee: Omit<Employee, 'id' | 'skills' | 'plannedCapacity' | 'allocatedCapacity' | 'totalCapacity'>) => string;
  addEmployeeSkill: (employeeId: string, skill: EmployeeSkill) => void;
  removeEmployeeSkill: (employeeId: string, skillId: string) => void;
}

const DataContext = createContext<DataContextType | null>(null);

export function DataProvider({ children }: { children: ReactNode }) {
  const [projects, setProjects] = useState<Project[]>(PROJECTS);
  const [skills, setSkills] = useState<Skill[]>(SKILLS);
  const [employees, setEmployees] = useState<Employee[]>(EMPLOYEES);

  const addProject = (project: Omit<Project, 'id' | 'progress' | 'remainingCapacity' | 'skills'>) => {
    const id = `p${Date.now()}`;
    const newProject: Project = {
      ...project,
      id,
      progress: 0,
      remainingCapacity: project.overallCapacity,
      skills: [],
    };
    setProjects(prev => [...prev, newProject]);
    return id;
  };

  const updateProjectStatus = (projectId: string, status: ProjectStatus) => {
    setProjects(prev => prev.map(p => p.id === projectId ? { ...p, status } : p));
  };

  const updateProject = (projectId: string, updates: Partial<Pick<Project, 'description' | 'startDate' | 'endDate' | 'spentCost' | 'netProfitMargin' | 'profitMarginExclEmployee' | 'fixedCost' | 'revenue' | 'status'>>) => {
    setProjects(prev => prev.map(p => p.id === projectId ? { ...p, ...updates } : p));
  };

  const addProjectSkill = (projectId: string, skill: Omit<ProjectSkill, 'id'>) => {
    setProjects(prev => prev.map(p => {
      if (p.id !== projectId) return p;
      return { ...p, skills: [...p.skills, { ...skill, id: `ps${Date.now()}-${Math.random().toString(36).slice(2, 6)}` }] };
    }));
  };

  const removeProjectSkill = (projectId: string, skillRowId: string) => {
    setProjects(prev => prev.map(p => {
      if (p.id !== projectId) return p;
      return { ...p, skills: p.skills.filter(s => s.id !== skillRowId) };
    }));
  };

  const updateProjectSkill = (projectId: string, skillRowId: string, updates: Partial<ProjectSkill>) => {
    setProjects(prev => prev.map(p => {
      if (p.id !== projectId) return p;
      return { ...p, skills: p.skills.map(s => s.id === skillRowId ? { ...s, ...updates } : s) };
    }));
  };

  const reorderProjectSkills = (projectId: string, orderedSkillRowIds: string[]) => {
    setProjects(prev => prev.map(p => {
      if (p.id !== projectId) return p;
      const byId = new Map(p.skills.map(s => [s.id, s]));
      const reordered = orderedSkillRowIds.map(id => byId.get(id)).filter(Boolean) as ProjectSkill[];
      // append any skills not in orderedSkillRowIds (safety)
      const seen = new Set(orderedSkillRowIds);
      const rest = p.skills.filter(s => !seen.has(s.id));
      return { ...p, skills: [...reordered, ...rest] };
    }));
  };

  const pickBestEmployee = (
    project: Project,
    skill: ProjectSkill,
    preference: 'cost' | 'capacity',
  ): Employee | null => {
    const candidates = employees.filter(e =>
      e.skills.some(s => s.skillId === skill.skillId && s.level >= skill.level)
    );
    if (candidates.length === 0) return null;
    const sorted = [...candidates].sort((a, b) => {
      if (preference === 'cost') {
        return (a.hourlyRate ?? Infinity) - (b.hourlyRate ?? Infinity);
      }
      const aFree = a.totalCapacity - a.allocatedCapacity - a.plannedCapacity;
      const bFree = b.totalCapacity - b.allocatedCapacity - b.plannedCapacity;
      return bFree - aFree;
    });
    return sorted[0] ?? null;
  };

  const autoAssignSkill = (projectId: string, skillRowId: string, preference: 'cost' | 'capacity') => {
    const project = projects.find(p => p.id === projectId);
    if (!project) return;
    const skill = project.skills.find(s => s.id === skillRowId);
    if (!skill || skill.fixed || skill.assignedEmployeeId) return;
    const best = pickBestEmployee(project, skill, preference);
    if (!best) return;
    updateProjectSkill(projectId, skillRowId, {
      assignedEmployeeId: best.id,
      assignedEmployeeName: best.name,
    });
  };

  const autoAssignAllEmptySkills = (projectId: string, preference: 'cost' | 'capacity') => {
    const project = projects.find(p => p.id === projectId);
    if (!project) return;
    project.skills.forEach(skill => {
      if (skill.fixed || skill.assignedEmployeeId) return;
      const best = pickBestEmployee(project, skill, preference);
      if (!best) return;
      updateProjectSkill(projectId, skill.id, {
        assignedEmployeeId: best.id,
        assignedEmployeeName: best.name,
      });
    });
  };

  const addSkill = (skill: Omit<Skill, 'id'>) => {
    setSkills(prev => [...prev, { ...skill, id: `s${Date.now()}` }]);
  };

  const deleteSkill = (skillId: string) => {
    setSkills(prev => prev.filter(s => s.id !== skillId));
  };

  const updateSkill = (skill: Skill) => {
    setSkills(prev => prev.map(s => s.id === skill.id ? skill : s));
  };

  const getSkillUsageCount = (skillId: string) => {
    return projects.filter(p =>
      p.status !== 'Canceled' && p.status !== 'Finished' &&
      p.skills.some(s => s.skillId === skillId)
    ).length;
  };

  const addEmployee = (employee: Omit<Employee, 'id' | 'skills' | 'plannedCapacity' | 'allocatedCapacity' | 'totalCapacity'>) => {
    const id = `e${Date.now()}`;
    const totalCapacity = Math.round((employee.baseCapacity ?? 1) * 40);
    const newEmployee: Employee = {
      ...employee,
      id,
      skills: [],
      plannedCapacity: 0,
      allocatedCapacity: 0,
      totalCapacity,
    };
    setEmployees(prev => [...prev, newEmployee]);
    return id;
  };

  const addEmployeeSkill = (employeeId: string, skill: EmployeeSkill) => {
    setEmployees(prev => prev.map(e => {
      if (e.id !== employeeId) return e;
      if (e.skills.some(s => s.skillId === skill.skillId)) return e;
      return { ...e, skills: [...e.skills, skill] };
    }));
  };

  const removeEmployeeSkill = (employeeId: string, skillId: string) => {
    setEmployees(prev => prev.map(e =>
      e.id === employeeId ? { ...e, skills: e.skills.filter(s => s.skillId !== skillId) } : e
    ));
  };

  return (
    <DataContext.Provider value={{
      projects, skills, employees,
      addProject, updateProjectStatus, updateProject,
      addProjectSkill, removeProjectSkill, updateProjectSkill,
      addSkill, deleteSkill, updateSkill, getSkillUsageCount,
      addEmployee, addEmployeeSkill, removeEmployeeSkill,
    }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used within DataProvider');
  return ctx;
}
