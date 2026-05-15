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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { motion } from 'framer-motion';
import {
  Plus, Search, Briefcase, MapPin, Clock, DollarSign,
  ExternalLink, Filter, Calendar
} from 'lucide-react';
import EmptyState from '@/components/shared/EmptyState';
import { format } from 'date-fns';

const typeColors = {
  internship: 'bg-chart-1/10 text-chart-1 border-chart-1/20',
  job: 'bg-chart-3/10 text-chart-3 border-chart-3/20',
  referral: 'bg-chart-2/10 text-chart-2 border-chart-2/20',
  freelance: 'bg-chart-4/10 text-chart-4 border-chart-4/20',
};

export default function Opportunities() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState({
    title: '', company: '', type: 'internship', description: '', requirements: '',
    location: '', stipend_salary: '', apply_link: '', deadline: '',
  });

  const { data: currentUser } = useQuery({ queryKey: ['currentUser'], queryFn: () => base44.auth.me() });
  const { data: opportunities = [], isLoading } = useQuery({
    queryKey: ['opportunities'],
    queryFn: () => base44.entities.Opportunity.list('-created_date', 50),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Opportunity.create({
      ...data,
      posted_by_name: currentUser?.full_name,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['opportunities'] });
      setCreateOpen(false);
      setForm({ title: '', company: '', type: 'internship', description: '', requirements: '', location: '', stipend_salary: '', apply_link: '', deadline: '' });
    },
  });

  const filtered = opportunities.filter(o => {
    if (o.status !== 'active') return false;
    if (search && !o.title.toLowerCase().includes(search.toLowerCase()) && !o.company.toLowerCase().includes(search.toLowerCase())) return false;
    if (filterType !== 'all' && o.type !== filterType) return false;
    return true;
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Opportunities</h1>
          <p className="text-sm text-muted-foreground">Internships, jobs, and referrals from alumni</p>
        </div>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button className="gap-1.5"><Plus className="w-4 h-4" /> Post Opportunity</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-y-auto">
            <DialogHeader><DialogTitle>Post Opportunity</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1"><Label>Title</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
                <div className="space-y-1"><Label>Company</Label><Input value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label>Type</Label>
                  <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="internship">Internship</SelectItem>
                      <SelectItem value="job">Job</SelectItem>
                      <SelectItem value="referral">Referral</SelectItem>
                      <SelectItem value="freelance">Freelance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1"><Label>Location</Label><Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="Remote / City" /></div>
              </div>
              <div className="space-y-1"><Label>Description</Label><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
              <div className="space-y-1"><Label>Requirements</Label><Textarea value={form.requirements} onChange={(e) => setForm({ ...form, requirements: e.target.value })} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1"><Label>Stipend / Salary</Label><Input value={form.stipend_salary} onChange={(e) => setForm({ ...form, stipend_salary: e.target.value })} /></div>
                <div className="space-y-1"><Label>Deadline</Label><Input type="date" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} /></div>
              </div>
              <div className="space-y-1"><Label>Apply Link</Label><Input value={form.apply_link} onChange={(e) => setForm({ ...form, apply_link: e.target.value })} placeholder="https://..." /></div>
              <Button className="w-full" onClick={() => createMutation.mutate(form)} disabled={!form.title || !form.company || createMutation.isPending}>
                {createMutation.isPending ? 'Posting...' : 'Post'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search opportunities..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-36"><Filter className="w-4 h-4 mr-2" /><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="internship">Internship</SelectItem>
            <SelectItem value="job">Job</SelectItem>
            <SelectItem value="referral">Referral</SelectItem>
            <SelectItem value="freelance">Freelance</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="space-y-3">{[1, 2, 3].map(i => <Card key={i} className="h-28 animate-pulse bg-muted" />)}</div>
      ) : filtered.length === 0 ? (
        <EmptyState icon={Briefcase} title="No opportunities yet" description="Post internships, jobs, or referrals for students." action={<Button onClick={() => setCreateOpen(true)}>Post Opportunity</Button>} />
      ) : (
        <div className="space-y-3">
          {filtered.map((opp, i) => (
            <motion.div key={opp.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
              <Card className="hover:border-primary/20 transition-all">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h3 className="font-semibold">{opp.title}</h3>
                        <Badge variant="outline" className={`capitalize ${typeColors[opp.type] || ''}`}>{opp.type}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground font-medium">{opp.company}</p>
                      <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground flex-wrap">
                        {opp.location && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{opp.location}</span>}
                        {opp.stipend_salary && <span className="flex items-center gap-1"><DollarSign className="w-3 h-3" />{opp.stipend_salary}</span>}
                        {opp.deadline && <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />Due: {format(new Date(opp.deadline), 'MMM d, yyyy')}</span>}
                      </div>
                      {opp.description && <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{opp.description}</p>}
                    </div>
                    {opp.apply_link && (
                      <a href={opp.apply_link} target="_blank" rel="noopener noreferrer">
                        <Button size="sm" className="gap-1.5 shrink-0">Apply <ExternalLink className="w-3 h-3" /></Button>
                      </a>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">Posted by {opp.posted_by_name}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}