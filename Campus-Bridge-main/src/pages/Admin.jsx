import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import {
  Shield, Users, Flag, CheckCircle, XCircle, Ban, Eye,
  TrendingUp, MessageSquare, BookOpen, Briefcase
} from 'lucide-react';
import RoleBadge from '@/components/shared/RoleBadge';

export default function Admin() {
  const queryClient = useQueryClient();

  const { data: currentUser } = useQuery({ queryKey: ['currentUser'], queryFn: () => base44.auth.me() });
  const { data: users = [] } = useQuery({ queryKey: ['allUsersAdmin'], queryFn: () => base44.entities.User.list('-created_date', 200) });
  const { data: reports = [] } = useQuery({ queryKey: ['reports'], queryFn: () => base44.entities.Report.list('-created_date', 50) });
  const { data: posts = [] } = useQuery({ queryKey: ['forumPostsAdmin'], queryFn: () => base44.entities.ForumPost.list('-created_date', 10) });

  const updateUserMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.User.update(id, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['allUsersAdmin'] }); toast.success('User updated'); },
  });

  const updateReportMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Report.update(id, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['reports'] }); toast.success('Report updated'); },
  });

  if (currentUser?.role !== 'admin') {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card><CardContent className="p-6 text-center">
          <Shield className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <h2 className="font-bold text-lg">Access Denied</h2>
          <p className="text-sm text-muted-foreground">Admin privileges required.</p>
        </CardContent></Card>
      </div>
    );
  }

  const pendingReports = reports.filter(r => r.status === 'pending');
  const unverifiedUsers = users.filter(u => !u.is_verified && u.role !== 'admin');
  const alumniPending = users.filter(u => u.role === 'alumni' && !u.is_verified);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2"><Shield className="w-6 h-6 text-primary" /> Admin Dashboard</h1>
        <p className="text-sm text-muted-foreground">Manage users, moderate content, review reports</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Total Users', value: users.length, icon: Users, color: 'text-chart-1' },
          { label: 'Pending Reports', value: pendingReports.length, icon: Flag, color: 'text-destructive' },
          { label: 'Unverified', value: unverifiedUsers.length, icon: Eye, color: 'text-chart-4' },
          { label: 'Alumni Pending', value: alumniPending.length, icon: TrendingUp, color: 'text-chart-2' },
        ].map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Card>
              <CardContent className="p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <Tabs defaultValue="users">
        <TabsList>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="reports">Reports ({pendingReports.length})</TabsTrigger>
          <TabsTrigger value="alumni">Alumni Verification</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="mt-4 space-y-2">
          {users.map(user => {
            const initials = user.full_name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?';
            return (
              <Card key={user.id}>
                <CardContent className="p-3 flex items-center gap-3 flex-wrap">
                  <Avatar className="w-9 h-9 shrink-0">
                    <AvatarFallback className="text-xs bg-primary/10 text-primary">{initials}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium truncate">{user.full_name}</p>
                      <RoleBadge role={user.role || 'junior'} />
                      {user.is_verified && <Badge variant="outline" className="text-chart-3 border-chart-3/30 text-xs">Verified</Badge>}
                      {user.is_banned && <Badge variant="destructive" className="text-xs">Banned</Badge>}
                    </div>
                    <p className="text-xs text-muted-foreground">{user.email} · Trust: {user.trust_score || 50}</p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {!user.is_verified && (
                      <Button size="sm" variant="outline" className="gap-1 text-xs" onClick={() => updateUserMutation.mutate({ id: user.id, data: { is_verified: true } })}>
                        <CheckCircle className="w-3 h-3" /> Verify
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant={user.is_banned ? 'outline' : 'destructive'}
                      className="gap-1 text-xs"
                      onClick={() => updateUserMutation.mutate({ id: user.id, data: { is_banned: !user.is_banned } })}
                    >
                      <Ban className="w-3 h-3" /> {user.is_banned ? 'Unban' : 'Ban'}
                    </Button>
                    <Select
                      value={user.role || 'junior'}
                      onValueChange={(role) => updateUserMutation.mutate({ id: user.id, data: { role } })}
                    >
                      <SelectTrigger className="w-28 h-8 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="junior">Junior</SelectItem>
                        <SelectItem value="senior">Senior</SelectItem>
                        <SelectItem value="alumni">Alumni</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </TabsContent>

        <TabsContent value="reports" className="mt-4 space-y-2">
          {reports.length === 0 ? (
            <Card><CardContent className="p-6 text-center text-sm text-muted-foreground">No reports</CardContent></Card>
          ) : (
            reports.map(report => (
              <Card key={report.id} className={report.status === 'pending' ? 'border-destructive/30' : ''}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant={report.status === 'pending' ? 'destructive' : 'secondary'} className="capitalize">{report.status}</Badge>
                        <Badge variant="outline" className="capitalize">{report.reason}</Badge>
                        <Badge variant="outline" className="capitalize text-xs">{report.entity_type}</Badge>
                      </div>
                      <p className="text-sm">{report.details || 'No details provided'}</p>
                      <p className="text-xs text-muted-foreground mt-1">Reported by: {report.reporter_email}</p>
                      {report.reported_email && <p className="text-xs text-muted-foreground">Against: {report.reported_email}</p>}
                    </div>
                    {report.status === 'pending' && (
                      <div className="flex gap-1.5 shrink-0">
                        <Button size="sm" variant="outline" className="text-xs" onClick={() => updateReportMutation.mutate({ id: report.id, data: { status: 'action_taken' } })}>
                          Action Taken
                        </Button>
                        <Button size="sm" variant="ghost" className="text-xs" onClick={() => updateReportMutation.mutate({ id: report.id, data: { status: 'dismissed' } })}>
                          Dismiss
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="alumni" className="mt-4 space-y-2">
          {alumniPending.length === 0 ? (
            <Card><CardContent className="p-6 text-center text-sm text-muted-foreground">No pending alumni verifications</CardContent></Card>
          ) : (
            alumniPending.map(user => (
              <Card key={user.id}>
                <CardContent className="p-4 flex items-center justify-between gap-3">
                  <div>
                    <p className="font-medium">{user.full_name}</p>
                    <p className="text-sm text-muted-foreground">{user.email} · {user.current_company || 'No company'} · Batch {user.batch || 'N/A'}</p>
                  </div>
                  <div className="flex gap-1.5">
                    <Button size="sm" className="gap-1 text-xs" onClick={() => updateUserMutation.mutate({ id: user.id, data: { is_verified: true } })}>
                      <CheckCircle className="w-3 h-3" /> Approve
                    </Button>
                    <Button size="sm" variant="destructive" className="gap-1 text-xs" onClick={() => updateUserMutation.mutate({ id: user.id, data: { role: 'junior' } })}>
                      <XCircle className="w-3 h-3" /> Reject
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}