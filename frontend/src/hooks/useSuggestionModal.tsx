import { useState, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router';

interface UseSuggestionModalProps {
  onRefresh?: () => void;
}

export function useSuggestionModal({ onRefresh }: UseSuggestionModalProps) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const draftId = searchParams.get('draftId') ?? undefined;

  const [modalOpen, setModalOpen] = useState(!!draftId);

  const handleOpen = useCallback(() => setModalOpen(true), []);
  const handleClose = useCallback(() => {
    setModalOpen(false);
    // Очищаем draftId из URL при закрытии
    if (searchParams.has('draftId')) {
      const newParams = new URLSearchParams(searchParams);
      newParams.delete('draftId');
      navigate({ search: newParams.toString() }, { replace: true });
    }
  }, [navigate, searchParams]);

  const handleSuccess = useCallback(() => {
    handleClose();
    onRefresh?.(); // обновляем список предложений, если передан колбэк
  }, [handleClose, onRefresh]);

  return {
    modalOpen,
    draftId,
    handleOpen,
    handleClose,
    handleSuccess,
  };
}
