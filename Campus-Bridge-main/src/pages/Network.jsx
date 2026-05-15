import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import {
  Search, UserPlus, Users, Check, X, MessageSquare, ExternalLink
} from 'lucide-react';
import RoleBadge from '@/components/shared/RoleBadge';
import EmptyState from '@/components/shared/EmptyState';

export default function Network() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');

  const { data: currentUser } = useQuery({ queryKey: ['currentUser'], queryFn: () => base44.auth.me() });
  const { data: allUsers = [] } = useQuery({
    queryKey: ['allUsers'],
    queryFn: () => base44.entities.User.list('-created_date', 200),
  });
  const { data: connections = [] } = useQuery({
    queryKey: ['connections'],
    queryFn: () => base44.entities.Connection.list('-created_date', 200),
  });

  const connectMutation = useMutation({
    mutationFn: (targetUser) => base44.entities.Connection.create({
      from_email: currentUser.email,
      to_email: targetUser.email,
      from_name: currentUser.full_name,
      to_name: targetUser.full_name,
    }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['connections'] }); toast.success('Connection request sent!'); },
  });

  const respondMutation = useMutation({
    mutationFn: ({ id, status }) => base44.entities.Connection.update(id, { status }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['connections'] }); toast.success('Updated!'); },
  });

  const myEmail = currentUser?.email;
  const myConnections = connections.filter(c =>
    (c.from_email === myEmail || c.to_email === myEmail) && c.status === 'accepted'
  );
  const pendingReceived = connections.filter(c => c.to_email === myEmail && c.status === 'pending');
  const pendingSent = connections.filter(c => c.from_email === myEmail && c.status === 'pending');

  const getConnectionStatus = (email) => {
    const conn = connections.find(c =>
      (c.from_email === myEmail && c.to_email === email) ||
      (c.to_email === myEmail && c.from_email === email)
    );
    return conn ? conn.status : null;
  };

  const discoverUsers = allUsers.filter(u => {
    if (u.email === myEmail) return false;
    if (u.is_banned) return false;
    if (search && !u.full_name?.toLowerCase().includes(search.toLowerCase()) && !u.department?.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const UserCard = ({ user, action }) => {
    const initials = user.full_name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?';
    return (
      <Card className="hover:border-primary/20 transition-all">
        <CardContent className="p-4 flex items-center gap-3">
          <Avatar className="w-10 h-10 shrink-0">
            <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">{initials}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="font-medium text-sm truncate">{user.full_name}</p>
              <RoleBadge role={user.role || 'junior'} />
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
              {user.department && <span>{user.department}</span>}
              {user.batch && <span>· Batch {user.batch}</span>}
              {user.current_company && <span>· {user.current_company}</span>}
            </div>
            {user.skills?.length > 0 && (
              <div className="flex gap-1 mt-1.5 flex-wrap">
                {user.skills.slice(0, 3).map(s => <Badge key={s} variant="secondary" className="text-xs px-1.5 py-0">{s}</Badge>)}
                {user.skills.length > 3 && <span className="text-xs text-muted-foreground">+{user.skills.length - 3}</span>}
              </div>
            )}
          </div>
          <div className="shrink-0">{action}</div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Network</h1>
        <p className="text-sm text-muted-foreground">Connect with peers, seniors, and alumni</p>
      </div>

      <Tabs defaultValue="discover">
        <TabsList>
          <TabsTrigger value="discover">Discover</TabsTrigger>
          <TabsTrigger value="connections">
            Connections ({myConnections.length})
          </TabsTrigger>
          <TabsTrigger value="pending">
            Pending {pendingReceived.length > 0 && <Badge variant="destructive" className="ml-1 h-5 w-5 p-0 text-xs flex items-center justify-center">{pendingReceived.length}</Badge>}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="discover" className="mt-4 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search by name or department..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <div className="space-y-2">
            {discoverUsers.map((user, i) => {
              const status = getConnectionStatus(user.email);
              return (
                <motion.div key={user.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.02 }}>
                  <UserCard
                    user={user}
                    action={
                      status === 'accepted' ? <Badge variant="secondary">Connected</Badge> :
                      status === 'pending' ? <Badge variant="outline">Pending</Badge> :
                      <Button size="sm" variant="outline" className="gap-1" onClick={() => connectMutation.mutate(user)}>
                        <UserPlus className="w-3.5 h-3.5" /> Connect
                      </Button>
                    }
                  />
                </motion.div>
              );
            })}
            {discoverUsers.length === 0 && <EmptyState icon={Users} title="No users found" description="Try a different search." />}
          </div>
        </TabsContent>

        <TabsContent value="connections" className="mt-4 space-y-2">
          {myConnections.length === 0 ? (
            <EmptyState icon={Users} title="No connections yet" description="Start connecting with your college community!" />
          ) : (
            myConnections.map(conn => {
              const otherUser = allUsers.find(u => u.email === (conn.from_email === myEmail ? conn.to_email : conn.from_email));
              if (!otherUser) return null;
              return (
                <UserCard
                  key={conn.id}
                  user={otherUser}
                  action={
                    <Button size="sm" variant="ghost" className="gap-1" asChild>
                      <a href={`/messages?user=${otherUser.email}`}><MessageSquare className="w-3.5 h-3.5" /> Message</a>
                    </Button>
                  }
                />
              );
            })
          )}
        </TabsContent>

        <TabsContent value="pending" className="mt-4 space-y-4">
          {pendingReceived.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Received Requests</h3>
              <div className="space-y-2">
                {pendingReceived.map(conn => {
                  const user = allUsers.find(u => u.email === conn.from_email);
                  if (!user) return null;
                  return (
                    <UserCard
                      key={conn.id}
                      user={user}
                      action={
                        <div className="flex gap-1.5">
                          <Button size="icon" variant="ghost" className="h-8 w-8 text-chart-3" onClick={() => respondMutation.mutate({ id: conn.id, status: 'accepted' })}>
                            <Check className="w-4 h-4" />
                          </Button>
                          <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={() => respondMutation.mutate({ id: conn.id, status: 'rejected' })}>
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      }
                    />
                  );
                })}
              </div>
            </div>
          )}
          {pendingSent.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Sent Requests</h3>
              <div className="space-y-2">
                {pendingSent.map(conn => {
                  const user = allUsers.find(u => u.email === conn.to_email);
                  if (!user) return null;
                  return <UserCard key={conn.id} user={user} action={<Badge variant="outline">Pending</Badge>} />;
                })}
              </div>
            </div>
          )}
          {pendingReceived.length === 0 && pendingSent.length === 0 && (
            <EmptyState icon={UserPlus} title="No pending requests" />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}