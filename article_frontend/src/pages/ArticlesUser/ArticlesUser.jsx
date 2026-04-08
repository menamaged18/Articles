import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { articlesUser, articleDeleteById } from '@/store/slices/articleSlice';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, PenSquare } from 'lucide-react';
import ArticleCard from '@/components/helper/ArticleCard';
import AddArticle from '@/components/helper/AddArticle';          
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from "sonner"
import { Navigate, useNavigate } from 'react-router-dom';

const UserArticles = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { articles, isLoading, error, pagination } = useSelector((state) => state.articles);
  const { token } = useSelector((state) => state.users);
  
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [articleToDelete, setArticleToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);        

  useEffect(() => {
    if (token) {
      dispatch(articlesUser());  
    }
  }, [dispatch, token]);

  const handleReadArticle = (articleId) => {
    navigate(`/articles/${articleId}`);
  };

  const handleEditArticle = (articleId) => {
    navigate(`/articles/edit/${articleId}`);
  };

  const handleLoadMore = () => {
    if (pagination.hasNextPage && !isLoading) {
      dispatch(articlesUser(pagination.currentPage + 1));
    }
  };

  const handleDeleteClick = (article) => {
    setArticleToDelete(article);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!articleToDelete) return;
    setIsDeleting(true);
    try {
      await dispatch(articleDeleteById(articleToDelete.id)).unwrap();
      setDeleteDialogOpen(false);
      setArticleToDelete(null);
      toast.success("Article Deleted Successfuly");
    } catch (err) {
      console.error('Delete failed:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  // Called after a new article is successfully created
  const handleArticleCreated = () => {
    setIsModalOpen(false);
    // Refresh user articles 
    dispatch(articlesUser(1));
  };

  const handleCreateClick = () => {
    if (!token) {
      toast.warning("You Need To Be Logged-in first");
      return;
    }
    setIsModalOpen(true);
  };

  // Loading and error states remain the same
  if (isLoading && !articles.length) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className="mb-4 max-w-3xl mx-auto mt-5">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!token) {
    return (
      <div className="max-w-3xl mx-auto mt-5 px-4">
        No User is Signed in
      </div>
    );
  }

  if (!articles.length) {
    return (
      <div className="max-w-3xl mx-auto mt-5 px-4">
        <Card className="text-center py-8">
          <CardContent>
            <p className="text-muted-foreground mb-4">You haven't written any articles yet.</p>
            <Button onClick={handleCreateClick}>   {/* 👈 open modal instead of navigate */}
              <PenSquare className="mr-2 h-4 w-4" />
              Create Your First Article
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-3xl mx-auto my-8 px-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">My Articles</h2>
        <Button onClick={handleCreateClick}>  
          <PenSquare className="mr-2 h-4 w-4" />
          New Article
        </Button>
      </div>

      <div className="flex flex-col gap-10">
        {articles.map((article) => (
          <ArticleCard
            key={article.id}
            article={article}
            isFullPage={false}
            actionLabel="Read article"
            onActionClick={handleReadArticle}
            showOwnerActions={true}
            onEdit={handleEditArticle}
            onDelete={handleDeleteClick}
          />
        ))}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the article
              "{articleToDelete?.title}".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} disabled={isDeleting}>
              {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Load More Section */}
      <div className="flex flex-col items-center justify-center mt-10 pb-10 gap-4">
        {isLoading && (
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        )}
        {!isLoading && pagination.hasNextPage && (
          <Button variant="outline" className="w-full max-w-xs" onClick={handleLoadMore}>
            Load More Articles
          </Button>
        )}
        {!pagination.hasNextPage && articles.length > 0 && (
          <p className="text-muted-foreground text-sm">You've reached the end of the feed.</p>
        )}
      </div>

      <AddArticle
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleArticleCreated}
      />
    </div>
  );
};

export default UserArticles;