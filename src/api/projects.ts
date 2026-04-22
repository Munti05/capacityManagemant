/**
 * Projects API. Mock implementation today, swap function bodies for fetch()
 * against http://127.0.0.1:8000 when the REST backend is wired up.
 */
import { Project, ProjectSkill, ProjectStatus, Employee } from '@/data/mockData';
import { store, delay } from './store';

export type ProjectUpdate = Partial<
  Pick<
    Project,
    | 'description'
    | 'startDate'
    | 'endDate'
    | 'spentCost'
    | 'netProfitMargin'
    | 'profitMarginExclEmployee'
    | 'fixedCost'
    | 'revenue'
    | 'status'
  >
>;

export type NewProjectInput = Omit<
  Project,
  'id' | 'progress' | 'remainingCapacity' | 'skills'
>;

export async function listProjects(): Promise<Project[]> {
  return delay([...store.projects]);
}

export async function createProject(input: NewProjectInput): Promise<Project> {
  const id = `p${Date.now()}`;
  const newProject: Project = {
    ...input,
    id,
    progress: 0,
    remainingCapacity: input.overallCapacity,
    skills: [],
  };
  store.projects = [...store.projects, newProject];
  return delay(newProject);
}

export async function updateProjectStatus(
  projectId: string,
  status: ProjectStatus,
): Promise<Project | null> {
  let updated: Project | null = null;
  store.projects = store.projects.map(p => {
    if (p.id !== projectId) return p;
    updated = { ...p, status };
    return updated;
  });
  return delay(updated);
}

export async function updateProject(
  projectId: string,
  updates: ProjectUpdate,
): Promise<Project | null> {
  let updated: Project | null = null;
  store.projects = store.projects.map(p => {
    if (p.id !== projectId) return p;
    updated = { ...p, ...updates };
    return updated;
  });
  return delay(updated);
}

export async function addProjectSkill(
  projectId: string,
  skill: Omit<ProjectSkill, 'id'>,
): Promise<ProjectSkill | null> {
  let added: ProjectSkill | null = null;
  store.projects = store.projects.map(p => {
    if (p.id !== projectId) return p;
    added = { ...skill, id: `ps${Date.now()}-${Math.random().toString(36).slice(2, 6)}` };
    return { ...p, skills: [...p.skills, added] };
  });
  return delay(added);
}

export async function removeProjectSkill(
  projectId: string,
  skillRowId: string,
): Promise<void> {
  store.projects = store.projects.map(p => {
    if (p.id !== projectId) return p;
    return { ...p, skills: p.skills.filter(s => s.id !== skillRowId) };
  });
  return delay(undefined);
}

export async function updateProjectSkill(
  projectId: string,
  skillRowId: string,
  updates: Partial<ProjectSkill>,
): Promise<ProjectSkill | null> {
  let updated: ProjectSkill | null = null;
  store.projects = store.projects.map(p => {
    if (p.id !== projectId) return p;
    return {
      ...p,
      skills: p.skills.map(s => {
        if (s.id !== skillRowId) return s;
        updated = { ...s, ...updates };
        return updated;
      }),
    };
  });
  return delay(updated);
}

export async function reorderProjectSkills(
  projectId: string,
  orderedSkillRowIds: string[],
): Promise<void> {
  store.projects = store.projects.map(p => {
    if (p.id !== projectId) return p;
    const byId = new Map(p.skills.map(s => [s.id, s]));
    const reordered = orderedSkillRowIds
      .map(id => byId.get(id))
      .filter(Boolean) as ProjectSkill[];
    const seen = new Set(orderedSkillRowIds);
    const rest = p.skills.filter(s => !seen.has(s.id));
    return { ...p, skills: [...reordered, ...rest] };
  });
  return delay(undefined);
}

/** Pick the best candidate for an unassigned skill row using the chosen preference. */
function pickBestEmployee(
  employees: Employee[],
  skill: ProjectSkill,
  preference: 'cost' | 'capacity',
): Employee | null {
  const candidates = employees.filter(e =>
    e.skills.some(s => s.skillId === skill.skillId && s.level >= skill.level),
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
}

export async function autoAssignSkill(
  projectId: string,
  skillRowId: string,
  preference: 'cost' | 'capacity',
): Promise<ProjectSkill | null> {
  const project = store.projects.find(p => p.id === projectId);
  if (!project) return delay(null);
  const skill = project.skills.find(s => s.id === skillRowId);
  if (!skill || skill.fixed || skill.assignedEmployeeId) return delay(null);
  const best = pickBestEmployee(store.employees, skill, preference);
  if (!best) return delay(null);
  return updateProjectSkill(projectId, skillRowId, {
    assignedEmployeeId: best.id,
    assignedEmployeeName: best.name,
  });
}

export async function autoAssignAllEmptySkills(
  projectId: string,
  preference: 'cost' | 'capacity',
): Promise<void> {
  const project = store.projects.find(p => p.id === projectId);
  if (!project) return delay(undefined);
  for (const skill of project.skills) {
    if (skill.fixed || skill.assignedEmployeeId) continue;
    const best = pickBestEmployee(store.employees, skill, preference);
    if (!best) continue;
    // mutate in place via updateProjectSkill (still goes through the store)
    await updateProjectSkill(projectId, skill.id, {
      assignedEmployeeId: best.id,
      assignedEmployeeName: best.name,
    });
  }
  return delay(undefined);
}
