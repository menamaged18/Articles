import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { articlesAll } from "../../store/slices/articleSlice"; 
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ThumbsUp, ThumbsDown, MessageSquare, Loader2 } from "lucide-react";

const Home = () => {
  const dispatch = useDispatch();
  
  const { articles, isLoading } = useSelector((state) => state.articles);

  useEffect(() => {
    dispatch(articlesAll());
  }, [dispatch]);

  const getInitials = (name) => name?.split(" ").map((n) => n[0]).join("").toUpperCase() || "U";

  return (
    <div className="container max-w-4xl mx-auto py-10 px-4">
      <div className="flex flex-col gap-8">
        {/* Header Section */}
        <div className="flex items-center justify-between border-b pb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Community Feed</h1>
            <p className="text-muted-foreground">Stay updated with the latest insights.</p>
          </div>
          <Badge variant="outline" className="px-4 py-1">
            {articles.length} Articles
          </Badge>
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
                  <AvatarFallback>{getInitials(article.user.name)}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <p className="text-sm font-semibold leading-none">{article.user.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(article.created_at).toLocaleDateString()}
                  </p>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-2">
                <CardTitle className="text-xl">{article.title}</CardTitle>
                <p className="text-muted-foreground line-clamp-3">
                  {article.content}
                </p>
              </CardContent>

              <CardFooter className="flex justify-between border-t bg-muted/50 py-3">
                <div className="flex gap-4">
                  <button className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary">
                    <ThumbsUp className="h-4 w-4" />
                    {article.likes_count}
                  </button>
                  <button className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-destructive">
                    <ThumbsDown className="h-4 w-4" />
                    {article.dislikes_count}
                  </button>
                </div>
                <Button variant="ghost" size="sm" className="gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Read More
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Home;