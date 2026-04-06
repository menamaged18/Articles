import React from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, MessageSquare } from 'lucide-react';
import ReactionButton from '@/components/helper/ReactionButton';

const getInitials = (name) =>
  name?.split(' ').map((n) => n[0]).join('').toUpperCase() || 'U';

const ArticleCard = ({ article, isFullPage = false, actionLabel = "Comment", onActionClick }) => {
  if (!article) return null;

  const formattedDate = new Date(article.created_at).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const handleAction = () => {
    if (onActionClick) {
      onActionClick(article.id);
    }
  };

  return (
    <article className="space-y-8">
      {/* Header section with badge and title */}
      <div className="space-y-4">
        <Badge variant="secondary" className="mb-2">Community Post</Badge>
        <h1 className={`font-extrabold tracking-tight ${isFullPage ? 'text-4xl lg:text-5xl' : 'text-2xl lg:text-3xl'}`}>
          {article.title}
        </h1>

        <div className="flex items-center gap-4 py-4 border-y">
          <Avatar className="h-12 w-12 border">
            <AvatarFallback className="bg-primary/5 text-primary">
              {getInitials(article.user?.name)}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="font-semibold text-lg">{article.user?.name}</span>
            <div className="flex items-center text-sm text-muted-foreground">
              <Calendar className="mr-1 h-3 w-3" />
              {formattedDate}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="prose prose-slate max-w-none dark:prose-invert">
        <p className={`text-foreground/90 whitespace-pre-wrap ${!isFullPage ? 'line-clamp-3' : ''}`}>
          {article.content}
        </p>
      </div>

      {/* Interaction Footer */}
      <div className="bg-muted/30 border-dashed rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div className="flex gap-6">
            <ReactionButton
              type="like"
              count={article.likes_count}
              articleId={article.id}
              userReaction={article.userReaction}
            />
            <ReactionButton
              type="dislike"
              count={article.dislikes_count}
              articleId={article.id}
              userReaction={article.userReaction}
            />
          </div>
          <Button variant="outline" className="gap-2" onClick={handleAction}>
            <MessageSquare className="h-4 w-4" />
            {actionLabel}
          </Button>
        </div>
      </div>
    </article>
  );
};

export default ArticleCard;