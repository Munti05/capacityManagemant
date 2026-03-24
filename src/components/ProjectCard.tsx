import { useState } from 'react';
import { Project, ProjectStatus } from '@/data/mockData';
import { StatusBadge } from '@/components/StatusBadge';
import { ProgressBar } from '@/components/ProgressBar';
import { ChevronDown, ChevronUp, User } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

function formatCurrency(value: number) {
  return new Intl.NumberFormat('hu-HU').format(value) + ' HUF';
}

export function ProjectCard({ project }: { project: Project }) {
  const [expanded, setExpanded] = useState(false);
  const { isPM } = useAuth();
  const { updateProjectStatus } = useData();

  const statuses: ProjectStatus[] = ['Planned', 'Ongoing', 'Canceled', 'Finished'];

  return (
    <div className="border border-border rounded-lg bg-card transition-all duration-200 hover:border-primary/30">
      {/* Collapsed row */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-4 px-4 py-3 text-left"
      >
        <span className="font-mono text-xs text-primary bg-primary/10 px-2 py-0.5 rounded shrink-0">
          {project.shortName}
        </span>
        <span className="text-sm font-medium text-foreground truncate flex-1">{project.name}</span>
        <StatusBadge status={project.status} />
        <span className="text-xs text-muted-foreground hidden md:block">{project.pmNames.join(', ')}</span>
        <span className="text-xs text-muted-foreground font-mono hidden lg:block">{project.startDate}</span>
        <div className="hidden sm:block"><ProgressBar value={project.progress} /></div>
        <span className="text-xs text-muted-foreground font-mono hidden lg:block">{project.endDate}</span>
        <span className="text-xs text-muted-foreground font-mono hidden md:block">{project.overallCapacity}d</span>
        {expanded ? <ChevronUp className="w-4 h-4 text-muted-foreground shrink-0" /> : <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />}
      </button>

      {/* Expanded details */}
      {expanded && (
        <div className="px-4 pb-4 border-t border-border animate-fade-in">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
            <DetailItem label="Client" value={project.client} />
            <DetailItem label="Description" value={project.description} />
            <DetailItem label="Remaining Capacity" value={`${project.remainingCapacity} man-days`} />
            <DetailItem label="Estimated Cost" value={formatCurrency(project.estimatedCost)} />
            <DetailItem label="Spent Cost" value={formatCurrency(project.spentCost)} />
            <DetailItem label="Estimated Revenue" value={formatCurrency(project.estimatedRevenue)} />
            {isPM && (
              <div>
                <p className="text-xs text-muted-foreground mb-1">Status</p>
                <Select value={project.status} onValueChange={(v) => updateProjectStatus(project.id, v as ProjectStatus)}>
                  <SelectTrigger className="w-40 h-8 text-xs bg-background">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {statuses.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {/* Skills section */}
          {project.skills.length > 0 && (
            <div className="mt-4">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Required Skills</h4>
              <div className="space-y-2">
                {project.skills.map((skill, i) => (
                  <div key={i} className="flex items-center gap-3 bg-background rounded-md px-3 py-2 text-sm">
                    <span className="font-medium text-foreground">{skill.skillName}</span>
                    <Badge variant="outline" className="text-xs font-mono">Lv.{skill.level}</Badge>
                    <span className="text-xs text-muted-foreground font-mono">{skill.duration}d</span>
                    <div className="flex-1" />
                    {skill.assignedEmployeeName ? (
                      <span className="flex items-center gap-1 text-xs text-primary">
                        <User className="w-3 h-3" />
                        {skill.assignedEmployeeName}
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground italic">Unassigned</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
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
