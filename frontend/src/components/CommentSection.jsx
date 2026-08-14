import React, { useEffect, useState, useCallback } from 'react';
import { Send, Trash2, MessageSquare } from 'lucide-react';
import axios from 'axios';
import Button from './ui/Button';

const CommentSection = ({ taskId, currentUser }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const fetchComments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`/api/tasks/${taskId}/comments`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setComments(response.data);
    } catch (err) {
      console.error(err);
      setError('Failed to load comments.');
    } finally {
      setLoading(false);
    }
  }, [taskId]);

  useEffect(() => {
    if (taskId) {
      fetchComments();
    }
  }, [taskId, fetchComments]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`/api/tasks/${taskId}/comments`, 
        { comment: newComment },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setComments(prev => [...prev, response.data]);
      setNewComment('');
    } catch (err) {
      console.error(err);
      alert('Failed to post comment.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (commentId) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/api/comments/${commentId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setComments(prev => prev.filter(c => c.id !== commentId));
    } catch (err) {
      console.error(err);
      alert('Failed to delete comment.');
    }
  };

  const formatCommentDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="flex flex-col gap-4">
      <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
        <MessageSquare className="h-4 w-4 text-brand-500" />
        Comments & Notes ({comments.length})
      </h4>

      {/* Input box */}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Write a comment..."
          className="flex-1 px-3.5 py-2 text-sm rounded-lg border border-slate-200 focus:ring-brand-500/25 focus:border-brand-500 dark:border-slate-800 dark:bg-slate-950 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2"
          disabled={submitting}
        />
        <Button type="submit" loading={submitting} className="px-3">
          <Send className="h-4 w-4" />
        </Button>
      </form>

      {/* Comments List */}
      {loading ? (
        <div className="text-center py-6 text-xs font-semibold text-slate-400">
          Loading discussion thread...
        </div>
      ) : error ? (
        <div className="text-center py-6 text-xs font-semibold text-red-500">
          {error}
        </div>
      ) : comments.length === 0 ? (
        <div className="text-center py-6 text-xs text-slate-400 dark:text-slate-600 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
          No comments yet. Start the conversation!
        </div>
      ) : (
        <div className="flex flex-col gap-3 max-h-[350px] overflow-y-auto pr-1">
          {comments.map((comment) => {
            const isAuthor = comment.user_id === currentUser?.id;
            const isAdmin = currentUser?.role === 'admin';
            
            return (
              <div
                key={comment.id}
                className="flex flex-col gap-1 p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-white/40 dark:bg-slate-950/20 group hover:border-slate-200 dark:hover:border-slate-800/80 transition-colors"
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      {comment.user?.name || 'Unknown User'}
                    </span>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500">
                      {formatCommentDate(comment.created_at)}
                    </span>
                  </div>
                  {(isAuthor || isAdmin) && (
                    <button
                      onClick={() => handleDelete(comment.id)}
                      className="text-slate-300 hover:text-red-500 dark:text-slate-700 dark:hover:text-red-400 p-1 rounded transition-colors opacity-0 group-hover:opacity-100"
                      title="Delete comment"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 break-words leading-relaxed whitespace-pre-wrap">
                  {comment.comment}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CommentSection;
