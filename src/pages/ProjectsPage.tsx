import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { ProjectCard } from '@/components/ProjectCard';
import { ProjectFilter, FilterRow, applyFilters } from '@/components/ProjectFilter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, ArrowUpDown, Search, Filter, X } from 'lucide-react';
import { ProjectStatus } from '@/data/mockData';

type SortColumn = 'shortName' | 'name' | 'status' | 'startDate' | 'progress' | 'endDate' | 'overallCapacity';
type SortDir = 'asc' | 'desc';

function defaultSort(a: { status: string; endDate: string }, b: { status: string; endDate: string }) {
  const order: Record<string, number> = { Ongoing: 0, Planned: 1, Finished: 2, Canceled: 3 };
  const oa = order[a.status] ?? 9;
  const ob = order[b.status] ?? 9;
  if (oa !== ob) return oa - ob;
  return a.endDate.localeCompare(b.endDate);
}

export default function ProjectsPage() {
  const { isManager, isPM } = useAuth();
  const { projects } = useData();
  const navigate = useNavigate();

  const [search, setSearch] = useState('');
  const [sortCol, setSortCol] = useState<SortColumn | 'default'>('default');
  const [sortDir, setSortDir] = useState<SortDir>('asc');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FilterRow[]>([]);

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

  if (filters.length > 0) {
    filtered = applyFilters(filtered, filters);
  }

  if (sortCol === 'default') {
    filtered = [...filtered].sort(defaultSort);
  } else {
    filtered = [...filtered].sort((a, b) => {
      let cmp = 0;
      const av = a[sortCol];
      const bv = b[sortCol];
      if (typeof av === 'string' && typeof bv === 'string') cmp = av.localeCompare(bv);
      else if (typeof av === 'number' && typeof bv === 'number') cmp = av - bv;
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }

  const sortColumns: { value: string; label: string }[] = [
    { value: 'default', label: 'Default' },
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

        <Button variant={showFilters ? 'default' : 'outline'} size="sm" onClick={() => setShowFilters(!showFilters)} className="h-9">
          <Filter className="w-4 h-4 mr-1" /> Filter {filters.length > 0 && `(${filters.length})`}
        </Button>

        <Select value={sortCol} onValueChange={v => setSortCol(v as SortColumn | 'default')}>
          <SelectTrigger className="w-36 h-9 bg-card text-xs">
            <ArrowUpDown className="w-3 h-3 mr-1" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {sortColumns.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
          </SelectContent>
        </Select>

        {sortCol !== 'default' && (
          <Button variant="outline" size="sm" className="h-9 px-2" onClick={() => setSortDir(d => d === 'asc' ? 'desc' : 'asc')}>
            {sortDir === 'asc' ? '↑' : '↓'}
          </Button>
        )}
      </div>

      {showFilters && (
        <div className="mb-4">
          <ProjectFilter filters={filters} onChange={setFilters} hidePM={isPM} />
        </div>
      )}

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
