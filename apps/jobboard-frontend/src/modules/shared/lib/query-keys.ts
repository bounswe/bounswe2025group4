export const jobsKeys = {
  all: ['jobs'] as const,
  list: (filters?: unknown) => [...jobsKeys.all, 'list', filters || {}] as const,
  detail: (jobId: number | string) => [...jobsKeys.all, 'detail', jobId] as const,
  employer: (employerId: number | string) => [...jobsKeys.all, 'employer', employerId] as const,
};

export const applicationsKeys = {
  all: ['applications'] as const,
  listByJob: (jobId: number | string) => [...applicationsKeys.all, 'job', jobId] as const,
  listByUser: (userId: number | string) => [...applicationsKeys.all, 'user', userId] as const,
  detail: (applicationId: number | string) =>
    [...applicationsKeys.all, 'detail', applicationId] as const,
  cv: (applicationId: number | string) => [...applicationsKeys.all, 'cv', applicationId] as const,
};

export const employerKeys = {
  all: ['employer'] as const,
  workplaces: ['employer', 'workplaces'] as const,
  requests: (workplaceId: number | string) =>
    [...employerKeys.all, 'requests', workplaceId] as const,
  myRequests: ['employer', 'requests', 'me'] as const,
};

export const workplaceKeys = {
  all: ['workplaces'] as const,
  list: ['workplaces', 'list'] as const,
  detail: (workplaceId: number | string) => [...workplaceKeys.all, 'detail', workplaceId] as const,
  employers: (workplaceId: number | string) =>
    [...workplaceKeys.all, 'employers', workplaceId] as const,
  reports: (workplaceId: number | string) =>
    [...workplaceKeys.all, 'reports', workplaceId] as const,
};

export const profileKeys = {
  all: ['profile'] as const,
  me: ['profile', 'me'] as const,
  public: (userId: number | string) => [...profileKeys.all, 'public', userId] as const,
};

export const mentorshipKeys = {
  all: ['mentorship'] as const,
  mentors: ['mentorship', 'mentors'] as const,
  mentorProfile: (userId: number | string) =>
    [...mentorshipKeys.all, 'mentor-profile', userId] as const,
  menteeMentorships: (userId?: number | string) =>
    [...mentorshipKeys.all, 'mentee', userId ?? 'me'] as const,
  mentorRequests: (userId?: number | string) =>
    [...mentorshipKeys.all, 'mentor-requests', userId ?? 'me'] as const,
  chat: (conversationId: number | string) =>
    [...mentorshipKeys.all, 'chat', conversationId] as const,
  reviews: (workplaceId: number | string) =>
    [...mentorshipKeys.all, 'reviews', workplaceId] as const,
};

export const reviewKeys = {
  all: ['reviews'] as const,
  workplace: (workplaceId: number | string) =>
    [...reviewKeys.all, 'workplace', workplaceId] as const,
  replies: (reviewId: number | string) => [...reviewKeys.all, 'replies', reviewId] as const,
};

export const volunteerKeys = {
  all: ['volunteer-jobs'] as const,
  applications: ['volunteer', 'applications'] as const,
  application: (id: number | string) => [...volunteerKeys.applications, id] as const,
};

export const dashboardKeys = {
  all: ['dashboard'] as const,
  stats: ['dashboard', 'stats'] as const,
};

export const forumKeys = {
  all: ['forum'] as const,
  posts: ['forum', 'posts'] as const,
  postsList: (filters?: unknown) => [...forumKeys.posts, 'list', filters || {}] as const,
  post: (postId: number | string) => [...forumKeys.all, 'post', postId] as const,
  comment: (commentId: number | string) => [...forumKeys.all, 'comment', commentId] as const,
};

export const badgeKeys = {
  all: ['badges'] as const,
  types: ['badges', 'types'] as const,
  myBadges: ['badges', 'me'] as const,
  user: (userId: number | string) => [...badgeKeys.all, 'user', userId] as const,
};

export const notificationKeys = {
  all: ['notifications'] as const,
  me: ['notifications', 'me'] as const,
};