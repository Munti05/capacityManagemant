import { useState } from 'react';
import { useData } from '@/contexts/DataContext';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Search, Plus, X, Trash2, MapPin, Clock, Activity } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList,
} from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

const CATEGORIES = ['Frontend', 'Backend', 'Database', 'DevOps', 'Design', 'Management'];
const LEVELS = [1, 2, 3];

export default function ResourcesPage() {
  const { employees, skills, addEmployee, addEmployeeSkill, removeEmployeeSkill } = useData();
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string[]>([]);
  const [minLevel, setMinLevel] = useState<string>('1');

  // Add employee state
  const [showAdd, setShowAdd] = useState(false);
  const [newEmp, setNewEmp] = useState({
    name: '',
    baseCapacity: '1.0',
    hourlyRate: '',
    location: '',
  });
  const [addError, setAddError] = useState('');

  // Per-employee skill assignment UI
  const [openSkillFor, setOpenSkillFor] = useState<string | null>(null);
  const [skillSearch, setSkillSearch] = useState('');
  const [skillLevel, setSkillLevel] = useState<Record<string, string>>({});

  const toggleCategory = (cat: string) => {
    setCategoryFilter(prev => prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]);
  };

  const getSkillCategory = (skillId: string) => skills.find(s => s.id === skillId)?.category || '';

  let filtered = employees;
  if (search) {
    const q = search.toLowerCase();
    filtered = filtered.filter(e => {
      const nameMatch = e.name.toLowerCase().startsWith(q);
      const skillMatch = e.skills.some(s => s.skillName.toLowerCase().startsWith(q));
      return nameMatch || skillMatch;
    });
  }
  if (categoryFilter.length > 0) {
    const ml = Number(minLevel);
    filtered = filtered.filter(e =>
      categoryFilter.every(cat =>
        e.skills.some(s => {
          if (getSkillCategory(s.skillId) !== cat) return false;
          if (ml === 3) return s.level === 3;
          return s.level >= ml;
        })
      )
    );
  }

  const handleAddEmployee = () => {
    setAddError('');
    if (!newEmp.name.trim()) { setAddError('Name is required'); return; }
    const cap = Number(newEmp.baseCapacity);
    if (Number.isNaN(cap) || cap <= 0) { setAddError('Base capacity must be a positive number'); return; }
    const rate = Number(newEmp.hourlyRate);
    if (Number.isNaN(rate) || rate < 0) { setAddError('Hourly rate must be a non-negative number'); return; }
    if (!newEmp.location.trim()) { setAddError('Location is required'); return; }

    addEmployee({
      name: newEmp.name.trim(),
      baseCapacity: cap,
      hourlyRate: rate,
      location: newEmp.location.trim(),
    });
    setNewEmp({ name: '', baseCapacity: '1.0', hourlyRate: '', location: '' });
    setShowAdd(false);
  };

  const handleAssignSkill = (employeeId: string, skillId: string) => {
    const skill = skills.find(s => s.id === skillId);
    if (!skill) return;
    const level = Number(skillLevel[employeeId] || '1');
    addEmployeeSkill(employeeId, { skillId: skill.id, skillName: skill.name, level });
    setOpenSkillFor(null);
    setSkillSearch('');
  };

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search by name or skill..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 bg-card border-border h-9" />
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

        <Select value={minLevel} onValueChange={setMinLevel} disabled={categoryFilter.length === 0}>
          <SelectTrigger className={`w-32 h-9 bg-card text-xs ${categoryFilter.length === 0 ? 'opacity-50' : ''}`}>
            <SelectValue placeholder="Min Level" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1">Level 1+</SelectItem>
            <SelectItem value="2">Level 2+</SelectItem>
            <SelectItem value="3">Level 3</SelectItem>
          </SelectContent>
        </Select>

        <Button size="sm" className="h-9 ml-auto" onClick={() => setShowAdd(s => !s)}>
          <Plus className="w-4 h-4 mr-1" /> Add Employee
        </Button>
      </div>

      {/* Add Employee form */}
      {showAdd && (
        <div className="bg-card border border-border rounded-lg p-4 mb-4 animate-fade-in">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div>
              <Label className="text-xs text-muted-foreground">Name *</Label>
              <Input value={newEmp.name} onChange={e => setNewEmp(p => ({ ...p, name: e.target.value }))} className="bg-background h-8" />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Base Capacity *</Label>
              <Input type="number" step="0.1" min="0" value={newEmp.baseCapacity} onChange={e => setNewEmp(p => ({ ...p, baseCapacity: e.target.value }))} className="bg-background h-8" />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Hourly Rate</Label>
              <Input type="number" step="0.01" min="0" value={newEmp.hourlyRate} onChange={e => setNewEmp(p => ({ ...p, hourlyRate: e.target.value }))} className="bg-background h-8" placeholder="e.g. 45" />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Location *</Label>
              <Input value={newEmp.location} onChange={e => setNewEmp(p => ({ ...p, location: e.target.value }))} className="bg-background h-8" placeholder="e.g. Budapest" />
            </div>
          </div>
          {addError && <p className="text-xs text-destructive mt-2">{addError}</p>}
          <div className="flex gap-2 mt-3">
            <Button size="sm" onClick={handleAddEmployee}>Add</Button>
            <Button size="sm" variant="outline" onClick={() => { setShowAdd(false); setAddError(''); }}>Cancel</Button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(emp => {
          const availableSkills = skills.filter(s => !emp.skills.some(es => es.skillId === s.id));
          const currentLevel = skillLevel[emp.id] || '1';

          return (
            <div key={emp.id} className="bg-card border border-border rounded-lg p-4 hover:border-primary/30 transition-colors">
              <div className="mb-3">
                <h3 className="text-sm font-semibold text-foreground">{emp.name}</h3>
                <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1">
                    <Activity className="w-3 h-3" />
                    Cap. {(emp.baseCapacity ?? 1).toFixed(1)}
                  </span>
                  {typeof emp.hourlyRate === 'number' && (
                    <span className="inline-flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {emp.hourlyRate}/h
                    </span>
                  )}
                  {emp.location && (
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {emp.location}
                    </span>
                  )}
                </div>
              </div>

              <div className="space-y-1.5 mb-3">
                {emp.skills.map(skill => (
                  <div key={skill.skillId} className="flex items-center justify-between group">
                    <span className="text-xs text-muted-foreground">{skill.skillName}</span>
                    <div className="flex items-center gap-1.5">
                      <div className="flex gap-0.5">
                        {LEVELS.map(i => (
                          <div key={i} className={`w-5 h-1.5 rounded-full ${i <= skill.level ? 'bg-primary' : 'bg-muted'}`} />
                        ))}
                      </div>
                      <button
                        onClick={() => removeEmployeeSkill(emp.id, skill.skillId)}
                        className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-opacity"
                        aria-label="Remove skill"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
                {emp.skills.length === 0 && (
                  <p className="text-xs text-muted-foreground italic">No skills assigned</p>
                )}
              </div>

              {/* Add skill */}
              <div className="flex items-center gap-1.5 pt-2 border-t border-border">
                <Popover open={openSkillFor === emp.id} onOpenChange={(o) => { setOpenSkillFor(o ? emp.id : null); if (!o) setSkillSearch(''); }}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="sm" className="h-7 text-xs flex-1">
                      <Plus className="w-3 h-3 mr-1" /> Add skill
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="p-0 w-64 bg-popover" align="start">
                    <Command>
                      <CommandInput placeholder="Search skill..." value={skillSearch} onValueChange={setSkillSearch} />
                      <CommandList>
                        <CommandEmpty>No skill found.</CommandEmpty>
                        <CommandGroup>
                          {availableSkills.map(s => (
                            <CommandItem key={s.id} value={s.name} onSelect={() => handleAssignSkill(emp.id, s.id)}>
                              <span className="flex-1">{s.name}</span>
                              <span className="text-xs text-muted-foreground">{s.category}</span>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
                <Select value={currentLevel} onValueChange={(v) => setSkillLevel(p => ({ ...p, [emp.id]: v }))}>
                  <SelectTrigger className="h-7 text-xs bg-background w-20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {LEVELS.map(l => <SelectItem key={l} value={String(l)}>Lv.{l}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-muted-foreground text-sm">No employees found</div>
      )}
    </div>
  );
}
