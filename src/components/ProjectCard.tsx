import { useState } from 'react';
import { Project, ProjectStatus, ProjectSkill } from '@/data/mockData';
import { StatusBadge } from '@/components/StatusBadge';
import { ProgressBar } from '@/components/ProgressBar';
import { ChevronDown, ChevronUp, User, Pencil, Check, X, Plus, Trash2, Lock, Unlock, Calculator } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format, parseISO } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

function formatCurrency(value: number) {
  return new Intl.NumberFormat('hu-HU').format(value) + ' HUF';
}

export function ProjectCard({ project }: { project: Project }) {
  const [expanded, setExpanded] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editDesc, setEditDesc] = useState(project.description);
  const [editStart, setEditStart] = useState<Date | undefined>(parseISO(project.startDate));
  const [editEnd, setEditEnd] = useState<Date | undefined>(parseISO(project.endDate));
  const [editSpentCost, setEditSpentCost] = useState(String(project.spentCost));
  const [editNetProfit, setEditNetProfit] = useState(String(project.netProfitMargin));
  const [editProfitExcl, setEditProfitExcl] = useState(String(project.profitMarginExclEmployee));
  const [addingSkill, setAddingSkill] = useState(false);
  const [newSkillId, setNewSkillId] = useState('');
  const [newSkillLevel, setNewSkillLevel] = useState('1');
  const [newSkillDuration, setNewSkillDuration] = useState('');
  const [newSkillCapacity, setNewSkillCapacity] = useState('');
  const [newSkillStart, setNewSkillStart] = useState('');
  const [newSkillEnd, setNewSkillEnd] = useState('');
  const [capacityError, setCapacityError] = useState('');
  const { isPM } = useAuth();
  const { updateProjectStatus, updateProject, skills: globalSkills, addProjectSkill, removeProjectSkill, updateProjectSkill, employees } = useData();

  const statuses: ProjectStatus[] = ['Planned', 'Ongoing', 'Completed', 'Cancelled', 'On Hold'];

  const skillCapacity = project.skills.reduce((sum, s) => sum + s.duration, 0);
  const hasAssignedSkills = project.skills.some(s => s.assignedEmployeeId);
  const showPersonColumn = !(project.status === 'Planned' && !hasAssignedSkills);

  const newSkillAllFilled = newSkillId && newSkillLevel && newSkillDuration && newSkillStart && newSkillEnd && newSkillCapacity !== '';

  const handleSaveEdit = () => {
    updateProject(project.id, {
      description: editDesc,
      startDate: editStart ? format(editStart, 'yyyy-MM-dd') : project.startDate,
      endDate: editEnd ? format(editEnd, 'yyyy-MM-dd') : project.endDate,
      spentCost: Number(editSpentCost) || 0,
      netProfitMargin: Number(editNetProfit) || 0,
      profitMarginExclEmployee: Number(editProfitExcl) || 0,
    });
    setEditing(false);
  };

  const handleAddSkill = () => {
    if (!newSkillAllFilled) return;
    const cap = Number(newSkillCapacity);
    if (Number.isNaN(cap) || cap < 0 || cap > 1) {
      setCapacityError('Capacity on project must be between 0 and 1');
      return;
    }
    const skill = globalSkills.find(s => s.id === newSkillId);
    if (!skill) return;
    addProjectSkill(project.id, {
      skillId: skill.id,
      skillName: skill.name,
      level: Number(newSkillLevel),
      duration: Number(newSkillDuration),
      capacityOnProject: cap,
      startDate: newSkillStart,
      endDate: newSkillEnd,
      assignedEmployeeId: null,
      assignedEmployeeName: null,
      fixed: false,
    });
    setNewSkillId('');
    setNewSkillLevel('1');
    setNewSkillDuration('');
    setNewSkillCapacity('');
    setNewSkillStart('');
    setNewSkillEnd('');
    setCapacityError('');
    setAddingSkill(false);
  };

  const getEmployeeAvailability = (emp: typeof employees[0], skill: ProjectSkill): 'available' | 'overtime' => {
    const hasSkill = emp.skills.find(s => s.skillId === skill.skillId && s.level >= skill.level);
    if (!hasSkill) return 'overtime';
    const usedBefore = emp.plannedCapacity + emp.allocatedCapacity;
    const usedAfter = usedBefore + skill.duration;
    if (usedBefore >= emp.totalCapacity || usedAfter > emp.totalCapacity) return 'overtime';
    return 'available';
  };

  const calculateSuggestions = () => {
    project.skills.forEach(skill => {
      if (skill.fixed) return;
      const candidates = employees
        .filter(e => e.skills.some(s => s.skillId === skill.skillId && s.level >= skill.level))
        .sort((a, b) => {
          const aAvail = a.totalCapacity - a.allocatedCapacity - a.plannedCapacity;
          const bAvail = b.totalCapacity - b.allocatedCapacity - b.plannedCapacity;
          return bAvail - aAvail;
        });
      if (candidates.length > 0) {
        updateProjectSkill(project.id, skill.id, {
          assignedEmployeeId: candidates[0].id,
          assignedEmployeeName: candidates[0].name,
        });
      }
    });
  };

  const isSkillRowComplete = (skill: ProjectSkill) => {
    return skill.skillId && skill.level && skill.duration && skill.startDate && skill.endDate;
  };

  return (
    <div className="border border-border rounded-lg bg-card transition-all duration-200 hover:border-primary/30">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-3 px-4 py-3 text-left"
      >
        <span className="font-mono text-xs text-primary bg-primary/10 px-2 py-0.5 rounded shrink-0">
          {project.shortName}
        </span>
        <span className="text-sm font-medium text-foreground truncate flex-1">{project.name}</span>
        <StatusBadge status={project.status} />
        <span className="text-xs text-muted-foreground hidden md:inline border-l border-border pl-3">{project.pmNames.join(', ')}</span>
        <span className="text-xs text-muted-foreground font-mono hidden lg:inline border-l border-border pl-3">{project.startDate}</span>
        <div className="hidden sm:block border-l border-border pl-3"><ProgressBar value={project.progress} /></div>
        <span className="text-xs text-muted-foreground font-mono hidden lg:inline border-l border-border pl-3">{project.endDate}</span>
        <span className="text-xs text-muted-foreground font-mono hidden md:inline border-l border-border pl-3">
          {project.overallCapacity}d
          {project.skills.length > 0 && <span className="text-primary ml-1">({skillCapacity}d)</span>}
        </span>
        {expanded ? <ChevronUp className="w-4 h-4 text-muted-foreground shrink-0" /> : <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />}
      </button>

      {expanded && (
        <div className="px-4 pb-4 border-t border-border animate-fade-in">
          <div className="flex items-center justify-between mt-4 mb-3">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Details</h3>
            <div className="flex gap-2">
              {isPM && (
                <Select value={project.status} onValueChange={(v) => updateProjectStatus(project.id, v as ProjectStatus)}>
                  <SelectTrigger className="w-32 h-7 text-xs bg-background">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {statuses.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              )}
              {!editing ? (
                <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => setEditing(true)}>
                  <Pencil className="w-3 h-3 mr-1" /> Edit
                </Button>
              ) : (
                <div className="flex gap-1">
                  <Button variant="default" size="sm" className="h-7 text-xs" onClick={handleSaveEdit}>
                    <Check className="w-3 h-3 mr-1" /> Save
                  </Button>
                  <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => { setEditing(false); setEditDesc(project.description); setEditStart(parseISO(project.startDate)); setEditEnd(parseISO(project.endDate)); setEditSpentCost(String(project.spentCost)); setEditNetProfit(String(project.netProfitMargin)); setEditProfitExcl(String(project.profitMarginExclEmployee)); }}>
                    <X className="w-3 h-3 mr-1" /> Cancel
                  </Button>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <DetailItem label="Client" value={project.client} />
            {editing ? (
              <div>
                <p className="text-xs text-muted-foreground mb-1">Description</p>
                <Textarea value={editDesc} onChange={e => setEditDesc(e.target.value)} className="bg-background text-sm" rows={2} />
              </div>
            ) : (
              <DetailItem label="Description" value={project.description} />
            )}
            {editing ? (
              <div>
                <p className="text-xs text-muted-foreground mb-1">Start Date</p>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className={cn("w-full h-8 text-xs justify-start", !editStart && "text-muted-foreground")}>
                      <CalendarIcon className="w-3 h-3 mr-1" />
                      {editStart ? format(editStart, 'yyyy-MM-dd') : 'Pick date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="single" selected={editStart} onSelect={setEditStart} className="p-3 pointer-events-auto" />
                  </PopoverContent>
                </Popover>
              </div>
            ) : (
              <DetailItem label="Start Date" value={project.startDate} />
            )}
            {editing ? (
              <div>
                <p className="text-xs text-muted-foreground mb-1">End Date</p>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className={cn("w-full h-8 text-xs justify-start", !editEnd && "text-muted-foreground")}>
                      <CalendarIcon className="w-3 h-3 mr-1" />
                      {editEnd ? format(editEnd, 'yyyy-MM-dd') : 'Pick date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="single" selected={editEnd} onSelect={setEditEnd} className="p-3 pointer-events-auto" />
                  </PopoverContent>
                </Popover>
              </div>
            ) : (
              <DetailItem label="End Date" value={project.endDate} />
            )}
            <DetailItem label="Remaining Capacity" value={`${project.remainingCapacity} man-days`} />
            <DetailItem label="Estimated Cost" value={formatCurrency(project.estimatedCost)} />
            {editing ? (
              <div>
                <p className="text-xs text-muted-foreground mb-1">Spent Cost</p>
                <Input type="number" value={editSpentCost} onChange={e => setEditSpentCost(e.target.value)} className="bg-background h-8 text-sm" />
              </div>
            ) : (
              <DetailItem label="Spent Cost" value={formatCurrency(project.spentCost)} />
            )}
            <DetailItem label="Estimated Revenue" value={formatCurrency(project.estimatedRevenue)} />
            {editing ? (
              <div>
                <p className="text-xs text-muted-foreground mb-1">Net Profit Margin Est. (%)</p>
                <Input type="number" step="0.1" value={editNetProfit} onChange={e => setEditNetProfit(e.target.value)} className="bg-background h-8 text-sm" />
              </div>
            ) : (
              <DetailItem label="Net Profit Margin Est." value={`${project.netProfitMargin}%`} />
            )}
            {editing ? (
              <div>
                <p className="text-xs text-muted-foreground mb-1">Profit Margin Excl. Empl. (%)</p>
                <Input type="number" step="0.1" value={editProfitExcl} onChange={e => setEditProfitExcl(e.target.value)} className="bg-background h-8 text-sm" />
              </div>
            ) : (
              <DetailItem label="Profit Margin Excl. Empl." value={`${project.profitMarginExclEmployee}%`} />
            )}
          </div>

          {/* Skills section */}
          <div className="mt-5">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Required Skills</h4>
              <div className="flex gap-2">
                {isPM && (
                  <>
                    <Button variant="outline" size="sm" className="h-7 text-xs" onClick={calculateSuggestions}>
                      <Calculator className="w-3 h-3 mr-1" /> Calculate
                    </Button>
                    <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => setAddingSkill(!addingSkill)}>
                      <Plus className="w-3 h-3 mr-1" /> Add Skill
                    </Button>
                  </>
                )}
              </div>
            </div>

            {/* Skill list header */}
            {project.skills.length > 0 && (
              <div className="grid gap-3 text-xs text-muted-foreground font-medium uppercase tracking-wider px-3 py-1.5 border-b border-border mb-1"
                style={{ gridTemplateColumns: showPersonColumn ? '1fr 50px 1fr 80px 1fr 70px' : '1fr 50px 1fr 80px 70px' }}>
                <span>Skill</span>
                <span>Level</span>
                <span>Interval</span>
                <span>Effort</span>
                {showPersonColumn && <span>Assigned</span>}
                <span></span>
              </div>
            )}

            <div className="space-y-1">
              {project.skills.map((skill) => {
                const rowComplete = isSkillRowComplete(skill);
                return (
                  <div key={skill.id} className="grid gap-3 items-center bg-background rounded-md px-3 py-2 text-sm"
                    style={{ gridTemplateColumns: showPersonColumn ? '1fr 50px 1fr 80px 1fr 70px' : '1fr 50px 1fr 80px 70px' }}>
                    <span className="font-medium text-foreground">{skill.skillName}</span>
                    <Badge variant="outline" className="text-xs font-mono w-fit">Lv.{skill.level}</Badge>
                    <span className="text-xs text-muted-foreground font-mono">{skill.startDate} – {skill.endDate}</span>
                    <span className="text-xs text-muted-foreground font-mono">{skill.duration}d</span>
                    {showPersonColumn && (
                      <div>
                        {isPM ? (
                          <Select
                            value={skill.assignedEmployeeId || '_none'}
                            onValueChange={(v) => {
                              const emp = employees.find(e => e.id === v);
                              updateProjectSkill(project.id, skill.id, {
                                assignedEmployeeId: v === '_none' ? null : v,
                                assignedEmployeeName: v === '_none' ? null : emp?.name || null,
                              });
                            }}
                            disabled={!rowComplete}
                          >
                            <SelectTrigger className={cn("h-7 text-xs bg-card w-full", !rowComplete && "opacity-50 cursor-not-allowed")}>
                              <SelectValue placeholder="Assign..." />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="_none">Unassigned</SelectItem>
                              {employees.map(emp => {
                                const availability = getEmployeeAvailability(emp, skill);
                                return (
                                  <SelectItem key={emp.id} value={emp.id}>
                                    <span className={cn(
                                      "inline-flex items-center gap-1.5",
                                    )}>
                                      <span className={cn(
                                        "w-2 h-2 rounded-full shrink-0",
                                        availability === 'available' ? 'bg-primary' : 'bg-destructive'
                                      )} />
                                      {emp.name}
                                    </span>
                                  </SelectItem>
                                );
                              })}
                            </SelectContent>
                          </Select>
                        ) : skill.assignedEmployeeName ? (
                          <span className="flex items-center gap-1 text-xs text-primary">
                            <User className="w-3 h-3" />
                            {skill.assignedEmployeeName}
                          </span>
                        ) : (
                          <span className="text-xs text-muted-foreground italic">Unassigned</span>
                        )}
                      </div>
                    )}
                    <div className="flex gap-1">
                      {isPM && (
                        <>
                          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => updateProjectSkill(project.id, skill.id, { fixed: !skill.fixed })}>
                            {skill.fixed ? <Lock className="w-3 h-3 text-warning" /> : <Unlock className="w-3 h-3 text-muted-foreground" />}
                          </Button>
                          <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-destructive" onClick={() => removeProjectSkill(project.id, skill.id)}>
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Add skill form */}
            {addingSkill && isPM && (
              <div className="mt-2 p-3 border border-border rounded-md bg-background animate-fade-in">
                <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                  <Select value={newSkillId} onValueChange={setNewSkillId}>
                    <SelectTrigger className="h-8 text-xs bg-card">
                      <SelectValue placeholder="Select skill..." />
                    </SelectTrigger>
                    <SelectContent>
                      {globalSkills.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <Select value={newSkillLevel} onValueChange={setNewSkillLevel}>
                    <SelectTrigger className="h-8 text-xs bg-card">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3].map(l => <SelectItem key={l} value={String(l)}>Level {l}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <Input type="number" placeholder="Man-days" value={newSkillDuration} onChange={e => setNewSkillDuration(e.target.value)} className="h-8 text-xs bg-card" />
                  <Input type="date" placeholder="Start" value={newSkillStart} onChange={e => setNewSkillStart(e.target.value)} className="h-8 text-xs bg-card" />
                  <Input type="date" placeholder="End" value={newSkillEnd} onChange={e => setNewSkillEnd(e.target.value)} className="h-8 text-xs bg-card" />
                </div>
                <div className="flex gap-2 mt-2">
                  <Button size="sm" className="h-7 text-xs" onClick={handleAddSkill} disabled={!newSkillAllFilled}>Add</Button>
                  <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => setAddingSkill(false)}>Cancel</Button>
                </div>
              </div>
            )}

            {project.skills.length === 0 && !addingSkill && (
              <p className="text-xs text-muted-foreground italic py-2">No skills assigned yet</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground mb-0.5">{label}</p>
      <p className="text-sm text-foreground">{value}</p>
    </div>
  );
}
