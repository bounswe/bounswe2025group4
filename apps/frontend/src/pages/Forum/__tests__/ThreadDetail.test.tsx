import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '../../../utils/test-utils';
import ThreadDetailPage from '../ThreadDetail';
import userEvent from '@testing-library/user-event';
import { useParams } from 'react-router-dom';
import * as threadsService from '../../../services/threads.service';
import { Thread } from '../../../types/thread';
import { UseQueryResult } from '@tanstack/react-query';

type ThreadQueryResult = UseQueryResult<Thread, Error>;

const defaultThreadQueryResult: ThreadQueryResult = {
  data: null,
  error: null,
  status: 'idle',
  isIdle: true,
  isLoading: false,
  isError: false,
  isSuccess: false,
  isFetching: false,
  refetch: vi.fn(),
  // any other fields your component actually uses…
  // you can even leave out dataUpdatedAt, etc., unless you directly inspect them
} as unknown as ThreadQueryResult;

function createMockThreadQueryResult(
  overrides: Partial<ThreadQueryResult>
): ThreadQueryResult {
  return {
    ...defaultThreadQueryResult,
    ...overrides,
  } as unknown as ThreadQueryResult;
}

// Create mock functions
const mockGetThreadById = vi.fn();
const mockGetThreadComments = vi.fn();
const mockCreateComment = vi.fn();
const mockDeleteComment = vi.fn();
const mockCurrentUser = vi.fn();

// Mock the threads service
vi.mock('../../../services/threads.service', () => ({
  useGetThreadById: () => ({
    data: mockGetThreadById(),
    isLoading: false,
    isError: false,
  }),
  useGetThreadComments: () => ({
    data: mockGetThreadComments(),
    isLoading: false,
    isError: false,
    refetch: vi.fn(),
  }),
  useCreateComment: () => ({
    mutateAsync: mockCreateComment,
    isPending: false,
  }),
  useDeleteComment: () => ({
    mutateAsync: mockDeleteComment,
    isPending: false,
  }),
}));

// Mock the user service
vi.mock('../../../services/user.service', () => ({
  useCurrentUser: () => ({
    data: mockCurrentUser(),
  }),
}));

// Mock react-router-dom
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useParams: vi.fn(),
  };
});

describe('ThreadDetailPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Default mock values
    vi.mocked(useParams).mockReturnValue({ id: '1' });

    mockGetThreadById.mockReturnValue({
      id: 1,
      title: 'Test Thread',
      body: 'This is a test thread',
      creatorId: 123,
      reported: false,
      tags: ['Test', 'Example'],
    });

    mockGetThreadComments.mockReturnValue([
      {
        id: 1,
        body: 'This is a comment',
        author: { id: 123, username: 'testuser' },
        reported: false,
      },
      {
        id: 2,
        body: 'This is another comment',
        author: { id: 456, username: 'otheruser' },
        reported: true,
      },
    ]);

    mockCurrentUser.mockReturnValue({
      id: 123,
      username: 'testuser',
    });

    mockCreateComment.mockResolvedValue({});
    mockDeleteComment.mockResolvedValue({});
  });

  it('renders thread details and comments correctly', () => {
    render(<ThreadDetailPage />);

    // Check thread details
    expect(screen.getByText('Test Thread')).toBeInTheDocument();
    expect(screen.getByText('This is a test thread')).toBeInTheDocument();
    expect(screen.getByText('Posted by: User #123')).toBeInTheDocument();
    expect(screen.getByText('Test')).toBeInTheDocument();
    expect(screen.getByText('Example')).toBeInTheDocument();

    // Check comments section
    expect(screen.getByText('Comments')).toBeInTheDocument();
    expect(screen.getByText('This is a comment')).toBeInTheDocument();
    expect(screen.getByText('This is another comment')).toBeInTheDocument();
    expect(screen.getByText('testuser')).toBeInTheDocument();
    expect(screen.getByText('otheruser')).toBeInTheDocument();

    // Check for reported flag on the second comment
    const reportedChips = screen.getAllByText('Reported');
    expect(reportedChips.length).toBe(1);

    // Check for comment form
    expect(screen.getByText('Add a Comment')).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText('Write your comment here...')
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /post comment/i })
    ).toBeInTheDocument();
  });

  // Modified to simulate loading state by manipulating the mockGetThreadById directly
  it('shows loading state when thread is loading', () => {
    // Cleanup previous mocks
    vi.clearAllMocks();

    // Re-mock useGetThreadById for loading state
    const useGetThreadByIdMock = vi.spyOn(threadsService, 'useGetThreadById');
    useGetThreadByIdMock.mockReturnValue(
      createMockThreadQueryResult({
        data: undefined,
        isLoading: true,
      })
    );

    render(<ThreadDetailPage />);

    expect(screen.getByRole('progressbar')).toBeInTheDocument();

    // Restore the original implementation
    useGetThreadByIdMock.mockRestore();
  });

  // Modified to simulate error state by manipulating the mockGetThreadById directly
  it('shows error message when thread fails to load', () => {
    // Cleanup previous mocks
    vi.clearAllMocks();

    // Re-mock useGetThreadById for error state
    const useGetThreadByIdMock = vi.spyOn(threadsService, 'useGetThreadById');
    useGetThreadByIdMock.mockReturnValue(
      createMockThreadQueryResult({
        data: undefined,
        error: new Error('Failed to load thread'),
        isError: true,
      })
    );

    render(<ThreadDetailPage />);

    expect(
      screen.getByText(/thread not found or error loading thread/i)
    ).toBeInTheDocument();

    // Restore the original implementation
    useGetThreadByIdMock.mockRestore();
  });

  it('allows users to post a comment', async () => {
    render(<ThreadDetailPage />);
    const user = userEvent.setup();

    const commentField = screen.getByPlaceholderText(
      'Write your comment here...'
    );
    const submitButton = screen.getByRole('button', { name: /post comment/i });

    await user.type(commentField, 'This is a new comment');
    await user.click(submitButton);

    expect(mockCreateComment).toHaveBeenCalledWith({
      threadId: 1,
      data: { body: 'This is a new comment' },
    });

    // Check for success message
    await waitFor(() => {
      expect(
        screen.getByText(/comment posted successfully/i)
      ).toBeInTheDocument();
    });
  });

  it('allows users to delete their own comments', async () => {
    render(<ThreadDetailPage />);
    const user = userEvent.setup();

    // Mock confirm dialog
    window.confirm = vi.fn().mockImplementation(() => true);

    // Find and click delete button on the first comment (which belongs to the current user)
    const deleteButtons = screen.getAllByRole('button', { name: '' });
    const deleteButton = deleteButtons.find((button) =>
      button.querySelector('svg[data-testid="DeleteIcon"]')
    );

    if (deleteButton) {
      await user.click(deleteButton);
    }

    expect(window.confirm).toHaveBeenCalledWith(
      'Are you sure you want to delete this comment?'
    );
    expect(mockDeleteComment).toHaveBeenCalledWith({
      commentId: 1,
      threadId: 1,
    });

    // Check for success message
    await waitFor(() => {
      expect(
        screen.getByText(/comment deleted successfully/i)
      ).toBeInTheDocument();
    });
  });

  it('shows no comments message when there are no comments', () => {
    mockGetThreadComments.mockReturnValue([]);

    render(<ThreadDetailPage />);

    expect(screen.getByText(/no comments yet/i)).toBeInTheDocument();
  });
});
