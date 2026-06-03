import { useCallback, useEffect, useState } from 'react';
import {
  createComment,
  deleteComment,
  getComments,
  updateComment,
} from '../shared/api/comments';
import { getProjectDrafts } from '../shared/api/drafts';
import type { CommentDraft, CommentDto, CommentNode } from '../types/api';

const buildCommentTree = (comments: CommentDto[]): CommentNode[] => {
  const map: Record<string, CommentNode> = {};
  const roots: CommentNode[] = [];

  comments.forEach((comment) => {
    map[comment.id] = { ...comment, children: [] };
  });

  comments.forEach((comment) => {
    if (comment.parentCommentId && map[comment.parentCommentId]) {
      map[comment.parentCommentId].children.push(map[comment.id]);
    } else {
      roots.push(map[comment.id]);
    }
  });

  const byDate = (a: CommentNode, b: CommentNode) =>
    new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
  const sortChildren = (node: CommentNode) => {
    node.children.sort(byDate);
    node.children.forEach(sortChildren);
  };

  roots.sort(byDate);
  roots.forEach(sortChildren);

  return roots;
};

interface UseSuggestionCommentsParams {
  projectId: string | undefined;
  suggestionId: string | undefined;
}

export function useSuggestionComments({
  projectId,
  suggestionId,
}: UseSuggestionCommentsParams) {
  const [comments, setComments] = useState<CommentNode[]>([]);
  const [commentsError, setCommentsError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [replyingToId, setReplyingToId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  const refreshComments = useCallback(async () => {
    if (!projectId || !suggestionId) return;

    try {
      const response = await getComments(projectId, suggestionId);
      setComments(buildCommentTree(response));
      setCommentsError(null);
    } catch {
      setComments([]);
      setCommentsError('Не удалось загрузить комментарии');
    }
  }, [projectId, suggestionId]);

  useEffect(() => {
    void refreshComments();
  }, [refreshComments]);

  useEffect(() => {
    if (!projectId || !suggestionId) return;

    let cancelled = false;

    const openLatestReplyDraft = async () => {
      try {
        const response = await getProjectDrafts(projectId, {
          type: 'Comment',
          pageSize: 100,
        });

        const latestReplyDraft = response.items.find(
          (draft): draft is CommentDraft =>
            draft.type === 'Comment' &&
            draft.payload.suggestionId === suggestionId &&
            draft.payload.parentCommentId !== null &&
            draft.payload.text.trim().length > 0,
        );

        if (!cancelled && latestReplyDraft) {
          setReplyingToId(
            (current) => current ?? latestReplyDraft.payload.parentCommentId,
          );
        }
      } catch {
        // Черновики ответов не критичны для отображения комментариев.
      }
    };

    void openLatestReplyDraft();

    return () => {
      cancelled = true;
    };
  }, [projectId, suggestionId]);

  const sendMainComment = useCallback(
    async (text: string): Promise<void> => {
      if (!projectId || !suggestionId || !text.trim()) return;

      setSubmitting(true);

      try {
        await createComment(projectId, suggestionId, {
          text: text.trim(),
          parentCommentId: null,
        });
        await refreshComments();
      } catch {
        setCommentsError('Не удалось отправить комментарий');
        throw new Error('Не удалось отправить комментарий');
      } finally {
        setSubmitting(false);
      }
    },
    [projectId, refreshComments, suggestionId],
  );

  const submitReply = useCallback(
    async (parentId: string, text: string) => {
      if (!projectId || !suggestionId) return;

      setSubmitting(true);

      try {
        await createComment(projectId, suggestionId, {
          text: text.trim(),
          parentCommentId: parentId,
        });
        setReplyingToId(null);
        await refreshComments();
      } catch {
        setCommentsError('Не удалось отправить ответ');
        throw new Error('Не удалось отправить ответ');
      } finally {
        setSubmitting(false);
      }
    },
    [projectId, refreshComments, suggestionId],
  );

  const saveEdit = useCallback(
    async (id: string, text: string) => {
      if (!projectId) return;

      try {
        await updateComment(projectId, id, { text });
        setEditingId(null);
        await refreshComments();
      } catch {
        setCommentsError('Ошибка при обновлении комментария');
      }
    },
    [projectId, refreshComments],
  );

  const deleteExistingComment = useCallback(
    async (id: string) => {
      if (!projectId) return;

      setSubmitting(true);

      try {
        await deleteComment(projectId, id);
        await refreshComments();
      } catch {
        setCommentsError('Ошибка при удалении комментария');
      } finally {
        setSubmitting(false);
      }
    },
    [projectId, refreshComments],
  );

  return {
    comments,
    commentsError,
    submitting,
    replyingToId,
    editingId,
    startReply: setReplyingToId,
    cancelReply: () => setReplyingToId(null),
    startEdit: setEditingId,
    cancelEdit: () => setEditingId(null),
    sendMainComment,
    submitReply,
    saveEdit,
    deleteComment: deleteExistingComment,
    refreshComments,
  };
}
