import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreVertical, Edit, Trash2 } from 'lucide-react';

const getInitials = (name) =>
  name?.split(' ').map((n) => n[0]).join('').toUpperCase() || 'U';

const CommentItem = ({ comment, articleUserId, onUpdate, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  
  const currentUserId = useSelector((state) => state.users.currentUser?.id);

  const isCommentOwner = currentUserId === comment.user_id;
  const canDelete = isCommentOwner || currentUserId === articleUserId;

  const handleSaveEdit = async () => {
    if (!editContent.trim()) return;
    await onUpdate(comment.id, editContent);
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditContent(comment.content);
    setIsEditing(false);
  };

  return (
    <div className="flex gap-3">
      <Avatar className="h-8 w-8 border">
        <AvatarFallback className="bg-primary/5 text-primary text-xs">
          {getInitials(comment.user?.name)}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1">
        <div className="bg-muted/30 rounded-lg p-3">
          <div className="flex justify-between items-start">
            <div>
              <span className="font-semibold text-sm">{comment.user?.name}</span>
              <span className="text-xs text-muted-foreground ml-2">
                {new Date(comment.created_at).toLocaleDateString()}
              </span>
            </div>
            {(isCommentOwner || canDelete) && !isEditing && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-6 w-6">
                    <MoreVertical className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {isCommentOwner && (
                    <DropdownMenuItem onClick={() => setIsEditing(true)}>
                      <Edit className="mr-2 h-3 w-3" /> Edit
                    </DropdownMenuItem>
                  )}
                  {canDelete && (
                    <DropdownMenuItem
                      onClick={() => onDelete(comment.id)}
                      className="text-destructive"
                    >
                      <Trash2 className="mr-2 h-3 w-3" /> Delete
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
          {isEditing ? (
            <div className="mt-2 space-y-2">
              <textarea
                rows="2"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                autoFocus
              />
              <div className="flex gap-2">
                <Button size="sm" onClick={handleSaveEdit}>Save</Button>
                <Button size="sm" variant="ghost" onClick={handleCancelEdit}>Cancel</Button>
              </div>
            </div>
          ) : (
            <p className="text-sm text-foreground/80 mt-1 whitespace-pre-wrap">
              {comment.content}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default CommentItem;