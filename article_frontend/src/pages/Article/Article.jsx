import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { articlesAll } from '@/store/slices/articleSlice';
import { fetchComments, createComment, updateComment, deleteComment } from '@/store/slices/commentsSlice';
import { Button } from '@/components/ui/button';
import { ArrowLeft, MessageSquare } from 'lucide-react';
import ArticleCard from '@/components/helper/ArticleCard';
import CommentItem from '@/components/helper/CommentItem';
import { toast } from "sonner"

const Article = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const articleId = parseInt(id);

  // Article data
  const article = useSelector((state) => state.articles.articles.find((a) => a.id === articleId));

  // User Exist or not
  const { token } = useSelector((state) => state.users);

  // Comments data
  const comments = useSelector((state) => state.comments.commentsByArticle[articleId] || []);
  const commentsLoading = useSelector((state) => state.comments.loading);

  // Local state for new comment input
  const [newCommentContent, setNewCommentContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch article if not in store
  useEffect(() => {
    if (!article) {
      dispatch(articlesAll());
    }
  }, [article, dispatch]);

  // Fetch comments when articleId is available
  useEffect(() => {
    if (articleId) {
      dispatch(fetchComments(articleId));
    }
  }, [articleId, dispatch]);

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newCommentContent.trim()) return;

    // if no user prevent sending comment
    if(!token) {
      toast.warning("You Need To Be Logged-in first")
      return
    };

    setIsSubmitting(true);
    try {
      await dispatch(createComment({ articleId, content: newCommentContent })).unwrap();
      setNewCommentContent('');
    } catch (error) {
      console.error('Failed to add comment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateComment = async (commentId, newContent) => {
    try {
      await dispatch(updateComment({ commentId, content: newContent })).unwrap();
    } catch (error) {
      console.error('Failed to update comment:', error);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (window.confirm('Are you sure you want to delete this comment?')) {
      try {
        await dispatch(deleteComment(commentId)).unwrap();
      } catch (error) {
        console.error('Failed to delete comment:', error);
      }
    }
  };

  if (!article) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <p className="text-muted-foreground animate-pulse">Loading article...</p>
      </div>
    );
  }

  return (
    <div className="container max-w-3xl mx-auto py-10 px-4">
      <Button
        variant="ghost"
        className="mb-6 -ml-4 text-muted-foreground hover:text-foreground"
        onClick={() => navigate(-1)}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Feed
      </Button>

      <ArticleCard
        article={article}
        isFullPage={true}
        actionLabel="Comment"
        onActionClick={() => {
          document.getElementById('comment-input')?.focus();
        }}
      />

      {/* Comments Section */}
      <div className="mt-12 pt-8 border-t" id="comments-section">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Comments ({comments.length})
        </h2>

        {/* Add Comment Form */}
        <form onSubmit={handleAddComment} className="mb-8">
          <div className="flex gap-3">
            <div className="flex-1">
              <textarea
                id="comment-input"
                rows="2"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                placeholder="Write a comment..."
                value={newCommentContent}
                onChange={(e) => setNewCommentContent(e.target.value)}
                required
              />
            </div>
            <Button type="submit" disabled={isSubmitting || !newCommentContent.trim()}>
              {isSubmitting ? 'Posting...' : 'Post'}
            </Button>
          </div>
        </form>

        {/* Comments List */}
        {commentsLoading && comments.length === 0 ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse flex gap-3">
                <div className="w-10 h-10 bg-muted rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-1/4" />
                  <div className="h-3 bg-muted rounded w-3/4" />
                </div>
              </div>
            ))}
          </div>
        ) : comments.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            No comments yet. Be the first to comment!
          </div>
        ) : (
          <div className="space-y-6">
            {comments.map((comment) => (
              <CommentItem
                key={comment.id}
                comment={comment}
                articleUserId={article.user_id}
                onUpdate={handleUpdateComment}
                onDelete={handleDeleteComment}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Article;