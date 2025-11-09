import { http, HttpResponse } from 'msw';

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
];
