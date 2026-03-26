import { useState } from 'react';
import ResourcesPage from '@/pages/ResourcesPage';
import SkillsManagementPage from '@/pages/SkillsManagementPage';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

export default function SkillsPage() {
  const [view, setView] = useState<'employees' | 'skills'>('employees');

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-foreground mb-1">Resources</h1>
          <p className="text-sm text-muted-foreground">Manage team resources and company skills</p>
        </div>
        <div className="flex items-center gap-3">
          <Label htmlFor="view-toggle" className={`text-sm ${view === 'employees' ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
            Employees
          </Label>
          <Switch
            id="view-toggle"
            checked={view === 'skills'}
            onCheckedChange={(checked) => setView(checked ? 'skills' : 'employees')}
          />
          <Label htmlFor="view-toggle" className={`text-sm ${view === 'skills' ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
            Skills
          </Label>
        </div>
      </div>

      {view === 'employees' ? <ResourcesPage /> : <SkillsManagementPage />}
    </div>
  );
}
