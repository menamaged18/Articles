// pages/Article.jsx
import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { articlesAll } from '@/store/slices/articleSlice';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import ArticleCard from '@/components/helper/ArticleCard';

const Article = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const article = useSelector((state) =>
    state.articles.articles.find((a) => a.id === parseInt(id))
  );

  useEffect(() => {
    if (!article) {
      dispatch(articlesAll());
    }
  }, [article, dispatch]);

  if (!article) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <p className="text-muted-foreground animate-pulse">Loading article...</p>
      </div>
    );
  }

  const handleCommentClick = (articleId) => {
    // You can implement comment section scrolling or navigation here
    console.log("Open comments for article", articleId);
    // Example: navigate to comments section
    // navigate(`/articles/${articleId}#comments`);
  };

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
        onActionClick={handleCommentClick}
      />
    </div>
  );
};

export default Article;