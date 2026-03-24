import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '@/contexts/DataContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft } from 'lucide-react';
import { EMPLOYEES } from '@/data/mockData';

export default function NewProjectPage() {
  const navigate = useNavigate();
  const { addProject } = useData();

  const [form, setForm] = useState({
    shortName: '',
    name: '',
    description: '',
    startDate: '',
    endDate: '',
    overallCapacity: '',
    pmId: '',
    estimatedCost: '',
    estimatedRevenue: '',
  });

  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (form.shortName.length !== 3) {
      setError('Short name must be exactly 3 letters');
      return;
    }
    if (!form.name || !form.startDate || !form.endDate) {
      setError('Please fill in all required fields');
      return;
    }

    const pm = EMPLOYEES.find(emp => emp.id === form.pmId);

    addProject({
      shortName: form.shortName.toUpperCase(),
      name: form.name,
      description: form.description,
      status: 'Planned',
      client: '',
      pmIds: form.pmId ? [form.pmId] : [],
      pmNames: pm ? [pm.name] : [],
      startDate: form.startDate,
      endDate: form.endDate,
      overallCapacity: Number(form.overallCapacity) || 0,
      estimatedCost: Number(form.estimatedCost) || 0,
      estimatedRevenue: Number(form.estimatedRevenue) || 0,
    });

    navigate('/projects');
  };

  const update = (field: string, value: string) => setForm(prev => ({ ...prev, [field]: value }));

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <Button variant="ghost" size="sm" onClick={() => navigate('/projects')} className="mb-4 text-muted-foreground">
        <ArrowLeft className="w-4 h-4 mr-1" /> Back
      </Button>

      <h1 className="text-xl font-semibold text-foreground mb-6">New Project</h1>

      <form onSubmit={handleSubmit} className="space-y-4 bg-card border border-border rounded-lg p-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-xs text-muted-foreground">Short Name (3 letters) *</Label>
            <Input value={form.shortName} onChange={e => update('shortName', e.target.value.slice(0, 3))} className="bg-background font-mono uppercase" maxLength={3} />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Name *</Label>
            <Input value={form.name} onChange={e => update('name', e.target.value)} className="bg-background" />
          </div>
        </div>

        <div>
          <Label className="text-xs text-muted-foreground">Description</Label>
          <Textarea value={form.description} onChange={e => update('description', e.target.value)} className="bg-background" rows={3} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-xs text-muted-foreground">Start Date *</Label>
            <Input type="date" value={form.startDate} onChange={e => update('startDate', e.target.value)} className="bg-background" />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">End Date *</Label>
            <Input type="date" value={form.endDate} onChange={e => update('endDate', e.target.value)} className="bg-background" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-xs text-muted-foreground">PM Capacity (man-days)</Label>
            <Input type="number" value={form.overallCapacity} onChange={e => update('overallCapacity', e.target.value)} className="bg-background" />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Assign PM</Label>
            <select
              value={form.pmId}
              onChange={e => update('pmId', e.target.value)}
              className="w-full h-10 px-3 rounded-md border border-border bg-background text-sm text-foreground"
            >
              <option value="">Select PM</option>
              {EMPLOYEES.map(emp => <option key={emp.id} value={emp.id}>{emp.name}</option>)}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-xs text-muted-foreground">Fix Cost (HUF)</Label>
            <Input type="number" value={form.estimatedCost} onChange={e => update('estimatedCost', e.target.value)} className="bg-background" />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Revenue (HUF)</Label>
            <Input type="number" value={form.estimatedRevenue} onChange={e => update('estimatedRevenue', e.target.value)} className="bg-background" />
          </div>
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <div className="flex gap-2 pt-2">
          <Button type="submit">Create Project</Button>
          <Button type="button" variant="outline" onClick={() => navigate('/projects')}>Cancel</Button>
        </div>
      </form>
    </div>
  );
}
