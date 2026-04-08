import { useState, useEffect } from "react";
import { createPortal } from "react-dom"; 
import { useDispatch, useSelector } from "react-redux";
import { articleReact } from "@/store/slices/articleSlice";
import { ThumbsUp, ThumbsDown, AlertCircle } from "lucide-react";

const ReactionButton = ({ type, count, articleId, userReaction }) => {
  const dispatch = useDispatch();
  const { token } = useSelector((state) => state.users);
  const [showMessage, setShowMessage] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 }); // --> To track button position

  const isActive = userReaction === (type === 'like' ? true : false);

  useEffect(() => {
    if (showMessage) {
      const timer = setTimeout(() => setShowMessage(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [showMessage]);

  const handleClick = (e) => {
    if (token) {
      const reactionValue = type === 'like' ? true : false;
      dispatch(articleReact({ articleId, reactType: reactionValue }));
    } else {
      // Calculate position of the button to place the tooltip correctly
      const rect = e.currentTarget.getBoundingClientRect();
      setCoords({
        top: rect.top + window.scrollY - 40, // 40px above the button
        left: rect.left + rect.width / 2,
      });
      setShowMessage(true);
    }
  };

  const getStyles = () => {
    if (type === 'like') {
      return isActive
        ? 'text-primary font-semibold border border-primary bg-primary/10'
        : 'text-muted-foreground hover:text-primary border border-transparent hover:border-primary/50';
    } else {
      return isActive
        ? 'text-destructive font-semibold border border-destructive bg-destructive/10'
        : 'text-muted-foreground hover:text-destructive border border-transparent hover:border-destructive/50';
    }
  };

  const Icon = type === 'like' ? ThumbsUp : ThumbsDown;

  return (
    <>
      <button
        onClick={handleClick}
        className={`flex items-center gap-1.5 text-sm transition-all rounded-md px-2 py-1 ${getStyles()}`}
      >
        <Icon className="h-4 w-4" />
        {count}
      </button>

      {showMessage && createPortal(
        <div 
          className="fixed z-9999 -translate-x-1/2 pointer-events-none"
          style={{ top: coords.top, left: coords.left }}
        >
          <div className="bg-popover text-popover-foreground border rounded-lg shadow-xl px-3 py-2 text-xs flex items-center gap-2 animate-in fade-in zoom-in-95 duration-200">
            <AlertCircle className="h-3.5 w-3.5 text-amber-500" />
            <span className="font-medium">Please log in to react</span>
          </div>
          {/* Arrow */}
          <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-border mx-auto" />
        </div>,
        document.body
      )}
    </>
  );
};

export default ReactionButton;