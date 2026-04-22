/**
 * TanStack Query hooks. Each entity has a `keys` factory + a `useXxx` query hook
 * + a few `useXxxMutation` hooks. Mutations invalidate the relevant queries so
 * the UI re-renders automatically.
 *
 * When swapping the mock API for REST, only src/api/*.ts changes — these hooks
 * stay the same.
 */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as projectsApi from '@/api/projects';
import * as skillsApi from '@/api/skills';
import * as employeesApi from '@/api/employees';
import { Employee, EmployeeSkill, ProjectSkill, ProjectStatus, Skill } from '@/data/mockData';

// ── Query keys ──────────────────────────────────────────────────────────────
export const queryKeys = {
  projects: ['projects'] as const,
  skills: ['skills'] as const,
  employees: ['employees'] as const,
};

// ── Projects ────────────────────────────────────────────────────────────────
export function useProjects() {
  return useQuery({
    queryKey: queryKeys.projects,
    queryFn: projectsApi.listProjects,
  });
}

export function useCreateProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: Parameters<typeof projectsApi.createProject>[0]) =>
      projectsApi.createProject(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.projects }),
  });
}

export function useUpdateProjectStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { projectId: string; status: ProjectStatus }) =>
      projectsApi.updateProjectStatus(vars.projectId, vars.status),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.projects }),
  });
}

export function useUpdateProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { projectId: string; updates: projectsApi.ProjectUpdate }) =>
      projectsApi.updateProject(vars.projectId, vars.updates),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.projects }),
  });
}

export function useAddProjectSkill() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { projectId: string; skill: Omit<ProjectSkill, 'id'> }) =>
      projectsApi.addProjectSkill(vars.projectId, vars.skill),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.projects }),
  });
}

export function useRemoveProjectSkill() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { projectId: string; skillRowId: string }) =>
      projectsApi.removeProjectSkill(vars.projectId, vars.skillRowId),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.projects }),
  });
}

export function useUpdateProjectSkill() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { projectId: string; skillRowId: string; updates: Partial<ProjectSkill> }) =>
      projectsApi.updateProjectSkill(vars.projectId, vars.skillRowId, vars.updates),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.projects }),
  });
}

export function useReorderProjectSkills() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { projectId: string; orderedSkillRowIds: string[] }) =>
      projectsApi.reorderProjectSkills(vars.projectId, vars.orderedSkillRowIds),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.projects }),
  });
}

export function useAutoAssignSkill() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { projectId: string; skillRowId: string; preference: 'cost' | 'capacity' }) =>
      projectsApi.autoAssignSkill(vars.projectId, vars.skillRowId, vars.preference),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.projects }),
  });
}

export function useAutoAssignAllEmptySkills() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { projectId: string; preference: 'cost' | 'capacity' }) =>
      projectsApi.autoAssignAllEmptySkills(vars.projectId, vars.preference),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.projects }),
  });
}

// ── Skills ──────────────────────────────────────────────────────────────────
export function useSkills() {
  return useQuery({
    queryKey: queryKeys.skills,
    queryFn: skillsApi.listSkills,
  });
}

export function useCreateSkill() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: Omit<Skill, 'id'>) => skillsApi.createSkill(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.skills }),
  });
}

export function useDeleteSkill() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (skillId: string) => skillsApi.deleteSkill(skillId),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.skills }),
  });
}

export function useUpdateSkill() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (skill: Skill) => skillsApi.updateSkill(skill),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.skills }),
  });
}

// ── Employees ───────────────────────────────────────────────────────────────
export function useEmployees() {
  return useQuery({
    queryKey: queryKeys.employees,
    queryFn: employeesApi.listEmployees,
  });
}

export function useCreateEmployee() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: Parameters<typeof employeesApi.createEmployee>[0]) =>
      employeesApi.createEmployee(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.employees }),
  });
}

export function useAddEmployeeSkill() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { employeeId: string; skill: EmployeeSkill }) =>
      employeesApi.addEmployeeSkill(vars.employeeId, vars.skill),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.employees }),
  });
}

export function useRemoveEmployeeSkill() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { employeeId: string; skillId: string }) =>
      employeesApi.removeEmployeeSkill(vars.employeeId, vars.skillId),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.employees }),
  });
}

// Re-export Employee type so non-hook consumers don't need a separate import
export type { Employee };
