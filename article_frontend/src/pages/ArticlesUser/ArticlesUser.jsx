import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { articlesUser } from '@/store/slices/articleSlice';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, PenSquare } from 'lucide-react';
import ArticleCard from '@/components/helper/ArticleCard';

const UserArticles = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { articles, isLoading, error } = useSelector((state) => state.articles);
  const { token } = useSelector((state) => state.users);

  useEffect(() => {
    if(token != null){
        dispatch(articlesUser());
    }
  }, [dispatch]);

  const handleReadArticle = (articleId) => {
    navigate(`/articles/${articleId}`);
  };

  if (isLoading) {
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

  if(token == null){
    return(
      <div className="max-w-3xl mx-auto mt-5 px-4">
        No User is Signed in
      </div>
    )
  }

  if (!articles.length) {
    return (
      <div className="max-w-3xl mx-auto mt-5 px-4">
        <Card className="text-center py-8">
          <CardContent>
            <p className="text-muted-foreground mb-4">You haven't written any articles yet.</p>
            <Button asChild>
              <Link to="/articles/create">
                <PenSquare className="mr-2 h-4 w-4" />
                Create Your First Article
              </Link>
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
        <Button asChild>
          <Link to="/articles/create">
            <PenSquare className="mr-2 h-4 w-4" />
            New Article
          </Link>
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
          />
        ))}
      </div>
    </div>
  );
};

export default UserArticles;