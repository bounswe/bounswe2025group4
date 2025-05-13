import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '../../../utils/test-utils';
import ThreadListPage from '../ThreadList';
import userEvent from '@testing-library/user-event';
import { useNavigate } from 'react-router-dom';

// Mock threads service
const mockGetThreads = vi.fn();
const mockCreateThread = vi.fn();
const mockGetThreadTags = vi.fn();
const mockDeleteThread = vi.fn();
const mockLikeThread = vi.fn();
const mockUnlikeThread = vi.fn();
const mockReportThread = vi.fn();
const mockGetThreadLikers = vi.fn();

vi.mock('../../../services/threads.service', () => ({
  useGetThreads: () => ({
    data: mockGetThreads(),
    isLoading: false,
    isError: false,
    error: null,
    refetch: vi.fn(),
  }),
  useCreateThread: () => ({
    mutateAsync: mockCreateThread,
    isPending: false,
  }),
  useGetThreadTags: () => ({
    data: mockGetThreadTags(),
  }),
  useDeleteThread: () => ({
    mutateAsync: mockDeleteThread,
    isPending: false,
  }),
  useLikeThread: () => ({
    mutateAsync: mockLikeThread,
    isPending: false,
  }),
  useUnlikeThread: () => ({
    mutateAsync: mockUnlikeThread,
    isPending: false,
  }),
  useReportThread: () => ({
    mutateAsync: mockReportThread,
    isPending: false,
  }),
  useGetThreadLikers: () => ({
    data: mockGetThreadLikers(),
  }),
}));

// Mock user service
const mockCurrentUser = vi.fn();
vi.mock('../../../services/user.service', () => ({
  useCurrentUser: () => ({
    data: mockCurrentUser(),
  }),
}));

// Mock react-router-dom
const mockNavigate = vi.fn();
vi.mock('react-router-dom', () => ({
  ...vi.importActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

describe('ThreadListPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Default mock values
    mockGetThreads.mockReturnValue([
      {
        id: 1,
        title: 'First Thread',
        body: 'This is the first test thread',
        creatorId: 123,
        reported: false,
        tags: ['Test', 'First'],
      },
      {
        id: 2,
        title: 'Second Thread',
        body: 'This is the second test thread',
        creatorId: 456,
        reported: true,
        tags: ['Test', 'Second'],
      },
    ]);

    mockGetThreadTags.mockReturnValue([
      { id: 1, name: 'Test' },
      { id: 2, name: 'General' },
      { id: 3, name: 'Question' },
    ]);

    mockCurrentUser.mockReturnValue({
      id: 123,
      username: 'testuser',
    });

    mockGetThreadLikers.mockReturnValue([]);

    mockCreateThread.mockResolvedValue({});
    mockDeleteThread.mockResolvedValue({});
    mockLikeThread.mockResolvedValue({});
    mockUnlikeThread.mockResolvedValue({});
    mockReportThread.mockResolvedValue({});

    // Mock window confirm
    window.confirm = vi.fn().mockImplementation(() => true);
  });

  it('renders thread list correctly', () => {
    render(<ThreadListPage />);

    expect(screen.getByText('Forum Threads')).toBeInTheDocument();
    expect(screen.getByText('First Thread')).toBeInTheDocument();
    expect(screen.getByText('Second Thread')).toBeInTheDocument();
    expect(
      screen.getByText(/this is the first test thread/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/this is the second test thread/i)
    ).toBeInTheDocument();

    // Check for reported flag
    const reportedChips = screen.getAllByText('Reported');
    expect(reportedChips.length).toBe(1);

    // Check tags
    expect(screen.getByText('First')).toBeInTheDocument();
    expect(screen.getByText('Second')).toBeInTheDocument();

    // Check for New Thread button
    expect(
      screen.getByRole('button', { name: /new thread/i })
    ).toBeInTheDocument();
  });

  it('opens create thread dialog when New Thread button is clicked', async () => {
    render(<ThreadListPage />);
    const user = userEvent.setup();

    await user.click(screen.getByRole('button', { name: /new thread/i }));

    expect(screen.getByText('Create New Thread')).toBeInTheDocument();
    expect(screen.getByLabelText('Thread Title')).toBeInTheDocument();
    expect(screen.getByLabelText('Thread Content')).toBeInTheDocument();
    expect(screen.getByText('Tags')).toBeInTheDocument();
  });

  it('creates a new thread successfully', async () => {
    render(<ThreadListPage />);
    const user = userEvent.setup();

    // Open create thread dialog
    await user.click(screen.getByRole('button', { name: /new thread/i }));

    // Fill form
    await user.type(screen.getByLabelText('Thread Title'), 'New Test Thread');
    await user.type(
      screen.getByLabelText('Thread Content'),
      'This is a newly created thread for testing'
    );

    // Select tags
    await user.click(screen.getByText('Test'));
    await user.click(screen.getByText('General'));

    // Submit form
    await user.click(screen.getByRole('button', { name: /create thread/i }));

    expect(mockCreateThread).toHaveBeenCalledWith({
      title: 'New Test Thread',
      body: 'This is a newly created thread for testing',
      tags: ['Test', 'General'],
    });

    // Check for success message
    await waitFor(() => {
      expect(
        screen.getByText(/thread created successfully/i)
      ).toBeInTheDocument();
    });
  });

  it('adds a custom tag in the create thread dialog', async () => {
    render(<ThreadListPage />);
    const user = userEvent.setup();

    // Open create thread dialog
    await user.click(screen.getByRole('button', { name: /new thread/i }));

    // Enter a custom tag
    await user.type(screen.getByLabelText('Add Custom Tag'), 'CustomTag');
    await user.click(screen.getByRole('button', { name: /add/i }));

    // Check that the tag was added
    expect(screen.getByText('CustomTag')).toBeInTheDocument();
  });

  it('deletes a thread when delete button is clicked', async () => {
    render(<ThreadListPage />);
    const user = userEvent.setup();

    // Find and click delete button on the first thread (which belongs to the current user)
    const deleteButtons = screen.getAllByRole('button', {
      name: 'delete thread',
    });

    await user.click(deleteButtons[0]);

    expect(window.confirm).toHaveBeenCalledWith(
      'Are you sure you want to delete this thread?'
    );
    expect(mockDeleteThread).toHaveBeenCalledWith(1);

    // Check for success message
    await waitFor(() => {
      expect(
        screen.getByText(/thread deleted successfully/i)
      ).toBeInTheDocument();
    });
  });

  it('toggles like on a thread', async () => {
    render(<ThreadListPage />);
    const user = userEvent.setup();

    // Find and click like button
    const likeButtons = screen.getAllByRole('button', {
      name: 'like thread',
    });

    await user.click(likeButtons[0]);

    expect(mockLikeThread).toHaveBeenCalledWith(1);
  });

  it('reports a thread when report button is clicked', async () => {
    render(<ThreadListPage />);
    const user = userEvent.setup();

    // Find and click report button
    const reportButtons = screen.getAllByRole('button', {
      name: 'report thread',
    });

    await user.click(reportButtons[0]);

    expect(window.confirm).toHaveBeenCalledWith(
      'Are you sure you want to report this thread as inappropriate?'
    );
    expect(mockReportThread).toHaveBeenCalledWith(1);
  });

  it('navigates to thread detail when a thread is clicked', async () => {
    render(<ThreadListPage />);
    const user = userEvent.setup();

    // Click on a thread
    await user.click(screen.getByText('First Thread'));

    expect(mockNavigate).toHaveBeenCalledWith('/forum/1');
  });

  it('displays a message when no threads are available', () => {
    mockGetThreads.mockReturnValue([]);

    render(<ThreadListPage />);

    expect(screen.getByText('No threads yet')).toBeInTheDocument();
    expect(screen.getByText('Create First Thread')).toBeInTheDocument();
  });

  it('handles pagination when there are many threads', () => {
    // Create 15 threads (more than the 10 per page limit)
    const manyThreads = Array.from({ length: 15 }, (_, i) => ({
      id: i + 1,
      title: `Thread ${i + 1}`,
      body: `Content for thread ${i + 1}`,
      creatorId: 123,
      reported: false,
      tags: ['Test'],
    }));

    mockGetThreads.mockReturnValue(manyThreads);

    render(<ThreadListPage />);

    // Check that pagination control is displayed
    expect(screen.getByRole('navigation')).toBeInTheDocument();
  });
});
