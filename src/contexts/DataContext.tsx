import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Project, PROJECTS, SKILLS, EMPLOYEES, Skill, Employee, ProjectStatus } from '@/data/mockData';

interface DataContextType {
  projects: Project[];
  skills: Skill[];
  employees: Employee[];
  addProject: (project: Omit<Project, 'id' | 'progress' | 'remainingCapacity' | 'spentCost' | 'skills'>) => void;
  updateProjectStatus: (projectId: string, status: ProjectStatus) => void;
  addSkill: (skill: Omit<Skill, 'id'>) => void;
  deleteSkill: (skillId: string) => void;
  updateSkill: (skill: Skill) => void;
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

  const addSkill = (skill: Omit<Skill, 'id'>) => {
    setSkills(prev => [...prev, { ...skill, id: `s${Date.now()}` }]);
  };

  const deleteSkill = (skillId: string) => {
    setSkills(prev => prev.filter(s => s.id !== skillId));
  };

  const updateSkill = (skill: Skill) => {
    setSkills(prev => prev.map(s => s.id === skill.id ? skill : s));
  };

  return (
    <DataContext.Provider value={{ projects, skills, employees, addProject, updateProjectStatus, addSkill, deleteSkill, updateSkill }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used within DataProvider');
  return ctx;
}
