import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '@/contexts/DataContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft } from 'lucide-react';
import { ProjectStatus } from '@/data/mockData';

const STATUS_OPTIONS: ProjectStatus[] = ['Planned', 'Ongoing', 'Completed', 'Cancelled', 'On Hold'];

export default function NewProjectPage() {
  const navigate = useNavigate();
  const { addProject, addProjectSkill, skills, employees } = useData();

  // Step 1: project info
  const [step, setStep] = useState<1 | 2>(1);
  const [createdProject, setCreatedProject] = useState<{
    id: string;
    startDate: string;
    endDate: string;
  } | null>(null);

  const [form, setForm] = useState({
    name: '',
    shortName: '',
    description: '',
    status: 'Planned' as ProjectStatus,
    startDate: '',
    endDate: '',
    fixedCost: '',
    revenue: '',
  });

  // Step 2: mandatory PM skill
  const pmSkill = skills.find(s => s.name === 'PM');
  const [pmCapacity, setPmCapacity] = useState('');
  const [pmAssigneeId, setPmAssigneeId] = useState('');

  const [error, setError] = useState('');

  const update = (field: keyof typeof form, value: string) =>
    setForm(prev => ({ ...prev, [field]: value }));

  // Convert "YYYY.MM.DD" → ISO "YYYY-MM-DD". Returns null if invalid.
  const parseDottedDate = (s: string): string | null => {
    const m = s.match(/^(\d{4})\.(\d{2})\.(\d{2})$/);
    if (!m) return null;
    const [, y, mo, d] = m;
    const yearNum = +y, monthNum = +mo, dayNum = +d;
    if (monthNum < 1 || monthNum > 12 || dayNum < 1 || dayNum > 31) return null;
    const dt = new Date(Date.UTC(yearNum, monthNum - 1, dayNum));
    if (dt.getUTCMonth() !== monthNum - 1 || dt.getUTCDate() !== dayNum) return null;
    return `${y}-${mo}-${d}`;
  };

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!form.name.trim()) { setError('Project name is required'); return; }
    if (!form.shortName.trim()) { setError('Short name is required'); return; }
    const startIso = parseDottedDate(form.startDate);
    const endIso = parseDottedDate(form.endDate);
    if (!startIso || !endIso) { setError('Dates must be in format YYYY.MM.DD (e.g. 2026.04.21)'); return; }
    if (endIso < startIso) { setError('End date must be after start date'); return; }

    const id = addProject({
      shortName: form.shortName.toUpperCase(),
      name: form.name.trim(),
      description: form.description,
      status: form.status,
      client: '',
      pmIds: [],
      pmNames: [],
      startDate: startIso,
      endDate: endIso,
      // overall capacity is now derived from assigned skills — start at 0
      overallCapacity: 0,
      fixedCost: Number(form.fixedCost) || 0,
      revenue: Number(form.revenue) || 0,
      // legacy fields kept in sync for back-compat
      estimatedCost: Number(form.fixedCost) || 0,
      spentCost: 0,
      estimatedRevenue: Number(form.revenue) || 0,
      netProfitMargin: 0,
      profitMarginExclEmployee: 0,
    });

    setCreatedProject({ id, startDate: startIso, endDate: endIso });
    setStep(2);
  };

  const handleAssignPm = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!createdProject || !pmSkill) return;
    const cap = Number(pmCapacity);
    if (Number.isNaN(cap) || cap <= 0 || cap > 1) {
      setError('Capacity on project must be a number between 0 and 1');
      return;
    }
    if (!pmAssigneeId) { setError('Please select a person to act as PM'); return; }

    const assignee = employees.find(e => e.id === pmAssigneeId);
    addProjectSkill(createdProject.id, {
      skillId: pmSkill.id,
      skillName: pmSkill.name,
      level: 1,
      duration: Math.max(1, Math.round(cap * 20)), // rough man-day estimate for legacy compat
      capacityOnProject: cap,
      startDate: createdProject.startDate,
      endDate: createdProject.endDate,
      assignedEmployeeId: pmAssigneeId,
      assignedEmployeeName: assignee?.name || null,
      fixed: true,
    });

    navigate('/projects');
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <Button variant="ghost" size="sm" onClick={() => navigate('/projects')} className="mb-4 text-muted-foreground">
        <ArrowLeft className="w-4 h-4 mr-1" /> Back
      </Button>

      <div className="flex items-center gap-3 mb-6">
        <h1 className="text-xl font-semibold text-foreground">New Project</h1>
        <span className="text-xs text-muted-foreground">
          Step {step} of 2 — {step === 1 ? 'Project details' : 'Assign PM'}
        </span>
      </div>

      {step === 1 && (
        <form onSubmit={handleCreateProject} className="space-y-5 bg-card border border-border rounded-lg p-6">
          <section className="space-y-3">
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">General Info</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-xs text-muted-foreground">Project Name *</Label>
                <Input value={form.name} onChange={e => update('name', e.target.value)} className="bg-background" />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Short Name *</Label>
                <Input
                  value={form.shortName}
                  onChange={e => update('shortName', e.target.value)}
                  className="bg-background font-mono uppercase"
                />
              </div>
            </div>

            <div>
              <Label className="text-xs text-muted-foreground">Description</Label>
              <Textarea value={form.description} onChange={e => update('description', e.target.value)} className="bg-background" rows={3} />
            </div>

            <div>
              <Label className="text-xs text-muted-foreground">Project Status</Label>
              <Select value={form.status} onValueChange={v => update('status', v as ProjectStatus)}>
                <SelectTrigger className="bg-background w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map(s => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </section>

          <section className="space-y-3 pt-2 border-t border-border">
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Timeline</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-xs text-muted-foreground">Start Date * <span className="text-muted-foreground/70">(YYYY.MM.DD)</span></Label>
                <Input
                  type="text"
                  inputMode="numeric"
                  placeholder="2026.04.21"
                  value={form.startDate}
                  onChange={e => update('startDate', e.target.value)}
                  className="bg-background font-mono"
                />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">End Date * <span className="text-muted-foreground/70">(YYYY.MM.DD)</span></Label>
                <Input
                  type="text"
                  inputMode="numeric"
                  placeholder="2026.12.31"
                  value={form.endDate}
                  onChange={e => update('endDate', e.target.value)}
                  className="bg-background font-mono"
                />
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Overall capacity is calculated automatically from assigned skills.
            </p>
          </section>

          <section className="space-y-3 pt-2 border-t border-border">
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Financials</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-xs text-muted-foreground">Fixed Cost (HUF)</Label>
                <Input type="number" value={form.fixedCost} onChange={e => update('fixedCost', e.target.value)} className="bg-background" />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Revenue (HUF)</Label>
                <Input type="number" value={form.revenue} onChange={e => update('revenue', e.target.value)} className="bg-background" />
              </div>
            </div>
          </section>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="flex gap-2 pt-2">
            <Button type="submit">Continue → Assign PM</Button>
            <Button type="button" variant="outline" onClick={() => navigate('/projects')}>Cancel</Button>
          </div>
        </form>
      )}

      {step === 2 && createdProject && (
        <form onSubmit={handleAssignPm} className="space-y-4 bg-card border border-border rounded-lg p-6">
          <div>
            <h2 className="text-sm font-semibold text-foreground">Mandatory: assign a Project Manager</h2>
            <p className="text-xs text-muted-foreground mt-1">
              Every project must have a PM. The skill below is pre-filled — choose the person and their capacity.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-xs text-muted-foreground">Skill</Label>
              <Input value="PM" readOnly className="bg-muted" />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Level</Label>
              <Input value="Lv.1" readOnly className="bg-muted" />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Start</Label>
              <Input value={createdProject.startDate} readOnly className="bg-muted font-mono" />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">End</Label>
              <Input value={createdProject.endDate} readOnly className="bg-muted font-mono" />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Capacity on project (0–1) *</Label>
              <Input
                type="number"
                step="0.01"
                min="0"
                max="1"
                value={pmCapacity}
                onChange={e => setPmCapacity(e.target.value)}
                placeholder="e.g. 0.5"
                className="bg-background"
              />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Assigned To *</Label>
              <Select value={pmAssigneeId} onValueChange={setPmAssigneeId}>
                <SelectTrigger className="bg-background">
                  <SelectValue placeholder="Select person..." />
                </SelectTrigger>
                <SelectContent>
                  {employees.map(emp => (
                    <SelectItem key={emp.id} value={emp.id}>
                      {emp.name} <span className="text-xs text-muted-foreground ml-1">— {emp.jobTitle}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="flex gap-2 pt-2">
            <Button type="submit">Confirm PM Assignment</Button>
          </div>
        </form>
      )}
    </div>
  );
}
