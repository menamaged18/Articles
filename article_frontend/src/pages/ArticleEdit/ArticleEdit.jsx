import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { articleById, articleUpdateById } from '@/store/slices/articleSlice';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';

const EditArticle = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { article, isLoading } = useSelector((state) => state.articles);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!article || article.id != id) {
      dispatch(articleById(id));
    }
  }, [dispatch, id, article]);

  useEffect(() => {
    if (article) {
      setTitle(article.title);
      setContent(article.content);
    }
  }, [article]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await dispatch(articleUpdateById({ articleId: id, updatedArticle: { title, content } })).unwrap();
      navigate(`/articles/${id}`);
    } catch (err) {
      console.error('Update failed:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return <Loader2 className="animate-spin mx-auto mt-10" />;
  if (!article) return <div>Article not found</div>;

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">Edit Article</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <Textarea
          placeholder="Content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={10}
          required
        />
        <div className="flex gap-4">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Save Changes
          </Button>
          <Button type="button" variant="outline" onClick={() => navigate(-1)}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
};

export default EditArticle;