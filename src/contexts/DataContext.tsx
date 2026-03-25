import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Project, PROJECTS, SKILLS, EMPLOYEES, Skill, Employee, ProjectStatus, ProjectSkill } from '@/data/mockData';

interface DataContextType {
  projects: Project[];
  skills: Skill[];
  employees: Employee[];
  addProject: (project: Omit<Project, 'id' | 'progress' | 'remainingCapacity' | 'spentCost' | 'skills'>) => void;
  updateProjectStatus: (projectId: string, status: ProjectStatus) => void;
  updateProject: (projectId: string, updates: Partial<Pick<Project, 'description' | 'startDate' | 'endDate'>>) => void;
  addProjectSkill: (projectId: string, skill: Omit<ProjectSkill, 'id'>) => void;
  removeProjectSkill: (projectId: string, skillRowId: string) => void;
  updateProjectSkill: (projectId: string, skillRowId: string, updates: Partial<ProjectSkill>) => void;
  addSkill: (skill: Omit<Skill, 'id'>) => void;
  deleteSkill: (skillId: string) => void;
  updateSkill: (skill: Skill) => void;
  getSkillUsageCount: (skillId: string) => number;
}

const DataContext = createContext<DataContextType | null>(null);

export function DataProvider({ children }: { children: ReactNode }) {
  const [projects, setProjects] = useState<Project[]>(PROJECTS);
  const [skills, setSkills] = useState<Skill[]>(SKILLS);
  const [employees] = useState<Employee[]>(EMPLOYEES);

  const addProject = (project: Omit<Project, 'id' | 'progress' | 'remainingCapacity' | 'spentCost' | 'skills'>) => {
    const newProject: Project = {
      ...project,
      id: `p${Date.now()}`,
      progress: 0,
      remainingCapacity: project.overallCapacity,
      spentCost: 0,
      skills: [],
    };
    setProjects(prev => [...prev, newProject]);
  };

  const updateProjectStatus = (projectId: string, status: ProjectStatus) => {
    setProjects(prev => prev.map(p => p.id === projectId ? { ...p, status } : p));
  };

  const updateProject = (projectId: string, updates: Partial<Pick<Project, 'description' | 'startDate' | 'endDate'>>) => {
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

  return (
    <DataContext.Provider value={{
      projects, skills, employees,
      addProject, updateProjectStatus, updateProject,
      addProjectSkill, removeProjectSkill, updateProjectSkill,
      addSkill, deleteSkill, updateSkill, getSkillUsageCount,
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
