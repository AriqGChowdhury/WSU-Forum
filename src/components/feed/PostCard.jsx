import React, { useMemo, useState } from "react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PostEditDialog } from "./PostEditDialog";
import { RoleBadge } from "@/components/common/RoleBadge";
import { useAuth } from "@/contexts/AuthContext";
import { usePosts } from "@/contexts/PostContext";
import { getInitials, formatEventDateTime } from "@/lib/utils";
import { SUBFORUMS } from "@/constants";
import {
  Heart,
  Bookmark,
  MessageCircle,
  MoreHorizontal,
  Pencil,
  Trash2,
  Flag,
  Share2,
  Calendar,
  MapPin,
  Hash,
  Send,
} from "lucide-react";

export function PostCard({ post, showSubforum = true, onSubforumClick }) {
  const { user } = useAuth();

  const postsCtx = usePosts();
  const toggleLike = postsCtx?.toggleLike;
  const toggleSave = postsCtx?.toggleSave;
  const deletePost = postsCtx?.deletePost;

  // Optional: if your PostContext has addComment, this will use it.
  const addComment = postsCtx?.addComment;

  const [editOpen, setEditOpen] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [commentSubmitting, setCommentSubmitting] = useState(false);
  const [commentError, setCommentError] = useState("");

  const isOwner = post.author?.id === user?.id;
  const isEvent = post.contentType === "event";

  const subforum = useMemo(() => {
    if (!post.subforumId) return null;
    return SUBFORUMS.find((sf) => sf.id === post.subforumId) || null;
  }, [post.subforumId]);

  const commentsCount = post.comments?.length || 0;

  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this post?")) {
      deletePost?.(post.id);
    }
  };

  const handleToggleComments = () => {
    setShowComments((prev) => !prev);
    setCommentError("");
  };

  const handleSubmitComment = async () => {
    const text = commentText.trim();
    if (!text) return;

    setCommentSubmitting(true);
    setCommentError("");

    try {
      if (typeof addComment !== "function") {
        setCommentError("Comment feature is not wired yet (missing addComment in PostContext).");
        return;
      }

      await addComment(post.id, text);
      setCommentText("");
    } catch (e) {
      setCommentError(e?.message || "Failed to add comment");
    } finally {
      setCommentSubmitting(false);
    }
  };

  return (
    <>
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="flex-row items-start justify-between space-y-0 pb-3">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={post.author?.avatar} />
              <AvatarFallback className="bg-[var(--wsu-green)] text-white">
                {getInitials(post.author?.name)}
              </AvatarFallback>
            </Avatar>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-semibold">{post.author?.name}</span>
                {post.author?.role && <RoleBadge role={post.author.role} size="sm" />}
              </div>

              <div className="flex items-center gap-2 text-xs text-zinc-500">
                <span>{post.createdAt}</span>

                {showSubforum && subforum && (
                  <>
                    <span>•</span>
                    <button
                      onClick={() => onSubforumClick?.(subforum)}
                      className="flex items-center gap-1 hover:text-[var(--wsu-green)] transition"
                      type="button"
                    >
                      <Hash className="h-3 w-3" />
                      {subforum.name}
                    </button>
                  </>
                )}

                {post.topicName && !subforum && (
                  <>
                    <span>•</span>
                    <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                      {post.topicName}
                    </Badge>
                  </>
                )}
              </div>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end">
              {isOwner ? (
                <>
                  <DropdownMenuItem onClick={() => setEditOpen(true)}>
                    <Pencil className="mr-2 h-4 w-4" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleDelete} className="text-red-600">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </>
              ) : (
                <>
                  <DropdownMenuItem>
                    <Share2 className="mr-2 h-4 w-4" />
                    Share
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-red-600">
                    <Flag className="mr-2 h-4 w-4" />
                    Report
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </CardHeader>

        <CardContent className="space-y-3 pt-0">
          {post.contentType && post.contentType !== "discussion" && (
            <Badge
              variant="outline"
              className={`
                text-xs capitalize
                ${post.contentType === "event" ? "border-blue-300 bg-blue-50 text-blue-700" : ""}
                ${post.contentType === "question" ? "border-amber-300 bg-amber-50 text-amber-700" : ""}
                ${post.contentType === "announcement" ? "border-green-300 bg-green-50 text-green-700" : ""}
              `}
            >
              {post.contentType}
            </Badge>
          )}

          <h3 className="text-lg font-semibold leading-tight">{post.title}</h3>

          <p className="text-sm leading-relaxed text-zinc-700 whitespace-pre-wrap">
            {post.body}
          </p>

          {isEvent && (post.eventDate || post.eventPlace) && (
            <div className="flex flex-wrap gap-4 p-3 bg-zinc-50 rounded-lg text-sm">
              {post.eventDate && (
                <div className="flex items-center gap-2 text-zinc-600">
                  <Calendar className="h-4 w-4" />
                  <span>{formatEventDateTime(post.eventDate, post.eventTime)}</span>
                </div>
              )}
              {post.eventPlace && (
                <div className="flex items-center gap-2 text-zinc-600">
                  <MapPin className="h-4 w-4" />
                  <span>{post.eventPlace}</span>
                </div>
              )}
            </div>
          )}

          <Separator />

          <div className="flex items-center gap-2">
            <button
              onClick={() => toggleLike?.(post.id)}
              className={`
                inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5
                text-sm transition-all hover:bg-zinc-50
                ${post.liked ? "border-[var(--wsu-green)] bg-green-50 text-[var(--wsu-green)]" : "border-zinc-200"}
              `}
              type="button"
            >
              <Heart className={`h-4 w-4 ${post.liked ? "fill-[var(--wsu-green)]" : ""}`} />
              <span>{post.likes}</span>
            </button>

            <button
              onClick={handleToggleComments}
              className={`
                inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5
                text-sm transition hover:bg-zinc-50
                ${showComments ? "border-[var(--wsu-green)] bg-green-50 text-[var(--wsu-green)]" : "border-zinc-200"}
              `}
              type="button"
            >
              <MessageCircle className="h-4 w-4" />
              <span>{commentsCount}</span>
            </button>

            {!isOwner && (
              <button
                onClick={() => toggleSave?.(post.id)}
                className={`
                  ml-auto inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5
                  text-sm transition hover:bg-zinc-50
                  ${post.saved ? "border-[var(--wsu-green)] bg-green-50 text-[var(--wsu-green)]" : "border-zinc-200"}
                `}
                type="button"
              >
                <Bookmark className={`h-4 w-4 ${post.saved ? "fill-[var(--wsu-green)]" : ""}`} />
                {post.saved ? "Saved" : "Save"}
              </button>
            )}
          </div>

          {/* ✅ Comments Section (ALWAYS shows when opened, even if 0 comments) */}
          {showComments && (
            <div className="space-y-3 pt-2">
              <Separator />

              {/* Add comment box */}
              <div className="flex gap-2 items-start">
                <Avatar className="h-7 w-7 mt-1">
                  <AvatarImage src={user?.avatar} />
                  <AvatarFallback className="text-xs bg-zinc-200">
                    {getInitials(user?.name || "U")}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1">
                  <div className="flex gap-2">
                    <Input
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      placeholder="Write a comment..."
                      className="flex-1"
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          if (!commentSubmitting) handleSubmitComment();
                        }
                      }}
                    />
                    <Button
                      onClick={handleSubmitComment}
                      disabled={commentSubmitting || !commentText.trim()}
                      className="bg-[var(--wsu-green)] hover:bg-[var(--wsu-green)]/90"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>

                  {commentError && (
                    <p className="text-xs text-red-600 mt-1">{commentError}</p>
                  )}
                </div>
              </div>

              {/* List comments */}
              {commentsCount === 0 ? (
                <p className="text-sm text-zinc-500">No comments yet. Be the first.</p>
              ) : (
                <div className="space-y-3">
                  {post.comments.map((comment) => (
                    <div key={comment.id} className="flex gap-2">
                      <Avatar className="h-7 w-7">
                        <AvatarImage src={comment.author?.avatar} />
                        <AvatarFallback className="text-xs bg-zinc-200">
                          {getInitials(comment.author?.name || comment.author || "U")}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1 bg-zinc-50 rounded-lg px-3 py-2">
                        <div className="flex items-center gap-2">
                          <p className="text-xs font-medium">
                            {comment.author?.name || comment.author}
                          </p>
                          {comment.author?.role && (
                            <RoleBadge role={comment.author.role} size="sm" showIcon={false} />
                          )}
                        </div>
                        <p className="text-sm">{comment.text}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <PostEditDialog post={post} open={editOpen} onOpenChange={setEditOpen} />
    </>
  );
}

export default PostCard;