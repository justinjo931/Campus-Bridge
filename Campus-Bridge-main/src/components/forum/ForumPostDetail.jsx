import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { ArrowLeft, ArrowUp, Send, Flag } from 'lucide-react';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { format } from 'date-fns';

export default function ForumPostDetail({ post, onBack, currentUser }) {
  const queryClient = useQueryClient();
  const [replyContent, setReplyContent] = useState('');
  const [isAnon, setIsAnon] = useState(false);

  const { data: replies = [] } = useQuery({
    queryKey: ['forumReplies', post.id],
    queryFn: () => base44.entities.ForumReply.filter({ post_id: post.id }, '-created_date', 100),
  });

  const replyMutation = useMutation({
    mutationFn: (content) => base44.entities.ForumReply.create({
      post_id: post.id,
      content,
      is_anonymous: isAnon,
      author_name: isAnon ? 'Anonymous' : currentUser?.full_name,
      author_role: currentUser?.role,
      upvoted_by: [],
    }),
    onSuccess: async () => {
      await base44.entities.ForumPost.update(post.id, { reply_count: (post.reply_count || 0) + 1 });
      queryClient.invalidateQueries({ queryKey: ['forumReplies', post.id] });
      queryClient.invalidateQueries({ queryKey: ['forumPosts'] });
      setReplyContent('');
    },
  });

  const upvoteReply = useMutation({
    mutationFn: async (reply) => {
      const already = reply.upvoted_by?.includes(currentUser?.email);
      const newList = already
        ? reply.upvoted_by.filter(e => e !== currentUser?.email)
        : [...(reply.upvoted_by || []), currentUser?.email];
      await base44.entities.ForumReply.update(reply.id, { upvotes: newList.length, upvoted_by: newList });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['forumReplies', post.id] }),
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-3xl mx-auto space-y-6">
      <Button variant="ghost" onClick={onBack} className="gap-1.5 -ml-2">
        <ArrowLeft className="w-4 h-4" /> Back
      </Button>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-3">
              <Avatar className="w-8 h-8">
                <AvatarFallback className="text-xs bg-primary/10 text-primary">
                  {post.is_anonymous ? '?' : (post.author_name || 'U')[0]}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium">{post.is_anonymous ? 'Anonymous' : post.author_name}</p>
                <p className="text-xs text-muted-foreground">
                  {post.created_date && format(new Date(post.created_date), 'MMM d, yyyy')}
                </p>
              </div>
            </div>
            <h1 className="text-xl font-bold mb-3">{post.title}</h1>
            <div className="prose prose-sm max-w-none text-foreground">
              <ReactMarkdown>{post.content}</ReactMarkdown>
            </div>
            {post.tags?.length > 0 && (
              <div className="flex gap-1.5 mt-4 flex-wrap">
                {post.tags.map(t => <Badge key={t} variant="secondary">{t}</Badge>)}
              </div>
            )}
            <div className="flex items-center gap-3 mt-4 pt-4 border-t">
              <span className="text-sm font-medium">{post.upvotes || 0} upvotes</span>
              <span className="text-sm text-muted-foreground">·</span>
              <span className="text-sm text-muted-foreground">{replies.length} replies</span>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Reply input */}
      <Card>
        <CardContent className="p-4 space-y-3">
          <Textarea
            placeholder="Write your reply..."
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
            className="min-h-[80px]"
          />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Switch checked={isAnon} onCheckedChange={setIsAnon} />
              <Label className="text-sm">Reply anonymously</Label>
            </div>
            <Button
              size="sm"
              className="gap-1.5"
              onClick={() => replyMutation.mutate(replyContent)}
              disabled={!replyContent.trim() || replyMutation.isPending}
            >
              <Send className="w-4 h-4" /> Reply
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Replies */}
      <div className="space-y-3">
        {replies.map((reply, i) => (
          <motion.div key={reply.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
            <Card>
              <CardContent className="p-4">
                <div className="flex gap-3">
                  <div className="flex flex-col items-center gap-1 shrink-0">
                    <button
                      onClick={() => upvoteReply.mutate(reply)}
                      className={`p-1 rounded hover:bg-muted transition-colors ${reply.upvoted_by?.includes(currentUser?.email) ? 'text-primary' : 'text-muted-foreground'}`}
                    >
                      <ArrowUp className="w-4 h-4" />
                    </button>
                    <span className="text-xs font-medium">{reply.upvotes || 0}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium">{reply.is_anonymous ? 'Anonymous' : reply.author_name}</span>
                      {reply.author_role && <Badge variant="outline" className="text-xs capitalize">{reply.author_role}</Badge>}
                      <span className="text-xs text-muted-foreground">
                        {reply.created_date && format(new Date(reply.created_date), 'MMM d')}
                      </span>
                    </div>
                    <p className="text-sm text-foreground">{reply.content}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}