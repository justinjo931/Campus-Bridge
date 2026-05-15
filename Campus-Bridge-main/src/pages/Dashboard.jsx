import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import RoleBadge from '@/components/shared/RoleBadge';
import {
  MessageSquare, BookOpen, Briefcase, Users, GraduationCap,
  TrendingUp, ArrowRight, FileText, UserPlus, Star
} from 'lucide-react';

const quickActions = [
  { icon: MessageSquare, label: 'Ask a Question', path: '/forum', color: 'text-chart-1' },
  { icon: GraduationCap, label: 'Share Experience', path: '/placements', color: 'text-chart-2' },
  { icon: BookOpen, label: 'Upload Resource', path: '/resources', color: 'text-chart-3' },
  { icon: Briefcase, label: 'Post Opportunity', path: '/opportunities', color: 'text-chart-4' },
];

export default function Dashboard() {
  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: recentPosts = [] } = useQuery({
    queryKey: ['recentPosts'],
    queryFn: () => base44.entities.ForumPost.list('-created_date', 5),
  });

  const { data: recentOpps = [] } = useQuery({
    queryKey: ['recentOpps'],
    queryFn: () => base44.entities.Opportunity.list('-created_date', 3),
  });

  const { data: connections = [] } = useQuery({
    queryKey: ['myConnections'],
    queryFn: async () => {
      if (!currentUser?.email) return [];
      const sent = await base44.entities.Connection.filter({ from_email: currentUser.email, status: 'pending' });
      const received = await base44.entities.Connection.filter({ to_email: currentUser.email, status: 'pending' });
      return [...sent, ...received];
    },
    enabled: !!currentUser?.email,
  });

  const firstName = currentUser?.full_name?.split(' ')[0] || 'there';

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
      {/* Welcome */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Welcome back, {firstName} 👋</h1>
          <p className="text-muted-foreground mt-1">Here's what's happening on CampusBridge</p>
        </div>
        <div className="flex items-center gap-2">
          <RoleBadge role={currentUser?.role || 'junior'} />
          {currentUser?.is_verified && (
            <Badge variant="outline" className="gap-1 border-chart-3/30 text-chart-3">
              <Star className="w-3 h-3" /> Verified
            </Badge>
          )}
        </div>
      </motion.div>

      {/* Profile completion prompt */}
      {!currentUser?.profile_completed && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <Card className="border-primary/30 bg-primary/5">
            <CardContent className="p-4 flex items-center justify-between gap-4">
              <div>
                <p className="font-medium">Complete your profile</p>
                <p className="text-sm text-muted-foreground">Add your skills, bio, and department to connect with the right people.</p>
              </div>
              <Link to="/profile">
                <Button size="sm" className="gap-1.5 shrink-0">
                  Complete <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {quickActions.map((action, i) => (
          <motion.div
            key={action.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Link to={action.path}>
              <Card className="hover:border-primary/30 hover:shadow-md transition-all duration-200 cursor-pointer group">
                <CardContent className="p-4 flex flex-col items-center text-center gap-2">
                  <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                    <action.icon className={`w-5 h-5 ${action.color}`} />
                  </div>
                  <span className="text-sm font-medium">{action.label}</span>
                </CardContent>
              </Card>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Forum Posts', icon: MessageSquare, value: recentPosts.length },
          { label: 'Opportunities', icon: Briefcase, value: recentOpps.length },
          { label: 'Pending Requests', icon: UserPlus, value: connections.length },
          { label: 'Trust Score', icon: TrendingUp, value: currentUser?.trust_score || 50 },
        ].map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 + i * 0.05 }}>
            <Card>
              <CardContent className="p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <stat.icon className="w-5 h-5 text-primary" />
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

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Forum */}
        <Card>
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <CardTitle className="text-base">Recent Forum Posts</CardTitle>
            <Link to="/forum"><Button variant="ghost" size="sm" className="gap-1 text-xs">View All <ArrowRight className="w-3 h-3" /></Button></Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentPosts.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">No posts yet. Be the first to ask!</p>
            ) : (
              recentPosts.map(post => (
                <Link key={post.id} to={`/forum?post=${post.id}`} className="block">
                  <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                    <Avatar className="w-8 h-8 shrink-0">
                      <AvatarFallback className="text-xs bg-primary/10 text-primary">
                        {post.is_anonymous ? '?' : (post.author_name || 'U')[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{post.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-muted-foreground">{post.is_anonymous ? 'Anonymous' : post.author_name}</span>
                        <span className="text-xs text-muted-foreground">· {post.reply_count || 0} replies</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </CardContent>
        </Card>

        {/* Recent Opportunities */}
        <Card>
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <CardTitle className="text-base">Latest Opportunities</CardTitle>
            <Link to="/opportunities"><Button variant="ghost" size="sm" className="gap-1 text-xs">View All <ArrowRight className="w-3 h-3" /></Button></Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentOpps.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">No opportunities posted yet.</p>
            ) : (
              recentOpps.map(opp => (
                <Link key={opp.id} to="/opportunities" className="block">
                  <div className="p-3 rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-medium">{opp.title}</p>
                      <Badge variant="outline" className="text-xs capitalize">{opp.type}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{opp.company} {opp.location && `· ${opp.location}`}</p>
                  </div>
                </Link>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}