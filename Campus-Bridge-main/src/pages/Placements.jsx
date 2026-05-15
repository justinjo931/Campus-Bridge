import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Search, Building2, ArrowUp, CheckCircle, XCircle, Clock,
  GraduationCap, Filter
} from 'lucide-react';
import EmptyState from '@/components/shared/EmptyState';
import PlacementDetail from '@/components/placements/PlacementDetail';

const resultIcons = {
  selected: <CheckCircle className="w-4 h-4 text-chart-3" />,
  not_selected: <XCircle className="w-4 h-4 text-destructive" />,
  waitlisted: <Clock className="w-4 h-4 text-chart-4" />,
};

export default function Placements() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [filterResult, setFilterResult] = useState('all');
  const [createOpen, setCreateOpen] = useState(false);
  const [selectedExp, setSelectedExp] = useState(null);
  const [form, setForm] = useState({
    company_name: '', role_title: '', preparation_strategy: '', package_lpa: '',
    tips: '', result: 'selected', difficulty: 'medium', is_anonymous: false,
    interview_rounds: [{ round_name: '', description: '', questions: '' }],
  });

  const { data: currentUser } = useQuery({ queryKey: ['currentUser'], queryFn: () => base44.auth.me() });
  const { data: experiences = [], isLoading } = useQuery({
    queryKey: ['placements'],
    queryFn: () => base44.entities.PlacementExperience.list('-created_date', 50),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.PlacementExperience.create({
      ...data,
      author_name: data.is_anonymous ? 'Anonymous' : currentUser?.full_name,
      department: currentUser?.department,
      batch: currentUser?.batch,
      upvoted_by: [],
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['placements'] });
      setCreateOpen(false);
    },
  });

  const addRound = () => setForm(f => ({ ...f, interview_rounds: [...f.interview_rounds, { round_name: '', description: '', questions: '' }] }));
  const updateRound = (idx, field, val) => {
    const rounds = [...form.interview_rounds];
    rounds[idx] = { ...rounds[idx], [field]: val };
    setForm(f => ({ ...f, interview_rounds: rounds }));
  };

  const filtered = experiences.filter(e => {
    if (e.status !== 'active') return false;
    if (search && !e.company_name.toLowerCase().includes(search.toLowerCase()) && !e.role_title.toLowerCase().includes(search.toLowerCase())) return false;
    if (filterResult !== 'all' && e.result !== filterResult) return false;
    return true;
  });

  if (selectedExp) {
    return <PlacementDetail experience={selectedExp} onBack={() => setSelectedExp(null)} currentUser={currentUser} />;
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Placement Experiences</h1>
          <p className="text-sm text-muted-foreground">Learn from real interview experiences</p>
        </div>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button className="gap-1.5"><Plus className="w-4 h-4" /> Share Experience</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-y-auto">
            <DialogHeader><DialogTitle>Share Placement Experience</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1"><Label>Company</Label><Input value={form.company_name} onChange={(e) => setForm({ ...form, company_name: e.target.value })} /></div>
                <div className="space-y-1"><Label>Role</Label><Input value={form.role_title} onChange={(e) => setForm({ ...form, role_title: e.target.value })} /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label>Result</Label>
                  <Select value={form.result} onValueChange={(v) => setForm({ ...form, result: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="selected">Selected</SelectItem>
                      <SelectItem value="not_selected">Not Selected</SelectItem>
                      <SelectItem value="waitlisted">Waitlisted</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label>Difficulty</Label>
                  <Select value={form.difficulty} onValueChange={(v) => setForm({ ...form, difficulty: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="easy">Easy</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="hard">Hard</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-1"><Label>Package (LPA)</Label><Input value={form.package_lpa} onChange={(e) => setForm({ ...form, package_lpa: e.target.value })} placeholder="e.g. 12 LPA" /></div>
              <div className="space-y-1"><Label>Preparation Strategy</Label><Textarea value={form.preparation_strategy} onChange={(e) => setForm({ ...form, preparation_strategy: e.target.value })} /></div>
              <div className="space-y-1"><Label>Tips</Label><Textarea value={form.tips} onChange={(e) => setForm({ ...form, tips: e.target.value })} /></div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Interview Rounds</Label>
                  <Button type="button" variant="ghost" size="sm" onClick={addRound}>+ Add Round</Button>
                </div>
                {form.interview_rounds.map((round, i) => (
                  <Card key={i}>
                    <CardContent className="p-3 space-y-2">
                      <Input placeholder="Round name" value={round.round_name} onChange={(e) => updateRound(i, 'round_name', e.target.value)} />
                      <Textarea placeholder="Description" value={round.description} onChange={(e) => updateRound(i, 'description', e.target.value)} className="h-16" />
                      <Textarea placeholder="Questions asked" value={round.questions} onChange={(e) => updateRound(i, 'questions', e.target.value)} className="h-16" />
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <Switch checked={form.is_anonymous} onCheckedChange={(v) => setForm({ ...form, is_anonymous: v })} />
                <Label>Post anonymously</Label>
              </div>
              <Button className="w-full" onClick={() => createMutation.mutate(form)} disabled={!form.company_name || !form.role_title || createMutation.isPending}>
                {createMutation.isPending ? 'Posting...' : 'Share'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search by company or role..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Select value={filterResult} onValueChange={setFilterResult}>
          <SelectTrigger className="w-36"><Filter className="w-4 h-4 mr-2" /><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Results</SelectItem>
            <SelectItem value="selected">Selected</SelectItem>
            <SelectItem value="not_selected">Not Selected</SelectItem>
            <SelectItem value="waitlisted">Waitlisted</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="space-y-3">{[1, 2, 3].map(i => <Card key={i} className="h-24 animate-pulse bg-muted" />)}</div>
      ) : filtered.length === 0 ? (
        <EmptyState icon={GraduationCap} title="No experiences yet" description="Share your interview journey!" action={<Button onClick={() => setCreateOpen(true)}>Share Experience</Button>} />
      ) : (
        <div className="space-y-3">
          {filtered.map((exp, i) => (
            <motion.div key={exp.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
              <Card className="hover:border-primary/20 transition-all cursor-pointer" onClick={() => setSelectedExp(exp)}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Building2 className="w-4 h-4 text-muted-foreground" />
                        <h3 className="font-semibold">{exp.company_name}</h3>
                        {resultIcons[exp.result]}
                      </div>
                      <p className="text-sm text-muted-foreground">{exp.role_title}</p>
                      <div className="flex items-center gap-2 mt-2 flex-wrap">
                        {exp.package_lpa && <Badge variant="secondary">{exp.package_lpa}</Badge>}
                        {exp.difficulty && <Badge variant="outline" className="capitalize">{exp.difficulty}</Badge>}
                        <span className="text-xs text-muted-foreground">{exp.is_anonymous ? 'Anonymous' : exp.author_name}</span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <ArrowUp className="w-3.5 h-3.5" /> {exp.upvotes || 0}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}