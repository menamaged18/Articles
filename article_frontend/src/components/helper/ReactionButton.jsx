import { useDispatch } from "react-redux";
import { articleReact } from "@/store/slices/articleSlice";
import { ThumbsUp, ThumbsDown } from "lucide-react";

const ReactionButton = ({ 
  type,           
  count, 
  articleId, 
  userReaction,   
  onReact         
}) => {
  const dispatch = useDispatch();

  const isActive = userReaction === (type === 'like' ? true : false);
  
  const getStyles = () => {
    if (type === 'like') {
      return isActive
        ? 'text-primary font-semibold border border-primary bg-primary/10'
        : 'text-muted-foreground hover:text-primary border border-transparent hover:border-primary/50';
    } else { // dislike
      return isActive
        ? 'text-destructive font-semibold border border-destructive bg-destructive/10'
        : 'text-muted-foreground hover:text-destructive border border-transparent hover:border-destructive/50';
    }
  };

  const handleClick = () => {
    const reactionValue = type === 'like' ? true : false;
    if (onReact) {
      onReact(reactionValue);
    } else {
      dispatch(articleReact({ articleId, reactType: reactionValue }));
    }
  };

  const Icon = type === 'like' ? ThumbsUp : ThumbsDown;

  return (
    <button
      onClick={handleClick}
      className={`flex items-center gap-1.5 text-sm transition-all rounded-md px-2 py-1 ${getStyles()}`}
    >
      <Icon className="h-4 w-4" />
      {count}
    </button>
  );
};

export default ReactionButton;