import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { ProjectCard } from '@/components/ProjectCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, ArrowUpDown, Search, Filter, X } from 'lucide-react';
import { ProjectStatus } from '@/data/mockData';

type SortColumn = 'shortName' | 'name' | 'status' | 'startDate' | 'progress' | 'endDate' | 'overallCapacity';
type SortDir = 'asc' | 'desc';

export default function ProjectsPage() {
  const { isManager, isPM } = useAuth();
  const { projects } = useData();
  const navigate = useNavigate();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortCol, setSortCol] = useState<SortColumn>('name');
  const [sortDir, setSortDir] = useState<SortDir>('asc');
  const [showFilters, setShowFilters] = useState(false);

  // Filter projects
  let filtered = isPM
    ? projects.filter(p => p.pmNames.includes('Project Manager'))
    : projects;

  if (search) {
    const q = search.toLowerCase();
    filtered = filtered.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.shortName.toLowerCase().includes(q) ||
      p.client.toLowerCase().includes(q)
    );
  }

  if (statusFilter !== 'all') {
    filtered = filtered.filter(p => p.status === statusFilter);
  }

  // Sort
  filtered = [...filtered].sort((a, b) => {
    let cmp = 0;
    const av = a[sortCol];
    const bv = b[sortCol];
    if (typeof av === 'string' && typeof bv === 'string') cmp = av.localeCompare(bv);
    else if (typeof av === 'number' && typeof bv === 'number') cmp = av - bv;
    return sortDir === 'asc' ? cmp : -cmp;
  });

  const statuses: ProjectStatus[] = ['Planned', 'Ongoing', 'Canceled', 'Finished'];
  const sortColumns: { value: SortColumn; label: string }[] = [
    { value: 'shortName', label: 'Short Name' },
    { value: 'name', label: 'Name' },
    { value: 'status', label: 'Status' },
    { value: 'startDate', label: 'Start' },
    { value: 'progress', label: 'Progress' },
    { value: 'endDate', label: 'End' },
    { value: 'overallCapacity', label: 'Capacity' },
  ];

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-foreground">{isPM ? 'My Projects' : 'Projects'}</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{filtered.length} project{filtered.length !== 1 ? 's' : ''}</p>
        </div>
        {isManager && (
          <Button onClick={() => navigate('/projects/new')} size="sm">
            <Plus className="w-4 h-4 mr-1" /> New Project
          </Button>
        )}
      </div>

      {/* Filters bar */}
      <div className="flex items-center gap-2 mb-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search projects..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9 bg-card border-border h-9"
          />
        </div>

        <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)} className="h-9">
          <Filter className="w-4 h-4 mr-1" /> Filter
        </Button>

        <Select value={sortCol} onValueChange={v => setSortCol(v as SortColumn)}>
          <SelectTrigger className="w-36 h-9 bg-card text-xs">
            <ArrowUpDown className="w-3 h-3 mr-1" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {sortColumns.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
          </SelectContent>
        </Select>

        <Button variant="outline" size="sm" className="h-9 px-2" onClick={() => setSortDir(d => d === 'asc' ? 'desc' : 'asc')}>
          {sortDir === 'asc' ? '↑' : '↓'}
        </Button>
      </div>

      {showFilters && (
        <div className="flex items-center gap-2 mb-4 p-3 bg-card border border-border rounded-lg animate-fade-in">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-36 h-8 text-xs bg-background">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              {statuses.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
          {statusFilter !== 'all' && (
            <Button variant="ghost" size="sm" onClick={() => setStatusFilter('all')} className="h-8 text-xs text-muted-foreground">
              <X className="w-3 h-3 mr-1" /> Clear
            </Button>
          )}
        </div>
      )}

      {/* Project list */}
      <div className="space-y-2">
        {filtered.map(project => (
          <ProjectCard key={project.id} project={project} />
        ))}
        {filtered.length === 0 && (
          <div className="text-center py-12 text-muted-foreground text-sm">
            No projects found
          </div>
        )}
      </div>
    </div>
  );
}
