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
  Plus, Search, BookOpen, FileText, Video, Link as LinkIcon, Download,
  ArrowUp, Upload, Filter, ExternalLink
} from 'lucide-react';
import EmptyState from '@/components/shared/EmptyState';
import TagInput from '@/components/shared/TagInput';

const typeIcons = {
  notes: FileText, pdf: FileText, pyq: FileText, lab_manual: FileText,
  video: Video, link: LinkIcon, other: BookOpen,
};

const SEMESTERS = ['1', '2', '3', '4', '5', '6', '7', '8'];

export default function Resources() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterSemester, setFilterSemester] = useState('all');
  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState({
    title: '', description: '', type: 'notes', semester: '', subject: '', department: '',
    external_link: '', tags: [],
  });
  const [uploadFile, setUploadFile] = useState(null);

  const { data: currentUser } = useQuery({ queryKey: ['currentUser'], queryFn: () => base44.auth.me() });
  const { data: resources = [], isLoading } = useQuery({
    queryKey: ['resources'],
    queryFn: () => base44.entities.Resource.list('-created_date', 50),
  });

  const createMutation = useMutation({
    mutationFn: async (data) => {
      let file_url = '';
      if (uploadFile) {
        const res = await base44.integrations.Core.UploadFile({ file: uploadFile });
        file_url = res.file_url;
      }
      return base44.entities.Resource.create({
        ...data,
        file_url,
        author_name: currentUser?.full_name,
        upvoted_by: [],
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resources'] });
      setCreateOpen(false);
      setForm({ title: '', description: '', type: 'notes', semester: '', subject: '', department: '', external_link: '', tags: [] });
      setUploadFile(null);
    },
  });

  const upvoteMutation = useMutation({
    mutationFn: async (res) => {
      const already = res.upvoted_by?.includes(currentUser?.email);
      const newList = already ? res.upvoted_by.filter(e => e !== currentUser?.email) : [...(res.upvoted_by || []), currentUser?.email];
      await base44.entities.Resource.update(res.id, { upvotes: newList.length, upvoted_by: newList });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['resources'] }),
  });

  const filtered = resources.filter(r => {
    if (r.status !== 'active') return false;
    if (search && !r.title.toLowerCase().includes(search.toLowerCase())) return false;
    if (filterType !== 'all' && r.type !== filterType) return false;
    if (filterSemester !== 'all' && r.semester !== filterSemester) return false;
    return true;
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Study Resources</h1>
          <p className="text-sm text-muted-foreground">Notes, PYQs, lab manuals, and more</p>
        </div>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button className="gap-1.5"><Plus className="w-4 h-4" /> Upload Resource</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-y-auto">
            <DialogHeader><DialogTitle>Upload Resource</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div className="space-y-1"><Label>Title</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
              <div className="space-y-1"><Label>Description</Label><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label>Type</Label>
                  <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="notes">Notes</SelectItem>
                      <SelectItem value="pdf">PDF</SelectItem>
                      <SelectItem value="pyq">Previous Year Questions</SelectItem>
                      <SelectItem value="lab_manual">Lab Manual</SelectItem>
                      <SelectItem value="video">Video</SelectItem>
                      <SelectItem value="link">Link</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label>Semester</Label>
                  <Select value={form.semester} onValueChange={(v) => setForm({ ...form, semester: v })}>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>{SEMESTERS.map(s => <SelectItem key={s} value={s}>Semester {s}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1"><Label>Subject</Label><Input value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} /></div>
                <div className="space-y-1"><Label>Department</Label><Input value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} /></div>
              </div>
              <div className="space-y-1"><Label>External Link</Label><Input value={form.external_link} onChange={(e) => setForm({ ...form, external_link: e.target.value })} placeholder="YouTube link, drive link, etc." /></div>
              <div className="space-y-1">
                <Label>Upload File</Label>
                <Input type="file" onChange={(e) => setUploadFile(e.target.files[0])} />
              </div>
              <div className="space-y-1"><Label>Tags</Label><TagInput value={form.tags} onChange={(tags) => setForm({ ...form, tags })} /></div>
              <Button className="w-full" onClick={() => createMutation.mutate(form)} disabled={!form.title || createMutation.isPending}>
                {createMutation.isPending ? 'Uploading...' : 'Upload'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search resources..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-36"><Filter className="w-4 h-4 mr-2" /><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="notes">Notes</SelectItem>
            <SelectItem value="pdf">PDF</SelectItem>
            <SelectItem value="pyq">PYQs</SelectItem>
            <SelectItem value="lab_manual">Lab Manuals</SelectItem>
            <SelectItem value="video">Videos</SelectItem>
            <SelectItem value="link">Links</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterSemester} onValueChange={setFilterSemester}>
          <SelectTrigger className="w-36"><SelectValue placeholder="Semester" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Semesters</SelectItem>
            {SEMESTERS.map(s => <SelectItem key={s} value={s}>Sem {s}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="grid sm:grid-cols-2 gap-3">{[1, 2, 3, 4].map(i => <Card key={i} className="h-32 animate-pulse bg-muted" />)}</div>
      ) : filtered.length === 0 ? (
        <EmptyState icon={BookOpen} title="No resources yet" description="Upload study materials to help your peers!" action={<Button onClick={() => setCreateOpen(true)}>Upload Resource</Button>} />
      ) : (
        <div className="grid sm:grid-cols-2 gap-3">
          {filtered.map((res, i) => {
            const TypeIcon = typeIcons[res.type] || BookOpen;
            return (
              <motion.div key={res.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                <Card className="hover:border-primary/20 transition-all h-full">
                  <CardContent className="p-4 flex flex-col h-full">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <TypeIcon className="w-5 h-5 text-primary" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-sm line-clamp-1">{res.title}</h3>
                        {res.description && <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{res.description}</p>}
                        <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                          <Badge variant="secondary" className="text-xs capitalize">{res.type.replace('_', ' ')}</Badge>
                          {res.semester && <Badge variant="outline" className="text-xs">Sem {res.semester}</Badge>}
                          {res.subject && <Badge variant="outline" className="text-xs">{res.subject}</Badge>}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
                      <span className="text-xs text-muted-foreground">{res.author_name}</span>
                      <div className="flex items-center gap-2">
                        <button onClick={() => upvoteMutation.mutate(res)} className={`flex items-center gap-1 text-xs ${res.upvoted_by?.includes(currentUser?.email) ? 'text-primary' : 'text-muted-foreground'}`}>
                          <ArrowUp className="w-3.5 h-3.5" /> {res.upvotes || 0}
                        </button>
                        {res.file_url && (
                          <a href={res.file_url} target="_blank" rel="noopener noreferrer"><Button variant="ghost" size="icon" className="w-7 h-7"><Download className="w-3.5 h-3.5" /></Button></a>
                        )}
                        {res.external_link && (
                          <a href={res.external_link} target="_blank" rel="noopener noreferrer"><Button variant="ghost" size="icon" className="w-7 h-7"><ExternalLink className="w-3.5 h-3.5" /></Button></a>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}