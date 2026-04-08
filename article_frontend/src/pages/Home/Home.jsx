import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { articlesAll } from '../../store/slices/articleSlice';
import { Button } from '@/components/ui/button';
import ReactionButton from '@/components/helper/ReactionButton';
import {Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import  AddArticle  from '@/components/helper/AddArticle'
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Loader2, Plus } from 'lucide-react';
import { toast } from "sonner"

const Home = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { articles, isLoading, pagination } = useSelector((state) => state.articles);
  const { token } = useSelector((state) => state.users);
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  // Debug 
  // console.log(articles)

  useEffect(() => {
    dispatch(articlesAll());
  }, [dispatch]);

  const handleLoadMore = () => {
    if (pagination.hasNextPage && !isLoading) {
      dispatch(articlesAll(pagination.currentPage + 1));
    }
  };

  const getInitials = (name) =>
    name?.split(' ').map((n) => n[0]).join('').toUpperCase() || 'U';

  const handleCreateClick = () => {
    if (!token) {
      toast.warning("You Need To Be Logged-in first")
      return;
    }
    setIsModalOpen(true);
  };


  const handleArticleCreated = () => {
    // refetch articles 
    dispatch(articlesAll()); // refresh the list to show new article
    setIsModalOpen(false);
  };

  return (
    <div className="container max-w-4xl mx-auto py-10 px-4">
      <div className="flex flex-col gap-8">
        {/* Header Section */}
        <div className="flex items-center justify-between border-b pb-6 flex-wrap">
          <div>
            <div className='flex gap-4 items-center justify-center'>
              <h1 className="text-3xl font-bold tracking-tight">Community Feed</h1>
              <Badge variant="outline" className="px-4 py-1">
                {articles.length} Articles
              </Badge>            
            </div>

            <p className="text-muted-foreground">Stay updated with the latest insights.</p>
          </div>

          {/* Create Article Section */}
          <Button onClick={handleCreateClick} className="gap-2">
            <Plus className="h-4 w-4" />
            Create Article
          </Button>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}

        {/* Articles List */}
        <div className="grid gap-6">
          {articles.map((article) => (
            <Card key={article.id} className="overflow-hidden transition-all hover:shadow-md">
              <CardHeader className="flex flex-row items-center gap-4 space-y-0">
                <Avatar className="h-10 w-10">
                  <AvatarFallback>{getInitials(article.user?.name)}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <p className="text-sm font-semibold leading-none">{article.user?.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(article.created_at).toLocaleDateString()}
                  </p>
                </div>
              </CardHeader>

              <CardContent className="space-y-2">
                <CardTitle className="text-xl">{article.title}</CardTitle>
                <p className="text-muted-foreground line-clamp-3">{article.content}</p>
              </CardContent>

              <CardFooter className="flex justify-between border-t bg-muted/50 py-3">
                <div className="flex gap-4">
                  {/* Like Button */}
                  <ReactionButton
                    type="like"
                    count={article.likes_count}
                    articleId={article.id}
                    userReaction={article.userReaction}
                  />

                  {/* Dislike Button */}
                  <ReactionButton
                    type="dislike"
                    count={article.dislikes_count}
                    articleId={article.id}
                    userReaction={article.userReaction}
                  />
                </div>

                <Button variant="ghost" size="sm" className="gap-2" 
                  onClick={() => navigate(`/articles/${article.id}`)}
                >
                  <MessageSquare className="h-4 w-4" />
                  Read More
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>

      {/* Load More Section */}
      <div className="flex flex-col items-center justify-center mt-10 pb-10 gap-4">
        {isLoading && (
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        )}

        {!isLoading && pagination.hasNextPage && (
          <Button 
            variant="outline" 
            className="w-full max-w-xs"
            onClick={handleLoadMore}
          >
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

export default Home;