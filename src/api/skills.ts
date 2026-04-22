/** Skills API. Mock today, swap to fetch() against /skills later. */
import { Skill } from '@/data/mockData';
import { store, delay } from './store';

export async function listSkills(): Promise<Skill[]> {
  return delay([...store.skills]);
}

export async function createSkill(input: Omit<Skill, 'id'>): Promise<Skill> {
  const created: Skill = { ...input, id: `s${Date.now()}` };
  store.skills = [...store.skills, created];
  return delay(created);
}

export async function deleteSkill(skillId: string): Promise<void> {
  store.skills = store.skills.filter(s => s.id !== skillId);
  return delay(undefined);
}

export async function updateSkill(skill: Skill): Promise<Skill> {
  store.skills = store.skills.map(s => (s.id === skill.id ? skill : s));
  return delay(skill);
}

/** Used by the Skills management screen to show how many active projects use a skill. */
export async function getSkillUsageCount(skillId: string): Promise<number> {
  const count = store.projects.filter(
    p =>
      p.status !== 'Canceled' &&
      p.status !== 'Finished' &&
      p.skills.some(s => s.skillId === skillId),
  ).length;
  return delay(count);
}
