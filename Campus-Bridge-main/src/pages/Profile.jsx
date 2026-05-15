import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import TagInput from '@/components/shared/TagInput';
import RoleBadge from '@/components/shared/RoleBadge';
import { motion } from 'framer-motion';
import {
  Save, Linkedin, Github, FileText, Building2, GraduationCap, Star,
  Upload
} from 'lucide-react';

export default function Profile() {
  const queryClient = useQueryClient();
  const { data: currentUser, isLoading } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const [form, setForm] = useState(null);

  const initForm = (user) => ({
    department: user?.department || '',
    batch: user?.batch || '',
    bio: user?.bio || '',
    skills: user?.skills || [],
    current_company: user?.current_company || '',
    placement_status: user?.placement_status || 'not_placed',
    linkedin_url: user?.linkedin_url || '',
    github_url: user?.github_url || '',
    mentor_areas: user?.mentor_areas || [],
  });

  if (!form && currentUser) {
    setForm(initForm(currentUser));
  }

  const updateMutation = useMutation({
    mutationFn: (data) => base44.auth.updateMe({ ...data, profile_completed: true }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
      toast.success('Profile updated!');
    },
  });

  const uploadResume = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    await base44.auth.updateMe({ resume_url: file_url });
    queryClient.invalidateQueries({ queryKey: ['currentUser'] });
    toast.success('Resume uploaded!');
  };

  if (isLoading || !form) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-muted border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  const initials = currentUser?.full_name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?';

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-3xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        {/* Header Card */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <Avatar className="w-16 h-16">
                <AvatarFallback className="text-xl bg-primary/10 text-primary font-bold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h1 className="text-xl font-bold">{currentUser.full_name}</h1>
                <p className="text-sm text-muted-foreground">{currentUser.email}</p>
                <div className="flex items-center gap-2 mt-2">
                  <RoleBadge role={currentUser.role || 'junior'} />
                  {currentUser.is_verified && (
                    <Badge variant="outline" className="gap-1 border-chart-3/30 text-chart-3">
                      <Star className="w-3 h-3" /> Verified
                    </Badge>
                  )}
                  <Badge variant="secondary">Trust: {currentUser.trust_score || 50}</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Edit form */}
        <Card>
          <CardHeader>
            <CardTitle>Edit Profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Department</Label>
                <Input
                  value={form.department}
                  onChange={(e) => setForm({ ...form, department: e.target.value })}
                  placeholder="e.g. Computer Science"
                />
              </div>
              <div className="space-y-2">
                <Label>Batch / Year</Label>
                <Input
                  value={form.batch}
                  onChange={(e) => setForm({ ...form, batch: e.target.value })}
                  placeholder="e.g. 2024"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Bio</Label>
              <Textarea
                value={form.bio}
                onChange={(e) => setForm({ ...form, bio: e.target.value })}
                placeholder="Tell others about yourself..."
                className="h-24"
              />
            </div>

            <div className="space-y-2">
              <Label>Skills</Label>
              <TagInput value={form.skills} onChange={(skills) => setForm({ ...form, skills })} placeholder="Add a skill" />
            </div>

            <div className="space-y-2">
              <Label>Areas willing to mentor</Label>
              <TagInput value={form.mentor_areas} onChange={(mentor_areas) => setForm({ ...form, mentor_areas })} placeholder="e.g. DSA, Web Dev" />
            </div>

            {(currentUser.role === 'alumni' || currentUser.role === 'senior') && (
              <div className="space-y-2">
                <Label><Building2 className="w-4 h-4 inline mr-1" />Current Company</Label>
                <Input
                  value={form.current_company}
                  onChange={(e) => setForm({ ...form, current_company: e.target.value })}
                  placeholder="e.g. Google"
                />
              </div>
            )}

            <div className="space-y-2">
              <Label>Placement Status</Label>
              <Select value={form.placement_status} onValueChange={(v) => setForm({ ...form, placement_status: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="not_placed">Not Placed</SelectItem>
                  <SelectItem value="placed">Placed</SelectItem>
                  <SelectItem value="not_applicable">Not Applicable</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label><Linkedin className="w-4 h-4 inline mr-1" />LinkedIn URL</Label>
                <Input value={form.linkedin_url} onChange={(e) => setForm({ ...form, linkedin_url: e.target.value })} placeholder="https://linkedin.com/in/..." />
              </div>
              <div className="space-y-2">
                <Label><Github className="w-4 h-4 inline mr-1" />GitHub URL</Label>
                <Input value={form.github_url} onChange={(e) => setForm({ ...form, github_url: e.target.value })} placeholder="https://github.com/..." />
              </div>
            </div>

            {/* Resume */}
            <div className="space-y-2">
              <Label><FileText className="w-4 h-4 inline mr-1" />Resume</Label>
              {currentUser.resume_url ? (
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">Resume uploaded</Badge>
                  <a href={currentUser.resume_url} target="_blank" rel="noopener noreferrer">
                    <Button variant="ghost" size="sm">View</Button>
                  </a>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No resume uploaded</p>
              )}
              <label className="inline-flex items-center gap-2 cursor-pointer">
                <input type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={uploadResume} />
                <Button variant="outline" size="sm" className="gap-1.5" type="button" onClick={(e) => e.currentTarget.parentElement.querySelector('input').click()}>
                  <Upload className="w-4 h-4" /> Upload Resume
                </Button>
              </label>
            </div>

            <Button
              className="w-full gap-2"
              onClick={() => updateMutation.mutate(form)}
              disabled={updateMutation.isPending}
            >
              <Save className="w-4 h-4" />
              {updateMutation.isPending ? 'Saving...' : 'Save Profile'}
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}