/** Employees API. Mock today, swap to fetch() against /employees later. */
import { Employee, EmployeeSkill } from '@/data/mockData';
import { store, delay } from './store';

export type NewEmployeeInput = Omit<
  Employee,
  'id' | 'skills' | 'plannedCapacity' | 'allocatedCapacity' | 'totalCapacity'
>;

export async function listEmployees(): Promise<Employee[]> {
  return delay([...store.employees]);
}

export async function createEmployee(input: NewEmployeeInput): Promise<Employee> {
  const id = `e${Date.now()}`;
  const totalCapacity = Math.round((input.baseCapacity ?? 1) * 40);
  const created: Employee = {
    ...input,
    id,
    skills: [],
    plannedCapacity: 0,
    allocatedCapacity: 0,
    totalCapacity,
  };
  store.employees = [...store.employees, created];
  return delay(created);
}

export async function addEmployeeSkill(
  employeeId: string,
  skill: EmployeeSkill,
): Promise<Employee | null> {
  let updated: Employee | null = null;
  store.employees = store.employees.map(e => {
    if (e.id !== employeeId) return e;
    if (e.skills.some(s => s.skillId === skill.skillId)) {
      updated = e;
      return e;
    }
    updated = { ...e, skills: [...e.skills, skill] };
    return updated;
  });
  return delay(updated);
}

export async function removeEmployeeSkill(
  employeeId: string,
  skillId: string,
): Promise<Employee | null> {
  let updated: Employee | null = null;
  store.employees = store.employees.map(e => {
    if (e.id !== employeeId) return e;
    updated = { ...e, skills: e.skills.filter(s => s.skillId !== skillId) };
    return updated;
  });
  return delay(updated);
}
