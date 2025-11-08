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
