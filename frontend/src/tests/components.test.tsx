import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Button } from '../components/ui/Button/Button';
import { Modal } from '../components/ui/Modal/Modal';
import { Tabs } from '../components/ui/Tabs/Tabs';
import { VoteButton } from '../components/ui/VoteButton/VoteButton';
import { VoteButtonGroup } from '../components/VoteButtonGroup/VoteButtonGroup';
import { useListVote } from '../hooks/useListVote';

describe('Button', () => {
  it('renders children, supports submit type and disabled state', async () => {
    const onClick = vi.fn();
    render(
      <Button
        variant="secondary"
        size="lg"
        fullWidth
        disabled
        onClick={onClick}
        type="submit"
      >
        Send
      </Button>,
    );

    const button = screen.getByRole('button', { name: 'Send' });
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute('type', 'submit');
    await userEvent.click(button);
    expect(onClick).not.toHaveBeenCalled();
  });
});

describe('Tabs', () => {
  it('shows tab counts and reports selected tab id', async () => {
    const onChange = vi.fn();
    render(
      <Tabs
        activeTab="new"
        onChange={onChange}
        tabs={[
          { id: 'new', label: 'New', count: 2 },
          { id: 'accepted', label: 'Accepted', count: 0 },
          { id: 'drafts', label: 'Drafts' },
        ]}
      />,
    );

    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('0')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: /Accepted/ }));
    expect(onChange).toHaveBeenCalledWith('accepted');
  });
});

describe('VoteButton', () => {
  it('prevents parent navigation and emits click only when enabled', () => {
    const parentClick = vi.fn();
    const onClick = vi.fn();
    const { rerender } = render(
      <div onClick={parentClick}>
        <VoteButton type="up" active onClick={onClick} />
      </div>,
    );

    fireEvent.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(parentClick).not.toHaveBeenCalled();

    rerender(
      <div onClick={parentClick}>
        <VoteButton type="down" disabled onClick={onClick} />
      </div>,
    );

    fireEvent.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});

describe('VoteButtonGroup', () => {
  it('toggles up and down votes and shows errors', () => {
    const onVote = vi.fn();
    render(
      <VoteButtonGroup
        score={7}
        userVote="Up"
        onVote={onVote}
        error="Vote failed"
      />,
    );

    const [upButton, downButton] = screen.getAllByRole('button');
    expect(screen.getByText('7')).toBeInTheDocument();
    expect(screen.getByText('Vote failed')).toBeInTheDocument();

    fireEvent.click(upButton);
    fireEvent.click(downButton);

    expect(onVote).toHaveBeenNthCalledWith(1, null);
    expect(onVote).toHaveBeenNthCalledWith(2, 'Down');
  });

  it('disables voting when quota is exhausted, but keeps existing vote removable', () => {
    const onVote = vi.fn();
    const quota = {
      votesLimit: 3,
      votesRemaining: 0,
      nextResetAt: '2026-05-15T00:00:00Z',
    };
    const { rerender } = render(
      <VoteButtonGroup
        score={1}
        userVote={null}
        onVote={onVote}
        voteQuota={quota}
      />,
    );

    screen.getAllByRole('button').forEach((button) => {
      expect(button).toBeDisabled();
    });

    rerender(
      <VoteButtonGroup
        score={1}
        userVote="Down"
        onVote={onVote}
        voteQuota={quota}
        loading
      />,
    );

    screen.getAllByRole('button').forEach((button) => {
      expect(button).toBeDisabled();
    });

    rerender(
      <VoteButtonGroup
        score={1}
        userVote="Down"
        onVote={onVote}
        voteQuota={quota}
      />,
    );

    const [, downButton] = screen.getAllByRole('button');
    expect(downButton).not.toBeDisabled();
    fireEvent.click(downButton);
    expect(onVote).toHaveBeenCalledWith(null);
  });
});

describe('Modal', () => {
  beforeEach(() => {
    document.body.style.overflow = 'unset';
  });

  it('does not render when closed and locks body scroll when open', () => {
    const onClose = vi.fn();
    const { rerender } = render(
      <Modal isOpen={false} onClose={onClose} title="Settings">
        Content
      </Modal>,
    );

    expect(screen.queryByText('Content')).not.toBeInTheDocument();

    rerender(
      <Modal isOpen onClose={onClose} title="Settings">
        Content
      </Modal>,
    );

    expect(screen.getByText('Content')).toBeInTheDocument();
    expect(document.body.style.overflow).toBe('hidden');
  });

  it('closes on escape, overlay and close button but ignores content clicks', () => {
    const onClose = vi.fn();
    const { container, rerender } = render(
      <Modal isOpen onClose={onClose} title="Settings">
        <button>Inner action</button>
      </Modal>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Inner action' }));
    expect(onClose).not.toHaveBeenCalled();

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(1);

    fireEvent.click(container.firstChild as Element);
    expect(onClose).toHaveBeenCalledTimes(2);

    fireEvent.click(screen.getAllByRole('button')[0]);
    expect(onClose).toHaveBeenCalledTimes(3);

    rerender(
      <Modal
        isOpen
        onClose={onClose}
        title="Settings"
        closeOnOverlayClick={false}
      >
        Content
      </Modal>,
    );

    fireEvent.click(container.firstChild as Element);
    expect(onClose).toHaveBeenCalledTimes(3);
  });
});

function VoteHarness({ suggestionId }: { suggestionId: string }) {
  const { vote, handleVote } = useListVote(suggestionId);

  return (
    <>
      <output>{vote ?? 'none'}</output>
      <button onClick={() => handleVote('Up')}>up</button>
      <button onClick={() => handleVote(null)}>clear</button>
    </>
  );
}

describe('useListVote', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('hydrates vote from cache and persists changes by suggestion id', () => {
    localStorage.setItem(
      'suggestion_votes_cache',
      JSON.stringify({ s1: 'Down' }),
    );

    const { rerender } = render(<VoteHarness suggestionId="s1" />);
    expect(screen.getByText('Down')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'up' }));
    expect(screen.getByText('Up')).toBeInTheDocument();
    expect(
      JSON.parse(localStorage.getItem('suggestion_votes_cache') || '{}'),
    ).toMatchObject({ s1: 'Up' });

    rerender(<VoteHarness suggestionId="s2" />);
    expect(screen.getByText('none')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'clear' }));
    expect(screen.getByText('none')).toBeInTheDocument();
  });
});
