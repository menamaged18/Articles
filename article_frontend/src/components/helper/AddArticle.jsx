import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { createArticle } from '../../store/slices/articleSlice';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';

const AddArticle = ({ open, onClose, onSuccess }) => {
  const dispatch = useDispatch();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [summary, setSummary] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      setError('Both title and content are required.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      // Send summary only if it's not empty (backend will fallback to auto‑generated)
      await dispatch(createArticle({ title, content, summary: summary.trim() || undefined })).unwrap();
      // Reset form
      setTitle('');
      setContent('');
      setSummary('');
      onSuccess(); // close modal and refresh articles
    } catch (err) {
      setError(err || 'Failed to create article. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-125">
        <DialogHeader>
          <DialogTitle>Create New Article</DialogTitle>
          <DialogDescription>
            Share your thoughts with the community. Fill in the title, summary (optional), and content below.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <label htmlFor="title" className="text-sm font-medium">
              Title
            </label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter a title..."
              disabled={isSubmitting}
              autoFocus
            />
          </div>

          {/* New summary field */}
          <div className="space-y-2">
            <label htmlFor="summary" className="text-sm font-medium">
              Summary (optional)
            </label>
            <Textarea
              id="summary"
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="A short summary of your article (if empty, it will be auto‑generated)"
              rows={2}
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="content" className="text-sm font-medium">
              Content
            </label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your article content here..."
              rows={6}
              disabled={isSubmitting}
            />
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Publish Article
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddArticle;