import { useState } from 'react';
import { useData } from '@/contexts/DataContext';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const CATEGORIES = ['Frontend', 'Backend', 'Database', 'DevOps', 'Design'];
const LEVELS = [1, 2, 3];

export default function ResourcesPage() {
  const { employees, skills } = useData();
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string[]>([]);
  const [minLevel, setMinLevel] = useState<string>('0');

  const toggleCategory = (cat: string) => {
    setCategoryFilter(prev => prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]);
  };

  const getSkillCategory = (skillId: string) => skills.find(s => s.id === skillId)?.category || '';

  let filtered = employees;

  if (search) {
    const q = search.toLowerCase();
    filtered = filtered.filter(e =>
      e.name.toLowerCase().includes(q) ||
      e.jobTitle.toLowerCase().includes(q) ||
      e.skills.some(s => s.skillName.toLowerCase().includes(q))
    );
  }

  if (categoryFilter.length > 0) {
    filtered = filtered.filter(e =>
      categoryFilter.every(cat =>
        e.skills.some(s => getSkillCategory(s.skillId) === cat)
      )
    );
  }

  const ml = Number(minLevel);
  if (ml > 0) {
    filtered = filtered.filter(e => e.skills.some(s => s.level >= ml));
  }

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search employees or skills..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 bg-card border-border h-9" />
        </div>

        <div className="flex gap-1">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => toggleCategory(cat)}
              className={`px-2.5 py-1 rounded-md text-xs transition-colors border ${
                categoryFilter.includes(cat)
                  ? 'bg-primary/15 text-primary border-primary/30'
                  : 'bg-card text-muted-foreground border-border hover:border-primary/30'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <Select value={minLevel} onValueChange={setMinLevel}>
          <SelectTrigger className="w-32 h-9 bg-card text-xs">
            <SelectValue placeholder="Min Level" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="0">Any Level</SelectItem>
            {LEVELS.map(l => <SelectItem key={l} value={String(l)}>Level {l}+</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(emp => (
          <div key={emp.id} className="bg-card border border-border rounded-lg p-4 hover:border-primary/30 transition-colors">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="text-sm font-semibold text-foreground">{emp.name}</h3>
                <p className="text-xs text-muted-foreground">{emp.jobTitle}</p>
              </div>
            </div>
            <div className="space-y-1.5 mb-3">
              {emp.skills.map(skill => (
                <div key={skill.skillId} className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">{skill.skillName}</span>
                  <div className="flex gap-0.5">
                    {LEVELS.map(i => (
                      <div key={i} className={`w-5 h-1.5 rounded-full ${i <= skill.level ? 'bg-primary' : 'bg-muted'}`} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-2 text-xs pt-2 border-t border-border">
              <Badge variant="outline" className="text-xs font-mono">Plan: {emp.plannedCapacity}d</Badge>
              <Badge variant="outline" className="text-xs font-mono">Alloc: {emp.allocatedCapacity}d</Badge>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-muted-foreground text-sm">No employees found</div>
      )}
    </div>
  );
}
