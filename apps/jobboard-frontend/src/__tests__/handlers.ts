import { http, HttpResponse } from 'msw';
import type { Education, Skill, Interest } from '@shared/types/profile.types';
import type { JobPostResponse, JobApplicationResponse } from '@shared/types/api.types';

export const API_BASE_URL = 'https://api.example.com/api';

type LoginRequest = {
  username: string;
  password: string;
};

type RegisterRequest = {
  username: string;
  email: string;
  password: string;
  role: string;
};

type ResetPasswordRequest = {
  token: string;
  newPassword: string;
};

type UpdateProfileRequest = {
  firstName?: string;
  lastName?: string;
  bio?: string;
};

type CreateJobRequest = {
  title: string;
  description: string;
  location?: string;
  remote?: boolean;
  inclusiveOpportunity?: boolean;
  minSalary?: number;
  maxSalary?: number;
  contact?: string;
  workplaceId?: number;
};

type UpdateJobRequest = {
  title?: string;
  description?: string;
  location?: string;
  remote?: boolean;
  inclusiveOpportunity?: boolean;
  minSalary?: number;
  maxSalary?: number;
  contact?: string;
};

type CreateApplicationRequest = {
  jobPostId: number;
  specialNeeds?: string;
  cvUrl?: string;
  coverLetter?: string;
};

type ApproveRejectApplicationRequest = {
  feedback?: string;
};

const mockUser = {
  id: 1,
  username: 'johndoe',
  email: 'john@example.com',
  role: 'ROLE_JOBSEEKER',
};

const mockProfile = {
  id: 1,
  userId: 1,
  firstName: 'John',
  lastName: 'Doe',
  bio: 'Software Engineer with 5 years of experience',
  imageUrl: 'https://example.com/profile.jpg',
  educations: [
    {
      id: 1,
      school: 'University of Example',
      degree: 'Bachelor of Science',
      field: 'Computer Science',
      startDate: '2018-09-01',
      endDate: '2022-06-15',
      description: 'Studied software engineering and computer science fundamentals'
    }
  ],
  experiences: [
    {
      id: 1,
      company: 'Tech Corp',
      position: 'Software Engineer',
      description: 'Developed web applications using React and Node.js',
      startDate: '2022-07-01',
      endDate: null
    }
  ],
  skills: [
    { id: 1, name: 'JavaScript', level: 'Advanced' },
    { id: 2, name: 'React', level: 'Advanced' },
    { id: 3, name: 'TypeScript', level: 'Intermediate' }
  ],
  interests: [
    { id: 1, name: 'Web Development' },
    { id: 2, name: 'Machine Learning' }
  ],
  badges: [],
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-15T10:30:00Z'
};

/**
 * Creates a valid mock JWT token for testing
 * @param username - Username to include in the token
 * @param email - Email to include in the token
 * @param userId - User ID to include in the token
 * @param role - User role to include in the token
 * @returns A valid JWT token string with proper structure (header.payload.signature)
 */
export function createMockJWT(username: string, email: string, userId: number = 1, role: string = 'ROLE_JOBSEEKER'): string {
  // Create JWT header
  const header = {
    alg: 'HS256',
    typ: 'JWT',
  };

  // Create JWT payload with required fields
  // exp is set to 1 hour from now to ensure token is valid during tests
  const payload = {
    sub: username,
    email: email,
    userId: userId,
    role: role,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 3600, // 1 hour from now
  };

  // Base64 encode header and payload
  const encodedHeader = btoa(JSON.stringify(header));
  const encodedPayload = btoa(JSON.stringify(payload));

  // Create a mock signature (for testing, doesn't need to be cryptographically valid)
  const signature = btoa('mock-signature');

  // Return properly formatted JWT: header.payload.signature
  return `${encodedHeader}.${encodedPayload}.${signature}`;
}

export const authHandlers = [
  http.post(`${API_BASE_URL}/auth/login`, async ({ request }) => {
    const body = (await request.json()) as LoginRequest;

    return HttpResponse.json(
      {
        ...mockUser,
        username: body.username,
        email: `${body.username}@example.com`,
        token: createMockJWT(body.username, `${body.username}@example.com`, mockUser.id, mockUser.role),
      },
      { status: 200 },
    );
  }),
  http.post(`${API_BASE_URL}/auth/register`, async ({ request }) => {
    const body = (await request.json()) as RegisterRequest;

    return HttpResponse.json(
      {
        message: `User ${body.username} registered`,
      },
      { status: 201 },
    );
  }),
  http.post(`${API_BASE_URL}/auth/password-reset/confirm`, async ({ request }) => {
    const body = (await request.json()) as ResetPasswordRequest;

    return HttpResponse.json(
      {
        message: `Password updated for ${body.token}`,
      },
      { status: 200 },
    );
  }),
];

export const profileHandlers = [
  // Get current user's profile
  http.get(`${API_BASE_URL}/profile`, async () => {
    return HttpResponse.json(mockProfile, { status: 200 });
  }),
  
  // Create profile 
  http.post(`${API_BASE_URL}/profile`, async ({ request }) => {
    const body = (await request.json()) as { firstName: string; lastName: string; bio?: string };
    
    return HttpResponse.json(
      {
        ...mockProfile,
        firstName: body.firstName,
        lastName: body.lastName,
        bio: body.bio || mockProfile.bio,
      },
      { status: 201 }
    );
  }),
  
  // Update profile
  http.put(`${API_BASE_URL}/profile`, async ({ request }) => {
    const body = (await request.json()) as { firstName?: string; lastName?: string; bio?: string };
    
    return HttpResponse.json(
      {
        ...mockProfile,
        firstName: body.firstName || mockProfile.firstName,
        lastName: body.lastName || mockProfile.lastName,
        bio: body.bio || mockProfile.bio,
      },
      { status: 200 }
    );
  }),

  // Upload profile image
  http.post(`${API_BASE_URL}/profile/image`, async ({ request }) => {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return HttpResponse.json(
        { message: 'No file provided' },
        { status: 400 }
      );
    }

    // Mock successful image upload response
    return HttpResponse.json(
      {
        imageUrl: 'https://example.com/uploaded-profile-image.jpg',
        updatedAt: new Date().toISOString(),
      },
      { status: 200 }
    );
  }),

  // Delete profile image
  http.delete(`${API_BASE_URL}/profile/image`, async () => {
    return HttpResponse.json({}, { status: 204 });
  }),

  // Get public profile by user ID
  http.get(`${API_BASE_URL}/profile/:userId`, async ({ params }) => {
    const { userId } = params;
    
    // Handle invalid user ID
    if (userId === '999') {
      return HttpResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }
    
    // Return mock public profile (without skills and interests)
    const mockPublicProfile = {
      userId: parseInt(userId as string),
      firstName: 'Jane',
      lastName: 'Smith',
      bio: 'Public profile bio for testing',
      imageUrl: 'https://example.com/public-profile.jpg',
      educations: [
        {
          id: 1,
          school: 'Public University',
          degree: 'Master of Science',
          field: 'Software Engineering',
          startDate: '2020-09-01',
          endDate: '2022-06-15',
          description: 'Advanced software engineering studies'
        }
      ],
      experiences: [
        {
          id: 1,
          company: 'Public Tech Co',
          position: 'Senior Developer',
          description: 'Leading development of web applications',
          startDate: '2022-07-01',
          endDate: null
        }
      ],
      badges: [
        {
          id: 1,
          name: 'Code Contributor',
          description: 'Made significant contributions to open source projects',
          earnedAt: '2024-01-15T00:00:00Z'
        }
      ]
    };
    
    return HttpResponse.json(mockPublicProfile, { status: 200 });
  }),

  // Experience CRUD endpoints
  http.post(`${API_BASE_URL}/profile/experience`, async ({ request }) => {
    const body = await request.json() as {
      company: string;
      position: string;
      description?: string;
      startDate: string;
      endDate?: string;
    };
    
    return HttpResponse.json(
      {
        id: Date.now(), // Generate a unique ID
        ...body,
      },
      { status: 201 }
    );
  }),

  http.put(`${API_BASE_URL}/profile/experience/:id`, async ({ request, params }) => {
    const body = await request.json() as {
      company: string;
      position: string;
      description?: string;
      startDate: string;
      endDate?: string;
    };
    const { id } = params;
    
    return HttpResponse.json(
      {
        id: Number(id),
        ...body,
      },
      { status: 200 }
    );
  }),

  http.delete(`${API_BASE_URL}/profile/experience/:id`, async () => {
    return HttpResponse.json({}, { status: 204 });
  }),

  // Education CRUD endpoints
  http.post(`${API_BASE_URL}/profile/education`, async ({ request }) => {
    const education = await request.json() as Omit<Education, 'id'>;
    return HttpResponse.json({
      id: 2,
      school: education.school || 'Test University',
      degree: education.degree || 'Test Degree',
      field: education.field || 'Test Field',
      startDate: education.startDate || '2020-01-01',
      endDate: education.endDate || null,
      description: education.description || 'Test description',
    }, { status: 201 });
  }),

  http.put(`${API_BASE_URL}/profile/education/:id`, async ({ request, params }) => {
    const education = await request.json() as Partial<Omit<Education, 'id'>>;
    return HttpResponse.json({
      id: Number(params.id),
      school: education.school || 'Updated University',
      degree: education.degree || 'Updated Degree',
      field: education.field || 'Updated Field',
      startDate: education.startDate || '2020-01-01',
      endDate: education.endDate || null,
      description: education.description || 'Updated description',
    }, { status: 200 });
  }),

  http.delete(`${API_BASE_URL}/profile/education/:id`, async () => {
    return HttpResponse.json({}, { status: 204 });
  }),

  // Skills CRUD endpoints
  http.post(`${API_BASE_URL}/profile/skill`, async ({ request }) => {
    const skill = await request.json() as Omit<Skill, 'id'>;
    return HttpResponse.json({
      id: 4,
      name: skill.name || 'Test Skill',
      level: skill.level || 'Beginner',
    }, { status: 201 });
  }),

  http.put(`${API_BASE_URL}/profile/skill/:id`, async ({ request, params }) => {
    const skill = await request.json() as Partial<Omit<Skill, 'id'>>;
    return HttpResponse.json({
      id: Number(params.id),
      name: skill.name || 'Updated Skill',
      level: skill.level || 'Advanced',
    }, { status: 200 });
  }),

  http.delete(`${API_BASE_URL}/profile/skill/:id`, async () => {
    return HttpResponse.json({}, { status: 204 });
  }),

  // Interests CRUD endpoints
  http.post(`${API_BASE_URL}/profile/interest`, async ({ request }) => {
    const interest = await request.json() as Omit<Interest, 'id'>;
    return HttpResponse.json({
      id: 3,
      name: interest.name || 'Test Interest',
    }, { status: 201 });
  }),

  http.put(`${API_BASE_URL}/profile/interest/:id`, async ({ request, params }) => {
    const interest = await request.json() as Partial<Omit<Interest, 'id'>>;
    return HttpResponse.json({
      id: Number(params.id),
      name: interest.name || 'Updated Interest',
    }, { status: 200 });
  }),

  http.delete(`${API_BASE_URL}/profile/interest/:id`, async () => {
    return HttpResponse.json({}, { status: 204 });
  }),

  // Bio update endpoint
  http.put(`${API_BASE_URL}/profile`, async ({ request }) => {
    const profileUpdate = await request.json() as UpdateProfileRequest;
    return HttpResponse.json({
      id: 1,
      userId: 1,
      firstName: 'John',
      lastName: 'Doe',
      bio: profileUpdate.bio || 'Updated bio',
      imageUrl: 'https://example.com/profile.jpg',
      educations: [
        {
          id: 1,
          school: 'University of Example',
          degree: 'Bachelor of Science',
          field: 'Computer Science',
          startDate: '2018-09-01',
          endDate: '2022-06-15',
          description: 'Studied software engineering and computer science fundamentals'
        }
      ],
      experiences: [
        {
          id: 1,
          company: 'Tech Corp',
          position: 'Software Engineer',
          description: 'Developed web applications using React and Node.js',
          startDate: '2022-07-01',
          endDate: null
        }
      ],
      skills: [
        { id: 1, name: 'JavaScript', level: 'Advanced' },
        { id: 2, name: 'React', level: 'Advanced' },
        { id: 3, name: 'TypeScript', level: 'Intermediate' }
      ],
      interests: [
        { id: 1, name: 'Web Development' },
        { id: 2, name: 'Machine Learning' }
      ],
      badges: [],
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: new Date().toISOString(),
    }, { status: 200 });
  }),

  // Delete all profile data (delete account)
  http.delete(`${API_BASE_URL}/profile/delete-all`, async () => {
    return HttpResponse.json({}, { status: 200 });
  }),
];

// ============================================================================
// MOCK DATA FACTORIES
// ============================================================================

/**
 * Creates a mock job post for testing
 */
export function createMockJob(overrides: Partial<JobPostResponse> = {}): JobPostResponse {
  const base = {
    id: 1,
    employerId: 1,
    workplaceId: 1,
    title: 'Senior Software Engineer',
    description: 'Join our team to build innovative solutions.',
    location: 'San Francisco, CA',
    remote: true,
    inclusiveOpportunity: true,
    minSalary: 120000,
    maxSalary: 180000,
    contact: 'hiring@techcorp.com',
    postedDate: '2025-01-01T00:00:00Z',
    workplace: {
      id: 1,
      companyName: 'Tech Corp',
      sector: 'Technology',
      location: 'San Francisco, CA',
      shortDescription: 'A leading tech company',
      overallAvg: 4.5,
      ethicalTags: ['Salary Transparency', 'Remote-Friendly'],
      ethicalAverages: {},
    },
  };

  // If overrides contains ethicalTags as a string, convert it to array in workplace
  if ('ethicalTags' in overrides && typeof overrides.ethicalTags === 'string') {
    const ethicalTagsValue = overrides.ethicalTags as string;
    const ethicalTagsArray =
      ethicalTagsValue.length > 0
        ? ethicalTagsValue.split(',').map((tag: string) => tag.trim()).filter((tag: string) => tag.length > 0)
        : [];
    const { ethicalTags, ...restOverrides } = overrides;
    return {
      ...base,
      ...restOverrides,
      workplace: {
        ...base.workplace,
        ...restOverrides.workplace,
        ethicalTags: ethicalTagsArray,
      },
    };
  }

  return {
    ...base,
    ...overrides,
    workplace: {
      ...base.workplace,
      ...overrides.workplace,
    },
  };
}

/**
 * Creates a mock job application for testing
 */
export function createMockApplication(overrides: Partial<JobApplicationResponse> = {}): JobApplicationResponse {
  return {
    id: 1,
    title: 'Senior Software Engineer',
    company: 'Tech Corp',
    applicantName: 'John Doe',
    jobSeekerId: 2,
    jobPostId: 1,
    status: 'PENDING',
    specialNeeds: 'Requires wheelchair accessibility',
    feedback: '',
    cvUrl: 'https://example.com/cv.pdf',
    coverLetter: 'I am excited to apply for this position.',
    appliedDate: '2025-01-15T10:00:00Z',
    ...overrides,
  };
}

// ============================================================================
// JOB HANDLERS
// ============================================================================

// eslint-disable-next-line prefer-const
let mockJobs: JobPostResponse[] = [
  createMockJob({ id: 1, title: 'Senior Software Engineer' }),
  createMockJob({ id: 2, title: 'Frontend Developer' }),
  createMockJob({ id: 3, title: 'Backend Engineer' }),
];

// eslint-disable-next-line prefer-const
let mockApplications: JobApplicationResponse[] = [
  createMockApplication({ id: 1, jobPostId: 1 }),
  createMockApplication({ id: 2, jobPostId: 1, status: 'APPROVED' }),
  createMockApplication({ id: 3, jobPostId: 2, applicantName: 'Jane Smith' }),
];

export const jobHandlers = [
  // Get all jobs with optional filters
  http.get(`${API_BASE_URL}/jobs`, async ({ request }) => {
    const url = new URL(request.url);
    const title = url.searchParams.get('title');
    const companyName = url.searchParams.get('companyName');
    const isRemote = url.searchParams.get('isRemote');

    let filteredJobs = [...mockJobs];

    if (title) {
      filteredJobs = filteredJobs.filter(job =>
        job.title.toLowerCase().includes(title.toLowerCase())
      );
    }

    if (companyName) {
      filteredJobs = filteredJobs.filter(job =>
        job.workplace.companyName.toLowerCase().includes(companyName.toLowerCase())
      );
    }

    if (isRemote !== null) {
      filteredJobs = filteredJobs.filter(job => job.remote === (isRemote === 'true'));
    }

    return HttpResponse.json(filteredJobs, { status: 200 });
  }),

  // Get single job by ID
  http.get(`${API_BASE_URL}/jobs/:id`, async ({ params }) => {
    const { id } = params;
    const job = mockJobs.find(j => j.id === Number(id));

    if (!job) {
      return HttpResponse.json(
        { message: 'Job not found' },
        { status: 404 }
      );
    }

    return HttpResponse.json(job, { status: 200 });
  }),

  // Get jobs by employer ID
  http.get(`${API_BASE_URL}/jobs/employer/:employerId`, async ({ params }) => {
    const { employerId } = params;
    const employerJobs = mockJobs.filter(j => j.employerId === Number(employerId));

    return HttpResponse.json(employerJobs, { status: 200 });
  }),

  // Create new job
  http.post(`${API_BASE_URL}/jobs`, async ({ request }) => {
    const body = await request.json() as CreateJobRequest;

    const newJob = createMockJob({
      id: mockJobs.length + 1,
      ...body,
      postedDate: new Date().toISOString(),
    });

    mockJobs.push(newJob);

    return HttpResponse.json(newJob, { status: 201 });
  }),

  // Update job
  http.put(`${API_BASE_URL}/jobs/:id`, async ({ params, request }) => {
    const { id } = params;
    const body = await request.json() as UpdateJobRequest;
    const jobIndex = mockJobs.findIndex(j => j.id === Number(id));

    if (jobIndex === -1) {
      return HttpResponse.json(
        { message: 'Job not found' },
        { status: 404 }
      );
    }

    mockJobs[jobIndex] = {
      ...mockJobs[jobIndex],
      ...body,
    };

    return HttpResponse.json(mockJobs[jobIndex], { status: 200 });
  }),

  // Delete job
  http.delete(`${API_BASE_URL}/jobs/:id`, async ({ params }) => {
    const { id } = params;
    const jobIndex = mockJobs.findIndex(j => j.id === Number(id));

    if (jobIndex === -1) {
      return HttpResponse.json(
        { message: 'Job not found' },
        { status: 404 }
      );
    }

    mockJobs.splice(jobIndex, 1);

    return HttpResponse.json({}, { status: 204 });
  }),
];

// ============================================================================
// APPLICATION HANDLERS
// ============================================================================

export const applicationHandlers = [
  // Get applications with optional filters
  http.get(`${API_BASE_URL}/applications`, async ({ request }) => {
    const url = new URL(request.url);
    const jobPostId = url.searchParams.get('jobPostId');
    const jobSeekerId = url.searchParams.get('jobSeekerId');

    let filteredApplications = [...mockApplications];

    if (jobPostId) {
      filteredApplications = filteredApplications.filter(app =>
        app.jobPostId === Number(jobPostId)
      );
    }

    if (jobSeekerId) {
      filteredApplications = filteredApplications.filter(app =>
        app.jobSeekerId === Number(jobSeekerId)
      );
    }

    return HttpResponse.json(filteredApplications, { status: 200 });
  }),

  // Get single application by ID
  http.get(`${API_BASE_URL}/applications/:id`, async ({ params }) => {
    const { id } = params;
    const application = mockApplications.find(app => app.id === Number(id));

    if (!application) {
      return HttpResponse.json(
        { message: 'Application not found' },
        { status: 404 }
      );
    }

    return HttpResponse.json(application, { status: 200 });
  }),

  // Get CV URL for application
  http.get(`${API_BASE_URL}/applications/:id/cv`, async ({ params }) => {
    const { id } = params;
    const application = mockApplications.find(app => app.id === Number(id));

    if (!application || !application.cvUrl) {
      return HttpResponse.json(null, { status: 404 });
    }

    return HttpResponse.json(application.cvUrl, { status: 200 });
  }),

  // Create new application
  http.post(`${API_BASE_URL}/applications`, async ({ request }) => {
    const body = await request.json() as CreateApplicationRequest;

    const newApplication = createMockApplication({
      id: mockApplications.length + 1,
      ...body,
      appliedDate: new Date().toISOString(),
      status: 'PENDING',
    });

    mockApplications.push(newApplication);

    return HttpResponse.json(newApplication, { status: 201 });
  }),

  // Approve application
  http.put(`${API_BASE_URL}/applications/:id/approve`, async ({ params, request }) => {
    const { id } = params;
    const body = await request.json() as ApproveRejectApplicationRequest;
    const appIndex = mockApplications.findIndex(app => app.id === Number(id));

    if (appIndex === -1) {
      return HttpResponse.json(
        { message: 'Application not found' },
        { status: 404 }
      );
    }

    mockApplications[appIndex] = {
      ...mockApplications[appIndex],
      status: 'APPROVED',
      feedback: body.feedback || '',
    };

    return HttpResponse.json(mockApplications[appIndex], { status: 200 });
  }),

  // Reject application
  http.put(`${API_BASE_URL}/applications/:id/reject`, async ({ params, request }) => {
    const { id } = params;
    const body = await request.json() as ApproveRejectApplicationRequest;
    const appIndex = mockApplications.findIndex(app => app.id === Number(id));

    if (appIndex === -1) {
      return HttpResponse.json(
        { message: 'Application not found' },
        { status: 404 }
      );
    }

    mockApplications[appIndex] = {
      ...mockApplications[appIndex],
      status: 'REJECTED',
      feedback: body.feedback || '',
    };

    return HttpResponse.json(mockApplications[appIndex], { status: 200 });
  }),

  // Delete application
  http.delete(`${API_BASE_URL}/applications/:id`, async ({ params }) => {
    const { id } = params;
    const appIndex = mockApplications.findIndex(app => app.id === Number(id));

    if (appIndex === -1) {
      return HttpResponse.json(
        { message: 'Application not found' },
        { status: 404 }
      );
    }

    mockApplications.splice(appIndex, 1);

    return HttpResponse.json({}, { status: 204 });
  }),
];

// ============================================================================
// DASHBOARD HANDLERS
// ============================================================================

export const dashboardHandlers = [
  // Get community dashboard statistics
  http.get(`${API_BASE_URL}/public/dashboard`, async () => {
    return HttpResponse.json(
      {
        // User statistics
        totalUsers: 100,
        totalEmployers: 20,
        totalJobSeekers: 80,

        // Forum statistics
        totalForumPosts: 25,
        totalForumComments: 10,
        newForumPostsThisWeek: 3,

        // Job post statistics
        totalJobPosts: 50,
        remoteJobsCount: 20,
        inclusiveJobsCount: 15,
        newJobsThisWeekCount: 5,

        // Application statistics
        totalApplications: 200,
        totalPendingApplications: 50,
        totalAcceptedApplications: 120,
        totalRejectedApplications: 30,

        // Mentorship statistics
        totalMentors: 30,
        totalMentorshipRequests: 100,
        acceptedMentorships: 60,
        pendingMentorshipRequests: 30,
        completedMentorships: 40,
        declinedMentorshipRequests: 10,
        closedMentorshipRequests: 0,
        totalMentorReviews: 50,

        // Resume review statistics
        totalResumeReviews: 25,
      },
      { status: 200 }
    );
  }),
];

