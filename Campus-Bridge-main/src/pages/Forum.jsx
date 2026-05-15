import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, ThumbsUp, MessageSquare, Search, Filter, ArrowUp
} from 'lucide-react';
import EmptyState from '@/components/shared/EmptyState';
import TagInput from '@/components/shared/TagInput';
import ForumPostDetail from '@/components/forum/ForumPostDetail';

const TOPIC_TAGS = ['AI/ML', 'Web Development', 'DevOps', 'Data Science', 'Placements', 'Higher Studies', 'DSA', 'Mobile Dev', 'Cloud', 'General'];

export default function Forum() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [filterTag, setFilterTag] = useState('all');
  const [createOpen, setCreateOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [newPost, setNewPost] = useState({ title: '', content: '', tags: [], is_anonymous: false });

  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: posts = [], isLoading } = useQuery({
    queryKey: ['forumPosts'],
    queryFn: () => base44.entities.ForumPost.list('-created_date', 50),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.ForumPost.create({
      ...data,
      author_name: data.is_anonymous ? 'Anonymous' : currentUser?.full_name,
      author_role: currentUser?.role,
      author_department: currentUser?.department,
      upvoted_by: [],
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['forumPosts'] });
      setCreateOpen(false);
      setNewPost({ title: '', content: '', tags: [], is_anonymous: false });
    },
  });

  const upvoteMutation = useMutation({
    mutationFn: async (post) => {
      const alreadyUpvoted = post.upvoted_by?.includes(currentUser?.email);
      const newUpvotedBy = alreadyUpvoted
        ? post.upvoted_by.filter(e => e !== currentUser?.email)
        : [...(post.upvoted_by || []), currentUser?.email];
      await base44.entities.ForumPost.update(post.id, {
        upvotes: newUpvotedBy.length,
        upvoted_by: newUpvotedBy,
      });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['forumPosts'] }),
  });

  const filtered = posts.filter(p => {
    if (p.status !== 'active') return false;
    if (search && !p.title.toLowerCase().includes(search.toLowerCase())) return false;
    if (filterTag !== 'all' && !p.tags?.includes(filterTag)) return false;
    return true;
  });

  if (selectedPost) {
    return <ForumPostDetail post={selectedPost} onBack={() => setSelectedPost(null)} currentUser={currentUser} />;
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Career Forum</h1>
          <p className="text-sm text-muted-foreground">Ask questions, share knowledge, grow together</p>
        </div>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button className="gap-1.5"><Plus className="w-4 h-4" /> New Post</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader><DialogTitle>Create Post</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <Input placeholder="Title" value={newPost.title} onChange={(e) => setNewPost({ ...newPost, title: e.target.value })} />
              <Textarea placeholder="What's on your mind?" className="h-32" value={newPost.content} onChange={(e) => setNewPost({ ...newPost, content: e.target.value })} />
              <div className="space-y-2">
                <Label>Tags</Label>
                <div className="flex flex-wrap gap-1.5">
                  {TOPIC_TAGS.map(tag => (
                    <Badge
                      key={tag}
                      variant={newPost.tags.includes(tag) ? 'default' : 'outline'}
                      className="cursor-pointer"
                      onClick={() => {
                        setNewPost(p => ({
                          ...p,
                          tags: p.tags.includes(tag)
                            ? p.tags.filter(t => t !== tag)
                            : [...p.tags, tag]
                        }));
                      }}
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={newPost.is_anonymous} onCheckedChange={(v) => setNewPost({ ...newPost, is_anonymous: v })} />
                <Label>Post anonymously</Label>
              </div>
              <Button className="w-full" onClick={() => createMutation.mutate(newPost)} disabled={!newPost.title || !newPost.content || createMutation.isPending}>
                {createMutation.isPending ? 'Posting...' : 'Post'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search posts..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Select value={filterTag} onValueChange={setFilterTag}>
          <SelectTrigger className="w-40"><Filter className="w-4 h-4 mr-2" /><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Topics</SelectItem>
            {TOPIC_TAGS.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* Posts */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => <Card key={i} className="h-24 animate-pulse bg-muted" />)}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={MessageSquare}
          title="No posts yet"
          description="Be the first to start a discussion!"
          action={<Button onClick={() => setCreateOpen(true)}>Create Post</Button>}
        />
      ) : (
        <AnimatePresence>
          <div className="space-y-3">
            {filtered.map((post, i) => (
              <motion.div key={post.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                <Card className="hover:border-primary/20 transition-all cursor-pointer" onClick={() => setSelectedPost(post)}>
                  <CardContent className="p-4">
                    <div className="flex gap-3">
                      <div className="flex flex-col items-center gap-1 shrink-0 pt-1">
                        <button
                          onClick={(e) => { e.stopPropagation(); upvoteMutation.mutate(post); }}
                          className={`p-1 rounded hover:bg-muted transition-colors ${post.upvoted_by?.includes(currentUser?.email) ? 'text-primary' : 'text-muted-foreground'}`}
                        >
                          <ArrowUp className="w-4 h-4" />
                        </button>
                        <span className="text-sm font-semibold">{post.upvotes || 0}</span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-sm line-clamp-1">{post.title}</h3>
                        <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{post.content}</p>
                        <div className="flex items-center gap-2 mt-2 flex-wrap">
                          <span className="text-xs text-muted-foreground">
                            {post.is_anonymous ? 'Anonymous' : post.author_name}
                          </span>
                          <span className="text-xs text-muted-foreground">·</span>
                          <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            <MessageSquare className="w-3 h-3" /> {post.reply_count || 0}
                          </span>
                          {post.tags?.map(tag => (
                            <Badge key={tag} variant="secondary" className="text-xs px-1.5 py-0">{tag}</Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </AnimatePresence>
      )}
    </div>
  );
}