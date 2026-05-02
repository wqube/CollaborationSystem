import { Button } from '../ui/Button/Button';
import { CreateSuggestionModal } from '../CreateSuggestionModal/CreateSuggestionModal';
import { useSuggestionModal } from '../../hooks/useSuggestionModal';

interface CreateSuggestionButtonProps {
  projectId: string;
  onRefresh: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  buttonText?: string;
}

export function CreateSuggestionButton({
  projectId,
  onRefresh,
  variant = 'primary',
  buttonText = 'Предложить идею',
}: CreateSuggestionButtonProps) {
  const { modalOpen, draftId, handleOpen, handleClose, handleSuccess } =
    useSuggestionModal({
      onRefresh,
    });

  return (
    <>
      <Button variant={variant} onClick={handleOpen} type="button">
        {buttonText}
      </Button>

      <CreateSuggestionModal
        open={modalOpen}
        onClose={handleClose}
        onSuccess={handleSuccess}
        projectId={projectId}
        draftId={draftId}
      />
    </>
  );
}
