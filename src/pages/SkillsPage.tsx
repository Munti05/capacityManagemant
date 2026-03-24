import { useState } from 'react';
import ResourcesPage from '@/pages/ResourcesPage';
import SkillsManagementPage from '@/pages/SkillsManagementPage';

export default function SkillsPage() {
  const [tab, setTab] = useState<'resources' | 'skills'>('resources');

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-xl font-semibold text-foreground mb-1">Skills & Resources</h1>
      <p className="text-sm text-muted-foreground mb-6">Manage team resources and company skills</p>

      <div className="flex gap-1 mb-6 bg-card border border-border rounded-lg p-1 w-fit">
        <button
          onClick={() => setTab('resources')}
          className={`px-4 py-1.5 rounded-md text-sm transition-colors ${
            tab === 'resources' ? 'bg-primary text-primary-foreground font-medium' : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Resources
        </button>
        <button
          onClick={() => setTab('skills')}
          className={`px-4 py-1.5 rounded-md text-sm transition-colors ${
            tab === 'skills' ? 'bg-primary text-primary-foreground font-medium' : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Skills
        </button>
      </div>

      {tab === 'resources' ? <ResourcesPage /> : <SkillsManagementPage />}
    </div>
  );
}
